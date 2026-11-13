# PDF Fill & Sign

Fill in a PDF form and sign it without uploading it anywhere.

**[Open the tool](https://austegard.com/web-utilities/pdf-fill-sign.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/pdf-fill-sign.html)**

## What it does

- **Form fields**: text boxes, check boxes, radio buttons and drop-downs in the PDF become editable in place. On download the values are written into the form itself, so the file stays a fillable form. Tick **Flatten** to bake the values into the page instead.
- **Stamps anywhere**: for scanned documents and forms without fields, pick a tool and click the page:
  - **Text** (T): type where you click; multiple lines work.
  - **Date** (D): today's date.
  - **Check** (X): a check mark, drawn as vector strokes.
  - **Signature** (S) and **Initials** (I): draw with mouse, finger or pen, type your name in a script face, or upload a photo of your signature (the paper background is made transparent). Black or blue ink.
- **Saved signatures**: tick *Remember* and the signature or initials are kept in this browser's local storage for next time. Click × on a saved one to forget it.
- Drag to move a stamp, drag the corner handle to resize, arrow keys nudge (Shift for 10 pt), Delete or × removes, Esc cancels a tool.
- Handles rotated pages and pages with an offset crop box.

## Loading a PDF

- **Open** or drag a file onto the page.
- `?url=https://…/file.pdf` loads a PDF from a server that allows cross-origin requests.
- Another page (a bookmarklet or extension) can open this tool and send the bytes with
  `postMessage({ type: 'pdf-fill-sign', name: 'file.pdf', bytes: arrayBuffer }, '*')`; the tool posts `{ type: 'pdf-fill-sign:ready' }` to its opener when it is listening.

## Limits

- Text stamps use Helvetica, which covers Western European characters (å, æ, ø, é…). Other scripts are replaced with `?`.
- Field values with characters outside that range may lose their appearance in some viewers.
- This is a visual signature, not a cryptographic digital signature.
- Encrypted PDFs that forbid editing may not save.

## Technical details

- [PDF.js](https://mozilla.github.io/pdf.js/) 3.11 renders pages and reports form-widget positions.
- [pdf-lib](https://pdf-lib.js.org/) 1.17 writes field values and draws stamps into the original file.
- Single HTML file, no build step, no server.

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
