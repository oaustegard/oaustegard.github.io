/* ============================================================
   FileDrop app.js (DOM glue)

   Extracted/refactored from fd.html's inline module. All WebRTC/SDP
   transport now lives in signaling.js; all chunked/verified file
   transfer lives in transfer.js; all disk/RAM landing lives in
   storage.js. This module keeps everything DOM-shaped: role
   selection on load, QR render + in-page camera scan, acoustic
   signaling wiring, the reconnect panel, copy buttons, per-file
   progress rows, wake lock, and the drag/drop + folder-pick UI.

   See scripts/fd/PROTOCOL.md for the wire protocol this file's
   Sender/Receiver usage is pinned against.

   ---- Signaling API this file was written against ----
   scripts/fd/signaling.js landed with this exact shape (see that
   file's header comment for the authoritative version):
     new Signaling(opts?)                         .iceServers etc auto-derived
     .on(event, cb)
       'code'          ({kind:'invite'|'answer', code, link})
       'channelopen'   (RTCDataChannel)   - hand to transfer.js via wrapRtcChannel
       'channelmessage'(data)             - unused here (transfer.js reads the
                                            channel directly via its own adapter)
       'channelclose'  ()
       'statechange'   ({kind, state?})   kinds: ice, connected, disconnected,
                                           closed, connecting, reconnecting, dead
       'error'         (Error)
     .isInviter, .wasConnected, .pc (public, used only for the
       'have-local-offer' signalingState guard the scan/paste UI needs)
     .createInvite() -> Promise<{code, link}>
     .applyAnswer(codeOrLink) -> Promise<true>  (throws on failure)
     .answerInvite(codeOrLink) -> Promise<{code, link}>
     .resetPeer()
     .reconnectAsInviter() -> Promise<{code, link}>
     .reconnectAsScanner()
     .checkAfterResume()   - call from a visibilitychange handler
   ============================================================ */

import { Signaling } from './signaling.js';
import { Sender, Receiver } from './transfer.js';
import { MemorySink, FsaSink, storageAvailable } from './storage.js';
import { wrapRtcChannel } from './rtc-channel.js';

const $ = (id) => document.getElementById(id);
const setStatus = (t, ok) => { const s = $('status'); s.textContent = t; s.className = ok ? 'ok' : ''; };
const showErr = (t) => { const e = $('err'); e.textContent = t; e.classList.add('on'); console.error('[filedrop]', t); };
const clearErr = () => $('err').classList.remove('on');

function formatBytes(n) {
  if (!Number.isFinite(n)) return '?';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return (i === 0 ? n : n.toFixed(1)) + ' ' + units[i];
}

/* ---------- QR / camera / wake-lock capability flags ----------
   All optional. Missing any one degrades to the copy/paste path;
   nothing here is required for the link-and-click signaling to work. */
const HAS_QR_ENC = (typeof qrcode === 'function');           /* vendored qrcode-generator */
const HAS_CAMERA = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const QR_MAX_CHARS = 1000;   /* beyond this a screen-to-camera scan is unreliable; hide the QR */
let barcodeDetector = null;  /* set below if the native API supports qr_code (Chrome/Android) */
const HAS_JSQR = (typeof jsQR === 'function');               /* vendored jsQR (Safari fallback) */
const HAS_DIR_PICKER = (() => {
  try { return 'webkitdirectory' in document.createElement('input'); } catch (e) { return false; }
})();

(async () => {
  try {
    if ('BarcodeDetector' in window) {
      const fmts = await window.BarcodeDetector.getSupportedFormats();
      if (fmts.includes('qr_code')) barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
    }
  } catch (e) { barcodeDetector = null; }
})();
/* a reply can be scanned in-page iff we have a camera AND some decoder */
const canScan = () => HAS_CAMERA && (barcodeDetector !== null || HAS_JSQR);

if (!HAS_DIR_PICKER && $('btn-pick-dir')) $('btn-pick-dir').hidden = true;

