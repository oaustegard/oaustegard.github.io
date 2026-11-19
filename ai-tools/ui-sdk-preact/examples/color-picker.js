import{t as e}from"../chunks/c-Bnrfo8pz.js";import{useLog as t}from"./log.js";import*as n from"preact/compat";import{jsx as r,jsxs as i}from"preact/compat/jsx-runtime";import{Field as a,FieldLabel as o}from"ui-sdk/field.js";import{Popover as s,PopoverContent as c,PopoverTrigger as l}from"ui-sdk/popover.js";import{formatColor as u,parseColor as d}from"ui-sdk/color.js";import{ColorPicker as f,ColorPickerArea as p,ColorPickerAreaCanvas as m,ColorPickerAreaThumb as h,ColorPickerChannelInput as g,ColorPickerEyeDropper as _,ColorPickerInput as v,ColorPickerSlider as y,ColorPickerSliderThumb as b,ColorPickerSwatch as x,ColorPickerSwatchItem as S,ColorPickerSwatches as C,createColorPickerController as w}from"ui-sdk/color-picker.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const T={name:`pipette`,size:24,node:[[`path`,{d:`m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12`,key:`1y3wsu`}],[`path`,{d:`m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z`,key:`110lr1`}],[`path`,{d:`m2 22 .414-.414`,key:`jhxm08`}]]};T.node;const E=e(T),D=[{label:`Hex`,value:`hex`},{label:`RGB`,value:`srgb`},{label:`HSL`,value:`hsl`},{label:`OKLCH`,value:`oklch`}],O=[`#ef4444`,`#f97316`,`#eab308`,`#22c55e`,`#0ea5e9`,`#6366f1`,`#a855f7`,`#ec4899`];function k(){let[e,t]=n.useState(`hex`),[a,o]=n.useState(`#0ea5e9`);function s(e){t(e),o(u(d(a),e))}return/* @__PURE__ */ i(f,{"aria-label":`Brand color`,format:e,value:a,onValueChange:o,children:[/* @__PURE__ */ r(p,{children:/* @__PURE__ */ r(h,{})}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(_,{"aria-label":`Pick from screen`,children:/* @__PURE__ */ r(E,{"aria-hidden":`true`})}),/* @__PURE__ */ i(`div`,{"data-slot":`color-picker-sliders`,children:[/* @__PURE__ */ r(y,{channel:`hue`,children:/* @__PURE__ */ r(b,{})}),/* @__PURE__ */ r(y,{channel:`alpha`,children:/* @__PURE__ */ r(b,{})})]}),/* @__PURE__ */ r(x,{})]}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(`select`,{"aria-label":`Format`,value:e,onChange:e=>s(e.target.value),children:D.map(e=>/* @__PURE__ */ r(`option`,{value:e.value,children:e.label},e.value))}),/* @__PURE__ */ r(v,{"aria-label":`Color`})]}),/* @__PURE__ */ r(C,{"aria-label":`Presets`,children:O.map(e=>/* @__PURE__ */ r(S,{value:e},e))})]})}function A(){return/* @__PURE__ */ i(f,{"aria-label":`Accent`,space:`oklch`,defaultValue:`oklch(0.62 0.19 259)`,children:[/* @__PURE__ */ i(p,{children:[/* @__PURE__ */ r(m,{}),/* @__PURE__ */ r(h,{})]}),/* @__PURE__ */ r(y,{channel:`hue`,children:/* @__PURE__ */ r(b,{})}),/* @__PURE__ */ r(y,{channel:`alpha`,children:/* @__PURE__ */ r(b,{})}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(x,{}),/* @__PURE__ */ r(v,{"aria-label":`OKLCH`})]})]})}const j=[`#ef4444`,`#f97316`,`#eab308`,`#22c55e`,`#0ea5e9`,`#6366f1`,`#a855f7`,`#ec4899`];function M(){return/* @__PURE__ */ i(f,{"aria-label":`Label color`,space:`srgb`,format:`hex`,defaultValue:`#0ea5e9`,children:[/* @__PURE__ */ r(C,{"aria-label":`Presets`,children:j.map(e=>/* @__PURE__ */ r(S,{value:e},e))}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(g,{channel:`red`}),/* @__PURE__ */ r(g,{channel:`green`}),/* @__PURE__ */ r(g,{channel:`blue`}),/* @__PURE__ */ r(_,{"aria-label":`Pick from screen`,children:/* @__PURE__ */ r(E,{"aria-hidden":`true`})})]})]})}function N(){return/* @__PURE__ */ r(f,{"aria-label":`Background`,defaultValue:`#22c55e`,children:/* @__PURE__ */ i(s,{children:[/* @__PURE__ */ r(l,{"aria-label":`Background`,children:/* @__PURE__ */ r(x,{})}),/* @__PURE__ */ i(c,{children:[/* @__PURE__ */ r(p,{children:/* @__PURE__ */ r(h,{})}),/* @__PURE__ */ r(y,{channel:`hue`,children:/* @__PURE__ */ r(b,{})}),/* @__PURE__ */ r(v,{"aria-label":`Hex`})]})]})})}function P(){return/* @__PURE__ */ i(f,{"aria-label":`Brand color`,defaultValue:`#0ea5e9`,disabled:!0,children:[/* @__PURE__ */ r(p,{children:/* @__PURE__ */ r(h,{})}),/* @__PURE__ */ r(y,{channel:`hue`,children:/* @__PURE__ */ r(b,{})}),/* @__PURE__ */ r(v,{"aria-label":`Hex`})]})}function F(){let e=t(),[a]=n.useState(()=>w()),[o,s]=n.useState(`#0ea5e9`);return/* @__PURE__ */ i(`div`,{children:[/* @__PURE__ */ r(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>a.setValue(`#663399`),children:`Use Purple`})}),/* @__PURE__ */ i(f,{"aria-label":`Theme color`,value:o,onValueChange:e=>s(e),onValueCommit:(t,n)=>e(`committed: ${t} (${n.reason})`),controller:a,children:[/* @__PURE__ */ r(p,{children:/* @__PURE__ */ r(h,{})}),/* @__PURE__ */ r(y,{channel:`hue`,children:/* @__PURE__ */ r(b,{})}),/* @__PURE__ */ r(v,{"aria-label":`Hex`})]})]})}function I(){let e=t();return/* @__PURE__ */ i(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Submitted brand=${new FormData(t.currentTarget).get(`brand`)}`)},children:[/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(o,{children:`Brand color`}),/* @__PURE__ */ i(f,{name:`brand`,defaultValue:`#f97316`,children:[/* @__PURE__ */ r(p,{children:/* @__PURE__ */ r(h,{})}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(x,{}),/* @__PURE__ */ r(y,{channel:`hue`,children:/* @__PURE__ */ r(b,{})})]})]})]}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`}),/* @__PURE__ */ r(`button`,{type:`reset`,children:`Reset`})]})]})}var L={name:`color-picker`,title:`Color Picker`,description:`Choose a color by dragging across an area and along sliders, typing any CSS color, or picking a preset.`,sections:[{heading:null,text:`Use a color picker to choose a color, like a brand or theme color. The value is a CSS color string, and every part edits it: an area for two channels at once, a slider per channel, a text input that reads any CSS color, and presets.`,examples:[{id:`color-picker/basic`,caption:`Drag across the area or along the sliders, or choose a preset. Choose HSL to write the color another way, or type one like rebeccapurple and press Enter.`,Example:k,source:`"use client"

