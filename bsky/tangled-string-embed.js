/**
 * tangled-string-embed.js — gist.github.com-style embeds for Tangled "strings"
 *
 * Renders any sh.tangled.string record (Tangled's pastebin/gist lexicon)
 * inline on a page, fetched client-side from the author's PDS. No backend.
 *
 * Usage, gist-style (script tag replaces itself with the snippet):
 *   <script src="https://austegard.com/bsky/tangled-string-embed.js"
 *           data-string="at://aesth.lol/sh.tangled.string/3mprqkpefan22"></script>
 *
 * data-string accepts any of:
 *   at://HANDLE_OR_DID/sh.tangled.string/RKEY
 *   https://tangled.org/strings/HANDLE/RKEY
 *   HANDLE/RKEY
 *
 * Alternative, container mode (one shared script, many embeds):
 *   <script src=".../tangled-string-embed.js" defer></script>
 *   <div data-tangled-string="aesth.lol/3mprqkpefan22"></div>
 *
 * Syntax highlighting via a vendored highlight.js build, lazy-loaded once and only
 * if an embed is present; falls back to plain <pre> if the CDN fails.
 *
 * @license MIT
 * @version 1.0.0
 */

(() => {
  'use strict';

  const BSKY_API = 'https://public.api.bsky.app/xrpc';
  const PLC_DIRECTORY = 'https://plc.directory';
  const COLLECTION = 'sh.tangled.string';
  const HLJS_BASE = 'https://austegard.com/bsky';  /* vendored — no third-party CDN in the XSS surface */

  // filename extension → highlight.js language id
  const EXT_LANG = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript', py: 'python', rb: 'ruby', rs: 'rust',
    go: 'go', java: 'java', c: 'c', h: 'c', cpp: 'cpp', hpp: 'cpp', cs: 'csharp',
    php: 'php', swift: 'swift', kt: 'kotlin', sh: 'bash', bash: 'bash',
    zsh: 'bash', ps1: 'powershell', sql: 'sql', html: 'xml', htm: 'xml',
    xml: 'xml', svg: 'xml', css: 'css', scss: 'scss', less: 'less',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'ini', ini: 'ini',
    md: 'markdown', markdown: 'markdown', dockerfile: 'dockerfile',
    makefile: 'makefile', lua: 'lua', r: 'r', pl: 'perl', ex: 'elixir',
    exs: 'elixir', erl: 'erlang', hs: 'haskell', clj: 'clojure', scala: 'scala',
    dart: 'dart', zig: 'zig', nix: 'nix', vim: 'vim', diff: 'diff',
    patch: 'diff', graphql: 'graphql', proto: 'protobuf', tf: 'ini',
  };

  /** Parse a data-string reference into { actor, rkey } or null. */
  function parseRef(input) {
    if (!input) return null;
    input = input.trim();
    let m = input.match(/^at:\/\/([^/]+)\/sh\.tangled\.string\/([^/?#\s]+)/);
    if (m) return { actor: m[1], rkey: m[2] };
    m = input.match(/tangled\.(?:org|sh)\/strings\/([^/?#\s]+)\/([^/?#\s]+)/);
    if (m) return { actor: m[1], rkey: m[2] };
    m = input.match(/^([a-zA-Z0-9.:_-]+)\/([a-zA-Z0-9.~-]+)$/);
    if (m) return { actor: m[1], rkey: m[2] };
    return null;
  }

  function langFor(filename) {
    const name = (filename || '').toLowerCase();
    if (name === 'dockerfile') return 'dockerfile';
    if (name === 'makefile') return 'makefile';
    const ext = name.includes('.') ? name.split('.').pop() : '';
    return EXT_LANG[ext] || null;
  }

  async function resolveDid(actor) {
    if (actor.startsWith('did:')) return actor;
    const r = await fetch(`${BSKY_API}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(actor)}`);
    if (!r.ok) throw new Error(`could not resolve handle ${actor}`);
    return (await r.json()).did;
  }

  async function resolvePds(did) {
    let doc;
    if (did.startsWith('did:plc:')) {
      const r = await fetch(`${PLC_DIRECTORY}/${did}`);
      if (!r.ok) throw new Error(`plc.directory lookup failed for ${did}`);
      doc = await r.json();
    } else if (did.startsWith('did:web:')) {
      const host = did.slice('did:web:'.length).split(':')[0];
      const r = await fetch(`https://${decodeURIComponent(host)}/.well-known/did.json`);
      if (!r.ok) throw new Error(`did:web lookup failed for ${did}`);
      doc = await r.json();
    } else {
      throw new Error(`unsupported DID method: ${did}`);
    }
    const svc = (doc.service || []).find(s => s.id === '#atproto_pds' || s.type === 'AtprotoPersonalDataServer');
    if (!svc) throw new Error(`no PDS endpoint in DID document for ${did}`);
    return svc.serviceEndpoint;
  }

  async function fetchString(actor, rkey) {
    const did = await resolveDid(actor);
    const pds = await resolvePds(did);
    const url = `${pds}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}` +
      `&collection=${COLLECTION}&rkey=${encodeURIComponent(rkey)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`getRecord failed (${r.status}) for ${actor}/${rkey}`);
    const data = await r.json();
    return { did, record: data.value };
  }

  // ── highlight.js lazy loader ──────────────────────────────────────────────
  let hljsPromise = null;
  function loadHljs() {
    if (hljsPromise) return hljsPromise;
    hljsPromise = new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${HLJS_BASE}/hljs-github.min.css`;
      link.media = '(prefers-color-scheme: light)';
      const dark = document.createElement('link');
      dark.rel = 'stylesheet';
      dark.href = `${HLJS_BASE}/hljs-github-dark.min.css`;
      dark.media = '(prefers-color-scheme: dark)';
      const script = document.createElement('script');
      script.src = `${HLJS_BASE}/hljs.vendor.js`;
      script.onload = () => resolve(window.hljs || null);
      script.onerror = () => resolve(null); // graceful: plain <pre>
      document.head.append(link, dark, script);
    });
    return hljsPromise;
  }

  // ── rendering ─────────────────────────────────────────────────────────────
  const CSS = `
  .tangled-string {
    border: 1px solid #d0d7de;
    border-radius: 8px;
    margin: 1em 0;
    font-size: 0.85em;
    overflow: hidden;
    background: #ffffff;
  }
  .tangled-string-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5em;
    padding: 0.5em 0.9em;
    background: #f6f8fa;
    border-bottom: 1px solid #d0d7de;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .tangled-string-header a.tangled-string-filename {
    font-weight: 600;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: #0969da;
    text-decoration: none;
  }
  .tangled-string-header a.tangled-string-filename:hover { text-decoration: underline; }
  .tangled-string-desc { color: #57606a; flex: 1 1 auto; min-width: 0; }
  .tangled-string-attrib {
    margin-left: auto;
    color: #57606a;
    font-size: 0.9em;
    white-space: nowrap;
  }
  .tangled-string-attrib a { color: inherit; }
  .tangled-string pre {
    margin: 0;
    padding: 0.9em;
    overflow-x: auto;
    background: transparent;
  }
  .tangled-string code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.95em;
    background: transparent;
    padding: 0;
  }
  .tangled-string-error {
    padding: 0.75em 0.9em;
    color: #a40e26;
    font-family: ui-monospace, monospace;
    font-size: 0.85em;
  }
  @media (prefers-color-scheme: dark) {
    .tangled-string { border-color: #30363d; background: #0d1117; }
    .tangled-string-header { background: #161b22; border-color: #30363d; }
    .tangled-string-header a.tangled-string-filename { color: #58a6ff; }
    .tangled-string-desc, .tangled-string-attrib { color: #8b949e; }
    .tangled-string-error { color: #ff7b72; }
  }`;

  let cssInjected = false;
  function injectCss() {
    if (cssInjected) return;
    cssInjected = true;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function render(container, ref, did, record) {
    injectCss();
    const tangledUrl = `https://tangled.org/strings/${ref.actor}/${ref.rkey}`;

    const box = document.createElement('div');
    box.className = 'tangled-string';

    const header = document.createElement('div');
    header.className = 'tangled-string-header';

    const fname = document.createElement('a');
    fname.className = 'tangled-string-filename';
    fname.href = tangledUrl;
    fname.target = '_blank';
    fname.rel = 'noopener';
    fname.textContent = record.filename || '(untitled)';
    header.appendChild(fname);

    if (record.description) {
      const desc = document.createElement('span');
      desc.className = 'tangled-string-desc';
      desc.textContent = record.description;
      header.appendChild(desc);
    }

    const attrib = document.createElement('span');
    attrib.className = 'tangled-string-attrib';
    attrib.append('by ');
    const author = document.createElement('a');
    author.href = `https://tangled.org/strings/${ref.actor}`;
    author.target = '_blank';
    author.rel = 'noopener';
    author.textContent = ref.actor.startsWith('did:') ? did : ref.actor;
    attrib.appendChild(author);
    header.appendChild(attrib);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = record.contents; // textContent = safe, no HTML injection
    pre.appendChild(code);

    box.append(header, pre);
    container.replaceChildren(box);

    const lang = langFor(record.filename);
    loadHljs().then(hljs => {
      if (!hljs) return;
      if (lang && hljs.getLanguage(lang)) code.className = `language-${lang}`;
      try { hljs.highlightElement(code); } catch { /* plain text is fine */ }
    });
  }

  function renderError(container, msg) {
    injectCss();
    const box = document.createElement('div');
    box.className = 'tangled-string';
    const err = document.createElement('div');
    err.className = 'tangled-string-error';
    err.textContent = `tangled-string-embed: ${msg}`;
    box.appendChild(err);
    container.replaceChildren(box);
  }

  async function embed(container, refInput) {
    const ref = parseRef(refInput);
    if (!ref) { renderError(container, `could not parse reference "${refInput}"`); return; }
    try {
      const { did, record } = await fetchString(ref.actor, ref.rkey);
      render(container, ref, did, record);
    } catch (e) {
      renderError(container, e.message || String(e));
    }
  }

  // ── entry points ──────────────────────────────────────────────────────────

  // Gist-style: this <script> tag carries data-string; replace it in place.
  const self = document.currentScript;
  if (self && self.dataset.string) {
    const holder = document.createElement('div');
    self.parentNode.insertBefore(holder, self);
    embed(holder, self.dataset.string);
  }

  // Container mode: hydrate any [data-tangled-string] elements.
  function scan() {
    document.querySelectorAll('[data-tangled-string]:not([data-tangled-string-done])')
      .forEach(el => {
        el.setAttribute('data-tangled-string-done', '');
        embed(el, el.getAttribute('data-tangled-string'));
      });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }
})();
