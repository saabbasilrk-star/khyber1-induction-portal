/* Khyber-1 FLM Induction — manager portal.
   Progress is kept in memory, cached on the device every few seconds and synced
   to the cloud (Firebase) via js/store.js, so a manager can close the page and
   resume exactly where they left off — same module, scroll position, quiz
   question and answers — on this or any other device. */
(function () {
  "use strict";

  const CFG = window.CONFIG;
  const MODULES = window.MODULES;
  const QUESTIONS = window.QUESTIONS;
  const Store = window.K1Store;
  const FQ = Object.assign({ timerPausesWhenClosed: false }, CFG.quiz);
  const MQ = Object.assign({ questions: 5, secondsPerQuestion: 60, passPercent: 70, maxAttempts: 0, timerPausesWhenClosed: true }, CFG.moduleQuiz || {});
  const SYNC_MS = (CFG.syncSeconds || 20) * 1000;
  const app = document.getElementById("app");

  // ---------------------------------------------------------------- utils
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const hms = (s) => { s = Math.max(0, Math.floor(s)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
  const ms = (s) => { s = Math.max(0, Math.floor(s)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
  const fmtDate = (t) => t ? new Date(t).toLocaleString() : "—";
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const modById = (id) => MODULES.find((m) => m.id === id);
  const modIndex = (id) => MODULES.findIndex((m) => m.id === id);
  const requiredSec = Store.requiredSeconds(MODULES, CFG);
  // We restore scroll positions ourselves; stop the browser resetting them after load.
  try { history.scrollRestoration = "manual"; } catch { }

  // ---------------------------------------------------------------- record
  // Fields the manager portal owns and syncs. Admin-owned fields (extraAttempts,
  // pinHash resets) are never overwritten by a manager's sync.
  const MANAGER_FIELDS = ["profile", "totalSec", "modules", "attempts", "activeQuiz", "resume", "lastSeenAt", "updatedAt"];

  function newRecord(profile, pinHash) {
    const now = Date.now();
    return normalize({ schema: 2, profile, pinHash, totalSec: 0, modules: {}, attempts: [], extraAttempts: 0, activeQuiz: null, resume: null, lastSeenAt: now, updatedAt: now });
  }
  function normalize(u) {
    u.modules = u.modules || {};
    MODULES.forEach((m) => {
      const s = u.modules[m.id] = Object.assign({ sec: 0, scrolledEnd: false, completedAt: null, firstOpenedAt: null, lastScrollY: 0 }, u.modules[m.id] || {});
      s.quiz = Object.assign({ attempts: [], passedAt: null }, s.quiz || {});
    });
    u.attempts = u.attempts || [];
    u.extraAttempts = u.extraAttempts || 0;
    u.totalSec = u.totalSec || 0;
    return u;
  }
  const newer = (a, b) => (!a ? b : !b ? a : (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b);

  let user = null;
  const modState = (id) => user.modules[id];
  const isDone = (id) => !!modState(id).completedAt;
  const doneCount = () => MODULES.filter((m) => isDone(m.id)).length;
  const allRead = () => doneCount() === MODULES.length;
  const readingSec = () => MODULES.reduce((t, m) => t + modState(m.id).sec, 0);
  const mqPassed = (id) => !!modState(id).quiz.passedAt;
  const mqPassedCount = () => MODULES.filter((m) => mqPassed(m.id)).length;
  const mqBest = (id) => modState(id).quiz.attempts.reduce((b, a) => Math.max(b, a.scorePct), -1);
  const passedAttempt = () => user.attempts.find((a) => a.passed);
  const finalAllowed = () => FQ.maxAttempts + (user.extraAttempts || 0);
  const finalLeft = () => finalAllowed() - user.attempts.length;
  const finalEligible = () => allRead() && (!CFG.requireModuleQuizzesForFinal || mqPassedCount() === MODULES.length);

  function checkModuleComplete(id) {
    const s = modState(id);
    if (!s.completedAt && s.sec >= requiredSec[id] && s.scrolledEnd) {
      s.completedAt = Date.now();
      saveUser(true);
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- saving & sync
  let dirty = false, flushing = false, lastFlush = 0, removedHandled = false, unwatch = null;
  // Only one window/device per manager records progress at a time; others are suspended.
  const SESSION_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);
  let suspended = false;

  function setSync(state, text) {
    const el = document.getElementById("syncState");
    if (!el) return;
    el.dataset.state = state;
    el.textContent = text;
  }
  function saveUser(urgent) {
    if (!user || suspended) return;
    user.updatedAt = Date.now();
    Store.setCache(user.profile.empId, user);
    dirty = true;
    if (urgent) flush();
  }
  async function flush() {
    if (!user || !dirty || flushing || suspended) return;
    flushing = true; dirty = false; lastFlush = Date.now();
    user.lastSeenAt = Date.now();
    const fields = {};
    MANAGER_FIELDS.forEach((f) => { fields[f] = user[f] ?? null; });
    if (Store.mode === "cloud") setSync("saving", "Saving…");
    try {
      await Store.updateManager(user.profile.empId, JSON.parse(JSON.stringify(fields)));
      setSync(Store.mode === "cloud" ? "ok" : "local", Store.mode === "cloud" ? "✓ Saved to cloud" : "Saved on this device");
    } catch (e) {
      if (e.notFound) return handleRemoved();
      dirty = true;
      setSync("offline", "Offline — saved on device, retrying");
    } finally { flushing = false; }
  }

  function handleRemoved() {
    if (removedHandled || !user) return;
    removedHandled = true;
    const id = user.profile.empId;
    endSession();
    Store.delCache(id);
    modal("Your record was reset", `<p>Your induction record (${esc(id)}) was removed by the administrator. Please sign in again to start fresh.</p>`, [{ label: "OK" }]);
  }

  // ---------------------------------------------------------------- screen timer
  // Counts a second only when this tab is visible, focused, and the user has
  // interacted recently. Leaving a module open and walking away does not count.
  let lastActivity = Date.now();
  ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"].forEach((ev) =>
    window.addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true, capture: true }));

  function isActive() {
    return document.visibilityState === "visible" && document.hasFocus() &&
      Date.now() - lastActivity < CFG.idleTimeoutSeconds * 1000;
  }

  setInterval(() => {
    if (!user || suspended) return;
    const active = isActive();
    const dot = document.getElementById("timerDot");
    if (dot) dot.classList.toggle("paused", !active);
    const route = currentRoute();
    if (active) {
      user.totalSec++;
      if (route.name === "module" && modById(route.id)) {
        modState(route.id).sec++;
        if (checkModuleComplete(route.id)) { renderModuleStatus(route.id, true); renderEndBox(route.id); }
      }
      user.updatedAt = Date.now();
      dirty = true;
    }
    const qz = user.activeQuiz;
    if (qz && qz.pauses) {
      // Paused-when-closed quizzes count wall-clock time only while the page is open.
      const now = Date.now();
      qz.usedSec = (qz.usedSec || 0) + Math.max(0, (now - (qz.lastTickAt || now)) / 1000);
      qz.lastTickAt = now;
      dirty = true;
    }
    document.getElementById("screenTime").textContent = hms(user.totalSec);
    if (route.name === "module" && modById(route.id)) renderModuleStatus(route.id, false, active);
    if (route.name === "quiz") tickQuiz();
    if (Date.now() % 5000 < 1000) Store.setCache(user.profile.empId, user);
    if (dirty && Date.now() - lastFlush >= SYNC_MS) flush();
  }, 1000);

  // Remember the exact page + scroll position for resume.
  let restoring = false;
  function captureScroll() {
    if (!user || suspended || restoring) return;
    const r = currentRoute();
    const y = Math.round(window.scrollY);
    user.resume = { hash: location.hash || "#/", scrollY: y, at: Date.now() };
    if (r.name === "module" && modById(r.id)) modState(r.id).lastScrollY = y;
    user.updatedAt = Date.now();
    dirty = true;
  }
  let scrollTimer = null;
  window.addEventListener("scroll", () => {
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => { scrollTimer = null; captureScroll(); }, 600);
  }, { passive: true });

  const onLeave = () => { captureScroll(); saveUser(true); };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") onLeave(); });
  window.addEventListener("pagehide", onLeave);

  // ---------------------------------------------------------------- routing
  function currentRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    return { name: parts[0] || "home", id: parts[1], n: parts[2] };
  }
  const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
  let pendingScroll = null;

  function render() {
    window.scrollTo(0, 0);
    document.getElementById("topbarRight").hidden = !user;
    if (!user) return renderLogin();
    document.getElementById("userChip").textContent = `${user.profile.name} · ${user.profile.empId}`;

    const r = currentRoute();
    // While a quiz is running, the manager cannot go back to the content.
    if (user.activeQuiz && r.name !== "quiz") return go("#/quiz");

    user.resume = { hash: location.hash || "#/", scrollY: pendingScroll || 0, at: Date.now() };
    saveUser(false);

    switch (r.name) {
      case "module": return modById(r.id) ? renderModule(r.id) : go("#/");
      case "quiz": return user.activeQuiz ? renderQuiz() : go("#/");
      case "result": return renderResult(r.id, Number(r.n));
      case "certificate": return renderCertificate();
      default: return renderDashboard();
    }
  }
  window.addEventListener("hashchange", render);

  function restoreScroll(fallbackY) {
    const y = pendingScroll != null ? pendingScroll : fallbackY;
    pendingScroll = null;
    if (!y) return;
    // Wait for images so the page height is final before scrolling. Until then,
    // don't let scroll capture record the temporary top-of-page position.
    restoring = true;
    const imgs = [...app.querySelectorAll("img")].filter((i) => !i.complete);
    const route = location.hash;
    const done = () => { if (location.hash === route) window.scrollTo(0, y); setTimeout(() => { restoring = false; }, 700); };
    if (document.readyState !== "complete") window.addEventListener("load", () => setTimeout(done, 50), { once: true });
    if (!imgs.length) return setTimeout(done, 30);
    let left = imgs.length;
    const one = () => { if (--left === 0) done(); };
    imgs.forEach((i) => { i.addEventListener("load", one, { once: true }); i.addEventListener("error", one, { once: true }); });
    setTimeout(done, 2500);
  }

  // ---------------------------------------------------------------- modal & toast
  function modal(title, bodyHtml, actions) {
    const m = document.getElementById("modal");
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    const box = document.getElementById("modalActions");
    box.innerHTML = "";
    actions.forEach((a) => {
      const b = document.createElement("button");
      b.className = "btn " + (a.cls || "");
      b.textContent = a.label;
      b.onclick = () => { m.hidden = true; a.onClick && a.onClick(); };
      box.appendChild(b);
    });
    m.hidden = false;
    box.lastChild && box.lastChild.focus();
  }
  function toast(html) {
    const t = document.getElementById("toast");
    t.innerHTML = html;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, 5000);
  }

  // ---------------------------------------------------------------- session
  function describeRoute(hash) {
    const p = (hash || "").replace(/^#\/?/, "").split("/");
    if (p[0] === "module" && modById(p[1])) return `Module ${modIndex(p[1]) + 1}: ${modById(p[1]).title}`;
    if (p[0] === "quiz") return "your quiz";
    return "your dashboard";
  }

  /** Wires up the signed-in manager: device cache, live admin changes, sync status. */
  function attachSession() {
    removedHandled = false;
    suspended = false;
    Store.ls.set("session", user.profile.empId);
    Store.setCache(user.profile.empId, user);
    if (user.activeQuiz && user.activeQuiz.pauses) user.activeQuiz.lastTickAt = Date.now();
    // Claim this window as the one recording progress (kept out of regular syncs
    // so it never overwrites a newer claim from another window).
    Store.updateManager(user.profile.empId, { activeSession: { id: SESSION_ID, at: Date.now(), device: deviceLabel() } }).catch(() => { });
    if (unwatch) unwatch();
    unwatch = Store.watchManager(user.profile.empId, (data) => {
      if (!user) return;
      if (!data) return handleRemoved();
      if (data.activeSession && data.activeSession.id !== SESSION_ID && !suspended) return suspend(data.activeSession);
      const before = user.extraAttempts;
      user.extraAttempts = data.extraAttempts || 0;
      user.pinHash = data.pinHash ?? null;
      if (before !== user.extraAttempts) {
        Store.setCache(user.profile.empId, user);
        if (currentRoute().name === "home") renderDashboard();
        if (user.extraAttempts > before) toast(`Your administrator granted you an extra final-assessment attempt.`);
      }
    });
    setSync(Store.mode === "cloud" ? "ok" : "local", Store.mode === "cloud" ? "✓ Saved to cloud" : "Saved on this device");
  }

  function deviceLabel() {
    const ua = navigator.userAgent;
    const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac/i.test(ua) ? "Mac" : "device";
    const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "browser";
    return `${br} on ${os}`;
  }

  /** Another window/device took over: stop recording here until the manager reclaims it. */
  function suspend(other) {
    suspended = true;
    setSync("offline", "Paused — open elsewhere");
    modal("Induction opened in another window",
      `<p>Your induction is now open in another window or device (${esc(other.device || "unknown")}, ${fmtDate(other.at)}).
       To keep your progress accurate, this window has stopped recording.</p>`,
      [{ label: "Sign out here", cls: "ghost", onClick: () => endSession() },
       { label: "Continue in this window", onClick: reclaim }]);
  }
  async function reclaim() {
    const id = user.profile.empId;
    try {
      const { rec } = await loadRecord(id);
      if (!rec) return handleRemoved();
      user = normalize(rec);
      pendingScroll = user.resume ? user.resume.scrollY || 0 : 0;
      attachSession();
      if (user.resume && user.resume.hash) go(user.resume.hash); else render();
      toast("Continuing here — progress from the other window has been loaded.");
    } catch (e) { modal("Couldn't continue", `<p>${esc(e.message || e)}</p>`, [{ label: "OK" }]); }
  }

  function beginSession(rec, isNew) {
    user = normalize(rec);
    attachSession();
    const r = user.resume;
    if (!isNew && r && r.hash && r.hash !== "#/" && !/^#\/result/.test(r.hash)) {
      pendingScroll = r.scrollY || 0;
      toast(`Welcome back — resumed where you left off in <strong>${esc(describeRoute(r.hash))}</strong>.`);
      go(r.hash);
    } else {
      if (!isNew) toast(`Welcome back, ${esc(user.profile.name.split(" ")[0])}.`);
      go("#/");
    }
  }

  function endSession() {
    if (unwatch) { unwatch(); unwatch = null; }
    // A suspended window shares this browser's session with the active one — leave it alone.
    if (!suspended) Store.ls.del("session");
    suspended = false;
    user = null;
    location.hash = "#/";
    render();
  }

  document.getElementById("logoutBtn").onclick = async () => {
    saveUser(false);
    await flush();
    endSession();
  };

  /** Loads the newest copy of a manager's record (cloud vs this device). */
  async function loadRecord(id) {
    let remote = null, offline = false;
    try { remote = await Store.getManager(id); } catch { offline = true; }
    const cache = Store.getCache(id);
    if (!remote && !offline) { if (cache) Store.delCache(id); return { rec: null, offline }; }
    const rec = newer(remote, cache);
    if (rec && remote) { rec.extraAttempts = remote.extraAttempts || 0; rec.pinHash = remote.pinHash ?? null; }
    return { rec: rec ? JSON.parse(JSON.stringify(rec)) : null, offline };
  }

  // ---------------------------------------------------------------- login
  function loginShell(formHtml) {
    app.innerHTML = `
      <div class="grid grid-2">
        <section class="card">
          <h1>${esc(CFG.programmeTitle)}</h1>
          <p class="muted">Product-knowledge induction for newly appointed First Line Managers of the ${esc(CFG.teamName)} team.</p>
          <h3>How it works</h3>
          <ol>
            <li>Read all <strong>${MODULES.length} modules</strong>. Each one has a minimum <em>active</em> reading time and must be scrolled to the end.</li>
            <li>After each module, take its <strong>module quiz</strong> (${MQ.questions} questions) straight away to check your understanding.</li>
            <li>The <strong>screen timer</strong> only runs while this tab is open, focused and you are active. It pauses after ${CFG.idleTimeoutSeconds}s of no activity.</li>
            <li>Take the <strong>final assessment</strong>: ${FQ.questionsPerAttempt} questions, ${FQ.timeLimitMinutes} minutes, pass mark ${FQ.passPercent}%, up to ${FQ.maxAttempts} attempts.</li>
            <li>You can close the page any time — sign in again with your Employee ID and PIN to <strong>resume exactly where you left off</strong>${Store.mode === "cloud" ? ", on any device" : ""}.</li>
          </ol>
          <div class="notice warn"><strong>Important:</strong> if you attempt the final assessment without completing all reading${CFG.requireModuleQuizzesForFinal ? " and passing every module quiz" : ""}, the attempt is recorded as <strong>FAIL</strong> regardless of your score.</div>
          ${Store.error ? `<div class="notice bad small">${esc(Store.error)}</div>` : ""}
        </section>
        <section class="card">${formHtml}</section>
      </div>`;
  }

  function renderLogin() {
    loginShell(`
      <h2>Sign in</h2>
      <form id="idForm" autocomplete="off">
        <div class="field"><label for="fEmp">Employee ID</label><input id="fEmp" type="text" required maxlength="30" autocapitalize="characters"></div>
        <button class="btn" type="submit" id="idBtn">Continue</button>
        <p class="small muted" style="margin-top:12px">New and returning managers both start here.</p>
      </form>`);
    const f = document.getElementById("idForm");
    document.getElementById("fEmp").focus();
    f.onsubmit = async (e) => {
      e.preventDefault();
      const raw = document.getElementById("fEmp").value.trim();
      if (raw.includes("@")) {
        return modal("That looks like an email address",
          `<p>Managers sign in here with their <strong>Employee ID</strong>.</p>
           <p>Administrators: sign in with your email and password on the <a href="admin.html">Admin portal</a>.</p>`, [{ label: "OK" }]);
      }
      const id = raw.toUpperCase().replace(/[\/\s]+/g, "-");
      if (!id) return;
      const btn = document.getElementById("idBtn");
      btn.disabled = true; btn.textContent = "Checking…";
      try {
        await Store.ensureManagerAuth();
        const { rec, offline } = await loadRecord(id);
        if (rec) return rec.pinHash ? renderPin(rec) : renderSetPin(rec);
        if (offline) {
          btn.disabled = false; btn.textContent = "Continue";
          return modal("No connection", "<p>We couldn't reach the server to look up your record. Check your internet connection and try again.</p>", [{ label: "OK" }]);
        }
        renderRegister(id);
      } catch (err) {
        btn.disabled = false; btn.textContent = "Continue";
        const setup = /configuration-not-found|operation-not-allowed|admin-restricted-operation/.test(err.code || err.message || "");
        const denied = /permission-denied|insufficient permissions/i.test(err.code || err.message || "");
        modal("Sign-in problem", setup
          ? `<p>The portal's sign-in service isn't switched on yet.</p><p class="small muted">Administrator: in the Firebase console open <strong>Authentication → Get started</strong>, then enable the <strong>Anonymous</strong> and <strong>Email/Password</strong> sign-in providers. (${esc(err.code || "")})</p>`
          : denied
          ? `<p>The database refused access.</p><p class="small muted">Administrator: publish the security rules from the README under <strong>Firestore Database → Rules</strong> (not Realtime Database).</p>`
          : `<p>${esc(err.message || err)}</p><p class="small muted">Check your internet connection and try again. If this persists, ask your administrator to check the Firebase setup.</p>`,
          [{ label: "OK" }]);
      }
    };
  }

  const pinOk = (p) => /^\d{4,6}$/.test(p);

  function renderRegister(id) {
    loginShell(`
      <h2>Create your profile</h2>
      <p class="small muted">Employee ID <strong>${esc(id)}</strong> is new. <a href="#/" id="backLink">Use a different ID</a></p>
      <form id="regForm" autocomplete="off">
        <div class="field"><label for="fName">Full name</label><input id="fName" type="text" required maxlength="80"></div>
        <div class="field"><label for="fArea">Area / Base city</label><input id="fArea" type="text" required maxlength="60"></div>
        <div class="field"><label for="fPin">Choose a PIN (4–6 digits)</label><input id="fPin" type="password" inputmode="numeric" required maxlength="6"></div>
        <div class="field"><label for="fPin2">Confirm PIN</label><input id="fPin2" type="password" inputmode="numeric" required maxlength="6"></div>
        <p class="small muted">You'll use this PIN to resume your induction later. Don't share it.</p>
        <button class="btn" type="submit" id="regBtn">Start induction</button>
      </form>`);
    document.getElementById("backLink").onclick = (e) => { e.preventDefault(); renderLogin(); };
    document.getElementById("fName").focus();
    document.getElementById("regForm").onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById("fName").value.trim();
      const area = document.getElementById("fArea").value.trim();
      const pin = document.getElementById("fPin").value.trim();
      if (!pinOk(pin)) return modal("Invalid PIN", "<p>The PIN must be 4 to 6 digits.</p>", [{ label: "OK" }]);
      if (pin !== document.getElementById("fPin2").value.trim()) return modal("PINs don't match", "<p>Please re-enter the same PIN twice.</p>", [{ label: "OK" }]);
      const btn = document.getElementById("regBtn"); btn.disabled = true; btn.textContent = "Creating…";
      try {
        const rec = newRecord({ name, empId: id, area, createdAt: Date.now() }, await Store.hashPin(id, pin));
        await Store.createManager(JSON.parse(JSON.stringify(rec)));
        beginSession(rec, true);
      } catch (err) {
        btn.disabled = false; btn.textContent = "Start induction";
        modal("Couldn't create your profile", `<p>${esc(err.message || err)}</p>`, [{ label: "OK" }]);
      }
    };
  }

  function renderPin(rec) {
    loginShell(`
      <h2>Welcome back, ${esc(rec.profile.name.split(" ")[0])}</h2>
      <p class="small muted">${esc(rec.profile.empId)} · ${esc(rec.profile.area)} · <a href="#/" id="backLink">Not you?</a></p>
      <form id="pinForm" autocomplete="off">
        <div class="field"><label for="fPin">Your PIN</label><input id="fPin" type="password" inputmode="numeric" required maxlength="6"></div>
        <button class="btn" type="submit">Resume induction</button>
        <p class="small muted" style="margin-top:12px">Forgot your PIN? Ask your administrator to reset it.</p>
      </form>`);
    document.getElementById("backLink").onclick = (e) => { e.preventDefault(); renderLogin(); };
    document.getElementById("fPin").focus();
    document.getElementById("pinForm").onsubmit = async (e) => {
      e.preventDefault();
      const pin = document.getElementById("fPin").value.trim();
      if ((await Store.hashPin(rec.profile.empId, pin)) !== rec.pinHash) {
        document.getElementById("fPin").value = "";
        return modal("Incorrect PIN", "<p>That PIN doesn't match. Try again, or ask your administrator to reset it.</p>", [{ label: "OK" }]);
      }
      beginSession(rec, false);
    };
  }

  function renderSetPin(rec) {
    loginShell(`
      <h2>Set a new PIN</h2>
      <p class="small muted">${esc(rec.profile.name)} · ${esc(rec.profile.empId)} — your PIN was reset by the administrator. <a href="#/" id="backLink">Not you?</a></p>
      <form id="spForm" autocomplete="off">
        <div class="field"><label for="fPin">New PIN (4–6 digits)</label><input id="fPin" type="password" inputmode="numeric" required maxlength="6"></div>
        <div class="field"><label for="fPin2">Confirm PIN</label><input id="fPin2" type="password" inputmode="numeric" required maxlength="6"></div>
        <button class="btn" type="submit">Save PIN &amp; resume</button>
      </form>`);
    document.getElementById("backLink").onclick = (e) => { e.preventDefault(); renderLogin(); };
    document.getElementById("spForm").onsubmit = async (e) => {
      e.preventDefault();
      const pin = document.getElementById("fPin").value.trim();
      if (!pinOk(pin)) return modal("Invalid PIN", "<p>The PIN must be 4 to 6 digits.</p>", [{ label: "OK" }]);
      if (pin !== document.getElementById("fPin2").value.trim()) return modal("PINs don't match", "<p>Please re-enter the same PIN twice.</p>", [{ label: "OK" }]);
      try {
        rec.pinHash = await Store.hashPin(rec.profile.empId, pin);
        await Store.updateManager(rec.profile.empId, { pinHash: rec.pinHash });
        beginSession(rec, false);
      } catch (err) { modal("Couldn't save your PIN", `<p>${esc(err.message || err)}</p>`, [{ label: "OK" }]); }
    };
  }

  // ---------------------------------------------------------------- dashboard
  function quizBadge(id) {
    const s = modState(id).quiz;
    const best = mqBest(id);
    if (s.passedAt) return `<span class="badge ok">Quiz passed · ${best}%</span>`;
    if (s.attempts.length) return `<span class="badge bad">Quiz ${best}% · retake</span>`;
    if (isDone(id)) return `<span class="badge info">Quiz ready</span>`;
    return `<span class="badge neutral">Quiz locked</span>`;
  }

  function resumeTarget() {
    const r = user.resume;
    if (r && r.hash && /^#\/module\//.test(r.hash)) {
      const id = r.hash.split("/")[2];
      if (modById(id) && !isDone(id)) return { hash: r.hash, label: `Continue ${modById(id).title}` };
    }
    const next = MODULES.find((m) => !isDone(m.id));
    if (next) return { hash: "#/module/" + next.id, label: doneCount() || readingSec() ? `Continue: ${next.title}` : "Start reading" };
    const q = MODULES.find((m) => !mqPassed(m.id));
    if (q) return { quiz: q.id, label: `Next: ${q.title} quiz` };
    return null;
  }

  function renderDashboard() {
    const done = doneCount();
    const used = user.attempts.length;
    const passed = passedAttempt();
    const left = finalLeft();
    const target = resumeTarget();
    const needMQ = CFG.requireModuleQuizzesForFinal;

    app.innerHTML = `
      <section class="card">
        <h1>Welcome, ${esc(user.profile.name.split(" ")[0])}</h1>
        <p class="muted">${esc(CFG.programmeTitle)} · ${esc(user.profile.area)}</p>
        <div class="progress" aria-label="Reading progress"><span style="width:${(done / MODULES.length) * 100}%"></span></div>
        <div class="stats">
          <div class="stat"><div class="k">Modules read</div><div class="v">${done} / ${MODULES.length}</div></div>
          <div class="stat"><div class="k">Module quizzes passed</div><div class="v">${mqPassedCount()} / ${MODULES.length}</div></div>
          <div class="stat"><div class="k">Reading time</div><div class="v">${hms(readingSec())}</div></div>
          <div class="stat"><div class="k">Total screen time</div><div class="v">${hms(user.totalSec)}</div></div>
        </div>
        ${passed ? `<div class="notice ok">You passed the final assessment with <strong>${passed.scorePct}%</strong>. <a href="#/certificate">View your certificate</a>.</div>` : ""}
        <div class="btn-row">
          ${target ? `<button class="btn" id="resumeBtn">${esc(target.label)} →</button>` : ""}
        </div>
      </section>

      <section class="card">
        <h2>Programme content</h2>
        <p class="small muted">Each module's quiz unlocks as soon as you finish reading it.</p>
        <ul class="module-list">
          ${MODULES.map((m, i) => {
            const s = modState(m.id), req = requiredSec[m.id], pct = Math.min(100, (s.sec / req) * 100);
            const status = isDone(m.id) ? `<span class="badge ok">Read</span>`
              : s.sec > 0 ? `<span class="badge warn">In progress</span>` : `<span class="badge neutral">Not started</span>`;
            const canQuiz = isDone(m.id) && (MQ.maxAttempts === 0 || s.quiz.attempts.length < MQ.maxAttempts);
            return `<li class="module-item ${isDone(m.id) ? "done" : ""}" data-id="${m.id}" tabindex="0">
              <div class="module-num">${isDone(m.id) ? "✓" : i + 1}</div>
              <div>
                <div><strong>${esc(m.title)}</strong></div>
                <div class="module-meta">${esc(m.summary)} · min. ${ms(req)} reading · read ${ms(s.sec)}</div>
                <div class="progress"><span style="width:${pct}%"></span></div>
              </div>
              <div class="module-actions">
                <div class="badges">${status}${quizBadge(m.id)}</div>
                ${canQuiz ? `<button class="btn small ${s.quiz.passedAt ? "ghost" : ""}" data-quiz="${m.id}">${s.quiz.attempts.length ? "Retake quiz" : "Take quiz"}</button>` : ""}
              </div>
            </li>`;
          }).join("")}
        </ul>
      </section>

      <section class="card">
        <h2>Final assessment</h2>
        <ul class="checklist">
          <li class="${allRead() ? "ok" : ""}">${allRead() ? "✓" : "○"} All modules read (${done}/${MODULES.length})</li>
          <li class="${mqPassedCount() === MODULES.length ? "ok" : ""}">${mqPassedCount() === MODULES.length ? "✓" : "○"} Module quizzes passed (${mqPassedCount()}/${MODULES.length})${needMQ ? " — <strong>required</strong>" : " — recommended"}</li>
        </ul>
        <p class="small muted">${FQ.questionsPerAttempt} questions from every module · ${FQ.timeLimitMinutes} minutes · pass mark ${FQ.passPercent}% · attempts used ${used} of ${finalAllowed()}.</p>
        <div class="btn-row">
          ${!passed && left > 0 ? `<button class="btn ${finalEligible() ? "" : "ghost"}" id="quizBtn">Attempt final assessment</button>` : ""}
          ${!passed && left <= 0 ? `<span class="badge bad">No attempts remaining — contact your RSM / Training team</span>` : ""}
          ${passed ? `<a class="btn" href="#/certificate">View certificate</a>` : ""}
        </div>
        ${used ? `<div class="table-wrap" style="margin-top:16px"><table class="data">
          <tr><th>#</th><th>Date</th><th>Score</th><th>Result</th><th>Reason</th><th></th></tr>
          ${user.attempts.map((a, i) => `<tr>
            <td>${a.attemptNo}</td><td>${fmtDate(a.submittedAt)}</td><td>${a.scorePct}%</td>
            <td><span class="badge ${a.passed ? "ok" : "bad"}">${a.passed ? "PASS" : "FAIL"}</span></td>
            <td>${esc(a.reason)}</td><td><a href="#/result/final/${i}">View</a></td></tr>`).join("")}
        </table></div>` : ""}
      </section>`;

    app.querySelectorAll(".module-item").forEach((el) => {
      const open = () => go("#/module/" + el.dataset.id);
      el.onclick = open;
      el.onkeydown = (e) => { if (e.key === "Enter" && e.target === el) open(); };
    });
    app.querySelectorAll("[data-quiz]").forEach((b) => b.onclick = (e) => { e.stopPropagation(); confirmModuleQuiz(b.dataset.quiz); });
    const rb = document.getElementById("resumeBtn");
    if (rb) rb.onclick = () => target.quiz ? confirmModuleQuiz(target.quiz) : go(target.hash);
    const qb = document.getElementById("quizBtn");
    if (qb) qb.onclick = confirmFinalQuiz;
  }

  // ---------------------------------------------------------------- module reader
  let endObserver = null;

  function renderModule(id) {
    const idx = modIndex(id);
    const m = MODULES[idx];
    const s = modState(id);
    if (!s.firstOpenedAt) { s.firstOpenedAt = Date.now(); saveUser(false); }

    app.innerHTML = `
      <article class="card">
        <div class="reader-head">
          <div>
            <div class="small muted">Module ${idx + 1} of ${MODULES.length} · ${quizBadge(id)}</div>
            <h1>${esc(m.title)}</h1>
          </div>
          <a class="btn ghost small" href="#/">← All modules</a>
        </div>
        <div class="read-status" id="readStatus" aria-live="polite"></div>
        <div class="content">${m.body}</div>
        <div class="end-marker" id="endMarker"><div id="endBox"></div></div>
      </article>`;

    if (endObserver) endObserver.disconnect();
    endObserver = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !modState(id).scrolledEnd) {
        modState(id).scrolledEnd = true;
        saveUser(false);
        if (checkModuleComplete(id)) renderEndBox(id);
        renderModuleStatus(id);
      }
    }, { threshold: 0.3 });
    endObserver.observe(document.getElementById("endMarker"));
    renderModuleStatus(id, false, isActive());
    renderEndBox(id);

    const resumeY = pendingScroll != null ? pendingScroll : s.lastScrollY;
    if (resumeY > 300 && pendingScroll == null && !s.completedAt) toast("Resumed at your last reading position.");
    restoreScroll(s.completedAt ? 0 : s.lastScrollY);
  }

  function renderEndBox(id) {
    const box = document.getElementById("endBox");
    if (!box) return;
    const idx = modIndex(id), prev = MODULES[idx - 1], next = MODULES[idx + 1];
    const s = modState(id);
    const nav = `
      ${prev ? `<a class="btn ghost" href="#/module/${prev.id}">← ${esc(prev.title)}</a>` : ""}
      ${next ? `<a class="btn ghost" href="#/module/${next.id}">Next: ${esc(next.title)} →</a>` : `<a class="btn ghost" href="#/">Back to dashboard</a>`}`;
    if (!s.completedAt) {
      box.innerHTML = `<p class="small muted">End of module. The module quiz unlocks once the minimum reading time is met.</p><div class="btn-row">${nav}</div>`;
      return;
    }
    const canQuiz = MQ.maxAttempts === 0 || s.quiz.attempts.length < MQ.maxAttempts;
    box.innerHTML = `
      <div class="notice ${s.quiz.passedAt ? "ok" : "info"}">
        ${s.quiz.passedAt
          ? `✓ Module complete and quiz passed (best ${mqBest(id)}%).`
          : `<strong>✓ Module complete.</strong> Test your understanding now with a ${Math.min(MQ.questions, QUESTIONS.filter((q) => q.module === id).length)}-question quiz on this module.`}
      </div>
      <div class="btn-row">
        ${canQuiz ? `<button class="btn ${s.quiz.passedAt ? "ghost" : ""}" id="mqBtn">${s.quiz.attempts.length ? "Retake module quiz" : "Take module quiz now"}</button>` : ""}
        ${nav}
      </div>`;
    const b = document.getElementById("mqBtn");
    if (b) b.onclick = () => confirmModuleQuiz(id);
  }

  function renderModuleStatus(id, justCompleted, active = true) {
    const box = document.getElementById("readStatus");
    if (!box) return;
    const s = modState(id), req = requiredSec[id];
    const pct = Math.min(100, (s.sec / req) * 100);
    const done = !!s.completedAt;
    box.innerHTML = `
      <div class="row">
        <span>Time on this module: <strong>${ms(s.sec)}</strong> / ${ms(req)} required
          ${!active && !done ? ` <span class="badge warn">Paused — inactive</span>` : ""}</span>
        <span>${done ? `<span class="badge ok">Module completed</span> <a href="#endMarker" id="jumpQuiz">Module quiz ↓</a>`
          : `${s.scrolledEnd ? "✓ Read to end" : "Scroll to the end"} · ${s.sec >= req ? "✓ Time met" : ms(req - s.sec) + " remaining"}`}</span>
      </div>
      <div class="progress"><span style="width:${done ? 100 : pct}%"></span></div>`;
    const j = document.getElementById("jumpQuiz");
    if (j) j.onclick = (e) => { e.preventDefault(); document.getElementById("endMarker").scrollIntoView({ behavior: "smooth" }); };
    if (justCompleted) toast(`<strong>Module complete!</strong> Its quiz is now unlocked at the end of the page.`);
  }

  // ---------------------------------------------------------------- quizzes
  function confirmModuleQuiz(id) {
    const m = modById(id), s = modState(id);
    if (!isDone(id)) return modal("Finish reading first", `<p>The quiz for <strong>${esc(m.title)}</strong> unlocks once you've completed its reading.</p>`, [{ label: "OK" }]);
    const n = Math.min(MQ.questions, QUESTIONS.filter((q) => q.module === id).length);
    modal(`Module quiz: ${m.title}`, `
      <p>${n} questions · ${ms(n * MQ.secondsPerQuestion)} minutes · pass mark ${MQ.passPercent}%${MQ.maxAttempts ? ` · attempt ${s.quiz.attempts.length + 1} of ${MQ.maxAttempts}` : " · unlimited retakes"}.</p>
      <p class="small muted">${MQ.timerPausesWhenClosed ? "If you close the page, the quiz pauses and resumes with the same time left." : "The clock keeps running even if you close the page."}</p>`,
      [{ label: "Cancel", cls: "ghost" }, { label: "Start quiz", onClick: () => startQuiz("module", id) }]);
  }

  function confirmFinalQuiz() {
    if (finalLeft() <= 0 || passedAttempt()) return;
    const attemptNo = user.attempts.length + 1;
    if (finalEligible()) {
      modal("Start the final assessment?", `
        <p>${FQ.questionsPerAttempt} questions · ${FQ.timeLimitMinutes} minutes · pass mark ${FQ.passPercent}%.</p>
        <p>This is attempt <strong>${attemptNo} of ${finalAllowed()}</strong>. Once started, the content is locked
        until you submit${FQ.timerPausesWhenClosed ? "" : ", and the clock keeps running even if you close the page"}.</p>`,
        [{ label: "Cancel", cls: "ghost" }, { label: "Start", onClick: () => startQuiz("final") }]);
    } else {
      const missing = MODULES.filter((m) => !isDone(m.id));
      const missingQ = CFG.requireModuleQuizzesForFinal ? MODULES.filter((m) => !mqPassed(m.id)) : [];
      const first = missing[0] ? "#/module/" + missing[0].id : null;
      modal("You are not ready for the final assessment", `
        <div class="notice bad">Programme rule: attempting the final assessment without completing the required ${missing.length ? "reading" : "module quizzes"} is an automatic <strong>FAIL</strong>, whatever your score.
        It will also use up attempt ${attemptNo} of ${finalAllowed()}.</div>
        ${missing.length ? `<p>Modules still unread:</p><ul>${missing.map((m) => `<li>${esc(m.title)} — ${ms(modState(m.id).sec)} of ${ms(requiredSec[m.id])}</li>`).join("")}</ul>` : ""}
        ${missingQ.length ? `<p>Module quizzes not yet passed:</p><ul>${missingQ.map((m) => `<li>${esc(m.title)}</li>`).join("")}</ul>` : ""}`,
        [{ label: "Attempt anyway (FAIL)", cls: "danger", onClick: () => startQuiz("final") },
         { label: missing.length ? "Go back to reading" : "Back to dashboard", onClick: () => go(first || "#/") }]);
    }
  }

  function drawFinal(n) {
    // Draw evenly across modules (round-robin over shuffled per-module pools).
    const pools = shuffle(MODULES.map((m) => shuffle(QUESTIONS.map((q, i) => (q.module === m.id ? i : -1)).filter((i) => i >= 0))));
    const loose = shuffle(QUESTIONS.map((q, i) => (modById(q.module) ? -1 : i)).filter((i) => i >= 0));
    if (loose.length) pools.push(loose);
    const drawn = [];
    while (drawn.length < n && pools.some((p) => p.length)) pools.forEach((p) => { if (p.length && drawn.length < n) drawn.push(p.pop()); });
    return shuffle(drawn);
  }

  function startQuiz(kind, moduleId) {
    let picked, limitSec, pauses;
    if (kind === "final") {
      picked = drawFinal(Math.min(FQ.questionsPerAttempt, QUESTIONS.length));
      limitSec = FQ.timeLimitMinutes * 60;
      pauses = !!FQ.timerPausesWhenClosed;
    } else {
      const pool = shuffle(QUESTIONS.map((q, i) => (q.module === moduleId ? i : -1)).filter((i) => i >= 0));
      picked = pool.slice(0, Math.min(MQ.questions, pool.length));
      limitSec = picked.length * MQ.secondsPerQuestion;
      pauses = !!MQ.timerPausesWhenClosed;
    }
    user.activeQuiz = {
      kind, moduleId: moduleId || null,
      startedAt: Date.now(), limitSec, pauses, usedSec: 0, lastTickAt: Date.now(),
      readingComplete: allRead(), modulesDone: doneCount(), readingSec: readingSec(), moduleQuizzesPassed: mqPassedCount(),
      items: picked.map((qi) => ({ qi, order: shuffle(QUESTIONS[qi].options.map((_, i) => i)) })),
      answers: {},
      current: 0
    };
    saveUser(true);
    go("#/quiz");
  }

  const quizLeft = (qz) => qz.pauses ? qz.limitSec - (qz.usedSec || 0) : qz.limitSec - (Date.now() - qz.startedAt) / 1000;

  function renderQuiz() {
    const qz = user.activeQuiz;
    if (quizLeft(qz) <= 0) return submitQuiz(true);
    const i = qz.current, item = qz.items[i], q = QUESTIONS[item.qi];
    const answeredCount = Object.keys(qz.answers).length;
    const isFinal = qz.kind === "final";
    const title = isFinal ? `Final assessment · attempt ${user.attempts.length + 1} of ${finalAllowed()}` : `Module quiz · ${esc(modById(qz.moduleId).title)}`;

    app.innerHTML = `
      <section class="card">
        <div class="quiz-head">
          <div><div class="small muted">${title}</div>
          <h2 style="margin:0">Question ${i + 1} of ${qz.items.length}</h2></div>
          <div class="quiz-timer" id="quizTimer"></div>
        </div>
        ${isFinal && !qz.readingComplete ? `<div class="notice bad small">Reading was incomplete when this attempt started — it will be recorded as FAIL.</div>` : ""}
        <div class="question">${esc(q.q)}</div>
        <div class="options" role="radiogroup">
          ${item.order.map((oi) => `
            <label class="option ${qz.answers[i] === oi ? "selected" : ""}">
              <input type="radio" name="opt" value="${oi}" ${qz.answers[i] === oi ? "checked" : ""}>
              <span>${esc(q.options[oi])}</span>
            </label>`).join("")}
        </div>
        <div class="btn-row">
          <button class="btn ghost" id="prevQ" ${i === 0 ? "disabled" : ""}>← Previous</button>
          ${i < qz.items.length - 1 ? `<button class="btn" id="nextQ">Next →</button>` : ""}
          <button class="btn ${i === qz.items.length - 1 ? "" : "ghost"}" id="submitQ">Submit (${answeredCount}/${qz.items.length} answered)</button>
        </div>
        <div class="qnav" aria-label="Jump to question">
          ${qz.items.map((_, k) => `<button data-k="${k}" class="${qz.answers[k] !== undefined ? "answered" : ""} ${k === i ? "current" : ""}">${k + 1}</button>`).join("")}
        </div>
        <p class="small muted" style="margin-top:14px">Your answers are saved as you go. ${qz.pauses ? "If you close the page, the timer pauses and you'll resume on this question." : "If you close the page you'll resume on this question, but the timer keeps running."}</p>
      </section>`;

    app.querySelectorAll("input[name=opt]").forEach((r) => r.onchange = () => {
      qz.answers[i] = Number(r.value);
      saveUser(false);
      renderQuiz();
    });
    const move = (k) => { qz.current = k; saveUser(false); renderQuiz(); };
    document.getElementById("prevQ").onclick = () => move(i - 1);
    const nq = document.getElementById("nextQ"); if (nq) nq.onclick = () => move(i + 1);
    app.querySelectorAll(".qnav button").forEach((b) => b.onclick = () => move(Number(b.dataset.k)));
    document.getElementById("submitQ").onclick = () => {
      const missing = qz.items.length - Object.keys(qz.answers).length;
      modal("Submit your answers?", missing
        ? `<div class="notice warn">${missing} question(s) unanswered — they will be marked wrong.</div>`
        : `<p>You cannot change your answers after submitting.</p>`,
        [{ label: "Keep working", cls: "ghost" }, { label: "Submit", onClick: () => submitQuiz(false) }]);
    };
    tickQuiz();
  }

  function tickQuiz() {
    const qz = user && user.activeQuiz;
    const el = document.getElementById("quizTimer");
    if (!qz || !el) return;
    const left = quizLeft(qz);
    if (left <= 0) {
      document.getElementById("modal").hidden = true;
      return submitQuiz(true);
    }
    el.textContent = "⏱ " + ms(left);
    el.classList.toggle("low", left < Math.min(120, qz.limitSec / 4));
  }

  function scoreByModule(review) {
    const out = {};
    review.forEach((r) => {
      const q = QUESTIONS[r.qi]; if (!q) return;
      const b = out[q.module] = out[q.module] || { correct: 0, total: 0 };
      b.total++; if (r.chosen === q.answer) b.correct++;
    });
    return out;
  }

  function submitQuiz(autoSubmitted) {
    const qz = user.activeQuiz;
    if (!qz) return;
    const total = qz.items.length;
    const review = qz.items.map((it, k) => ({ qi: it.qi, chosen: qz.answers[k] ?? null }));
    const correct = review.reduce((c, r) => c + (r.chosen === QUESTIONS[r.qi].answer ? 1 : 0), 0);
    const scorePct = Math.round((correct / total) * 100);
    const submittedAt = Date.now();
    const durationSec = Math.round(qz.pauses ? Math.min(qz.usedSec || 0, qz.limitSec) : Math.min((submittedAt - qz.startedAt) / 1000, qz.limitSec));
    const rushed = durationSec / total < (FQ.minSecondsPerQuestion || 0);
    user.activeQuiz = null;

    if (qz.kind === "module") {
      const s = modState(qz.moduleId).quiz;
      const passed = scorePct >= MQ.passPercent;
      s.attempts.push({ attemptNo: s.attempts.length + 1, startedAt: qz.startedAt, submittedAt, durationSec, scorePct, correct, total, passed, rushed, autoSubmitted, review });
      if (passed && !s.passedAt) s.passedAt = submittedAt;
      saveUser(true);
      return go(`#/result/${qz.moduleId}/${s.attempts.length - 1}`);
    }

    let passed = false, reason;
    if (!qz.readingComplete) reason = `Content not read (${qz.modulesDone}/${MODULES.length} modules completed) — automatic fail`;
    else if (CFG.requireModuleQuizzesForFinal && qz.moduleQuizzesPassed < MODULES.length) reason = `Module quizzes not passed (${qz.moduleQuizzesPassed}/${MODULES.length}) — automatic fail`;
    else if (scorePct < FQ.passPercent) reason = `Score below pass mark of ${FQ.passPercent}%`;
    else { passed = true; reason = "Passed"; }

    user.attempts.push({
      attemptNo: user.attempts.length + 1,
      startedAt: qz.startedAt, submittedAt, durationSec,
      scorePct, correct, total, passed, reason,
      readingComplete: qz.readingComplete, modulesDone: qz.modulesDone, moduleQuizzesPassed: qz.moduleQuizzesPassed,
      readingSec: qz.readingSec, totalScreenSec: user.totalSec,
      rushed, autoSubmitted, byModule: scoreByModule(review), review
    });
    saveUser(true);
    go("#/result/final/" + (user.attempts.length - 1));
  }

  // ---------------------------------------------------------------- results
  function renderResult(kind, n) {
    const isFinal = kind === "final";
    const a = isFinal ? user.attempts[n] : modById(kind) && modState(kind).quiz.attempts[n];
    if (!a) return go("#/");
    const m = isFinal ? null : modById(kind);
    const idx = m ? modIndex(m.id) : -1;
    const next = m ? MODULES[idx + 1] : null;
    const byMod = a.byModule || scoreByModule(a.review);
    const passMark = isFinal ? FQ.passPercent : MQ.passPercent;

    app.innerHTML = `
      <section class="card">
        <div class="result-hero">
          <div class="small muted">${isFinal ? `Final assessment · attempt ${a.attemptNo}` : `Module quiz · ${esc(m.title)} · attempt ${a.attemptNo}`} · ${fmtDate(a.submittedAt)}</div>
          <div class="result-score ${a.passed ? "pass" : "fail"}">${a.scorePct}%</div>
          <span class="badge ${a.passed ? "ok" : "bad"}" style="font-size:1rem">${a.passed ? "PASS" : "FAIL"}</span>
          <p style="margin-top:12px">${esc(isFinal ? a.reason : a.passed ? "Module quiz passed" : `Below the ${passMark}% pass mark — review the module and retake the quiz`)}</p>
        </div>
        ${a.autoSubmitted ? `<div class="notice warn small">Time ran out — the quiz was submitted automatically.</div>` : ""}
        <div class="stats">
          <div class="stat"><div class="k">Correct</div><div class="v">${a.correct} / ${a.total}</div></div>
          <div class="stat"><div class="k">Quiz duration</div><div class="v">${ms(a.durationSec)}</div></div>
          ${isFinal ? `<div class="stat"><div class="k">Reading time</div><div class="v">${hms(a.readingSec)}</div></div>
          <div class="stat"><div class="k">Modules read</div><div class="v">${a.modulesDone} / ${MODULES.length}</div></div>` : ""}
        </div>
        ${isFinal ? `<h3>Score by module</h3>
        <div class="table-wrap"><table class="data">
          <tr><th>Module</th><th>Correct</th><th>Score</th></tr>
          ${MODULES.map((mm) => {
            const b = byMod[mm.id]; if (!b) return "";
            const pct = Math.round((b.correct / b.total) * 100);
            return `<tr><td>${esc(mm.title)}</td><td>${b.correct} / ${b.total}</td>
              <td><span class="badge ${pct >= FQ.passPercent ? "ok" : "bad"}">${pct}%</span></td></tr>`;
          }).join("")}
        </table></div>` : ""}
        <div class="btn-row no-print">
          ${m ? (a.passed
            ? (next ? `<a class="btn" href="#/module/${next.id}">Next module: ${esc(next.title)} →</a>` : `<a class="btn" href="#/">Go to final assessment</a>`)
            : `<a class="btn" href="#/module/${m.id}">Review module</a><button class="btn ghost" id="retakeBtn">Retake quiz</button>`) : ""}
          <a class="btn ghost" href="#/">Back to dashboard</a>
          ${isFinal && a.passed ? `<a class="btn" href="#/certificate">View certificate</a>` : ""}
          ${isFinal && !a.passed && !passedAttempt() && finalLeft() > 0 ? `<span class="muted small">${finalLeft()} attempt(s) remaining.</span>` : ""}
        </div>
      </section>
      <section class="card">
        <h2>Answer review</h2>
        <p class="small muted">${a.passed ? "Correct answers are shown." : "Correct answers are hidden until you pass, so retakes still test your knowledge."}</p>
        ${a.review.map((r, k) => {
          const q = QUESTIONS[r.qi]; if (!q) return "";
          const ok = r.chosen === q.answer;
          return `<div class="review-item">
            <div><strong>${k + 1}. ${esc(q.q)}</strong></div>
            <div class="ans ${ok ? "right" : "wrong"}">${ok ? "✓" : "✗"} Your answer: ${r.chosen === null ? "<em>not answered</em>" : esc(q.options[r.chosen])}</div>
            ${a.passed && !ok ? `<div class="ans right">Correct: ${esc(q.options[q.answer])}</div>` : ""}
          </div>`;
        }).join("")}
      </section>`;
    const rb = document.getElementById("retakeBtn");
    if (rb) rb.onclick = () => confirmModuleQuiz(m.id);
  }

  function renderCertificate() {
    const a = passedAttempt();
    if (!a) return go("#/");
    app.innerHTML = `
      <section class="certificate">
        <div class="small muted">${esc(CFG.companyName)}</div>
        <h2>Certificate of Completion</h2>
        <p>This certifies that</p>
        <div class="cert-name">${esc(user.profile.name)}</div>
        <p>Employee ID ${esc(user.profile.empId)} · ${esc(user.profile.area)}</p>
        <p>has successfully completed the<br><strong>${esc(CFG.programmeTitle)}</strong></p>
        <p>Score <strong>${a.scorePct}%</strong> · Reading time ${hms(a.readingSec)} · ${new Date(a.submittedAt).toLocaleDateString()}</p>
      </section>
      <div class="btn-row no-print">
        <a class="btn ghost" href="#/">Back to dashboard</a>
        <button class="btn" onclick="window.print()">Print / Save as PDF</button>
      </div>`;
  }

  // ---------------------------------------------------------------- boot
  async function boot() {
    document.getElementById("brandTitle").textContent = CFG.programmeTitle;
    document.getElementById("brandSub").textContent = `${CFG.teamName} · ${CFG.companyName}`;
    document.title = `${CFG.teamName} FLM Induction`;
    app.innerHTML = `<section class="card"><p class="muted">Loading…</p></section>`;

    await Store.init();
    document.getElementById("footerText").innerHTML =
      `${esc(CFG.programmeTitle)} · ${Store.mode === "cloud" ? "Cloud sync on" : "Local mode (this device only)"} · <a href="admin.html">Admin portal</a>`;

    const id = Store.ls.get("session", null);
    if (id) {
      try {
        await Store.ensureManagerAuth();
        const { rec } = await loadRecord(id);
        if (rec) {
          // Same-device reload / reopening the tab: resume silently at the saved position.
          user = normalize(rec);
          const r = user.resume;
          const hasHash = location.hash && location.hash !== "#/" && location.hash !== "#";
          if (!hasHash && r && r.hash && !/^#\/result/.test(r.hash)) {
            pendingScroll = r.scrollY || 0;
            history.replaceState(null, "", r.hash);
          } else if (hasHash && r && r.hash === location.hash) {
            pendingScroll = r.scrollY || 0;
          }
          attachSession();
          return render();
        }
        Store.ls.del("session");
      } catch { Store.ls.del("session"); }
    }
    render();
  }

  boot();
})();
