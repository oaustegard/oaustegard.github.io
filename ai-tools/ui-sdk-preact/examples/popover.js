import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-WfjOen3K.js";import{t as n}from"../chunks/c-CA3STxaZ.js";import{t as r}from"../chunks/c-D7ZpXmBq.js";import{useLog as i}from"./log.js";import*as a from"preact/compat";import{Fragment as o,jsx as s,jsxs as c}from"preact/compat/jsx-runtime";import{Field as l,FieldControl as u,FieldLabel as d}from"ui-sdk/field.js";import{Input as f}from"ui-sdk/input.js";import{Checkbox as p,CheckboxIndicator as m}from"ui-sdk/checkbox.js";import{Select as h,SelectContent as g,SelectItem as _,SelectItemIndicator as v,SelectLabel as y,SelectTrigger as b,SelectValue as x}from"ui-sdk/select.js";import{Textarea as ee}from"ui-sdk/textarea.js";import{Popover as S,PopoverArrow as C,PopoverClose as w,PopoverContent as T,PopoverDescription as E,PopoverShortcut as D,PopoverTitle as O,PopoverTrigger as k,createPopoverController as A}from"ui-sdk/popover.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const j={name:`sliders-horizontal`,size:24,node:[[`path`,{d:`M10 5H3`,key:`1qgfaw`}],[`path`,{d:`M12 19H3`,key:`yhmn1j`}],[`path`,{d:`M14 3v4`,key:`1sua03`}],[`path`,{d:`M16 17v4`,key:`1q0r14`}],[`path`,{d:`M21 12h-9`,key:`1o4lsq`}],[`path`,{d:`M21 19h-5`,key:`1rlt1p`}],[`path`,{d:`M21 5h-7`,key:`1oszz2`}],[`path`,{d:`M8 10v4`,key:`tgpxqk`}],[`path`,{d:`M8 12H3`,key:`a7s4jb`}]]};j.node;const M=e(j);function N(){return/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`Share`}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`Share this document`}),/* @__PURE__ */ s(E,{children:`Anyone with the link can view it.`}),/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Link`}),/* @__PURE__ */ s(f,{readOnly:!0,defaultValue:`acme.app/d/q3-roadmap`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Copy Link`})]})]})]})}function P(){let e=i(),[t,n]=a.useState(!1);return/* @__PURE__ */ c(S,{open:t,onOpenChange:n,children:[/* @__PURE__ */ s(k,{children:`Edit Profile`}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`Edit profile`}),/* @__PURE__ */ s(E,{children:`Your name shows on your posts.`}),/* @__PURE__ */ c(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Saved ${new FormData(t.currentTarget).get(`name`)}`),n(!1)},children:[/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Name`}),/* @__PURE__ */ s(f,{name:`name`,required:!0,defaultValue:`Hollis Grant`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(`button`,{type:`submit`,"data-variant":`solid`,children:`Save`})]})]})]})]})}function F(){let e=i(),[t,n]=a.useState(!1),[r,o]=a.useState(``),[f,p]=a.useState(!1),m=a.useRef(null),h=()=>{n(!1),o(``),p(!1)};return/* @__PURE__ */ c(S,{open:t,onOpenChange:e=>e?n(!0):h(),dismissible:r===``,onDismissAttempt:t=>{e(`Kept open (${t.reason})`),p(!0)},children:[/* @__PURE__ */ s(k,{children:`Add Note`}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`Add a note`}),/* @__PURE__ */ s(E,{children:`Only your team can see it.`}),/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Note`}),/* @__PURE__ */ s(u,{render:/* @__PURE__ */ s(`textarea`,{ref:m,placeholder:`Call the printer about the proofs.`}),value:r,onChange:e=>o(e.currentTarget.value)})]}),f?/* @__PURE__ */ c(`div`,{"data-slot":`row`,role:`alert`,children:[`Discard your note?`,/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(`button`,{type:`button`,"data-size":`sm`,onClick:()=>{p(!1),m.current?.focus()},children:`Keep Editing`}),/* @__PURE__ */ s(`button`,{type:`button`,"data-size":`sm`,"data-variant":`solid`,onClick:()=>{e(`Discarded the note`),h()},children:`Discard`})]})]}):/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(`button`,{type:`button`,"data-variant":`solid`,onClick:()=>{e(r?`Saved the note`:`Nothing to save`),h()},children:`Save`})]})]})]})}const I=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}],L=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function R(){let[e,r]=a.useState(`bottom`),[i,o]=a.useState(`center`);return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ c(h,{items:I,value:e,onValueChange:e=>e&&r(e),children:[/* @__PURE__ */ s(y,{children:`Side`}),/* @__PURE__ */ c(b,{children:[/* @__PURE__ */ s(x,{}),/* @__PURE__ */ s(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ s(g,{children:I.map(e=>/* @__PURE__ */ c(_,{value:e.value,children:[e.label,/* @__PURE__ */ s(v,{children:/* @__PURE__ */ s(t,{"aria-hidden":`true`})})]},e.value))})]}),/* @__PURE__ */ c(h,{items:L,value:i,onValueChange:e=>e&&o(e),children:[/* @__PURE__ */ s(y,{children:`Align`}),/* @__PURE__ */ c(b,{children:[/* @__PURE__ */ s(x,{}),/* @__PURE__ */ s(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ s(g,{children:L.map(e=>/* @__PURE__ */ c(_,{value:e.value,children:[e.label,/* @__PURE__ */ s(v,{children:/* @__PURE__ */ s(t,{"aria-hidden":`true`})})]},e.value))})]})]}),/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`Delivery`}),/* @__PURE__ */ c(T,{side:e,align:i,sideOffset:8,children:[/* @__PURE__ */ s(O,{children:`Delivery window`}),/* @__PURE__ */ s(E,{children:`Arrives Tuesday between 9 AM and noon.`})]})]})]})}const z={sideOffset:{label:`Side offset`,values:[`4`,`8`,`16`,`24`]},alignOffset:{label:`Align offset`,values:[`-16`,`0`,`16`]},collisionPadding:{label:`Collision padding`,values:[`8`,`24`,`48`]}};function B(){let[e,r]=a.useState({sideOffset:`8`,alignOffset:`0`,collisionPadding:`8`});return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,children:Object.keys(z).map(i=>/* @__PURE__ */ c(h,{items:z[i].values,value:e[i],onValueChange:t=>t&&r({...e,[i]:t}),children:[/* @__PURE__ */ s(y,{children:z[i].label}),/* @__PURE__ */ c(b,{children:[/* @__PURE__ */ s(x,{}),/* @__PURE__ */ s(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ s(g,{children:z[i].values.map(e=>/* @__PURE__ */ c(_,{value:e,children:[e,`px`,/* @__PURE__ */ s(v,{children:/* @__PURE__ */ s(t,{"aria-hidden":`true`})})]},e))})]},i))}),/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`Delivery`}),/* @__PURE__ */ c(T,{align:`start`,sideOffset:Number(e.sideOffset),alignOffset:Number(e.alignOffset),collisionPadding:Number(e.collisionPadding),children:[/* @__PURE__ */ s(O,{children:`Delivery window`}),/* @__PURE__ */ s(E,{children:`Arrives Tuesday between 9 AM and noon.`})]})]})]})}const V=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}];function H(){let[e,t]=a.useState(!1),[n,i]=a.useState(`bottom`),o=a.useRef(null);return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,role:`group`,"aria-label":`Side`,ref:o,children:V.map(e=>/* @__PURE__ */ s(`button`,{type:`button`,"data-size":`sm`,"aria-pressed":n===e.value,onClick:()=>i(e.value),children:e.label},e.value))}),/* @__PURE__ */ c(S,{open:e,onOpenChange:(e,n)=>{let r=n.event?.target;if(r instanceof Node&&o.current?.contains(r)&&n.reason!==`escape-key`)return n.cancel();t(e)},children:[/* @__PURE__ */ s(k,{"aria-label":`Help`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})}),/* @__PURE__ */ c(T,{side:n,sideOffset:10,arrowPadding:12,children:[/* @__PURE__ */ s(C,{}),/* @__PURE__ */ s(O,{children:`Keyboard shortcuts`}),/* @__PURE__ */ s(E,{children:`Press ? anywhere to see them all.`})]})]})]})}const U=[{label:`Documents`,checked:!0},{label:`Images`,checked:!1},{label:`Shared with me`,checked:!0}];function W(){let[e,n]=a.useState(null);return/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(`input`,{ref:n,type:`search`,placeholder:`Search files…`,"aria-label":`Search files`}),/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{"aria-label":`Search filters`,children:/* @__PURE__ */ s(M,{"aria-hidden":`true`})}),/* @__PURE__ */ c(T,{anchor:e,align:`start`,sideOffset:8,children:[/* @__PURE__ */ s(O,{children:`Filters`}),/* @__PURE__ */ s(E,{children:`Show only these kinds of files.`}),/* @__PURE__ */ s(`div`,{"data-slot":`stack`,children:U.map(e=>/* @__PURE__ */ c(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ s(p,{defaultChecked:e.checked,children:/* @__PURE__ */ s(m,{children:/* @__PURE__ */ s(t,{"aria-hidden":`true`})})}),e.label]},e.label))}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Apply`})]})]})]})]})}const G=[{value:`false`,label:`Non-modal`},{value:`trap-focus`,label:`Trap focus`},{value:`true`,label:`Modal`}],K={false:`Tab can leave, and focus leaving closes it.`,"trap-focus":`Tab stays inside. The page still scrolls and takes clicks.`,true:`Tab stays inside. The page is inert and doesn't scroll.`};function q(){let[e,r]=a.useState(`false`),i=e===`true`||e!==`false`&&`trap-focus`;return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ c(h,{items:G,value:e,onValueChange:e=>e&&r(e),children:[/* @__PURE__ */ s(y,{children:`Modal`}),/* @__PURE__ */ c(b,{children:[/* @__PURE__ */ s(x,{}),/* @__PURE__ */ s(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ s(g,{children:G.map(e=>/* @__PURE__ */ c(_,{value:e.value,children:[e.label,/* @__PURE__ */ s(v,{children:/* @__PURE__ */ s(t,{"aria-hidden":`true`})})]},e.value))})]})}),/* @__PURE__ */ c(S,{modal:i,children:[/* @__PURE__ */ s(k,{children:`Add Comment`}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`Add a comment`}),/* @__PURE__ */ s(E,{children:K[e]}),/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Comment`}),/* @__PURE__ */ s(ee,{defaultValue:`Looks good to me.`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Comment`})]})]})]})]})}function J(){return/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`Rename`}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`Rename file`}),/* @__PURE__ */ s(E,{children:`Focus starts in the first field.`}),/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Name`}),/* @__PURE__ */ s(f,{defaultValue:`Q3 roadmap.pdf`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Save`})]})]})]}),/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`Publish`}),/* @__PURE__ */ c(T,{initialFocus:`[data-autofocus]`,children:[/* @__PURE__ */ s(O,{children:`Publish changes?`}),/* @__PURE__ */ s(E,{children:`Focus starts on Publish, not Cancel.`}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-autofocus":``,"data-variant":`solid`,children:`Publish`})]})]})]}),/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`Status`}),/* @__PURE__ */ c(T,{initialFocus:`none`,finalFocus:`none`,children:[/* @__PURE__ */ s(O,{children:`All systems normal`}),/* @__PURE__ */ s(E,{children:`Focus stays on the trigger.`})]})]})]})}function Y(){let e=i();return/* @__PURE__ */ c(S,{openOnHover:!0,delay:200,closeDelay:150,children:[/* @__PURE__ */ s(k,{children:`@kofi`}),/* @__PURE__ */ c(T,{sideOffset:8,children:[/* @__PURE__ */ s(C,{}),/* @__PURE__ */ s(O,{children:`Kofi Mensah`}),/* @__PURE__ */ s(E,{children:`Engineering manager, platform team.`}),/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:/* @__PURE__ */ s(`button`,{type:`button`,"data-size":`sm`,"data-variant":`solid`,onClick:()=>e(`Followed @kofi`),children:`Follow`})})]})]})}function X(){let e=i(),[n,r]=a.useState(!1),o=a.useRef(null);return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,ref:o,children:/* @__PURE__ */ c(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ s(p,{checked:n,onCheckedChange:e=>r(e===!0),children:/* @__PURE__ */ s(m,{children:/* @__PURE__ */ s(t,{"aria-hidden":`true`})})}),`Open`]})}),/* @__PURE__ */ c(S,{open:n,onOpenChange:(t,n)=>{let i=n.event?.target;if(i instanceof Node&&o.current?.contains(i)&&n.reason!==`escape-key`)return n.cancel();r(t),e(`${t?`Opened`:`Closed`} (${n.reason})`)},children:[/* @__PURE__ */ s(k,{children:`Set Status`}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`Set a status`}),/* @__PURE__ */ s(E,{children:`Your team sees it next to your name.`}),/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Status`}),/* @__PURE__ */ s(f,{defaultValue:`In a meeting`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Save`})]})]})]})]})}function Z(){return/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ c(k,{shortcut:`mod+i`,children:[`Invite`,/* @__PURE__ */ s(D,{})]}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`Invite people`}),/* @__PURE__ */ s(E,{children:`They'll get an email with a link to join.`}),/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Email`}),/* @__PURE__ */ s(f,{type:`email`,placeholder:`wren@example.com`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Send Invite`})]})]})]})}const Q=[`Admin`,`Editor`,`Viewer`];function te(){let e=i(),[t]=a.useState(()=>A()),[n,r]=a.useState([{name:`Hollis Grant`,role:`Owner`},{name:`Inès Moreau`,role:`Editor`},{name:`Kofi Mensah`,role:`Viewer`},{name:`Wren Takahashi`,role:`Viewer`}]),f=n[n.length-1];return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ s(`button`,{type:`button`,onClick:async n=>{let r=await t.open({payload:f,anchor:n.currentTarget});e(`Closed (${r.reason}), returned ${r.returnValue??`nothing`}`)},children:`Edit Newest Member`})}),/* @__PURE__ */ s(`ul`,{"data-slot":`list`,children:n.map(e=>/* @__PURE__ */ c(`li`,{"data-slot":`row`,children:[e.name,/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:e.role}),/* @__PURE__ */ s(k,{controller:t,payload:e,disabled:e.role===`Owner`,"data-size":`sm`,"data-variant":`ghost`,"aria-label":`Edit ${e.name}`,children:`Edit`})]},e.name))}),/* @__PURE__ */ s(S,{controller:t,onPayloadChange:t=>{let n=t;n&&e(`Editing ${n.name}`)},children:/* @__PURE__ */ s(T,{align:`end`,sideOffset:8,children:e=>{let t=e.payload;return/* @__PURE__ */ c(o,{children:[/* @__PURE__ */ s(O,{children:t?.name}),/* @__PURE__ */ s(E,{children:`Roles decide what they can change.`}),/* @__PURE__ */ c(`form`,{"data-slot":`stack`,method:`dialog`,onSubmit:e=>{if(e.nativeEvent.submitter.value!==`save`||!t)return;let n=String(new FormData(e.currentTarget).get(`role`));r(e=>e.map(e=>e.name===t.name?{...e,role:n}:e))},children:[/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Role`}),/* @__PURE__ */ s(u,{name:`role`,defaultValue:t?.role,render:/* @__PURE__ */ s(`select`,{children:Q.map(e=>/* @__PURE__ */ s(`option`,{children:e},e))})},t?.name)]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(`button`,{type:`submit`,value:`cancel`,formNoValidate:!0,children:`Cancel`}),/* @__PURE__ */ s(`button`,{type:`submit`,value:`save`,"data-variant":`solid`,children:`Save`})]})]})]})}})})]})}function ne(){let e=i();return/* @__PURE__ */ c(S,{onOpenChange:t=>e(t?`Opening`:`Closing`),onOpenChangeComplete:t=>e(t?`Open`:`Closed`),children:[/* @__PURE__ */ s(k,{children:`What's New`}),/* @__PURE__ */ c(T,{keepMounted:!0,children:[/* @__PURE__ */ s(O,{children:`What's new`}),/* @__PURE__ */ s(E,{children:`Comments now support threads and reactions.`}),/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Got It`})})]})]})}function re(){return/* @__PURE__ */ c(S,{presentation:`sheet`,children:[/* @__PURE__ */ s(k,{children:`Add Reminder`}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{children:`New reminder`}),/* @__PURE__ */ s(E,{children:`We'll notify you at the time you pick.`}),/* @__PURE__ */ c(l,{children:[/* @__PURE__ */ s(d,{children:`Remind me to`}),/* @__PURE__ */ s(f,{defaultValue:`Send the Q3 roadmap`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(w,{children:`Cancel`}),/* @__PURE__ */ s(w,{"data-variant":`solid`,children:`Save`})]})]})]})}function ie(){return/* @__PURE__ */ s(`div`,{"data-slot":`popover-frame`,children:/* @__PURE__ */ s(`div`,{"data-slot":`popover-corner`,children:/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`Feedback`}),/* @__PURE__ */ c(T,{inline:!0,children:[/* @__PURE__ */ s(O,{children:`Send feedback`}),/* @__PURE__ */ s(E,{children:`The panel sits in the corner box, above its trigger.`}),/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:/* @__PURE__ */ s(w,{children:`Close`})})]})]})})})}function $(){return/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{shortcut:`mod+u`,render:(e,t)=>/* @__PURE__ */ c(`button`,{...e,children:[t.open?`Hide Updates`:`Show Updates`,/* @__PURE__ */ s(D,{children:e=>e.text})]})}),/* @__PURE__ */ c(T,{children:[/* @__PURE__ */ s(O,{render:/* @__PURE__ */ s(`h3`,{}),children:`Updates`}),/* @__PURE__ */ s(E,{children:`Version 2.4 adds threaded comments.`}),/* @__PURE__ */ s(w,{render:/* @__PURE__ */ s(`a`,{href:`#`}),children:`Read the Changelog`})]})]})}const ae=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function oe(){return/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:ae.map(e=>/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:e.label}),/* @__PURE__ */ c(T,{align:e.value,sideOffset:8,children:[/* @__PURE__ */ s(O,{children:`Delivery window`}),/* @__PURE__ */ s(E,{children:`Arrives Tuesday between 9 AM and noon.`})]})]},e.value))})}function se(){return/* @__PURE__ */ s(`div`,{dir:`rtl`,children:/* @__PURE__ */ c(S,{children:[/* @__PURE__ */ s(k,{children:`الأبعاد`}),/* @__PURE__ */ c(T,{align:`start`,sideOffset:8,children:[/* @__PURE__ */ s(C,{}),/* @__PURE__ */ s(O,{children:`الأبعاد`}),/* @__PURE__ */ s(E,{children:`اضبط أبعاد الطبقة.`})]})]})})}var ce={name:`popover`,title:`Popover`,description:`Edit or explore something beside its trigger.`,sections:[{heading:null,text:`A popover keeps a small task close to the thing it belongs to. Put fields, buttons, or other interactive content inside; it handles placement, focus, and dismissal.`,examples:[{id:`popover/basic`,caption:`Press Share to open the popover, then close it with Cancel, Copy Link, Escape, or a press outside. Focus returns to Share.`,Example:N,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`Forms`,text:'An ordinary form can save a value and then close the popover. Focus starts on the first field and returns to the trigger when the task finishes. A form with `method="dialog"` closes on submission and returns its submit button\'s value; the row editor shows that version.',examples:[{id:`popover/form`,caption:`Open Edit Profile, change the name, and press Save. The popover closes and the console logs the saved name.`,Example:P,source:`"use client"

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
`}]},{heading:`Keep It Open While Editing`,text:"Set `dismissible` to false while there is unsaved work. Escape and outside presses then keep the popover open and report `onDismissAttempt`, so you can ask whether to discard it. Focus leaving is refused quietly. The trigger, Close parts, and controller can still close it.",examples:[{id:`popover/draft`,caption:`Open Add Note, type something, then press Escape or click outside. Keep Editing returns to the field; Discard closes the popover and clears the note.`,Example:F,source:`"use client"

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
`}]},{heading:`Placement`,text:"`side` chooses an edge of the trigger, `bottom` by default, and `align` lines the popover up with its start, center, or end. Start and end follow text direction. The popover flips or shifts when the requested position doesn't fit, and `data-side` and `data-align` report where it landed. The popup guide covers the shared positioning options.",examples:[{id:`popover/placement`,caption:`Choose a side and an alignment, then open Delivery. Near a window edge, the popover flips or shifts to stay visible.`,Example:R,source:`"use client"

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
`}]},{heading:`Offsets`,text:"`sideOffset` is the gap to the trigger, 4 pixels by default. `alignOffset` shifts the popover along the trigger's edge, and `collisionPadding` is the space kept from the edges of the window.",examples:[{id:`popover/offsets`,caption:`Change the offsets and the padding, then open Delivery. The popover moves away from the trigger and along it.`,Example:B,source:`"use client"

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
`}]},{heading:`Arrow`,text:"`PopoverArrow` follows the side the popover actually uses, including after a flip, and gets the same `data-side`. `arrowPadding` keeps it away from the corners; `data-arrow-clamped` tells you when it can't point at the middle of the trigger. This example cancels dismissal when you press its side buttons, so the open arrow can move.",examples:[{id:`popover/arrow`,caption:`Open Help, then press Top, Right, Bottom, or Left. The popover stays open while it and its arrow move to that side.`,Example:H,source:`"use client"

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
`}]},{heading:`Anchor`,text:"Set `anchor` to position against something other than the trigger. It accepts an element, a selector, a point such as `{ x, y }`, or an object with `getBoundingClientRect()`, such as a text range. The position is read again as the anchor moves.",examples:[{id:`popover/anchor`,caption:`Press the filters button. The popover lines up with the search field instead of the small button beside it.`,Example:W,source:`"use client"

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
`}]},{heading:`Modal`,text:"`modal` controls how the popover shares the page:",examples:[{id:`popover/modal`,caption:`Choose a mode, open Add Comment, and try Tab or clicking the page.`,Example:q,source:`"use client"

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
`}]},{heading:`Focus`,text:'Use `initialFocus` to choose the first focused element, or `"none"` to leave focus where it is. `finalFocus` controls where focus returns. Opening on hover leaves focus alone; opening with touch focuses the panel itself so no on-screen keyboard appears. See popup focus for the shared focus rules.',examples:[{id:`popover/focus`,caption:`Open each one: Rename focuses its field, Publish focuses its Publish button, and Status leaves focus on the trigger.`,Example:J,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`Open on Hover`,text:"`openOnHover` adds pointer opening while keeping click, keyboard, and touch activation. `delay` and `closeDelay` control the pause before opening and closing. You can cross the gap into the content and interact with it. Another popover or hover card opening on hover closes it, unless that one is inside it, so a row of hover triggers shows one at a time.",examples:[{id:`popover/hover`,caption:`Hover @kofi, then move into the popover and press Follow. You can also open it by pressing the trigger.`,Example:Y,source:`"use client"

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
`}]},{heading:`Controlled`,text:"Pass `open` and update it in `onOpenChange`. Use `details.cancel()` to reject a proposed change. See state and events for the common change contract.",examples:[{id:`popover/controlled`,caption:`Check Open or press Set Status, then close the popover. The console logs each change and its reason.`,Example:X,source:`"use client"

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
`}]},{heading:`Keyboard Shortcut`,text:"Set a trigger's `shortcut` to toggle the popover from the keyboard. `mod+i` means Command+I on Apple platforms and Control+I elsewhere. The Shortcut part displays the platform's keys, and the trigger advertises them through `aria-keyshortcuts`.",examples:[{id:`popover/shortcut`,caption:`Press Command+I or Control+I to open Invite. Press the same shortcut again, or Escape, to close it.`,Example:Z,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`Triggers Outside the Popover`,text:"Connect the triggers and popover to one `createPopoverController<Member>()`. Each trigger passes its row as `payload`; the content reads the active row from its state. Only the active trigger is expanded and receives focus back. Opening from another row updates the same panel, so one editor can serve the whole list.",examples:[{id:`popover/payload`,caption:`Edit Inès Moreau or Kofi Mensah and save a new role. The owner can't be edited. Edit Newest Member opens the same editor from code, and the console logs how it closed.`,Example:te,source:`"use client"

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
`}]},{heading:`Animation`,text:"The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popover stays mounted until the exit finishes. `onOpenChangeComplete` runs after the transition, and `keepMounted` keeps the closed content in the page, hidden. See styling and animation for the common lifecycle.",examples:[{id:`popover/animation`,caption:`Open What's New, then press Got It. The console logs Opening, Open, Closing, and Closed.`,Example:ne,source:`"use client"

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
`}]},{heading:`Presentation`,text:'`presentation="sheet"` shows the task as a sheet; `"auto"` chooses a sheet on small touch screens each time it opens. A sheet is modal by default and can be swiped down to dismiss. If dismissal is disabled, it springs back and reports the attempt.',examples:[{id:`popover/presentation`,caption:`Open Add Reminder as a sheet. Dismiss it with Cancel, Save, Escape, the dimmed area, or a downward swipe on a touch screen.`,Example:re,source:`"use client"

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
`}]},{heading:`In Place`,text:"A popover opens above the page. Set `inline` on the content to render it where it is, inside its parent's layout and stacking, like a panel that opens out of a corner widget. Your CSS places it, so `side`, `align` and the offsets don't apply.",examples:[{id:`popover/inline`,caption:`Open Feedback. The panel opens above the button, inside the corner box.`,Example:ie,source:`import {
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
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. A content render function can read its payload, as the row editor does.",examples:[{id:`popover/custom-rendering`,caption:`Open Show Updates. The trigger's label comes from its state, the title renders as an h3, and Close renders as a link.`,Example:$,source:`import {
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
`}]},{heading:`More examples`,text:``,examples:[{id:`popover/align`,caption:``,Example:oe,source:`import {
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
`},{id:`popover/rtl`,caption:``,Example:se,source:`import {
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
`}]}]};export{ce as default};