import{$c as e,Mo as t,Qc as n,jn as r,n as i,t as a,tl as o}from"../chunks/c-CIXE4Nkk.js";const s=n({values:[`list`,`grid`],defaultValue:`list`,attribute:`data-view`,storage:e(`ui-sdk-preferences-view`)}),c=[{name:`Q3 roadmap.pdf`,detail:`2.4 MB`},{name:`Launch checklist.md`,detail:`12 KB`},{name:`Offsite photos`,detail:`24 items`},{name:`Brand assets.zip`,detail:`18 MB`}];function l(){let e=t(),{value:n}=i(s),l=(t,n)=>{s.set(t,{reason:`press`,event:n.nativeEvent}),e(`Saved the ${t} view`)};return/* @__PURE__ */ o(a,{preferences:[s],children:/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`div`,{"data-slot":`controls`,role:`group`,"aria-label":`View`,children:[/* @__PURE__ */ o(r,{"aria-pressed":n===`list`,onClick:e=>l(`list`,e),children:`List`}),/* @__PURE__ */ o(r,{"aria-pressed":n===`grid`,onClick:e=>l(`grid`,e),children:`Grid`})]}),/* @__PURE__ */ o(`ul`,{"data-slot":`files`,"aria-label":`Files`,children:c.map(e=>/* @__PURE__ */ o(`li`,{children:[/* @__PURE__ */ o(`span`,{children:e.name}),/* @__PURE__ */ o(`span`,{"data-slot":`hint`,children:e.detail})]},e.name))})]})})}var u={name:`preferences`,title:`Preferences`,description:`Apply user preferences to data attributes so your styles can follow them.`,sections:[{heading:null,text:"`Preferences` puts your preferences on `data-*` attributes and keeps them up to date. Use it around a part of your app, or apply a preference to the whole page.",examples:[{id:`preferences/basic`,caption:`Choose Grid, then reload the page. The files come back in the view you chose, and the console logs each change.`,Example:l,source:`"use client"

import { createLocalStorage, createPreference } from "@ui-sdk/core"
import { Button } from "@ui-sdk/react/button"
import { Preferences, usePreference } from "@ui-sdk/react/preferences"
import { useLog } from "../../../shared/react/log"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  storage: createLocalStorage("ui-sdk-preferences-view"),
})

const files = [
  { name: "Q3 roadmap.pdf", detail: "2.4 MB" },
  { name: "Launch checklist.md", detail: "12 KB" },
  { name: "Offsite photos", detail: "24 items" },
  { name: "Brand assets.zip", detail: "18 MB" },
]

function Example() {
  const log = useLog()
  const { value } = usePreference(view)

  const choose = (next: "list" | "grid", event: React.MouseEvent) => {
    view.set(next, { reason: "press", event: event.nativeEvent })
    log(\`Saved the \${next} view\`)
  }

  return (
    <Preferences preferences={[view]}>
      <div data-slot="stack">
        <div data-slot="controls" role="group" aria-label="View">
          <Button
            aria-pressed={value === "list"}
            onClick={(event) => choose("list", event)}
          >
            List
          </Button>
          <Button
            aria-pressed={value === "grid"}
            onClick={(event) => choose("grid", event)}
          >
            Grid
          </Button>
        </div>
        <ul data-slot="files" aria-label="Files">
          {files.map((file) => (
            <li key={file.name}>
              <span>{file.name}</span>
              <span data-slot="hint">{file.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </Preferences>
  )
}

export { Example }
`}]}]};export{u as default};