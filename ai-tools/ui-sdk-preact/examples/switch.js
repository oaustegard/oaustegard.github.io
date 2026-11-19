import{Ao as e,Co as t,Eo as n,Jn as r,Kn as i,Mo as a,Oo as o,To as s,ds as c,fl as l,gs as u,ko as d,qn as f,qo as p,tl as m,ul as h}from"../chunks/c-CIXE4Nkk.js";function g(){return/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Airplane mode`,/* @__PURE__ */ m(i,{children:/* @__PURE__ */ m(f,{})})]})}function _(){return/* @__PURE__ */ m(t,{children:[/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(o,{children:`Weekly digest`}),/* @__PURE__ */ m(s,{children:`A summary of your week, every Monday.`})]}),/* @__PURE__ */ m(i,{children:/* @__PURE__ */ m(f,{})})]})}const v=[{label:`Public profile`,description:`Anyone can see your name and photo.`,defaultChecked:!1},{label:`Show activity status`,description:`Teammates can see when you're online.`,defaultChecked:!0}];function y(){return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:v.map(e=>/* @__PURE__ */ m(t,{"data-variant":`card`,children:[/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(o,{children:e.label}),/* @__PURE__ */ m(s,{children:e.description})]}),/* @__PURE__ */ m(i,{defaultChecked:e.defaultChecked,children:/* @__PURE__ */ m(f,{})})]},e.label))})}function b(){return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Product updates`,/* @__PURE__ */ m(i,{children:/* @__PURE__ */ m(f,{})})]}),/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Security alerts`,/* @__PURE__ */ m(i,{defaultChecked:!0,disabled:!0,children:/* @__PURE__ */ m(f,{})})]})]})}function x(){return/* @__PURE__ */ m(t,{children:[/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(o,{children:`Encrypt backups`}),/* @__PURE__ */ m(s,{children:`Your organization manages this setting.`})]}),/* @__PURE__ */ m(i,{name:`encrypt`,defaultChecked:!0,readOnly:!0,children:/* @__PURE__ */ m(f,{})})]})}function S(){let e=a(),[t]=l(()=>r()),[n,o]=l(!0);return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>t.toggle(),children:`Toggle`})}),/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Wi-Fi`,/* @__PURE__ */ m(i,{checked:n,onCheckedChange:(t,n)=>{o(t),e(`${t?`On`:`Off`} (${n.reason})`)},controller:t,children:/* @__PURE__ */ m(f,{})})]})]})}function C(){let t=a();return/* @__PURE__ */ m(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let n=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);t(n.length?`Submitted ${n.join(`&`)}`:`Submitted nothing`)},children:[/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(d,{children:`Email notifications`}),/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Product updates`,/* @__PURE__ */ m(i,{name:`updates`,children:/* @__PURE__ */ m(f,{})})]}),/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Security alerts`,/* @__PURE__ */ m(i,{name:`security`,defaultChecked:!0,children:/* @__PURE__ */ m(f,{})})]}),/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Weekly digest`,/* @__PURE__ */ m(i,{name:`digest`,value:`weekly`,defaultChecked:!0,children:/* @__PURE__ */ m(f,{})})]})]}),/* @__PURE__ */ m(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ m(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`}),/* @__PURE__ */ m(`button`,{type:`reset`,children:`Reset`})]})]})}function w(){let e=a();return/* @__PURE__ */ m(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Submitted two-factor=${new FormData(t.currentTarget).get(`two-factor`)}`)},children:[/* @__PURE__ */ m(t,{children:[/* @__PURE__ */ m(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(o,{children:`Two-factor authentication`}),/* @__PURE__ */ m(s,{children:`Required for admins of this workspace.`})]}),/* @__PURE__ */ m(i,{name:`two-factor`,required:!0,children:/* @__PURE__ */ m(f,{})})]}),/* @__PURE__ */ m(n,{match:`valueMissing`,children:`Turn this on to continue.`})]}),/* @__PURE__ */ m(`div`,{"data-slot":`row`,children:/* @__PURE__ */ m(`button`,{type:`submit`,"data-variant":`solid`,children:`Continue`})})]})}const T=e=>new Promise(e=>setTimeout(e,800));function E(){let e=a(),[t]=l(()=>r()),[n,o]=l(!1),s=h(!1);return/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Automatic backups`,/* @__PURE__ */ m(i,{controller:t,"aria-busy":n,onCheckedChange:(n,r)=>{r.reason!==`imperative`&&(r.cancel(),!s.current&&(s.current=!0,o(!0),e(`Saving…`),T(n).then(()=>{s.current=!1,t.setChecked(n,{reason:`imperative`}),o(!1),e(`Saved: ${n?`on`:`off`}`)})))},children:/* @__PURE__ */ m(f,{children:n&&/* @__PURE__ */ m(u,{"data-slot":`spinner`,"aria-hidden":`true`})})})]})}function D(){return/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Dark mode`,/* @__PURE__ */ m(i,{children:/* @__PURE__ */ m(f,{render:(e,t)=>/* @__PURE__ */ m(`span`,{...e,children:t.checked?/* @__PURE__ */ m(c,{"aria-hidden":`true`}):/* @__PURE__ */ m(p,{"aria-hidden":`true`})})})})]})}function O(){return/* @__PURE__ */ m(`div`,{dir:`rtl`,children:/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`وضع الطيران`,/* @__PURE__ */ m(i,{children:/* @__PURE__ */ m(f,{})})]})})}function k(){return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Small`,/* @__PURE__ */ m(i,{"data-size":`sm`,children:/* @__PURE__ */ m(f,{})})]}),/* @__PURE__ */ m(`label`,{"data-slot":`label`,children:[`Default`,/* @__PURE__ */ m(i,{children:/* @__PURE__ */ m(f,{})})]})]})}var A={name:`switch`,title:`Switch`,description:`Turn a setting on or off.`,sections:[{heading:null,text:`Use a switch for a setting that takes effect as soon as it changes, like Airplane mode or a notification preference. Keep its label the same in both states: the label says what the setting is, and the switch shows whether it's on.`,examples:[{id:`switch/basic`,caption:`Click Airplane mode, or focus the switch and press Space, to turn it on and off.`,Example:g,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

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
`}]},{heading:`Description`,text:"Use `FieldLabel` and `FieldDescription` when a setting needs more explanation. The field connects both to the switch.",examples:[{id:`switch/description`,caption:`Click Weekly digest. The field connects the label and description to the switch.`,Example:_,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`Choice Card`,text:"A setting can fill a whole card. Here the label's `::after` covers the card, so a click anywhere on it toggles the switch, and `:has([data-checked])` marks the cards that are on.",examples:[{id:`switch/choice-card`,caption:`Click anywhere on the Public profile card to turn it on. Each card's switch keeps its own value.`,Example:y,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`Disabled`,text:"`disabled` prevents focus and changes, and leaves the switch out of form submissions. A disabled `fieldset` does the same.",examples:[{id:`switch/disabled`,caption:`Security alerts are always on, so that switch is disabled. Clicking it leaves it on, and Tab skips it.`,Example:b,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

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
`}]},{heading:`Read-Only`,text:"`readOnly` keeps the switch focusable and included in form submissions, while preventing the user from changing it. Use it for a setting managed somewhere else.",examples:[{id:`switch/read-only`,caption:`Tab to Encrypt backups. Space and clicks leave it on.`,Example:x,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`Controlled`,text:"Pass `checked` and `onCheckedChange` to own the value. A controller from `createSwitchController()` changes it from anywhere, like the Toggle button below. See State and Events for the shared change callback.",examples:[{id:`switch/controlled`,caption:`Turn Wi-Fi off, or press Toggle. The console logs each change and its reason.`,Example:S,source:`"use client"

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
`}]},{heading:`Form`,text:"Set `name` to include the switch in a native form. A switch that's on submits its `value`, which defaults to `\"on\"`; a switch that's off submits nothing. Reset returns it to `defaultChecked`. Set `form` to a form's id to join it from elsewhere on the page.",examples:[{id:`switch/form`,caption:`Turn on Product updates and press Save. The console logs the submitted values, and Reset restores the defaults.`,Example:C,source:`"use client"

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
`}]},{heading:`Validation`,text:"`required` blocks submission until the switch is on. In a Field, `FieldError` shows the message under the switch and connects it to the switch. Forms and Validation covers the shared field behavior.",examples:[{id:`switch/invalid`,caption:`Press Continue with the switch off to see the error. Turn on Two-factor authentication and continue; the console logs the submitted value.`,Example:w,source:`"use client"

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
`}]},{heading:`Saving on Toggle`,text:'To save a change before it shows, call `details.cancel()` in the change callback to keep the current value while the save runs. When it finishes, call `controller.setChecked(next, { reason: "imperative" })`, and let that reason through in the callback so the saved value commits.',examples:[{id:`switch/async`,caption:`Turn on Automatic backups. The thumb shows a spinner while it saves, then the switch turns on.`,Example:E,source:`"use client"

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
`}]},{heading:`Custom Rendering`,text:"The switch and thumb take `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Keep the part's props on the element so its role, label and keyboard behavior stay connected. See Parts and Composition for the rendering contract.",examples:[{id:`switch/render`,caption:`Turn on Dark mode. The thumb renders a sun or a moon from its state.`,Example:D,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
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
`}]},{heading:`More examples`,text:``,examples:[{id:`switch/rtl`,caption:``,Example:O,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

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
`},{id:`switch/size`,caption:``,Example:k,source:`import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

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
`}]}]};export{A as default};