/* ---------- screen wake lock (iOS Safari 16.4+, Chrome, etc.) ----------
   The QR must stay on-screen for the peer to scan, and the transfer
   should not be interrupted by the display sleeping. Re-acquired when the
   tab returns to the foreground, since iOS drops the lock on blur. */
let wakeLock = null;
let wakeWanted = false;
async function keepAwake() {
  wakeWanted = true;
  try {
    if ('wakeLock' in navigator && wakeLock === null && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) { /* rejected (e.g. low battery) - not fatal */ }
}
function releaseAwake() {
  wakeWanted = false;
  try { if (wakeLock) wakeLock.release(); } catch (e) {}
  wakeLock = null;
}
document.addEventListener('visibilitychange', () => {
  if (wakeWanted && wakeLock === null && document.visibilityState === 'visible') keepAwake();
});

/* ---------- render a code as a scannable QR ----------
   Encodes the FULL url (invite or reply) so a phone camera app opens it
   directly and the copy-link fallback stays identical. EC level L keeps
   the module count low; format-2 codes land around 240-300 bytes = a
   ~type-11 QR, comfortably scannable off a phone screen. */
function renderQR(imgEl, blockEl, text) {
  if (!HAS_QR_ENC || !imgEl || !blockEl) return;
  if (text.length > QR_MAX_CHARS) { blockEl.hidden = true; return; }
  try {
    const qr = qrcode(0, 'L');   /* type 0 = auto-fit smallest version */
    qr.addData(text);
    qr.make();
    imgEl.src = qr.createDataURL(8, 4);   /* 8px cells, 4-module quiet zone */
    blockEl.hidden = false;
  } catch (e) {
    console.log('[qr] encode failed - falling back to link only:', e.message);
    blockEl.hidden = true;
  }
}

/* human-readable line about which wire format the code took.
   (sdp-codec.js/signaling.js own the pack-fail diagnostic internally now;
   app.js only sees the finished code, so this is length + format only.) */
function describeCode(code, link) {
  const f = code[0];
  const base = link.length + ' chars, format ' + f;
  if (f === '2') return base + ' (packed SDP - compact)';
  if (f === '1') return base + ' (deflated fallback)';
  return base + ' (plain fallback)';
}

/* ================================================================
   Signaling: connection lifecycle, SDP code exchange, reconnect.
   ================================================================ */

const signaling = new Signaling();

let isInviter = false;

function showInvite(link) {
  const code = (link.split('#o=')[1] || '').split('&')[0];
  $('invite-text').value = link;
  $('invite-code-info').textContent = describeCode(code, link);
  $('invite-out').hidden = false;
  $('s-step2').hidden = false;
  $('gather-hint').hidden = true;
  renderQR($('invite-qr'), $('invite-qr-block'), link);
  if (canScan()) { $('btn-scan-reply').hidden = false; $('btn-connect').classList.remove('primary'); }
  keepAwake();   /* their camera needs this screen lit to read the invite QR */
  setStatus('Invite ready — waiting for the reply link');
  if (link.length > 8000) {
    showErr('Invite link is unusually long (' + link.length + ' chars); if your ' +
            'IM truncates it, send the text below as a code instead and have ' +
            'the recipient open the page and append it to the URL after #o=');
  }
}

function showReply(link) {
  const code = (link.split('#a=')[1] || '').split('&')[0];
  $('answer-out').value = link;
  $('reply-code-info').textContent = describeCode(code, link);
  $('btn-copy-answer').disabled = false;
  $('answer-hint').textContent = 'Click it, or let them scan the code below. Leave this page open.';
  renderQR($('reply-qr'), $('reply-qr-block'), link);
  keepAwake();   /* the sender scans this screen - keep it lit */
  setStatus('Reply ready — waiting for sender to connect');
}

async function createInvite() {
  clearErr();
  $('btn-create').disabled = true;
  $('gather-hint').hidden = false;
  setStatus('Gathering…');
  try {
    isInviter = true;
    const { link } = await signaling.createInvite();
    showInvite(link);
    listenForReply();
  } catch (e) {
    showErr('Could not create invite: ' + e.message);
    $('btn-create').disabled = false;
    $('gather-hint').hidden = true;
    setStatus('Idle');
  }
}

async function applyAnswer(codeIn) {
  clearErr();
  try {
    await signaling.applyAnswer(codeIn);
    $('btn-connect').disabled = true;
    setStatus('Connecting…');
    return true;
  } catch (e) {
    showErr('Could not apply the reply: ' + e.message);
    return false;
  }
}

async function answerInvite(code) {
  isInviter = false;
  $('sender-flow').hidden = true;
  $('receiver-flow').hidden = false;
  setStatus('Answering…');
  try {
    const { link } = await signaling.answerInvite(code);
    showReply(link);
    /* strip the offer from the address bar so a reload does not
       try to answer a consumed offer */
    history.replaceState(null, '', location.pathname + location.search);
  } catch (e) {
    showErr('Could not answer the invite: ' + e.message);
    setStatus('Failed');
  }
}

/* ---------- reply-link bridge (BroadcastChannel) ----------
   A clicked reply link opens a NEW tab, but the pending offer lives in
   the ORIGINAL invite tab's memory (inside `signaling`). The new tab is a
   courier: it broadcasts the answer on a same-origin channel; the invite
   tab applies it and acks; the courier then tells the user it can be
   closed. This bridging is page-lifecycle glue, not transport, so it
   stays here rather than in signaling.js. */

const BC_NAME = 'filedrop-manual-signal';
let bc = null;

function listenForReply() {
  if (typeof BroadcastChannel !== 'function') {
    console.log('[bridge] BroadcastChannel unavailable - paste fallback only');
    return;
  }
  bc = new BroadcastChannel(BC_NAME);
  bc.onmessage = async (ev) => {
    const d = ev.data;
    if (!d || d.t !== 'answer') return;
    console.log('[bridge] reply received via broadcast');
    const ok = await applyAnswer(d.code);
    if (ok) bc.postMessage({ t: 'ack' });
  };
}

async function courierDeliver(code) {
  $('sender-flow').hidden = true;
  $('courier-flow').hidden = false;
  setStatus('Delivering…');
  const fallback = () => {
    $('courier-title').textContent = 'Reply not delivered';
    $('courier-msg').hidden = true;
    $('courier-fallback').hidden = false;
    $('courier-code').value = code;
    setStatus('Manual step needed');
  };
  if (typeof BroadcastChannel !== 'function') { fallback(); return; }
  const ch = new BroadcastChannel(BC_NAME);
  const acked = new Promise((resolve) => {
    ch.onmessage = (ev) => { if (ev.data && ev.data.t === 'ack') resolve(true); };
    setTimeout(() => resolve(false), 1500);
  });
  ch.postMessage({ t: 'answer', code: code });
  if (await acked) {
    $('courier-title').textContent = 'Reply delivered';
    $('courier-msg').textContent = 'The connection is completing in your original ' +
      'FileDrop tab. You can close this tab.';
    setStatus('Delivered ✓', true);
  } else {
    fallback();
  }
  ch.close();
}

/* ---------- reconnect UI ----------
   Shown when an established connection dies (e.g. iOS app switch).
   signaling.js does the ICE-restart-over-channel attempt first; this
   panel only appears once it gives up and emits statechange:'dead'. */

function hideReconnect() { $('reconnect').hidden = true; }

function onConnectionDead() {
  setStatus('Disconnected');
  releaseAwake();
  if (activeRecvRows) activeRecvRows.forEach(({ row }) => row.set('Interrupted — waiting to reconnect…', 'bad'));
  if (activeSendRows) activeSendRows.forEach((row) => row && row.set('Interrupted — will resume after reconnecting', 'bad'));
  pendingOffer = null;
  $('toast').classList.remove('on');
  $('reconnect').hidden = false;
  if (canScan()) $('btn-reconn-scan').hidden = false;
  if (FDAcoustic.canListen) $('btn-ac-reconn-listen').hidden = false;
  $('reconnect').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function reconnectAsInviter() {
  hideReconnect();
  $('receiver-flow').hidden = true;
  $('sender-flow').hidden = false;
  $('invite-out').hidden = true;
  $('s-step2').hidden = true;
  $('btn-create').disabled = false;
  $('btn-connect').disabled = false;
  isInviter = true;
  signaling.reconnectAsInviter()
    .then(({ link }) => { showInvite(link); listenForReply(); })
    .catch((e) => showErr('Could not create invite: ' + e.message));
  $('sender-flow').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function reconnectAsScanner() {
  hideReconnect();
  signaling.reconnectAsScanner();
  startScan('invite');
}

/* iOS resume: events were frozen while suspended, so signaling's own
   state handlers may never have fired. Ask it to check directly. */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  setTimeout(() => signaling.checkAfterResume(), 1200);   /* give a surviving connection a beat to report itself */
});

/* ================================================================
   Transfer: wire signaling's open channel to transfer.js's
   Sender/Receiver, and those to storage.js's sink + the file rows.
   ================================================================ */

let sender = null;
let receiver = null;
let sink = null;
let firstChannel = true;

let pendingOffer = null;     // { offer, accept, decline } awaiting user's accept/decline click
let activeRecvRows = null;   // Map<fid, { row, meta }> for the in-flight incoming collection
let activeSendRows = null;   // Array<row> (indexed by fid order) for the in-flight outgoing batch
let sendBusy = false;
let sendQueueBatches = [];   // [{ items, rows }] queued while a send is already in flight

function newFileRow(name, size) {
  const el = document.createElement('div');
  el.className = 'file-row';
  el.innerHTML = '<div class="f-line"><span class="f-name"></span>' +
                 '<span class="f-size"></span><span class="f-status"></span></div>' +
                 '<div class="bar-wrap"><div class="bar"></div></div>';
  el.querySelector('.f-name').textContent = name;
  el.querySelector('.f-size').textContent = formatBytes(size);
  $('files').prepend(el);
  const bar = el.querySelector('.bar');
  const status = el.querySelector('.f-status');
  return {
    set(text, cls) {
      status.textContent = text;
      status.className = 'f-status' + (cls ? ' ' + cls : '');
      if (cls === 'ok') { el.classList.add('done'); bar.style.width = '100%'; }
      if (cls === 'bad') bar.style.width = '0%';
    },
    progress(done, total, verb) {
      const pct = total ? Math.round(done / total * 100) : 0;
      bar.style.width = pct + '%';
      status.textContent = verb + ' ' + formatBytes(done) + ' / ' + formatBytes(total) + ' · ' + pct + '%';
    }
  };
}

function seedRecvRows(files) {
  const map = new Map();
  for (const f of files) {
    const row = newFileRow(f.name, f.size);
    row.set('Receiving…');
    map.set(f.fid, { row, meta: f });
  }
  return map;
}

function wireReceiver(recv) {
  recv.onOffer((offer, accept, decline) => {
    if (pendingOffer) { decline(); return; }   /* one collection at a time, mirrors old single-file gate */
    pendingOffer = { offer, accept, decline };
    const multi = offer.files.length !== 1;
    $('toast-title').textContent = 'Incoming ' + (multi ? 'files' : 'file');
    $('toast-file').textContent = multi
      ? offer.files.length + ' files · ' + formatBytes(offer.totalSize)
      : offer.files[0].name + ' · ' + formatBytes(offer.files[0].size);
    $('toast').classList.add('on');
  });

  recv.on('progress', ({ fid, receivedBytes, sentBytes, totalBytes }) => {
    const entry = activeRecvRows && activeRecvRows.get(fid);
    if (!entry) return;
    const done = receivedBytes != null ? receivedBytes : (sentBytes || 0);
    entry.row.progress(done, totalBytes || entry.meta.size, 'Receiving');
  });

  recv.on('file', ({ fid, blob }) => {
    const entry = activeRecvRows && activeRecvRows.get(fid);
    if (!entry) return;
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = entry.meta.name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      entry.row.set('Received, verified ✓ — saved to your Downloads folder', 'ok');
    } else {
      entry.row.set('Received, verified ✓ — saved to disk', 'ok');
    }
  });

  recv.on('done', () => { activeRecvRows = null; });

  recv.on('error', (err) => {
    showErr('Receive failed: ' + (err && err.message ? err.message : err));
    if (activeRecvRows) activeRecvRows.forEach(({ row }) => row.set('Failed', 'bad'));
  });
}

