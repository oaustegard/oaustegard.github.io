import{$t as e,Co as t,Eo as n,Mo as r,Oo as i,Qt as a,To as o,Xt as s,Zt as c,fl as l,tl as u}from"../chunks/c-CIXE4Nkk.js";import{n as d,t as f}from"../chunks/c-h-FXBeva.js";function p(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Start date`}),/* @__PURE__ */ u(c,{})]})}function m(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Birthday`}),/* @__PURE__ */ u(c,{name:`birthday`}),/* @__PURE__ */ u(o,{children:`We send a card on the day.`})]})}function h(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Departure`}),/* @__PURE__ */ u(c,{granularity:`minute`,defaultValue:`2026-11-02T14:30`})]})}function g(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Check-in`}),/* @__PURE__ */ u(c,{min:`2026-01-01`,max:`2026-12-31`,defaultValue:`2026-06-15`}),/* @__PURE__ */ u(o,{children:`Any day in 2026.`}),/* @__PURE__ */ u(n,{})]})}function _(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Delivery date`}),/* @__PURE__ */ u(c,{defaultValue:`2026-11-02`,unavailable:{weekday:[0,6]}}),/* @__PURE__ */ u(o,{children:`We deliver Monday to Friday.`}),/* @__PURE__ */ u(n,{})]})}function v(){return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Date (en-GB)`}),/* @__PURE__ */ u(c,{locale:`en-GB`,defaultValue:`2026-11-02`})]}),/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Datum (de-DE)`}),/* @__PURE__ */ u(c,{locale:`de-DE`,defaultValue:`2026-11-02`})]}),/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`日付 (ja-JP)`}),/* @__PURE__ */ u(c,{locale:`ja-JP`,defaultValue:`2026-11-02`})]})]})}function y(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Start date`}),/* @__PURE__ */ u(c,{defaultValue:`2026-11-02`,disabled:!0})]})}function b(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Signed on`}),/* @__PURE__ */ u(c,{defaultValue:`2026-11-02`,readOnly:!0})]})}function x(){let e=r();return/* @__PURE__ */ u(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault();let n=[...new FormData(t.currentTarget)].map(([e,t])=>`${e}=${t}`);e(`Submitted ${n.join(`, `)}`)},children:[/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Date`}),/* @__PURE__ */ u(c,{name:`date`,defaultValue:`2026-11-02`,required:!0}),/* @__PURE__ */ u(n,{})]}),/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Time`}),/* @__PURE__ */ u(s,{name:`time`,defaultValue:`09:30`,required:!0}),/* @__PURE__ */ u(n,{})]}),/* @__PURE__ */ u(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(`button`,{type:`reset`,children:`Reset`}),/* @__PURE__ */ u(`button`,{type:`submit`,"data-variant":`solid`,children:`Book`})]})]})}function S(){let e=r(),[n,a]=l(`2026-11-02`);return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>a(null),children:`Clear`})}),/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Due date`}),/* @__PURE__ */ u(c,{value:n,onValueChange:t=>{a(t),e(`Due date ${t??`empty`}`)}})]})]})}function C(){let[n]=l(e);return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>n.setValue(`2026-12-25`),children:`Christmas`}),/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>n.focus(`year`),children:`Edit Year`}),/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>n.clear(),children:`Clear`})]}),/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Publish on`}),/* @__PURE__ */ u(c,{controller:n})]})]})}function w(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(i,{children:`Start date`}),/* @__PURE__ */ u(c,{defaultValue:`2026-11-02`,children:({segments:e})=>e.map(e=>e.editable?/* @__PURE__ */ u(a,{segment:e},e.key):/* @__PURE__ */ u(a,{segment:e,children:`–`},e.key))})]})}var T={name:`date-input`,title:`Date Input`,description:`Type a date one part at a time, in the order your user's language writes it.`,sections:[{heading:null,text:`Use a Date Input for dates people know by heart, like a birthday or a booking date. Each part of the date is its own small input, ordered the way the locale writes it.`,examples:[{id:`date-input/basic`,caption:`Click the month and type 11042026. Each part moves to the next as it fills. Press ArrowUp or ArrowDown on a part to step it.`,Example:p,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Start date</FieldLabel>
      <DateInput />
    </Field>
  )
}

