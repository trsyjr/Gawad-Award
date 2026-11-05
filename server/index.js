// Local / self-hosted entry point. (Vercel uses ../api/index.js instead.)
import app, { runtime } from './app.js';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Awards server on http://localhost:${PORT}`);

  if (runtime.mode === 'google-sheet') {
    console.log('[sheet] Votes are saved to Google Sheets via Apps Script.');
    console.log(`[sheet] Verify it: http://localhost:${PORT}/api/health?check=sheet`);
  } else if (runtime.mode === 'local-only') {
    console.warn('[sheet] LOCAL_ONLY mode: votes are saved to server/data/local-votes.json and will NOT appear in Google Sheets.');
  } else {
    console.warn('[sheet] APPS_SCRIPT_URL is not set, so voting is disabled.');
    console.warn('[sheet] Set it in server/.env (or set LOCAL_ONLY=true to try the site without Google Sheets), then restart.');
  }

  if (runtime.allowedDomains.length) console.log(`[email] Restricted to: ${runtime.allowedDomains.join(', ')}`);
});
