// Embeds tag descriptions with the same model + dtype the page uses, and the
// per-tag mean/std of cosine similarity over a Jetstream sample of English posts.
import fs from 'fs';
import { pipeline } from '@huggingface/transformers';
const [tagsPath, bgPath, outPath] = process.argv.slice(2);
const tags = JSON.parse(fs.readFileSync(tagsPath));
const bg = JSON.parse(fs.readFileSync(bgPath));
const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' });
async function enc(texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += 64) {
    const t = await embed(texts.slice(i, i + 64), { pooling: 'mean', normalize: true });
    const d = t.dims[1];
    for (let j = 0; j < t.dims[0]; j++) out.push(Array.from(t.data.slice(j * d, (j + 1) * d)));
  }
  return out;
}
const T = await enc(tags.map(t => `${t.label}: ${t.desc}`));
const B = await enc(bg);
const stats = T.map(tv => {
  const s = B.map(bv => bv.reduce((a, x, k) => a + x * tv[k], 0));
  const m = s.reduce((a, b) => a + b, 0) / s.length;
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - m) ** 2, 0) / s.length);
  return [m, sd];
});
// int8 quantize, one scale per vector
const q = T.map(v => { const mx = Math.max(...v.map(Math.abs)); return { s: mx / 127, b: Buffer.from(Int8Array.from(v.map(x => Math.round(x / (mx / 127)))).buffer).toString('base64') }; });
fs.writeFileSync(outPath, JSON.stringify({ model: 'Xenova/all-MiniLM-L6-v2', dtype: 'q8', dim: T[0].length, vec: q, stats }));
console.log('ok', T.length, 'tags; bg', B.length, 'mean of means', (stats.reduce((a, s) => a + s[0], 0) / stats.length).toFixed(3));