function wireSender(snd) {
  snd.on('progress', ({ fid, sentBytes, totalBytes }) => {
    const row = activeSendRows && activeSendRows[fid];
    if (row) row.progress(sentBytes, totalBytes, 'Sending');
  });
  snd.on('done', () => {
    if (activeSendRows) activeSendRows.forEach((row) => row && row.set('Sent ✓', 'ok'));
    activeSendRows = null;
    sendBusy = false;
    drainSendQueue();
  });
  snd.on('declined', () => {
    if (activeSendRows) activeSendRows.forEach((row) => row && row.set('Declined by peer', 'bad'));
    activeSendRows = null;
    sendBusy = false;
    drainSendQueue();
  });
  snd.on('error', (err) => {
    showErr('Send failed: ' + (err && err.message ? err.message : err));
    if (activeSendRows) activeSendRows.forEach((row) => row && row.set('Failed', 'bad'));
    activeSendRows = null;
    sendBusy = false;
    drainSendQueue();
  });
}

signaling.on('channelopen', (dc) => {
  clearErr();
  hideReconnect();
  setStatus('Connected ✓', true);
  $('sender-flow').hidden = true;
  $('receiver-flow').hidden = true;
  $('transfer').classList.add('on');
  keepAwake();   /* keep the display alive for the duration of the transfer */

  const adapter = wrapRtcChannel(dc);

  if (firstChannel) {
    firstChannel = false;
    /* Feature 3: stream to disk via File System Access when available so
       large transfers skip the ~2 GiB in-RAM cap; MemorySink is the
       fallback (and the only option for the sender-side blob-in-RAM path
       today, since nothing here needs to read files from disk to send). */
    sink = storageAvailable() ? new FsaSink() : new MemorySink();
    sender = new Sender(adapter);
    receiver = new Receiver(adapter, sink);
    wireSender(sender);
    wireReceiver(receiver);
  } else {
    /* Reconnect: same Sender/Receiver instances, rebound to the fresh
       channel. Per PROTOCOL.md they resume in-flight state (resend/receive
       only the gap) rather than restarting from scratch. */
    if (sender) sender.resume(adapter);
    if (receiver) receiver.resume(adapter);
  }
});