export { Example }
`}]},{heading:`Field`,text:`The Field's label names the group, and clicking it focuses the first segment. Its description is read with the input.`,examples:[{id:`date-input/field`,caption:`Click Birthday to focus the month, then type a date. Screen readers read the description with the input.`,Example:m,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Birthday</FieldLabel>
      <DateInput name="birthday" />
      <FieldDescription>We send a card on the day.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Date and Time`,text:'Set `granularity` to `"hour"`, `"minute"` or `"second"` to add the time. The value becomes a local date and time like `"2026-11-02T14:30"`. For a time alone, use Time Input.',examples:[{id:`date-input/date-time`,caption:`Tab through the date and time. Type a P or an A in the last segment to switch between AM and PM.`,Example:h,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Departure</FieldLabel>
      <DateInput granularity="minute" defaultValue="2026-11-02T14:30" />
    </Field>
  )
}

export { Example }
`}]},{heading:`Min and Max`,text:"`min` and `max` take ISO dates. A date outside them is invalid: the input sets `data-invalid`, and its form won't submit.",examples:[{id:`date-input/min-max`,caption:`Change the year of Check-in to 2027 to see it turn invalid, then back to 2026.`,Example:g,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Check-in</FieldLabel>
      <DateInput min="2026-01-01" max="2026-12-31" defaultValue="2026-06-15" />
      <FieldDescription>Any day in 2026.</FieldDescription>
      <FieldError />
    </Field>
  )
}

export { Example }
`}]},{heading:`Unavailable Dates`,text:'`unavailable` takes the same matchers as Calendar: ISO dates, `{ from, to }` ranges, weekdays like `{ weekday: [0, 6] }`, or a function. An unavailable date is invalid with the message "This date isn\'t available."',examples:[{id:`date-input/unavailable`,caption:`Step the day of Delivery date back from Monday the 2nd to Sunday the 1st. The input turns invalid until you pick a weekday again.`,Example:_,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Delivery date</FieldLabel>
      <DateInput defaultValue="2026-11-02" unavailable={{ weekday: [0, 6] }} />
      <FieldDescription>We deliver Monday to Friday.</FieldDescription>
      <FieldError />
    </Field>
  )
}

export { Example }
`}]},{heading:`Locale`,text:"The input reads its order, separators and clock from `locale`, or from the page's language when you leave it out. The digits are always 0 to 9, and the calendar is always the Gregorian one, so the value means the same date everywhere. On the server, the input renders in English until it reads the page's language; set `locale` when that first render matters.",examples:[{id:`date-input/locale`,caption:`The same date in British English, German and Japanese. Each orders its parts its own way.`,Example:v,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Date (en-GB)</FieldLabel>
        <DateInput locale="en-GB" defaultValue="2026-11-02" />
      </Field>
      <Field>
        <FieldLabel>Datum (de-DE)</FieldLabel>
        <DateInput locale="de-DE" defaultValue="2026-11-02" />
      </Field>
      <Field>
        <FieldLabel>日付 (ja-JP)</FieldLabel>
        <DateInput locale="ja-JP" defaultValue="2026-11-02" />
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` on the input, or on its Field or fieldset, to keep it from focus and from its form.",examples:[{id:`date-input/disabled`,caption:`Click Start date or press Tab to reach it. Focus skips it, and the date stays November 2, 2026.`,Example:y,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Start date</FieldLabel>
      <DateInput defaultValue="2026-11-02" disabled />
    </Field>
  )
}

export { Example }
`}]},{heading:`Read-Only`,text:"Set `readOnly` for a date people can focus, read and submit as it is.",examples:[{id:`date-input/read-only`,caption:`Focus Signed on and press ArrowUp or type a digit. The date stays the same.`,Example:b,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Signed on</FieldLabel>
      <DateInput defaultValue="2026-11-02" readOnly />
    </Field>
  )
}

export { Example }
`}]},{heading:`Form`,text:"A hidden input submits the ISO date under `name`. An empty or partly typed date submits an empty string. Set `required` to need a date before the form submits. Enter in a segment submits the form with what was typed.",examples:[{id:`date-input/form`,caption:`Clear the day of Date with Backspace and choose Book to see the form stop. Fill it in and choose Book: the console logs the values. Reset brings back the defaults.`,Example:x,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { TimeInput } from "@ui-sdk/react/time-input"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const data = [...new FormData(event.currentTarget)].map(
          ([name, value]) => \`\${name}=\${value}\`
        )
        log(\`Submitted \${data.join(", ")}\`)
      }}
    >
      <Field>
        <FieldLabel>Date</FieldLabel>
        <DateInput name="date" defaultValue="2026-11-02" required />
        <FieldError />
      </Field>
      <Field>
        <FieldLabel>Time</FieldLabel>
        <TimeInput name="time" defaultValue="09:30" required />
        <FieldError />
      </Field>
      <div data-slot="row">
        <button type="reset">Reset</button>
        <button type="submit" data-variant="solid">
          Book
        </button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. The callback runs with each whole date, and with `null` once any part of it is erased. A half-typed date already reads `null`, so setting the value to `null` leaves it as typed. Call `clear()` on a controller to empty every segment.",examples:[{id:`date-input/controlled`,caption:`Change Due date: the console logs each whole date. Clear sets the value to null.`,Example:S,source:`"use client"

import { DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<string | null>("2026-11-02")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setValue(null)}>
          Clear
        </button>
      </div>
      <Field>
        <FieldLabel>Due date</FieldLabel>
        <DateInput
          value={value}
          onValueChange={(next) => {
            setValue(next)
            log(\`Due date \${next ?? "empty"}\`)
          }}
        />
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Controller`,text:'Create a controller with `createDateInputController()` and pass it as `controller` to set, clear or focus the input from elsewhere. `focus("year")` focuses a segment by its unit.',examples:[{id:`date-input/controller`,caption:`Choose Christmas to set the date, Edit Year to focus the year, or Clear to empty it.`,Example:C,source:`"use client"

import { createDateInputController, DateInput } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import * as React from "react"

function Example() {
  const [publish] = React.useState(createDateInputController)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => publish.setValue("2026-12-25")}>
          Christmas
        </button>
        <button type="button" onClick={() => publish.focus("year")}>
          Edit Year
        </button>
        <button type="button" onClick={() => publish.clear()}>
          Clear
        </button>
      </div>
      <Field>
        <FieldLabel>Publish on</FieldLabel>
        <DateInput controller={publish} />
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Pass a function as `children` to render the segments yourself. It gets the input's state, whose `segments` list each segment in order, with the text between them. Render a `DateInputSegment` for each, and give the text between segments children of your own.",examples:[{id:`date-input/segments`,caption:`The segments here are separated by dashes in place of the locale's slashes. The order stays the locale's.`,Example:w,source:`"use client"

import { DateInput, DateInputSegment } from "@ui-sdk/react/date-input"
import { Field, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  return (
    <Field>
      <FieldLabel>Start date</FieldLabel>
      <DateInput defaultValue="2026-11-02">
        {({ segments }) =>
          segments.map((segment) =>
            segment.editable ? (
              <DateInputSegment key={segment.key} segment={segment} />
            ) : (
              <DateInputSegment key={segment.key} segment={segment}>
                –
              </DateInputSegment>
            )
          )
        }
      </DateInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`date-input/hour-cycle`,caption:``,Example:d,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { TimeInput } from "@ui-sdk/react/time-input"

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>12-hour clock</FieldLabel>
        <TimeInput hourCycle={12} defaultValue="18:45" />
      </Field>
      <Field>
        <FieldLabel>24-hour clock</FieldLabel>
        <TimeInput hourCycle={24} defaultValue="18:45" />
      </Field>
      <Field>
        <FieldLabel>With seconds</FieldLabel>
        <TimeInput
          granularity="second"
          hourCycle={24}
          defaultValue="18:45:30"
        />
      </Field>
    </div>
  )
}

export { Example }
`},{id:`date-input/time`,caption:``,Example:f,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { TimeInput } from "@ui-sdk/react/time-input"

function Example() {
  return (
    <Field>
      <FieldLabel>Meeting time</FieldLabel>
      <TimeInput defaultValue="09:30" />
    </Field>
  )
}

export { Example }
`}]}]};export{T as default};