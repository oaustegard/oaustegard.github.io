import{t as e}from"../chunks/c-WfjOen3K.js";import{useLog as t}from"./log.js";import*as n from"preact/compat";import{jsx as r,jsxs as i}from"preact/compat/jsx-runtime";import{Field as a,FieldDescription as o,FieldError as s,FieldLabel as c,FieldLegend as l,FieldSet as u}from"ui-sdk/field.js";import{Radio as d,RadioGroup as f,RadioIndicator as p,createRadioGroupController as m}from"ui-sdk/radio.js";const h=[{value:`standard`,label:`Standard`},{value:`express`,label:`Express`},{value:`overnight`,label:`Overnight`}];function g(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Shipping speed`}),/* @__PURE__ */ r(f,{defaultValue:`standard`,children:h.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label]},e.value))})]})}const _=[{value:`instant`,label:`Instantly`,description:`An email right away.`},{value:`daily`,label:`Daily digest`,description:`One email each morning.`},{value:`weekly`,label:`Weekly digest`,description:`A summary every Monday.`}];function v(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Email notifications`}),/* @__PURE__ */ r(f,{defaultValue:`daily`,children:_.map(e=>/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(c,{children:e.label}),/* @__PURE__ */ r(o,{children:e.description})]})]},e.value))})]})}const y=[{value:`hobby`,label:`Hobby`,description:`Free for personal projects.`},{value:`pro`,label:`Pro`,description:`$20 per month for growing teams.`},{value:`enterprise`,label:`Enterprise`,description:`Custom pricing and support.`}];function b(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Plan`}),/* @__PURE__ */ r(f,{defaultValue:`hobby`,children:y.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`card`,children:[/* @__PURE__ */ i(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(`span`,{children:e.label}),/* @__PURE__ */ r(`span`,{"data-slot":`hint`,children:e.description})]}),/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})})]},e.value))})]})}const x=[{value:`monthly`,label:`Monthly`,price:`$12 per month`},{value:`yearly`,label:`Yearly`,price:`$120 per year`}];function S(){let e=n.useId();return/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(l,{id:`${e}-legend`,children:`Billing period`}),/* @__PURE__ */ r(o,{id:`${e}-description`,children:`Yearly billing gets you two months free.`}),/* @__PURE__ */ r(f,{defaultValue:`monthly`,"aria-labelledby":`${e}-legend`,"aria-describedby":`${e}-description`,children:x.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label,/* @__PURE__ */ i(`span`,{"data-slot":`hint`,children:[`(`,e.price,`)`]})]},e.value))})]})}const C=[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`},{value:`system`,label:`System`}],w=[{value:`hourly`,label:`Hourly`,disabled:!0},{value:`daily`,label:`Daily`,disabled:!1},{value:`weekly`,label:`Weekly`,disabled:!1}];function T(){return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Theme`}),/* @__PURE__ */ r(o,{children:`Set by your organization.`}),/* @__PURE__ */ r(f,{defaultValue:`light`,disabled:!0,children:C.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label]},e.value))})]}),/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Backups`}),/* @__PURE__ */ r(o,{children:`Hourly backups need the Pro plan.`}),/* @__PURE__ */ r(f,{defaultValue:`daily`,children:w.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,disabled:e.disabled,children:/* @__PURE__ */ r(p,{})}),e.label]},e.value))})]})]})}const E=[{value:`free`,label:`Free`},{value:`pro`,label:`Pro`},{value:`team`,label:`Team`}];function D(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Your plan`}),/* @__PURE__ */ r(o,{children:`Ask an admin to change plans.`}),/* @__PURE__ */ r(f,{defaultValue:`pro`,readOnly:!0,children:E.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label]},e.value))})]})}const O=[{value:`starter`,label:`Starter`},{value:`pro`,label:`Pro`},{value:`team`,label:`Team`}];function k(){let e=t(),[o]=n.useState(()=>m()),[s,l]=n.useState(`pro`);return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>o.setValue(`team`),children:`Choose Team`})}),/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Plan`}),/* @__PURE__ */ r(f,{value:s,onValueChange:(t,n)=>{l(t),e(`${O.find(e=>e.value===t)?.label??`None`} (${n.reason})`)},controller:o,children:O.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label]},e.value))})]})]})}const A=[{value:`standard`,label:`Standard`,detail:`Free, 5 to 7 days`},{value:`express`,label:`Express`,detail:`$9, 2 days`},{value:`overnight`,label:`Overnight`,detail:`$24, next day`}];function j(){let e=t(),o=n.useId();return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Shipping speed`}),/* @__PURE__ */ r(f,{name:`shipping`,form:`${o}-checkout`,required:!0,defaultValue:`standard`,children:A.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label,/* @__PURE__ */ i(`span`,{"data-slot":`hint`,children:[`(`,e.detail,`)`]})]},e.value))})]}),/* @__PURE__ */ i(`form`,{"data-slot":`row`,id:`${o}-checkout`,onSubmit:t=>{t.preventDefault(),e(`Submitted shipping=${new FormData(t.currentTarget).get(`shipping`)}`)},children:[/* @__PURE__ */ r(`button`,{type:`submit`,"data-variant":`solid`,children:`Continue`}),/* @__PURE__ */ r(`button`,{type:`reset`,children:`Reset`})]})]})}const M=[{value:`email`,label:`Email only`},{value:`sms`,label:`SMS only`},{value:`both`,label:`Email and SMS`}];function N(){let e=t();return/* @__PURE__ */ i(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Saved updates=${new FormData(t.currentTarget).get(`updates`)}`)},children:[/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Order updates`}),/* @__PURE__ */ r(o,{children:`Choose how we tell you about your orders.`}),/* @__PURE__ */ r(f,{name:`updates`,required:!0,children:M.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label]},e.value))}),/* @__PURE__ */ r(s,{children:`Choose how to get order updates.`})]}),/* @__PURE__ */ r(`div`,{"data-slot":`row`,children:/* @__PURE__ */ r(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`})})]})}const P=[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`},{value:`system`,label:`System`}];function F(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Theme`}),/* @__PURE__ */ r(f,{defaultValue:`system`,children:P.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{keepMounted:!0})}),e.label]},e.value))})]})}const I=[{value:`all`,label:`Everything`,description:`Every message and update.`},{value:`mentions`,label:`Mentions`,description:`Only when someone mentions you.`},{value:`none`,label:`Nothing`,description:`Turn notifications off.`}];function L(){let t=n.useId();return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Notify me about`}),/* @__PURE__ */ r(f,{defaultValue:`mentions`,children:I.map(n=>/* @__PURE__ */ r(d,{value:n.value,"aria-labelledby":`${t}-${n.value}-label`,"aria-describedby":`${t}-${n.value}-description`,render:(a,o)=>/* @__PURE__ */ i(`button`,{...a,children:[/* @__PURE__ */ i(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(`span`,{id:`${t}-${n.value}-label`,children:n.label}),/* @__PURE__ */ r(`span`,{"data-slot":`hint`,id:`${t}-${n.value}-description`,children:n.description})]}),/* @__PURE__ */ r(e,{"aria-hidden":`true`,"data-checked":o.checked?``:void 0})]})},n.value))})]})}const R=[{value:`standard`,label:`عادي`},{value:`express`,label:`سريع`},{value:`overnight`,label:`خلال ليلة`}];function z(){return/* @__PURE__ */ r(`div`,{dir:`rtl`,children:/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`سرعة الشحن`}),/* @__PURE__ */ r(f,{defaultValue:`express`,children:R.map(e=>/* @__PURE__ */ i(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ r(d,{value:e.value,children:/* @__PURE__ */ r(p,{})}),e.label]},e.value))})]})})}var B={name:`radio`,title:`Radio`,description:`Choose one option, move the selection with arrow keys, and submit it with a form.`,sections:[{heading:null,text:`Use radios for a short list of choices where only one can be picked, like a shipping speed or a plan. The group keeps one value and gives the whole list a single tab stop.`,examples:[{id:`radio/basic`,caption:`Choose Express, then use the arrow keys to move the selection between speeds.`,Example:g,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Shipping speed</FieldLabel>
      <RadioGroup defaultValue="standard">
        {speeds.map((speed) => (
          <label data-slot="label" key={speed.value}>
            <Radio value={speed.value}>
              <RadioIndicator />
            </Radio>
            {speed.label}
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
`}]},{heading:`Description`,text:"Put each radio in its own `Field` with a `FieldLabel` and `FieldDescription` when an option needs more explanation. That field connects both to its radio, while the outer field still names the group.",examples:[{id:`radio/description`,caption:`Choose Weekly digest by its label. Each radio is also described by the line under it.`,Example:v,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const frequencies = [
  { value: "instant", label: "Instantly", description: "An email right away." },
  {
    value: "daily",
    label: "Daily digest",
    description: "One email each morning.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "A summary every Monday.",
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Email notifications</FieldLabel>
      <RadioGroup defaultValue="daily">
        {frequencies.map((frequency) => (
          <Field key={frequency.value}>
            <Radio value={frequency.value}>
              <RadioIndicator />
            </Radio>
            <div data-slot="stack">
              <FieldLabel>{frequency.label}</FieldLabel>
              <FieldDescription>{frequency.description}</FieldDescription>
            </div>
          </Field>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
`}]},{heading:`Choice Card`,text:"Wrap an option's content in its label to make the whole card clickable. `:has([data-checked])` lets the card reflect the radio inside it.",examples:[{id:`radio/choice-card`,caption:`Click anywhere on the Pro card to choose it. Arrow keys move the selection between cards too.`,Example:b,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const plans = [
  {
    value: "hobby",
    label: "Hobby",
    description: "Free for personal projects.",
  },
  {
    value: "pro",
    label: "Pro",
    description: "$20 per month for growing teams.",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom pricing and support.",
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Plan</FieldLabel>
      <RadioGroup defaultValue="hobby">
        {plans.map((plan) => (
          <label data-slot="card" key={plan.value}>
            <span data-slot="stack">
              <span>{plan.label}</span>
              <span data-slot="hint">{plan.description}</span>
            </span>
            <Radio value={plan.value}>
              <RadioIndicator />
            </Radio>
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
`}]},{heading:`Fieldset and Legend`,text:"Use `FieldSet` and `FieldLegend` to describe a set of choices together. Connect the group to the legend with `aria-labelledby`, and to the description with `aria-describedby`.",examples:[{id:`radio/legend`,caption:`Choose Yearly. The legend and the line under it describe both billing periods.`,Example:S,source:`"use client"

import { FieldDescription, FieldLegend, FieldSet } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import * as React from "react"

const periods = [
  { value: "monthly", label: "Monthly", price: "$12 per month" },
  { value: "yearly", label: "Yearly", price: "$120 per year" },
]

function Example() {
  const id = React.useId()
  return (
    <FieldSet>
      <FieldLegend id={\`\${id}-legend\`}>Billing period</FieldLegend>
      <FieldDescription id={\`\${id}-description\`}>
        Yearly billing gets you two months free.
      </FieldDescription>
      <RadioGroup
        defaultValue="monthly"
        aria-labelledby={\`\${id}-legend\`}
        aria-describedby={\`\${id}-description\`}
      >
        {periods.map((period) => (
          <label data-slot="label" key={period.value}>
            <Radio value={period.value}>
              <RadioIndicator />
            </Radio>
            {period.label}
            <span data-slot="hint">({period.price})</span>
          </label>
        ))}
      </RadioGroup>
    </FieldSet>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` on the group or on one radio. Disabled radios can't be focused or checked, and arrow keys skip them. A disabled fieldset disables the group too, and a disabled group submits nothing.",examples:[{id:`radio/disabled`,caption:`The Theme group is disabled. In Backups, Hourly is disabled, so the arrow keys move between Daily and Weekly.`,Example:T,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const backups = [
  { value: "hourly", label: "Hourly", disabled: true },
  { value: "daily", label: "Daily", disabled: false },
  { value: "weekly", label: "Weekly", disabled: false },
]

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <FieldDescription>Set by your organization.</FieldDescription>
        <RadioGroup defaultValue="light" disabled>
          {themes.map((theme) => (
            <label data-slot="label" key={theme.value}>
              <Radio value={theme.value}>
                <RadioIndicator />
              </Radio>
              {theme.label}
            </label>
          ))}
        </RadioGroup>
      </Field>
      <Field>
        <FieldLabel>Backups</FieldLabel>
        <FieldDescription>Hourly backups need the Pro plan.</FieldDescription>
        <RadioGroup defaultValue="daily">
          {backups.map((backup) => (
            <label data-slot="label" key={backup.value}>
              <Radio value={backup.value} disabled={backup.disabled}>
                <RadioIndicator />
              </Radio>
              {backup.label}
            </label>
          ))}
        </RadioGroup>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Read-Only`,text:"Set `readOnly` on the group to keep its value while still letting people focus and read the options. Arrow keys move focus without checking anything, and the value still submits with a form.",examples:[{id:`radio/read-only`,caption:`Click Team, or focus Pro and press the Down arrow. Pro stays checked.`,Example:D,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Your plan</FieldLabel>
      <FieldDescription>Ask an admin to change plans.</FieldDescription>
      <RadioGroup defaultValue="pro" readOnly>
        {plans.map((plan) => (
          <label data-slot="label" key={plan.value}>
            <Radio value={plan.value}>
              <RadioIndicator />
            </Radio>
            {plan.label}
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the callback to keep the current value. A controller from `createRadioGroupController()` checks a radio from anywhere, like the Choose Team button below. Create one controller per mounted group.",examples:[{id:`radio/controlled`,caption:`Choose Starter, then press Choose Team. The console logs each change and its reason.`,Example:k,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createRadioGroupController,
  Radio,
  RadioGroup,
  RadioIndicator,
} from "@ui-sdk/react/radio"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

type Plan = "starter" | "pro" | "team"

const plans: { value: Plan; label: string }[] = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

function Example() {
  const log = useLog()
  const [planGroup] = React.useState(() => createRadioGroupController<Plan>())
  const [value, setValue] = React.useState<Plan | null>("pro")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => planGroup.setValue("team")}>
          Choose Team
        </button>
      </div>
      <Field>
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup
          value={value}
          onValueChange={(next, details) => {
            setValue(next)
            log(
              \`\${plans.find((plan) => plan.value === next)?.label ?? "None"} (\${details.reason})\`
            )
          }}
          controller={planGroup}
        >
          {plans.map((plan) => (
            <label data-slot="label" key={plan.value}>
              <Radio value={plan.value}>
                <RadioIndicator />
              </Radio>
              {plan.label}
            </label>
          ))}
        </RadioGroup>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Form`,text:"Each radio renders a button with the `radio` role and a hidden native radio, so the group takes part in forms. Set `name` to submit the checked value; the group submits nothing without a name or a checked radio. `required` blocks submission until there's a choice, and a reset returns to `defaultValue`.",examples:[{id:`radio/form`,caption:`Choose Express and press Continue. The console logs the submitted value, and Reset returns the choice to Standard.`,Example:j,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const speeds = [
  { value: "standard", label: "Standard", detail: "Free, 5 to 7 days" },
  { value: "express", label: "Express", detail: "$9, 2 days" },
  { value: "overnight", label: "Overnight", detail: "$24, next day" },
]

function Example() {
  const log = useLog()
  const id = React.useId()

  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Shipping speed</FieldLabel>
        <RadioGroup
          name="shipping"
          form={\`\${id}-checkout\`}
          required
          defaultValue="standard"
        >
          {speeds.map((speed) => (
            <label data-slot="label" key={speed.value}>
              <Radio value={speed.value}>
                <RadioIndicator />
              </Radio>
              {speed.label}
              <span data-slot="hint">({speed.detail})</span>
            </label>
          ))}
        </RadioGroup>
      </Field>
      <form
        data-slot="row"
        id={\`\${id}-checkout\`}
        onSubmit={(event) => {
          event.preventDefault()
          log(
            \`Submitted shipping=\${new FormData(event.currentTarget).get("shipping")}\`
          )
        }}
      >
        <button type="submit" data-variant="solid">
          Continue
        </button>
        <button type="reset">Reset</button>
      </form>
    </div>
  )
}

export { Example }
`}]},{heading:`Validation`,text:"Put a required group in a Field with a `FieldError`. Submitting without a choice shows the error under the group and moves focus to it. The Forms guide covers the shared field behavior.",examples:[{id:`radio/invalid`,caption:`Press Save without a choice to see the error. Choose SMS only and save again; the console logs the saved value.`,Example:N,source:`"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import { useLog } from "../../../shared/react/log"

const channels = [
  { value: "email", label: "Email only" },
  { value: "sms", label: "SMS only" },
  { value: "both", label: "Email and SMS" },
]

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(\`Saved updates=\${new FormData(event.currentTarget).get("updates")}\`)
      }}
    >
      <Field>
        <FieldLabel>Order updates</FieldLabel>
        <FieldDescription>
          Choose how we tell you about your orders.
        </FieldDescription>
        <RadioGroup name="updates" required>
          {channels.map((channel) => (
            <label data-slot="label" key={channel.value}>
              <Radio value={channel.value}>
                <RadioIndicator />
              </Radio>
              {channel.label}
            </label>
          ))}
        </RadioGroup>
        <FieldError>Choose how to get order updates.</FieldError>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Save
        </button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The indicator has `data-starting-style` as it appears and `data-ending-style` while it leaves, and stays mounted until its exit finishes. Transition from those states:",examples:[{id:`radio/indicator`,caption:`Hover Light to preview its dot, then choose it. The dot scales in on Light and out of System.`,Example:F,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Theme</FieldLabel>
      <RadioGroup defaultValue="system">
        {themes.map((theme) => (
          <label data-slot="label" key={theme.value}>
            <Radio value={theme.value}>
              <RadioIndicator keepMounted />
            </Radio>
            {theme.label}
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"The group, radio and indicator take `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Keep the part's props on the interactive element so its role, label and keyboard behavior stay connected. See Parts and Composition for the rendering contract.",examples:[{id:`radio/render`,caption:`Choose Nothing. Each radio renders a full-width button that shows a check from its state.`,Example:L,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup } from "@ui-sdk/react/radio"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const options = [
  {
    value: "all",
    label: "Everything",
    description: "Every message and update.",
  },
  {
    value: "mentions",
    label: "Mentions",
    description: "Only when someone mentions you.",
  },
  { value: "none", label: "Nothing", description: "Turn notifications off." },
]

function Example() {
  const id = React.useId()
  return (
    <Field>
      <FieldLabel>Notify me about</FieldLabel>
      <RadioGroup defaultValue="mentions">
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            aria-labelledby={\`\${id}-\${option.value}-label\`}
            aria-describedby={\`\${id}-\${option.value}-description\`}
            render={(props, state) => (
              <button {...props}>
                <span data-slot="stack">
                  <span id={\`\${id}-\${option.value}-label\`}>{option.label}</span>
                  <span
                    data-slot="hint"
                    id={\`\${id}-\${option.value}-description\`}
                  >
                    {option.description}
                  </span>
                </span>
                <CheckIcon
                  aria-hidden="true"
                  data-checked={state.checked ? "" : undefined}
                />
              </button>
            )}
          />
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`radio/rtl`,caption:``,Example:z,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const speeds = [
  { value: "standard", label: "عادي" },
  { value: "express", label: "سريع" },
  { value: "overnight", label: "خلال ليلة" },
]

function Example() {
  return (
    <div dir="rtl">
      <Field>
        <FieldLabel>سرعة الشحن</FieldLabel>
        <RadioGroup defaultValue="express">
          {speeds.map((speed) => (
            <label data-slot="label" key={speed.value}>
              <Radio value={speed.value}>
                <RadioIndicator />
              </Radio>
              {speed.label}
            </label>
          ))}
        </RadioGroup>
      </Field>
    </div>
  )
}

export { Example }
`}]}]};export{B as default};