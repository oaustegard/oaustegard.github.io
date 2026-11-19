import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-BHtAohdq.js";import{t as n}from"../chunks/c-CKwygB1M.js";import{useLog as r}from"./log.js";import*as i from"preact/compat";import{jsx as a,jsxs as o}from"preact/compat/jsx-runtime";import{Field as s,FieldDescription as c,FieldError as l,FieldLabel as u}from"ui-sdk/field.js";import{Checkbox as d,CheckboxGroup as f,CheckboxIndicator as p}from"ui-sdk/checkbox.js";import{createCheckboxController as m,createCheckboxGroupController as h}from"ui-sdk/core/checkbox.js";function g(){return/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),`Accept terms and conditions`]})}function _(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(d,{children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:`Accept terms and conditions`}),/* @__PURE__ */ a(c,{children:`By clicking this checkbox, you agree to the terms and conditions.`})]})]})}function v(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{defaultChecked:!0,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),`Product updates`]}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{defaultChecked:!0,disabled:!0,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),`Security alerts`]})]})}function y(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(d,{name:`two-factor`,defaultChecked:!0,readOnly:!0,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:`Require two-factor authentication`}),/* @__PURE__ */ a(c,{children:`Your organization requires this setting.`})]})]})}function b(){let t=r(),[n]=i.useState(()=>m()),[s,c]=i.useState(!1);return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>n.toggle(),children:`Toggle`})}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{checked:s,onCheckedChange:(e,n)=>{c(e),t(`${e===`indeterminate`?`Mixed`:e?`Checked`:`Unchecked`} (${n.reason})`)},controller:n,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),`Email me about product updates`]})]})}function x(){let t=r();return/* @__PURE__ */ o(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let n=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);t(n.length?`Submitted ${n.join(`&`)}`:`Submitted nothing`)},children:[/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(d,{name:`terms`,value:`yes`,required:!0,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:`Accept terms and conditions`}),/* @__PURE__ */ a(c,{children:`You agree to our Terms of Service and Privacy Policy.`})]})]}),/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(d,{name:`newsletter`,value:`weekly`,defaultChecked:!0,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(u,{children:`Send me the weekly newsletter`}),/* @__PURE__ */ a(c,{children:`Product news and tips, once a week. Unsubscribe anytime.`})]})]}),/* @__PURE__ */ o(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ a(`button`,{type:`submit`,children:`Create Account`}),/* @__PURE__ */ a(`button`,{type:`reset`,children:`Reset`})]})]})}const S=[{value:`cheese`,label:`Cheese`},{value:`mushrooms`,label:`Mushrooms`},{value:`olives`,label:`Olives`},{value:`peppers`,label:`Peppers`}];function C(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(`h3`,{id:`basic-toppings`,children:`Toppings`}),/* @__PURE__ */ a(f,{"aria-labelledby":`basic-toppings`,defaultValue:[`cheese`],children:S.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{value:t.value,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),t.label]},t.value))})]})}const w=[{value:`cheese`,label:`Cheese`},{value:`mushrooms`,label:`Mushrooms`},{value:`olives`,label:`Olives`},{value:`peppers`,label:`Peppers`}];function T(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(`h3`,{id:`parent-toppings`,children:`Toppings`}),/* @__PURE__ */ o(f,{"aria-labelledby":`parent-toppings`,defaultValue:[`cheese`,`olives`],allValues:w.map(e=>e.value),children:[/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{parent:!0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(e,{"aria-hidden":`true`}),/* @__PURE__ */ a(t,{"aria-hidden":`true`})]})}),`Select all`]}),/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:w.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{value:t.value,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),t.label]},t.value))})]})]})}const E=[{value:`photos`,label:`Photos`},{value:`documents`,label:`Documents`},{value:`messages`,label:`Messages`}],D=[{value:`desktop`,label:`Desktop`,disabled:!0},{value:`projects`,label:`Projects`,disabled:!1},{value:`downloads`,label:`Downloads`,disabled:!1}];function O(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(`h3`,{id:`disabled-backups`,children:`Backups`}),/* @__PURE__ */ a(`p`,{"data-slot":`hint`,children:`Managed by your organization.`}),/* @__PURE__ */ a(f,{"aria-labelledby":`disabled-backups`,defaultValue:[`photos`,`documents`],disabled:!0,children:E.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{value:t.value,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),t.label]},t.value))})]}),/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(`h3`,{id:`disabled-folders`,children:`Sync folders`}),/* @__PURE__ */ o(f,{"aria-labelledby":`disabled-folders`,defaultValue:[`desktop`],allValues:D.map(e=>e.value),children:[/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{parent:!0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(e,{"aria-hidden":`true`}),/* @__PURE__ */ a(t,{"aria-hidden":`true`})]})}),`Select all`]}),/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:D.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{value:t.value,disabled:t.disabled,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),t.label]},t.value))})]})]})]})}const k=[{value:`mon`,label:`Monday`},{value:`tue`,label:`Tuesday`},{value:`wed`,label:`Wednesday`},{value:`thu`,label:`Thursday`},{value:`fri`,label:`Friday`},{value:`sat`,label:`Saturday`},{value:`sun`,label:`Sunday`}],A=[`mon`,`tue`,`wed`,`thu`,`fri`];function j(){let t=r(),[n]=i.useState(()=>h()),[s,c]=i.useState([`mon`,`tue`]);return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>n.setValue(A),children:`Select Weekdays`}),/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>n.setValue([]),children:`Clear`})]}),/* @__PURE__ */ a(`h3`,{id:`controlled-days`,children:`Working days`}),/* @__PURE__ */ a(f,{"aria-labelledby":`controlled-days`,value:s,onValueChange:(e,n)=>{c(e);let r=k.filter(t=>e.includes(t.value)).map(e=>e.label);t(`${r.join(`, `)||`No days`} (${n.reason})`)},controller:n,children:k.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{value:t.value,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),t.label]},t.value))})]})}const M=[{value:`email`,label:`Email`},{value:`sms`,label:`SMS`},{value:`push`,label:`Push notifications`}];function N(){let t=r();return/* @__PURE__ */ o(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let n=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);t(`Saved ${n.join(`&`)}`)},children:[/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(u,{children:`Notifications`}),/* @__PURE__ */ a(c,{children:`Choose how we tell you about your orders.`}),/* @__PURE__ */ a(f,{name:`notifications`,required:!0,children:M.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{value:t.value,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),t.label]},t.value))}),/* @__PURE__ */ a(`div`,{children:/* @__PURE__ */ a(l,{children:`Choose at least one way to be notified.`})})]}),/* @__PURE__ */ a(`button`,{type:`submit`,children:`Save`})]})}const P=[{id:`hollis`,name:`Hollis Grant`,email:`hollis@example.com`,role:`Owner`},{id:`ines`,name:`Inès Moreau`,email:`ines@example.com`,role:`Editor`},{id:`kofi`,name:`Kofi Mensah`,email:`kofi@example.com`,role:`Viewer`},{id:`wren`,name:`Wren Takahashi`,email:`wren@example.com`,role:`Editor`}];function F(){let n=r(),[s,c]=i.useState([`hollis`]);return/* @__PURE__ */ a(f,{"aria-label":`Team members`,value:s,onValueChange:e=>{c(e),n(`${e.length} of ${P.length} selected`)},allValues:P.map(e=>e.id),children:/* @__PURE__ */ o(`table`,{children:[/* @__PURE__ */ a(`caption`,{"data-slot":`visually-hidden`,children:`Team members`}),/* @__PURE__ */ a(`thead`,{children:/* @__PURE__ */ o(`tr`,{children:[/* @__PURE__ */ a(`th`,{children:/* @__PURE__ */ a(d,{"aria-label":`Select all`,parent:!0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(e,{"aria-hidden":`true`}),/* @__PURE__ */ a(t,{"aria-hidden":`true`})]})})}),/* @__PURE__ */ a(`th`,{children:`Name`}),/* @__PURE__ */ a(`th`,{children:`Email`}),/* @__PURE__ */ a(`th`,{children:`Role`})]})}),/* @__PURE__ */ a(`tbody`,{children:P.map(t=>/* @__PURE__ */ o(`tr`,{children:[/* @__PURE__ */ a(`td`,{children:/* @__PURE__ */ a(d,{value:t.id,"aria-label":`Select ${t.name}`,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})})}),/* @__PURE__ */ a(`td`,{children:t.name}),/* @__PURE__ */ a(`td`,{children:t.email}),/* @__PURE__ */ a(`td`,{children:t.role})]},t.id))})]})})}const I=[{label:`Write the release notes`,done:!1},{label:`Update the changelog`,done:!0},{label:`Tag the release`,done:!1}];function L(){return/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:I.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{defaultChecked:t.done,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{"aria-hidden":`true`})})}),t.label]},t.label))})}const R=[{value:`design`,label:`Design`,checked:!0},{value:`engineering`,label:`Engineering`,checked:!1},{value:`marketing`,label:`Marketing`,checked:!1},{value:`sales`,label:`Sales`,checked:!1}];function z(){return/* @__PURE__ */ o(`fieldset`,{children:[/* @__PURE__ */ a(`legend`,{children:`Topics you follow`}),/* @__PURE__ */ a(`div`,{"data-slot":`row`,children:R.map(t=>/* @__PURE__ */ a(d,{name:`topics`,value:t.value,defaultChecked:t.checked,render:(r,i)=>/* @__PURE__ */ o(`button`,{...r,children:[i.checked?/* @__PURE__ */ a(e,{}):/* @__PURE__ */ a(n,{}),t.label]})},t.value))})]})}const B=[{value:`cheese`,label:`جبن`},{value:`mushrooms`,label:`فطر`},{value:`olives`,label:`زيتون`},{value:`peppers`,label:`فلفل`}];function V(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ a(`h3`,{id:`rtl-toppings`,children:`الإضافات`}),/* @__PURE__ */ a(f,{"aria-labelledby":`rtl-toppings`,defaultValue:[`cheese`],children:B.map(t=>/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{value:t.value,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{})})}),t.label]},t.value))})]})}function H(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{})})}),`قبول الشروط والأحكام`]}),/* @__PURE__ */ o(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ a(d,{defaultChecked:!0,children:/* @__PURE__ */ a(p,{children:/* @__PURE__ */ a(e,{})})}),`تفعيل الإشعارات`]})]})}var U={name:`checkbox`,title:`Checkbox`,description:`Choose one or more options, individually or as a group.`,sections:[{heading:null,text:`Use a checkbox for a choice someone can check or uncheck. Use a group when several choices belong to one value.`,examples:[{id:`checkbox/basic`,caption:`Click the checkbox or its label, or focus it and press Space, to accept the terms.`,Example:g,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]},{heading:`Description`,text:"Use `FieldLabel` and `FieldDescription` when a choice needs more explanation. The field connects both to the checkbox.",examples:[{id:`checkbox/description`,caption:`Click Accept terms and conditions. The field connects the label and description to the checkbox.`,Example:_,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]},{heading:`Disabled`,text:"`disabled` prevents focus and changes, and leaves the checkbox out of form submissions. A disabled `fieldset` does the same.",examples:[{id:`checkbox/disabled`,caption:`Security alerts are always on, so that checkbox is disabled. Clicking its label leaves it checked.`,Example:v,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]},{heading:`Read-Only`,text:"`readOnly` keeps the checkbox focusable and included in form submissions, while preventing the user from changing it.",examples:[{id:`checkbox/read-only`,caption:`Tab to the checked checkbox. Space and clicks leave the setting unchanged.`,Example:y,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]},{heading:`Controlled`,text:"Pass `checked` and `onCheckedChange` to own the value. A controller from `createCheckboxController()` changes it from anywhere, like the Toggle button below.",examples:[{id:`checkbox/controlled`,caption:`Change the checkbox, or press Toggle. The console logs each change and its reason.`,Example:b,source:`"use client"

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
`}]},{heading:`Forms`,text:'Set `name` and `value` to include a checked checkbox in a native form. Unchecked and mixed checkboxes submit nothing. The default value is `"on"`. Independent checkboxes can share a name to submit several values; use a group when your app also needs one list of checked values.',examples:[{id:`checkbox/form`,caption:`Create the account with the terms unchecked to see native validation, then accept them and try again. The console logs what was submitted, and Reset restores the defaults.`,Example:x,source:`"use client"

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
`}]},{heading:`Group`,text:"`CheckboxGroup` keeps one list of checked values. Each checkbox supplies its `value`; the group returns selected values in the order the checkboxes appear. Name the group with `aria-label`, `aria-labelledby`, or a Field.",examples:[{id:`checkbox/group`,caption:`Choose several toppings. The group keeps one list of checked values.`,Example:C,source:`import {
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
`}]},{heading:`Parent Checkbox`,text:"Add a checkbox with `parent` to check or uncheck the group. It is checked when every value is selected, unchecked when none are, and mixed in between. It points to its children with `aria-controls` and submits nothing itself.",examples:[{id:`checkbox/group-parent`,caption:`Select all checks every topping. Uncheck one topping to put Select all into its mixed state.`,Example:T,source:`import {
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
`}]},{heading:`Disabled Group`,text:`Disable the group to lock every checkbox, or disable one child to keep just that value fixed. A parent changes only enabled children.`,examples:[{id:`checkbox/group-disabled`,caption:`The Backups group is disabled. In Sync folders, Select all changes the enabled folders while Desktop stays checked.`,Example:O,source:`import {
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
`}]},{heading:`Controlled Group`,text:"Pass `value` and `onValueChange` to own the selected values. A controller can replace that list, as Select Weekdays and Clear do below.",examples:[{id:`checkbox/group-controlled`,caption:`Choose working days, or press Select Weekdays or Clear. The console logs the group's value and the reason it changed.`,Example:j,source:`"use client"

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
`}]},{heading:`Group in a Form`,text:"Set `name` on the group to submit every checked value under that name. `required` requires at least one selection, and Reset restores `defaultValue`. The same `disabled` and `form` options apply as on a single checkbox.",examples:[{id:`checkbox/group-field`,caption:`Save with nothing checked to see the inline error. Choose a notification method and save; the console logs the submitted values.`,Example:N,source:`"use client"

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
`}]},{heading:`Table`,text:`The same parent checkbox can select rows from a table header. Each row supplies its value and accessible name.`,examples:[{id:`checkbox/table`,caption:`Select rows individually, or use Select all in the header. The console logs how many are selected.`,Example:F,source:`"use client"

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
`}]},{heading:`Animation`,text:"The indicator has `data-starting-style` as it appears and `data-ending-style` while it leaves, and stays mounted until its exit finishes. Transition from those states:",examples:[{id:`checkbox/indicator`,caption:`Check and uncheck a task. The check scales and fades in, and out before it unmounts.`,Example:L,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]},{heading:`Custom Rendering`,text:"The checkbox, indicator, and group take `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Keep the part's props on the interactive element so its role, label, and keyboard behavior stay connected.",examples:[{id:`checkbox/render`,caption:`Choose topics. Each checkbox renders a button that shows a check or a plus from its state.`,Example:z,source:`import { Checkbox } from "@ui-sdk/react/checkbox"
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
`}]},{heading:`More examples`,text:``,examples:[{id:`checkbox/group-rtl`,caption:``,Example:V,source:`import {
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
`},{id:`checkbox/rtl`,caption:``,Example:H,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]}]};export{U as default};