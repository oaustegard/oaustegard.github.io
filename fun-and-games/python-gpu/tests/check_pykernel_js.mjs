// The JavaScript port must do exactly what vendor/pykernel.py does on every corpus case:
// the same WGSL byte for byte and the same manifest, or the same error text and line.
//
//   node tests/check_pykernel_js.mjs [-v]
//
// Regenerate the corpus after a compiler change: python3 tests/make_corpus.py
import { readFileSync } from "node:fs";
import { translateSource, KernelError } from "../pykernel.js";

const verbose = process.argv.includes("-v");
const corpus = JSON.parse(readFileSync(new URL("./pykernel_corpus.json", import.meta.url)));
let pass = 0;
const fails = [];
for (const c of corpus) {
  let got;
  try {
    const spec = translateSource(c.src, { name: c.name, firstLine: c.first_line });
    got = { wgsl: spec.wgsl, manifest: spec.manifest() };
  } catch (e) {
    got = e instanceof KernelError ? { error: e.message, line: e.line } : { crash: String(e && e.stack || e) };
  }
  const same = JSON.stringify(got) === JSON.stringify(c.expect);
  if (same) pass++;
  else fails.push({ origin: c.origin, src: c.src, expect: c.expect, got });
}
for (const f of fails) {
  console.log(`FAIL ${f.origin}`);
  if (verbose) {
    console.log("  src:\n" + f.src.replace(/^/gm, "    "));
    console.log("  expect: " + JSON.stringify(f.expect).slice(0, 600));
    console.log("  got:    " + JSON.stringify(f.got).slice(0, 600));
  }
}
console.log(`${pass}/${corpus.length} corpus cases identical to vendor/pykernel.py`);
process.exit(fails.length ? 1 : 0);
