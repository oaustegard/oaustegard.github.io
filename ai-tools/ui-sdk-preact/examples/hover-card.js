import{Ks as e,Xa as t,ao as n,ca as r,do as i,fl as a,la as o,qa as s,qs as c,ro as l,sa as u,tl as d,to as f,ua as p,uo as m}from"../chunks/c-CIXE4Nkk.js";function h(){return/* @__PURE__ */ d(u,{children:[/* @__PURE__ */ d(p,{href:`https://example.com/people/hollis`,children:`@hollis`}),/* @__PURE__ */ d(o,{children:/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ d(`span`,{"data-slot":`initials`,"aria-hidden":`true`,children:`HG`}),/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`p`,{children:`Hollis Grant`}),/* @__PURE__ */ d(`p`,{children:`Design engineer on the payments team. Writes about forms and motion.`}),/* @__PURE__ */ d(`p`,{"data-slot":`hint`,children:`Joined March 2021`})]})]})})]})}const g=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}],_=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function v(){let[h,v]=a(`bottom`),[y,b]=a(`center`);return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ d(s,{items:g,value:h,onValueChange:e=>e&&v(e),children:[/* @__PURE__ */ d(n,{children:`Side`}),/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(i,{}),/* @__PURE__ */ d(e,{"aria-hidden":`true`})]}),/* @__PURE__ */ d(t,{children:g.map(e=>/* @__PURE__ */ d(f,{value:e.value,children:[e.label,/* @__PURE__ */ d(l,{children:/* @__PURE__ */ d(c,{"aria-hidden":`true`})})]},e.value))})]}),/* @__PURE__ */ d(s,{items:_,value:y,onValueChange:e=>e&&b(e),children:[/* @__PURE__ */ d(n,{children:`Align`}),/* @__PURE__ */ d(m,{children:[/* @__PURE__ */ d(i,{}),/* @__PURE__ */ d(e,{"aria-hidden":`true`})]}),/* @__PURE__ */ d(t,{children:_.map(e=>/* @__PURE__ */ d(f,{value:e.value,children:[e.label,/* @__PURE__ */ d(l,{children:/* @__PURE__ */ d(c,{"aria-hidden":`true`})})]},e.value))})]})]}),/* @__PURE__ */ d(u,{children:[/* @__PURE__ */ d(p,{href:`https://example.com/people/ines`,children:`@ines`}),/* @__PURE__ */ d(o,{side:h,align:y,sideOffset:10,children:[/* @__PURE__ */ d(r,{}),/* @__PURE__ */ d(`p`,{children:`Inès Moreau`}),/* @__PURE__ */ d(`p`,{children:`Product designer. Leads the checkout redesign.`})]})]})]})}function y(){return/* @__PURE__ */ d(`div`,{dir:`rtl`,children:/* @__PURE__ */ d(u,{children:[/* @__PURE__ */ d(p,{href:`https://example.com/people/hollis`,children:`هوليس غرانت`}),/* @__PURE__ */ d(o,{align:`start`,sideOffset:10,children:[/* @__PURE__ */ d(r,{}),/* @__PURE__ */ d(`p`,{children:`هوليس غرانت`}),/* @__PURE__ */ d(`p`,{children:`مهندس تصميم في فريق المدفوعات.`})]})]})})}var b={name:`hover-card`,title:`Hover Card`,description:`Preview a link on hover or keyboard focus while keeping its normal navigation.`,sections:[{heading:null,text:`A hover card shows a preview of where a link goes, like a person's profile, to someone who pauses on it. The link still works as a link.`,examples:[{id:`hover-card/basic`,caption:`Hover @hollis, or Tab to it and wait, to open Hollis Grant's profile preview. Move the pointer away or press Escape to close it.`,Example:h,source:`"use client"

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
`}]},{heading:`Positioning`,text:"`side` picks where the card opens, `bottom` by default, and `align` lines it up with the start, center or end of the link. The card flips to the other side when there isn't room and shifts along the link to stay on screen.",examples:[{id:`hover-card/side`,caption:`Choose a side and an alignment, then hover @ines. The card opens there and its arrow points at the link.`,Example:v,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`hover-card/rtl`,caption:``,Example:y,source:`"use client"

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
`}]}]};export{b as default};