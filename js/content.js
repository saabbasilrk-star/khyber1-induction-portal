/* ==========================================================================
   Shaigan Managerial Induction Training Portal — SETTINGS & TEAMS
   --------------------------------------------------------------------------
   - CONFIG.teams : the teams offered in the sign-up dropdown. A team with a
                    `content` file has induction modules; teams without one
                    show "your modules are being prepared".
   - Each team's modules and quiz bank live in js/teams/<team>.js.

   TO ADD A TEAM'S CONTENT:
     1. Copy js/teams/khyber-1.js to e.g. js/teams/derma-1.js, replace the
        modules/questions, and change the register("…") name to the team.
     2. Add  content: "js/teams/derma-1.js"  to that team below.
   ========================================================================== */

window.CONFIG = {
  programmeTitle: "Shaigan Managerial Induction Training Portal",
  shortTitle: "Managerial Induction",
  companyName: "Shaigan Pharmaceuticals (Pvt.) Limited",
  // Change this whenever team content files are updated, so browsers fetch the new version.
  contentVersion: "2026-10-17",

  teams: [
    { name: "Khyber-1", content: "js/teams/khyber-1.js" },
    { name: "Khyber-2" },
    { name: "Khyber-3" },
    { name: "Derma-1" },
    { name: "Derma-2" },
    { name: "Derma-3" },
    { name: "Femicare-1" },
    { name: "Femicare-2" },
    { name: "Medix" },
    { name: "Elantis" },
    { name: "Optix" }
  ],

  // Modules open strictly in order. The next module unlocks once the previous
  // module's reading is complete AND its quiz has been…
  //   "attempt" — taken at least once (any score), or
  //   "pass"    — passed (score ≥ moduleQuiz.passPercent).
  unlockNextModuleAfterQuiz: "attempt",

  // Minimum ACTIVE reading time per module is calculated from its word count.
  // Lower wpm = more time required. Each module also needs at least minSecondsPerModule.
  readingSpeedWpm: 200,
  minSecondsPerModule: 90,
  // Extra study time added to EVERY module's minimum (on top of the word-count time).
  extraSecondsPerModule: 90,

  // If the manager has no mouse/keyboard/scroll activity for this many seconds,
  // the timer pauses (stops people leaving a module open and walking away).
  idleTimeoutSeconds: 90,

  // FINAL ASSESSMENT — covers every module of the manager's team.
  quiz: {
    questionsPerAttempt: 50,   // drawn evenly across all modules
    timeLimitMinutes: 30,
    passPercent: 70,
    maxAttempts: 3,            // the admin portal can grant extra attempts per manager
    minSecondsPerQuestion: 4,  // answering faster than this on average is flagged as "rushed"
    // false = the clock keeps running if the manager closes the page mid-quiz
    // (stops people closing the quiz to look up answers). true = it pauses.
    timerPausesWhenClosed: false
  },

  // MODULE QUIZ — a short knowledge check unlocked as soon as a module's reading is complete.
  moduleQuiz: {
    questions: 10,             // per attempt, drawn from that module's questions
    secondsPerQuestion: 60,    // time limit = questions × this
    passPercent: 70,
    maxAttempts: 3,            // 0 = unlimited retakes
    timerPausesWhenClosed: true // resumes with the same time left after closing the page
  },

  // true = the final assessment also requires every module quiz to be passed
  // (otherwise the attempt is recorded as FAIL, like skipping the reading).
  requireModuleQuizzesForFinal: false,

  // How often progress is synced to the cloud while a manager is active (seconds).
  syncSeconds: 20,

  // Admin portal passcode — used ONLY in Local mode (no Firebase configured).
  // In Cloud mode admins sign in with their Firebase email + password instead.
  adminPasscode: "khyber1admin"
};

/* Registry that the team files in js/teams/ add themselves to. */
window.K1Content = {
  teams: {},
  register(teamName, data) {
    this.teams[teamName] = { modules: data.modules || [], questions: data.questions || [] };
  }
};
