/* Agent Log: records what a web page does as OpenTelemetry log records, kept in this browser's
   IndexedDB, so the person using the page can export the log and hand it to an agent for debugging.
   Docs, bookmarklet and console snippet: https://austegard.com/web-utilities/agent-log.html

   It records console.* calls (object arguments become attributes), uncaught errors, unhandled promise
   rejections, resources that failed to load, CSP violations, fetch and XHR calls, in-page navigation
   and visibility changes. Nothing leaves the browser until the user downloads or copies the export,
   which is an OTLP/JSON ExportLogsServiceRequest with one resourceLogs entry per page load.

   Turning it on:
     ?logging=true          on a page that includes this script (?logging=false turns it off)
     <script data-start>    on a page that should always log
     agent-log.js?start     what the bookmarklet and the console snippet load
   Once on, it stays on for the tab (sessionStorage) on pages that include the script, until Stop.

   API: window.AgentLog.start(opts) .stop() .export() .exportJSON() .download() .copy() .clear()
        .open() .close(); opts = { max: 20000 records kept, network: true }.
   Classic script, no dependencies, no build step. */
(function () {
  "use strict";
  var VERSION = "1.0.0";
  var HOME = "https://austegard.com/web-utilities/agent-log.html";
  var me = document.currentScript;
  var src = null;
  try { src = me && me.src ? new URL(me.src, location.href) : null; } catch (e) {}

  // A second copy (the bookmarklet pressed twice, or a page that includes the script plus the bookmarklet)
  // hands over to the first instead of patching everything a second time.
  if (window.AgentLog && window.AgentLog.version) {
    if ((src && src.searchParams.has("start")) || window.AGENT_LOG_START) window.AgentLog.start({ via: "bookmarklet" });
    return;
  }

  var DB_NAME = "agent-log", FLAG = "agentlog:on", CORNER = "agentlog:corner", PENDING = "agentlog:pending";
  var SEV = { trace: [1, "TRACE"], debug: [5, "DEBUG"], info: [9, "INFO"], warn: [13, "WARN"], error: [17, "ERROR"], fatal: [21, "FATAL"] };
  var CONSOLE_SEV = { debug: "debug", log: "info", info: "info", warn: "warn", error: "error", trace: "trace", assert: "error" };
  var MAX_STR = 2000, MAX_BODY = 4000, MAX_ITEMS = 100, MAX_DEPTH = 4;
  var SECRET_PARAM = /^(access_?token|id_?token|refresh_?token|token|api_?key|apikey|key|secret|client_secret|password|passwd|pwd|pass|auth|authorization|sig|signature|code|session|sessionid|session_id|jwt)$/i;

  var nativeConsole = {};
  for (var m in CONSOLE_SEV) nativeConsole[m] = console[m];
  var say = function () { try { nativeConsole.log.apply(console, ["[agent-log]"].concat([].slice.call(arguments))); } catch (e) {} };

  var on = false, opts = { max: 20000, network: true }, session = null;
  var buf = [], mem = [], dbp = null, db = null, stored = 0, flushTimer = 0, patched = false;
  var ui = null;

  // ------------------------------------------------------------------ time and ids
  function nowNano() {
    var t = performance.timeOrigin + performance.now(), ms = Math.floor(t), ns = Math.round((t - ms) * 1e6);
    if (ns >= 1e6) { ms += 1; ns -= 1e6; }
    return String(ms) + String(ns).padStart(6, "0");
  }
  function newId() {
    var a = new Uint8Array(8);
    try { crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < 8; i++) a[i] = Math.random() * 256; }
    return Array.prototype.map.call(a, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  // ------------------------------------------------------------------ OTLP values
  function clip(s, n) { s = String(s); n = n || MAX_STR; return s.length > n ? s.slice(0, n) + "… (" + (s.length - n) + " more chars)" : s; }
  function describeNode(n) {
    if (!n || !n.nodeName) return String(n);
    if (n.nodeType !== 1) return "#" + n.nodeName.toLowerCase();
    var s = n.tagName.toLowerCase();
    if (n.id) s += "#" + n.id;
    if (typeof n.className === "string" && n.className.trim()) s += "." + n.className.trim().split(/\s+/).slice(0, 3).join(".");
    return "<" + s + ">";
  }
  function kv(key, v, depth, seen) { return { key: String(key), value: anyValue(v, depth, seen) }; }
  function kvList(obj, depth, seen) {
    var out = [], keys;
    try { keys = Object.keys(obj); } catch (e) { return out; }
    for (var i = 0; i < keys.length && i < MAX_ITEMS; i++) {
      var v;
      try { v = obj[keys[i]]; } catch (e) { v = "[getter threw: " + (e && e.message) + "]"; }
      out.push(kv(keys[i], v, depth + 1, seen));
    }
    if (keys.length > MAX_ITEMS) out.push(kv("…", (keys.length - MAX_ITEMS) + " more keys", depth + 1, seen));
    return out;
  }
  function anyValue(v, depth, seen) {
    depth = depth || 0;
    switch (typeof v) {
      case "string": return { stringValue: clip(v) };
      case "boolean": return { boolValue: v };
      case "number":
        if (Number.isSafeInteger(v)) return { intValue: String(v) };
        return isFinite(v) ? { doubleValue: v } : { stringValue: String(v) };
      case "bigint": return { intValue: v.toString() };
      case "undefined": return { stringValue: "undefined" };
      case "symbol": return { stringValue: v.toString() };
      case "function": return { stringValue: "[Function " + (v.name || "anonymous") + "]" };
    }
    if (v === null) return {};
    try {
      if (v instanceof Error) return { kvlistValue: { values: [kv("type", v.name), kv("message", v.message), kv("stack", clip(v.stack || "", 4000))] } };
      if (v instanceof Date) return { stringValue: isNaN(v) ? "Invalid Date" : v.toISOString() };
      if (typeof Node !== "undefined" && v instanceof Node) return { stringValue: describeNode(v) };
      if (v === window) return { stringValue: "[Window]" };
      if (typeof Promise !== "undefined" && v instanceof Promise) return { stringValue: "[Promise]" };
      if (typeof RegExp !== "undefined" && v instanceof RegExp) return { stringValue: String(v) };
    } catch (e) { return { stringValue: "[unreadable]" }; }
    seen = seen || [];
    if (seen.indexOf(v) >= 0) return { stringValue: "[Circular]" };
    if (depth >= MAX_DEPTH) return { stringValue: Array.isArray(v) ? "[Array(" + v.length + ")]" : "[Object]" };
    seen.push(v);
    try {
      if (Array.isArray(v) || (ArrayBuffer.isView(v) && !(v instanceof DataView))) {
        var vals = [];
        for (var i = 0; i < v.length && i < MAX_ITEMS; i++) vals.push(anyValue(v[i], depth + 1, seen));
        if (v.length > MAX_ITEMS) vals.push({ stringValue: "… " + (v.length - MAX_ITEMS) + " more items" });
        return { arrayValue: { values: vals } };
      }
      if (v instanceof Map) {
        var mv = [], n = 0;
        v.forEach(function (val, key) { if (n++ < MAX_ITEMS) mv.push(kv(typeof key === "string" ? key : String(key), val, depth + 1, seen)); });
        return { kvlistValue: { values: mv } };
      }
      if (v instanceof Set) return anyValue(Array.from(v), depth, seen.slice(0, -1));
      if (typeof Event !== "undefined" && v instanceof Event) return { kvlistValue: { values: [kv("type", v.type), kv("target", describeNode(v.target))] } };
      return { kvlistValue: { values: kvList(v, depth, seen) } };
    } finally { seen.pop(); }
  }
  function attrs(obj) {
    var out = [];
    for (var k in obj) if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") out.push(kv(k, obj[k]));
    return out;
  }

  // ------------------------------------------------------------------ URLs, with credentials taken out
  function redactUrl(u) {
    if (u == null) return "";
    u = String(u);
    if (/^data:/i.test(u)) return clip(u, 80);
    try {
      var url = new URL(u, location.href);
      if (url.username || url.password) { url.username = ""; url.password = ""; }
      var changed = false;
      url.searchParams.forEach(function (val, key) { if (SECRET_PARAM.test(key)) changed = true; });
      if (changed) {
        var p = new URLSearchParams();
        url.searchParams.forEach(function (val, key) { p.append(key, SECRET_PARAM.test(key) ? "REDACTED" : val); });
        url.search = p.toString();
      }
      return clip(url.href, 1000);
    } catch (e) { return clip(u, 1000); }
  }
  function shortUrl(u) {
    try { var url = new URL(redactUrl(u), location.href); return url.origin === location.origin ? url.pathname + url.search + url.hash : url.host + url.pathname; }
    catch (e) { return String(u); }
  }

  // ------------------------------------------------------------------ records
  function push(sev, eventName, body, attributes) {
    if (!on) return;
    try {
      var s = SEV[sev] || SEV.info;
      var rec = { timeUnixNano: nowNano(), severityNumber: s[0], severityText: s[1], eventName: eventName, body: { stringValue: clip(body == null ? "" : body, MAX_BODY) }, attributes: attributes || [] };
      buf.push({ s: session.id, r: rec });
      if (buf.length >= 200) flush();
      else if (!flushTimer) flushTimer = setTimeout(flush, 250);
      if (ui) ui.bump();
    } catch (e) { say("could not record", e); }
  }

  var FORMAT = /%[sdifoOjc%]/;
  function consoleRecord(method, args) {
    var parts = [], fields = {}, extra = [], err = null, i = 0, objKeys = [];
    if (typeof args[0] === "string" && FORMAT.test(args[0])) {
      // printf-style: %s %d %i %f substitute, %o %O %j take an object, %c drops a CSS argument
      var rest = args.slice(1), used = 0;
      var text = args[0].replace(/%([sdifoOjc%])/g, function (all, c) {
        if (c === "%") return "%";
        if (used >= rest.length) return all;
        var a = rest[used++];
        if (c === "c") return "";
        if (c === "d" || c === "i") return String(parseInt(a, 10));
        if (c === "f") return String(parseFloat(a));
        if (c === "s") return String(a);
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      });
      parts.push(text);
      args = rest.slice(used);
    } else {
      args = args.slice();
    }
    for (i = 0; i < args.length; i++) {
      var a = args[i];
      if (a === null || (typeof a !== "object" && typeof a !== "function")) { parts.push(String(a)); continue; }
      if (a instanceof Error) { if (!err) err = a; else extra.push(["arg" + i, a]); continue; }
      var special = Array.isArray(a) || a instanceof Map || a instanceof Set || a instanceof Date || a instanceof RegExp ||
        typeof a === "function" || (typeof Node !== "undefined" && a instanceof Node) || a === window || ArrayBuffer.isView(a) ||
        (typeof Event !== "undefined" && a instanceof Event) || (typeof Promise !== "undefined" && a instanceof Promise);
      if (special) { extra.push(["arg" + i, a]); continue; }
      var keys;
      try { keys = Object.keys(a); } catch (e) { keys = []; }
      for (var k = 0; k < keys.length && k < MAX_ITEMS; k++) {
        var key = keys[k], val;
        try { val = a[key]; } catch (e) { val = "[getter threw]"; }
        if (Object.prototype.hasOwnProperty.call(fields, key)) key = "arg" + i + "." + key;
        fields[key] = val;
        objKeys.push(keys[k]);
      }
    }
    var out = [];
    for (var f in fields) out.push(kv(f, fields[f]));
    for (var x = 0; x < extra.length; x++) out.push(kv(extra[x][0], extra[x][1]));
    if (err) out.push(kv("exception.type", err.name), kv("exception.message", err.message), kv("exception.stacktrace", clip(err.stack || "", 4000)));
    if (method === "trace") out.push(kv("code.stacktrace", clip((new Error().stack || "").split("\n").slice(3).join("\n"), 4000)));
    var body = parts.join(" ");
    if (!body && err) body = err.name + ": " + err.message;
    if (!body && objKeys.length) body = "{" + objKeys.slice(0, 12).join(", ") + (objKeys.length > 12 ? ", …" : "") + "}";
    if (!body && extra.length) body = extra.map(function (e) { return summarize(e[1]); }).join(" ");
    return { body: body, attributes: out };
  }
  function summarize(v) {
    try {
      if (Array.isArray(v)) return "[Array(" + v.length + ")]";
      if (typeof Node !== "undefined" && v instanceof Node) return describeNode(v);
      if (v instanceof Map) return "[Map(" + v.size + ")]";
      if (v instanceof Set) return "[Set(" + v.size + ")]";
      if (v instanceof Date) return isNaN(v) ? "Invalid Date" : v.toISOString();
      if (typeof Event !== "undefined" && v instanceof Event) return "[" + v.type + " event]";
      if (typeof v === "function") return "[Function " + (v.name || "anonymous") + "]";
      return Object.prototype.toString.call(v);
    } catch (e) { return "[unreadable]"; }
  }

  // ------------------------------------------------------------------ patches, installed on first start
  function patch() {
    if (patched) return;
    patched = true;
    Object.keys(CONSOLE_SEV).forEach(function (method) {
      var orig = console[method];
      if (typeof orig !== "function") return;
      console[method] = function () {
        if (on) {
          try {
            var args = [].slice.call(arguments);
            if (method === "assert") {
              if (args[0]) return orig.apply(this, arguments);
              args = args.slice(1);
              var r0 = consoleRecord(method, args);
              push("error", "console.assert", "Assertion failed" + (r0.body ? ": " + r0.body : ""), r0.attributes);
            } else {
              var r = consoleRecord(method, args);
              push(CONSOLE_SEV[method], "console." + method, r.body, r.attributes);
            }
          } catch (e) { say("console capture failed", e); }
        }
        return orig.apply(this, arguments);
      };
    });

    addEventListener("error", function (e) {
      if (!on) return;
      var t = e.target;
      if (t && t !== window && t.nodeType === 1) {
        var url = t.currentSrc || t.src || t.href || "";
        push("error", "error.resource", t.tagName.toLowerCase() + " failed to load: " + shortUrl(url), attrs({ "url.full": redactUrl(url), "html.element": describeNode(t) }));
        return;
      }
      var er = e.error;
      push("error", "error.uncaught", e.message || (er && er.message) || "Uncaught error", attrs({
        "exception.type": er && er.name, "exception.message": er ? er.message : e.message,
        "exception.stacktrace": er && er.stack ? clip(er.stack, 4000) : undefined,
        "code.filepath": e.filename ? redactUrl(e.filename) : undefined, "code.lineno": e.lineno || undefined, "code.column": e.colno || undefined,
      }));
    }, true);
    addEventListener("unhandledrejection", function (e) {
      if (!on) return;
      var r = e.reason, isErr = r instanceof Error;
      push("error", "error.rejection", "Unhandled rejection: " + (isErr ? r.name + ": " + r.message : clip(typeof r === "string" ? r : safeJson(r), 500)), attrs({
        "exception.type": isErr ? r.name : typeof r, "exception.message": isErr ? r.message : undefined,
        "exception.stacktrace": isErr && r.stack ? clip(r.stack, 4000) : undefined,
      }).concat(isErr ? [] : [kv("reason", r)]));
    });
    addEventListener("securitypolicyviolation", function (e) {
      push("warn", "csp.violation", (e.effectiveDirective || e.violatedDirective) + " blocked " + (e.blockedURI || "inline code"), attrs({
        "csp.directive": e.effectiveDirective || e.violatedDirective, "csp.blocked_uri": redactUrl(e.blockedURI), "csp.disposition": e.disposition,
        "code.filepath": e.sourceFile ? redactUrl(e.sourceFile) : undefined, "code.lineno": e.lineNumber || undefined,
      }));
    });
    document.addEventListener("visibilitychange", function () {
      push("info", "page.visibility", "page " + document.visibilityState, attrs({ "page.visibility": document.visibilityState }));
      if (document.visibilityState === "hidden") flush();
    });
    // an IndexedDB write started while the page unloads is often dropped, so the last unsaved records go to
    // localStorage, which writes synchronously; the next load of this script moves them into IndexedDB
    addEventListener("pagehide", function () { if (on) stash(); });
    var nav = function (how) { return function () { push("info", "page.navigation", how + " " + shortUrl(location.href), attrs({ "url.full": redactUrl(location.href), "navigation.type": how })); }; };
    ["pushState", "replaceState"].forEach(function (k) {
      var orig = history[k];
      if (typeof orig !== "function") return;
      history[k] = function () { var r = orig.apply(this, arguments); nav(k)(); return r; };
    });
    addEventListener("popstate", nav("popstate"));
    addEventListener("hashchange", nav("hashchange"));

    // fetch: the page gets the same promise it would have got; the log reads the outcome alongside
    if (typeof window.fetch === "function") {
      var nativeFetch = window.fetch;
      window.fetch = function (input, init) {
        var p = nativeFetch.apply(this, arguments);
        if (!on || !opts.network) return p;
        try {
          var t0 = performance.now();
          var method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
          var url = typeof input === "string" ? input : input && input.url ? input.url : String(input);
          p.then(function (res) {
            var ms = Math.round(performance.now() - t0), len = res.headers.get("content-length");
            push(res.ok ? "info" : "warn", "http.fetch", method + " " + shortUrl(url) + " → " + res.status + " (" + ms + " ms)", attrs({
              "http.request.method": method, "url.full": redactUrl(url), "http.response.status_code": res.status,
              "http.response.body.size": len ? +len : undefined, "http.response.content_type": res.headers.get("content-type") || undefined,
              "duration_ms": ms, "http.response.type": res.type,
            }));
          }, function (err) {
            var ms = Math.round(performance.now() - t0);
            push(err && err.name === "AbortError" ? "warn" : "error", "http.fetch", method + " " + shortUrl(url) + " failed: " + (err && err.message) + " (" + ms + " ms)", attrs({
              "http.request.method": method, "url.full": redactUrl(url), "error.type": err && err.name, "exception.message": err && err.message, "duration_ms": ms,
            }));
          }).catch(function (e) { say("fetch capture failed", e); });
        } catch (e) { say("fetch capture failed", e); }
        return p;
      };
    }
    if (typeof XMLHttpRequest === "function") {
      var XP = XMLHttpRequest.prototype, xOpen = XP.open, xSend = XP.send;
      XP.open = function (method, url) { this.__agentLog = { method: String(method || "GET").toUpperCase(), url: String(url) }; return xOpen.apply(this, arguments); };
      XP.send = function () {
        var meta = this.__agentLog, xhr = this;
        if (on && opts.network && meta) {
          meta.t0 = performance.now();
          xhr.addEventListener("loadend", function () {
            var ms = Math.round(performance.now() - meta.t0), st = xhr.status;
            push(st === 0 ? "error" : st >= 400 ? "warn" : "info", "http.xhr", meta.method + " " + shortUrl(meta.url) + " → " + (st || "failed") + " (" + ms + " ms)", attrs({
              "http.request.method": meta.method, "url.full": redactUrl(meta.url), "http.response.status_code": st || undefined,
              "error.type": st === 0 ? "network error or aborted" : undefined, "duration_ms": ms,
            }));
          });
        }
        return xSend.apply(this, arguments);
      };
    }
  }
  function safeJson(v) { try { return JSON.stringify(v); } catch (e) { return String(v); } }

  // ------------------------------------------------------------------ storage
  function req(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function done(tx) { return new Promise(function (res, rej) { tx.oncomplete = res; tx.onerror = tx.onabort = function () { rej(tx.error); }; }); }
  function openDb() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      var r;
      try { r = indexedDB.open(DB_NAME, 1); } catch (e) { rej(e); return; }
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains("records")) d.createObjectStore("records", { autoIncrement: true });
        if (!d.objectStoreNames.contains("sessions")) d.createObjectStore("sessions", { keyPath: "id" });
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
      r.onblocked = function () { rej(new Error("IndexedDB is blocked by another tab")); };
    }).then(function (d) { db = d; return rescue(d).then(function () { return d; }); }, function (e) { say("IndexedDB unavailable, keeping the log in memory for this page only:", e && e.message); db = null; return null; });
    return dbp;
  }
  function stash() {
    clearTimeout(flushTimer); flushTimer = 0;
    try {
      var prev = JSON.parse(localStorage.getItem(PENDING) || "null") || { sessions: [], records: [] };
      if (session && !prev.sessions.some(function (x) { return x.id === session.id; })) prev.sessions.push(session);
      prev.records = prev.records.concat(buf).slice(-2000);
      localStorage.setItem(PENDING, JSON.stringify(prev));
      buf = [];
    } catch (e) { flush(); }
  }
  // records and sessions a previous page stashed on unload; moved into the database once it is open
  function rescue(d) {
    if (!d) return Promise.resolve();
    var raw = null, prev = null;
    try { raw = localStorage.getItem(PENDING); prev = JSON.parse(raw || "null"); if (raw) localStorage.removeItem(PENDING); } catch (e) {}
    if (!prev) return Promise.resolve();
    // taken out of localStorage first, so two callers cannot both move it; put back if the write fails
    var putBack = function () { try { if (!localStorage.getItem(PENDING)) localStorage.setItem(PENDING, raw); } catch (e) {} };
    try {
      var tx = d.transaction(["records", "sessions"], "readwrite");
      (prev.sessions || []).forEach(function (x) { tx.objectStore("sessions").put(x); });
      (prev.records || []).forEach(function (x) { tx.objectStore("records").add(x); });
      return done(tx).then(function () { stored += (prev.records || []).length; }, putBack);
    } catch (e) { putBack(); return Promise.resolve(); }
  }
  function flush() {
    clearTimeout(flushTimer); flushTimer = 0;
    if (!buf.length) return Promise.resolve();
    var batch = buf; buf = [];
    if (!db) {
      // before the database opens, or without one
      return openDb().then(function (d) {
        if (d) { buf = batch.concat(buf); return flush(); }
        mem = mem.concat(batch);
        if (mem.length > opts.max) mem.splice(0, mem.length - opts.max);
        stored = mem.length;
      });
    }
    try {
      var tx = db.transaction("records", "readwrite"), st = tx.objectStore("records");
      for (var i = 0; i < batch.length; i++) st.add(batch[i]);
      stored += batch.length;
      return done(tx).then(function () { if (stored > opts.max * 1.1) return prune(); }).catch(function (e) { say("write failed", e); });
    } catch (e) { say("write failed", e); return Promise.resolve(); }
  }
  function prune() {
    var tx = db.transaction("records", "readwrite"), st = tx.objectStore("records");
    return req(st.count()).then(function (n) {
      stored = n;
      var excess = n - opts.max;
      if (excess <= 0) return;
      return req(st.getAllKeys(null, excess)).then(function (keys) {
        if (keys.length) st.delete(IDBKeyRange.bound(keys[0], keys[keys.length - 1]));
        stored = n - keys.length;
        return done(tx);
      });
    }).catch(function (e) { say("prune failed", e); });
  }
  function countStored() {
    if (!db) return Promise.resolve(mem.length + buf.length);
    return req(db.transaction("records").objectStore("records").count()).then(function (n) { stored = n; return n + buf.length; });
  }
  function getAll(store) { return db ? req(db.transaction(store).objectStore(store).getAll()) : Promise.resolve(store === "sessions" ? (session ? [session] : []) : mem); }
  // newest first, at most `limit`, optionally only the current page load
  function recent(limit, onlyThis) {
    return flush().then(function () { return rescue(db); }).then(function () {
      if (!db) return mem.filter(function (x) { return !onlyThis || x.s === session.id; }).slice(-limit).reverse();
      return new Promise(function (res, rej) {
        var out = [], cur = db.transaction("records").objectStore("records").openCursor(null, "prev");
        cur.onsuccess = function () {
          var c = cur.result;
          if (!c || out.length >= limit) { res(out); return; }
          if (!onlyThis || c.value.s === session.id) out.push(c.value);
          c.continue();
        };
        cur.onerror = function () { rej(cur.error); };
      });
    });
  }

  // ------------------------------------------------------------------ export
  function resourceOf(s) {
    return { attributes: attrs({
      "service.name": s.host || "unknown", "session.id": s.id, "url.full": s.url, "page.title": s.title,
      "user_agent.original": s.ua, "browser.language": s.lang, "browser.viewport": s.viewport,
      "agentlog.version": s.version, "agentlog.started_by": s.via, "agentlog.started_at": s.startedAt,
    }) };
  }
  function exportOtlp() {
    // rescue: a page restored from the back-forward cache never reloads the script, so its stash is picked up here
    return flush().then(function () { return rescue(db); }).then(function () { return Promise.all([getAll("sessions"), getAll("records")]); }).then(function (got) {
      var sessions = got[0], records = got[1], by = {}, order = [];
      for (var i = 0; i < records.length; i++) {
        var x = records[i];
        if (!by[x.s]) { by[x.s] = []; order.push(x.s); }
        by[x.s].push(x.r);
      }
      var meta = {}, byTime = function (a, b) { return a.timeUnixNano.length - b.timeUnixNano.length || (a.timeUnixNano < b.timeUnixNano ? -1 : a.timeUnixNano > b.timeUnixNano ? 1 : 0); };
      sessions.forEach(function (s) { meta[s.id] = s; });
      order.forEach(function (id) { by[id].sort(byTime); });
      return {
        resourceLogs: order.map(function (id) {
          return {
            resource: resourceOf(meta[id] || { id: id }),
            scopeLogs: [{ scope: { name: "agent-log", version: VERSION }, logRecords: by[id] }],
          };
        }),
      };
    });
  }
  function exportJSON() { return exportOtlp().then(function (o) { return JSON.stringify(o); }); }
  function fileName() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return "agent-log-" + (location.host || "file").replace(/[^\w.-]+/g, "_") + "-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + ".json";
  }
  function download() {
    return exportJSON().then(function (text) {
      var a = document.createElement("a"), url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
      a.href = url; a.download = fileName(); a.style.display = "none";
      (document.body || document.documentElement).appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      return text.length;
    });
  }
  function copy() {
    return exportJSON().then(function (text) {
      var fallback = function () {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-9999px;top:0";
        (document.body || document.documentElement).appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) {}
        ta.remove();
        if (!ok) throw new Error("the browser refused to copy; use Download instead");
        return text.length;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return text.length; }, fallback);
      return fallback();
    });
  }
  function clear() {
    buf = []; mem = []; stored = 0;
    if (!db) { if (ui) ui.refresh(); return Promise.resolve(); }
    var tx = db.transaction(["records", "sessions"], "readwrite");
    tx.objectStore("records").clear(); tx.objectStore("sessions").clear();
    if (session && on) tx.objectStore("sessions").put(session);
    return done(tx).then(function () { if (ui) ui.refresh(); });
  }

  // ------------------------------------------------------------------ on and off
  function setFlag(v) { try { if (v) sessionStorage.setItem(FLAG, "1"); else sessionStorage.removeItem(FLAG); } catch (e) {} }
  function getFlag() { try { return sessionStorage.getItem(FLAG) === "1"; } catch (e) { return false; } }

  function start(o) {
    o = o || {};
    if (o.max) opts.max = Math.max(100, +o.max | 0);
    if (o.network != null) opts.network = !!o.network;
    setFlag(true);
    if (on) { if (ui) ui.open(); return api; }
    patch();
    on = true;
    session = {
      id: newId(), host: location.host || location.protocol.replace(":", ""), url: redactUrl(location.href), title: document.title,
      ua: navigator.userAgent, lang: navigator.language, viewport: innerWidth + "x" + innerHeight + "@" + (window.devicePixelRatio || 1),
      version: VERSION, via: o.via || "api", startedAt: new Date().toISOString(),
    };
    push("info", "agentlog.start", "logging started (" + session.via + ") on " + shortUrl(location.href), attrs({ "url.full": session.url, "agentlog.started_by": session.via }));
    openDb().then(function (d) {
      if (d) { var tx = d.transaction("sessions", "readwrite"); tx.objectStore("sessions").put(session); }
      return countStored();
    }).then(function () { showUi(); });
    return api;
  }
  function stop() {
    if (!on) { setFlag(false); return Promise.resolve(); }
    push("info", "agentlog.stop", "logging stopped");
    var f = flush();
    on = false;
    setFlag(false);
    if (ui) ui.remove();
    ui = null;
    return f;
  }

  // ------------------------------------------------------------------ badge and viewer (shadow DOM, so page CSS can't reach it)
  var CSS = [
    ":host{all:initial}",
    "[hidden]{display:none!important}",
    "*{box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}",
    ".wrap{position:fixed;bottom:10px;z-index:2147483647;display:flex;flex-direction:column;gap:6px;max-width:calc(100vw - 20px)}",
    ".wrap.r{right:10px;align-items:flex-end}.wrap.l{left:10px;align-items:flex-start}",
    ".pill{display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:999px;border:1px solid #6b1d1d;background:#1d1d1f;color:#f3f3f3;font:600 12px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3)}",
    ".pill:hover{background:#2b2b2e}",
    ".dot{width:9px;height:9px;border-radius:50%;background:#e5383b;animation:p 1.6s ease-in-out infinite}",
    "@keyframes p{50%{opacity:.35}}@media (prefers-reduced-motion:reduce){.dot{animation:none}}",
    ".n{font-variant-numeric:tabular-nums;color:#bbb;font-weight:400}",
    ".panel{width:min(760px,calc(100vw - 20px));height:min(70vh,560px);display:flex;flex-direction:column;background:#fbfbfa;color:#1d1d1f;border:1px solid #c9c7c2;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,.28);overflow:hidden;font-size:13px}",
    ".bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px;border-bottom:1px solid #dedcd7;background:#f1f0ec}",
    ".bar b{font-size:13px;margin-right:4px}.bar .sp{flex:1}",
    "button.b{font:12px/1 ui-sans-serif,system-ui,sans-serif;padding:6px 9px;border:1px solid #c9c7c2;border-radius:5px;background:#fff;color:#1d1d1f;cursor:pointer}",
    "button.b:hover{border-color:#8a2b2b}button.b.warn{color:#8a2b2b}",
    "input,select{font:12px ui-sans-serif,system-ui,sans-serif;padding:5px 7px;border:1px solid #c9c7c2;border-radius:5px;background:#fff;color:#1d1d1f}",
    "input{flex:1;min-width:120px}",
    ".msg{padding:4px 8px;color:#555;font-size:12px;min-height:22px;border-bottom:1px solid #eee}",
    ".list{flex:1;overflow:auto;font:11.5px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}",
    ".row{padding:3px 8px;border-bottom:1px solid #eeede9;white-space:pre-wrap;word-break:break-word}",
    ".row .t{color:#888}.row .e{color:#2d6477}.row .a{color:#6a6a6a;display:block;max-height:4.4em;overflow:hidden}",
    ".row.WARN{background:#fff8e6}.row.ERROR,.row.FATAL{background:#fdecec}.row.DEBUG,.row.TRACE{color:#666}",
    ".foot{padding:6px 8px;font-size:11.5px;color:#666;border-top:1px solid #dedcd7}.foot a{color:#2d6477}",
    "@media (prefers-color-scheme:dark){.panel{background:#1f2023;color:#e8e8ea;border-color:#3a3b40}.bar{background:#26272b;border-color:#3a3b40}",
    "button.b,input,select{background:#2c2d31;color:#e8e8ea;border-color:#45464c}.row{border-color:#2c2d31}.msg{color:#aaa;border-color:#2c2d31}",
    ".row.WARN{background:#3a3214}.row.ERROR,.row.FATAL{background:#3a1717}.row .a{color:#9a9aa2}.row .e{color:#7fb3c7}.foot{color:#999;border-color:#3a3b40}.foot a{color:#7fb3c7}}",
  ].join("");

  function flatAttrs(list) {
    var o = {};
    (list || []).forEach(function (a) { o[a.key] = plain(a.value); });
    return o;
  }
  function plain(v) {
    if (!v) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("intValue" in v) return Number(v.intValue);
    if ("doubleValue" in v) return v.doubleValue;
    if ("boolValue" in v) return v.boolValue;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(plain);
    if ("kvlistValue" in v) return flatAttrs(v.kvlistValue.values);
    return null;
  }

  // pages that enforce Trusted Types refuse plain strings in innerHTML; a named policy passes the UI's own markup
  var ttPolicy;
  function trusted(html) {
    if (ttPolicy === undefined) {
      ttPolicy = null;
      try { if (window.trustedTypes && trustedTypes.createPolicy) ttPolicy = trustedTypes.createPolicy("agent-log", { createHTML: function (x) { return x; } }); } catch (e) {}
    }
    return ttPolicy ? ttPolicy.createHTML(html) : html;
  }
  function showUi() {
    try { buildUi(); } catch (e) {
      ui = null;
      say("the badge could not be shown on this page (" + (e && e.message) + "); logging continues. Use AgentLog.download() or AgentLog.copy() from the console.");
    }
  }
  function buildUi() {
    if (ui || !on) return;
    var host = document.createElement("agent-log-ui");
    host.setAttribute("data-agent-log", VERSION);
    var root = host.attachShadow({ mode: "open" });
    var corner = "r";
    try { corner = localStorage.getItem(CORNER) === "l" ? "l" : "r"; } catch (e) {}
    // a constructed stylesheet is not subject to the page's style-src CSP; an inline <style> is the fallback
    var sheet = null;
    try { sheet = new CSSStyleSheet(); sheet.replaceSync(CSS); root.adoptedStyleSheets = [sheet]; } catch (e) { sheet = null; }
    root.innerHTML = trusted((sheet ? "" : "<style>" + CSS + "</style>") +
      '<div class="wrap ' + corner + '">' +
      '<div class="panel" hidden>' +
      '<div class="bar"><b>Agent Log</b><input type="search" placeholder="filter: text, event, attribute" aria-label="Filter the log">' +
      '<select aria-label="Severity"><option value="0">all</option><option value="9">info+</option><option value="13">warn+</option><option value="17">errors</option></select>' +
      '<select aria-label="Which page loads"><option value="all">all page loads</option><option value="this">this page load</option></select></div>' +
      '<div class="bar"><button class="b" data-a="download">Download</button><button class="b" data-a="copy">Copy</button>' +
      '<button class="b warn" data-a="clear">Clear</button><button class="b warn" data-a="stop">Stop logging</button><span class="sp"></span>' +
      '<button class="b" data-a="corner" title="Move to the other corner">⇆</button><button class="b" data-a="close" title="Close">✕</button></div>' +
      '<div class="msg" role="status"></div><div class="list"></div>' +
      '<div class="foot">Stored in this browser only, for this site. Hand the download to your agent. <a target="_blank" rel="noopener" href="' + HOME + '">How it works</a></div>' +
      "</div>" +
      '<button class="pill" title="Agent Log is recording this page. Click to view or export."><span class="dot"></span>Logging <span class="n"></span></button>' +
      "</div>");
    var $ = function (s) { return root.querySelector(s); };
    var wrap = $(".wrap"), panel = $(".panel"), pill = $(".pill"), n = $(".n"), list = $(".list"), msg = $(".msg");
    var filter = $("input"), sevSel = $("select"), scopeSel = root.querySelectorAll("select")[1];
    var lastBump = 0, bumpTimer = 0, refreshTimer = 0;
    var setCount = function (c) { n.textContent = c.toLocaleString(); };
    var note = function (t) { msg.textContent = t; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var time = function (nano) { var d = new Date(Number(nano.slice(0, -6))); return d.toLocaleTimeString([], { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0"); };

    function render() {
      var q = filter.value.trim().toLowerCase(), minSev = +sevSel.value, only = scopeSel.value === "this";
      return recent(q || minSev ? 5000 : 400, only).then(function (rows) {
        var html = [], shown = 0;
        for (var i = 0; i < rows.length && shown < 400; i++) {
          var r = rows[i].r;
          if (r.severityNumber < minSev) continue;
          var a = r.attributes && r.attributes.length ? JSON.stringify(flatAttrs(r.attributes)) : "";
          var line = r.eventName + " " + r.body.stringValue + " " + a;
          if (q && line.toLowerCase().indexOf(q) < 0) continue;
          shown++;
          html.push('<div class="row ' + r.severityText + '"><span class="t">' + time(r.timeUnixNano) + "</span> " + r.severityText.padEnd(5) +
            ' <span class="e">' + esc(r.eventName) + "</span> " + esc(r.body.stringValue) + (a ? '<span class="a">' + esc(a) + "</span>" : "") + "</div>");
        }
        list.innerHTML = trusted(html.join("") || '<div class="row">Nothing recorded yet' + (q || minSev ? " that matches" : "") + ".</div>");
        countStored().then(function (c) { setCount(c); note(c.toLocaleString() + (c === 1 ? " record" : " records") + " stored" + (db ? "" : " (in memory only: IndexedDB is unavailable here)") + "; showing the newest " + shown + (q || minSev ? " that match" : "") + "."); });
      });
    }
    function act(name) {
      if (name === "close") { panel.hidden = true; return; }
      if (name === "corner") {
        corner = corner === "r" ? "l" : "r"; wrap.className = "wrap " + corner;
        try { localStorage.setItem(CORNER, corner); } catch (e) {}
        return;
      }
      if (name === "download") return download().then(function (len) { note("Downloaded " + fileName().replace(/-\d{8}-\d{6}/, "-…") + " (" + Math.round(len / 1024) + " KB)."); }, function (e) { note("Download failed: " + e.message); });
      if (name === "copy") return copy().then(function (len) { note("Copied " + Math.round(len / 1024) + " KB of OTLP JSON to the clipboard."); }, function (e) { note("Copy failed: " + e.message); });
      if (name === "clear") { if (confirm("Delete every Agent Log record stored for " + (location.host || "this page") + "?")) clear().then(render); return; }
      if (name === "stop") stop();
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button");
      if (!b) return;
      if (b === pill) { panel.hidden = !panel.hidden; if (!panel.hidden) render(); return; }
      if (b.dataset.a) act(b.dataset.a);
    });
    filter.addEventListener("input", function () { clearTimeout(refreshTimer); refreshTimer = setTimeout(render, 200); });
    sevSel.addEventListener("change", render);
    scopeSel.addEventListener("change", render);

    ui = {
      bump: function () {
        var t = Date.now();
        if (t - lastBump < 500) { if (!bumpTimer) bumpTimer = setTimeout(function () { bumpTimer = 0; ui && ui.bump(); }, 500); return; }
        lastBump = t;
        setCount(stored + buf.length);
        if (!panel.hidden && !filter.value) { clearTimeout(refreshTimer); refreshTimer = setTimeout(render, 300); }
      },
      refresh: function () { setCount(stored + buf.length); if (!panel.hidden) render(); },
      open: function () { panel.hidden = false; render(); },
      close: function () { panel.hidden = true; },
      remove: function () { host.remove(); },
    };
    setCount(stored + buf.length);
    (document.body || document.documentElement).appendChild(host);
    if (!document.body) document.addEventListener("DOMContentLoaded", function () { if (host.isConnected) document.body.appendChild(host); });
  }

  var api = {
    version: VERSION,
    get on() { return on; },
    get session() { return session ? session.id : null; },
    start: start,
    stop: stop,
    export: exportOtlp,
    exportJSON: exportJSON,
    download: download,
    copy: copy,
    clear: clear,
    open: function () { if (!on) start({ via: "api" }); else if (ui) ui.open(); },
    close: function () { if (ui) ui.close(); },
  };
  window.AgentLog = api;

  // ------------------------------------------------------------------ decide whether to start
  var q = null;
  try { q = new URLSearchParams(location.search).get("logging"); } catch (e) {}
  if (q !== null && /^(false|0|off|no)$/i.test(q)) setFlag(false);
  else if (q !== null) start({ via: "query" });
  else if ((src && src.searchParams.has("start")) || window.AGENT_LOG_START) {
    start({ via: (src && src.searchParams.get("start")) || (typeof window.AGENT_LOG_START === "string" ? window.AGENT_LOG_START : "bookmarklet") });
  }
  else if (me && me.hasAttribute && me.hasAttribute("data-start")) start({ via: "page" });
  else if (getFlag()) start({ via: "remembered" });
})();
