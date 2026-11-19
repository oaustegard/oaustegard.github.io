import{Ai as e,Bo as t,Go as n,Jo as r,Ko as i,Mi as a,Ss as o,Wo as s,Xs as c,Zs as l,bs as u,ji as d,tl as f}from"../chunks/c-CIXE4Nkk.js";function p(){return/* @__PURE__ */ f(`div`,{"data-slot":`card`,children:[/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ f(`h3`,{children:`Q3 Roadmap`}),/* @__PURE__ */ f(`p`,{"data-slot":`hint`,children:`Edited by Hollis Grant`})]}),/* @__PURE__ */ f(e,{"aria-label":`Star`,children:/* @__PURE__ */ f(a,{"data-variant":`fill`,children:/* @__PURE__ */ f(r,{})})})]})}function m(){return/* @__PURE__ */ f(d,{multiple:!0,"aria-label":`Text formatting`,children:[/* @__PURE__ */ f(e,{value:`bold`,"aria-label":`Bold`,children:/* @__PURE__ */ f(a,{children:/* @__PURE__ */ f(l,{})})}),/* @__PURE__ */ f(e,{value:`italic`,"aria-label":`Italic`,children:/* @__PURE__ */ f(a,{children:/* @__PURE__ */ f(u,{})})}),/* @__PURE__ */ f(e,{value:`underline`,"aria-label":`Underline`,children:/* @__PURE__ */ f(a,{children:/* @__PURE__ */ f(t,{})})})]})}const h=[{value:`start`,label:`Align start`,icon:s,mirror:!0},{value:`center`,label:`Align center`,icon:i,mirror:!1},{value:`end`,label:`Align end`,icon:n,mirror:!0}];function g(){return/* @__PURE__ */ f(d,{defaultValue:[`start`],deselectable:!1,"aria-label":`Text alignment`,children:h.map(t=>/* @__PURE__ */ f(e,{value:t.value,"aria-label":t.label,children:/* @__PURE__ */ f(a,{mirror:t.mirror,children:/* @__PURE__ */ f(t.icon,{})})},t.value))})}function _(){return/* @__PURE__ */ f(e,{"aria-label":`Favorite`,render:(e,t)=>/* @__PURE__ */ f(`button`,{...e,children:/* @__PURE__ */ f(a,{children:/* @__PURE__ */ f(o,{fill:t.pressed?`currentColor`:`none`})})})})}function v(){return/* @__PURE__ */ f(e,{"data-variant":`outline`,children:`Bookmark`})}const y=[{value:`list`,label:`قائمة`},{value:`grid`,label:`شبكة`},{value:`cards`,label:`بطاقات`}];function b(){return/* @__PURE__ */ f(`div`,{dir:`rtl`,children:/* @__PURE__ */ f(d,{defaultValue:[`list`],"aria-label":`العرض`,children:y.map(t=>/* @__PURE__ */ f(e,{value:t.value,children:t.label},t.value))})})}function x(){return/* @__PURE__ */ f(`div`,{dir:`rtl`,children:/* @__PURE__ */ f(e,{children:[/* @__PURE__ */ f(a,{"data-variant":`fill`,children:/* @__PURE__ */ f(c,{})}),`إشارة مرجعية`]})})}var S={name:`toggle`,title:`Toggle`,description:`Keep a button pressed, or group toggles with a shared value and arrow-key navigation.`,sections:[{heading:null,text:`Use a toggle for a button that stays on until you press it again, like starring a document or turning on Bold. Put several in a toggle group to share one value, as a text editor's formatting buttons or a view switcher do.`,examples:[{id:`toggle/basic`,caption:`Press the star beside Q3 Roadmap, or focus it and press Enter or Space. It fills in while pressed, and its accessible name stays Star.`,Example:p,source:`import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
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
`}]},{heading:`Group`,text:"Put toggles in a `ToggleGroup`, from the same `@ui-sdk/react/toggle` entry, to share a value and arrow-key navigation. Give the group an accessible name and each toggle a `value`. Set `multiple` to let several toggles stay pressed.",examples:[{id:`toggle/group`,caption:`Press Bold and Italic to keep both pressed. Left and Right move focus without changing either.`,Example:m,source:`import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
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
`}]},{heading:`Single Selection`,text:"Without `multiple`, pressing a toggle unpresses the others. Pressing the pressed toggle again clears the selection, unless you set `deselectable` to `false`, as this alignment group does. `deselectable` doesn't choose an initial value for you, so pair it with `defaultValue`.",examples:[{id:`toggle/group-single`,caption:`Press Align center to replace Align start, then press Align center again. One alignment always stays pressed.`,Example:g,source:`import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
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
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. A toggle's state has `pressed`, and a group's has `value`, its pressed values. Keep the part's props on the button, so its `aria-pressed` and keyboard behavior stay connected. See Parts and Composition for the rendering contract.",examples:[{id:`toggle/render`,caption:`Press Favorite. The heart renders filled or empty from the toggle's pressed state.`,Example:_,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`toggle/first-component`,caption:``,Example:v,source:`import { Toggle } from "@ui-sdk/react/toggle"

function Example() {
  return <Toggle data-variant="outline">Bookmark</Toggle>
}

export { Example }
`},{id:`toggle/group-rtl`,caption:``,Example:b,source:`import { Toggle, ToggleGroup } from "@ui-sdk/react/toggle"

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
`},{id:`toggle/rtl`,caption:``,Example:x,source:`import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
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
`}]}]};export{S as default};