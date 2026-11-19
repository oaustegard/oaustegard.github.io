import{n as e,t}from"../chunks/c-h-FXBeva.js";var n={name:`time-input`,title:`Time Input`,description:`Type a time one part at a time, on the clock your user's language uses.`,sections:[{heading:null,text:`Use a Time Input for a time of day, like a meeting or an opening hour. It works like Date Input, with segments for the hour, the minute and, on a 12-hour clock, AM or PM.`,examples:[{id:`date-input/time`,caption:`Click the hour and type 230, then P. Press ArrowUp or ArrowDown on a part to step it.`,Example:t,source:`"use client"

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
`}]},{heading:`Clock and Seconds`,text:'The input shows the locale\'s clock. Set `hourCycle` to `12` or `24` to choose one, and `granularity` to `"second"` to add seconds, or `"hour"` to show the hour alone.',examples:[{id:`date-input/hour-cycle`,caption:`The same evening time on a 12-hour clock, a 24-hour clock and with seconds. All three submit 24-hour values.`,Example:e,source:`"use client"

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
`}]}]};export{n as default};