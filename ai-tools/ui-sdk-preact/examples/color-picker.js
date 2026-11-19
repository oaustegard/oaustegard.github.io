import{$n as e,Co as t,Mo as n,Oo as r,ar as i,cr as a,da as o,dr as s,er as c,fl as l,fr as u,ir as d,lr as f,ma as p,nr as m,or as h,os as g,pr as _,rr as v,sr as y,tl as b,tr as x,ur as S,va as C}from"../chunks/c-CIXE4Nkk.js";const w=[{label:`Hex`,value:`hex`},{label:`RGB`,value:`srgb`},{label:`HSL`,value:`hsl`},{label:`OKLCH`,value:`oklch`}],T=[`#ef4444`,`#f97316`,`#eab308`,`#22c55e`,`#0ea5e9`,`#6366f1`,`#a855f7`,`#ec4899`];function E(){let[t,n]=l(`hex`),[r,o]=l(`#0ea5e9`);function s(e){n(e),o(_(u(r),e))}return/* @__PURE__ */ b(e,{"aria-label":`Brand color`,format:t,value:r,onValueChange:o,children:[/* @__PURE__ */ b(c,{children:/* @__PURE__ */ b(m,{})}),/* @__PURE__ */ b(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ b(d,{"aria-label":`Pick from screen`,children:/* @__PURE__ */ b(g,{"aria-hidden":`true`})}),/* @__PURE__ */ b(`div`,{"data-slot":`color-picker-sliders`,children:[/* @__PURE__ */ b(h,{channel:`hue`,children:/* @__PURE__ */ b(y,{})}),/* @__PURE__ */ b(h,{channel:`alpha`,children:/* @__PURE__ */ b(y,{})})]}),/* @__PURE__ */ b(a,{})]}),/* @__PURE__ */ b(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ b(`select`,{"aria-label":`Format`,value:t,onChange:e=>s(e.target.value),children:w.map(e=>/* @__PURE__ */ b(`option`,{value:e.value,children:e.label},e.value))}),/* @__PURE__ */ b(i,{"aria-label":`Color`})]}),/* @__PURE__ */ b(S,{"aria-label":`Presets`,children:T.map(e=>/* @__PURE__ */ b(f,{value:e},e))})]})}function D(){return/* @__PURE__ */ b(e,{"aria-label":`Accent`,space:`oklch`,defaultValue:`oklch(0.62 0.19 259)`,children:[/* @__PURE__ */ b(c,{children:[/* @__PURE__ */ b(x,{}),/* @__PURE__ */ b(m,{})]}),/* @__PURE__ */ b(h,{channel:`hue`,children:/* @__PURE__ */ b(y,{})}),/* @__PURE__ */ b(h,{channel:`alpha`,children:/* @__PURE__ */ b(y,{})}),/* @__PURE__ */ b(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ b(a,{}),/* @__PURE__ */ b(i,{"aria-label":`OKLCH`})]})]})}const O=[`#ef4444`,`#f97316`,`#eab308`,`#22c55e`,`#0ea5e9`,`#6366f1`,`#a855f7`,`#ec4899`];function k(){return/* @__PURE__ */ b(e,{"aria-label":`Label color`,space:`srgb`,format:`hex`,defaultValue:`#0ea5e9`,children:[/* @__PURE__ */ b(S,{"aria-label":`Presets`,children:O.map(e=>/* @__PURE__ */ b(f,{value:e},e))}),/* @__PURE__ */ b(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ b(v,{channel:`red`}),/* @__PURE__ */ b(v,{channel:`green`}),/* @__PURE__ */ b(v,{channel:`blue`}),/* @__PURE__ */ b(d,{"aria-label":`Pick from screen`,children:/* @__PURE__ */ b(g,{"aria-hidden":`true`})})]})]})}function A(){return/* @__PURE__ */ b(e,{"aria-label":`Background`,defaultValue:`#22c55e`,children:/* @__PURE__ */ b(o,{children:[/* @__PURE__ */ b(C,{"aria-label":`Background`,children:/* @__PURE__ */ b(a,{})}),/* @__PURE__ */ b(p,{children:[/* @__PURE__ */ b(c,{children:/* @__PURE__ */ b(m,{})}),/* @__PURE__ */ b(h,{channel:`hue`,children:/* @__PURE__ */ b(y,{})}),/* @__PURE__ */ b(i,{"aria-label":`Hex`})]})]})})}function j(){return/* @__PURE__ */ b(e,{"aria-label":`Brand color`,defaultValue:`#0ea5e9`,disabled:!0,children:[/* @__PURE__ */ b(c,{children:/* @__PURE__ */ b(m,{})}),/* @__PURE__ */ b(h,{channel:`hue`,children:/* @__PURE__ */ b(y,{})}),/* @__PURE__ */ b(i,{"aria-label":`Hex`})]})}function M(){let t=n(),[r]=l(()=>s()),[a,o]=l(`#0ea5e9`);return/* @__PURE__ */ b(`div`,{children:[/* @__PURE__ */ b(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ b(`button`,{type:`button`,onClick:()=>r.setValue(`#663399`),children:`Use Purple`})}),/* @__PURE__ */ b(e,{"aria-label":`Theme color`,value:a,onValueChange:e=>o(e),onValueCommit:(e,n)=>t(`committed: ${e} (${n.reason})`),controller:r,children:[/* @__PURE__ */ b(c,{children:/* @__PURE__ */ b(m,{})}),/* @__PURE__ */ b(h,{channel:`hue`,children:/* @__PURE__ */ b(y,{})}),/* @__PURE__ */ b(i,{"aria-label":`Hex`})]})]})}function N(){let i=n();return/* @__PURE__ */ b(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault(),i(`Submitted brand=${new FormData(e.currentTarget).get(`brand`)}`)},children:[/* @__PURE__ */ b(t,{children:[/* @__PURE__ */ b(r,{children:`Brand color`}),/* @__PURE__ */ b(e,{name:`brand`,defaultValue:`#f97316`,children:[/* @__PURE__ */ b(c,{children:/* @__PURE__ */ b(m,{})}),/* @__PURE__ */ b(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ b(a,{}),/* @__PURE__ */ b(h,{channel:`hue`,children:/* @__PURE__ */ b(y,{})})]})]})]}),/* @__PURE__ */ b(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ b(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`}),/* @__PURE__ */ b(`button`,{type:`reset`,children:`Reset`})]})]})}var P={name:`color-picker`,title:`Color Picker`,description:`Choose a color by dragging across an area and along sliders, typing any CSS color, or picking a preset.`,sections:[{heading:null,text:`Use a color picker to choose a color, like a brand or theme color. The value is a CSS color string, and every part edits it: an area for two channels at once, a slider per channel, a text input that reads any CSS color, and presets.`,examples:[{id:`color-picker/basic`,caption:`Drag across the area or along the sliders, or choose a preset. Choose HSL to write the color another way, or type one like rebeccapurple and press Enter.`,Example:E,source:`"use client"

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
`}]},{heading:`OKLCH`,text:"OKLCH spaces its colors evenly for the eye, so two colors with the same lightness look equally bright. Its edge with the colors a screen can show is a curve, which no gradient can draw. Add `ColorPickerAreaCanvas` to the area, and it paints the colors inside that edge and leaves the rest clear.",examples:[{id:`color-picker/oklch`,caption:`Drag the thumb right, past the painted edge, and let go. The thumb moves back to the closest color inside.`,Example:D,source:`"use client"

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
`}]},{heading:`Presets and Channel Inputs`,text:"Put `ColorPickerSwatchItem`s inside `ColorPickerSwatches` for preset colors. Each one is selected while the value is its color, however either is written, so `#0000ff` selects `rgb(0 0 255)`. The list is one tab stop, and the arrow keys move between the presets.",examples:[{id:`color-picker/swatches`,caption:`Choose a preset, or use the arrow keys between them. Type 255 into the first number to set red.`,Example:k,source:`"use client"

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
`}]},{heading:`Popover`,text:"Put a `Popover` inside the picker to open it from a swatch. The parts inside the popup edit the same color, and the swatch in the trigger shows it.",examples:[{id:`color-picker/popover`,caption:`Press the Background swatch to open the picker, then drag to change the color.`,Example:A,source:`"use client"

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
`}]},{heading:`Disabled`,text:"Set `disabled`. A disabled picker can't be focused or changed, and isn't submitted. A disabled `<fieldset>` around it disables it too.",examples:[{id:`color-picker/disabled`,caption:`The thumbs can't be focused or dragged.`,Example:j,source:`"use client"

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
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. Each change carries a reason, like `drag`, `step-key` or `input-commit`, and `details.color`, the color the parts hold, which keeps a hue while the value turns gray. Call `details.cancel()` in the callback to keep the current value.",examples:[{id:`color-picker/controlled`,caption:`Drag across the area and let go, or press Use Purple. The console logs each committed color and its reason.`,Example:M,source:`"use client"

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
`}]},{heading:`Form`,text:"The hidden input submits the value under `name`, like `#f97316`, and a disabled picker submits nothing. A form reset returns it to `defaultValue`. Set `form` to join a form by its id.",examples:[{id:`color-picker/form`,caption:`Change the color and press Save to log the submitted value. Reset restores the orange.`,Example:N,source:`"use client"

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
`}]}]};export{P as default};