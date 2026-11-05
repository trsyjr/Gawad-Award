import fs from 'node:fs';
import path from 'node:path';

/**
 * Development-only stand-in for the Google Sheet (enabled with LOCAL_ONLY=true).
 * Votes go to a JSON file and never reach Google. Not usable on Vercel (read-only disk).
 */
export function createLocalSheet(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  let rows = [];
  try {
    rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(rows)) throw new Error('votes file is not an array');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      const aside = `${file}.corrupt-${Date.now()}`;
      try {
        fs.renameSync(file, aside);
        console.warn(`[local] Could not read ${file} (${err.message}). Moved it to ${aside}.`);
      } catch {
        /* nothing to move */
      }
    }
    rows = [];
  }

  const mine = (email) =>
    rows.filter((r) => r.email === email).map(({ nomineeFor, nominated }) => ({ nomineeFor, nominated }));

  return {
    async votesFor(email) {
      return mine(email);
    },
    async append({ email, nomineeFor, nominated }) {
      if (rows.some((r) => r.email === email && r.nomineeFor === nomineeFor)) {
        return { duplicate: true, votes: mine(email) };
      }
      rows.push({ email, nomineeFor, nominated, at: new Date().toISOString() });
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(rows, null, 2));
      fs.renameSync(tmp, file);
      return { duplicate: false, votes: mine(email) };
    },
    async ping() {},
  };
}
