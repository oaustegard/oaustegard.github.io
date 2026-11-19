import{Fo as e,Ro as t,Ts as n,_n as r,al as i,bn as a,gn as o,ml as s,tl as c,vn as l,xn as u,yn as d}from"../chunks/c-CIXE4Nkk.js";function f(){return/* @__PURE__ */ c(o,{multiple:!0,children:[/* @__PURE__ */ c(r,{children:[/* @__PURE__ */ c(t,{"aria-hidden":`true`}),/* @__PURE__ */ c(`p`,{children:`Drag and drop files here`}),/* @__PURE__ */ c(`p`,{"data-slot":`hint`,children:`Or paste them from your clipboard.`}),/* @__PURE__ */ c(u,{children:`Browse Files`})]}),/* @__PURE__ */ c(a,{"aria-label":`Files`,children:/* @__PURE__ */ c(l,{children:({file:t})=>/* @__PURE__ */ c(s,{children:[/* @__PURE__ */ c(n,{"aria-hidden":`true`}),/* @__PURE__ */ c(`span`,{children:t.name}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:i(t.size)}),/* @__PURE__ */ c(d,{children:/* @__PURE__ */ c(e,{"aria-hidden":`true`})})]})})})]})}function p(){return/* @__PURE__ */ c(o,{multiple:!0,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(`p`,{"data-slot":`hint`,children:`Drop files anywhere.`}),/* @__PURE__ */ c(u,{children:`Upload Files`})]}),/* @__PURE__ */ c(r,{target:`document`,"data-variant":`overlay`,children:/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(t,{"aria-hidden":`true`}),/* @__PURE__ */ c(`p`,{children:`Drop to attach`})]})}),/* @__PURE__ */ c(a,{"aria-label":`Attachments`,children:/* @__PURE__ */ c(l,{children:({file:t})=>/* @__PURE__ */ c(s,{children:[/* @__PURE__ */ c(n,{"aria-hidden":`true`}),/* @__PURE__ */ c(`span`,{children:t.name}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:i(t.size)}),/* @__PURE__ */ c(d,{children:/* @__PURE__ */ c(e,{"aria-hidden":`true`})})]})})})]})}var m={name:`file-input`,title:`File Input`,description:`Choose, drop, or paste files, validate them, and submit them with a form.`,sections:[{heading:null,text:`A file input holds the files someone chooses, drops, or pastes, checks them against your rules, and submits them with a form. Uploading them to a server is up to your app.`,examples:[{id:`file-input/basic`,caption:`Browse Files or drop a few files on the zone, then remove one. Tab to the list to move between files with the arrow keys, and press Delete to remove the focused one.`,Example:f,source:`import {
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
`}]},{heading:`Page-Wide Drop`,text:'Set `target="document"` to take files dropped anywhere on the page. The zone shows `data-dragging` while a file is over the window, so it can be a full-page overlay. A drop on another zone stays with that zone.',examples:[{id:`file-input/page`,caption:`Drag a file over this page to see the overlay, then drop it. The file joins the Attachments list; a drop on the first example's zone stays there.`,Example:p,source:`import {
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
`}]}]};export{m as default};