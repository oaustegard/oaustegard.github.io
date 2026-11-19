import{Co as e,Eo as t,Mo as n,Oo as r,To as i,_o as a,as as o,fl as s,fs as c,go as l,ho as u,mo as d,qs as f,tl as p,vo as m}from"../chunks/c-CIXE4Nkk.js";function h(){return/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),`Accept terms and conditions`]})}function g(){return/* @__PURE__ */ p(e,{children:[/* @__PURE__ */ p(d,{children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(r,{children:`Accept terms and conditions`}),/* @__PURE__ */ p(i,{children:`By clicking this checkbox, you agree to the terms and conditions.`})]})]})}function _(){return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{defaultChecked:!0,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),`Product updates`]}),/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{defaultChecked:!0,disabled:!0,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),`Security alerts`]})]})}function v(){return/* @__PURE__ */ p(e,{children:[/* @__PURE__ */ p(d,{name:`two-factor`,defaultChecked:!0,readOnly:!0,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(r,{children:`Require two-factor authentication`}),/* @__PURE__ */ p(i,{children:`Your organization requires this setting.`})]})]})}function y(){let e=n(),[t]=s(()=>a()),[r,i]=s(!1);return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ p(`button`,{type:`button`,onClick:()=>t.toggle(),children:`Toggle`})}),/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{checked:r,onCheckedChange:(t,n)=>{i(t),e(`${t===`indeterminate`?`Mixed`:t?`Checked`:`Unchecked`} (${n.reason})`)},controller:t,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),`Email me about product updates`]})]})}function b(){let t=n();return/* @__PURE__ */ p(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let n=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);t(n.length?`Submitted ${n.join(`&`)}`:`Submitted nothing`)},children:[/* @__PURE__ */ p(e,{children:[/* @__PURE__ */ p(d,{name:`terms`,value:`yes`,required:!0,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(r,{children:`Accept terms and conditions`}),/* @__PURE__ */ p(i,{children:`You agree to our Terms of Service and Privacy Policy.`})]})]}),/* @__PURE__ */ p(e,{children:[/* @__PURE__ */ p(d,{name:`newsletter`,value:`weekly`,defaultChecked:!0,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(r,{children:`Send me the weekly newsletter`}),/* @__PURE__ */ p(i,{children:`Product news and tips, once a week. Unsubscribe anytime.`})]})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(`button`,{type:`submit`,children:`Create Account`}),/* @__PURE__ */ p(`button`,{type:`reset`,children:`Reset`})]})]})}const x=[{value:`cheese`,label:`Cheese`},{value:`mushrooms`,label:`Mushrooms`},{value:`olives`,label:`Olives`},{value:`peppers`,label:`Peppers`}];function S(){return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`h3`,{id:`basic-toppings`,children:`Toppings`}),/* @__PURE__ */ p(u,{"aria-labelledby":`basic-toppings`,defaultValue:[`cheese`],children:x.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{value:e.value,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),e.label]},e.value))})]})}const C=[{value:`cheese`,label:`Cheese`},{value:`mushrooms`,label:`Mushrooms`},{value:`olives`,label:`Olives`},{value:`peppers`,label:`Peppers`}];function w(){return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`h3`,{id:`parent-toppings`,children:`Toppings`}),/* @__PURE__ */ p(u,{"aria-labelledby":`parent-toppings`,defaultValue:[`cheese`,`olives`],allValues:C.map(e=>e.value),children:[/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{parent:!0,children:/* @__PURE__ */ p(l,{children:[/* @__PURE__ */ p(f,{"aria-hidden":`true`}),/* @__PURE__ */ p(c,{"aria-hidden":`true`})]})}),`Select all`]}),/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:C.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{value:e.value,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),e.label]},e.value))})]})]})}const T=[{value:`photos`,label:`Photos`},{value:`documents`,label:`Documents`},{value:`messages`,label:`Messages`}],E=[{value:`desktop`,label:`Desktop`,disabled:!0},{value:`projects`,label:`Projects`,disabled:!1},{value:`downloads`,label:`Downloads`,disabled:!1}];function D(){return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`h3`,{id:`disabled-backups`,children:`Backups`}),/* @__PURE__ */ p(`p`,{"data-slot":`hint`,children:`Managed by your organization.`}),/* @__PURE__ */ p(u,{"aria-labelledby":`disabled-backups`,defaultValue:[`photos`,`documents`],disabled:!0,children:T.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{value:e.value,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),e.label]},e.value))})]}),/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`h3`,{id:`disabled-folders`,children:`Sync folders`}),/* @__PURE__ */ p(u,{"aria-labelledby":`disabled-folders`,defaultValue:[`desktop`],allValues:E.map(e=>e.value),children:[/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{parent:!0,children:/* @__PURE__ */ p(l,{children:[/* @__PURE__ */ p(f,{"aria-hidden":`true`}),/* @__PURE__ */ p(c,{"aria-hidden":`true`})]})}),`Select all`]}),/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:E.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{value:e.value,disabled:e.disabled,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),e.label]},e.value))})]})]})]})}const O=[{value:`mon`,label:`Monday`},{value:`tue`,label:`Tuesday`},{value:`wed`,label:`Wednesday`},{value:`thu`,label:`Thursday`},{value:`fri`,label:`Friday`},{value:`sat`,label:`Saturday`},{value:`sun`,label:`Sunday`}],k=[`mon`,`tue`,`wed`,`thu`,`fri`];function A(){let e=n(),[t]=s(()=>m()),[r,i]=s([`mon`,`tue`]);return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ p(`button`,{type:`button`,onClick:()=>t.setValue(k),children:`Select Weekdays`}),/* @__PURE__ */ p(`button`,{type:`button`,onClick:()=>t.setValue([]),children:`Clear`})]}),/* @__PURE__ */ p(`h3`,{id:`controlled-days`,children:`Working days`}),/* @__PURE__ */ p(u,{"aria-labelledby":`controlled-days`,value:r,onValueChange:(t,n)=>{i(t);let r=O.filter(e=>t.includes(e.value)).map(e=>e.label);e(`${r.join(`, `)||`No days`} (${n.reason})`)},controller:t,children:O.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{value:e.value,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),e.label]},e.value))})]})}const j=[{value:`email`,label:`Email`},{value:`sms`,label:`SMS`},{value:`push`,label:`Push notifications`}];function M(){let a=n();return/* @__PURE__ */ p(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let t=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);a(`Saved ${t.join(`&`)}`)},children:[/* @__PURE__ */ p(e,{children:[/* @__PURE__ */ p(r,{children:`Notifications`}),/* @__PURE__ */ p(i,{children:`Choose how we tell you about your orders.`}),/* @__PURE__ */ p(u,{name:`notifications`,required:!0,children:j.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{value:e.value,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),e.label]},e.value))}),/* @__PURE__ */ p(`div`,{children:/* @__PURE__ */ p(t,{children:`Choose at least one way to be notified.`})})]}),/* @__PURE__ */ p(`button`,{type:`submit`,children:`Save`})]})}const N=[{id:`hollis`,name:`Hollis Grant`,email:`hollis@example.com`,role:`Owner`},{id:`ines`,name:`Inès Moreau`,email:`ines@example.com`,role:`Editor`},{id:`kofi`,name:`Kofi Mensah`,email:`kofi@example.com`,role:`Viewer`},{id:`wren`,name:`Wren Takahashi`,email:`wren@example.com`,role:`Editor`}];function P(){let e=n(),[t,r]=s([`hollis`]);return/* @__PURE__ */ p(u,{"aria-label":`Team members`,value:t,onValueChange:t=>{r(t),e(`${t.length} of ${N.length} selected`)},allValues:N.map(e=>e.id),children:/* @__PURE__ */ p(`table`,{children:[/* @__PURE__ */ p(`caption`,{"data-slot":`visually-hidden`,children:`Team members`}),/* @__PURE__ */ p(`thead`,{children:/* @__PURE__ */ p(`tr`,{children:[/* @__PURE__ */ p(`th`,{children:/* @__PURE__ */ p(d,{"aria-label":`Select all`,parent:!0,children:/* @__PURE__ */ p(l,{children:[/* @__PURE__ */ p(f,{"aria-hidden":`true`}),/* @__PURE__ */ p(c,{"aria-hidden":`true`})]})})}),/* @__PURE__ */ p(`th`,{children:`Name`}),/* @__PURE__ */ p(`th`,{children:`Email`}),/* @__PURE__ */ p(`th`,{children:`Role`})]})}),/* @__PURE__ */ p(`tbody`,{children:N.map(e=>/* @__PURE__ */ p(`tr`,{children:[/* @__PURE__ */ p(`td`,{children:/* @__PURE__ */ p(d,{value:e.id,"aria-label":`Select ${e.name}`,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})})}),/* @__PURE__ */ p(`td`,{children:e.name}),/* @__PURE__ */ p(`td`,{children:e.email}),/* @__PURE__ */ p(`td`,{children:e.role})]},e.id))})]})})}const F=[{label:`Write the release notes`,done:!1},{label:`Update the changelog`,done:!0},{label:`Tag the release`,done:!1}];function I(){return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:F.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{defaultChecked:e.done,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{"aria-hidden":`true`})})}),e.label]},e.label))})}const L=[{value:`design`,label:`Design`,checked:!0},{value:`engineering`,label:`Engineering`,checked:!1},{value:`marketing`,label:`Marketing`,checked:!1},{value:`sales`,label:`Sales`,checked:!1}];function R(){return/* @__PURE__ */ p(`fieldset`,{children:[/* @__PURE__ */ p(`legend`,{children:`Topics you follow`}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:L.map(e=>/* @__PURE__ */ p(d,{name:`topics`,value:e.value,defaultChecked:e.checked,render:(t,n)=>/* @__PURE__ */ p(`button`,{...t,children:[n.checked?/* @__PURE__ */ p(f,{}):/* @__PURE__ */ p(o,{}),e.label]})},e.value))})]})}const z=[{value:`cheese`,label:`جبن`},{value:`mushrooms`,label:`فطر`},{value:`olives`,label:`زيتون`},{value:`peppers`,label:`فلفل`}];function B(){return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ p(`h3`,{id:`rtl-toppings`,children:`الإضافات`}),/* @__PURE__ */ p(u,{"aria-labelledby":`rtl-toppings`,defaultValue:[`cheese`],children:z.map(e=>/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{value:e.value,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{})})}),e.label]},e.value))})]})}function V(){return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{})})}),`قبول الشروط والأحكام`]}),/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ p(d,{defaultChecked:!0,children:/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(f,{})})}),`تفعيل الإشعارات`]})]})}var H={name:`checkbox`,title:`Checkbox`,description:`Choose one or more options, individually or as a group.`,sections:[{heading:null,text:`Use a checkbox for a choice someone can check or uncheck. Use a group when several choices belong to one value.`,examples:[{id:`checkbox/basic`,caption:`Click the checkbox or its label, or focus it and press Space, to accept the terms.`,Example:h,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <label data-slot="label">
      <Checkbox>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      Accept terms and conditions
    </label>
  )
}

export { Example }
`}]},{heading:`Description`,text:"Use `FieldLabel` and `FieldDescription` when a choice needs more explanation. The field connects both to the checkbox.",examples:[{id:`checkbox/description`,caption:`Click Accept terms and conditions. The field connects the label and description to the checkbox.`,Example:g,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <Checkbox>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      <div data-slot="stack">
        <FieldLabel>Accept terms and conditions</FieldLabel>
        <FieldDescription>
          By clicking this checkbox, you agree to the terms and conditions.
        </FieldDescription>
      </div>
    </Field>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"`disabled` prevents focus and changes, and leaves the checkbox out of form submissions. A disabled `fieldset` does the same.",examples:[{id:`checkbox/disabled`,caption:`Security alerts are always on, so that checkbox is disabled. Clicking its label leaves it checked.`,Example:_,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <div data-slot="stack">
      <label data-slot="label">
        <Checkbox defaultChecked>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        Product updates
      </label>
      <label data-slot="label">
        <Checkbox defaultChecked disabled>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        Security alerts
      </label>
    </div>
  )
}

export { Example }
`}]},{heading:`Read-Only`,text:"`readOnly` keeps the checkbox focusable and included in form submissions, while preventing the user from changing it.",examples:[{id:`checkbox/read-only`,caption:`Tab to the checked checkbox. Space and clicks leave the setting unchanged.`,Example:v,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <Checkbox name="two-factor" defaultChecked readOnly>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      <div data-slot="stack">
        <FieldLabel>Require two-factor authentication</FieldLabel>
        <FieldDescription>
          Your organization requires this setting.
        </FieldDescription>
      </div>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `checked` and `onCheckedChange` to own the value. A controller from `createCheckboxController()` changes it from anywhere, like the Toggle button below.",examples:[{id:`checkbox/controlled`,caption:`Change the checkbox, or press Toggle. The console logs each change and its reason.`,Example:y,source:`"use client"

import * as React from "react"
import {
  createCheckboxController,
  type CheckedState,
} from "@ui-sdk/core/checkbox"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [updates] = React.useState(() => createCheckboxController())
  const [checked, setChecked] = React.useState<CheckedState>(false)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => updates.toggle()}>
          Toggle
        </button>
      </div>
      <label data-slot="label">
        <Checkbox
          checked={checked}
          onCheckedChange={(next, details) => {
            setChecked(next)
            log(
              \`\${next === "indeterminate" ? "Mixed" : next ? "Checked" : "Unchecked"} (\${details.reason})\`
            )
          }}
          controller={updates}
        >
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        Email me about product updates
      </label>
    </div>
  )
}

export { Example }
`}]},{heading:`Forms`,text:'Set `name` and `value` to include a checked checkbox in a native form. Unchecked and mixed checkboxes submit nothing. The default value is `"on"`. Independent checkboxes can share a name to submit several values; use a group when your app also needs one list of checked values.',examples:[{id:`checkbox/form`,caption:`Create the account with the terms unchecked to see native validation, then accept them and try again. The console logs what was submitted, and Reset restores the defaults.`,Example:b,source:`"use client"

import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"
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
      <Field>
        <Checkbox name="terms" value="yes" required>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        <div data-slot="stack">
          <FieldLabel>Accept terms and conditions</FieldLabel>
          <FieldDescription>
            You agree to our Terms of Service and Privacy Policy.
          </FieldDescription>
        </div>
      </Field>
      <Field>
        <Checkbox name="newsletter" value="weekly" defaultChecked>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        <div data-slot="stack">
          <FieldLabel>Send me the weekly newsletter</FieldLabel>
          <FieldDescription>
            Product news and tips, once a week. Unsubscribe anytime.
          </FieldDescription>
        </div>
      </Field>
      <div data-slot="row">
        <button type="submit">Create Account</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`Group`,text:"`CheckboxGroup` keeps one list of checked values. Each checkbox supplies its `value`; the group returns selected values in the order the checkboxes appear. Name the group with `aria-label`, `aria-labelledby`, or a Field.",examples:[{id:`checkbox/group`,caption:`Choose several toppings. The group keeps one list of checked values.`,Example:S,source:`import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

function Example() {
  return (
    <div data-slot="stack">
      <h3 id="basic-toppings">Toppings</h3>
      <CheckboxGroup aria-labelledby="basic-toppings" defaultValue={["cheese"]}>
        {toppings.map((topping) => (
          <label data-slot="label" key={topping.value}>
            <Checkbox value={topping.value}>
              <CheckboxIndicator>
                <CheckIcon aria-hidden="true" />
              </CheckboxIndicator>
            </Checkbox>
            {topping.label}
          </label>
        ))}
      </CheckboxGroup>
    </div>
  )
}

export { Example }
`}]},{heading:`Parent Checkbox`,text:"Add a checkbox with `parent` to check or uncheck the group. It is checked when every value is selected, unchecked when none are, and mixed in between. It points to its children with `aria-controls` and submits nothing itself.",examples:[{id:`checkbox/group-parent`,caption:`Select all checks every topping. Uncheck one topping to put Select all into its mixed state.`,Example:w,source:`import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

function Example() {
  return (
    <div data-slot="stack">
      <h3 id="parent-toppings">Toppings</h3>
      <CheckboxGroup
        aria-labelledby="parent-toppings"
        defaultValue={["cheese", "olives"]}
        allValues={toppings.map((topping) => topping.value)}
      >
        <label data-slot="label">
          <Checkbox parent>
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
              <MinusIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Select all
        </label>
        <div data-slot="stack">
          {toppings.map((topping) => (
            <label data-slot="label" key={topping.value}>
              <Checkbox value={topping.value}>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
              {topping.label}
            </label>
          ))}
        </div>
      </CheckboxGroup>
    </div>
  )
}

export { Example }
`}]},{heading:`Disabled Group`,text:`Disable the group to lock every checkbox, or disable one child to keep just that value fixed. A parent changes only enabled children.`,examples:[{id:`checkbox/group-disabled`,caption:`The Backups group is disabled. In Sync folders, Select all changes the enabled folders while Desktop stays checked.`,Example:D,source:`import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

const backups = [
  { value: "photos", label: "Photos" },
  { value: "documents", label: "Documents" },
  { value: "messages", label: "Messages" },
]

const folders = [
  { value: "desktop", label: "Desktop", disabled: true },
  { value: "projects", label: "Projects", disabled: false },
  { value: "downloads", label: "Downloads", disabled: false },
]

function Example() {
  return (
    <div data-slot="stack">
      <div data-slot="stack">
        <h3 id="disabled-backups">Backups</h3>
        <p data-slot="hint">Managed by your organization.</p>
        <CheckboxGroup
          aria-labelledby="disabled-backups"
          defaultValue={["photos", "documents"]}
          disabled
        >
          {backups.map((item) => (
            <label data-slot="label" key={item.value}>
              <Checkbox value={item.value}>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
              {item.label}
            </label>
          ))}
        </CheckboxGroup>
      </div>
      <div data-slot="stack">
        <h3 id="disabled-folders">Sync folders</h3>
        <CheckboxGroup
          aria-labelledby="disabled-folders"
          defaultValue={["desktop"]}
          allValues={folders.map((item) => item.value)}
        >
          <label data-slot="label">
            <Checkbox parent>
              <CheckboxIndicator>
                <CheckIcon aria-hidden="true" />
                <MinusIcon aria-hidden="true" />
              </CheckboxIndicator>
            </Checkbox>
            Select all
          </label>
          <div data-slot="stack">
            {folders.map((item) => (
              <label data-slot="label" key={item.value}>
                <Checkbox value={item.value} disabled={item.disabled}>
                  <CheckboxIndicator>
                    <CheckIcon aria-hidden="true" />
                  </CheckboxIndicator>
                </Checkbox>
                {item.label}
              </label>
            ))}
          </div>
        </CheckboxGroup>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Controlled Group`,text:"Pass `value` and `onValueChange` to own the selected values. A controller can replace that list, as Select Weekdays and Clear do below.",examples:[{id:`checkbox/group-controlled`,caption:`Choose working days, or press Select Weekdays or Clear. The console logs the group's value and the reason it changed.`,Example:A,source:`"use client"

import * as React from "react"
import { createCheckboxGroupController } from "@ui-sdk/core/checkbox"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

const days: { value: Day; label: string }[] = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
]

const weekdays: Day[] = ["mon", "tue", "wed", "thu", "fri"]

function Example() {
  const log = useLog()
  const [schedule] = React.useState(() => createCheckboxGroupController<Day>())
  const [value, setValue] = React.useState<Day[]>(["mon", "tue"])

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => schedule.setValue(weekdays)}>
          Select Weekdays
        </button>
        <button type="button" onClick={() => schedule.setValue([])}>
          Clear
        </button>
      </div>
      <h3 id="controlled-days">Working days</h3>
      <CheckboxGroup
        aria-labelledby="controlled-days"
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          const names = days
            .filter((day) => next.includes(day.value))
            .map((day) => day.label)
          log(\`\${names.join(", ") || "No days"} (\${details.reason})\`)
        }}
        controller={schedule}
      >
        {days.map((day) => (
          <label data-slot="label" key={day.value}>
            <Checkbox value={day.value}>
              <CheckboxIndicator>
                <CheckIcon aria-hidden="true" />
              </CheckboxIndicator>
            </Checkbox>
            {day.label}
          </label>
        ))}
      </CheckboxGroup>
    </div>
  )
}

export { Example }
`}]},{heading:`Group in a Form`,text:"Set `name` on the group to submit every checked value under that name. `required` requires at least one selection, and Reset restores `defaultValue`. The same `disabled` and `form` options apply as on a single checkbox.",examples:[{id:`checkbox/group-field`,caption:`Save with nothing checked to see the inline error. Choose a notification method and save; the console logs the submitted values.`,Example:M,source:`"use client"

import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const channels = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push notifications" },
]

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
        log(\`Saved \${entries.join("&")}\`)
      }}
    >
      <Field>
        <FieldLabel>Notifications</FieldLabel>
        <FieldDescription>
          Choose how we tell you about your orders.
        </FieldDescription>
        <CheckboxGroup name="notifications" required>
          {channels.map((channel) => (
            <label data-slot="label" key={channel.value}>
              <Checkbox value={channel.value}>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
              {channel.label}
            </label>
          ))}
        </CheckboxGroup>
        <div>
          <FieldError>Choose at least one way to be notified.</FieldError>
        </div>
      </Field>
      <button type="submit">Save</button>
    </form>
  )
}

export { Example }
`}]},{heading:`Table`,text:`The same parent checkbox can select rows from a table header. Each row supplies its value and accessible name.`,examples:[{id:`checkbox/table`,caption:`Select rows individually, or use Select all in the header. The console logs how many are selected.`,Example:P,source:`"use client"

import * as React from "react"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const people = [
  {
    id: "hollis",
    name: "Hollis Grant",
    email: "hollis@example.com",
    role: "Owner",
  },
  {
    id: "ines",
    name: "Inès Moreau",
    email: "ines@example.com",
    role: "Editor",
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    email: "kofi@example.com",
    role: "Viewer",
  },
  {
    id: "wren",
    name: "Wren Takahashi",
    email: "wren@example.com",
    role: "Editor",
  },
]

function Example() {
  const log = useLog()
  const [selected, setSelected] = React.useState(["hollis"])

  return (
    <CheckboxGroup
      aria-label="Team members"
      value={selected}
      onValueChange={(next) => {
        setSelected(next)
        log(\`\${next.length} of \${people.length} selected\`)
      }}
      allValues={people.map((person) => person.id)}
    >
      <table>
        <caption data-slot="visually-hidden">Team members</caption>
        <thead>
          <tr>
            <th>
              <Checkbox aria-label="Select all" parent>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                  <MinusIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id}>
              <td>
                <Checkbox
                  value={person.id}
                  aria-label={\`Select \${person.name}\`}
                >
                  <CheckboxIndicator>
                    <CheckIcon aria-hidden="true" />
                  </CheckboxIndicator>
                </Checkbox>
              </td>
              <td>{person.name}</td>
              <td>{person.email}</td>
              <td>{person.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CheckboxGroup>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The indicator has `data-starting-style` as it appears and `data-ending-style` while it leaves, and stays mounted until its exit finishes. Transition from those states:",examples:[{id:`checkbox/indicator`,caption:`Check and uncheck a task. The check scales and fades in, and out before it unmounts.`,Example:I,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

const tasks = [
  { label: "Write the release notes", done: false },
  { label: "Update the changelog", done: true },
  { label: "Tag the release", done: false },
]

function Example() {
  return (
    <div data-slot="stack">
      {tasks.map((task) => (
        <label data-slot="label" key={task.label}>
          <Checkbox defaultChecked={task.done}>
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          {task.label}
        </label>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"The checkbox, indicator, and group take `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Keep the part's props on the interactive element so its role, label, and keyboard behavior stay connected.",examples:[{id:`checkbox/render`,caption:`Choose topics. Each checkbox renders a button that shows a check or a plus from its state.`,Example:R,source:`import { Checkbox } from "@ui-sdk/react/checkbox"
import { CheckIcon, PlusIcon } from "lucide-react"

const topics = [
  { value: "design", label: "Design", checked: true },
  { value: "engineering", label: "Engineering", checked: false },
  { value: "marketing", label: "Marketing", checked: false },
  { value: "sales", label: "Sales", checked: false },
]

function Example() {
  return (
    <fieldset>
      <legend>Topics you follow</legend>
      <div data-slot="row">
        {topics.map((topic) => (
          <Checkbox
            key={topic.value}
            name="topics"
            value={topic.value}
            defaultChecked={topic.checked}
            render={(props, state) => (
              <button {...props}>
                {state.checked ? <CheckIcon /> : <PlusIcon />}
                {topic.label}
              </button>
            )}
          />
        ))}
      </div>
    </fieldset>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`checkbox/group-rtl`,caption:``,Example:B,source:`import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

const toppings = [
  { value: "cheese", label: "جبن" },
  { value: "mushrooms", label: "فطر" },
  { value: "olives", label: "زيتون" },
  { value: "peppers", label: "فلفل" },
]

export function Example() {
  return (
    <div data-slot="stack" dir="rtl">
      <h3 id="rtl-toppings">الإضافات</h3>
      <CheckboxGroup aria-labelledby="rtl-toppings" defaultValue={["cheese"]}>
        {toppings.map((topping) => (
          <label data-slot="label" key={topping.value}>
            <Checkbox value={topping.value}>
              <CheckboxIndicator>
                <CheckIcon />
              </CheckboxIndicator>
            </Checkbox>
            {topping.label}
          </label>
        ))}
      </CheckboxGroup>
    </div>
  )
}
`},{id:`checkbox/rtl`,caption:``,Example:V,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

export function Example() {
  return (
    <div data-slot="stack" dir="rtl">
      <label data-slot="label">
        <Checkbox>
          <CheckboxIndicator>
            <CheckIcon />
          </CheckboxIndicator>
        </Checkbox>
        قبول الشروط والأحكام
      </label>
      <label data-slot="label">
        <Checkbox defaultChecked>
          <CheckboxIndicator>
            <CheckIcon />
          </CheckboxIndicator>
        </Checkbox>
        تفعيل الإشعارات
      </label>
    </div>
  )
}
`}]}]};export{H as default};