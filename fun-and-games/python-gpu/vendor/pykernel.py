"""pykernel (vendored from oaustegard/experiments py-wasm-bench/arms/wgsl/pykernel.py): translate a restricted Python function into a WGSL compute shader.

The decorated function is the work of ONE invocation. Its first parameter is the
invocation index, annotated int. Every other parameter is typed as one of:

    list[float]   storage buffer, array<f32>; read_write if the body assigns into it
    int, float    scalar field of one uniform struct (read-only inside the kernel)

    @kernel(workgroup_size=64)
    def saxpy(gid: int, x: list[float], y: list[float], a: float):
        y[gid] = a * x[gid] + y[gid]

translate(saxpy) returns a KernelSpec: .wgsl is the shader, .buffers and .uniforms
describe the bindings a host needs. Stdlib only (ast, inspect, textwrap).

Anything outside the subset raises KernelError naming the AST node and the line.
See NOTES.md for the subset, the design and what production would need.
"""
import ast
import copy
import inspect
import math
import textwrap
from dataclasses import asdict, dataclass

__all__ = ["KernelError", "KernelSpec", "kernel", "translate", "translate_source"]

I32, F32, BOOL = "i32", "f32", "bool"
DEFAULT_WORKGROUP = 64
MAX_WORKGROUP = 256            # WebGPU default maxComputeWorkgroupSizeX
COUNT_FIELD = "pk_count"       # uniform field: invocation count, used for the bounds check
_I32_MIN, _I32_MAX = -(2 ** 31), 2 ** 31 - 1
_F32_MAX = 3.4028234663852886e38
_ZERO = {I32: "0i", F32: "0.0f", BOOL: "false"}
_PYNAME = {I32: "int", F32: "float", BOOL: "bool"}
_BUILTINS = {"min": 2, "max": 2, "sqrt": 1, "float": 1, "int": 1, "abs": 1, "floor": 1,
             "sin": 1, "cos": 1, "tan": 1, "exp": 1, "log": 1, "atan2": 2, "pow": 2}
# f32 -> f32 in both languages; the kernel module imports them from math so it also runs
# as plain Python. floor() is separate: math.floor returns an int.
_FLOAT_FNS = ("sqrt", "sin", "cos", "tan", "exp", "log", "atan2", "pow")
_BUILTIN_LIST = ", ".join(_BUILTINS)
_CMP = {ast.Lt: "<", ast.LtE: "<=", ast.Gt: ">", ast.GtE: ">=", ast.Eq: "==", ast.NotEq: "!="}
_ARITH = {ast.Add: "+", ast.Sub: "-", ast.Mult: "*"}
_OP_SYMBOL = {ast.FloorDiv: "//", ast.Mod: "%"}

# Identifiers a Python name must not take verbatim in WGSL (keywords, reserved words,
# and the builtins this translator emits). A clashing name becomes "pk_" + name.
_WGSL_RESERVED = frozenset(["alias", "break", "case", "const", "const_assert", "continue", "continuing", "default", "diagnostic", "discard", "else", "enable", "false", "fn", "for", "if", "let", "loop", "override", "return", "struct", "switch", "true", "var", "while", "array", "atomic", "bool", "f16", "f32", "i32", "u32", "ptr", "sampler", "texture", "vec2", "vec3", "vec4", "mat2x2", "mat3x3", "mat4x4", "abs", "ceil", "clamp", "floor", "min", "max", "select", "sqrt", "main", "Params", "NULL", "Self", "abstract", "active", "alignas", "alignof", "as", "asm", "asm_fragment", "async", "attribute", "auto", "await", "become", "binding_array", "cast", "catch", "class", "co_await", "co_return", "co_yield", "coherent", "column_major", "common", "compile", "compile_fragment", "concept", "const_cast", "consteval", "constexpr", "constinit", "crate", "debugger", "decltype", "delete", "demote", "demote_to_helper", "do", "dynamic_cast", "enum", "explicit", "export", "extends", "extern", "external", "fallthrough", "filter", "final", "finally", "friend", "from", "fxgroup", "get", "goto", "groupshared", "highp", "impl", "implements", "import", "inline", "instanceof", "interface", "layout", "lowp", "macro", "macro_rules", "match", "mediump", "meta", "mod", "module", "move", "mut", "mutable", "namespace", "new", "nil", "noexcept", "noinline", "nointerpolation", "noperspective", "null", "nullptr", "of", "operator", "package", "packoffset", "partition", "pass", "patch", "pixelfragment", "precise", "precision", "premerge", "priv", "protected", "pub", "public", "readonly", "ref", "regardless", "register", "reinterpret_cast", "require", "resource", "restrict", "self", "set", "shared", "sizeof", "smooth", "snorm", "static", "static_assert", "static_cast", "std", "subroutine", "super", "target", "template", "this", "thread_local", "throw", "trait", "try", "type", "typedef", "typeid", "typename", "typeof", "union", "unless", "unorm", "unsafe", "unsized", "use", "using", "varying", "virtual", "volatile", "wgsl", "where", "with", "writeonly", "yield"])

