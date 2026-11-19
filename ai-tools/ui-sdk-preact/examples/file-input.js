import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-BnWal148.js";import{t as n}from"../chunks/c-NPxkywtp.js";import{Fragment as r,jsx as i,jsxs as a}from"preact/compat/jsx-runtime";import{FileInput as o,FileInputDropzone as s,FileInputItem as c,FileInputItemRemove as l,FileInputList as u,FileInputTrigger as d,formatFileSize as f}from"ui-sdk/file-input.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const p={name:`upload`,size:24,node:[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]};p.node;const m=e(p);function h(){return/* @__PURE__ */ a(o,{multiple:!0,children:[/* @__PURE__ */ a(s,{children:[/* @__PURE__ */ i(m,{"aria-hidden":`true`}),/* @__PURE__ */ i(`p`,{children:`Drag and drop files here`}),/* @__PURE__ */ i(`p`,{"data-slot":`hint`,children:`Or paste them from your clipboard.`}),/* @__PURE__ */ i(d,{children:`Browse Files`})]}),/* @__PURE__ */ i(u,{"aria-label":`Files`,children:/* @__PURE__ */ i(c,{children:({file:e})=>/* @__PURE__ */ a(r,{children:[/* @__PURE__ */ i(t,{"aria-hidden":`true`}),/* @__PURE__ */ i(`span`,{children:e.name}),/* @__PURE__ */ i(`span`,{"data-slot":`hint`,children:f(e.size)}),/* @__PURE__ */ i(l,{children:/* @__PURE__ */ i(n,{"aria-hidden":`true`})})]})})})]})}function g(){return/* @__PURE__ */ a(o,{multiple:!0,children:[/* @__PURE__ */ a(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ i(`p`,{"data-slot":`hint`,children:`Drop files anywhere.`}),/* @__PURE__ */ i(d,{children:`Upload Files`})]}),/* @__PURE__ */ i(s,{target:`document`,"data-variant":`overlay`,children:/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(m,{"aria-hidden":`true`}),/* @__PURE__ */ i(`p`,{children:`Drop to attach`})]})}),/* @__PURE__ */ i(u,{"aria-label":`Attachments`,children:/* @__PURE__ */ i(c,{children:({file:e})=>/* @__PURE__ */ a(r,{children:[/* @__PURE__ */ i(t,{"aria-hidden":`true`}),/* @__PURE__ */ i(`span`,{children:e.name}),/* @__PURE__ */ i(`span`,{"data-slot":`hint`,children:f(e.size)}),/* @__PURE__ */ i(l,{children:/* @__PURE__ */ i(n,{"aria-hidden":`true`})})]})})})]})}var _={name:`file-input`,title:`File Input`,description:`Choose, drop, or paste files, validate them, and submit them with a form.`,sections:[{heading:null,text:`A file input holds the files someone chooses, drops, or pastes, checks them against your rules, and submits them with a form. Uploading them to a server is up to your app.`,examples:[{id:`file-input/basic`,caption:`Browse Files or drop a few files on the zone, then remove one. Tab to the list to move between files with the arrow keys, and press Delete to remove the focused one.`,Example:h,source:`import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@ui-sdk/react/file-input"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

function Example() {
  return (
    <FileInput multiple>
      <FileInputDropzone>
        <UploadIcon aria-hidden="true" />
        <p>Drag and drop files here</p>
        <p data-slot="hint">Or paste them from your clipboard.</p>
        <FileInputTrigger>Browse Files</FileInputTrigger>
      </FileInputDropzone>
      <FileInputList aria-label="Files">
        <FileInputItem>
          {({ file }) => (
            <>
              <FileIcon aria-hidden="true" />
              <span>{file.name}</span>
              <span data-slot="hint">{formatFileSize(file.size)}</span>
              <FileInputItemRemove>
                <XIcon aria-hidden="true" />
              </FileInputItemRemove>
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  )
}

export { Example }
`}]},{heading:`Page-Wide Drop`,text:'Set `target="document"` to take files dropped anywhere on the page. The zone shows `data-dragging` while a file is over the window, so it can be a full-page overlay. A drop on another zone stays with that zone.',examples:[{id:`file-input/page`,caption:`Drag a file over this page to see the overlay, then drop it. The file joins the Attachments list; a drop on the first example's zone stays there.`,Example:g,source:`import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@ui-sdk/react/file-input"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

function Example() {
  return (
    <FileInput multiple>
      <div data-slot="row">
        <p data-slot="hint">Drop files anywhere.</p>
        <FileInputTrigger>Upload Files</FileInputTrigger>
      </div>
      <FileInputDropzone target="document" data-variant="overlay">
        <div data-slot="stack">
          <UploadIcon aria-hidden="true" />
          <p>Drop to attach</p>
        </div>
      </FileInputDropzone>
      <FileInputList aria-label="Attachments">
        <FileInputItem>
          {({ file }) => (
            <>
              <FileIcon aria-hidden="true" />
              <span>{file.name}</span>
              <span data-slot="hint">{formatFileSize(file.size)}</span>
              <FileInputItemRemove>
                <XIcon aria-hidden="true" />
              </FileInputItemRemove>
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  )
}

export { Example }
`}]}]};export{_ as default};