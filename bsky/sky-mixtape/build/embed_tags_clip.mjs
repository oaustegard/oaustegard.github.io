// Tag vectors for the photo seed: the 247 tags embedded with MobileCLIP-S0's text model, plus each tag's
// mean and spread of cosine over a sample of the Bluesky photos indexed by ../../image-search/, embedded
// with the same fp16 vision model the page runs (the int8 build is broken: it ranks techno and IDM first
// for a photo of cats, where fp16 agrees with fp32 to cosine 1.0000).
//
// usage: node embed_tags_clip.mjs [--n 3000] [--template both|label|label-desc] [--out ../image-tags.json]
//                                 [--try PHOTO ...]   (print each photo's top tags under every template)
// needs: npm i @huggingface/transformers@4.3.1 (in this directory; node_modules is gitignored)
import { AutoTokenizer, AutoProcessor, CLIPTextModelWithProjection, CLIPVisionModelWithProjection, RawImage }
  from '@huggingface/transformers';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ID = 'Xenova/mobileclip_s0', VISION_DTYPE = 'fp16';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const N = +arg('n', 3000), TEMPLATE = arg('template', 'both'), OUT = arg('out', join(HERE, '..', 'image-tags.json'));
const TRY = process.argv.includes('--try') ? process.argv.slice(process.argv.indexOf('--try') + 1) : [];
const CACHE = arg('cache', null); // optional file for the background photo vectors, to rerun without refetching

// CLIP's text side was trained on captions. 'label' phrases the tag as one; 'label-desc' adds the
// description (written in the words posts use, cut at CLIP's 77 tokens); 'both' averages the two.
const TEMPLATES = {
  label: [t => `a photo of ${t.label.toLowerCase()}`],
  'label-desc': [t => `${t.label}: ${t.desc}`],
  both: [t => `a photo of ${t.label.toLowerCase()}`, t => `${t.label}: ${t.desc}`],
};

const unit = v => { let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1; return Float32Array.from(v, x => x / n); };
const dot = (a, b) => { let s = 0; for (let k = 0; k < a.length; k++) s += a[k] * b[k]; return s; };

const tags = JSON.parse(readFileSync(join(HERE, 'tags.json'), 'utf8'));
const cat = JSON.parse(readFileSync(join(HERE, '..', 'catalog.json'), 'utf8'));
if (tags.map(t => t.id).join() !== cat.tags.map(t => t.id).join()) throw new Error('tags.json and catalog.json disagree');

const tok = await AutoTokenizer.from_pretrained(ID);
const textModel = await CLIPTextModelWithProjection.from_pretrained(ID, { dtype: 'fp32' });
let D = 0;
async function tagVectors(name) {
  const per = [];
  for (const f of TEMPLATES[name]) {
    const { text_embeds: e } = await textModel(tok(tags.map(f), { padding: 'max_length', truncation: true }));
    D = e.dims[1];
    per.push(tags.map((_, j) => unit(e.data.subarray(j * D, (j + 1) * D))));
  }
  return tags.map((_, j) => unit(per[0][j].map((_, k) => per.reduce((s, P) => s + P[j][k], 0))));
}
const TV = {};
for (const name of Object.keys(TEMPLATES)) TV[name] = await tagVectors(name);
const T = TV[TEMPLATE];

const processor = await AutoProcessor.from_pretrained(ID);
const vision = await CLIPVisionModelWithProjection.from_pretrained(ID, { dtype: VISION_DTYPE });
const embedImage = async img => unit((await vision(await processor(img))).image_embeds.data);

// Background: a fixed, evenly spaced sample of the image-search rows (thumbnails from Bluesky's CDN).
const idx = JSON.parse(readFileSync(join(HERE, '..', '..', 'image-search', 'data', 'rows.json'), 'utf8'));
const step = idx.rows.length / N;
const sample = Array.from({ length: N }, (_, i) => idx.rows[Math.floor(i * step)]);
const BG = [];
let done = 0, failed = 0;
const t0 = Date.now();
async function worker(queue) {
  for (let r; (r = queue.shift());) {
    const [a, , cid] = r;
    try {
      const res = await fetch(`https://cdn.bsky.app/img/feed_thumbnail/plain/${idx.authors[a][0]}/${cid}`);
      if (!res.ok) throw new Error(res.status);
      BG.push(await embedImage(await RawImage.fromBlob(await res.blob())));
    } catch { failed++; }
    if (++done % 250 === 0) console.error(`${done}/${N} (${failed} failed) ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
}
if (CACHE && existsSync(CACHE)) {
  const f = new Float32Array(readFileSync(CACHE).buffer.slice(0));
  for (let i = 0; i < f.length / D; i++) BG.push(f.subarray(i * D, (i + 1) * D));
} else {
  const queue = [...sample];
  await Promise.all(Array.from({ length: 8 }, () => worker(queue)));
  if (CACHE) { const f = new Float32Array(BG.length * D); BG.forEach((v, i) => f.set(v, i * D)); writeFileSync(CACHE, Buffer.from(f.buffer)); }
}

const statsFor = TT => TT.map(t => {
  const col = BG.map(v => dot(v, t)), m = col.reduce((a, b) => a + b, 0) / col.length;
  const sd = Math.sqrt(col.reduce((a, b) => a + (b - m) ** 2, 0) / col.length);
  return [+m.toFixed(5), +sd.toFixed(5)];
});
const stats = statsFor(T);
const tagVec = T.map(v => {
  let mx = 0; for (const x of v) mx = Math.max(mx, Math.abs(x));
  const s = mx / 127;
  return { s, b: Buffer.from(Int8Array.from(v, x => Math.round(x / s)).buffer).toString('base64') };
});
writeFileSync(OUT, JSON.stringify({
  model: ID, visionDtype: VISION_DTYPE, dim: D, template: TEMPLATE,
  background: `${BG.length} Bluesky photos sampled from ../image-search`, tagVec, tagStats: stats }));
console.error(`ok: ${tags.length} tags, ${BG.length} background photos (${failed} failed), mean sim ${
  (stats.reduce((a, s) => a + s[0], 0) / stats.length).toFixed(3)}, mean sd ${(stats.reduce((a, s) => a + s[1], 0) / stats.length).toFixed(4)} -> ${OUT}`);

for (const p of TRY) {
  const v = await embedImage(await RawImage.read(p));
  for (const [name, TT] of Object.entries(TV)) {
    const st = statsFor(TT);
    const z = TT.map((t, j) => [(dot(v, t) - st[j][0]) / st[j][1], tags[j].id]).sort((a, b) => b[0] - a[0]);
    console.log(`${p.split('/').pop().slice(0, 24)} [${name}]`, z.slice(0, 10).map(([x, id]) => `${id}(${x.toFixed(1)})`).join(', '));
  }
}
