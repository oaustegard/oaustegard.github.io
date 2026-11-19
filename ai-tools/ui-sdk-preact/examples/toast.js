import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-WfjOen3K.js";import{t as n}from"../chunks/c-CA3STxaZ.js";import{t as r}from"../chunks/c-CgVzHSix.js";import{t as i}from"../chunks/c-mYuizG1R.js";import{t as a}from"../chunks/c-D5QH3sUe.js";import{t as o}from"../chunks/c-NPxkywtp.js";import{useLog as s}from"./log.js";import*as c from"preact/compat";import{Fragment as l,jsx as u,jsxs as d}from"preact/compat/jsx-runtime";import{Checkbox as f,CheckboxIndicator as p}from"ui-sdk/checkbox.js";import{Select as m,SelectContent as h,SelectItem as g,SelectItemIndicator as _,SelectLabel as v,SelectTrigger as y,SelectValue as b}from"ui-sdk/select.js";import{AlertDialog as x,AlertDialogBackdrop as S,AlertDialogClose as C,AlertDialogContent as ee,AlertDialogDescription as te,AlertDialogTitle as ne,createConfirm as w}from"ui-sdk/alert-dialog.js";import{OverlayHost as T,createOverlays as E}from"ui-sdk/overlays.js";import{Toast as D,ToastAction as O,ToastClose as k,ToastDescription as A,ToastRegion as j,ToastTitle as M,createToaster as N}from"ui-sdk/toast.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const P={name:`octagon-x`,size:24,node:[[`path`,{d:`m15 9-6 6`,key:`1uzhvr`}],[`path`,{d:`M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z`,key:`2d38gg`}],[`path`,{d:`m9 9 6 6`,key:`z0biqf`}]],aliases:[`x-octagon`]};P.node;const F=e(P),I={name:`triangle-alert`,size:24,node:[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`,key:`wmoenq`}],[`path`,{d:`M12 9v4`,key:`juzpu7`}],[`path`,{d:`M12 17h.01`,key:`p32p05`}]],aliases:[`alert-triangle`]}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
;I.node;const L=e(I);function R(){let e=s(),[t]=c.useState(()=>N());return c.useEffect(()=>()=>{t.dismiss()},[t]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:()=>t(`Event created`,{description:`Friday, June 12 at 10:00 AM`,action:{label:`Undo`,onAction:()=>e(`Event removed`)}}),children:`Create Event`}),/* @__PURE__ */ u(j,{toaster:t,children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]}),/* @__PURE__ */ u(O,{"data-variant":`solid`})]})})]})}function z(){return new Promise(e=>setTimeout(e,2e3))}function B(){let[e]=c.useState(()=>N());return c.useEffect(()=>()=>{e.dismiss()},[e]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(`button`,{onClick:()=>e(`Event created`),children:`Default`}),/* @__PURE__ */ u(`button`,{onClick:()=>e.success(`Changes saved`),children:`Success`}),/* @__PURE__ */ u(`button`,{onClick:()=>e.info(`A new version is available`),children:`Info`}),/* @__PURE__ */ u(`button`,{onClick:()=>e.warning(`Storage is almost full`),children:`Warning`}),/* @__PURE__ */ u(`button`,{onClick:()=>e.error(`Couldn't save changes`),children:`Error`}),/* @__PURE__ */ u(`button`,{onClick:()=>e.promise(z,{loading:`Uploading photos…`,success:`Photos uploaded`,error:`Upload failed`}),children:`Loading`})]}),/* @__PURE__ */ u(j,{toaster:e,children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ u(r,{"data-show":`success`,"aria-hidden":`true`}),/* @__PURE__ */ u(i,{"data-show":`info`,"aria-hidden":`true`}),/* @__PURE__ */ u(L,{"data-show":`warning`,"aria-hidden":`true`}),/* @__PURE__ */ u(F,{"data-show":`error`,"aria-hidden":`true`}),/* @__PURE__ */ u(a,{"data-show":`loading`,"aria-hidden":`true`}),/* @__PURE__ */ u(M,{})]})})]})}const V=[{value:`top`,label:`Top`},{value:`bottom`,label:`Bottom`}],H=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function U(){let[e]=c.useState(()=>N()),[r,i]=c.useState(`bottom`),[a,o]=c.useState(`end`);return c.useEffect(()=>()=>{e.dismiss()},[e]),/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ d(m,{items:V,value:r,onValueChange:e=>e&&i(e),children:[/* @__PURE__ */ u(v,{children:`Side`}),/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{}),/* @__PURE__ */ u(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ u(h,{children:V.map(e=>/* @__PURE__ */ d(g,{value:e.value,children:[e.label,/* @__PURE__ */ u(_,{children:/* @__PURE__ */ u(t,{"aria-hidden":`true`})})]},e.value))})]}),/* @__PURE__ */ d(m,{items:H,value:a,onValueChange:e=>e&&o(e),children:[/* @__PURE__ */ u(v,{children:`Align`}),/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{}),/* @__PURE__ */ u(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ u(h,{children:H.map(e=>/* @__PURE__ */ d(g,{value:e.value,children:[e.label,/* @__PURE__ */ u(_,{children:/* @__PURE__ */ u(t,{"aria-hidden":`true`})})]},e.value))})]})]}),/* @__PURE__ */ u(`button`,{onClick:()=>e(`Event created`,{description:`Friday, June 12 at 10:00 AM`}),children:`Create Event`}),/* @__PURE__ */ u(j,{toaster:e,side:r,align:a,children:()=>/* @__PURE__ */ u(D,{children:/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]})})})]})}function W(){let e=s(),[t]=c.useState(()=>N());return c.useEffect(()=>()=>{t.dismiss()},[t]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:()=>t(`Message archived`,{action:{label:`Undo`,onAction:()=>e(`Message restored`)},cancel:{label:`Dismiss`,onCancel:()=>e(`Kept archived`)},onDismiss:({reason:t})=>e(`Closed (${t})`)}),children:`Archive Message`}),/* @__PURE__ */ u(j,{toaster:t,children:e=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ u(M,{}),e.cancel&&/* @__PURE__ */ u(k,{action:e.cancel.onCancel,children:e.cancel.label}),/* @__PURE__ */ u(O,{"data-variant":`solid`})]})})]})}function G(){let[e]=c.useState(()=>N());return c.useEffect(()=>()=>{e.dismiss()},[e]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:()=>e(`Invoice sent`,{description:`Hollis Grant · $240.00`,action:{label:`View`,href:`#`}}),children:`Send Invoice`}),/* @__PURE__ */ u(j,{toaster:e,children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]}),/* @__PURE__ */ u(O,{"data-variant":`solid`})]})})]})}function K(){let[e]=c.useState(()=>N()),t=c.useRef(0);c.useEffect(()=>()=>{e.dismiss()},[e]);function n(){let e=++t.current%2==1;return new Promise((t,n)=>setTimeout(()=>e?t():n(/* @__PURE__ */ Error(`Network error`)),1500))}function r(){e.promise(n,{loading:`Saving changes…`,success:`Changes saved`,error:{title:`Couldn't save changes`,description:`Check your connection and try again.`,action:{label:`Retry`,onAction:r}}})}return/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:r,children:`Save Changes`}),/* @__PURE__ */ u(j,{toaster:e,children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]}),/* @__PURE__ */ u(O,{"data-variant":`solid`})]})})]})}const q=[{title:`Event created`,description:`Friday, June 12 at 10:00 AM`},{title:`Message sent`},{title:`Hollis Grant joined`,description:`They can now edit the Launch plan and see its comments.`},{title:`Changes saved`},{title:`Invoice sent`,description:`Inès Moreau · $240.00`},{title:`Photos uploaded`,description:`12 photos added to Summer trip`}];function J(){let[e]=c.useState(()=>N()),[n,r]=c.useState(!1),i=c.useRef(0);return c.useEffect(()=>()=>{e.dismiss()},[e]),/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ d(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ u(f,{checked:n,onCheckedChange:e=>r(e===!0),children:/* @__PURE__ */ u(p,{children:/* @__PURE__ */ u(t,{"aria-hidden":`true`})})}),`Always expanded`]})}),/* @__PURE__ */ u(`button`,{onClick:()=>e(q[i.current++%q.length]),children:`Add Toast`}),/* @__PURE__ */ u(j,{toaster:e,maxVisible:4,expanded:n,children:()=>/* @__PURE__ */ u(D,{children:/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]})})})]})}function Y(){let[e]=c.useState(()=>N());return c.useEffect(()=>()=>{e.dismiss()},[e]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(`button`,{onClick:()=>e(`Link copied`,{duration:1e3}),children:`1 Second`}),/* @__PURE__ */ u(`button`,{onClick:()=>e(`Changes saved`),children:`5 Seconds`}),/* @__PURE__ */ u(`button`,{onClick:()=>e(`Your session expires in 5 minutes`,{duration:1/0,dismissible:!1,cancel:{label:`Got It`}}),children:`Until Dismissed`})]}),/* @__PURE__ */ u(j,{toaster:e,children:e=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ u(M,{}),e.cancel&&/* @__PURE__ */ u(k,{"data-variant":`solid`,action:e.cancel.onCancel,children:e.cancel.label})]})})]})}function X(){let e=s(),[t]=c.useState(()=>N()),n=c.useRef(void 0);c.useEffect(()=>()=>{clearInterval(n.current),t.dismiss()},[t]);function i(){clearInterval(n.current);let r=t.loading(`Uploading report.pdf… 0%`,{id:`upload`}),i=0;n.current=setInterval(()=>{i+=20;let a=i>=100,o=t.update(r,a?{title:`Report uploaded`,type:`success`}:{title:`Uploading report.pdf… ${i}%`});o||e(`Upload canceled`),(a||!o)&&clearInterval(n.current)},700)}return/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(`button`,{onClick:i,children:`Upload Report`}),/* @__PURE__ */ u(`button`,{onClick:()=>t.dismiss(`upload`),children:`Cancel Upload`}),/* @__PURE__ */ u(`button`,{onClick:()=>t.dismiss(),children:`Dismiss All`})]}),/* @__PURE__ */ u(j,{toaster:t,children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ u(r,{"data-show":`success`,"aria-hidden":`true`}),/* @__PURE__ */ u(a,{"data-show":`loading`,"aria-hidden":`true`}),/* @__PURE__ */ u(M,{})]})})]})}function re(){return new Promise(e=>setTimeout(e,1500))}function Z(){let e=s(),[t]=c.useState(()=>N({duration:6e3}));return c.useEffect(()=>()=>{t.dismiss()},[t]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:()=>t(`File deleted`,{description:`Q3 report.pdf`,action:{label:`Undo`,onAction:async()=>{await re(),e(`Q3 report.pdf restored`)}}}),children:`Delete File`}),/* @__PURE__ */ u(j,{toaster:t,children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]}),/* @__PURE__ */ u(O,{"data-variant":`solid`,children:e=>e.pending?`Restoring…`:e.error?`Retry`:`Undo`})]})})]})}function ie(){let e=s(),[t]=c.useState(()=>N({duration:1e4}));return c.useEffect(()=>()=>{t.dismiss()},[t]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:()=>t(`Message sent`,{action:{label:`Undo`,onAction:()=>e(`Message unsent`)}}),children:`Send Message`}),/* @__PURE__ */ u(j,{toaster:t,shortcut:`alt+t`,"aria-label":`Alerts`,children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(O,{"data-variant":`solid`})]})})]})}function ae(){let[e]=c.useState(()=>E()),[t]=c.useState(()=>N({overlays:e})),[n]=c.useState(()=>w({overlays:e})),[i,a]=c.useState([`Acme`,`Globex`,`Initech`]),o=c.useRef(null);c.useEffect(()=>()=>{t.dismiss()},[t]);async function s(e,r){if(!await n({title:`Delete ${e}?`,description:`The project and its files will be deleted for everyone on your team.`,confirmLabel:`Delete`,cancelLabel:`Cancel`}))return;let i=r.closest(`li`);((i?.nextElementSibling??i?.previousElementSibling)?.querySelector(`button`)??o.current)?.focus(),a(t=>t.filter(t=>t!==e)),t.success(`${e} deleted`,{priority:`assertive`})}return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ u(`button`,{ref:o,type:`button`,onClick:()=>a([`Acme`,`Globex`,`Initech`]),children:`Reset Projects`})}),/* @__PURE__ */ d(`ul`,{"data-slot":`list`,"aria-label":`Projects`,children:[i.map(e=>/* @__PURE__ */ d(`li`,{"data-slot":`row`,children:[e,/* @__PURE__ */ u(`button`,{type:`button`,"data-size":`sm`,"aria-label":`Delete ${e}`,onClick:t=>s(e,t.currentTarget),children:`Delete`})]},e)),i.length===0&&/* @__PURE__ */ u(`li`,{"data-slot":`row`,children:`All projects deleted.`})]}),/* @__PURE__ */ u(T,{overlays:e,toast:{children:()=>/* @__PURE__ */ d(D,{children:[/* @__PURE__ */ u(r,{"data-show":`success`,"aria-hidden":`true`}),/* @__PURE__ */ u(M,{})]})}}),/* @__PURE__ */ d(x,{controller:n.controller,children:[/* @__PURE__ */ u(S,{}),/* @__PURE__ */ u(ee,{children:e=>/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(ne,{children:e.payload?.title}),/* @__PURE__ */ u(te,{children:e.payload?.description})]}),/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(C,{children:e.payload?.cancelLabel}),/* @__PURE__ */ u(C,{"data-variant":`solid`,value:`confirm`,children:e.payload?.confirmLabel})]})]})})]})]})}function oe(){let e=s(),[t]=c.useState(()=>N());return c.useEffect(()=>()=>{t.dismiss()},[t]),/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:()=>t({title:`Hollis Grant`,description:`Can you review the draft?`,data:{initials:`HG`},action:{label:`Reply`,onAction:()=>e(`Replying to Hollis Grant`)}}),children:`New Message`}),/* @__PURE__ */ u(j,{toaster:t,"aria-label":`Messages`,children:e=>/* @__PURE__ */ d(D,{render:(e,t)=>/* @__PURE__ */ u(`li`,{...e,inert:t.leaving||!t.expanded&&t.index>0||void 0}),children:[/* @__PURE__ */ u(`span`,{"data-slot":`media`,children:e.data.initials}),/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]}),/* @__PURE__ */ u(O,{"data-variant":`solid`}),/* @__PURE__ */ u(k,{"aria-label":`Close`,children:/* @__PURE__ */ u(o,{"aria-hidden":`true`})})]})})]})}const Q=N();function se(){return/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`button`,{onClick:()=>Q({title:`Event has been created`,description:`Monday, January 3rd at 6:00pm`}),children:`Show toast`}),/* @__PURE__ */ u(j,{toaster:Q,children:e=>/* @__PURE__ */ u(D,{children:/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]})})})]})}const $=N();function ce(){return/* @__PURE__ */ d(`div`,{dir:`rtl`,children:[/* @__PURE__ */ u(`button`,{onClick:()=>$(`تم إنشاء الحدث`,{description:`الأحد 3 ديسمبر الساعة 9:00 صباحًا`}),children:`إظهار الإشعار`}),/* @__PURE__ */ u(j,{toaster:$,children:e=>/* @__PURE__ */ u(D,{children:/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(M,{}),/* @__PURE__ */ u(A,{})]})})})]})}var le={name:`toast`,title:`Toast`,description:`Show notifications with actions, timed dismissal, and screen reader announcements.`,sections:[{heading:null,text:`A toast tells someone that something happened, like a saved change or a sent message, and goes away on its own. It can offer an action such as Undo, stacks with the toasts before it, and is announced to screen readers without taking focus.`,examples:[{id:`toast/demo`,caption:`Press Create Event. Choose Undo, swipe the toast away, or wait for it to close. Undo logs Event removed.`,Example:R,source:`import * as React from "react"
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [toast] = React.useState(() => createToaster())
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <button
        onClick={() =>
          toast("Event created", {
            description: "Friday, June 12 at 10:00 AM",
            action: { label: "Undo", onAction: () => log("Event removed") },
          })
        }
      >
        Create Event
      </button>
      <ToastRegion toaster={toast}>
        {() => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction data-variant="solid" />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Types`,text:"`toast.success`, `.info`, `.warning`, `.error` and `.loading` set the toast's type, which the toast exposes as `data-type` for an icon or a color. Errors are announced right away and other types wait for a pause; set `priority` to change that. A loading toast stays until it's updated or dismissed.",examples:[{id:`toast/types`,caption:`Choose a type. Each toast shows its type's icon, and Loading turns into Photos uploaded when it finishes.`,Example:B,source:`import * as React from "react"
import {
  Toast,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import {
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

function upload() {
  return new Promise((resolve) => setTimeout(resolve, 2000))
}

function Example() {
  const [toast] = React.useState(() => createToaster())
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <div data-slot="row">
        <button onClick={() => toast("Event created")}>Default</button>
        <button onClick={() => toast.success("Changes saved")}>Success</button>
        <button onClick={() => toast.info("A new version is available")}>
          Info
        </button>
        <button onClick={() => toast.warning("Storage is almost full")}>
          Warning
        </button>
        <button onClick={() => toast.error("Couldn't save changes")}>
          Error
        </button>
        <button
          onClick={() =>
            toast.promise(upload, {
              loading: "Uploading photos…",
              success: "Photos uploaded",
              error: "Upload failed",
            })
          }
        >
          Loading
        </button>
      </div>
      <ToastRegion toaster={toast}>
        {() => (
          <Toast>
            <CircleCheckIcon data-show="success" aria-hidden="true" />
            <InfoIcon data-show="info" aria-hidden="true" />
            <TriangleAlertIcon data-show="warning" aria-hidden="true" />
            <OctagonXIcon data-show="error" aria-hidden="true" />
            <LoaderCircleIcon data-show="loading" aria-hidden="true" />
            <ToastTitle />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Position`,text:"Set the region's `side` to `top` or `bottom`, and `align` to `start`, `center` or `end`. Start and end follow the writing direction. A toast can be swiped toward the side and, unless it's centered, toward the end it's aligned to.",examples:[{id:`toast/position`,caption:`Choose a side and an alignment, then press Create Event and look for the toast at that edge of the page.`,Example:U,source:`import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import {
  Toast,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const sides = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
]
const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]
type Side = "top" | "bottom"
type Align = "start" | "center" | "end"

function Example() {
  const [toast] = React.useState(() => createToaster())
  const [side, setSide] = React.useState<Side>("bottom")
  const [align, setAlign] = React.useState<Align>("end")
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={sides}
          value={side}
          onValueChange={(next) => next && setSide(next as Side)}
        >
          <SelectLabel>Side</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon aria-hidden="true" />
          </SelectTrigger>
          <SelectContent>
            {sides.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={aligns}
          value={align}
          onValueChange={(next) => next && setAlign(next as Align)}
        >
          <SelectLabel>Align</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon aria-hidden="true" />
          </SelectTrigger>
          <SelectContent>
            {aligns.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        onClick={() =>
          toast("Event created", { description: "Friday, June 12 at 10:00 AM" })
        }
      >
        Create Event
      </button>
      <ToastRegion toaster={toast} side={side} align={align}>
        {() => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
          </Toast>
        )}
      </ToastRegion>
    </div>
  )
}

export { Example }
`}]},{heading:`Action and Cancel`,text:"Add an `action`, like Undo, and a `cancel` button that dismisses the toast. Their callbacks can update your app. `onDismiss` tells you why the toast is closing, and `details.cancel()` keeps it open; a canceled timeout starts the countdown again.",examples:[{id:`toast/action`,caption:`Press Archive Message, then choose Undo or Dismiss, swipe the toast away, or let it time out. The console logs why it closed.`,Example:W,source:`import * as React from "react"
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [toast] = React.useState(() => createToaster())
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <button
        onClick={() =>
          toast("Message archived", {
            action: { label: "Undo", onAction: () => log("Message restored") },
            cancel: { label: "Dismiss", onCancel: () => log("Kept archived") },
            onDismiss: ({ reason }) => log(\`Closed (\${reason})\`),
          })
        }
      >
        Archive Message
      </button>
      <ToastRegion toaster={toast}>
        {(item) => (
          <Toast>
            <ToastTitle />
            {item.cancel && (
              <ToastClose action={item.cancel.onCancel}>
                {item.cancel.label}
              </ToastClose>
            )}
            <ToastAction data-variant="solid" />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Link`,text:"Give an action an `href` to render it as a link. It keeps normal link behavior, including opening in a new tab.",examples:[{id:`toast/link`,caption:`Press Send Invoice, then follow View in the toast.`,Example:G,source:`import * as React from "react"
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"

function Example() {
  const [toast] = React.useState(() => createToaster())
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <button
        onClick={() =>
          toast("Invoice sent", {
            description: "Hollis Grant · $240.00",
            action: { label: "View", href: "#" },
          })
        }
      >
        Send Invoice
      </button>
      <ToastRegion toaster={toast}>
        {() => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction data-variant="solid" />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Promise`,text:"`toast.promise()` shows a loading toast, then updates the same toast when the promise resolves or rejects. Each message can be a string, options with a description or an action, or a function of the result. A toast dismissed while loading stays closed.",examples:[{id:`toast/promise`,caption:`Press Save Changes to see Saving changes become Changes saved. Press it again for the error, then choose Retry.`,Example:K,source:`import * as React from "react"
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"

function Example() {
  const [toast] = React.useState(() => createToaster())
  const attempts = React.useRef(0)
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  function save() {
    const succeeds = ++attempts.current % 2 === 1
    return new Promise<void>((resolve, reject) =>
      setTimeout(
        () => (succeeds ? resolve() : reject(new Error("Network error"))),
        1500
      )
    )
  }

  function saveChanges() {
    toast.promise(save, {
      loading: "Saving changes…",
      success: "Changes saved",
      error: {
        title: "Couldn't save changes",
        description: "Check your connection and try again.",
        action: { label: "Retry", onAction: saveChanges },
      },
    })
  }

  return (
    <>
      <button onClick={saveChanges}>Save Changes</button>
      <ToastRegion toaster={toast}>
        {() => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction data-variant="solid" />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Stacking`,text:"`maxVisible` limits how many toasts show at once, three by default; the rest wait in the queue, and their timers start when they show. The stack expands while the pointer or focus is in it. Set `expanded` to keep it open. Styling shows the CSS that lays out the stack.",examples:[{id:`toast/stacking`,caption:`Press Add Toast a few times, then hover the stack to expand it. Past four toasts, the rest wait their turn. Check Always expanded to keep it open.`,Example:J,source:`import * as React from "react"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import {
  Toast,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { CheckIcon } from "lucide-react"

const notifications = [
  { title: "Event created", description: "Friday, June 12 at 10:00 AM" },
  { title: "Message sent" },
  {
    title: "Hollis Grant joined",
    description: "They can now edit the Launch plan and see its comments.",
  },
  { title: "Changes saved" },
  { title: "Invoice sent", description: "Inès Moreau · $240.00" },
  { title: "Photos uploaded", description: "12 photos added to Summer trip" },
]

function Example() {
  const [toast] = React.useState(() => createToaster())
  const [expanded, setExpanded] = React.useState(false)
  const count = React.useRef(0)
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Checkbox
            checked={expanded}
            onCheckedChange={(next) => setExpanded(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Always expanded
        </label>
      </div>
      <button
        onClick={() =>
          toast(notifications[count.current++ % notifications.length])
        }
      >
        Add Toast
      </button>
      <ToastRegion toaster={toast} maxVisible={4} expanded={expanded}>
        {() => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
          </Toast>
        )}
      </ToastRegion>
    </div>
  )
}

export { Example }
`}]},{heading:`Duration`,text:"Set `duration` in milliseconds, on the toaster or on one toast, or `Infinity` for a toast that stays until it's dismissed. The default is five seconds. Timers pause while the pointer or focus is in the region, and while the page is hidden or its window is inactive.",examples:[{id:`toast/duration`,caption:`Press each button. Hover a toast to pause its timer. The session toast stays until you press Got It.`,Example:Y,source:`import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"

function Example() {
  const [toast] = React.useState(() => createToaster())
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <div data-slot="row">
        <button onClick={() => toast("Link copied", { duration: 1000 })}>
          1 Second
        </button>
        <button onClick={() => toast("Changes saved")}>5 Seconds</button>
        <button
          onClick={() =>
            toast("Your session expires in 5 minutes", {
              duration: Infinity,
              dismissible: false,
              cancel: { label: "Got It" },
            })
          }
        >
          Until Dismissed
        </button>
      </div>
      <ToastRegion toaster={toast}>
        {(item) => (
          <Toast>
            <ToastTitle />
            {item.cancel && (
              <ToastClose data-variant="solid" action={item.cancel.onCancel}>
                {item.cancel.label}
              </ToastClose>
            )}
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Update and Dismiss`,text:"Keep the id `toast()` returns to update or dismiss that toast, or pass your own `id`. `toast.update()` returns whether the toast was still there, and `toast.dismiss()` without an id closes every toast.",examples:[{id:`toast/update`,caption:`Press Upload Report and watch one toast count up to Report uploaded. Cancel Upload closes it early, and Dismiss All clears every toast.`,Example:X,source:`import * as React from "react"
import {
  Toast,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { CircleCheckIcon, LoaderCircleIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [toast] = React.useState(() => createToaster())
  const timer = React.useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  )
  React.useEffect(
    () => () => {
      clearInterval(timer.current)
      toast.dismiss()
    },
    [toast]
  )

  function upload() {
    clearInterval(timer.current)
    const id = toast.loading("Uploading report.pdf… 0%", { id: "upload" })
    let progress = 0
    timer.current = setInterval(() => {
      progress += 20
      const done = progress >= 100
      const open = toast.update(
        id,
        done
          ? { title: "Report uploaded", type: "success" }
          : { title: \`Uploading report.pdf… \${progress}%\` }
      )
      if (!open) {
        log("Upload canceled")
      }
      if (done || !open) {
        clearInterval(timer.current)
      }
    }, 700)
  }

  return (
    <>
      <div data-slot="row">
        <button onClick={upload}>Upload Report</button>
        <button onClick={() => toast.dismiss("upload")}>Cancel Upload</button>
        <button onClick={() => toast.dismiss()}>Dismiss All</button>
      </div>
      <ToastRegion toaster={toast}>
        {() => (
          <Toast>
            <CircleCheckIcon data-show="success" aria-hidden="true" />
            <LoaderCircleIcon data-show="loading" aria-hidden="true" />
            <ToastTitle />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Async Action`,text:"Return a promise from an action to keep the toast open while it runs. The action's state has `pending` while it runs and `error` if it fails, so the button can say Restoring… or offer a retry, and presses are ignored until it settles. See Button for changes made after an `await`.",examples:[{id:`toast/async-action`,caption:`Press Delete File, then Undo. The button shows Restoring… until the restore finishes, then the toast closes.`,Example:Z,source:`import * as React from "react"
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { useLog } from "../../../shared/react/log"

function restore() {
  return new Promise((resolve) => setTimeout(resolve, 1500))
}

function Example() {
  const log = useLog()
  const [toast] = React.useState(() => createToaster({ duration: 6000 }))
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <button
        onClick={() =>
          toast("File deleted", {
            description: "Q3 report.pdf",
            action: {
              label: "Undo",
              onAction: async () => {
                await restore()
                log("Q3 report.pdf restored")
              },
            },
          })
        }
      >
        Delete File
      </button>
      <ToastRegion toaster={toast}>
        {() => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction data-variant="solid">
              {(state) =>
                state.pending ? "Restoring…" : state.error ? "Retry" : "Undo"
              }
            </ToastAction>
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Keyboard Shortcut`,text:"F6 moves focus to the newest toast and back. Set the region's `shortcut` to use another key, or `null` to turn it off. The region advertises it through `aria-keyshortcuts`.",examples:[{id:`toast/shortcut`,caption:`Press Send Message, then Alt+T (Option+T on a Mac) to focus the toast. Press Escape to dismiss it, or Alt+T again to go back.`,Example:ie,source:`import * as React from "react"
import {
  Toast,
  ToastAction,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [toast] = React.useState(() => createToaster({ duration: 10000 }))
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <button
        onClick={() =>
          toast("Message sent", {
            action: { label: "Undo", onAction: () => log("Message unsent") },
          })
        }
      >
        Send Message
      </button>
      <ToastRegion toaster={toast} shortcut="alt+t" aria-label="Alerts">
        {() => (
          <Toast>
            <ToastTitle />
            <ToastAction data-variant="solid" />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`Overlay Host and Confirm`,text:"Instead of placing a region, render `OverlayHost` once near your app's root. It renders the toaster's region, with the `toast.children` you give it, and `confirm()` questions as alert dialogs. A region you place yourself takes over from the host for its toaster.",examples:[{id:`toast/overlay-host`,caption:`Press Delete on a project and confirm. The row goes away and a toast says so. Reset Projects brings them back.`,Example:ae,source:`import * as React from "react"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  createConfirm,
  type ConfirmOptions,
} from "@ui-sdk/react/alert-dialog"
import { OverlayHost, createOverlays } from "@ui-sdk/react/overlays"
import { Toast, ToastTitle, createToaster } from "@ui-sdk/react/toast"
import { CircleCheckIcon } from "lucide-react"

function Example() {
  const [overlays] = React.useState(() => createOverlays())
  const [toast] = React.useState(() => createToaster({ overlays }))
  const [confirm] = React.useState(() => createConfirm({ overlays }))
  const [projects, setProjects] = React.useState(["Acme", "Globex", "Initech"])
  const reset = React.useRef<HTMLButtonElement>(null)
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  async function remove(name: string, button: HTMLButtonElement) {
    const confirmed = await confirm({
      title: \`Delete \${name}?\`,
      description:
        "The project and its files will be deleted for everyone on your team.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    })
    if (!confirmed) {
      return
    }
    const row = button.closest("li")
    const next = (
      row?.nextElementSibling ?? row?.previousElementSibling
    )?.querySelector("button")
    ;(next ?? reset.current)?.focus()
    setProjects((list) => list.filter((project) => project !== name))
    toast.success(\`\${name} deleted\`, { priority: "assertive" })
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          ref={reset}
          type="button"
          onClick={() => setProjects(["Acme", "Globex", "Initech"])}
        >
          Reset Projects
        </button>
      </div>
      <ul data-slot="list" aria-label="Projects">
        {projects.map((name) => (
          <li data-slot="row" key={name}>
            {name}
            <button
              type="button"
              data-size="sm"
              aria-label={\`Delete \${name}\`}
              onClick={(event) => remove(name, event.currentTarget)}
            >
              Delete
            </button>
          </li>
        ))}
        {projects.length === 0 && (
          <li data-slot="row">All projects deleted.</li>
        )}
      </ul>
      <OverlayHost
        overlays={overlays}
        toast={{
          children: () => (
            <Toast>
              <CircleCheckIcon data-show="success" aria-hidden="true" />
              <ToastTitle />
            </Toast>
          ),
        }}
      />
      <AlertDialog controller={confirm.controller}>
        <AlertDialogBackdrop />
        <AlertDialogContent<ConfirmOptions>>
          {(state) => (
            <>
              <div data-slot="stack">
                <AlertDialogTitle>{state.payload?.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {state.payload?.description}
                </AlertDialogDescription>
              </div>
              <div data-slot="row">
                <AlertDialogClose>
                  {state.payload?.cancelLabel}
                </AlertDialogClose>
                <AlertDialogClose data-variant="solid" value="confirm">
                  {state.payload?.confirmLabel}
                </AlertDialogClose>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Pass anything else your toast needs in `data`, and read it from the toast the region's children function receives. Every part also takes `render`; this example renders each toast's `li` itself, making the ones hidden behind a collapsed stack `inert`.",examples:[{id:`toast/custom`,caption:`Press New Message to show a toast with Hollis Grant's initials. Choose Reply or close it.`,Example:oe,source:`import * as React from "react"
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"
import { XIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [toast] = React.useState(() => createToaster())
  React.useEffect(
    () => () => {
      toast.dismiss()
    },
    [toast]
  )

  return (
    <>
      <button
        onClick={() =>
          toast({
            title: "Hollis Grant",
            description: "Can you review the draft?",
            data: { initials: "HG" },
            action: {
              label: "Reply",
              onAction: () => log("Replying to Hollis Grant"),
            },
          })
        }
      >
        New Message
      </button>
      <ToastRegion toaster={toast} aria-label="Messages">
        {(item) => (
          <Toast
            render={(props, state) => (
              <li
                {...props}
                inert={
                  state.leaving ||
                  (!state.expanded && state.index > 0) ||
                  undefined
                }
              />
            )}
          >
            <span data-slot="media">
              {(item.data as { initials: string }).initials}
            </span>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction data-variant="solid" />
            <ToastClose aria-label="Close">
              <XIcon aria-hidden="true" />
            </ToastClose>
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`toast/description`,caption:``,Example:se,source:`import {
  Toast,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"

const toast = createToaster()

export function Example() {
  return (
    <>
      <button
        onClick={() =>
          toast({
            title: "Event has been created",
            description: "Monday, January 3rd at 6:00pm",
          })
        }
      >
        Show toast
      </button>
      <ToastRegion toaster={toast}>
        {(item) => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}
`},{id:`toast/rtl`,caption:``,Example:ce,source:`import {
  Toast,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@ui-sdk/react/toast"

const toast = createToaster()

export function Example() {
  return (
    <div dir="rtl">
      <button
        onClick={() =>
          toast("تم إنشاء الحدث", {
            description: "الأحد 3 ديسمبر الساعة 9:00 صباحًا",
          })
        }
      >
        إظهار الإشعار
      </button>
      <ToastRegion toaster={toast}>
        {(item) => (
          <Toast>
            <div data-slot="stack">
              <ToastTitle />
              <ToastDescription />
            </div>
          </Toast>
        )}
      </ToastRegion>
    </div>
  )
}
`}]}]};export{le as default};