import * as React from "react"
import { formatColor, parseColor, type ColorFormat } from "@ui-sdk/react/color"
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
} from "@ui-sdk/react/color-picker"
import { Pipette } from "lucide-react"

const formats: { label: string; value: ColorFormat }[] = [
  { label: "Hex", value: "hex" },
  { label: "RGB", value: "srgb" },
  { label: "HSL", value: "hsl" },
  { label: "OKLCH", value: "oklch" },
]

const presets = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
]

function Example() {
  const [format, setFormat] = React.useState<ColorFormat>("hex")
  const [value, setValue] = React.useState("#0ea5e9")

  function changeFormat(next: ColorFormat) {
    setFormat(next)
    setValue(formatColor(parseColor(value)!, next))
  }

  return (
    <ColorPicker
      aria-label="Brand color"
      format={format}
      value={value}
      onValueChange={setValue}
    >
      <ColorPickerArea>
        <ColorPickerAreaThumb />
      </ColorPickerArea>
      <div data-slot="row">
        <ColorPickerEyeDropper aria-label="Pick from screen">
          <Pipette aria-hidden="true" />
        </ColorPickerEyeDropper>
        <div data-slot="color-picker-sliders">
          <ColorPickerSlider channel="hue">
            <ColorPickerSliderThumb />
          </ColorPickerSlider>
          <ColorPickerSlider channel="alpha">
            <ColorPickerSliderThumb />
          </ColorPickerSlider>
        </div>
        <ColorPickerSwatch />
      </div>
      <div data-slot="row">
        <select
          aria-label="Format"
          value={format}
          onChange={(event) => changeFormat(event.target.value as ColorFormat)}
        >
          {formats.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ColorPickerInput aria-label="Color" />
      </div>
      <ColorPickerSwatches aria-label="Presets">
        {presets.map((preset) => (
          <ColorPickerSwatchItem key={preset} value={preset} />
        ))}
      </ColorPickerSwatches>
    </ColorPicker>
  )
}

export { Example }
`}]},{heading:`OKLCH`,text:"OKLCH spaces its colors evenly for the eye, so two colors with the same lightness look equally bright. Its edge with the colors a screen can show is a curve, which no gradient can draw. Add `ColorPickerAreaCanvas` to the area, and it paints the colors inside that edge and leaves the rest clear.",examples:[{id:`color-picker/oklch`,caption:`Drag the thumb right, past the painted edge, and let go. The thumb moves back to the closest color inside.`,Example:A,source:`"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaCanvas,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
} from "@ui-sdk/react/color-picker"

