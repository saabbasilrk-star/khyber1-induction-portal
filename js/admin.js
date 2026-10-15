/* Khyber-1 Induction — admin portal.
   Live view of every manager: reading/screen time per module, module quizzes,
   final assessment results, what they're doing right now, plus module and
   question analytics, CSV exports and admin actions. */
(function () {
  "use strict";

  const CFG = window.CONFIG;
  const MODULES = window.MODULES;
  const QUESTIONS = window.QUESTIONS;
  const Store = window.K1Store;
  const FQ = CFG.quiz;
  const MQ = Object.assign({ passPercent: 70 }, CFG.moduleQuiz || {});
  const requiredSec = Store.requiredSeconds(MODULES, CFG);
  const ONLINE_MS = Math.max(60, (CFG.syncSeconds || 20) * 3) * 1000;
  const app = document.getElementById("app");

  // ---------------------------------------------------------------- utils
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const hms = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
  const ms = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
  const fmtDate = (t) => t ? new Date(t).toLocaleString() : "—";
  const ago = (t) => {
    if (!t) return "never";
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    return `${Math.round(s / 86400)} d ago`;
  };
  const modById = (id) => MODULES.find((m) => m.id === id);
  const modIndex = (id) => MODULES.findIndex((m) => m.id === id);
  const avg = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

  // ---------------------------------------------------------------- derived data
  function summarize(rec) {
    const mods = rec.modules || {};
    const m = (id) => Object.assign({ sec: 0, scrolledEnd: false, completedAt: null, quiz: { attempts: [], passedAt: null } }, mods[id] || {});
    const perModule = MODULES.map((mm) => {
      const s = m(mm.id);
      const qa = (s.quiz && s.quiz.attempts) || [];
      return {
        id: mm.id, title: mm.title, required: requiredSec[mm.id], sec: s.sec || 0, scrolledEnd: !!s.scrolledEnd,
        completedAt: s.completedAt, firstOpenedAt: s.firstOpenedAt,
        quizAttempts: qa, quizBest: qa.length ? Math.max(...qa.map((a) => a.scorePct)) : null,
        quizFirst: qa.length ? qa[0].scorePct : null, quizPassedAt: s.quiz && s.quiz.passedAt
      };
    });
    const attempts = rec.attempts || [];
    const allowed = FQ.maxAttempts + (rec.extraAttempts || 0);
    const passed = attempts.find((a) => a.passed);
    const modulesDone = perModule.filter((p) => p.completedAt).length;
    const quizzesPassed = perModule.filter((p) => p.quizPassedAt).length;
    const readingSec = perModule.reduce((t, p) => t + p.sec, 0);
    const online = rec.lastSeenAt && Date.now() - rec.lastSeenAt < ONLINE_MS;
    const aq = rec.activeQuiz;

    let status, cls;
    if (passed) { status = "Passed"; cls = "ok"; }
    else if (aq && aq.kind === "final") { status = "In final assessment"; cls = "info"; }
    else if (attempts.length && attempts.length >= allowed) { status = "Failed — no attempts left"; cls = "bad"; }
    else if (attempts.length) { status = "Failed — can retake"; cls = "bad"; }
    else if (modulesDone === MODULES.length) { status = "Ready for final"; cls = "info"; }
    else if (readingSec > 0) { status = "Reading"; cls = "warn"; }
    else { status = "Not started"; cls = "neutral"; }

    let activity = "Dashboard";
    if (aq) activity = aq.kind === "final" ? "Taking final assessment" : `Taking quiz: ${modById(aq.moduleId) ? `M${modIndex(aq.moduleId) + 1}` : ""}`;
    else if (rec.resume && rec.resume.hash) {
      const p = rec.resume.hash.replace(/^#\/?/, "").split("/");
      if (p[0] === "module" && modById(p[1])) activity = `Reading M${modIndex(p[1]) + 1}: ${modById(p[1]).title}`;
      else if (p[0] === "result") activity = "Viewing a result";
      else if (p[0] === "certificate") activity = "Viewing certificate";
    }

    return {
      rec, id: rec.profile.empId, name: rec.profile.name, area: rec.profile.area, createdAt: rec.profile.createdAt,
      perModule, attempts, allowed, passed, modulesDone, quizzesPassed, readingSec,
      totalSec: rec.totalSec || 0, lastSeenAt: rec.lastSeenAt, online, status, cls, activity,
      best: attempts.length ? Math.max(...attempts.map((a) => a.scorePct)) : null,
      notReadFails: attempts.filter((a) => !a.readingComplete).length,
      rushed: attempts.some((a) => a.rushed)
    };
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
      b.onclick = () => { if (a.keepOpen && !a.onClick()) return; m.hidden = true; if (!a.keepOpen && a.onClick) a.onClick(); };
      box.appendChild(b);
    });
    m.hidden = false;
  }
  function toast(html) {
    const t = document.getElementById("toast");
    t.innerHTML = html; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 4000);
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const csv = (rows) => rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");

  // ---------------------------------------------------------------- state & routing
  let data = [];           // summaries
  let unwatch = null;
  const ui = { tab: "managers", q: "", status: "all", sort: "lastSeenAt", dir: -1 };
  try { Object.assign(ui, JSON.parse(sessionStorage.getItem("k1i:adminui") || "{}")); } catch { }
  const saveUi = () => { try { sessionStorage.setItem("k1i:adminui", JSON.stringify(ui)); } catch { } };

  function route() {
    const p = location.hash.replace(/^#\/?/, "").split("/");
    return { name: p[0] || "list", id: decodeURIComponent(p[1] || "") };
  }
  window.addEventListener("hashchange", () => render(true));

  let started = false;
  function render(scrollTop) {
    if (!started) return;
    // Don't redraw under the admin while they're typing in the search box.
    const active = document.activeElement;
    const typing = active && active.id === "searchBox";
    const r = route();
    if (r.name === "m") renderDetail(r.id);
    else renderList();
    if (typing) { const s = document.getElementById("searchBox"); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }
    if (scrollTop) window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- login
  async function boot() {
    document.getElementById("brandSub").textContent = `${CFG.teamName} · ${CFG.companyName}`;
    app.innerHTML = `<section class="card"><p class="muted">Loading…</p></section>`;
    await Store.init();
    const who = await Store.currentAdmin();
    if (who) return start(who);
    renderLogin();
  }

  function renderLogin() {
    document.getElementById("topbarRight").hidden = true;
    const cloud = Store.mode === "cloud";
    app.innerHTML = `
      <section class="card" style="max-width:440px;margin:0 auto">
        <h2>Admin sign-in</h2>
        <p class="small muted">${cloud
          ? "Sign in with the administrator email and password created in your Firebase project (Authentication → Users)."
          : "Local mode: Firebase isn't configured, so this portal only shows managers who used <strong>this browser</strong>. See README to enable cloud sync."}</p>
        ${Store.error ? `<div class="notice bad small">${esc(Store.error)}</div>` : ""}
        <form id="adminForm">
          ${cloud ? `<div class="field"><label for="em">Email</label><input id="em" type="email" required autocomplete="username"></div>` : ""}
          <div class="field"><label for="pw">${cloud ? "Password" : "Passcode"}</label><input id="pw" type="password" required autocomplete="current-password"></div>
          <button class="btn" type="submit" id="loginBtn">Sign in</button>
        </form>
      </section>`;
    document.getElementById(cloud ? "em" : "pw").focus();
    document.getElementById("adminForm").onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("loginBtn"); btn.disabled = true;
      try {
        if (cloud) await Store.adminSignIn(document.getElementById("em").value.trim(), document.getElementById("pw").value);
        else await Store.adminSignIn(document.getElementById("pw").value);
        start(await Store.currentAdmin());
      } catch (err) {
        btn.disabled = false;
        const code = err.code || "";
        const msg = !cloud ? err.message
          : /configuration-not-found|operation-not-allowed/.test(code) ? "Email/Password sign-in isn't enabled. In the Firebase console open Authentication → Get started, then enable the Email/Password provider and add your admin user under Users."
          : /too-many-requests/.test(code) ? "Too many attempts. Please wait a few minutes and try again."
          : "Email or password is incorrect, or this account doesn't exist yet (add it under Firebase → Authentication → Users).";
        modal("Sign-in failed", `<p>${esc(msg)}</p>${code ? `<p class="small muted">${esc(code)}</p>` : ""}`, [{ label: "OK" }]);
      }
    };
  }

  function start(who) {
    document.getElementById("topbarRight").hidden = false;
    document.getElementById("adminChip").textContent = who;
    const live = document.getElementById("liveState");
    live.dataset.state = Store.mode === "cloud" ? "ok" : "local";
    live.textContent = Store.mode === "cloud" ? "● Live" : "Local mode";
    started = true;
    let lastSig = "";
    unwatch = Store.watchAll((list) => {
      const sig = JSON.stringify(list);
      if (sig === lastSig) return;   // local mode polls; skip identical snapshots
      lastSig = sig;
      data = list.filter((r) => r && r.profile).map(summarize);
      render(false);
    }, (err) => {
      app.innerHTML = `<section class="card"><h2>Access denied</h2>
        <p>Signed in as <strong>${esc(who)}</strong>, but the database refused to list managers.</p>
        <p class="small muted">Make sure this email is listed as an admin in the Firestore security rules (see README). Firebase said: ${esc(err.message)}</p></section>`;
    });
    // Refresh "x min ago" / online dots.
    clearInterval(start.timer);
    start.timer = setInterval(() => { data = data.map((s) => summarize(s.rec)); if (route().name !== "m") render(false); }, 30000);
  }

  document.getElementById("signOutBtn").onclick = async () => {
    if (unwatch) { unwatch(); unwatch = null; }
    started = false;
    await Store.adminSignOut();
    location.hash = "";
    renderLogin();
  };

  // ---------------------------------------------------------------- list view
  const STATUSES = ["Not started", "Reading", "Ready for final", "In final assessment", "Passed", "Failed — can retake", "Failed — no attempts left"];

  function renderList() {
    const n = data.length;
    const kpi = {
      online: data.filter((s) => s.online).length,
      read: data.filter((s) => s.modulesDone === MODULES.length).length,
      mq: data.filter((s) => s.quizzesPassed === MODULES.length).length,
      passed: data.filter((s) => s.passed).length,
      failedNotRead: data.filter((s) => s.notReadFails > 0).length,
      avgRead: avg(data.filter((s) => s.readingSec > 0).map((s) => s.readingSec))
    };

    app.innerHTML = `
      <div class="stats kpis">
        <div class="stat"><div class="k">Managers enrolled</div><div class="v">${n}</div></div>
        <div class="stat"><div class="k">Online now</div><div class="v"><span class="online-dot ${kpi.online ? "on" : ""}"></span>${kpi.online}</div></div>
        <div class="stat"><div class="k">Reading complete</div><div class="v">${kpi.read}</div></div>
        <div class="stat"><div class="k">All module quizzes passed</div><div class="v">${kpi.mq}</div></div>
        <div class="stat"><div class="k">Final passed</div><div class="v">${kpi.passed}</div></div>
        <div class="stat"><div class="k">Failed — content not read</div><div class="v">${kpi.failedNotRead}</div></div>
        <div class="stat"><div class="k">Avg reading time</div><div class="v">${kpi.avgRead == null ? "—" : hms(kpi.avgRead)}</div></div>
      </div>

      <div class="tabs" role="tablist">
        ${[["managers", "Managers"], ["modules", "Module analytics"], ["questions", "Question analytics"]].map(([k, l]) =>
          `<button role="tab" class="tab ${ui.tab === k ? "active" : ""}" data-tab="${k}" aria-selected="${ui.tab === k}">${l}</button>`).join("")}
      </div>
      <section class="card tab-card" id="tabBody"></section>`;

    app.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => { ui.tab = b.dataset.tab; saveUi(); renderList(); });
    if (ui.tab === "modules") renderModuleAnalytics();
    else if (ui.tab === "questions") renderQuestionAnalytics();
    else renderManagers();
  }

  const COLS = [
    ["name", "Manager"], ["area", "Area"], ["modulesDone", "Read"], ["quizzesPassed", "Module quizzes"],
    ["readingSec", "Reading time"], ["totalSec", "Screen time"], ["status", "Final status"], ["best", "Best %"],
    ["attempts", "Attempts"], ["lastSeenAt", "Last active"]
  ];

  function renderManagers() {
    const body = document.getElementById("tabBody");
    const q = ui.q.trim().toLowerCase();
    let rows = data.filter((s) =>
      (!q || [s.name, s.id, s.area].some((v) => String(v).toLowerCase().includes(q))) &&
      (ui.status === "all" || s.status === ui.status || (ui.status === "online" && s.online)));
    const key = ui.sort;
    const val = (s) => key === "attempts" ? s.attempts.length : key === "status" ? STATUSES.indexOf(s.status) : s[key];
    rows.sort((a, b) => {
      const x = val(a), y = val(b);
      if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1;
      return (typeof x === "string" ? x.localeCompare(y) : x - y) * ui.dir;
    });

    body.innerHTML = `
      <div class="toolbar">
        <input type="search" id="searchBox" placeholder="Search name, Employee ID or area" value="${esc(ui.q)}" aria-label="Search managers">
        <select id="statusSel" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="online" ${ui.status === "online" ? "selected" : ""}>Online now</option>
          ${STATUSES.map((s) => `<option ${ui.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <span class="spacer"></span>
        <button class="btn ghost small" id="csvSummary" ${data.length ? "" : "disabled"}>Export summary CSV</button>
        <button class="btn ghost small" id="csvModules" ${data.length ? "" : "disabled"}>Export module detail CSV</button>
      </div>
      <div class="table-wrap"><table class="data sortable">
        <thead><tr>${COLS.map(([k, l]) => `<th data-sort="${k}" class="${ui.sort === k ? "sorted" : ""}" tabindex="0">${l}${ui.sort === k ? (ui.dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}<th>Now</th></tr></thead>
        <tbody>
        ${rows.map((s) => `<tr class="clickable" data-id="${esc(s.id)}" tabindex="0">
          <td><strong>${esc(s.name)}</strong><div class="small muted">${esc(s.id)}</div></td>
          <td>${esc(s.area)}</td>
          <td><div class="mini-progress"><span style="width:${(s.modulesDone / MODULES.length) * 100}%"></span></div>${s.modulesDone}/${MODULES.length}</td>
          <td>${s.quizzesPassed}/${MODULES.length}</td>
          <td>${hms(s.readingSec)}</td>
          <td>${hms(s.totalSec)}</td>
          <td><span class="badge ${s.cls}">${esc(s.status)}</span>${s.notReadFails ? ` <span class="badge bad" title="Attempted the final without reading">not read</span>` : ""}${s.rushed ? ` <span class="badge warn" title="Answered faster than ${FQ.minSecondsPerQuestion}s per question">rushed</span>` : ""}</td>
          <td>${s.best == null ? "—" : s.best + "%"}</td>
          <td>${s.attempts.length}/${s.allowed}</td>
          <td><span class="online-dot ${s.online ? "on" : ""}"></span>${ago(s.lastSeenAt)}</td>
          <td class="small">${s.online ? esc(s.activity) : "—"}</td>
        </tr>`).join("") || `<tr><td colspan="${COLS.length + 1}" class="muted">${data.length ? "No managers match the filters." : "No managers have signed in yet."}</td></tr>`}
        </tbody>
      </table></div>
      <p class="small muted">${rows.length} of ${data.length} managers · click a row for full detail · updates live.</p>`;

    const sb = document.getElementById("searchBox");
    sb.oninput = () => { ui.q = sb.value; saveUi(); renderManagers(); const s = document.getElementById("searchBox"); s.focus(); s.setSelectionRange(s.value.length, s.value.length); };
    document.getElementById("statusSel").onchange = (e) => { ui.status = e.target.value; saveUi(); renderManagers(); };
    body.querySelectorAll("th[data-sort]").forEach((th) => {
      const sort = () => { const k = th.dataset.sort; ui.dir = ui.sort === k ? -ui.dir : (["name", "area", "status"].includes(k) ? 1 : -1); ui.sort = k; saveUi(); renderManagers(); };
      th.onclick = sort; th.onkeydown = (e) => { if (e.key === "Enter") sort(); };
    });
    body.querySelectorAll("tr[data-id]").forEach((tr) => {
      const open = () => { location.hash = "#/m/" + encodeURIComponent(tr.dataset.id); };
      tr.onclick = open; tr.onkeydown = (e) => { if (e.key === "Enter") open(); };
    });
    const c1 = document.getElementById("csvSummary"); if (c1) c1.onclick = exportSummary;
    const c2 = document.getElementById("csvModules"); if (c2) c2.onclick = exportModules;
  }

  function renderModuleAnalytics() {
    const body = document.getElementById("tabBody");
    const rows = MODULES.map((m, i) => {
      const per = data.map((s) => s.perModule[i]);
      const done = per.filter((p) => p.completedAt);
      const opened = per.filter((p) => p.sec > 0);
      const tried = per.filter((p) => p.quizAttempts.length);
      // Final-assessment performance on this module's questions.
      let fc = 0, ft = 0;
      data.forEach((s) => s.attempts.forEach((a) => (a.review || []).forEach((r) => {
        const q = QUESTIONS[r.qi]; if (q && q.module === m.id) { ft++; if (r.chosen === q.answer) fc++; }
      })));
      return {
        m, i, opened: opened.length, done: done.length,
        avgRead: avg(done.map((p) => p.sec)), required: requiredSec[m.id],
        tried: tried.length, passed: per.filter((p) => p.quizPassedAt).length,
        avgFirst: avg(tried.map((p) => p.quizFirst)), avgBest: avg(tried.map((p) => p.quizBest)),
        avgTries: avg(tried.map((p) => p.quizAttempts.length)),
        finalPct: ft ? Math.round((fc / ft) * 100) : null
      };
    });
    const n = data.length || 1;
    const pctCls = (v, mark) => v == null ? "neutral" : v >= mark ? "ok" : "bad";
    body.innerHTML = `
      <p class="small muted">How every module is performing across all ${data.length} managers. Low first-try or final-assessment scores point to content that needs more coaching.</p>
      <div class="table-wrap"><table class="data">
        <tr><th>Module</th><th>Opened</th><th>Completed</th><th>Avg reading time (completers)</th><th>Min. required</th>
          <th>Quiz taken</th><th>Quiz passed</th><th>Avg 1st-try score</th><th>Avg best score</th><th>Avg tries</th><th>Final-assessment correct</th></tr>
        ${rows.map((r) => `<tr>
          <td><strong>M${r.i + 1}</strong> ${esc(r.m.title)}</td>
          <td>${r.opened}</td>
          <td><div class="mini-progress"><span style="width:${(r.done / n) * 100}%"></span></div>${r.done}/${data.length}</td>
          <td>${r.avgRead == null ? "—" : ms(r.avgRead)}</td>
          <td>${ms(r.required)}</td>
          <td>${r.tried}</td>
          <td>${r.passed}</td>
          <td><span class="badge ${pctCls(r.avgFirst, MQ.passPercent)}">${r.avgFirst == null ? "—" : Math.round(r.avgFirst) + "%"}</span></td>
          <td>${r.avgBest == null ? "—" : Math.round(r.avgBest) + "%"}</td>
          <td>${r.avgTries == null ? "—" : r.avgTries.toFixed(1)}</td>
          <td><span class="badge ${pctCls(r.finalPct, FQ.passPercent)}">${r.finalPct == null ? "—" : r.finalPct + "%"}</span></td>
        </tr>`).join("")}
      </table></div>`;
  }

  function renderQuestionAnalytics() {
    const body = document.getElementById("tabBody");
    const stats = QUESTIONS.map((q, i) => ({ q, i, asked: 0, right: 0, picks: q.options.map(() => 0), blank: 0 }));
    const add = (r) => { const s = stats[r.qi]; if (!s) return; s.asked++; if (r.chosen === null || r.chosen === undefined) s.blank++; else { s.picks[r.chosen]++; if (r.chosen === s.q.answer) s.right++; } };
    data.forEach((s) => {
      s.attempts.forEach((a) => (a.review || []).forEach(add));
      s.perModule.forEach((p) => p.quizAttempts.forEach((a) => (a.review || []).forEach(add)));
    });
    const rows = stats.filter((s) => s.asked).sort((a, b) => a.right / a.asked - b.right / b.asked);
    body.innerHTML = `
      <p class="small muted">Every question answered in module quizzes and final assessments, hardest first. "Most common wrong answer" shows the misconception to coach on.</p>
      <div class="table-wrap"><table class="data wrap">
        <tr><th>Module</th><th>Question</th><th>Asked</th><th>Correct</th><th>Most common wrong answer</th></tr>
        ${rows.map((s) => {
          const pct = Math.round((s.right / s.asked) * 100);
          let wi = -1, wn = 0;
          s.picks.forEach((c, k) => { if (k !== s.q.answer && c > wn) { wn = c; wi = k; } });
          return `<tr>
            <td>M${modIndex(s.q.module) + 1}</td>
            <td>${esc(s.q.q)}<div class="small muted">Answer: ${esc(s.q.options[s.q.answer])}</div></td>
            <td>${s.asked}</td>
            <td><span class="badge ${pct >= FQ.passPercent ? "ok" : pct >= 50 ? "warn" : "bad"}">${pct}%</span></td>
            <td class="small">${wi >= 0 ? `${esc(s.q.options[wi])} <span class="muted">(${wn}×)</span>` : "—"}</td>
          </tr>`;
        }).join("") || `<tr><td colspan="5" class="muted">No quiz answers yet.</td></tr>`}
      </table></div>`;
  }

  // ---------------------------------------------------------------- detail view
  function renderDetail(id) {
    const s = data.find((x) => x.id === id);
    if (!s) {
      app.innerHTML = `<section class="card"><p>Manager <strong>${esc(id)}</strong> not found (the record may have been deleted).</p><a class="btn ghost" href="#/">← All managers</a></section>`;
      return;
    }
    const rec = s.rec;
    app.innerHTML = `
      <section class="card">
        <div class="reader-head">
          <div>
            <a class="small" href="#/">← All managers</a>
            <h1 style="margin-top:6px">${esc(s.name)}</h1>
            <p class="muted">${esc(s.id)} · ${esc(s.area)} · enrolled ${fmtDate(s.createdAt)}</p>
          </div>
          <div style="text-align:right">
            <span class="badge ${s.cls}" style="font-size:.9rem">${esc(s.status)}</span>
            <div class="small muted" style="margin-top:6px"><span class="online-dot ${s.online ? "on" : ""}"></span>${s.online ? "Online — " + esc(s.activity) : "Last active " + ago(s.lastSeenAt)}</div>
            ${rec.activeSession ? `<div class="small muted">Last device: ${esc(rec.activeSession.device || "—")}</div>` : ""}
          </div>
        </div>
        <div class="stats">
          <div class="stat"><div class="k">Modules read</div><div class="v">${s.modulesDone} / ${MODULES.length}</div></div>
          <div class="stat"><div class="k">Module quizzes passed</div><div class="v">${s.quizzesPassed} / ${MODULES.length}</div></div>
          <div class="stat"><div class="k">Reading time</div><div class="v">${hms(s.readingSec)}</div></div>
          <div class="stat"><div class="k">Total screen time</div><div class="v">${hms(s.totalSec)}</div></div>
          <div class="stat"><div class="k">Final attempts</div><div class="v">${s.attempts.length} / ${s.allowed}</div></div>
          <div class="stat"><div class="k">Best final score</div><div class="v">${s.best == null ? "—" : s.best + "%"}</div></div>
        </div>
        <div class="btn-row">
          <button class="btn ghost small" id="actExtra">Grant extra final attempt</button>
          <button class="btn ghost small" id="actPin">Reset PIN</button>
          <button class="btn ghost small" id="actJson">Download full record</button>
          <button class="btn danger small" id="actDelete">Delete record</button>
        </div>
      </section>

      <section class="card">
        <h2>Modules</h2>
        <div class="table-wrap"><table class="data">
          <tr><th>Module</th><th>Screen time</th><th>Required</th><th>Read to end</th><th>Completed</th><th>Quiz attempts</th><th>First try</th><th>Best</th><th>Quiz status</th></tr>
          ${s.perModule.map((p, i) => {
            const pct = Math.min(100, (p.sec / p.required) * 100);
            return `<tr>
              <td><strong>M${i + 1}</strong> ${esc(p.title)}</td>
              <td><div class="mini-progress"><span style="width:${pct}%"></span></div>${ms(p.sec)}</td>
              <td>${ms(p.required)}</td>
              <td>${p.scrolledEnd ? "✓" : "—"}</td>
              <td>${p.completedAt ? fmtDate(p.completedAt) : `<span class="muted">${p.sec ? "in progress" : "not started"}</span>`}</td>
              <td>${p.quizAttempts.length}</td>
              <td>${p.quizFirst == null ? "—" : p.quizFirst + "%"}</td>
              <td>${p.quizBest == null ? "—" : p.quizBest + "%"}</td>
              <td>${p.quizPassedAt ? `<span class="badge ok">Passed</span>` : p.quizAttempts.length ? `<span class="badge bad">Not passed</span>` : p.completedAt ? `<span class="badge info">Not taken</span>` : `<span class="badge neutral">Locked</span>`}</td>
            </tr>`;
          }).join("")}
        </table></div>
      </section>

      <section class="card">
        <h2>Final assessment attempts</h2>
        ${s.attempts.length ? `<div class="table-wrap"><table class="data">
          <tr><th>#</th><th>Submitted</th><th>Score</th><th>Result</th><th>Reason</th><th>Duration</th><th>Reading at start</th><th>Flags</th>${MODULES.map((m, i) => `<th title="${esc(m.title)}">M${i + 1}</th>`).join("")}</tr>
          ${s.attempts.map((a) => `<tr>
            <td>${a.attemptNo}</td><td>${fmtDate(a.submittedAt)}</td><td>${a.scorePct}%</td>
            <td><span class="badge ${a.passed ? "ok" : "bad"}">${a.passed ? "PASS" : "FAIL"}</span></td>
            <td class="small">${esc(a.reason)}</td><td>${ms(a.durationSec)}</td>
            <td>${hms(a.readingSec)} (${a.modulesDone}/${MODULES.length})</td>
            <td class="small">${[a.rushed && "rushed", a.autoSubmitted && "timed out"].filter(Boolean).join(", ") || "—"}</td>
            ${MODULES.map((m) => { const b = a.byModule && a.byModule[m.id]; return `<td class="small">${b ? `${b.correct}/${b.total}` : "—"}</td>`; }).join("")}
          </tr>`).join("")}
        </table></div>` : `<p class="muted">No final attempts yet.</p>`}
        ${rec.activeQuiz ? `<div class="notice info small">Currently taking ${rec.activeQuiz.kind === "final" ? "the final assessment" : "the quiz for " + esc((modById(rec.activeQuiz.moduleId) || {}).title)} — ${Object.keys(rec.activeQuiz.answers || {}).length}/${rec.activeQuiz.items.length} answered, started ${fmtDate(rec.activeQuiz.startedAt)}.</div>` : ""}
      </section>

      <section class="card">
        <h2>Module quiz history</h2>
        ${s.perModule.some((p) => p.quizAttempts.length) ? `<div class="table-wrap"><table class="data">
          <tr><th>Module</th><th>#</th><th>Submitted</th><th>Score</th><th>Result</th><th>Duration</th></tr>
          ${s.perModule.flatMap((p, i) => p.quizAttempts.map((a) => `<tr>
            <td>M${i + 1} ${esc(p.title)}</td><td>${a.attemptNo}</td><td>${fmtDate(a.submittedAt)}</td><td>${a.scorePct}%</td>
            <td><span class="badge ${a.passed ? "ok" : "bad"}">${a.passed ? "PASS" : "FAIL"}</span></td><td>${ms(a.durationSec)}</td></tr>`)).join("")}
        </table></div>` : `<p class="muted">No module quizzes taken yet.</p>`}
      </section>`;

    document.getElementById("actExtra").onclick = () => modal("Grant an extra attempt?",
      `<p>${esc(s.name)} will be allowed <strong>${s.allowed + 1}</strong> final-assessment attempts in total (currently ${s.allowed}).</p>`,
      [{ label: "Cancel", cls: "ghost" }, { label: "Grant attempt", onClick: () => act(() => Store.updateManager(s.id, { extraAttempts: (rec.extraAttempts || 0) + 1 }), "Extra attempt granted.") }]);
    document.getElementById("actPin").onclick = () => modal("Reset PIN?",
      `<p>${esc(s.name)} will be asked to choose a new PIN the next time they sign in. Their progress is kept.</p>`,
      [{ label: "Cancel", cls: "ghost" }, { label: "Reset PIN", onClick: () => act(() => Store.updateManager(s.id, { pinHash: null }), "PIN reset. The manager will set a new PIN at next sign-in.") }]);
    document.getElementById("actJson").onclick = () => download(`k1-induction-${s.id}.json`, JSON.stringify(Object.assign({}, rec, { pinHash: rec.pinHash ? "(set)" : null }), null, 2), "application/json");
    document.getElementById("actDelete").onclick = () => modal("Delete this record?",
      `<p>This permanently deletes <strong>${esc(s.name)} (${esc(s.id)})</strong> — all reading time, quiz attempts and results. It cannot be undone.</p>
       <div class="field"><label for="confirmId">Type the Employee ID to confirm</label><input id="confirmId" type="text"></div>`,
      [{ label: "Cancel", cls: "ghost" }, { label: "Delete permanently", cls: "danger", keepOpen: true, onClick: () => {
        if (document.getElementById("confirmId").value.trim().toUpperCase() !== s.id.toUpperCase()) { document.getElementById("confirmId").focus(); return false; }
        document.getElementById("modal").hidden = true;
        act(() => Store.deleteManager(s.id), "Record deleted.").then(() => { location.hash = "#/"; });
        return false;
      } }]);
  }

  async function act(fn, ok) {
    try { await fn(); toast(ok); }
    catch (e) { modal("Action failed", `<p>${esc(e.message || e)}</p>`, [{ label: "OK" }]); }
  }

  // ---------------------------------------------------------------- exports
  function exportSummary() {
    const head = ["Name", "Employee ID", "Area", "Enrolled", "Last active", "Modules read", "Module quizzes passed", "Reading time (min)", "Screen time (min)",
      "Final status", "Best final %", "Final attempts used", "Final attempts allowed", "Failed without reading", "Rushed flag"];
    const rows = data.map((s) => [s.name, s.id, s.area, fmtDate(s.createdAt), fmtDate(s.lastSeenAt), s.modulesDone, s.quizzesPassed,
      (s.readingSec / 60).toFixed(1), (s.totalSec / 60).toFixed(1), s.status, s.best ?? "", s.attempts.length, s.allowed, s.notReadFails ? "Yes" : "No", s.rushed ? "Yes" : "No"]);
    download(`khyber1-induction-summary-${new Date().toISOString().slice(0, 10)}.csv`, csv([head, ...rows]), "text/csv");
  }
  function exportModules() {
    const head = ["Name", "Employee ID", "Area", "Module #", "Module", "Screen time (min)", "Required (min)", "Read to end", "Completed at",
      "Module quiz attempts", "First-try %", "Best %", "Module quiz passed"];
    const rows = data.flatMap((s) => s.perModule.map((p, i) => [s.name, s.id, s.area, i + 1, p.title, (p.sec / 60).toFixed(1), (p.required / 60).toFixed(1),
      p.scrolledEnd ? "Yes" : "No", fmtDate(p.completedAt), p.quizAttempts.length, p.quizFirst ?? "", p.quizBest ?? "", p.quizPassedAt ? "Yes" : "No"]));
    download(`khyber1-induction-modules-${new Date().toISOString().slice(0, 10)}.csv`, csv([head, ...rows]), "text/csv");
  }

  boot();
})();
