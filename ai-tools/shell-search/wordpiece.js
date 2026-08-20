// wordpiece.js — BERT WordPiece tokenizer, faithful to the HF `tokenizers`
// BertNormalizer + BertPreTokenizer + WordPiece + TemplateProcessing stack that
// MongoDB/mdbr-leaf-mt ships.
//
// Hand-rolled rather than pulled from transformers.js because the encoder here
// is a single ONNX session run through onnxruntime-web directly; adding a
// framework that bundles its own (version-skewed) copy of ORT to get one
// tokenizer is a bad trade for a static page. Correctness is not assumed —
// `tools/check_tokenizer.py` asserts token-for-token parity against the Python
// `tokenizers` output over the eval queries, and that check is the contract.
//
// Config read off tokenizer.json, not guessed:
//   normalizer      BertNormalizer{clean_text, handle_chinese_chars,
//                                  strip_accents: null, lowercase: true}
//   pre_tokenizer   BertPreTokenizer (whitespace + punctuation splits)
//   model           WordPiece{unk "[UNK]", prefix "##", max_input_chars 100}
//   post_processor  TemplateProcessing → [CLS] A [SEP]
//
// `strip_accents: null` inherits from `lowercase`, i.e. accents ARE stripped —
// the same rule the Rust implementation applies, and the reason this file NFDs
// and drops Mn marks rather than lowercasing alone.

const UNK = "[UNK]", CLS = "[CLS]", SEP = "[SEP]", PAD = "[PAD]";
const MAX_CHARS = 100, PREFIX = "##";

function isControl(c) {
  if (c === "\t" || c === "\n" || c === "\r") return false;
  const cat = c.codePointAt(0);
  return (cat >= 0 && cat <= 0x1f) || (cat >= 0x7f && cat <= 0x9f);
}

function isWhitespace(c) {
  return c === " " || c === "\t" || c === "\n" || c === "\r" ||
    /\s/u.test(c);
}

// Matches the Rust `is_punctuation`: ASCII punctuation ranges plus any
// Unicode P* category. JS `\p{P}` covers the latter.
function isPunctuation(c) {
  const cp = c.codePointAt(0);
  if ((cp >= 33 && cp <= 47) || (cp >= 58 && cp <= 64) ||
      (cp >= 91 && cp <= 96) || (cp >= 123 && cp <= 126)) return true;
  return /\p{P}|\p{S}/u.test(c) && /\p{P}/u.test(c);
}

function isChineseChar(cp) {
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x20000 && cp <= 0x2a6df) || (cp >= 0x2a700 && cp <= 0x2b73f) ||
    (cp >= 0x2b740 && cp <= 0x2b81f) || (cp >= 0x2b820 && cp <= 0x2ceaf) ||
    (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0x2f800 && cp <= 0x2fa1f);
}

function normalize(text) {
  let out = "";
  for (const c of text) {                       // iterate by code point
    const cp = c.codePointAt(0);
    if (cp === 0 || cp === 0xfffd || isControl(c)) continue;   // clean_text
    if (isWhitespace(c)) { out += " "; continue; }             // clean_text
    if (isChineseChar(cp)) { out += " " + c + " "; continue; } // handle_chinese
    out += c;
  }
  out = out.toLowerCase();
  // strip_accents inherits lowercase=true → decompose and drop combining marks
  return out.normalize("NFD").replace(/\p{Mn}/gu, "");
}

function preTokenize(text) {
  const words = [];
  for (const chunk of text.split(" ")) {
    if (!chunk) continue;
    let cur = "";
    for (const c of chunk) {
      if (isPunctuation(c)) {
        if (cur) { words.push(cur); cur = ""; }
        words.push(c);
      } else cur += c;
    }
    if (cur) words.push(cur);
  }
  return words;
}

export class WordPieceTokenizer {
  constructor(vocab) {
    this.vocab = vocab;
    this.unkId = vocab[UNK];
    this.clsId = vocab[CLS];
    this.sepId = vocab[SEP];
    this.padId = vocab[PAD];
  }

  static async fromUrl(url) {
    const t = await (await fetch(url)).json();
    return new WordPieceTokenizer(t.model.vocab);
  }

  /** Greedy longest-match-first over one pre-token, per the WordPiece model. */
  _wordToIds(word) {
    if (word.length > MAX_CHARS) return [this.unkId];
    const ids = [];
    let start = 0;
    while (start < word.length) {
      let end = word.length, found = null;
      while (start < end) {
        const sub = (start > 0 ? PREFIX : "") + word.slice(start, end);
        if (sub in this.vocab) { found = this.vocab[sub]; break; }
        end -= 1;
      }
      if (found === null) return [this.unkId];   // whole word → UNK
      ids.push(found);
      start = end;
    }
    return ids;
  }

  encode(text, { maxLength = 512 } = {}) {
    const words = preTokenize(normalize(text));
    let ids = [];
    for (const w of words) ids.push(...this._wordToIds(w));
    // TemplateProcessing: [CLS] A [SEP], truncating A to fit maxLength.
    const room = maxLength - 2;
    if (ids.length > room) ids = ids.slice(0, room);
    return [this.clsId, ...ids, this.sepId];
  }

  /** Encode a batch, right-padded to the longest row. Returns BigInt64Arrays. */
  encodeBatch(texts, { maxLength = 512 } = {}) {
    const rows = texts.map(t => this.encode(t, { maxLength }));
    const L = Math.max(...rows.map(r => r.length));
    const n = rows.length;
    const ids = new BigInt64Array(n * L);
    const mask = new BigInt64Array(n * L);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < L; j++) {
        const v = j < rows[i].length ? rows[i][j] : this.padId;
        ids[i * L + j] = BigInt(v);
        mask[i * L + j] = j < rows[i].length ? 1n : 0n;
      }
    }
    return { ids, mask, dims: [n, L] };
  }
}
