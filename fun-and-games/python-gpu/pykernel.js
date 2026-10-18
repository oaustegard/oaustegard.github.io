// pykernel.js: JavaScript port of vendor/pykernel.py.
//
// Translates a restricted Python function (one GPU invocation) into a WGSL compute
// shader, with the same subset, the same error messages and the same manifest as the
// Python original. Held to vendor/pykernel.py by tests/check_pykernel_js.mjs, which
// compares WGSL text, manifests and error text/lines against recorded Python output.
//
// Layout mirrors vendor/pykernel.py so a later change there can be carried over by
// hand. Python snake_case names become camelCase (translate_source -> translateSource,
// _Translator.check_user_name -> Translator.checkUserName). The Python `ast` module is
// replaced by a tokenizer and recursive-descent parser that build nodes with the same
// class names (`_type`), the same fields in the same order (FIELDS, which fixes the
// breadth-first order of walk()), and the same lineno/col_offset positions. Error
// messages that name node types or quote source segments therefore match.
//
// Known gaps, all outside the kernel subset or outside the corpus: CPython's less common
// invalid_* syntax rules are not reproduced, so some syntax-error wording can differ (the
// tokenizer and parser errors that the corpus and the common mistakes hit do match);
// \N{name} escapes keep their text; very deep nesting reports a KernelError where CPython
// raises RecursionError.
//
// Pure ES module, no dependencies. Runs in browsers and in Node 22.

// ---------------------------------------------------------------------------
// Python-compatible formatting
// ---------------------------------------------------------------------------

// repr(float): shortest round-trip digits; exponent form when the decimal exponent is
// < -4 or >= 16; integral values keep a ".0".
export function pyFloatRepr(x) {
  if (Number.isNaN(x)) return "nan";
  if (x === Infinity) return "inf";
  if (x === -Infinity) return "-inf";
  const sign = x < 0 || Object.is(x, -0) ? "-" : "";
  const a = Math.abs(x);
  if (a === 0) return sign + "0.0";
  // toExponential() with no argument yields the shortest digits that round-trip.
  const [mant, expStr] = a.toExponential().split("e");
  const digits = mant.replace(".", "");
  const e = parseInt(expStr, 10);
  if (e < -4 || e >= 16) {
    const m = digits.length > 1 ? digits[0] + "." + digits.slice(1) : digits;
    const ae = String(Math.abs(e)).padStart(2, "0");
    return `${sign}${m}e${e < 0 ? "-" : "+"}${ae}`;
  }
  let s;
  if (e >= 0) {
    const intPart = digits.length > e + 1 ? digits.slice(0, e + 1) : digits + "0".repeat(e + 1 - digits.length);
    const frac = digits.length > e + 1 ? digits.slice(e + 1) : "";
    s = intPart + "." + (frac || "0");
  } else {
    s = "0." + "0".repeat(-e - 1) + digits;
  }
  return sign + s;
}

// str(int) for a BigInt (Python ints are unbounded; the translator keeps them BigInt).
export function pyIntStr(v) {
  return BigInt(v).toString();
}

const NON_PRINTABLE = /[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{Zl}\p{Zp}\p{Zs}]/u;

// repr(str) as CPython prints it.
export function pyRepr(s) {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = q;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (ch === q || ch === "\\") out += "\\" + ch;
    else if (ch === "\t") out += "\\t";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (cp < 0x20 || cp === 0x7f) out += "\\x" + cp.toString(16).padStart(2, "0");
    else if (cp < 0x7f) out += ch;
    else if (ch !== " " && NON_PRINTABLE.test(ch)) {
      if (cp <= 0xff) out += "\\x" + cp.toString(16).padStart(2, "0");
      else if (cp <= 0xffff) out += "\\u" + cp.toString(16).padStart(4, "0");
      else out += "\\U" + cp.toString(16).padStart(8, "0");
    } else out += ch;
  }
  return out + q;
}

// str.split() with no arguments: the runs of Python whitespace.
const PY_WS = /[\t\n\v\f\r\x1c-\x1f \x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/;
function pyWords(s) {
  return s.split(PY_WS).filter((w) => w !== "");
}

// s[:n] counted in code points, as Python slices str.
function firstCodePoints(s, n) {
  return Array.from(s).slice(0, n).join("");
}

// textwrap.dedent, line for line.
function dedent(text) {
  const lines = text.split("\n").map((l) => (/^[ \t]+$/.test(l) ? "" : l));
  let margin = null;
  for (const l of lines) {
    const indent = /^[ \t]*/.exec(l)[0];
    if (indent.length === l.length) continue; // no non-blank character on this line
    if (margin === null) margin = indent;
    else if (indent.startsWith(margin)) continue;
    else if (margin.startsWith(indent)) margin = indent;
    else {
      let i = 0;
      while (i < margin.length && i < indent.length && margin[i] === indent[i]) i++;
      margin = margin.slice(0, i);
    }
  }
  if (margin) return lines.map((l) => (l.startsWith(margin) ? l.slice(margin.length) : l)).join("\n");
  return lines.join("\n");
}

function normalizeNewlines(s) {
  return s.replace(/\r\n?/g, "\n");
}

// ---------------------------------------------------------------------------
// Errors and small records
// ---------------------------------------------------------------------------

// Raised for anything outside the subset. .line is the 1-based source line, or null.
export class KernelError extends Error {
  constructor(message, line = null) {
    super(line !== null && line !== undefined ? `line ${line}: ${message}` : message);
    this.name = "KernelError";
    this.line = line ?? null;
  }
}

// Tokenizer and parser failures; translateSource turns them into KernelError.
class PySyntaxError extends Error {
  // tokLine: the line of the token the parser stopped at (CPython compares it, not lineno)
  constructor(msg, lineno, soft = false, tokLine = lineno) {
    super(msg);
    this.msg = msg;
    this.lineno = lineno;
    this.tokLine = tokLine;
    // soft: CPython raises these without an exception object, so they do not replace a parser error
    this.soft = soft;
    this.unclosed = null; // set on the "was never closed" error at end of file
  }
}

// A compiled kernel. Field names are camelCase; manifest() gives the snake_case dict.
export class KernelSpec {
  constructor({ name, wgsl, gid, workgroupSize, buffers, uniforms, uniformBinding, uniformSize }) {
    this.name = name;
    this.wgsl = wgsl;
    this.gid = gid;
    this.workgroupSize = workgroupSize;
    this.buffers = buffers; // [{name, binding, access}]
    this.uniforms = uniforms; // [{name, type, offset}]
    this.uniformBinding = uniformBinding;
    this.uniformSize = uniformSize;
  }

  manifest() {
    return {
      kernel: this.name,
      entry: "main",
      gid: this.gid,
      workgroup_size: this.workgroupSize,
      buffers: this.buffers.map((b) => ({ name: b.name, binding: b.binding, access: b.access })),
      uniforms: this.uniforms.map((u) => ({ name: u.name, type: u.type, offset: u.offset })),
      uniform_binding: this.uniformBinding,
      uniform_size: this.uniformSize,
    };
  }
}

// ---------------------------------------------------------------------------
// AST: node classes, field order, walk, source segments
// ---------------------------------------------------------------------------

// _fields of CPython 3.13's ast classes, in the same order. walk() visits children in this
// order, so the breadth-first order (and therefore which error is raised first) matches.
const FIELDS = {
  Module: ["body", "type_ignores"],
  FunctionDef: ["name", "args", "body", "decorator_list", "returns", "type_comment", "type_params"],
  AsyncFunctionDef: ["name", "args", "body", "decorator_list", "returns", "type_comment", "type_params"],
  ClassDef: ["name", "bases", "keywords", "body", "decorator_list", "type_params"],
  Return: ["value"],
  Delete: ["targets"],
  Assign: ["targets", "value", "type_comment"],
  AugAssign: ["target", "op", "value"],
  AnnAssign: ["target", "annotation", "value", "simple"],
  For: ["target", "iter", "body", "orelse", "type_comment"],
  AsyncFor: ["target", "iter", "body", "orelse", "type_comment"],
  While: ["test", "body", "orelse"],
  If: ["test", "body", "orelse"],
  With: ["items", "body", "type_comment"],
  AsyncWith: ["items", "body", "type_comment"],
  Raise: ["exc", "cause"],
  Try: ["body", "handlers", "orelse", "finalbody"],
  TryStar: ["body", "handlers", "orelse", "finalbody"],
  Assert: ["test", "msg"],
  Import: ["names"],
  ImportFrom: ["module", "names", "level"],
  Global: ["names"],
  Nonlocal: ["names"],
  Expr: ["value"],
  Pass: [],
  Break: [],
  Continue: [],
  BoolOp: ["op", "values"],
  NamedExpr: ["target", "value"],
  BinOp: ["left", "op", "right"],
  UnaryOp: ["op", "operand"],
  Lambda: ["args", "body"],
  IfExp: ["test", "body", "orelse"],
  Dict: ["keys", "values"],
  Set: ["elts"],
  ListComp: ["elt", "generators"],
  SetComp: ["elt", "generators"],
  DictComp: ["key", "value", "generators"],
  GeneratorExp: ["elt", "generators"],
  Await: ["value"],
  Yield: ["value"],
  YieldFrom: ["value"],
  Compare: ["left", "ops", "comparators"],
  Call: ["func", "args", "keywords"],
  FormattedValue: ["value", "conversion", "format_spec"],
  JoinedStr: ["values"],
  Constant: ["value", "kind"],
  Attribute: ["value", "attr", "ctx"],
  Subscript: ["value", "slice", "ctx"],
  Starred: ["value", "ctx"],
  Name: ["id", "ctx"],
  List: ["elts", "ctx"],
  Tuple: ["elts", "ctx"],
  Slice: ["lower", "upper", "step"],
  comprehension: ["target", "iter", "ifs", "is_async"],
  ExceptHandler: ["type", "name", "body"],
  arguments: ["posonlyargs", "args", "vararg", "kwonlyargs", "kw_defaults", "kwarg", "defaults"],
  arg: ["arg", "annotation", "type_comment"],
  keyword: ["arg", "value"],
  alias: ["name", "asname"],
  withitem: ["context_expr", "optional_vars"],
  Match: ["subject", "cases"],
  match_case: ["pattern", "guard", "body"],
  TypeAlias: ["name", "type_params", "value"],
};

// Operators, comparison operators and contexts are plain strings holding the CPython class
// name ("Add", "Lt", "Load"). Constant.ctype holds the Python type name ("int", "str", ...).

function isNode(x) {
  return x !== null && typeof x === "object" && typeof x._type === "string";
}

function childNodes(node) {
  const out = [];
  for (const f of FIELDS[node._type] || []) {
    const v = node[f];
    if (Array.isArray(v)) {
      for (const x of v) if (isNode(x)) out.push(x);
    } else if (isNode(v)) out.push(v);
  }
  return out;
}

// ast.walk: breadth-first, the node itself first.
function walk(node) {
  const todo = [node];
  for (let i = 0; i < todo.length; i++) todo.push(...childNodes(todo[i]));
  return todo;
}

// ast.get_source_segment: the text the node spans, or null when it has no position.
function sourceSegment(src, node) {
  if (node.end_lineno == null || node.end_col_offset == null) return null;
  const lines = splitLinesKeepEnds(src);
  const li = node.lineno - 1;
  const eli = node.end_lineno - 1;
  if (eli === li) return lines[li].slice(node.col_offset, node.end_col_offset);
  const first = lines[li].slice(node.col_offset);
  const last = lines[eli].slice(0, node.end_col_offset);
  return [first, ...lines.slice(li + 1, eli), last].join("");
}

function splitLinesKeepEnds(src) {
  const out = [];
  let cur = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    cur += c;
    if (c === "\r" && src[i + 1] === "\n") {
      cur += "\n";
      i++;
    }
    if (c === "\r" || c === "\n") {
      out.push(cur);
      cur = "";
    }
  }
  if (cur) out.push(cur);
  return out;
}

