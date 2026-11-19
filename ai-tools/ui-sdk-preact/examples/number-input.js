import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-BHtAohdq.js";import{t as n}from"../chunks/c-CKwygB1M.js";import{useLog as r}from"./log.js";import*as i from"preact/compat";import{jsx as a,jsxs as o}from"preact/compat/jsx-runtime";import{Field as s,FieldDescription as c,FieldLabel as l}from"ui-sdk/field.js";import{NumberInput as u,NumberInputControl as d,NumberInputDecrement as f,NumberInputGroup as p,NumberInputIncrement as m,NumberInputScrubArea as h,NumberInputScrubAreaCursor as g,createNumberInputController as _}from"ui-sdk/number-input.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const v={name:`move-horizontal`,size:24,node:[[`path`,{d:`m18 8 4 4-4 4`,key:`1ak13k`}],[`path`,{d:`M2 12h20`,key:`9i4pu4`}],[`path`,{d:`m6 8-4 4 4 4`,key:`15zrgr`}]]};v.node;const y=e(v);function b(){let e=r();return/* @__PURE__ */ a(s,{children:/* @__PURE__ */ o(u,{defaultValue:1,min:1,onValueCommit:t=>e(`Quantity ${t??`empty`}`),children:[/* @__PURE__ */ o(h,{pixelsPerStep:4,children:[/* @__PURE__ */ a(l,{children:`Quantity`}),/* @__PURE__ */ a(g,{children:/* @__PURE__ */ a(y,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})]})})}function x(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Tickets`}),/* @__PURE__ */ a(u,{defaultValue:2,min:1,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ a(c,{children:`Each ticket admits one person to the workshop.`})]})}function S(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Guests`}),/* @__PURE__ */ a(u,{defaultValue:2,min:1,max:8,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ a(c,{children:`Tables seat between 1 and 8 guests.`})]})}function C(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Hours`}),/* @__PURE__ */ a(u,{defaultValue:1.5,min:0,max:24,step:.25,largeStep:1,smallStep:.05,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ a(c,{children:`Logged in quarter hours.`})]})}const w=[{label:`Price`,defaultValue:19.99,step:.01,format:{style:`currency`,currency:`USD`}},{label:`Discount`,defaultValue:.15,step:.01,format:{style:`percent`}},{label:`Weight`,defaultValue:2.5,step:.1,format:{style:`unit`,unit:`kilogram`}}];function T(){return/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:w.map(({label:e,...r})=>/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:e}),/* @__PURE__ */ a(u,{...r,min:0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]},e))})}const E=[{label:`Preis`,locale:`de-DE`,defaultValue:1234.5,step:.01,format:{style:`currency`,currency:`EUR`}},{label:`Budget`,locale:`en-IN`,defaultValue:1234567,step:1e3,format:{style:`currency`,currency:`INR`,maximumFractionDigits:0}}];function D(){return/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:E.map(({label:e,...r})=>/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:e}),/* @__PURE__ */ a(u,{...r,min:0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ o(c,{children:[`Formatted for `,r.locale,`.`]})]},e))})}function O(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Font size`}),/* @__PURE__ */ a(u,{defaultValue:16,min:8,max:72,wheel:!0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ a(c,{children:`Focus the input, then scroll over it.`})]})}const k=[{label:`X position`,handle:`X`,defaultValue:120},{label:`Y position`,handle:`Y`,defaultValue:48},{label:`Width`,handle:`W`,defaultValue:320,min:0},{label:`Height`,handle:`H`,defaultValue:240,min:0}];function A(){let e=r(),t=i.useId();return/* @__PURE__ */ o(`div`,{"data-slot":`card`,role:`group`,"aria-labelledby":t,children:[/* @__PURE__ */ a(`h3`,{id:t,children:`Frame`}),/* @__PURE__ */ a(`div`,{"data-slot":`grid`,children:k.map(({label:t,handle:n,...r})=>/* @__PURE__ */ a(u,{...r,onValueCommit:n=>e(`${t} ${n??`empty`}`),children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ o(h,{pixelsPerStep:1,children:[/* @__PURE__ */ a(`span`,{"aria-hidden":`true`,children:n}),/* @__PURE__ */ a(g,{children:/* @__PURE__ */ a(y,{"aria-hidden":`true`})})]}),/* @__PURE__ */ a(d,{"aria-label":t})]})},t))})]})}function j(){let e=r(),[c,h]=i.useState(4);return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>h(4),children:`Reset to 4`}),/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>h(null),children:`Clear`})]}),/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Servings`}),/* @__PURE__ */ a(u,{value:c,onValueChange:(t,n)=>{h(t),e(`Value ${t??`empty`} (${n.reason})`)},onValueCommit:(t,n)=>e(`Committed ${t??`empty`} (${n.reason})`),min:1,max:12,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]})]})}function M(){let e=r(),[c]=i.useState(_);return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>c.decrement({large:!0}),children:`Zoom Out`}),/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>c.increment({large:!0}),children:`Zoom In`}),/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>c.setValue(100),children:`Actual Size`}),/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>e(`Zoom is ${c.getValue()}%`),children:`Read`}),/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>c.focus(),children:`Focus`})]}),/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Zoom`}),/* @__PURE__ */ a(u,{defaultValue:100,min:10,max:400,step:10,format:{style:`unit`,unit:`percent`},controller:c,onValueChange:(t,n)=>e(`Zoom ${t??`empty`}% (${n.reason})`),children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]})]})}function N(){let e=r(),c=i.useId();return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(`form`,{"data-slot":`stack`,id:c,onSubmit:t=>{t.preventDefault();let n=[...new FormData(t.currentTarget)].map(([e,t])=>`${e}=${t}`);e(`Submitted ${n.join(`, `)}`)},children:[/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Quantity`}),/* @__PURE__ */ a(u,{name:`quantity`,defaultValue:2,min:1,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]}),/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Tip`}),/* @__PURE__ */ a(u,{name:`tip`,defaultValue:4.5,min:0,step:.5,format:{style:`currency`,currency:`USD`},children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]})]}),/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Gift cards`}),/* @__PURE__ */ a(u,{name:`gift-cards`,form:c,defaultValue:0,min:0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]}),/* @__PURE__ */ o(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ a(`button`,{type:`reset`,form:c,children:`Reset`}),/* @__PURE__ */ a(`button`,{type:`submit`,form:c,"data-variant":`solid`,children:`Save`})]})]})}function P(){return/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`Temperature`}),/* @__PURE__ */ a(u,{defaultValue:-2,min:-20,max:40,format:{style:`unit`,unit:`celsius`},children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Colder`,render:(e,t)=>/* @__PURE__ */ a(`button`,{...e,title:t.atBound?`As cold as it goes`:`Colder`}),children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`Warmer`,children:e=>e.atBound?/* @__PURE__ */ a(`span`,{children:`Max`}):/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]})}function F(){return/* @__PURE__ */ a(u,{defaultValue:1,min:0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`Decrease`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{"aria-label":`Quantity`}),/* @__PURE__ */ a(m,{"aria-label":`Increase`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})}function I(){return/* @__PURE__ */ a(`div`,{dir:`rtl`,children:/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(l,{children:`الكمية`}),/* @__PURE__ */ a(u,{defaultValue:1,min:0,children:/* @__PURE__ */ o(p,{children:[/* @__PURE__ */ a(f,{"aria-label":`إنقاص`,children:/* @__PURE__ */ a(t,{"aria-hidden":`true`})}),/* @__PURE__ */ a(d,{}),/* @__PURE__ */ a(m,{"aria-label":`زيادة`,children:/* @__PURE__ */ a(n,{"aria-hidden":`true`})})]})})]})})}var L={name:`number-input`,title:`Number Input`,description:`Enter numbers, step through values, and format them for a locale.`,sections:[{heading:null,text:`Use a Number Input for quantities, prices and measurements. It keeps a numeric value while showing formatted text, and steps it with the keyboard, the step buttons, or a drag on its label.`,examples:[{id:`number-input/basic`,caption:`Drag the Quantity label sideways to scrub the value, or click it to focus the input. Type a number, press ArrowUp or ArrowDown, or hold a step button. The console logs the value once each change is committed.`,Example:b,source:`"use client"

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
`}]},{heading:`Field`,text:`Wrap the number input in Field to give it a visible label and a description.`,examples:[{id:`number-input/field`,caption:`Click Tickets to focus the input, then type or step its value. Screen readers read the description with the field.`,Example:x,source:`"use client"

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
`}]},{heading:`Min and Max`,text:"Use `min` and `max` to set bounds. A step button disables at its bound. Typed values outside the bounds are clamped when committed.",examples:[{id:`number-input/min-max`,caption:`Change Guests between 1 and 8. Type 20 and press Enter to clamp it to 8. At either bound, that direction's step button is disabled.`,Example:S,source:`"use client"

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
`}]},{heading:`Step and Large Step`,text:"`step` sets the usual increment, and defaults to 1. Steps are measured from `min`, or from zero when no minimum is set. When they don't land on `max`, End and the increment button stop at the highest step below it, so stepping keeps the value on the step grid, as Slider does. Shift, Page Up and Page Down use `largeStep`, ten steps by default, and Alt (Option) with an arrow key uses `smallStep`, a tenth of a step. Keyboard lists every key.",examples:[{id:`number-input/step`,caption:`Step Hours by 0.25. Hold Shift to move by 1, or hold Alt (Option) with an arrow key to move by 0.05. Home and End go to 0 and 24.`,Example:C,source:`"use client"

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
`}]},{heading:`Format`,text:"Pass `Intl.NumberFormat` options through `format`. The input displays and parses that format while keeping a numeric value. For percentages, `0.15` is displayed as `15%`, and `step` defaults to the smallest percent the format shows: `0.01` for whole percents, `0.0001` with two fraction digits.",examples:[{id:`number-input/format`,caption:`Edit Price, Discount, or Weight and leave the field to format it. Try entering 5 in Price or 25% in Discount, then use the step buttons.`,Example:T,source:`"use client"

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
`}]},{heading:`Locale`,text:"Set `locale` to choose separators, currency symbols, and grouping. Without it, the input follows the page's language or the browser's language after mounting. Server markup uses English when no locale is provided; set a locale explicitly when that first render matters.",examples:[{id:`number-input/locale`,caption:`Edit Preis using a comma for decimals, or step Budget to see Indian digit grouping. The displayed and accepted formats follow each field's locale.`,Example:D,source:`"use client"

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
`}]},{heading:`Mouse Wheel`,text:"Set `wheel` to step with the mouse wheel while the input is focused. It is off by default.",examples:[{id:`number-input/wheel`,caption:`Focus Font size and scroll over it to change the value. Move focus away and scroll again; the value stays unchanged.`,Example:O,source:`"use client"

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
`}]},{heading:`Scrub Area`,text:"`NumberInputScrubArea` changes the value while you drag it. The handle can be any element inside the number input: the label, as in the first example, or a letter or icon inside the group, as in a design tool. Right and up increase the value. `orientation` chooses an axis, and `pixelsPerStep` controls how far the pointer moves per step. Shift and Alt (Option) use the large and small increments.",examples:[{id:`number-input/scrub`,caption:`Drag the X, Y, W or H letter sideways to change that value. Hold Shift for larger steps or Alt (Option) for smaller ones. The console logs each value when the drag ends.`,Example:A,source:`"use client"

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
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. `onValueChange` reports valid changes while an interaction is in progress. `onValueCommit` runs when typing is committed, a step key or button is released, or a scrub ends. Use the commit event for work that should happen after the interaction.",examples:[{id:`number-input/controlled`,caption:`Hold a Servings step button. The console logs each value as it changes, then one Committed line when you let go. Clear sets the value to null, and Reset to 4 restores it.`,Example:j,source:`"use client"

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
`}]},{heading:`Controller`,text:"Create a `createNumberInputController()` and pass it as `controller` to change or focus the input from other controls. `increment()` and `decrement()` step the value; pass `{ large: true }` for a large step. `setValue()`, `getValue()`, and `focus()` cover direct updates and inspection.",examples:[{id:`number-input/controller`,caption:`Press Zoom In and Zoom Out to move by 100%, then Actual Size to restore 100%. Read logs the current value, and Focus moves into the field.`,Example:M,source:`"use client"

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
`}]},{heading:`Form`,text:"A hidden input submits the plain numeric value under `name`. Formatting does not change form data: a displayed amount of $4.50 still submits `4.5`. Empty values submit an empty string.",examples:[{id:`number-input/form`,caption:`Change Quantity or Tip and press Save: the console logs the plain numeric values. Gift cards belongs to the same form through its form ID. Reset restores the defaults.`,Example:N,source:`"use client"

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
`}]},{heading:`Custom Rendering`,text:`Use render functions to change a part's element or read its state. Here the decrement button adds a tooltip, and the increment button shows Max once the value reaches its bound.`,examples:[{id:`number-input/render`,caption:`Press End in Temperature to jump to 40°C. The increment button reads Max; hover the decrement button to see its tooltip.`,Example:P,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`number-input/buttons`,caption:``,Example:F,source:`"use client"

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
`},{id:`number-input/rtl`,caption:``,Example:I,source:`"use client"

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
`}]}]};export{L as default};