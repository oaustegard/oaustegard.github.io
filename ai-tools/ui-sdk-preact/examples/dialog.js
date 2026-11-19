import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-CA3STxaZ.js";import{t as n}from"../chunks/c-CUqRK9mO.js";import{t as r}from"../chunks/c-BwdqlraN.js";import{t as i}from"../chunks/c-BfTRFW97.js";import{t as a}from"../chunks/c-CKwygB1M.js";import{t as o}from"../chunks/c-NPxkywtp.js";import{useLog as s}from"./log.js";import{Menu as c,MenuContent as l,MenuItem as u,MenuTrigger as d}from"ui-sdk/menu.js";import{Dialog as f,DialogBackdrop as p,DialogClose as m,DialogContent as h,DialogDescription as g,DialogShortcut as _,DialogTitle as v,DialogTrigger as y,createDialogController as b}from"ui-sdk/dialog.js";import*as x from"preact/compat";import{Fragment as S,jsx as C,jsxs as w}from"preact/compat/jsx-runtime";import{Field as T,FieldControl as E,FieldLabel as D}from"ui-sdk/field.js";import{Input as O}from"ui-sdk/input.js";import{Checkbox as k,CheckboxIndicator as A}from"ui-sdk/checkbox.js";import{Select as j,SelectContent as M,SelectItem as N,SelectItemIndicator as P,SelectLabel as F,SelectTrigger as I,SelectValue as L}from"ui-sdk/select.js";function R(){return/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ C(y,{children:`Share`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Share link`}),/* @__PURE__ */ C(g,{children:`Anyone who has this link will be able to view this.`})]}),/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Link`}),/* @__PURE__ */ C(O,{defaultValue:`https://example.com/project`,readOnly:!0})]}),/* @__PURE__ */ C(`div`,{"data-slot":`row`,children:/* @__PURE__ */ C(m,{"data-variant":`solid`,children:`Done`})}),/* @__PURE__ */ C(m,{"aria-label":`Close`,children:/* @__PURE__ */ C(o,{"aria-hidden":`true`})})]})]})}const z=[`These terms govern your use of the service. By creating an account, you agree to them and to the privacy policy that explains how we handle your data.`,`You're responsible for the content you upload and for keeping your password safe. Tell us right away if you think someone else has used your account.`,`We may change the service, and these terms, as the product grows. When a change affects you, we'll let you know by email at least 30 days before it takes effect.`,`You can stop using the service at any time. We'll keep your data for 30 days after you close your account, so you can export it, and then delete it.`,`The service is provided as is. To the extent the law allows, we aren't liable for indirect damages, lost profits or lost data.`,`If you have questions about these terms, write to us. We read every message and reply within two working days.`];function B(){return/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ C(y,{children:`Scrollable Content`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{initialFocus:`content`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Terms of service`}),/* @__PURE__ */ C(g,{children:`Please read before you continue.`})]}),/* @__PURE__ */ C(`div`,{"data-slot":`scroll`,children:z.map(e=>/* @__PURE__ */ C(`p`,{children:e},e))}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Decline`}),/* @__PURE__ */ C(m,{"data-variant":`solid`,value:`accept`,children:`Accept`})]})]})]})}function V(){let e=s();return/* @__PURE__ */ w(f,{onOpenChange:(t,n)=>{t||e(n.returnValue?`Saved as ${n.returnValue}`:`Closed (${n.reason})`)},children:[/* @__PURE__ */ C(y,{children:`New Article`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`New article`}),/* @__PURE__ */ C(g,{children:`Save it as a draft or publish it now.`})]}),/* @__PURE__ */ w(`form`,{"data-slot":`stack`,method:`dialog`,children:[/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Title`}),/* @__PURE__ */ C(O,{required:!0,defaultValue:`Shipping updates for spring`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(`button`,{type:`submit`,value:`draft`,children:`Save Draft`}),/* @__PURE__ */ C(`button`,{"data-variant":`solid`,type:`submit`,value:`published`,children:`Publish`})]})]})]})]})}const H=[{label:`Product updates`,checked:!0},{label:`Security alerts`,checked:!0},{label:`Weekly digest`,checked:!1}];function U(){let t=s(),[n,r]=x.useState(!1);return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ w(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ C(k,{checked:n,onCheckedChange:e=>r(e===!0),children:/* @__PURE__ */ C(A,{children:/* @__PURE__ */ C(e,{"aria-hidden":`true`})})}),`Open`]})}),/* @__PURE__ */ w(f,{open:n,onOpenChange:(e,n)=>{r(e),t(`${e?`Opened`:`Closed`} (${n.reason})`)},onOpenChangeComplete:e=>t(e?`Finished opening`:`Finished closing`),children:[/* @__PURE__ */ C(y,{children:`Notification Settings`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Notification settings`}),/* @__PURE__ */ C(g,{children:`Choose what we email you about.`})]}),/* @__PURE__ */ C(`div`,{"data-slot":`stack`,children:H.map(t=>/* @__PURE__ */ w(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ C(k,{defaultChecked:t.checked,children:/* @__PURE__ */ C(A,{children:/* @__PURE__ */ C(e,{"aria-hidden":`true`})})}),t.label]},t.label))}),/* @__PURE__ */ C(`div`,{"data-slot":`row`,children:/* @__PURE__ */ C(m,{"data-variant":`solid`,children:`Done`})})]})]})]})}function W(){return/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ w(y,{shortcut:`mod+j`,children:[/* @__PURE__ */ C(a,{"aria-hidden":`true`}),`New Contact`,/* @__PURE__ */ C(_,{})]}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`New contact`}),/* @__PURE__ */ C(g,{children:`Add someone to your address book.`})]}),/* @__PURE__ */ w(`form`,{"data-slot":`stack`,method:`dialog`,children:[/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Name`}),/* @__PURE__ */ C(O,{name:`name`,required:!0,placeholder:`Kofi Mensah`})]}),/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Email`}),/* @__PURE__ */ C(O,{name:`email`,type:`email`,required:!0,placeholder:`kofi@example.com`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Cancel`}),/* @__PURE__ */ C(`button`,{"data-variant":`solid`,type:`submit`,value:`save`,children:`Save Contact`})]})]})]})]})}function G(){let e=s();return/* @__PURE__ */ w(f,{onOpenChangeComplete:t=>e(t?`Finished opening`:`Finished closing`),children:[/* @__PURE__ */ C(y,{children:`Slide In`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{keepMounted:!0,children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Slide and fade`}),/* @__PURE__ */ C(g,{children:`300ms in and out. Focus returns as soon as it starts closing.`})]}),/* @__PURE__ */ C(`div`,{"data-slot":`row`,children:/* @__PURE__ */ C(m,{"data-variant":`solid`,children:`Close`})})]})]})}const K=[{value:`true`,label:`Modal`},{value:`trap-focus`,label:`Trap focus`},{value:`false`,label:`Non-modal`}],q={true:`The rest of the page is inert and doesn't scroll.`,"trap-focus":`Tab stays inside, and the page still scrolls and takes clicks.`,false:`The page stays usable. Tab leaves the notes, and Escape closes them while focus is inside.`};function J(){let[n,r]=x.useState(`false`),[i,a]=x.useState(!1),o=n===`true`||n!==`false`&&`trap-focus`;return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ w(j,{items:K,value:n,onValueChange:e=>e&&r(e),children:[/* @__PURE__ */ C(F,{children:`Modal`}),/* @__PURE__ */ w(I,{children:[/* @__PURE__ */ C(L,{}),/* @__PURE__ */ C(t,{})]}),/* @__PURE__ */ C(M,{children:K.map(t=>/* @__PURE__ */ w(N,{value:t.value,children:[t.label,/* @__PURE__ */ C(P,{children:/* @__PURE__ */ C(e,{})})]},t.value))})]}),/* @__PURE__ */ w(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ C(k,{checked:i,onCheckedChange:e=>a(e===!0),children:/* @__PURE__ */ C(A,{children:/* @__PURE__ */ C(e,{"aria-hidden":`true`})})}),`Close on outside press`]})]}),/* @__PURE__ */ w(f,{modal:o,closeOnOutsidePress:i,children:[/* @__PURE__ */ C(y,{children:`Open Notes`}),o===!0&&/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Notes`}),/* @__PURE__ */ C(g,{children:q[n]})]}),/* @__PURE__ */ C(`textarea`,{"aria-label":`Notes`,defaultValue:`Call the printer about the proofs.`}),/* @__PURE__ */ C(`div`,{"data-slot":`row`,children:/* @__PURE__ */ C(m,{"data-variant":`solid`,children:`Done`})})]})]})]})}function Y(){return/* @__PURE__ */ C(`div`,{"data-slot":`dialog-frame`,children:/* @__PURE__ */ w(f,{modal:`trap-focus`,closeOnOutsidePress:!1,children:[/* @__PURE__ */ C(y,{children:`Delete Draft`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{inline:!0,children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Delete this draft?`}),/* @__PURE__ */ C(g,{children:`The preview keeps its dialog inside the frame.`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Cancel`}),/* @__PURE__ */ C(m,{"data-variant":`destructive`,children:`Delete`})]})]})]})})}function X(){let[e,t]=x.useState(!1),[n,r]=x.useState(!1),[i,a]=x.useState(!1),o=x.useRef(null),s=()=>{t(!1),r(!1),a(!1)};return/* @__PURE__ */ w(f,{open:e,onOpenChange:e=>e?t(!0):s(),dismissible:!n,onDismissAttempt:()=>a(!0),children:[/* @__PURE__ */ C(y,{children:`Write a Post`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`New post`}),/* @__PURE__ */ C(g,{children:`Share an update with your team.`})]}),/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Post`}),/* @__PURE__ */ C(E,{render:/* @__PURE__ */ C(`textarea`,{ref:o,placeholder:`What's new?`}),onChange:e=>r(e.currentTarget.value!==``)})]}),i?/* @__PURE__ */ w(`div`,{"data-slot":`row`,role:`alert`,children:[`Discard your changes?`,/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(`button`,{type:`button`,onClick:()=>{a(!1),o.current?.focus()},children:`Keep Editing`}),/* @__PURE__ */ C(`button`,{"data-variant":`solid`,type:`button`,onClick:s,children:`Discard`})]})]}):/* @__PURE__ */ C(`div`,{"data-slot":`row`,children:/* @__PURE__ */ C(m,{"data-variant":`solid`,value:`post`,children:`Post`})})]})]})}function Z(){return/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ C(y,{children:`Account`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Account`}),/* @__PURE__ */ C(g,{children:`Manage how you sign in.`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`card`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(`span`,{children:`Password`}),/* @__PURE__ */ C(`span`,{"data-slot":`hint`,children:`Last changed 3 months ago`})]}),/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ C(y,{children:`Change Password`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Change password`}),/* @__PURE__ */ C(g,{children:`Use at least 12 characters.`})]}),/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`New password`}),/* @__PURE__ */ C(O,{type:`password`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Cancel`}),/* @__PURE__ */ C(m,{"data-variant":`solid`,children:`Update`})]})]})]})]}),/* @__PURE__ */ C(`div`,{"data-slot":`row`,children:/* @__PURE__ */ C(m,{"data-variant":`solid`,children:`Done`})})]})]})}function Q(){let[e]=x.useState(()=>b());return/* @__PURE__ */ w(S,{children:[/* @__PURE__ */ w(c,{children:[/* @__PURE__ */ C(d,{"aria-label":`File actions`,children:/* @__PURE__ */ C(r,{"aria-hidden":`true`})}),/* @__PURE__ */ w(l,{children:[/* @__PURE__ */ w(u,{onSelect:()=>e.open(),children:[/* @__PURE__ */ C(i,{"aria-hidden":`true`}),`Rename…`]}),/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ C(n,{"aria-hidden":`true`}),`Duplicate`]})]})]}),/* @__PURE__ */ w(f,{controller:e,children:[/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Rename file`}),/* @__PURE__ */ C(g,{children:`Names must be unique in a folder.`})]}),/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Name`}),/* @__PURE__ */ C(O,{defaultValue:`report.pdf`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Cancel`}),/* @__PURE__ */ C(m,{"data-variant":`solid`,value:`rename`,children:`Rename`})]})]})]})]})}const $=[{id:`INV-001`,customer:`Acme`,amount:`$250.00`,status:`Paid`},{id:`INV-002`,customer:`Globex`,amount:`$150.00`,status:`Due`},{id:`INV-003`,customer:`Initech`,amount:`$350.00`,status:`Due`}];function ee(){let[e]=x.useState(()=>b()),t=s();async function n(){let{reason:n,returnValue:r}=await e.open({payload:$[2]});t(r===`send`?`Reminder sent from code`:`Closed (${n})`)}return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ C(`button`,{type:`button`,onClick:n,children:`Open from Code`})}),/* @__PURE__ */ C(`ul`,{"data-slot":`list`,children:$.map(t=>/* @__PURE__ */ w(`li`,{"data-slot":`row`,children:[t.customer,/* @__PURE__ */ w(`span`,{"data-slot":`hint`,children:[t.amount,` · `,t.status]}),/* @__PURE__ */ C(y,{controller:e,payload:t,disabled:t.status===`Paid`,"aria-label":`Remind ${t.customer}`,children:`Remind`})]},t.id))}),/* @__PURE__ */ w(f,{controller:e,onOpenChange:(e,n)=>{!e&&n.returnValue===`send`&&t(`Reminder sent`)},children:[/* @__PURE__ */ C(p,{}),/* @__PURE__ */ C(h,{children:e=>{let t=e.payload;return/* @__PURE__ */ w(S,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(v,{children:[`Remind `,t?.customer]}),/* @__PURE__ */ w(g,{children:[t?.id,` for `,t?.amount,` is due. We'll email the billing contact.`]})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Cancel`}),/* @__PURE__ */ C(m,{"data-variant":`solid`,value:`send`,children:`Send reminder`})]})]})}})]})]})}function te(){return/* @__PURE__ */ w(f,{presentation:`sheet`,children:[/* @__PURE__ */ C(y,{children:`Edit Profile`}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`Edit profile`}),/* @__PURE__ */ C(g,{children:`Make changes to your profile here. Save when you're done.`})]}),/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Name`}),/* @__PURE__ */ C(O,{defaultValue:`Hollis Grant`})]}),/* @__PURE__ */ w(T,{children:[/* @__PURE__ */ C(D,{children:`Username`}),/* @__PURE__ */ C(O,{defaultValue:`@hollis`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Cancel`}),/* @__PURE__ */ C(m,{"data-variant":`solid`,value:`save`,children:`Save Changes`})]})]})]})}function ne(){return/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ C(y,{shortcut:`mod+i`,render:(e,t)=>/* @__PURE__ */ w(`button`,{...e,children:[t.open?`Viewing`:`View Details`,/* @__PURE__ */ C(_,{children:e=>e.text})]})}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ C(h,{children:e=>/* @__PURE__ */ w(S,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{render:/* @__PURE__ */ C(`h3`,{}),children:`Details`}),/* @__PURE__ */ C(g,{children:e.nested?`Opened from another dialog.`:`Quarterly report, updated today.`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`Close`}),/* @__PURE__ */ C(m,{"data-variant":`solid`,render:/* @__PURE__ */ C(`a`,{href:`https://example.com/details`}),children:`Open the Full Page`})]})]})})]})}function re(){return/* @__PURE__ */ C(`div`,{dir:`rtl`,children:/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ C(y,{children:`تعديل الملف الشخصي`}),/* @__PURE__ */ C(p,{}),/* @__PURE__ */ w(h,{children:[/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ C(v,{children:`تعديل الملف الشخصي`}),/* @__PURE__ */ C(g,{children:`أجرِ التغييرات على ملفك الشخصي هنا.`})]}),/* @__PURE__ */ w(`label`,{"data-slot":`label`,children:[`الاسم`,/* @__PURE__ */ C(`input`,{defaultValue:`بيدرو دوارتي`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ C(m,{children:`إلغاء`}),/* @__PURE__ */ C(m,{"data-variant":`solid`,value:`save`,children:`حفظ`})]})]})]})})}var ie={name:`dialog`,title:`Dialog`,description:`Open a focused task over the page.`,sections:[{heading:null,text:`A dialog gives a task its own space: share a link, edit a record, or collect a few details. It manages focus, Escape, outside presses, and returning to where you started.`,examples:[{id:`dialog/basic`,caption:`Open Share, then close it with either Close button, Escape, or a press outside. Focus returns to Share.`,Example:R,source:`import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { XIcon } from "lucide-react"

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Share</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </div>
        <Field>
          <FieldLabel>Link</FieldLabel>
          <Input defaultValue="https://example.com/project" readOnly />
        </Field>
        <div data-slot="row">
          <DialogClose data-variant="solid">Done</DialogClose>
        </div>
        <DialogClose aria-label="Close">
          <XIcon aria-hidden="true" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Scrollable Content`,text:'Keep the header and actions outside the scrolling area. A viewport height limit, a shrinking middle grid row, and `overflow-y: auto` keep long content usable. `initialFocus="content"` focuses the dialog itself so reading starts at the top.',examples:[{id:`dialog/scrollable`,caption:`Open Scrollable Content in a short window. Scroll the terms while the title and Decline/Accept buttons stay in view.`,Example:B,source:`import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