// The one-line form the translator quotes: whitespace collapsed, cut at 60 code points.
function quotedDetail(src, node) {
  const seg = pyWords(sourceSegment(src, node) || "").join(" ");
  return firstCodePoints(seg, 60);
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

const KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import", "in",
  "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);
const STR_PREFIXES = new Set(["r", "u", "b", "br", "rb", "f", "fr", "rf"]);
const OPS3 = ["**=", "//=", ">>=", "<<=", "..."];
const OPS2 = ["->", ":=", "**", "//", "<<", ">>", "<=", ">=", "==", "!=", "+=", "-=", "*=", "/=", "%=",
  "&=", "|=", "^=", "@="];
const OPS1 = "+-*/%@&|^~<>()[]{},:.;=";
const ID_RE = /[\p{XID_Start}_]\p{XID_Continue}*/uy;
// Keywords that may follow a number without a space (CPython still accepts them).
const NUMBER_TAIL_OK = ["and", "else", "for", "if", "in", "is", "not", "or"];
const NUM_RE =
  /(0[xX][0-9a-fA-F]+(?:_[0-9a-fA-F]+)*|0[oO][0-7]+(?:_[0-7]+)*|0[bB][01]+(?:_[01]+)*|(?:\d+(?:_\d+)*)?(?:\.(?:\d+(?:_\d+)*)?)?(?:[eE][+-]?\d+(?:_\d+)*)?)([jJ]?)/y;

// Token: {t, v, line, col, eline, ecol}. t is NAME, KW, NUMBER, STRING, OP, NEWLINE, INDENT,
// DEDENT or ENDMARKER. STRING tokens also carry prefix, raw, quote, bodyStart and body.
// `base` ({line, col}) shifts positions for an expression inside an f-string.
function tokenize(src, base = null) {
  const toks = [];
  try {
    scanTokens(src, base, toks);
  } catch (e) {
    // Tokenizer errors are reported when the parser reaches them, as CPython's lazy tokenizer does.
    if (!(e instanceof PySyntaxError)) throw e;
    toks.push({ t: "ERROR", v: e, line: e.lineno, col: 0, eline: e.lineno, ecol: 0 });
  }
  return toks;
}

function scanTokens(src, base, toks) {
  const n = src.length;
  let i = 0;
  let line = 1;
  let ls = 0; // index where the current line starts
  const indents = [0];
  const altIndents = [0]; // indentation with tabs counted as one column (CPython's altcol)
  const opens = [];
  let bol = true;
  const TAB_ERROR = "inconsistent use of tabs and spaces in indentation";

  const at = (ln, col) => (base && ln === 1 ? [base.line, base.col + col - 1] : base ? [base.line + ln - 1, col] : [ln, col]);
  const fail = (msg, ln) => {
    throw new PySyntaxError(msg, ln);
  };
  const softFail = (msg, ln) => {
    throw new PySyntaxError(msg, ln, true);
  };
  // Pushes a token that started at (sl, sc) and ends at the current position.
  const push = (t, v, sl, sc, extra = null) => {
    const [l0, c0] = at(sl, sc);
    const [l1, c1] = at(line, i - ls);
    const tok = { t, v, line: l0, col: c0, eline: l1, ecol: c1, depth: opens.length };
    if (extra) Object.assign(tok, extra);
    toks.push(tok);
    return tok;
  };
  // End of a plain string body starting at j, or -1 when it is unterminated.
  const plainStringEnd = (j, delim, triple) => {
    while (j < n) {
      if (src[j] === "\\") {
        j += 2;
        continue;
      }
      if (src.startsWith(delim, j)) return j + delim.length;
      if (!triple && src[j] === "\n") return -1;
      j++;
    }
    return -1;
  };
  // End of an f-string body starting at j. PEP 701: a replacement field may hold nested string
  // literals, which can reuse the outer quote character.
  const fstringEnd = (j, delim, triple) => {
    while (j < n) {
      const c = src[j];
      if (c === "\\") {
        j += 2;
        continue;
      }
      if (c === "{") {
        if (src[j + 1] === "{") {
          j += 2;
          continue;
        }
        j = fieldEnd(j + 1);
        if (j < 0) return -2; // a replacement field that never closes on this line
        continue;
      }
      if (c === "}") {
        j += src[j + 1] === "}" ? 2 : 1;
        continue;
      }
      if (src.startsWith(delim, j)) return j + delim.length;
      if (!triple && c === "\n") return -1;
      j++;
    }
    return -1;
  };
  // End of a replacement field whose body starts at j (just after '{'), past its '}'.
  const fieldEnd = (j) => {
    let depth = 0;
    while (j < n) {
      const c = src[j];
      if (c === "'" || c === '"') {
        const triple = src.startsWith(c + c + c, j);
        const delim = triple ? c + c + c : c;
        let k = j;
        while (k > 0 && /[A-Za-z]/.test(src[k - 1])) k--;
        const isF = src.slice(k, j).toLowerCase().includes("f");
        j = isF ? fstringEnd(j + delim.length, delim, triple) : plainStringEnd(j + delim.length, delim, triple);
        if (j < 0) return -1;
        continue;
      }
      if (c === "(" || c === "[" || c === "{") depth++;
      else if (c === ")" || c === "]") {
        if (depth > 0) depth--;
      } else if (c === "}") {
        if (depth === 0) return j + 1;
        depth--;
      }
      j++;
    }
    return -1;
  };
  const scanString = (plen) => {
    const sl = line;
    const sc = i - ls;
    const start = i;
    const prefix = src.slice(i, i + plen).toLowerCase();
    const qpos = i + plen;
    const q = src[qpos];
    const triple = src.startsWith(q + q + q, qpos);
    const qlen = triple ? 3 : 1;
    const delim = q.repeat(qlen);
    const end = prefix.includes("f")
      ? fstringEnd(qpos + qlen, delim, triple)
      : plainStringEnd(qpos + qlen, delim, triple);
    if (end === -2) fail("f-string: expecting '}'", sl);
    if (end < 0) {
      if (triple) fail(`unterminated triple-quoted string literal (detected at line ${countLines(src)})`, sl);
      const eol = src.indexOf("\n", qpos);
      const lineText = src.slice(qpos, eol < 0 ? n : eol);
      const hint = lineText.endsWith("\\" + q) ? "; perhaps you escaped the end quote?" : "";
      fail(`unterminated string literal (detected at line ${sl})${hint}`, sl);
    }
    const raw = src.slice(start, end);
    let lastNl = -1;
    let nl = 0;
    for (let k = 0; k < raw.length; k++) {
      if (raw[k] === "\n") {
        nl++;
        lastNl = k;
      }
    }
    i = end;
    if (nl) {
      line += nl;
      ls = start + lastNl + 1;
    }
    push("STRING", null, sl, sc, {
      prefix,
      raw,
      quote: qlen,
      bodyStart: plen + qlen,
      body: raw.slice(plen + qlen, raw.length - qlen),
    });
  };

  for (;;) {
    if (bol && opens.length === 0) {
      let col = 0;
      let altcol = 0;
      let j = i;
      for (; j < n; j++) {
        const c = src[j];
        if (c === " ") {
          col++;
          altcol++;
        } else if (c === "\t") {
          col = (Math.floor(col / 8) + 1) * 8;
          altcol++;
        } else if (c === "\f") {
          col = 0;
          altcol = 0;
        } else break;
      }
      if (j >= n) {
        i = j;
        break;
      }
      if (src[j] === "\n" || src[j] === "#") {
        // blank or comment-only line: no tokens, no indentation change
        while (j < n && src[j] !== "\n") j++;
        if (j >= n) {
          i = j;
          break;
        }
        i = j + 1;
        line++;
        ls = i;
        continue;
      }
      i = j;
      // Same checks, in the same order, as CPython's tokenizer.
      const top = indents[indents.length - 1];
      if (col === top) {
        if (altcol !== altIndents[altIndents.length - 1]) softFail(TAB_ERROR, line);
      } else if (col > top) {
        if (altcol <= altIndents[altIndents.length - 1]) softFail(TAB_ERROR, line);
        indents.push(col);
        altIndents.push(altcol);
        push("INDENT", "", line, 0);
      } else {
        while (indents.length > 1 && col < indents[indents.length - 1]) {
          indents.pop();
          altIndents.pop();
          push("DEDENT", "", line, 0);
        }
        if (col !== indents[indents.length - 1]) {
          softFail("unindent does not match any outer indentation level", line);
        }
        if (altcol !== altIndents[altIndents.length - 1]) softFail(TAB_ERROR, line);
      }
      bol = false;
    }
    if (i >= n) break;

    const c = src[i];
    const sl = line;
    const sc = i - ls;
    if (c === " " || c === "\t" || c === "\f") {
      i++;
      continue;
    }
    if (c === "#") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (c === "\\") {
      if (src[i + 1] !== "\n") softFail("unexpected character after line continuation character", line);
      if (i + 2 >= n) softFail("unexpected EOF while parsing", line);
      i += 2;
      line++;
      ls = i;
      continue;
    }
    if (c === "\n") {
      if (opens.length === 0) {
        const [l0, c0] = at(sl, sc);
        toks.push({ t: "NEWLINE", v: "", line: l0, col: c0, eline: l0, ecol: c0 + 1 });
      }
      i++;
      line++;
      ls = i;
      if (opens.length === 0) bol = true;
      continue;
    }
    if (c === "'" || c === '"') {
      scanString(0);
      continue;
    }
    ID_RE.lastIndex = i;
    const idm = ID_RE.exec(src);
    if (idm) {
      const word = idm[0];
      const after = src[i + word.length];
      if ((after === "'" || after === '"') && STR_PREFIXES.has(word.toLowerCase())) {
        scanString(word.length);
        continue;
      }
      i += word.length;
      const v = word.normalize("NFKC");
      push(KEYWORDS.has(v) ? "KW" : "NAME", v, sl, sc);
      continue;
    }
    if ((c >= "0" && c <= "9") || (c === "." && src[i + 1] >= "0" && src[i + 1] <= "9")) {
      NUM_RE.lastIndex = i;
      const m = NUM_RE.exec(src);
      const body = m[1];
      const imag = m[2] !== "";
      i += m[0].length;
      const clean = body.replace(/_/g, "");
      let ctype;
      let value;
      if (imag) {
        ctype = "complex";
        value = Number(clean);
      } else if (/^0[xXoObB]/.test(clean)) {
        ctype = "int";
        value = BigInt(clean);
      } else if (/[.eE]/.test(clean)) {
        ctype = "float";
        value = Number(clean);
      } else {
        if (/^0+[1-9]/.test(clean)) {
          fail("leading zeros in decimal integer literals are not permitted; use an 0o prefix for octal integers", line);
        }
        ctype = "int";
        value = BigInt(clean);
      }
      ID_RE.lastIndex = i;
      const tail = ID_RE.exec(src);
      if (tail && !NUMBER_TAIL_OK.some((kw) => tail[0].startsWith(kw))) {
        const kind = m[0].startsWith("0x") || m[0].startsWith("0X") ? "hexadecimal" : m[0].startsWith("0o") || m[0].startsWith("0O") ? "octal" : m[0].startsWith("0b") || m[0].startsWith("0B") ? "binary" : "decimal";
        fail(`invalid ${kind} literal`, line);
      }
      push("NUMBER", { ctype, value }, sl, sc);
      continue;
    }
    let op = null;
    for (const o of OPS3) {
      if (src.startsWith(o, i)) {
        op = o;
        break;
      }
    }
    if (op === null) {
      for (const o of OPS2) {
        if (src.startsWith(o, i)) {
          op = o;
          break;
        }
      }
    }
    if (op === null && OPS1.includes(c)) op = c;
    if (op === null) {
      const cp = src.codePointAt(i);
      if (cp < 128) fail("invalid syntax", line);
      fail(`invalid character '${String.fromCodePoint(cp)}' (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`, line);
    }
    i += op.length;
    if (op === "(" || op === "[" || op === "{") {
      if (opens.length >= 200) fail("too many nested parentheses", line); // CPython's MAXLEVEL
      opens.push({ ch: op, line: sl });
    } else if (op === ")" || op === "]" || op === "}") {
      if (opens.length === 0) fail(`unmatched '${op}'`, line);
      const o = opens.pop();
      const want = { "(": ")", "[": "]", "{": "}" }[o.ch];
      if (want !== op) {
        const where = o.line !== line ? ` on line ${o.line}` : "";
        fail(`closing parenthesis '${op}' does not match opening parenthesis '${o.ch}'${where}`, line);
      }
    }
    push("OP", op, sl, sc);
  }

  if (opens.length) {
    const o = opens[opens.length - 1];
    const err = new PySyntaxError(`'${o.ch}' was never closed`, o.line, true);
    err.unclosed = o;
    throw err;
  }
  if (!bol && toks.length) {
    toks.push({ t: "NEWLINE", v: "", line, col: i - ls, eline: line, ecol: i - ls });
  }
  while (indents.length > 1) {
    indents.pop();
    toks.push({ t: "DEDENT", v: "", line, col: 0, eline: line, ecol: 0 });
  }
  toks.push({ t: "ENDMARKER", v: "", line, col: 0, eline: line, ecol: 0 });
}

// The line CPython reports as "detected at": the last line that has text.
function countLines(src) {
  const nl = src.split("\n").length - 1;
  return src.length && !src.endsWith("\n") ? nl + 1 : Math.max(nl, 1);
}

// ---------------------------------------------------------------------------
// String literals
// ---------------------------------------------------------------------------

const SIMPLE_ESCAPES = { "\\": "\\", "'": "'", '"': '"', a: "\x07", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v" };

// Decodes backslash escapes in the body of a non-raw string literal.
function decodeEscapes(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== "\\" || i + 1 >= s.length) {
      out += c;
      continue;
    }
    const d = s[i + 1];
    if (d === "\n") {
      i++;
      continue;
    }
    if (Object.hasOwn(SIMPLE_ESCAPES, d)) {
      out += SIMPLE_ESCAPES[d];
      i++;
      continue;
    }
    if (d >= "0" && d <= "7") {
      let k = i + 1;
      let v = 0;
      for (let cnt = 0; cnt < 3 && k < s.length && s[k] >= "0" && s[k] <= "7"; cnt++, k++) v = v * 8 + Number(s[k]);
      out += String.fromCodePoint(v);
      i = k - 1;
      continue;
    }
    const hexLen = d === "x" ? 2 : d === "u" ? 4 : d === "U" ? 8 : 0;
    if (hexLen) {
      const hex = s.slice(i + 2, i + 2 + hexLen);
      if (hex.length === hexLen && /^[0-9a-fA-F]+$/.test(hex)) {
        out += String.fromCodePoint(parseInt(hex, 16));
        i += 1 + hexLen;
        continue;
      }
    }
    // unknown escape (or \N{...}, which needs the Unicode name table): keep the backslash
    out += "\\";
  }
  return out;
}

function addLiteral(values, s) {
  if (!s) return;
  const last = values[values.length - 1];
  if (last && last._type === "Constant") last.value += s;
  else values.push({ _type: "Constant", value: s, ctype: "str", kind: null });
}

// Constant parts of a JoinedStr take the position of the whole f-string, as in CPython.
function copyPos(to, from) {
  to.lineno = from.lineno;
  to.col_offset = from.col_offset;
  to.end_lineno = from.end_lineno;
  to.end_col_offset = from.end_col_offset;
}

function stampJoined(j) {
  for (const v of j.values) {
    copyPos(v, j);
    if (v._type === "FormattedValue" && v.format_spec) {
      copyPos(v.format_spec, j);
      stampJoined(v.format_spec);
    }
  }
}

// Line and column of index idx inside a STRING token's raw text.
function posInToken(tok, idx) {
  const parts = tok.raw.slice(0, idx).split("\n");
  if (parts.length === 1) return { line: tok.line, col: tok.col + idx };
  return { line: tok.line + parts.length - 1, col: parts[parts.length - 1].length };
}

// End of an f-string replacement-field expression starting at i (exclusive of `to`).
// Stops at the '}' that closes the field, or at a top-level '!', ':' or self-documenting '='.
function scanFieldExpr(raw, i, to) {
  let depth = 0;
  let j = i;
  while (j < to) {
    const c = raw[j];
    if (c === "'" || c === '"') {
      const q = raw.startsWith(c + c + c, j) ? c + c + c : c;
      const close = raw.indexOf(q, j + q.length);
      if (close < 0 || close >= to) return j;
      j = close + q.length;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) return j;
      depth--;
    } else if (depth === 0) {
      if (c === "!" && raw[j + 1] !== "=") return j;
      if (c === ":") return j;
      if (c === "=" && raw[j + 1] !== "=" && !"=!<>".includes(raw[j - 1] ?? "")) return j;
    }
    j++;
  }
  return j;
}

