import{Ai as e,Bo as t,Ci as n,Di as r,Ei as i,Go as a,Hs as o,Ko as s,Ks as c,Ls as l,Mc as ee,Mi as u,Mo as d,No as f,Oi as p,Pc as m,Po as h,Ps as g,Rc as _,Ti as v,Uo as te,Vo as ne,Wo as re,Xa as y,Yo as b,Zs as x,_i as S,_s as C,as as w,bs as T,do as E,es as D,fl as O,fs as k,gi as A,hi as j,is as M,ji as N,ki as P,mi as F,ps as I,qa as L,qc as R,qs as z,ro as B,ss as V,tl as H,to as ie,uo as U,us as W,vi as G,vs as K,wi as q,yi as J,ys as Y,zo as ae}from"../chunks/c-CIXE4Nkk.js";const oe=[{label:`Bold`,icon:x},{label:`Italic`,icon:T},{label:`Underline`,icon:t}];function se(){let t=d();return/* @__PURE__ */ H(n,{"aria-label":`Formatting`,children:[oe.map(({label:n,icon:r})=>/* @__PURE__ */ H(e,{"aria-label":n,onPressedChange:e=>t(`${n} ${e?`on`:`off`}`),children:/* @__PURE__ */ H(u,{children:/* @__PURE__ */ H(r,{})})},n)),/* @__PURE__ */ H(p,{}),/* @__PURE__ */ H(q,{"aria-label":`Insert link`,onClick:()=>t(`Insert link`),children:/* @__PURE__ */ H(Y,{"aria-hidden":`true`})})]})}const ce=[{value:`left`,label:`Align left`,icon:re},{value:`center`,label:`Align center`,icon:s},{value:`right`,label:`Align right`,icon:a}],X=[{value:`bulleted`,label:`Bulleted list`,icon:C},{value:`numbered`,label:`Numbered list`,icon:K}];function le(){let t=d();return/* @__PURE__ */ H(n,{"aria-label":`Paragraph`,children:[/* @__PURE__ */ H(N,{defaultValue:[`left`],deselectable:!1,"aria-label":`Alignment`,onValueChange:([e])=>t(`Align ${e}`),children:ce.map(({value:t,label:n,icon:r})=>/* @__PURE__ */ H(e,{value:t,"aria-label":n,children:/* @__PURE__ */ H(u,{children:/* @__PURE__ */ H(r,{})})},t))}),/* @__PURE__ */ H(p,{}),/* @__PURE__ */ H(N,{"aria-label":`List`,onValueChange:([e])=>t(X.find(t=>t.value===e)?.label??`No list`),children:X.map(({value:t,label:n,icon:r})=>/* @__PURE__ */ H(e,{value:t,"aria-label":n,children:/* @__PURE__ */ H(u,{children:/* @__PURE__ */ H(r,{})})},t))})]})}const ue=[{label:`Cut`,icon:D},{label:`Copy`,icon:g},{label:`Paste`,icon:l}];function de(){let e=d();return/* @__PURE__ */ H(n,{"aria-label":`Edit`,children:[/* @__PURE__ */ H(v,{"aria-label":`Clipboard`,children:ue.map(({label:t,icon:n})=>/* @__PURE__ */ H(q,{"aria-label":t,onClick:()=>e(t),children:/* @__PURE__ */ H(n,{"aria-hidden":`true`})},t))}),/* @__PURE__ */ H(p,{}),/* @__PURE__ */ H(v,{disabled:!0,"aria-label":`History`,children:[/* @__PURE__ */ H(q,{"aria-label":`Undo`,children:/* @__PURE__ */ H(ae,{"aria-hidden":`true`})}),/* @__PURE__ */ H(q,{"aria-label":`Redo`,children:/* @__PURE__ */ H(M,{"aria-hidden":`true`})})]})]})}function fe(){let e=d();return/* @__PURE__ */ H(n,{"aria-label":`Document`,children:[/* @__PURE__ */ H(q,{onClick:()=>e(`Saved`),children:`Save`}),/* @__PURE__ */ H(ee,{onAction:t=>e(`Shared by ${t}`),children:[/* @__PURE__ */ H(q,{render:/* @__PURE__ */ H(R,{}),children:[`Share`,/* @__PURE__ */ H(c,{"aria-hidden":`true`})]}),/* @__PURE__ */ H(m,{children:[/* @__PURE__ */ H(_,{value:`email`,children:`Email`}),/* @__PURE__ */ H(_,{value:`link`,children:`Copy Link`})]})]}),/* @__PURE__ */ H(q,{onClick:()=>e(`Printed`),children:`Print`})]})}const Z=[`50%`,`75%`,`100%`,`150%`,`200%`];function pe(){let e=d(),[t,r]=O(`100%`),i=Z.indexOf(t),a=t=>{r(t),e(`Zoom ${t}`)};return/* @__PURE__ */ H(n,{"aria-label":`View`,children:[/* @__PURE__ */ H(q,{"aria-label":`Zoom out`,disabled:i===0,onClick:()=>a(Z[i-1]),children:/* @__PURE__ */ H(f,{"aria-hidden":`true`})}),/* @__PURE__ */ H(L,{value:t,onValueChange:e=>e&&a(e),children:[/* @__PURE__ */ H(q,{render:/* @__PURE__ */ H(U,{}),"aria-label":`Zoom`,children:[/* @__PURE__ */ H(E,{}),/* @__PURE__ */ H(o,{"aria-hidden":`true`})]}),/* @__PURE__ */ H(y,{children:Z.map(e=>/* @__PURE__ */ H(ie,{value:e,children:[e,/* @__PURE__ */ H(B,{children:/* @__PURE__ */ H(z,{"aria-hidden":`true`})})]},e))})]}),/* @__PURE__ */ H(q,{"aria-label":`Zoom in`,disabled:i===Z.length-1,onClick:()=>a(Z[i+1]),children:/* @__PURE__ */ H(h,{"aria-hidden":`true`})})]})}function me(){return/* @__PURE__ */ H(n,{"aria-label":`Text`,children:[/* @__PURE__ */ H(j,{defaultValue:14,min:8,max:72,children:/* @__PURE__ */ H(G,{children:[/* @__PURE__ */ H(S,{"aria-label":`Decrease font size`,children:/* @__PURE__ */ H(k,{"aria-hidden":`true`})}),/* @__PURE__ */ H(i,{render:/* @__PURE__ */ H(A,{"aria-label":`Font size`})}),/* @__PURE__ */ H(J,{"aria-label":`Increase font size`,children:/* @__PURE__ */ H(w,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ H(p,{}),/* @__PURE__ */ H(i,{"aria-label":`Find`,placeholder:`Find…`})]})}function Q(){let e=d(),t=t=>{t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||(t.preventDefault(),e(`Opened ${t.currentTarget.textContent}`))};return/* @__PURE__ */ H(n,{"aria-label":`Pull request`,children:[/* @__PURE__ */ H(q,{"aria-label":`Approve`,onClick:()=>e(`Approved`),children:/* @__PURE__ */ H(z,{"aria-hidden":`true`})}),/* @__PURE__ */ H(q,{"aria-label":`Comment`,onClick:()=>e(`Comment`),children:/* @__PURE__ */ H(I,{"aria-hidden":`true`})}),/* @__PURE__ */ H(p,{}),/* @__PURE__ */ H(r,{href:`#files`,onClick:t,children:`Files Changed`}),/* @__PURE__ */ H(r,{href:`#checks`,onClick:t,children:`Checks`})]})}const $=[{value:`select`,label:`Select`,icon:W},{value:`draw`,label:`Draw`,icon:V},{value:`shape`,label:`Shape`,icon:b},{value:`text`,label:`Text`,icon:ne}];function he(){let t=d();return/* @__PURE__ */ H(n,{orientation:`vertical`,"aria-label":`Canvas`,children:[/* @__PURE__ */ H(N,{defaultValue:[`select`],deselectable:!1,orientation:`vertical`,"aria-label":`Tool`,onValueChange:([e])=>t(`${$.find(t=>t.value===e)?.label} tool`),children:$.map(({value:t,label:n,icon:r})=>/* @__PURE__ */ H(e,{value:t,"aria-label":n,children:/* @__PURE__ */ H(u,{children:/* @__PURE__ */ H(r,{})})},t))}),/* @__PURE__ */ H(p,{}),/* @__PURE__ */ H(q,{"aria-label":`Delete`,onClick:()=>t(`Deleted selection`),children:/* @__PURE__ */ H(te,{"aria-hidden":`true`})})]})}function ge(){let e=d();return/* @__PURE__ */ H(n,{"aria-label":`Message`,children:[/* @__PURE__ */ H(q,{onClick:()=>e(`Reply`),children:`Reply`}),/* @__PURE__ */ H(q,{disabled:!0,onClick:()=>e(`Archive`),children:`Archive`}),/* @__PURE__ */ H(q,{disabled:!0,focusableWhenDisabled:!1,onClick:()=>e(`Delete`),children:`Delete`})]})}function _e(){let e=d();return/* @__PURE__ */ H(n,{loop:!1,"aria-label":`Pages`,children:[`First`,`Previous`,`Next`,`Last`].map(t=>/* @__PURE__ */ H(q,{onClick:()=>e(`${t} page`),children:t},t))})}const ve=[{label:`Bold`,icon:x},{label:`Italic`,icon:T},{label:`Insert link`,icon:Y}];function ye(){let e=d(),[t]=O(P);return F(`alt+f10`,()=>t.focus(),{allowInInput:!0}),/* @__PURE__ */ H(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ H(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ H(`button`,{type:`button`,onClick:()=>t.focus(),children:`Focus Toolbar`})}),/* @__PURE__ */ H(n,{controller:t,"aria-label":`Notes formatting`,children:ve.map(({label:t,icon:n})=>/* @__PURE__ */ H(q,{"aria-label":t,onClick:()=>e(t),children:/* @__PURE__ */ H(n,{"aria-hidden":`true`})},t))}),/* @__PURE__ */ H(`textarea`,{"aria-label":`Notes`,placeholder:`Type, then press Alt+F10`})]})}function be(){return/* @__PURE__ */ H(`div`,{dir:`rtl`,children:/* @__PURE__ */ H(n,{"aria-label":`تنسيق`,children:[/* @__PURE__ */ H(e,{"aria-label":`غامق`,children:/* @__PURE__ */ H(u,{children:/* @__PURE__ */ H(x,{})})}),/* @__PURE__ */ H(e,{"aria-label":`مائل`,children:/* @__PURE__ */ H(u,{children:/* @__PURE__ */ H(T,{})})}),/* @__PURE__ */ H(p,{}),/* @__PURE__ */ H(q,{"aria-label":`إدراج رابط`,children:/* @__PURE__ */ H(Y,{"aria-hidden":`true`})})]})})}var xe={name:`toolbar`,title:`Toolbar`,description:`Give buttons, toggles, menus and fields one tab stop with arrow-key navigation.`,sections:[{heading:null,text:`Use a Toolbar to group the controls of an editor, a canvas or a table. Tab enters it once, and the arrow keys move between its buttons, toggles, menus and fields.`,examples:[{id:`toolbar/demo`,caption:`Tab into the toolbar, then use Left and Right to move between Bold, Italic, Underline and Insert link. Press Space to toggle the focused style. The console logs each change.`,Example:se,source:`"use client"

import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import { BoldIcon, ItalicIcon, LinkIcon, UnderlineIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const styles = [
  { label: "Bold", icon: BoldIcon },
  { label: "Italic", icon: ItalicIcon },
  { label: "Underline", icon: UnderlineIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Formatting">
      {styles.map(({ label, icon: Icon }) => (
        <Toggle
          key={label}
          aria-label={label}
          onPressedChange={(pressed) =>
            log(\`\${label} \${pressed ? "on" : "off"}\`)
          }
        >
          <ToggleIcon>
            <Icon />
          </ToggleIcon>
        </Toggle>
      ))}
      <ToolbarSeparator />
      <ToolbarButton
        aria-label="Insert link"
        onClick={() => log("Insert link")}
      >
        <LinkIcon aria-hidden="true" />
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Toggle Groups`,text:`A Toggle group inside a toolbar joins its navigation instead of adding another tab stop. Arrow keys move focus without pressing anything; Enter or Space presses the focused toggle.`,examples:[{id:`toolbar/toggle-group`,caption:`Arrow from the alignment group to the list group, then press Space on Align center or Numbered list. The console logs each choice.`,Example:le,source:`"use client"

import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react"
import { useLog } from "../../../shared/react/log"

const alignments = [
  { value: "left", label: "Align left", icon: AlignLeftIcon },
  { value: "center", label: "Align center", icon: AlignCenterIcon },
  { value: "right", label: "Align right", icon: AlignRightIcon },
]

const lists = [
  { value: "bulleted", label: "Bulleted list", icon: ListIcon },
  { value: "numbered", label: "Numbered list", icon: ListOrderedIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Paragraph">
      <ToggleGroup
        defaultValue={["left"]}
        deselectable={false}
        aria-label="Alignment"
        onValueChange={([value]) => log(\`Align \${value}\`)}
      >
        {alignments.map(({ value, label, icon: Icon }) => (
          <Toggle key={value} value={value} aria-label={label}>
            <ToggleIcon>
              <Icon />
            </ToggleIcon>
          </Toggle>
        ))}
      </ToggleGroup>
      <ToolbarSeparator />
      <ToggleGroup
        aria-label="List"
        onValueChange={([value]) =>
          log(lists.find((list) => list.value === value)?.label ?? "No list")
        }
      >
        {lists.map(({ value, label, icon: Icon }) => (
          <Toggle key={value} value={value} aria-label={label}>
            <ToggleIcon>
              <Icon />
            </ToggleIcon>
          </Toggle>
        ))}
      </ToggleGroup>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Groups`,text:"Use `ToolbarGroup` to name related controls. Set `disabled` on the group to disable them together; they stay focusable with `aria-disabled`.",examples:[{id:`toolbar/group`,caption:`Move through Cut, Copy and Paste into History with the arrow keys. Undo and Redo stay focusable but do nothing.`,Example:de,source:`"use client"

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@ui-sdk/react/toolbar"
import {
  ClipboardIcon,
  CopyIcon,
  RedoIcon,
  ScissorsIcon,
  UndoIcon,
} from "lucide-react"
import { useLog } from "../../../shared/react/log"

const clipboard = [
  { label: "Cut", icon: ScissorsIcon },
  { label: "Copy", icon: CopyIcon },
  { label: "Paste", icon: ClipboardIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Edit">
      <ToolbarGroup aria-label="Clipboard">
        {clipboard.map(({ label, icon: Icon }) => (
          <ToolbarButton
            key={label}
            aria-label={label}
            onClick={() => log(label)}
          >
            <Icon aria-hidden="true" />
          </ToolbarButton>
        ))}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup disabled aria-label="History">
        <ToolbarButton aria-label="Undo">
          <UndoIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton aria-label="Redo">
          <RedoIcon aria-hidden="true" />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Menus`,text:"Render a Menu trigger through `ToolbarButton`. In a horizontal toolbar, Down opens the menu while Left and Right keep moving between toolbar items.",examples:[{id:`toolbar/menu`,caption:`Focus Share and press Down, then choose Email or Copy Link. Escape closes the menu and returns focus to Share.`,Example:fe,source:`"use client"

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Document">
      <ToolbarButton onClick={() => log("Saved")}>Save</ToolbarButton>
      <Menu onAction={(value) => log(\`Shared by \${value}\`)}>
        <ToolbarButton render={<MenuTrigger />}>
          Share
          <ChevronDownIcon aria-hidden="true" />
        </ToolbarButton>
        <MenuContent>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="link">Copy Link</MenuItem>
        </MenuContent>
      </Menu>
      <ToolbarButton onClick={() => log("Printed")}>Print</ToolbarButton>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Selects`,text:`A Select trigger joins the same way. It keeps its select behavior while it takes part in the toolbar's focus order.`,examples:[{id:`toolbar/select`,caption:`Open Zoom and choose a value, or step it with Zoom out and Zoom in. Each button turns off at the end of the range.`,Example:pe,source:`"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const zooms = ["50%", "75%", "100%", "150%", "200%"]

function Example() {
  const log = useLog()
  const [zoom, setZoom] = React.useState("100%")
  const index = zooms.indexOf(zoom)
  const change = (value: string) => {
    setZoom(value)
    log(\`Zoom \${value}\`)
  }
  return (
    <Toolbar aria-label="View">
      <ToolbarButton
        aria-label="Zoom out"
        disabled={index === 0}
        onClick={() => change(zooms[index - 1])}
      >
        <ZoomOutIcon aria-hidden="true" />
      </ToolbarButton>
      <Select value={zoom} onValueChange={(value) => value && change(value)}>
        <ToolbarButton render={<SelectTrigger />} aria-label="Zoom">
          <SelectValue />
          <ChevronsUpDownIcon aria-hidden="true" />
        </ToolbarButton>
        <SelectContent>
          {zooms.map((zoom) => (
            <SelectItem key={zoom} value={zoom}>
              {zoom}
              <SelectItemIndicator>
                <CheckIcon aria-hidden="true" />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToolbarButton
        aria-label="Zoom in"
        disabled={index === zooms.length - 1}
        onClick={() => change(zooms[index + 1])}
      >
        <ZoomInIcon aria-hidden="true" />
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Fields`,text:"Use `ToolbarInput` for a text field, or render another field through it, like a Number Input control. A field keeps Home, End and the arrow keys while they move its caret. At the matching end, with no text selected, an arrow moves to the next item.",examples:[{id:`toolbar/input`,caption:`Move into Font size and press Up or Down to change it. In Find, type a word, then move the caret to an edge before that arrow leaves the field.`,Example:me,source:`"use client"

import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { Toolbar, ToolbarInput, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <Toolbar aria-label="Text">
      <NumberInput defaultValue={14} min={8} max={72}>
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Decrease font size">
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <ToolbarInput
            render={<NumberInputControl aria-label="Font size" />}
          />
          <NumberInputIncrement aria-label="Increase font size">
            <PlusIcon aria-hidden="true" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
      <ToolbarSeparator />
      <ToolbarInput aria-label="Find" placeholder="Find…" />
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Links`,text:"`ToolbarLink` joins the same focus order and keeps its link behavior. The demo handles a plain click itself and leaves modified clicks, like opening in a new tab, to the browser.",examples:[{id:`toolbar/link`,caption:`Arrow to Files Changed and press Enter. The console logs the page it opened.`,Example:Q,source:`"use client"

import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
} from "@ui-sdk/react/toolbar"
import { CheckIcon, MessageSquareIcon } from "lucide-react"
import type * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const follow = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    log(\`Opened \${event.currentTarget.textContent}\`)
  }
  return (
    <Toolbar aria-label="Pull request">
      <ToolbarButton aria-label="Approve" onClick={() => log("Approved")}>
        <CheckIcon aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton aria-label="Comment" onClick={() => log("Comment")}>
        <MessageSquareIcon aria-hidden="true" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarLink href="#files" onClick={follow}>
        Files Changed
      </ToolbarLink>
      <ToolbarLink href="#checks" onClick={follow}>
        Checks
      </ToolbarLink>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'Set `orientation="vertical"` to move with Up and Down, like a canvas tool palette. Separators turn to run across the toolbar.',examples:[{id:`toolbar/vertical`,caption:`Use Up and Down to move between the tools and Delete. Space picks the focused tool.`,Example:he,source:`"use client"

import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import {
  MousePointer2Icon,
  PencilIcon,
  SquareIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react"
import { useLog } from "../../../shared/react/log"

const tools = [
  { value: "select", label: "Select", icon: MousePointer2Icon },
  { value: "draw", label: "Draw", icon: PencilIcon },
  { value: "shape", label: "Shape", icon: SquareIcon },
  { value: "text", label: "Text", icon: TypeIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar orientation="vertical" aria-label="Canvas">
      <ToggleGroup
        defaultValue={["select"]}
        deselectable={false}
        orientation="vertical"
        aria-label="Tool"
        onValueChange={([value]) =>
          log(\`\${tools.find((tool) => tool.value === value)?.label} tool\`)
        }
      >
        {tools.map(({ value, label, icon: Icon }) => (
          <Toggle key={value} value={value} aria-label={label}>
            <ToggleIcon>
              <Icon />
            </ToggleIcon>
          </Toggle>
        ))}
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton
        aria-label="Delete"
        onClick={() => log("Deleted selection")}
      >
        <Trash2Icon aria-hidden="true" />
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"A disabled item stays reachable with `aria-disabled`, so people can find it, but it ignores presses, including keys meant for a component rendered through it. Set `focusableWhenDisabled` to `false` to skip it instead.",examples:[{id:`toolbar/disabled`,caption:`Arrow from Reply to Archive, which is disabled but focusable. Delete is skipped. Only Reply logs a press.`,Example:ge,source:`"use client"

import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Message">
      <ToolbarButton onClick={() => log("Reply")}>Reply</ToolbarButton>
      <ToolbarButton disabled onClick={() => log("Archive")}>
        Archive
      </ToolbarButton>
      <ToolbarButton
        disabled
        focusableWhenDisabled={false}
        onClick={() => log("Delete")}
      >
        Delete
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Loop`,text:"Arrow keys wrap from the last item to the first by default. Set `loop` to `false` to stop at the ends.",examples:[{id:`toolbar/loop`,caption:`Focus Last and press Right. Focus stays there; Home still moves to First.`,Example:_e,source:`"use client"

import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <Toolbar loop={false} aria-label="Pages">
      {["First", "Previous", "Next", "Last"].map((label) => (
        <ToolbarButton key={label} onClick={() => log(\`\${label} page\`)}>
          {label}
        </ToolbarButton>
      ))}
    </Toolbar>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"Create a controller with `createToolbarController` and pass it as `controller`. Its `focus()` moves focus to the item focused last, like the Alt+F10 shortcut editors give their toolbars. Create one controller per toolbar.",examples:[{id:`toolbar/controller`,caption:`Type in Notes, then press Alt+F10 or choose Focus Toolbar. Press a toolbar button and the console logs it.`,Example:ye,source:`"use client"

import { useShortcut } from "@ui-sdk/react/shortcuts"
import {
  createToolbarController,
  Toolbar,
  ToolbarButton,
} from "@ui-sdk/react/toolbar"
import { BoldIcon, ItalicIcon, LinkIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const actions = [
  { label: "Bold", icon: BoldIcon },
  { label: "Italic", icon: ItalicIcon },
  { label: "Insert link", icon: LinkIcon },
]

function Example() {
  const log = useLog()
  const [toolbar] = React.useState(createToolbarController)
  useShortcut("alt+f10", () => toolbar.focus(), { allowInInput: true })
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => toolbar.focus()}>
          Focus Toolbar
        </button>
      </div>
      <Toolbar controller={toolbar} aria-label="Notes formatting">
        {actions.map(({ label, icon: Icon }) => (
          <ToolbarButton
            key={label}
            aria-label={label}
            onClick={() => log(label)}
          >
            <Icon aria-hidden="true" />
          </ToolbarButton>
        ))}
      </Toolbar>
      <textarea aria-label="Notes" placeholder="Type, then press Alt+F10" />
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`toolbar/rtl`,caption:``,Example:be,source:`"use client"

import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import { BoldIcon, ItalicIcon, LinkIcon } from "lucide-react"

function Example() {
  return (
    <div dir="rtl">
      <Toolbar aria-label="تنسيق">
        <Toggle aria-label="غامق">
          <ToggleIcon>
            <BoldIcon />
          </ToggleIcon>
        </Toggle>
        <Toggle aria-label="مائل">
          <ToggleIcon>
            <ItalicIcon />
          </ToggleIcon>
        </Toggle>
        <ToolbarSeparator />
        <ToolbarButton aria-label="إدراج رابط">
          <LinkIcon aria-hidden="true" />
        </ToolbarButton>
      </Toolbar>
    </div>
  )
}

export { Example }
`}]}]};export{xe as default};