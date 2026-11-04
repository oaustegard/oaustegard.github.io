import fs from 'fs';
const ws = new WebSocket('wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post');
const out = []; const N = 1500;
ws.onmessage = (m) => {
  const e = JSON.parse(m.data);
  const r = e.commit?.record; if (!r || e.commit.operation !== 'create') return;
  if (!(r.langs || []).includes('en')) return;
  const t = (r.text || '').trim(); if (t.length < 40) return;
  out.push(t);
  if (out.length >= N) { fs.writeFileSync('background.json', JSON.stringify(out)); console.log('done', out.length); process.exit(0); }
};
ws.onerror = (e) => { console.error('err', e.message); process.exit(1); };
setTimeout(() => { fs.writeFileSync('background.json', JSON.stringify(out)); console.log('timeout', out.length); process.exit(0); }, 120000);