function Example() {
  return (
    <ColorPicker
      aria-label="Accent"
      space="oklch"
      defaultValue="oklch(0.62 0.19 259)"
    >
      <ColorPickerArea>
        <ColorPickerAreaCanvas />
        <ColorPickerAreaThumb />
      </ColorPickerArea>
      <ColorPickerSlider channel="hue">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <ColorPickerSlider channel="alpha">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <div data-slot="row">
        <ColorPickerSwatch />
        <ColorPickerInput aria-label="OKLCH" />
      </div>
    </ColorPicker>
  )
}

export { Example }
`}]},{heading:`Presets and Channel Inputs`,text:"Put `ColorPickerSwatchItem`s inside `ColorPickerSwatches` for preset colors. Each one is selected while the value is its color, however either is written, so `#0000ff` selects `rgb(0 0 255)`. The list is one tab stop, and the arrow keys move between the presets.",examples:[{id:`color-picker/swatches`,caption:`Choose a preset, or use the arrow keys between them. Type 255 into the first number to set red.`,Example:M,source:`"use client"

import {
  ColorPicker,
  ColorPickerChannelInput,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
} from "@ui-sdk/react/color-picker"
import { Pipette } from "lucide-react"

const presets = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
]

function Example() {
  return (
    <ColorPicker
      aria-label="Label color"
      space="srgb"
      format="hex"
      defaultValue="#0ea5e9"
    >
      <ColorPickerSwatches aria-label="Presets">
        {presets.map((preset) => (
          <ColorPickerSwatchItem key={preset} value={preset} />
        ))}
      </ColorPickerSwatches>
      <div data-slot="row">
        <ColorPickerChannelInput channel="red" />
        <ColorPickerChannelInput channel="green" />
        <ColorPickerChannelInput channel="blue" />
        <ColorPickerEyeDropper aria-label="Pick from screen">
          <Pipette aria-hidden="true" />
        </ColorPickerEyeDropper>
      </div>
    </ColorPicker>
  )
}

