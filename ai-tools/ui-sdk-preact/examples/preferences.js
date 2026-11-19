import{useLog as e}from"./log.js";import{jsx as t,jsxs as n}from"preact/compat/jsx-runtime";import{Button as r}from"ui-sdk/button.js";import{createLocalStorage as i,createPreference as a}from"ui-sdk/core/index.js";import{Preferences as o,usePreference as s}from"ui-sdk/preferences.js";const c=a({values:[`list`,`grid`],defaultValue:`list`,attribute:`data-view`,storage:i(`ui-sdk-preferences-view`)}),l=[{name:`Q3 roadmap.pdf`,detail:`2.4 MB`},{name:`Launch checklist.md`,detail:`12 KB`},{name:`Offsite photos`,detail:`24 items`},{name:`Brand assets.zip`,detail:`18 MB`}];function u(){let i=e(),{value:a}=s(c),u=(e,t)=>{c.set(e,{reason:`press`,event:t.nativeEvent}),i(`Saved the ${e} view`)};return/* @__PURE__ */ t(o,{preferences:[c],children:/* @__PURE__ */ n(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ n(`div`,{"data-slot":`controls`,role:`group`,"aria-label":`View`,children:[/* @__PURE__ */ t(r,{"aria-pressed":a===`list`,onClick:e=>u(`list`,e),children:`List`}),/* @__PURE__ */ t(r,{"aria-pressed":a===`grid`,onClick:e=>u(`grid`,e),children:`Grid`})]}),/* @__PURE__ */ t(`ul`,{"data-slot":`files`,"aria-label":`Files`,children:l.map(e=>/* @__PURE__ */ n(`li`,{children:[/* @__PURE__ */ t(`span`,{children:e.name}),/* @__PURE__ */ t(`span`,{"data-slot":`hint`,children:e.detail})]},e.name))})]})})}var d={name:`preferences`,title:`Preferences`,description:`Apply user preferences to data attributes so your styles can follow them.`,sections:[{heading:null,text:"`Preferences` puts your preferences on `data-*` attributes and keeps them up to date. Use it around a part of your app, or apply a preference to the whole page.",examples:[{id:`preferences/basic`,caption:`Choose Grid, then reload the page. The files come back in the view you chose, and the console logs each change.`,Example:u,source:`"use client"

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
`}]}]};export{d as default};