// ---------------------------------------------------------------------------
// Parser (recursive descent over the token list)
// ---------------------------------------------------------------------------

const AUG_OPS = Object.freeze({
  "+=": "Add", "-=": "Sub", "*=": "Mult", "@=": "MatMult", "/=": "Div", "%=": "Mod", "&=": "BitAnd",
  "|=": "BitOr", "^=": "BitXor", "<<=": "LShift", ">>=": "RShift", "**=": "Pow", "//=": "FloorDiv",
});
const CMP_OPS = Object.freeze({ "<": "Lt", ">": "Gt", "==": "Eq", ">=": "GtE", "<=": "LtE", "!=": "NotEq" });
// Binary operator levels from loosest to tightest (bitwise or ... multiplicative).
const BIN_LEVELS = [
  Object.freeze({ "|": "BitOr" }),
  Object.freeze({ "^": "BitXor" }),
  Object.freeze({ "&": "BitAnd" }),
  Object.freeze({ "<<": "LShift", ">>": "RShift" }),
  Object.freeze({ "+": "Add", "-": "Sub" }),
  Object.freeze({ "*": "Mult", "@": "MatMult", "/": "Div", "%": "Mod", "//": "FloorDiv" }),
];
const DESCRIBE = {
  Call: "function call", Constant: "literal", BinOp: "expression", UnaryOp: "expression",
  BoolOp: "expression", Compare: "comparison", Lambda: "lambda", IfExp: "conditional expression",
  Await: "await expression", Yield: "yield expression", YieldFrom: "yield expression",
  JoinedStr: "f-string expression", Dict: "dict literal", Set: "set display",
  ListComp: "list comprehension", SetComp: "set comprehension", DictComp: "dict comprehension",
  GeneratorExp: "generator expression", NamedExpr: "named expression",
};
const SKIP_END = new Set(["NEWLINE", "INDENT", "DEDENT"]);

class Parser {
  constructor(toks) {
    this.toks = toks;
    this.p = 0;
    this.end = { line: 1, col: 0 }; // end of the last significant token consumed
  }

  // The current token. A tokenizer error is thrown only when the parser reaches it.
  tok() {
    const t = this.toks[this.p];
    if (t.t === "ERROR") throw t.v;
    return t;
  }

  peek(k) {
    const t = this.toks[Math.min(this.p + k, this.toks.length - 1)];
    if (t.t === "ERROR") throw t.v;
    return t;
  }

  next() {
    const t = this.tok();
    if (t.t !== "ENDMARKER") this.p++;
    if (!SKIP_END.has(t.t)) this.end = { line: t.eline, col: t.ecol };
    return t;
  }

  isOp(v, t = this.tok()) {
    return t.t === "OP" && t.v === v;
  }

  isKw(v, t = this.tok()) {
    return t.t === "KW" && t.v === v;
  }

  eatOp(v) {
    return this.isOp(v) ? this.next() : null;
  }

  eatKw(v) {
    return this.isKw(v) ? this.next() : null;
  }

  expectOp(v) {
    if (!this.isOp(v)) {
      const t = this.tok();
      if ((v === ")" || v === "]" || v === "}") && t.depth > 0 && this.startsExpr() && this.lastOrLine !== undefined) {
        throw new PySyntaxError("invalid syntax. Perhaps you forgot a comma?", this.lastOrLine, false, t.line);
      }
      this.fail(v === ":" ? "expected ':'" : "invalid syntax", t);
    }
    return this.next();
  }

  expectKw(v) {
    if (!this.isKw(v)) this.fail("invalid syntax", this.tok());
    return this.next();
  }

  nameTok() {
    const t = this.tok();
    if (t.t !== "NAME") this.fail("invalid syntax", t);
    return this.next();
  }

  fail(msg, tok) {
    throw new PySyntaxError(msg, tok.line, false, tok.line);
  }

  failAt(msg, line) {
    throw new PySyntaxError(msg, line);
  }

  // Gives a node the span from the start token to the end of the last token consumed.
  finish(node, start) {
    node.lineno = start.line;
    node.col_offset = start.col;
    node.end_lineno = this.end.line;
    node.end_col_offset = this.end.col;
    return node;
  }

  expectNewline() {
    const t = this.tok();
    if (t.t === "NEWLINE") return this.next();
    if (t.t === "ENDMARKER") return null;
    return this.fail("invalid syntax", t);
  }

  startsExpr() {
    const t = this.tok();
    if (t.t === "NAME" || t.t === "NUMBER" || t.t === "STRING") return true;
    if (t.t === "KW") return ["None", "True", "False", "not", "lambda", "await"].includes(t.v);
    if (t.t === "OP") return ["(", "[", "{", "-", "+", "~", "*", "..."].includes(t.v);
    return false;
  }

  setCtx(node, ctx) {
    if (node._type === "Constant" && node.ctype === "NoneType") this.failAt(`cannot ${ctx === "Del" ? "delete" : "assign to"} None`, node.lineno);
    switch (node._type) {
      case "Name":
      case "Attribute":
      case "Subscript":
        node.ctx = ctx;
        return;
      case "Starred":
        node.ctx = ctx;
        this.setCtx(node.value, ctx);
        return;
      case "Tuple":
      case "List":
        node.ctx = ctx;
        for (const e of node.elts) this.setCtx(e, ctx);
        return;
      default:
        this.failAt(`cannot ${ctx === "Del" ? "delete" : "assign to"} ${DESCRIBE[node._type] || "expression"}`, node.lineno);
    }
  }

  // ---- statements ----

  fileInput() {
    const body = [];
    while (this.tok().t !== "ENDMARKER") body.push(...this.statement());
    return { _type: "Module", body, type_ignores: [] };
  }

  statement() {
    const t = this.tok();
    if (t.t === "INDENT") this.fail("unexpected indent", t);
    if (this.isOp("@") || (t.t === "KW" && ["if", "while", "for", "try", "with", "def", "class", "async"].includes(t.v))) {
      return [this.compound()];
    }
    if (t.t === "NAME" && t.v === "match" && this.looksLikeMatch()) return [this.matchStmt()];
    return this.simpleStmts();
  }

  compound() {
    const decorators = [];
    while (this.isOp("@")) {
      this.next();
      decorators.push(this.namedExprTest());
      this.expectNewline();
    }
    if (this.isKw("async")) {
      const at = this.next();
      if (this.isKw("def")) return this.funcDef(decorators, at, true);
      if (decorators.length) this.fail("invalid syntax", this.tok());
      if (this.isKw("for")) return this.forStmt(at, true);
      if (this.isKw("with")) return this.withStmt(at, true);
      return this.fail("invalid syntax", this.tok());
    }
    if (this.isKw("def")) return this.funcDef(decorators, this.tok(), false);
    if (this.isKw("class")) return this.classDef(decorators);
    if (decorators.length) this.fail("invalid syntax", this.tok());
    if (this.isKw("if")) return this.ifStmt();
    if (this.isKw("while")) return this.whileStmt();
    if (this.isKw("for")) return this.forStmt(this.tok(), false);
    if (this.isKw("with")) return this.withStmt(this.tok(), false);
    if (this.isKw("try")) return this.tryStmt();
    return this.fail("invalid syntax", this.tok());
  }

  // Block after a header: ':' then either a simple statement line or NEWLINE INDENT ... DEDENT.
  suite(desc, hdrLine) {
    this.expectOp(":");
    if (this.tok().t !== "NEWLINE") return this.simpleStmts();
    this.next();
    if (this.tok().t !== "INDENT") this.fail(`expected an indented block after ${desc} on line ${hdrLine}`, this.tok());
    this.next();
    const body = [];
    while (this.tok().t !== "DEDENT" && this.tok().t !== "ENDMARKER") body.push(...this.statement());
    if (this.tok().t === "DEDENT") this.next();
    return body;
  }

  // PEP 695 type parameters: [T, U: bound, *Ts, **P]. Parsed and dropped (they never reach the translator).
  typeParams() {
    if (!this.eatOp("[")) return;
    while (!this.isOp("]")) {
      this.eatOp("*") || this.eatOp("**");
      this.nameTok();
      if (this.eatOp(":")) this.test();
      if (this.eatOp("=")) this.test();
      if (!this.eatOp(",")) break;
    }
    this.expectOp("]");
  }

  funcDef(decorators, start, isAsync) {
    this.expectKw("def");
    const name = this.nameTok().v;
    this.typeParams();
    this.expectOp("(");
    const args = this.params(")", true);
    this.expectOp(")");
    let returns = null;
    if (this.eatOp("->")) returns = this.test();
    const body = this.suite("function definition", start.line);
    return this.finish(
      {
        _type: isAsync ? "AsyncFunctionDef" : "FunctionDef",
        name, args, body, decorator_list: decorators, returns, type_comment: null, type_params: [],
      },
      start,
    );
  }

  classDef(decorators) {
    const start = this.next();
    const name = this.nameTok().v;
    this.typeParams();
    let bases = [];
    let keywords = [];
    if (this.eatOp("(")) ({ args: bases, keywords } = this.callArgs());
    const body = this.suite("class definition", start.line);
    return this.finish({ _type: "ClassDef", name, bases, keywords, body, decorator_list: decorators, type_params: [] }, start);
  }

  ifStmt() {
    const start = this.next(); // 'if' or 'elif'
    const test = this.namedExprTest();
    const body = this.suite(`'${start.v}' statement`, start.line);
    let orelse = [];
    if (this.isKw("elif")) orelse = [this.ifStmt()];
    else if (this.isKw("else")) {
      const e = this.next();
      orelse = this.suite("'else' statement", e.line);
    }
    return this.finish({ _type: "If", test, body, orelse }, start);
  }

  whileStmt() {
    const start = this.next();
    const test = this.namedExprTest();
    const body = this.suite("'while' statement", start.line);
    let orelse = [];
    if (this.isKw("else")) {
      const e = this.next();
      orelse = this.suite("'else' statement", e.line);
    }
    return this.finish({ _type: "While", test, body, orelse }, start);
  }

  forStmt(start, isAsync) {
    const forTok = this.expectKw("for");
    const target = this.targetList();
    this.expectKw("in");
    const iter = this.testlistStar();
    const body = this.suite("'for' statement", forTok.line);
    let orelse = [];
    if (this.isKw("else")) {
      const e = this.next();
      orelse = this.suite("'else' statement", e.line);
    }
    return this.finish({ _type: isAsync ? "AsyncFor" : "For", target, iter, body, orelse, type_comment: null }, start);
  }

  withStmt(start, isAsync) {
    const withTok = this.expectKw("with");
    let items = null;
    if (this.isOp("(")) {
      // Parenthesized with-items: try them, and fall back to a plain expression on failure.
      const save = this.p;
      try {
        this.next();
        const its = [];
        while (!this.isOp(")")) {
          its.push(this.withItem());
          if (!this.eatOp(",")) break;
        }
        this.expectOp(")");
        if (!this.isOp(":")) this.fail("invalid syntax", this.tok());
        items = its;
      } catch (e) {
        if (!(e instanceof PySyntaxError)) throw e;
        this.p = save;
      }
    }
    if (items === null) {
      items = [this.withItem()];
      while (this.eatOp(",")) items.push(this.withItem());
    }
    const body = this.suite("'with' statement", withTok.line);
    return this.finish({ _type: isAsync ? "AsyncWith" : "With", items, body, type_comment: null }, start);
  }

  withItem() {
    const context_expr = this.test();
    let optional_vars = null;
    if (this.eatKw("as")) {
      optional_vars = this.expr();
      this.setCtx(optional_vars, "Store");
    }
    return { _type: "withitem", context_expr, optional_vars };
  }

  tryStmt() {
    const start = this.next();
    const body = this.suite("'try' statement", start.line);
    const handlers = [];
    let star = false;
    while (this.isKw("except")) {
      const h = this.next();
      if (this.eatOp("*")) star = true;
      let type = null;
      let name = null;
      if (!this.isOp(":")) {
        type = this.test();
        if (this.eatKw("as")) name = this.nameTok().v;
      }
      const hbody = this.suite("'except' statement", h.line);
      handlers.push(this.finish({ _type: "ExceptHandler", type, name, body: hbody }, h));
    }
    let orelse = [];
    let finalbody = [];
    if (handlers.length && this.isKw("else")) {
      const e = this.next();
      orelse = this.suite("'else' statement", e.line);
    }
    if (this.isKw("finally")) {
      const f = this.next();
      finalbody = this.suite("'finally' statement", f.line);
    }
    if (!handlers.length && !finalbody.length) this.fail("expected 'except' or 'finally' block", this.tok());
    return this.finish({ _type: star ? "TryStar" : "Try", body, handlers, orelse, finalbody }, start);
  }

  simpleStmts() {
    const out = [this.smallStmt()];
    while (this.eatOp(";")) {
      if (this.tok().t === "NEWLINE" || this.tok().t === "ENDMARKER") break;
      out.push(this.smallStmt());
    }
    this.expectNewline();
    return out;
  }

  // 'type X[T] = expr' (PEP 695). Recognised by its shape; otherwise 'type' is an ordinary name.
  looksLikeTypeAlias() {
    const t1 = this.peek(1);
    const t2 = this.peek(2);
    return t1.t === "NAME" && (this.isOp("=", t2) || this.isOp("[", t2));
  }

  // 'match subject:' NEWLINE INDENT 'case' ... (soft keyword; a plain name otherwise).
  looksLikeMatch() {
    let depth = 0;
    let k = this.p + 1;
    let colon = -1;
    for (; k < this.toks.length; k++) {
      const t = this.toks[k];
      if (t.t === "ERROR" || t.t === "ENDMARKER") return false;
      if (t.t === "NEWLINE") break;
      if (t.t === "OP") {
        if ("([{".includes(t.v)) depth++;
        else if (")]}".includes(t.v)) depth--;
        else if (t.v === ":" && depth === 0) colon = k;
      }
    }
    return colon > 0 && this.toks[colon + 1].t === "NEWLINE" && this.toks[colon + 2].t === "INDENT" &&
      this.toks[colon + 3].t === "NAME" && this.toks[colon + 3].v === "case";
  }

