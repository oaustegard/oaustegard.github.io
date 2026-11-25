# Anything to Text

Drop in **anything** — an image, a PDF, a document, or an audio/video recording — and
get text back. Everything runs **in your browser**: files are never uploaded, only
the models and the document converter download (once) on first use.

It is a composite of three pipelines behind a single drop zone that routes each
file by type:

| Input | Engine | Output |
|---|---|---|
| Images (`png`, `jpg`, …) | OCR: **Indra OCR** (needs WebGPU) by default, PaddleOCR **PP-OCRv6** (packed on WebGPU, onnxruntime-web otherwise) or **Tesseract** (fine-tuned English); optionally a second model to compare against | Markdown (Indra) or text lines in reading order, with confidence |
| PDFs | pdf.js text layer when present, OCR fallback otherwise | per-page text, exact where the PDF is born-digital |
| Audio / video (`mp4`, `mov`, `mkv`, `webm`, `mp3`, `wav`, `m4a`, `flac`, `ogg`, …) | Speech-to-text — **Whisper**, from quantized packs on a WebGPU engine ([whisper-pack](https://github.com/oaustegard/experiments/tree/main/whisper-pack)), or via Transformers.js | timestamped transcript, editable, with per-segment playback |
| Documents (`docx`, `pptx`, `xlsx`, `odt`, EPUB, HTML, LaTeX, … — full list below) | **pandoc** 3.10, the official WebAssembly build, in a web worker | Markdown (GitHub or pandoc) or plain text |

Drop several files at once and the relevant sections light up independently —
e.g. a folder of scans plus one screen recording.

Routing validates by **file content, not name or the picker's type filter**. A
file whose declared type/extension doesn't identify it — e.g. an arXiv PDF a phone
saved as `2401.12345` with no `.pdf` suffix and a generic MIME type — is sniffed by
its magic bytes after selection and, if recognized (PDF or a supported image
format), re-tagged and routed to OCR. Word, PowerPoint, Excel, EPUB and ODT files saved
without an extension are recognized by content too and routed to Documents. The file
picker imposes no `accept` filter, so these extensionless files are selectable in the
first place.

## Images & PDFs (OCR)

- **OCR model** (a dropdown above the run button). The default, **Indra OCR**
  ([datalab-to/indra-ocr](https://github.com/datalab-to/indra-ocr), 12M parameters,
  weights under Datalab's OpenRAIL-M license), writes each page as Markdown: headings,
  whole paragraphs, lists and tables, in the reading order it predicts. It corrects
  skew and 90-degree rotation first. It runs on the GPU through WebGPU, which current
  Chrome, Edge and Safari provide. The code and about 2.3 MB of weights download from
  [austegard.com/experiments/indra-browser](https://austegard.com/experiments/indra-browser/web/)
  on first use; models for other writing systems and its spelling-correction tables
  download only when a page needs them.
- **PP-OCRv6** is the other choice, in two sizes (tiny ~3M / small ~7M parameters).
  It returns plain text lines. With WebGPU it runs from packed int8 weights with
  hand-written WGSL kernels (the
  [ppocr-pack](https://austegard.com/experiments/ppocr-pack/web/) experiment), which
  download from there on first use: about 1.6 MB for tiny, 6.3 MB for small. Without
  WebGPU, or if the packed engine fails to load, it runs through onnxruntime-web
  from Hugging Face (6.2 MB / 31 MB; append `?ort=1` to force this path). A browser
  without WebGPU switches from Indra to PP-OCRv6 small automatically. The 50-language
  character list ships with the packs, or comes from Hugging Face on the fallback path.
- **Tesseract English, fine-tuned for scans** runs Tesseract's page layout and its LSTM
  recognizer on WebGPU, with an English model fine-tuned on document lines and receipt
  photos that cuts errors on real scans by about 30% against Google's `eng` model
  (Apache-2.0, 5 MB). English only; needs WebGPU. It comes from the
  [tesseract-gpu](https://austegard.com/experiments/tesseract-gpu/web/) experiment and
  loads from there on first use.
- **PDFs are hybrid**: each page first tries pdf.js's embedded text layer (exact,
  instant, no model). Only text-less pages (scans) fall through to OCR, so a
  born-digital PDF never loads an OCR model. Any page can be forced through OCR
  with **Re-run as OCR**.
- **Rotate**: each OCRed page card has counter-clockwise and clockwise buttons (↺ ↻)
  for a scan or photo that came in sideways or upside down. The preview turns at once
  and, once the clicks stop, the page is read again with every model that is on, from
  the turned pixels, so the text, the word boxes and the exports share one frame. The
  turn is kept when results are cleared and written to the `.json` as `rotation`.
  Indra turns a sideways page by itself; the PP-OCRv6 and Tesseract models do not.
- **Auto-rotate** (on by default, `rot=off` in the address to disable): before a page is
  read, a PP-OCRv6 model (the primary, else the compare model; else Tesseract) checks its
  orientation on a copy of at most 1280 px. Text lines that come out taller than wide mean
  a sideways page, and the page is then read turned 90° and 270° and the more confident
  reading wins. A page that reads below 85% confidence upright is also read turned 180°,
  and that wins only by 8 points. A page that reads confidently upright costs one extra
  pass; when no verdict is clear the page is left as it is. The card says `turned N° (auto)`;
  a turn made with the buttons replaces it and is never overridden. With Indra alone there
  is nothing to ask, so Auto-rotate does nothing.
- **PDF layers**: by default a page is read flattened, as a viewer shows it. Every
  image is composited, including the JBIG2 and JPEG 2000 layers that compressed scans
  use for the text over a JPEG background, and filled-in form fields and FreeText notes
  are painted onto the page and their values added to the text layer. **Fields &
  annotations separately** splits each page that has annotations into two entries: the
  page content alone (the blank form) and the fields and annotations alone. The mode
  applies to PDFs added after it is set.
- Large jobs process in batches — press **Run batch**, then **Continue**.
- **Exports**: copy all text, `.txt`, `.md` (Markdown when Indra read the page, plain
  text lines otherwise), `.json` (with normalized bounding boxes and
  per-segment confidence), and `.html` (an absolutely-positioned text layer that
  preserves the original page geometry — columns and tables survive). JSON and HTML
  can be previewed in-page before download.

## Audio & Video (transcription)

- **Whisper** models: tiny / base / small / large-v3-turbo. Runs on **WebGPU** when
  available, WASM (CPU) otherwise — the badge shows which.
- With WebGPU the default models are **packed**: quantized weights on a hand-written WebGPU
  engine, in two builds per size. *English-optimized* (the default) is the smaller or more
  accurate choice for English audio; *All languages* is used automatically for any other
  language, for translation, and for Auto-detect on tiny, base and small. Downloads: tiny
  25–28 MB, base 47–55 MB, small 171–183 MB, large-v3-turbo 412–493 MB. The original ONNX
  models stay in the menu and take over if a pack fails to load.
- Audio is decoded to 16 kHz mono in-page (native Web Audio for audio; `ffmpeg.wasm`
  loaded lazily for video / unsupported containers).
- **Voice-activity detection** segments speech into ≤30 s bundles, dropping silence,
  so each model call is one full-context window — less compute, cleaner boundaries.
- Live partial text streams as it decodes; the transcript is **editable inline**, and
  every segment has a **play button** that checks that span against the audio.
- Language can be auto-detected or pinned; **Translate → EN** is available.
- **Exports**: copy, `.txt`, and `.srt` (segment ends normalized to the displayed spans).
- **Edit existing** tab: load a prior recording plus its `.srt`/`.txt`, correct the
  text against per-segment playback, and re-download — no re-transcription needed.

## Documents (pandoc)

- **Formats**: any of these comes back as Markdown or plain text: Word (`.docx`),
  PowerPoint (`.pptx`), Excel (`.xlsx`), OpenDocument text (`.odt`), EPUB, RTF, HTML, LaTeX,
  reStructuredText, Org, Jupyter notebook (`.ipynb`), CSV/TSV, Typst, DocBook, FictionBook,
  OPML, Textile, MediaWiki, Djot, AsciiDoc, Markdown, BibTeX/BibLaTeX (`.bib`) and RIS.
- **pandoc 3.10**, the official WebAssembly build (npm package `pandoc-wasm` 1.1.0), runs
  in a web worker on your device, so nothing is uploaded. The binary is 58 MB (a 16 MB
  gzipped download); it is fetched once, on the first document, and kept in the browser's
  Cache Storage.
- **Output**: Markdown (GitHub), the default; Markdown (pandoc); or Plain text.
- **Images**: pictures embedded in a document cannot come along as files, so this setting
  chooses what stands in for each one: its alt text (**Alt text only**, the default), a
  Markdown image link to its path inside the document (**Keep image links**), or nothing
  (**Drop**). A captioned figure becomes its caption. Changing **Output** or **Images**
  converts the documents already dropped again.
- **Spreadsheets** come out as one heading and one table per sheet, including workbooks
  written by openpyxl or pandas, which pandoc 3.10 cannot read unaided; the page adjusts
  them before converting.
- **Not read**: legacy binary Office files (`.doc`, `.xls`, `.ppt`) and OpenDocument
  slides and sheets (`.odp`, `.ods`) are not read by pandoc. The page says so and asks for
  `.docx`, `.pptx`, `.xlsx` or `.odt` instead. PDFs go to OCR (above).
- **Exports**: each document has its own **Copy** button. **Copy all** and **Download**
  take every converted document, each under its file name when there is more than one
  (`.md`, or `.txt` for plain text).
- **Address bar**: `?mode=doc` opens the page in Documents mode, and `docto` and `docimg`
  carry the two settings. `?pandocwasm=<url>` changes where `pandoc.wasm` is fetched from
  (unpkg by default).

## Comparing two models

**Compare with** (in the OCR and transcription sections) reads the same input with a
second model and marks the words the two disagree on. Two models rarely make the same
mistake, so the marked words are where to look for errors.

- **OCR**: each OCRed page is read by both models from the same render, and the card shows
  the two readings side by side with the count of differences and the share of words that
  agree. The words they disagree on are also drawn on the page preview, red for the first
  model and outlined in blue for the second (click the preview to enlarge it); a word's box
  is its share of the detected line, so it is approximate. Pages taken from a PDF's
  embedded text layer are exact and are not compared. Pages
  are read in batches of **Batch size** (10 by default): when all the pages fit in one batch,
  both models read them as soon as they are added; a larger set waits for **Run batch** and
  **Continue**. Choosing a compare model after a run keeps the first model's readings and
  reads only with the new one; choosing another replaces the comparison. The `.json` export
  carries the second reading under `compare`.
- **Transcription**: the speech is cut into chunks of up to 30 seconds with the silence
  removed. The compare model transcribes the same chunks after the primary model, and each
  chunk gets a row with both readings and a play button for that stretch of audio
  (**Only where they differ** hides the rows that match). Chosen after a transcript is done,
  the compare model runs at once on the audio already decoded.
- The comparison ignores spacing, line breaks and Markdown markup (Indra writes Markdown,
  the other OCR models plain lines). Punctuation and case count.

## Settings in the address bar

Every setting is written to the query string as it changes, so the address bar is a link
to the exact setup. Each section's model (`ocr`, `asr`) is always written, so a shared link
names it even when it is the default; other settings are written only when they differ from
their default.

| Key | Control | Values (default first) |
|---|---|---|
| `mode` | which section the page opens on | `ocr`, `transcribe`, `doc` (none: all) |
| `ocr`, `ocr2` | OCR model, Compare with | `indra`, `tiny`, `small`, `tesseract` |
| `math` | Math as LaTeX | `auto`, `on`, `off` |
| `dpi`, `batch` | PDF DPI, Batch size | 200 (72-400), 10 (1-50) |
| `cols` | Columns | `auto`, `1`, `2`, `3` |
| `order` | PDF text order | `geometric`, `pdf` |
| `layers` | PDF layers | `flat`, `separate` |
| `asr`, `asr2` | Whisper model, Compare with | `turbo`, `small`, `base`, `tiny` (packed, WebGPU) or `onnx-turbo`, `onnx-small`, `onnx-base`, `onnx-tiny`; a packed name opened without WebGPU uses the ONNX model of that size |
| `build` | Build of a packed model | `en` (English-optimized), `all` (all languages) |
| `lang` | Language | `auto`, or a code such as `de` |
| `task` | Task | `transcribe`, `translate` |
| `tab` | Transcribe or Edit existing tab | (none), `edit` |
| `docto` | Documents: Output | `gfm`, `markdown`, `plain` |
| `docimg` | Documents: Images | `alt`, `keep`, `drop` |

While only one section has been used, the page also writes `mode` (OCR, transcription or
documents). A link with `mode` opens the page in that mode: its section shows before any
file is added, the other sections stay hidden, and the drop zone asks for that kind of
file. **Use all modes**, under the drop zone, returns the page to taking every kind of
file, as does dropping a file of another kind; from then on the session writes no `mode`.
A link without `mode` shows at load every section whose keys it carries.

## Privacy

All processing is client-side. No file — image, document, or recording — is ever
sent to a server. After the first load the models are cached by the browser and the
tool works offline.

## Notes

- Must be served over **http(s)** (module workers don't run from `file://`). On the
  live site that's automatic.
- Best in a recent Chromium-based browser; WebGPU enables Indra and the larger
  Whisper model.
- AI-assisted build. Composited from two single-file in-browser apps; the speech engine
  is unmodified; the OCR engine gained Indra as a second model.