signaling.on('channelclose', () => { releaseAwake(); });

signaling.on('statechange', (info) => {
  switch (info.kind) {
    case 'connected': setStatus('Connected ✓', true); hideReconnect(); break;
    case 'disconnected': setStatus('Disconnected'); break;
    case 'closed': setStatus('Disconnected'); break;
    case 'connecting': setStatus('Connecting…'); break;
    case 'reconnecting': setStatus('Reconnecting…'); break;
    case 'dead': onConnectionDead(); break;
    default: break;   /* 'ice' - raw iceConnectionState, no direct UI mapping needed */
  }
});

signaling.on('error', (err) => {
  const msg = err && err.message ? err.message : String(err);
  showErr(msg);
  if (/Connection failed/.test(msg)) setStatus('Failed');
});

/* ---------- outgoing send queue (single collection in flight at a time,
   mirrors the old single-file `sending`/`sendQueue` gate) ---------- */

function queueSend(items) {
  if (!sender) { showErr('Not connected.'); return; }
  if (!items.length) return;
  const rows = items.map((it) => {
    const file = it.file || it;
    const path = it.path || file.name;
    const row = newFileRow(path, file.size);
    row.set('Queued…');
    return row;
  });
  sendQueueBatches.push({ items, rows });
  drainSendQueue();
}

