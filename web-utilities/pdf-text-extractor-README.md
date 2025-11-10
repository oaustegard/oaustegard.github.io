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
