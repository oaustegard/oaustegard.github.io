# PDF Text Extractor - LLM Optimized

A standalone browser-based PDF text extraction tool specifically designed for Large Language Model (LLM) workflows.

## Why This Tool?

Unlike the Ghostscript WASM-based extractor in `pdf-compressor.html`, this tool:
- Uses pure JavaScript (pdf.js) - faster loading, smaller footprint
- Generates output optimized specifically for LLM consumption
- Supports both full-context and RAG (Retrieval-Augmented Generation) workflows
- Ensures LLMs can always reference the source filename and page number
- **Works as a client-side URL API** - fetch and parse PDFs via URL parameters

## URL API Usage

The tool can fetch and parse PDFs directly from URLs via query parameters, making it work as a client-side API:

### Basic Usage

```
https://austegard.com/web-utilities/pdf-text-extractor?url=https://arxiv.org/pdf/2406.11706
```

This will:
1. Fetch the PDF from the specified URL
2. Extract text in Markdown format (default)
3. Display the output automatically

### Short Form

For convenience, you can omit the `url=` parameter:

```
https://austegard.com/web-utilities/pdf-text-extractor?https://arxiv.org/pdf/2406.11706
```

### Specify Output Format

Add the `format` parameter to choose the output format:

```
https://austegard.com/web-utilities/pdf-text-extractor?url=https://arxiv.org/pdf/2406.11706&format=json
```

Available formats: `markdown` (default), `json`, `text`

### Specify Reading Order (multi-column PDFs)

Add the `order` parameter to control how columns are linearized:

```
https://austegard.com/web-utilities/pdf-text-extractor?url=https://arxiv.org/pdf/2406.11706&order=2
```

