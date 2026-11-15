// ?bot&log: a flight recorder for the bot, so a run on a real device can be sent back for diagnosis.
// Every game tic it keeps what the bot saw and what went to the engine; it also keeps each rollout fight
// decision with its scores, the status line every two seconds, errors, and the device and settings.
// "Send log" commits the log to the GPU-bridge repo (oaustegard/gpu-bridge-comms, doom-logs/live/) with the
// token the GPU Bridge page keeps in this browser, and comments on the bridge's wake PR so the Claude session
// watching it picks it up. Without that token it offers the file to share or save instead.

const API = "https://api.github.com", REPO = "oaustegard/gpu-bridge-comms", BRANCH = "main";
const MAX_ROWS = 35 * 60 * 15; // fifteen minutes of tics

export class BotLog {
  constructor({ version = "", note = (t) => console.log(t) } = {}) {
    const ua = navigator.userAgent;
    this.device = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "iPad"
      : /Android/.test(ua) ? "Android" : /Macintosh/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Linux";
    this.t0 = Date.now(); this.note = note;
    this.version = version || new URL(import.meta.url).searchParams.get("v") || ""; // the build stamp

    this.cols = ["tic", "x", "y", "angle", "health", "fwd", "side", "turn", "mouseturn", "fire", "use", "tics", "frameMs", "target", "fight", "busy"];
    this.rows = []; this.decisions = []; this.statuses = []; this.errors = []; this.levels = [];
    this.lastStatusAt = 0; this.lastFrame = performance.now();
    const err = (kind, e) => { if (this.errors.length < 200) this.errors.push({ t: Date.now() - this.t0, kind, msg: String(e?.stack || e?.message || e).slice(0, 600) }); };
    addEventListener("error", (e) => err("error", e.error || e.message));
    addEventListener("unhandledrejection", (e) => err("rejection", e.reason));
    const ce = console.error.bind(console);
    console.error = (...a) => { err("console", a.map((x) => x?.stack || x?.message || String(x)).join(" ")); ce(...a); };
  }

  level(name, skill) { this.levels.push({ t: Date.now() - this.t0, row: this.rows.length, map: name, skill }); }

  // one call per frame that ran tics: the input the engine got, and the bot's view of the player
  frame(input, tics, driver) {
    const now = performance.now(), dt = now - this.lastFrame; this.lastFrame = now;
    const bot = driver?.bot, p = bot?.s?.p, r = driver?.rollout, t = bot?.target;
    const f = (v, k = 1) => (v == null ? null : Math.round(v * k) / k);
    this.rows.push([p?.leveltime ?? null, f(p?.x), f(p?.y), f(p?.angle, 1000), p?.health ?? null, f(input.forward), f(input.side), f(input.turn, 1000),
      f(input.mouseturn, 1000), input.fire ? 1 : 0, input.use ? 1 : 0, tics, f(dt), t ? t.kind : "", r?.plan?.name || "", r?.busy ? 1 : 0]);
    if (this.rows.length > MAX_ROWS) this.rows.splice(0, this.rows.length - MAX_ROWS);
    if (now - this.lastStatusAt > 2000 && driver?.lastStatus) { this.lastStatusAt = now; this.statuses.push([p?.leveltime ?? null, driver.lastStatus]); }
  }

  decision(d) { if (this.decisions.length < 5000) this.decisions.push(d); }

  build(driver, extra = {}) {
    return {
      kind: "gpu-doom-bot-log", version: this.version, startedAt: new Date(this.t0).toISOString(), sentAt: new Date().toISOString(),
      url: location.href, ua: navigator.userAgent, device: this.device, screen: [innerWidth, innerHeight, devicePixelRatio],
      ...extra, levels: this.levels, cols: this.cols, rows: this.rows, decisions: this.decisions, statuses: this.statuses, errors: this.errors,
      botEvents: driver?.bot?.events?.slice(-400) || [], botStats: driver?.bot?.stats || null,
      heldFrames: driver?.held ?? null, lead: driver?.lead ?? null,
      rollout: driver?.rollout ? { decisions: driver.rollout.decisions, ms: Math.round(driver.rollout.ms), off: driver.rollout.off, opts: driver.rollout.o } : null,
    };
  }

  token() {
    for (const s of [localStorage, sessionStorage]) { try { const t = s.getItem("gpubridge:token"); if (t) return t; } catch {} }
    return null;
  }

  async gh(path, token, method = "GET", body) {
    const res = await fetch(API + path, { method, cache: "no-store", body: body ? JSON.stringify(body) : undefined,
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) } });
    if (!res.ok) throw new Error(`${method} ${path.split("?")[0]}: HTTP ${res.status}`);
    return res.status === 204 ? null : res.json();
  }

  async send(driver, extra = {}) {
    const note = (prompt("What did you see? (optional, goes with the log)") || "").slice(0, 2000);
    const json = JSON.stringify(this.build(driver, { ...extra, note }));
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19), name = `${stamp}-${(this.device || "device").toLowerCase()}.json`;
    const token = this.token();
    if (token) {
      try {
        this.note("Sending the log…");
        const R = "/repos/" + REPO, path = `doom-logs/live/${name}`;
        const blob = (await this.gh(`${R}/git/blobs`, token, "POST", { content: json, encoding: "utf-8" })).sha;
        let sha = null;
        for (let i = 0; i < 5 && !sha; i++) {
          const head = (await this.gh(`${R}/git/ref/heads/${BRANCH}`, token)).object.sha;
          const base = (await this.gh(`${R}/git/commits/${head}`, token)).tree.sha;
          const tree = (await this.gh(`${R}/git/trees`, token, "POST", { base_tree: base, tree: [{ path, mode: "100644", type: "blob", sha: blob }] })).sha;
          const c = (await this.gh(`${R}/git/commits`, token, "POST", { message: `doom-log: ${name}`, tree, parents: [head] })).sha;
          try { await this.gh(`${R}/git/refs/heads/${BRANCH}`, token, "PATCH", { sha: c, force: false }); sha = c; } catch { await new Promise((r) => setTimeout(r, 500 * (i + 1))); }
        }
        if (!sha) throw new Error("the branch kept moving");
        const pr = (await this.gh(`${R}/pulls?state=open&per_page=50`, token)).find((p) => /^wake(\/|$)/.test(p.head?.ref || ""));
        if (pr) await this.gh(`${R}/issues/${pr.number}/comments`, token, "POST",
          { body: `gpu-doom bot log: \`${path}\` at ${sha.slice(0, 7)} (${this.device}, ${this.rows.length} tics${note ? `): ${note.replace(/\s+/g, " ").slice(0, 300)}` : ")"}` });
        this.note(`Log sent: ${name}`);
        return;
      } catch (e) { this.note(`Sending failed (${e.message}); offering the file instead`); }
    }
    const file = new File([json], name, { type: "application/json" });
    try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: "gPu(doom) bot log" }); return; } } catch {}
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(file), download: name });
    document.body.append(a); a.click(); a.remove();
    this.note("Log saved as a file. Open the GPU Bridge page in this browser once so it can be sent directly next time.");
  }
}
