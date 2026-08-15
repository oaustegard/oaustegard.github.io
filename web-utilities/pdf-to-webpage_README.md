# PDF to Webpage

Converts a PDF — uploaded, or fetched from a URL — into a webpage readable on
a phone. Text and formatting become real HTML (selectable, reflowing,
dark-mode aware); embedded pictures become inline images; formulas and
figures that don't survive linearization to text are rasterized to images in
place. All processing happens in-browser via
[pdf.js](https://mozilla.github.io/pdf.js/); the PDF never leaves your device.

## Usage

- **Upload**: drop a PDF on the page or tap to choose a file. Any file type is
  accepted — arXiv and many download flows save PDFs with numeric or missing
  extensions — and content is validated by `%PDF` magic bytes instead.
- **Share into it (Android)**: install the page to the home screen (Chrome →
  "Add to Home screen"); the installed app registers as a Web Share Target,
  so "Share → PDF2Page" works from Files, Chrome, Drive, etc. A small service
  worker (`pdf-to-webpage-sw.js`, scoped to this tool only) receives the
  share-sheet POST. iOS does not support share targets for web apps — the
  home-screen install still works there, but arrives without "Open in";
  use the clipboard Shortcut below (files) or the `?url=` link.
- **iOS "Open in" via Shortcuts**: a web page can't be handed a Files path,
  so the content moves through the clipboard. One-time setup in the
  Shortcuts app:
  1. New shortcut; in its settings enable **Show in Share Sheet**, input
     types **PDFs** and **Files**.
  2. Actions: **Base64 Encode** (Shortcut Input) → **Copy to Clipboard** →
     **Open URLs**
     `https://austegard.com/web-utilities/pdf-to-webpage.html?clipboard=1`.
  3. Use: share a PDF from Files/Safari → the shortcut → the page opens with
     a **Tap to paste the shared PDF** button → tap, allow paste, done.
- **Offline**: the service worker precaches the page, manifest, and the CDN
  pdf.js pair, so after one visit the home-screen app loads and converts
  with no network. Only `?url=` fetching needs connectivity.
- **URL**: paste a PDF URL, or link directly:
  `https://austegard.com/web-utilities/pdf-to-webpage?url=https://arxiv.org/pdf/1706.03762`
  (URL fetching requires the host to send CORS headers; uploads always work.)
- **Any-host URLs**: the same app runs on Cloudflare with a fetch proxy at
  <https://pdf2page.austegard.workers.dev> — no CORS constraint, and it
  accepts path-style URLs:
  `pdf2page.austegard.workers.dev/https://arxiv.org/pdf/1706.03762`.
- **Download**: "Download as standalone HTML" saves a single self-contained
  file with CSS inlined and images as data URLs.

## How it converts

1. **Text** — pdf.js text items are clustered into lines by baseline, lines
   into paragraphs by leading and indent gaps. Font-size tiers become heading
   levels; font names drive `<strong>`/`<em>`/`<code>`; baseline offsets
   within a line become `<sup>`/`<sub>`. Soft hyphenation is repaired while
   compound hyphens ("English-to-German") survive. Two-column layouts are
   detected via a gutter scan and linearized; running headers, footers, and
   page numbers are stripped by cross-page repetition.
2. **Images** — the page's operator list is walked with CTM tracking, so each
   raster image gets its position and display size, re-encoded as an inline
   PNG at the right point in the reading order.
3. **Formulas** — lines dominated by math fonts (CMMI/CMSY/AMS/Symbol/…),
   unmappable private-use glyphs, or 2D sub/superscript layouts are treated
   as display equations and cropped from a cached page render, keeping the
   extracted text as `alt`.
4. **Vector figures** — a `Figure N` caption with a dead band above it marks
   a diagram the image scan couldn't extract; the band is rasterized and
   inserted in place (skipped when raster images already cover it).
5. Pages with no extractable text (scans) fall back to a full-page image.

## Limitations

- Tables linearize to text lines — readable, not tabular.
- Text inside uncaptioned vector figures can leak into the text flow.
- Inline math in prose stays as Unicode with `<sup>`/`<sub>` — occasionally
  lossy for radicals and stacked fractions.
- Rotated text (watermarks) and stencil image masks are dropped.

## Source

Built file — do not hand-edit. Regenerate with
`python3 pdf2page/build-site-file.py <site-root>` from the workspace repo.
Single-file build of
[oaustegard/claude-workspace/pdf2page](https://github.com/oaustegard/claude-workspace/tree/main/pdf2page),
which also has a Cloudflare Worker variant (CORS proxy for arbitrary PDF
URLs) and the Playwright test suite.
