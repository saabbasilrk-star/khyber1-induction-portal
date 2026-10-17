# Shaigan Managerial Induction Training Portal

An online induction programme for newly appointed managers of **Shaigan Pharmaceuticals**. Each manager studies the modules of **their own team**, one module at a time, with quizzes and a final assessment. An **admin portal** shows every manager's progress live, across all teams.

**Teams:** Khyber-1, Khyber-2, Khyber-3, Derma-1, Derma-2, Derma-3, Femicare-1, Femicare-2, Medix, Elantis and Optix. **Only Khyber-1 has content so far.** Managers of the other teams can register now, and they see a "modules are being prepared" page until their team's content is added.

- **Manager portal**: `index.html`
- **Admin portal**: `admin.html` (linked in the manager portal's footer)

It's a static site (HTML/CSS/JS, no build step), so you can host it on **GitHub Pages**. The managers' data is stored in **Firebase Firestore**, the same approach as `JohariWorkshop/`, and the free Spark plan is enough.

## Manager portal

| Feature | How it works |
|---|---|
| Sign-in | Employee ID plus a 4–6 digit PIN that the manager chooses the first time. The PIN stops anyone else from opening a manager's induction. Admins can reset it. |
| Profile | At sign-up: **Name, Team** (dropdown of the 11 teams, fixed once chosen), **Base Town, Cell Number** (Pakistani mobile, e.g. 0300-1234567) **and Email**, all validated. Managers registered before these fields existed are asked for the missing details at their next sign-in. |
| Exact resume | Closing the page, signing out or switching device, then signing back in, returns the manager to **the same module and scroll position**. A quiz in progress resumes on **the same question with all answers kept**. Progress is saved locally every few seconds, synced to the cloud every `syncSeconds`, and saved immediately when the page is hidden or closed. |
| One window at a time | If the induction is opened in a second window or device, the first one stops recording and offers "Continue in this window". This stops two copies overwriting each other's screen time. |
| Screen timer | Counts **active** time only: the tab must be visible and focused, with activity in the last 90 s. |
| **Sequential modules** | Modules open **one at a time, in order**. A module unlocks only after the previous module's reading is complete **and** its quiz has been attempted (`unlockNextModuleAfterQuiz: "attempt"`). Set it to `"pass"` to require a pass instead. Locked modules are greyed out, and direct links to them are refused. Completed modules can always be re-read. |
| Module reading | Each module has a minimum active reading time (from its word count, plus `extraSecondsPerModule` = 90 s) and must be scrolled to the end. That's about 30 minutes for all 8 Khyber-1 modules. |
| **Module quiz** | Unlocks **as soon as a module's reading is complete** (button at the end of the module and on the dashboard). **10 questions** from that module, 1 minute per question, 70% to pass, up to 3 attempts (`moduleQuiz.maxAttempts`). The timer pauses if the page is closed. |
| Final assessment | **50 questions**, 6–7 from each module; 30 minutes; 70% to pass; 3 attempts (admins can grant more). Attempting it without completing the reading is an automatic **FAIL**. Optionally, it can also require every module quiz to be passed (`requireModuleQuizzesForFinal`). The clock keeps running if the page is closed, so it can't be paused to look up answers. |
| Results | Score, PASS/FAIL with the reason, and a score per module. Correct answers are shown only after passing. Printable certificate. |

## Admin portal (`admin.html`)

- **Team selector** at the top: view all teams or one team. The KPIs, table and CSV exports follow it.
- **Live KPIs**: managers enrolled, online now, reading complete, all module quizzes passed, final passed, failed for not reading, average reading time.
- **Managers table**: one row per manager showing team, base town, cell number, email, modules read, module quizzes passed, reading time, total screen time, final status, best score, attempts, last active, and what they're doing **right now** (e.g. "Reading M5: Esso-NS"). You can search (name, ID, team, town, phone or email), filter by status or "online now", and sort any column. It updates live.
- **Manager detail** (click a row):
  - per module: screen time against the requirement, whether they read to the end, completion time, module-quiz attempts, first-try and best score
  - every final attempt with its reason, duration, flags (rushed, timed out) and per-module score
  - module-quiz history and the device they last used
  - actions: **grant an extra final attempt**, **reset PIN**, **download the full record**, **delete the record**
- **Module analytics** (per team): completion, average reading time, module-quiz pass rate, average first-try and best scores, and final-assessment accuracy for each module. This shows which product needs more coaching.
- **Question analytics** (per team): every question, hardest first, with its % correct and the **most common wrong answer**.
- **CSV exports**: a summary with contact details (one row per manager) and module detail (one row per manager × module).

## Two modes

| | Local mode | Cloud mode |
|---|---|---|
| When | `js/firebase-config.js` is empty (current state) | After you paste your Firebase config |
| Data stored | Only in that browser | Firestore: every device, every manager |
| Admin portal sees | Managers who used **the same browser** | **All** managers, live |
| Admin sign-in | Passcode `adminPasscode` in `content.js` | Firebase email + password |

Local mode is fine for trying the portal out. **To use it with your team, set up Cloud mode.**

## Cloud mode setup (one time, about 10 minutes)

1. Go to <https://console.firebase.google.com/>, sign in with a Google account and click **Add project** (e.g. `induction-training`). You can skip Google Analytics.
2. **Build → Firestore Database → Create database.** Choose a nearby region and start in **production mode**.
3. **Build → Authentication → Get started**, then on the **Sign-in method** tab enable:
   - **Anonymous** (managers sign in through this behind the scenes)
   - **Email/Password** (for admins)
4. **Authentication → Users → Add user**: create the admin account(s) with email and password.
5. **Firestore Database → Rules**: paste the rules below, **replace the admin email(s)** and click **Publish**.
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAdmin() {
         return request.auth != null && request.auth.token.email != null
           && request.auth.token.email.lower() in ['admin@example.com'];
       }
       match /k1_managers/{empId} {
         allow get: if request.auth != null;          // a manager loads their own record by ID
         allow list: if isAdmin();                    // only admins can see everyone
         allow create, update: if request.auth != null;
         allow delete: if isAdmin();
       }
     }
   }
   ```
6. **Project settings (gear icon) → General → Your apps → `</>` (Web)**: register an app (skip Hosting) and copy the config **values** into [`js/firebase-config.js`](js/firebase-config.js). Keep the `window.FIREBASE_CONFIG = {...}` line and only fill in the values.
7. Commit and push. The footer of the manager portal should now say **"Cloud sync on"**, and the admin portal header should say **"● Live"**.

If you want to reuse the existing `johari-workshop` Firebase project, you can, but you must **merge** the rules above with the Johari rules. Publishing them as they are would lock Johari's collections out.

## Settings, teams and content

- **[`js/content.js`](js/content.js)**: settings and the **team list**. This covers reading speed, `extraSecondsPerModule`, `unlockNextModuleAfterQuiz`, idle timeout, `quiz` (final assessment), `moduleQuiz`, `requireModuleQuizzesForFinal`, `syncSeconds`, `contentVersion` and `adminPasscode`.
- **`js/teams/<team>.js`**: one file per team with its `modules` (reading material in this order, HTML allowed, images in `assets/img/`) and its `questions` (quiz bank; `answer` is the **0-based** correct option and `module` links it to a module). Keep at least 10 questions per module.

### Adding a team's induction content

1. Copy `js/teams/khyber-1.js` to, for example, `js/teams/derma-1.js`.
2. Replace its modules and questions, and change `register("Khyber-1", …)` to `register("Derma-1", …)`.
3. In `js/content.js`, give that team its file: `{ name: "Derma-1", content: "js/teams/derma-1.js" }`.
4. Update `contentVersion` in `js/content.js`, then commit and push. Derma-1 managers will see their modules at their next sign-in.

Module ids (`m1`, `m2`, …) are saved in managers' progress, so don't rename a team's ids once managers have started.

### Khyber-1 content

The content comes from `Induction Training Product Presentations\Khyber - 1` and covers **Esso 40 Capsule, Esso-NS, Mionex Tablet, Pegalin-CR and Tepride**.

| # | Module |
|---|---|
| 1 | Welcome & the Khyber-1 portfolio |
| 2 | Science: pain, inflammation & NSAIDs |
| 3 | Science: stomach acid, PPIs & acid peptic disorders |
| 4 | Esso 40 Capsule (esomeprazole 40 mg) |
| 5 | Esso-NS (naproxen sodium + esomeprazole) |
| 6 | Mionex Tablet (moxifloxacin 400 mg) |
| 7 | Pegalin-CR (pregabalin CR) |
| 8 | Tepride (itopride 50 mg) |

## Run locally

```bash
python -m http.server 8090 --directory KhyberInductionPortal
```

Then open http://localhost:8090 for managers and http://localhost:8090/admin.html for the admin portal.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository, with `index.html` at the repo root.
2. **Settings → Pages → Deploy from a branch**, then `main` and `/ (root)`.
3. Managers use `https://<user>.github.io/<repo>/`; admins use `.../admin.html`.

> **Confidentiality:** the repo contains Shaigan's promotional material and product data. Use a **private** repository, or confirm the company is happy for it to be public. (GitHub Pages from a private repo needs a paid GitHub plan.)

## Security notes

- The Firebase web config isn't a secret. Access is controlled by the Firestore rules above. Only listed admin emails can see the full list of managers or delete records.
- This is a training tool, not an exam system. Quiz answers ship in the `js/teams/*.js` files, and a technically skilled user could edit their own record. The PIN, the active-time tracking and the "not read = fail" rule stop casual shortcuts, not determined tampering.
- The PIN is stored as a salted SHA-256 hash, never as plain text.