  matchStmt() {
    const start = this.next(); // 'match'
    let subject = this.starOrNamed();
    if (this.isOp(",")) {
      const elts = [subject];
      while (this.eatOp(",")) {
        if (this.isOp(":")) break;
        elts.push(this.starOrNamed());
      }
      subject = this.finish({ _type: "Tuple", elts, ctx: "Load" }, start);
    }
    this.expectOp(":");
    this.expectNewline();
    if (this.tok().t !== "INDENT") this.fail(`expected an indented block after 'match' statement on line ${start.line}`, this.tok());
    this.next();
    const cases = [];
    while (this.tok().t === "NAME" && this.tok().v === "case") {
      const c = this.next();
      const pattern = this.pattern();
      const guard = this.eatKw("if") ? this.namedExprTest() : null;
      const body = this.suite("'case' statement", c.line);
      cases.push({ _type: "match_case", pattern, guard, body });
    }
    if (!cases.length) this.fail("invalid syntax", this.tok());
    if (this.tok().t === "DEDENT") this.next();
    return this.finish({ _type: "Match", subject, cases }, start);
  }

  // Patterns are read with expression grammar: the translator only needs to see the Match node.
  pattern() {
    const start = this.tok();
    const one = () => (this.isOp("*") ? this.starOrNamed() : this.expr());
    let p = one();
    if (this.isOp(",")) {
      const elts = [p];
      while (this.eatOp(",")) {
        if (this.isOp(":") || this.isKw("if")) break;
        elts.push(one());
      }
      p = this.finish({ _type: "Tuple", elts, ctx: "Load" }, start);
    }
    if (this.eatKw("as")) {
      const name = this.nameTok().v;
      return this.finish({ _type: "MatchAs", pattern: p, name }, start);
    }
    return p;
  }

  smallStmt() {
    const t = this.tok();
    if (t.t === "NAME" && t.v === "type" && this.looksLikeTypeAlias()) {
      this.next();
      const nameTok = this.nameTok();
      const name = this.finish({ _type: "Name", id: nameTok.v, ctx: "Store" }, nameTok);
      this.typeParams();
      this.expectOp("=");
      const value = this.test();
      return this.finish({ _type: "TypeAlias", name, type_params: [], value }, t);
    }
    if (t.t === "KW") {
      switch (t.v) {
        case "pass":
          this.next();
          return this.finish({ _type: "Pass" }, t);
        case "break":
          this.next();
          return this.finish({ _type: "Break" }, t);
        case "continue":
          this.next();
          return this.finish({ _type: "Continue" }, t);
        case "return": {
          this.next();
          const value = this.startsExpr() ? this.testlistStar() : null;
          return this.finish({ _type: "Return", value }, t);
        }
        case "raise": {
          this.next();
          let exc = null;
          let cause = null;
          if (this.startsExpr()) {
            exc = this.test();
            if (this.eatKw("from")) cause = this.test();
          }
          return this.finish({ _type: "Raise", exc, cause }, t);
        }
        case "global":
        case "nonlocal": {
          this.next();
          const names = [this.nameTok().v];
          while (this.eatOp(",")) names.push(this.nameTok().v);
          return this.finish({ _type: t.v === "global" ? "Global" : "Nonlocal", names }, t);
        }
        case "del": {
          this.next();
          const targets = [this.expr()];
          while (this.eatOp(",")) {
            if (!this.startsExpr()) break;
            targets.push(this.expr());
          }
          for (const x of targets) this.setCtx(x, "Del");
          return this.finish({ _type: "Delete", targets }, t);
        }
        case "assert": {
          this.next();
          const test = this.test();
          const msg = this.eatOp(",") ? this.test() : null;
          return this.finish({ _type: "Assert", test, msg }, t);
        }
        case "import":
          return this.importStmt();
        case "from":
          return this.fromStmt();
        default:
          break;
      }
    }
    return this.exprStmt();
  }

  dottedName() {
    let s = this.nameTok().v;
    while (this.eatOp(".")) s += "." + this.nameTok().v;
    return s;
  }

  importStmt() {
    const start = this.next();
    const names = [];
    do {
      const s = this.tok();
      const name = this.dottedName();
      const asname = this.eatKw("as") ? this.nameTok().v : null;
      names.push(this.finish({ _type: "alias", name, asname }, s));
    } while (this.eatOp(","));
    return this.finish({ _type: "Import", names }, start);
  }

  fromStmt() {
    const start = this.next();
    let level = 0;
    while (this.isOp(".") || this.isOp("...")) {
      level += this.tok().v === "." ? 1 : 3;
      this.next();
    }
    const module = this.isKw("import") ? null : this.dottedName();
    this.expectKw("import");
    const names = [];
    if (this.isOp("*")) {
      const s = this.next();
      names.push(this.finish({ _type: "alias", name: "*", asname: null }, s));
    } else {
      const paren = this.eatOp("(");
      do {
        if (paren && this.isOp(")")) break;
        const s = this.tok();
        const name = this.nameTok().v;
        const asname = this.eatKw("as") ? this.nameTok().v : null;
        names.push(this.finish({ _type: "alias", name, asname }, s));
      } while (this.eatOp(","));
      if (paren) this.expectOp(")");
    }
    return this.finish({ _type: "ImportFrom", module, names, level }, start);
  }

  exprStmt() {
    const start = this.tok();
    const first = this.isKw("yield") ? this.yieldExpr() : this.testlistStar();
    if (this.isOp(":")) {
      if (!["Name", "Attribute", "Subscript"].includes(first._type)) {
        this.failAt(first._type === "Tuple" ? "only single target (not tuple) can be annotated" : "illegal target for annotation", first.lineno);
      }
      this.next();
      const annotation = this.test();
      let value = null;
      if (this.eatOp("=")) value = this.isKw("yield") ? this.yieldExpr() : this.testlistStar();
      this.setCtx(first, "Store");
      const simple = first._type === "Name" && !first.parenthesized ? 1 : 0;
      return this.finish({ _type: "AnnAssign", target: first, annotation, value, simple }, start);
    }
    const t = this.tok();
    if (t.t === "OP" && Object.hasOwn(AUG_OPS, t.v)) {
      if (!["Name", "Attribute", "Subscript"].includes(first._type)) {
        this.failAt(`'${DESCRIBE[first._type] || "expression"}' is an illegal expression for augmented assignment`, first.lineno);
      }
      this.next();
      const value = this.isKw("yield") ? this.yieldExpr() : this.testlistStar();
      this.setCtx(first, "Store");
      return this.finish({ _type: "AugAssign", target: first, op: AUG_OPS[t.v], value }, start);
    }
    if (this.isOp("=")) {
      const exprs = [first];
      while (this.eatOp("=")) exprs.push(this.isKw("yield") ? this.yieldExpr() : this.testlistStar());
      const value = exprs.pop();
      for (const x of exprs) this.setCtx(x, "Store");
      return this.finish({ _type: "Assign", targets: exprs, value, type_comment: null }, start);
    }
    return this.finish({ _type: "Expr", value: first }, start);
  }

  // Parameters up to `closer` (')' for def, ':' for lambda), with annotations only for def.
  params(closer, annotated) {
    const posonly = [];
    const args = [];
    const kwonly = [];
    const kwDefaults = [];
    const defaults = [];
    let vararg = null;
    let kwarg = null;
    let star = false;
    let slashSeen = false;
    const one = () => {
      this.lastOrLine = undefined; // only an annotation or default value can trigger the comma hint
      const t = this.nameTok();
      const annotation = annotated && this.eatOp(":") ? this.test() : null;
      return this.finish({ _type: "arg", arg: t.v, annotation, type_comment: null }, t);
    };
    while (!this.isOp(closer)) {
      if (this.isOp("/")) {
        if (slashSeen || star || (!args.length && !posonly.length)) this.fail("invalid syntax", this.tok());
        this.next();
        posonly.push(...args);
        args.length = 0;
        slashSeen = true;
      } else if (this.isOp("*")) {
        if (star) this.fail("invalid syntax", this.tok());
        this.next();
        star = true;
        if (this.tok().t === "NAME") vararg = one();
      } else if (this.isOp("**")) {
        this.next();
        kwarg = one();
      } else {
        const a = one();
        const d = this.eatOp("=") ? this.test() : null;
        if (star) {
          kwonly.push(a);
          kwDefaults.push(d);
        } else {
          args.push(a);
          if (d) defaults.push(d);
          else if (defaults.length) this.fail("parameter without a default follows parameter with a default", this.tok());
        }
      }
      if (!this.eatOp(",")) break;
    }
    return {
      _type: "arguments",
      posonlyargs: posonly, args, vararg, kwonlyargs: kwonly, kw_defaults: kwDefaults, kwarg, defaults,
    };
  }

  // ---- expressions ----

  testlistStar() {
    const start = this.tok();
    const first = this.starOrTest();
    if (!this.isOp(",")) return first;
    const elts = [first];
    while (this.eatOp(",")) {
      if (!this.startsExpr()) break;
      elts.push(this.starOrTest());
    }
    return this.finish({ _type: "Tuple", elts, ctx: "Load" }, start);
  }

  starOrTest() {
    if (this.isOp("*")) {
      const s = this.next();
      const value = this.expr();
      return this.finish({ _type: "Starred", value, ctx: "Load" }, s);
    }
    return this.test();
  }

  starOrNamed() {
    if (this.isOp("*")) {
      const s = this.next();
      const value = this.expr();
      return this.finish({ _type: "Starred", value, ctx: "Load" }, s);
    }
    return this.namedExprTest();
  }

  // Targets of for-loops and comprehensions: bitwise-or level, so 'in' is not consumed.
  targetList() {
    const start = this.tok();
    const items = [this.targetItem()];
    let comma = false;
    while (this.eatOp(",")) {
      comma = true;
      if (!this.startsExpr()) break;
      items.push(this.targetItem());
    }
    const node = comma ? this.finish({ _type: "Tuple", elts: items, ctx: "Load" }, start) : items[0];
    this.setCtx(node, "Store");
    return node;
  }

  targetItem() {
    if (this.isOp("*")) {
      const s = this.next();
      const value = this.expr();
      return this.finish({ _type: "Starred", value, ctx: "Load" }, s);
    }
    return this.expr();
  }

  namedExprTest() {
    const start = this.tok();
    const e = this.test();
    if (!this.isOp(":=")) return e;
    if (e._type !== "Name") this.failAt(`cannot use assignment expressions with ${DESCRIBE[e._type] || "expression"}`, e.lineno);
    this.next();
    e.ctx = "Store";
    const value = this.test();
    return this.finish({ _type: "NamedExpr", target: e, value }, start);
  }

  test() {
    if (this.isKw("lambda")) return this.lambda();
    const start = this.tok();
    const body = this.orTest();
    if (!this.isKw("if")) return body;
    this.next();
    const test = this.orTest();
    this.expectKw("else");
    const orelse = this.test();
    return this.finish({ _type: "IfExp", test, body, orelse }, start);
  }

  lambda() {
    const start = this.next();
    const args = this.params(":", false);
    this.expectOp(":");
    const body = this.test();
    return this.finish({ _type: "Lambda", args, body }, start);
  }

  boolChain(kw, opName, sub) {
    const start = this.tok();
    const first = sub();
    if (!this.isKw(kw)) return first;
    const values = [first];
    while (this.eatKw(kw)) values.push(sub());
    return this.finish({ _type: "BoolOp", op: opName, values }, start);
  }

  orTest() {
    const start = this.tok();
    const node = this.boolChain("or", "Or", () => this.andTest());
    this.lastOrLine = start.line; // the last disjunction parsed: CPython's "forgot a comma" error
    return node;
  }

  andTest() {
    return this.boolChain("and", "And", () => this.notTest());
  }

  notTest() {
    if (this.isKw("not")) {
      const start = this.next();
      const operand = this.notTest();
      return this.finish({ _type: "UnaryOp", op: "Not", operand }, start);
    }
    return this.comparison();
  }

  comparison() {
    const start = this.tok();
    const left = this.expr();
    const ops = [];
    const comparators = [];
    for (;;) {
      const t = this.tok();
      let op = null;
      if (t.t === "OP" && Object.hasOwn(CMP_OPS, t.v)) {
        op = CMP_OPS[t.v];
        this.next();
      } else if (this.isKw("in")) {
        this.next();
        op = "In";
      } else if (this.isKw("not") && this.isKw("in", this.peek(1))) {
        this.next();
        this.next();
        op = "NotIn";
      } else if (this.isKw("is")) {
        this.next();
        op = this.eatKw("not") ? "IsNot" : "Is";
      } else break;
      ops.push(op);
      comparators.push(this.expr());
    }
    return ops.length ? this.finish({ _type: "Compare", left, ops, comparators }, start) : left;
  }

  // Bitwise-or and tighter (the Python 'expr' rule).
  expr() {
    return this.binLevel(0);
  }

  binLevel(k) {
    if (k === BIN_LEVELS.length) return this.factor();
    const start = this.tok();
    let left = this.binLevel(k + 1);
    while (this.tok().t === "OP" && Object.hasOwn(BIN_LEVELS[k], this.tok().v)) {
      const op = BIN_LEVELS[k][this.next().v];
      const right = this.binLevel(k + 1);
      left = this.finish({ _type: "BinOp", left, op, right }, start);
    }
    return left;
  }

  factor() {
    const t = this.tok();
    if (t.t === "OP" && (t.v === "+" || t.v === "-" || t.v === "~")) {
      this.next();
      const operand = this.factor();
      const op = { "+": "UAdd", "-": "USub", "~": "Invert" }[t.v];
      return this.finish({ _type: "UnaryOp", op, operand }, t);
    }
    return this.power();
  }

  power() {
    const start = this.tok();
    const base = this.awaitPrimary();
    if (this.isOp("**")) {
      this.next();
      const right = this.factor();
      return this.finish({ _type: "BinOp", left: base, op: "Pow", right }, start);
    }
    return base;
  }

  awaitPrimary() {
    if (this.isKw("await")) {
      const start = this.next();
      const value = this.primary();
      return this.finish({ _type: "Await", value }, start);
    }
    return this.primary();
  }

