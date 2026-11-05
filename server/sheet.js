/**
 * Google Sheets (through the Apps Script web app) is the single source of truth for votes.
 * Nothing is stored on the server, which is what makes this safe on Vercel.
 */

export class SheetError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind; // network | bad_response | unauthorized | outdated | rejected
  }
}

async function call({ url, token }, payload) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      // text/plain keeps this a "simple" request; Apps Script reads the raw body.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token, ...payload }),
      redirect: 'follow', // Apps Script answers with a redirect to the result
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    throw new SheetError('network', `Could not reach Apps Script: ${err.message}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new SheetError(
      'bad_response',
      `Apps Script did not return JSON (HTTP ${res.status}). Check the web app is deployed with access set to "Anyone" and that APPS_SCRIPT_URL ends in /exec.`
    );
  }
}

const OUTDATED =
  'The Apps Script is out of date. Paste the latest apps-script/Code.gs and deploy a New version (Deploy > Manage deployments > pencil icon > Version: New version).';

export function createAppsScriptSheet(config) {
  const rowsOf = (res) => {
    if (!Array.isArray(res.votes)) throw new SheetError('outdated', OUTDATED);
    return res.votes;
  };

  const checkOk = (res) => {
    if (res?.error === 'unauthorized') {
      throw new SheetError('unauthorized', 'APPS_SCRIPT_TOKEN does not match the SECRET script property in Apps Script.');
    }
    if (res?.error === 'missing_fields') throw new SheetError('outdated', OUTDATED);
    if (!res?.ok) throw new SheetError('rejected', `Apps Script reported an error: ${res?.error ?? 'unknown'}`);
  };

  return {
    /** Rows this email has already voted: [{ nomineeFor, nominated }] */
    async votesFor(email) {
      const res = await call(config, { action: 'votes', email });
      checkOk(res);
      return rowsOf(res);
    },

    /** Saves a vote. Resolves { duplicate, votes } where votes is every row for that email. */
    async append({ email, nomineeFor, nominated }) {
      const res = await call(config, { action: 'vote', email, nomineeFor, nominated });
      if (res?.error === 'duplicate') return { duplicate: true, votes: rowsOf(res) };
      checkOk(res);
      return { duplicate: false, votes: rowsOf(res) };
    },

    /** Used by /api/health?check=sheet to confirm URL, token and script version are all right. */
    async ping() {
      await this.votesFor('healthcheck@example.invalid');
    },
  };
}
