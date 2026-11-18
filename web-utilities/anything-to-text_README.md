# Anything to Text

Drop in **anything** — an image, a PDF, or an audio/video recording — and get
text back. Everything runs **in your browser**: files are never uploaded, only
the models download (once) on first use.

It is a composite of two pipelines behind a single drop zone that routes each
file by type:

| Input | Engine | Output |
|---|---|---|
| Images (`png`, `jpg`, …) | OCR: **Indra OCR** (needs WebGPU) by default, PaddleOCR **PP-OCRv6** otherwise | Markdown (Indra) or text lines in reading order, with confidence |
| PDFs | pdf.js text layer when present, OCR fallback otherwise | per-page text, exact where the PDF is born-digital |
| Audio / video (`mp4`, `mov`, `mkv`, `webm`, `mp3`, `wav`, `m4a`, `flac`, `ogg`, …) | Speech-to-text — **Whisper** via Transformers.js | timestamped transcript, editable, with per-segment playback |

Drop several files at once and the relevant sections light up independently —
e.g. a folder of scans plus one screen recording.

Routing validates by **file content, not name or the picker's type filter**. A
file whose declared type/extension doesn't identify it — e.g. an arXiv PDF a phone
saved as `2401.12345` with no `.pdf` suffix and a generic MIME type — is sniffed by
its magic bytes after selection and, if recognized (PDF or a supported image
format), re-tagged and routed to OCR. The file picker imposes no `accept` filter,
so these extensionless files are selectable in the first place.

## Images & PDFs (OCR)

- **Indra** ([datalab-to/indra-ocr](https://github.com/datalab-to/indra-ocr), 12M
  parameters) is the default. Without WebGPU it falls back to PP-OCRv6 medium.
  It straightens and turns the page, reads the lines, orders them with its own reading-order model and writes the
  page as Markdown: headings, paragraphs joined across line breaks, lists and tables.
  The WebGPU port lives in
  [experiments/indra-browser](https://austegard.com/experiments/indra-browser/web/);
  this page imports it from there. About 4 MB loads on first use. Extra models for
  other writing systems (Chinese/Japanese/Korean, right-to-left scripts, other
  alphabets) and the word-correction tables load only when a page needs them. The weights are under Datalab's
  OpenRAIL-M license.
- **PP-OCRv6** in three tiers (tiny ~3M / small ~7M / medium ~35M), and the fallback
  when WebGPU is missing. Weights stream from Hugging Face on first run; the
  50-language recognition dictionary is fetched at init.
- **PDFs are hybrid**: each page first tries pdf.js's embedded text layer (exact,
  instant, no model). Only text-less pages (scans) fall through to OCR, so a
  born-digital PDF never touches the weights. Any page can be forced through OCR
  with **Re-run as OCR**.
- Large jobs process in batches — press **Run batch**, then **Continue**.
- **Exports**: copy all text, `.txt`, `.md` (Markdown when Indra read the page, plain
  text lines otherwise), `.json` (with normalized bounding boxes and
  per-segment confidence), and `.html` (an absolutely-positioned text layer that
  preserves the original page geometry — columns and tables survive). JSON and HTML
  can be previewed in-page before download.

## Audio & Video (transcription)

- **Whisper** models: tiny / base / small / large-v3-turbo. Runs on **WebGPU** when
  available, WASM (CPU) otherwise — the badge shows which.
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
