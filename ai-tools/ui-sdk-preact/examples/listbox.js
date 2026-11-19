import{$s as e,Co as t,Cr as n,Er as r,Jo as i,Mo as a,Oo as o,Sr as s,To as c,Tr as l,Ts as u,br as d,fl as f,ks as p,ml as m,ms as h,nc as g,qs as _,ss as v,tl as y,wr as b,xr as x,yr as S}from"../chunks/c-CIXE4Nkk.js";const C=[{value:`comments`,label:`Comments`},{value:`mentions`,label:`Mentions`},{value:`reactions`,label:`Reactions`},{value:`sign-ins`,label:`New sign-ins`},{value:`billing`,label:`Billing`}];function w(){return/* @__PURE__ */ y(t,{children:[/* @__PURE__ */ y(o,{children:`Email me about`}),/* @__PURE__ */ y(S,{multiple:!0,activation:`automatic`,defaultValue:[`mentions`],children:C.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))}),/* @__PURE__ */ y(c,{children:`Hold Shift to select a range, or Ctrl or ⌘ to add one.`})]})}const T=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function E(){let e=a();return/* @__PURE__ */ y(S,{multiple:!0,defaultValue:[`cheese`,`onion`],onValueChange:(t,n)=>e(`${t.join(`, `)||`Nothing`} (${n.reason})`),"aria-label":`Toppings`,children:T.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})}const D=[{value:`readme`,label:`README.md`},{value:`package`,label:`package.json`},{value:`tsconfig`,label:`tsconfig.json`},{value:`index`,label:`index.ts`},{value:`styles`,label:`styles.css`},{value:`logo`,label:`logo.svg`}];function O(){let e=a();return/* @__PURE__ */ y(S,{multiple:!0,activation:`automatic`,defaultValue:[`readme`],onValueChange:(t,n)=>e(`${t.length} selected (${n.reason})`),"aria-label":`Files`,children:D.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[/* @__PURE__ */ y(n,{children:/* @__PURE__ */ y(u,{"aria-hidden":`true`})}),e.label]},e.value))})}const k=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function A(){let e=a();return/* @__PURE__ */ y(S,{activation:`manual`,onValueChange:(t,n)=>e(`${t??`Nothing`} (${n.reason})`),"aria-label":`Framework`,children:k.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})}const j=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function M(){let e=a();return/* @__PURE__ */ y(S,{activation:`manual`,virtualFocus:!0,onValueChange:(t,n)=>e(`${t??`Nothing`} (${n.reason})`),"aria-label":`Framework`,children:j.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})}const N=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function P(){let e=a();return/* @__PURE__ */ y(S,{deselectable:!0,defaultValue:`astro`,onValueChange:(t,n)=>e(`${t??`Nothing`} (${n.reason})`),"aria-label":`Framework`,children:N.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})}const ee=[{label:`Fruits`,items:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`orange`,label:`Orange`}]},{label:`Vegetables`,items:[{value:`carrot`,label:`Carrot`},{value:`broccoli`,label:`Broccoli`},{value:`spinach`,label:`Spinach`}]}];function F(){return/* @__PURE__ */ y(S,{multiple:!0,defaultValue:[`banana`],"aria-label":`Produce`,children:ee.map((e,t)=>/* @__PURE__ */ y(m,{children:[t>0&&/* @__PURE__ */ y(l,{}),/* @__PURE__ */ y(d,{children:[/* @__PURE__ */ y(x,{children:e.label}),e.items.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))]})]},e.label))})}const I=[{value:`inbox`,label:`Inbox`,icon:h},{value:`starred`,label:`Starred`,icon:i},{value:`drafts`,label:`Drafts`,icon:v},{value:`archive`,label:`Archive`,icon:g},{value:`next`,label:`Next page`,icon:e}];function L(){return/* @__PURE__ */ y(S,{defaultValue:`inbox`,"aria-label":`Mailbox`,children:I.map(t=>/* @__PURE__ */ y(s,{value:t.value,children:[/* @__PURE__ */ y(n,{mirror:t.icon===e,children:/* @__PURE__ */ y(t.icon,{})}),t.label]},t.value))})}const R=[{value:`xs`,label:`XS`},{value:`s`,label:`S`},{value:`m`,label:`M`},{value:`l`,label:`L`},{value:`xl`,label:`XL`,disabled:!0}];function z(){return/* @__PURE__ */ y(S,{orientation:`horizontal`,loop:!1,defaultValue:`m`,"aria-label":`Size`,children:R.map(e=>/* @__PURE__ */ y(s,{value:e.value,disabled:e.disabled,children:e.label},e.value))})}const B=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function V(){let[e,t]=f(!1);return/* @__PURE__ */ y(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ y(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ y(`button`,{type:`button`,onClick:()=>t(!e),children:e?`Enable the List`:`Disable the List`})}),/* @__PURE__ */ y(S,{multiple:!0,disabled:e,defaultValue:[`basil`],"aria-label":`Toppings`,children:B.map(e=>/* @__PURE__ */ y(s,{value:e.value,disabled:e.value===`olive`,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})]})}const H=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function U(){return/* @__PURE__ */ y(S,{readOnly:!0,defaultValue:`nuxt`,"aria-label":`Framework`,children:H.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})}const W=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function G(){let e=a();return/* @__PURE__ */ y(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ y(S,{multiple:!0,name:`toppings`,form:`pizza-order`,required:!0,defaultValue:[`cheese`],"aria-label":`Toppings`,children:W.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))}),/* @__PURE__ */ y(`form`,{id:`pizza-order`,"data-slot":`row`,onSubmit:t=>{t.preventDefault(),e(`Ordered ${new FormData(t.currentTarget).getAll(`toppings`).join(`, `)}`)},children:[/* @__PURE__ */ y(`button`,{type:`reset`,children:`Reset`}),/* @__PURE__ */ y(`button`,{"data-variant":`solid`,children:`Order`})]})]})}const K=[{value:{id:`hobby`,price:0},label:`Hobby`},{value:{id:`pro`,price:20},label:`Pro`},{value:{id:`team`,price:50},label:`Team`},{value:{id:`enterprise`,price:200},label:`Enterprise`,disabled:!0}];function q(){let e=a();return/* @__PURE__ */ y(S,{items:K,defaultValue:K[1].value,onValueChange:t=>e(t?`${t.id}, $${t.price} a month`:`No plan`),itemToValue:e=>e.id,isItemEqualToValue:(e,t)=>e.id===t.id,"aria-label":`Plan`,children:K.map(e=>/* @__PURE__ */ y(s,{value:e.value,disabled:e.disabled,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value.id))})}const J=[{value:`basil`,label:`Basil`},{value:`cheese`,label:`Extra cheese`},{value:`mushroom`,label:`Mushroom`},{value:`olive`,label:`Olive`},{value:`onion`,label:`Onion`},{value:`pepper`,label:`Pepper`}];function Y(){let e=a(),[t]=f(()=>r());return/* @__PURE__ */ y(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ y(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ y(`button`,{type:`button`,onClick:()=>t.selectAll(),children:`Select All`}),/* @__PURE__ */ y(`button`,{type:`button`,onClick:()=>t.clear(),children:`Clear`}),/* @__PURE__ */ y(`button`,{type:`button`,onClick:()=>t.focus(),children:`Focus`})]}),/* @__PURE__ */ y(S,{multiple:!0,controller:t,onValueChange:(t,n)=>e(`${t.length} selected (${n.reason})`),"aria-label":`Toppings`,children:J.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})]})}const X=Array.from({length:27},(e,t)=>{let n=t-12,r=`UTC${n<0?`−`:`+`}${String(Math.abs(n)).padStart(2,`0`)}:00`;return{value:`utc${n}`,label:r}});function Z(){let e=a();return/* @__PURE__ */ y(S,{defaultValue:`utc9`,onHighlight:(t,n)=>t&&e(`Focused ${X[n.index].label} (${n.index+1} of ${X.length})`),"aria-label":`Time zone`,children:X.map((e,t)=>/* @__PURE__ */ y(s,{value:e.value,index:t,children:[e.label,/* @__PURE__ */ y(b,{children:/* @__PURE__ */ y(_,{"aria-hidden":`true`})})]},e.value))})}const Q=[{value:`next`,label:`Next.js`},{value:`remix`,label:`Remix`},{value:`astro`,label:`Astro`},{value:`nuxt`,label:`Nuxt`},{value:`sveltekit`,label:`SvelteKit`}];function $(){return/* @__PURE__ */ y(S,{defaultValue:`next`,activation:`manual`,"aria-label":`Framework docs`,children:Q.map(e=>/* @__PURE__ */ y(s,{value:e.value,label:e.label,render:/* @__PURE__ */ y(`a`,{href:`#${e.value}`}),children:t=>/* @__PURE__ */ y(m,{children:[/* @__PURE__ */ y(`span`,{children:e.label}),t.selected&&/* @__PURE__ */ y(p,{"aria-hidden":`true`})]})},e.value))})}const te=[{value:`day`,label:`יום`},{value:`week`,label:`שבוע`},{value:`month`,label:`חודש`}];function ne(){return/* @__PURE__ */ y(`div`,{dir:`rtl`,children:/* @__PURE__ */ y(S,{orientation:`horizontal`,defaultValue:`day`,"aria-label":`תצוגה`,children:te.map(e=>/* @__PURE__ */ y(s,{value:e.value,children:e.label},e.value))})})}var re={name:`listbox`,title:`Listbox`,description:`Choose one or several options from an always-visible list.`,sections:[{heading:null,text:`Use a Listbox when the choices should stay in view. It works like a native select with several visible rows, with keyboard navigation, typeahead, and optional range selection.`,examples:[{id:`listbox/basic`,caption:`Choose Comments, then hold Shift and choose New sign-ins to select the range. A click replaces the selection; Ctrl or ⌘ adds one option.`,Example:w,source:`"use client"

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
`}]},{heading:`Multiple`,text:"Add `multiple` to select several options. The value becomes an array; a single list uses one value or `null`. By default, arrow keys move focus without changing a multiple selection.",examples:[{id:`listbox/multiple`,caption:`Choose Basil, then hold Shift and choose Pepper to select a range. Use Ctrl+A or ⌘A to select every option, then again to clear. The console logs each change.`,Example:E,source:`"use client"

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
`}]},{heading:`Selection That Follows Focus`,text:'A single list selects as arrow keys, Page Up and Page Down, Home, End, or typing move focus. Page Up and Page Down move ten options, and stop at the ends. A multiple list can do the same with `activation="automatic"`, like a file list: a press or arrow replaces the selection, Ctrl or Cmd adds to it, and Ctrl or Cmd with an arrow moves focus without selecting.',examples:[{id:`listbox/activation`,caption:`Choose index.ts to replace the selection. Hold Ctrl or Cmd while choosing another file to add it; Shift selects a range.`,Example:O,source:`"use client"

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
`}]},{heading:`Manual Activation`,text:'Set `activation="manual"` on a single list to browse without selecting. Space, Enter, or a press chooses the focused option.',examples:[{id:`listbox/manual`,caption:`Move through the options with the arrow keys. Nothing is selected until you press Space or Enter, and the console logs the choice.`,Example:A,source:`"use client"

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
`}]},{heading:`Focus on the List`,text:"Set `virtualFocus` to keep focus on the list itself while arrow keys, Home, End, and typing move a highlight through the options. The list points at the highlighted option with `aria-activedescendant`, so screen readers still announce it. Style the highlight with `[data-highlighted]`, since the options don't take focus.",examples:[{id:`listbox/virtual-focus`,caption:`Tab into the list and move through it with the arrow keys. Focus stays on the list, and Space or Enter chooses the highlighted option.`,Example:M,source:`"use client"

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
`}]},{heading:`Deselectable`,text:"Add `deselectable` to let pressing the selected option clear a single selection. Without it, the selection stays as it is.",examples:[{id:`listbox/deselectable`,caption:`Press Astro again to clear the selection, or choose another framework. The console logs each change.`,Example:P,source:`"use client"

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
`}]},{heading:`Groups`,text:"Use `ListboxGroup` and `ListboxGroupLabel` to name a group. Arrow keys and ranges continue across groups. Separators stay out of the accessibility tree.",examples:[{id:`listbox/groups`,caption:`Move from Apple through the list with Down Arrow. Navigation continues into the Vegetables group.`,Example:F,source:`"use client"

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
`}]},{heading:`Icons`,text:"Wrap an icon in `ListboxItemIcon` so screen readers and typeahead skip it. Add `mirror` to a directional icon to flip it in right-to-left text.",examples:[{id:`listbox/icons`,caption:`Choose Drafts. The icon stays out of the option’s accessible name and the text used for typeahead.`,Example:L,source:`"use client"

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
`}]},{heading:`Horizontal`,text:'Set `orientation="horizontal"` to move with Left and Right Arrow. Arrow keys normally wrap; set `loop={false}` to stop at the ends, as this example does. Shift ranges never wrap.',examples:[{id:`listbox/horizontal`,caption:`Focus M, then use Left and Right Arrow to choose a size. The list stops at its ends; XL cannot be selected.`,Example:z,source:`"use client"

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
`}]},{heading:`Disabled`,text:`A disabled option cannot be selected. Arrow keys, typeahead and ranges skip it. Disabling the whole list removes its tab stop, prevents changes, and excludes its value from the form.`,examples:[{id:`listbox/disabled`,caption:`Try choosing Olive. Then press Disable the List to make every option unavailable until you enable it again.`,Example:V,source:`"use client"

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
`}]},{heading:`Read-Only`,text:"Use `readOnly` when people should be able to browse the list without changing its value. The list remains focusable and its value still submits.",examples:[{id:`listbox/read-only`,caption:`Move focus through the frameworks. Nuxt stays selected because the list is read-only.`,Example:U,source:`"use client"

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
`}]},{heading:`Form`,text:"Add `name` to submit the selection. Multiple selections submit one entry per value. Reset restores `defaultValue`, and `required` prevents submission when nothing is selected.",examples:[{id:`listbox/form`,caption:`Choose Basil and press Order: the console logs both toppings. Reset restores Extra cheese; clearing every option makes the required list block the order.`,Example:G,source:`"use client"

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
`}]},{heading:`Object Values`,text:"Pass objects as item values when the selection should carry more than an ID. `itemToValue` provides the string used for identity and form submission; `isItemEqualToValue` matches objects that represent the same option but are different instances.",examples:[{id:`listbox/data`,caption:`Choose Team. The console logs the price from the selected object, not from its string ID.`,Example:q,source:`"use client"

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
`}]},{heading:`Controller`,text:"A controller can select all options, clear the selection, or focus the list from another control. Create one with `createListboxController()` and pass it as `controller`. Controllers covers setup and lifetime.",examples:[{id:`listbox/controller`,caption:`Press Select All, Clear and Focus. Each button drives the same list through its controller, and the console logs the change.`,Example:Y,source:`"use client"

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
`}]},{heading:`Scrollable`,text:"Give a long list a maximum height and `overflow-y: auto`. It starts scrolled to the selected option without taking focus. Keyboard navigation reveals the focused option without scrolling the page.",examples:[{id:`listbox/scrollable`,caption:`Focus the list and use the arrow keys. Options scroll into view, and the console logs the focused time zone.`,Example:Z,source:`"use client"

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
`}]},{heading:`Custom Rendering`,text:`Render an option as a link when choosing it should navigate. A press or Enter follows the link and selects the option. This example uses manual activation so arrow keys only browse.`,examples:[{id:`listbox/render`,caption:`Focus Remix and press Enter, or choose it with the pointer. The option is selected and its link updates the URL hash.`,Example:$,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`listbox/rtl`,caption:``,Example:ne,source:`import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"

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
`}]}]};export{re as default};