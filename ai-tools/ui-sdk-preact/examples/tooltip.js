import{t as e}from"../chunks/c-CCOgxx-k.js";import{n as t,r as n,t as r}from"../chunks/c-DBckuTC-.js";import{t as i}from"../chunks/c-SLWFZkCM.js";import{t as a}from"../chunks/c-WfjOen3K.js";import{t as o}from"../chunks/c-CUqRK9mO.js";import{t as s}from"../chunks/c-BnWal148.js";import{t as c}from"../chunks/c-mYuizG1R.js";import{t as l}from"../chunks/c-ByJeGwM8.js";import{useLog as u}from"./log.js";import*as d from"preact/compat";import{jsx as f,jsxs as p}from"preact/compat/jsx-runtime";import{Field as m,FieldLabel as h}from"ui-sdk/field.js";import{Input as g}from"ui-sdk/input.js";import{Checkbox as _,CheckboxIndicator as v}from"ui-sdk/checkbox.js";import{Tooltip as y,TooltipArrow as b,TooltipContent as x,TooltipShortcut as S,TooltipTrigger as C,createTooltipController as w}from"ui-sdk/tooltip.js";import{registerShortcut as T}from"ui-sdk/core/shortcuts.js";function E(){return/* @__PURE__ */ p(y,{defaultOpen:!0,children:[/* @__PURE__ */ f(C,{"aria-label":`Add to library`,children:/* @__PURE__ */ f(i,{"aria-hidden":`true`})}),/* @__PURE__ */ f(x,{children:`Add to library`})]})}const D=[{side:`top`,label:`Top`},{side:`left`,label:`Left`},{side:`right`,label:`Right`},{side:`bottom`,label:`Bottom`}];function O(){return/* @__PURE__ */ f(`div`,{"data-slot":`grid`,children:D.map(({side:e,label:t})=>/* @__PURE__ */ p(y,{children:[/* @__PURE__ */ f(C,{children:t}),/* @__PURE__ */ f(x,{side:e,children:`Add to library`})]},e))})}function k(){let[e,t]=d.useState(null);return/* @__PURE__ */ p(m,{children:[/* @__PURE__ */ f(h,{children:`Webhook URL`}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,ref:t,children:[/* @__PURE__ */ f(g,{placeholder:`https://`}),/* @__PURE__ */ p(y,{children:[/* @__PURE__ */ f(C,{"aria-label":`About webhooks`,children:/* @__PURE__ */ f(c,{"aria-hidden":`true`})}),/* @__PURE__ */ f(x,{anchor:e,side:`bottom`,align:`start`,children:`We send a POST request here for every new order.`})]})]})]})}function A(){let e=u();return d.useEffect(()=>{let t=T(`mod+s`,()=>e(`Saved`)),n=T(`mod+shift+e`,()=>e(`Shared`));return()=>{t(),n()}},[e]),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(y,{shortcut:`mod+s`,children:[/* @__PURE__ */ f(C,{"aria-label":`Save`,onClick:()=>e(`Saved`),children:/* @__PURE__ */ f(l,{"aria-hidden":`true`})}),/* @__PURE__ */ p(x,{children:[`Save`,/* @__PURE__ */ f(S,{})]})]}),/* @__PURE__ */ p(y,{shortcut:`mod+shift+e`,children:[/* @__PURE__ */ f(C,{onClick:()=>e(`Shared`),children:`Share`}),/* @__PURE__ */ p(x,{children:[`Share with your team`,/* @__PURE__ */ f(S,{})]})]})]})}function j(){let e=u(),[t,n]=d.useState(``),r=!t.trim();return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(m,{children:[/* @__PURE__ */ f(h,{children:`Post title`}),/* @__PURE__ */ f(g,{value:t,onValueChange:e=>n(e)})]}),/* @__PURE__ */ p(y,{disabled:!r,children:[/* @__PURE__ */ f(C,{"data-variant":`solid`,"aria-disabled":r||void 0,onClick:()=>{r||e(`Published “${t.trim()}”`)},children:`Publish`}),/* @__PURE__ */ f(x,{side:`right`,children:`Add a title to publish`})]})]})}function M(){return/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(`span`,{"data-slot":`label`,children:`Storage`}),/* @__PURE__ */ p(y,{toggleable:!0,children:[/* @__PURE__ */ f(C,{"aria-label":`About storage`,"data-size":`sm`,children:/* @__PURE__ */ f(c,{"aria-hidden":`true`})}),/* @__PURE__ */ f(x,{children:`Files in the trash still use storage.`})]}),/* @__PURE__ */ f(`span`,{"data-slot":`hint`,children:`12.4 of 15 GB used`})]})}const N=`npm install @ui-sdk/react`;function P(){let[e,t]=d.useState(!1);return/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ f(`code`,{children:N}),/* @__PURE__ */ p(y,{closeOnPress:!1,onOpenChangeComplete:e=>!e&&t(!1),children:[/* @__PURE__ */ f(C,{"aria-label":e?`Copied`:`Copy`,onClick:()=>{navigator.clipboard?.writeText(N).catch(()=>{}),t(!0)},children:f(e?a:o,{"aria-hidden":`true`})}),/* @__PURE__ */ f(x,{children:e?`Copied`:`Copy`})]})]})}const F=[`Quarterly report, final revised version for the board.pdf`,`Notes.txt`,`Design review recording, October 2nd.mp4`,`Budget.xlsx`];function I({name:e}){let t=d.useRef(null);return/* @__PURE__ */ f(`li`,{children:/* @__PURE__ */ p(y,{type:`label`,onOpenChange:(e,n)=>{let r=t.current;e&&r&&r.scrollWidth<=r.clientWidth&&n.cancel()},children:[/* @__PURE__ */ p(C,{children:[/* @__PURE__ */ f(s,{"aria-hidden":`true`}),/* @__PURE__ */ f(`span`,{ref:t,children:e})]}),/* @__PURE__ */ f(x,{children:e})]})})}function L(){return/* @__PURE__ */ f(`ul`,{children:F.map(e=>/* @__PURE__ */ f(I,{name:e},e))})}function R(){let e=u(),[t,n]=d.useState(!1),r=d.useRef(null);return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ f(`div`,{"data-slot":`controls`,ref:r,children:/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ f(_,{checked:t,onCheckedChange:e=>n(e===!0),children:/* @__PURE__ */ f(v,{children:/* @__PURE__ */ f(a,{"aria-hidden":`true`})})}),`Open`]})}),/* @__PURE__ */ p(y,{open:t,onOpenChange:(t,i)=>{let a=i.event?.target;if(a instanceof Node&&r.current?.contains(a)&&i.reason!==`escape-key`)return i.cancel();n(t),e(`${t?`Opened`:`Closed`} (${i.reason})`)},children:[/* @__PURE__ */ f(C,{children:`Export`}),/* @__PURE__ */ f(x,{children:`Download as CSV`})]})]})}const z=[{icon:n,label:`Bold`},{icon:t,label:`Italic`},{icon:r,label:`Underline`}];function B(){let[e]=d.useState(()=>w());return/* @__PURE__ */ p(`div`,{"data-slot":`row`,role:`group`,"aria-label":`Formatting`,children:[z.map(t=>/* @__PURE__ */ f(C,{controller:e,payload:t.label,"aria-label":t.label,children:/* @__PURE__ */ f(t.icon,{"aria-hidden":`true`})},t.label)),/* @__PURE__ */ f(y,{controller:e,children:/* @__PURE__ */ f(x,{children:e=>e.payload})})]})}function V(){let t=u();return/* @__PURE__ */ p(y,{onOpenChange:e=>t(e?`Opening`:`Closing`),onOpenChangeComplete:e=>t(e?`Open`:`Closed`),children:[/* @__PURE__ */ f(C,{"aria-label":`Archive`,children:/* @__PURE__ */ f(e,{"aria-hidden":`true`})}),/* @__PURE__ */ f(x,{children:`Archive`})]})}function H(){return/* @__PURE__ */ p(y,{children:[/* @__PURE__ */ f(C,{"data-variant":`link`,render:/* @__PURE__ */ f(`a`,{href:`https://example.com/changelog`}),children:`Changelog`}),/* @__PURE__ */ f(x,{children:`See what's new in 2.0`})]})}const U=[{side:`right`,label:`يمين`},{side:`top`,label:`أعلى`},{side:`bottom`,label:`أسفل`},{side:`left`,label:`يسار`}];function W(){return/* @__PURE__ */ f(`div`,{dir:`rtl`,"data-slot":`row`,children:U.map(({side:e,label:t})=>/* @__PURE__ */ p(y,{children:[/* @__PURE__ */ f(C,{children:t}),/* @__PURE__ */ p(x,{side:e,align:`start`,sideOffset:8,children:[/* @__PURE__ */ f(b,{}),`أضف إلى المكتبة`]})]},e))})}var G={name:`tooltip`,title:`Tooltip`,description:`Name a control or add a short hint on hover and keyboard focus.`,sections:[{heading:null,text:`A tooltip names a control or adds a short hint when the pointer rests on it or keyboard focus reaches it. Keep it to a few words of plain text.`,examples:[{id:`tooltip/basic`,caption:`The tooltip starts open. Hover the button or reach it with Tab to show it again, and Escape closes it while focus stays on the button.`,Example:E,source:`"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { BookmarkIcon } from "lucide-react"

function Example() {
  return (
    <Tooltip defaultOpen>
      <TooltipTrigger aria-label="Add to library">
        <BookmarkIcon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  )
}

export { Example }
`}]},{heading:`Side`,text:"`side` picks where the tooltip opens: `top` by default. It flips to the other side when there isn't room, and shifts along the trigger to stay on screen. `data-side` says where it landed.",examples:[{id:`tooltip/side`,caption:`Hover Top, Left, Right and Bottom. Each tooltip opens on that side of its button, or flips into the middle when there isn't room.`,Example:O,source:`"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"

const sides = [
  { side: "top", label: "Top" },
  { side: "left", label: "Left" },
  { side: "right", label: "Right" },
  { side: "bottom", label: "Bottom" },
] as const

function Example() {
  return (
    <div data-slot="grid">
      {sides.map(({ side, label }) => (
        <Tooltip key={side}>
          <TooltipTrigger>{label}</TooltipTrigger>
          <TooltipContent side={side}>Add to library</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Anchor`,text:"Position the tooltip against something other than the trigger with `anchor`: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. Here a small help button inside a field shows its tooltip along the whole field.",examples:[{id:`tooltip/anchor`,caption:`Hover the help button. The tooltip opens below the Webhook URL field and lines up with its start, not with the button.`,Example:k,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { InfoIcon } from "lucide-react"
import * as React from "react"

function Example() {
  const [field, setField] = React.useState<HTMLDivElement | null>(null)

  return (
    <Field>
      <FieldLabel>Webhook URL</FieldLabel>
      <div data-slot="row" ref={setField}>
        <Input placeholder="https://" />
        <Tooltip>
          <TooltipTrigger aria-label="About webhooks">
            <InfoIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent anchor={field} side="bottom" align="start">
            We send a POST request here for every new order.
          </TooltipContent>
        </Tooltip>
      </div>
    </Field>
  )
}

export { Example }
`}]},{heading:`Keyboard Shortcut`,text:'`shortcut` on the tooltip, like `"mod+s"`, is a hint for what the trigger\'s action is bound to, where `mod` is Command on Apple platforms and Control elsewhere. `TooltipShortcut` shows the keys for the platform, `⌘S` or `Ctrl+S`, hidden from screen readers, and the trigger gets `aria-keyshortcuts` so they hear it instead. A `TooltipShortcut` can show other keys with its own `shortcut`.',examples:[{id:`tooltip/shortcut`,caption:`Hover Save or Share to read its shortcut, then press the button or the keys. The console logs Saved or Shared.`,Example:A,source:`"use client"

import { registerShortcut } from "@ui-sdk/core/shortcuts"
import {
  Tooltip,
  TooltipContent,
  TooltipShortcut,
  TooltipTrigger,
} from "@ui-sdk/react/tooltip"
import { SaveIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  React.useEffect(() => {
    const offSave = registerShortcut("mod+s", () => log("Saved"))
    const offShare = registerShortcut("mod+shift+e", () => log("Shared"))
    return () => {
      offSave()
      offShare()
    }
  }, [log])

  return (
    <div data-slot="row">
      <Tooltip shortcut="mod+s">
        <TooltipTrigger aria-label="Save" onClick={() => log("Saved")}>
          <SaveIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>
          Save
          <TooltipShortcut />
        </TooltipContent>
      </Tooltip>
      <Tooltip shortcut="mod+shift+e">
        <TooltipTrigger onClick={() => log("Shared")}>Share</TooltipTrigger>
        <TooltipContent>
          Share with your team
          <TooltipShortcut />
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export { Example }
`}]},{heading:`Disabled Buttons`,text:"A natively disabled button can't receive focus, and some browsers send it no pointer events, so its tooltip never shows. When the tooltip explains why an action is unavailable, use `aria-disabled=\"true\"` instead and ignore the button's presses yourself. The button stays in the Tab order, screen readers announce it as dimmed, and the tooltip explains what's missing. `disabled` on the tooltip turns the explanation off once the button works.",examples:[{id:`tooltip/disabled-button`,caption:`Hover or focus Publish to learn what's missing. Type a title, and Publish works and its tooltip goes away.`,Example:j,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [title, setTitle] = React.useState("")
  const blocked = !title.trim()

  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Post title</FieldLabel>
        <Input value={title} onValueChange={(value) => setTitle(value)} />
      </Field>
      <Tooltip disabled={!blocked}>
        <TooltipTrigger
          data-variant="solid"
          aria-disabled={blocked || undefined}
          onClick={() => {
            if (!blocked) {
              log(\`Published “\${title.trim()}”\`)
            }
          }}
        >
          Publish
        </TooltipTrigger>
        <TooltipContent side="right">Add a title to publish</TooltipContent>
      </Tooltip>
    </div>
  )
}

export { Example }
`}]},{heading:`Touch`,text:`Touch screens have no hover. A tap on a plain tooltip's trigger only presses it, and the tooltip stays closed, so don't hide anything important in a tooltip.`,examples:[{id:`tooltip/toggleable`,caption:`Press the info button to open the tip, including on a touch screen. Press it again or anywhere else to close it.`,Example:M,source:`"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { InfoIcon } from "lucide-react"

function Example() {
  return (
    <div data-slot="row">
      <span data-slot="label">Storage</span>
      <Tooltip toggleable>
        <TooltipTrigger aria-label="About storage" data-size="sm">
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Files in the trash still use storage.</TooltipContent>
      </Tooltip>
      <span data-slot="hint">12.4 of 15 GB used</span>
    </div>
  )
}

export { Example }
`}]},{heading:`Keep Open on Press`,text:'Pressing the trigger closes the tooltip, so it doesn\'t cover what the press changed, and it stays closed until the pointer leaves. `closeOnPress={false}` keeps it open, like for a copy button whose tooltip turns into "Copied".',examples:[{id:`tooltip/copy`,caption:`Hover the copy button and press it. The tooltip stays open and changes to Copied.`,Example:P,source:`"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"

const command = "npm install @ui-sdk/react"

function Example() {
  const [copied, setCopied] = React.useState(false)

  return (
    <div data-slot="row">
      <code>{command}</code>
      <Tooltip
        closeOnPress={false}
        onOpenChangeComplete={(open) => !open && setCopied(false)}
      >
        <TooltipTrigger
          aria-label={copied ? "Copied" : "Copy"}
          onClick={() => {
            navigator.clipboard?.writeText(command).catch(() => {})
            setCopied(true)
          }}
        >
          {copied ? (
            <CheckIcon aria-hidden="true" />
          ) : (
            <CopyIcon aria-hidden="true" />
          )}
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
      </Tooltip>
    </div>
  )
}

export { Example }
`}]},{heading:`Truncated Text`,text:'To show a tooltip only when text is cut off, cancel the open in `onOpenChange` when the text fits. Compare `scrollWidth` with `clientWidth` in the callback. The tooltip repeats the name, so `type="label"` keeps screen readers from hearing it twice.',examples:[{id:`tooltip/truncated`,caption:`Hover or focus each file. Only names that are cut off open a tooltip.`,Example:L,source:`"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { FileIcon } from "lucide-react"
import * as React from "react"

const files = [
  "Quarterly report, final revised version for the board.pdf",
  "Notes.txt",
  "Design review recording, October 2nd.mp4",
  "Budget.xlsx",
]

function FileRow({ name }: { name: string }) {
  const text = React.useRef<HTMLSpanElement>(null)

  return (
    <li>
      <Tooltip
        type="label"
        onOpenChange={(open, details) => {
          const span = text.current
          if (open && span && span.scrollWidth <= span.clientWidth) {
            details.cancel()
          }
        }}
      >
        <TooltipTrigger>
          <FileIcon aria-hidden="true" />
          <span ref={text}>{name}</span>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    </li>
  )
}

function Example() {
  return (
    <ul>
      {files.map((file) => (
        <FileRow key={file} name={file} />
      ))}
    </ul>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `open` and update it in `onOpenChange`. Every change carries a reason, like `trigger-hover`, `trigger-focus`, `trigger-press`, `escape-key` or `outside-press`. Call `details.cancel()` to stop it. To open the tooltip from anywhere, like a step in a guided tour, use a controller.",examples:[{id:`tooltip/controlled`,caption:`Check Open, or hover Export. The console logs each change and its reason.`,Example:R,source:`"use client"

import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { CheckIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [open, setOpen] = React.useState(false)
  const controls = React.useRef<HTMLDivElement>(null)

  return (
    <div data-slot="stack">
      <div data-slot="controls" ref={controls}>
        <label data-slot="label">
          <Checkbox
            checked={open}
            onCheckedChange={(next) => setOpen(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Open
        </label>
      </div>
      <Tooltip
        open={open}
        onOpenChange={(next, details) => {
          const target = details.event?.target
          const inControls =
            target instanceof Node && controls.current?.contains(target)
          if (inControls && details.reason !== "escape-key") {
            return details.cancel()
          }
          setOpen(next)
          log(\`\${next ? "Opened" : "Closed"} (\${details.reason})\`)
        }}
      >
        <TooltipTrigger>Export</TooltipTrigger>
        <TooltipContent>Download as CSV</TooltipContent>
      </Tooltip>
    </div>
  )
}

export { Example }
`}]},{heading:`Shared`,text:"A toolbar, a chart or a long list can share one tooltip instead of rendering one per item. Connect the triggers and the tooltip to one `createTooltipController<Payload>()`, and the triggers can sit anywhere on the page. Each trigger passes a `payload`, here its label, and the content reads it from its state, since every part's `children` can be a function of its state. `TooltipContent<string>` types the payload. The content renders before the first open, so handle an `undefined` payload.",examples:[{id:`tooltip/shared`,caption:`Move along Bold, Italic and Underline. One tooltip follows the pointer and shows each button's label.`,Example:B,source:`"use client"

import {
  createTooltipController,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ui-sdk/react/tooltip"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import * as React from "react"

const formats = [
  { icon: BoldIcon, label: "Bold" },
  { icon: ItalicIcon, label: "Italic" },
  { icon: UnderlineIcon, label: "Underline" },
]

function Example() {
  const [tooltip] = React.useState(() => createTooltipController<string>())

  return (
    <div data-slot="row" role="group" aria-label="Formatting">
      {formats.map((format) => (
        <TooltipTrigger
          key={format.label}
          controller={tooltip}
          payload={format.label}
          aria-label={format.label}
        >
          <format.icon aria-hidden="true" />
        </TooltipTrigger>
      ))}
      <Tooltip controller={tooltip}>
        <TooltipContent<string>>{(state) => state.payload}</TooltipContent>
      </Tooltip>
    </div>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the tooltip stays mounted until its exit finishes. Put `transform-origin: var(--transform-origin)` on the content so it grows out of its trigger. A tooltip that opens at once, as the next one in a group does, gets `data-instant`, so skip the transition there.",examples:[{id:`tooltip/animation`,caption:`Hover Archive, then move away. The tooltip grows out of the button and fades, and the console logs Opening, Open, Closing and Closed.`,Example:V,source:`"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { ArchiveIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Tooltip
      onOpenChange={(open) => log(open ? "Opening" : "Closing")}
      onOpenChangeComplete={(open) => log(open ? "Open" : "Closed")}
    >
      <TooltipTrigger aria-label="Archive">
        <ArchiveIcon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>Archive</TooltipContent>
    </Tooltip>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. See Parts and Composition for prop merging and state-based rendering.",examples:[{id:`tooltip/custom-rendering`,caption:`Hover Changelog. The trigger renders as a link, and its tooltip says where it goes.`,Example:H,source:`"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"

function Example() {
  return (
    <Tooltip>
      <TooltipTrigger
        data-variant="link"
        render={<a href="https://example.com/changelog" />}
      >
        Changelog
      </TooltipTrigger>
      <TooltipContent>See what's new in 2.0</TooltipContent>
    </Tooltip>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`tooltip/rtl`,caption:``,Example:W,source:`"use client"

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@ui-sdk/react/tooltip"

const sides = [
  { side: "right", label: "يمين" },
  { side: "top", label: "أعلى" },
  { side: "bottom", label: "أسفل" },
  { side: "left", label: "يسار" },
] as const

function Example() {
  return (
    <div dir="rtl" data-slot="row">
      {sides.map(({ side, label }) => (
        <Tooltip key={side}>
          <TooltipTrigger>{label}</TooltipTrigger>
          <TooltipContent side={side} align="start" sideOffset={8}>
            <TooltipArrow />
            أضف إلى المكتبة
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export { Example }
`}]}]};export{G as default};