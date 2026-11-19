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
  It returns plain text lines and runs without WebGPU, so a browser without WebGPU
  switches to PP-OCRv6 small automatically. Its weights and 50-language character
  list download from Hugging Face on first use.
- **PDFs are hybrid**: each page first tries pdf.js's embedded text layer (exact,
  instant, no model). Only text-less pages (scans) fall through to OCR, so a
  born-digital PDF never loads an OCR model. Any page can be forced through OCR
  with **Re-run as OCR**.
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
