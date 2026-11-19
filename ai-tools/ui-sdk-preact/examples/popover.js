import{Bs as e,Co as t,Ks as n,Mo as r,Oo as i,Xa as a,Xo as o,_a as s,ao as c,ba as l,da as u,do as d,fa as f,fl as p,ga as m,go as h,ha as g,ma as _,ml as v,mo as y,pa as b,qa as x,qs as S,ro as C,tl as w,to as T,ul as E,uo as D,va as O,wo as k,ya as A,yo as j}from"../chunks/c-CIXE4Nkk.js";function M(){return/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`Share`}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`Share this document`}),/* @__PURE__ */ w(g,{children:`Anyone with the link can view it.`}),/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Link`}),/* @__PURE__ */ w(j,{readOnly:!0,defaultValue:`acme.app/d/q3-roadmap`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Copy Link`})]})]})]})}function N(){let e=r(),[n,a]=p(!1);return/* @__PURE__ */ w(u,{open:n,onOpenChange:a,children:[/* @__PURE__ */ w(O,{children:`Edit Profile`}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`Edit profile`}),/* @__PURE__ */ w(g,{children:`Your name shows on your posts.`}),/* @__PURE__ */ w(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Saved ${new FormData(t.currentTarget).get(`name`)}`),a(!1)},children:[/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Name`}),/* @__PURE__ */ w(j,{name:`name`,required:!0,defaultValue:`Hollis Grant`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`})]})]})]})]})}function P(){let e=r(),[n,a]=p(!1),[o,c]=p(``),[l,d]=p(!1),f=E(null),m=()=>{a(!1),c(``),d(!1)};return/* @__PURE__ */ w(u,{open:n,onOpenChange:e=>e?a(!0):m(),dismissible:o===``,onDismissAttempt:t=>{e(`Kept open (${t.reason})`),d(!0)},children:[/* @__PURE__ */ w(O,{children:`Add Note`}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`Add a note`}),/* @__PURE__ */ w(g,{children:`Only your team can see it.`}),/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Note`}),/* @__PURE__ */ w(k,{render:/* @__PURE__ */ w(`textarea`,{ref:f,placeholder:`Call the printer about the proofs.`}),value:o,onChange:e=>c(e.currentTarget.value)})]}),l?/* @__PURE__ */ w(`div`,{"data-slot":`row`,role:`alert`,children:[`Discard your note?`,/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(`button`,{type:`button`,"data-size":`sm`,onClick:()=>{d(!1),f.current?.focus()},children:`Keep Editing`}),/* @__PURE__ */ w(`button`,{type:`button`,"data-size":`sm`,"data-variant":`solid`,onClick:()=>{e(`Discarded the note`),m()},children:`Discard`})]})]}):/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(`button`,{type:`button`,"data-variant":`solid`,onClick:()=>{e(o?`Saved the note`:`Nothing to save`),m()},children:`Save`})]})]})]})}const F=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}],I=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function L(){let[e,t]=p(`bottom`),[r,i]=p(`center`);return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ w(x,{items:F,value:e,onValueChange:e=>e&&t(e),children:[/* @__PURE__ */ w(c,{children:`Side`}),/* @__PURE__ */ w(D,{children:[/* @__PURE__ */ w(d,{}),/* @__PURE__ */ w(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ w(a,{children:F.map(e=>/* @__PURE__ */ w(T,{value:e.value,children:[e.label,/* @__PURE__ */ w(C,{children:/* @__PURE__ */ w(S,{"aria-hidden":`true`})})]},e.value))})]}),/* @__PURE__ */ w(x,{items:I,value:r,onValueChange:e=>e&&i(e),children:[/* @__PURE__ */ w(c,{children:`Align`}),/* @__PURE__ */ w(D,{children:[/* @__PURE__ */ w(d,{}),/* @__PURE__ */ w(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ w(a,{children:I.map(e=>/* @__PURE__ */ w(T,{value:e.value,children:[e.label,/* @__PURE__ */ w(C,{children:/* @__PURE__ */ w(S,{"aria-hidden":`true`})})]},e.value))})]})]}),/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`Delivery`}),/* @__PURE__ */ w(_,{side:e,align:r,sideOffset:8,children:[/* @__PURE__ */ w(s,{children:`Delivery window`}),/* @__PURE__ */ w(g,{children:`Arrives Tuesday between 9 AM and noon.`})]})]})]})}const R={sideOffset:{label:`Side offset`,values:[`4`,`8`,`16`,`24`]},alignOffset:{label:`Align offset`,values:[`-16`,`0`,`16`]},collisionPadding:{label:`Collision padding`,values:[`8`,`24`,`48`]}};function z(){let[e,t]=p({sideOffset:`8`,alignOffset:`0`,collisionPadding:`8`});return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,children:Object.keys(R).map(r=>/* @__PURE__ */ w(x,{items:R[r].values,value:e[r],onValueChange:n=>n&&t({...e,[r]:n}),children:[/* @__PURE__ */ w(c,{children:R[r].label}),/* @__PURE__ */ w(D,{children:[/* @__PURE__ */ w(d,{}),/* @__PURE__ */ w(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ w(a,{children:R[r].values.map(e=>/* @__PURE__ */ w(T,{value:e,children:[e,`px`,/* @__PURE__ */ w(C,{children:/* @__PURE__ */ w(S,{"aria-hidden":`true`})})]},e))})]},r))}),/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`Delivery`}),/* @__PURE__ */ w(_,{align:`start`,sideOffset:Number(e.sideOffset),alignOffset:Number(e.alignOffset),collisionPadding:Number(e.collisionPadding),children:[/* @__PURE__ */ w(s,{children:`Delivery window`}),/* @__PURE__ */ w(g,{children:`Arrives Tuesday between 9 AM and noon.`})]})]})]})}const B=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}];function V(){let[t,n]=p(!1),[r,i]=p(`bottom`),a=E(null);return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,role:`group`,"aria-label":`Side`,ref:a,children:B.map(e=>/* @__PURE__ */ w(`button`,{type:`button`,"data-size":`sm`,"aria-pressed":r===e.value,onClick:()=>i(e.value),children:e.label},e.value))}),/* @__PURE__ */ w(u,{open:t,onOpenChange:(e,t)=>{let r=t.event?.target;if(r instanceof Node&&a.current?.contains(r)&&t.reason!==`escape-key`)return t.cancel();n(e)},children:[/* @__PURE__ */ w(O,{"aria-label":`Help`,children:/* @__PURE__ */ w(e,{"aria-hidden":`true`})}),/* @__PURE__ */ w(_,{side:r,sideOffset:10,arrowPadding:12,children:[/* @__PURE__ */ w(f,{}),/* @__PURE__ */ w(s,{children:`Keyboard shortcuts`}),/* @__PURE__ */ w(g,{children:`Press ? anywhere to see them all.`})]})]})]})}const H=[{label:`Documents`,checked:!0},{label:`Images`,checked:!1},{label:`Shared with me`,checked:!0}];function U(){let[e,t]=p(null);return/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(`input`,{ref:t,type:`search`,placeholder:`Search files…`,"aria-label":`Search files`}),/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{"aria-label":`Search filters`,children:/* @__PURE__ */ w(o,{"aria-hidden":`true`})}),/* @__PURE__ */ w(_,{anchor:e,align:`start`,sideOffset:8,children:[/* @__PURE__ */ w(s,{children:`Filters`}),/* @__PURE__ */ w(g,{children:`Show only these kinds of files.`}),/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:H.map(e=>/* @__PURE__ */ w(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ w(y,{defaultChecked:e.checked,children:/* @__PURE__ */ w(h,{children:/* @__PURE__ */ w(S,{"aria-hidden":`true`})})}),e.label]},e.label))}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Apply`})]})]})]})]})}const W=[{value:`false`,label:`Non-modal`},{value:`trap-focus`,label:`Trap focus`},{value:`true`,label:`Modal`}],G={false:`Tab can leave, and focus leaving closes it.`,"trap-focus":`Tab stays inside. The page still scrolls and takes clicks.`,true:`Tab stays inside. The page is inert and doesn't scroll.`};function K(){let[e,r]=p(`false`),o=e===`true`||e!==`false`&&`trap-focus`;return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ w(x,{items:W,value:e,onValueChange:e=>e&&r(e),children:[/* @__PURE__ */ w(c,{children:`Modal`}),/* @__PURE__ */ w(D,{children:[/* @__PURE__ */ w(d,{}),/* @__PURE__ */ w(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ w(a,{children:W.map(e=>/* @__PURE__ */ w(T,{value:e.value,children:[e.label,/* @__PURE__ */ w(C,{children:/* @__PURE__ */ w(S,{"aria-hidden":`true`})})]},e.value))})]})}),/* @__PURE__ */ w(u,{modal:o,children:[/* @__PURE__ */ w(O,{children:`Add Comment`}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`Add a comment`}),/* @__PURE__ */ w(g,{children:G[e]}),/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Comment`}),/* @__PURE__ */ w(l,{defaultValue:`Looks good to me.`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Comment`})]})]})]})]})}function q(){return/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`Rename`}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`Rename file`}),/* @__PURE__ */ w(g,{children:`Focus starts in the first field.`}),/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Name`}),/* @__PURE__ */ w(j,{defaultValue:`Q3 roadmap.pdf`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Save`})]})]})]}),/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`Publish`}),/* @__PURE__ */ w(_,{initialFocus:`[data-autofocus]`,children:[/* @__PURE__ */ w(s,{children:`Publish changes?`}),/* @__PURE__ */ w(g,{children:`Focus starts on Publish, not Cancel.`}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-autofocus":``,"data-variant":`solid`,children:`Publish`})]})]})]}),/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`Status`}),/* @__PURE__ */ w(_,{initialFocus:`none`,finalFocus:`none`,children:[/* @__PURE__ */ w(s,{children:`All systems normal`}),/* @__PURE__ */ w(g,{children:`Focus stays on the trigger.`})]})]})]})}function J(){let e=r();return/* @__PURE__ */ w(u,{openOnHover:!0,delay:200,closeDelay:150,children:[/* @__PURE__ */ w(O,{children:`@kofi`}),/* @__PURE__ */ w(_,{sideOffset:8,children:[/* @__PURE__ */ w(f,{}),/* @__PURE__ */ w(s,{children:`Kofi Mensah`}),/* @__PURE__ */ w(g,{children:`Engineering manager, platform team.`}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:/* @__PURE__ */ w(`button`,{type:`button`,"data-size":`sm`,"data-variant":`solid`,onClick:()=>e(`Followed @kofi`),children:`Follow`})})]})]})}function Y(){let e=r(),[n,a]=p(!1),o=E(null);return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,ref:o,children:/* @__PURE__ */ w(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ w(y,{checked:n,onCheckedChange:e=>a(e===!0),children:/* @__PURE__ */ w(h,{children:/* @__PURE__ */ w(S,{"aria-hidden":`true`})})}),`Open`]})}),/* @__PURE__ */ w(u,{open:n,onOpenChange:(t,n)=>{let r=n.event?.target;if(r instanceof Node&&o.current?.contains(r)&&n.reason!==`escape-key`)return n.cancel();a(t),e(`${t?`Opened`:`Closed`} (${n.reason})`)},children:[/* @__PURE__ */ w(O,{children:`Set Status`}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`Set a status`}),/* @__PURE__ */ w(g,{children:`Your team sees it next to your name.`}),/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Status`}),/* @__PURE__ */ w(j,{defaultValue:`In a meeting`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Save`})]})]})]})]})}function X(){return/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{shortcut:`mod+i`,children:[`Invite`,/* @__PURE__ */ w(m,{})]}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`Invite people`}),/* @__PURE__ */ w(g,{children:`They'll get an email with a link to join.`}),/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Email`}),/* @__PURE__ */ w(j,{type:`email`,placeholder:`wren@example.com`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Send Invite`})]})]})]})}const Z=[`Admin`,`Editor`,`Viewer`];function Q(){let e=r(),[n]=p(()=>A()),[a,o]=p([{name:`Hollis Grant`,role:`Owner`},{name:`Inès Moreau`,role:`Editor`},{name:`Kofi Mensah`,role:`Viewer`},{name:`Wren Takahashi`,role:`Viewer`}]),c=a[a.length-1];return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ w(`button`,{type:`button`,onClick:async t=>{let r=await n.open({payload:c,anchor:t.currentTarget});e(`Closed (${r.reason}), returned ${r.returnValue??`nothing`}`)},children:`Edit Newest Member`})}),/* @__PURE__ */ w(`ul`,{"data-slot":`list`,children:a.map(e=>/* @__PURE__ */ w(`li`,{"data-slot":`row`,children:[e.name,/* @__PURE__ */ w(`span`,{"data-slot":`hint`,children:e.role}),/* @__PURE__ */ w(O,{controller:n,payload:e,disabled:e.role===`Owner`,"data-size":`sm`,"data-variant":`ghost`,"aria-label":`Edit ${e.name}`,children:`Edit`})]},e.name))}),/* @__PURE__ */ w(u,{controller:n,onPayloadChange:t=>{let n=t;n&&e(`Editing ${n.name}`)},children:/* @__PURE__ */ w(_,{align:`end`,sideOffset:8,children:e=>{let n=e.payload;return/* @__PURE__ */ w(v,{children:[/* @__PURE__ */ w(s,{children:n?.name}),/* @__PURE__ */ w(g,{children:`Roles decide what they can change.`}),/* @__PURE__ */ w(`form`,{"data-slot":`stack`,method:`dialog`,onSubmit:e=>{if(e.nativeEvent.submitter.value!==`save`||!n)return;let t=String(new FormData(e.currentTarget).get(`role`));o(e=>e.map(e=>e.name===n.name?{...e,role:t}:e))},children:[/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Role`}),/* @__PURE__ */ w(k,{name:`role`,defaultValue:n?.role,render:/* @__PURE__ */ w(`select`,{children:Z.map(e=>/* @__PURE__ */ w(`option`,{children:e},e))})},n?.name)]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(`button`,{type:`submit`,value:`cancel`,formNoValidate:!0,children:`Cancel`}),/* @__PURE__ */ w(`button`,{type:`submit`,value:`save`,"data-variant":`solid`,children:`Save`})]})]})]})}})})]})}function $(){let e=r();return/* @__PURE__ */ w(u,{onOpenChange:t=>e(t?`Opening`:`Closing`),onOpenChangeComplete:t=>e(t?`Open`:`Closed`),children:[/* @__PURE__ */ w(O,{children:`What's New`}),/* @__PURE__ */ w(_,{keepMounted:!0,children:[/* @__PURE__ */ w(s,{children:`What's new`}),/* @__PURE__ */ w(g,{children:`Comments now support threads and reactions.`}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Got It`})})]})]})}function ee(){return/* @__PURE__ */ w(u,{presentation:`sheet`,children:[/* @__PURE__ */ w(O,{children:`Add Reminder`}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{children:`New reminder`}),/* @__PURE__ */ w(g,{children:`We'll notify you at the time you pick.`}),/* @__PURE__ */ w(t,{children:[/* @__PURE__ */ w(i,{children:`Remind me to`}),/* @__PURE__ */ w(j,{defaultValue:`Send the Q3 roadmap`})]}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ w(b,{children:`Cancel`}),/* @__PURE__ */ w(b,{"data-variant":`solid`,children:`Save`})]})]})]})}function te(){return/* @__PURE__ */ w(`div`,{"data-slot":`popover-frame`,children:/* @__PURE__ */ w(`div`,{"data-slot":`popover-corner`,children:/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`Feedback`}),/* @__PURE__ */ w(_,{inline:!0,children:[/* @__PURE__ */ w(s,{children:`Send feedback`}),/* @__PURE__ */ w(g,{children:`The panel sits in the corner box, above its trigger.`}),/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:/* @__PURE__ */ w(b,{children:`Close`})})]})]})})})}function ne(){return/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{shortcut:`mod+u`,render:(e,t)=>/* @__PURE__ */ w(`button`,{...e,children:[t.open?`Hide Updates`:`Show Updates`,/* @__PURE__ */ w(m,{children:e=>e.text})]})}),/* @__PURE__ */ w(_,{children:[/* @__PURE__ */ w(s,{render:/* @__PURE__ */ w(`h3`,{}),children:`Updates`}),/* @__PURE__ */ w(g,{children:`Version 2.4 adds threaded comments.`}),/* @__PURE__ */ w(b,{render:/* @__PURE__ */ w(`a`,{href:`#`}),children:`Read the Changelog`})]})]})}const re=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function ie(){return/* @__PURE__ */ w(`div`,{"data-slot":`row`,children:re.map(e=>/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:e.label}),/* @__PURE__ */ w(_,{align:e.value,sideOffset:8,children:[/* @__PURE__ */ w(s,{children:`Delivery window`}),/* @__PURE__ */ w(g,{children:`Arrives Tuesday between 9 AM and noon.`})]})]},e.value))})}function ae(){return/* @__PURE__ */ w(`div`,{dir:`rtl`,children:/* @__PURE__ */ w(u,{children:[/* @__PURE__ */ w(O,{children:`الأبعاد`}),/* @__PURE__ */ w(_,{align:`start`,sideOffset:8,children:[/* @__PURE__ */ w(f,{}),/* @__PURE__ */ w(s,{children:`الأبعاد`}),/* @__PURE__ */ w(g,{children:`اضبط أبعاد الطبقة.`})]})]})})}var oe={name:`popover`,title:`Popover`,description:`Edit or explore something beside its trigger.`,sections:[{heading:null,text:`A popover keeps a small task close to the thing it belongs to. Put fields, buttons, or other interactive content inside; it handles placement, focus, and dismissal.`,examples:[{id:`popover/basic`,caption:`Press Share to open the popover, then close it with Cancel, Copy Link, Escape, or a press outside. Focus returns to Share.`,Example:M,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Share</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Share this document</PopoverTitle>
        <PopoverDescription>
          Anyone with the link can view it.
        </PopoverDescription>
        <Field>
          <FieldLabel>Link</FieldLabel>
          <Input readOnly defaultValue="acme.app/d/q3-roadmap" />
        </Field>
        <div data-slot="row">
          <PopoverClose>Cancel</PopoverClose>
          <PopoverClose data-variant="solid">Copy Link</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`Forms`,text:'An ordinary form can save a value and then close the popover. Focus starts on the first field and returns to the trigger when the task finishes. A form with `method="dialog"` closes on submission and returns its submit button\'s value; the row editor shows that version.',examples:[{id:`popover/form`,caption:`Open Edit Profile, change the name, and press Save. The popover closes and the console logs the saved name.`,Example:N,source:`"use client"

import * as React from "react"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>Edit Profile</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Edit profile</PopoverTitle>
        <PopoverDescription>Your name shows on your posts.</PopoverDescription>
        <form
          data-slot="stack"
          onSubmit={(event) => {
            event.preventDefault()
            log(\`Saved \${new FormData(event.currentTarget).get("name")}\`)
            setOpen(false)
          }}
        >
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input name="name" required defaultValue="Hollis Grant" />
          </Field>
          <div data-slot="row">
            <PopoverClose>Cancel</PopoverClose>
            <button type="submit" data-variant="solid">
              Save
            </button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`Keep It Open While Editing`,text:"Set `dismissible` to false while there is unsaved work. Escape and outside presses then keep the popover open and report `onDismissAttempt`, so you can ask whether to discard it. Focus leaving is refused quietly. The trigger, Close parts, and controller can still close it.",examples:[{id:`popover/draft`,caption:`Open Add Note, type something, then press Escape or click outside. Keep Editing returns to the field; Discard closes the popover and clears the note.`,Example:P,source:`"use client"

import * as React from "react"
import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [open, setOpen] = React.useState(false)
  const [note, setNote] = React.useState("")
  const [asking, setAsking] = React.useState(false)
  const field = React.useRef<HTMLTextAreaElement>(null)
  const close = () => {
    setOpen(false)
    setNote("")
    setAsking(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
      dismissible={note === ""}
      onDismissAttempt={(details) => {
        log(\`Kept open (\${details.reason})\`)
        setAsking(true)
      }}
    >
      <PopoverTrigger>Add Note</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Add a note</PopoverTitle>
        <PopoverDescription>Only your team can see it.</PopoverDescription>
        <Field>
          <FieldLabel>Note</FieldLabel>
          <FieldControl
            render={
              <textarea
                ref={field}
                placeholder="Call the printer about the proofs."
              />
            }
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
          />
        </Field>
        {asking ? (
          <div data-slot="row" role="alert">
            Discard your note?
            <div data-slot="row">
              <button
                type="button"
                data-size="sm"
                onClick={() => {
                  setAsking(false)
                  field.current?.focus()
                }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                data-size="sm"
                data-variant="solid"
                onClick={() => {
                  log("Discarded the note")
                  close()
                }}
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          <div data-slot="row">
            <PopoverClose>Cancel</PopoverClose>
            <button
              type="button"
              data-variant="solid"
              onClick={() => {
                log(note ? "Saved the note" : "Nothing to save")
                close()
              }}
            >
              Save
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`Placement`,text:"`side` chooses an edge of the trigger, `bottom` by default, and `align` lines the popover up with its start, center, or end. Start and end follow text direction. The popover flips or shifts when the requested position doesn't fit, and `data-side` and `data-align` report where it landed. The popup guide covers the shared positioning options.",examples:[{id:`popover/placement`,caption:`Choose a side and an alignment, then open Delivery. Near a window edge, the popover flips or shifts to stay visible.`,Example:L,source:`"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
]
const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]
type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

function Example() {
  const [side, setSide] = React.useState<Side>("bottom")
  const [align, setAlign] = React.useState<Align>("center")

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
      <Popover>
        <PopoverTrigger>Delivery</PopoverTrigger>
        <PopoverContent side={side} align={align} sideOffset={8}>
          <PopoverTitle>Delivery window</PopoverTitle>
          <PopoverDescription>
            Arrives Tuesday between 9 AM and noon.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Offsets`,text:"`sideOffset` is the gap to the trigger, 4 pixels by default. `alignOffset` shifts the popover along the trigger's edge, and `collisionPadding` is the space kept from the edges of the window.",examples:[{id:`popover/offsets`,caption:`Change the offsets and the padding, then open Delivery. The popover moves away from the trigger and along it.`,Example:z,source:`"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const choices = {
  sideOffset: { label: "Side offset", values: ["4", "8", "16", "24"] },
  alignOffset: { label: "Align offset", values: ["-16", "0", "16"] },
  collisionPadding: { label: "Collision padding", values: ["8", "24", "48"] },
}
type Name = keyof typeof choices

function Example() {
  const [offsets, setOffsets] = React.useState<Record<Name, string>>({
    sideOffset: "8",
    alignOffset: "0",
    collisionPadding: "8",
  })

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        {(Object.keys(choices) as Name[]).map((name) => (
          <Select
            key={name}
            items={choices[name].values}
            value={offsets[name]}
            onValueChange={(next) =>
              next && setOffsets({ ...offsets, [name]: next })
            }
          >
            <SelectLabel>{choices[name].label}</SelectLabel>
            <SelectTrigger>
              <SelectValue />
              <ChevronDownIcon aria-hidden="true" />
            </SelectTrigger>
            <SelectContent>
              {choices[name].values.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}px
                  <SelectItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      <Popover>
        <PopoverTrigger>Delivery</PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={Number(offsets.sideOffset)}
          alignOffset={Number(offsets.alignOffset)}
          collisionPadding={Number(offsets.collisionPadding)}
        >
          <PopoverTitle>Delivery window</PopoverTitle>
          <PopoverDescription>
            Arrives Tuesday between 9 AM and noon.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Arrow`,text:"`PopoverArrow` follows the side the popover actually uses, including after a flip, and gets the same `data-side`. `arrowPadding` keeps it away from the corners; `data-arrow-clamped` tells you when it can't point at the middle of the trigger. This example cancels dismissal when you press its side buttons, so the open arrow can move.",examples:[{id:`popover/arrow`,caption:`Open Help, then press Top, Right, Bottom, or Left. The popover stays open while it and its arrow move to that side.`,Example:V,source:`"use client"

import * as React from "react"
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { CircleQuestionMarkIcon } from "lucide-react"

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
] as const
type Side = (typeof sides)[number]["value"]

function Example() {
  const [open, setOpen] = React.useState(false)
  const [side, setSide] = React.useState<Side>("bottom")
  const controls = React.useRef<HTMLDivElement>(null)

  return (
    <div data-slot="stack">
      <div data-slot="controls" role="group" aria-label="Side" ref={controls}>
        {sides.map((option) => (
          <button
            key={option.value}
            type="button"
            data-size="sm"
            aria-pressed={side === option.value}
            onClick={() => setSide(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Popover
        open={open}
        onOpenChange={(next, details) => {
          const target = details.event?.target
          const inControls =
            target instanceof Node && controls.current?.contains(target)
          if (inControls && details.reason !== "escape-key") {
            return details.cancel()
          }
          setOpen(next)
        }}
      >
        <PopoverTrigger aria-label="Help">
          <CircleQuestionMarkIcon aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent side={side} sideOffset={10} arrowPadding={12}>
          <PopoverArrow />
          <PopoverTitle>Keyboard shortcuts</PopoverTitle>
          <PopoverDescription>
            Press ? anywhere to see them all.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Anchor`,text:"Set `anchor` to position against something other than the trigger. It accepts an element, a selector, a point such as `{ x, y }`, or an object with `getBoundingClientRect()`, such as a text range. The position is read again as the anchor moves.",examples:[{id:`popover/anchor`,caption:`Press the filters button. The popover lines up with the search field instead of the small button beside it.`,Example:U,source:`"use client"

import * as React from "react"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { CheckIcon, SlidersHorizontalIcon } from "lucide-react"

const types = [
  { label: "Documents", checked: true },
  { label: "Images", checked: false },
  { label: "Shared with me", checked: true },
]

function Example() {
  const [anchor, setAnchor] = React.useState<HTMLInputElement | null>(null)

  return (
    <div data-slot="row">
      <input
        ref={setAnchor}
        type="search"
        placeholder="Search files…"
        aria-label="Search files"
      />
      <Popover>
        <PopoverTrigger aria-label="Search filters">
          <SlidersHorizontalIcon aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent anchor={anchor} align="start" sideOffset={8}>
          <PopoverTitle>Filters</PopoverTitle>
          <PopoverDescription>
            Show only these kinds of files.
          </PopoverDescription>
          <div data-slot="stack">
            {types.map((type) => (
              <label data-slot="label" key={type.label}>
                <Checkbox defaultChecked={type.checked}>
                  <CheckboxIndicator>
                    <CheckIcon aria-hidden="true" />
                  </CheckboxIndicator>
                </Checkbox>
                {type.label}
              </label>
            ))}
          </div>
          <div data-slot="row">
            <PopoverClose>Cancel</PopoverClose>
            <PopoverClose data-variant="solid">Apply</PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Modal`,text:"`modal` controls how the popover shares the page:",examples:[{id:`popover/modal`,caption:`Choose a mode, open Add Comment, and try Tab or clicking the page.`,Example:K,source:`"use client"

import * as React from "react"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const modes = [
  { value: "false", label: "Non-modal" },
  { value: "trap-focus", label: "Trap focus" },
  { value: "true", label: "Modal" },
]

type Mode = "false" | "trap-focus" | "true"

const notes = {
  false: "Tab can leave, and focus leaving closes it.",
  "trap-focus": "Tab stays inside. The page still scrolls and takes clicks.",
  true: "Tab stays inside. The page is inert and doesn't scroll.",
}

function Example() {
  const [mode, setMode] = React.useState<Mode>("false")
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
            <ChevronDownIcon aria-hidden="true" />
          </SelectTrigger>
          <SelectContent>
            {modes.map((option) => (
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
      <Popover modal={modal}>
        <PopoverTrigger>Add Comment</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Add a comment</PopoverTitle>
          <PopoverDescription>{notes[mode]}</PopoverDescription>
          <Field>
            <FieldLabel>Comment</FieldLabel>
            <Textarea defaultValue="Looks good to me." />
          </Field>
          <div data-slot="row">
            <PopoverClose>Cancel</PopoverClose>
            <PopoverClose data-variant="solid">Comment</PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Focus`,text:'Use `initialFocus` to choose the first focused element, or `"none"` to leave focus where it is. `finalFocus` controls where focus returns. Opening on hover leaves focus alone; opening with touch focuses the panel itself so no on-screen keyboard appears. See popup focus for the shared focus rules.',examples:[{id:`popover/focus`,caption:`Open each one: Rename focuses its field, Publish focuses its Publish button, and Status leaves focus on the trigger.`,Example:q,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <div data-slot="row">
      <Popover>
        <PopoverTrigger>Rename</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Rename file</PopoverTitle>
          <PopoverDescription>
            Focus starts in the first field.
          </PopoverDescription>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input defaultValue="Q3 roadmap.pdf" />
          </Field>
          <div data-slot="row">
            <PopoverClose>Cancel</PopoverClose>
            <PopoverClose data-variant="solid">Save</PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger>Publish</PopoverTrigger>
        <PopoverContent initialFocus="[data-autofocus]">
          <PopoverTitle>Publish changes?</PopoverTitle>
          <PopoverDescription>
            Focus starts on Publish, not Cancel.
          </PopoverDescription>
          <div data-slot="row">
            <PopoverClose>Cancel</PopoverClose>
            <PopoverClose data-autofocus="" data-variant="solid">
              Publish
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger>Status</PopoverTrigger>
        <PopoverContent initialFocus="none" finalFocus="none">
          <PopoverTitle>All systems normal</PopoverTitle>
          <PopoverDescription>Focus stays on the trigger.</PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Open on Hover`,text:"`openOnHover` adds pointer opening while keeping click, keyboard, and touch activation. `delay` and `closeDelay` control the pause before opening and closing. You can cross the gap into the content and interact with it. Another popover or hover card opening on hover closes it, unless that one is inside it, so a row of hover triggers shows one at a time.",examples:[{id:`popover/hover`,caption:`Hover @kofi, then move into the popover and press Follow. You can also open it by pressing the trigger.`,Example:J,source:`"use client"

import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <Popover openOnHover delay={200} closeDelay={150}>
      <PopoverTrigger>@kofi</PopoverTrigger>
      <PopoverContent sideOffset={8}>
        <PopoverArrow />
        <PopoverTitle>Kofi Mensah</PopoverTitle>
        <PopoverDescription>
          Engineering manager, platform team.
        </PopoverDescription>
        <div data-slot="row">
          <button
            type="button"
            data-size="sm"
            data-variant="solid"
            onClick={() => log("Followed @kofi")}
          >
            Follow
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `open` and update it in `onOpenChange`. Use `details.cancel()` to reject a proposed change. See state and events for the common change contract.",examples:[{id:`popover/controlled`,caption:`Check Open or press Set Status, then close the popover. The console logs each change and its reason.`,Example:Y,source:`"use client"

import * as React from "react"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { CheckIcon } from "lucide-react"
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
      <Popover
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
        <PopoverTrigger>Set Status</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Set a status</PopoverTitle>
          <PopoverDescription>
            Your team sees it next to your name.
          </PopoverDescription>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Input defaultValue="In a meeting" />
          </Field>
          <div data-slot="row">
            <PopoverClose>Cancel</PopoverClose>
            <PopoverClose data-variant="solid">Save</PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Keyboard Shortcut`,text:"Set a trigger's `shortcut` to toggle the popover from the keyboard. `mod+i` means Command+I on Apple platforms and Control+I elsewhere. The Shortcut part displays the platform's keys, and the trigger advertises them through `aria-keyshortcuts`.",examples:[{id:`popover/shortcut`,caption:`Press Command+I or Control+I to open Invite. Press the same shortcut again, or Escape, to close it.`,Example:X,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverShortcut,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover>
      <PopoverTrigger shortcut="mod+i">
        Invite
        <PopoverShortcut />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Invite people</PopoverTitle>
        <PopoverDescription>
          They'll get an email with a link to join.
        </PopoverDescription>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" placeholder="wren@example.com" />
        </Field>
        <div data-slot="row">
          <PopoverClose>Cancel</PopoverClose>
          <PopoverClose data-variant="solid">Send Invite</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`Triggers Outside the Popover`,text:"Connect the triggers and popover to one `createPopoverController<Member>()`. Each trigger passes its row as `payload`; the content reads the active row from its state. Only the active trigger is expanded and receives focus back. Opening from another row updates the same panel, so one editor can serve the whole list.",examples:[{id:`popover/payload`,caption:`Edit Inès Moreau or Kofi Mensah and save a new role. The owner can't be edited. Edit Newest Member opens the same editor from code, and the console logs how it closed.`,Example:Q,source:`"use client"

import * as React from "react"
import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  createPopoverController,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { useLog } from "../../../shared/react/log"

type Member = { name: string; role: string }

const roles = ["Admin", "Editor", "Viewer"]

function Example() {
  const log = useLog()
  const [popover] = React.useState(() => createPopoverController<Member>())
  const [members, setMembers] = React.useState<Member[]>([
    { name: "Hollis Grant", role: "Owner" },
    { name: "Inès Moreau", role: "Editor" },
    { name: "Kofi Mensah", role: "Viewer" },
    { name: "Wren Takahashi", role: "Viewer" },
  ])
  const newest = members[members.length - 1]

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={async (event) => {
            const result = await popover.open({
              payload: newest,
              anchor: event.currentTarget,
            })
            log(
              \`Closed (\${result.reason}), returned \${result.returnValue ?? "nothing"}\`
            )
          }}
        >
          Edit Newest Member
        </button>
      </div>
      <ul data-slot="list">
        {members.map((member) => (
          <li data-slot="row" key={member.name}>
            {member.name}
            <span data-slot="hint">{member.role}</span>
            <PopoverTrigger
              controller={popover}
              payload={member}
              disabled={member.role === "Owner"}
              data-size="sm"
              data-variant="ghost"
              aria-label={\`Edit \${member.name}\`}
            >
              Edit
            </PopoverTrigger>
          </li>
        ))}
      </ul>
      <Popover
        controller={popover}
        onPayloadChange={(payload) => {
          const member = payload as Member | undefined
          if (member) {
            log(\`Editing \${member.name}\`)
          }
        }}
      >
        <PopoverContent<Member> align="end" sideOffset={8}>
          {(state) => {
            const member = state.payload
            return (
              <>
                <PopoverTitle>{member?.name}</PopoverTitle>
                <PopoverDescription>
                  Roles decide what they can change.
                </PopoverDescription>
                <form
                  data-slot="stack"
                  method="dialog"
                  onSubmit={(event) => {
                    const submitter = (event.nativeEvent as SubmitEvent)
                      .submitter as HTMLButtonElement
                    if (submitter.value !== "save" || !member) {
                      return
                    }
                    const role = String(
                      new FormData(event.currentTarget).get("role")
                    )
                    setMembers((current) =>
                      current.map((entry) =>
                        entry.name === member.name ? { ...entry, role } : entry
                      )
                    )
                  }}
                >
                  <Field>
                    <FieldLabel>Role</FieldLabel>
                    <FieldControl
                      key={member?.name}
                      name="role"
                      defaultValue={member?.role}
                      render={
                        <select>
                          {roles.map((role) => (
                            <option key={role}>{role}</option>
                          ))}
                        </select>
                      }
                    />
                  </Field>
                  <div data-slot="row">
                    <button type="submit" value="cancel" formNoValidate>
                      Cancel
                    </button>
                    <button type="submit" value="save" data-variant="solid">
                      Save
                    </button>
                  </div>
                </form>
              </>
            )
          }}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popover stays mounted until the exit finishes. `onOpenChangeComplete` runs after the transition, and `keepMounted` keeps the closed content in the page, hidden. See styling and animation for the common lifecycle.",examples:[{id:`popover/animation`,caption:`Open What's New, then press Got It. The console logs Opening, Open, Closing, and Closed.`,Example:$,source:`"use client"

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Popover
      onOpenChange={(open) => log(open ? "Opening" : "Closing")}
      onOpenChangeComplete={(open) => log(open ? "Open" : "Closed")}
    >
      <PopoverTrigger>What's New</PopoverTrigger>
      <PopoverContent keepMounted>
        <PopoverTitle>What's new</PopoverTitle>
        <PopoverDescription>
          Comments now support threads and reactions.
        </PopoverDescription>
        <div data-slot="row">
          <PopoverClose data-variant="solid">Got It</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`Presentation`,text:'`presentation="sheet"` shows the task as a sheet; `"auto"` chooses a sheet on small touch screens each time it opens. A sheet is modal by default and can be swiped down to dismiss. If dismissal is disabled, it springs back and reports the attempt.',examples:[{id:`popover/presentation`,caption:`Open Add Reminder as a sheet. Dismiss it with Cancel, Save, Escape, the dimmed area, or a downward swipe on a touch screen.`,Example:ee,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover presentation="sheet">
      <PopoverTrigger>Add Reminder</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>New reminder</PopoverTitle>
        <PopoverDescription>
          We'll notify you at the time you pick.
        </PopoverDescription>
        <Field>
          <FieldLabel>Remind me to</FieldLabel>
          <Input defaultValue="Send the Q3 roadmap" />
        </Field>
        <div data-slot="row">
          <PopoverClose>Cancel</PopoverClose>
          <PopoverClose data-variant="solid">Save</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`In Place`,text:"A popover opens above the page. Set `inline` on the content to render it where it is, inside its parent's layout and stacking, like a panel that opens out of a corner widget. Your CSS places it, so `side`, `align` and the offsets don't apply.",examples:[{id:`popover/inline`,caption:`Open Feedback. The panel opens above the button, inside the corner box.`,Example:te,source:`import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <div data-slot="popover-frame">
      <div data-slot="popover-corner">
        <Popover>
          <PopoverTrigger>Feedback</PopoverTrigger>
          <PopoverContent inline>
            <PopoverTitle>Send feedback</PopoverTitle>
            <PopoverDescription>
              The panel sits in the corner box, above its trigger.
            </PopoverDescription>
            <div data-slot="row">
              <PopoverClose>Close</PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. A content render function can read its payload, as the row editor does.",examples:[{id:`popover/custom-rendering`,caption:`Open Show Updates. The trigger's label comes from its state, the title renders as an h3, and Close renders as a link.`,Example:ne,source:`import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverShortcut,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover>
      <PopoverTrigger
        shortcut="mod+u"
        render={(props, state) => (
          <button {...props}>
            {state.open ? "Hide Updates" : "Show Updates"}
            <PopoverShortcut>{(shortcut) => shortcut.text}</PopoverShortcut>
          </button>
        )}
      />
      <PopoverContent>
        <PopoverTitle render={<h3 />}>Updates</PopoverTitle>
        <PopoverDescription>
          Version 2.4 adds threaded comments.
        </PopoverDescription>
        <PopoverClose render={<a href="#" />}>Read the Changelog</PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`popover/align`,caption:``,Example:ie,source:`import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
] as const

function Example() {
  return (
    <div data-slot="row">
      {aligns.map((align) => (
        <Popover key={align.value}>
          <PopoverTrigger>{align.label}</PopoverTrigger>
          <PopoverContent align={align.value} sideOffset={8}>
            <PopoverTitle>Delivery window</PopoverTitle>
            <PopoverDescription>
              Arrives Tuesday between 9 AM and noon.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}

export { Example }
`},{id:`popover/rtl`,caption:``,Example:ae,source:`import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <div dir="rtl">
      <Popover>
        <PopoverTrigger>الأبعاد</PopoverTrigger>
        <PopoverContent align="start" sideOffset={8}>
          <PopoverArrow />
          <PopoverTitle>الأبعاد</PopoverTitle>
          <PopoverDescription>اضبط أبعاد الطبقة.</PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { Example }
`}]}]};export{oe as default};