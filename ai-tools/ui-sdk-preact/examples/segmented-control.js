import{Co as e,Gn as t,Hn as n,Mo as r,Oo as i,To as a,Un as o,Wn as s,fl as c,tl as l}from"../chunks/c-CIXE4Nkk.js";function u(){return/* @__PURE__ */ l(e,{children:[/* @__PURE__ */ l(i,{children:`View`}),/* @__PURE__ */ l(n,{defaultValue:`list`,children:[/* @__PURE__ */ l(o,{}),/* @__PURE__ */ l(s,{value:`list`,children:`List`}),/* @__PURE__ */ l(s,{value:`grid`,children:`Grid`}),/* @__PURE__ */ l(s,{value:`board`,children:`Board`})]})]})}function d(){return/* @__PURE__ */ l(e,{children:[/* @__PURE__ */ l(i,{children:`Vertical alignment`}),/* @__PURE__ */ l(n,{orientation:`vertical`,defaultValue:`middle`,children:[/* @__PURE__ */ l(o,{}),/* @__PURE__ */ l(s,{value:`top`,children:`Top`}),/* @__PURE__ */ l(s,{value:`middle`,children:`Middle`}),/* @__PURE__ */ l(s,{value:`bottom`,children:`Bottom`})]})]})}function f(){return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ l(n,{"aria-label":`Theme`,defaultValue:`system`,disabled:!0,children:[/* @__PURE__ */ l(o,{}),/* @__PURE__ */ l(s,{value:`light`,children:`Light`}),/* @__PURE__ */ l(s,{value:`dark`,children:`Dark`}),/* @__PURE__ */ l(s,{value:`system`,children:`System`})]}),/* @__PURE__ */ l(n,{"aria-label":`Billing period`,defaultValue:`monthly`,children:[/* @__PURE__ */ l(o,{}),/* @__PURE__ */ l(s,{value:`monthly`,children:`Monthly`}),/* @__PURE__ */ l(s,{value:`yearly`,children:`Yearly`}),/* @__PURE__ */ l(s,{value:`lifetime`,disabled:!0,children:`Lifetime`})]})]})}function p(){let e=r(),[i]=c(()=>t()),[a,u]=c(`week`);return/* @__PURE__ */ l(`div`,{children:[/* @__PURE__ */ l(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ l(`button`,{type:`button`,onClick:()=>i.setValue(`month`),children:`Show Month`})}),/* @__PURE__ */ l(n,{"aria-label":`Range`,value:a,onValueChange:(t,n)=>{u(t),e(`value: ${t} (${n.reason})`)},controller:i,children:[/* @__PURE__ */ l(o,{}),/* @__PURE__ */ l(s,{value:`day`,children:`Day`}),/* @__PURE__ */ l(s,{value:`week`,children:`Week`}),/* @__PURE__ */ l(s,{value:`month`,children:`Month`})]})]})}function m(){let t=r();return/* @__PURE__ */ l(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let n=new FormData(e.currentTarget);t(`Saved theme=${n.get(`theme`)}, density=${n.get(`density`)}`)},children:[/* @__PURE__ */ l(e,{children:[/* @__PURE__ */ l(i,{children:`Theme`}),/* @__PURE__ */ l(n,{name:`theme`,required:!0,defaultValue:`system`,children:[/* @__PURE__ */ l(o,{}),/* @__PURE__ */ l(s,{value:`light`,children:`Light`}),/* @__PURE__ */ l(s,{value:`dark`,children:`Dark`}),/* @__PURE__ */ l(s,{value:`system`,children:`System`})]}),/* @__PURE__ */ l(a,{children:`System follows your device's setting.`})]}),/* @__PURE__ */ l(e,{children:[/* @__PURE__ */ l(i,{children:`Density`}),/* @__PURE__ */ l(n,{name:`density`,defaultValue:`comfortable`,children:[/* @__PURE__ */ l(o,{}),/* @__PURE__ */ l(s,{value:`compact`,children:`Compact`}),/* @__PURE__ */ l(s,{value:`comfortable`,children:`Comfortable`})]})]}),/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`}),/* @__PURE__ */ l(`button`,{type:`reset`,children:`Reset`})]})]})}var h={name:`segmented-control`,title:`Segmented Control`,description:`Pick one of a few options from a row of buttons, with an indicator that slides to the choice.`,sections:[{heading:null,text:`Use a segmented control to switch between a few views or settings, like List and Grid. It works like a radio group, with one value and a single tab stop, and its indicator slides to the checked item.`,examples:[{id:`segmented-control/basic`,caption:`Choose Grid, then use the arrow keys to move between views. The label above names the control, as in any field.`,Example:u,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

function Example() {
  return (
    <Field>
      <FieldLabel>View</FieldLabel>
      <SegmentedControl defaultValue="list">
        <SegmentedControlIndicator />
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
      </SegmentedControl>
    </Field>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'Set `orientation="vertical"` to stack the items. Arrow keys on both axes still move between them, as in any radio group, and `data-orientation` on every part lets one stylesheet lay out both directions.',examples:[{id:`segmented-control/vertical`,caption:`Choose Bottom, then press the Up arrow. The indicator follows down the column.`,Example:d,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

function Example() {
  return (
    <Field>
      <FieldLabel>Vertical alignment</FieldLabel>
      <SegmentedControl orientation="vertical" defaultValue="middle">
        <SegmentedControlIndicator />
        <SegmentedControlItem value="top">Top</SegmentedControlItem>
        <SegmentedControlItem value="middle">Middle</SegmentedControlItem>
        <SegmentedControlItem value="bottom">Bottom</SegmentedControlItem>
      </SegmentedControl>
    </Field>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` on the control or on one item. Disabled items can't be focused or checked, and arrow keys skip them. A disabled control submits nothing.",examples:[{id:`segmented-control/disabled`,caption:`The Theme control is disabled. In Billing period, Lifetime is disabled, so the arrow keys move between Monthly and Yearly.`,Example:f,source:`"use client"

import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

function Example() {
  return (
    <div data-slot="stack">
      <SegmentedControl aria-label="Theme" defaultValue="system" disabled>
        <SegmentedControlIndicator />
        <SegmentedControlItem value="light">Light</SegmentedControlItem>
        <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
        <SegmentedControlItem value="system">System</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Billing period" defaultValue="monthly">
        <SegmentedControlIndicator />
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
        <SegmentedControlItem value="lifetime" disabled>
          Lifetime
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the callback to keep the current value. A controller from `createSegmentedControlController()` checks an item from anywhere, like the Show Month button below. Create one controller per mounted control.",examples:[{id:`segmented-control/controlled`,caption:`Choose Day, then press Show Month. The console logs each change and its reason.`,Example:p,source:`"use client"

import {
  createSegmentedControlController,
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [range] = React.useState(() => createSegmentedControlController())
  const [value, setValue] = React.useState<string | null>("week")

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => range.setValue("month")}>
          Show Month
        </button>
      </div>
      <SegmentedControl
        aria-label="Range"
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(\`value: \${next} (\${details.reason})\`)
        }}
        controller={range}
      >
        <SegmentedControlIndicator />
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}

export { Example }
`}]},{heading:`Form`,text:"Each item renders a hidden native radio, so the control takes part in forms. Set `name` to submit the checked value; nothing submits without a name or a checked item. `required` blocks submission until there's a choice, `form` joins a form by its id from elsewhere on the page, and a reset returns to `defaultValue`.",examples:[{id:`segmented-control/form`,caption:`Choose Dark and Compact, then press Save. The console logs both values, and Reset returns each control to its default.`,Example:m,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        log(\`Saved theme=\${data.get("theme")}, density=\${data.get("density")}\`)
      }}
    >
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <SegmentedControl name="theme" required defaultValue="system">
          <SegmentedControlIndicator />
          <SegmentedControlItem value="light">Light</SegmentedControlItem>
          <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
          <SegmentedControlItem value="system">System</SegmentedControlItem>
        </SegmentedControl>
        <FieldDescription>
          System follows your device's setting.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Density</FieldLabel>
        <SegmentedControl name="density" defaultValue="comfortable">
          <SegmentedControlIndicator />
          <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
          <SegmentedControlItem value="comfortable">
            Comfortable
          </SegmentedControlItem>
        </SegmentedControl>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Save
        </button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
`}]}]};export{h as default};