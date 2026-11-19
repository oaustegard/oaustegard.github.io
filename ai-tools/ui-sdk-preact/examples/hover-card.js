import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-CA3STxaZ.js";import*as n from"preact/compat";import{jsx as r,jsxs as i}from"preact/compat/jsx-runtime";import{Select as a,SelectContent as o,SelectItem as s,SelectItemIndicator as c,SelectLabel as l,SelectTrigger as u,SelectValue as d}from"ui-sdk/select.js";import{HoverCard as f,HoverCardArrow as p,HoverCardContent as m,HoverCardTrigger as h}from"ui-sdk/hover-card.js";function g(){return/* @__PURE__ */ i(f,{children:[/* @__PURE__ */ r(h,{href:`https://example.com/people/hollis`,children:`@hollis`}),/* @__PURE__ */ r(m,{children:/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(`span`,{"data-slot":`initials`,"aria-hidden":`true`,children:`HG`}),/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(`p`,{children:`Hollis Grant`}),/* @__PURE__ */ r(`p`,{children:`Design engineer on the payments team. Writes about forms and motion.`}),/* @__PURE__ */ r(`p`,{"data-slot":`hint`,children:`Joined March 2021`})]})]})})]})}const _=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}],v=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function y(){let[g,y]=n.useState(`bottom`),[b,x]=n.useState(`center`);return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ i(a,{items:_,value:g,onValueChange:e=>e&&y(e),children:[/* @__PURE__ */ r(l,{children:`Side`}),/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(d,{}),/* @__PURE__ */ r(t,{"aria-hidden":`true`})]}),/* @__PURE__ */ r(o,{children:_.map(t=>/* @__PURE__ */ i(s,{value:t.value,children:[t.label,/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})]},t.value))})]}),/* @__PURE__ */ i(a,{items:v,value:b,onValueChange:e=>e&&x(e),children:[/* @__PURE__ */ r(l,{children:`Align`}),/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(d,{}),/* @__PURE__ */ r(t,{"aria-hidden":`true`})]}),/* @__PURE__ */ r(o,{children:v.map(t=>/* @__PURE__ */ i(s,{value:t.value,children:[t.label,/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})]},t.value))})]})]}),/* @__PURE__ */ i(f,{children:[/* @__PURE__ */ r(h,{href:`https://example.com/people/ines`,children:`@ines`}),/* @__PURE__ */ i(m,{side:g,align:b,sideOffset:10,children:[/* @__PURE__ */ r(p,{}),/* @__PURE__ */ r(`p`,{children:`Inès Moreau`}),/* @__PURE__ */ r(`p`,{children:`Product designer. Leads the checkout redesign.`})]})]})]})}function b(){return/* @__PURE__ */ r(`div`,{dir:`rtl`,children:/* @__PURE__ */ i(f,{children:[/* @__PURE__ */ r(h,{href:`https://example.com/people/hollis`,children:`هوليس غرانت`}),/* @__PURE__ */ i(m,{align:`start`,sideOffset:10,children:[/* @__PURE__ */ r(p,{}),/* @__PURE__ */ r(`p`,{children:`هوليس غرانت`}),/* @__PURE__ */ r(`p`,{children:`مهندس تصميم في فريق المدفوعات.`})]})]})})}var x={name:`hover-card`,title:`Hover Card`,description:`Preview a link on hover or keyboard focus while keeping its normal navigation.`,sections:[{heading:null,text:`A hover card shows a preview of where a link goes, like a person's profile, to someone who pauses on it. The link still works as a link.`,examples:[{id:`hover-card/basic`,caption:`Hover @hollis, or Tab to it and wait, to open Hollis Grant's profile preview. Move the pointer away or press Escape to close it.`,Example:g,source:`"use client"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@ui-sdk/react/hover-card"

function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="https://example.com/people/hollis">
        @hollis
      </HoverCardTrigger>
      <HoverCardContent>
        <div data-slot="row">
          <span data-slot="initials" aria-hidden="true">
            HG
          </span>
          <div data-slot="stack">
            <p>Hollis Grant</p>
            <p>
              Design engineer on the payments team. Writes about forms and
              motion.
            </p>
            <p data-slot="hint">Joined March 2021</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export { Example }
`}]},{heading:`Positioning`,text:"`side` picks where the card opens, `bottom` by default, and `align` lines it up with the start, center or end of the link. The card flips to the other side when there isn't room and shifts along the link to stay on screen.",examples:[{id:`hover-card/side`,caption:`Choose a side and an alignment, then hover @ines. The card opens there and its arrow points at the link.`,Example:y,source:`"use client"

import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from "@ui-sdk/react/hover-card"
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
      <HoverCard>
        <HoverCardTrigger href="https://example.com/people/ines">
          @ines
        </HoverCardTrigger>
        <HoverCardContent side={side} align={align} sideOffset={10}>
          <HoverCardArrow />
          <p>Inès Moreau</p>
          <p>Product designer. Leads the checkout redesign.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`hover-card/rtl`,caption:``,Example:b,source:`"use client"

import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from "@ui-sdk/react/hover-card"

function Example() {
  return (
    <div dir="rtl">
      <HoverCard>
        <HoverCardTrigger href="https://example.com/people/hollis">
          هوليس غرانت
        </HoverCardTrigger>
        <HoverCardContent align="start" sideOffset={10}>
          <HoverCardArrow />
          <p>هوليس غرانت</p>
          <p>مهندس تصميم في فريق المدفوعات.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

export { Example }
`}]}]};export{x as default};