export { Example }
`}]},{heading:`Popover`,text:"Put a `Popover` inside the picker to open it from a swatch. The parts inside the popup edit the same color, and the swatch in the trigger shows it.",examples:[{id:`color-picker/popover`,caption:`Press the Background swatch to open the picker, then drag to change the color.`,Example:N,source:`"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
} from "@ui-sdk/react/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover"

function Example() {
  return (
    <ColorPicker aria-label="Background" defaultValue="#22c55e">
      <Popover>
        <PopoverTrigger aria-label="Background">
          <ColorPickerSwatch />
        </PopoverTrigger>
        <PopoverContent>
          <ColorPickerArea>
            <ColorPickerAreaThumb />
          </ColorPickerArea>
          <ColorPickerSlider channel="hue">
            <ColorPickerSliderThumb />
          </ColorPickerSlider>
          <ColorPickerInput aria-label="Hex" />
        </PopoverContent>
      </Popover>
    </ColorPicker>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled`. A disabled picker can't be focused or changed, and isn't submitted. A disabled `<fieldset>` around it disables it too.",examples:[{id:`color-picker/disabled`,caption:`The thumbs can't be focused or dragged.`,Example:P,source:`"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
} from "@ui-sdk/react/color-picker"

function Example() {
  return (
    <ColorPicker aria-label="Brand color" defaultValue="#0ea5e9" disabled>
      <ColorPickerArea>
        <ColorPickerAreaThumb />
      </ColorPickerArea>
      <ColorPickerSlider channel="hue">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <ColorPickerInput aria-label="Hex" />
    </ColorPicker>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. Each change carries a reason, like `drag`, `step-key` or `input-commit`, and `details.color`, the color the parts hold, which keeps a hue while the value turns gray. Call `details.cancel()` in the callback to keep the current value.",examples:[{id:`color-picker/controlled`,caption:`Drag across the area and let go, or press Use Purple. The console logs each committed color and its reason.`,Example:F,source:`"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  createColorPickerController,
} from "@ui-sdk/react/color-picker"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [picker] = React.useState(() => createColorPickerController())
  const [value, setValue] = React.useState("#0ea5e9")

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => picker.setValue("#663399")}>
          Use Purple
        </button>
      </div>
      <ColorPicker
        aria-label="Theme color"
        value={value}
        onValueChange={(next) => setValue(next)}
        onValueCommit={(next, details) =>
          log(\`committed: \${next} (\${details.reason})\`)
        }
        controller={picker}
      >
        <ColorPickerArea>
          <ColorPickerAreaThumb />
        </ColorPickerArea>
        <ColorPickerSlider channel="hue">
          <ColorPickerSliderThumb />
        </ColorPickerSlider>
        <ColorPickerInput aria-label="Hex" />
      </ColorPicker>
    </div>
  )
}

export { Example }
`}]},{heading:`Form`,text:"The hidden input submits the value under `name`, like `#f97316`, and a disabled picker submits nothing. A form reset returns it to `defaultValue`. Set `form` to join a form by its id.",examples:[{id:`color-picker/form`,caption:`Change the color and press Save to log the submitted value. Reset restores the orange.`,Example:I,source:`"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
} from "@ui-sdk/react/color-picker"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(\`Submitted brand=\${new FormData(event.currentTarget).get("brand")}\`)
      }}
    >
      <Field>
        <FieldLabel>Brand color</FieldLabel>
        <ColorPicker name="brand" defaultValue="#f97316">
          <ColorPickerArea>
            <ColorPickerAreaThumb />
          </ColorPickerArea>
          <div data-slot="row">
            <ColorPickerSwatch />
            <ColorPickerSlider channel="hue">
              <ColorPickerSliderThumb />
            </ColorPickerSlider>
          </div>
        </ColorPicker>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Save
        </button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
`}]}]};export{L as default};