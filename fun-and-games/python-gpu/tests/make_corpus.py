"""Build tests/pykernel_corpus.json: kernel sources and what vendor/pykernel.py does
with each, as the oracle for the JavaScript port (pykernel.js).

Sources: every @kernel function in kernels/*.py and playground/*.py, plus the snippets already stored in
the corpus (harvested once from the compiler's own test suite; --harvest DIR re-reads
them from a checkout of experiments/py-wasm-bench/arms/wgsl). Expectations are always
recomputed, so after a compiler change run this, then tests/check_pykernel_js.mjs.

    python3 tests/make_corpus.py [--harvest PATH_TO_ARMS_WGSL]
"""
import argparse
import ast
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "vendor"))
import pykernel  # noqa: E402

CORPUS = HERE / "pykernel_corpus.json"


def outcome(src, name, first_line):
    try:
        spec = pykernel.translate_source(src, name=name, first_line=first_line)
    except pykernel.KernelError as e:
        return {"error": str(e), "line": e.line}
    return {"wgsl": spec.wgsl, "manifest": spec.manifest()}


def demo_cases():
    for path in sorted((ROOT / "kernels").glob("*.py")) + sorted((ROOT / "playground").glob("*.py")):
        text = path.read_text()
        for node in ast.parse(text).body:
            if isinstance(node, ast.FunctionDef) and node.decorator_list:
                start = node.decorator_list[0].lineno
                src = "\n".join(text.splitlines()[start - 1:node.end_lineno]) + "\n"
                yield {"origin": f"{path.parent.name}/{path.name}:{node.name}", "src": src, "name": node.name, "first_line": start}


def harvest(arms_dir):
    """Run the compiler's own tests with translate_source wrapped, keeping every input."""
    sys.path.insert(0, str(arms_dir))
    import pykernel as theirs
    seen = []
    real = theirs.translate_source

    def spy(src, name=None, first_line=1):
        seen.append({"src": src, "name": name, "first_line": first_line})
        return real(src, name=name, first_line=first_line)
    theirs.translate_source = spy
    import test_pykernel
    test_pykernel.translate_source = spy
    for k, f in sorted(vars(test_pykernel).items()):
        if k.startswith("test_") and callable(f):
            try:
                f()
            except Exception:  # noqa: BLE001 -- only the inputs matter here
                pass
    out, keys = [], set()
    for i, c in enumerate(seen):
        key = (c["src"], c["name"], c["first_line"])
        if key not in keys:
            keys.add(key)
            out.append({"origin": f"test_pykernel #{i}", **c})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--harvest", type=Path)
    a = ap.parse_args()
    old = json.loads(CORPUS.read_text()) if CORPUS.exists() else []
    snippets = harvest(a.harvest) if a.harvest else [c for c in old if not c["origin"].startswith(("kernels/", "playground/"))]
    cases = list(demo_cases()) + [{k: c[k] for k in ("origin", "src", "name", "first_line")} for c in snippets]
    for c in cases:
        c["expect"] = outcome(c["src"], c["name"], c["first_line"])
    CORPUS.write_text(json.dumps(cases, indent=1) + "\n")
    ok = sum("wgsl" in c["expect"] for c in cases)
    print(f"wrote {CORPUS.name}: {len(cases)} cases, {ok} translate, {len(cases) - ok} rejected")


if __name__ == "__main__":
    main()
