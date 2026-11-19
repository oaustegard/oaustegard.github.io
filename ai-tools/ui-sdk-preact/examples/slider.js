import{Bn as e,Co as t,Fn as n,In as r,Ln as i,Mo as a,Oo as o,Rn as s,To as c,Vn as l,fl as u,ll as d,tl as f,zn as p}from"../chunks/c-CIXE4Nkk.js";function m(){return/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:75,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Volume`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]})})}function h(){return/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:[25,50],step:5,format:{style:`currency`,currency:`USD`,maximumFractionDigits:0},children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Price`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{index:0,"aria-label":`Minimum price`}),/* @__PURE__ */ f(s,{index:1,"aria-label":`Maximum price`})]})})]})})}const g=[`Low`,`Medium`,`High`];function _(){return/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:[10,20,70],step:10,format:{style:`unit`,unit:`percent`},children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Alert thresholds`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),g.map((e,t)=>/* @__PURE__ */ f(s,{index:t,"aria-label":e},e))]})})]})})}const v=[{label:`Bass`,value:50},{label:`Treble`,value:25}];function y(){return/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:v.map(e=>/* @__PURE__ */ f(t,{children:[/* @__PURE__ */ f(n,{orientation:`vertical`,defaultValue:e.value,children:/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})}),/* @__PURE__ */ f(o,{children:e.label})]},e.label))})}function b(){return/* @__PURE__ */ f(t,{children:[/* @__PURE__ */ f(n,{defaultValue:.3,format:{style:`percent`},min:0,max:1,step:.01,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Volume`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]}),/* @__PURE__ */ f(c,{children:`How loud notifications play.`})]})}function x(){return/* @__PURE__ */ f(t,{children:[/* @__PURE__ */ f(n,{defaultValue:50,disabled:!0,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Brightness`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]}),/* @__PURE__ */ f(c,{children:`Managed by your organization.`})]})}function S(){let c=a(),[l,d]=u([.3,.7]);return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ f(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ f(`button`,{type:`button`,onClick:()=>d([.3,.7]),children:`Reset`})}),/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{value:l,onValueChange:(e,t)=>{d(e),c(`${e.join(` – `)} (${t.reason})`)},min:0,max:1,step:.1,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Temperature`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{index:0,"aria-label":`Minimum temperature`}),/* @__PURE__ */ f(s,{index:1,"aria-label":`Maximum temperature`})]})})]})})]})}function C({count:e}){return/* @__PURE__ */ f(`div`,{"data-slot":`ticks`,"aria-hidden":`true`,children:Array.from({length:e},(e,t)=>/* @__PURE__ */ f(`span`,{},t))})}function w(){return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:2010,min:1990,max:2030,step:5,format:{useGrouping:!1},children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Year`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})}),/* @__PURE__ */ f(C,{count:9})]})}),/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:.5,min:0,max:1,step:.05,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Opacity`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})}),/* @__PURE__ */ f(C,{count:21})]})})]})}function T(){return/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:100,min:25,max:400,largeStep:25,format:{style:`unit`,unit:`percent`},children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Zoom`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]})})}const E=e=>`${Math.floor(e/60)}:${String(e%60).padStart(2,`0`)}`;function D(){return/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:[540,1020],min:0,max:1440,step:15,minStepsBetweenThumbs:16,format:E,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Opening hours`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{index:0,"aria-label":`Opens`}),/* @__PURE__ */ f(s,{index:1,"aria-label":`Closes`})]})})]})})}const O=[{label:`Budget`,defaultValue:40,max:100,step:1,format:{style:`currency`,currency:`USD`,maximumFractionDigits:0}},{label:`Opacity`,defaultValue:.6,max:1,step:.01,format:{style:`percent`}},{label:`Weight`,defaultValue:20,max:50,step:.5,format:{style:`unit`,unit:`kilogram`}},{label:`Duration`,defaultValue:90,max:600,step:15,format:e=>`${Math.floor(e/60)} min ${e%60} s`},{label:`Preis`,defaultValue:40,max:100,step:1,format:{style:`currency`,currency:`EUR`},locale:`de-DE`}];function k(){return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:O.map(({label:a,...c})=>/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{...c,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:a}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]})},a))})}function A(){let c=a();return/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:50,onValueCommit:(e,t)=>c(`Saved ${e} (${t.reason})`),children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Brightness`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]})})}function j(){let c=a(),[d]=u(()=>l());return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ f(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ f(`button`,{type:`button`,onClick:()=>d.setValue(0),children:`Mute`}),/* @__PURE__ */ f(`button`,{type:`button`,onClick:()=>d.setValue(d.getValue()+10),children:`Louder`}),/* @__PURE__ */ f(`button`,{type:`button`,onClick:()=>c(`Volume is ${d.getValue()}`),children:`Read`}),/* @__PURE__ */ f(`button`,{type:`button`,onClick:()=>d.focus(),children:`Focus`})]}),/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:40,controller:d,onValueChange:(e,t)=>c(`Volume ${e} (${t.reason})`),children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Volume`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]})})]})}function M(){let c=a(),l=d();return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ f(`form`,{id:l,"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let t=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);c(`Submitted ${t.join(`, `)}`)},children:[/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{name:`price`,defaultValue:[200,800],max:1e3,step:10,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Price`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{index:0,"aria-label":`Minimum price`}),/* @__PURE__ */ f(s,{index:1,"aria-label":`Maximum price`})]})})]})}),/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{name:`rating`,defaultValue:3,min:1,max:5,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Minimum rating`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]})})]}),/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{name:`distance`,form:l,defaultValue:25,max:100,step:5,format:{style:`unit`,unit:`kilometer`},children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Distance`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{})]})})]})}),/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(`button`,{type:`submit`,form:l,"data-variant":`solid`,children:`Save`}),/* @__PURE__ */ f(`button`,{type:`reset`,form:l,children:`Reset`})]})]})}function N(){return/* @__PURE__ */ f(t,{children:/* @__PURE__ */ f(n,{defaultValue:60,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(o,{children:`Brightness`}),/* @__PURE__ */ f(e,{children:e=>`${e.text}%`})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{render:/* @__PURE__ */ f(`span`,{}),children:e=>/* @__PURE__ */ f(`span`,{"data-slot":`output`,children:e.thumbValue})})]})})]})})}function P(){return/* @__PURE__ */ f(`div`,{dir:`rtl`,"data-slot":`stack`,children:/* @__PURE__ */ f(n,{defaultValue:[20,60],locale:`ar-EG`,"aria-label":`نطاق السعر`,children:[/* @__PURE__ */ f(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(`span`,{"data-slot":`label`,children:`نطاق السعر`}),/* @__PURE__ */ f(e,{})]}),/* @__PURE__ */ f(r,{children:/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ f(i,{}),/* @__PURE__ */ f(s,{index:0,"aria-label":`الحد الأدنى`}),/* @__PURE__ */ f(s,{index:1,"aria-label":`الحد الأقصى`})]})})]})})}var F={name:`slider`,title:`Slider`,description:`Adjust a number or a range with draggable thumbs and keyboard controls.`,sections:[{heading:null,text:`Use a slider to pick a number or a range along a scale, like a volume or a price range, by dragging a thumb or with the arrow keys.`,examples:[{id:`slider/basic`,caption:`Drag the thumb, or focus it and use the arrow keys, to adjust Volume.`,Example:m,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider defaultValue={75}>
        <div data-slot="row">
          <FieldLabel>Volume</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
`}]},{heading:`Range`,text:'Pass an array for a range, then render one thumb per number. Give each thumb its `index`, from 0, and its own name, like "Minimum price". The indicator fills the space between the first and the last thumb, and the `FieldLabel` names the group.',examples:[{id:`slider/range`,caption:`Move either end of Price. The thumbs stay in order.`,Example:h,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={[25, 50]}
        step={5}
        format={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
      >
        <div data-slot="row">
          <FieldLabel>Price</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="Minimum price" />
            <SliderThumb index={1} aria-label="Maximum price" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
`}]},{heading:`Multiple Thumbs`,text:`Any number of thumbs works the same way. They never pass each other, and a press on the track moves the nearest one.`,examples:[{id:`slider/multiple`,caption:`Adjust Low, Medium and High independently, without moving one past another.`,Example:_,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

const thumbs = ["Low", "Medium", "High"]

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={[10, 20, 70]}
        step={10}
        format={{ style: "unit", unit: "percent" }}
      >
        <div data-slot="row">
          <FieldLabel>Alert thresholds</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            {thumbs.map((label, index) => (
              <SliderThumb key={label} index={index} aria-label={label} />
            ))}
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'Set `orientation="vertical"` and give the slider a height. The bottom is the minimum, ArrowUp increases the value, and every part gets `data-orientation`, so `[data-orientation="vertical"]` styles the vertical axis.',examples:[{id:`slider/vertical`,caption:`Drag up or down, or use the arrow keys, to adjust Bass and Treble.`,Example:y,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider"

const channels = [
  { label: "Bass", value: 50 },
  { label: "Treble", value: 25 },
]

function Example() {
  return (
    <div data-slot="row">
      {channels.map((channel) => (
        <Field key={channel.label}>
          <Slider orientation="vertical" defaultValue={channel.value}>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </Slider>
          <FieldLabel>{channel.label}</FieldLabel>
        </Field>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Field`,text:"Put the slider in a `Field`. The label names the thumb, the description describes it, and `SliderValue` shows the value beside the label. Screen readers don't announce `SliderValue` as it changes, since the thumb already says its value.",examples:[{id:`slider/field`,caption:`Click the Volume label to focus the thumb, then use the arrow keys to change the value.`,Example:b,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={0.3}
        format={{ style: "percent" }}
        min={0}
        max={1}
        step={0.01}
      >
        <div data-slot="row">
          <FieldLabel>Volume</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <FieldDescription>How loud notifications play.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled`. A disabled slider can't be focused or moved, and isn't submitted. A disabled `<fieldset>` around it disables it too.",examples:[{id:`slider/disabled`,caption:`Brightness keeps its value, but can't be focused or dragged.`,Example:x,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider defaultValue={50} disabled>
        <div data-slot="row">
          <FieldLabel>Brightness</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <FieldDescription>Managed by your organization.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and `onValueChange` to control the slider. The value keeps its shape: a number stays a number and an array stays an array. Every change carries a reason, like `drag`, `track-press` or `step-key`, and `details.thumb` says which thumb moved. Call `details.cancel()` to keep the current value.",examples:[{id:`slider/controlled`,caption:`Drag either Temperature thumb to log the range and its reason. Reset sets the value from outside.`,Example:S,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState([0.3, 0.7])

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setValue([0.3, 0.7])}>
          Reset
        </button>
      </div>
      <Field>
        <Slider
          value={value}
          onValueChange={(next, details) => {
            setValue(next)
            log(\`\${next.join(" – ")} (\${details.reason})\`)
          }}
          min={0}
          max={1}
          step={0.1}
        >
          <div data-slot="row">
            <FieldLabel>Temperature</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb index={0} aria-label="Minimum temperature" />
              <SliderThumb index={1} aria-label="Maximum temperature" />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Step and Bounds`,text:"`min` and `max` set the bounds, 0 and 100 by default, and `step` sets how far one step moves, counted from `min`. Decimal steps avoid floating-point drift, so a 0.1 step can reach 0.3 cleanly. When the steps from `min` don't land on `max`, the highest step below it is the end.",examples:[{id:`slider/step`,caption:`Move Year in steps of five, and Opacity in steps of 0.05.`,Example:w,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Ticks({ count }: { count: number }) {
  return (
    <div data-slot="ticks" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  )
}

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <Slider
          defaultValue={2010}
          min={1990}
          max={2030}
          step={5}
          format={{ useGrouping: false }}
        >
          <div data-slot="row">
            <FieldLabel>Year</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
          <Ticks count={9} />
        </Slider>
      </Field>
      <Field>
        <Slider defaultValue={0.5} min={0} max={1} step={0.05}>
          <div data-slot="row">
            <FieldLabel>Opacity</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
          <Ticks count={21} />
        </Slider>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Large Step`,text:"Arrow keys move one step. Page Up, Page Down and Shift with an arrow key move by `largeStep`, which is ten steps unless you set it. Home and End go to the bounds.",examples:[{id:`slider/large-step`,caption:`Focus Zoom and press an arrow key to move 1%, then Page Up, Page Down or Shift with an arrow key to move 25%.`,Example:T,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={100}
        min={25}
        max={400}
        largeStep={25}
        format={{ style: "unit", unit: "percent" }}
      >
        <div data-slot="row">
          <FieldLabel>Zoom</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
`}]},{heading:`Distance Between Thumbs`,text:"Set `minStepsBetweenThumbs` to keep neighbouring thumbs that many steps apart. A thumb stops at its neighbour, and Home and End move it only as far as its neighbour allows.",examples:[{id:`slider/min-steps`,caption:`Move either end of Opening hours. The thumbs stay at least four hours apart.`,Example:D,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

const time = (minutes: number) =>
  \`\${Math.floor(minutes / 60)}:\${String(minutes % 60).padStart(2, "0")}\`

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={[540, 1020]}
        min={0}
        max={1440}
        step={15}
        minStepsBetweenThumbs={16}
        format={time}
      >
        <div data-slot="row">
          <FieldLabel>Opening hours</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="Opens" />
            <SliderThumb index={1} aria-label="Closes" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
`}]},{heading:`Format and Locale`,text:'`format` takes `Intl.NumberFormat` options, like `{ style: "currency", currency: "USD" }` or `{ style: "percent" }`, or a function of the value. It sets what `SliderValue` shows and what screen readers announce for each thumb, while the value stays a plain number. `locale` sets separators, digits and symbol placement. Without it, the slider uses the page\'s `lang`, or the browser\'s language, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.',examples:[{id:`slider/format`,caption:`Adjust Budget, Opacity, Weight, Duration and Preis to compare currency, a percentage, a unit, a custom function and German formatting.`,Example:k,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

const sliders = [
  {
    label: "Budget",
    defaultValue: 40,
    max: 100,
    step: 1,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  {
    label: "Opacity",
    defaultValue: 0.6,
    max: 1,
    step: 0.01,
    format: { style: "percent" },
  },
  {
    label: "Weight",
    defaultValue: 20,
    max: 50,
    step: 0.5,
    format: { style: "unit", unit: "kilogram" },
  },
  {
    label: "Duration",
    defaultValue: 90,
    max: 600,
    step: 15,
    format: (seconds: number) =>
      \`\${Math.floor(seconds / 60)} min \${seconds % 60} s\`,
  },
  {
    label: "Preis",
    defaultValue: 40,
    max: 100,
    step: 1,
    format: { style: "currency", currency: "EUR" },
    locale: "de-DE",
  },
] satisfies {
  label: string
  defaultValue: number
  max: number
  step: number
  format: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

function Example() {
  return (
    <div data-slot="stack">
      {sliders.map(({ label, ...options }) => (
        <Field key={label}>
          <Slider {...options}>
            <div data-slot="row">
              <FieldLabel>{label}</FieldLabel>
              <SliderValue />
            </div>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </Field>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Saving on Commit`,text:"`onValueChange` runs on every step of a drag. `onValueCommit` runs once, when the interaction that changed the value ends: the pointer lifts, the key comes up, or a screen reader adjusts it. Use the commit callback to save once per interaction. A press that doesn't change the value commits nothing.",examples:[{id:`slider/commit`,caption:`Drag Brightness and release it, or press an arrow key. The console logs the value once, when you let go.`,Example:A,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Field>
      <Slider
        defaultValue={50}
        onValueCommit={(value, details) =>
          log(\`Saved \${value} (\${details.reason})\`)
        }
      >
        <div data-slot="row">
          <FieldLabel>Brightness</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"A controller, from `createSliderController()`, moves the slider from anywhere with `setValue()`, reads it with `getValue()` and focuses a thumb with `focus()`. Values set through it are clamped, snapped to the step and sorted, and reported with the `imperative` reason.",examples:[{id:`slider/controller`,caption:`Use Mute, Louder and Focus to operate Volume from outside the slider. The console logs each change with the imperative reason, and Read logs the value.`,Example:j,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createSliderController,
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [volume] = React.useState(() => createSliderController<number>())

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => volume.setValue(0)}>
          Mute
        </button>
        <button
          type="button"
          onClick={() => volume.setValue(volume.getValue() + 10)}
        >
          Louder
        </button>
        <button
          type="button"
          onClick={() => log(\`Volume is \${volume.getValue()}\`)}
        >
          Read
        </button>
        <button type="button" onClick={() => volume.focus()}>
          Focus
        </button>
      </div>
      <Field>
        <Slider
          defaultValue={40}
          controller={volume}
          onValueChange={(value, details) =>
            log(\`Volume \${value} (\${details.reason})\`)
          }
        >
          <div data-slot="row">
            <FieldLabel>Volume</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Form`,text:"A hidden input beside the slider is what the form sees. It takes the slider's `name`, `form` and `disabled`, so `FormData`, `form.reset()`, a disabled `<fieldset>` and the browser's restore all work.",examples:[{id:`slider/form`,caption:`Adjust the filters and press Save to log the submitted values. Distance sits outside the form and joins it by id. Reset restores the defaults.`,Example:M,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const form = React.useId()

  return (
    <div data-slot="stack">
      <form
        id={form}
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
          <Slider name="price" defaultValue={[200, 800]} max={1000} step={10}>
            <div data-slot="row">
              <FieldLabel>Price</FieldLabel>
              <SliderValue />
            </div>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb index={0} aria-label="Minimum price" />
                <SliderThumb index={1} aria-label="Maximum price" />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </Field>
        <Field>
          <Slider name="rating" defaultValue={3} min={1} max={5}>
            <div data-slot="row">
              <FieldLabel>Minimum rating</FieldLabel>
              <SliderValue />
            </div>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </Field>
      </form>
      <Field>
        <Slider
          name="distance"
          form={form}
          defaultValue={25}
          max={100}
          step={5}
          format={{ style: "unit", unit: "kilometer" }}
        >
          <div data-slot="row">
            <FieldLabel>Distance</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </Field>
      <div data-slot="row">
        <button type="submit" form={form} data-variant="solid">
          Save
        </button>
        <button type="reset" form={form}>
          Reset
        </button>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`, to render a different element or component in its place. `render`, `className` and `children` can be functions of the part's state, like whether a thumb is being dragged, its `thumbValue` and its `percent` along the track. Here the thumb's children add a bubble with its value, and `SliderValue`'s children add a percent sign.",examples:[{id:`slider/render`,caption:`Focus or drag the Brightness thumb to show its value above it.`,Example:N,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider defaultValue={60}>
        <div data-slot="row">
          <FieldLabel>Brightness</FieldLabel>
          <SliderValue>{(state) => \`\${state.text}%\`}</SliderValue>
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb render={<span />}>
              {(state) => <span data-slot="output">{state.thumbValue}</span>}
            </SliderThumb>
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`slider/rtl`,caption:``,Example:P,source:`"use client"

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <div dir="rtl" data-slot="stack">
      <Slider defaultValue={[20, 60]} locale="ar-EG" aria-label="نطاق السعر">
        <div data-slot="row">
          <span data-slot="label">نطاق السعر</span>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="الحد الأدنى" />
            <SliderThumb index={1} aria-label="الحد الأقصى" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </div>
  )
}

export { Example }
`}]}]};export{F as default};