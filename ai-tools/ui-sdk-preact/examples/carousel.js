import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-CA3STxaZ.js";import{t as n}from"../chunks/c-DCB4QOj-.js";import{t as r}from"../chunks/c-CU-88Fi-.js";import{t as i}from"../chunks/c-CGmLEa3A.js";import{useLog as a}from"./log.js";import*as o from"preact/compat";import{useState as s}from"preact/compat";import{jsx as c,jsxs as l}from"preact/compat/jsx-runtime";import{Select as u,SelectContent as d,SelectItem as f,SelectItemIndicator as p,SelectLabel as ee,SelectTrigger as m,SelectValue as h}from"ui-sdk/select.js";import{Carousel as g,CarouselContent as _,CarouselIndicator as v,CarouselIndicatorGroup as y,CarouselItem as b,CarouselNext as x,CarouselPlayToggle as S,CarouselPrevious as C,CarouselViewport as w,createCarouselController as T}from"ui-sdk/carousel.js";const E=[1,2,3,4,5];function D(){return/* @__PURE__ */ c(g,{"aria-label":`Featured`,children:/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:E.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})})]})})}const O=[1,2,3,4,5];function k(){return/* @__PURE__ */ l(g,{"aria-label":`Featured`,orientation:`vertical`,children:[/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:O.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(i,{})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(t,{})})]})]})}const A=[1,2,3,4,5];function j(){return/* @__PURE__ */ c(g,{"aria-label":`Featured`,loop:!0,children:/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:A.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})})]})})}const M=[{name:`Dunes`},{name:`Forest`},{name:`Glacier`},{name:`Canyon`},{name:`Meadow`},{name:`Harbor`}],N=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function P(){let[i,a]=o.useState(`center`);return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ l(u,{items:N,value:i,onValueChange:e=>e&&a(e),children:[/* @__PURE__ */ c(ee,{children:`Align`}),/* @__PURE__ */ l(m,{children:[/* @__PURE__ */ c(h,{}),/* @__PURE__ */ c(t,{})]}),/* @__PURE__ */ c(d,{children:N.map(t=>/* @__PURE__ */ l(f,{value:t.value,children:[t.label,/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(e,{})})]},t.value))})]})}),/* @__PURE__ */ c(g,{"aria-label":`Photos`,align:i,defaultPage:2,children:/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:M.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e.name})},e.name))})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})})]})})]})}const F=[1,2,3,4,5];function I(){return/* @__PURE__ */ c(g,{"aria-label":`Featured`,defaultPage:3,children:/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:F.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})})]})})}const L=[{name:`Dunes`},{name:`Forest`},{name:`Glacier`},{name:`Canyon`},{name:`Meadow`},{name:`Harbor`}];function te(){return/* @__PURE__ */ l(g,{"aria-label":`Photos`,children:[/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:L.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e.name})},e.name))})}),/* @__PURE__ */ c(y,{"aria-label":`Choose a photo`,children:L.map((e,t)=>/* @__PURE__ */ c(v,{page:t+1,"aria-label":e.name},e.name))})]})}const R=[1,2,3,4,5,6,7,8];function z(){return/* @__PURE__ */ l(g,{"aria-label":`Products`,slidesPerPage:3,children:[/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous page`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:R.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ c(x,{"aria-label":`Next page`,children:/* @__PURE__ */ c(r,{})})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:/* @__PURE__ */ c(y,{"aria-label":`Choose a page`,children:e=>Array.from({length:e.pageCount??3},(e,t)=>/* @__PURE__ */ c(v,{page:t+1,"aria-label":`Page ${t+1}`},t))})})]})}const B=[{name:`Dunes`},{name:`Forest`},{name:`Glacier`},{name:`Canyon`},{name:`Meadow`},{name:`Harbor`}];function V(){let[e,t]=o.useState(1),n=o.useRef(null);return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(g,{"aria-label":`Photos`,page:e,onPageChange:e=>{t(e),n.current?.querySelectorAll(`button`)[e-1]?.scrollIntoView({block:`nearest`,inline:`nearest`})},children:/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:B.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e.name})},e.name))})})}),/* @__PURE__ */ c(g,{ref:n,"aria-label":`Thumbnails`,dragFree:!0,slidesPerPage:`auto`,children:/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:B.map((n,r)=>/* @__PURE__ */ c(b,{"aria-label":n.name,children:/* @__PURE__ */ c(`button`,{type:`button`,"aria-pressed":e===r+1,onClick:()=>t(r+1),children:n.name})},n.name))})})})]})}const H=[{name:`Dunes`},{name:`Forest`},{name:`Glacier`},{name:`Canyon`},{name:`Meadow`},{name:`Harbor`}];function U(){let e=a();return/* @__PURE__ */ l(g,{"aria-label":`Photos`,defaultPlaying:!0,interval:4e3,onPlayingChange:(t,n)=>e(`${t?`Playing`:`Stopped`} (${n.reason})`),children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ c(S,{children:e=>e.playing?`Pause`:`Play`})}),/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:H.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e.name})},e.name))})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})})]})]})}const W=[1,2,3,4,5];function G(){let e=a();return/* @__PURE__ */ l(g,{"aria-label":`Featured`,onPageChangeComplete:t=>e(`Rested on slide ${t}`),children:[/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:W.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:/* @__PURE__ */ c(`div`,{"data-slot":`bar`,children:/* @__PURE__ */ c(`div`,{})})})]})}const K=[1,2,3,4,5];function q(){let[e,t]=o.useState(1),i=a();return/* @__PURE__ */ c(g,{"aria-label":`Featured`,page:e,onPageChange:(e,n)=>{t(e),i(`Page ${e} (${n.reason})`)},children:/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:K.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ c(x,{"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})})]})})}const J=[1,2,3,4,5];function Y(){let[e]=s(T);return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ l(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ c(C,{controller:e,"aria-label":`Previous slide`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(x,{controller:e,"aria-label":`Next slide`,children:/* @__PURE__ */ c(r,{})}),/* @__PURE__ */ c(`button`,{type:`button`,onClick:()=>e.setPage(5),children:`Show the Last Slide`})]}),/* @__PURE__ */ c(g,{"aria-label":`Featured`,controller:e,drag:!1,children:/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:J.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})})})]})}const X=[{name:`Dunes`},{name:`Forest`},{name:`Glacier`},{name:`Canyon`},{name:`Meadow`},{name:`Harbor`}],Z=()=>typeof document<`u`&&document.activeElement?.getAttribute(`data-slot`)===`carousel-next`;function Q(){return/* @__PURE__ */ l(g,{"aria-label":`Photos`,children:[/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:X.map(e=>/* @__PURE__ */ c(b,{children:t=>/* @__PURE__ */ l(`div`,{"data-slot":`tile`,children:[e.name,/* @__PURE__ */ l(`span`,{"data-slot":`hint`,children:[t.index+1,` / `,X.length,t.active&&` · showing`]})]})},e.name))})}),/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(C,{children:[/* @__PURE__ */ c(n,{}),`Previous`]}),/* @__PURE__ */ c(x,{render:(e,t)=>t.disabled?/* @__PURE__ */ c(`a`,{href:`https://example.com/gallery`,ref:Z()?e=>e?.focus():void 0,children:`See all photos`}):/* @__PURE__ */ l(`button`,{...e,children:[`Next`,/* @__PURE__ */ c(r,{})]})})]})]})}const $=[1,2,3,4,5];function ne(){return/* @__PURE__ */ c(`div`,{dir:`rtl`,children:/* @__PURE__ */ l(g,{"aria-label":`مميز`,children:[/* @__PURE__ */ c(w,{children:/* @__PURE__ */ c(_,{children:$.map(e=>/* @__PURE__ */ c(b,{children:/* @__PURE__ */ c(`div`,{"data-slot":`tile`,children:e})},e))})}),/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(C,{"aria-label":`الشريحة السابقة`,children:/* @__PURE__ */ c(n,{})}),/* @__PURE__ */ c(y,{"aria-label":`اختر شريحة`,children:$.map(e=>/* @__PURE__ */ c(v,{page:e,"aria-label":`الشريحة ${e}`},e))}),/* @__PURE__ */ c(x,{"aria-label":`الشريحة التالية`,children:/* @__PURE__ */ c(r,{})})]})]})})}var re={name:`carousel`,title:`Carousel`,description:`Page through slides with native scrolling, keyboard controls, and optional rotation.`,sections:[{heading:null,text:`Use a Carousel to show a set of slides one view at a time, like product photos or featured stories. It scrolls natively, so swipes and trackpads work, and Previous and Next buttons page through the slides.`,examples:[{id:`carousel/basic`,caption:`Use Previous and Next, swipe the slides, or focus the viewport and use the arrow keys.`,Example:D,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured">
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'`orientation="vertical"` scrolls up and down. Give the viewport a height. Up and down arrows page it, not left and right.',examples:[{id:`carousel/vertical`,caption:`Scroll vertically, or use the up and down controls.`,Example:k,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured" orientation="vertical">
      <CarouselViewport>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <div data-slot="tile">{slide}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronUpIcon />
        </CarouselPrevious>
        <CarouselNext aria-label="Next slide">
          <ChevronDownIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Loop`,text:"`loop` makes the slides go round. Next on the last page goes to the first, which comes in after the last, and a swipe, a drag or a wheel back from the first page reaches the last, with native scrolling all the way. Rotation always wraps.",examples:[{id:`carousel/loop`,caption:`Keep moving forward or backward to wrap around the slides.`,Example:j,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured" loop>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Align`,text:"`align` lines pages up at the viewport's `start` (the default), `center` or `end`. Centered slides narrower than the viewport let their neighbors peek in. The first and last pages stay at the ends of the content, so there's no empty space before the first slide.",examples:[{id:`carousel/align`,caption:`Choose Start, Center or End, then page through the slides. Centered slides let their neighbors peek in on both sides.`,Example:P,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import * as React from "react"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]
const alignments = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]

function Example() {
  const [align, setAlign] = React.useState<"start" | "center" | "end">("center")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={alignments}
          value={align}
          onValueChange={(next) => next && setAlign(next as typeof align)}
        >
          <SelectLabel>Align</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {alignments.map((option) => (
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
      <Carousel aria-label="Photos" align={align} defaultPage={2}>
        <div data-slot="row">
          <CarouselPrevious aria-label="Previous slide">
            <ChevronLeftIcon />
          </CarouselPrevious>
          <CarouselViewport>
            <CarouselContent>
              {photos.map((photo) => (
                <CarouselItem key={photo.name}>
                  <div data-slot="tile">{photo.name}</div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </CarouselViewport>
          <CarouselNext aria-label="Next slide">
            <ChevronRightIcon />
          </CarouselNext>
        </div>
      </Carousel>
    </div>
  )
}

export { Example }
`}]},{heading:`Default Page`,text:"`defaultPage` is the page it starts on, when uncontrolled. It's 1 by default.",examples:[{id:`carousel/default-page`,caption:`Start on the chosen page, then move forward or backward.`,Example:I,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured" defaultPage={3}>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Indicators`,text:`Indicators are a tablist: one Tab stop on the current page, arrows to move between them and show their page, Home and End for the ends. Each controls the slides of its page.`,examples:[{id:`carousel/indicators`,caption:`Choose a named indicator, then use arrows, Home, and End to move between them.`,Example:te,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselViewport,
} from "@ui-sdk/react/carousel"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function Example() {
  return (
    <Carousel aria-label="Photos">
      <CarouselViewport>
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.name}>
              <div data-slot="tile">{photo.name}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <CarouselIndicatorGroup aria-label="Choose a photo">
        {photos.map((photo, index) => (
          <CarouselIndicator
            key={photo.name}
            page={index + 1}
            aria-label={photo.name}
          />
        ))}
      </CarouselIndicatorGroup>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Pages`,text:'`slidesPerPage` is how many slides a page holds: Next moves that many, and each indicator stands for that many. `"auto"` fits as many as show. Pages that can\'t reach the start, like the last few slides, merge into the last page. With three slides in view, five slides make three pages at one slide per page, or two pages at three per page.',examples:[{id:`carousel/pages`,caption:`Move through groups of slides using the page controls.`,Example:z,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const products = [1, 2, 3, 4, 5, 6, 7, 8]

function Example() {
  return (
    <Carousel aria-label="Products" slidesPerPage={3}>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous page">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product}>
                <div data-slot="tile">{product}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next page">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
      <div data-slot="row">
        <CarouselIndicatorGroup aria-label="Choose a page">
          {(state) =>
            Array.from({ length: state.pageCount ?? 3 }, (_, index) => (
              <CarouselIndicator
                key={index}
                page={index + 1}
                aria-label={\`Page \${index + 1}\`}
              />
            ))
          }
        </CarouselIndicatorGroup>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Thumbnails`,text:"A gallery and a strip of thumbnails share the selected page. The thumbnail carousel scrolls freely with `dragFree` and fits as many as show. Pressing a thumbnail selects its slide.",examples:[{id:`carousel/thumbnails`,caption:`Choose a thumbnail to change the gallery, or scroll either strip.`,Example:V,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import * as React from "react"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function Example() {
  const [page, setPage] = React.useState(1)
  const strip = React.useRef<HTMLDivElement>(null)
  const show = (next: number) => {
    setPage(next)
    strip.current
      ?.querySelectorAll("button")
      [next - 1]?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }
  return (
    <div data-slot="stack">
      <Carousel aria-label="Photos" page={page} onPageChange={show}>
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo) => (
              <CarouselItem key={photo.name}>
                <div data-slot="tile">{photo.name}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
      </Carousel>
      <Carousel
        ref={strip}
        aria-label="Thumbnails"
        dragFree
        slidesPerPage="auto"
      >
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={photo.name} aria-label={photo.name}>
                <button
                  type="button"
                  aria-pressed={page === index + 1}
                  onClick={() => setPage(index + 1)}
                >
                  {photo.name}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
      </Carousel>
    </div>
  )
}

export { Example }
`}]},{heading:`Autoplay`,text:"`defaultPlaying` starts rotating, every `interval` milliseconds (5000 by default). `CarouselPlayToggle` starts and stops it; label it from `playing` in its state.",examples:[{id:`carousel/autoplay`,caption:`Start or stop rotation. Hover to pause it, or move keyboard focus inside to stop it. The console logs each change and why.`,Example:U,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function Example() {
  const log = useLog()
  return (
    <Carousel
      aria-label="Photos"
      defaultPlaying
      interval={4000}
      onPlayingChange={(playing, details) =>
        log(\`\${playing ? "Playing" : "Stopped"} (\${details.reason})\`)
      }
    >
      <div data-slot="controls">
        <CarouselPlayToggle>
          {(state) => (state.playing ? "Pause" : "Play")}
        </CarouselPlayToggle>
      </div>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo) => (
              <CarouselItem key={photo.name}>
                <div data-slot="tile">{photo.name}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Progress`,text:"`--carousel-progress` on the root says how far the slides have scrolled, from 0 at the first page to 1 at the last, on every frame of a scroll or a spring, with no re-renders, so a progress bar can follow it in CSS. With `loop`, it goes round from 0 to 1 and back to 0. The controller's `getProgress()` reads the same number.",examples:[{id:`carousel/progress`,caption:`Move through the slides. The progress bar follows the scroll position, and the console logs the slide it rests on.`,Example:G,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const slides = [1, 2, 3, 4, 5]

function Example() {
  const log = useLog()
  return (
    <Carousel
      aria-label="Featured"
      onPageChangeComplete={(page) => log(\`Rested on slide \${page}\`)}
    >
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
      <div data-slot="row">
        <div data-slot="bar">
          <div />
        </div>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `page` and `onPageChange` to control the page, from 1. The root's state has `pageCount`, which is null until the slides are measured.",examples:[{id:`carousel/controlled`,caption:`Change the page. The console logs each page and the reason for the change.`,Example:q,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const slides = [1, 2, 3, 4, 5]

function Example() {
  const [page, setPage] = React.useState(1)
  const log = useLog()
  return (
    <Carousel
      aria-label="Featured"
      page={page}
      onPageChange={(next, details) => {
        setPage(next)
        log(\`Page \${next} (\${details.reason})\`)
      }}
    >
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`Paging from Anywhere`,text:"A controller, from `createCarouselController()`, pages the carousel from anywhere. Pass it as `controller` to the carousel, and to `CarouselPrevious`, `CarouselNext`, `CarouselIndicatorGroup` or `CarouselPlayToggle` placed outside it, like in a section header.",examples:[{id:`carousel/controller`,caption:`Use the controls outside the carousel to change its page.`,Example:Y,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
  createCarouselController,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useState } from "react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  const [carousel] = useState(createCarouselController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <CarouselPrevious controller={carousel} aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselNext controller={carousel} aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
        <button type="button" onClick={() => carousel.setPage(5)}>
          Show the Last Slide
        </button>
      </div>
      <Carousel aria-label="Featured" controller={carousel} drag={false}>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
      </Carousel>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. `className`, `style` and `children` can be functions of the same state: a slide's `index`, `active` and `inView`, a step's `disabled`, an indicator's `page` and `selected`, the play toggle's `playing` and `paused`.",examples:[{id:`carousel/render`,caption:`Change slides to see each slide and control describe its current state.`,Example:Q,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

const nextFocused = () =>
  typeof document !== "undefined" &&
  document.activeElement?.getAttribute("data-slot") === "carousel-next"

function Example() {
  return (
    <Carousel aria-label="Photos">
      <CarouselViewport>
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.name}>
              {(state) => (
                <div data-slot="tile">
                  {photo.name}
                  <span data-slot="hint">
                    {state.index + 1} / {photos.length}
                    {state.active && " · showing"}
                  </span>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div data-slot="row">
        <CarouselPrevious>
          <ChevronLeftIcon />
          Previous
        </CarouselPrevious>
        <CarouselNext
          render={(props, state) =>
            state.disabled ? (
              <a
                href="https://example.com/gallery"
                ref={nextFocused() ? (link) => link?.focus() : undefined}
              >
                See all photos
              </a>
            ) : (
              <button {...props}>
                Next
                <ChevronRightIcon />
              </button>
            )
          }
        />
      </div>
    </Carousel>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`carousel/rtl`,caption:``,Example:ne,source:`"use client"

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <div dir="rtl">
      <Carousel aria-label="مميز">
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <div data-slot="row">
          <CarouselPrevious aria-label="الشريحة السابقة">
            <ChevronLeftIcon />
          </CarouselPrevious>
          <CarouselIndicatorGroup aria-label="اختر شريحة">
            {slides.map((slide) => (
              <CarouselIndicator
                key={slide}
                page={slide}
                aria-label={\`الشريحة \${slide}\`}
              />
            ))}
          </CarouselIndicatorGroup>
          <CarouselNext aria-label="الشريحة التالية">
            <ChevronRightIcon />
          </CarouselNext>
        </div>
      </Carousel>
    </div>
  )
}

export { Example }
`}]}]};export{re as default};