import{useLog as e}from"./log.js";import*as t from"preact/compat";import{jsx as n,jsxs as r}from"preact/compat/jsx-runtime";import{Progress as i,ProgressIndicator as a,ProgressLabel as o,ProgressTrack as s,ProgressValue as c}from"ui-sdk/progress.js";function l(){return/* @__PURE__ */ r(i,{value:60,children:[/* @__PURE__ */ n(o,{children:`Exporting video`}),/* @__PURE__ */ n(c,{}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]})}function u(){return/* @__PURE__ */ r(i,{value:null,children:[/* @__PURE__ */ n(o,{children:`Connecting to server`}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]})}function d(){let l=e(),[u,d]=t.useState(1);function f(){u>=5||(d(u+1),l(`Uploaded ${u+1} of 5 photos`))}function p(){d(0),l(`Reset to 0 photos`)}return/* @__PURE__ */ r(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ n(`button`,{type:`button`,"aria-disabled":u>=5,onClick:f,children:`Upload Next`}),/* @__PURE__ */ n(`button`,{type:`button`,onClick:p,children:`Reset`})]}),/* @__PURE__ */ r(i,{value:u/5*100,children:[/* @__PURE__ */ n(o,{children:`Uploading photos`}),/* @__PURE__ */ n(c,{}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]})]})}function f(){return/* @__PURE__ */ r(i,{value:3,min:1,max:5,children:[/* @__PURE__ */ n(o,{children:`Account setup, step 3 of 5`}),/* @__PURE__ */ n(c,{}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]})}const p=[{label:`Download`,value:120,max:250,format:{style:`unit`,unit:`gigabyte`}},{label:`Video render`,value:87.25,format:{style:`percent`,maximumFractionDigits:1}},{label:`Backup`,value:45,max:60,format:e=>`${60-e} min left`},{label:`Synchronisierung`,value:40,locale:`de-DE`}];function m(){return/* @__PURE__ */ n(`div`,{"data-slot":`stack`,children:p.map(({label:e,...t})=>/* @__PURE__ */ r(i,{...t,children:[/* @__PURE__ */ n(o,{children:e}),/* @__PURE__ */ n(c,{}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]},e))})}function h(){return/* @__PURE__ */ r(i,{value:3,max:12,getValueLabel:(e,t)=>`${e} of ${t.max} files, ${t.formatted}`,children:[/* @__PURE__ */ n(o,{children:`Copying files`}),/* @__PURE__ */ n(c,{children:`3 of 12`}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]})}function g(){return/* @__PURE__ */ r(i,{value:56,children:[/* @__PURE__ */ n(o,{children:`Upload progress`}),/* @__PURE__ */ n(c,{}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]})}function _(){return/* @__PURE__ */ r(i,{value:18,children:[/* @__PURE__ */ n(o,{children:`Battery`}),/* @__PURE__ */ n(c,{children:e=>e.status===`complete`?`Charged`:`${e.text} charged`}),/* @__PURE__ */ n(s,{render:/* @__PURE__ */ n(`span`,{}),children:/* @__PURE__ */ n(a,{render:(e,t)=>/* @__PURE__ */ n(`div`,{...e,"data-variant":(t.percent??0)<20?`destructive`:void 0})})})]})}function v(){return/* @__PURE__ */ n(`div`,{dir:`rtl`,children:/* @__PURE__ */ r(i,{value:56,locale:`ar-EG`,children:[/* @__PURE__ */ n(o,{children:`تقدم الرفع`}),/* @__PURE__ */ n(c,{}),/* @__PURE__ */ n(s,{children:/* @__PURE__ */ n(a,{})})]})})}var y={name:`progress`,title:`Progress`,description:`Show a task’s progress, or an indeterminate state while its progress is unknown.`,sections:[{heading:null,text:``,examples:[{id:`progress/basic`,caption:`Read the export bar. Its label and 60% value are available both visually and to a screen reader.`,Example:l,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"

function Example() {
  return (
    <Progress value={60}>
      <ProgressLabel>Exporting video</ProgressLabel>
      <ProgressValue />
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  )
}

export { Example }
`}]},{heading:`Indeterminate`,text:"Leave out `value` when you do not know how much work is complete. Every part gets `data-indeterminate`, and the root has no `aria-valuenow`.",examples:[{id:`progress/indeterminate`,caption:`Read the Connecting to server bar. It shows an ongoing task without announcing a percentage.`,Example:u,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
} from "@ui-sdk/react/progress"

function Example() {
  return (
    <Progress value={null}>
      <ProgressLabel>Connecting to server</ProgressLabel>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  )
}

export { Example }
`}]},{heading:`Changing the Value`,text:"Pass the latest `value` as your task progresses. The parts get `data-progressing` while the value is below `max`, and `data-complete` when it reaches the end.",examples:[{id:`progress/controlled`,caption:`Click Upload Next to add one photo, or 20%, and watch the console count them. At 100%, the button stops advancing the bar. Click Reset to start at 0%.`,Example:d,source:`"use client"

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const total = 5

function Example() {
  const log = useLog()
  const [uploaded, setUploaded] = React.useState(1)

  function uploadNext() {
    if (uploaded >= total) {
      return
    }
    setUploaded(uploaded + 1)
    log(\`Uploaded \${uploaded + 1} of \${total} photos\`)
  }

  function reset() {
    setUploaded(0)
    log("Reset to 0 photos")
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          aria-disabled={uploaded >= total}
          onClick={uploadNext}
        >
          Upload Next
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
      <Progress value={(uploaded / total) * 100}>
        <ProgressLabel>Uploading photos</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  )
}

export { Example }
`}]},{heading:`Bounds`,text:"`min` and `max` default to 0 and 100. A value outside that range is clamped for the fill, the percentage and `aria-valuenow`, but the state's `value` and a format other than percent keep it as you passed it. A value of 3 between 1 and 5 fills half the track.",examples:[{id:`progress/min-max`,caption:`Compare step 3 of 5 with the fill. Because the range starts at 1, the value is halfway through the range.`,Example:f,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"

function Example() {
  return (
    <Progress value={3} min={1} max={5}>
      <ProgressLabel>Account setup, step 3 of 5</ProgressLabel>
      <ProgressValue />
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  )
}

export { Example }
`}]},{heading:`Format and Locale`,text:"Pass `Intl.NumberFormat` options to `format` for units or decimal places. A function can return custom text, such as the time remaining.",examples:[{id:`progress/format`,caption:`Compare the progress readings. They show downloaded data, a precise percentage, time remaining, and a localized percentage.`,Example:m,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"

const bars = [
  {
    label: "Download",
    value: 120,
    max: 250,
    format: { style: "unit", unit: "gigabyte" },
  },
  {
    label: "Video render",
    value: 87.25,
    format: { style: "percent", maximumFractionDigits: 1 },
  },
  {
    label: "Backup",
    value: 45,
    max: 60,
    format: (minutes: number) => \`\${60 - minutes} min left\`,
  },
  { label: "Synchronisierung", value: 40, locale: "de-DE" },
] satisfies {
  label: string
  value: number
  max?: number
  format?: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

function Example() {
  return (
    <div data-slot="stack">
      {bars.map(({ label, ...options }) => (
        <Progress key={label} {...options}>
          <ProgressLabel>{label}</ProgressLabel>
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Value Label`,text:"Use `getValueLabel` to give screen readers more context than the visible number. Its details include `formatted`, `percent`, `min`, and `max`. Handle a `null` value when the task can be indeterminate; `percent` is also `null` and `formatted` is empty then.",examples:[{id:`progress/value-label`,caption:`Read Copying files with a screen reader. It announces 3 of 12 files and 25%, while the visible value stays compact.`,Example:h,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"

function Example() {
  return (
    <Progress
      value={3}
      max={12}
      getValueLabel={(value, details) =>
        \`\${value} of \${details.max} files, \${details.formatted}\`
      }
    >
      <ProgressLabel>Copying files</ProgressLabel>
      <ProgressValue>3 of 12</ProgressValue>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`progress/label`,caption:``,Example:g,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"

function Example() {
  return (
    <Progress value={56}>
      <ProgressLabel>Upload progress</ProgressLabel>
      <ProgressValue />
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  )
}

export { Example }
`},{id:`progress/render`,caption:``,Example:_,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"

function Example() {
  return (
    <Progress value={18}>
      <ProgressLabel>Battery</ProgressLabel>
      <ProgressValue>
        {(state) =>
          state.status === "complete" ? "Charged" : \`\${state.text} charged\`
        }
      </ProgressValue>
      <ProgressTrack render={<span />}>
        <ProgressIndicator
          render={(props, state) => (
            <div
              {...props}
              data-variant={
                (state.percent ?? 0) < 20 ? "destructive" : undefined
              }
            />
          )}
        />
      </ProgressTrack>
    </Progress>
  )
}

export { Example }
`},{id:`progress/rtl`,caption:``,Example:v,source:`import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress"

function Example() {
  return (
    <div dir="rtl">
      <Progress value={56} locale="ar-EG">
        <ProgressLabel>تقدم الرفع</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  )
}

export { Example }
`}]}]};export{y as default};