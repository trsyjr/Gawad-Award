# Staff Awards Voting

A floating onyx-and-gold voting site for four staff awards.
**React + Motion + Tailwind** frontend, **Node/Express** backend, votes saved to **Google Sheets** through **Apps Script**. Deploys to **Vercel**.

## The flow

1. **Landing page**: the visitor enters their email.
2. **Awards**: four awards, each with a **Vote** button. Awards already voted for show who you picked.
3. **Category**: CBD, KMD, ACAD or OBD.
4. **Nominees**: photo, name and position, with a **Vote** button. A confirm dialog appears first, because a vote can't be changed.
5. The vote is written to the sheet as a row: `Email | Nominee for | Nominated`.

**One vote per email per award.** The same email can vote once for each of the four awards. Emails are lower-cased and trimmed, so `Ana@Work.com` and `ana@work.com` are one person.

**The Google Sheet is the only place votes are stored.** The server keeps nothing, which is what makes it work on Vercel. The duplicate check happens inside Apps Script, under a lock, so even two people (or two tabs) voting at the same instant can't create a double vote.

> **If `APPS_SCRIPT_URL` is not set, voting is switched off** and the site says so. It never pretends to save a vote.

---

## 1. Set up the Google Sheet (do this first)

1. Create a Google Sheet (any name).
2. **Extensions > Apps Script**, delete the sample code, paste in [`apps-script/Code.gs`](apps-script/Code.gs), and save.
3. **Project Settings** (gear icon) > **Script Properties** > **Add script property**:
   `SECRET` = a long random string you make up. (Generate one: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`)
4. **Deploy > New deployment** > type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when asked, then copy the **Web app URL** (it ends in `/exec`).

**Updating an existing deployment:** if you already deployed an older `Code.gs`, paste the new one over it, then **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**. Without a new version, the old code keeps running. The URL stays the same.

The first access creates a **Votes** tab with the headers **Email, Nominee for, Nominated**. If the script is not attached to the sheet (created from script.google.com instead), add a script property `SHEET_ID` with the sheet's ID.

| Email | Nominee for | Nominated |
| --- | --- | --- |
| ana@company.com | Most Reliable Staff | Maria Santos |

## 2a. Run it on your computer

Requires Node 22 (18+ works locally).

```bash
npm install
cp server/.env.example server/.env     # then fill in APPS_SCRIPT_URL and APPS_SCRIPT_TOKEN
npm run dev                            # server on :3001, site on http://localhost:5173
```

Check the connection: open <http://localhost:3001/api/health?check=sheet>. You want:

```json
{ "ok": true, "mode": "google-sheet", "sheetCheck": "ok" }
```

To try only the design without Google, set `LOCAL_ONLY=true` in `server/.env`. Votes then go to `server/data/local-votes.json` and **never reach the sheet** (the server prints a warning on start).

## 2b. Deploy to Vercel

1. Put the project folder on GitHub (the folder that contains `package.json` and `vercel.json` is the repo root). Add your logo first: `client/public/logo.png`.
2. In Vercel: **Add New > Project**, import the repo.
   - **Root Directory**: the folder with `package.json` (leave as `./` if the repo root is the project).
   - **Framework Preset**: **Other**. Leave the build settings alone; `vercel.json` sets them.
3. Open **Environment Variables** and add (for Production, and Preview if you use it):

   | Name | Value |
   | --- | --- |
   | `APPS_SCRIPT_URL` | the Web app URL ending in `/exec` |
   | `APPS_SCRIPT_TOKEN` | the same string as your `SECRET` script property |
   | `EVENT_TITLE` | e.g. `Staff Awards 2026` (optional) |
   | `ALLOWED_EMAIL_DOMAINS` | e.g. `company.com` (optional) |

4. **Deploy.**
5. Open `https://YOUR-SITE.vercel.app/api/health?check=sheet`. It must show `"sheetCheck":"ok"`. If not, see the table below.
6. Cast one test vote, confirm the row appears in the **Votes** tab, then delete the test row.

Changed an environment variable? Redeploy (Deployments > the latest one > Redeploy) so it takes effect.

Prefer the command line? `npm i -g vercel`, then `vercel` in the project folder, `vercel env add APPS_SCRIPT_URL` (and the others), then `vercel --prod`.

### What `/api/health?check=sheet` is telling you

| Response | Meaning and fix |
| --- | --- |
| `"mode":"not-configured"` | `APPS_SCRIPT_URL` is missing. Add it and redeploy or restart. |
| `APPS_SCRIPT_TOKEN does not match the SECRET...` | The two strings differ. Make them identical (or remove both). |
| `Apps Script did not return JSON...` | Deployment access isn't **Anyone**, or the URL isn't the `/exec` one. Fix in Deploy > Manage deployments. |
| `The Apps Script is out of date...` | Old `Code.gs` is still deployed. Paste the new one and deploy a **New version**. |
| `No spreadsheet found...` | The script isn't attached to a sheet. Open Apps Script from the sheet, or set `SHEET_ID`. |
| `"sheetCheck":"ok"` | Everything is connected. |

## Change the people, awards and look

**Employees**: edit [`server/data/employees.json`](server/data/employees.json). The ones in there are **sample data**.

```json
{ "id": "cbd-01", "category": "CBD", "name": "Maria Santos", "position": "Project Development Officer", "photo": "/photos/maria.jpg" }
```

- `id` must be unique and never change after voting starts.
- `category` must be one of `CBD`, `KMD`, `ACAD`, `OBD`.
- `photo` can be a full URL, or a file in `client/public/photos/` (use `/photos/file.jpg`). If empty or broken, gold initials are shown.
- The sheet stores the nominee's **name**, so keep names unique and don't rename people mid-vote.

**Your logo**: save it as `client/public/logo.png` (transparent PNG or SVG works best). It appears in the header, on the landing page and on all four award cards. Different file name? Change `LOGO_SRC` in [`client/src/theme.js`](client/src/theme.js). To give one award its own artwork, put the file in `client/public/awards/` and set that award's `logo` in the same file. Until a logo exists, a gold trophy badge is shown.

**Awards and categories**: [`server/awards.js`](server/awards.js). The award `title` is exactly what is written to the "Nominee for" column, and it is how the site recognizes earlier votes, so **don't rename an award after voting has started**.

**Colours and fonts** (onyx and gold): tokens and gold button/panel styles are at the top of [`client/src/index.css`](client/src/index.css).

## Good to know

- **Emails are not verified.** The site checks the format (and the domain, if you set `ALLOWED_EMAIL_DOMAINS`) but doesn't send a confirmation code, so someone could type another person's address. For a staff event, `ALLOWED_EMAIL_DOMAINS` is usually enough; for stronger guarantees, add an emailed one-time code.
- **Speed.** Each email entry and each vote makes one call to Apps Script, usually 1 to 3 seconds. That's fine for a staff event; Apps Script is not meant for thousands of votes in the same minute.
- **Don't edit the Votes tab by hand during voting.** Rows are read back to show people their earlier votes. Deleting a row lets that email vote for that award again.
- **Keep `APPS_SCRIPT_TOKEN` private.** Anyone with your Apps Script URL and no token could post votes directly. Never commit `.env`.

## Project layout

```
api/index.js            Vercel entry: hands /api/* to the Express app
vercel.json             Vercel build + routing settings
client/                 React + Motion + Tailwind (Vite)
  src/views/            Landing, Awards, Categories, Employees
  src/components/       Floaty (hover + ground shadow), Background, ConfirmVote, Logo, ...
server/
  app.js                Express app (routes)         index.js  local listener
  service.js            voting rules                 sheet.js  Apps Script client
  localSheet.js         LOCAL_ONLY dev stand-in      awards.js awards + categories
  data/employees.json   nominees
apps-script/Code.gs     paste into Google Apps Script
```
