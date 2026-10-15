/* Khyber-1 Induction — data layer shared by the manager portal (index.html)
   and the admin portal (admin.html).

   Cloud mode  : Firebase Firestore, collection `k1_managers`, one document per
                 manager keyed by Employee ID. Managers sign in anonymously;
                 admins sign in with email + password (Firebase Auth).
   Local mode  : used when js/firebase-config.js is empty or Firebase can't load.
                 Same API, backed by this browser's localStorage only.

   Every manager record is also cached in localStorage so the portal keeps
   working through short network drops and resumes instantly on reload. */
(function () {
  "use strict";

  const COLLECTION = "k1_managers";
  const P = "k1i:";
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(P + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch { } },
    del(k) { try { localStorage.removeItem(P + k); } catch { } },
    keys(prefix) { try { return Object.keys(localStorage).filter((k) => k.startsWith(P + prefix)).map((k) => k.slice(P.length)); } catch { return []; } }
  };

  const cfg = window.FIREBASE_CONFIG || {};
  const cloudConfigured = !!(cfg.apiKey && cfg.projectId);
  let mode = "local", initError = null, db = null, auth = null;

  // v1 of the portal kept records under "k1i:user:<ID>" with no PIN. Move them
  // into the local database once; the manager is asked to set a PIN at next sign-in.
  function migrateV1() {
    ls.keys("user:").forEach((k) => {
      const id = k.slice(5), rec = ls.get(k, null);
      if (rec && rec.profile && !ls.get("db:" + id, null)) {
        rec.schema = 2; rec.pinHash = null; rec.updatedAt = rec.updatedAt || Date.now(); rec.lastSeenAt = rec.lastSeenAt || Date.now();
        delete rec.activeQuiz;
        ls.set("db:" + id, rec);
      }
      ls.del(k);
    });
    ls.del("results");
  }

  function authReady() {
    return new Promise((res) => { const un = auth.onAuthStateChanged((u) => { un(); res(u); }); });
  }
  function notFound(e) { return e && (e.code === "not-found" || /No document to update/i.test(e.message || "")); }

  const Store = {
    ls,
    get mode() { return mode; },
    get error() { return initError; },
    cloudConfigured,

    async init() {
      migrateV1();
      if (!cloudConfigured) { mode = "local"; return mode; }
      if (typeof firebase === "undefined" || !firebase.firestore || !firebase.auth) {
        initError = "Firebase could not be loaded (no internet connection?). Working on this device only.";
        mode = "local"; return mode;
      }
      try {
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        db = firebase.firestore();
        try { db.settings({ ignoreUndefinedProperties: true, merge: true }); } catch { }
        auth = firebase.auth();
        mode = "cloud";
      } catch (e) { initError = e.message; mode = "local"; }
      return mode;
    },

    /* ---------- manager auth (anonymous) ---------- */
    async ensureManagerAuth() {
      if (mode !== "cloud") return;
      const u = await authReady();
      if (!u) await auth.signInAnonymously();
    },

    /* ---------- manager records ---------- */
    async getManager(id) {
      if (mode === "cloud") {
        const snap = await db.collection(COLLECTION).doc(id).get();
        return snap.exists ? snap.data() : null;
      }
      return ls.get("db:" + id, null);
    },
    async createManager(rec) {
      const id = rec.profile.empId;
      if (mode === "cloud") await db.collection(COLLECTION).doc(id).set(rec);
      else ls.set("db:" + id, rec);
      ls.set("cache:" + id, rec);
    },
    /** Replaces the given top-level fields only, so admin-owned fields are never overwritten. */
    async updateManager(id, fields) {
      if (mode === "cloud") {
        try { await db.collection(COLLECTION).doc(id).update(fields); }
        catch (e) { if (notFound(e)) e.notFound = true; throw e; }
        return;
      }
      const rec = ls.get("db:" + id, null);
      if (!rec) { const e = new Error("Record not found"); e.notFound = true; throw e; }
      ls.set("db:" + id, Object.assign(rec, JSON.parse(JSON.stringify(fields))));
    },
    async deleteManager(id) {
      if (mode === "cloud") await db.collection(COLLECTION).doc(id).delete();
      else ls.del("db:" + id);
    },
    /** Live updates for one manager (used to pick up admin changes). Returns unsubscribe. */
    watchManager(id, cb) {
      if (mode === "cloud") return db.collection(COLLECTION).doc(id).onSnapshot((s) => cb(s.exists ? s.data() : null), () => { });
      const onStorage = (e) => { if (e.key === P + "db:" + id) cb(ls.get("db:" + id, null)); };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
    /** Live list of every manager (admin only). Returns unsubscribe. */
    watchAll(cb, onError) {
      if (mode === "cloud") {
        return db.collection(COLLECTION).onSnapshot((qs) => cb(qs.docs.map((d) => d.data())), (e) => onError && onError(e));
      }
      const read = () => cb(ls.keys("db:").map((k) => ls.get(k, null)).filter(Boolean));
      read();
      const t = setInterval(read, 3000);
      window.addEventListener("storage", read);
      return () => { clearInterval(t); window.removeEventListener("storage", read); };
    },

    /* ---------- device cache ---------- */
    getCache(id) { return ls.get("cache:" + id, null); },
    setCache(id, rec) { ls.set("cache:" + id, rec); },
    delCache(id) { ls.del("cache:" + id); },

    /* ---------- admin auth ---------- */
    async adminSignIn(emailOrPass, password) {
      if (mode === "cloud") { await auth.signInWithEmailAndPassword(emailOrPass, password); return; }
      if (emailOrPass !== (window.CONFIG && window.CONFIG.adminPasscode)) throw new Error("Incorrect passcode");
      try { sessionStorage.setItem(P + "admin", "1"); } catch { }
    },
    async adminSignOut() {
      if (mode === "cloud") { await auth.signOut(); return; }
      try { sessionStorage.removeItem(P + "admin"); } catch { }
    },
    /** Signed-in admin's email (cloud) / "local admin" (local), or null. */
    async currentAdmin() {
      if (mode === "cloud") { const u = await authReady(); return u && !u.isAnonymous ? u.email : null; }
      try { return sessionStorage.getItem(P + "admin") === "1" ? "local admin" : null; } catch { return null; }
    }
  };

  /* ---------- helpers shared by both portals ---------- */
  Store.requiredSeconds = function (modules, config) {
    const out = {};
    modules.forEach((m) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = m.body;
      const words = (tmp.textContent.match(/\S+/g) || []).length;
      out[m.id] = Math.max(config.minSecondsPerModule, Math.round((words / config.readingSpeedWpm) * 60)) + (config.extraSecondsPerModule || 0);
    });
    return out;
  };

  Store.hashPin = async function (empId, pin) {
    const text = "k1:" + empId + ":" + pin;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 0x811c9dc5; // fallback for non-secure contexts (plain http on a LAN)
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return "f" + h.toString(16);
  };

  window.K1Store = Store;
})();
