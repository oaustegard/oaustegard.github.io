import{t as e}from"../chunks/c-Bnrfo8pz.js";import{n as t,r as n,t as r}from"../chunks/c-DBckuTC-.js";import{t as i}from"../chunks/c-SLWFZkCM.js";import{t as a}from"../chunks/c-C1ErRzDB.js";import{n as o,r as s,t as c}from"../chunks/c-u-NNRFH-.js";import{jsx as l,jsxs as u}from"preact/compat/jsx-runtime";import{Toggle as d,ToggleGroup as f,ToggleIcon as p}from"ui-sdk/toggle.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const m={name:`heart`,size:24,node:[[`path`,{d:`M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5`,key:`mvr1a0`}]]};m.node;const h=e(m);function g(){return/* @__PURE__ */ u(`div`,{"data-slot":`card`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ l(`h3`,{children:`Q3 Roadmap`}),/* @__PURE__ */ l(`p`,{"data-slot":`hint`,children:`Edited by Hollis Grant`})]}),/* @__PURE__ */ l(d,{"aria-label":`Star`,children:/* @__PURE__ */ l(p,{"data-variant":`fill`,children:/* @__PURE__ */ l(a,{})})})]})}function _(){return/* @__PURE__ */ u(f,{multiple:!0,"aria-label":`Text formatting`,children:[/* @__PURE__ */ l(d,{value:`bold`,"aria-label":`Bold`,children:/* @__PURE__ */ l(p,{children:/* @__PURE__ */ l(n,{})})}),/* @__PURE__ */ l(d,{value:`italic`,"aria-label":`Italic`,children:/* @__PURE__ */ l(p,{children:/* @__PURE__ */ l(t,{})})}),/* @__PURE__ */ l(d,{value:`underline`,"aria-label":`Underline`,children:/* @__PURE__ */ l(p,{children:/* @__PURE__ */ l(r,{})})})]})}const v=[{value:`start`,label:`Align start`,icon:c,mirror:!0},{value:`center`,label:`Align center`,icon:s,mirror:!1},{value:`end`,label:`Align end`,icon:o,mirror:!0}];function y(){return/* @__PURE__ */ l(f,{defaultValue:[`start`],deselectable:!1,"aria-label":`Text alignment`,children:v.map(e=>/* @__PURE__ */ l(d,{value:e.value,"aria-label":e.label,children:/* @__PURE__ */ l(p,{mirror:e.mirror,children:/* @__PURE__ */ l(e.icon,{})})},e.value))})}function b(){return/* @__PURE__ */ l(d,{"aria-label":`Favorite`,render:(e,t)=>/* @__PURE__ */ l(`button`,{...e,children:/* @__PURE__ */ l(p,{children:/* @__PURE__ */ l(h,{fill:t.pressed?`currentColor`:`none`})})})})}function x(){return/* @__PURE__ */ l(d,{"data-variant":`outline`,children:`Bookmark`})}const S=[{value:`list`,label:`قائمة`},{value:`grid`,label:`شبكة`},{value:`cards`,label:`بطاقات`}];function C(){return/* @__PURE__ */ l(`div`,{dir:`rtl`,children:/* @__PURE__ */ l(f,{defaultValue:[`list`],"aria-label":`العرض`,children:S.map(e=>/* @__PURE__ */ l(d,{value:e.value,children:e.label},e.value))})})}function w(){return/* @__PURE__ */ l(`div`,{dir:`rtl`,children:/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ l(p,{"data-variant":`fill`,children:/* @__PURE__ */ l(i,{})}),`إشارة مرجعية`]})})}var T={name:`toggle`,title:`Toggle`,description:`Keep a button pressed, or group toggles with a shared value and arrow-key navigation.`,sections:[{heading:null,text:`Use a toggle for a button that stays on until you press it again, like starring a document or turning on Bold. Put several in a toggle group to share one value, as a text editor's formatting buttons or a view switcher do.`,examples:[{id:`toggle/basic`,caption:`Press the star beside Q3 Roadmap, or focus it and press Enter or Space. It fills in while pressed, and its accessible name stays Star.`,Example:g,source:`import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <div data-slot="card">
      <div data-slot="stack">
        <h3>Q3 Roadmap</h3>
        <p data-slot="hint">Edited by Hollis Grant</p>
      </div>
      <Toggle aria-label="Star">
        <ToggleIcon data-variant="fill">
          <StarIcon />
        </ToggleIcon>
      </Toggle>
    </div>
  )
}

