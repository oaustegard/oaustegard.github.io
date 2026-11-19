import{jsx as e,jsxs as t}from"preact/compat/jsx-runtime";import{Meter as n,MeterIndicator as r,MeterLabel as i,MeterTrack as a,MeterValue as o}from"ui-sdk/meter.js";function s(){return/* @__PURE__ */ t(n,{value:68,children:[/* @__PURE__ */ e(i,{children:`Storage used`}),/* @__PURE__ */ e(o,{}),/* @__PURE__ */ e(a,{children:/* @__PURE__ */ e(r,{})})]})}function c(){return/* @__PURE__ */ t(n,{value:720,min:300,max:850,format:{style:`decimal`},children:[/* @__PURE__ */ e(i,{children:`Credit score`}),/* @__PURE__ */ e(o,{}),/* @__PURE__ */ e(a,{children:/* @__PURE__ */ e(r,{})})]})}const l=[{label:`Storage`,value:120,max:250,format:{style:`unit`,unit:`gigabyte`}},{label:`Budget`,value:1840,max:2500,format:{style:`currency`,currency:`USD`,maximumFractionDigits:0}},{label:`Seats`,value:18,max:25,format:e=>`${e} of 25 seats`},{label:`Auslastung`,value:40,locale:`de-DE`}];function u(){return/* @__PURE__ */ e(`div`,{"data-slot":`stack`,children:l.map(({label:s,...c})=>/* @__PURE__ */ t(n,{...c,children:[/* @__PURE__ */ e(i,{children:s}),/* @__PURE__ */ e(o,{}),/* @__PURE__ */ e(a,{children:/* @__PURE__ */ e(r,{})})]},s))})}function d(){return/* @__PURE__ */ t(n,{value:750,max:1e3,getValueLabel:(e,t)=>`${e} of ${t.max} requests, ${t.formatted}`,children:[/* @__PURE__ */ e(i,{children:`API requests`}),/* @__PURE__ */ e(o,{children:`750 / 1,000`}),/* @__PURE__ */ e(a,{children:/* @__PURE__ */ e(r,{})})]})}function f(){return/* @__PURE__ */ t(n,{value:42,children:[/* @__PURE__ */ e(i,{children:`Battery`}),/* @__PURE__ */ e(o,{}),/* @__PURE__ */ e(a,{children:/* @__PURE__ */ e(r,{})})]})}function p(){return/* @__PURE__ */ t(n,{value:91,children:[/* @__PURE__ */ e(i,{children:`Disk`}),/* @__PURE__ */ e(o,{children:e=>`${e.text} used`}),/* @__PURE__ */ e(a,{render:/* @__PURE__ */ e(`span`,{}),children:/* @__PURE__ */ e(r,{render:(t,n)=>/* @__PURE__ */ e(`div`,{...t,"data-variant":n.percent>=90?`destructive`:void 0})})})]})}function m(){return/* @__PURE__ */ e(`div`,{dir:`rtl`,children:/* @__PURE__ */ t(n,{value:68,locale:`ar-EG`,children:[/* @__PURE__ */ e(i,{children:`مساحة التخزين`}),/* @__PURE__ */ e(o,{}),/* @__PURE__ */ e(a,{children:/* @__PURE__ */ e(r,{})})]})})}var h={name:`meter`,title:`Meter`,description:`Show a measurement within a known range, such as storage used or an account quota.`,sections:[{heading:null,text:`Use a Meter for a value within a known range, such as storage used, a battery level or an account quota. It fills a track to show the value, and screen readers announce the same value.`,examples:[{id:`meter/basic`,caption:`Read the storage meter. The label names it, and both the visible value and screen reader value report 68%.`,Example:s,source:`import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter"

export function Example() {
  return (
    <Meter value={68}>
      <MeterLabel>Storage used</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  )
}
`}]},{heading:`Bounds`,text:"`min` and `max` set the range. They default to 0 and 100. A value outside the range is clamped for the fill, the percentage and `aria-valuenow`, but the state's `value` and a format other than percent keep it as you passed it. Here, 720 sits about 76% of the way from 300 to 850. Decimal formatting keeps the visible value as 720.",examples:[{id:`meter/min-max`,caption:`Compare the score with the filled track. The number shows 720; the fill shows its position between 300 and 850.`,Example:c,source:`import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter"

export function Example() {
  return (
    <Meter value={720} min={300} max={850} format={{ style: "decimal" }}>
      <MeterLabel>Credit score</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  )
}
`}]},{heading:`Format and Locale`,text:"Pass `Intl.NumberFormat` options to `format` for units, currency, or decimal places. A function can return custom text, such as the number of occupied seats.",examples:[{id:`meter/format`,caption:`Compare the readings. Each meter formats its own value as a unit, currency, custom text, or localized percentage.`,Example:u,source:`import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter"

const meters = [
  {
    label: "Storage",
    value: 120,
    max: 250,
    format: { style: "unit", unit: "gigabyte" },
  },
  {
    label: "Budget",
    value: 1840,
    max: 2500,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  {
    label: "Seats",
    value: 18,
    max: 25,
    format: (seats: number) => \`\${seats} of 25 seats\`,
  },
  { label: "Auslastung", value: 40, locale: "de-DE" },
] satisfies {
  label: string
  value: number
  max?: number
  format?: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

export function Example() {
  return (
    <div data-slot="stack">
      {meters.map(({ label, ...options }) => (
        <Meter key={label} {...options}>
          <MeterLabel>{label}</MeterLabel>
          <MeterValue />
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </Meter>
      ))}
    </div>
  )
}
`}]},{heading:`Value Label`,text:"Use `getValueLabel` when a screen reader needs more context than the visible number. It receives the value and details containing `formatted`, `percent`, `min`, and `max`.",examples:[{id:`meter/value-label`,caption:`Read API requests with a screen reader. It announces 750 of 1000 requests and 75%, while the visible value stays compact.`,Example:d,source:`import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter"

export function Example() {
  return (
    <Meter
      value={750}
      max={1000}
      getValueLabel={(value, details) =>
        \`\${value} of \${details.max} requests, \${details.formatted}\`
      }
    >
      <MeterLabel>API requests</MeterLabel>
      <MeterValue>750 / 1,000</MeterValue>
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  )
}
`}]},{heading:`More examples`,text:``,examples:[{id:`meter/label`,caption:``,Example:f,source:`import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter"

export function Example() {
  return (
    <Meter value={42}>
      <MeterLabel>Battery</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  )
}
`},{id:`meter/render`,caption:``,Example:p,source:`import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter"

export function Example() {
  return (
    <Meter value={91}>
      <MeterLabel>Disk</MeterLabel>
      <MeterValue>{(state) => \`\${state.text} used\`}</MeterValue>
      <MeterTrack render={<span />}>
        <MeterIndicator
          render={(props, state) => (
            <div
              {...props}
              data-variant={state.percent >= 90 ? "destructive" : undefined}
            />
          )}
        />
      </MeterTrack>
    </Meter>
  )
}
`},{id:`meter/rtl`,caption:``,Example:m,source:`import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter"

export function Example() {
  return (
    <div dir="rtl">
      <Meter value={68} locale="ar-EG">
        <MeterLabel>مساحة التخزين</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  )
}
`}]}]};export{h as default};