function drainSendQueue() {
  if (sendBusy) return;
  const next = sendQueueBatches.shift();
  if (!next) return;
  sendBusy = true;
  activeSendRows = next.rows;
  next.rows.forEach((row) => row.set('Sending…'));
  sender.send(next.items).catch((err) => {
    showErr('Send failed: ' + (err && err.message ? err.message : err));
    next.rows.forEach((row) => row.set('Failed', 'bad'));
    activeSendRows = null;
    sendBusy = false;
    drainSendQueue();
  });
}

$('accept-btn').addEventListener('click', () => {
  $('toast').classList.remove('on');
  if (!pendingOffer) return;
  const { offer, accept } = pendingOffer;
  pendingOffer = null;
  /* Wiring note from storage.js's author: FsaSink only enters directory
     mode when preferDirectory:true or a file name contains '/'. It does
     NOT infer directory mode from file count, so a >1-file flat offer
     needs preferDirectory forced on here or the user gets a save-picker
     prompt per file instead of one folder pick. */
  if (sink instanceof FsaSink) sink.preferDirectory = offer.files.length > 1;
  activeRecvRows = seedRecvRows(offer.files);
  accept();
});

$('decline-btn').addEventListener('click', () => {
  $('toast').classList.remove('on');
  if (!pendingOffer) return;
  const { decline } = pendingOffer;
  pendingOffer = null;
  decline();
});