export { Example }
`}]},{heading:`Group`,text:"Put toggles in a `ToggleGroup`, from the same `@ui-sdk/react/toggle` entry, to share a value and arrow-key navigation. Give the group an accessible name and each toggle a `value`. Set `multiple` to let several toggles stay pressed.",examples:[{id:`toggle/group`,caption:`Press Bold and Italic to keep both pressed. Left and Right move focus without changing either.`,Example:_,source:`import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"

function Example() {
  return (
    <ToggleGroup multiple aria-label="Text formatting">
      <Toggle value="bold" aria-label="Bold">
        <ToggleIcon>
          <BoldIcon />
        </ToggleIcon>
      </Toggle>
      <Toggle value="italic" aria-label="Italic">
        <ToggleIcon>
          <ItalicIcon />
        </ToggleIcon>
      </Toggle>
      <Toggle value="underline" aria-label="Underline">
        <ToggleIcon>
          <UnderlineIcon />
        </ToggleIcon>
      </Toggle>
    </ToggleGroup>
  )
}

export { Example }
`}]},{heading:`Single Selection`,text:"Without `multiple`, pressing a toggle unpresses the others. Pressing the pressed toggle again clears the selection, unless you set `deselectable` to `false`, as this alignment group does. `deselectable` doesn't choose an initial value for you, so pair it with `defaultValue`.",examples:[{id:`toggle/group-single`,caption:`Press Align center to replace Align start, then press Align center again. One alignment always stays pressed.`,Example:y,source:`import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import {
  TextAlignCenterIcon,
  TextAlignEndIcon,
  TextAlignStartIcon,
} from "lucide-react"

const alignments = [
  {
    value: "start",
    label: "Align start",
    icon: TextAlignStartIcon,
    mirror: true,
  },
  {
    value: "center",
    label: "Align center",
    icon: TextAlignCenterIcon,
    mirror: false,
  },
  { value: "end", label: "Align end", icon: TextAlignEndIcon, mirror: true },
]

function Example() {
  return (
    <ToggleGroup
      defaultValue={["start"]}
      deselectable={false}
      aria-label="Text alignment"
    >
      {alignments.map((item) => (
        <Toggle key={item.value} value={item.value} aria-label={item.label}>
          <ToggleIcon mirror={item.mirror}>
            <item.icon />
          </ToggleIcon>
        </Toggle>
      ))}
    </ToggleGroup>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. A toggle's state has `pressed`, and a group's has `value`, its pressed values. Keep the part's props on the button, so its `aria-pressed` and keyboard behavior stay connected. See Parts and Composition for the rendering contract.",examples:[{id:`toggle/render`,caption:`Press Favorite. The heart renders filled or empty from the toggle's pressed state.`,Example:b,source:`"use client"

import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { HeartIcon } from "lucide-react"

function Example() {
  return (
    <Toggle
      aria-label="Favorite"
      render={(props, state) => (
        <button {...props}>
          <ToggleIcon>
            <HeartIcon fill={state.pressed ? "currentColor" : "none"} />
          </ToggleIcon>
        </button>
      )}
    />
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`toggle/first-component`,caption:``,Example:x,source:`import { Toggle } from "@ui-sdk/react/toggle"

function Example() {
  return <Toggle data-variant="outline">Bookmark</Toggle>
}

export { Example }
`},{id:`toggle/group-rtl`,caption:``,Example:C,source:`import { Toggle, ToggleGroup } from "@ui-sdk/react/toggle"

const views = [
  { value: "list", label: "قائمة" },
  { value: "grid", label: "شبكة" },
  { value: "cards", label: "بطاقات" },
]

function Example() {
  return (
    <div dir="rtl">
      <ToggleGroup defaultValue={["list"]} aria-label="العرض">
        {views.map((item) => (
          <Toggle key={item.value} value={item.value}>
            {item.label}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  )
}

export { Example }
`},{id:`toggle/rtl`,caption:``,Example:w,source:`import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { BookmarkIcon } from "lucide-react"

export function Example() {
  return (
    <div dir="rtl">
      <Toggle>
        <ToggleIcon data-variant="fill">
          <BookmarkIcon />
        </ToggleIcon>
        إشارة مرجعية
      </Toggle>
    </div>
  )
}
`}]}]};export{T as default};