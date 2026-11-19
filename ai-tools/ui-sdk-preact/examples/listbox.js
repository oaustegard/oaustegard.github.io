import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-CCOgxx-k.js";import{t as n}from"../chunks/c-DWFCfNnK.js";import{t as r}from"../chunks/c-WfjOen3K.js";import{t as i}from"../chunks/c-BnWal148.js";import{t as a}from"../chunks/c-DLR1Qq0Q.js";import{t as o}from"../chunks/c-BfTRFW97.js";import{t as s}from"../chunks/c-C1ErRzDB.js";import{useLog as c}from"./log.js";import*as l from"preact/compat";import{Fragment as u,jsx as d,jsxs as f}from"preact/compat/jsx-runtime";import{Field as p,FieldDescription as m,FieldLabel as h}from"ui-sdk/field.js";import{Listbox as g,ListboxGroup as _,ListboxGroupLabel as v,ListboxItem as y,ListboxItemIcon as b,ListboxItemIndicator as x,ListboxSeparator as S,createListboxController as C}from"ui-sdk/listbox.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const w={name:`external-link`,size:24,node:[[`path`,{d:`M15 3h6v6`,key:`1q9fwt`}],[`path`,{d:`M10 14 21 3`,key:`gplh6r`}],[`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`,key:`a6xqqp`}]]};w.node;const T=e(w),E=[{value:`comments`,label:`Comments`},{value:`mentions`,label:`Mentions`},{value:`reactions`,label:`Reactions`},{value:`sign-ins`,label:`New sign-ins`},{value:`billing`,label:`Billing`}];function D(){return/* @__PURE__ */ f(p,{children:[/* @__PURE__ */ d(h,{children:`Email me about`}),/* @__PURE__ */ d(g,{multiple:!0,activation:`automatic`,defaultValue:[`mentions`],children:E.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))}),/* @__PURE__ */ d(m,{children:`Hold Shift to select a range, or Ctrl or ⌘ to add one.`})]})}const O=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function k(){let e=c();return/* @__PURE__ */ d(g,{multiple:!0,defaultValue:[`cheese`,`onion`],onValueChange:(t,n)=>e(`${t.join(`, `)||`Nothing`} (${n.reason})`),"aria-label":`Toppings`,children:O.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})}const A=[{value:`readme`,label:`README.md`},{value:`package`,label:`package.json`},{value:`tsconfig`,label:`tsconfig.json`},{value:`index`,label:`index.ts`},{value:`styles`,label:`styles.css`},{value:`logo`,label:`logo.svg`}];function j(){let e=c();return/* @__PURE__ */ d(g,{multiple:!0,activation:`automatic`,defaultValue:[`readme`],onValueChange:(t,n)=>e(`${t.length} selected (${n.reason})`),"aria-label":`Files`,children:A.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[/* @__PURE__ */ d(b,{children:/* @__PURE__ */ d(i,{"aria-hidden":`true`})}),e.label]},e.value))})}const M=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function N(){let e=c();return/* @__PURE__ */ d(g,{activation:`manual`,onValueChange:(t,n)=>e(`${t??`Nothing`} (${n.reason})`),"aria-label":`Framework`,children:M.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})}const P=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function F(){let e=c();return/* @__PURE__ */ d(g,{activation:`manual`,virtualFocus:!0,onValueChange:(t,n)=>e(`${t??`Nothing`} (${n.reason})`),"aria-label":`Framework`,children:P.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})}const ee=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function I(){let e=c();return/* @__PURE__ */ d(g,{deselectable:!0,defaultValue:`astro`,onValueChange:(t,n)=>e(`${t??`Nothing`} (${n.reason})`),"aria-label":`Framework`,children:ee.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})}const L=[{label:`Fruits`,items:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`orange`,label:`Orange`}]},{label:`Vegetables`,items:[{value:`carrot`,label:`Carrot`},{value:`broccoli`,label:`Broccoli`},{value:`spinach`,label:`Spinach`}]}];function R(){return/* @__PURE__ */ d(g,{multiple:!0,defaultValue:[`banana`],"aria-label":`Produce`,children:L.map((e,t)=>/* @__PURE__ */ f(l.Fragment,{children:[t>0&&/* @__PURE__ */ d(S,{}),/* @__PURE__ */ f(_,{children:[/* @__PURE__ */ d(v,{children:e.label}),e.items.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))]})]},e.label))})}const z=[{value:`inbox`,label:`Inbox`,icon:a},{value:`starred`,label:`Starred`,icon:s},{value:`drafts`,label:`Drafts`,icon:o},{value:`archive`,label:`Archive`,icon:t},{value:`next`,label:`Next page`,icon:n}];function B(){return/* @__PURE__ */ d(g,{defaultValue:`inbox`,"aria-label":`Mailbox`,children:z.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[/* @__PURE__ */ d(b,{mirror:e.icon===n,children:/* @__PURE__ */ d(e.icon,{})}),e.label]},e.value))})}const V=[{value:`xs`,label:`XS`},{value:`s`,label:`S`},{value:`m`,label:`M`},{value:`l`,label:`L`},{value:`xl`,label:`XL`,disabled:!0}];function H(){return/* @__PURE__ */ d(g,{orientation:`horizontal`,loop:!1,defaultValue:`m`,"aria-label":`Size`,children:V.map(e=>/* @__PURE__ */ d(y,{value:e.value,disabled:e.disabled,children:e.label},e.value))})}const U=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function W(){let[e,t]=l.useState(!1);return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ d(`button`,{type:`button`,onClick:()=>t(!e),children:e?`Enable the List`:`Disable the List`})}),/* @__PURE__ */ d(g,{multiple:!0,disabled:e,defaultValue:[`basil`],"aria-label":`Toppings`,children:U.map(e=>/* @__PURE__ */ f(y,{value:e.value,disabled:e.value===`olive`,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})]})}const G=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function K(){return/* @__PURE__ */ d(g,{readOnly:!0,defaultValue:`nuxt`,"aria-label":`Framework`,children:G.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})}const q=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function J(){let e=c();return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(g,{multiple:!0,name:`toppings`,form:`pizza-order`,required:!0,defaultValue:[`cheese`],"aria-label":`Toppings`,children:q.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))}),/* @__PURE__ */ f(`form`,{id:`pizza-order`,"data-slot":`row`,onSubmit:t=>{t.preventDefault(),e(`Ordered ${new FormData(t.currentTarget).getAll(`toppings`).join(`, `)}`)},children:[/* @__PURE__ */ d(`button`,{type:`reset`,children:`Reset`}),/* @__PURE__ */ d(`button`,{"data-variant":`solid`,children:`Order`})]})]})}const Y=[{value:{id:`hobby`,price:0},label:`Hobby`},{value:{id:`pro`,price:20},label:`Pro`},{value:{id:`team`,price:50},label:`Team`},{value:{id:`enterprise`,price:200},label:`Enterprise`,disabled:!0}];function X(){let e=c();return/* @__PURE__ */ d(g,{items:Y,defaultValue:Y[1].value,onValueChange:t=>e(t?`${t.id}, $${t.price} a month`:`No plan`),itemToValue:e=>e.id,isItemEqualToValue:(e,t)=>e.id===t.id,"aria-label":`Plan`,children:Y.map(e=>/* @__PURE__ */ f(y,{value:e.value,disabled:e.disabled,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value.id))})}const Z=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function Q(){let e=c(),[t]=l.useState(()=>C());return/* @__PURE__ */ f(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ f(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ d(`button`,{type:`button`,onClick:()=>t.selectAll(),children:`Select All`}),/* @__PURE__ */ d(`button`,{type:`button`,onClick:()=>t.clear(),children:`Clear`}),/* @__PURE__ */ d(`button`,{type:`button`,onClick:()=>t.focus(),children:`Focus`})]}),/* @__PURE__ */ d(g,{multiple:!0,controller:t,onValueChange:(t,n)=>e(`${t.length} selected (${n.reason})`),"aria-label":`Toppings`,children:Z.map(e=>/* @__PURE__ */ f(y,{value:e.value,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})]})}const $=Array.from({length:27},(e,t)=>{let n=t-12,r=`UTC${n<0?`−`:`+`}${String(Math.abs(n)).padStart(2,`0`)}:00`;return{value:`utc${n}`,label:r}});function te(){let e=c();return/* @__PURE__ */ d(g,{defaultValue:`utc9`,onHighlight:(t,n)=>t&&e(`Focused ${$[n.index].label} (${n.index+1} of ${$.length})`),"aria-label":`Time zone`,children:$.map((e,t)=>/* @__PURE__ */ f(y,{value:e.value,index:t,children:[e.label,/* @__PURE__ */ d(x,{children:/* @__PURE__ */ d(r,{"aria-hidden":`true`})})]},e.value))})}const ne=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function re(){return/* @__PURE__ */ d(g,{defaultValue:`next`,activation:`manual`,"aria-label":`Framework docs`,children:ne.map(e=>/* @__PURE__ */ d(y,{value:e.value,label:e.label,render:/* @__PURE__ */ d(`a`,{href:`#${e.value}`}),children:t=>/* @__PURE__ */ f(u,{children:[/* @__PURE__ */ d(`span`,{children:e.label}),t.selected&&/* @__PURE__ */ d(T,{"aria-hidden":`true`})]})},e.value))})}const ie=[{value:`day`,label:`יום`},{value:`week`,label:`שבוע`},{value:`month`,label:`חודש`}];function ae(){return/* @__PURE__ */ d(`div`,{dir:`rtl`,children:/* @__PURE__ */ d(g,{orientation:`horizontal`,defaultValue:`day`,"aria-label":`תצוגה`,children:ie.map(e=>/* @__PURE__ */ d(y,{value:e.value,children:e.label},e.value))})})}var oe={name:`listbox`,title:`Listbox`,description:`Choose one or several options from an always-visible list.`,sections:[{heading:null,text:`Use a Listbox when the choices should stay in view. It works like a native select with several visible rows, with keyboard navigation, typeahead, and optional range selection.`,examples:[{id:`listbox/basic`,caption:`Choose Comments, then hold Shift and choose New sign-ins to select the range. A click replaces the selection; Ctrl or ⌘ adds one option.`,Example:D,source:`"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"

const topics = [
  { value: "comments", label: "Comments" },
  { value: "mentions", label: "Mentions" },
  { value: "reactions", label: "Reactions" },
  { value: "sign-ins", label: "New sign-ins" },
  { value: "billing", label: "Billing" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Email me about</FieldLabel>
      <Listbox multiple activation="automatic" defaultValue={["mentions"]}>
        {topics.map((topic) => (
          <ListboxItem key={topic.value} value={topic.value}>
            {topic.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
      <FieldDescription>
        Hold Shift to select a range, or Ctrl or ⌘ to add one.
      </FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Multiple`,text:"Add `multiple` to select several options. The value becomes an array; a single list uses one value or `null`. By default, arrow keys move focus without changing a multiple selection.",examples:[{id:`listbox/multiple`,caption:`Choose Basil, then hold Shift and choose Pepper to select a range. Use Ctrl+A or ⌘A to select every option, then again to clear. The console logs each change.`,Example:k,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      multiple
      defaultValue={["cheese", "onion"]}
      onValueChange={(value, details) =>
        log(\`\${value.join(", ") || "Nothing"} (\${details.reason})\`)
      }
      aria-label="Toppings"
    >
      {toppings.map((topping) => (
        <ListboxItem key={topping.value} value={topping.value}>
          {topping.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Selection That Follows Focus`,text:'A single list selects as arrow keys, Page Up and Page Down, Home, End, or typing move focus. Page Up and Page Down move ten options, and stop at the ends. A multiple list can do the same with `activation="automatic"`, like a file list: a press or arrow replaces the selection, Ctrl or Cmd adds to it, and Ctrl or Cmd with an arrow moves focus without selecting.',examples:[{id:`listbox/activation`,caption:`Choose index.ts to replace the selection. Hold Ctrl or Cmd while choosing another file to add it; Shift selects a range.`,Example:j,source:`"use client"

import { Listbox, ListboxItem, ListboxItemIcon } from "@ui-sdk/react/listbox"
import { FileIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const files = [
  { value: "readme", label: "README.md" },
  { value: "package", label: "package.json" },
  { value: "tsconfig", label: "tsconfig.json" },
  { value: "index", label: "index.ts" },
  { value: "styles", label: "styles.css" },
  { value: "logo", label: "logo.svg" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      multiple
      activation="automatic"
      defaultValue={["readme"]}
      onValueChange={(value, details) =>
        log(\`\${value.length} selected (\${details.reason})\`)
      }
      aria-label="Files"
    >
      {files.map((file) => (
        <ListboxItem key={file.value} value={file.value}>
          <ListboxItemIcon>
            <FileIcon aria-hidden="true" />
          </ListboxItemIcon>
          {file.label}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Manual Activation`,text:'Set `activation="manual"` on a single list to browse without selecting. Space, Enter, or a press chooses the focused option.',examples:[{id:`listbox/manual`,caption:`Move through the options with the arrow keys. Nothing is selected until you press Space or Enter, and the console logs the choice.`,Example:N,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      activation="manual"
      onValueChange={(value, details) =>
        log(\`\${value ?? "Nothing"} (\${details.reason})\`)
      }
      aria-label="Framework"
    >
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Focus on the List`,text:"Set `virtualFocus` to keep focus on the list itself while arrow keys, Home, End, and typing move a highlight through the options. The list points at the highlighted option with `aria-activedescendant`, so screen readers still announce it. Style the highlight with `[data-highlighted]`, since the options don't take focus.",examples:[{id:`listbox/virtual-focus`,caption:`Tab into the list and move through it with the arrow keys. Focus stays on the list, and Space or Enter chooses the highlighted option.`,Example:F,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      activation="manual"
      virtualFocus
      onValueChange={(value, details) =>
        log(\`\${value ?? "Nothing"} (\${details.reason})\`)
      }
      aria-label="Framework"
    >
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Deselectable`,text:"Add `deselectable` to let pressing the selected option clear a single selection. Without it, the selection stays as it is.",examples:[{id:`listbox/deselectable`,caption:`Press Astro again to clear the selection, or choose another framework. The console logs each change.`,Example:I,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      deselectable
      defaultValue="astro"
      onValueChange={(value, details) =>
        log(\`\${value ?? "Nothing"} (\${details.reason})\`)
      }
      aria-label="Framework"
    >
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Groups`,text:"Use `ListboxGroup` and `ListboxGroupLabel` to name a group. Arrow keys and ranges continue across groups. Separators stay out of the accessibility tree.",examples:[{id:`listbox/groups`,caption:`Move from Apple through the list with Down Arrow. Navigation continues into the Vegetables group.`,Example:R,source:`"use client"

import {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
  ListboxSeparator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const produce = [
  {
    label: "Fruits",
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "orange", label: "Orange" },
    ],
  },
  {
    label: "Vegetables",
    items: [
      { value: "carrot", label: "Carrot" },
      { value: "broccoli", label: "Broccoli" },
      { value: "spinach", label: "Spinach" },
    ],
  },
]

function Example() {
  return (
    <Listbox multiple defaultValue={["banana"]} aria-label="Produce">
      {produce.map((group, index) => (
        <React.Fragment key={group.label}>
          {index > 0 && <ListboxSeparator />}
          <ListboxGroup>
            <ListboxGroupLabel>{group.label}</ListboxGroupLabel>
            {group.items.map((item) => (
              <ListboxItem key={item.value} value={item.value}>
                {item.label}
                <ListboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ListboxItemIndicator>
              </ListboxItem>
            ))}
          </ListboxGroup>
        </React.Fragment>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Icons`,text:"Wrap an icon in `ListboxItemIcon` so screen readers and typeahead skip it. Add `mirror` to a directional icon to flip it in right-to-left text.",examples:[{id:`listbox/icons`,caption:`Choose Drafts. The icon stays out of the option’s accessible name and the text used for typeahead.`,Example:B,source:`"use client"

import { Listbox, ListboxItem, ListboxItemIcon } from "@ui-sdk/react/listbox"
import {
  ArchiveIcon,
  ArrowRightIcon,
  MailIcon,
  PencilIcon,
  StarIcon,
} from "lucide-react"

const views = [
  { value: "inbox", label: "Inbox", icon: MailIcon },
  { value: "starred", label: "Starred", icon: StarIcon },
  { value: "drafts", label: "Drafts", icon: PencilIcon },
  { value: "archive", label: "Archive", icon: ArchiveIcon },
  { value: "next", label: "Next page", icon: ArrowRightIcon },
]

function Example() {
  return (
    <Listbox defaultValue="inbox" aria-label="Mailbox">
      {views.map((view) => (
        <ListboxItem key={view.value} value={view.value}>
          <ListboxItemIcon mirror={view.icon === ArrowRightIcon}>
            <view.icon />
          </ListboxItemIcon>
          {view.label}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Horizontal`,text:'Set `orientation="horizontal"` to move with Left and Right Arrow. Arrow keys normally wrap; set `loop={false}` to stop at the ends, as this example does. Shift ranges never wrap.',examples:[{id:`listbox/horizontal`,caption:`Focus M, then use Left and Right Arrow to choose a size. The list stops at its ends; XL cannot be selected.`,Example:H,source:`"use client"

import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"

const sizes = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL", disabled: true },
]

function Example() {
  return (
    <Listbox
      orientation="horizontal"
      loop={false}
      defaultValue="m"
      aria-label="Size"
    >
      {sizes.map((size) => (
        <ListboxItem
          key={size.value}
          value={size.value}
          disabled={size.disabled}
        >
          {size.label}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:`A disabled option cannot be selected. Arrow keys, typeahead and ranges skip it. Disabling the whole list removes its tab stop, prevents changes, and excludes its value from the form.`,examples:[{id:`listbox/disabled`,caption:`Try choosing Olive. Then press Disable the List to make every option unavailable until you enable it again.`,Example:W,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setDisabled(!disabled)}>
          {disabled ? "Enable the List" : "Disable the List"}
        </button>
      </div>
      <Listbox
        multiple
        disabled={disabled}
        defaultValue={["basil"]}
        aria-label="Toppings"
      >
        {toppings.map((topping) => (
          <ListboxItem
            key={topping.value}
            value={topping.value}
            disabled={topping.value === "olive"}
          >
            {topping.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )
}

export { Example }
`}]},{heading:`Read-Only`,text:"Use `readOnly` when people should be able to browse the list without changing its value. The list remains focusable and its value still submits.",examples:[{id:`listbox/read-only`,caption:`Move focus through the frameworks. Nuxt stays selected because the list is read-only.`,Example:K,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  return (
    <Listbox readOnly defaultValue="nuxt" aria-label="Framework">
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Form`,text:"Add `name` to submit the selection. Multiple selections submit one entry per value. Reset restores `defaultValue`, and `required` prevents submission when nothing is selected.",examples:[{id:`listbox/form`,caption:`Choose Basil and press Order: the console logs both toppings. Reset restores Extra cheese; clearing every option makes the required list block the order.`,Example:J,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <Listbox
        multiple
        name="toppings"
        form="pizza-order"
        required
        defaultValue={["cheese"]}
        aria-label="Toppings"
      >
        {toppings.map((topping) => (
          <ListboxItem key={topping.value} value={topping.value}>
            {topping.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
      <form
        id="pizza-order"
        data-slot="row"
        onSubmit={(event) => {
          event.preventDefault()
          log(
            \`Ordered \${new FormData(event.currentTarget).getAll("toppings").join(", ")}\`
          )
        }}
      >
        <button type="reset">Reset</button>
        <button data-variant="solid">Order</button>
      </form>
    </div>
  )
}

export { Example }
`}]},{heading:`Object Values`,text:"Pass objects as item values when the selection should carry more than an ID. `itemToValue` provides the string used for identity and form submission; `isItemEqualToValue` matches objects that represent the same option but are different instances.",examples:[{id:`listbox/data`,caption:`Choose Team. The console logs the price from the selected object, not from its string ID.`,Example:X,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
  type ListData,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const plans = [
  { value: { id: "hobby", price: 0 }, label: "Hobby" },
  { value: { id: "pro", price: 20 }, label: "Pro" },
  { value: { id: "team", price: 50 }, label: "Team" },
  {
    value: { id: "enterprise", price: 200 },
    label: "Enterprise",
    disabled: true,
  },
] satisfies ListData<{ id: string; price: number }>

function Example() {
  const log = useLog()

  return (
    <Listbox
      items={plans}
      defaultValue={plans[1].value}
      onValueChange={(plan) =>
        log(plan ? \`\${plan.id}, $\${plan.price} a month\` : "No plan")
      }
      itemToValue={(plan) => plan.id}
      isItemEqualToValue={(plan, selected) => plan.id === selected.id}
      aria-label="Plan"
    >
      {plans.map((plan) => (
        <ListboxItem
          key={plan.value.id}
          value={plan.value}
          disabled={plan.disabled}
        >
          {plan.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"A controller can select all options, clear the selection, or focus the list from another control. Create one with `createListboxController()` and pass it as `controller`. Controllers covers setup and lifetime.",examples:[{id:`listbox/controller`,caption:`Press Select All, Clear and Focus. Each button drives the same list through its controller, and the console logs the change.`,Example:Q,source:`"use client"

import {
  createListboxController,
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const log = useLog()
  const [controller] = React.useState(() =>
    createListboxController<string, true>()
  )

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => controller.selectAll()}>
          Select All
        </button>
        <button type="button" onClick={() => controller.clear()}>
          Clear
        </button>
        <button type="button" onClick={() => controller.focus()}>
          Focus
        </button>
      </div>
      <Listbox
        multiple
        controller={controller}
        onValueChange={(value, details) =>
          log(\`\${value.length} selected (\${details.reason})\`)
        }
        aria-label="Toppings"
      >
        {toppings.map((topping) => (
          <ListboxItem key={topping.value} value={topping.value}>
            {topping.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )
}

export { Example }
`}]},{heading:`Scrollable`,text:"Give a long list a maximum height and `overflow-y: auto`. It starts scrolled to the selected option without taking focus. Keyboard navigation reveals the focused option without scrolling the page.",examples:[{id:`listbox/scrollable`,caption:`Focus the list and use the arrow keys. Options scroll into view, and the console logs the focused time zone.`,Example:te,source:`"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const timezones = Array.from({ length: 27 }, (_, index) => {
  const offset = index - 12
  const label = \`UTC\${offset < 0 ? "−" : "+"}\${String(Math.abs(offset)).padStart(2, "0")}:00\`
  return { value: \`utc\${offset}\`, label }
})

function Example() {
  const log = useLog()

  return (
    <Listbox
      defaultValue="utc9"
      onHighlight={(value, details) =>
        value &&
        log(
          \`Focused \${timezones[details.index].label} (\${details.index + 1} of \${timezones.length})\`
        )
      }
      aria-label="Time zone"
    >
      {timezones.map((zone, index) => (
        <ListboxItem key={zone.value} value={zone.value} index={index}>
          {zone.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:`Render an option as a link when choosing it should navigate. A press or Enter follows the link and selects the option. This example uses manual activation so arrow keys only browse.`,examples:[{id:`listbox/render`,caption:`Focus Remix and press Enter, or choose it with the pointer. The option is selected and its link updates the URL hash.`,Example:re,source:`"use client"

import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"
import { ExternalLinkIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  return (
    <Listbox
      defaultValue="next"
      activation="manual"
      aria-label="Framework docs"
    >
      {frameworks.map((framework) => (
        <ListboxItem
          key={framework.value}
          value={framework.value}
          label={framework.label}
          render={<a href={\`#\${framework.value}\`} />}
        >
          {(state) => (
            <>
              <span>{framework.label}</span>
              {state.selected && <ExternalLinkIcon aria-hidden="true" />}
            </>
          )}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`listbox/rtl`,caption:``,Example:ae,source:`import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"

const views = [
  { value: "day", label: "יום" },
  { value: "week", label: "שבוע" },
  { value: "month", label: "חודש" },
]

export function Example() {
  return (
    <div dir="rtl">
      <Listbox orientation="horizontal" defaultValue="day" aria-label="תצוגה">
        {views.map((view) => (
          <ListboxItem key={view.value} value={view.value}>
            {view.label}
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )
}
`}]}]};export{oe as default};