import{t as e}from"../chunks/c-C1ErRzDB.js";import{useLog as t}from"./log.js";import*as n from"preact/compat";import{jsx as r,jsxs as i}from"preact/compat/jsx-runtime";import{Field as a,FieldLabel as o}from"ui-sdk/field.js";import{Rating as s,RatingItem as c,createRatingController as l}from"ui-sdk/rating.js";function u(){return/* @__PURE__ */ r(s,{"aria-label":`Rating`,defaultValue:3,children:/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})})}function d(){return/* @__PURE__ */ r(s,{"aria-label":`Rating`,step:.5,defaultValue:3.5,children:/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})})}function f(){return/* @__PURE__ */ r(s,{"aria-label":`Rating`,defaultValue:4,deselectable:!0,children:/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})})}function p(){return/* @__PURE__ */ r(s,{value:4.2,readOnly:!0,getValueLabel:(e,t)=>`Rated ${e} out of ${t}`,children:/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})})}function m(){return/* @__PURE__ */ r(s,{"aria-label":`Rating`,defaultValue:2,disabled:!0,children:/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})})}function h(){let a=t(),[o]=n.useState(()=>l()),[u,d]=n.useState(4);return/* @__PURE__ */ i(`div`,{children:[/* @__PURE__ */ r(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>o.setValue(null),children:`Clear Rating`})}),/* @__PURE__ */ r(s,{"aria-label":`Rating`,value:u,onValueChange:(e,t)=>{d(e),a(`value: ${e} (${t.reason})`)},controller:o,children:/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})})]})}function g(){let n=t();return/* @__PURE__ */ i(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault(),n(`Submitted stay=${new FormData(e.currentTarget).get(`stay`)}`)},children:[/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(o,{children:`Rate your stay`}),/* @__PURE__ */ r(s,{name:`stay`,required:!0,children:/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})})})]}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(`button`,{type:`submit`,"data-variant":`solid`,children:`Send Review`}),/* @__PURE__ */ r(`button`,{type:`reset`,children:`Reset`})]})]})}var _={name:`rating`,title:`Rating`,description:`Pick a score from a row of stars, whole or half, with a preview as the pointer moves over them.`,sections:[{heading:null,text:`Use a rating to collect a score, like how a stay went, or to show one, like an average. Each star is a radio, so it works like a radio group, with one value and a single tab stop.`,examples:[{id:`rating/basic`,caption:`Choose a star, then use the arrow keys to change the score.`,Example:u,source:`"use client"

import { Rating, RatingItem } from "@ui-sdk/react/rating"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <Rating aria-label="Rating" defaultValue={3}>
      <RatingItem>
        <StarIcon aria-hidden="true" />
      </RatingItem>
    </Rating>
  )
}

export { Example }
`}]},{heading:`Half Stars`,text:'Set `step={0.5}` to split each star in two. Each half is its own radio, named like "2.5 stars", and a press on the first half of a star picks the half score.',examples:[{id:`rating/half-stars`,caption:`Choose the first half of a star. Its star fills halfway.`,Example:d,source:`"use client"

import { Rating, RatingItem } from "@ui-sdk/react/rating"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <Rating aria-label="Rating" step={0.5} defaultValue={3.5}>
      <RatingItem>
        <StarIcon aria-hidden="true" />
      </RatingItem>
    </Rating>
  )
}

export { Example }
`}]},{heading:`Deselectable`,text:"Set `deselectable` to let people clear their score: a press on the checked star, or Space on it, sets the score back to `null`.",examples:[{id:`rating/deselectable`,caption:`Press the fourth star. The score clears.`,Example:f,source:`"use client"

import { Rating, RatingItem } from "@ui-sdk/react/rating"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <Rating aria-label="Rating" defaultValue={4} deselectable>
      <RatingItem>
        <StarIcon aria-hidden="true" />
      </RatingItem>
    </Rating>
  )
}

export { Example }
`}]},{heading:`Read-Only`,text:"Set `readOnly` to show a score that can't change, like an average. Any score shows, like 4.2, which fills a fifth of the last star. The rating becomes one image for screen readers, and its radios are hidden from them.",examples:[{id:`rating/read-only`,caption:`An average of 4.2, named Rated 4.2 out of 5.`,Example:p,source:`"use client"

import { Rating, RatingItem } from "@ui-sdk/react/rating"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <Rating
      value={4.2}
      readOnly
      getValueLabel={(value, max) => \`Rated \${value} out of \${max}\`}
    >
      <RatingItem>
        <StarIcon aria-hidden="true" />
      </RatingItem>
    </Rating>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` to stop every star from being focused or changed. A disabled rating submits nothing.",examples:[{id:`rating/disabled`,caption:`The rating is disabled, so the stars can't be focused or pressed.`,Example:m,source:`"use client"

import { Rating, RatingItem } from "@ui-sdk/react/rating"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <Rating aria-label="Rating" defaultValue={2} disabled>
      <RatingItem>
        <StarIcon aria-hidden="true" />
      </RatingItem>
    </Rating>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the callback to keep the current score. A controller from `createRatingController()` sets the score from anywhere, like the Clear Rating button below. Create one controller per mounted rating.",examples:[{id:`rating/controlled`,caption:`Choose a star, then press Clear Rating. The console logs each change and its reason.`,Example:h,source:`"use client"

import {
  createRatingController,
  Rating,
  RatingItem,
} from "@ui-sdk/react/rating"
import { StarIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [rating] = React.useState(() => createRatingController())
  const [value, setValue] = React.useState<number | null>(4)

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => rating.setValue(null)}>
          Clear Rating
        </button>
      </div>
      <Rating
        aria-label="Rating"
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(\`value: \${next} (\${details.reason})\`)
        }}
        controller={rating}
      >
        <RatingItem>
          <StarIcon aria-hidden="true" />
        </RatingItem>
      </Rating>
    </div>
  )
}

export { Example }
`}]},{heading:`Form`,text:"Each radio renders a hidden native radio, so the rating takes part in forms. Set `name` to submit the score; nothing submits without a name or a score. `required` blocks submission until there's a score, and a reset returns to `defaultValue`.",examples:[{id:`rating/form`,caption:`Press Send Review without a score to see the browser's message. Choose a star and send it again.`,Example:g,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Rating, RatingItem } from "@ui-sdk/react/rating"
import { StarIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(\`Submitted stay=\${new FormData(event.currentTarget).get("stay")}\`)
      }}
    >
      <Field>
        <FieldLabel>Rate your stay</FieldLabel>
        <Rating name="stay" required>
          <RatingItem>
            <StarIcon aria-hidden="true" />
          </RatingItem>
        </Rating>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Send Review
        </button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
`}]}]};export{_ as default};