import{Bo as e,Co as t,Mo as n,Oo as r,Ps as i,Ts as a,Xs as o,Zs as s,aa as c,bs as l,cl as u,fl as d,go as f,ia as p,mo as m,na as h,nc as g,oa as _,qs as v,ra as y,sl as b,ta as x,tl as S,ts as C,ul as w,xs as T,yo as E}from"../chunks/c-CIXE4Nkk.js";function D(){return/* @__PURE__ */ S(x,{defaultOpen:!0,children:[/* @__PURE__ */ S(c,{"aria-label":`Add to library`,children:/* @__PURE__ */ S(o,{"aria-hidden":`true`})}),/* @__PURE__ */ S(y,{children:`Add to library`})]})}const O=[{side:`top`,label:`Top`},{side:`left`,label:`Left`},{side:`right`,label:`Right`},{side:`bottom`,label:`Bottom`}];function k(){return/* @__PURE__ */ S(`div`,{"data-slot":`grid`,children:O.map(({side:e,label:t})=>/* @__PURE__ */ S(x,{children:[/* @__PURE__ */ S(c,{children:t}),/* @__PURE__ */ S(y,{side:e,children:`Add to library`})]},e))})}function A(){let[e,n]=d(null);return/* @__PURE__ */ S(t,{children:[/* @__PURE__ */ S(r,{children:`Webhook URL`}),/* @__PURE__ */ S(`div`,{"data-slot":`row`,ref:n,children:[/* @__PURE__ */ S(E,{placeholder:`https://`}),/* @__PURE__ */ S(x,{children:[/* @__PURE__ */ S(c,{"aria-label":`About webhooks`,children:/* @__PURE__ */ S(T,{"aria-hidden":`true`})}),/* @__PURE__ */ S(y,{anchor:e,side:`bottom`,align:`start`,children:`We send a POST request here for every new order.`})]})]})]})}function j(){let e=n();return u(()=>{let t=b(`mod+s`,()=>e(`Saved`)),n=b(`mod+shift+e`,()=>e(`Shared`));return()=>{t(),n()}},[e]),/* @__PURE__ */ S(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ S(x,{shortcut:`mod+s`,children:[/* @__PURE__ */ S(c,{"aria-label":`Save`,onClick:()=>e(`Saved`),children:/* @__PURE__ */ S(C,{"aria-hidden":`true`})}),/* @__PURE__ */ S(y,{children:[`Save`,/* @__PURE__ */ S(p,{})]})]}),/* @__PURE__ */ S(x,{shortcut:`mod+shift+e`,children:[/* @__PURE__ */ S(c,{onClick:()=>e(`Shared`),children:`Share`}),/* @__PURE__ */ S(y,{children:[`Share with your team`,/* @__PURE__ */ S(p,{})]})]})]})}function M(){let e=n(),[i,a]=d(``),o=!i.trim();return/* @__PURE__ */ S(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ S(t,{children:[/* @__PURE__ */ S(r,{children:`Post title`}),/* @__PURE__ */ S(E,{value:i,onValueChange:e=>a(e)})]}),/* @__PURE__ */ S(x,{disabled:!o,children:[/* @__PURE__ */ S(c,{"data-variant":`solid`,"aria-disabled":o||void 0,onClick:()=>{o||e(`Published “${i.trim()}”`)},children:`Publish`}),/* @__PURE__ */ S(y,{side:`right`,children:`Add a title to publish`})]})]})}function N(){return/* @__PURE__ */ S(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ S(`span`,{"data-slot":`label`,children:`Storage`}),/* @__PURE__ */ S(x,{toggleable:!0,children:[/* @__PURE__ */ S(c,{"aria-label":`About storage`,"data-size":`sm`,children:/* @__PURE__ */ S(T,{"aria-hidden":`true`})}),/* @__PURE__ */ S(y,{children:`Files in the trash still use storage.`})]}),/* @__PURE__ */ S(`span`,{"data-slot":`hint`,children:`12.4 of 15 GB used`})]})}const P=`npm install @ui-sdk/react`;function F(){let[e,t]=d(!1);return/* @__PURE__ */ S(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ S(`code`,{children:P}),/* @__PURE__ */ S(x,{closeOnPress:!1,onOpenChangeComplete:e=>!e&&t(!1),children:[/* @__PURE__ */ S(c,{"aria-label":e?`Copied`:`Copy`,onClick:()=>{navigator.clipboard?.writeText(P).catch(()=>{}),t(!0)},children:S(e?v:i,{"aria-hidden":`true`})}),/* @__PURE__ */ S(y,{children:e?`Copied`:`Copy`})]})]})}const I=[`Quarterly report, final revised version for the board.pdf`,`Notes.txt`,`Design review recording, October 2nd.mp4`,`Budget.xlsx`];function L({name:e}){let t=w(null);return/* @__PURE__ */ S(`li`,{children:/* @__PURE__ */ S(x,{type:`label`,onOpenChange:(e,n)=>{let r=t.current;e&&r&&r.scrollWidth<=r.clientWidth&&n.cancel()},children:[/* @__PURE__ */ S(c,{children:[/* @__PURE__ */ S(a,{"aria-hidden":`true`}),/* @__PURE__ */ S(`span`,{ref:t,children:e})]}),/* @__PURE__ */ S(y,{children:e})]})})}function R(){return/* @__PURE__ */ S(`ul`,{children:I.map(e=>/* @__PURE__ */ S(L,{name:e},e))})}function z(){let e=n(),[t,r]=d(!1),i=w(null);return/* @__PURE__ */ S(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ S(`div`,{"data-slot":`controls`,ref:i,children:/* @__PURE__ */ S(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ S(m,{checked:t,onCheckedChange:e=>r(e===!0),children:/* @__PURE__ */ S(f,{children:/* @__PURE__ */ S(v,{"aria-hidden":`true`})})}),`Open`]})}),/* @__PURE__ */ S(x,{open:t,onOpenChange:(t,n)=>{let a=n.event?.target;if(a instanceof Node&&i.current?.contains(a)&&n.reason!==`escape-key`)return n.cancel();r(t),e(`${t?`Opened`:`Closed`} (${n.reason})`)},children:[/* @__PURE__ */ S(c,{children:`Export`}),/* @__PURE__ */ S(y,{children:`Download as CSV`})]})]})}const B=[{icon:s,label:`Bold`},{icon:l,label:`Italic`},{icon:e,label:`Underline`}];function V(){let[e]=d(()=>_());return/* @__PURE__ */ S(`div`,{"data-slot":`row`,role:`group`,"aria-label":`Formatting`,children:[B.map(t=>/* @__PURE__ */ S(c,{controller:e,payload:t.label,"aria-label":t.label,children:/* @__PURE__ */ S(t.icon,{"aria-hidden":`true`})},t.label)),/* @__PURE__ */ S(x,{controller:e,children:/* @__PURE__ */ S(y,{children:e=>e.payload})})]})}function H(){let e=n();return/* @__PURE__ */ S(x,{onOpenChange:t=>e(t?`Opening`:`Closing`),onOpenChangeComplete:t=>e(t?`Open`:`Closed`),children:[/* @__PURE__ */ S(c,{"aria-label":`Archive`,children:/* @__PURE__ */ S(g,{"aria-hidden":`true`})}),/* @__PURE__ */ S(y,{children:`Archive`})]})}function U(){return/* @__PURE__ */ S(x,{children:[/* @__PURE__ */ S(c,{"data-variant":`link`,render:/* @__PURE__ */ S(`a`,{href:`https://example.com/changelog`}),children:`Changelog`}),/* @__PURE__ */ S(y,{children:`See what's new in 2.0`})]})}const W=[{side:`right`,label:`يمين`},{side:`top`,label:`أعلى`},{side:`bottom`,label:`أسفل`},{side:`left`,label:`يسار`}];function G(){return/* @__PURE__ */ S(`div`,{dir:`rtl`,"data-slot":`row`,children:W.map(({side:e,label:t})=>/* @__PURE__ */ S(x,{children:[/* @__PURE__ */ S(c,{children:t}),/* @__PURE__ */ S(y,{side:e,align:`start`,sideOffset:8,children:[/* @__PURE__ */ S(h,{}),`أضف إلى المكتبة`]})]},e))})}var K={name:`tooltip`,title:`Tooltip`,description:`Name a control or add a short hint on hover and keyboard focus.`,sections:[{heading:null,text:`A tooltip names a control or adds a short hint when the pointer rests on it or keyboard focus reaches it. Keep it to a few words of plain text.`,examples:[{id:`tooltip/basic`,caption:`The tooltip starts open. Hover the button or reach it with Tab to show it again, and Escape closes it while focus stays on the button.`,Example:D,source:`"use client"

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
`}]},{heading:`Side`,text:"`side` picks where the tooltip opens: `top` by default. It flips to the other side when there isn't room, and shifts along the trigger to stay on screen. `data-side` says where it landed.",examples:[{id:`tooltip/side`,caption:`Hover Top, Left, Right and Bottom. Each tooltip opens on that side of its button, or flips into the middle when there isn't room.`,Example:k,source:`"use client"

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
`}]},{heading:`Anchor`,text:"Position the tooltip against something other than the trigger with `anchor`: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. Here a small help button inside a field shows its tooltip along the whole field.",examples:[{id:`tooltip/anchor`,caption:`Hover the help button. The tooltip opens below the Webhook URL field and lines up with its start, not with the button.`,Example:A,source:`"use client"

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
`}]},{heading:`Keyboard Shortcut`,text:'`shortcut` on the tooltip, like `"mod+s"`, is a hint for what the trigger\'s action is bound to, where `mod` is Command on Apple platforms and Control elsewhere. `TooltipShortcut` shows the keys for the platform, `⌘S` or `Ctrl+S`, hidden from screen readers, and the trigger gets `aria-keyshortcuts` so they hear it instead. A `TooltipShortcut` can show other keys with its own `shortcut`.',examples:[{id:`tooltip/shortcut`,caption:`Hover Save or Share to read its shortcut, then press the button or the keys. The console logs Saved or Shared.`,Example:j,source:`"use client"

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
`}]},{heading:`Disabled Buttons`,text:"A natively disabled button can't receive focus, and some browsers send it no pointer events, so its tooltip never shows. When the tooltip explains why an action is unavailable, use `aria-disabled=\"true\"` instead and ignore the button's presses yourself. The button stays in the Tab order, screen readers announce it as dimmed, and the tooltip explains what's missing. `disabled` on the tooltip turns the explanation off once the button works.",examples:[{id:`tooltip/disabled-button`,caption:`Hover or focus Publish to learn what's missing. Type a title, and Publish works and its tooltip goes away.`,Example:M,source:`"use client"

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
`}]},{heading:`Touch`,text:`Touch screens have no hover. A tap on a plain tooltip's trigger only presses it, and the tooltip stays closed, so don't hide anything important in a tooltip.`,examples:[{id:`tooltip/toggleable`,caption:`Press the info button to open the tip, including on a touch screen. Press it again or anywhere else to close it.`,Example:N,source:`"use client"

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
`}]},{heading:`Keep Open on Press`,text:'Pressing the trigger closes the tooltip, so it doesn\'t cover what the press changed, and it stays closed until the pointer leaves. `closeOnPress={false}` keeps it open, like for a copy button whose tooltip turns into "Copied".',examples:[{id:`tooltip/copy`,caption:`Hover the copy button and press it. The tooltip stays open and changes to Copied.`,Example:F,source:`"use client"

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
`}]},{heading:`Truncated Text`,text:'To show a tooltip only when text is cut off, cancel the open in `onOpenChange` when the text fits. Compare `scrollWidth` with `clientWidth` in the callback. The tooltip repeats the name, so `type="label"` keeps screen readers from hearing it twice.',examples:[{id:`tooltip/truncated`,caption:`Hover or focus each file. Only names that are cut off open a tooltip.`,Example:R,source:`"use client"

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
`}]},{heading:`Controlled`,text:"Pass `open` and update it in `onOpenChange`. Every change carries a reason, like `trigger-hover`, `trigger-focus`, `trigger-press`, `escape-key` or `outside-press`. Call `details.cancel()` to stop it. To open the tooltip from anywhere, like a step in a guided tour, use a controller.",examples:[{id:`tooltip/controlled`,caption:`Check Open, or hover Export. The console logs each change and its reason.`,Example:z,source:`"use client"

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
`}]},{heading:`Shared`,text:"A toolbar, a chart or a long list can share one tooltip instead of rendering one per item. Connect the triggers and the tooltip to one `createTooltipController<Payload>()`, and the triggers can sit anywhere on the page. Each trigger passes a `payload`, here its label, and the content reads it from its state, since every part's `children` can be a function of its state. `TooltipContent<string>` types the payload. The content renders before the first open, so handle an `undefined` payload.",examples:[{id:`tooltip/shared`,caption:`Move along Bold, Italic and Underline. One tooltip follows the pointer and shows each button's label.`,Example:V,source:`"use client"

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
`}]},{heading:`Animation`,text:"The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the tooltip stays mounted until its exit finishes. Put `transform-origin: var(--transform-origin)` on the content so it grows out of its trigger. A tooltip that opens at once, as the next one in a group does, gets `data-instant`, so skip the transition there.",examples:[{id:`tooltip/animation`,caption:`Hover Archive, then move away. The tooltip grows out of the button and fades, and the console logs Opening, Open, Closing and Closed.`,Example:H,source:`"use client"

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
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. See Parts and Composition for prop merging and state-based rendering.",examples:[{id:`tooltip/custom-rendering`,caption:`Hover Changelog. The trigger renders as a link, and its tooltip says where it goes.`,Example:U,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`tooltip/rtl`,caption:``,Example:G,source:`"use client"

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
`}]}]};export{K as default};