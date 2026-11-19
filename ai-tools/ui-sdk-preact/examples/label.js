import{t as e}from"../chunks/c-WfjOen3K.js";import{jsx as t,jsxs as n}from"preact/compat/jsx-runtime";import{Checkbox as r,CheckboxIndicator as i}from"ui-sdk/checkbox.js";import{Radio as a,RadioGroup as o,RadioIndicator as s}from"ui-sdk/radio.js";import{Switch as c,SwitchThumb as l}from"ui-sdk/switch.js";import{Slider as u,SliderControl as d,SliderIndicator as f,SliderThumb as p,SliderTrack as m,SliderValue as h}from"ui-sdk/slider.js";import{Label as g}from"ui-sdk/label.js";const _=[{value:`standard`,label:`Standard`},{value:`express`,label:`Express`},{value:`overnight`,label:`Overnight`}];function v(){return/* @__PURE__ */ n(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ t(g,{htmlFor:`shipping-speed`,children:`Shipping speed`}),/* @__PURE__ */ t(o,{id:`shipping-speed`,defaultValue:`standard`,children:_.map(e=>/* @__PURE__ */ n(g,{children:[/* @__PURE__ */ t(a,{value:e.value,children:/* @__PURE__ */ t(s,{})}),e.label]},e.value))})]})}function y(){return/* @__PURE__ */ n(u,{id:`volume`,defaultValue:75,children:[/* @__PURE__ */ n(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ t(g,{htmlFor:`volume`,children:`Volume`}),/* @__PURE__ */ t(h,{})]}),/* @__PURE__ */ t(d,{children:/* @__PURE__ */ n(m,{children:[/* @__PURE__ */ t(f,{}),/* @__PURE__ */ t(p,{})]})})]})}function b(){return/* @__PURE__ */ n(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ t(c,{id:`updates`,children:/* @__PURE__ */ t(l,{})}),/* @__PURE__ */ t(g,{htmlFor:`updates`,children:`Email me product updates`})]})}function x(){return/* @__PURE__ */ n(g,{children:[/* @__PURE__ */ t(r,{children:/* @__PURE__ */ t(i,{children:/* @__PURE__ */ t(e,{"aria-hidden":`true`})})}),`Accept terms and conditions`]})}var S={name:`label`,title:`Label`,description:`Name any control with a label, and let a press on the label reach it.`,sections:[{heading:null,text:"A plain `<label>` only reaches inputs, buttons and selects. Label names any control by its `htmlFor`, including a radio group or a slider, and a press on the label moves focus into it.",examples:[{id:`label/basic`,caption:`Press Shipping speed. Focus moves to the checked option, and a screen reader names the group Shipping speed.`,Example:v,source:`import { Label } from "@ui-sdk/react/label"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function Example() {
  return (
    <div data-slot="stack">
      <Label htmlFor="shipping-speed">Shipping speed</Label>
      <RadioGroup id="shipping-speed" defaultValue="standard">
        {speeds.map((speed) => (
          <Label key={speed.value}>
            <Radio value={speed.value}>
              <RadioIndicator />
            </Radio>
            {speed.label}
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

export { Example }
`}]},{heading:`Slider`,text:`A label for a slider names its thumb, so the thumb reads as Volume, and a press on the label focuses it.`,examples:[{id:`label/slider`,caption:`Press Volume, then use the arrow keys. The thumb moves, and a screen reader reads it as Volume.`,Example:y,source:`import { Label } from "@ui-sdk/react/label"
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
    <Slider id="volume" defaultValue={75}>
      <div data-slot="row">
        <Label htmlFor="volume">Volume</Label>
        <SliderValue />
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb />
        </SliderTrack>
      </SliderControl>
    </Slider>
  )
}

export { Example }
`}]},{heading:`Switch`,text:`Point the label at a switch beside it. A press on the label turns the switch on and off.`,examples:[{id:`label/switch`,caption:`Press Email me product updates. The switch turns on.`,Example:b,source:`import { Label } from "@ui-sdk/react/label"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <div data-slot="row">
      <Switch id="updates">
        <SwitchThumb />
      </Switch>
      <Label htmlFor="updates">Email me product updates</Label>
    </div>
  )
}

export { Example }
`}]},{heading:`Wrapping a Control`,text:"Put the control inside the label instead of pointing at it, and you need no `id`.",examples:[{id:`label/wrap`,caption:`Press Accept terms and conditions. The checkbox checks, and a double click doesn't select the text.`,Example:x,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Label } from "@ui-sdk/react/label"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <Label>
      <Checkbox>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      Accept terms and conditions
    </Label>
  )
}

export { Example }
`}]}]};export{S as default};