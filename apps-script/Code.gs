/**
 * Awards voting: Google Apps Script web app.
 *
 * The website's server calls this script to save votes and to look up which awards
 * an email has already voted for. The sheet is the single source of truth.
 * Rows are written with the headers: Email | Nominee for | Nominated
 *
 * Setup (see README.md for the full walkthrough):
 *   1. Open your Google Sheet > Extensions > Apps Script, paste this file.
 *   2. Project Settings > Script properties > add  SECRET = <any long random string>
 *   3. Deploy > New deployment > Web app
 *        Execute as: Me      Who has access: Anyone
 *   4. Copy the Web app URL into APPS_SCRIPT_URL, and the same secret into APPS_SCRIPT_TOKEN.
 *
 * IMPORTANT: after changing this code you must create a NEW version of the deployment
 * (Deploy > Manage deployments > pencil icon > Version: New version > Deploy).
 */

const SHEET_NAME = 'Votes';
const HEADERS = ['Email', 'Nominee for', 'Nominated'];

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return respond_({ ok: false, error: 'bad_request' });
  }

  // Reject calls that do not come from our server.
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (secret && body.token !== secret) {
    return respond_({ ok: false, error: 'unauthorized' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!email) return respond_({ ok: false, error: 'missing_fields' });

  const lock = LockService.getScriptLock();
  let locked = false;

  try {
    lock.waitLock(20000); // serialise requests so two votes never race
    locked = true;

    const sheet = getSheet_();

    // action "votes": return what this email has already voted for.
    if (body.action === 'votes') {
      return respond_({ ok: true, votes: votesFor_(sheet, email) });
    }

    // Otherwise: record a vote.
    const nomineeFor = String(body.nomineeFor || '').trim();
    const nominated = String(body.nominated || '').trim();
    if (!nomineeFor || !nominated) return respond_({ ok: false, error: 'missing_fields' });

    // One vote per email per award.
    const existing = votesFor_(sheet, email);
    const duplicate = existing.some(function (v) {
      return v.nomineeFor === nomineeFor;
    });
    if (duplicate) return respond_({ ok: false, error: 'duplicate', votes: existing });

    // Write as plain text so an email can never be read as a spreadsheet formula.
    const range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.length);
    range.setNumberFormat('@');
    range.setValues([[email, nomineeFor, nominated]]);
    SpreadsheetApp.flush();

    existing.push({ nomineeFor: nomineeFor, nominated: nominated });
    return respond_({ ok: true, votes: existing });
  } catch (err) {
    return respond_({ ok: false, error: String(err) });
  } finally {
    if (locked) lock.releaseLock();
  }
}

// Visiting the web app URL in a browser is a quick way to confirm it is deployed.
function doGet() {
  return respond_({ ok: true, service: 'awards-voting', version: 2 });
}

function votesFor_(sheet, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const out = [];
  rows.forEach(function (row) {
    if (String(row[0]).trim().toLowerCase() === email) {
      out.push({ nomineeFor: String(row[1]).trim(), nominated: String(row[2]).trim() });
    }
  });
  return out;
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('SHEET_ID'); // optional: only needed if the script is not bound to the sheet
  const spreadsheet = sheetId ? SpreadsheetApp.openById(sheetId) : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('No spreadsheet found. Open Apps Script from the sheet (Extensions > Apps Script) or set the SHEET_ID script property.');
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function respond_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