/* ---------- feature 5: directory / multi-file send ----------
   webkitdirectory input + drag-drop of a folder both gather
   {file, path} items with the relative path preserved, so the
   receiver's FsaSink can recreate the folder structure. Falls back
   gracefully: no webkitdirectory support hides the folder button; no
   DataTransferItem.webkitGetAsEntry support drops to a flat file list. */

function itemsFromFileList(fileList) {
  return Array.from(fileList).map((f) => ({ file: f, path: f.webkitRelativePath || f.name }));
}

function walkEntry(entry, prefix, out) {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file((file) => { out.push({ file, path: prefix + entry.name }); resolve(); }, () => resolve());
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const readAll = () => {
        reader.readEntries(async (entries) => {
          if (!entries.length) { resolve(); return; }
          await Promise.all(entries.map((e) => walkEntry(e, prefix + entry.name + '/', out)));
          readAll();   /* readEntries() may need multiple calls to exhaust a large directory */
        }, () => resolve());
      };
      readAll();
    } else {
      resolve();
    }
  });
}

async function filesFromDataTransfer(dt) {
  const out = [];
  if (dt.items && dt.items.length && typeof dt.items[0].webkitGetAsEntry === 'function') {
    const entries = [];
    for (const item of dt.items) {
      const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
      if (entry) entries.push(entry);
    }
    if (entries.length) {
      await Promise.all(entries.map((e) => walkEntry(e, '', out)));
      return out;
    }
  }
  /* fallback: flat files, no folder-walk support */
  for (const f of dt.files) out.push({ file: f, path: f.name });
  return out;
}

$('btn-pick').addEventListener('click', () => {
  const inp = $('file-input');
  inp.value = '';
  inp.onchange = () => { if (inp.files.length) queueSend(itemsFromFileList(inp.files)); };
  inp.click();
});

if ($('btn-pick-dir')) {
  $('btn-pick-dir').addEventListener('click', () => {
    const inp = $('dir-input');
    if (!inp) return;
    inp.value = '';
    inp.onchange = () => { if (inp.files.length) queueSend(itemsFromFileList(inp.files)); };
    inp.click();
  });
}

const dz = $('dropzone');
dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('hover'); });
dz.addEventListener('dragleave', () => dz.classList.remove('hover'));
dz.addEventListener('drop', (e) => {
  e.preventDefault();
  dz.classList.remove('hover');
  if (!e.dataTransfer) return;
  filesFromDataTransfer(e.dataTransfer).then((items) => { if (items.length) queueSend(items); });
});

/* ================================================================
   In-page reply/invite scanner (camera).
   ================================================================ */

let scanStream = null;
let scanning = false;
let scanCanvas = null, scanCtx = null;
let scanKind = 'answer';   /* 'answer' (setup: read their reply) | 'invite' (reconnect: read their fresh invite) */