const paragraphs = [
  "These terms govern your use of the service. By creating an account, you agree to them and to the privacy policy that explains how we handle your data.",
  "You're responsible for the content you upload and for keeping your password safe. Tell us right away if you think someone else has used your account.",
  "We may change the service, and these terms, as the product grows. When a change affects you, we'll let you know by email at least 30 days before it takes effect.",
  "You can stop using the service at any time. We'll keep your data for 30 days after you close your account, so you can export it, and then delete it.",
  "The service is provided as is. To the extent the law allows, we aren't liable for indirect damages, lost profits or lost data.",
  "If you have questions about these terms, write to us. We read every message and reply within two working days.",
]

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Scrollable Content</DialogTrigger>
      <DialogBackdrop />
      <DialogContent initialFocus="content">
        <div data-slot="stack">
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>
            Please read before you continue.
          </DialogDescription>
        </div>
        <div data-slot="scroll">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div data-slot="row">
          <DialogClose>Decline</DialogClose>
          <DialogClose data-variant="solid" value="accept">
            Accept
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Forms`,text:'A form with `method="dialog"` closes the dialog on a valid submission. The submit button’s `value` becomes the `returnValue`, just like a Close part’s `value`. An ordinary form stays open until you close the dialog yourself.',examples:[{id:`dialog/form`,caption:`Open New Article and choose Save Draft or Publish. The console logs the submitted button's value. An empty title prevents submission.`,Example:V,source:`"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <Dialog
      onOpenChange={(open, details) => {
        if (!open) {
          log(
            details.returnValue
              ? \`Saved as \${details.returnValue}\`
              : \`Closed (\${details.reason})\`
          )
        }
      }}
    >
      <DialogTrigger>New Article</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>New article</DialogTitle>
          <DialogDescription>
            Save it as a draft or publish it now.
          </DialogDescription>
        </div>
        <form data-slot="stack" method="dialog">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input required defaultValue="Shipping updates for spring" />
          </Field>
          <div data-slot="row">
            <button type="submit" value="draft">
              Save Draft
            </button>
            <button data-variant="solid" type="submit" value="published">
              Publish
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `open` and update it in `onOpenChange`. Cancel a proposed change with `details.cancel()`. `onOpenChangeComplete` reports when opening or closing has finished; see state and events for the common change contract.",examples:[{id:`dialog/controlled`,caption:`Check Open or press Notification Settings, then close the dialog. The console logs each change, its reason and when it finishes.`,Example:U,source:`"use client"

import * as React from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const topics = [
  { label: "Product updates", checked: true },
  { label: "Security alerts", checked: true },
  { label: "Weekly digest", checked: false },
]

function Example() {
  const log = useLog()
  const [open, setOpen] = React.useState(false)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
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
      <Dialog
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          log(\`\${next ? "Opened" : "Closed"} (\${details.reason})\`)
        }}
        onOpenChangeComplete={(next) =>
          log(next ? "Finished opening" : "Finished closing")
        }
      >
        <DialogTrigger>Notification Settings</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <div data-slot="stack">
            <DialogTitle>Notification settings</DialogTitle>
            <DialogDescription>
              Choose what we email you about.
            </DialogDescription>
          </div>
          <div data-slot="stack">
            {topics.map((topic) => (
              <label data-slot="label" key={topic.label}>
                <Checkbox defaultChecked={topic.checked}>
                  <CheckboxIndicator>
                    <CheckIcon aria-hidden="true" />
                  </CheckboxIndicator>
                </Checkbox>
                {topic.label}
              </label>
            ))}
          </div>
          <div data-slot="row">
            <DialogClose data-variant="solid">Done</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Keyboard Shortcut`,text:"A trigger’s `shortcut` opens it from the keyboard. `mod+j` means Command+J on Apple platforms and Control+J elsewhere. The Shortcut part displays the right keys and the trigger exposes `aria-keyshortcuts`.",examples:[{id:`dialog/shortcut`,caption:`Press Command+J or Control+J to open New contact. The button shows the keys, and Escape returns focus to it.`,Example:W,source:`"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { PlusIcon } from "lucide-react"

function Example() {
  return (
    <Dialog>
      <DialogTrigger shortcut="mod+j">
        <PlusIcon aria-hidden="true" />
        New Contact
        <DialogShortcut />
      </DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>
            Add someone to your address book.
          </DialogDescription>
        </div>
        <form data-slot="stack" method="dialog">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input name="name" required placeholder="Kofi Mensah" />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              name="email"
              type="email"
              required
              placeholder="kofi@example.com"
            />
          </Field>
          <div data-slot="row">
            <DialogClose>Cancel</DialogClose>
            <button data-variant="solid" type="submit" value="save">
              Save Contact
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The content and backdrop have `data-starting-style` while they open and `data-ending-style` while they close. Transition from those states, and the dialog stays mounted until the exit finishes. `onOpenChangeComplete` runs after the transition, and `keepMounted` keeps the content in the page while closed.",examples:[{id:`dialog/animation`,caption:`Open the dialog and close it. The console logs when each animation finishes; focus returns as closing starts.`,Example:G,source:`"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <Dialog
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <DialogTrigger>Slide In</DialogTrigger>
      <DialogBackdrop />
      <DialogContent keepMounted>
        <div data-slot="stack">
          <DialogTitle>Slide and fade</DialogTitle>
          <DialogDescription>
            300ms in and out. Focus returns as soon as it starts closing.
          </DialogDescription>
        </div>
        <div data-slot="row">
          <DialogClose data-variant="solid">Close</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Modal`,text:"`modal` controls how the dialog shares the page:",examples:[{id:`dialog/modal`,caption:`Choose a mode, open Notes, and try Tab or clicking the page. Check Close on outside press to compare dismissal.`,Example:J,source:`"use client"

import * as React from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const modes = [
  { value: "true", label: "Modal" },
  { value: "trap-focus", label: "Trap focus" },
  { value: "false", label: "Non-modal" },
]

type Mode = "true" | "trap-focus" | "false"

const notes = {
  true: "The rest of the page is inert and doesn't scroll.",
  "trap-focus":
    "Tab stays inside, and the page still scrolls and takes clicks.",
  false:
    "The page stays usable. Tab leaves the notes, and Escape closes them while focus is inside.",
}

function Example() {
  const [mode, setMode] = React.useState<Mode>("false")
  const [outside, setOutside] = React.useState(false)
  const modal = mode === "true" ? true : mode === "false" ? false : "trap-focus"
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={modes}
          value={mode}
          onValueChange={(next) => next && setMode(next as Mode)}
        >
          <SelectLabel>Modal</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {modes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label data-slot="label">
          <Checkbox
            checked={outside}
            onCheckedChange={(next) => setOutside(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Close on outside press
        </label>
      </div>
      <Dialog modal={modal} closeOnOutsidePress={outside}>
        <DialogTrigger>Open Notes</DialogTrigger>
        {modal === true && <DialogBackdrop />}
        <DialogContent>
          <div data-slot="stack">
            <DialogTitle>Notes</DialogTitle>
            <DialogDescription>{notes[mode]}</DialogDescription>
          </div>
          <textarea
            aria-label="Notes"
            defaultValue="Call the printer about the proofs."
          />
          <div data-slot="row">
            <DialogClose data-variant="solid">Done</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Inside a Frame`,text:'A dialog opens above the whole page. Set `inline` on the content to keep it and its backdrop where they are in the page, like inside an app preview. Your CSS sizes and places them in their frame. Pair it with `modal="trap-focus"` so the page around the frame stays usable.',examples:[{id:`dialog/inline`,caption:`Open Delete Draft. The dialog and its dim cover only the frame, and Tab stays inside the dialog.`,Example:Y,source:`import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

function Example() {
  return (
    <div data-slot="dialog-frame">
      <Dialog modal="trap-focus" closeOnOutsidePress={false}>
        <DialogTrigger>Delete Draft</DialogTrigger>
        <DialogBackdrop />
        <DialogContent inline>
          <div data-slot="stack">
            <DialogTitle>Delete this draft?</DialogTitle>
            <DialogDescription>
              The preview keeps its dialog inside the frame.
            </DialogDescription>
          </div>
          <div data-slot="row">
            <DialogClose>Cancel</DialogClose>
            <DialogClose data-variant="destructive">Delete</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Warn Before Closing a Dirty Form`,text:"Set `dismissible` to false while there are unsaved changes. Escape, an outside press, or a back gesture then keeps the dialog open and reports `onDismissAttempt`. Explicit Close parts and controller calls still work, so you can offer a deliberate way out.",examples:[{id:`dialog/dirty-form`,caption:`Type a post, then press Escape or click outside. Keep editing returns to the field; Discard closes the dialog and clears the draft.`,Example:X,source:`"use client"

import * as React from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  const [open, setOpen] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const [asking, setAsking] = React.useState(false)
  const post = React.useRef<HTMLTextAreaElement>(null)
  const close = () => {
    setOpen(false)
    setDirty(false)
    setAsking(false)
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
      dismissible={!dirty}
      onDismissAttempt={() => setAsking(true)}
    >
      <DialogTrigger>Write a Post</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>Share an update with your team.</DialogDescription>
        </div>
        <Field>
          <FieldLabel>Post</FieldLabel>
          <FieldControl
            render={<textarea ref={post} placeholder="What's new?" />}
            onChange={(event) => setDirty(event.currentTarget.value !== "")}
          />
        </Field>
        {asking ? (
          <div data-slot="row" role="alert">
            Discard your changes?
            <div data-slot="row">
              <button
                type="button"
                onClick={() => {
                  setAsking(false)
                  post.current?.focus()
                }}
              >
                Keep Editing
              </button>
              <button data-variant="solid" type="button" onClick={close}>
                Discard
              </button>
            </div>
          </div>
        ) : (
          <div data-slot="row">
            <DialogClose data-variant="solid" value="post">
              Post
            </DialogClose>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Nested Dialogs`,text:"A dialog opened inside another joins its stack. Escape closes the topmost dialog and returns focus to its trigger. Closing the parent also closes its children. `data-nested-open` and `--dialog-stack` let you show which layer is active.",examples:[{id:`dialog/nested`,caption:`Open Account, then Change Password. Press Escape once to return to Account, and again to close it.`,Example:Z,source:`import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Account</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>Manage how you sign in.</DialogDescription>
        </div>
        <div data-slot="card">
          <div data-slot="stack">
            <span>Password</span>
            <span data-slot="hint">Last changed 3 months ago</span>
          </div>
          <Dialog>
            <DialogTrigger>Change Password</DialogTrigger>
            <DialogBackdrop />
            <DialogContent>
              <div data-slot="stack">
                <DialogTitle>Change password</DialogTitle>
                <DialogDescription>
                  Use at least 12 characters.
                </DialogDescription>
              </div>
              <Field>
                <FieldLabel>New password</FieldLabel>
                <Input type="password" />
              </Field>
              <div data-slot="row">
                <DialogClose>Cancel</DialogClose>
                <DialogClose data-variant="solid">Update</DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div data-slot="row">
          <DialogClose data-variant="solid">Done</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Opening from a Menu Item`,text:`Render the dialog outside the menu and open it with the dialog’s controller. When the item disappears, the menu’s trigger becomes the place to return focus.`,examples:[{id:`dialog/from-menu`,caption:`Open File Actions and choose Rename. Close the dialog to return focus to the File Actions button.`,Example:Q,source:`"use client"

import * as React from "react"
import {
  createDialogController,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { CopyIcon, EllipsisIcon, PencilIcon } from "lucide-react"

function Example() {
  const [rename] = React.useState(() => createDialogController())
  return (
    <>
      <Menu>
        <MenuTrigger aria-label="File actions">
          <EllipsisIcon aria-hidden="true" />
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => rename.open()}>
            <PencilIcon aria-hidden="true" />
            Rename…
          </MenuItem>
          <MenuItem>
            <CopyIcon aria-hidden="true" />
            Duplicate
          </MenuItem>
        </MenuContent>
      </Menu>
      <Dialog controller={rename}>
        <DialogBackdrop />
        <DialogContent>
          <div data-slot="stack">
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Names must be unique in a folder.
            </DialogDescription>
          </div>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input defaultValue="report.pdf" />
          </Field>
          <div data-slot="row">
            <DialogClose>Cancel</DialogClose>
            <DialogClose data-variant="solid" value="rename">
              Rename
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { Example }
`}]},{heading:`Opening from Anywhere`,text:"Connect several triggers to one `createDialogController<Payload, Result>()`. Each trigger passes a `payload`; the content reads it from its state. `controller.open({ payload })` opens it from code and returns a promise that resolves when it closes, with the reason and any `returnValue`. Each trigger remains the return-focus target for the dialog it opened. See controllers for the shared controller pattern.",examples:[{id:`dialog/payload`,caption:`Open a reminder from either unpaid invoice, or press Open from Code. The same dialog shows that invoice, and the console logs how it closed.`,Example:ee,source:`"use client"

import * as React from "react"
import {
  createDialogController,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { useLog } from "../../../shared/react/log"

type Invoice = {
  id: string
  customer: string
  amount: string
  status: "Paid" | "Due"
}

const invoices: Invoice[] = [
  { id: "INV-001", customer: "Acme", amount: "$250.00", status: "Paid" },
  { id: "INV-002", customer: "Globex", amount: "$150.00", status: "Due" },
  { id: "INV-003", customer: "Initech", amount: "$350.00", status: "Due" },
]

function Example() {
  const [reminder] = React.useState(() =>
    createDialogController<Invoice, "send">()
  )
  const log = useLog()

  async function remindFromCode() {
    const { reason, returnValue } = await reminder.open({
      payload: invoices[2],
    })
    log(
      returnValue === "send" ? "Reminder sent from code" : \`Closed (\${reason})\`
    )
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={remindFromCode}>
          Open from Code
        </button>
      </div>
      <ul data-slot="list">
        {invoices.map((invoice) => (
          <li data-slot="row" key={invoice.id}>
            {invoice.customer}
            <span data-slot="hint">
              {invoice.amount} · {invoice.status}
            </span>
            <DialogTrigger
              controller={reminder}
              payload={invoice}
              disabled={invoice.status === "Paid"}
              aria-label={\`Remind \${invoice.customer}\`}
            >
              Remind
            </DialogTrigger>
          </li>
        ))}
      </ul>
      <Dialog
        controller={reminder}
        onOpenChange={(open, details) => {
          if (!open && details.returnValue === "send") {
            log("Reminder sent")
          }
        }}
      >
        <DialogBackdrop />
        <DialogContent<Invoice>>
          {(state) => {
            const invoice = state.payload
            return (
              <>
                <div data-slot="stack">
                  <DialogTitle>Remind {invoice?.customer}</DialogTitle>
                  <DialogDescription>
                    {invoice?.id} for {invoice?.amount} is due. We'll email the
                    billing contact.
                  </DialogDescription>
                </div>
                <div data-slot="row">
                  <DialogClose>Cancel</DialogClose>
                  <DialogClose data-variant="solid" value="send">
                    Send reminder
                  </DialogClose>
                </div>
              </>
            )
          }}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Presentation`,text:'`presentation="sheet"` presents the same task as a sheet. Use `"auto"` to choose a sheet on small touch screens and a centered dialog elsewhere, decided each time it opens. A swipe down closes a dismissible sheet; a protected one springs back and reports a dismissal attempt.',examples:[{id:`dialog/presentation`,caption:`Open Edit Profile as a sheet. On a touch screen, drag it down to dismiss it, or use Cancel or Save Changes.`,Example:te,source:`"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <Dialog presentation="sheet">
      <DialogTrigger>Edit Profile</DialogTrigger>
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Save when you're done.
          </DialogDescription>
        </div>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input defaultValue="Hollis Grant" />
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input defaultValue="@hollis" />
        </Field>
        <div data-slot="row">
          <DialogClose>Cancel</DialogClose>
          <DialogClose data-variant="solid" value="save">
            Save Changes
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state.",examples:[{id:`dialog/custom-rendering`,caption:`Open View Details. The trigger's label and the description come from their state, and Close renders as a link.`,Example:ne,source:`import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

function Example() {
  return (
    <Dialog>
      <DialogTrigger
        shortcut="mod+i"
        render={(props, state) => (
          <button {...props}>
            {state.open ? "Viewing" : "View Details"}
            <DialogShortcut>{(shortcut) => shortcut.text}</DialogShortcut>
          </button>
        )}
      />
      <DialogBackdrop />
      <DialogContent>
        {(state) => (
          <>
            <div data-slot="stack">
              <DialogTitle render={<h3 />}>Details</DialogTitle>
              <DialogDescription>
                {state.nested
                  ? "Opened from another dialog."
                  : "Quarterly report, updated today."}
              </DialogDescription>
            </div>
            <div data-slot="row">
              <DialogClose>Close</DialogClose>
              <DialogClose
                data-variant="solid"
                render={<a href="https://example.com/details" />}
              >
                Open the Full Page
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`dialog/rtl`,caption:``,Example:re,source:`import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

export function Example() {
  return (
    <div dir="rtl">
      <Dialog>
        <DialogTrigger>تعديل الملف الشخصي</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <div data-slot="stack">
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            <DialogDescription>
              أجرِ التغييرات على ملفك الشخصي هنا.
            </DialogDescription>
          </div>
          <label data-slot="label">
            الاسم
            <input defaultValue="بيدرو دوارتي" />
          </label>
          <div data-slot="row">
            <DialogClose>إلغاء</DialogClose>
            <DialogClose data-variant="solid" value="save">
              حفظ
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
`}]}]};export{ie as default};