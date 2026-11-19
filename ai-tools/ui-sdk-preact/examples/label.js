import{Bn as e,Fn as t,In as n,Kn as r,Ln as i,Rn as a,Sn as o,Xn as s,Yn as c,Zn as l,go as u,mo as d,qn as f,qs as p,tl as m,zn as h}from"../chunks/c-CIXE4Nkk.js";const g=[{value:`standard`,label:`Standard`},{value:`express`,label:`Express`},{value:`overnight`,label:`Overnight`}];function _(){return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(o,{htmlFor:`shipping-speed`,children:`Shipping speed`}),/* @__PURE__ */ m(s,{id:`shipping-speed`,defaultValue:`standard`,children:g.map(e=>/* @__PURE__ */ m(o,{children:[/* @__PURE__ */ m(c,{value:e.value,children:/* @__PURE__ */ m(l,{})}),e.label]},e.value))})]})}function v(){return/* @__PURE__ */ m(t,{id:`volume`,defaultValue:75,children:[/* @__PURE__ */ m(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ m(o,{htmlFor:`volume`,children:`Volume`}),/* @__PURE__ */ m(e,{})]}),/* @__PURE__ */ m(n,{children:/* @__PURE__ */ m(h,{children:[/* @__PURE__ */ m(i,{}),/* @__PURE__ */ m(a,{})]})})]})}function y(){return/* @__PURE__ */ m(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ m(r,{id:`updates`,children:/* @__PURE__ */ m(f,{})}),/* @__PURE__ */ m(o,{htmlFor:`updates`,children:`Email me product updates`})]})}function b(){return/* @__PURE__ */ m(o,{children:[/* @__PURE__ */ m(d,{children:/* @__PURE__ */ m(u,{children:/* @__PURE__ */ m(p,{"aria-hidden":`true`})})}),`Accept terms and conditions`]})}var x={name:`label`,title:`Label`,description:`Name any control with a label, and let a press on the label reach it.`,sections:[{heading:null,text:"A plain `<label>` only reaches inputs, buttons and selects. Label names any control by its `htmlFor`, including a radio group or a slider, and a press on the label moves focus into it.",examples:[{id:`label/basic`,caption:`Press Shipping speed. Focus moves to the checked option, and a screen reader names the group Shipping speed.`,Example:_,source:`import { Label } from "@ui-sdk/react/label"
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
`}]},{heading:`Slider`,text:`A label for a slider names its thumb, so the thumb reads as Volume, and a press on the label focuses it.`,examples:[{id:`label/slider`,caption:`Press Volume, then use the arrow keys. The thumb moves, and a screen reader reads it as Volume.`,Example:v,source:`import { Label } from "@ui-sdk/react/label"
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
`}]},{heading:`Switch`,text:`Point the label at a switch beside it. A press on the label turns the switch on and off.`,examples:[{id:`label/switch`,caption:`Press Email me product updates. The switch turns on.`,Example:y,source:`import { Label } from "@ui-sdk/react/label"
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
`}]},{heading:`Wrapping a Control`,text:"Put the control inside the label instead of pointing at it, and you need no `id`.",examples:[{id:`label/wrap`,caption:`Press Accept terms and conditions. The checkbox checks, and a double click doesn't select the text.`,Example:b,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]}]};export{x as default};