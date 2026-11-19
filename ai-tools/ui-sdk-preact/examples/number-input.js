import{Co as e,Mo as t,Oo as n,Si as r,To as i,_i as a,as as o,bi as s,fl as c,fs as l,gi as u,hi as d,ll as f,ls as p,tl as m,vi as h,xi as g,yi as _}from"../chunks/c-CIXE4Nkk.js";function v(){let r=t();return/* @__PURE__ */ m(e,{children:/* @__PURE__ */ m(d,{defaultValue:1,min:1,onValueCommit:e=>r(`Quantity ${e??`empty`}`),children:[/* @__PURE__ */ m(s,{pixelsPerStep:4,children:[/* @__PURE__ */ m(n,{children:`Quantity`}),/* @__PURE__ */ m(g,{children:/* @__PURE__ */ m(p,{"aria-hidden":`true`})})]}),/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})]})})}function y(){return/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Tickets`}),/* @__PURE__ */ m(d,{defaultValue:2,min:1,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ m(i,{children:`Each ticket admits one person to the workshop.`})]})}function b(){return/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Guests`}),/* @__PURE__ */ m(d,{defaultValue:2,min:1,max:8,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ m(i,{children:`Tables seat between 1 and 8 guests.`})]})}function x(){return/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Hours`}),/* @__PURE__ */ m(d,{defaultValue:1.5,min:0,max:24,step:.25,largeStep:1,smallStep:.05,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ m(i,{children:`Logged in quarter hours.`})]})}const S=[{label:`Price`,defaultValue:19.99,step:.01,format:{style:`currency`,currency:`USD`}},{label:`Discount`,defaultValue:.15,step:.01,format:{style:`percent`}},{label:`Weight`,defaultValue:2.5,step:.1,format:{style:`unit`,unit:`kilogram`}}];function C(){return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:S.map(({label:t,...r})=>/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:t}),/* @__PURE__ */ m(d,{...r,min:0,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]},t))})}const w=[{label:`Preis`,locale:`de-DE`,defaultValue:1234.5,step:.01,format:{style:`currency`,currency:`EUR`}},{label:`Budget`,locale:`en-IN`,defaultValue:1234567,step:1e3,format:{style:`currency`,currency:`INR`,maximumFractionDigits:0}}];function T(){return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:w.map(({label:t,...r})=>/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:t}),/* @__PURE__ */ m(d,{...r,min:0,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ m(i,{children:[`Formatted for `,r.locale,`.`]})]},t))})}function E(){return/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Font size`}),/* @__PURE__ */ m(d,{defaultValue:16,min:8,max:72,wheel:!0,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ m(i,{children:`Focus the input, then scroll over it.`})]})}const D=[{label:`X position`,handle:`X`,defaultValue:120},{label:`Y position`,handle:`Y`,defaultValue:48},{label:`Width`,handle:`W`,defaultValue:320,min:0},{label:`Height`,handle:`H`,defaultValue:240,min:0}];function O(){let e=t(),n=f();return/* @__PURE__ */ m(`div`,{"data-slot":`card`,role:`group`,"aria-labelledby":n,children:[/* @__PURE__ */ m(`h3`,{id:n,children:`Frame`}),/* @__PURE__ */ m(`div`,{"data-slot":`grid`,children:D.map(({label:t,handle:n,...r})=>/* @__PURE__ */ m(d,{...r,onValueCommit:n=>e(`${t} ${n??`empty`}`),children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(s,{pixelsPerStep:1,children:[/* @__PURE__ */ m(`span`,{"aria-hidden":`true`,children:n}),/* @__PURE__ */ m(g,{children:/* @__PURE__ */ m(p,{"aria-hidden":`true`})})]}),/* @__PURE__ */ m(u,{"aria-label":t})]})},t))})]})}function k(){let r=t(),[i,s]=c(4);return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>s(4),children:`Reset to 4`}),/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>s(null),children:`Clear`})]}),/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Servings`}),/* @__PURE__ */ m(d,{value:i,onValueChange:(e,t)=>{s(e),r(`Value ${e??`empty`} (${t.reason})`)},onValueCommit:(e,t)=>r(`Committed ${e??`empty`} (${t.reason})`),min:1,max:12,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]})]})}function A(){let i=t(),[s]=c(r);return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>s.decrement({large:!0}),children:`Zoom Out`}),/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>s.increment({large:!0}),children:`Zoom In`}),/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>s.setValue(100),children:`Actual Size`}),/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>i(`Zoom is ${s.getValue()}%`),children:`Read`}),/* @__PURE__ */ m(`button`,{type:`button`,onClick:()=>s.focus(),children:`Focus`})]}),/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Zoom`}),/* @__PURE__ */ m(d,{defaultValue:100,min:10,max:400,step:10,format:{style:`unit`,unit:`percent`},controller:s,onValueChange:(e,t)=>i(`Zoom ${e??`empty`}% (${t.reason})`),children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]})]})}function j(){let r=t(),i=f();return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`form`,{"data-slot":`stack`,id:i,onSubmit:e=>{e.preventDefault();let t=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);r(`Submitted ${t.join(`, `)}`)},children:[/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Quantity`}),/* @__PURE__ */ m(d,{name:`quantity`,defaultValue:2,min:1,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]}),/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Tip`}),/* @__PURE__ */ m(d,{name:`tip`,defaultValue:4.5,min:0,step:.5,format:{style:`currency`,currency:`USD`},children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]})]}),/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Gift cards`}),/* @__PURE__ */ m(d,{name:`gift-cards`,form:i,defaultValue:0,min:0,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]}),/* @__PURE__ */ m(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ m(`button`,{type:`reset`,form:i,children:`Reset`}),/* @__PURE__ */ m(`button`,{type:`submit`,form:i,"data-variant":`solid`,children:`Save`})]})]})}function M(){return/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`Temperature`}),/* @__PURE__ */ m(d,{defaultValue:-2,min:-20,max:40,format:{style:`unit`,unit:`celsius`},children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Colder`,render:(e,t)=>/* @__PURE__ */ m(`button`,{...e,title:t.atBound?`As cold as it goes`:`Colder`}),children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`Warmer`,children:e=>e.atBound?/* @__PURE__ */ m(`span`,{children:`Max`}):/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]})}function N(){return/* @__PURE__ */ m(d,{defaultValue:1,min:0,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`Decrease`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{"aria-label":`Quantity`}),/* @__PURE__ */ m(_,{"aria-label":`Increase`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})}function P(){return/* @__PURE__ */ m(`div`,{dir:`rtl`,children:/* @__PURE__ */ m(e,{children:[/* @__PURE__ */ m(n,{children:`الكمية`}),/* @__PURE__ */ m(d,{defaultValue:1,min:0,children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(a,{"aria-label":`إنقاص`,children:/* @__PURE__ */ m(l,{"aria-hidden":`true`})}),/* @__PURE__ */ m(u,{}),/* @__PURE__ */ m(_,{"aria-label":`زيادة`,children:/* @__PURE__ */ m(o,{"aria-hidden":`true`})})]})})]})})}var F={name:`number-input`,title:`Number Input`,description:`Enter numbers, step through values, and format them for a locale.`,sections:[{heading:null,text:`Use a Number Input for quantities, prices and measurements. It keeps a numeric value while showing formatted text, and steps it with the keyboard, the step buttons, or a drag on its label.`,examples:[{id:`number-input/basic`,caption:`Drag the Quantity label sideways to scrub the value, or click it to focus the input. Type a number, press ArrowUp or ArrowDown, or hold a step button. The console logs the value once each change is committed.`,Example:v,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputScrubArea,
  NumberInputScrubAreaCursor,
} from "@ui-sdk/react/number-input"
import { MinusIcon, MoveHorizontalIcon, PlusIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Field>
      <NumberInput
        defaultValue={1}
        min={1}
        onValueCommit={(value) => log(\`Quantity \${value ?? "empty"}\`)}
      >
        <NumberInputScrubArea pixelsPerStep={4}>
          <FieldLabel>Quantity</FieldLabel>
          <NumberInputScrubAreaCursor>
            <MoveHorizontalIcon aria-hidden="true" />
          </NumberInputScrubAreaCursor>
        </NumberInputScrubArea>
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Decrease">
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <NumberInputControl />
          <NumberInputIncrement aria-label="Increase">
            <PlusIcon aria-hidden="true" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Field`,text:`Wrap the number input in Field to give it a visible label and a description.`,examples:[{id:`number-input/field`,caption:`Click Tickets to focus the input, then type or step its value. Screen readers read the description with the field.`,Example:y,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Tickets</FieldLabel>
      <NumberInput defaultValue={2} min={1}>
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Decrease">
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <NumberInputControl />
          <NumberInputIncrement aria-label="Increase">
            <PlusIcon aria-hidden="true" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
      <FieldDescription>
        Each ticket admits one person to the workshop.
      </FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Min and Max`,text:"Use `min` and `max` to set bounds. A step button disables at its bound. Typed values outside the bounds are clamped when committed.",examples:[{id:`number-input/min-max`,caption:`Change Guests between 1 and 8. Type 20 and press Enter to clamp it to 8. At either bound, that direction's step button is disabled.`,Example:b,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Guests</FieldLabel>
      <NumberInput defaultValue={2} min={1} max={8}>
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Decrease">
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <NumberInputControl />
          <NumberInputIncrement aria-label="Increase">
            <PlusIcon aria-hidden="true" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
      <FieldDescription>Tables seat between 1 and 8 guests.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Step and Large Step`,text:"`step` sets the usual increment, and defaults to 1. Steps are measured from `min`, or from zero when no minimum is set. When they don't land on `max`, End and the increment button stop at the highest step below it, so stepping keeps the value on the step grid, as Slider does. Shift, Page Up and Page Down use `largeStep`, ten steps by default, and Alt (Option) with an arrow key uses `smallStep`, a tenth of a step. Keyboard lists every key.",examples:[{id:`number-input/step`,caption:`Step Hours by 0.25. Hold Shift to move by 1, or hold Alt (Option) with an arrow key to move by 0.05. Home and End go to 0 and 24.`,Example:x,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Hours</FieldLabel>
      <NumberInput
        defaultValue={1.5}
        min={0}
        max={24}
        step={0.25}
        largeStep={1}
        smallStep={0.05}
      >
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Decrease">
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <NumberInputControl />
          <NumberInputIncrement aria-label="Increase">
            <PlusIcon aria-hidden="true" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
      <FieldDescription>Logged in quarter hours.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Format`,text:"Pass `Intl.NumberFormat` options through `format`. The input displays and parses that format while keeping a numeric value. For percentages, `0.15` is displayed as `15%`, and `step` defaults to the smallest percent the format shows: `0.01` for whole percents, `0.0001` with two fraction digits.",examples:[{id:`number-input/format`,caption:`Edit Price, Discount, or Weight and leave the field to format it. Try entering 5 in Price or 25% in Discount, then use the step buttons.`,Example:C,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputControl,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

const fields = [
  {
    label: "Price",
    defaultValue: 19.99,
    step: 0.01,
    format: { style: "currency", currency: "USD" },
  },
  {
    label: "Discount",
    defaultValue: 0.15,
    step: 0.01,
    format: { style: "percent" },
  },
  {
    label: "Weight",
    defaultValue: 2.5,
    step: 0.1,
    format: { style: "unit", unit: "kilogram" },
  },
] satisfies {
  label: string
  defaultValue: number
  step: number
  format: Intl.NumberFormatOptions
}[]

function Example() {
  return (
    <div data-slot="stack">
      {fields.map(({ label, ...options }) => (
        <Field key={label}>
          <FieldLabel>{label}</FieldLabel>
          <NumberInput {...options} min={0}>
            <NumberInputGroup>
              <NumberInputDecrement aria-label="Decrease">
                <MinusIcon aria-hidden="true" />
              </NumberInputDecrement>
              <NumberInputControl />
              <NumberInputIncrement aria-label="Increase">
                <PlusIcon aria-hidden="true" />
              </NumberInputIncrement>
            </NumberInputGroup>
          </NumberInput>
        </Field>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Locale`,text:"Set `locale` to choose separators, currency symbols, and grouping. Without it, the input follows the page's language or the browser's language after mounting. Server markup uses English when no locale is provided; set a locale explicitly when that first render matters.",examples:[{id:`number-input/locale`,caption:`Edit Preis using a comma for decimals, or step Budget to see Indian digit grouping. The displayed and accepted formats follow each field's locale.`,Example:T,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputControl,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

const fields = [
  {
    label: "Preis",
    locale: "de-DE",
    defaultValue: 1234.5,
    step: 0.01,
    format: { style: "currency", currency: "EUR" },
  },
  {
    label: "Budget",
    locale: "en-IN",
    defaultValue: 1234567,
    step: 1000,
    format: { style: "currency", currency: "INR", maximumFractionDigits: 0 },
  },
] satisfies {
  label: string
  locale: string
  defaultValue: number
  step: number
  format: Intl.NumberFormatOptions
}[]

function Example() {
  return (
    <div data-slot="stack">
      {fields.map(({ label, ...options }) => (
        <Field key={label}>
          <FieldLabel>{label}</FieldLabel>
          <NumberInput {...options} min={0}>
            <NumberInputGroup>
              <NumberInputDecrement aria-label="Decrease">
                <MinusIcon aria-hidden="true" />
              </NumberInputDecrement>
              <NumberInputControl />
              <NumberInputIncrement aria-label="Increase">
                <PlusIcon aria-hidden="true" />
              </NumberInputIncrement>
            </NumberInputGroup>
          </NumberInput>
          <FieldDescription>Formatted for {options.locale}.</FieldDescription>
        </Field>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Mouse Wheel`,text:"Set `wheel` to step with the mouse wheel while the input is focused. It is off by default.",examples:[{id:`number-input/wheel`,caption:`Focus Font size and scroll over it to change the value. Move focus away and scroll again; the value stays unchanged.`,Example:E,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Font size</FieldLabel>
      <NumberInput defaultValue={16} min={8} max={72} wheel>
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Decrease">
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <NumberInputControl />
          <NumberInputIncrement aria-label="Increase">
            <PlusIcon aria-hidden="true" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
      <FieldDescription>Focus the input, then scroll over it.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Scrub Area`,text:"`NumberInputScrubArea` changes the value while you drag it. The handle can be any element inside the number input: the label, as in the first example, or a letter or icon inside the group, as in a design tool. Right and up increase the value. `orientation` chooses an axis, and `pixelsPerStep` controls how far the pointer moves per step. Shift and Alt (Option) use the large and small increments.",examples:[{id:`number-input/scrub`,caption:`Drag the X, Y, W or H letter sideways to change that value. Hold Shift for larger steps or Alt (Option) for smaller ones. The console logs each value when the drag ends.`,Example:O,source:`"use client"

import {
  NumberInput,
  NumberInputControl,
  NumberInputGroup,
  NumberInputScrubArea,
  NumberInputScrubAreaCursor,
} from "@ui-sdk/react/number-input"
import { MoveHorizontalIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const fields = [
  { label: "X position", handle: "X", defaultValue: 120 },
  { label: "Y position", handle: "Y", defaultValue: 48 },
  { label: "Width", handle: "W", defaultValue: 320, min: 0 },
  { label: "Height", handle: "H", defaultValue: 240, min: 0 },
]

function Example() {
  const log = useLog()
  const title = React.useId()

  return (
    <div data-slot="card" role="group" aria-labelledby={title}>
      <h3 id={title}>Frame</h3>
      <div data-slot="grid">
        {fields.map(({ label, handle, ...options }) => (
          <NumberInput
            key={label}
            {...options}
            onValueCommit={(value) => log(\`\${label} \${value ?? "empty"}\`)}
          >
            <NumberInputGroup>
              <NumberInputScrubArea pixelsPerStep={1}>
                <span aria-hidden="true">{handle}</span>
                <NumberInputScrubAreaCursor>
                  <MoveHorizontalIcon aria-hidden="true" />
                </NumberInputScrubAreaCursor>
              </NumberInputScrubArea>
              <NumberInputControl aria-label={label} />
            </NumberInputGroup>
          </NumberInput>
        ))}
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. `onValueChange` reports valid changes while an interaction is in progress. `onValueCommit` runs when typing is committed, a step key or button is released, or a scrub ends. Use the commit event for work that should happen after the interaction.",examples:[{id:`number-input/controlled`,caption:`Hold a Servings step button. The console logs each value as it changes, then one Committed line when you let go. Clear sets the value to null, and Reset to 4 restores it.`,Example:k,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<number | null>(4)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setValue(4)}>
          Reset to 4
        </button>
        <button type="button" onClick={() => setValue(null)}>
          Clear
        </button>
      </div>
      <Field>
        <FieldLabel>Servings</FieldLabel>
        <NumberInput
          value={value}
          onValueChange={(next, details) => {
            setValue(next)
            log(\`Value \${next ?? "empty"} (\${details.reason})\`)
          }}
          onValueCommit={(next, details) =>
            log(\`Committed \${next ?? "empty"} (\${details.reason})\`)
          }
          min={1}
          max={12}
        >
          <NumberInputGroup>
            <NumberInputDecrement aria-label="Decrease">
              <MinusIcon aria-hidden="true" />
            </NumberInputDecrement>
            <NumberInputControl />
            <NumberInputIncrement aria-label="Increase">
              <PlusIcon aria-hidden="true" />
            </NumberInputIncrement>
          </NumberInputGroup>
        </NumberInput>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"Create a `createNumberInputController()` and pass it as `controller` to change or focus the input from other controls. `increment()` and `decrement()` step the value; pass `{ large: true }` for a large step. `setValue()`, `getValue()`, and `focus()` cover direct updates and inspection.",examples:[{id:`number-input/controller`,caption:`Press Zoom In and Zoom Out to move by 100%, then Actual Size to restore 100%. Read logs the current value, and Focus moves into the field.`,Example:A,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createNumberInputController,
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [zoom] = React.useState(createNumberInputController)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => zoom.decrement({ large: true })}>
          Zoom Out
        </button>
        <button type="button" onClick={() => zoom.increment({ large: true })}>
          Zoom In
        </button>
        <button type="button" onClick={() => zoom.setValue(100)}>
          Actual Size
        </button>
        <button
          type="button"
          onClick={() => log(\`Zoom is \${zoom.getValue()}%\`)}
        >
          Read
        </button>
        <button type="button" onClick={() => zoom.focus()}>
          Focus
        </button>
      </div>
      <Field>
        <FieldLabel>Zoom</FieldLabel>
        <NumberInput
          defaultValue={100}
          min={10}
          max={400}
          step={10}
          format={{ style: "unit", unit: "percent" }}
          controller={zoom}
          onValueChange={(value, details) =>
            log(\`Zoom \${value ?? "empty"}% (\${details.reason})\`)
          }
        >
          <NumberInputGroup>
            <NumberInputDecrement aria-label="Decrease">
              <MinusIcon aria-hidden="true" />
            </NumberInputDecrement>
            <NumberInputControl />
            <NumberInputIncrement aria-label="Increase">
              <PlusIcon aria-hidden="true" />
            </NumberInputIncrement>
          </NumberInputGroup>
        </NumberInput>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Form`,text:"A hidden input submits the plain numeric value under `name`. Formatting does not change form data: a displayed amount of $4.50 still submits `4.5`. Empty values submit an empty string.",examples:[{id:`number-input/form`,caption:`Change Quantity or Tip and press Save: the console logs the plain numeric values. Gift cards belongs to the same form through its form ID. Reset restores the defaults.`,Example:j,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const form = React.useId()

  return (
    <div data-slot="stack">
      <form
        data-slot="stack"
        id={form}
        onSubmit={(event) => {
          event.preventDefault()
          const data = [...new FormData(event.currentTarget)].map(
            ([name, value]) => \`\${name}=\${value}\`
          )
          log(\`Submitted \${data.join(", ")}\`)
        }}
      >
        <Field>
          <FieldLabel>Quantity</FieldLabel>
          <NumberInput name="quantity" defaultValue={2} min={1}>
            <NumberInputGroup>
              <NumberInputDecrement aria-label="Decrease">
                <MinusIcon aria-hidden="true" />
              </NumberInputDecrement>
              <NumberInputControl />
              <NumberInputIncrement aria-label="Increase">
                <PlusIcon aria-hidden="true" />
              </NumberInputIncrement>
            </NumberInputGroup>
          </NumberInput>
        </Field>
        <Field>
          <FieldLabel>Tip</FieldLabel>
          <NumberInput
            name="tip"
            defaultValue={4.5}
            min={0}
            step={0.5}
            format={{ style: "currency", currency: "USD" }}
          >
            <NumberInputGroup>
              <NumberInputDecrement aria-label="Decrease">
                <MinusIcon aria-hidden="true" />
              </NumberInputDecrement>
              <NumberInputControl />
              <NumberInputIncrement aria-label="Increase">
                <PlusIcon aria-hidden="true" />
              </NumberInputIncrement>
            </NumberInputGroup>
          </NumberInput>
        </Field>
      </form>
      <Field>
        <FieldLabel>Gift cards</FieldLabel>
        <NumberInput name="gift-cards" form={form} defaultValue={0} min={0}>
          <NumberInputGroup>
            <NumberInputDecrement aria-label="Decrease">
              <MinusIcon aria-hidden="true" />
            </NumberInputDecrement>
            <NumberInputControl />
            <NumberInputIncrement aria-label="Increase">
              <PlusIcon aria-hidden="true" />
            </NumberInputIncrement>
          </NumberInputGroup>
        </NumberInput>
      </Field>
      <div data-slot="row">
        <button type="reset" form={form}>
          Reset
        </button>
        <button type="submit" form={form} data-variant="solid">
          Save
        </button>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:`Use render functions to change a part's element or read its state. Here the decrement button adds a tooltip, and the increment button shows Max once the value reaches its bound.`,examples:[{id:`number-input/render`,caption:`Press End in Temperature to jump to 40°C. The increment button reads Max; hover the decrement button to see its tooltip.`,Example:M,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Temperature</FieldLabel>
      <NumberInput
        defaultValue={-2}
        min={-20}
        max={40}
        format={{ style: "unit", unit: "celsius" }}
      >
        <NumberInputGroup>
          <NumberInputDecrement
            aria-label="Colder"
            render={(props, state) => (
              <button
                {...props}
                title={state.atBound ? "As cold as it goes" : "Colder"}
              />
            )}
          >
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <NumberInputControl />
          <NumberInputIncrement aria-label="Warmer">
            {(state) =>
              state.atBound ? <span>Max</span> : <PlusIcon aria-hidden="true" />
            }
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`number-input/buttons`,caption:``,Example:N,source:`"use client"

import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <NumberInput defaultValue={1} min={0}>
      <NumberInputGroup>
        <NumberInputDecrement aria-label="Decrease">
          <MinusIcon aria-hidden="true" />
        </NumberInputDecrement>
        <NumberInputControl aria-label="Quantity" />
        <NumberInputIncrement aria-label="Increase">
          <PlusIcon aria-hidden="true" />
        </NumberInputIncrement>
      </NumberInputGroup>
    </NumberInput>
  )
}

export { Example }
`},{id:`number-input/rtl`,caption:``,Example:P,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputControl,
} from "@ui-sdk/react/number-input"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <div dir="rtl">
      <Field>
        <FieldLabel>الكمية</FieldLabel>
        <NumberInput defaultValue={1} min={0}>
          <NumberInputGroup>
            <NumberInputDecrement aria-label="إنقاص">
              <MinusIcon aria-hidden="true" />
            </NumberInputDecrement>
            <NumberInputControl />
            <NumberInputIncrement aria-label="زيادة">
              <PlusIcon aria-hidden="true" />
            </NumberInputIncrement>
          </NumberInputGroup>
        </NumberInput>
      </Field>
    </div>
  )
}

export { Example }
`}]}]};export{F as default};