  primary() {
    const start = this.tok();
    let e = this.atom();
    for (;;) {
      if (this.eatOp("(")) {
        const { args, keywords } = this.callArgs();
        e = this.finish({ _type: "Call", func: e, args, keywords }, start);
      } else if (this.eatOp("[")) {
        const slice = this.subscriptList();
        this.expectOp("]");
        e = this.finish({ _type: "Subscript", value: e, slice, ctx: "Load" }, start);
      } else if (this.eatOp(".")) {
        const attr = this.nameTok().v;
        e = this.finish({ _type: "Attribute", value: e, attr, ctx: "Load" }, start);
      } else break;
    }
    return e;
  }

  // Call arguments after '(' up to and including ')'.
  callArgs() {
    const args = [];
    const keywords = [];
    const bare = []; // generator expressions written without their own parentheses
    while (!this.isOp(")")) {
      const t = this.tok();
      if (this.isOp("*")) {
        this.next();
        const value = this.test();
        args.push(this.finish({ _type: "Starred", value, ctx: "Load" }, t));
      } else if (this.isOp("**")) {
        this.next();
        const value = this.test();
        keywords.push(this.finish({ _type: "keyword", arg: null, value }, t));
      } else if (t.t === "NAME" && this.isOp("=", this.peek(1))) {
        this.next();
        this.next();
        const value = this.test();
        keywords.push(this.finish({ _type: "keyword", arg: t.v, value }, t));
      } else {
        const e = this.namedExprTest();
        if (this.isKw("for") || (this.isKw("async") && this.isKw("for", this.peek(1)))) {
          const generators = this.compFor();
          const g = this.finish({ _type: "GeneratorExp", elt: e, generators }, t);
          bare.push(g);
          args.push(g);
        } else args.push(e);
      }
      if (!this.eatOp(",")) break;
    }
    this.expectOp(")");
    if (args.length + keywords.length > 1 && bare.length) {
      this.failAt("Generator expression must be parenthesized", bare[0].lineno);
    }
    return { args, keywords };
  }

  subscriptList() {
    const start = this.tok();
    const items = [this.subscript()];
    let comma = false;
    while (this.eatOp(",")) {
      comma = true;
      if (this.isOp("]")) break;
      items.push(this.subscript());
    }
    // a[*x] is a one-element Tuple in CPython's AST; a plain subscript is not
    if (!comma && items[0]._type !== "Starred") return items[0];
    return this.finish({ _type: "Tuple", elts: items, ctx: "Load" }, start);
  }

  subscript() {
    const start = this.tok();
    if (this.isOp("*")) {
      this.next();
      const value = this.expr();
      return this.finish({ _type: "Starred", value, ctx: "Load" }, start);
    }
    let lower = null;
    if (!this.isOp(":")) {
      lower = this.test();
      if (!this.isOp(":")) return lower;
    }
    this.next(); // ':'
    let upper = null;
    let step = null;
    if (!this.isOp(":") && !this.isOp("]") && !this.isOp(",")) upper = this.test();
    if (this.eatOp(":") && !this.isOp("]") && !this.isOp(",")) step = this.test();
    return this.finish({ _type: "Slice", lower, upper, step }, start);
  }

  yieldExpr() {
    const start = this.next();
    if (this.eatKw("from")) {
      const value = this.test();
      return this.finish({ _type: "YieldFrom", value }, start);
    }
    const value = this.startsExpr() ? this.testlistStar() : null;
    return this.finish({ _type: "Yield", value }, start);
  }

  atom() {
    const t = this.tok();
    if (t.t === "NAME") {
      this.next();
      return this.finish({ _type: "Name", id: t.v, ctx: "Load" }, t);
    }
    if (t.t === "NUMBER") {
      this.next();
      return this.finish({ _type: "Constant", value: t.v.value, ctype: t.v.ctype, kind: null }, t);
    }
    if (t.t === "STRING") return this.strings();
    if (t.t === "KW" && (t.v === "None" || t.v === "True" || t.v === "False")) {
      this.next();
      const value = t.v === "None" ? null : t.v === "True";
      return this.finish({ _type: "Constant", value, ctype: t.v === "None" ? "NoneType" : "bool", kind: null }, t);
    }
    if (this.isOp("...")) {
      this.next();
      return this.finish({ _type: "Constant", value: "Ellipsis", ctype: "ellipsis", kind: null }, t);
    }
    if (this.isOp("(")) return this.parenAtom();
    if (this.isOp("[")) return this.listAtom();
    if (this.isOp("{")) return this.braceAtom();
    return this.fail("invalid syntax", t);
  }

  parenAtom() {
    const start = this.next();
    if (this.eatOp(")")) return this.finish({ _type: "Tuple", elts: [], ctx: "Load" }, start);
    if (this.isKw("yield")) {
      const y = this.yieldExpr();
      this.expectOp(")");
      y.parenthesized = true;
      return y;
    }
    const first = this.starOrNamed();
    if (this.isKw("for") || (this.isKw("async") && this.isKw("for", this.peek(1)))) {
      const generators = this.compFor();
      this.expectOp(")");
      return this.finish({ _type: "GeneratorExp", elt: first, generators }, start);
    }
    if (this.isOp(",")) {
      const elts = [first];
      while (this.eatOp(",")) {
        if (this.isOp(")")) break;
        elts.push(this.starOrNamed());
      }
      this.expectOp(")");
      return this.finish({ _type: "Tuple", elts, ctx: "Load" }, start);
    }
    this.expectOp(")");
    first.parenthesized = true;
    return first;
  }

  listAtom() {
    const start = this.next();
    if (this.eatOp("]")) return this.finish({ _type: "List", elts: [], ctx: "Load" }, start);
    const first = this.starOrNamed();
    if (this.isKw("for") || (this.isKw("async") && this.isKw("for", this.peek(1)))) {
      const generators = this.compFor();
      this.expectOp("]");
      return this.finish({ _type: "ListComp", elt: first, generators }, start);
    }
    const elts = [first];
    while (this.eatOp(",")) {
      if (this.isOp("]")) break;
      elts.push(this.starOrNamed());
    }
    this.expectOp("]");
    return this.finish({ _type: "List", elts, ctx: "Load" }, start);
  }

  braceAtom() {
    const start = this.next();
    if (this.eatOp("}")) return this.finish({ _type: "Dict", keys: [], values: [] }, start);
    if (this.eatOp("**")) {
      const keys = [null];
      const values = [this.expr()];
      return this.dictRest(start, keys, values);
    }
    const first = this.starOrNamed();
    if (this.eatOp(":")) {
      const v = this.test();
      if (this.isKw("for") || (this.isKw("async") && this.isKw("for", this.peek(1)))) {
        const generators = this.compFor();
        this.expectOp("}");
        return this.finish({ _type: "DictComp", key: first, value: v, generators }, start);
      }
      return this.dictRest(start, [first], [v]);
    }
    if (this.isKw("for") || (this.isKw("async") && this.isKw("for", this.peek(1)))) {
      const generators = this.compFor();
      this.expectOp("}");
      return this.finish({ _type: "SetComp", elt: first, generators }, start);
    }
    const elts = [first];
    while (this.eatOp(",")) {
      if (this.isOp("}")) break;
      elts.push(this.starOrNamed());
    }
    this.expectOp("}");
    return this.finish({ _type: "Set", elts }, start);
  }

  dictRest(start, keys, values) {
    while (this.eatOp(",")) {
      if (this.isOp("}")) break;
      if (this.eatOp("**")) {
        keys.push(null);
        values.push(this.expr());
      } else {
        keys.push(this.test());
        this.expectOp(":");
        values.push(this.test());
      }
    }
    this.expectOp("}");
    return this.finish({ _type: "Dict", keys, values }, start);
  }

  compFor() {
    const generators = [];
    while (this.isKw("for") || (this.isKw("async") && this.isKw("for", this.peek(1)))) {
      const is_async = this.eatKw("async") ? 1 : 0;
      this.expectKw("for");
      const target = this.targetList();
      this.expectKw("in");
      const iter = this.orTest();
      const ifs = [];
      while (this.eatKw("if")) ifs.push(this.orTest());
      generators.push({ _type: "comprehension", target, iter, ifs, is_async });
    }
    return generators;
  }

  // Adjacent string tokens: a Constant, or a JoinedStr when any part is an f-string.
  strings() {
    const start = this.tok();
    const parts = [];
    while (this.tok().t === "STRING") parts.push(this.next());
    const isBytes = parts.map((p) => p.prefix.includes("b"));
    if (isBytes.some(Boolean) && !isBytes.every(Boolean)) this.fail("cannot mix bytes and nonbytes literals", start);
    if (parts.some((p) => p.prefix.includes("f"))) {
      const values = [];
      for (const p of parts) {
        if (p.prefix.includes("f")) {
          this.fstringFields(p, p.bodyStart, p.raw.length - p.quote, false, values);
        } else addLiteral(values, p.prefix.includes("r") ? p.body : decodeEscapes(p.body));
      }
      const joined = this.finish({ _type: "JoinedStr", values }, start);
      stampJoined(joined);
      return joined;
    }
    const value = parts.map((p) => (p.prefix.includes("r") ? p.body : decodeEscapes(p.body))).join("");
    return this.finish(
      { _type: "Constant", value, ctype: isBytes[0] ? "bytes" : "str", kind: parts[0].prefix.includes("u") ? "u" : null },
      start,
    );
  }

  // Parses the literal text and replacement fields of an f-string token in [from, to) and
  // appends them to `out`. Returns the index where it stopped (the '}' ending a format spec).
  fstringFields(tok, from, to, inSpec, out) {
    const raw = tok.raw;
    const isRaw = tok.prefix.includes("r");
    let lit = "";
    const flush = () => {
      if (lit) addLiteral(out, isRaw ? lit : decodeEscapes(lit));
      lit = "";
    };
    let j = from;
    while (j < to) {
      const c = raw[j];
      if (c === "{") {
        if (!inSpec && raw[j + 1] === "{") {
          lit += "{";
          j += 2;
          continue;
        }
        flush();
        j = this.fstringField(tok, j + 1, to, out);
        continue;
      }
      if (c === "}") {
        if (inSpec) break;
        if (raw[j + 1] === "}") {
          lit += "}";
          j += 2;
          continue;
        }
        this.fail("f-string: single '}' is not allowed", tok);
      }
      lit += c;
      j++;
    }
    flush();
    return j;
  }

  // One replacement field whose expression starts at i. Appends its parts to out and
  // returns the index after the closing '}'.
  fstringField(tok, i, to, out) {
    const raw = tok.raw;
    const exprEnd = scanFieldExpr(raw, i, to);
    let j = exprEnd;
    let exprText = raw.slice(i, j);
    let selfDoc = null;
    if (raw[j] === "=") {
      exprText = raw.slice(i, j);
      j++;
      while (raw[j] === " " || raw[j] === "\t" || raw[j] === "\n") j++;
      selfDoc = raw.slice(i, j);
    }
    let conversion = -1;
    if (raw[j] === "!") {
      const cc = raw[j + 1];
      if (cc === undefined || cc === "}" || cc === ":") this.fail("f-string: missing conversion character", tok);
      if (cc !== "s" && cc !== "r" && cc !== "a") {
        this.fail(`f-string: invalid conversion character ${pyRepr(cc)}: expected 's', 'r', or 'a'`, tok);
      }
      conversion = cc.charCodeAt(0);
      j += 2;
    }
    let format_spec = null;
    if (raw[j] === ":") {
      const specValues = [];
      j = this.fstringFields(tok, j + 1, to, true, specValues);
      format_spec = { _type: "JoinedStr", values: specValues };
    }
    if (raw[j] !== "}") this.fail("f-string: expecting '}'", tok);
    j++;
    if (!exprText.trim()) {
      this.fail(raw[j - 1] === "}" && conversion === -1 && format_spec === null ? "f-string: valid expression required before '}'" : "f-string: empty expression not allowed", tok);
    }
    if (/^\s*lambda\b/.test(exprText)) this.fail("f-string: lambda expressions are not allowed without parentheses", tok);
    if (selfDoc !== null) {
      addLiteral(out, selfDoc);
      if (conversion === -1 && format_spec === null) conversion = 114; // 'r' by default
    }
    const at = posInToken(tok, i);
    const sub = new Parser(tokenize("(" + exprText + ")", at));
    const value = sub.parenAtom();
    sub.expectNewline();
    out.push({ _type: "FormattedValue", value, conversion, format_spec });
    return j;
  }
}

// ---------------------------------------------------------------------------
// unparse (ast.unparse), used for the annotation text in parameter errors
// ---------------------------------------------------------------------------

const PREC = {
  NAMED_EXPR: 1, TUPLE: 2, YIELD: 3, TEST: 4, OR: 5, AND: 6, NOT: 7, CMP: 8, EXPR: 9, BXOR: 10,
  BAND: 11, SHIFT: 12, ARITH: 13, TERM: 14, FACTOR: 15, POWER: 16, AWAIT: 17, ATOM: 18,
};
const UNPARSE_BIN = {
  Add: ["+", PREC.ARITH], Sub: ["-", PREC.ARITH], Mult: ["*", PREC.TERM], MatMult: ["@", PREC.TERM],
  Div: ["/", PREC.TERM], Mod: ["%", PREC.TERM], FloorDiv: ["//", PREC.TERM], LShift: ["<<", PREC.SHIFT],
  RShift: [">>", PREC.SHIFT], BitOr: ["|", PREC.EXPR], BitXor: ["^", PREC.BXOR], BitAnd: ["&", PREC.BAND],
  Pow: ["**", PREC.POWER],
};
const UNPARSE_UN = { Invert: ["~", PREC.FACTOR], Not: ["not", PREC.NOT], UAdd: ["+", PREC.FACTOR], USub: ["-", PREC.FACTOR] };
const UNPARSE_CMP = {
  Eq: "==", NotEq: "!=", Lt: "<", LtE: "<=", Gt: ">", GtE: ">=", Is: "is", IsNot: "is not", In: "in", NotIn: "not in",
};

function unparseConstant(n) {
  switch (n.ctype) {
    case "NoneType": return "None";
    case "bool": return n.value ? "True" : "False";
    case "int": return pyIntStr(n.value);
    case "float": return pyFloatRepr(n.value);
    case "complex": return pyFloatRepr(n.value).replace(/\.0$/, "") + "j";
    case "str": return (n.kind === "u" ? "u" : "") + pyRepr(n.value);
    case "bytes": return "b" + pyRepr(n.value);
    case "ellipsis": return "...";
    default: return String(n.value);
  }
}