async function startScan(kind) {
  scanKind = kind || 'answer';
  clearErr();
  const panel = $('scanner'), video = $('scan-video');
  if (!canScan()) { showErr('Camera scan is unavailable here - paste the link instead.'); return; }
  if (scanKind === 'answer' && (!signaling.pc || signaling.pc.signalingState !== 'have-local-offer')) {
    showErr('No invite is pending in this tab - create an invite first.');
    return;
  }
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (e) {
    showErr('Could not open the camera: ' + e.message + '. Paste the reply link instead.');
    return;
  }
  video.srcObject = scanStream;
  video.setAttribute('playsinline', '');   /* iOS: stay inline, do not go fullscreen */
  try { await video.play(); } catch (e) {}
  panel.classList.add('on');
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  $('btn-scan-reply').disabled = true;
  $('btn-reconn-scan').disabled = true;
  $('scan-hint').textContent = scanKind === 'invite'
    ? 'Point the camera at their reconnect QR…'
    : 'Point the camera at their reply QR…';
  if (!scanCanvas) { scanCanvas = document.createElement('canvas'); scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true }); }
  scanning = true;
  keepAwake();
  tickScan();
}

function stopScan() {
  scanning = false;
  const panel = $('scanner'), video = $('scan-video');
  if (scanStream) { scanStream.getTracks().forEach((t) => t.stop()); scanStream = null; }
  if (video) video.srcObject = null;
  panel.classList.remove('on');
  $('btn-scan-reply').disabled = false;
  $('btn-reconn-scan').disabled = false;
}

async function tickScan() {
  if (!scanning) return;
  const video = $('scan-video');
  let raw = null;
  if (video && video.readyState >= 2 && video.videoWidth) {
    try {
      if (barcodeDetector) {
        const codes = await barcodeDetector.detect(video);
        if (codes && codes.length) raw = codes[0].rawValue;
      } else if (HAS_JSQR) {
        scanCanvas.width = video.videoWidth;
        scanCanvas.height = video.videoHeight;
        scanCtx.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height);
        const img = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
        const c = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (c) raw = c.data;
      }
    } catch (e) { /* transient per-frame decode error - keep scanning */ }
  }
  if (raw) { onScanned(raw); return; }
  setTimeout(tickScan, 120);   /* ~8 fps: enough to catch a held-still code, gentle on the phone */
}

async function onScanned(raw) {
  $('scan-hint').textContent = 'Code found - connecting…';
  stopScan();
  if (scanKind === 'invite') {
    /* a scanned invite is a full link; the code follows #o= */
    const s = String(raw || ''); const cut = s.indexOf('#o=');
    if (cut === -1) { showErr('That is not an invite code - have them tap "Show a reconnect code".'); return; }
    await answerInvite(s.slice(cut + 3));
    return;
  }
  await applyAnswer(raw);
}

/* ================================================================
   Acoustic signaling (half-duplex, either direction).
   Sound is a fourth transport for the SAME offer/answer codes the link,
   QR, and paste box carry. WebRTC still moves the file bytes; sound
   only ferries the tiny SDP code. Depends on the classic-script globals
   AcousticModem / FDAcoustic (scripts/fd/acoustic-modem.js, fd-acoustic.js).
   ================================================================ */

function acStatus(el, msg, cls) {
  if (!el) return;
  el.textContent = msg || '';
  el.className = 'hint' + (cls ? ' ac-' + cls : '');
}

/* route a decoded acoustic payload exactly as a scanned QR would be routed */
async function onAcousticCode(text) {
  const s = String(text || '');
  const tag = s.charAt(0), code = s.slice(1);
  if (tag === 'O') { await answerInvite(code); }
  else if (tag === 'A') { await applyAnswer(code); }
  else { showErr('Heard a signal, but it was not a FileDrop code.'); }
}