_HELPERS = {
    "pk_mod": [
        "fn pk_mod(a: i32, b: i32) -> i32 {",
        "  let r = a % b;",
        "  if (r != 0 && ((r < 0) != (b < 0))) { return r + b; }",
        "  return r;",
        "}",
    ],
    "pk_floordiv": [
        "fn pk_floordiv(a: i32, b: i32) -> i32 {",
        "  let q = a / b;",
        "  if ((a % b != 0) && ((a < 0) != (b < 0))) { return q - 1; }",
        "  return q;",
        "}",
    ],
}


class KernelError(Exception):
    """Raised for anything outside the subset. .line is the 1-based source line."""

    def __init__(self, message, line=None):
        self.line = line
        super().__init__(f"line {line}: {message}" if line is not None else message)


@dataclass
class Buffer:
    name: str
    binding: int
    access: str            # "read" or "read_write"


@dataclass
class Uniform:
    name: str
    type: str              # "i32" or "f32"
    offset: int            # bytes


@dataclass
class KernelSpec:
    name: str
    wgsl: str
    gid: str
    workgroup_size: int
    buffers: list
    uniforms: list
    uniform_binding: int
    uniform_size: int

    def manifest(self):
        return {
            "kernel": self.name,
            "entry": "main",
            "gid": self.gid,
            "workgroup_size": self.workgroup_size,
            "buffers": [asdict(b) for b in self.buffers],
            "uniforms": [asdict(u) for u in self.uniforms],
            "uniform_binding": self.uniform_binding,
            "uniform_size": self.uniform_size,
        }


def kernel(fn=None, *, workgroup_size=DEFAULT_WORKGROUP):
    """Marker decorator. Runs nothing; translate() reads the decorator from the AST.

    Usable as @kernel or @kernel(workgroup_size=64).
    """
    def deco(f):
        return f
    return deco if fn is None else deco(fn)


def translate(fn):
    """Translate a @kernel-decorated function object. Its source is read with inspect."""
    lines, start = inspect.getsourcelines(fn)
    return translate_source("".join(lines), name=fn.__name__, first_line=start)


def translate_source(src, name=None, first_line=1):
    """Translate kernel source text. first_line is the file line of the text's first line."""
    src = textwrap.dedent(src)
    try:
        tree = ast.parse(src)
    except SyntaxError as e:
        raise KernelError(f"syntax error: {e.msg}", (e.lineno or 1) + first_line - 1) from None
    if len(tree.body) != 1 or not isinstance(tree.body[0], ast.FunctionDef):
        raise KernelError("expected exactly one function definition", first_line)
    return _Translator(tree.body[0], src, name or tree.body[0].name, first_line).run()


def _is_name(node, ident):
    return isinstance(node, ast.Name) and node.id == ident


def _is_list_float(node):
    return isinstance(node, ast.Subscript) and _is_name(node.value, "list") and _is_name(node.slice, "float")


def _f32_literal(v):
    if math.isnan(v) or v in (float("inf"), float("-inf")) or abs(v) > _F32_MAX:
        raise ValueError(f"float literal {v!r} does not fit f32")
    s = repr(v)
    if "." not in s and "e" not in s:
        s += ".0"
    return f"({s}f)" if v < 0 else f"{s}f"


