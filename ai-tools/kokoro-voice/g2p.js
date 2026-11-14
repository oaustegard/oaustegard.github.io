// English text -> Kokoro phonemes in the browser: a port of misaki 0.9.4's en.G2P (hexgrad/misaki, Apache-2.0),
// dictionary path only. Function names follow misaki's so the two can be read side by side.
//
// What differs from misaki:
// - spaCy's tokenizer and tagger are replaced by a small tokenizer and a few tagging rules. The tags only matter for
//   misaki's special cases (a, an, the, to, in, I, by, used), all-capital words, and 788 dictionary entries split by
//   part of speech, which fall back to their DEFAULT reading here ("I read it yesterday" says reed).
// - No espeak fallback for words in neither dictionary: those come back in `unknown`, are left silent, and the page
//   asks for a [word](/phonemes/) link, the syntax misaki itself takes.
// - num2words is replaced by a port of its English cardinal, ordinal and year readings.

const DIPHTHONGS = new Set("AIOQWYʤʧ");
const VOWELS = new Set("AIOQWYaiuæɑɒɔəɛɜɪʊʌᵻ");
const CONSONANTS = new Set("bdfhjklmnpstvwzðŋɡɹɾʃʒʤʧθ");
const PUNCTS = new Set(';:,.!?—…"“”');
const NON_QUOTE_PUNCTS = new Set(";:,.!?—…");
const SUBTOKEN_JUNKS = new Set("',-._‘’/");
const PUNCT_TAGS = new Set([".", ",", "-LRB-", "-RRB-", "``", '""', "''", ":", "$", "#", "NFP"]);
const PUNCT_TAG_PHONEMES = { "-LRB-": "(", "-RRB-": ")", "``": "“", '""': "”", "''": "”" };
const CURRENCIES = { $: ["dollar", "cent"], "£": ["pound", "pence"], "€": ["euro", "cent"] };
const ORDINALS = new Set(["st", "nd", "rd", "th"]);
const ADD_SYMBOLS = { ".": "dot", "/": "slash" };
const SYMBOLS = { "%": "percent", "&": "and", "+": "plus", "@": "at" };
const PRIMARY = "ˈ", SECONDARY = "ˌ";
const SUBTOKEN = /^['‘’]+|\p{Lu}(?=\p{Lu}\p{Ll})|(?:^-)?(?:\d?[,.]?\d)+|[-_]+|['‘’]{2,}|\p{L}*?(?:['‘’]\p{L})*?\p{Ll}(?=\p{Lu})|\p{L}+(?:['‘’]\p{L})*|[^-_\p{L}'‘’\d]|['‘’]+$/gu;
const LINK = /\[([^\]]+)\]\(([^)]*)\)/g;
const isAlpha = (s) => s.length > 0 && /^\p{L}+$/u.test(s);
const isDigit = (s) => /^[0-9]+$/.test(s);
const lexOrd = (c) => /^['\-A-Za-z]$/.test(c);
const isLower = (s) => s === s.toLowerCase();
const isUpper = (s) => s === s.toUpperCase();
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const stressWeight = (ps) => (ps ? [...ps].reduce((a, c) => a + (DIPHTHONGS.has(c) ? 2 : 1), 0) : 0);

export function applyStress(ps, stress) {
  const restress = (ps) => {
    const ips = [...ps].map((p, i) => [i, p]);
    for (const [i, p] of [...ips]) {
      if (p === PRIMARY || p === SECONDARY) {
        const j = ips.slice(i).find(([, v]) => VOWELS.has(v));
        if (j) ips[i] = [j[0] - 0.5, p];
      }
    }
    return ips.sort((a, b) => a[0] - b[0]).map(([, p]) => p).join("");
  };
  if (stress == null || ps == null) return ps;
  const has = (c) => ps.includes(c), noStress = !has(PRIMARY) && !has(SECONDARY), noVowel = ![...ps].some((c) => VOWELS.has(c));
  if (stress < -1) return ps.replaceAll(PRIMARY, "").replaceAll(SECONDARY, "");
  if (stress === -1 || ((stress === 0 || stress === -0.5) && has(PRIMARY))) return ps.replaceAll(SECONDARY, "").replaceAll(PRIMARY, SECONDARY);
  if ([0, 0.5, 1].includes(stress) && noStress) return noVowel ? ps : restress(SECONDARY + ps);
  if (stress >= 1 && !has(PRIMARY) && has(SECONDARY)) return ps.replaceAll(SECONDARY, PRIMARY);
  if (stress > 1 && noStress) return noVowel ? ps : restress(PRIMARY + ps);
  return ps;
}

// ---- num2words (English) ----
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
  "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = [[1e12, "trillion"], [1e9, "billion"], [1e6, "million"], [1e3, "thousand"]];
function under1000(n) {
  const out = [];
  if (n >= 100) { out.push(ONES[Math.floor(n / 100)] + " hundred"); n %= 100; if (n) out.push("and"); }
  if (n >= 20) out.push(TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
  else if (n > 0 || !out.length) out.push(ONES[n]);
  return out.join(" ");
}
export function cardinal(n) {
  if (n < 0) return "minus " + cardinal(-n);
  if (n < 1000) return under1000(n);
  const parts = [];
  for (const [v, name] of SCALES) {
    if (n >= v) { parts.push(cardinal(Math.floor(n / v)) + " " + name); n %= v; }
  }
  if (n) parts.push((n < 100 ? "and " : "") + under1000(n));
  return parts.join(" ");
}
const ORD_IRREG = { one: "first", two: "second", three: "third", five: "fifth", eight: "eighth", nine: "ninth", twelve: "twelfth" };
export function ordinal(n) {
  const words = cardinal(n);
  const m = words.match(/(.*?)([a-z]+)$/);
  const [, head, last] = m;
  let o = ORD_IRREG[last] ?? (last.endsWith("y") ? last.slice(0, -1) + "ieth" : last + "th");
  return head + o;
}
export function year(n) {
  if (n >= 2000 && n < 2010) return cardinal(n);
  const hi = Math.floor(n / 100), lo = n % 100;
  if (n % 1000 === 0 || hi % 10 === 0 && lo === 0 && n >= 1000 && n < 2000 && false) return cardinal(n);
  if (lo === 0) return cardinal(hi) + " hundred";
  return cardinal(hi) + " " + (lo < 10 ? "oh-" + ONES[lo] : cardinal(lo));
}
function floatWords(s) {
  const [i, f = ""] = String(parseFloat(s)).split("."); // misaki goes through float(): 1.0 -> one, 0.570 -> 0.57
  return cardinal(parseInt(i || "0", 10)) + (f ? " point " + [...f].map((d) => ONES[+d]).join(" ") : "");
}

// ---- tokens ----
class Tok {
  constructor(text, tag, ws, extra = {}) {
    Object.assign(this, { text, tag, ws, phonemes: null, rating: null, isHead: true, alias: null, stress: null,
      currency: null, numFlags: "", prespace: false }, extra);
  }
}

function mergeTokens(tokens, unk) {
  const stress = new Set(tokens.filter((t) => t.stress != null).map((t) => t.stress));
  const currency = tokens.filter((t) => t.currency != null).map((t) => t.currency);
  let phonemes = null;
  if (unk != null) {
    phonemes = "";
    for (const t of tokens) {
      if (t.prespace && phonemes && !/\s$/.test(phonemes) && t.phonemes) phonemes += " ";
      phonemes += t.phonemes == null ? unk : t.phonemes;
    }
  }
  const tagOf = tokens.reduce((best, t) => {
    const w = [...t.text].reduce((a, c) => a + (c === c.toLowerCase() ? 1 : 2), 0);
    return w > best.w ? { w, tag: t.tag } : best;
  }, { w: -1, tag: null }).tag;
  return new Tok(tokens.slice(0, -1).map((t) => t.text + t.ws).join("") + tokens.at(-1).text, tagOf, tokens.at(-1).ws, {
    phonemes, isHead: tokens[0].isHead, stress: stress.size === 1 ? [...stress][0] : null,
    currency: currency.length ? currency.sort().at(-1) : null,
    numFlags: [...new Set(tokens.flatMap((t) => [...t.numFlags]))].sort().join(""), prespace: tokens[0].prespace,
    rating: tokens.some((t) => t.rating == null) ? null : Math.min(...tokens.map((t) => t.rating)),
  });
}

// ---- lexicon ----
export class Lexicon {
  constructor(gold, silver) {
    this.golds = Lexicon.grow(gold);
    this.silvers = Lexicon.grow(silver);
    this.capStresses = [0.5, 2];
  }
  static grow(d) {
    const e = {};
    for (const [k, v] of Object.entries(d)) {
      if (k.length < 2) continue;
      if (k === k.toLowerCase()) { if (k !== capitalize(k)) e[capitalize(k)] = v; }
      else if (k === capitalize(k)) e[k.toLowerCase()] = v;
    }
    return { ...e, ...d };
  }
  has(d, w) { return Object.prototype.hasOwnProperty.call(d, w); }
  getNNP(word) {
    const ps = [...word].filter((c) => isAlpha(c)).map((c) => (this.has(this.golds, c.toUpperCase()) ? this.golds[c.toUpperCase()] : null));
    if (ps.includes(null) || !ps.length) return [null, null];
    let s = applyStress(ps.join(""), 0);
    const k = s.lastIndexOf(SECONDARY);
    if (k >= 0) s = s.slice(0, k) + PRIMARY + s.slice(k + 1);
    return [s, 3];
  }
  getSpecialCase(word, tag, stress, ctx) {
    if (tag === "ADD" && word in ADD_SYMBOLS) return this.lookup(ADD_SYMBOLS[word], null, -0.5, ctx);
    if (word in SYMBOLS) return this.lookup(SYMBOLS[word], null, null, ctx);
    const inner = word.replace(/^\.+|\.+$/g, "");
    if (inner.includes(".") && isAlpha(word.replaceAll(".", "")) && Math.max(...word.split(".").map((s) => s.length)) < 3) return this.getNNP(word);
    if (word === "a" || word === "A") return [tag === "DT" ? "ɐ" : "ˈA", 4];
    if (["am", "Am", "AM"].includes(word)) {
      if (tag?.startsWith("NN")) return this.getNNP(word);
      if (ctx.futureVowel == null || word !== "am" || (stress && stress > 0)) return [this.golds.am, 4];
      return ["ɐm", 4];
    }
    if (["an", "An", "AN"].includes(word)) {
      if (word === "AN" && tag?.startsWith("NN")) return this.getNNP(word);
      return ["ɐn", 4];
    }
    if (word === "I" && tag === "PRP") return [SECONDARY + "I", 4];
    if (["by", "By", "BY"].includes(word) && Lexicon.parentTag(tag) === "ADV") return ["bˈI", 4];
    if (word === "to" || word === "To" || (word === "TO" && (tag === "TO" || tag === "IN"))) {
      return [ctx.futureVowel == null ? this.golds.to : ctx.futureVowel ? "tʊ" : "tə", 4];
    }
    if (word === "in" || word === "In" || (word === "IN" && tag !== "NNP")) {
      return [(ctx.futureVowel == null || tag !== "IN" ? PRIMARY : "") + "ɪn", 4];
    }
    if (word === "the" || word === "The" || (word === "THE" && tag === "DT")) return [ctx.futureVowel === true ? "ði" : "ðə", 4];
    if (tag === "IN" && /^vs\.?$/i.test(word)) return this.lookup("versus", null, null, ctx);
    if (["used", "Used", "USED"].includes(word)) {
      if ((tag === "VBD" || tag === "JJ") && ctx.futureTo) return [this.golds.used.VBD, 4];
      return [this.golds.used.DEFAULT, 4];
    }
    return [null, null];
  }
  static parentTag(tag) {
    if (tag == null) return tag;
    if (tag.startsWith("VB")) return "VERB";
    if (tag.startsWith("NN")) return "NOUN";
    if (tag.startsWith("ADV") || tag.startsWith("RB")) return "ADV";
    if (tag.startsWith("ADJ") || tag.startsWith("JJ")) return "ADJ";
    return tag;
  }
  isKnown(word, tag) {
    if (this.has(this.golds, word) || word in SYMBOLS || this.has(this.silvers, word)) return true;
    if (!isAlpha(word) || ![...word].every(lexOrd)) return false;
    if ([...word].length === 1) return true;
    if (word === word.toUpperCase() && this.has(this.golds, word.toLowerCase())) return true;
    return word.slice(1) === word.slice(1).toUpperCase();
  }
  lookup(word, tag, stress, ctx) {
    let isNNP = null;
    if (word === word.toUpperCase() && !this.has(this.golds, word)) { word = word.toLowerCase(); isNNP = tag === "NNP"; }
    let ps = this.has(this.golds, word) ? this.golds[word] : null, rating = 4;
    if (ps == null && !isNNP) { ps = this.has(this.silvers, word) ? this.silvers[word] : null; rating = 3; }
    if (ps && typeof ps === "object") {
      if (ctx && ctx.futureVowel == null && "None" in ps) tag = "None";
      else if (!(tag in ps)) tag = Lexicon.parentTag(tag);
      ps = tag in ps ? ps[tag] : ps.DEFAULT;
    }
    if (ps == null || (isNNP && !ps.includes(PRIMARY))) {
      const [p, r] = this.getNNP(word);
      if (p != null) return [p, r];
    }
    return [applyStress(ps, stress), rating];
  }
  _s(stem) {
    if (!stem) return null;
    if ("ptkfθ".includes(stem.at(-1))) return stem + "s";
    if ("szʃʒʧʤ".includes(stem.at(-1))) return stem + "ɪz";
    return stem + "z";
  }
  stemS(word, tag, stress, ctx) {
    if (word.length < 3 || !word.endsWith("s")) return [null, null];
    let stem;
    if (!word.endsWith("ss") && this.isKnown(word.slice(0, -1), tag)) stem = word.slice(0, -1);
    else if ((word.endsWith("'s") || (word.length > 4 && word.endsWith("es") && !word.endsWith("ies"))) && this.isKnown(word.slice(0, -2), tag)) stem = word.slice(0, -2);
    else if (word.length > 4 && word.endsWith("ies") && this.isKnown(word.slice(0, -3) + "y", tag)) stem = word.slice(0, -3) + "y";
    else return [null, null];
    const [p, r] = this.lookup(stem, tag, stress, ctx);
    return [this._s(p), r];
  }
  _ed(stem) {
    if (!stem) return null;
    const c = stem.at(-1);
    if ("pkfθʃsʧ".includes(c)) return stem + "t";
    if (c === "d") return stem + "ɪd";
    if (c !== "t") return stem + "d";
    return stem + "ɪd";
  }
  stemEd(word, tag, stress, ctx) {
    if (word.length < 4 || !word.endsWith("d")) return [null, null];
    let stem;
    if (!word.endsWith("dd") && this.isKnown(word.slice(0, -1), tag)) stem = word.slice(0, -1);
    else if (word.length > 4 && word.endsWith("ed") && !word.endsWith("eed") && this.isKnown(word.slice(0, -2), tag)) stem = word.slice(0, -2);
    else return [null, null];
    const [p, r] = this.lookup(stem, tag, stress, ctx);
    return [this._ed(p), r];
  }
  _ing(stem) {
    if (!stem) return null;
    if ("əː".includes(stem.at(-1))) return null;
    return stem + "ɪŋ";
  }
  stemIng(word, tag, stress, ctx) {
    if (word.length < 5 || !word.endsWith("ing")) return [null, null];
    let stem;
    if (word.length > 5 && this.isKnown(word.slice(0, -3), tag)) stem = word.slice(0, -3);
    else if (this.isKnown(word.slice(0, -3) + "e", tag)) stem = word.slice(0, -3) + "e";
    else if (word.length > 5 && /([bcdgklmnprstvxz])\1ing$|cking$/.test(word) && this.isKnown(word.slice(0, -4), tag)) stem = word.slice(0, -4);
    else return [null, null];
    const [p, r] = this.lookup(stem, tag, stress, ctx);
    return [this._ing(p), r];
  }
  getWord(word, tag, stress, ctx) {
    const [sp, sr] = this.getSpecialCase(word, tag, stress, ctx);
    if (sp != null) return [sp, sr];
    const wl = word.toLowerCase();
    if (word.length > 1 && isAlpha(word.replaceAll("'", "")) && word !== wl && (tag !== "NNP" || word.length > 7)
        && !this.has(this.golds, word) && !this.has(this.silvers, word)
        && (word === word.toUpperCase() || word.slice(1) === word.slice(1).toLowerCase())
        && (this.has(this.golds, wl) || this.has(this.silvers, wl)
            || [this.stemS, this.stemEd, this.stemIng].some((fn) => fn.call(this, wl, tag, stress, ctx)[0]))) {
      word = wl;
    }
    if (this.isKnown(word, tag)) return this.lookup(word, tag, stress, ctx);
    if (word.endsWith("s'") && this.isKnown(word.slice(0, -2) + "'s", tag)) return this.lookup(word.slice(0, -2) + "'s", tag, stress, ctx);
    if (word.endsWith("'") && this.isKnown(word.slice(0, -1), tag)) return this.lookup(word.slice(0, -1), tag, stress, ctx);
    let r = this.stemS(word, tag, stress, ctx);
    if (r[0] != null) return r;
    r = this.stemEd(word, tag, stress, ctx);
    if (r[0] != null) return r;
    r = this.stemIng(word, tag, stress == null ? 0.5 : stress, ctx);
    if (r[0] != null) return r;
    return [null, null];
  }
  static isCurrency(word) {
    if (!word.includes(".")) return true;
    if (word.split(".").length > 2) return false;
    return word.split(".")[1].length < 3;
  }
  getNumber(word, currency, isHead, numFlags) {
    const sm = word.match(/[a-z']+$/);
    const suffix = sm ? sm[0] : null;
    if (suffix) word = word.slice(0, -suffix.length);
    const result = [];
    if (word.startsWith("-")) { result.push(this.lookup("minus", null, null, null)); word = word.slice(1); }
    const extend = (num, first = true, escape = false) => {
      const splits = (escape ? num : cardinal(parseInt(num, 10))).split(/[^a-z]+/);
      splits.forEach((w, i) => {
        if (w !== "and" || numFlags.includes("&")) {
          if (first && i === 0 && splits.length > 1 && w === "one" && numFlags.includes("a")) result.push(["ə", 4]);
          else result.push(this.lookup(w, null, w === "point" ? -2 : null, null));
        } else if (w === "and" && numFlags.includes("n") && result.length) {
          result[result.length - 1] = [result.at(-1)[0] + "ən", result.at(-1)[1]];
        }
      });
    };
    if (isDigit(word) && ORDINALS.has(suffix)) extend(ordinal(parseInt(word, 10)), true, true);
    else if (!result.length && word.length === 4 && !(currency in CURRENCIES) && isDigit(word)) extend(year(parseInt(word, 10)), true, true);
    else if (!isHead && !word.includes(".")) {
      const num = word.replaceAll(",", "");
      if (num[0] === "0" || num.length > 3) [...num].forEach((n) => extend(n, false));
      else if (num.length === 3 && !num.endsWith("00")) {
        extend(num[0]);
        if (num[1] === "0") { result.push(this.lookup("O", null, -2, null)); extend(num[2], false); }
        else extend(num.slice(1), false);
      } else extend(num);
    } else if (word.split(".").length > 2 || !isHead) {
      let first = true;
      for (const num of word.replaceAll(",", "").split(".")) {
        if (!num) { /* skip */ }
        else if (num[0] === "0" || (num.length !== 2 && [...num.slice(1)].some((n) => n !== "0"))) [...num].forEach((n) => extend(n, false));
        else extend(num, first);
        first = false;
      }
    } else if (currency in CURRENCIES && Lexicon.isCurrency(word)) {
      let pairs = word.replaceAll(",", "").split(".").map((n, k) => [n ? parseInt(n, 10) : 0, CURRENCIES[currency][k]]).filter((p) => p[1]);
      if (pairs.length > 1) { if (pairs[1][0] === 0) pairs = pairs.slice(0, 1); else if (pairs[0][0] === 0) pairs = pairs.slice(1); }
      pairs.forEach(([num, unit], k) => {
        if (k > 0) result.push(this.lookup("and", null, null, null));
        extend(String(num), k === 0);
        result.push(Math.abs(num) !== 1 && unit !== "pence" ? this.stemS(unit + "s", null, null, null) : this.lookup(unit, null, null, null));
      });
    } else {
      let w;
      if (isDigit(word)) w = cardinal(parseInt(word, 10));
      else if (!word.includes(".")) w = ORDINALS.has(suffix) ? ordinal(parseInt(word.replaceAll(",", ""), 10)) : cardinal(parseInt(word.replaceAll(",", ""), 10));
      else {
        const x = word.replaceAll(",", "");
        w = x[0] === "." ? "point " + [...x.slice(1)].map((d) => ONES[+d]).join(" ") : floatWords(x);
      }
      extend(w, true, true);
    }
    if (!result.length || result.some(([p]) => p == null)) return [null, null];
    const ps = result.map(([p]) => p).join(" "), rating = Math.min(...result.map(([, r]) => r));
    if (suffix === "s" || suffix === "'s") return [this._s(ps), rating];
    if (suffix === "ed" || suffix === "'d") return [this._ed(ps), rating];
    if (suffix === "ing") return [this._ing(ps), rating];
    return [ps, rating];
  }
  appendCurrency(ps, currency) {
    if (!currency) return ps;
    const c = CURRENCIES[currency];
    const name = c ? this.stemS(c[0] + "s", null, null, null)[0] : null;
    return name ? `${ps} ${name}` : ps;
  }
  static isNumber(word, isHead) {
    if (![...word].some((c) => isDigit(c))) return false;
    for (const s of ["ing", "'d", "ed", "'s", ...ORDINALS, "s"]) {
      if (word.endsWith(s)) { word = word.slice(0, -s.length); break; }
    }
    return [...word].every((c, i) => isDigit(c) || c === "," || c === "." || (isHead && i === 0 && c === "-"));
  }
  call(tk, ctx) {
    let word = (tk.alias ?? tk.text).replaceAll("‘", "'").replaceAll("’", "'").normalize("NFKC");
    const stress = word === word.toLowerCase() ? null : this.capStresses[word === word.toUpperCase() ? 1 : 0];
    const [ps, rating] = this.getWord(word, tk.tag, stress, ctx);
    if (ps != null) return [applyStress(this.appendCurrency(ps, tk.currency), tk.stress), rating];
    if (Lexicon.isNumber(word, tk.isHead)) {
      const [p, r] = this.getNumber(word, tk.currency, tk.isHead, tk.numFlags);
      return [applyStress(p, tk.stress), r];
    }
    return [null, null];
  }
}

// ---- tokenizer and tags (stand-in for spaCy) ----
const ABBREVIATIONS = new Set(["mr.", "mrs.", "ms.", "dr.", "st.", "jr.", "sr.", "prof.", "vs.", "etc.", "e.g.", "i.e.", "inc.", "ltd.", "co.", "mt.", "no."]);
const OPEN_QUOTES = new Set(["“", "‘"]), CLOSE_QUOTES = new Set(["”", "’"]);
function punctTag(t, prev) {
  if (/^[.!?]+$/.test(t)) return ".";
  if (t === ",") return ",";
  if (/^[;:]$/.test(t) || /^[—–-]+$/.test(t)) return ":"; // (a hyphen inside a word is tagged HYPH in tokenize)
  if (t === "…" || /^\.{2,}$/.test(t)) return ":";
  if (t === "(" || t === "[" || t === "{") return "-LRB-";
  if (t === ")" || t === "]" || t === "}") return "-RRB-";
  if (OPEN_QUOTES.has(t)) return "``";
  if (CLOSE_QUOTES.has(t)) return "''";
  if (t === '"' || t === "'") return prev == null || /\s$/.test(prev) ? "``" : "''";
  if (t in CURRENCIES) return "$";
  if (t === "#") return "#";
  return null;
}
const FUNCTION_TAGS = { a: "DT", an: "DT", the: "DT", i: "PRP", to: "TO", in: "IN", by: "IN", of: "IN", for: "IN", on: "IN",
  at: "IN", with: "IN", from: "IN", vs: "IN", "vs.": "IN" };
function wordTag(t, sentenceStart, known) {
  if (/^-?[\d,.]*\d[\d,.]*(st|nd|rd|th|s)?$/.test(t)) return "CD";
  const f = FUNCTION_TAGS[t.toLowerCase()];
  if (f && (f !== "PRP" || t === "I")) return f;
  if (t.length > 1 && /\p{L}/u.test(t) && t === t.toUpperCase() && !known(t.toLowerCase())) return "NNP"; // NOT is not a name
  if (/^\p{Lu}/u.test(t) && t !== t.toUpperCase() && !sentenceStart) return "NNP";
  return null;
}

// Part of speech from neighbours, for the dictionary's NOUN / VERB / VBD / DT readings (spaCy's job in misaki).
const DETS = new Set(["a", "an", "the", "this", "these", "those", "my", "your", "his", "her", "its", "our", "their",
  "some", "any", "each", "every", "no", "another", "such", "what", "which", "whose"]);
const MODALS = new Set(["will", "would", "can", "could", "should", "shall", "may", "might", "must", "'ll", "'d",
  "don't", "doesn't", "didn't", "won't", "can't", "cannot", "not", "never", "n't"]);
const SUBJECTS = new Set(["i", "you", "we", "they", "he", "she", "it", "who"]);
const BE = new Set(["is", "are", "was", "were", "be", "been", "being", "am", "'s", "'re"]);
const PREPS = new Set(["of", "in", "on", "at", "for", "with", "from", "by", "about", "into", "over", "under", "after",
  "before", "between", "through", "during", "without", "within"]);
function tagByContext(tokens) {
  const words = tokens.map((t, i) => ({ t, i })).filter(({ t }) => /\p{L}/u.test(t.text));
  words.forEach(({ t }, k) => {
    if (t.tag && t.tag !== "NNP") return;
    const w = t.text.toLowerCase().replace(/['’](s|re|ve|ll|d|m)$/, ""); // that's -> that
    const prev = k > 0 ? words[k - 1].t.text.toLowerCase() : null;
    const adjacent = k > 0 && words[k - 1].i === tokens.indexOf(t) - 1;
    if (w === "that") {
      t.tag = prev == null || !adjacent || PREPS.has(prev) || ["why", "how", "and", "but", "or", "is", "was", "so"].includes(prev) ? "DT" : "IN";
      return;
    }
    if (w === "used") { t.tag = prev != null && BE.has(prev) ? "VBN" : "VBD"; return; }
    if (t.tag === "NNP") return;
    if (prev == null) return;
    if (DETS.has(prev) || PREPS.has(prev)) t.tag = "NN";
    else if (prev === "to" || MODALS.has(prev)) t.tag = "VB";
    else if (SUBJECTS.has(prev)) t.tag = w === "read" ? "VBD" : "VBP";
  });
}

/** Split one whitespace-separated piece into spaCy-like tokens: strip punctuation off both ends, split currency
 * signs and %, split hyphens and dashes between letters, keep abbreviations and numbers whole. */
function splitPiece(piece) {
  const pre = [], post = [];
  let s = piece;
  for (;;) {
    const m = s.match(/^(["“‘'(\[{]|[$£€#])/u);
    if (m && s.length > 1) { pre.push(m[0]); s = s.slice(m[0].length); continue; }
    break;
  }
  for (;;) {
    if (ABBREVIATIONS.has(s.toLowerCase()) || /^(\p{L}\.){2,}$/u.test(s)) break;
    const m = s.match(/(\.{3}|…|[.,!?;:"”’)\]}%]|'(?!\p{L}))$/u);
    if (m && s.length > m[0].length) { post.unshift(m[0]); s = s.slice(0, -m[0].length); continue; }
    break;
  }
  const mid = s ? s.split(/(?<=\p{L})([—–]|-(?=\p{L}))(?=\p{L})/u).filter((x) => x !== "" && x !== undefined) : [];
  return [...pre, ...mid, ...post];
}

export class G2P {
  constructor(gold, silver) { this.lexicon = new Lexicon(gold, silver); this.unk = ""; this.pieces = null; }

  /** A guess for a word in neither dictionary (where misaki would ask espeak): the fewest dictionary words, each of
   * at least two letters, that spell it ("Kinescript" -> kine + script), joined with the main stress on the first.
   * Returns null when no split exists. */
  guess(word) {
    const w = word.toLowerCase();
    if (!/^[a-z]{3,24}$/.test(w)) return null;
    if (!this.pieces) {
      this.pieces = new Map();
      for (const d of [this.lexicon.silvers, this.lexicon.golds]) {
        for (const [k, v] of Object.entries(d)) {
          if (/^[a-z]{2,}$/.test(k)) this.pieces.set(k, typeof v === "string" ? v : v.DEFAULT);
        }
      }
    }
    const best = new Array(w.length + 1).fill(null);
    best[0] = [];
    for (let i = 0; i < w.length; i++) {
      if (!best[i]) continue;
      for (let j = w.length; j >= i + 2; j--) {
        const ps = this.pieces.get(w.slice(i, j));
        if (ps && (!best[j] || best[j].length > best[i].length + 1)) best[j] = [...best[i], ps];
      }
    }
    const parts = best[w.length];
    if (!parts || parts.length > 3) return null;
    return parts.map((ps, k) => (k ? applyStress(ps, -1) : ps)).join("");
  }

  /** Text with [word](feature) links -> segments {text, ws, feature}: the link text is its own segment, as the
   * whitespace-split pieces around it are, so a feature lands on exactly the tokens of its link (spaCy's alignment). */
  static preprocess(text) {
    const segs = [];
    const plain = (t) => {
      for (const m of t.matchAll(/(\S+)(\s*)/g)) segs.push({ text: m[1], ws: m[2] ? " " : "", feature: null });
      if (/^\s/.test(t) && segs.length > 1) segs[segs.length - [...t.matchAll(/\S+/g)].length - 1].ws = " ";
    };
    let last = 0;
    text = text.replace(/^\s+/, "");
    for (const m of text.matchAll(LINK)) {
      plain(text.slice(last, m.index));
      let f = m[2];
      if (isDigit(f.slice(/^[-+]/.test(f) ? 1 : 0))) f = parseInt(f, 10);
      else if (f === "0.5" || f === "+0.5") f = 0.5;
      else if (f === "-0.5") f = -0.5;
      else if (f.length > 1 && f[0] === "/" && f.at(-1) === "/") f = "/" + f.slice(1).replace(/\/+$/, "");
      else if (f.length > 1 && f[0] === "#" && f.at(-1) === "#") f = "#" + f.slice(1).replace(/#+$/, "");
      else f = null;
      const after = text.slice(m.index + m[0].length);
      segs.push({ text: m[1], ws: /^\s/.test(after) ? " " : "", feature: f });
      last = m.index + m[0].length;
    }
    plain(text.slice(last));
    return segs;
  }

  tokenize(segs) {
    const out = [];
    let sentenceStart = true, prevText = null;
    segs.forEach((seg, k) => {
      const parts = seg.feature != null && String(seg.feature).startsWith("/") ? [seg.text] : splitPiece(seg.text);
      parts.forEach((p, j) => {
        const ws = j === parts.length - 1 ? seg.ws : "";
        let tag = /^[-–—]$/.test(p) && j > 0 && j < parts.length - 1 && p === "-" ? "HYPH" : punctTag(p, prevText);
        if (tag == null) tag = wordTag(p, sentenceStart, (w) => this.lexicon.has(this.lexicon.golds, w));
        const tk = new Tok(p, tag, ws, { piece: k });
        out.push(tk);
        sentenceStart = tag === "." || (sentenceStart && tag != null && tag !== "CD" && !/\p{L}/u.test(p));
        prevText = ws ? p + ws : p;
      });
      const v = seg.feature;
      if (v == null) return;
      out.filter((t) => t.piece === k).forEach((t, i) => {
        if (typeof v === "number") t.stress = v;
        else if (v.startsWith("/")) { t.isHead = i === 0; t.phonemes = i === 0 ? v.slice(1) : ""; t.rating = 5; }
        else if (v.startsWith("#")) t.numFlags = v.slice(1);
      });
    });
    tagByContext(out);
    return out;
  }

  foldLeft(tokens) {
    const out = [];
    for (const t of tokens) out.push(out.length && !t.isHead ? mergeTokens([out.pop(), t], this.unk) : t);
    return out;
  }

  static retokenize(tokens) {
    const words = [];
    let currency = null;
    tokens.forEach((token, i) => {
      const tks = token.alias == null && token.phonemes == null
        ? [...token.text.matchAll(SUBTOKEN)].map((m) => new Tok(m[0], token.tag, "", { numFlags: token.numFlags, stress: token.stress }))
        : [token];
      if (!tks.length) return;
      tks.at(-1).ws = token.ws;
      tks.forEach((tk, j) => {
        if (tk.alias != null || tk.phonemes != null) { /* given */ }
        else if (tk.tag === "$" && tk.text in CURRENCIES) { currency = tk.text; tk.phonemes = ""; tk.rating = 4; }
        else if (tk.tag === ":" && (tk.text === "-" || tk.text === "–")) { tk.phonemes = "—"; tk.rating = 3; }
        else if (PUNCT_TAGS.has(tk.tag) && ![...tk.text].every((c) => /[a-z]/.test(c.toLowerCase()))) {
          tk.phonemes = PUNCT_TAG_PHONEMES[tk.tag] ?? [...tk.text].filter((c) => PUNCTS.has(c)).join(""); tk.rating = 4;
        } else if (currency != null) {
          if (tk.tag !== "CD") currency = null;
          else if (j + 1 === tks.length && (i + 1 === tokens.length || tokens[i + 1].tag !== "CD")) tk.currency = currency;
        } else if (j > 0 && j < tks.length - 1 && tk.text === "2" && /^\p{L}{2}$/u.test(tks[j - 1].text.at(-1) + tks[j + 1].text[0])) {
          tk.alias = "to";
        }
        if (tk.alias != null || tk.phonemes != null) words.push(tk);
        else if (words.length && Array.isArray(words.at(-1)) && !words.at(-1).at(-1).ws) { tk.isHead = false; words.at(-1).push(tk); }
        else words.push(tk.ws ? tk : [tk]);
      });
    });
    return words.map((w) => (Array.isArray(w) && w.length === 1 ? w[0] : w));
  }

  static tokenContext(ctx, ps, token) {
    let vowel = ctx.futureVowel;
    if (ps) {
      for (const c of ps) {
        if (VOWELS.has(c) || CONSONANTS.has(c) || NON_QUOTE_PUNCTS.has(c)) { vowel = NON_QUOTE_PUNCTS.has(c) ? null : VOWELS.has(c); break; }
      }
    }
    const futureTo = token.text === "to" || token.text === "To" || (token.text === "TO" && (token.tag === "TO" || token.tag === "IN"));
    return { futureVowel: vowel, futureTo };
  }

  static resolveTokens(tokens) {
    const text = tokens.slice(0, -1).map((t) => t.text + t.ws).join("") + tokens.at(-1).text;
    const kinds = new Set([...text].filter((c) => !SUBTOKEN_JUNKS.has(c)).map((c) => (/\p{L}/u.test(c) ? 0 : isDigit(c) ? 1 : 2)));
    const prespace = text.includes(" ") || text.includes("/") || kinds.size > 1;
    tokens.forEach((tk, i) => {
      if (tk.phonemes == null) {
        if (i === tokens.length - 1 && NON_QUOTE_PUNCTS.has(tk.text)) { tk.phonemes = tk.text; tk.rating = 3; }
        else if ([...tk.text].every((c) => SUBTOKEN_JUNKS.has(c))) { tk.phonemes = ""; tk.rating = 3; }
      } else if (i > 0) tk.prespace = prespace;
    });
    if (prespace) return;
    let indices = tokens.map((tk, i) => [tk.phonemes?.includes(PRIMARY) ? 1 : 0, stressWeight(tk.phonemes), i]).filter(([, , i]) => tokens[i].phonemes);
    if (indices.length === 2 && tokens[indices[0][2]].text.length === 1) {
      const i = indices[1][2];
      tokens[i].phonemes = applyStress(tokens[i].phonemes, -0.5);
      return;
    }
    if (indices.length < 2 || indices.reduce((a, [b]) => a + b, 0) <= Math.floor((indices.length + 1) / 2)) return;
    indices = indices.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).slice(0, Math.floor(indices.length / 2));
    for (const [, , i] of indices) tokens[i].phonemes = applyStress(tokens[i].phonemes, -0.5);
  }

  /** text -> {ps, tokens: [{text, phonemes, ws}], unknown, guessed} as misaki's G2P(trf=False, british, unk="") gives,
   * except that words misaki would send to espeak are guessed from dictionary pieces (guessed) or left silent (unknown). */
  phonemize(input) {
    let tokens = this.foldLeft(this.tokenize(G2P.preprocess(input)));
    tokens = G2P.retokenize(tokens);
    const unknown = [], guessed = [];
    let ctx = { futureVowel: null, futureTo: false };
    for (let i = tokens.length - 1; i >= 0; i--) {
      const w = tokens[i];
      if (!Array.isArray(w)) {
        if (w.phonemes == null) [w.phonemes, w.rating] = this.lexicon.call(w, ctx);
        if (w.phonemes == null && /\p{L}|\d/u.test(w.text)) {
          const g = this.guess(w.text);
          if (g) { w.phonemes = g; guessed.push(w.text); } else unknown.push(w.text);
        }
        ctx = G2P.tokenContext(ctx, w.phonemes, w);
        continue;
      }
      let left = 0, right = w.length;
      while (left < right) {
        const tk = w.slice(left, right).some((t) => t.alias != null || t.phonemes != null) ? null : mergeTokens(w.slice(left, right));
        const [ps, rating] = tk == null ? [null, null] : this.lexicon.call(tk, ctx);
        if (ps != null) {
          w[left].phonemes = ps; w[left].rating = rating;
          for (const x of w.slice(left + 1, right)) { x.phonemes = ""; x.rating = rating; }
          ctx = G2P.tokenContext(ctx, ps, tk);
          right = left; left = 0;
        } else if (left + 1 < right) left += 1;
        else {
          right -= 1;
          const t = w[right];
          if (t.phonemes == null) {
            if ([...t.text].every((c) => SUBTOKEN_JUNKS.has(c))) { t.phonemes = ""; t.rating = 3; }
            else if (/\p{L}|\d/u.test(t.text)) {
              const g = this.guess(t.text);
              if (g) { t.phonemes = g; guessed.push(t.text); } else unknown.push(t.text);
            }
          }
          left = 0;
        }
      }
      G2P.resolveTokens(w);
    }
    const merged = tokens.map((t) => (Array.isArray(t) ? mergeTokens(t, this.unk) : t));
    for (const t of merged) if (t.phonemes) t.phonemes = t.phonemes.replaceAll("ɾ", "T").replaceAll("ʔ", "t");
    const out = merged.map((t) => ({ text: t.text, phonemes: t.phonemes ?? this.unk, ws: Boolean(t.ws) }));
    return { ps: out.map((t) => t.phonemes + (t.ws ? " " : "")).join(""), tokens: out, unknown: unknown.reverse(),
             guessed: guessed.reverse() };
  }
}

// ---- KPipeline's chunking (kokoro/pipeline.py en_tokenize), so typed text reaches the model as baked lines do ----
const LIMIT = 510;
const tokensToPs = (tks) => tks.map((t) => t.phonemes + (t.ws ? " " : "")).join("").trim();
function waterfallLast(tks, nextCount) {
  for (const w of ["!.?…", ":;", ",—"]) {
    let z = -1;
    for (let i = tks.length - 1; i >= 0; i--) if (tks[i].phonemes.length && [...tks[i].phonemes].every((c) => w.includes(c)) && w.includes(tks[i].phonemes)) { z = i; break; }
    if (z < 0) continue;
    z += 1;
    if (z < tks.length && [")", "”"].includes(tks[z].phonemes)) z += 1;
    if (nextCount - tokensToPs(tks.slice(0, z)).length <= LIMIT) return z;
  }
  return tks.length;
}
export function chunk(tokens) {
  const chunks = [];
  let tks = [], pcount = 0;
  for (const t of tokens) {
    let next = t.phonemes + (t.ws ? " " : "");
    const nextCount = pcount + [...next.trimEnd()].length;
    if (nextCount > LIMIT) {
      const z = waterfallLast(tks, nextCount);
      chunks.push({ ps: tokensToPs(tks.slice(0, z)), tokens: tks.slice(0, z) });
      tks = tks.slice(z);
      pcount = [...tokensToPs(tks)].length;
      if (!tks.length) next = next.trimStart();
    }
    tks.push(t);
    pcount += [...next].length;
  }
  if (tks.length) chunks.push({ ps: tokensToPs(tks), tokens: tks });
  return chunks.filter((c) => c.ps);
}