/* play button: emit tag+code, disabled while the tone sounds */
function wirePlay(btn, statusEl, tag, getCode) {
  if (!btn) return;
  if (!FDAcoustic.available) { btn.hidden = true; return; }
  btn.addEventListener('click', () => {
    const code = getCode();
    if (!code) { acStatus(statusEl, 'nothing to send yet', 'bad'); return; }
    clearErr();
    keepAwake();
    FDAcoustic.play(tag, code, {
      onstart: (secs) => { btn.disabled = true; acStatus(statusEl, 'playing… ' + secs.toFixed(1) + ' s — hold the devices close', 'busy'); },
      onend:   ()     => { btn.disabled = false; acStatus(statusEl, 'sent — the other device should have it now', 'ok'); },
      onerror: (m)    => { btn.disabled = false; acStatus(statusEl, m, 'bad'); }
    });
  });
}

/* listen button: toggle the mic; route the first clean code, then stop.
   onStart runs just before the mic opens (used to dismiss the reconnect panel). */
function wireListen(btn, statusEl, listenLabel, onStart) {
  if (!btn) return;
  if (!FDAcoustic.canListen) { btn.hidden = true; return; }
  const label = listenLabel || btn.textContent;
  btn.addEventListener('click', () => {
    if (FDAcoustic.isListening()) {
      FDAcoustic.stopListen(); btn.textContent = label; acStatus(statusEl, 'stopped', '');
      return;
    }
    clearErr();
    keepAwake();
    if (onStart) onStart();
    FDAcoustic.listen({
      onListening: () => { btn.textContent = 'Stop listening'; },
      onStatus:    (m, c) => acStatus(statusEl, m, c),
      onError:     (m) => { btn.textContent = label; acStatus(statusEl, m, 'bad'); showErr(m); },
      onCode:      async (text) => {
        FDAcoustic.stopListen();
        btn.textContent = label;
        acStatus(statusEl, 'signal received — connecting…', 'ok');
        await onAcousticCode(text);
      }
    });
  });
}

/* invite side: play the offer, listen for their reply */
wirePlay($('btn-ac-play-invite'), $('ac-invite-status'), 'O',
  () => ($('invite-text').value.split('#o=')[1] || ''));
wireListen($('btn-ac-listen-reply'), $('ac-invite-status'), 'Listen for their reply');

/* receiver side: play the reply back */
wirePlay($('btn-ac-play-reply'), $('ac-reply-status'), 'A',
  () => ($('answer-out').value.split('#a=')[1] || ''));

/* cold-start receiver (no link): listen for an invite */
wireListen($('btn-ac-listen-invite'), $('ac-listen-invite-status'), 'Listen for an invite (sound)');

/* reconnect: listen for their fresh invite (mirrors "Scan their code") */
wireListen($('btn-ac-reconn-listen'), null, 'Listen for their code', () => { hideReconnect(); signaling.reconnectAsScanner(); });

/* ================================================================
   Static UI wiring (buttons that don't depend on connection state).
   ================================================================ */

async function copyText(text, btn, doneLabel) {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = doneLabel;
    setTimeout(() => { btn.textContent = orig; }, 1600);
  } catch (e) {
    showErr('Clipboard blocked - select the text and copy manually.');
  }
}

$('btn-create').addEventListener('click', createInvite);
$('btn-copy-link').addEventListener('click', () => copyText($('invite-text').value, $('btn-copy-link'), 'Copied ✓'));
$('btn-connect').addEventListener('click', () => applyAnswer($('answer-in').value));
$('btn-scan-reply').addEventListener('click', () => startScan('answer'));
$('btn-scan-cancel').addEventListener('click', stopScan);
$('btn-reconn-invite').addEventListener('click', reconnectAsInviter);
$('btn-reconn-scan').addEventListener('click', reconnectAsScanner);
$('btn-copy-answer').addEventListener('click', () => copyText($('answer-out').value, $('btn-copy-answer'), 'Copied ✓'));
$('btn-copy-courier').addEventListener('click', () => copyText($('courier-code').value, $('btn-copy-courier'), 'Copied ✓'));

/* ---------- role selection on load ---------- */

const mo = location.hash.match(/#o=([^&]+)/);
const ma = location.hash.match(/#a=([^&]+)/);
if (mo) {
  answerInvite(mo[1]);
} else if (ma) {
  courierDeliver(ma[1]);
} else {
  console.log('[init] sender mode - create an invite to begin');
}
