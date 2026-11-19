import{t as e}from"../chunks/c-CA3STxaZ.js";import{useLog as t}from"./log.js";import{Collapsible as n,CollapsiblePanel as r,CollapsibleTrigger as i,createCollapsibleController as a}from"ui-sdk/collapsible.js";import*as o from"preact/compat";import{Fragment as s,jsx as c,jsxs as l}from"preact/compat/jsx-runtime";import{Field as u,FieldLabel as d}from"ui-sdk/field.js";import{Textarea as f}from"ui-sdk/textarea.js";const p=[{name:`Linen shirt`,price:`$48.00`},{name:`Canvas tote`,price:`$18.00`},{name:`Wool socks`,price:`$18.00`}];function m(){return/* @__PURE__ */ l(n,{"data-variant":`card`,children:[/* @__PURE__ */ l(i,{children:[/* @__PURE__ */ l(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`span`,{children:`Order #4189`}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:`3 items, $84.00`})]}),/* @__PURE__ */ c(e,{})]}),/* @__PURE__ */ c(r,{children:p.map(e=>/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(`span`,{children:e.name}),/* @__PURE__ */ c(`span`,{children:e.price})]},e.name))})]})}function h(){return/* @__PURE__ */ l(n,{"data-variant":`card`,children:[/* @__PURE__ */ l(i,{children:[/* @__PURE__ */ l(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`span`,{children:`Add a delivery note`}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:`Optional, for the courier`})]}),/* @__PURE__ */ c(e,{})]}),/* @__PURE__ */ c(r,{keepMounted:!0,children:/* @__PURE__ */ l(u,{children:[/* @__PURE__ */ c(d,{children:`Delivery note`}),/* @__PURE__ */ c(f,{placeholder:`Leave it with the front desk…`})]})})]})}function g(){return/* @__PURE__ */ l(n,{"data-variant":`card`,children:[/* @__PURE__ */ l(i,{children:[/* @__PURE__ */ l(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`span`,{children:`Ingredients`}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:`Morning buns, makes 12`})]}),/* @__PURE__ */ c(e,{})]}),/* @__PURE__ */ c(r,{hiddenUntilFound:!0,children:/* @__PURE__ */ c(`p`,{children:`Flour, butter, brown sugar, eggs, a pinch of cardamom and sea salt.`})})]})}const _=[`7KQ2-M9XD`,`P4TR-8HZC`,`W3NB-6JUE`,`C5YF-2LSA`];function v(){let s=t(),[u]=o.useState(a),[d,f]=o.useState(!1);return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ c(`button`,{type:`button`,onClick:()=>u.toggle(),children:`Toggle`})}),/* @__PURE__ */ l(n,{"data-variant":`card`,open:d,onOpenChange:(e,t)=>{f(e),s(`${e?`Opened`:`Closed`} (${t.reason})`)},controller:u,children:[/* @__PURE__ */ l(i,{children:[/* @__PURE__ */ l(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`span`,{children:`Recovery codes`}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:`Each code signs you in once`})]}),/* @__PURE__ */ c(e,{})]}),/* @__PURE__ */ c(r,{children:/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`ul`,{children:_.map(e=>/* @__PURE__ */ c(`li`,{children:e},e))}),/* @__PURE__ */ c(`button`,{type:`button`,onClick:()=>u.close(),children:`Done`})]})})]})]})}const y=[`Search now matches file contents, not only names.`,`Shared links remember the folder they were opened from.`,`Uploads resume after the connection drops.`];function b(){let a=t();return/* @__PURE__ */ l(n,{"data-variant":`card`,onOpenChangeComplete:e=>a(e?`Finished opening`:`Finished closing`),children:[/* @__PURE__ */ l(i,{children:[/* @__PURE__ */ l(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`span`,{children:`Release notes`}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:`Version 2.4, released October 28`})]}),/* @__PURE__ */ c(e,{})]}),/* @__PURE__ */ c(r,{children:/* @__PURE__ */ c(`ul`,{children:y.map(e=>/* @__PURE__ */ c(`li`,{children:e},e))})})]})}const x=[{label:`Out for delivery`,time:`07:40`},{label:`Arrived at the local depot`,time:`05:12`},{label:`Left the sorting center`,time:`Wed 21:03`}];function S(){return/* @__PURE__ */ l(n,{"data-variant":`card`,children:[/* @__PURE__ */ c(i,{render:e=>/* @__PURE__ */ c(`h3`,{children:/* @__PURE__ */ c(`button`,{...e})}),children:t=>/* @__PURE__ */ l(s,{children:[/* @__PURE__ */ l(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`span`,{children:`Track parcel`}),/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:t.open?`3 updates`:`Arrives Thursday`})]}),/* @__PURE__ */ c(e,{})]})}),/* @__PURE__ */ c(r,{render:/* @__PURE__ */ c(`ol`,{}),children:x.map(e=>/* @__PURE__ */ l(`li`,{"data-slot":`row`,children:[/* @__PURE__ */ c(`span`,{children:e.label}),/* @__PURE__ */ c(`span`,{children:e.time})]},e.label))})]})}const C=[{label:`عنوان الشحن`,value:`شارع الملك فهد، الرياض`},{label:`المنتجات`,value:`قميص كتان × ٢`},{label:`التوصيل`,value:`عادي، يصل في ٧ مارس`},{label:`الإجمالي`,value:`٨٤٫٠٠ $`}];function w(){return/* @__PURE__ */ c(`div`,{dir:`rtl`,children:/* @__PURE__ */ l(n,{children:[/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`p`,{children:`الطلب #4189`}),/* @__PURE__ */ c(`p`,{"data-slot":`hint`,children:`تم الطلب في ٣ مارس`})]}),/* @__PURE__ */ c(`span`,{"data-slot":`row`,children:`تم الشحن`})]}),/* @__PURE__ */ l(`div`,{children:[/* @__PURE__ */ l(i,{"data-variant":`ghost`,children:[`تفاصيل الطلب`,/* @__PURE__ */ c(e,{})]}),/* @__PURE__ */ c(r,{children:/* @__PURE__ */ c(`dl`,{children:C.map(e=>/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(`dt`,{children:e.label}),/* @__PURE__ */ c(`dd`,{children:e.value})]},e.label))})})]})]})})}var T={name:`collapsible`,title:`Collapsible`,description:`Show and hide a panel, preserve its contents, and animate its height.`,sections:[{heading:null,text:`Use a collapsible to show and hide one panel of content. For a set of panels, use an accordion.`,examples:[{id:`collapsible/basic`,caption:`Press Order #4189, or focus it and press Enter or Space, to show the items.`,Example:m,source:`"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

const items = [
  { name: "Linen shirt", price: "$48.00" },
  { name: "Canvas tote", price: "$18.00" },
  { name: "Wool socks", price: "$18.00" },
]

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Order #4189</span>
          <span data-slot="hint">3 items, $84.00</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        {items.map((item) => (
          <div data-slot="row" key={item.name}>
            <span>{item.name}</span>
            <span>{item.price}</span>
          </div>
        ))}
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
`}]},{heading:`Keep Mounted`,text:"Panels unmount when they close, so Tab skips their contents. Set `keepMounted` on the panel to keep it mounted and hidden, so a field keeps what you typed into it.",examples:[{id:`collapsible/keep-mounted`,caption:`Open Add a delivery note, type a note, then close and reopen the panel. Your note is still there.`,Example:h,source:`import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Add a delivery note</span>
          <span data-slot="hint">Optional, for the courier</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel keepMounted>
        <Field>
          <FieldLabel>Delivery note</FieldLabel>
          <Textarea placeholder="Leave it with the front desk…" />
        </Field>
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
`}]},{heading:`Find in Page`,text:'Set `hiddenUntilFound` on the panel to keep it in the DOM as `hidden="until-found"`. Browser Find and links to content inside the panel can reveal it. The panel opens without an animation so the match is visible immediately.',examples:[{id:`collapsible/find-in-page`,caption:`Leave Ingredients closed. Open your browser's Find command and search for cardamom to reveal the panel.`,Example:g,source:`import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Ingredients</span>
          <span data-slot="hint">Morning buns, makes 12</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel hiddenUntilFound>
        <p>
          Flour, butter, brown sugar, eggs, a pinch of cardamom and sea salt.
        </p>
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `open` and update it in `onOpenChange`. Call `details.cancel()` in the callback to cancel the change.",examples:[{id:`collapsible/controlled`,caption:`Open Recovery codes with Toggle or its trigger, then press Done. The console logs each change and its reason, and Done returns focus to the trigger.`,Example:v,source:`"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  createCollapsibleController,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"

const recoveryCodes = ["7KQ2-M9XD", "P4TR-8HZC", "W3NB-6JUE", "C5YF-2LSA"]

function Example() {
  const log = useLog()
  const [collapsible] = React.useState(createCollapsibleController)
  const [open, setOpen] = React.useState(false)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => collapsible.toggle()}>
          Toggle
        </button>
      </div>
      <Collapsible
        data-variant="card"
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          log(\`\${next ? "Opened" : "Closed"} (\${details.reason})\`)
        }}
        controller={collapsible}
      >
        <CollapsibleTrigger>
          <span data-slot="stack">
            <span>Recovery codes</span>
            <span data-slot="hint">Each code signs you in once</span>
          </span>
          <ChevronDownIcon />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <div data-slot="stack">
            <ul>
              {recoveryCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
            <button type="button" onClick={() => collapsible.close()}>
              Done
            </button>
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"Animate the measured `--collapsible-panel-height` between zero and the content's height. `data-starting-style` marks the opening frame, and `data-ending-style` stays on while it closes. The panel stays mounted until its closing animation finishes, and a panel open on its first paint doesn't animate.",examples:[{id:`collapsible/animation`,caption:`Open and close Release notes. The console logs when each animation finishes.`,Example:b,source:`"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const notes = [
  "Search now matches file contents, not only names.",
  "Shared links remember the folder they were opened from.",
  "Uploads resume after the connection drops.",
]

function Example() {
  const log = useLog()
  return (
    <Collapsible
      data-variant="card"
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Release notes</span>
          <span data-slot="hint">Version 2.4, released October 28</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Use `render` to choose the element for a part, or a render function to read its state. The trigger below renders inside a heading, and the panel renders as an ordered list.",examples:[{id:`collapsible/render`,caption:`Press Track parcel to open the ordered list. The summary changes from Arrives Thursday to 3 updates.`,Example:S,source:`"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

const updates = [
  { label: "Out for delivery", time: "07:40" },
  { label: "Arrived at the local depot", time: "05:12" },
  { label: "Left the sorting center", time: "Wed 21:03" },
]

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger
        render={(props) => (
          <h3>
            <button {...props} />
          </h3>
        )}
      >
        {(state) => (
          <>
            <span data-slot="stack">
              <span>Track parcel</span>
              <span data-slot="hint">
                {state.open ? "3 updates" : "Arrives Thursday"}
              </span>
            </span>
            <ChevronDownIcon />
          </>
        )}
      </CollapsibleTrigger>
      <CollapsiblePanel render={<ol />}>
        {updates.map((update) => (
          <li data-slot="row" key={update.label}>
            <span>{update.label}</span>
            <span>{update.time}</span>
          </li>
        ))}
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`collapsible/rtl`,caption:``,Example:w,source:`import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

const details = [
  { label: "عنوان الشحن", value: "شارع الملك فهد، الرياض" },
  { label: "المنتجات", value: "قميص كتان × ٢" },
  { label: "التوصيل", value: "عادي، يصل في ٧ مارس" },
  { label: "الإجمالي", value: "٨٤٫٠٠ $" },
]

export function Example() {
  return (
    <div dir="rtl">
      <Collapsible>
        <div data-slot="row">
          <div data-slot="stack">
            <p>الطلب #4189</p>
            <p data-slot="hint">تم الطلب في ٣ مارس</p>
          </div>
          <span data-slot="row">تم الشحن</span>
        </div>
        <div>
          <CollapsibleTrigger data-variant="ghost">
            تفاصيل الطلب
            <ChevronDownIcon />
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <dl>
              {details.map((detail) => (
                <div data-slot="row" key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          </CollapsiblePanel>
        </div>
      </Collapsible>
    </div>
  )
}
`}]}]};export{T as default};