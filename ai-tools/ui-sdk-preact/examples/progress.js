import{Mo as e,_ as t,fl as n,g as r,h as i,m as a,p as o,tl as s}from"../chunks/c-CIXE4Nkk.js";function c(){return/* @__PURE__ */ s(o,{value:60,children:[/* @__PURE__ */ s(i,{children:`Exporting video`}),/* @__PURE__ */ s(t,{}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]})}function l(){return/* @__PURE__ */ s(o,{value:null,children:[/* @__PURE__ */ s(i,{children:`Connecting to server`}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]})}function u(){let c=e(),[l,u]=n(1);function d(){l>=5||(u(l+1),c(`Uploaded ${l+1} of 5 photos`))}function f(){u(0),c(`Reset to 0 photos`)}return/* @__PURE__ */ s(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ s(`button`,{type:`button`,"aria-disabled":l>=5,onClick:d,children:`Upload Next`}),/* @__PURE__ */ s(`button`,{type:`button`,onClick:f,children:`Reset`})]}),/* @__PURE__ */ s(o,{value:l/5*100,children:[/* @__PURE__ */ s(i,{children:`Uploading photos`}),/* @__PURE__ */ s(t,{}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]})]})}function d(){return/* @__PURE__ */ s(o,{value:3,min:1,max:5,children:[/* @__PURE__ */ s(i,{children:`Account setup, step 3 of 5`}),/* @__PURE__ */ s(t,{}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]})}const f=[{label:`Download`,value:120,max:250,format:{style:`unit`,unit:`gigabyte`}},{label:`Video render`,value:87.25,format:{style:`percent`,maximumFractionDigits:1}},{label:`Backup`,value:45,max:60,format:e=>`${60-e} min left`},{label:`Synchronisierung`,value:40,locale:`de-DE`}];function p(){return/* @__PURE__ */ s(`div`,{"data-slot":`stack`,children:f.map(({label:e,...n})=>/* @__PURE__ */ s(o,{...n,children:[/* @__PURE__ */ s(i,{children:e}),/* @__PURE__ */ s(t,{}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]},e))})}function m(){return/* @__PURE__ */ s(o,{value:3,max:12,getValueLabel:(e,t)=>`${e} of ${t.max} files, ${t.formatted}`,children:[/* @__PURE__ */ s(i,{children:`Copying files`}),/* @__PURE__ */ s(t,{children:`3 of 12`}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]})}function h(){return/* @__PURE__ */ s(o,{value:56,children:[/* @__PURE__ */ s(i,{children:`Upload progress`}),/* @__PURE__ */ s(t,{}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]})}function g(){return/* @__PURE__ */ s(o,{value:18,children:[/* @__PURE__ */ s(i,{children:`Battery`}),/* @__PURE__ */ s(t,{children:e=>e.status===`complete`?`Charged`:`${e.text} charged`}),/* @__PURE__ */ s(r,{render:/* @__PURE__ */ s(`span`,{}),children:/* @__PURE__ */ s(a,{render:(e,t)=>/* @__PURE__ */ s(`div`,{...e,"data-variant":(t.percent??0)<20?`destructive`:void 0})})})]})}function _(){return/* @__PURE__ */ s(`div`,{dir:`rtl`,children:/* @__PURE__ */ s(o,{value:56,locale:`ar-EG`,children:[/* @__PURE__ */ s(i,{children:`تقدم الرفع`}),/* @__PURE__ */ s(t,{}),/* @__PURE__ */ s(r,{children:/* @__PURE__ */ s(a,{})})]})})}var v={name:`progress`,title:`Progress`,description:`Show a task’s progress, or an indeterminate state while its progress is unknown.`,sections:[{heading:null,text:``,examples:[{id:`progress/basic`,caption:`Read the export bar. Its label and 60% value are available both visually and to a screen reader.`,Example:c,source:`import {
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
`}]},{heading:`Indeterminate`,text:"Leave out `value` when you do not know how much work is complete. Every part gets `data-indeterminate`, and the root has no `aria-valuenow`.",examples:[{id:`progress/indeterminate`,caption:`Read the Connecting to server bar. It shows an ongoing task without announcing a percentage.`,Example:l,source:`import {
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
`}]},{heading:`Changing the Value`,text:"Pass the latest `value` as your task progresses. The parts get `data-progressing` while the value is below `max`, and `data-complete` when it reaches the end.",examples:[{id:`progress/controlled`,caption:`Click Upload Next to add one photo, or 20%, and watch the console count them. At 100%, the button stops advancing the bar. Click Reset to start at 0%.`,Example:u,source:`"use client"

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
`}]},{heading:`Bounds`,text:"`min` and `max` default to 0 and 100. A value outside that range is clamped for the fill, the percentage and `aria-valuenow`, but the state's `value` and a format other than percent keep it as you passed it. A value of 3 between 1 and 5 fills half the track.",examples:[{id:`progress/min-max`,caption:`Compare step 3 of 5 with the fill. Because the range starts at 1, the value is halfway through the range.`,Example:d,source:`import {
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
`}]},{heading:`Format and Locale`,text:"Pass `Intl.NumberFormat` options to `format` for units or decimal places. A function can return custom text, such as the time remaining.",examples:[{id:`progress/format`,caption:`Compare the progress readings. They show downloaded data, a precise percentage, time remaining, and a localized percentage.`,Example:p,source:`import {
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
`}]},{heading:`Value Label`,text:"Use `getValueLabel` to give screen readers more context than the visible number. Its details include `formatted`, `percent`, `min`, and `max`. Handle a `null` value when the task can be indeterminate; `percent` is also `null` and `formatted` is empty then.",examples:[{id:`progress/value-label`,caption:`Read Copying files with a screen reader. It announces 3 of 12 files and 25%, while the visible value stays compact.`,Example:m,source:`import {
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
`}]},{heading:`More examples`,text:``,examples:[{id:`progress/label`,caption:``,Example:h,source:`import {
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
`},{id:`progress/render`,caption:``,Example:g,source:`import {
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
`},{id:`progress/rtl`,caption:``,Example:_,source:`import {
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
`}]}]};export{v as default};