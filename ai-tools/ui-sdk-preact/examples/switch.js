import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-D5QH3sUe.js";import{t as n}from"../chunks/c-CJJm1AY-.js";import{useLog as r}from"./log.js";import*as i from"preact/compat";import{jsx as a,jsxs as o}from"preact/compat/jsx-runtime";import{Field as s,FieldDescription as c,FieldError as l,FieldLabel as u,FieldLegend as d,FieldSet as f}from"ui-sdk/field.js";import{Switch as p,SwitchThumb as m}from"ui-sdk/switch.js";import{createSwitchController as h}from"ui-sdk/core/switch.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const g={name:`sun`,size:24,node:[[`circle`,{cx:`12`,cy:`12`,r:`4`,key:`4exip2`}],[`path`,{d:`M12 2v2`,key:`tus03m`}],[`path`,{d:`M12 20v2`,key:`1lh1kg`}],[`path`,{d:`m4.93 4.93 1.41 1.41`,key:`149t6j`}],[`path`,{d:`m17.66 17.66 1.41 1.41`,key:`ptbguv`}],[`path`,{d:`M2 12h2`,key:`1t8f8n`}],[`path`,{d:`M20 12h2`,key:`1q8mjw`}],[`path`,{d:`m6.34 17.66-1.41 1.41`,key:`1m8zz5`}],[`path`,{d:`m19.07 4.93-1.41 1.41`,key:`1shlcs`}]]};g.node;const _=e(g);function v(){return/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Airplane mode`,/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(m,{})})]})}function y(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:`Weekly digest`}),/* @__PURE__ */ a(c,{children:`A summary of your week, every Monday.`})]}),/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(m,{})})]})}const b=[{label:`Public profile`,description:`Anyone can see your name and photo.`,defaultChecked:!1},{label:`Show activity status`,description:`Teammates can see when you're online.`,defaultChecked:!0}];function x(){return/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:b.map(e=>/* @__PURE__ */ o(s,{"data-variant":`card`,children:[/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:e.label}),/* @__PURE__ */ a(c,{children:e.description})]}),/* @__PURE__ */ a(p,{defaultChecked:e.defaultChecked,children:/* @__PURE__ */ a(m,{})})]},e.label))})}function S(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Product updates`,/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(m,{})})]}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Security alerts`,/* @__PURE__ */ a(p,{defaultChecked:!0,disabled:!0,children:/* @__PURE__ */ a(m,{})})]})]})}function C(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:`Encrypt backups`}),/* @__PURE__ */ a(c,{children:`Your organization manages this setting.`})]}),/* @__PURE__ */ a(p,{name:`encrypt`,defaultChecked:!0,readOnly:!0,children:/* @__PURE__ */ a(m,{})})]})}function w(){let e=r(),[t]=i.useState(()=>h()),[n,s]=i.useState(!0);return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>t.toggle(),children:`Toggle`})}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Wi-Fi`,/* @__PURE__ */ a(p,{checked:n,onCheckedChange:(t,n)=>{s(t),e(`${t?`On`:`Off`} (${n.reason})`)},controller:t,children:/* @__PURE__ */ a(m,{})})]})]})}function T(){let e=r();return/* @__PURE__ */ o(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault();let n=[...new FormData(t.currentTarget)].map(([e,t])=>`${e}=${t}`);e(n.length?`Submitted ${n.join(`&`)}`:`Submitted nothing`)},children:[/* @__PURE__ */ o(f,{children:[/* @__PURE__ */ a(d,{children:`Email notifications`}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Product updates`,/* @__PURE__ */ a(p,{name:`updates`,children:/* @__PURE__ */ a(m,{})})]}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Security alerts`,/* @__PURE__ */ a(p,{name:`security`,defaultChecked:!0,children:/* @__PURE__ */ a(m,{})})]}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Weekly digest`,/* @__PURE__ */ a(p,{name:`digest`,value:`weekly`,defaultChecked:!0,children:/* @__PURE__ */ a(m,{})})]})]}),/* @__PURE__ */ o(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ a(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`}),/* @__PURE__ */ a(`button`,{type:`reset`,children:`Reset`})]})]})}function E(){let e=r();return/* @__PURE__ */ o(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Submitted two-factor=${new FormData(t.currentTarget).get(`two-factor`)}`)},children:[/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ o(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:`Two-factor authentication`}),/* @__PURE__ */ a(c,{children:`Required for admins of this workspace.`})]}),/* @__PURE__ */ a(p,{name:`two-factor`,required:!0,children:/* @__PURE__ */ a(m,{})})]}),/* @__PURE__ */ a(l,{match:`valueMissing`,children:`Turn this on to continue.`})]}),/* @__PURE__ */ a(`div`,{"data-slot":`row`,children:/* @__PURE__ */ a(`button`,{type:`submit`,"data-variant":`solid`,children:`Continue`})})]})}const D=e=>new Promise(e=>setTimeout(e,800));function O(){let e=r(),[n]=i.useState(()=>h()),[s,c]=i.useState(!1),l=i.useRef(!1);return/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Automatic backups`,/* @__PURE__ */ a(p,{controller:n,"aria-busy":s,onCheckedChange:(t,r)=>{r.reason!==`imperative`&&(r.cancel(),!l.current&&(l.current=!0,c(!0),e(`Saving…`),D(t).then(()=>{l.current=!1,n.setChecked(t,{reason:`imperative`}),c(!1),e(`Saved: ${t?`on`:`off`}`)})))},children:/* @__PURE__ */ a(m,{children:s&&/* @__PURE__ */ a(t,{"data-slot":`spinner`,"aria-hidden":`true`})})})]})}function k(){return/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Dark mode`,/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(m,{render:(e,t)=>/* @__PURE__ */ a(`span`,{...e,children:t.checked?/* @__PURE__ */ a(n,{"aria-hidden":`true`}):/* @__PURE__ */ a(_,{"aria-hidden":`true`})})})})]})}function A(){return/* @__PURE__ */ a(`div`,{dir:`rtl`,children:/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`وضع الطيران`,/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(m,{})})]})})}function j(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Small`,/* @__PURE__ */ a(p,{"data-size":`sm`,children:/* @__PURE__ */ a(m,{})})]}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[`Default`,/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(m,{})})]})]})}var M={name:`switch`,title:`Switch`,description:`Turn a setting on or off.`,sections:[{heading:null,text:`Use a switch for a setting that takes effect as soon as it changes, like Airplane mode or a notification preference. Keep its label the same in both states: the label says what the setting is, and the switch shows whether it's on.`,examples:[{id:`switch/basic`,caption:`Click Airplane mode, or focus the switch and press Space, to turn it on and off.`,Example:v,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <label data-slot="label">
      Airplane mode
      <Switch>
        <SwitchThumb />
      </Switch>
    </label>
  )
}

export { Example }
`}]},{heading:`Description`,text:"Use `FieldLabel` and `FieldDescription` when a setting needs more explanation. The field connects both to the switch.",examples:[{id:`switch/description`,caption:`Click Weekly digest. The field connects the label and description to the switch.`,Example:y,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <Field>
      <div data-slot="stack">
        <FieldLabel>Weekly digest</FieldLabel>
        <FieldDescription>
          A summary of your week, every Monday.
        </FieldDescription>
      </div>
      <Switch>
        <SwitchThumb />
      </Switch>
    </Field>
  )
}

export { Example }
`}]},{heading:`Choice Card`,text:"A setting can fill a whole card. Here the label's `::after` covers the card, so a click anywhere on it toggles the switch, and `:has([data-checked])` marks the cards that are on.",examples:[{id:`switch/choice-card`,caption:`Click anywhere on the Public profile card to turn it on. Each card's switch keeps its own value.`,Example:x,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

const settings = [
  {
    label: "Public profile",
    description: "Anyone can see your name and photo.",
    defaultChecked: false,
  },
  {
    label: "Show activity status",
    description: "Teammates can see when you're online.",
    defaultChecked: true,
  },
]

function Example() {
  return (
    <div data-slot="stack">
      {settings.map((setting) => (
        <Field key={setting.label} data-variant="card">
          <div data-slot="stack">
            <FieldLabel>{setting.label}</FieldLabel>
            <FieldDescription>{setting.description}</FieldDescription>
          </div>
          <Switch defaultChecked={setting.defaultChecked}>
            <SwitchThumb />
          </Switch>
        </Field>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"`disabled` prevents focus and changes, and leaves the switch out of form submissions. A disabled `fieldset` does the same.",examples:[{id:`switch/disabled`,caption:`Security alerts are always on, so that switch is disabled. Clicking it leaves it on, and Tab skips it.`,Example:S,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <div data-slot="stack">
      <label data-slot="label">
        Product updates
        <Switch>
          <SwitchThumb />
        </Switch>
      </label>
      <label data-slot="label">
        Security alerts
        <Switch defaultChecked disabled>
          <SwitchThumb />
        </Switch>
      </label>
    </div>
  )
}

export { Example }
`}]},{heading:`Read-Only`,text:"`readOnly` keeps the switch focusable and included in form submissions, while preventing the user from changing it. Use it for a setting managed somewhere else.",examples:[{id:`switch/read-only`,caption:`Tab to Encrypt backups. Space and clicks leave it on.`,Example:C,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <Field>
      <div data-slot="stack">
        <FieldLabel>Encrypt backups</FieldLabel>
        <FieldDescription>
          Your organization manages this setting.
        </FieldDescription>
      </div>
      <Switch name="encrypt" defaultChecked readOnly>
        <SwitchThumb />
      </Switch>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `checked` and `onCheckedChange` to own the value. A controller from `createSwitchController()` changes it from anywhere, like the Toggle button below. See State and Events for the shared change callback.",examples:[{id:`switch/controlled`,caption:`Turn Wi-Fi off, or press Toggle. The console logs each change and its reason.`,Example:w,source:`"use client"

import * as React from "react"
import { createSwitchController } from "@ui-sdk/core/switch"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [wifi] = React.useState(() => createSwitchController())
  const [checked, setChecked] = React.useState(true)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => wifi.toggle()}>
          Toggle
        </button>
      </div>
      <label data-slot="label">
        Wi-Fi
        <Switch
          checked={checked}
          onCheckedChange={(next, details) => {
            setChecked(next)
            log(\`\${next ? "On" : "Off"} (\${details.reason})\`)
          }}
          controller={wifi}
        >
          <SwitchThumb />
        </Switch>
      </label>
    </div>
  )
}

export { Example }
`}]},{heading:`Form`,text:"Set `name` to include the switch in a native form. A switch that's on submits its `value`, which defaults to `\"on\"`; a switch that's off submits nothing. Reset returns it to `defaultChecked`. Set `form` to a form's id to join it from elsewhere on the page.",examples:[{id:`switch/form`,caption:`Turn on Product updates and press Save. The console logs the submitted values, and Reset restores the defaults.`,Example:T,source:`"use client"

import { FieldLegend, FieldSet } from "@ui-sdk/react/field"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const entries = [...new FormData(event.currentTarget)].map(
          ([name, value]) => \`\${name}=\${value}\`
        )
        log(
          entries.length
            ? \`Submitted \${entries.join("&")}\`
            : "Submitted nothing"
        )
      }}
    >
      <FieldSet>
        <FieldLegend>Email notifications</FieldLegend>
        <label data-slot="label">
          Product updates
          <Switch name="updates">
            <SwitchThumb />
          </Switch>
        </label>
        <label data-slot="label">
          Security alerts
          <Switch name="security" defaultChecked>
            <SwitchThumb />
          </Switch>
        </label>
        <label data-slot="label">
          Weekly digest
          <Switch name="digest" value="weekly" defaultChecked>
            <SwitchThumb />
          </Switch>
        </label>
      </FieldSet>
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
`}]},{heading:`Validation`,text:"`required` blocks submission until the switch is on. In a Field, `FieldError` shows the message under the switch and connects it to the switch. Forms and Validation covers the shared field behavior.",examples:[{id:`switch/invalid`,caption:`Press Continue with the switch off to see the error. Turn on Two-factor authentication and continue; the console logs the submitted value.`,Example:E,source:`"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(
          \`Submitted two-factor=\${new FormData(event.currentTarget).get("two-factor")}\`
        )
      }}
    >
      <Field>
        <div data-slot="row">
          <div data-slot="stack">
            <FieldLabel>Two-factor authentication</FieldLabel>
            <FieldDescription>
              Required for admins of this workspace.
            </FieldDescription>
          </div>
          <Switch name="two-factor" required>
            <SwitchThumb />
          </Switch>
        </div>
        <FieldError match="valueMissing">Turn this on to continue.</FieldError>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Continue
        </button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`Saving on Toggle`,text:'To save a change before it shows, call `details.cancel()` in the change callback to keep the current value while the save runs. When it finishes, call `controller.setChecked(next, { reason: "imperative" })`, and let that reason through in the callback so the saved value commits.',examples:[{id:`switch/async`,caption:`Turn on Automatic backups. The thumb shows a spinner while it saves, then the switch turns on.`,Example:O,source:`"use client"

import * as React from "react"
import { createSwitchController } from "@ui-sdk/core/switch"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { LoaderCircleIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const save = (_checked: boolean) =>
  new Promise((resolve) => setTimeout(resolve, 800))

function Example() {
  const log = useLog()
  const [backups] = React.useState(() => createSwitchController())
  const [saving, setSaving] = React.useState(false)
  const pending = React.useRef(false)

  return (
    <label data-slot="label">
      Automatic backups
      <Switch
        controller={backups}
        aria-busy={saving}
        onCheckedChange={(next, details) => {
          if (details.reason === "imperative") {
            return
          }
          details.cancel()
          if (pending.current) {
            return
          }
          pending.current = true
          setSaving(true)
          log("Saving…")
          save(next).then(() => {
            pending.current = false
            backups.setChecked(next, { reason: "imperative" })
            setSaving(false)
            log(\`Saved: \${next ? "on" : "off"}\`)
          })
        }}
      >
        <SwitchThumb>
          {saving && (
            <LoaderCircleIcon data-slot="spinner" aria-hidden="true" />
          )}
        </SwitchThumb>
      </Switch>
    </label>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"The switch and thumb take `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Keep the part's props on the element so its role, label and keyboard behavior stay connected. See Parts and Composition for the rendering contract.",examples:[{id:`switch/render`,caption:`Turn on Dark mode. The thumb renders a sun or a moon from its state.`,Example:k,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { MoonIcon, SunIcon } from "lucide-react"

function Example() {
  return (
    <label data-slot="label">
      Dark mode
      <Switch>
        <SwitchThumb
          render={(props, state) => (
            <span {...props}>
              {state.checked ? (
                <MoonIcon aria-hidden="true" />
              ) : (
                <SunIcon aria-hidden="true" />
              )}
            </span>
          )}
        />
      </Switch>
    </label>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`switch/rtl`,caption:``,Example:A,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <div dir="rtl">
      <label data-slot="label">
        وضع الطيران
        <Switch>
          <SwitchThumb />
        </Switch>
      </label>
    </div>
  )
}

export { Example }
`},{id:`switch/size`,caption:``,Example:j,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <div data-slot="stack">
      <label data-slot="label">
        Small
        <Switch data-size="sm">
          <SwitchThumb />
        </Switch>
      </label>
      <label data-slot="label">
        Default
        <Switch>
          <SwitchThumb />
        </Switch>
      </label>
    </div>
  )
}

export { Example }
`}]}]};export{M as default};