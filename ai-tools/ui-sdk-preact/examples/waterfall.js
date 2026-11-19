import{t as e}from"../chunks/c-CU-88Fi-.js";import{useLog as t}from"./log.js";import*as n from"preact/compat";import{jsx as r,jsxs as i}from"preact/compat/jsx-runtime";import{Waterfall as a,WaterfallAxis as o,WaterfallBar as s,WaterfallCell as c,WaterfallColumnHeader as l,WaterfallHeaderRow as u,WaterfallIndicator as d,WaterfallMark as f,WaterfallRow as p,WaterfallRowHeader as m,WaterfallTick as h,createWaterfallController as g,visibleWaterfallRows as _}from"ui-sdk/waterfall.js";const v=[{value:`document`,label:`/`,start:0,duration:182},{value:`styles`,label:`app.css`,start:190,duration:96},{value:`script`,label:`app.js`,start:192,duration:410},{value:`font`,label:`inter.woff2`,start:300,duration:220},{value:`user`,label:`api/user`,start:610,duration:240},{value:`avatar`,label:`avatar.png`,start:860,duration:150}],y={document:`14 kB`,styles:`8 kB`,script:`212 kB`,font:`48 kB`,user:`1 kB`,avatar:`36 kB`};function b(){return/* @__PURE__ */ i(a,{"aria-label":`Network requests`,items:v,getBarLabel:(e,{start:t,duration:n})=>`${y[e.value]}, starts at ${t}, takes ${n}`,children:[/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(l,{children:`Name`}),/* @__PURE__ */ r(l,{children:`Size`}),/* @__PURE__ */ i(l,{"aria-label":`Timeline`,children:[/* @__PURE__ */ r(o,{maxTicks:5}),/* @__PURE__ */ r(f,{time:620,children:`DOMContentLoaded`})]})]}),v.map(e=>/* @__PURE__ */ i(p,{value:e.value,children:[/* @__PURE__ */ r(m,{children:e.label}),/* @__PURE__ */ r(c,{children:y[e.value]}),/* @__PURE__ */ r(s,{})]},e.value))]})}const x=[{value:`checkout`,label:`POST /checkout`,start:0,duration:920,children:[{value:`auth`,label:`auth.verify`,start:12,duration:64},{value:`cart`,label:`cart.load`,start:80,duration:310,children:[{value:`cart-db`,label:`db.query carts`,start:96,duration:140},{value:`prices`,label:`pricing.quote`,start:240,duration:136}]},{value:`payment`,label:`payments.charge`,start:400,duration:470,children:[{value:`fraud`,label:`fraud.score`,start:410,duration:120},{value:`gateway`,label:`gateway.capture`,start:540,duration:310}]},{value:`email`,label:`email.enqueue`,start:880,duration:30}]}],S={style:`unit`,unit:`millisecond`,unitDisplay:`narrow`};function C(){let c=t(),[f]=n.useState(()=>g()),[h,v]=n.useState([`checkout`]),[y,b]=n.useState(null),C=_(x,h);return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>f.expandAll(),children:`Expand All`}),/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>f.collapseAll(),children:`Collapse All`})]}),/* @__PURE__ */ i(a,{"aria-label":`Checkout trace`,items:x,controller:f,expanded:h,onExpandedChange:v,value:y,onValueChange:e=>{b(e),c(`Selected ${e}`)},format:S,children:[/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(l,{children:`Span`}),/* @__PURE__ */ r(l,{"aria-label":`Timeline`,children:/* @__PURE__ */ r(o,{})})]}),C.map(({item:t})=>/* @__PURE__ */ i(p,{value:t.value,children:[/* @__PURE__ */ i(m,{children:[t.children&&/* @__PURE__ */ r(d,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})}),t.label]}),/* @__PURE__ */ r(s,{})]},t.value))]})]})}const w=[{value:`render`,label:`render /dashboard`,start:0,duration:1200,children:[{value:`session`,label:`session`,start:20,duration:80},{value:`metrics`,label:`metrics`,start:110,duration:640},{value:`alerts`,label:`alerts`,start:110,duration:260},{value:`html`,label:`stream html`,start:760,duration:420}]}],T=[w[0],...w[0].children],E=[0,1200];function D([e,t],n){let r=(e+t)/2,i=Math.min((t-e)*n/2,E[1]/2),a=Math.min(Math.max(E[0],r-i),E[1]-i*2);return[a,a+i*2]}function O(){let[t,c]=n.useState(E);return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>c(D(t,.5)),children:`Zoom In`}),/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>c(D(t,2)),children:`Zoom Out`}),/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>c(E),children:`Reset`})]}),/* @__PURE__ */ i(a,{"aria-label":`Dashboard render`,items:w,range:t,defaultExpanded:[`render`],defaultValue:`metrics`,children:[/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(l,{children:`Span`}),/* @__PURE__ */ r(l,{"aria-label":`Timeline`,children:/* @__PURE__ */ r(o,{children:({ticks:e})=>e.map(e=>/* @__PURE__ */ r(h,{time:e.time,children:e.label},e.time))})})]}),T.map(t=>/* @__PURE__ */ i(p,{value:t.value,children:[/* @__PURE__ */ i(m,{children:[t.children&&/* @__PURE__ */ r(d,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})}),t.label]}),/* @__PURE__ */ r(s,{})]},t.value))]})]})}const k=Array.from({length:2e3},(e,t)=>({value:`job-${t+1}`,label:`job ${t+1}`,start:t*4,duration:60,children:Array.from({length:4},(e,n)=>({value:`job-${t+1}/step-${n+1}`,label:`step ${n+1}`,start:t*4+n*15,duration:15}))})),A=[0,400];function j(){let t=n.useRef(null),[o,c]=n.useState(0),[l,u]=n.useState([`job-1`]),f=n.useMemo(()=>_(k,l),[l]),h=Math.max(0,Math.floor(o/32)-4),g=Math.min(f.length,Math.ceil((o+288)/32)+4);return/* @__PURE__ */ r(`div`,{"data-slot":`scroll`,ref:t,onScroll:e=>c(e.currentTarget.scrollTop),children:/* @__PURE__ */ r(a,{"aria-label":`Build trace`,"aria-rowcount":f.length,items:k,range:A,expanded:l,onExpandedChange:u,onHighlight:(e,{index:n})=>{let r=t.current;if(!r)return;let i=n*32;i<r.scrollTop?r.scrollTop=i:i+32>r.scrollTop+r.clientHeight&&(r.scrollTop=i+32-r.clientHeight),c(r.scrollTop)},style:{height:f.length*32},children:f.slice(h,g).map(({item:t,index:n})=>/* @__PURE__ */ i(p,{value:t.value,"aria-rowindex":n+1,style:{top:n*32},children:[/* @__PURE__ */ i(m,{children:[t.children&&/* @__PURE__ */ r(d,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})}),t.label]}),/* @__PURE__ */ r(s,{})]},t.value))})})}var M={name:`waterfall`,title:`Waterfall`,description:`Show a trace or a page's requests as bars on a shared time axis, with spans that expand to show what they started.`,sections:[{heading:null,text:`Use a Waterfall for anything with a start and a duration that nests: a browser's network requests, an OpenTelemetry trace, the steps of a build. Each span is a row with its own bar, placed on one time axis, and screen reader and keyboard users get a treegrid they can walk span by span.`,examples:[{id:`waterfall/network`,caption:`Use the arrow keys to move between requests. Press Right to move into a row's cells, where each bar reads out when its request starts and how long it takes.`,Example:b,source:`"use client"

import {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallCell,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallMark,
  WaterfallRow,
  WaterfallRowHeader,
  type WaterfallData,
} from "@ui-sdk/react/waterfall"

const requests: WaterfallData = [
  { value: "document", label: "/", start: 0, duration: 182 },
  { value: "styles", label: "app.css", start: 190, duration: 96 },
  { value: "script", label: "app.js", start: 192, duration: 410 },
  { value: "font", label: "inter.woff2", start: 300, duration: 220 },
  { value: "user", label: "api/user", start: 610, duration: 240 },
  { value: "avatar", label: "avatar.png", start: 860, duration: 150 },
]

const sizes: Record<string, string> = {
  document: "14 kB",
  styles: "8 kB",
  script: "212 kB",
  font: "48 kB",
  user: "1 kB",
  avatar: "36 kB",
}

function Example() {
  return (
    <Waterfall
      aria-label="Network requests"
      items={requests}
      getBarLabel={(request, { start, duration }) =>
        \`\${sizes[request.value]}, starts at \${start}, takes \${duration}\`
      }
    >
      <WaterfallHeaderRow>
        <WaterfallColumnHeader>Name</WaterfallColumnHeader>
        <WaterfallColumnHeader>Size</WaterfallColumnHeader>
        <WaterfallColumnHeader aria-label="Timeline">
          <WaterfallAxis maxTicks={5} />
          <WaterfallMark time={620}>DOMContentLoaded</WaterfallMark>
        </WaterfallColumnHeader>
      </WaterfallHeaderRow>
      {requests.map((request) => (
        <WaterfallRow key={request.value} value={request.value}>
          <WaterfallRowHeader>{request.label}</WaterfallRowHeader>
          <WaterfallCell>{sizes[request.value]}</WaterfallCell>
          <WaterfallBar />
        </WaterfallRow>
      ))}
    </Waterfall>
  )
}

export { Example }
`}]},{heading:`Nested Spans`,text:"Spans with `children` expand and collapse. Click a span's indicator, or press Right and Left on its row. To render only the rows that show, keep `expanded` in state and pass it to `visibleWaterfallRows(items, expanded)`, which flattens the open spans in order.",examples:[{id:`waterfall/trace`,caption:`Expand payments.charge with Right, then press Enter on gateway.capture. The console logs the selected span. Collapse All closes every span.`,Example:C,source:`"use client"

import {
  createWaterfallController,
  visibleWaterfallRows,
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallRow,
  WaterfallRowHeader,
  type WaterfallData,
} from "@ui-sdk/react/waterfall"
import { ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const trace: WaterfallData = [
  {
    value: "checkout",
    label: "POST /checkout",
    start: 0,
    duration: 920,
    children: [
      { value: "auth", label: "auth.verify", start: 12, duration: 64 },
      {
        value: "cart",
        label: "cart.load",
        start: 80,
        duration: 310,
        children: [
          {
            value: "cart-db",
            label: "db.query carts",
            start: 96,
            duration: 140,
          },
          {
            value: "prices",
            label: "pricing.quote",
            start: 240,
            duration: 136,
          },
        ],
      },
      {
        value: "payment",
        label: "payments.charge",
        start: 400,
        duration: 470,
        children: [
          { value: "fraud", label: "fraud.score", start: 410, duration: 120 },
          {
            value: "gateway",
            label: "gateway.capture",
            start: 540,
            duration: 310,
          },
        ],
      },
      { value: "email", label: "email.enqueue", start: 880, duration: 30 },
    ],
  },
]

const milliseconds = {
  style: "unit",
  unit: "millisecond",
  unitDisplay: "narrow",
} as const

function Example() {
  const log = useLog()
  const [spans] = React.useState(() => createWaterfallController())
  const [expanded, setExpanded] = React.useState(["checkout"])
  const [value, setValue] = React.useState<string | null>(null)
  const rows = visibleWaterfallRows(trace, expanded)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => spans.expandAll()}>
          Expand All
        </button>
        <button type="button" onClick={() => spans.collapseAll()}>
          Collapse All
        </button>
      </div>
      <Waterfall
        aria-label="Checkout trace"
        items={trace}
        controller={spans}
        expanded={expanded}
        onExpandedChange={setExpanded}
        value={value}
        onValueChange={(next) => {
          setValue(next)
          log(\`Selected \${next}\`)
        }}
        format={milliseconds}
      >
        <WaterfallHeaderRow>
          <WaterfallColumnHeader>Span</WaterfallColumnHeader>
          <WaterfallColumnHeader aria-label="Timeline">
            <WaterfallAxis />
          </WaterfallColumnHeader>
        </WaterfallHeaderRow>
        {rows.map(({ item }) => (
          <WaterfallRow key={item.value} value={item.value}>
            <WaterfallRowHeader>
              {item.children && (
                <WaterfallIndicator>
                  <ChevronRightIcon aria-hidden="true" />
                </WaterfallIndicator>
              )}
              {item.label}
            </WaterfallRowHeader>
            <WaterfallBar />
          </WaterfallRow>
        ))}
      </Waterfall>
    </div>
  )
}

export { Example }
`}]},{heading:`Zoom`,text:"`range` sets the stretch of time the axis shows, as `[start, end]`. Change it to zoom or pan: the bars and ticks follow, and a bar outside the range shrinks to its edge. Without it, the axis runs from the earliest start to the latest end.",examples:[{id:`waterfall/zoom`,caption:`Press Zoom In twice. The axis shows smaller steps, and the metrics span stretches past the edges.`,Example:O,source:`"use client"

import {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallRow,
  WaterfallRowHeader,
  WaterfallTick,
  type WaterfallData,
} from "@ui-sdk/react/waterfall"
import { ChevronRightIcon } from "lucide-react"
import * as React from "react"

const trace: WaterfallData = [
  {
    value: "render",
    label: "render /dashboard",
    start: 0,
    duration: 1200,
    children: [
      { value: "session", label: "session", start: 20, duration: 80 },
      { value: "metrics", label: "metrics", start: 110, duration: 640 },
      { value: "alerts", label: "alerts", start: 110, duration: 260 },
      { value: "html", label: "stream html", start: 760, duration: 420 },
    ],
  },
]

const spans = [trace[0], ...trace[0].children!]
const full: [number, number] = [0, 1200]

function zoomed([start, end]: [number, number], factor: number) {
  const center = (start + end) / 2
  const half = Math.min(((end - start) * factor) / 2, full[1] / 2)
  const from = Math.min(Math.max(full[0], center - half), full[1] - half * 2)
  return [from, from + half * 2] as [number, number]
}

function Example() {
  const [range, setRange] = React.useState(full)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setRange(zoomed(range, 0.5))}>
          Zoom In
        </button>
        <button type="button" onClick={() => setRange(zoomed(range, 2))}>
          Zoom Out
        </button>
        <button type="button" onClick={() => setRange(full)}>
          Reset
        </button>
      </div>
      <Waterfall
        aria-label="Dashboard render"
        items={trace}
        range={range}
        defaultExpanded={["render"]}
        defaultValue="metrics"
      >
        <WaterfallHeaderRow>
          <WaterfallColumnHeader>Span</WaterfallColumnHeader>
          <WaterfallColumnHeader aria-label="Timeline">
            <WaterfallAxis>
              {({ ticks }) =>
                ticks.map((tick) => (
                  <WaterfallTick key={tick.time} time={tick.time}>
                    {tick.label}
                  </WaterfallTick>
                ))
              }
            </WaterfallAxis>
          </WaterfallColumnHeader>
        </WaterfallHeaderRow>
        {spans.map((span) => (
          <WaterfallRow key={span.value} value={span.value}>
            <WaterfallRowHeader>
              {span.children && (
                <WaterfallIndicator>
                  <ChevronRightIcon aria-hidden="true" />
                </WaterfallIndicator>
              )}
              {span.label}
            </WaterfallRowHeader>
            <WaterfallBar />
          </WaterfallRow>
        ))}
      </Waterfall>
    </div>
  )
}

export { Example }
`}]},{heading:`Large Traces`,text:"A trace can have thousands of spans. Render only the rows in view: flatten the open spans with `visibleWaterfallRows`, and render the nearby rows at their offsets. The waterfall still reports every row's level and place among its siblings, so screen readers hear the whole hierarchy. Give the waterfall `aria-rowcount` with the number of rows that show, and each row `aria-rowindex` with its index plus one, so a screen reader counts rows in the whole trace, not just the ones in the page.",examples:[{id:`waterfall/virtualized`,caption:`Press End to focus job 2000, or Page Down to move a page at a time. The trace has 10,000 spans, but only nearby rows render.`,Example:j,source:`"use client"

import {
  visibleWaterfallRows,
  Waterfall,
  WaterfallBar,
  WaterfallIndicator,
  WaterfallRow,
  WaterfallRowHeader,
  type WaterfallData,
} from "@ui-sdk/react/waterfall"
import { ChevronRightIcon } from "lucide-react"
import * as React from "react"

const trace: WaterfallData = Array.from({ length: 2000 }, (_, job) => ({
  value: \`job-\${job + 1}\`,
  label: \`job \${job + 1}\`,
  start: job * 4,
  duration: 60,
  children: Array.from({ length: 4 }, (_, step) => ({
    value: \`job-\${job + 1}/step-\${step + 1}\`,
    label: \`step \${step + 1}\`,
    start: job * 4 + step * 15,
    duration: 15,
  })),
}))

const range: [number, number] = [0, 400]
const row = 32
const height = 288

function Example() {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [expanded, setExpanded] = React.useState(["job-1"])
  const rows = React.useMemo(
    () => visibleWaterfallRows(trace, expanded),
    [expanded]
  )
  const start = Math.max(0, Math.floor(scrollTop / row) - 4)
  const end = Math.min(rows.length, Math.ceil((scrollTop + height) / row) + 4)
  return (
    <div
      data-slot="scroll"
      ref={scroller}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <Waterfall
        aria-label="Build trace"
        aria-rowcount={rows.length}
        items={trace}
        range={range}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onHighlight={(_value, { index }) => {
          const el = scroller.current
          if (!el) {
            return
          }
          const top = index * row
          if (top < el.scrollTop) {
            el.scrollTop = top
          } else if (top + row > el.scrollTop + el.clientHeight) {
            el.scrollTop = top + row - el.clientHeight
          }
          setScrollTop(el.scrollTop)
        }}
        style={{ height: rows.length * row }}
      >
        {rows.slice(start, end).map(({ item, index }) => (
          <WaterfallRow
            key={item.value}
            value={item.value}
            aria-rowindex={index + 1}
            style={{ top: index * row }}
          >
            <WaterfallRowHeader>
              {item.children && (
                <WaterfallIndicator>
                  <ChevronRightIcon aria-hidden="true" />
                </WaterfallIndicator>
              )}
              {item.label}
            </WaterfallRowHeader>
            <WaterfallBar />
          </WaterfallRow>
        ))}
      </Waterfall>
    </div>
  )
}

export { Example }
`}]}]};export{M as default};