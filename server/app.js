import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AWARDS, CATEGORIES } from './awards.js';
import { ApiError, createService } from './service.js';
import { createAppsScriptSheet } from './sheet.js';
import { createLocalSheet } from './localSheet.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Local development reads server/.env. On Vercel the values come from Project Settings > Environment Variables.
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const ON_VERCEL = Boolean(process.env.VERCEL);
const EVENT_TITLE = process.env.EVENT_TITLE || 'Staff Awards 2026';
const SHEET_CONFIG = {
  url: (process.env.APPS_SCRIPT_URL || '').trim(),
  token: (process.env.APPS_SCRIPT_TOKEN || '').trim(),
};
const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
  .filter(Boolean);

// Where votes go. Google Sheets is the only real option; LOCAL_ONLY is for trying the design on your own computer.
const LOCAL_ONLY = process.env.LOCAL_ONLY === 'true' && !ON_VERCEL;
let sheet = null;
let mode = 'not-configured';
if (SHEET_CONFIG.url) {
  sheet = createAppsScriptSheet(SHEET_CONFIG);
  mode = 'google-sheet';
} else if (LOCAL_ONLY) {
  sheet = createLocalSheet(path.join(__dirname, 'data', 'local-votes.json'));
  mode = 'local-only';
}

export const runtime = { mode, allowedDomains: ALLOWED_DOMAINS };

// Shows up in the Vercel function logs (and the terminal) so the organizer can see why voting is off.
if (mode === 'not-configured') {
  console.error('[config] APPS_SCRIPT_URL is not set, so voting is disabled. Add it to the environment variables and redeploy/restart.');
}

const employees = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'employees.json'), 'utf8'));

const service = createService({
  eventTitle: EVENT_TITLE,
  awards: AWARDS,
  categories: CATEGORIES,
  employees,
  sheet,
  allowedDomains: ALLOWED_DOMAINS,
});

function fail(res, err) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.code, message: err.message, ...err.extra });
  }
  console.error(err);
  return res.status(500).json({ error: 'server_error', message: 'Something went wrong on the server.' });
}

// Wraps a route so a thrown error always becomes a clean JSON response.
const route = (handler, successStatus = 200) => async (req, res) => {
  try {
    res.status(successStatus).json(await handler(req));
  } catch (err) {
    fail(res, err);
  }
};

const app = express();
app.disable('x-powered-by');
app.use(cors());

// Votes must never be cached by the browser or a CDN.
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Read the JSON body. On Vercel the platform may have parsed it already, so use that when present.
const readJson = express.json({ limit: '10kb' });
app.use((req, res, next) => {
  if (ON_VERCEL) {
    let parsed;
    try {
      parsed = req.body;
    } catch {
      return res.status(400).json({ error: 'invalid_json', message: 'The request could not be read.' });
    }
    if (parsed !== undefined) return next();
  }
  return readJson(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_json', message: 'The request could not be read.' });
    return next();
  });
});

/**
 * Health check.
 *   /api/health               -> is a sheet connected?
 *   /api/health?check=sheet   -> also calls Apps Script to verify the URL, token and script version
 */
app.get('/api/health', async (req, res) => {
  const body = { ok: mode !== 'not-configured', mode };
  if (mode === 'not-configured') {
    body.problem = 'APPS_SCRIPT_URL is not set, so votes cannot be saved.';
  }
  if (req.query.check === 'sheet' && sheet) {
    try {
      await sheet.ping();
      body.sheetCheck = 'ok';
    } catch (err) {
      body.ok = false;
      body.sheetCheck = err.message;
    }
  }
  res.status(body.ok ? 200 : 503).json(body);
});

app.get('/api/config', route(() => service.config()));
app.get('/api/employees', route((req) => service.employeesIn(req.query.category)));
app.post('/api/session', route((req) => service.session(req.body?.email)));
app.post(
  '/api/vote',
  route((req) => service.vote({ email: req.body?.email, awardId: req.body?.awardId, employeeId: req.body?.employeeId }), 201)
);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Unknown API route.' });
});

// Self-hosting: serve the built React app too. (On Vercel the static files are served by its CDN.)
const distDir = path.join(__dirname, '..', 'client', 'dist');
if (!ON_VERCEL && fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((err, _req, res, _next) => fail(res, err));

export default app;