class _Translator:
    def __init__(self, fdef, src, name, first_line):
        self.fdef = fdef
        self.src = src
        self.kname = name
        self.first_line = first_line
        self.workgroup = DEFAULT_WORKGROUP
        self.gid = None
        self.scalars = {}      # python name -> i32 | f32 (uniform fields, read-only)
        self.buffers = {}      # python name -> "read" | "read_write"
        self.vtypes = {}       # local python name -> i32 | f32 | bool
        self.changed = False   # set when a local's inferred type widens
        self.strict = False    # final pass: unknown names are errors
        self.temp = 0
        self.loops = 0
        self.helpers = set()
        self.assigned = set()  # every name assigned anywhere in the body

    # ---- errors -------------------------------------------------------------

    def err(self, node, msg):
        ln = getattr(node, "lineno", None)
        return KernelError(msg, ln + self.first_line - 1 if ln else None)

    def unsupported(self, node, detail=""):
        if not detail:
            seg = " ".join((ast.get_source_segment(self.src, node) or "").split())
            detail = seg[:60]
        msg = f"unsupported node {type(node).__name__}"
        return self.err(node, msg + (f": {detail}" if detail else ""))

    def unsupported_op(self, node, op, detail):
        return self.err(node, f"unsupported node {op.__name__}: {detail}")

    # ---- names --------------------------------------------------------------

    @staticmethod
    def wname(name):
        return "pk_" + name if name in _WGSL_RESERVED else name

    def check_user_name(self, node, name):
        if not name.isascii():
            raise self.err(node, f"identifier {name!r} must be ASCII")
        if name.startswith(("pk_", "__")):
            raise self.err(node, f"identifier {name!r}: names starting with pk_ or __ are reserved")

    def check_writable(self, node, name):
        if name == self.gid:
            raise self.err(node, f"{name!r} is the invocation index and is read-only")
        if name in self.scalars:
            raise self.err(node, f"parameter {name!r} is read-only inside the kernel")
        if name in self.buffers:
            raise self.err(node, f"list parameter {name!r} cannot be rebound; assign to {name}[i]")

    def bind(self, node, name, t):
        """Join a new assignment's type into the local's type. int joins float to float."""
        cur = self.vtypes.get(name)
        if cur is None:
            new = t
        elif cur == t:
            return
        elif {cur, t} == {I32, F32}:
            new = F32
        else:
            raise self.err(node, f"variable {name!r} holds a {_PYNAME[cur]} but is assigned a "
                                 f"{_PYNAME[t]}; use int() or float() to convert")
        if new != cur:
            self.vtypes[name] = new
            self.changed = True

    def coerce(self, node, code, t, target):
        if t == target:
            return code
        if t == I32 and target == F32:
            return f"f32({code})"
        raise self.err(node, f"cannot use a {_PYNAME[t]} value where a {_PYNAME[target]} is needed; "
                             f"convert with {_PYNAME[target]}()")

    def need_int(self, node, t):
        if t is not None and t != I32:
            raise self.err(node, "list indices, range bounds and the loop start must be int")

    def need_bool(self, node, t):
        if t is not None and t != BOOL:
            raise self.err(node, "a condition must be a comparison or a bool; "
                                 "numbers have no truth value in a kernel")

    # ---- driver -------------------------------------------------------------

    def run(self):
        f = self.fdef
        if f.returns is not None and not (isinstance(f.returns, ast.Constant) and f.returns.value is None):
            raise self.unsupported(f.returns, "kernels return nothing; write results into a list[float] parameter")
        self.parse_decorator()
        self.parse_params()
        self.assigned = {n.id for n in ast.walk(f) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)}
        for n in ast.walk(f):
            if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store):
                self.check_user_name(n, n.id)
        body = list(f.body)
        if body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant) \
                and isinstance(body[0].value.value, str):
            body = body[1:]

        # Buffer access: read_write iff the body assigns into it.
        writes = set()
        for node in ast.walk(ast.Module(body=body, type_ignores=[])):
            targets = []
            if isinstance(node, ast.Assign):
                targets = node.targets
            elif isinstance(node, (ast.AugAssign, ast.AnnAssign)):
                targets = [node.target]
            for t in targets:
                if isinstance(t, ast.Subscript) and isinstance(t.value, ast.Name) and t.value.id in self.buffers:
                    writes.add(t.value.id)
        for n in self.buffers:
            self.buffers[n] = "read_write" if n in writes else "read"

        # Local types: iterate to a fixpoint (a variable's type can widen on a later pass).
        for _ in range(32):
            self.changed = False
            self.temp = self.loops = 0
            self.helpers = set()
            self.stmts(body, 1)
            if not self.changed:
                break
        else:
            raise KernelError("local type inference did not settle (internal error)")

        self.check_definite(body)
        self.strict = True
        self.temp = self.loops = 0
        self.helpers = set()
        lines = self.stmts(body, 1)
        if self.changed:
            raise KernelError("local type inference changed in the final pass (internal error)")
        wgsl, buffers, uniforms = self.module(lines)
        return KernelSpec(
            name=self.kname, wgsl=wgsl, gid=self.gid, workgroup_size=self.workgroup,
            buffers=buffers, uniforms=uniforms, uniform_binding=len(buffers),
            uniform_size=4 * len(uniforms),
        )

    def parse_decorator(self):
        found = False
        for d in self.fdef.decorator_list:
            if _is_name(d, "kernel"):
                found = True
            elif isinstance(d, ast.Call) and _is_name(d.func, "kernel"):
                found = True
                if d.args:
                    raise self.unsupported(d.args[0], "pass workgroup_size as a keyword")
                for kw in d.keywords:
                    if kw.arg != "workgroup_size":
                        raise self.err(kw.value, f"unknown @kernel argument {kw.arg!r}")
                    if not (isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, int)
                            and not isinstance(kw.value.value, bool)):
                        raise self.err(kw.value, "workgroup_size must be an int literal")
                    if not 1 <= kw.value.value <= MAX_WORKGROUP:
                        raise self.err(kw.value, f"workgroup_size must be 1..{MAX_WORKGROUP}")
                    self.workgroup = kw.value.value
        if not found:
            raise self.err(self.fdef, f"function {self.fdef.name!r} is not decorated with @kernel")

    def parse_params(self):
        f = self.fdef
        a = f.args
        if a.vararg or a.kwarg or a.kwonlyargs or a.posonlyargs or a.defaults or a.kw_defaults:
            raise self.err(f, "kernel parameters must be plain positional names "
                              "(no defaults, *args, **kwargs or keyword-only)")
        if not a.args:
            raise self.err(f, "a kernel needs its invocation index as the first parameter: (gid: int, ...)")
        first = a.args[0]
        if not _is_name(first.annotation, "int"):
            raise self.err(first, f"first parameter {first.arg!r} is the invocation index and must be annotated int")
        self.check_user_name(first, first.arg)
        self.gid = first.arg
        for p in a.args[1:]:
            self.check_user_name(p, p.arg)
            ann = p.annotation
            if ann is None:
                raise self.err(p, f"parameter {p.arg!r} needs a type: int, float or list[float]")
            if _is_name(ann, "int"):
                self.scalars[p.arg] = I32
            elif _is_name(ann, "float"):
                self.scalars[p.arg] = F32
            elif _is_list_float(ann):
                self.buffers[p.arg] = "read"
            else:
                raise self.err(p, f"parameter {p.arg!r} has unsupported type {ast.unparse(ann)!r}; "
                                  "use int, float or list[float]")

    def module(self, body_lines):
        buffers = [Buffer(n, i, acc) for i, (n, acc) in enumerate(self.buffers.items())]
        uniforms = [Uniform(COUNT_FIELD, I32, 0)]
        for i, (n, t) in enumerate(self.scalars.items(), start=1):
            uniforms.append(Uniform(n, t, 4 * i))
        ub = len(buffers)
        g = self.wname(self.gid)
        out = [f"// generated by pykernel from {self.kname}(); do not edit", ""]
        for h in ("pk_mod", "pk_floordiv"):
            if h in self.helpers:
                out.extend(_HELPERS[h])
                out.append("")
        out.append("struct Params {")
        for u in uniforms:
            out.append(f"  {self.wname(u.name)}: {u.type},")
        out.append("}")
        out.append("")
        for b in buffers:
            out.append(f"@group(0) @binding({b.binding}) var<storage, {b.access}> "
                       f"{self.wname(b.name)}: array<f32>;")
        out.append(f"@group(0) @binding({ub}) var<uniform> pk_params: Params;")
        out.append("")
        out.append(f"@compute @workgroup_size({self.workgroup})")
        out.append("fn main(@builtin(global_invocation_id) pk_gid: vec3<u32>) {")
        out.append(f"  let {g}: i32 = i32(pk_gid.x);")
        out.append(f"  if ({g} >= pk_params.{COUNT_FIELD}) {{ return; }}")
        for n, t in self.vtypes.items():
            out.append(f"  var {self.wname(n)}: {t} = {_ZERO[t]};")
        out.extend(body_lines)
        out.append("}")
        out.append("")
        return "\n".join(out), buffers, uniforms

    # ---- definite assignment ------------------------------------------------------

    def check_definite(self, body):
        """Python's rule: a local is read only after an assignment that precedes the read in the
        source. An if-branch assignment counts only when both branches make it, and a loop body
        assignment does not count after the loop. Reads Python would raise NameError for are
        rejected here instead of reading the zero the hoisted declaration gives them."""
        self.defs_stmts(body, frozenset())

    def _loads_ok(self, expr, seen):
        calls = {id(n.func) for n in ast.walk(expr) if isinstance(n, ast.Call)}
        for n in ast.walk(expr):
            if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load) and id(n) not in calls:
                self._name_ok(n, n.id, seen)

    def _name_ok(self, node, name, seen):
        if name == self.gid or name in self.scalars or name in self.buffers or name in seen:
            return
        if name in self.assigned:
            raise self.err(node, f"name {name!r} is used before it is assigned")
        raise self.err(node, f"name {name!r} is not a parameter and is never assigned")

    def defs_stmts(self, body, seen):
        for s in body:
            seen = self.defs_stmt(s, seen)
        return seen

    def defs_stmt(self, s, seen):
        if isinstance(s, ast.Assign):
            self._loads_ok(s.value, seen)
            for t in s.targets:
                if isinstance(t, ast.Name):
                    seen = seen | {t.id}
                else:
                    self._loads_ok(t, seen)
            return seen
        if isinstance(s, ast.AugAssign):
            self._loads_ok(s.value, seen)
            if isinstance(s.target, ast.Name):
                self._name_ok(s.target, s.target.id, seen)
            else:
                self._loads_ok(s.target, seen)
            return seen
        if isinstance(s, ast.AnnAssign):
            if s.value is not None:
                self._loads_ok(s.value, seen)
                return seen | {s.target.id} if isinstance(s.target, ast.Name) else seen
            return seen
        if isinstance(s, ast.If):
            self._loads_ok(s.test, seen)
            a = self.defs_stmts(s.body, seen)
            b = self.defs_stmts(s.orelse, seen) if s.orelse else seen
            return a & b
        if isinstance(s, ast.While):
            self._loads_ok(s.test, seen)
            self.defs_stmts(s.body, seen)
            return seen
        if isinstance(s, ast.For):
            if isinstance(s.iter, ast.Call):
                for a in s.iter.args:
                    self._loads_ok(a, seen)
            if isinstance(s.target, ast.Name):
                self.defs_stmts(s.body, seen | {s.target.id})
            return seen
        if isinstance(s, ast.Expr) or isinstance(s, ast.Return) and s.value is not None:
            self._loads_ok(s.value, seen)
        return seen

    # ---- statements -----------------------------------------------------------

    def stmts(self, body, ind):
        out = []
        for s in body:
            out.extend(self.stmt(s, ind))
        return out

    def stmt(self, node, ind):
        pad = "  " * ind
        if isinstance(node, ast.Assign):
            if len(node.targets) != 1:
                raise self.unsupported(node, "chained assignment (a = b = x) is not in the subset")
            return self.store(node.targets[0], node.value, ind)
        if isinstance(node, ast.AugAssign):
            return self.aug(node, ind)
        if isinstance(node, ast.AnnAssign):
            return self.ann(node, ind)
        if isinstance(node, ast.If):
            return self.if_(node, ind)
        if isinstance(node, ast.While):
            return self.while_(node, ind)
        if isinstance(node, ast.For):
            return self.for_(node, ind)
        if isinstance(node, ast.Break):
            if self.loops == 0:
                raise self.err(node, "break outside a loop")
            return [pad + "break;"]
        if isinstance(node, ast.Continue):
            if self.loops == 0:
                raise self.err(node, "continue outside a loop")
            return [pad + "continue;"]
        if isinstance(node, ast.Return):
            if node.value is not None:
                raise self.unsupported(node.value, "kernels return nothing; write results into a list[float] parameter")
            return [pad + "return;"]
        if isinstance(node, ast.Pass):
            return []
        if isinstance(node, ast.Expr):
            if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
                return []
            if isinstance(node.value, ast.Call):
                self.call(node.value)  # unknown callee: names it
                raise self.unsupported(node.value, "a call used as a statement has no effect in a kernel")
            raise self.unsupported(node.value, "an expression statement has no effect in a kernel")
        raise self.unsupported(node)

    def store(self, target, value, ind):
        pad = "  " * ind
        if isinstance(target, ast.Name):
            name = target.id
            self.check_writable(target, name)
            code, t = self.expr(value)
            if t is None:
                return []
            self.bind(target, name, t)
            return [f"{pad}{self.wname(name)} = {self.coerce(value, code, t, self.vtypes[name])};"]
        if isinstance(target, ast.Subscript):
            base = target.value
            if not (isinstance(base, ast.Name) and base.id in self.buffers):
                raise self.err(target, "only list[float] parameters can be assigned by index")
            ic, it = self.expr(target.slice)
            code, t = self.expr(value)
            if it is None or t is None:
                return []
            self.need_int(target.slice, it)
            return [f"{pad}{self.wname(base.id)}[{ic}] = {self.coerce(value, code, t, F32)};"]
        raise self.unsupported(target, "only a name or list[index] can be assigned to")

    def aug(self, node, ind):
        load = copy.deepcopy(node.target)
        for n in ast.walk(load):
            if hasattr(n, "ctx"):
                n.ctx = ast.Load()
        new = ast.BinOp(left=load, op=node.op, right=node.value)
        ast.copy_location(new, node)
        ast.fix_missing_locations(new)
        return self.store(node.target, new, ind)

    def ann(self, node, ind):
        if not isinstance(node.target, ast.Name):
            raise self.unsupported(node.target, "an annotated assignment needs a plain name")
        t = {"int": I32, "float": F32, "bool": BOOL}.get(getattr(node.annotation, "id", None))
        if t is None:
            raise self.unsupported(node.annotation, "local annotations must be int, float or bool")
        self.check_writable(node.target, node.target.id)
        self.bind(node.target, node.target.id, t)
        if node.value is None:
            return []
        return self.store(node.target, node.value, ind)

    def if_(self, node, ind):
        pad = "  " * ind
        cc, ct = self.expr(node.test)
        self.need_bool(node.test, ct)
        out = [f"{pad}if ({cc}) {{"]
        out += self.stmts(node.body, ind + 1)
        if node.orelse:
            out.append(f"{pad}}} else {{")
            out += self.stmts(node.orelse, ind + 1)
        out.append(f"{pad}}}")
        return out

    def while_(self, node, ind):
        pad = "  " * ind
        if node.orelse:
            raise self.unsupported(node, "while with an else clause")
        cc, ct = self.expr(node.test)
        self.need_bool(node.test, ct)
        self.loops += 1
        body = self.stmts(node.body, ind + 1)
        self.loops -= 1
        return [f"{pad}while ({cc}) {{"] + body + [f"{pad}}}"]

    def for_(self, node, ind):
        pad = "  " * ind
        if node.orelse:
            raise self.unsupported(node, "for with an else clause")
        if not isinstance(node.target, ast.Name):
            raise self.unsupported(node.target, "a loop variable must be a plain name")
        it = node.iter
        if not (isinstance(it, ast.Call) and _is_name(it.func, "range") and not it.keywords
                and 1 <= len(it.args) <= 2 and not any(isinstance(a, ast.Starred) for a in it.args)):
            raise self.err(it, "for loops must iterate over range(stop) or range(start, stop); "
                               "no step and no other iterables")
        if len(it.args) == 1:
            start_node, stop_node = None, it.args[0]
            start_code, start_t = "0i", I32
        else:
            start_node, stop_node = it.args[0], it.args[1]
            start_code, start_t = self.expr(start_node)
        stop_code, stop_t = self.expr(stop_node)
        if start_t is None:
            start_t = I32
        if stop_t is None:
            stop_t = I32
        if start_node is not None:
            self.need_int(start_node, start_t)
        self.need_int(stop_node, stop_t)
        name = node.target.id
        self.check_writable(node.target, name)
        self.bind(node.target, name, I32)
        k = self.temp
        self.temp += 1
        end_v, it_v = f"pk_end{k}", f"pk_it{k}"
        self.loops += 1
        body = self.stmts(node.body, ind + 2)
        self.loops -= 1
        assign = self.coerce(node.target, it_v, I32, self.vtypes[name])
        return [
            f"{pad}{{",
            f"{pad}  let {end_v}: i32 = {stop_code};",
            f"{pad}  for (var {it_v}: i32 = {start_code}; {it_v} < {end_v}; {it_v} = {it_v} + 1i) {{",
            f"{pad}    {self.wname(name)} = {assign};",
        ] + body + [f"{pad}  }}", f"{pad}}}"]

    # ---- expressions: each returns (wgsl_code, type); type None = unknown this pass

    def expr(self, node):
        if isinstance(node, ast.Constant):
            return self.const(node)
        if isinstance(node, ast.Name):
            return self.name(node)
        if isinstance(node, ast.BinOp):
            return self.binop(node)
        if isinstance(node, ast.UnaryOp):
            return self.unary(node)
        if isinstance(node, ast.Compare):
            return self.compare(node)
        if isinstance(node, ast.BoolOp):
            return self.boolop(node)
        if isinstance(node, ast.Call):
            return self.call(node)
        if isinstance(node, ast.Subscript):
            return self.subscript(node)
        raise self.unsupported(node)

    def const(self, node):
        v = node.value
        if isinstance(v, bool):
            return ("true" if v else "false"), BOOL
        if isinstance(v, int):
            if not _I32_MIN <= v <= _I32_MAX:
                raise self.err(node, f"int literal {v} does not fit i32")
            return (f"{v}i" if v >= 0 else f"({v}i)"), I32
        if isinstance(v, float):
            try:
                return _f32_literal(v), F32
            except ValueError as e:
                raise self.err(node, str(e)) from None
        if isinstance(v, str):
            raise self.unsupported(node, "string constants are not in the subset")
        raise self.unsupported(node, f"{type(v).__name__} constants are not in the subset")

    def name(self, node):
        n = node.id
        if n == self.gid:
            return self.wname(n), I32
        if n in self.scalars:
            return f"pk_params.{self.wname(n)}", self.scalars[n]
        if n in self.buffers:
            raise self.err(node, f"list parameter {n!r} can only be indexed, as {n}[i]")
        if n in self.vtypes:
            return self.wname(n), self.vtypes[n]
        if self.strict:
            raise self.err(node, f"could not infer a type for {n!r}: its assignments depend only on each other")
        return "0i", None

    def subscript(self, node):
        base = node.value
        if not (isinstance(base, ast.Name) and base.id in self.buffers):
            raise self.err(node, "only list[float] parameters can be indexed")
        if isinstance(node.slice, ast.Slice):
            raise self.unsupported(node.slice, "slices are not in the subset")
        ic, it = self.expr(node.slice)
        if it is None:
            return "0.0f", None
        self.need_int(node.slice, it)
        return f"{self.wname(base.id)}[{ic}]", F32

    def numeric(self, node, a, b):
        (ac, at), (bc, bt) = a, b
        if at == BOOL or bt == BOOL:
            raise self.err(node, "arithmetic and ordering on a bool value are not in the subset")
        t = F32 if F32 in (at, bt) else I32
        return (self.coerce(node, ac, at, t), self.coerce(node, bc, bt, t)), t

    def binop(self, node):
        op = type(node.op)
        if op not in _ARITH and op not in (ast.Div, ast.FloorDiv, ast.Mod):
            detail = {ast.Pow: "use a*a for squares; ** is not in the subset"}.get(
                op, "only + - * / // % are in the subset")
            raise self.unsupported_op(node, op, detail)
        lc, lt = self.expr(node.left)
        rc, rt = self.expr(node.right)
        if lt is None or rt is None:
            return "0i", None
        if op in _ARITH:
            (lc, rc), t = self.numeric(node, (lc, lt), (rc, rt))
            return f"({lc} {_ARITH[op]} {rc})", t
        if op is ast.Div:
            lc = self.coerce(node.left, lc, lt, F32)
            rc = self.coerce(node.right, rc, rt, F32)
            return f"({lc} / {rc})", F32
        if lt != I32 or rt != I32:
            raise self.err(node, f"'{_OP_SYMBOL[op]}' is supported on int operands only")
        helper = "pk_floordiv" if op is ast.FloorDiv else "pk_mod"
        self.helpers.add(helper)
        return f"{helper}({lc}, {rc})", I32

    def unary(self, node):
        op = type(node.op)
        if op not in (ast.Not, ast.USub, ast.UAdd):
            raise self.unsupported_op(node, op, "only not, unary - and unary + are in the subset")
        c, t = self.expr(node.operand)
        if t is None:
            return "0i", None
        if op is ast.Not:
            if t != BOOL:
                raise self.err(node, "'not' needs a bool operand; write a comparison")
            return f"(!{c})", BOOL
        if t == BOOL:
            raise self.err(node, "unary +/- on a bool value")
        return (f"(-{c})" if op is ast.USub else c), t

    def compare(self, node):
        if len(node.ops) != 1 or len(node.comparators) != 1:
            raise self.err(node, "chained comparisons are not in the subset; write (a < b) and (b < c)")
        op = type(node.ops[0])
        if op not in _CMP:
            raise self.unsupported_op(node, op, "only < <= > >= == != are in the subset")
        lc, lt = self.expr(node.left)
        rc, rt = self.expr(node.comparators[0])
        if lt is None or rt is None:
            return "false", None
        if BOOL in (lt, rt):
            if lt != rt or op not in (ast.Eq, ast.NotEq):
                raise self.err(node, "a bool can only be compared with == or != to another bool")
            return f"({lc} {_CMP[op]} {rc})", BOOL
        (lc, rc), _ = self.numeric(node, (lc, lt), (rc, rt))
        return f"({lc} {_CMP[op]} {rc})", BOOL

    def boolop(self, node):
        sym = "&&" if isinstance(node.op, ast.And) else "||"
        codes = []
        for v in node.values:
            c, t = self.expr(v)
            if t is None:
                return "false", None
            if t != BOOL:
                raise self.err(v, "and/or operands must be comparisons or bools")
            codes.append(c)
        return "(" + f" {sym} ".join(codes) + ")", BOOL

    def call(self, node):
        if node.keywords:
            raise self.unsupported(node, "keyword arguments are not in the subset")
        if any(isinstance(a, ast.Starred) for a in node.args):
            raise self.unsupported(node, "*args are not in the subset")
        f = node.func
        if not isinstance(f, ast.Name):
            raise self.unsupported(f, f"calls must name a builtin: {_BUILTIN_LIST}")
        name = f.id
        if name == "range":
            raise self.err(node, "range() is only allowed as the iterable of a for loop")
        if name not in _BUILTINS:
            raise self.err(node, f"call to {name!r} is not in the subset "
                                 f"(builtins: {_BUILTIN_LIST})")
        if len(node.args) != _BUILTINS[name]:
            raise self.err(node, f"{name}() takes {_BUILTINS[name]} argument(s)")
        args = [self.expr(a) for a in node.args]
        if any(t is None for _, t in args):
            return "0i", None
        if name in ("min", "max"):
            (a, b), t = self.numeric(node, args[0], args[1])
            return f"{name}({a}, {b})", t
        if name in _FLOAT_FNS:
            cs = [self.coerce(a, c, t, F32) for a, (c, t) in zip(node.args, args)]
            return f"{name}({', '.join(cs)})", F32
        c, t = args[0]
        if name == "abs":
            if t == BOOL:
                raise self.err(node, "abs() of a bool is not in the subset")
            return f"abs({c})", t
        if name == "floor":
            # math.floor returns an int; WGSL floor() returns f32, so convert back
            return f"i32(floor({self.coerce(node.args[0], c, t, F32)}))", I32
        if name == "float":
            return self.coerce(node.args[0], c, t, F32), F32
        # int(): WGSL i32() truncates toward zero, as Python's int() does
        if t == I32:
            return c, I32
        if t == F32:
            return f"i32({c})", I32
        raise self.err(node, "int() of a bool is not in the subset")