function unparseArgs(a) {
  const parts = [];
  const pos = [...a.posonlyargs, ...a.args];
  const first = pos.length - a.defaults.length;
  pos.forEach((x, i) => {
    let s = x.arg;
    if (i >= first) s += "=" + unparseAt(a.defaults[i - first], PREC.TEST);
    parts.push(s);
    if (a.posonlyargs.length && i === a.posonlyargs.length - 1) parts.push("/");
  });
  if (a.vararg) parts.push("*" + a.vararg.arg);
  else if (a.kwonlyargs.length) parts.push("*");
  a.kwonlyargs.forEach((x, i) => {
    let s = x.arg;
    if (a.kw_defaults[i]) s += "=" + unparseAt(a.kw_defaults[i], PREC.TEST);
    parts.push(s);
  });
  if (a.kwarg) parts.push("**" + a.kwarg.arg);
  return parts.join(", ");
}

function unparse(node) {
  return unparseAt(node, PREC.TEST);
}

// Renders an expression, adding parentheses where the precedence needs them.
function unparseAt(n, prec) {
  const paren = (need, s) => (need ? `(${s})` : s);
  switch (n._type) {
    case "Constant":
      return unparseConstant(n);
    case "Name":
      return n.id;
    case "Attribute":
      return `${unparseAt(n.value, PREC.ATOM)}.${n.attr}`;
    case "Subscript": {
      const sl = n.slice;
      let s = unparseAt(sl, PREC.TEST);
      if (sl._type === "Tuple" && sl.elts.length) s = sl.elts.length === 1 ? `${unparseAt(sl.elts[0], PREC.TEST)},` : unparseItems(sl.elts);
      return `${unparseAt(n.value, PREC.ATOM)}[${s}]`;
    }
    case "Call": {
      const parts = n.args.map((a) => unparseAt(a, PREC.TEST));
      for (const k of n.keywords) parts.push(k.arg === null ? `**${unparseAt(k.value, PREC.TEST)}` : `${k.arg}=${unparseAt(k.value, PREC.TEST)}`);
      return `${unparseAt(n.func, PREC.ATOM)}(${parts.join(", ")})`;
    }
    case "BinOp": {
      const [sym, p] = UNPARSE_BIN[n.op];
      const rassoc = n.op === "Pow";
      const lp = rassoc ? p + 1 : p;
      const rp = rassoc ? p : p + 1;
      return paren(prec > p, `${unparseAt(n.left, lp)} ${sym} ${unparseAt(n.right, rp)}`);
    }
    case "UnaryOp": {
      const [sym, p] = UNPARSE_UN[n.op];
      return paren(prec > p, `${sym}${p === PREC.FACTOR ? "" : " "}${unparseAt(n.operand, p)}`);
    }
    case "BoolOp": {
      const base = n.op === "And" ? PREC.AND : PREC.OR;
      let p = base;
      const parts = n.values.map((v) => {
        p += 1;
        return unparseAt(v, p);
      });
      return paren(prec > base, parts.join(n.op === "And" ? " and " : " or "));
    }
    case "Compare": {
      let s = unparseAt(n.left, PREC.EXPR);
      n.ops.forEach((o, i) => {
        s += ` ${UNPARSE_CMP[o]} ${unparseAt(n.comparators[i], PREC.TEST)}`;
      });
      return paren(prec > PREC.CMP, s);
    }
    case "IfExp":
      return paren(prec > PREC.TEST, `${unparseAt(n.body, PREC.TEST + 1)} if ${unparseAt(n.test, PREC.TEST + 1)} else ${unparseAt(n.orelse, PREC.TEST)}`);
    case "Lambda": {
      const a = unparseArgs(n.args);
      return paren(prec > PREC.TEST, `lambda${a ? " " + a : ""}: ${unparseAt(n.body, PREC.TEST)}`);
    }
    case "Tuple": {
      const inner = n.elts.length === 1 ? `${unparseAt(n.elts[0], PREC.TEST)},` : unparseItems(n.elts);
      return n.elts.length === 0 || prec > PREC.TUPLE ? `(${inner})` : inner;
    }
    case "List":
      return `[${unparseItems(n.elts)}]`;
    case "Set":
      return `{${unparseItems(n.elts)}}`;
    case "Dict": {
      const items = n.keys.map((k, i) => (k === null ? `**${unparseAt(n.values[i], PREC.EXPR)}` : `${unparseAt(k, PREC.TEST)}: ${unparseAt(n.values[i], PREC.TEST)}`));
      return `{${items.join(", ")}}`;
    }
    case "Starred":
      return `*${unparseAt(n.value, PREC.EXPR)}`;
    case "Slice": {
      let s = n.lower ? unparseAt(n.lower, PREC.TEST) : "";
      s += ":";
      if (n.upper) s += unparseAt(n.upper, PREC.TEST);
      if (n.step) s += ":" + unparseAt(n.step, PREC.TEST);
      return s;
    }
    case "Await":
      return paren(prec > PREC.AWAIT, `await ${unparseAt(n.value, PREC.ATOM)}`);
    case "Yield":
      return paren(prec > PREC.YIELD, n.value ? `yield ${unparseAt(n.value, PREC.TEST)}` : "yield");
    case "NamedExpr":
      return paren(prec > PREC.NAMED_EXPR, `${unparseAt(n.target, PREC.ATOM)} := ${unparseAt(n.value, PREC.TEST)}`);
    case "ListComp":
      return `[${unparseAt(n.elt, PREC.TEST)}${unparseGens(n.generators)}]`;
    case "SetComp":
      return `{${unparseAt(n.elt, PREC.TEST)}${unparseGens(n.generators)}}`;
    case "GeneratorExp":
      return `(${unparseAt(n.elt, PREC.TEST)}${unparseGens(n.generators)})`;
    case "DictComp":
      return `{${unparseAt(n.key, PREC.TEST)}: ${unparseAt(n.value, PREC.TEST)}${unparseGens(n.generators)}}`;
    case "JoinedStr": {
      let text = "";
      for (const v of n.values) {
        if (v._type === "Constant") text += v.value.replace(/[{}]/g, (c) => c + c);
        else text += "{" + unparseAt(v.value, PREC.TEST) + (v.conversion > 0 ? "!" + String.fromCharCode(v.conversion) : "") + "}";
      }
      return "f" + pyRepr(text);
    }
    default:
      return `<${n._type}>`;
  }
}

function unparseGens(gens) {
  return gens
    .map((g) => ` ${g.is_async ? "async " : ""}for ${unparseAt(g.target, PREC.TUPLE)} in ${unparseAt(g.iter, PREC.OR)}` +
      g.ifs.map((c) => ` if ${unparseAt(c, PREC.OR)}`).join(""))
    .join("");
}

function unparseItems(items) {
  return items.map((e) => unparseAt(e, PREC.TEST)).join(", ");
}

// ---------------------------------------------------------------------------
// Translator: a port of _Translator in vendor/pykernel.py
// ---------------------------------------------------------------------------

const I32 = "i32";
const F32 = "f32";
const BOOL = "bool";
const DEFAULT_WORKGROUP = 64;
const MAX_WORKGROUP = 256; // WebGPU default maxComputeWorkgroupSizeX
const COUNT_FIELD = "pk_count"; // uniform field: invocation count, used for the bounds check
const I32_MIN = -(2n ** 31n);
const I32_MAX = 2n ** 31n - 1n;
const F32_MAX = 3.4028234663852886e38;
const ZERO = { [I32]: "0i", [F32]: "0.0f", [BOOL]: "false" };
const PYNAME = { [I32]: "int", [F32]: "float", [BOOL]: "bool" };
const BUILTINS = new Map([
  ["min", 2], ["max", 2], ["sqrt", 1], ["float", 1], ["int", 1], ["abs", 1], ["floor", 1],
  ["sin", 1], ["cos", 1], ["tan", 1], ["exp", 1], ["log", 1], ["atan2", 2], ["pow", 2],
]);
const BUILTIN_LIST = [...BUILTINS.keys()].join(", ");
// f32 -> f32 in both languages. floor() is separate: math.floor returns an int.
const FLOAT_FNS = ["sqrt", "sin", "cos", "tan", "exp", "log", "atan2", "pow"];
const CMP = { Lt: "<", LtE: "<=", Gt: ">", GtE: ">=", Eq: "==", NotEq: "!=" };
const ARITH = { Add: "+", Sub: "-", Mult: "*" };
const OP_SYMBOL = { FloorDiv: "//", Mod: "%" };
const HELPERS = {
  pk_mod: [
    "fn pk_mod(a: i32, b: i32) -> i32 {",
    "  let r = a % b;",
    "  if (r != 0 && ((r < 0) != (b < 0))) { return r + b; }",
    "  return r;",
    "}",
  ],
  pk_floordiv: [
    "fn pk_floordiv(a: i32, b: i32) -> i32 {",
    "  let q = a / b;",
    "  if ((a % b != 0) && ((a < 0) != (b < 0))) { return q - 1; }",
    "  return q;",
    "}",
  ],
};

// Identifiers a Python name must not take verbatim in WGSL (keywords, reserved words, and the
// builtins this translator emits). A clashing name becomes "pk_" + name.
const WGSL_RESERVED = new Set([
  "alias", "break", "case", "const", "const_assert", "continue", "continuing", "default",
  "diagnostic", "discard", "else", "enable", "false", "fn", "for", "if", "let", "loop", "override",
  "return", "struct", "switch", "true", "var", "while", "array", "atomic", "bool", "f16", "f32",
  "i32", "u32", "ptr", "sampler", "texture", "vec2", "vec3", "vec4", "mat2x2", "mat3x3", "mat4x4",
  "abs", "ceil", "clamp", "floor", "min", "max", "select", "sqrt", "main", "Params", "NULL",
  "Self", "abstract", "active", "alignas", "alignof", "as", "asm", "asm_fragment", "async",
  "attribute", "auto", "await", "become", "binding_array", "cast", "catch", "class", "co_await",
  "co_return", "co_yield", "coherent", "column_major", "common", "compile", "compile_fragment",
  "concept", "const_cast", "consteval", "constexpr", "constinit", "crate", "debugger", "decltype",
  "delete", "demote", "demote_to_helper", "do", "dynamic_cast", "enum", "explicit", "export",
  "extends", "extern", "external", "fallthrough", "filter", "final", "finally", "friend", "from",
  "fxgroup", "get", "goto", "groupshared", "highp", "impl", "implements", "import", "inline",
  "instanceof", "interface", "layout", "lowp", "macro", "macro_rules", "match", "mediump", "meta",
  "mod", "module", "move", "mut", "mutable", "namespace", "new", "nil", "noexcept", "noinline",
  "nointerpolation", "noperspective", "null", "nullptr", "of", "operator", "package", "packoffset",
  "partition", "pass", "patch", "pixelfragment", "precise", "precision", "premerge", "priv",
  "protected", "pub", "public", "readonly", "ref", "regardless", "register", "reinterpret_cast",
  "require", "resource", "restrict", "self", "set", "shared", "sizeof", "smooth", "snorm",
  "static", "static_assert", "static_cast", "std", "subroutine", "super", "target", "template",
  "this", "thread_local", "throw", "trait", "try", "type", "typedef", "typeid", "typename",
  "typeof", "union", "unless", "unorm", "unsafe", "unsized", "use", "using", "varying", "virtual",
  "volatile", "wgsl", "where", "with", "writeonly", "yield",
]);
const PY_TYPE_NAME = { complex: "complex", bytes: "bytes", NoneType: "NoneType", ellipsis: "ellipsis" };

function isName(node, ident) {
  return node !== null && node !== undefined && node._type === "Name" && node.id === ident;
}

function isListFloat(node) {
  return node._type === "Subscript" && isName(node.value, "list") && isName(node.slice, "float");
}

function isStrConst(node) {
  return node._type === "Constant" && node.ctype === "str";
}

function isKernelDecorator(d) {
  return isName(d, "kernel") || (d._type === "Call" && isName(d.func, "kernel"));
}

// repr(v) of a float literal in WGSL form; throws for values that do not fit f32.
function f32Literal(v) {
  if (Number.isNaN(v) || v === Infinity || v === -Infinity || Math.abs(v) > F32_MAX) {
    throw new RangeError(`float literal ${pyFloatRepr(v)} does not fit f32`);
  }
  let s = pyFloatRepr(v);
  if (!s.includes(".") && !s.includes("e")) s += ".0";
  return v < 0 ? `(${s}f)` : `${s}f`;
}

// Copy of a subtree with every ctx set to Load (copy.deepcopy plus ast.walk in aug()).
function copyAsLoad(x) {
  if (Array.isArray(x)) return x.map(copyAsLoad);
  if (!isNode(x)) return x;
  const out = {};
  for (const k of Object.keys(x)) out[k] = copyAsLoad(x[k]);
  if (Object.hasOwn(out, "ctx")) out.ctx = "Load";
  return out;
}

class Translator {
  constructor(fdef, src, name, firstLine) {
    this.fdef = fdef;
    this.src = src;
    this.kname = name;
    this.firstLine = firstLine;
    this.workgroup = DEFAULT_WORKGROUP;
    this.gid = null;
    this.scalars = new Map(); // python name -> i32 | f32 (uniform fields, read-only)
    this.buffers = new Map(); // python name -> "read" | "read_write"
    this.vtypes = new Map(); // local python name -> i32 | f32 | bool
    this.changed = false; // set when a local's inferred type widens
    this.strict = false; // final pass: unknown names are errors
    this.temp = 0;
    this.loops = 0;
    this.helpers = new Set();
    this.assigned = new Set(); // every name assigned anywhere in the body
  }

  // ---- errors ----

  err(node, msg) {
    const ln = node.lineno;
    return new KernelError(msg, ln ? ln + this.firstLine - 1 : null);
  }

  unsupported(node, detail = "") {
    if (!detail) detail = quotedDetail(this.src, node);
    const msg = `unsupported node ${node._type}`;
    return this.err(node, msg + (detail ? `: ${detail}` : ""));
  }

  unsupportedOp(node, op, detail) {
    return this.err(node, `unsupported node ${op}: ${detail}`);
  }

  // ---- names ----