Available values: `auto` (default, auto-detect columns), `1`, `2`, `3` (force that column count), `pdf` (preserve raw pdf.js order). See [Column-Aware Reading Order](#column-aware-reading-order) below.

### Parallel Page Extraction (Streaming)

Pages stream into the output as they are extracted. The `concurrency` parameter controls how many pages are being processed in parallel:

```
https://austegard.com/web-utilities/pdf-text-extractor?url=https://arxiv.org/pdf/2406.11706&concurrency=4
```

Available values: `1` (sequential), `2`, `4` (default), `8`. The final progress line shows elapsed time and pages/second so you can compare settings on the same document. See [Streaming & Parallel Extraction](#streaming--parallel-extraction) below for the trade-offs.

### Hash Format (Avoids Page Reload)

Using hash (#) instead of query string (?):

```
https://austegard.com/web-utilities/pdf-text-extractor#url=https://arxiv.org/pdf/2406.11706&format=markdown
```

### CORS Limitations

The tool fetches PDFs client-side, which means:
- ✅ Works with CORS-enabled servers (like arxiv.org)
- ❌ Fails with servers that don't allow cross-origin requests
- 💡 For blocked PDFs: download and use drag/drop interface

Common CORS-friendly PDF sources:
- arxiv.org - Research papers
- Many academic institutions
- Public document repositories

### Use Cases for URL API

1. **Bookmarklet**: Create a browser bookmark to extract text from current PDF
2. **Browser Extension**: Integrate with extensions to process PDFs
3. **Documentation Links**: Add to documentation pointing to specific papers
4. **Automated Workflows**: Use in scripts (though headless browsers needed)
5. **Quick Reference**: Share links that auto-extract and format PDFs

## Output Formats

### Markdown (Recommended)

**Best for:** Both full-context learning and RAG chunking

**Key features:**
- Clear document header with metadata (filename, author, page count, etc.)
- Each page is a `##` heading with embedded reference metadata
- Blockquote on each page contains: `Document: filename.pdf | Page: X of Y`
- Clean separators (`---`) between pages for easy chunking

**Why it works for RAG:**
When a RAG system chunks this document, each chunk naturally includes:
1. The page header with page number
2. The reference blockquote with filename and page
3. The actual content

Example chunk:
```markdown
## Page 5
> **Document:** report.pdf | **Page:** 5 of 50

[Content from page 5...]
```

When the LLM receives this chunk, it can accurately cite: *"According to report.pdf page 5..."*

### JSON

**Best for:** Programmatic processing and custom chunking strategies

**Key features:**
- Structured metadata object
- Each page includes a `reference` field in format `filename.pdf:pageNumber`
- Easy to parse and manipulate programmatically
- Ideal for building custom RAG pipelines

**Example structure:**
```json
{
  "metadata": {
    "filename": "document.pdf",
    "pageCount": 10,
    "title": "...",
    "author": "..."
  },
  "pages": [
    {
      "pageNumber": 1,
      "reference": "document.pdf:1",
      "text": "..."
    }
  ]
}
```

### Plain Text

**Best for:** Simple text processing and maximum compatibility

**Key features:**
- ASCII-art style separators
- Clear page markers: `[Page X - filename.pdf]`
- Works with any text processor
- No special formatting required

## LLM Optimization Strategy

### 1. Self-Contained Pages
Each page includes its own metadata, making it independently referenceable. This is crucial for RAG systems where the LLM might only see a fragment of the document.

### 2. Consistent Reference Format
All formats include the filename and page number in a consistent, parseable way:
- Markdown: `**Document:** filename.pdf | **Page:** 5 of 50`
- JSON: `"reference": "filename.pdf:5"`
- Plain Text: `[Page 5 - filename.pdf]`

### 3. Chunk-Friendly Separators
The Markdown format uses `---` separators which are:
- Recognized by most Markdown chunkers as natural boundaries
- Visual indicators for LLMs processing the full context
- Easy to search/split programmatically

### 4. Metadata Preservation
Document-level metadata (title, author, subject) is included at the top, providing context that helps LLMs understand:
- What kind of document this is
- Who created it
- What it's about

### 5. Clean Text Reconstruction
The pdf.js extraction logic:
- Preserves line breaks based on vertical position
- Adds appropriate spacing between text items
- Handles hyphenation gracefully
- Produces readable paragraphs

## Column-Aware Reading Order

pdf.js emits text runs in content-stream order. For a **two-column paper** (most arXiv PDFs) that order interleaves the columns and merges left- and right-column text onto the same visual line, producing scrambled output. This tool rebuilds geometric reading order by default:

1. Each text run is placed by its on-page bounding box (via pdf.js's viewport transform).
2. Runs are grouped into lines by vertical proximity, sorted top-to-bottom, left-to-right.
3. Column gutters are auto-detected with a 2-D occupancy projection; full-width elements (titles, section headers) act as band breaks.
4. Each horizontal band emits its columns left-to-right, so a paper reads *title → left column → right column → next header → …* instead of zig-zagging across the gutter.

The **Reading Order** control (and the `order` URL parameter) selects the strategy:

- **Column-aware (auto-detect)** — default; handles most single- and multi-column layouts.
- **Force single / two / three columns** — when auto-detect guesses wrong (e.g. a mixed title-page + two-column abstract).
- **Preserve raw PDF order** — the original per-run reconstruction, as an escape hatch.

This is the same reading-order engine used by [`anything-to-text.html`](./anything-to-text.html).

## Streaming & Parallel Extraction

Extraction is streaming: as each page's text is decoded, it's appended (in page order) to the output pane. You see the first page appear immediately instead of waiting for the whole document, and the elapsed time and pages/second are reported on completion.

The **Parallel Pages** control (and the `concurrency` URL parameter) sets how many pages are being processed at once:

- **1** — sequential; lowest memory, useful as a baseline for timing.
- **2 / 4 / 8** — a bounded worker pool; multiple pages are pipelined through pdf.js so page-object loading, text-content decoding, and the geometric reading-order pass overlap.

### What to expect from higher concurrency

pdf.js runs its parser in a single web-worker thread, so raw CPU throughput does not scale linearly with concurrency. What parallelism actually buys you is **pipelining**: while one page is waiting on the worker, the main thread can run the geometric reading-order pass on another; while a third is waiting on `getTextContent`, a fourth's `getPage` request can queue up.

Measured end-to-end on arXiv PDFs (headless Chromium, cold pdf.js worker; extraction-only throughput in parens):

| PDF          | conc=1        | conc=2        | conc=4        | conc=8        |
|--------------|---------------|---------------|---------------|---------------|
| 8 pages      | 1.31s (34 p/s)| 1.11s (37 p/s)| 1.10s (47 p/s)| 1.08s (49 p/s)|
| 15 pages     | 1.45s (28 p/s)| 1.46s (31 p/s)| 1.28s (40 p/s)| 1.29s (41 p/s)|
| 75 pages     | 4.31s (24 p/s)| 3.49s (30 p/s)| 2.39s (57 p/s)| **1.87s (91 p/s)** |

Takeaways:

- **Small PDFs plateau early.** Once total extraction is under ~1 s, extra concurrency does nothing — there's nothing to pipeline.
- **Larger PDFs benefit substantially.** On the 75-page paper, going 1 → 8 dropped wall-clock from 4.3s to 1.9s (**2.3× overall**, 3.8× on extraction-only throughput).
- **Default is 4** — a good compromise between throughput and memory pressure. If you routinely process papers of 50+ pages, pin `&concurrency=8` in the URL and enjoy the extra speedup.

Regardless of concurrency, page ordering in the output is preserved: pages complete out of order internally, but a flush cursor emits only the contiguous head of completed pages, so what you read is always in page order.

## File Input & Type Validation

The file picker accepts **any** file (no extension filter), and the file type is validated **by content after selection**, not by name. This means:

- A PDF that a phone saved **without a `.pdf` extension** — e.g. an arXiv download named `2606.30840` — is accepted and processed normally.
- Anything without a `%PDF` marker in its first kilobyte is rejected up front with a clear message, instead of a cryptic pdf.js parser error.

## Usage Scenarios

### Full-Context Learning
When you have a small-to-medium PDF that fits in the LLM's context window:
1. Extract in Markdown format
2. Include the entire output in your prompt
3. The LLM can reference specific pages: *"Based on page 7..."*

### RAG Chunking
When working with large documents or building a RAG system:
1. Extract in Markdown or JSON format
2. Use your chunking strategy (semantic, fixed-size, etc.)
3. Each chunk maintains filename + page number metadata
4. The LLM can cite sources accurately even from fragments

### Programmatic Processing
When building custom pipelines:
1. Extract in JSON format
2. Parse the structured data
3. Implement custom chunking/indexing
4. Maintain the `reference` field in your vector database

## Technical Details

### No WASM Required
Unlike compression (which benefits from native-speed Ghostscript), text extraction is primarily I/O and parsing. Using pdf.js:
- Faster initial load (no 8MB+ WASM binary)
- Pure JavaScript - works everywhere
- Adequate performance for text extraction
- Well-maintained by Mozilla

### Browser-Based Processing
All extraction happens in your browser:
- No data sent to servers
- Works offline after initial page load
- Privacy-preserving
- No API costs

## When to Use Which Tool

**Use this tool (pdf-text-extractor.html)** when:
- You only need text extraction
- You're building LLM workflows
- You want optimized RAG-ready output
- You need structured metadata

**Use pdf-compressor.html's Extract Text** when:
- You're already using the compressor
- You're doing both compression and extraction
- You don't need special formatting
- Ghostscript is already loaded

## Example Workflow: Building a RAG System

1. **Extract**: Use this tool to extract in Markdown format
2. **Chunk**: Split on `---` separators or use semantic chunking
3. **Embed**: Generate embeddings for each chunk (keep the page header)
4. **Index**: Store in vector DB with metadata
5. **Retrieve**: When querying, return chunks with headers intact
6. **Generate**: LLM receives context like:
   ```markdown
   ## Page 5
   > **Document:** report.pdf | **Page:** 5 of 50

   [Relevant content...]
   ```
7. **Cite**: LLM responds: *"According to report.pdf page 5, the revenue increased..."*

## Browser Compatibility

Tested with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires:
- ES6 modules support
- Clipboard API (for copy function)
- FileReader API
