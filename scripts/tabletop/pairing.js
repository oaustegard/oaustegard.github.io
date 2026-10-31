// DOM helpers for pairing phones at a table game: draw a link as a QR code, copy or share it, scan a
// code with the camera, and keep the screen awake. QR encode and decode come from the vendored
// qrcode-generator and jsQR scripts (/scripts/vendor/), which the page loads as classic scripts.

const sleep = ms => new Promise(r => setTimeout(r, ms));

export const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Draws `text` as a QR code into `img` and shows `wrap`; hides `wrap` if the text is too long or the
// encoder is missing. Returns whether a code was drawn.
export function renderQR(img, wrap, text) {
  if (typeof qrcode !== 'function' || text.length > 1000) { wrap.hidden = true; return false; }
  try { const qr = qrcode(0, 'L'); qr.addData(text); qr.make(); img.src = qr.createDataURL(6, 3); wrap.hidden = false; return true; }
  catch { wrap.hidden = true; return false; }
}

export async function copyText(text, statusEl) {
  try { await navigator.clipboard.writeText(text); if (statusEl) statusEl.textContent = 'Copied.'; return true; }
  catch { if (statusEl) statusEl.innerHTML = 'Copy failed; select it here:<div class="mono">' + escapeHtml(text) + '</div>'; return false; }
}

// The share sheet where there is one; otherwise an SMS draft, with the link also copied.
export async function shareLink(title, msg, url, statusEl) {
  if (navigator.share) { try { await navigator.share({ title, text: msg, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  location.href = 'sms:?&body=' + encodeURIComponent(msg + ' ' + url);
  setTimeout(() => copyText(url, statusEl), 400);
}

// Camera QR scanner. Builds its own full-screen overlay on first use, so a page needs no markup for it.
let overlay = null, scanStream = null, scanning = false;
function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.hidden = true;
  overlay.style.cssText = 'position:fixed;inset:0;z-index:1000;background:#000;display:grid;place-items:center';
  overlay.innerHTML = '<video playsinline muted style="width:100%;height:100%;object-fit:cover"></video>' +
    '<div style="position:absolute;top:calc(env(safe-area-inset-top,0px) + 20px);left:16px;right:16px;text-align:center;color:#fff;text-shadow:0 1px 3px #000;font:15px system-ui,sans-serif">Hold the code up to the camera</div>' +
    '<div style="position:absolute;left:0;right:0;bottom:0;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 16px);display:flex;justify-content:center;background:linear-gradient(transparent,rgba(0,0,0,.8))">' +
    '<button type="button" class="btn" style="min-width:120px;height:46px;border-radius:12px">Cancel</button></div>';
  overlay.querySelector('button').onclick = stopScan;
  document.body.appendChild(overlay);
  return overlay;
}
export async function scanQR(onText) {
  const hasBD = 'BarcodeDetector' in window;
  if (!navigator.mediaDevices?.getUserMedia || (!hasBD && typeof jsQR !== 'function')) { alert('Camera scanning is not available here; paste the link instead.'); return; }
  try { scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); }
  catch (e) { alert('No camera: ' + e.message); return; }
  const ov = ensureOverlay(), video = ov.querySelector('video');
  video.srcObject = scanStream; await video.play().catch(() => {});
  ov.hidden = false;
  scanning = true;
  const bd = hasBD ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
  const cv = document.createElement('canvas'), g = cv.getContext('2d', { willReadFrequently: true });
  while (scanning) {
    await sleep(160);
    if (!video.videoWidth) continue;
    let text = null;
    try {
      if (bd) { const r = await bd.detect(video); if (r[0]) text = r[0].rawValue; }
      else {
        const w = Math.min(720, video.videoWidth), h = Math.round(w * video.videoHeight / video.videoWidth);
        cv.width = w; cv.height = h; g.drawImage(video, 0, 0, w, h);
        const r = jsQR(g.getImageData(0, 0, w, h).data, w, h); if (r) text = r.data;
      }
    } catch {}
    if (text) { stopScan(); onText(text); return; }
  }
}
export function stopScan() {
  scanning = false;
  if (overlay) overlay.hidden = true;
  if (scanStream) scanStream.getTracks().forEach(t => t.stop());
  scanStream = null;
}

// Screen wake lock, re-taken when the page comes back into view (the browser drops it on hide).
let wake = null;
export async function keepAwake() {
  try { if ('wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch {}
}
// Calls `fn` each time the page becomes visible again: re-take the wake lock and nudge the peer connections.
export function onResume(fn) {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fn(); });
}