  static wname(name) {
    return WGSL_RESERVED.has(name) ? "pk_" + name : name;
  }

  checkUserName(node, name) {
    if (!/^[\x00-\x7f]*$/.test(name)) throw this.err(node, `identifier ${pyRepr(name)} must be ASCII`);
    if (name.startsWith("pk_") || name.startsWith("__")) {
      throw this.err(node, `identifier ${pyRepr(name)}: names starting with pk_ or __ are reserved`);
    }
  }

  checkWritable(node, name) {
    if (name === this.gid) throw this.err(node, `${pyRepr(name)} is the invocation index and is read-only`);
    if (this.scalars.has(name)) throw this.err(node, `parameter ${pyRepr(name)} is read-only inside the kernel`);
    if (this.buffers.has(name)) {
      throw this.err(node, `list parameter ${pyRepr(name)} cannot be rebound; assign to ${name}[i]`);
    }
  }

  // Joins a new assignment's type into the local's type. int joins float to float.
  bind(node, name, t) {
    const cur = this.vtypes.has(name) ? this.vtypes.get(name) : null;
    let nw;
    if (cur === null) nw = t;
    else if (cur === t) return;
    else if ((cur === I32 && t === F32) || (cur === F32 && t === I32)) nw = F32;
    else {
      throw this.err(node, `variable ${pyRepr(name)} holds a ${PYNAME[cur]} but is assigned a ${PYNAME[t]}; use int() or float() to convert`);
    }
    if (nw !== cur) {
      this.vtypes.set(name, nw);
      this.changed = true;
    }
  }

  coerce(node, code, t, target) {
    if (t === target) return code;
    if (t === I32 && target === F32) return `f32(${code})`;
    throw this.err(node, `cannot use a ${PYNAME[t]} value where a ${PYNAME[target]} is needed; convert with ${PYNAME[target]}()`);
  }

  needInt(node, t) {
    if (t !== null && t !== I32) throw this.err(node, "list indices, range bounds and the loop start must be int");
  }

  needBool(node, t) {
    if (t !== null && t !== BOOL) {
      throw this.err(node, "a condition must be a comparison or a bool; numbers have no truth value in a kernel");
    }
  }

  // ---- driver ----

  run() {
    const f = this.fdef;
    if (f.returns !== null && !(f.returns._type === "Constant" && f.returns.value === null && f.returns.ctype === "NoneType")) {
      throw this.unsupported(f.returns, "kernels return nothing; write results into a list[float] parameter");
    }
    this.parseDecorator();
    this.parseParams();
    const all = walk(f);
    this.assigned = new Set(all.filter((n) => n._type === "Name" && n.ctx === "Store").map((n) => n.id));
    for (const n of all) {
      if (n._type === "Name" && n.ctx === "Store") this.checkUserName(n, n.id);
    }
    let body = [...f.body];
    if (body.length && body[0]._type === "Expr" && isStrConst(body[0].value)) body = body.slice(1);

    // Buffer access: read_write iff the body assigns into it.
    const writes = new Set();
    for (const node of walk({ _type: "Module", body, type_ignores: [] })) {
      let targets = [];
      if (node._type === "Assign") targets = node.targets;
      else if (node._type === "AugAssign" || node._type === "AnnAssign") targets = [node.target];
      for (const t of targets) {
        if (t._type === "Subscript" && t.value._type === "Name" && this.buffers.has(t.value.id)) writes.add(t.value.id);
      }
    }
    for (const n of [...this.buffers.keys()]) this.buffers.set(n, writes.has(n) ? "read_write" : "read");

    // Local types: iterate to a fixpoint (a variable's type can widen on a later pass).
    let settled = false;
    for (let pass = 0; pass < 32 && !settled; pass++) {
      this.changed = false;
      this.temp = 0;
      this.loops = 0;
      this.helpers = new Set();
      this.stmts(body, 1);
      if (!this.changed) settled = true;
    }
    if (!settled) throw new KernelError("local type inference did not settle (internal error)");

    this.checkDefinite(body);
    this.strict = true;
    this.temp = 0;
    this.loops = 0;
    this.helpers = new Set();
    const lines = this.stmts(body, 1);
    if (this.changed) throw new KernelError("local type inference changed in the final pass (internal error)");
    const [wgsl, buffers, uniforms] = this.module(lines);
    return new KernelSpec({
      name: this.kname,
      wgsl,
      gid: this.gid,
      workgroupSize: this.workgroup,
      buffers,
      uniforms,
      uniformBinding: buffers.length,
      uniformSize: 4 * uniforms.length,
    });
  }

  parseDecorator() {
    let found = false;
    for (const d of this.fdef.decorator_list) {
      if (isName(d, "kernel")) {
        found = true;
      } else if (d._type === "Call" && isName(d.func, "kernel")) {
        found = true;
        if (d.args.length) throw this.unsupported(d.args[0], "pass workgroup_size as a keyword");
        for (const kw of d.keywords) {
          if (kw.arg !== "workgroup_size") {
            throw this.err(kw.value, `unknown @kernel argument ${kw.arg === null ? "None" : pyRepr(kw.arg)}`);
          }
          const v = kw.value;
          if (!(v._type === "Constant" && v.ctype === "int")) throw this.err(v, "workgroup_size must be an int literal");
          if (!(v.value >= 1n && v.value <= BigInt(MAX_WORKGROUP))) {
            throw this.err(v, `workgroup_size must be 1..${MAX_WORKGROUP}`);
          }
          this.workgroup = Number(v.value);
        }
      }
    }
    if (!found) throw this.err(this.fdef, `function ${pyRepr(this.fdef.name)} is not decorated with @kernel`);
  }

  parseParams() {
    const f = this.fdef;
    const a = f.args;
    if (a.vararg || a.kwarg || a.kwonlyargs.length || a.posonlyargs.length || a.defaults.length || a.kw_defaults.length) {
      throw this.err(f, "kernel parameters must be plain positional names (no defaults, *args, **kwargs or keyword-only)");
    }
    if (!a.args.length) throw this.err(f, "a kernel needs its invocation index as the first parameter: (gid: int, ...)");
    const first = a.args[0];
    if (!isName(first.annotation, "int")) {
      throw this.err(first, `first parameter ${pyRepr(first.arg)} is the invocation index and must be annotated int`);
    }
    this.checkUserName(first, first.arg);
    this.gid = first.arg;
    for (const p of a.args.slice(1)) {
      this.checkUserName(p, p.arg);
      const ann = p.annotation;
      if (ann === null) throw this.err(p, `parameter ${pyRepr(p.arg)} needs a type: int, float or list[float]`);
      if (isName(ann, "int")) this.scalars.set(p.arg, I32);
      else if (isName(ann, "float")) this.scalars.set(p.arg, F32);
      else if (isListFloat(ann)) this.buffers.set(p.arg, "read");
      else {
        throw this.err(p, `parameter ${pyRepr(p.arg)} has unsupported type ${pyRepr(unparse(ann))}; use int, float or list[float]`);
      }
    }
  }

  module(bodyLines) {
    const buffers = [...this.buffers.entries()].map(([n, acc], i) => ({ name: n, binding: i, access: acc }));
    const uniforms = [{ name: COUNT_FIELD, type: I32, offset: 0 }];
    [...this.scalars.entries()].forEach(([n, t], i) => uniforms.push({ name: n, type: t, offset: 4 * (i + 1) }));
    const ub = buffers.length;
    const g = Translator.wname(this.gid);
    const out = [`// generated by pykernel from ${this.kname}(); do not edit`, ""];
    for (const h of ["pk_mod", "pk_floordiv"]) {
      if (this.helpers.has(h)) {
        out.push(...HELPERS[h]);
        out.push("");
      }
    }
    out.push("struct Params {");
    for (const u of uniforms) out.push(`  ${Translator.wname(u.name)}: ${u.type},`);
    out.push("}");
    out.push("");
    for (const b of buffers) {
      out.push(`@group(0) @binding(${b.binding}) var<storage, ${b.access}> ${Translator.wname(b.name)}: array<f32>;`);
    }
    out.push(`@group(0) @binding(${ub}) var<uniform> pk_params: Params;`);
    out.push("");
    out.push(`@compute @workgroup_size(${this.workgroup})`);
    out.push("fn main(@builtin(global_invocation_id) pk_gid: vec3<u32>) {");
    out.push(`  let ${g}: i32 = i32(pk_gid.x);`);
    out.push(`  if (${g} >= pk_params.${COUNT_FIELD}) { return; }`);
    for (const [n, t] of this.vtypes) out.push(`  var ${Translator.wname(n)}: ${t} = ${ZERO[t]};`);
    out.push(...bodyLines);
    out.push("}");
    out.push("");
    return [out.join("\n"), buffers, uniforms];
  }

  // ---- definite assignment ----

  // Python's rule: a local is read only after an assignment that precedes the read in the
  // source. An if-branch assignment counts only when both branches make it, and a loop body
  // assignment does not count after the loop.
  checkDefinite(body) {
    this.defsStmts(body, new Set());
  }

  loadsOk(expr, seen) {
    const nodes = walk(expr);
    const calls = new Set(nodes.filter((n) => n._type === "Call").map((n) => n.func));
    for (const n of nodes) {
      if (n._type === "Name" && n.ctx === "Load" && !calls.has(n)) this.nameOk(n, n.id, seen);
    }
  }

  nameOk(node, name, seen) {
    if (name === this.gid || this.scalars.has(name) || this.buffers.has(name) || seen.has(name)) return;
    if (this.assigned.has(name)) throw this.err(node, `name ${pyRepr(name)} is used before it is assigned`);
    throw this.err(node, `name ${pyRepr(name)} is not a parameter and is never assigned`);
  }

  defsStmts(body, seen) {
    for (const s of body) seen = this.defsStmt(s, seen);
    return seen;
  }

  defsStmt(s, seen) {
    switch (s._type) {
      case "Assign":
        this.loadsOk(s.value, seen);
        for (const t of s.targets) {
          if (t._type === "Name") seen = new Set([...seen, t.id]);
          else this.loadsOk(t, seen);
        }
        return seen;
      case "AugAssign":
        this.loadsOk(s.value, seen);
        if (s.target._type === "Name") this.nameOk(s.target, s.target.id, seen);
        else this.loadsOk(s.target, seen);
        return seen;
      case "AnnAssign":
        if (s.value !== null) {
          this.loadsOk(s.value, seen);
          return s.target._type === "Name" ? new Set([...seen, s.target.id]) : seen;
        }
        return seen;
      case "If": {
        this.loadsOk(s.test, seen);
        const a = this.defsStmts(s.body, seen);
        const b = s.orelse.length ? this.defsStmts(s.orelse, seen) : seen;
        return new Set([...a].filter((x) => b.has(x)));
      }
      case "While":
        this.loadsOk(s.test, seen);
        this.defsStmts(s.body, seen);
        return seen;
      case "For":
        if (s.iter._type === "Call") for (const a of s.iter.args) this.loadsOk(a, seen);
        if (s.target._type === "Name") this.defsStmts(s.body, new Set([...seen, s.target.id]));
        return seen;
      case "Expr":
        this.loadsOk(s.value, seen);
        return seen;
      case "Return":
        if (s.value !== null) this.loadsOk(s.value, seen);
        return seen;
      default:
        return seen;
    }
  }

  // ---- statements ----

  stmts(body, ind) {
    const out = [];
    for (const s of body) out.push(...this.stmt(s, ind));
    return out;
  }

  stmt(node, ind) {
    const pad = "  ".repeat(ind);
    switch (node._type) {
      case "Assign":
        if (node.targets.length !== 1) {
          throw this.unsupported(node, "chained assignment (a = b = x) is not in the subset");
        }
        return this.store(node.targets[0], node.value, ind);
      case "AugAssign":
        return this.aug(node, ind);
      case "AnnAssign":
        return this.ann(node, ind);
      case "If":
        return this.ifStmt(node, ind);
      case "While":
        return this.whileStmt(node, ind);
      case "For":
        return this.forStmt(node, ind);
      case "Break":
        if (this.loops === 0) throw this.err(node, "break outside a loop");
        return [pad + "break;"];
      case "Continue":
        if (this.loops === 0) throw this.err(node, "continue outside a loop");
        return [pad + "continue;"];
      case "Return":
        if (node.value !== null) {
          throw this.unsupported(node.value, "kernels return nothing; write results into a list[float] parameter");
        }
        return [pad + "return;"];
      case "Pass":
        return [];
      case "Expr":
        if (isStrConst(node.value)) return [];
        if (node.value._type === "Call") {
          this.call(node.value); // unknown callee: names it
          throw this.unsupported(node.value, "a call used as a statement has no effect in a kernel");
        }
        throw this.unsupported(node.value, "an expression statement has no effect in a kernel");
      default:
        throw this.unsupported(node);
    }
  }

  store(target, value, ind) {
    const pad = "  ".repeat(ind);
    if (target._type === "Name") {
      const name = target.id;
      this.checkWritable(target, name);
      const [code, t] = this.expr(value);
      if (t === null) return [];
      this.bind(target, name, t);
      return [`${pad}${Translator.wname(name)} = ${this.coerce(value, code, t, this.vtypes.get(name))};`];
    }
    if (target._type === "Subscript") {
      const base = target.value;
      if (!(base._type === "Name" && this.buffers.has(base.id))) {
        throw this.err(target, "only list[float] parameters can be assigned by index");
      }
      const [ic, it] = this.expr(target.slice);
      const [code, t] = this.expr(value);
      if (it === null || t === null) return [];
      this.needInt(target.slice, it);
      return [`${pad}${Translator.wname(base.id)}[${ic}] = ${this.coerce(value, code, t, F32)};`];
    }
    throw this.unsupported(target, "only a name or list[index] can be assigned to");
  }

  aug(node, ind) {
    const load = copyAsLoad(node.target);
    const nw = { _type: "BinOp", left: load, op: node.op, right: node.value };
    nw.lineno = node.lineno;
    nw.col_offset = node.col_offset;
    nw.end_lineno = node.end_lineno;
    nw.end_col_offset = node.end_col_offset;
    return this.store(node.target, nw, ind);
  }

