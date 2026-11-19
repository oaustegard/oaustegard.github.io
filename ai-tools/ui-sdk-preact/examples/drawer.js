import{Aa as e,Ca as t,Co as n,Da as r,Ea as i,Mo as a,Oa as o,Oo as s,Sa as c,Ta as l,as as u,ba as d,fl as f,fs as p,ka as m,ml as h,tl as g,wa as _,xa as v,yo as y}from"../chunks/c-CIXE4Nkk.js";const b={initial:350,min:200,max:400,step:10};function x(){let[e,n]=f(b.initial);return/* @__PURE__ */ g(v,{children:[/* @__PURE__ */ g(m,{children:`Open Drawer`}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`grip`,"aria-hidden":!0}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`Move goal`}),/* @__PURE__ */ g(l,{children:`Set your daily activity goal.`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(`button`,{type:`button`,"aria-label":`Decrease`,disabled:e<=b.min,onClick:()=>n(e-b.step),children:/* @__PURE__ */ g(p,{"aria-hidden":`true`})}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(`div`,{"aria-live":`polite`,children:e}),/* @__PURE__ */ g(`div`,{"data-slot":`hint`,children:`Calories/day`})]}),/* @__PURE__ */ g(`button`,{type:`button`,"aria-label":`Increase`,disabled:e>=b.max,onClick:()=>n(e+b.step),children:/* @__PURE__ */ g(u,{"aria-hidden":`true`})})]}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(t,{"data-variant":`solid`,value:`submit`,children:`Submit`}),/* @__PURE__ */ g(t,{children:`Cancel`})]})]})]})}const S=[`The drawer rises from any edge, rests on snap points and follows your finger with the same spring as a system sheet.`,`Snap points take fractions of the screen, pixels, rem, percentages or the content's own size. Points that land within a pixel of each other merge into one.`,`Dragging a list scrolls it until it reaches the top, and then the same gesture moves the drawer, so closing a long sheet never needs two tries.`,`The handle steps through the snap points with a press, the arrow keys, Home and End. Screen readers on phones adjust it like a slider.`,`Below a snap point you choose, the page behind stays usable and undimmed, like a map with a sheet of results.`,`Drawers opened from inside each other stack, and the one beneath steps back while the new one rises.`,`The on-screen keyboard pushes the drawer up, and the focused field scrolls into view inside it, never the page.`,`With reduced motion, drawers fade in and out instead of sliding.`];function C(){return/* @__PURE__ */ g(v,{children:[/* @__PURE__ */ g(m,{children:`Scrollable Content`}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{initialFocus:`content`,children:[/* @__PURE__ */ g(`div`,{"data-slot":`grip`,"aria-hidden":!0}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`Release notes`}),/* @__PURE__ */ g(l,{children:`Everything new in the drawer.`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`scroll`,children:[...S,...S].map((e,t)=>/* @__PURE__ */ g(`p`,{"data-slot":`hint`,children:e},t))}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ g(t,{"data-variant":`solid`,children:`Got It`})})]})]})}const w=[{side:`top`,label:`Top`,title:`Notifications`,description:`You're all caught up.`},{side:`right`,label:`Right`,title:`Cart`,description:`2 items, $84.00.`},{side:`bottom`,label:`Bottom`,title:`Share`,description:`Send this page to your team.`},{side:`left`,label:`Left`,title:`Menu`,description:`Jump to a section of the docs.`}];function T(){return/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:w.map(({side:e,label:n,title:r,description:i})=>/* @__PURE__ */ g(v,{side:e,preventEdgeSwipe:e===`left`||e===`right`,children:[/* @__PURE__ */ g(m,{children:n}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:r}),/* @__PURE__ */ g(l,{children:i})]}),/* @__PURE__ */ g(t,{"data-variant":`solid`,children:`Close`})]})]},e))})}const E=[{name:`Blue Bottle Coffee`,detail:`Coffee · 0.2 mi`},{name:`Tartine Bakery`,detail:`Bakery · 0.4 mi`},{name:`Dolores Park`,detail:`Park · 0.5 mi`},{name:`Mission Dolores`,detail:`Landmark · 0.6 mi`},{name:`Ritual Coffee Roasters`,detail:`Coffee · 0.7 mi`},{name:`Bi-Rite Creamery`,detail:`Ice cream · 0.7 mi`},{name:`Alamo Square`,detail:`Park · 1.1 mi`},{name:`The Castro Theatre`,detail:`Cinema · 1.2 mi`},{name:`Ferry Building`,detail:`Market · 2.3 mi`},{name:`Coit Tower`,detail:`Landmark · 2.9 mi`},{name:`Golden Gate Park`,detail:`Park · 3.0 mi`},{name:`Lands End`,detail:`Trail · 5.4 mi`}];function D(){return/* @__PURE__ */ g(v,{snapPoints:[.25,.5,1],defaultSnapPoint:.5,expandOnScroll:!0,children:[/* @__PURE__ */ g(m,{children:`Find a Place`}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(i,{"aria-label":`Resize`}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`Places nearby`}),/* @__PURE__ */ g(l,{children:`Drag the drawer, or press the handle, to see more.`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`scroll`,children:/* @__PURE__ */ g(`ul`,{"data-slot":`list`,children:E.map(e=>/* @__PURE__ */ g(`li`,{children:[/* @__PURE__ */ g(`div`,{children:e.name}),/* @__PURE__ */ g(`div`,{"data-slot":`hint`,children:e.detail})]},e.name))})})]})]})}const O=[{name:`Blue Bottle Coffee`,detail:`Coffee · 0.2 mi`},{name:`Tartine Bakery`,detail:`Bakery · 0.4 mi`},{name:`Dolores Park`,detail:`Park · 0.5 mi`},{name:`Mission Dolores`,detail:`Landmark · 0.6 mi`},{name:`Ritual Coffee Roasters`,detail:`Coffee · 0.7 mi`}];function k(){let[e,n]=f(O[0].name);return/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(`ul`,{"data-slot":`list`,"aria-label":`Places`,children:O.map(t=>/* @__PURE__ */ g(`li`,{children:/* @__PURE__ */ g(`button`,{type:`button`,"aria-pressed":e===t.name,onClick:()=>n(t.name),children:[t.name,/* @__PURE__ */ g(`span`,{"data-slot":`hint`,children:t.detail})]})},t.name))}),/* @__PURE__ */ g(v,{snapPoints:[.2,.6],modalAbove:.2,children:[/* @__PURE__ */ g(m,{children:`Get Directions`}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:n=>/* @__PURE__ */ g(h,{children:[/* @__PURE__ */ g(i,{"aria-label":`Resize`}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:[`To `,e]}),/* @__PURE__ */ g(l,{children:n.interactive?`12 min walk. Pick another place behind the sheet.`:`12 min walk. Drag the sheet down to see the places.`})]}),/* @__PURE__ */ g(t,{children:`Done`})]}),/* @__PURE__ */ g(`ol`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(`li`,{children:`Head north on Valencia St.`}),/* @__PURE__ */ g(`li`,{children:`Turn left onto 18th St.`}),/* @__PURE__ */ g(`li`,{children:[`Arrive at `,e,`.`]})]})]})})]})]})}function A(){return/* @__PURE__ */ g(v,{children:[/* @__PURE__ */ g(m,{children:`Account`}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`grip`,"aria-hidden":!0}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`Account`}),/* @__PURE__ */ g(l,{children:`Manage how you sign in.`})]}),/* @__PURE__ */ g(`dl`,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(`dt`,{children:`Email`}),/* @__PURE__ */ g(`dd`,{children:`hollis@example.com`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(`dt`,{children:`Password`}),/* @__PURE__ */ g(`dd`,{children:`Changed 3 months ago`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(`dt`,{children:`Two-factor`}),/* @__PURE__ */ g(`dd`,{children:`On`})]})]}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(v,{children:[/* @__PURE__ */ g(m,{children:`Change Password`}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`grip`,"aria-hidden":!0}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`Change password`}),/* @__PURE__ */ g(l,{children:`Use at least 12 characters.`})]}),/* @__PURE__ */ g(n,{children:[/* @__PURE__ */ g(s,{children:`New password`}),/* @__PURE__ */ g(y,{type:`password`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ g(t,{"data-variant":`solid`,children:`Update`})})]})]}),/* @__PURE__ */ g(t,{"data-variant":`solid`,children:`Done`})]})]})]})}const j=[{from:`Inès`,text:`The proofs are back from the printer.`},{from:`Kofi`,text:`Lunch on Thursday?`},{from:`Wren`,text:`Pushed the fix for the release build.`},{from:`Tomasz`,text:`Can you review the launch checklist?`}];function M(){return/* @__PURE__ */ g(v,{children:[/* @__PURE__ */ g(`div`,{children:/* @__PURE__ */ g(r,{keyframes:{scale:[1,.94],borderRadius:[`0px`,`24px`]},children:[/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(`span`,{children:`Inbox`}),/* @__PURE__ */ g(m,{"data-variant":`solid`,children:`Compose`})]}),/* @__PURE__ */ g(`ul`,{"data-slot":`list`,children:j.map(e=>/* @__PURE__ */ g(`li`,{children:[/* @__PURE__ */ g(`div`,{children:e.from}),/* @__PURE__ */ g(`div`,{"data-slot":`hint`,children:e.text})]},e.from))})]})}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`grip`,"aria-hidden":!0}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`New message`}),/* @__PURE__ */ g(l,{children:`Write a quick note to the team.`})]}),/* @__PURE__ */ g(n,{children:[/* @__PURE__ */ g(s,{children:`To`}),/* @__PURE__ */ g(y,{defaultValue:`Design team`})]}),/* @__PURE__ */ g(n,{children:[/* @__PURE__ */ g(s,{children:`Message`}),/* @__PURE__ */ g(d,{placeholder:`What's new?`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ g(t,{"data-variant":`solid`,value:`send`,children:`Send`})})]})]})}function N(){let[n]=f(()=>e()),r=a();async function i(){let{returnValue:e=`cancel`}=await n.open();r(e===`cancel`?`Canceled`:`Chose ${e}`)}return/* @__PURE__ */ g(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ g(`button`,{type:`button`,onClick:i,children:`Photo Options`}),/* @__PURE__ */ g(v,{controller:n,children:[/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`Beach.jpg`}),/* @__PURE__ */ g(l,{children:`Taken today at 9:41.`})]}),/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(t,{value:`share`,children:`Share`}),/* @__PURE__ */ g(t,{value:`duplicate`,children:`Duplicate`}),/* @__PURE__ */ g(t,{value:`delete`,children:`Delete`}),/* @__PURE__ */ g(t,{value:`cancel`,children:`Cancel`})]})]})]})]})}const P=[`الرئيسية`,`الطلبات`,`المنتجات`,`العملاء`,`الإعدادات`];function F(){return/* @__PURE__ */ g(`div`,{dir:`rtl`,children:/* @__PURE__ */ g(v,{side:`start`,children:[/* @__PURE__ */ g(m,{children:`القائمة`}),/* @__PURE__ */ g(c,{}),/* @__PURE__ */ g(_,{children:[/* @__PURE__ */ g(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ g(o,{children:`القائمة`}),/* @__PURE__ */ g(l,{children:`اسحبها نحو حافتها لإغلاقها.`})]}),/* @__PURE__ */ g(`nav`,{"aria-label":`الأقسام`,children:/* @__PURE__ */ g(`ul`,{children:P.map(e=>/* @__PURE__ */ g(`li`,{children:/* @__PURE__ */ g(`a`,{href:`https://example.com`,children:e})},e))})}),/* @__PURE__ */ g(t,{"data-variant":`solid`,children:`إغلاق`})]})]})})}var I={name:`drawer`,title:`Drawer`,description:`A sheet you can open, drag, and resize from an edge of the screen.`,sections:[{heading:null,text:`A drawer gives a task its own sheet without leaving the page. It shares Dialog’s focus and dismissal behavior, then adds dragging, snap points, and a handle you can use with the keyboard.`,examples:[{id:`drawer/basic`,caption:`Open the drawer, adjust the daily goal, then Submit or Cancel. You can also press Escape, press outside, or drag the sheet toward its edge to close it.`,Example:x,source:`"use client"

import * as React from "react"
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"
import { MinusIcon, PlusIcon } from "lucide-react"
const goal = { initial: 350, min: 200, max: 400, step: 10 }

function Example() {
  const [calories, setCalories] = React.useState(goal.initial)
  return (
    <Drawer>
      <DrawerTrigger>Open Drawer</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <div data-slot="grip" aria-hidden />

        <div data-slot="stack">
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </div>

        <div data-slot="row">
          <button
            type="button"
            aria-label="Decrease"
            disabled={calories <= goal.min}
            onClick={() => setCalories(calories - goal.step)}
          >
            <MinusIcon aria-hidden="true" />
          </button>
          <div data-slot="stack">
            <div aria-live="polite">{calories}</div>
            <div data-slot="hint">Calories/day</div>
          </div>
          <button
            type="button"
            aria-label="Increase"
            disabled={calories >= goal.max}
            onClick={() => setCalories(calories + goal.step)}
          >
            <PlusIcon aria-hidden="true" />
          </button>
        </div>

        <div data-slot="stack">
          <DrawerClose data-variant="solid" value="submit">
            Submit
          </DrawerClose>
          <DrawerClose>Cancel</DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { Example }
`}]},{heading:`Scrollable Content`,text:'Put long content in an inner `min-h-0 flex-1 overflow-y-auto` area. A downward drag scrolls that area first; when it reaches the top, the same gesture can move the drawer. `initialFocus="content"` starts focus on the sheet itself.',examples:[{id:`drawer/scrollable`,caption:`Open the long sheet and scroll its text. At the top, drag downward to move the sheet; on a keyboard, Tab reaches the controls and Escape closes it.`,Example:C,source:`import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"

const paragraphs = [
  "The drawer rises from any edge, rests on snap points and follows your finger with the same spring as a system sheet.",
  "Snap points take fractions of the screen, pixels, rem, percentages or the content's own size. Points that land within a pixel of each other merge into one.",
  "Dragging a list scrolls it until it reaches the top, and then the same gesture moves the drawer, so closing a long sheet never needs two tries.",
  "The handle steps through the snap points with a press, the arrow keys, Home and End. Screen readers on phones adjust it like a slider.",
  "Below a snap point you choose, the page behind stays usable and undimmed, like a map with a sheet of results.",
  "Drawers opened from inside each other stack, and the one beneath steps back while the new one rises.",
  "The on-screen keyboard pushes the drawer up, and the focused field scrolls into view inside it, never the page.",
  "With reduced motion, drawers fade in and out instead of sliding.",
]

function Example() {
  return (
    <Drawer>
      <DrawerTrigger>Scrollable Content</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent initialFocus="content">
        <div data-slot="grip" aria-hidden />
        <div data-slot="stack">
          <DrawerTitle>Release notes</DrawerTitle>
          <DrawerDescription>Everything new in the drawer.</DrawerDescription>
        </div>
        <div data-slot="scroll">
          {[...paragraphs, ...paragraphs].map((paragraph, index) => (
            <p data-slot="hint" key={index}>
              {paragraph}
            </p>
          ))}
        </div>
        <div data-slot="stack">
          <DrawerClose data-variant="solid">Got It</DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { Example }
`}]},{heading:`Sides`,text:"`side` chooses bottom, top, left, or right. Logical `start` and `end` follow text direction. The content’s `data-side` tells you which physical edge to style.",examples:[{id:`drawer/sides`,caption:`Open a sheet from each edge. Drag it back toward that edge, press outside, or press Escape to close it.`,Example:T,source:`import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"

const sides = [
  {
    side: "top",
    label: "Top",
    title: "Notifications",
    description: "You're all caught up.",
  },
  {
    side: "right",
    label: "Right",
    title: "Cart",
    description: "2 items, $84.00.",
  },
  {
    side: "bottom",
    label: "Bottom",
    title: "Share",
    description: "Send this page to your team.",
  },
  {
    side: "left",
    label: "Left",
    title: "Menu",
    description: "Jump to a section of the docs.",
  },
] as const

function Example() {
  return (
    <div data-slot="row">
      {sides.map(({ side, label, title, description }) => (
        <Drawer
          key={side}
          side={side}
          preventEdgeSwipe={side === "left" || side === "right"}
        >
          <DrawerTrigger>{label}</DrawerTrigger>
          <DrawerBackdrop />
          <DrawerContent>
            <div data-slot="stack">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </div>
            <DrawerClose data-variant="solid">Close</DrawerClose>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Snap Points`,text:"`snapPoints` are the places the drawer can rest. It opens at the first, or at `defaultSnapPoint`, and settles at another after a drag. A fast fling can skip intermediate points.",examples:[{id:`drawer/snap-points`,caption:`Open the sheet at its middle snap point. Drag it, press the handle, or Tab to the handle and use Up, Down, Home and End to try the other resting points.`,Example:D,source:`import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"

const places = [
  { name: "Blue Bottle Coffee", detail: "Coffee · 0.2 mi" },
  { name: "Tartine Bakery", detail: "Bakery · 0.4 mi" },
  { name: "Dolores Park", detail: "Park · 0.5 mi" },
  { name: "Mission Dolores", detail: "Landmark · 0.6 mi" },
  { name: "Ritual Coffee Roasters", detail: "Coffee · 0.7 mi" },
  { name: "Bi-Rite Creamery", detail: "Ice cream · 0.7 mi" },
  { name: "Alamo Square", detail: "Park · 1.1 mi" },
  { name: "The Castro Theatre", detail: "Cinema · 1.2 mi" },
  { name: "Ferry Building", detail: "Market · 2.3 mi" },
  { name: "Coit Tower", detail: "Landmark · 2.9 mi" },
  { name: "Golden Gate Park", detail: "Park · 3.0 mi" },
  { name: "Lands End", detail: "Trail · 5.4 mi" },
]

function Example() {
  return (
    <Drawer snapPoints={[0.25, 0.5, 1]} defaultSnapPoint={0.5} expandOnScroll>
      <DrawerTrigger>Find a Place</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHandle aria-label="Resize" />
        <div data-slot="stack">
          <DrawerTitle>Places nearby</DrawerTitle>
          <DrawerDescription>
            Drag the drawer, or press the handle, to see more.
          </DrawerDescription>
        </div>
        <div data-slot="scroll">
          <ul data-slot="list">
            {places.map((place) => (
              <li key={place.name}>
                <div>{place.name}</div>
                <div data-slot="hint">{place.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { Example }
`}]},{heading:`Modal`,text:"Set `modalAbove` when the page should stay usable beside a small sheet. At or below that point there is no dim, inert page, scroll lock, or `aria-modal`. Above it, `modal` applies. The switch happens when the drawer settles and does not move focus; `data-interactive` exposes the usable-page state.",examples:[{id:`drawer/non-modal`,caption:`Open directions at the small snap point and choose another place behind the sheet. Expand it to make the sheet modal, then collapse it to use the page again.`,Example:k,source:`"use client"

import * as React from "react"
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"

const places = [
  { name: "Blue Bottle Coffee", detail: "Coffee · 0.2 mi" },
  { name: "Tartine Bakery", detail: "Bakery · 0.4 mi" },
  { name: "Dolores Park", detail: "Park · 0.5 mi" },
  { name: "Mission Dolores", detail: "Landmark · 0.6 mi" },
  { name: "Ritual Coffee Roasters", detail: "Coffee · 0.7 mi" },
]

function Example() {
  const [destination, setDestination] = React.useState(places[0].name)
  return (
    <div data-slot="stack">
      <ul data-slot="list" aria-label="Places">
        {places.map((place) => (
          <li key={place.name}>
            <button
              type="button"
              aria-pressed={destination === place.name}
              onClick={() => setDestination(place.name)}
            >
              {place.name}
              <span data-slot="hint">{place.detail}</span>
            </button>
          </li>
        ))}
      </ul>
      <Drawer snapPoints={[0.2, 0.6]} modalAbove={0.2}>
        <DrawerTrigger>Get Directions</DrawerTrigger>
        <DrawerBackdrop />
        <DrawerContent>
          {(state) => (
            <>
              <DrawerHandle aria-label="Resize" />
              <div data-slot="row">
                <div data-slot="stack">
                  <DrawerTitle>To {destination}</DrawerTitle>
                  <DrawerDescription>
                    {state.interactive
                      ? "12 min walk. Pick another place behind the sheet."
                      : "12 min walk. Drag the sheet down to see the places."}
                  </DrawerDescription>
                </div>
                <DrawerClose>Done</DrawerClose>
              </div>
              <ol data-slot="stack">
                <li>Head north on Valencia St.</li>
                <li>Turn left onto 18th St.</li>
                <li>Arrive at {destination}.</li>
              </ol>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export { Example }
`}]},{heading:`Nested Drawers`,text:"A drawer opened inside another joins its stack. Escape and outside presses affect the topmost one; closing a parent closes its children. `--drawer-stack` follows the sheets above it as they open and drag, so a parent can scale back with `[scale:calc(1-var(--drawer-stack)*0.04)]`.",examples:[{id:`drawer/nested`,caption:`Open Account, then Change Password. The parent steps back as the child opens; Escape closes one sheet at a time.`,Example:A,source:`import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <Drawer>
      <DrawerTrigger>Account</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <div data-slot="grip" aria-hidden />
        <div data-slot="stack">
          <DrawerTitle>Account</DrawerTitle>
          <DrawerDescription>Manage how you sign in.</DrawerDescription>
        </div>
        <dl>
          <div data-slot="row">
            <dt>Email</dt>
            <dd>hollis@example.com</dd>
          </div>
          <div data-slot="row">
            <dt>Password</dt>
            <dd>Changed 3 months ago</dd>
          </div>
          <div data-slot="row">
            <dt>Two-factor</dt>
            <dd>On</dd>
          </div>
        </dl>
        <div data-slot="stack">
          <Drawer>
            <DrawerTrigger>Change Password</DrawerTrigger>
            <DrawerBackdrop />
            <DrawerContent>
              <div data-slot="grip" aria-hidden />
              <div data-slot="stack">
                <DrawerTitle>Change password</DrawerTitle>
                <DrawerDescription>
                  Use at least 12 characters.
                </DrawerDescription>
              </div>
              <Field>
                <FieldLabel>New password</FieldLabel>
                <Input type="password" />
              </Field>
              <div data-slot="stack">
                <DrawerClose data-variant="solid">Update</DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
          <DrawerClose data-variant="solid">Done</DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { Example }
`}]},{heading:`Outlets`,text:"An Outlet makes another element follow the sheet’s progress. Its `keyframes` run from collapsed to fully expanded; this example scales and rounds the inbox behind a compose sheet. An outlet outside the drawer connects through its controller.",examples:[{id:`drawer/outlet`,caption:`Open Compose, then drag the sheet slowly. The inbox behind it scales and rounds with the sheet’s progress.`,Example:M,source:`import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOutlet,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import { Input } from "@ui-sdk/react/input"

const messages = [
  { from: "Inès", text: "The proofs are back from the printer." },
  { from: "Kofi", text: "Lunch on Thursday?" },
  { from: "Wren", text: "Pushed the fix for the release build." },
  { from: "Tomasz", text: "Can you review the launch checklist?" },
]

function Example() {
  return (
    <Drawer>
      <div>
        <DrawerOutlet
          keyframes={{ scale: [1, 0.94], borderRadius: ["0px", "24px"] }}
        >
          <div data-slot="row">
            <span>Inbox</span>
            <DrawerTrigger data-variant="solid">Compose</DrawerTrigger>
          </div>
          <ul data-slot="list">
            {messages.map((message) => (
              <li key={message.from}>
                <div>{message.from}</div>
                <div data-slot="hint">{message.text}</div>
              </li>
            ))}
          </ul>
        </DrawerOutlet>
      </div>
      <DrawerBackdrop />
      <DrawerContent>
        <div data-slot="grip" aria-hidden />
        <div data-slot="stack">
          <DrawerTitle>New message</DrawerTitle>
          <DrawerDescription>Write a quick note to the team.</DrawerDescription>
        </div>
        <Field>
          <FieldLabel>To</FieldLabel>
          <Input defaultValue="Design team" />
        </Field>
        <Field>
          <FieldLabel>Message</FieldLabel>
          <Textarea placeholder="What's new?" />
        </Field>
        <div data-slot="stack">
          <DrawerClose data-variant="solid" value="send">
            Send
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { Example }
`}]},{heading:`Action Sheet`,text:"A sheet can offer choices instead of a form. Give each Close part a `value`; the open Promise returns the chosen action. Escape, an outside press, or a swipe returns no value, which this example treats as Cancel.",examples:[{id:`drawer/action-sheet`,caption:`Open Photo Options and choose an action. The console logs the returned value; dismissing the sheet counts as Cancel.`,Example:N,source:`"use client"

import * as React from "react"
import {
  createDrawerController,
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@ui-sdk/react/drawer"
import { useLog } from "../../../shared/react/log"

type PhotoAction = "share" | "duplicate" | "delete" | "cancel"

function Example() {
  const [photoActions] = React.useState(() =>
    createDrawerController<undefined, PhotoAction>()
  )
  const log = useLog()

  async function choose() {
    const { returnValue = "cancel" } = await photoActions.open()
    log(returnValue === "cancel" ? "Canceled" : \`Chose \${returnValue}\`)
  }

  return (
    <div data-slot="row">
      <button type="button" onClick={choose}>
        Photo Options
      </button>
      <Drawer controller={photoActions}>
        <DrawerBackdrop />
        <DrawerContent>
          <div data-slot="stack">
            <DrawerTitle>Beach.jpg</DrawerTitle>
            <DrawerDescription>Taken today at 9:41.</DrawerDescription>
          </div>
          <div data-slot="stack">
            <DrawerClose value="share">Share</DrawerClose>
            <DrawerClose value="duplicate">Duplicate</DrawerClose>
            <DrawerClose value="delete">Delete</DrawerClose>
            <DrawerClose value="cancel">Cancel</DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`drawer/rtl`,caption:``,Example:F,source:`import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"

const links = ["الرئيسية", "الطلبات", "المنتجات", "العملاء", "الإعدادات"]

export function Example() {
  return (
    <div dir="rtl">
      <Drawer side="start">
        <DrawerTrigger>القائمة</DrawerTrigger>
        <DrawerBackdrop />
        <DrawerContent>
          <div data-slot="stack">
            <DrawerTitle>القائمة</DrawerTitle>
            <DrawerDescription>اسحبها نحو حافتها لإغلاقها.</DrawerDescription>
          </div>
          <nav aria-label="الأقسام">
            <ul>
              {links.map((link) => (
                <li key={link}>
                  <a href="https://example.com">{link}</a>
                </li>
              ))}
            </ul>
          </nav>
          <DrawerClose data-variant="solid">إغلاق</DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
`}]}]};export{I as default};