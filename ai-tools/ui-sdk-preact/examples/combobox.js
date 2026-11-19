import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-DWFCfNnK.js";import{t as n}from"../chunks/c-WfjOen3K.js";import{t as r}from"../chunks/c-CA3STxaZ.js";import{t as i}from"../chunks/c-CGmLEa3A.js";import{t as a}from"../chunks/c-CgVzHSix.js";import{t as o}from"../chunks/c-BvocofXA.js";import{t as s}from"../chunks/c-D5QH3sUe.js";import{t as c}from"../chunks/c-BHtAohdq.js";import{t as l}from"../chunks/c-CKwygB1M.js";import{t as u}from"../chunks/c-ZgxiYuCF.js";import{t as d}from"../chunks/c-NPxkywtp.js";import{useLog as f}from"./log.js";import*as p from"preact/compat";import{Fragment as m,jsx as h,jsxs as g}from"preact/compat/jsx-runtime";import{Field as ee,FieldDescription as te,FieldError as ne,FieldLabel as re}from"ui-sdk/field.js";import{Checkbox as ie,CheckboxIndicator as ae}from"ui-sdk/checkbox.js";import{Select as _,SelectContent as v,SelectItem as y,SelectItemIndicator as b,SelectLabel as x,SelectTrigger as S,SelectValue as C}from"ui-sdk/select.js";import{useAsyncOptions as w}from"ui-sdk/async-options.js";import{Combobox as T,ComboboxChip as E,ComboboxChipRemove as D,ComboboxChips as O,ComboboxChipsOverflow as oe,ComboboxClear as se,ComboboxContent as k,ComboboxCreate as ce,ComboboxEmpty as A,ComboboxGroup as j,ComboboxGroupLabel as M,ComboboxInput as N,ComboboxItem as P,ComboboxItemIcon as F,ComboboxItemIndicator as I,ComboboxItemText as L,ComboboxLabel as R,ComboboxList as z,ComboboxSelectAll as B,ComboboxSeparator as le,ComboboxStatus as V,ComboboxTrigger as H,ComboboxValue as U,ComboboxValueIcon as ue,createComboboxController as de}from"ui-sdk/combobox.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const W={name:`circle-x`,size:24,node:[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m15 9-6 6`,key:`1uzhvr`}],[`path`,{d:`m9 9 6 6`,key:`z0biqf`}]],aliases:[`x-circle`]};W.node;const fe=e(W),pe=[{value:`next`,label:`Next.js`},{value:`sveltekit`,label:`SvelteKit`},{value:`nuxt`,label:`Nuxt`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`solidstart`,label:`SolidStart`},{value:`qwik`,label:`Qwik City`}];function me(){return/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Framework`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Select a framework`}),/* @__PURE__ */ h(H,{"aria-label":`Show frameworks`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No frameworks found.`}),/* @__PURE__ */ h(z,{children:pe.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const G=[{value:`ar`,label:`Argentina`},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`},{value:`be`,label:`Belgium`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`},{value:`fi`,label:`Finland`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`gr`,label:`Greece`},{value:`jp`,label:`Japan`},{value:`nl`,label:`Netherlands`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`},{value:`ch`,label:`Switzerland`}],he=e=>G.find(t=>t.value===e)?.label??e;function ge(){return/* @__PURE__ */ h(`div`,{"data-slot":`stack`,children:[`disabled`,`readOnly`,`item`].map(e=>/* @__PURE__ */ g(T,{defaultValue:e===`item`?null:`fr`,itemToLabel:he,disabled:e===`disabled`,readOnly:e===`readOnly`,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:e===`disabled`?`Billing country`:e===`readOnly`?`Shipping from`:`Shipping to`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search countries…`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:G.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,disabled:e.value===`dk`,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]},e))})}const K=[{value:`next`,label:`Next.js`},{value:`sveltekit`,label:`SvelteKit`},{value:`nuxt`,label:`Nuxt`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`solidstart`,label:`SolidStart`},{value:`qwik`,label:`Qwik City`}],q=e=>K.find(t=>t.value===e)?.label??e;function _e(){let e=f(),[t,i]=p.useState(`sveltekit`);return/* @__PURE__ */ g(T,{value:t,onValueChange:(t,n)=>{i(t),e(`${t?q(t):`Cleared`} (${n.reason})`)},itemToLabel:q,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Framework`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Select a framework`}),/* @__PURE__ */ h(se,{"aria-label":`Clear framework`,children:/* @__PURE__ */ h(d,{"aria-hidden":`true`})}),/* @__PURE__ */ h(H,{"aria-label":`Show frameworks`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No frameworks found.`}),/* @__PURE__ */ h(z,{children:K.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const ve=[{value:`ar`,label:`Argentina`},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`},{value:`be`,label:`Belgium`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`},{value:`fi`,label:`Finland`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`gr`,label:`Greece`},{value:`jp`,label:`Japan`},{value:`nl`,label:`Netherlands`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`},{value:`ch`,label:`Switzerland`}];function ye(){return/* @__PURE__ */ g(T,{autoHighlight:!0,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Country`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Type “sw” and press Enter`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:ve.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const be=[{value:`ar`,label:`Argentina`,keywords:[`república argentina`]},{value:`au`,label:`Australia`,keywords:[`oz`]},{value:`at`,label:`Austria`,keywords:[`österreich`]},{value:`be`,label:`Belgium`,keywords:[`belgië`,`belgique`]},{value:`br`,label:`Brazil`,keywords:[`brasil`]},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`,keywords:[`danmark`]},{value:`fi`,label:`Finland`,keywords:[`suomi`]},{value:`fr`,label:`France`},{value:`de`,label:`Germany`,keywords:[`deutschland`]},{value:`gr`,label:`Greece`,keywords:[`hellas`,`ελλάδα`]},{value:`jp`,label:`Japan`,keywords:[`nippon`,`日本`]},{value:`nl`,label:`Netherlands`,keywords:[`holland`,`nederland`]},{value:`es`,label:`Spain`,keywords:[`españa`]},{value:`se`,label:`Sweden`,keywords:[`sverige`]},{value:`ch`,label:`Switzerland`,keywords:[`schweiz`,`suisse`,`svizzera`]}];function xe(){return/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Country`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search countries…`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:be.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,keywords:e.keywords,children:[/* @__PURE__ */ h(L,{children:e=>e.segments.map((e,t)=>e.match?/* @__PURE__ */ h(`mark`,{children:e.text},t):e.text)}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const Se=[{value:`ar`,label:`Argentina`,keywords:[`república argentina`]},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`,keywords:[`österreich`]},{value:`be`,label:`Belgium`,keywords:[`belgië`,`belgique`]},{value:`br`,label:`Brazil`,keywords:[`brasil`]},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`,keywords:[`danmark`]},{value:`fi`,label:`Finland`,keywords:[`suomi`]},{value:`fr`,label:`France`},{value:`de`,label:`Germany`,keywords:[`deutschland`]},{value:`gr`,label:`Greece`,keywords:[`hellas`,`ελλάδα`]},{value:`jp`,label:`Japan`,keywords:[`nippon`,`日本`]},{value:`nl`,label:`Netherlands`,keywords:[`holland`,`nederland`]},{value:`es`,label:`Spain`,keywords:[`españa`]},{value:`se`,label:`Sweden`,keywords:[`sverige`]},{value:`ch`,label:`Switzerland`,keywords:[`schweiz`,`suisse`,`svizzera`]}];function Ce(e,t){let n=0;for(let r of e.label.toLowerCase())r===t[n]?.toLowerCase()&&n++;return n===t.length}const we={contains:`contains`,startsWith:`startsWith`,fuzzy:Ce},J=[{value:`contains`,label:`Contains`},{value:`startsWith`,label:`Starts with`},{value:`fuzzy`,label:`Fuzzy`}];function Te(){let[e,t]=p.useState(`contains`);return/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ g(_,{items:J,value:e,onValueChange:e=>e&&t(e),children:[/* @__PURE__ */ h(x,{children:`Filter`}),/* @__PURE__ */ g(S,{children:[/* @__PURE__ */ h(C,{}),/* @__PURE__ */ h(r,{})]}),/* @__PURE__ */ h(v,{children:J.map(e=>/* @__PURE__ */ g(y,{value:e.value,children:[e.label,/* @__PURE__ */ h(b,{children:/* @__PURE__ */ h(n,{})})]},e.value))})]})}),/* @__PURE__ */ g(T,{filter:we[e],children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Country`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Try “an”, “swd” or “deutschland”`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:Se.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,keywords:e.keywords,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})]})}const Ee=[{label:`Americas`,items:[{value:`America/New_York`,label:`New York`},{value:`America/Chicago`,label:`Chicago`},{value:`America/Denver`,label:`Denver`},{value:`America/Los_Angeles`,label:`Los Angeles`},{value:`America/Sao_Paulo`,label:`São Paulo`}]},{label:`Europe`,items:[{value:`Europe/London`,label:`London`},{value:`Europe/Paris`,label:`Paris`},{value:`Europe/Berlin`,label:`Berlin`},{value:`Europe/Madrid`,label:`Madrid`}]},{label:`Asia & Pacific`,items:[{value:`Asia/Tokyo`,label:`Tokyo`},{value:`Asia/Singapore`,label:`Singapore`},{value:`Asia/Kolkata`,label:`Kolkata`},{value:`Australia/Sydney`,label:`Sydney`}]}];function De(){return/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Timezone`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search cities…`}),/* @__PURE__ */ h(H,{"aria-label":`Show timezones`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No cities found.`}),/* @__PURE__ */ h(z,{children:Ee.map((e,t)=>/* @__PURE__ */ g(p.Fragment,{children:[t>0&&/* @__PURE__ */ h(le,{}),/* @__PURE__ */ g(j,{children:[/* @__PURE__ */ h(M,{children:e.label}),e.items.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))]})]},e.label))})]})]})}function Oe(){let[e,i]=p.useState(null);return/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Status`}),/* @__PURE__ */ g(`div`,{ref:i,"data-slot":`row`,children:[/* @__PURE__ */ h(ue,{}),/* @__PURE__ */ h(N,{placeholder:`Select a status`}),/* @__PURE__ */ h(H,{"aria-label":`Show statuses`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{anchor:e,children:[/* @__PURE__ */ h(A,{children:`No statuses found.`}),/* @__PURE__ */ g(z,{children:[/* @__PURE__ */ g(P,{value:`backlog`,label:`Backlog`,children:[/* @__PURE__ */ h(F,{children:/* @__PURE__ */ h(o,{})}),/* @__PURE__ */ h(L,{}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ g(P,{value:`in-progress`,label:`In progress`,children:[/* @__PURE__ */ h(F,{mirror:!0,children:/* @__PURE__ */ h(t,{})}),/* @__PURE__ */ h(L,{}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ g(P,{value:`done`,label:`Done`,children:[/* @__PURE__ */ h(F,{children:/* @__PURE__ */ h(a,{})}),/* @__PURE__ */ h(L,{}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ g(P,{value:`canceled`,label:`Canceled`,children:[/* @__PURE__ */ h(F,{children:/* @__PURE__ */ h(fe,{})}),/* @__PURE__ */ h(L,{}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]})]})]})]})}const ke=[{id:1,name:`Hollis Grant`,username:`hollis`,role:`Owner`},{id:2,name:`Inès Moreau`,username:`ines`,role:`Admin`},{id:3,name:`Kofi Mensah`,username:`kofi`,role:`Member`},{id:4,name:`Wren Takahashi`,username:`wren`,role:`Member`},{id:5,name:`Tomasz Wójcik`,username:`tomasz`,role:`Guest`}];function Ae(){return/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Owner`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search people…`}),/* @__PURE__ */ h(H,{"aria-label":`Show people`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No people found.`}),/* @__PURE__ */ h(z,{children:ke.map(e=>/* @__PURE__ */ g(P,{value:e.username,label:e.name,keywords:[e.username],children:[/* @__PURE__ */ h(`span`,{"data-slot":`badge`,children:e.name.slice(0,1)}),/* @__PURE__ */ g(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(`span`,{children:e.name}),/* @__PURE__ */ g(`span`,{"data-slot":`hint`,children:[`@`,e.username]})]}),/* @__PURE__ */ h(`span`,{"data-slot":`hint`,children:e.role}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.id))})]})]})}const Y=[{value:`ar`,label:`Argentina`,keywords:[`república argentina`]},{value:`au`,label:`Australia`,keywords:[`oz`]},{value:`at`,label:`Austria`,keywords:[`österreich`]},{value:`be`,label:`Belgium`,keywords:[`belgië`,`belgique`]},{value:`br`,label:`Brazil`,keywords:[`brasil`]},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`,keywords:[`danmark`]},{value:`fi`,label:`Finland`,keywords:[`suomi`]},{value:`fr`,label:`France`},{value:`de`,label:`Germany`,keywords:[`deutschland`]},{value:`gr`,label:`Greece`,keywords:[`hellas`,`ελλάδα`]},{value:`jp`,label:`Japan`,keywords:[`nippon`,`日本`]},{value:`nl`,label:`Netherlands`,keywords:[`holland`,`nederland`]},{value:`es`,label:`Spain`,keywords:[`españa`]},{value:`se`,label:`Sweden`,keywords:[`sverige`]},{value:`ch`,label:`Switzerland`,keywords:[`schweiz`,`suisse`,`svizzera`]}],je=[{type:`group`,label:`Recent`,items:[Y[9],Y[12],Y[15]]}];function Me(){return/* @__PURE__ */ g(T,{items:Y,emptyItems:je,announcement:e=>e.type===`results`?`${e.count} countries match`:null,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Country`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search countries…`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:e=>e.items.map(e=>`items`in e?/* @__PURE__ */ g(j,{children:[/* @__PURE__ */ h(M,{children:e.label}),e.items.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[/* @__PURE__ */ h(L,{}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))]},e.label):/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[/* @__PURE__ */ h(L,{}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const X=[{value:`next`,label:`Next.js`},{value:`sveltekit`,label:`SvelteKit`},{value:`nuxt`,label:`Nuxt`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`solidstart`,label:`SolidStart`},{value:`qwik`,label:`Qwik City`}],Ne=e=>X.find(t=>t.value===e)?.label??e;function Pe(){return/* @__PURE__ */ g(T,{multiple:!0,defaultValue:[`next`,`astro`],itemToLabel:Ne,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Frameworks`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(O,{children:[/* @__PURE__ */ h(U,{children:e=>e.value.map((t,n)=>/* @__PURE__ */ g(E,{value:t,children:[e.labels[n],/* @__PURE__ */ h(D,{"aria-label":`Remove ${e.labels[n]}`,children:/* @__PURE__ */ h(d,{"aria-hidden":`true`})})]},t))}),/* @__PURE__ */ h(N,{placeholder:`Add a framework…`})]}),/* @__PURE__ */ h(H,{"aria-label":`Show frameworks`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No frameworks found.`}),/* @__PURE__ */ h(z,{children:X.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const Fe=[{label:`Americas`,items:[{value:`America/New_York`,label:`New York`},{value:`America/Chicago`,label:`Chicago`},{value:`America/Denver`,label:`Denver`},{value:`America/Los_Angeles`,label:`Los Angeles`},{value:`America/Sao_Paulo`,label:`São Paulo`}]},{label:`Europe`,items:[{value:`Europe/London`,label:`London`},{value:`Europe/Paris`,label:`Paris`},{value:`Europe/Berlin`,label:`Berlin`},{value:`Europe/Madrid`,label:`Madrid`}]},{label:`Asia & Pacific`,items:[{value:`Asia/Tokyo`,label:`Tokyo`},{value:`Asia/Singapore`,label:`Singapore`},{value:`Asia/Kolkata`,label:`Kolkata`},{value:`Australia/Sydney`,label:`Sydney`}]}];function Ie(){return/* @__PURE__ */ g(T,{multiple:!0,defaultValue:[`Europe/Paris`],children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Timezones`}),/* @__PURE__ */ g(O,{children:[/* @__PURE__ */ h(U,{children:e=>e.value.map((t,n)=>/* @__PURE__ */ g(E,{value:t,children:[e.labels[n],/* @__PURE__ */ h(D,{"aria-label":`Remove ${e.labels[n]}`,children:/* @__PURE__ */ h(d,{"aria-hidden":`true`})})]},t))}),/* @__PURE__ */ h(N,{placeholder:`Add timezones…`})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No timezones found.`}),/* @__PURE__ */ g(z,{children:[/* @__PURE__ */ g(B,{children:[/* @__PURE__ */ g(`span`,{children:[/* @__PURE__ */ h(n,{"aria-hidden":`true`}),/* @__PURE__ */ h(c,{"aria-hidden":`true`})]}),`Select all`]}),Fe.map(e=>/* @__PURE__ */ g(j,{children:[/* @__PURE__ */ h(M,{children:e.label}),/* @__PURE__ */ h(B,{children:t=>t.checked?`Clear ${e.label}`:`Select all in ${e.label}`}),e.items.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[/* @__PURE__ */ h(`span`,{children:/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})}),e.label]},e.value))]},e.label))]})]})]})}const Le=[{value:`ar`,label:`Argentina`,keywords:[`república argentina`]},{value:`au`,label:`Australia`,keywords:[`oz`]},{value:`at`,label:`Austria`,keywords:[`österreich`]},{value:`be`,label:`Belgium`,keywords:[`belgië`,`belgique`]},{value:`br`,label:`Brazil`,keywords:[`brasil`]},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`,keywords:[`danmark`]},{value:`fi`,label:`Finland`,keywords:[`suomi`]},{value:`fr`,label:`France`},{value:`de`,label:`Germany`,keywords:[`deutschland`]},{value:`gr`,label:`Greece`,keywords:[`hellas`,`ελλάδα`]},{value:`jp`,label:`Japan`,keywords:[`nippon`,`日本`]},{value:`nl`,label:`Netherlands`,keywords:[`holland`,`nederland`]},{value:`es`,label:`Spain`,keywords:[`españa`]},{value:`se`,label:`Sweden`,keywords:[`sverige`]},{value:`ch`,label:`Switzerland`,keywords:[`schweiz`,`suisse`,`svizzera`]}],Re=e=>Le.find(t=>t.value===e)?.label??e;function ze(){return/* @__PURE__ */ g(T,{multiple:!0,defaultValue:[`fr`,`jp`,`se`,`de`,`ch`],itemToLabel:Re,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Countries`}),/* @__PURE__ */ g(O,{children:[/* @__PURE__ */ h(U,{children:e=>e.value.map((t,n)=>/* @__PURE__ */ g(E,{value:t,children:[e.labels[n],/* @__PURE__ */ h(D,{"aria-label":`Remove ${e.labels[n]}`,children:/* @__PURE__ */ h(d,{"aria-hidden":`true`})})]},t))}),/* @__PURE__ */ h(oe,{render:(e,t)=>/* @__PURE__ */ g(`span`,{...e,title:t.labels.join(`, `),children:[`+`,t.count]})}),/* @__PURE__ */ h(N,{placeholder:`Add…`})]}),/* @__PURE__ */ h(`p`,{"data-slot":`hint`,children:/* @__PURE__ */ h(U,{maxLabels:2,getMoreLabel:e=>`${e} more`})})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:Le.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const Be=[`Bug`,`Feature`,`Documentation`,`Design`,`Performance`,`Security`,`Testing`];function Ve(){return/* @__PURE__ */ g(T,{multiple:!0,maxSelected:3,defaultValue:[`Bug`,`Design`],children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Labels (up to 3)`}),/* @__PURE__ */ g(O,{children:[/* @__PURE__ */ h(U,{children:e=>e.value.map(e=>/* @__PURE__ */ g(E,{value:e,children:[e,/* @__PURE__ */ h(D,{"aria-label":`Remove ${e}`,children:/* @__PURE__ */ h(d,{"aria-hidden":`true`})})]},e))}),/* @__PURE__ */ h(N,{placeholder:`Add labels…`})]})]}),/* @__PURE__ */ h(k,{children:/* @__PURE__ */ h(z,{children:Be.map(e=>/* @__PURE__ */ h(P,{value:e,children:t=>/* @__PURE__ */ g(m,{children:[e,t.maxReached&&/* @__PURE__ */ h(`span`,{"data-slot":`hint`,children:`Limit reached`}),/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]})},e))})})]})}const He=[`Bug`,`Feature`,`Documentation`,`Design`,`Performance`,`Security`,`Testing`];function Ue(e){return new Promise((t,n)=>setTimeout(()=>e.length>20?n(/* @__PURE__ */ Error(`Labels are 20 characters at most.`)):t(),800))}function We(){let[e,t]=p.useState(He),[r,i]=p.useState([`Bug`]);return/* @__PURE__ */ g(T,{multiple:!0,value:r,onValueChange:i,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Labels`}),/* @__PURE__ */ g(O,{children:[/* @__PURE__ */ h(U,{children:e=>e.value.map(e=>/* @__PURE__ */ g(E,{value:e,children:[e,/* @__PURE__ */ h(D,{"aria-label":`Remove ${e}`,children:/* @__PURE__ */ h(d,{"aria-hidden":`true`})})]},e))}),/* @__PURE__ */ h(N,{placeholder:`Add or create a label…`})]})]}),/* @__PURE__ */ h(k,{children:/* @__PURE__ */ g(z,{children:[e.map(e=>/* @__PURE__ */ g(P,{value:e,children:[e,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e)),/* @__PURE__ */ h(ce,{minLength:2,onCreate:async e=>{await Ue(e),t(t=>[...t,e]),i(t=>[...t,e])},children:e=>e.pending?/* @__PURE__ */ g(m,{children:[/* @__PURE__ */ h(s,{"aria-hidden":`true`,"data-slot":`spinner`}),`Creating “`,e.query,`”…`]}):/* @__PURE__ */ g(m,{children:[/* @__PURE__ */ h(l,{"aria-hidden":`true`}),/* @__PURE__ */ g(`span`,{"data-slot":`stack`,children:[`Create “`,e.query,`”`,e.error?/* @__PURE__ */ h(`span`,{"data-slot":`hint`,children:e.error.message}):null]})]})})]})})]})}const Ge=[`Designer`,`Engineer`,`Engineering manager`,`Product manager`,`Researcher`];function Ke(){let e=f(),[t,r]=p.useState(null);return/* @__PURE__ */ g(T,{allowCustomValue:!0,value:t,onValueChange:(t,n)=>{r(t),e(`${t?`“${t}”`:`No title`} (${n.reason})`)},children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Job title`}),/* @__PURE__ */ h(N,{placeholder:`Type any title…`})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:e=>e.empty?`Press Enter to use “${e.query}”.`:null}),/* @__PURE__ */ h(z,{children:Ge.map(e=>/* @__PURE__ */ g(P,{value:e,children:[e,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e))})]})]})}const qe=[{value:`ar`,label:`Argentina`},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`},{value:`be`,label:`Belgium`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`},{value:`fi`,label:`Finland`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`gr`,label:`Greece`},{value:`jp`,label:`Japan`},{value:`nl`,label:`Netherlands`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`},{value:`ch`,label:`Switzerland`}],Je=e=>qe.find(t=>t.value===e)?.label??e;function Ye(){let[e,t]=p.useState(null),[i,a]=p.useState(``);return/* @__PURE__ */ g(T,{defaultValue:`jp`,itemToLabel:Je,query:i,onQueryChange:a,onOpenChange:e=>e&&a(``),onOpenChangeComplete:t=>!t&&e?.focus(),children:[/* @__PURE__ */ g(H,{ref:t,"aria-label":`Country`,children:[/* @__PURE__ */ h(`span`,{children:/* @__PURE__ */ h(U,{children:e=>e.label||`Select a country`})}),/* @__PURE__ */ h(r,{"aria-hidden":`true`})]}),/* @__PURE__ */ g(k,{anchor:e,children:[/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(u,{"aria-hidden":`true`}),/* @__PURE__ */ h(N,{autoFocus:!0,"aria-label":`Search countries`,placeholder:`Search…`})]}),/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:qe.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const Xe=[`The Shawshank Redemption`,`The Godfather`,`The Dark Knight`,`Pulp Fiction`,`Schindler's List`,`The Lord of the Rings`,`Fight Club`,`Forrest Gump`,`Inception`,`The Matrix`,`Goodfellas`,`Interstellar`,`Parasite`,`Spirited Away`,`Whiplash`,`The Prestige`,`The Departed`,`Gladiator`,`Alien`,`Casablanca`,`Amélie`,`Arrival`];function Ze(e,{signal:t}){return new Promise((n,r)=>{let i=setTimeout(()=>{let t=e.trim().toLowerCase();n(Xe.filter(e=>e.toLowerCase().includes(t)).map(e=>({value:e.toLowerCase().replace(/\W+/g,`-`),label:e})))},500);t.addEventListener(`abort`,()=>{clearTimeout(i),r(t.reason)})})}function Qe(){let e=w(Ze,{debounce:300,query:`the`,immediate:!0});return/* @__PURE__ */ g(T,{items:e.items,defaultQuery:`the`,filter:!1,status:e.status,onQueryChange:t=>e.setQuery(t),children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Movie`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search movies…`}),/* @__PURE__ */ h(H,{"aria-label":`Show movies`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(V,{children:e=>e.status===`error`?`Couldn't load movies.`:e.loading?`Searching…`:`${e.count} ${e.count===1?`movie`:`movies`}`}),/* @__PURE__ */ h(A,{children:e=>e.empty&&!e.loading?`No movies match “${e.query}”.`:null}),/* @__PURE__ */ h(z,{children:e=>e.items.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,disabled:e.disabled,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const $e=[`The Shawshank Redemption`,`The Godfather`,`The Dark Knight`,`Pulp Fiction`,`Schindler's List`,`The Lord of the Rings`,`Fight Club`,`Forrest Gump`,`Inception`,`The Matrix`,`Goodfellas`,`Interstellar`,`Parasite`,`Spirited Away`,`Whiplash`,`The Prestige`,`The Departed`,`Gladiator`,`Alien`,`Casablanca`,`Amélie`,`Arrival`];function et(e,{signal:t,page:n}){return new Promise((r,i)=>{let a=setTimeout(()=>{let t=e.trim().toLowerCase(),i=$e.filter(e=>e.toLowerCase().includes(t)).map(e=>({value:e.toLowerCase().replace(/\W+/g,`-`),label:e}));r({items:i.slice(n*5,n*5+5),hasMore:i.length>n*5+5})},500);t.addEventListener(`abort`,()=>{clearTimeout(a),i(t.reason)})})}function tt(){let e=w(et,{immediate:!0});return/* @__PURE__ */ g(T,{items:e.items,filter:!1,status:e.status,onQueryChange:t=>e.setQuery(t),onLoadMore:e.loadMore,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Movie`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search movies…`}),/* @__PURE__ */ h(H,{"aria-label":`Show movies`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:e=>e.empty&&!e.loading?`No movies found.`:null}),/* @__PURE__ */ h(z,{children:e=>e.items.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,disabled:e.disabled,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))}),/* @__PURE__ */ h(V,{children:t=>t.loading?`Loading more…`:e.hasMore?`${t.count} loaded`:`All ${t.count}`})]})]})}const nt=Array.from({length:1e4},(e,t)=>({value:`item-${t+1}`,label:`Item ${t+1}`}));function rt(e,t,n,r){return{start:Math.max(0,Math.floor(e/r)-4),end:Math.min(n,Math.ceil((e+t)/r)+4)}}function it(e,t,n,r){let i=e*r;return i<t?i:i+r>t+n?i+r-n:t}function at(){let e=p.useRef(null),[t,n]=p.useState(0);return/* @__PURE__ */ g(T,{items:nt,onHighlight:(t,{index:n})=>{let r=e.current;r&&n>=0&&(r.scrollTop=it(n,r.scrollTop,r.clientHeight,32))},children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Item`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search 10,000 items…`}),/* @__PURE__ */ h(H,{"aria-label":`Show items`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No items found.`}),/* @__PURE__ */ h(`div`,{ref:e,onScroll:e=>n(e.currentTarget.scrollTop),children:/* @__PURE__ */ h(z,{children:e=>{let n=e.items,{start:r,end:i}=rt(t,288,n.length,32);return/* @__PURE__ */ h(`div`,{style:{height:n.length*32},children:n.slice(r,i).map((e,t)=>/* @__PURE__ */ h(P,{value:e.value,label:e.label,index:r+t,style:{top:(r+t)*32,height:32},children:e.label},e.value))})}})})]})]})}const ot=[{value:`ar`,label:`Argentina`},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`},{value:`be`,label:`Belgium`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`},{value:`fi`,label:`Finland`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`gr`,label:`Greece`},{value:`jp`,label:`Japan`},{value:`nl`,label:`Netherlands`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`},{value:`ch`,label:`Switzerland`}],st=e=>ot.find(t=>t.value===e)?.label??e;function ct(){let[e,t]=p.useState(`fr`),[i,a]=p.useState(`France`),[o,s]=p.useState(!1),c=f();return/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>t(`jp`),children:`Choose Japan`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>s(!0),children:`Open`})]}),/* @__PURE__ */ g(T,{value:e,onValueChange:(e,n)=>{t(e),c(`value: ${e} (${n.reason})`)},query:i,onQueryChange:(e,t)=>{a(e),c(`query: “${e}” (${t.reason})`)},open:o,onOpenChange:(e,t)=>{s(e),c(`open: ${e} (${t.reason})`)},itemToLabel:st,debug:!0,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Country`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search countries…`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:ot.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{})})]},e.value))})]})]})]})}const lt=[{value:`ar`,label:`Argentina`},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`},{value:`be`,label:`Belgium`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`},{value:`fi`,label:`Finland`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`gr`,label:`Greece`},{value:`jp`,label:`Japan`},{value:`nl`,label:`Netherlands`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`},{value:`ch`,label:`Switzerland`}],ut=e=>lt.find(t=>t.value===e)?.label??e,Z=de();function dt(){let e=f();return/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ h(`button`,{type:`button`,onClick:async()=>{let{reason:t}=await Z.open();e(`Closed by ${t}, with ${Z.getValue()??`nothing`}`)},children:`Open and Wait`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>{Z.focus(),Z.setQuery(`sw`),Z.open()},children:`Search “sw”`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>Z.setValue(`de`),children:`Choose Germany`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>Z.clear(),children:`Clear`})]}),/* @__PURE__ */ g(T,{controller:Z,itemToLabel:ut,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Country`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search countries…`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:lt.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{})})]},e.value))})]})]})]})}const ft=[{value:`next`,label:`Next.js`},{value:`sveltekit`,label:`SvelteKit`},{value:`nuxt`,label:`Nuxt`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`solidstart`,label:`SolidStart`},{value:`qwik`,label:`Qwik City`}],pt=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}],Q=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function mt(){let[e,t]=p.useState(`bottom`),[i,a]=p.useState(`start`),[o,s]=p.useState(null),[c,l]=p.useState(!1);return/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ g(_,{items:pt,value:e,onValueChange:e=>e&&t(e),children:[/* @__PURE__ */ h(x,{children:`Side`}),/* @__PURE__ */ g(S,{children:[/* @__PURE__ */ h(C,{}),/* @__PURE__ */ h(r,{})]}),/* @__PURE__ */ h(v,{children:pt.map(e=>/* @__PURE__ */ g(y,{value:e.value,children:[e.label,/* @__PURE__ */ h(b,{children:/* @__PURE__ */ h(n,{})})]},e.value))})]}),/* @__PURE__ */ g(_,{items:Q,value:i,onValueChange:e=>e&&a(e),children:[/* @__PURE__ */ h(x,{children:`Align`}),/* @__PURE__ */ g(S,{children:[/* @__PURE__ */ h(C,{}),/* @__PURE__ */ h(r,{})]}),/* @__PURE__ */ h(v,{children:Q.map(e=>/* @__PURE__ */ g(y,{value:e.value,children:[e.label,/* @__PURE__ */ h(b,{children:/* @__PURE__ */ h(n,{})})]},e.value))})]}),/* @__PURE__ */ g(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ h(ie,{checked:c,onCheckedChange:e=>l(e===!0),children:/* @__PURE__ */ h(ae,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})}),`Anchor to the box`]})]}),/* @__PURE__ */ h(`div`,{ref:s,"data-slot":`card`,children:/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ h(N,{"aria-label":`Framework`,placeholder:`Framework`}),/* @__PURE__ */ g(k,{side:e,align:i,sideOffset:10,alignOffset:0,collisionPadding:16,anchor:c?o:null,children:[/* @__PURE__ */ h(A,{children:`No frameworks found.`}),/* @__PURE__ */ h(z,{children:ft.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{})})]},e.value))})]})]})})]})}const ht=[{value:`next`,label:`Next.js`},{value:`sveltekit`,label:`SvelteKit`},{value:`nuxt`,label:`Nuxt`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`solidstart`,label:`SolidStart`},{value:`qwik`,label:`Qwik City`}];function gt(){let e=f();return/* @__PURE__ */ g(T,{onOpenChangeComplete:t=>e(t?`Finished opening`:`Finished closing`),children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Framework`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Select a framework`}),/* @__PURE__ */ h(H,{"aria-label":`Show frameworks`,children:/* @__PURE__ */ h(r,{})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No frameworks found.`}),/* @__PURE__ */ h(z,{children:ht.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{keepMounted:!0,children:/* @__PURE__ */ h(n,{})})]},e.value))})]})]})}const _t=[{value:`next`,label:`Next.js`},{value:`sveltekit`,label:`SvelteKit`},{value:`nuxt`,label:`Nuxt`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`solidstart`,label:`SolidStart`},{value:`qwik`,label:`Qwik City`}];function vt(){return/* @__PURE__ */ g(T,{presentation:`sheet`,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Framework`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Select a framework`}),/* @__PURE__ */ h(H,{"aria-label":`Show frameworks`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No frameworks found.`}),/* @__PURE__ */ h(z,{children:_t.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]})}const $=[{value:`ar`,label:`Argentina`},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`},{value:`be`,label:`Belgium`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`dk`,label:`Denmark`},{value:`fi`,label:`Finland`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`gr`,label:`Greece`},{value:`jp`,label:`Japan`},{value:`nl`,label:`Netherlands`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`},{value:`ch`,label:`Switzerland`}],yt=e=>$.find(t=>t.value===e)?.label??e,bt=[`Design`,`Engineering`,`Marketing`,`Research`,`Sales`];function xt(){let e=f();return/* @__PURE__ */ g(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault();let n=[...new FormData(t.currentTarget)].map(([e,t])=>`${e}=${t}`);e(`Submitted ${n.join(`&`)}`)},children:[/* @__PURE__ */ g(ee,{name:`country`,children:[/* @__PURE__ */ h(re,{children:`Country`}),/* @__PURE__ */ g(T,{required:!0,itemToLabel:yt,children:[/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search countries…`}),/* @__PURE__ */ h(H,{"aria-label":`Show countries`,children:/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No countries found.`}),/* @__PURE__ */ h(z,{children:$.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e.value))})]})]}),/* @__PURE__ */ h(te,{children:`Where we ship your order.`}),/* @__PURE__ */ h(`div`,{children:/* @__PURE__ */ h(ne,{match:`valueMissing`,children:`Choose a country.`})})]}),/* @__PURE__ */ g(ee,{name:`interests`,children:[/* @__PURE__ */ h(re,{children:`Interests`}),/* @__PURE__ */ g(T,{multiple:!0,defaultValue:[`Design`],children:[/* @__PURE__ */ g(O,{children:[/* @__PURE__ */ h(U,{children:e=>e.value.map(e=>/* @__PURE__ */ g(E,{value:e,children:[e,/* @__PURE__ */ h(D,{"aria-label":`Remove ${e}`,children:/* @__PURE__ */ h(d,{"aria-hidden":`true`})})]},e))}),/* @__PURE__ */ h(N,{placeholder:`Add interests…`})]}),/* @__PURE__ */ h(k,{children:/* @__PURE__ */ h(z,{children:bt.map(e=>/* @__PURE__ */ g(P,{value:e,children:[e,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{"aria-hidden":`true`})})]},e))})})]})]}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(`button`,{type:`submit`,children:`Submit`}),/* @__PURE__ */ h(`button`,{type:`reset`,children:`Reset`})]})]})}const St=[{id:1,name:`Hollis Grant`,username:`hollis`,role:`Owner`},{id:2,name:`Inès Moreau`,username:`ines`,role:`Admin`},{id:3,name:`Kofi Mensah`,username:`kofi`,role:`Member`},{id:4,name:`Wren Takahashi`,username:`wren`,role:`Member`},{id:5,name:`Tomasz Wójcik`,username:`tomasz`,role:`Guest`}];function Ct(){return/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`Assignee`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`Search people…`,render:e=>/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(u,{"aria-hidden":`true`}),/* @__PURE__ */ h(`input`,{...e})]})}),/* @__PURE__ */ h(H,{"aria-label":`Show people`,children:e=>e.open?/* @__PURE__ */ h(i,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`No one by that name.`}),/* @__PURE__ */ h(z,{children:St.map(e=>/* @__PURE__ */ h(P,{value:e.username,label:e.name,keywords:[e.username],children:t=>/* @__PURE__ */ g(m,{children:[/* @__PURE__ */ h(`span`,{"data-slot":`badge`,children:e.name.slice(0,1)}),/* @__PURE__ */ g(`span`,{"data-slot":`stack`,children:[e.name,/* @__PURE__ */ g(`span`,{"data-slot":`hint`,children:[`@`,e.username]})]}),t.selected?/* @__PURE__ */ h(n,{"aria-hidden":`true`}):t.highlighted?/* @__PURE__ */ h(`kbd`,{"data-slot":`kbd`,children:`Enter`}):null]})},e.id))})]})]})}const wt=[{value:`cairo`,label:`القاهرة`},{value:`dubai`,label:`دبي`},{value:`riyadh`,label:`الرياض`},{value:`beirut`,label:`بيروت`},{value:`amman`,label:`عمّان`},{value:`rabat`,label:`الرباط`}];function Tt(){return/* @__PURE__ */ h(`div`,{dir:`rtl`,children:/* @__PURE__ */ g(T,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(R,{children:`المدينة`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(N,{placeholder:`ابحث عن مدينة…`}),/* @__PURE__ */ h(H,{"aria-label":`عرض المدن`,children:/* @__PURE__ */ h(r,{})})]})]}),/* @__PURE__ */ g(k,{children:[/* @__PURE__ */ h(A,{children:`لا توجد نتائج.`}),/* @__PURE__ */ h(z,{children:wt.map(e=>/* @__PURE__ */ g(P,{value:e.value,label:e.label,children:[e.label,/* @__PURE__ */ h(I,{children:/* @__PURE__ */ h(n,{})})]},e.value))})]})]})})}var Et={name:`combobox`,title:`Combobox`,description:`Search a list of options and choose one or several values.`,sections:[{heading:null,text:`Use a Combobox when people need to find a choice by typing. Start with an input and a list, then add chips, server results, or the option to create something new as you need them.`,examples:[{id:`combobox/demo`,caption:`Type “sv” to find SvelteKit. Press Down Arrow to highlight it, then Enter to choose it.`,Example:me,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem
              key={framework.value}
              value={framework.value}
              label={framework.label}
            >
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:`A disabled combobox cannot be focused or changed and submits nothing. A read-only one remains focusable and submits its value, but does not open or accept changes. Keyboard navigation skips a disabled option, and it cannot be chosen.`,examples:[{id:`combobox/disabled`,caption:`Billing country is disabled and Shipping from is read-only. Open Shipping to: arrow keys skip Denmark, which can't be chosen.`,Example:ge,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  return (
    <div data-slot="stack">
      {(["disabled", "readOnly", "item"] as const).map((variant) => (
        <Combobox
          key={variant}
          defaultValue={variant === "item" ? null : "fr"}
          itemToLabel={countryLabel}
          disabled={variant === "disabled"}
          readOnly={variant === "readOnly"}
        >
          <div data-slot="stack">
            <ComboboxLabel>
              {variant === "disabled"
                ? "Billing country"
                : variant === "readOnly"
                  ? "Shipping from"
                  : "Shipping to"}
            </ComboboxLabel>
            <div data-slot="row">
              <ComboboxInput placeholder="Search countries…" />
              <ComboboxTrigger aria-label="Show countries">
                <ChevronDownIcon aria-hidden="true" />
              </ComboboxTrigger>
            </div>
          </div>
          <ComboboxContent>
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
            <ComboboxList>
              {countries.map((country) => (
                <ComboboxItem
                  key={country.value}
                  value={country.value}
                  label={country.label}
                  disabled={country.value === "dk"}
                >
                  {country.label}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Clear and Trigger`,text:"`ComboboxClear` clears both the selection and the query, then keeps focus in the input. It appears while either has a value. When someone deletes all the text, a single selection clears right away instead of when the list closes. Escape brings the selection back while the list is still open; closing it any other way leaves it cleared.",examples:[{id:`combobox/clear`,caption:`Choose a framework, then press the clear button. The selection and text clear, focus stays in the input, and the console logs each change.`,Example:_e,source:`"use client"

import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

const frameworkLabel = (value: string) =>
  frameworks.find((framework) => framework.value === value)?.label ?? value

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<string | null>("sveltekit")

  return (
    <Combobox
      value={value}
      onValueChange={(next, details) => {
        setValue(next)
        log(\`\${next ? frameworkLabel(next) : "Cleared"} (\${details.reason})\`)
      }}
      itemToLabel={frameworkLabel}
    >
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxClear aria-label="Clear framework">
            <XIcon aria-hidden="true" />
          </ComboboxClear>
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem
              key={framework.value}
              value={framework.value}
              label={framework.label}
            >
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Auto Highlight`,text:'Add `autoHighlight` to highlight the first match while typing, so Enter can choose it immediately. With `autoHighlight="always"`, opening the list also highlights the selected item, or the first, so the arrow keys move from there. `autoHighlight="selected"` highlights only the selected item when the list opens, and nothing when none is. A highlight it placed follows the list as items arrive, and one the user moved stays while its item is there.',examples:[{id:`combobox/auto-highlight`,caption:`Type “sw” and press Enter. The first matching country is already highlighted.`,Example:ye,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

function Example() {
  return (
    <Combobox autoHighlight>
      <div data-slot="stack">
        <ComboboxLabel>Country</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Type “sw” and press Enter" />
          <ComboboxTrigger aria-label="Show countries">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem
              key={country.value}
              value={country.value}
              label={country.label}
            >
              {country.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Highlight Matches`,text:"`ComboboxItemText` marks the matching text. Matching ignores case and accents using the current locale, while the label keeps its original spelling. Its state also exposes segments if you want to render the marks yourself.",examples:[{id:`combobox/highlight`,caption:`Type “an”. Matching letters are marked while each country keeps its original spelling.`,Example:xe,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Country</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search countries…" />
          <ComboboxTrigger aria-label="Show countries">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem
              key={country.value}
              value={country.value}
              label={country.label}
              keywords={country.keywords}
            >
              <ComboboxItemText>
                {(state) =>
                  state.segments.map((segment, index) =>
                    segment.match ? (
                      <mark key={index}>{segment.text}</mark>
                    ) : (
                      segment.text
                    )
                  )
                }
              </ComboboxItemText>
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Filter and Keywords`,text:'`filter` accepts `"contains"` (the default), `"startsWith"`, a function of the item and query, or `false` for results already filtered by a server. A function can return a score instead of `true` or `false`, and items you pass as `items` then sort by it, best first. `fuzzyScore` from `@ui-sdk/core/text-match` scores an exact match above a prefix, and a prefix above a match inside the label.',examples:[{id:`combobox/filter`,caption:`Type “an” and switch Filter between Contains and Starts with. Choose Fuzzy and type “swd” for Sweden, or type “deutschland” to find Germany through a keyword.`,Example:Te,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
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
import * as React from "react"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

function fuzzy(item: { label: string }, query: string) {
  let at = 0
  for (const char of item.label.toLowerCase()) {
    if (char === query[at]?.toLowerCase()) {
      at++
    }
  }
  return at === query.length
}

const filters = {
  contains: "contains",
  startsWith: "startsWith",
  fuzzy,
} as const
const modes = [
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "fuzzy", label: "Fuzzy" },
]
type Mode = keyof typeof filters

function Example() {
  const [mode, setMode] = React.useState<Mode>("contains")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={modes}
          value={mode}
          onValueChange={(next) => next && setMode(next as Mode)}
        >
          <SelectLabel>Filter</SelectLabel>
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
      </div>
      <Combobox filter={filters[mode]}>
        <div data-slot="stack">
          <ComboboxLabel>Country</ComboboxLabel>
          <div data-slot="row">
            <ComboboxInput placeholder="Try “an”, “swd” or “deutschland”" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon aria-hidden="true" />
            </ComboboxTrigger>
          </div>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {countries.map((country) => (
              <ComboboxItem
                key={country.value}
                value={country.value}
                label={country.label}
                keywords={country.keywords}
              >
                {country.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export { Example }
`}]},{heading:`Groups`,text:"Use `ComboboxGroup` and `ComboboxGroupLabel` to name groups. Filtering hides empty groups and separators as their items disappear.",examples:[{id:`combobox/groups`,caption:`Type “chic”. Chicago remains in Americas; groups with no matches disappear.`,Example:De,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const timezones = [
  {
    label: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/Denver", label: "Denver" },
      { value: "America/Los_Angeles", label: "Los Angeles" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Madrid", label: "Madrid" },
    ],
  },
  {
    label: "Asia & Pacific",
    items: [
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Kolkata", label: "Kolkata" },
      { value: "Australia/Sydney", label: "Sydney" },
    ],
  },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Timezone</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search cities…" />
          <ComboboxTrigger aria-label="Show timezones">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No cities found.</ComboboxEmpty>
        <ComboboxList>
          {timezones.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <ComboboxSeparator />}
              <ComboboxGroup>
                <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
                {group.items.map((item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item.value}
                    label={item.label}
                  >
                    {item.label}
                    <ComboboxItemIndicator>
                      <CheckIcon aria-hidden="true" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </React.Fragment>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Icons`,text:"`ComboboxItemIcon` keeps decorative icons out of accessible names, filtering, and match marks. `ComboboxValueIcon` projects the selected item’s icon next to the input; it takes no children and is only for a single selection.",examples:[{id:`combobox/icons`,caption:`Choose Done. Its icon appears next to the input as well as in the list.`,Example:Oe,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIcon,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValueIcon,
} from "@ui-sdk/react/combobox"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  CircleCheckIcon,
  CircleXIcon,
} from "lucide-react"
import * as React from "react"

function Example() {
  const [field, setField] = React.useState<HTMLDivElement | null>(null)

  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Status</ComboboxLabel>
        <div ref={setField} data-slot="row">
          <ComboboxValueIcon />
          <ComboboxInput placeholder="Select a status" />
          <ComboboxTrigger aria-label="Show statuses">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent anchor={field}>
        <ComboboxEmpty>No statuses found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxItem value="backlog" label="Backlog">
            <ComboboxItemIcon>
              <CircleIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
          <ComboboxItem value="in-progress" label="In progress">
            <ComboboxItemIcon mirror>
              <ArrowRightIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
          <ComboboxItem value="done" label="Done">
            <ComboboxItemIcon>
              <CircleCheckIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
          <ComboboxItem value="canceled" label="Canceled">
            <ComboboxItemIcon>
              <CircleXIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Custom Items`,text:"Show useful context beside a label, such as a username or role. Set `label` explicitly so filtering and the input use the intended text, and put extra search terms in `keywords`.",examples:[{id:`combobox/custom-items`,caption:`Search for a person’s name or username. Choose a result to put that person’s name in the input.`,Example:Ae,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const users = [
  { id: 1, name: "Hollis Grant", username: "hollis", role: "Owner" },
  { id: 2, name: "Inès Moreau", username: "ines", role: "Admin" },
  { id: 3, name: "Kofi Mensah", username: "kofi", role: "Member" },
  { id: 4, name: "Wren Takahashi", username: "wren", role: "Member" },
  { id: 5, name: "Tomasz Wójcik", username: "tomasz", role: "Guest" },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Owner</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search people…" />
          <ComboboxTrigger aria-label="Show people">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No people found.</ComboboxEmpty>
        <ComboboxList>
          {users.map((user) => (
            <ComboboxItem
              key={user.id}
              value={user.username}
              label={user.name}
              keywords={[user.username]}
            >
              <span data-slot="badge">{user.name.slice(0, 1)}</span>
              <span data-slot="stack">
                <span>{user.name}</span>
                <span data-slot="hint">@{user.username}</span>
              </span>
              <span data-slot="hint">{user.role}</span>
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Recent Items`,text:"`emptyItems` supplies suggestions while the query is empty. Pair it with `items` for the full searchable collection. Render the list from `state.items` so it follows the active collection.",examples:[{id:`combobox/recent`,caption:`Open the empty input to see Recent. Start typing to search all countries; clear the text to return to Recent.`,Example:Me,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

const recentCountries = [
  {
    type: "group" as const,
    label: "Recent",
    items: [countries[9], countries[12], countries[15]],
  },
]

function Example() {
  return (
    <Combobox
      items={countries}
      emptyItems={recentCountries}
      announcement={(change) =>
        change.type === "results" ? \`\${change.count} countries match\` : null
      }
    >
      <div data-slot="stack">
        <ComboboxLabel>Country</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search countries…" />
          <ComboboxTrigger aria-label="Show countries">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as (
                (typeof countries)[number] | (typeof recentCountries)[number]
              )[]
            ).map((entry) =>
              "items" in entry ? (
                <ComboboxGroup key={entry.label}>
                  <ComboboxGroupLabel>{entry.label}</ComboboxGroupLabel>
                  {entry.items.map((country) => (
                    <ComboboxItem
                      key={country.value}
                      value={country.value}
                      label={country.label}
                    >
                      <ComboboxItemText />
                      <ComboboxItemIndicator>
                        <CheckIcon aria-hidden="true" />
                      </ComboboxItemIndicator>
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              ) : (
                <ComboboxItem
                  key={entry.value}
                  value={entry.value}
                  label={entry.label}
                >
                  <ComboboxItemText />
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              )
            )
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Multiple`,text:"Add `multiple` to make the value an array. Choosing an option toggles it, keeps the list open, and clears the query. Put `ComboboxValue` and the input inside `ComboboxChips`, then render each value as a chip with a removal button.",examples:[{id:`combobox/multiple`,caption:`Choose several frameworks. Remove one with its chip button, or press Backspace in the empty input to remove the last chip.`,Example:Pe,source:`"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

const frameworkLabel = (value: string) =>
  frameworks.find((framework) => framework.value === value)?.label ?? value

function Example() {
  return (
    <Combobox
      multiple
      defaultValue={["next", "astro"]}
      itemToLabel={frameworkLabel}
    >
      <div data-slot="stack">
        <ComboboxLabel>Frameworks</ComboboxLabel>
        <div data-slot="row">
          <ComboboxChips>
            <ComboboxValue>
              {(state) =>
                (state.value as string[]).map((value, index) => (
                  <ComboboxChip key={value} value={value}>
                    {state.labels[index]}
                    <ComboboxChipRemove
                      aria-label={\`Remove \${state.labels[index]}\`}
                    >
                      <XIcon aria-hidden="true" />
                    </ComboboxChipRemove>
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxInput placeholder="Add a framework…" />
          </ComboboxChips>
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem
              key={framework.value}
              value={framework.value}
              label={framework.label}
            >
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Select All`,text:"`ComboboxSelectAll` toggles every matching, enabled option. Inside a group, it affects only that group. It joins keyboard navigation and reports a mixed state while some of its options are selected.",examples:[{id:`combobox/select-all`,caption:`Open the list and choose a group’s select-all option. Type to narrow the matches, then use the main select-all option on those results.`,Example:Ie,source:`"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSelectAll,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, MinusIcon, XIcon } from "lucide-react"

const timezones = [
  {
    label: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/Denver", label: "Denver" },
      { value: "America/Los_Angeles", label: "Los Angeles" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Madrid", label: "Madrid" },
    ],
  },
  {
    label: "Asia & Pacific",
    items: [
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Kolkata", label: "Kolkata" },
      { value: "Australia/Sydney", label: "Sydney" },
    ],
  },
]

function Example() {
  return (
    <Combobox multiple defaultValue={["Europe/Paris"]}>
      <div data-slot="stack">
        <ComboboxLabel>Timezones</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((value, index) => (
                <ComboboxChip key={value} value={value}>
                  {state.labels[index]}
                  <ComboboxChipRemove
                    aria-label={\`Remove \${state.labels[index]}\`}
                  >
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder="Add timezones…" />
        </ComboboxChips>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No timezones found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxSelectAll>
            <span>
              <CheckIcon aria-hidden="true" />
              <MinusIcon aria-hidden="true" />
            </span>
            Select all
          </ComboboxSelectAll>
          {timezones.map((group) => (
            <ComboboxGroup key={group.label}>
              <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
              <ComboboxSelectAll>
                {(state) =>
                  state.checked
                    ? \`Clear \${group.label}\`
                    : \`Select all in \${group.label}\`
                }
              </ComboboxSelectAll>
              {group.items.map((zone) => (
                <ComboboxItem
                  key={zone.value}
                  value={zone.value}
                  label={zone.label}
                >
                  <span>
                    <ComboboxItemIndicator>
                      <CheckIcon aria-hidden="true" />
                    </ComboboxItemIndicator>
                  </span>
                  {zone.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Chips That Collapse`,text:"Add `ComboboxChipsOverflow` to keep chips on one line. It measures which chips fit, hides the rest, and exposes their count and labels. Separately, `ComboboxValue` can use `max` to show a short text summary of the selection.",examples:[{id:`combobox/chips-overflow`,caption:`Add or remove countries. Chips that no longer fit are replaced by an overflow count; the summary below lists the first two.`,Example:ze,source:`"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsOverflow,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, XIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  return (
    <Combobox
      multiple
      defaultValue={["fr", "jp", "se", "de", "ch"]}
      itemToLabel={countryLabel}
    >
      <div data-slot="stack">
        <ComboboxLabel>Countries</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((value, index) => (
                <ComboboxChip key={value} value={value}>
                  {state.labels[index]}
                  <ComboboxChipRemove
                    aria-label={\`Remove \${state.labels[index]}\`}
                  >
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsOverflow
            render={(props, state) => (
              <span {...props} title={state.labels.join(", ")}>
                +{state.count}
              </span>
            )}
          />
          <ComboboxInput placeholder="Add…" />
        </ComboboxChips>
        <p data-slot="hint">
          <ComboboxValue
            maxLabels={2}
            getMoreLabel={(count) => \`\${count} more\`}
          />
        </p>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem
              key={country.value}
              value={country.value}
              label={country.label}
            >
              {country.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Max Selected`,text:"`maxSelected` limits a multiple selection. Once the limit is reached, other options become disabled; their `maxReached` state explains why.",examples:[{id:`combobox/max-selected`,caption:`Choose a third label. Other unselected labels become unavailable until you remove one.`,Example:Ve,source:`"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, XIcon } from "lucide-react"

const labels = [
  "Bug",
  "Feature",
  "Documentation",
  "Design",
  "Performance",
  "Security",
  "Testing",
]

function Example() {
  return (
    <Combobox multiple maxSelected={3} defaultValue={["Bug", "Design"]}>
      <div data-slot="stack">
        <ComboboxLabel>Labels (up to 3)</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((label) => (
                <ComboboxChip key={label} value={label}>
                  {label}
                  <ComboboxChipRemove aria-label={\`Remove \${label}\`}>
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder="Add labels…" />
        </ComboboxChips>
      </div>
      <ComboboxContent>
        <ComboboxList>
          {labels.map((label) => (
            <ComboboxItem key={label} value={label}>
              {(state) => (
                <>
                  {label}
                  {state.maxReached && (
                    <span data-slot="hint">Limit reached</span>
                  )}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Create Option`,text:"`ComboboxCreate` offers the query when no label matches it exactly and it meets `minLength`. Use `onCreate` to save it; return a promise for asynchronous work. Creation does not change the selection itself: add the new item and select it after saving.",examples:[{id:`combobox/create`,caption:`Type a new label and choose Create. It becomes a selected chip after saving; a label longer than 20 characters shows an error.`,Example:We,source:`"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxCreate,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, LoaderCircleIcon, PlusIcon, XIcon } from "lucide-react"
import * as React from "react"

const initialLabels = [
  "Bug",
  "Feature",
  "Documentation",
  "Design",
  "Performance",
  "Security",
  "Testing",
]

function saveLabel(name: string) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(
      () =>
        name.length > 20
          ? reject(new Error("Labels are 20 characters at most."))
          : resolve(),
      800
    )
  )
}

function Example() {
  const [labels, setLabels] = React.useState(initialLabels)
  const [value, setValue] = React.useState<string[]>(["Bug"])

  return (
    <Combobox multiple value={value} onValueChange={setValue}>
      <div data-slot="stack">
        <ComboboxLabel>Labels</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((label) => (
                <ComboboxChip key={label} value={label}>
                  {label}
                  <ComboboxChipRemove aria-label={\`Remove \${label}\`}>
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder="Add or create a label…" />
        </ComboboxChips>
      </div>
      <ComboboxContent>
        <ComboboxList>
          {labels.map((label) => (
            <ComboboxItem key={label} value={label}>
              {label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
          <ComboboxCreate
            minLength={2}
            onCreate={async (query) => {
              await saveLabel(query)
              setLabels((list) => [...list, query])
              setValue((list) => [...list, query])
            }}
          >
            {(state) =>
              state.pending ? (
                <>
                  <LoaderCircleIcon aria-hidden="true" data-slot="spinner" />
                  Creating “{state.query}”…
                </>
              ) : (
                <>
                  <PlusIcon aria-hidden="true" />
                  <span data-slot="stack">
                    Create “{state.query}”
                    {state.error ? (
                      <span data-slot="hint">
                        {(state.error as Error).message}
                      </span>
                    ) : null}
                  </span>
                </>
              )
            }
          </ComboboxCreate>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Custom Value`,text:"Use `allowCustomValue` when suggestions are optional, like a datalist. Unmatched text becomes the value on Enter with nothing highlighted, or when the list closes. This does not create a new item in the collection.",examples:[{id:`combobox/custom-value`,caption:`Type a job title that isn't suggested, then press Enter without a highlighted option or leave the field. The text becomes the value, and the console logs it.`,Example:Ke,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
} from "@ui-sdk/react/combobox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"

const titles = [
  "Designer",
  "Engineer",
  "Engineering manager",
  "Product manager",
  "Researcher",
]

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <Combobox
      allowCustomValue
      value={value}
      onValueChange={(next, details) => {
        setValue(next)
        log(\`\${next ? \`“\${next}”\` : "No title"} (\${details.reason})\`)
      }}
    >
      <div data-slot="stack">
        <ComboboxLabel>Job title</ComboboxLabel>
        <ComboboxInput placeholder="Type any title…" />
      </div>
      <ComboboxContent>
        <ComboboxEmpty>
          {(state) =>
            state.empty ? \`Press Enter to use “\${state.query}”.\` : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {titles.map((title) => (
            <ComboboxItem key={title} value={title}>
              {title}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Input in the Popup`,text:`The input can live inside the popup, opened by a button showing the current value. The button then stays in the tab order. Anchor the content to it, clear the query when opening, and return focus to it after closing, as this example does.`,examples:[{id:`combobox/popup`,caption:`Press Country to open the search field inside the popup. Choose a country; closing the popup returns focus to the button.`,Example:Ye,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import * as React from "react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  const [button, setButton] = React.useState<HTMLButtonElement | null>(null)
  const [query, setQuery] = React.useState("")

  return (
    <Combobox
      defaultValue="jp"
      itemToLabel={countryLabel}
      query={query}
      onQueryChange={setQuery}
      onOpenChange={(open) => open && setQuery("")}
      onOpenChangeComplete={(open) => !open && button?.focus()}
    >
      <ComboboxTrigger ref={setButton} aria-label="Country">
        <span>
          <ComboboxValue>
            {(state) => state.label || "Select a country"}
          </ComboboxValue>
        </span>
        <ChevronDownIcon aria-hidden="true" />
      </ComboboxTrigger>
      <ComboboxContent anchor={button}>
        <div data-slot="row">
          <SearchIcon aria-hidden="true" />
          <ComboboxInput
            autoFocus
            aria-label="Search countries"
            placeholder="Search…"
          />
        </div>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem
              key={country.value}
              value={country.value}
              label={country.label}
            >
              {country.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Async Search`,text:"Use useAsyncOptions to debounce a search and discard stale results. Pass its `items` and `status` to the combobox, set `filter` to `false`, and send query changes to the loader.",examples:[{id:`combobox/async`,caption:`Replace “the” with another movie title. The status shows the pending search, then the latest results.`,Example:Qe,source:`"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMovies(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        movieTitles
          .filter((title) => title.toLowerCase().includes(needle))
          .map((title) => ({
            value: title.toLowerCase().replace(/\\W+/g, "-"),
            label: title,
          }))
      )
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  const movies = useAsyncOptions(searchMovies, {
    debounce: 300,
    query: "the",
    immediate: true,
  })

  return (
    <Combobox
      items={movies.items}
      defaultQuery="the"
      filter={false}
      status={movies.status}
      onQueryChange={(query) => movies.setQuery(query)}
    >
      <div data-slot="stack">
        <ComboboxLabel>Movie</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search movies…" />
          <ComboboxTrigger aria-label="Show movies">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxStatus>
          {(state) =>
            state.status === "error"
              ? "Couldn't load movies."
              : state.loading
                ? "Searching…"
                : \`\${state.count} \${state.count === 1 ? "movie" : "movies"}\`
          }
        </ComboboxStatus>
        <ComboboxEmpty>
          {(state) =>
            state.empty && !state.loading
              ? \`No movies match “\${state.query}”.\`
              : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as {
                value: string
                label: string
                disabled?: boolean
              }[]
            ).map((item) => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                label={item.label}
                disabled={item.disabled}
              >
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Load More`,text:"`onLoadMore` runs when scrolling or highlighting reaches the last option, once per page and not while a page loads. Connect it to the async loader’s `loadMore()`; return `{ items, hasMore }` from each page.",examples:[{id:`combobox/infinite`,caption:`Open the movies and scroll or arrow to the last result. Another page loads while the existing results stay available.`,Example:tt,source:`"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMoviePages(
  query: string,
  { signal, page }: { signal: AbortSignal; page: number }
) {
  return new Promise<{
    items: { value: string; label: string }[]
    hasMore: boolean
  }>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      const found = movieTitles
        .filter((title) => title.toLowerCase().includes(needle))
        .map((title) => ({
          value: title.toLowerCase().replace(/\\W+/g, "-"),
          label: title,
        }))
      resolve({
        items: found.slice(page * 5, page * 5 + 5),
        hasMore: found.length > page * 5 + 5,
      })
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  const movies = useAsyncOptions(searchMoviePages, { immediate: true })

  return (
    <Combobox
      items={movies.items}
      filter={false}
      status={movies.status}
      onQueryChange={(query) => movies.setQuery(query)}
      onLoadMore={movies.loadMore}
    >
      <div data-slot="stack">
        <ComboboxLabel>Movie</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search movies…" />
          <ComboboxTrigger aria-label="Show movies">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>
          {(state) =>
            state.empty && !state.loading ? "No movies found." : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as {
                value: string
                label: string
                disabled?: boolean
              }[]
            ).map((item) => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                label={item.label}
                disabled={item.disabled}
              >
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))
          }
        </ComboboxList>
        <ComboboxStatus>
          {(state) =>
            state.loading
              ? "Loading more…"
              : movies.hasMore
                ? \`\${state.count} loaded\`
                : \`All \${state.count}\`
          }
        </ComboboxStatus>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Virtualized`,text:"Supply `items` so filtering and keyboard navigation know about every option, even when only a few rows render. The list’s `state.items` contains matches, `onHighlight` reports the row to reveal, and each rendered item’s `index` gives its position in the full list to screen readers.",examples:[{id:`combobox/virtualized`,caption:`Search 10,000 items or move through them with the arrow keys. Only the nearby rows render.`,Example:at,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const manyItems = Array.from({ length: 10_000 }, (_, index) => ({
  value: \`item-\${index + 1}\`,
  label: \`Item \${index + 1}\`,
}))

function visibleRows(
  scrollTop: number,
  height: number,
  count: number,
  row: number
) {
  const start = Math.max(0, Math.floor(scrollTop / row) - 4)
  const end = Math.min(count, Math.ceil((scrollTop + height) / row) + 4)
  return { start, end }
}

function scrollForRow(
  index: number,
  scrollTop: number,
  height: number,
  row: number
) {
  const top = index * row
  if (top < scrollTop) {
    return top
  }
  if (top + row > scrollTop + height) {
    return top + row - height
  }
  return scrollTop
}

const row = 32
const height = 288

function Example() {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)

  return (
    <Combobox
      items={manyItems}
      onHighlight={(value, { index }) => {
        const el = scroller.current
        if (el && index >= 0) {
          el.scrollTop = scrollForRow(index, el.scrollTop, el.clientHeight, row)
        }
      }}
    >
      <div data-slot="stack">
        <ComboboxLabel>Item</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search 10,000 items…" />
          <ComboboxTrigger aria-label="Show items">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <div
          ref={scroller}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <ComboboxList>
            {(state) => {
              const items = state.items as { value: string; label: string }[]
              const { start, end } = visibleRows(
                scrollTop,
                height,
                items.length,
                row
              )
              return (
                <div style={{ height: items.length * row }}>
                  {items.slice(start, end).map((item, offset) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      index={start + offset}
                      style={{ top: (start + offset) * row, height: row }}
                    >
                      {item.label}
                    </ComboboxItem>
                  ))}
                </div>
              )
            }}
          </ComboboxList>
        </div>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:`The selection, text, and popup have separate values:`,examples:[{id:`combobox/controlled`,caption:`Type, choose, or use the buttons. The console logs each value, query and open change with its reason.`,Example:ct,source:`import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  const [value, setValue] = React.useState<string | null>("fr")
  const [query, setQuery] = React.useState("France")
  const [open, setOpen] = React.useState(false)
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setValue("jp")}>
          Choose Japan
        </button>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
      </div>
      <Combobox
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(\`value: \${next} (\${details.reason})\`)
        }}
        query={query}
        onQueryChange={(next, details) => {
          setQuery(next)
          log(\`query: “\${next}” (\${details.reason})\`)
        }}
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          log(\`open: \${next} (\${details.reason})\`)
        }}
        itemToLabel={countryLabel}
        debug
      >
        <div data-slot="stack">
          <ComboboxLabel>Country</ComboboxLabel>
          <div data-slot="row">
            <ComboboxInput placeholder="Search countries…" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon />
            </ComboboxTrigger>
          </div>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {countries.map((country) => (
              <ComboboxItem
                key={country.value}
                value={country.value}
                label={country.label}
              >
                {country.label}
                <ComboboxItemIndicator>
                  <CheckIcon />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"Pass a controller from `createComboboxController()`. It can read or set the value and query, open or close the list, and focus the input. `open()` resolves when the list closes with its reason and source, including `unmount`; pass an abort signal to close it on cancellation. Controllers covers lifetime and setup.",examples:[{id:`combobox/controller`,caption:`Use the buttons to drive the combobox from outside. Open and Wait logs how the list closed and what was chosen.`,Example:dt,source:`import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  createComboboxController,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

const country = createComboboxController<string>()

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={async () => {
            const { reason } = await country.open()
            log(\`Closed by \${reason}, with \${country.getValue() ?? "nothing"}\`)
          }}
        >
          Open and Wait
        </button>
        <button
          type="button"
          onClick={() => {
            country.focus()
            country.setQuery("sw")
            country.open()
          }}
        >
          Search “sw”
        </button>
        <button type="button" onClick={() => country.setValue("de")}>
          Choose Germany
        </button>
        <button type="button" onClick={() => country.clear()}>
          Clear
        </button>
      </div>
      <Combobox controller={country} itemToLabel={countryLabel}>
        <div data-slot="stack">
          <ComboboxLabel>Country</ComboboxLabel>
          <div data-slot="row">
            <ComboboxInput placeholder="Search countries…" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon />
            </ComboboxTrigger>
          </div>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {countries.map((item) => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export { Example }
`}]},{heading:`Positioning`,text:"`side` and `align` place the popup around the input or chips. `anchor` can use a different element, and `ComboboxArrow` follows the side chosen after collision handling. Popups covers offsets and available space.",examples:[{id:`combobox/positioning`,caption:`Pick a side and an alignment, then open the list. Check Anchor to the Box to place it against the box instead of the input.`,Example:mt,source:`import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from "@ui-sdk/react/combobox"
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
import * as React from "react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

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
  const [align, setAlign] = React.useState<Align>("start")
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)
  const [anchored, setAnchored] = React.useState(false)

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
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {sides.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
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
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {aligns.map((option) => (
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
            checked={anchored}
            onCheckedChange={(next) => setAnchored(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Anchor to the box
        </label>
      </div>
      <div ref={setBox} data-slot="card">
        <Combobox>
          <ComboboxInput aria-label="Framework" placeholder="Framework" />
          <ComboboxContent
            side={side}
            align={align}
            sideOffset={10}
            alignOffset={0}
            collisionPadding={16}
            anchor={anchored ? box : null}
          >
            <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
            <ComboboxList>
              {frameworks.map((framework) => (
                <ComboboxItem
                  key={framework.value}
                  value={framework.value}
                  label={framework.label}
                >
                  {framework.label}
                  <ComboboxItemIndicator>
                    <CheckIcon />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popup stays mounted until the exit finishes. `onOpenChangeComplete` runs after opening or closing finishes, and `keepMounted` on an item indicator keeps it in the page for a selection animation.",examples:[{id:`combobox/animation`,caption:`Open and close the list. The console logs when each animation finishes.`,Example:gt,source:`import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function Example() {
  const log = useLog()

  return (
    <Combobox
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem
              key={framework.value}
              value={framework.value}
              label={framework.label}
            >
              {framework.label}
              <ComboboxItemIndicator keepMounted>
                <CheckIcon />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Presentation`,text:'Use `presentation="sheet"` for a sheet, or `"auto"` to choose a sheet on small touch screens each time the list opens. The input moves into the sheet’s header; there is still one input and one query.',examples:[{id:`combobox/presentation`,caption:`Open the field to see a sheet. On touch, tap the search field in its header to bring up the keyboard, or swipe down to close it.`,Example:vt,source:`"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function Example() {
  return (
    <Combobox presentation="sheet">
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem
              key={framework.value}
              value={framework.value}
              label={framework.label}
            >
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`Forms`,text:"A combobox submits the selected value under `name`, rather than the query text. Multiple values submit as separate entries. `required` prevents empty submissions, reset restores the default selection and its label, and `form` joins a form from elsewhere on the page.",examples:[{id:`combobox/form`,caption:`Submit without a country to see the inline error. Choose one and submit; the console logs the values, and Reset restores the defaults.`,Example:xt,source:`"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

const interests = ["Design", "Engineering", "Marketing", "Research", "Sales"]

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const entries = [...new FormData(event.currentTarget)].map(
          ([name, value]) => \`\${name}=\${value}\`
        )
        log(\`Submitted \${entries.join("&")}\`)
      }}
    >
      <Field name="country">
        <FieldLabel>Country</FieldLabel>
        <Combobox required itemToLabel={countryLabel}>
          <div data-slot="row">
            <ComboboxInput placeholder="Search countries…" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon aria-hidden="true" />
            </ComboboxTrigger>
          </div>
          <ComboboxContent>
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
            <ComboboxList>
              {countries.map((country) => (
                <ComboboxItem
                  key={country.value}
                  value={country.value}
                  label={country.label}
                >
                  {country.label}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>Where we ship your order.</FieldDescription>
        <div>
          <FieldError match="valueMissing">Choose a country.</FieldError>
        </div>
      </Field>
      <Field name="interests">
        <FieldLabel>Interests</FieldLabel>
        <Combobox multiple defaultValue={["Design"]}>
          <ComboboxChips>
            <ComboboxValue>
              {(state) =>
                (state.value as string[]).map((interest) => (
                  <ComboboxChip key={interest} value={interest}>
                    {interest}
                    <ComboboxChipRemove aria-label={\`Remove \${interest}\`}>
                      <XIcon aria-hidden="true" />
                    </ComboboxChipRemove>
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxInput placeholder="Add interests…" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              {interests.map((interest) => (
                <ComboboxItem key={interest} value={interest}>
                  {interest}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <div data-slot="row">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Each part's state is listed below.",examples:[{id:`combobox/custom-rendering`,caption:`Open the list and move through it. The chevron flips while it's open, the highlighted person shows Enter, and the chosen one shows a check.`,Example:Ct,source:`import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from "lucide-react"

const users = [
  { id: 1, name: "Hollis Grant", username: "hollis", role: "Owner" },
  { id: 2, name: "Inès Moreau", username: "ines", role: "Admin" },
  { id: 3, name: "Kofi Mensah", username: "kofi", role: "Member" },
  { id: 4, name: "Wren Takahashi", username: "wren", role: "Member" },
  { id: 5, name: "Tomasz Wójcik", username: "tomasz", role: "Guest" },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Assignee</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput
            placeholder="Search people…"
            render={(props) => (
              <div data-slot="row">
                <SearchIcon aria-hidden="true" />
                <input {...props} />
              </div>
            )}
          />
          <ComboboxTrigger aria-label="Show people">
            {(state) =>
              state.open ? (
                <ChevronUpIcon aria-hidden="true" />
              ) : (
                <ChevronDownIcon aria-hidden="true" />
              )
            }
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No one by that name.</ComboboxEmpty>
        <ComboboxList>
          {users.map((user) => (
            <ComboboxItem
              key={user.id}
              value={user.username}
              label={user.name}
              keywords={[user.username]}
            >
              {(state) => (
                <>
                  <span data-slot="badge">{user.name.slice(0, 1)}</span>
                  <span data-slot="stack">
                    {user.name}
                    <span data-slot="hint">@{user.username}</span>
                  </span>
                  {state.selected ? (
                    <CheckIcon aria-hidden="true" />
                  ) : state.highlighted ? (
                    <kbd data-slot="kbd">Enter</kbd>
                  ) : null}
                </>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`combobox/rtl`,caption:``,Example:Tt,source:`import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const cities = [
  { value: "cairo", label: "القاهرة" },
  { value: "dubai", label: "دبي" },
  { value: "riyadh", label: "الرياض" },
  { value: "beirut", label: "بيروت" },
  { value: "amman", label: "عمّان" },
  { value: "rabat", label: "الرباط" },
]

export function Example() {
  return (
    <div dir="rtl">
      <Combobox>
        <div data-slot="stack">
          <ComboboxLabel>المدينة</ComboboxLabel>
          <div data-slot="row">
            <ComboboxInput placeholder="ابحث عن مدينة…" />
            <ComboboxTrigger aria-label="عرض المدن">
              <ChevronDownIcon />
            </ComboboxTrigger>
          </div>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>لا توجد نتائج.</ComboboxEmpty>
          <ComboboxList>
            {cities.map((city) => (
              <ComboboxItem
                key={city.value}
                value={city.value}
                label={city.label}
              >
                {city.label}
                <ComboboxItemIndicator>
                  <CheckIcon />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
`}]}]};export{Et as default};