  ann(node, ind) {
    if (node.target._type !== "Name") throw this.unsupported(node.target, "an annotated assignment needs a plain name");
    const ann = node.annotation;
    const t = ann._type === "Name" ? new Map([["int", I32], ["float", F32], ["bool", BOOL]]).get(ann.id) : undefined;
    if (t === undefined) throw this.unsupported(node.annotation, "local annotations must be int, float or bool");
    this.checkWritable(node.target, node.target.id);
    this.bind(node.target, node.target.id, t);
    if (node.value === null) return [];
    return this.store(node.target, node.value, ind);
  }

  ifStmt(node, ind) {
    const pad = "  ".repeat(ind);
    const [cc, ct] = this.expr(node.test);
    this.needBool(node.test, ct);
    const out = [`${pad}if (${cc}) {`];
    out.push(...this.stmts(node.body, ind + 1));
    if (node.orelse.length) {
      out.push(`${pad}} else {`);
      out.push(...this.stmts(node.orelse, ind + 1));
    }
    out.push(`${pad}}`);
    return out;
  }

  whileStmt(node, ind) {
    const pad = "  ".repeat(ind);
    if (node.orelse.length) throw this.unsupported(node, "while with an else clause");
    const [cc, ct] = this.expr(node.test);
    this.needBool(node.test, ct);
    this.loops += 1;
    const body = this.stmts(node.body, ind + 1);
    this.loops -= 1;
    return [`${pad}while (${cc}) {`, ...body, `${pad}}`];
  }

  forStmt(node, ind) {
    const pad = "  ".repeat(ind);
    if (node.orelse.length) throw this.unsupported(node, "for with an else clause");
    if (node.target._type !== "Name") throw this.unsupported(node.target, "a loop variable must be a plain name");
    const it = node.iter;
    const isRange =
      it._type === "Call" && isName(it.func, "range") && !it.keywords.length &&
      it.args.length >= 1 && it.args.length <= 2 && !it.args.some((a) => a._type === "Starred");
    if (!isRange) {
      throw this.err(it, "for loops must iterate over range(stop) or range(start, stop); no step and no other iterables");
    }
    let startNode = null;
    let stopNode;
    let startCode = "0i";
    let startT = I32;
    if (it.args.length === 1) {
      stopNode = it.args[0];
    } else {
      startNode = it.args[0];
      stopNode = it.args[1];
      [startCode, startT] = this.expr(startNode);
    }
    let [stopCode, stopT] = this.expr(stopNode);
    if (startT === null) startT = I32;
    if (stopT === null) stopT = I32;
    if (startNode !== null) this.needInt(startNode, startT);
    this.needInt(stopNode, stopT);
    const name = node.target.id;
    this.checkWritable(node.target, name);
    this.bind(node.target, name, I32);
    const k = this.temp;
    this.temp += 1;
    const endV = `pk_end${k}`;
    const itV = `pk_it${k}`;
    this.loops += 1;
    const body = this.stmts(node.body, ind + 2);
    this.loops -= 1;
    const assign = this.coerce(node.target, itV, I32, this.vtypes.get(name));
    return [
      `${pad}{`,
      `${pad}  let ${endV}: i32 = ${stopCode};`,
      `${pad}  for (var ${itV}: i32 = ${startCode}; ${itV} < ${endV}; ${itV} = ${itV} + 1i) {`,
      `${pad}    ${Translator.wname(name)} = ${assign};`,
      ...body,
      `${pad}  }`,
      `${pad}}`,
    ];
  }

  // ---- expressions: each returns [wgsl_code, type]; type null = unknown this pass ----

  expr(node) {
    switch (node._type) {
      case "Constant":
        return this.constant(node);
      case "Name":
        return this.name(node);
      case "BinOp":
        return this.binop(node);
      case "UnaryOp":
        return this.unary(node);
      case "Compare":
        return this.compare(node);
      case "BoolOp":
        return this.boolop(node);
      case "Call":
        return this.call(node);
      case "Subscript":
        return this.subscript(node);
      default:
        throw this.unsupported(node);
    }
  }

  constant(node) {
    const v = node.value;
    const t = node.ctype;
    if (t === "bool") return [v ? "true" : "false", BOOL];
    if (t === "int") {
      if (v < I32_MIN || v > I32_MAX) throw this.err(node, `int literal ${pyIntStr(v)} does not fit i32`);
      return v >= 0n ? [`${pyIntStr(v)}i`, I32] : [`(${pyIntStr(v)}i)`, I32];
    }
    if (t === "float") {
      try {
        return [f32Literal(v), F32];
      } catch (e) {
        if (e instanceof RangeError) throw this.err(node, e.message);
        throw e;
      }
    }
    if (t === "str") throw this.unsupported(node, "string constants are not in the subset");
    throw this.unsupported(node, `${PY_TYPE_NAME[t] || t} constants are not in the subset`);
  }

  name(node) {
    const n = node.id;
    if (n === this.gid) return [Translator.wname(n), I32];
    if (this.scalars.has(n)) return [`pk_params.${Translator.wname(n)}`, this.scalars.get(n)];
    if (this.buffers.has(n)) throw this.err(node, `list parameter ${pyRepr(n)} can only be indexed, as ${n}[i]`);
    if (this.vtypes.has(n)) return [Translator.wname(n), this.vtypes.get(n)];
    if (this.strict) throw this.err(node, `could not infer a type for ${pyRepr(n)}: its assignments depend only on each other`);
    return ["0i", null];
  }

  subscript(node) {
    const base = node.value;
    if (!(base._type === "Name" && this.buffers.has(base.id))) throw this.err(node, "only list[float] parameters can be indexed");
    if (node.slice._type === "Slice") throw this.unsupported(node.slice, "slices are not in the subset");
    const [ic, it] = this.expr(node.slice);
    if (it === null) return ["0.0f", null];
    this.needInt(node.slice, it);
    return [`${Translator.wname(base.id)}[${ic}]`, F32];
  }

  numeric(node, a, b) {
    const [ac, at] = a;
    const [bc, bt] = b;
    if (at === BOOL || bt === BOOL) throw this.err(node, "arithmetic and ordering on a bool value are not in the subset");
    const t = at === F32 || bt === F32 ? F32 : I32;
    return [[this.coerce(node, ac, at, t), this.coerce(node, bc, bt, t)], t];
  }

  binop(node) {
    const op = node.op;
    const isArith = Object.hasOwn(ARITH, op);
    if (!isArith && op !== "Div" && op !== "FloorDiv" && op !== "Mod") {
      const detail = op === "Pow" ? "use a*a for squares; ** is not in the subset" : "only + - * / // % are in the subset";
      throw this.unsupportedOp(node, op, detail);
    }
    const [lc, lt] = this.expr(node.left);
    const [rc, rt] = this.expr(node.right);
    if (lt === null || rt === null) return ["0i", null];
    if (isArith) {
      const [[a, b], t] = this.numeric(node, [lc, lt], [rc, rt]);
      return [`(${a} ${ARITH[op]} ${b})`, t];
    }
    if (op === "Div") {
      const a = this.coerce(node.left, lc, lt, F32);
      const b = this.coerce(node.right, rc, rt, F32);
      return [`(${a} / ${b})`, F32];
    }
    if (lt !== I32 || rt !== I32) throw this.err(node, `'${OP_SYMBOL[op]}' is supported on int operands only`);
    const helper = op === "FloorDiv" ? "pk_floordiv" : "pk_mod";
    this.helpers.add(helper);
    return [`${helper}(${lc}, ${rc})`, I32];
  }

  unary(node) {
    const op = node.op;
    if (op !== "Not" && op !== "USub" && op !== "UAdd") {
      throw this.unsupportedOp(node, op, "only not, unary - and unary + are in the subset");
    }
    const [c, t] = this.expr(node.operand);
    if (t === null) return ["0i", null];
    if (op === "Not") {
      if (t !== BOOL) throw this.err(node, "'not' needs a bool operand; write a comparison");
      return [`(!${c})`, BOOL];
    }
    if (t === BOOL) throw this.err(node, "unary +/- on a bool value");
    return [op === "USub" ? `(-${c})` : c, t];
  }

  compare(node) {
    if (node.ops.length !== 1 || node.comparators.length !== 1) {
      throw this.err(node, "chained comparisons are not in the subset; write (a < b) and (b < c)");
    }
    const op = node.ops[0];
    if (!Object.hasOwn(CMP, op)) throw this.unsupportedOp(node, op, "only < <= > >= == != are in the subset");
    const [lc, lt] = this.expr(node.left);
    const [rc, rt] = this.expr(node.comparators[0]);
    if (lt === null || rt === null) return ["false", null];
    if (lt === BOOL || rt === BOOL) {
      if (lt !== rt || (op !== "Eq" && op !== "NotEq")) {
        throw this.err(node, "a bool can only be compared with == or != to another bool");
      }
      return [`(${lc} ${CMP[op]} ${rc})`, BOOL];
    }
    const [[a, b]] = this.numeric(node, [lc, lt], [rc, rt]);
    return [`(${a} ${CMP[op]} ${b})`, BOOL];
  }

  boolop(node) {
    const sym = node.op === "And" ? "&&" : "||";
    const codes = [];
    for (const v of node.values) {
      const [c, t] = this.expr(v);
      if (t === null) return ["false", null];
      if (t !== BOOL) throw this.err(v, "and/or operands must be comparisons or bools");
      codes.push(c);
    }
    return [`(${codes.join(` ${sym} `)})`, BOOL];
  }

  call(node) {
    if (node.keywords.length) throw this.unsupported(node, "keyword arguments are not in the subset");
    if (node.args.some((a) => a._type === "Starred")) throw this.unsupported(node, "*args are not in the subset");
    const f = node.func;
    if (f._type !== "Name") throw this.unsupported(f, `calls must name a builtin: ${BUILTIN_LIST}`);
    const name = f.id;
    if (name === "range") throw this.err(node, "range() is only allowed as the iterable of a for loop");
    if (!BUILTINS.has(name)) throw this.err(node, `call to ${pyRepr(name)} is not in the subset (builtins: ${BUILTIN_LIST})`);
    const arity = BUILTINS.get(name);
    if (node.args.length !== arity) throw this.err(node, `${name}() takes ${arity} argument(s)`);
    const args = node.args.map((a) => this.expr(a));
    if (args.some(([, t]) => t === null)) return ["0i", null];
    if (name === "min" || name === "max") {
      const [[a, b], t] = this.numeric(node, args[0], args[1]);
      return [`${name}(${a}, ${b})`, t];
    }
    if (FLOAT_FNS.includes(name)) {
      const cs = node.args.map((a, i) => this.coerce(a, args[i][0], args[i][1], F32));
      return [`${name}(${cs.join(", ")})`, F32];
    }
    const [c, t] = args[0];
    if (name === "abs") {
      if (t === BOOL) throw this.err(node, "abs() of a bool is not in the subset");
      return [`abs(${c})`, t];
    }
    if (name === "floor") {
      // math.floor returns an int; WGSL floor() returns f32, so convert back
      return [`i32(floor(${this.coerce(node.args[0], c, t, F32)}))`, I32];
    }
    if (name === "float") return [this.coerce(node.args[0], c, t, F32), F32];
    // int(): WGSL i32() truncates toward zero, as Python's int() does
    if (t === I32) return [c, I32];
    if (t === F32) return [`i32(${c})`, I32];
    throw this.err(node, "int() of a bool is not in the subset");
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// As CPython does, a parser error is overridden by a tokenizer error further on in the
// file, except "unexpected indent", which CPython reports before scanning the rest.
function parseText(text) {
  const toks = tokenize(text);
  try {
    return new Parser(toks).fileInput();
  } catch (e) {
    const last = toks[toks.length - 1];
    if (!(e instanceof PySyntaxError) || last.t !== "ERROR" || e === last.v || e.msg === "unexpected indent") throw e;
    const tokErr = last.v;
    if (!tokErr.soft) throw tokErr;
    if (tokErr.unclosed && e.tokLine > tokErr.unclosed.line) throw tokErr;
    throw e;
  }
}

function syntaxToKernelError(e, firstLine) {
  return new KernelError(`syntax error: ${e.msg}`, (e.lineno || 1) + firstLine - 1);
}

// Translates kernel source text. firstLine is the file line of the text's first line.
export function translateSource(src, { name = null, firstLine = 1 } = {}) {
  const text = normalizeNewlines(dedent(src));
  let tree;
  try {
    tree = parseText(text);
  } catch (e) {
    if (e instanceof PySyntaxError) throw syntaxToKernelError(e, firstLine);
    throw deepError(e);
  }
  if (tree.body.length !== 1 || tree.body[0]._type !== "FunctionDef") {
    throw new KernelError("expected exactly one function definition", firstLine);
  }
  try {
    return new Translator(tree.body[0], text, name || tree.body[0].name, firstLine).run();
  } catch (e) {
    throw deepError(e);
  }
}

// CPython fails on very deep nesting with RecursionError, which is not a SyntaxError; here a
// JavaScript stack overflow becomes a KernelError so the playground can show it.
function deepError(e) {
  if (e instanceof RangeError) return new KernelError("expression is nested too deeply to translate");
  return e;
}

// Translates every @kernel function in an editor buffer. Imports and a module docstring are
// ignored, undecorated functions are skipped, anything else at top level is an error.
// Returns [{ name, spec }] in source order, or throws the first KernelError.
export function translateModule(src) {
  const text = normalizeNewlines(src);
  let tree;
  try {
    tree = parseText(text);
  } catch (e) {
    if (e instanceof PySyntaxError) throw syntaxToKernelError(e, 1);
    throw deepError(e);
  }
  const lines = text.split("\n");
  const out = [];
  tree.body.forEach((stmt, idx) => {
    if (idx === 0 && stmt._type === "Expr" && isStrConst(stmt.value)) return;
    if (stmt._type === "Import" || stmt._type === "ImportFrom") return;
    if (stmt._type === "FunctionDef" || stmt._type === "AsyncFunctionDef") {
      if (!stmt.decorator_list.some(isKernelDecorator)) return;
      const start = stmt.decorator_list[0].lineno;
      const block = lines.slice(start - 1, stmt.end_lineno).join("\n") + "\n";
      out.push({ name: stmt.name, spec: translateSource(block, { firstLine: start }) });
      return;
    }
    throw new KernelError(`unsupported top-level ${stmt._type}: ${quotedDetail(text, stmt)}`, stmt.lineno);
  });
  return out;
}
