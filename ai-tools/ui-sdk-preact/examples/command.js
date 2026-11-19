import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-BasF5OXx.js";import{t as n}from"../chunks/c-DLjBScCO.js";import{t as r}from"../chunks/c-WfjOen3K.js";import{t as i}from"../chunks/c-CA3STxaZ.js";import{t as a}from"../chunks/c-D5QH3sUe.js";import{t as o}from"../chunks/c-CJJm1AY-.js";import{t as s}from"../chunks/c-ZgxiYuCF.js";import{t as c}from"../chunks/c-B_nFDu0k.js";import{t as ee}from"../chunks/c-Cl6VgBVP.js";import{useLog as l}from"./log.js";import{Dialog as u,DialogBackdrop as d,DialogContent as f,DialogShortcut as p,DialogTitle as m,DialogTrigger as h}from"ui-sdk/dialog.js";import{Command as g,CommandEmpty as _,CommandGroup as v,CommandGroupLabel as y,CommandInput as b,CommandItem as x,CommandItemIcon as S,CommandItemText as C,CommandList as w,CommandPage as T,CommandSeparator as E,CommandShortcut as D,CommandStatus as O,createCommandController as k}from"ui-sdk/command.js";import*as A from"preact/compat";import{Fragment as j,jsx as M,jsxs as N}from"preact/compat/jsx-runtime";import{Select as P,SelectContent as F,SelectItem as I,SelectItemIndicator as te,SelectLabel as ne,SelectTrigger as re,SelectValue as ie}from"ui-sdk/select.js";import{useAsyncOptions as L}from"ui-sdk/async-options.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const R={name:`calculator`,size:24,node:[[`rect`,{width:`16`,height:`20`,x:`4`,y:`2`,rx:`2`,key:`1nb95v`}],[`line`,{x1:`8`,x2:`16`,y1:`6`,y2:`6`,key:`x4nwl0`}],[`line`,{x1:`16`,x2:`16`,y1:`14`,y2:`18`,key:`wjye3r`}],[`path`,{d:`M16 10h.01`,key:`1m94wz`}],[`path`,{d:`M12 10h.01`,key:`1nrarc`}],[`path`,{d:`M8 10h.01`,key:`19clt8`}],[`path`,{d:`M12 14h.01`,key:`1etili`}],[`path`,{d:`M8 14h.01`,key:`6423bh`}],[`path`,{d:`M12 18h.01`,key:`mhygvu`}],[`path`,{d:`M8 18h.01`,key:`lrp35t`}]]};R.node;const z=e(R),B={name:`corner-down-left`,size:24,node:[[`path`,{d:`M20 4v7a4 4 0 0 1-4 4H4`,key:`6o5b7l`}],[`path`,{d:`m9 10-5 5 5 5`,key:`1kshq7`}]]}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
;B.node;const V=e(B),H={name:`credit-card`,size:24,node:[[`rect`,{width:`20`,height:`14`,x:`2`,y:`5`,rx:`2`,key:`ynyp8z`}],[`line`,{x1:`2`,x2:`22`,y1:`10`,y2:`10`,key:`1b3vmo`}],[`path`,{d:`M6 14h2`,key:`mk7k0u`}]]}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
;H.node;const U=e(H),W={name:`face-slightly-smiling`,size:24,node:[[`path`,{d:`M15 10V9`,key:`4dkmfx`}],[`path`,{d:`M16.472 15a6 6 0 01-8.943 0`,key:`7qomzy`}],[`path`,{d:`M9 10V9`,key:`1lazqi`}],[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}]],aliases:[`smile`]}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
;W.node;const G=e(W),K={name:`user`,size:24,node:[[`path`,{d:`M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2`,key:`975kel`}],[`circle`,{cx:`12`,cy:`7`,r:`4`,key:`17ys0d`}]]}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
;K.node;const q=e(K),J=[{value:`calendar`,label:`Calendar`,icon:n},{value:`emoji`,label:`Search Emoji`,icon:G},{value:`calculator`,label:`Calculator`,icon:z,disabled:!0}],Y=[{value:`profile`,label:`Profile`,icon:q,shortcut:`mod+p`},{value:`billing`,label:`Billing`,icon:U,shortcut:`mod+b`},{value:`settings`,label:`Settings`,icon:c,shortcut:`mod+s`}];function ae(){return/* @__PURE__ */ N(g,{children:[/* @__PURE__ */ N(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ M(s,{"aria-hidden":`true`}),/* @__PURE__ */ M(b,{"aria-label":`Search commands`,placeholder:`Type a command or search…`})]}),/* @__PURE__ */ M(_,{children:`No results found.`}),/* @__PURE__ */ N(w,{children:[/* @__PURE__ */ N(v,{children:[/* @__PURE__ */ M(y,{children:`Suggestions`}),J.map(e=>/* @__PURE__ */ N(x,{value:e.value,disabled:e.disabled,children:[/* @__PURE__ */ M(S,{children:/* @__PURE__ */ M(e.icon,{})}),/* @__PURE__ */ M(`span`,{children:e.label})]},e.value))]}),/* @__PURE__ */ M(E,{}),/* @__PURE__ */ N(v,{children:[/* @__PURE__ */ M(y,{children:`Settings`}),Y.map(e=>/* @__PURE__ */ N(x,{value:e.value,shortcut:e.shortcut,children:[/* @__PURE__ */ M(S,{children:/* @__PURE__ */ M(e.icon,{})}),/* @__PURE__ */ M(`span`,{children:e.label}),/* @__PURE__ */ M(D,{})]},e.value))]})]})]})}const oe=[{value:`calendar`,label:`Calendar`,icon:n},{value:`emoji`,label:`Search Emoji`,icon:G},{value:`calculator`,label:`Calculator`,icon:z,disabled:!0},{value:`profile`,label:`Profile`,icon:q},{value:`billing`,label:`Billing`,icon:U},{value:`settings`,label:`Settings`,icon:c}];function se(){let[e,t]=A.useState(!1),n=l();return/* @__PURE__ */ M(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ N(u,{open:e,onOpenChange:t,children:[/* @__PURE__ */ N(h,{shortcut:`mod+k`,children:[`Search…`,/* @__PURE__ */ M(p,{})]}),/* @__PURE__ */ M(d,{}),/* @__PURE__ */ N(f,{children:[/* @__PURE__ */ M(m,{children:`Command palette`}),/* @__PURE__ */ N(g,{onAction:e=>{n(`Ran ${e}`),t(!1)},children:[/* @__PURE__ */ N(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ M(s,{"aria-hidden":`true`}),/* @__PURE__ */ M(b,{"aria-label":`Search commands`,placeholder:`Type a command or search…`})]}),/* @__PURE__ */ M(_,{children:`No results found.`}),/* @__PURE__ */ M(w,{children:/* @__PURE__ */ N(v,{children:[/* @__PURE__ */ M(y,{children:`Suggestions`}),oe.map(e=>/* @__PURE__ */ N(x,{value:e.value,disabled:e.disabled,children:[/* @__PURE__ */ M(S,{children:/* @__PURE__ */ M(e.icon,{})}),e.label]},e.value))]})})]})]})]})})}const ce=[{value:`profile`,label:`Profile`,icon:q,shortcut:`mod+p`},{value:`billing`,label:`Billing`,icon:U,shortcut:`mod+b`},{value:`settings`,label:`Settings`,icon:c,shortcut:`mod+s`}];function le(){let e=l();return/* @__PURE__ */ M(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ N(g,{onAction:t=>e(`Ran ${t}`),children:[/* @__PURE__ */ M(b,{"aria-label":`Search settings`,placeholder:`Search settings…`}),/* @__PURE__ */ M(w,{children:/* @__PURE__ */ N(v,{children:[/* @__PURE__ */ M(y,{children:`Settings`}),ce.map(e=>/* @__PURE__ */ N(x,{value:e.value,shortcut:e.shortcut,children:[/* @__PURE__ */ M(S,{children:/* @__PURE__ */ M(e.icon,{})}),/* @__PURE__ */ M(`span`,{children:e.label}),/* @__PURE__ */ M(D,{children:e=>e.text})]},e.value))]})})]})})}const ue=[{value:`calendar`,label:`Calendar`,icon:n},{value:`emoji`,label:`Search Emoji`,icon:G},{value:`calculator`,label:`Calculator`,icon:z,disabled:!0},{value:`profile`,label:`Profile`,icon:q},{value:`billing`,label:`Billing`,icon:U},{value:`settings`,label:`Settings`,icon:c}];function de(){return/* @__PURE__ */ N(g,{children:[/* @__PURE__ */ N(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ M(s,{"aria-hidden":`true`}),/* @__PURE__ */ M(b,{"aria-label":`Search commands`,placeholder:`Try “prf” or “emo”…`})]}),/* @__PURE__ */ M(_,{children:`No results found.`}),/* @__PURE__ */ M(w,{children:ue.map(e=>/* @__PURE__ */ N(x,{value:e.value,disabled:e.disabled,children:[/* @__PURE__ */ M(S,{children:/* @__PURE__ */ M(e.icon,{})}),/* @__PURE__ */ M(C,{children:e.label})]},e.value))})]})}const fe=[{label:`Home`},{label:`Inbox`,keywords:[`mail`,`messages`]},{label:`Documents`},{label:`Downloads`},{label:`New file`},{label:`New folder`},{label:`Copy`},{label:`Paste`},{label:`Delete`,keywords:[`remove`,`trash`]},{label:`Zoom in`},{label:`Zoom out`},{label:`Search emoji`,keywords:[`smiley`,`face`]},{label:`Keyboard shortcuts`,keywords:[`hotkeys`]},{label:`Settings`,keywords:[`preferences`]}],X=[{value:`fuzzy`,label:`Fuzzy`},{value:`contains`,label:`Contains`},{value:`startsWith`,label:`Starts with`},{value:`words`,label:`Words`}];function pe(e,t){return t.toLowerCase().split(/\s+/).every(t=>e.label.toLowerCase().split(` `).some(e=>e.startsWith(t)))}function me(){let[e,t]=A.useState(`fuzzy`);return/* @__PURE__ */ N(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ M(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ N(P,{items:X,value:e,onValueChange:e=>e&&t(e),children:[/* @__PURE__ */ M(ne,{children:`Filter`}),/* @__PURE__ */ N(re,{children:[/* @__PURE__ */ M(ie,{}),/* @__PURE__ */ M(i,{})]}),/* @__PURE__ */ M(F,{children:X.map(e=>/* @__PURE__ */ N(I,{value:e.value,children:[e.label,/* @__PURE__ */ M(te,{children:/* @__PURE__ */ M(r,{})})]},e.value))})]})}),/* @__PURE__ */ N(g,{filter:e===`words`?pe:e,children:[/* @__PURE__ */ M(b,{"aria-label":`Search commands`,placeholder:`Try “nf”, “zo in” or “smiley”`}),/* @__PURE__ */ M(_,{children:`No results found.`}),/* @__PURE__ */ M(w,{children:fe.map(e=>/* @__PURE__ */ M(x,{value:e.label,keywords:e.keywords,children:e.label},e.label))})]})]})}const he=[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`},{value:`system`,label:`System`}],ge=[{value:`design`,label:`Design`},{value:`engineering`,label:`Engineering`},{value:`marketing`,label:`Marketing`}];function _e(){let e=A.useState(()=>k())[0],[n,r]=A.useState([]);return/* @__PURE__ */ N(g,{controller:e,pages:n,onPagesChange:r,onAction:t=>{t===`back`&&e.pop()},children:[/* @__PURE__ */ M(`div`,{"data-slot":`row`,children:n.map(e=>/* @__PURE__ */ M(`span`,{"data-slot":`badge`,children:e},e))}),/* @__PURE__ */ M(b,{"aria-label":`Search commands`,placeholder:n.length?`Search… (Backspace to go back)`:`What do you need?`}),/* @__PURE__ */ M(_,{children:`No results found.`}),/* @__PURE__ */ N(w,{children:[/* @__PURE__ */ M(T,{children:/* @__PURE__ */ N(v,{children:[/* @__PURE__ */ M(y,{children:`Workspace`}),/* @__PURE__ */ N(x,{value:`theme`,page:`theme`,children:[/* @__PURE__ */ M(S,{children:/* @__PURE__ */ M(o,{})}),`Change theme…`]}),/* @__PURE__ */ N(x,{value:`teams`,page:`teams`,children:[/* @__PURE__ */ M(S,{children:/* @__PURE__ */ M(ee,{})}),`Switch team…`]})]})}),/* @__PURE__ */ M(T,{value:`theme`,children:he.map(e=>/* @__PURE__ */ M(x,{value:e.value,children:e.label},e.value))}),/* @__PURE__ */ M(T,{value:`teams`,children:ge.map(e=>/* @__PURE__ */ M(x,{value:e.value,children:e.label},e.value))}),n.length>0&&/* @__PURE__ */ N(x,{value:`back`,children:[/* @__PURE__ */ M(S,{mirror:!0,children:/* @__PURE__ */ M(t,{})}),`Go back`]})]})]})}const ve=[{type:`group`,label:`Navigation`,items:[{value:`home`,label:`Go home`,keywords:[`start`]},{value:`inbox`,label:`Open inbox`,shortcut:`mod+i`}]},{type:`separator`},{type:`group`,label:`Preferences`,items:[{value:`theme`,label:`Change theme…`,items:[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`},{value:`system`,label:`System`}]},{value:`language`,label:`Change language…`,items:[`English`,`Français`,`Deutsch`,`日本語`]},{value:`sign-out`,label:`Sign out`,shortcut:`mod+shift+q`}]}];function ye(){let e=l();return/* @__PURE__ */ M(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ N(g,{items:ve,onAction:t=>e(`Ran ${t}`),children:[/* @__PURE__ */ M(b,{"aria-label":`Search commands`,placeholder:`Type a command…`}),/* @__PURE__ */ M(_,{children:`No results found.`}),/* @__PURE__ */ M(w,{children:e=>/* @__PURE__ */ M(Z,{items:e.items})})]})})}function Z({items:e}){return e.map((e,t)=>{if(typeof e!=`string`&&`type`in e)return e.type===`separator`?/* @__PURE__ */ M(E,{},`separator-${t}`):/* @__PURE__ */ N(v,{children:[/* @__PURE__ */ M(y,{children:e.label}),/* @__PURE__ */ M(Z,{items:e.items})]},e.label);let n=typeof e==`string`?{value:e,label:e}:e;return/* @__PURE__ */ N(x,{value:n.value,label:n.label,disabled:n.disabled,shortcut:n.shortcut,children:[n.label,n.shortcut&&/* @__PURE__ */ M(D,{})]},n.value)})}function be(e,{signal:t}){let n=[`Fix login redirect`,`Dark mode flicker`,`Add billing page`,`Search is slow`,`Update dependencies`,`Crash on upload`,`Export to CSV`,`Keyboard shortcuts help`];return new Promise((r,i)=>{let a=setTimeout(()=>{let t=e.trim().toLowerCase();r(n.filter(e=>e.toLowerCase().includes(t)).map(e=>({value:e.toLowerCase().replaceAll(` `,`-`),label:e})))},400);t.addEventListener(`abort`,()=>{clearTimeout(a),i(new DOMException(`Aborted`,`AbortError`))})})}function xe(){let e=L(be,{debounce:250,immediate:!0});return/* @__PURE__ */ N(g,{filter:!1,status:e.status,onQueryChange:t=>e.setQuery(t),onLoadMore:e.loadMore,children:[/* @__PURE__ */ M(b,{"aria-label":`Search issues`,placeholder:`Search issues…`}),/* @__PURE__ */ M(O,{children:e=>e.loading?`Searching…`:`${e.count} ${e.count===1?`issue`:`issues`}`}),/* @__PURE__ */ M(_,{children:e=>e.empty&&!e.loading?`No issues match “${e.query}”.`:null}),/* @__PURE__ */ M(w,{children:e.items.map(e=>/* @__PURE__ */ M(x,{value:e.value,label:e.label,children:e.label},e.value))})]})}const Q=e=>new Promise(t=>setTimeout(t,e));function Se(){let e=l();return/* @__PURE__ */ M(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ N(g,{children:[/* @__PURE__ */ M(b,{"aria-label":`Search actions`,placeholder:`Search actions…`}),/* @__PURE__ */ N(w,{children:[/* @__PURE__ */ M(x,{value:`deploy`,onSelect:async()=>{await Q(1200),e(`Deployed to production`)},children:e=>/* @__PURE__ */ N(j,{children:[`Deploy to production`,e.pending&&/* @__PURE__ */ M(a,{"data-slot":`spinner`,"aria-hidden":`true`})]})}),/* @__PURE__ */ M(x,{value:`sync`,onSelect:async()=>{throw await Q(600),e(`Couldn't sync: offline`),Error(`Offline`)},children:e=>/* @__PURE__ */ N(j,{children:[`Sync with server`,e.pending?/* @__PURE__ */ M(a,{"data-slot":`spinner`,"aria-hidden":`true`}):e.error!==void 0&&/* @__PURE__ */ M(`span`,{"data-slot":`hint`,children:`Failed, try again`})]})})]})]})})}const Ce=Array.from({length:1e4},(e,t)=>({value:`command-${t+1}`,label:`Command ${t+1}`}));function we(){let e=A.useRef(null),[t,n]=A.useState(0);return/* @__PURE__ */ N(g,{items:Ce,onValueChange:(t,{index:n})=>{let r=e.current;if(!r||n<0)return;let i=n*32;i<r.scrollTop?r.scrollTop=i:i+32>r.scrollTop+r.clientHeight&&(r.scrollTop=i+32-r.clientHeight)},children:[/* @__PURE__ */ M(b,{"aria-label":`Search 10,000 commands`,placeholder:`Search 10,000 commands…`}),/* @__PURE__ */ M(`div`,{ref:e,onScroll:e=>n(e.currentTarget.scrollTop),children:/* @__PURE__ */ M(w,{children:e=>{let n=Math.max(0,Math.floor(t/32)-4),r=Math.min(e.items.length,Math.ceil((t+256)/32)+4);return/* @__PURE__ */ M(`div`,{style:{height:e.items.length*32},children:e.items.slice(n,r).map((e,t)=>/* @__PURE__ */ M(x,{value:e.value,label:e.label,index:n+t,style:{top:(n+t)*32},children:e.label},e.value))})}})})]})}const Te=[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`},{value:`system`,label:`System`}];function Ee(){let[e,t]=A.useState(`dark`),[n,r]=A.useState(``),[i,a]=A.useState([`theme`]),o=l();return/* @__PURE__ */ N(g,{value:e,onValueChange:(e,n)=>{t(e),o(`Highlighted ${e??`nothing`} (${n.reason})`)},query:n,onQueryChange:(e,t)=>{r(e),o(`Query “${e}” (${t.reason})`)},pages:i,onPagesChange:(e,t)=>{a(e),o(`Pages [${e.join(`, `)}] (${t.reason})`)},onAction:e=>o(`Ran ${e}`),children:[/* @__PURE__ */ M(b,{"aria-label":`Search themes`,placeholder:`Search themes…`}),/* @__PURE__ */ N(w,{children:[/* @__PURE__ */ M(T,{children:/* @__PURE__ */ M(x,{value:`theme`,page:`theme`,children:`Change theme…`})}),/* @__PURE__ */ M(T,{value:`theme`,children:Te.map(e=>/* @__PURE__ */ M(x,{value:e.value,children:e.label},e.value))})]})]})}const De=[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`},{value:`system`,label:`System`}],$=k();function Oe(){let e=l();return/* @__PURE__ */ N(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ N(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ M(`button`,{type:`button`,onClick:()=>$.push(`theme`),children:`Open Themes`}),/* @__PURE__ */ M(`button`,{type:`button`,onClick:()=>$.pop(),children:`Back`}),/* @__PURE__ */ M(`button`,{type:`button`,onClick:()=>$.setValue(`dark`),children:`Highlight Dark`}),/* @__PURE__ */ M(`button`,{type:`button`,onClick:()=>$.setQuery(`li`),children:`Search “li”`}),/* @__PURE__ */ M(`button`,{type:`button`,onClick:()=>$.run(),children:`Run Highlighted`}),/* @__PURE__ */ M(`button`,{type:`button`,onClick:()=>$.focus(),children:`Focus`})]}),/* @__PURE__ */ N(g,{controller:$,onAction:t=>e(`Ran ${t}`),children:[/* @__PURE__ */ M(b,{"aria-label":`Search commands`}),/* @__PURE__ */ N(w,{children:[/* @__PURE__ */ M(T,{children:/* @__PURE__ */ M(x,{value:`theme`,page:`theme`,children:`Change theme…`})}),/* @__PURE__ */ M(T,{value:`theme`,children:De.map(e=>/* @__PURE__ */ M(x,{value:e.value,children:e.label},e.value))})]})]})]})}const ke=[`Composition`,`Installation`,`Styling`];function Ae(){return/* @__PURE__ */ N(g,{children:[/* @__PURE__ */ M(b,{"aria-label":`Search docs`,placeholder:`Search docs…`}),/* @__PURE__ */ M(w,{children:ke.map(e=>/* @__PURE__ */ M(x,{value:e,render:/* @__PURE__ */ M(`a`,{href:`#${e.toLowerCase()}`}),children:e=>/* @__PURE__ */ N(j,{children:[/* @__PURE__ */ M(C,{children:e=>e.segments.map((e,t)=>e.match?/* @__PURE__ */ M(`strong`,{children:e.text},t):e.text)}),e.highlighted&&/* @__PURE__ */ M(V,{"aria-hidden":`true`})]})},e))})]})}const je=[{value:`calendar`,label:`التقويم`},{value:`search`,label:`البحث`},{value:`settings`,label:`الإعدادات`},{value:`profile`,label:`الملف الشخصي`}];function Me(){return/* @__PURE__ */ M(`div`,{dir:`rtl`,"data-slot":`stack`,children:/* @__PURE__ */ N(g,{children:[/* @__PURE__ */ M(b,{"aria-label":`ابحث عن أمر`,placeholder:`ابحث…`}),/* @__PURE__ */ M(_,{children:`لا توجد نتائج.`}),/* @__PURE__ */ M(w,{children:je.map(e=>/* @__PURE__ */ M(x,{value:e.value,label:e.label,children:e.label},e.value))})]})})}var Ne={name:`command`,title:`Command`,description:`Search commands, run actions, and open pages of more choices.`,sections:[{heading:null,text:`Command puts a search field over a list of actions. The list stays open while someone searches. You can use it on its own, or put it in a dialog to build a command palette.`,examples:[{id:`command/demo`,caption:`Type “bil” to find Billing. Arrow keys move the highlight; Escape clears the search.`,Example:ae,source:`"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ui-sdk/react/command"
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

const suggestions = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "emoji", label: "Search Emoji", icon: SmileIcon },
  {
    value: "calculator",
    label: "Calculator",
    icon: CalculatorIcon,
    disabled: true,
  },
]

const settings = [
  { value: "profile", label: "Profile", icon: UserIcon, shortcut: "mod+p" },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCardIcon,
    shortcut: "mod+b",
  },
  {
    value: "settings",
    label: "Settings",
    icon: SettingsIcon,
    shortcut: "mod+s",
  },
]

function Example() {
  return (
    <Command>
      <div data-slot="row">
        <SearchIcon aria-hidden="true" />
        <CommandInput
          aria-label="Search commands"
          placeholder="Type a command or search…"
        />
      </div>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          <CommandGroupLabel>Suggestions</CommandGroupLabel>
          {suggestions.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              <CommandItemIcon>
                <item.icon />
              </CommandItemIcon>
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandGroupLabel>Settings</CommandGroupLabel>
          {settings.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              shortcut={item.shortcut}
            >
              <CommandItemIcon>
                <item.icon />
              </CommandItemIcon>
              <span>{item.label}</span>
              <CommandShortcut />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export { Example }
`}]},{heading:`Dialog`,text:'Put Command inside a Dialog for a command palette. Give the dialog a title, put `shortcut="mod+k"` on its trigger, and close it when a command runs. The dialog handles dismissal and returns focus to the trigger.',examples:[{id:`command/dialog`,caption:`Press Search or use Cmd+K / Ctrl+K. Choose a command to run it and close the palette; the console logs what ran.`,Example:se,source:`"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
} from "@ui-sdk/react/command"
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"

const commands = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "emoji", label: "Search Emoji", icon: SmileIcon },
  {
    value: "calculator",
    label: "Calculator",
    icon: CalculatorIcon,
    disabled: true,
  },
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "billing", label: "Billing", icon: CreditCardIcon },
  { value: "settings", label: "Settings", icon: SettingsIcon },
]

function Example() {
  const [open, setOpen] = React.useState(false)
  const log = useLog()
  return (
    <div data-slot="stack">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger shortcut="mod+k">
          Search…
          <DialogShortcut />
        </DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <DialogTitle>Command palette</DialogTitle>
          <Command
            onAction={(value) => {
              log(\`Ran \${value}\`)
              setOpen(false)
            }}
          >
            <div data-slot="row">
              <SearchIcon aria-hidden="true" />
              <CommandInput
                aria-label="Search commands"
                placeholder="Type a command or search…"
              />
            </div>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandGroupLabel>Suggestions</CommandGroupLabel>
                {commands.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    <CommandItemIcon>
                      <item.icon />
                    </CommandItemIcon>
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Shortcuts`,text:"An item’s `shortcut` can run it while the command list is mounted, even when the search or current page hides it. `CommandShortcut` displays the keys for the current platform, and the item gets `aria-keyshortcuts`. Shortcuts inside a dialog run while it is open.",examples:[{id:`command/shortcuts`,caption:`Press Cmd+P / Ctrl+P to run Profile, even when the search hides it. The console logs each command that runs.`,Example:le,source:`"use client"

import {
  Command,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandShortcut,
} from "@ui-sdk/react/command"
import { CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const settings = [
  { value: "profile", label: "Profile", icon: UserIcon, shortcut: "mod+p" },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCardIcon,
    shortcut: "mod+b",
  },
  {
    value: "settings",
    label: "Settings",
    icon: SettingsIcon,
    shortcut: "mod+s",
  },
]

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <Command onAction={(value) => log(\`Ran \${value}\`)}>
        <CommandInput
          aria-label="Search settings"
          placeholder="Search settings…"
        />
        <CommandList>
          <CommandGroup>
            <CommandGroupLabel>Settings</CommandGroupLabel>
            {settings.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                shortcut={item.shortcut}
              >
                <CommandItemIcon>
                  <item.icon />
                </CommandItemIcon>
                <span>{item.label}</span>
                <CommandShortcut>{(state) => state.text}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
`}]},{heading:`Highlight Matches`,text:"`CommandItemText` marks the matched text. The default fuzzy filter can match letters that are apart, so one command may have several marked segments.",examples:[{id:`command/highlight`,caption:`Type “prf” to find Profile. Matching letters are marked even when they are not next to each other.`,Example:de,source:`"use client"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
} from "@ui-sdk/react/command"
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

const commands = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "emoji", label: "Search Emoji", icon: SmileIcon },
  {
    value: "calculator",
    label: "Calculator",
    icon: CalculatorIcon,
    disabled: true,
  },
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "billing", label: "Billing", icon: CreditCardIcon },
  { value: "settings", label: "Settings", icon: SettingsIcon },
]

function Example() {
  return (
    <Command>
      <div data-slot="row">
        <SearchIcon aria-hidden="true" />
        <CommandInput
          aria-label="Search commands"
          placeholder="Try “prf” or “emo”…"
        />
      </div>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        {commands.map((item) => (
          <CommandItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            <CommandItemIcon>
              <item.icon />
            </CommandItemIcon>
            <CommandItemText>{item.label}</CommandItemText>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export { Example }
`}]},{heading:`Filter and Keywords`,text:'`"fuzzy"` is the default: `nf` matches New file. `"contains"` and `"startsWith"` match the text itself. A custom function returns a boolean or a score; zero hides a command and higher scores rank first.',examples:[{id:`command/filter`,caption:`Type “nf” with Fuzzy to find New file. Choose Words and type “zo in” for Zoom in, or type “smiley” to find Search emoji through a keyword.`,Example:me,source:`"use client"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"
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

const commands = [
  { label: "Home" },
  { label: "Inbox", keywords: ["mail", "messages"] },
  { label: "Documents" },
  { label: "Downloads" },
  { label: "New file" },
  { label: "New folder" },
  { label: "Copy" },
  { label: "Paste" },
  { label: "Delete", keywords: ["remove", "trash"] },
  { label: "Zoom in" },
  { label: "Zoom out" },
  { label: "Search emoji", keywords: ["smiley", "face"] },
  { label: "Keyboard shortcuts", keywords: ["hotkeys"] },
  { label: "Settings", keywords: ["preferences"] },
]

const modes = [
  { value: "fuzzy", label: "Fuzzy" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "words", label: "Words" },
]
type Mode = "fuzzy" | "contains" | "startsWith" | "words"

function words(item: { label: string }, query: string) {
  return query
    .toLowerCase()
    .split(/\\s+/)
    .every((word) =>
      item.label
        .toLowerCase()
        .split(" ")
        .some((part) => part.startsWith(word))
    )
}

function Example() {
  const [mode, setMode] = React.useState<Mode>("fuzzy")
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
      <Command filter={mode === "words" ? words : mode}>
        <CommandInput
          aria-label="Search commands"
          placeholder="Try “nf”, “zo in” or “smiley”"
        />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          {commands.map((command) => (
            <CommandItem
              key={command.label}
              value={command.label}
              keywords={command.keywords}
            >
              {command.label}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
`}]},{heading:`Pages`,text:"Set an item’s `page` to the value of a `CommandPage` to open it. An unnamed page holds the first set of commands. The `pages` array records the stack of pages that have been opened.",examples:[{id:`command/pages`,caption:`Choose Change theme or Switch team. Use Go back, or press Backspace in an empty search field, to return.`,Example:_e,source:`"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandPage,
  createCommandController,
} from "@ui-sdk/react/command"
import { ArrowLeftIcon, MoonIcon, UsersIcon } from "lucide-react"
import * as React from "react"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const teams = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
]

function Example() {
  const command = React.useState(() => createCommandController())[0]
  const [pages, setPages] = React.useState<string[]>([])
  return (
    <Command
      controller={command}
      pages={pages}
      onPagesChange={setPages}
      onAction={(value) => {
        if (value === "back") {
          command.pop()
        }
      }}
    >
      <div data-slot="row">
        {pages.map((page) => (
          <span key={page} data-slot="badge">
            {page}
          </span>
        ))}
      </div>
      <CommandInput
        aria-label="Search commands"
        placeholder={
          pages.length ? "Search… (Backspace to go back)" : "What do you need?"
        }
      />
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        <CommandPage>
          <CommandGroup>
            <CommandGroupLabel>Workspace</CommandGroupLabel>
            <CommandItem value="theme" page="theme">
              <CommandItemIcon>
                <MoonIcon />
              </CommandItemIcon>
              Change theme…
            </CommandItem>
            <CommandItem value="teams" page="teams">
              <CommandItemIcon>
                <UsersIcon />
              </CommandItemIcon>
              Switch team…
            </CommandItem>
          </CommandGroup>
        </CommandPage>
        <CommandPage value="theme">
          {themes.map((theme) => (
            <CommandItem key={theme.value} value={theme.value}>
              {theme.label}
            </CommandItem>
          ))}
        </CommandPage>
        <CommandPage value="teams">
          {teams.map((team) => (
            <CommandItem key={team.value} value={team.value}>
              {team.label}
            </CommandItem>
          ))}
        </CommandPage>
        {pages.length > 0 && (
          <CommandItem value="back">
            <CommandItemIcon mirror>
              <ArrowLeftIcon />
            </CommandItemIcon>
            Go back
          </CommandItem>
        )}
      </CommandList>
    </Command>
  )
}

export { Example }
`}]},{heading:`Items as Data`,text:"Pass `items` to provide commands, groups, separators, and pages as `CommandData`. A data command with its own `items` opens a page. Its shortcut still works when another page or filter hides it.",examples:[{id:`command/data`,caption:`Choose Change theme to open its commands. Press Cmd+I / Ctrl+I to run Open inbox from any page; the console logs what ran.`,Example:ye,source:`"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  type CommandData,
  type CommandDataItem,
} from "@ui-sdk/react/command"
import { useLog } from "../../../shared/react/log"

const commands: CommandData = [
  {
    type: "group",
    label: "Navigation",
    items: [
      { value: "home", label: "Go home", keywords: ["start"] },
      { value: "inbox", label: "Open inbox", shortcut: "mod+i" },
    ],
  },
  { type: "separator" },
  {
    type: "group",
    label: "Preferences",
    items: [
      {
        value: "theme",
        label: "Change theme…",
        items: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ],
      },
      {
        value: "language",
        label: "Change language…",
        items: ["English", "Français", "Deutsch", "日本語"],
      },
      { value: "sign-out", label: "Sign out", shortcut: "mod+shift+q" },
    ],
  },
]

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <Command items={commands} onAction={(value) => log(\`Ran \${value}\`)}>
        <CommandInput
          aria-label="Search commands"
          placeholder="Type a command…"
        />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>{(state) => <Commands items={state.items} />}</CommandList>
      </Command>
    </div>
  )
}

function Commands({ items }: { items: CommandData }) {
  return items.map((entry, index) => {
    if (typeof entry !== "string" && "type" in entry) {
      if (entry.type === "separator") {
        return <CommandSeparator key={\`separator-\${index}\`} />
      }
      return (
        <CommandGroup key={entry.label}>
          <CommandGroupLabel>{entry.label}</CommandGroupLabel>
          <Commands items={entry.items} />
        </CommandGroup>
      )
    }
    const command: CommandDataItem =
      typeof entry === "string" ? { value: entry, label: entry } : entry
    return (
      <CommandItem
        key={command.value}
        value={command.value}
        label={command.label}
        disabled={command.disabled}
        shortcut={command.shortcut}
      >
        {command.label}
        {command.shortcut && <CommandShortcut />}
      </CommandItem>
    )
  })
}

export { Example }
`}]},{heading:`Async Results`,text:"Use async options to wait for typing to pause and discard stale results. Send query changes to `setQuery()`, render the returned items, and pass `status`. Set `filter` to `false` to keep the server’s order.",examples:[{id:`command/async`,caption:`Type “login” and wait for matching issues. Replace the text to start a new search; only the latest results appear.`,Example:xe,source:`"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
} from "@ui-sdk/react/command"

function searchIssues(query: string, { signal }: { signal: AbortSignal }) {
  const issues = [
    "Fix login redirect",
    "Dark mode flicker",
    "Add billing page",
    "Search is slow",
    "Update dependencies",
    "Crash on upload",
    "Export to CSV",
    "Keyboard shortcuts help",
  ]
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        issues
          .filter((issue) => issue.toLowerCase().includes(needle))
          .map((issue) => ({
            value: issue.toLowerCase().replaceAll(" ", "-"),
            label: issue,
          }))
      )
    }, 400)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

function Example() {
  const issues = useAsyncOptions(searchIssues, {
    debounce: 250,
    immediate: true,
  })

  return (
    <Command
      filter={false}
      status={issues.status}
      onQueryChange={(query) => issues.setQuery(query)}
      onLoadMore={issues.loadMore}
    >
      <CommandInput aria-label="Search issues" placeholder="Search issues…" />
      <CommandStatus>
        {(state) =>
          state.loading
            ? "Searching…"
            : \`\${state.count} \${state.count === 1 ? "issue" : "issues"}\`
        }
      </CommandStatus>
      <CommandEmpty>
        {(state) =>
          state.empty && !state.loading
            ? \`No issues match “\${state.query}”.\`
            : null
        }
      </CommandEmpty>
      <CommandList>
        {issues.items.map((issue) => (
          <CommandItem
            key={issue.value}
            value={issue.value}
            label={issue.label}
          >
            {issue.label}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export { Example }
`}]},{heading:`Pending Actions`,text:"Return a promise from `onAction` or an item’s `onSelect`. The command gets `data-pending`, `aria-busy` and `aria-disabled` until it settles; further presses do not start another run. A rejection becomes the command’s `error` state, which clears when it runs again.",examples:[{id:`command/pending`,caption:`Run Deploy to production and try it again while it's pending. Sync with server fails and can be retried; the console logs each outcome.`,Example:Se,source:`"use client"

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"
import { LoaderCircleIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <Command>
        <CommandInput
          aria-label="Search actions"
          placeholder="Search actions…"
        />
        <CommandList>
          <CommandItem
            value="deploy"
            onSelect={async () => {
              await wait(1200)
              log("Deployed to production")
            }}
          >
            {(state) => (
              <>
                Deploy to production
                {state.pending && (
                  <LoaderCircleIcon data-slot="spinner" aria-hidden="true" />
                )}
              </>
            )}
          </CommandItem>
          <CommandItem
            value="sync"
            onSelect={async () => {
              await wait(600)
              log("Couldn't sync: offline")
              throw new Error("Offline")
            }}
          >
            {(state) => (
              <>
                Sync with server
                {state.pending ? (
                  <LoaderCircleIcon data-slot="spinner" aria-hidden="true" />
                ) : (
                  state.error !== undefined && (
                    <span data-slot="hint">Failed, try again</span>
                  )
                )}
              </>
            )}
          </CommandItem>
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
`}]},{heading:`Virtualized`,text:"Pass the full `items` collection so filtering and keyboard navigation include commands that are not mounted. Render only visible rows, giving each its index in the current results. `onValueChange` includes that index so you can scroll a newly highlighted row into view.",examples:[{id:`command/virtualized`,caption:`Search 10,000 commands or move through them with the arrow keys. Only the rows near the viewport render.`,Example:we,source:`"use client"

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"
import * as React from "react"

const commands = Array.from({ length: 10_000 }, (_, index) => ({
  value: \`command-\${index + 1}\`,
  label: \`Command \${index + 1}\`,
}))

const row = 32
const height = 256

function Example() {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  return (
    <Command
      items={commands}
      onValueChange={(value, { index }) => {
        const el = scroller.current
        if (!el || index < 0) {
          return
        }
        const top = index * row
        if (top < el.scrollTop) {
          el.scrollTop = top
        } else if (top + row > el.scrollTop + el.clientHeight) {
          el.scrollTop = top + row - el.clientHeight
        }
      }}
    >
      <CommandInput
        aria-label="Search 10,000 commands"
        placeholder="Search 10,000 commands…"
      />
      <div
        ref={scroller}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <CommandList>
          {(state) => {
            const start = Math.max(0, Math.floor(scrollTop / row) - 4)
            const end = Math.min(
              state.items.length,
              Math.ceil((scrollTop + height) / row) + 4
            )
            return (
              <div style={{ height: state.items.length * row }}>
                {(state.items as typeof commands)
                  .slice(start, end)
                  .map((item, offset) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      index={start + offset}
                      style={{ top: (start + offset) * row }}
                    >
                      {item.label}
                    </CommandItem>
                  ))}
              </div>
            )
          }}
        </CommandList>
      </div>
    </Command>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:`The highlighted command, search text, and page stack are separate:`,examples:[{id:`command/controlled`,caption:`Open Change theme, search and move the highlight. The console logs each highlight, query and page change with its reason.`,Example:Ee,source:`import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPage,
} from "@ui-sdk/react/command"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

function Example() {
  const [value, setValue] = React.useState<string | null>("dark")
  const [query, setQuery] = React.useState("")
  const [pages, setPages] = React.useState(["theme"])
  const log = useLog()
  return (
    <Command
      value={value}
      onValueChange={(next, details) => {
        setValue(next)
        log(\`Highlighted \${next ?? "nothing"} (\${details.reason})\`)
      }}
      query={query}
      onQueryChange={(next, details) => {
        setQuery(next)
        log(\`Query “\${next}” (\${details.reason})\`)
      }}
      pages={pages}
      onPagesChange={(next, details) => {
        setPages(next)
        log(\`Pages [\${next.join(", ")}] (\${details.reason})\`)
      }}
      onAction={(next) => log(\`Ran \${next}\`)}
    >
      <CommandInput aria-label="Search themes" placeholder="Search themes…" />
      <CommandList>
        <CommandPage>
          <CommandItem value="theme" page="theme">
            Change theme…
          </CommandItem>
        </CommandPage>
        <CommandPage value="theme">
          {themes.map((theme) => (
            <CommandItem key={theme.value} value={theme.value}>
              {theme.label}
            </CommandItem>
          ))}
        </CommandPage>
      </CommandList>
    </Command>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"Create a `createCommandController()` for one instance and pass it as `controller`. It can read and set the highlight, query, and page stack. Use `push()` and `pop()` to navigate pages, `run()` to run the highlighted command or a named one, and `focus()` to focus the search. See Controllers for setup and lifecycle.",examples:[{id:`command/controller`,caption:`Use the buttons to open pages, search, move the highlight and run it from outside. The console logs each command that runs.`,Example:Oe,source:`import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPage,
  createCommandController,
} from "@ui-sdk/react/command"
import { useLog } from "../../../shared/react/log"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const palette = createCommandController()

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => palette.push("theme")}>
          Open Themes
        </button>
        <button type="button" onClick={() => palette.pop()}>
          Back
        </button>
        <button type="button" onClick={() => palette.setValue("dark")}>
          Highlight Dark
        </button>
        <button type="button" onClick={() => palette.setQuery("li")}>
          Search “li”
        </button>
        <button type="button" onClick={() => palette.run()}>
          Run Highlighted
        </button>
        <button type="button" onClick={() => palette.focus()}>
          Focus
        </button>
      </div>
      <Command controller={palette} onAction={(value) => log(\`Ran \${value}\`)}>
        <CommandInput aria-label="Search commands" />
        <CommandList>
          <CommandPage>
            <CommandItem value="theme" page="theme">
              Change theme…
            </CommandItem>
          </CommandPage>
          <CommandPage value="theme">
            {themes.map((theme) => (
              <CommandItem key={theme.value} value={theme.value}>
                {theme.label}
              </CommandItem>
            ))}
          </CommandPage>
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:`Render a command as an anchor when it should navigate. Enter follows the highlighted link; modified clicks keep their usual browser behavior.`,examples:[{id:`command/custom-rendering`,caption:`Search for Installation and press Enter. The command follows the link to that section on this page.`,Example:Ae,source:`"use client"

import {
  Command,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
} from "@ui-sdk/react/command"
import { CornerDownLeftIcon } from "lucide-react"

const pages = ["Composition", "Installation", "Styling"]

function Example() {
  return (
    <Command>
      <CommandInput aria-label="Search docs" placeholder="Search docs…" />
      <CommandList>
        {pages.map((page) => (
          <CommandItem
            key={page}
            value={page}
            render={<a href={\`#\${page.toLowerCase()}\`} />}
          >
            {(state) => (
              <>
                <CommandItemText>
                  {(text) =>
                    text.segments.map((segment, index) =>
                      segment.match ? (
                        <strong key={index}>{segment.text}</strong>
                      ) : (
                        segment.text
                      )
                    )
                  }
                </CommandItemText>
                {state.highlighted && <CornerDownLeftIcon aria-hidden="true" />}
              </>
            )}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`command/rtl`,caption:``,Example:Me,source:`import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"

const commands = [
  { value: "calendar", label: "التقويم" },
  { value: "search", label: "البحث" },
  { value: "settings", label: "الإعدادات" },
  { value: "profile", label: "الملف الشخصي" },
]

export function Example() {
  return (
    <div dir="rtl" data-slot="stack">
      <Command>
        <CommandInput aria-label="ابحث عن أمر" placeholder="ابحث…" />
        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
        <CommandList>
          {commands.map((item) => (
            <CommandItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}
`}]}]};export{Ne as default};