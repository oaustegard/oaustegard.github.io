import fs from 'fs';
import { pipeline } from '@huggingface/transformers';
import * as core from '../mix-core.js';
const [actor = 'austegard.com', N = '100', kw = ''] = process.argv.slice(2);
const cat = JSON.parse(fs.readFileSync('../catalog.json'));
const T = core.decodeTagVectors(cat);
let texts = [];
if (kw) texts = [kw];
else {
  let cursor; 
  while (texts.length < +N) {
    const u = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed');
    u.searchParams.set('actor', actor); u.searchParams.set('limit', '100'); u.searchParams.set('filter', 'posts_with_replies');
    if (cursor) u.searchParams.set('cursor', cursor);
    const d = await (await fetch(u)).json();
    for (const it of d.feed) { if (it.reason || it.post.author.handle !== actor) continue; const t = core.postText(it.post); if (t.length > 15) texts.push(t); }
    cursor = d.cursor; if (!cursor) break;
  }
  texts = texts.slice(0, +N);
}
const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' });
const P = [];
for (let i = 0; i < texts.length; i += 32) { const t = await embed(texts.slice(i, i + 32), { pooling: 'mean', normalize: true }); for (let j = 0; j < t.dims[0]; j++) P.push(t.data.slice(j * 384, (j + 1) * 384)); }
const prof = core.tagProfile(P, T, cat.tagStats);
console.log('posts', texts.length);
for (const { j, w } of core.topTags(prof.weights, 15)) {
  const ev = prof.evidence[j][0];
  console.log((w * 100).toFixed(1).padStart(5), cat.tags[j].id.padEnd(22), ev ? texts[ev[0]].slice(0, 90) : '');
}
const sel = core.selectTracks(cat, prof.weights, { n: 25, seed: 7 });
for (const s of sel) { const t = cat.tracks[s.index]; console.log('  ', `${t.a} — ${t.ti}`.padEnd(55), cat.tags[s.why].id); }
