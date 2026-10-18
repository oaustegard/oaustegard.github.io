// Asserts for translateModule (pykernel.js), which has no Python counterpart: the WGSL it
// returns is checked against the corpus entries for the same kernels, and the rest pins the
// top-level rules and line numbers. Run: node tests/check_module.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { translateModule, KernelError } from "../pykernel.js";

const corpus = JSON.parse(readFileSync(new URL("./pykernel_corpus.json", import.meta.url)));
const demo = (origin) => corpus.find((c) => c.origin === origin);

// 1. A module of two kernels from the demo files, with a docstring, imports, comments, blank
//    lines and an undecorated helper. Each kernel must match the corpus WGSL byte for byte.
const galaxy = demo("kernels/galaxy.py:accel");
const drift = demo("kernels/galaxy.py:drift");
const module1 = [
  '"""Two kernels and a helper."""',
  "from math import sqrt",
  "import os",
  "",
  "# a comment between statements",
  "def helper(x):",
  "    return sqrt(x)",
  "",
  galaxy.src.trimEnd(),
  "",
  "",
  drift.src.trimEnd(),
  "",
].join("\n");
const out1 = translateModule(module1);
assert.deepEqual(out1.map((k) => k.name), ["accel", "drift"]);
assert.equal(out1[0].spec.wgsl, galaxy.expect.wgsl);
assert.equal(out1[1].spec.wgsl, drift.expect.wgsl);
assert.deepEqual(out1[0].spec.manifest(), galaxy.expect.manifest);
assert.deepEqual(out1[1].spec.manifest(), drift.expect.manifest);

// 2. An empty module, and a module with nothing but ignored lines, give an empty list.
assert.deepEqual(translateModule(""), []);
assert.deepEqual(translateModule("import math\n\n# nothing here\n"), []);

// 3. Undecorated and non-kernel decorated functions are skipped, even when their bodies are
//    outside the subset.
assert.deepEqual(translateModule("def f(x):\n    return [x for x in x]\n"), []);
assert.deepEqual(translateModule("@staticmethod\ndef f(x):\n    print(x)\n"), []);

// 4. Top-level statements other than imports, the docstring and function definitions are errors,
//    on their own line.
const topLevel = [
  ["x = 1\n", 1],
  ["import os\nprint(1)\n", 2],
  ["\"\"\"doc\"\"\"\n\"second string\"\n", 2],
  ["class C:\n    pass\n", 1],
  ["if True:\n    pass\n", 1],
];
for (const [src, line] of topLevel) {
  assert.throws(
    () => translateModule(src),
    (e) => e instanceof KernelError && e.line === line && e.message.startsWith(`line ${line}: unsupported top-level`),
    src,
  );
}

// 5. An error inside a kernel is reported at its line in the module, not in the block.
const badSecond = [
  "@kernel",
  "def ok(gid: int, out: list[float]):",
  "    out[gid] = 1.0",
  "",
  "",
  "@kernel",
  "def bad(gid: int, out: list[float]):",
  "    return 1",
].join("\n");
assert.throws(
  () => translateModule(badSecond),
  (e) => e instanceof KernelError && e.line === 8 && e.message === "line 8: unsupported node Constant: kernels return nothing; write results into a list[float] parameter",
);

// 6. The first error in source order is the one thrown.
const twoBad = "@kernel\ndef a(gid: int):\n    y = q\n\n@kernel\ndef b(gid: int):\n    z = r\n";
assert.throws(() => translateModule(twoBad), (e) => e instanceof KernelError && e.line === 3);

// 7. A syntax error anywhere in the module is reported as a syntax error.
assert.throws(
  () => translateModule("@kernel\ndef a(gid: int):\n    x = (1,\n"),
  (e) => e instanceof KernelError && e.message.startsWith("line 3: syntax error:"),
);

// 8. Windows line endings give the same kernels and the same lines.
const crlf = out1.length && module1.replace(/\n/g, "\r\n");
const out2 = translateModule(crlf);
assert.deepEqual(out2.map((k) => k.spec.wgsl), out1.map((k) => k.spec.wgsl));

console.log("translateModule: 8/8 checks pass");
