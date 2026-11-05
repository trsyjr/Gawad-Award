import { SheetError } from './sheet.js';

/** An error that maps straight to an HTTP response. */
export class ApiError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const EMAIL_RE = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Voters only type an email; they never connect to Google. This message is for them, so it stays
// plain. The real cause (APPS_SCRIPT_URL missing) is in the server log and at /api/health.
const NOT_CONFIGURED = 'Voting is temporarily unavailable. Please let the organizer know and try again later.';

/**
 * All the voting rules, with no web framework in sight so they are easy to test.
 * `sheet` is null when nothing is connected: voting is then refused (never faked).
 */
export function createService({ eventTitle, awards, categories, employees, sheet, allowedDomains = [] }) {
  const awardById = new Map(awards.map((a) => [a.id, a]));
  const awardByTitle = new Map(awards.map((a) => [a.title.trim().toLowerCase(), a]));
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  function parseEmail(raw) {
    const email = String(raw ?? '').trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      throw new ApiError(400, 'invalid_email', 'Enter a valid email address, like name@company.com.');
    }
    if (allowedDomains.length && !allowedDomains.includes(email.split('@')[1])) {
      throw new ApiError(
        400,
        'invalid_email',
        `Use your work email (${allowedDomains.map((d) => `@${d}`).join(' or ')}).`
      );
    }
    return email;
  }

  function requireSheet() {
    if (!sheet) throw new ApiError(503, 'not_configured', NOT_CONFIGURED);
    return sheet;
  }

  // Sheet rows hold the award title; the site works with award ids.
  function toVotes(rows) {
    const votes = {};
    for (const row of rows) {
      const award = awardByTitle.get(String(row.nomineeFor).trim().toLowerCase());
      if (award && !votes[award.id]) votes[award.id] = { name: row.nominated };
    }
    return votes;
  }

  // Turn sheet problems into a friendly error, and keep the real cause in the server log.
  async function guard(task, friendly) {
    try {
      return await task();
    } catch (err) {
      if (err instanceof SheetError) {
        console.error(`[sheet] ${err.kind}: ${err.message}`);
        throw new ApiError(502, 'sheet_unavailable', friendly);
      }
      throw err;
    }
  }

  return {
    config() {
      return {
        eventTitle,
        awards,
        categories: categories.map((id) => ({ id, count: employees.filter((e) => e.category === id).length })),
      };
    },

    employeesIn(category) {
      const id = String(category || '').toUpperCase();
      if (!categories.includes(id)) throw new ApiError(400, 'invalid_category', 'Unknown category.');
      return {
        employees: employees
          .filter((e) => e.category === id)
          .map(({ id: eid, category: cat, name, position, photo }) => ({ id: eid, category: cat, name, position, photo })),
      };
    },

    /** Called when someone enters their email: returns what they have already voted. */
    async session(rawEmail) {
      const email = parseEmail(rawEmail);
      const rows = await guard(
        () => requireSheet().votesFor(email),
        'We could not reach the voting sheet. Please try again in a moment.'
      );
      return { email, votes: toVotes(rows) };
    },

    async vote({ email: rawEmail, awardId, employeeId }) {
      const email = parseEmail(rawEmail);
      const award = awardById.get(String(awardId));
      const employee = employeeById.get(String(employeeId));
      if (!award || !employee) {
        throw new ApiError(400, 'invalid_vote', 'That award or nominee does not exist.');
      }

      const result = await guard(
        () => requireSheet().append({ email, nomineeFor: award.title, nominated: employee.name }),
        'Your vote could not be saved. Please try again in a moment.'
      );

      if (result.duplicate) {
        throw new ApiError(409, 'already_voted', `This email has already voted for ${award.title}.`, {
          votes: toVotes(result.votes),
        });
      }
      return { ok: true, votes: toVotes(result.votes) };
    },
  };
}
