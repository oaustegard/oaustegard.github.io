import{t as e}from"../chunks/c-CCOgxx-k.js";import{t}from"../chunks/c-CA3STxaZ.js";import{t as n}from"../chunks/c-C55Oxqjg.js";import{t as r}from"../chunks/c-BnWal148.js";import{t as i}from"../chunks/c-BfTRFW97.js";import{t as a}from"../chunks/c-DLl0Awjp.js";import{t as o}from"../chunks/c-C1ErRzDB.js";import{t as s}from"../chunks/c-NPxkywtp.js";import{useLog as c}from"./log.js";import*as l from"preact/compat";import{jsx as u,jsxs as d}from"preact/compat/jsx-runtime";import{Field as f,FieldDescription as ee,FieldError as te,FieldLabel as ne}from"ui-sdk/field.js";import{useAsyncOptions as p}from"ui-sdk/async-options.js";import{Autocomplete as m,AutocompleteClear as h,AutocompleteContent as g,AutocompleteEmpty as _,AutocompleteGroup as v,AutocompleteGroupLabel as y,AutocompleteInput as b,AutocompleteItem as x,AutocompleteItemIcon as S,AutocompleteItemText as C,AutocompleteLabel as w,AutocompleteList as T,AutocompleteSeparator as E,AutocompleteStatus as D,AutocompleteTrigger as O,createAutocompleteController as k}from"ui-sdk/autocomplete.js";const A=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function j(){return/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Favorite fruit`}),/* @__PURE__ */ u(b,{placeholder:`e.g. Mango`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:A.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})}const M=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function N(){return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(m,{disabled:!0,defaultValue:`Banana`,children:/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Disabled`}),/* @__PURE__ */ u(b,{})]})}),/* @__PURE__ */ u(m,{readOnly:!0,defaultValue:`Cherry`,children:/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Read-only`}),/* @__PURE__ */ u(b,{})]})}),/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Some suggestions disabled`}),/* @__PURE__ */ u(b,{placeholder:`Type “b”`})]}),/* @__PURE__ */ u(g,{children:/* @__PURE__ */ u(T,{children:M.map((e,t)=>/* @__PURE__ */ u(x,{value:e,disabled:t%3==0,children:e},e))})})]})]})}const P=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function F(){return/* @__PURE__ */ d(m,{defaultValue:`Mango`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Fruit`}),/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(b,{}),/* @__PURE__ */ u(h,{"aria-label":`Clear`,children:/* @__PURE__ */ u(s,{"aria-hidden":`true`})}),/* @__PURE__ */ u(O,{"aria-label":`Show fruits`,children:/* @__PURE__ */ u(t,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:P.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})}const I=[`react hooks`,`tailwind grid`,`web components`,`vue v-model`];function L(){return/* @__PURE__ */ d(m,{openOnFocus:!0,children:[/* @__PURE__ */ u(b,{"aria-label":`Search`,placeholder:`Search…`}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No results.`}),/* @__PURE__ */ u(T,{children:/* @__PURE__ */ d(v,{children:[/* @__PURE__ */ u(y,{children:`Recent searches`}),I.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))]})})]})]})}const R=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function z(){return/* @__PURE__ */ d(m,{autoHighlight:!0,loop:!1,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Fruit`}),/* @__PURE__ */ u(b,{placeholder:`Type, then Enter`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:R.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})}const B=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function V(){return/* @__PURE__ */ d(m,{inlineComplete:!0,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Fruit`}),/* @__PURE__ */ u(b,{placeholder:`Type “bl”`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:B.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})}const H=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function U(){return/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Favorite fruit`}),/* @__PURE__ */ u(b,{placeholder:`e.g. berry`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:H.map(e=>/* @__PURE__ */ u(x,{value:e,children:/* @__PURE__ */ u(C,{children:e=>e.segments.map((e,t)=>e.match?/* @__PURE__ */ u(`strong`,{children:e.text},t):e.text)})},e))})]})]})}const W=[{value:`feature`,label:`feature`,keywords:[`enhancement`,`request`]},{value:`fix`,label:`fix`,keywords:[`bug`,`patch`]},{value:`docs`,label:`docs`,keywords:[`documentation`,`readme`]},{value:`performance`,label:`performance`,keywords:[`speed`,`slow`]},{value:`security`,label:`security`,keywords:[`vulnerability`]},{value:`refactor`,label:`refactor`,keywords:[`cleanup`]}];function G(){return/* @__PURE__ */ d(m,{filter:`startsWith`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Tag`}),/* @__PURE__ */ u(b,{placeholder:`Try “bug”`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No tags found.`}),/* @__PURE__ */ u(T,{children:W.map(e=>/* @__PURE__ */ d(x,{value:e.value,label:e.label,keywords:e.keywords,children:[e.label,/* @__PURE__ */ u(`span`,{"data-slot":`hint`,children:e.keywords[0]})]},e.value))})]})]})}const K=[{label:`Tree fruits`,items:[`Apple`,`Apricot`,`Cherry`,`Lemon`,`Peach`,`Pear`]},{label:`Berries`,items:[`Blackberry`,`Blueberry`,`Grape`,`Strawberry`]},{label:`Tropical`,items:[`Avocado`,`Banana`,`Mango`,`Pineapple`]}];function q(){return/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Fruit`}),/* @__PURE__ */ u(b,{placeholder:`e.g. Pear`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:K.map((e,t)=>/* @__PURE__ */ d(l.Fragment,{children:[t>0&&/* @__PURE__ */ u(E,{}),/* @__PURE__ */ d(v,{children:[/* @__PURE__ */ u(y,{children:e.label}),e.items.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))]})]},e.label))})]})]})}const J=[{value:`Starred`,icon:o},{value:`Drafts`,icon:i},{value:`Replies`,icon:a,mirror:!0},{value:`Attachments`,icon:r},{value:`Archived`,icon:e},{value:`Scheduled`,icon:n}];function re(){return/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ u(b,{type:`search`,"aria-label":`Search mail`,placeholder:`Search mail…`}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No searches found.`}),/* @__PURE__ */ u(T,{children:J.map(e=>/* @__PURE__ */ d(x,{value:e.value,children:[/* @__PURE__ */ u(S,{mirror:e.mirror,children:/* @__PURE__ */ u(e.icon,{})}),e.value]},e.value))})]})]})}const Y=[{label:`Tree fruits`,fruits:[`Apple`,`Apricot`,`Cherry`,`Lemon`,`Peach`,`Pear`]},{label:`Berries`,fruits:[`Blackberry`,`Blueberry`,`Grape`,`Strawberry`]},{label:`Tropical`,fruits:[`Avocado`,`Banana`,`Mango`,`Pineapple`]}];function X(){return/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Fruit`}),/* @__PURE__ */ u(b,{placeholder:`e.g. Peach`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:Y.map((e,t)=>/* @__PURE__ */ d(l.Fragment,{children:[t>0&&/* @__PURE__ */ u(E,{}),/* @__PURE__ */ d(v,{children:[/* @__PURE__ */ u(y,{children:e.label}),e.fruits.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))]})]},e.label))})]})]})}const ie=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function ae(){let[e,t]=l.useState(``),[n,r]=l.useState(!1),i=c();return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ d(m,{value:e,onValueChange:(e,n)=>{if(e.length>12)return n.cancel();t(e),i(`text: ${n.reason}`)},open:n,onOpenChange:(e,t)=>{r(e),i(`${e?`opened`:`closed`}: ${t.reason}`)},onOpenChangeComplete:e=>i(`${e?`opened`:`closed`} and settled`),onHighlight:e=>e&&i(`highlighted ${e}`),debug:!0,children:[/* @__PURE__ */ u(w,{children:`Fruit (12 characters at most)`}),/* @__PURE__ */ u(b,{}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:ie.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})})}const oe=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`],Z=k();function se(){return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ u(`button`,{type:`button`,"data-size":`sm`,onClick:()=>Z.open(),children:`Open`}),/* @__PURE__ */ u(`button`,{type:`button`,"data-size":`sm`,onClick:()=>Z.setValue(`Pea`),children:`Type “Pea”`}),/* @__PURE__ */ u(`button`,{type:`button`,"data-size":`sm`,onClick:()=>Z.clear(),children:`Clear`}),/* @__PURE__ */ u(`button`,{type:`button`,"data-size":`sm`,onClick:()=>Z.focus(),children:`Focus`})]}),/* @__PURE__ */ d(m,{controller:Z,children:[/* @__PURE__ */ u(w,{children:`Fruit`}),/* @__PURE__ */ u(b,{}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:oe.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})]})}const ce=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`];function le(){let[e,t]=l.useState(null);return/* @__PURE__ */ u(`div`,{ref:t,"data-slot":`card`,children:/* @__PURE__ */ d(m,{modal:`pointer`,container:e,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Fruit`}),/* @__PURE__ */ u(b,{})]}),/* @__PURE__ */ d(g,{side:`top`,align:`end`,sideOffset:10,alignOffset:-4,collisionPadding:8,anchor:e,keepMounted:!0,children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:ce.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})})}const ue=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function de(){return/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Favorite fruit`}),/* @__PURE__ */ u(b,{placeholder:`e.g. Mango`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:ue.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})}const fe=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function pe(){return/* @__PURE__ */ d(m,{presentation:`sheet`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Favorite fruit`}),/* @__PURE__ */ u(b,{placeholder:`e.g. Mango`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:fe.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})}const me=[`Apple`,`Apricot`,`Avocado`,`Banana`,`Blackberry`,`Blueberry`,`Cherry`,`Grape`,`Lemon`,`Mango`,`Orange`,`Peach`,`Pear`,`Pineapple`,`Strawberry`];function he(){let e=c();return/* @__PURE__ */ d(`form`,{id:`order`,"data-slot":`stack`,onSubmit:t=>{t.preventDefault();let n=[...new FormData(t.currentTarget)].map(([e,t])=>`${e}=${t}`);e(`Submitted ${n.join(`&`)}`)},children:[/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(ne,{children:`Fruit`}),/* @__PURE__ */ d(m,{name:`fruit`,form:`order`,required:!0,defaultValue:`Apple`,children:[/* @__PURE__ */ u(b,{}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No fruits found.`}),/* @__PURE__ */ u(T,{children:me.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]}),/* @__PURE__ */ u(ee,{children:`Any fruit, listed or not.`}),/* @__PURE__ */ u(`div`,{children:/* @__PURE__ */ u(te,{})})]}),/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(`button`,{type:`submit`,"data-variant":`solid`,children:`Submit`}),/* @__PURE__ */ u(`button`,{type:`reset`,children:`Reset`})]})]})}const ge=[`react hooks`,`tailwind grid`,`web components`,`vue v-model`];function _e(){let e=c();return/* @__PURE__ */ u(`form`,{role:`search`,"data-slot":`stack`,onSubmit:e=>e.preventDefault(),children:/* @__PURE__ */ d(m,{submitOnSelect:!0,name:`q`,onSubmit:t=>e(`Searched “${t}”`),children:[/* @__PURE__ */ u(b,{type:`search`,"aria-label":`Search`,placeholder:`Search…`}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No results.`}),/* @__PURE__ */ u(T,{children:ge.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})})}const Q=[`react hooks`,`tailwind grid`,`web components`,`vue v-model`],ve=[...Q,`react server components`,`tailwind colors`,`vue router`],ye=[{type:`group`,label:`Recent searches`,items:Q}];function be(){return/* @__PURE__ */ d(m,{items:ve,emptyItems:ye,openOnFocus:!0,announcement:e=>e.type===`results`?`${e.count} ${e.count===1?`topic`:`topics`}`:null,children:[/* @__PURE__ */ u(b,{type:`search`,"aria-label":`Search docs`,placeholder:`Search docs…`}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No topics found.`}),/* @__PURE__ */ u(T,{children:e=>e.items.map(e=>typeof e==`string`?/* @__PURE__ */ u(x,{value:e,children:/* @__PURE__ */ u(C,{})},e):/* @__PURE__ */ d(v,{children:[/* @__PURE__ */ u(y,{children:e.label}),e.items.map(e=>/* @__PURE__ */ u(x,{value:e,children:/* @__PURE__ */ u(C,{})},e))]},e.label))})]})]})}function xe(e,{signal:t}){let n=[`Amsterdam`,`Athens`,`Barcelona`,`Berlin`,`Boston`,`Brussels`,`Buenos Aires`,`Cairo`,`Chicago`,`Copenhagen`,`Dublin`,`Lisbon`,`London`,`Los Angeles`,`Madrid`,`Paris`,`Prague`,`Rome`,`Seoul`,`Tokyo`];return new Promise((r,i)=>{let a=setTimeout(()=>{let t=e.trim().toLowerCase();r(n.filter(e=>e.toLowerCase().startsWith(t)))},300);t.addEventListener(`abort`,()=>{clearTimeout(a),i(new DOMException(`Aborted`,`AbortError`))})})}function Se(){let e=p(xe,{debounce:200});return/* @__PURE__ */ d(m,{items:e.items,filter:!1,status:e.status,onValueChange:t=>e.setQuery(t),onLoadMore:e.loadMore,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`City`}),/* @__PURE__ */ u(b,{placeholder:`e.g. Paris`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(D,{children:e=>e.loading?`Searching…`:e.count?`${e.count} ${e.count===1?`city`:`cities`}`:``}),/* @__PURE__ */ u(_,{children:e=>e.empty&&!e.loading?`No cities start with “${e.query}”.`:null}),/* @__PURE__ */ u(T,{children:e=>e.items.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})]})]})}const Ce=[{title:`Installation`,section:`Get Started`,href:`#installation`},{title:`Composition`,section:`Concepts`,href:`#composition`},{title:`Build Your Own`,section:`Concepts`,href:`#build-your-own`},{title:`Styling`,section:`Guides`,href:`#styling`},{title:`API Reference`,section:`Reference`,href:`#api-reference`},{title:`Accessibility`,section:`Reference`,href:`#accessibility`}];function $(){return/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`Jump to`}),/* @__PURE__ */ u(b,{placeholder:`e.g. Styling`})]}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ u(_,{children:`No sections found.`}),/* @__PURE__ */ u(T,{children:Ce.map(e=>/* @__PURE__ */ d(x,{value:e.title,label:e.title,render:/* @__PURE__ */ u(`a`,{href:e.href}),children:[e.title,/* @__PURE__ */ u(`span`,{"data-slot":`hint`,children:e.section})]},e.href))})]})]})}const we=[`القاهرة`,`القدس`,`الرباط`,`الرياض`,`بيروت`,`دبي`,`عمّان`];function Te(){return/* @__PURE__ */ u(`div`,{dir:`rtl`,children:/* @__PURE__ */ d(m,{inlineComplete:!0,children:[/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(w,{children:`المدينة`}),/* @__PURE__ */ u(b,{placeholder:`مثلاً: دبي`})]}),/* @__PURE__ */ u(g,{children:/* @__PURE__ */ u(T,{children:we.map(e=>/* @__PURE__ */ u(x,{value:e,children:e},e))})})]})})}var Ee={name:`autocomplete`,title:`Autocomplete`,description:`Suggest text while someone types, without limiting what they can enter.`,sections:[{heading:null,text:`Use Autocomplete for a text field with helpful suggestions. Choosing one fills in the field, but any text is a valid value. Use Combobox when the value should be a selected option instead.`,examples:[{id:`autocomplete/demo`,caption:`Type “man”, press Down Arrow, then Enter to fill in Mango. You can also leave text that is not in the list.`,Example:j,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <Autocomplete>
      <div data-slot="stack">
        <AutocompleteLabel>Favorite fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. Mango" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruits.map((fruit) => (
            <AutocompleteItem key={fruit} value={fruit}>
              {fruit}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:`A disabled field cannot be focused or changed and submits nothing. A read-only field stays focusable and submits its value, but does not open or accept changes. Disabled suggestions are skipped by keyboard navigation and cannot fill in the field.`,examples:[{id:`autocomplete/disabled`,caption:`Try the Disabled and Read-only fields. In Disabled suggestion, type “b”: arrow keys skip Banana and a press cannot choose it.`,Example:N,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <div data-slot="stack">
      <Autocomplete disabled defaultValue="Banana">
        <div data-slot="stack">
          <AutocompleteLabel>Disabled</AutocompleteLabel>
          <AutocompleteInput />
        </div>
      </Autocomplete>
      <Autocomplete readOnly defaultValue="Cherry">
        <div data-slot="stack">
          <AutocompleteLabel>Read-only</AutocompleteLabel>
          <AutocompleteInput />
        </div>
      </Autocomplete>
      <Autocomplete>
        <div data-slot="stack">
          <AutocompleteLabel>Some suggestions disabled</AutocompleteLabel>
          <AutocompleteInput placeholder="Type “b”" />
        </div>
        <AutocompleteContent>
          <AutocompleteList>
            {fruits.map((fruit, index) => (
              <AutocompleteItem
                key={fruit}
                value={fruit}
                disabled={index % 3 === 0}
              >
                {fruit}
              </AutocompleteItem>
            ))}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}

export { Example }
`}]},{heading:`Clear and Trigger`,text:"`AutocompleteClear` empties the field and returns focus to it. `AutocompleteTrigger` lets someone open the suggestions without typing. Give the trigger a label that describes what it opens.",examples:[{id:`autocomplete/clear`,caption:`Clear Mango, then press Show fruits to open the suggestions. The clear button disappears while the field is empty.`,Example:F,source:`"use client"

import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteTrigger,
} from "@ui-sdk/react/autocomplete"
import { ChevronDownIcon, XIcon } from "lucide-react"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <Autocomplete defaultValue="Mango">
      <div data-slot="stack">
        <AutocompleteLabel>Fruit</AutocompleteLabel>
        <div data-slot="row">
          <AutocompleteInput />
          <AutocompleteClear aria-label="Clear">
            <XIcon aria-hidden="true" />
          </AutocompleteClear>
          <AutocompleteTrigger aria-label="Show fruits">
            <ChevronDownIcon aria-hidden="true" />
          </AutocompleteTrigger>
        </div>
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruits.map((fruit) => (
            <AutocompleteItem key={fruit} value={fruit}>
              {fruit}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Open on Focus`,text:"Add `openOnFocus` to offer suggestions as soon as the input receives focus. This works well when there are useful choices before someone types.",examples:[{id:`autocomplete/open-on-focus`,caption:`Focus Search docs to see recent searches before typing. Escape closes them; pressing the field opens them again.`,Example:L,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const recent = ["react hooks", "tailwind grid", "web components", "vue v-model"]

function Example() {
  return (
    <Autocomplete openOnFocus>
      <AutocompleteInput aria-label="Search" placeholder="Search…" />
      <AutocompleteContent>
        <AutocompleteEmpty>No results.</AutocompleteEmpty>
        <AutocompleteList>
          <AutocompleteGroup>
            <AutocompleteGroupLabel>Recent searches</AutocompleteGroupLabel>
            {recent.map((search) => (
              <AutocompleteItem key={search} value={search}>
                {search}
              </AutocompleteItem>
            ))}
          </AutocompleteGroup>
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Auto Highlight`,text:"`autoHighlight` highlights the first match while typing, so Enter can choose it immediately. Set `loop` to `false` to stop arrow keys at either end of the list.",examples:[{id:`autocomplete/auto-highlight`,caption:`Type “pe” and press Enter to choose the first match. Arrow keys stop at the ends because this example disables looping.`,Example:z,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <Autocomplete autoHighlight loop={false}>
      <div data-slot="stack">
        <AutocompleteLabel>Fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="Type, then Enter" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruits.map((fruit) => (
            <AutocompleteItem key={fruit} value={fruit}>
              {fruit}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Inline Completion`,text:"`inlineComplete` fills in the rest of the first suggestion that starts with the typed text, with the added text selected. Arrow keys fill in the suggestion they highlight. End or Right Arrow accepts the completion; Backspace or Escape takes it back out.",examples:[{id:`autocomplete/inline`,caption:`Type “bl” to complete blackberry inline. Backspace removes the completion; Down Arrow fills in Blueberry. Press End to accept the text.`,Example:V,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <Autocomplete inlineComplete>
      <div data-slot="stack">
        <AutocompleteLabel>Fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="Type “bl”" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruits.map((fruit) => (
            <AutocompleteItem key={fruit} value={fruit}>
              {fruit}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Highlight Matches`,text:"`AutocompleteItemText` marks the matching text, ignoring case and accents using the current locale. Its state exposes the matching segments when you want to render them yourself, as this example does in bold.",examples:[{id:`autocomplete/highlight`,caption:`Type “berry”. The matching letters are bold while each suggestion keeps its original spelling.`,Example:U,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemText,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <Autocomplete>
      <div data-slot="stack">
        <AutocompleteLabel>Favorite fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. berry" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruits.map((fruit) => (
            <AutocompleteItem key={fruit} value={fruit}>
              <AutocompleteItemText>
                {(state) =>
                  state.segments.map((segment, index) =>
                    segment.match ? (
                      <strong key={index}>{segment.text}</strong>
                    ) : (
                      segment.text
                    )
                  )
                }
              </AutocompleteItemText>
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Filter and Keywords`,text:'The default filter matches text anywhere in a suggestion. Use `"startsWith"` or `"fuzzy"` for a different match, a function for your own filter, or `false` for results already filtered by a server. `keywords` adds searchable text without changing what goes in the field.',examples:[{id:`autocomplete/filter`,caption:`Type “bug” to find fix through its keywords. Type “re” to find labels or keywords that start with those letters.`,Example:G,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const tags = [
  { value: "feature", label: "feature", keywords: ["enhancement", "request"] },
  { value: "fix", label: "fix", keywords: ["bug", "patch"] },
  { value: "docs", label: "docs", keywords: ["documentation", "readme"] },
  { value: "performance", label: "performance", keywords: ["speed", "slow"] },
  { value: "security", label: "security", keywords: ["vulnerability"] },
  { value: "refactor", label: "refactor", keywords: ["cleanup"] },
]

function Example() {
  return (
    <Autocomplete filter="startsWith">
      <div data-slot="stack">
        <AutocompleteLabel>Tag</AutocompleteLabel>
        <AutocompleteInput placeholder="Try “bug”" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
        <AutocompleteList>
          {tags.map((tag) => (
            <AutocompleteItem
              key={tag.value}
              value={tag.value}
              label={tag.label}
              keywords={tag.keywords}
            >
              {tag.label}
              <span data-slot="hint">{tag.keywords[0]}</span>
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Groups`,text:"Use `AutocompleteGroup` and `AutocompleteGroupLabel` to name related suggestions. Filtering hides empty groups and separators.",examples:[{id:`autocomplete/groups`,caption:`Type “an”. Banana and Mango remain in Tropical; groups with no matches disappear.`,Example:q,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
} from "@ui-sdk/react/autocomplete"
import * as React from "react"

const fruitGroups = [
  {
    label: "Tree fruits",
    items: ["Apple", "Apricot", "Cherry", "Lemon", "Peach", "Pear"],
  },
  {
    label: "Berries",
    items: ["Blackberry", "Blueberry", "Grape", "Strawberry"],
  },
  { label: "Tropical", items: ["Avocado", "Banana", "Mango", "Pineapple"] },
]

function Example() {
  return (
    <Autocomplete>
      <div data-slot="stack">
        <AutocompleteLabel>Fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. Pear" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruitGroups.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <AutocompleteSeparator />}
              <AutocompleteGroup>
                <AutocompleteGroupLabel>{group.label}</AutocompleteGroupLabel>
                {group.items.map((fruit) => (
                  <AutocompleteItem key={fruit} value={fruit}>
                    {fruit}
                  </AutocompleteItem>
                ))}
              </AutocompleteGroup>
            </React.Fragment>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Icons`,text:"`AutocompleteItemIcon` keeps decorative icons out of accessible names, filtering, and the text put in the field. Add `mirror` for directional icons. An icon-only suggestion still needs an `aria-label`.",examples:[{id:`autocomplete/icons`,caption:`Type “rep” and choose Replies. The icon stays out of the text put in the field.`,Example:re,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIcon,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"
import {
  ArchiveIcon,
  ClockIcon,
  FileIcon,
  PencilIcon,
  ReplyIcon,
  StarIcon,
} from "lucide-react"

const mailSearches = [
  { value: "Starred", icon: StarIcon },
  { value: "Drafts", icon: PencilIcon },
  { value: "Replies", icon: ReplyIcon, mirror: true },
  { value: "Attachments", icon: FileIcon },
  { value: "Archived", icon: ArchiveIcon },
  { value: "Scheduled", icon: ClockIcon },
]

function Example() {
  return (
    <Autocomplete>
      <AutocompleteInput
        type="search"
        aria-label="Search mail"
        placeholder="Search mail…"
      />
      <AutocompleteContent>
        <AutocompleteEmpty>No searches found.</AutocompleteEmpty>
        <AutocompleteList>
          {mailSearches.map((search) => (
            <AutocompleteItem key={search.value} value={search.value}>
              <AutocompleteItemIcon mirror={search.mirror}>
                <search.icon />
              </AutocompleteItemIcon>
              {search.value}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Items as Data`,text:`Map an array into parts when you want to write the markup yourself. This example maps fruit groups and adds a separator between them.`,examples:[{id:`autocomplete/data`,caption:`Open the list to see three fruit groups. Type “an” to narrow them to Banana and Mango.`,Example:X,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
} from "@ui-sdk/react/autocomplete"
import * as React from "react"

const fruitGroups = [
  {
    label: "Tree fruits",
    fruits: ["Apple", "Apricot", "Cherry", "Lemon", "Peach", "Pear"],
  },
  {
    label: "Berries",
    fruits: ["Blackberry", "Blueberry", "Grape", "Strawberry"],
  },
  { label: "Tropical", fruits: ["Avocado", "Banana", "Mango", "Pineapple"] },
]

function Example() {
  return (
    <Autocomplete>
      <div data-slot="stack">
        <AutocompleteLabel>Fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. Peach" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruitGroups.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <AutocompleteSeparator />}
              <AutocompleteGroup>
                <AutocompleteGroupLabel>{group.label}</AutocompleteGroupLabel>
                {group.fruits.map((fruit) => (
                  <AutocompleteItem key={fruit} value={fruit}>
                    {fruit}
                  </AutocompleteItem>
                ))}
              </AutocompleteGroup>
            </React.Fragment>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"The value is always a string. Control it with `value` and `onValueChange`, or start uncontrolled with `defaultValue`. Suggestions have a separate `open` state and `onOpenChange`. Callbacks receive the proposed value first, then change details. Call `details.cancel()` to reject a text or open change. When a suggestion is chosen, `details.item` holds its `value` and `label`, so suggestions that share a label can still be told apart. State and Events covers controlled state and cancellation.",examples:[{id:`autocomplete/controlled`,caption:`Type more than 12 characters and the extra text is refused. The console shows each change and its reason.`,Example:ae,source:`import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

export function Example() {
  const [value, setValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const log = useLog()
  return (
    <div data-slot="stack">
      <Autocomplete
        value={value}
        onValueChange={(next, details) => {
          if (next.length > 12) {
            return details.cancel()
          }
          setValue(next)
          log(\`text: \${details.reason}\`)
        }}
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          log(\`\${next ? "opened" : "closed"}: \${details.reason}\`)
        }}
        onOpenChangeComplete={(next) =>
          log(\`\${next ? "opened" : "closed"} and settled\`)
        }
        onHighlight={(highlighted) =>
          highlighted && log(\`highlighted \${highlighted}\`)
        }
        debug
      >
        <AutocompleteLabel>Fruit (12 characters at most)</AutocompleteLabel>
        <AutocompleteInput />
        <AutocompleteContent>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {fruits.map((fruit) => (
              <AutocompleteItem key={fruit} value={fruit}>
                {fruit}
              </AutocompleteItem>
            ))}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
`}]},{heading:`Controller`,text:"Create a `createAutocompleteController()` for one instance and pass it as `controller`. It can `setValue()`, `clear()`, `focus()`, `setOpen()`, or read `getValue()` and `isOpen()`. `open()` returns a promise that resolves when the popup closes, including abort and unmount; `close()` closes it. See Controllers for lifecycle and change options.",examples:[{id:`autocomplete/controller`,caption:`Use the buttons to open the suggestions, type Pea, clear the field or focus it from outside.`,Example:se,source:`import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  createAutocompleteController,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

const fruit = createAutocompleteController()

export function Example() {
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-size="sm" onClick={() => fruit.open()}>
          Open
        </button>
        <button
          type="button"
          data-size="sm"
          onClick={() => fruit.setValue("Pea")}
        >
          Type “Pea”
        </button>
        <button type="button" data-size="sm" onClick={() => fruit.clear()}>
          Clear
        </button>
        <button type="button" data-size="sm" onClick={() => fruit.focus()}>
          Focus
        </button>
      </div>
      <Autocomplete controller={fruit}>
        <AutocompleteLabel>Fruit</AutocompleteLabel>
        <AutocompleteInput />
        <AutocompleteContent>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {fruits.map((item) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            ))}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
`}]},{heading:`Positioning`,text:"Use `side`, `align`, offsets, or a custom `anchor` to position the suggestions. `container` chooses where they render, and `keepMounted` keeps closed content in the DOM. Popups covers positioning, portals, animation, and modal behavior.",examples:[{id:`autocomplete/positioning`,caption:`Open the suggestions. They appear above the card, aligned to its end.`,Example:le,source:`import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"
import * as React from "react"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
]

export function Example() {
  const [box, setBox] = React.useState<HTMLElement | null>(null)
  return (
    <div ref={setBox} data-slot="card">
      <Autocomplete modal="pointer" container={box}>
        <div data-slot="stack">
          <AutocompleteLabel>Fruit</AutocompleteLabel>
          <AutocompleteInput />
        </div>
        <AutocompleteContent
          side="top"
          align="end"
          sideOffset={10}
          alignOffset={-4}
          collisionPadding={8}
          anchor={box}
          keepMounted
        >
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {fruits.map((fruit) => (
              <AutocompleteItem key={fruit} value={fruit}>
                {fruit}
              </AutocompleteItem>
            ))}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
`}]},{heading:`Animation`,text:"The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popup stays mounted until the exit finishes:",examples:[{id:`autocomplete/animation`,caption:`Type to open the suggestions. They slide and fade in, and fade out before they unmount.`,Example:de,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <Autocomplete>
      <div data-slot="stack">
        <AutocompleteLabel>Favorite fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. Mango" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruits.map((fruit) => (
            <AutocompleteItem key={fruit} value={fruit}>
              {fruit}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Presentation`,text:'`presentation="sheet"` opens suggestions in a sheet. `"auto"` chooses a sheet on small touch screens and a popover elsewhere, each time the list opens. The server starts with the popover.',examples:[{id:`autocomplete/presentation`,caption:`Open the field to see a sheet. On touch, tap the field in its header to show the keyboard, or swipe down to close it.`,Example:pe,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  return (
    <Autocomplete presentation="sheet">
      <div data-slot="stack">
        <AutocompleteLabel>Favorite fruit</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. Mango" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
        <AutocompleteList>
          {fruits.map((fruit) => (
            <AutocompleteItem key={fruit} value={fruit}>
              {fruit}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Forms`,text:"The native input is the form control: `name` gives its submitted key, `required` rejects empty text, and reset restores `defaultValue`. Text does not have to match a suggestion. Use `form` to associate the field with a form elsewhere in the page.",examples:[{id:`autocomplete/form`,caption:`Submit Apple, then choose Mango. Choosing it fills the field without submitting. Reset restores Apple.`,Example:he,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { useLog } from "../../../shared/react/log"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function Example() {
  const log = useLog()
  return (
    <form
      id="order"
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const data = [...new FormData(event.currentTarget)].map(
          ([name, value]) => \`\${name}=\${value}\`
        )
        log(\`Submitted \${data.join("&")}\`)
      }}
    >
      <Field>
        <FieldLabel>Fruit</FieldLabel>
        <Autocomplete name="fruit" form="order" required defaultValue="Apple">
          <AutocompleteInput />
          <AutocompleteContent>
            <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
            <AutocompleteList>
              {fruits.map((fruit) => (
                <AutocompleteItem key={fruit} value={fruit}>
                  {fruit}
                </AutocompleteItem>
              ))}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
        <FieldDescription>Any fruit, listed or not.</FieldDescription>
        <div>
          <FieldError />
        </div>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Submit
        </button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`Search`,text:"Enter with no suggestion highlighted runs the `onSubmit` callback with the text, then allows the surrounding form to submit. Call `preventDefault()` on `details.event` if your handler already performs the search.",examples:[{id:`autocomplete/search`,caption:`Type “kotlin” and press Enter to search. Choose a suggestion to search for that text instead.`,Example:_e,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"
import { useLog } from "../../../shared/react/log"

const recent = ["react hooks", "tailwind grid", "web components", "vue v-model"]

function Example() {
  const log = useLog()
  return (
    <form
      role="search"
      data-slot="stack"
      onSubmit={(event) => event.preventDefault()}
    >
      <Autocomplete
        submitOnSelect
        name="q"
        onSubmit={(value) => log(\`Searched “\${value}”\`)}
      >
        <AutocompleteInput
          type="search"
          aria-label="Search"
          placeholder="Search…"
        />
        <AutocompleteContent>
          <AutocompleteEmpty>No results.</AutocompleteEmpty>
          <AutocompleteList>
            {recent.map((search) => (
              <AutocompleteItem key={search} value={search}>
                {search}
              </AutocompleteItem>
            ))}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </form>
  )
}

export { Example }
`}]},{heading:`Recent Searches`,text:"Pair `emptyItems` with `items` to show one collection while the field is empty and search the full collection once someone types. Add `openOnFocus` to show the recent searches on focus.",examples:[{id:`autocomplete/recent`,caption:`Focus the empty field to see Recent searches. Type “react” to search all topics, then clear the text to return to recent searches.`,Example:be,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemText,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const recent = ["react hooks", "tailwind grid", "web components", "vue v-model"]
const topics = [
  ...recent,
  "react server components",
  "tailwind colors",
  "vue router",
]
const recentSearches = [
  { type: "group" as const, label: "Recent searches", items: recent },
]

function Example() {
  return (
    <Autocomplete
      items={topics}
      emptyItems={recentSearches}
      openOnFocus
      announcement={(change) =>
        change.type === "results"
          ? \`\${change.count} \${change.count === 1 ? "topic" : "topics"}\`
          : null
      }
    >
      <AutocompleteInput
        type="search"
        aria-label="Search docs"
        placeholder="Search docs…"
      />
      <AutocompleteContent>
        <AutocompleteEmpty>No topics found.</AutocompleteEmpty>
        <AutocompleteList>
          {(state) =>
            (state.items as (string | (typeof recentSearches)[number])[]).map(
              (entry) =>
                typeof entry === "string" ? (
                  <AutocompleteItem key={entry} value={entry}>
                    <AutocompleteItemText />
                  </AutocompleteItem>
                ) : (
                  <AutocompleteGroup key={entry.label}>
                    <AutocompleteGroupLabel>
                      {entry.label}
                    </AutocompleteGroupLabel>
                    {entry.items.map((topic) => (
                      <AutocompleteItem key={topic} value={topic}>
                        <AutocompleteItemText />
                      </AutocompleteItem>
                    ))}
                  </AutocompleteGroup>
                )
            )
          }
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Async Suggestions`,text:"Use async options to wait for typing to pause and discard stale results. Pass its `items` and `status`, set `filter` to `false`, and send text changes to its `setQuery()` method.",examples:[{id:`autocomplete/async`,caption:`Type “b” and wait for the city suggestions. Keep typing to replace the search; the status describes the latest results.`,Example:Se,source:`"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteStatus,
} from "@ui-sdk/react/autocomplete"

function searchCities(query: string, { signal }: { signal: AbortSignal }) {
  const cities = [
    "Amsterdam",
    "Athens",
    "Barcelona",
    "Berlin",
    "Boston",
    "Brussels",
    "Buenos Aires",
    "Cairo",
    "Chicago",
    "Copenhagen",
    "Dublin",
    "Lisbon",
    "London",
    "Los Angeles",
    "Madrid",
    "Paris",
    "Prague",
    "Rome",
    "Seoul",
    "Tokyo",
  ]
  return new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(cities.filter((city) => city.toLowerCase().startsWith(needle)))
    }, 300)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

function Example() {
  const results = useAsyncOptions(searchCities, { debounce: 200 })

  return (
    <Autocomplete
      items={results.items}
      filter={false}
      status={results.status}
      onValueChange={(value) => results.setQuery(value)}
      onLoadMore={results.loadMore}
    >
      <div data-slot="stack">
        <AutocompleteLabel>City</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. Paris" />
      </div>
      <AutocompleteContent>
        <AutocompleteStatus>
          {(state) =>
            state.loading
              ? "Searching…"
              : state.count
                ? \`\${state.count} \${state.count === 1 ? "city" : "cities"}\`
                : ""
          }
        </AutocompleteStatus>
        <AutocompleteEmpty>
          {(state) =>
            state.empty && !state.loading
              ? \`No cities start with “\${state.query}”.\`
              : null
          }
        </AutocompleteEmpty>
        <AutocompleteList>
          {(state) =>
            (state.items as string[]).map((city) => (
              <AutocompleteItem key={city} value={city}>
                {city}
              </AutocompleteItem>
            ))
          }
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Use `render` to give a suggestion a different element. Here each suggestion is a link, so the autocomplete works as a jump-to menu: Enter or a click follows the highlighted link, and the text after the title is a hint that doesn't affect filtering. Parts and Composition covers the render API.",examples:[{id:`autocomplete/custom-rendering`,caption:`Type “sty” and press Enter to jump to the Styling section of this page.`,Example:$,source:`"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const pages = [
  { title: "Installation", section: "Get Started", href: "#installation" },
  { title: "Composition", section: "Concepts", href: "#composition" },
  { title: "Build Your Own", section: "Concepts", href: "#build-your-own" },
  { title: "Styling", section: "Guides", href: "#styling" },
  { title: "API Reference", section: "Reference", href: "#api-reference" },
  { title: "Accessibility", section: "Reference", href: "#accessibility" },
]

function Example() {
  return (
    <Autocomplete>
      <div data-slot="stack">
        <AutocompleteLabel>Jump to</AutocompleteLabel>
        <AutocompleteInput placeholder="e.g. Styling" />
      </div>
      <AutocompleteContent>
        <AutocompleteEmpty>No sections found.</AutocompleteEmpty>
        <AutocompleteList>
          {pages.map((page) => (
            <AutocompleteItem
              key={page.href}
              value={page.title}
              label={page.title}
              render={<a href={page.href} />}
            >
              {page.title}
              <span data-slot="hint">{page.section}</span>
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`autocomplete/rtl`,caption:``,Example:Te,source:`import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete"

const cities = ["القاهرة", "القدس", "الرباط", "الرياض", "بيروت", "دبي", "عمّان"]

export function Example() {
  return (
    <div dir="rtl">
      <Autocomplete inlineComplete>
        <div data-slot="stack">
          <AutocompleteLabel>المدينة</AutocompleteLabel>
          <AutocompleteInput placeholder="مثلاً: دبي" />
        </div>
        <AutocompleteContent>
          <AutocompleteList>
            {cities.map((city) => (
              <AutocompleteItem key={city} value={city}>
                {city}
              </AutocompleteItem>
            ))}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
`}]}]};export{Ee as default};