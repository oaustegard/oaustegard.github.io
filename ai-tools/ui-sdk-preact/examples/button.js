import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-CU-88Fi-.js";import{t as n}from"../chunks/c-D5QH3sUe.js";import{useLog as r}from"./log.js";import*as i from"preact/compat";import{jsx as a,jsxs as o}from"preact/compat/jsx-runtime";import{Field as s,FieldLabel as c}from"ui-sdk/field.js";import{Input as l}from"ui-sdk/input.js";import{Button as u}from"ui-sdk/button.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const d={name:`arrow-down-to-line`,size:24,node:[[`path`,{d:`M12 17V3`,key:`1cwfxf`}],[`path`,{d:`m6 11 6 6 6-6`,key:`12ii2o`}],[`path`,{d:`M19 21H5`,key:`150jfl`}]]};d.node;const f=e(d);function p(){let e=r();return/* @__PURE__ */ a(u,{onClick:()=>e(`Pressed`),children:`Button`})}const m=e=>new Promise(t=>setTimeout(t,e));function h(){return/* @__PURE__ */ a(u,{onClick:()=>m(1500),pendingAnnouncement:`Saving`,children:`Save`})}const g=e=>new Promise(t=>setTimeout(t,e));function _(){return/* @__PURE__ */ o(u,{onClick:()=>g(1500),pendingAnnouncement:`Saving`,children:[/* @__PURE__ */ a(f,{"data-show":`idle`,"aria-hidden":`true`}),/* @__PURE__ */ a(n,{"data-show":`pending`,"data-slot":`spinner`,"aria-hidden":`true`}),`Save`]})}const v=e=>new Promise(t=>setTimeout(t,e));function y(){let e=r();return/* @__PURE__ */ a(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ a(u,{onClick:async()=>{throw await v(1e3),e(`Couldn't save. Check your connection and try again.`),Error(`Couldn't save`)},render:(e,t)=>/* @__PURE__ */ a(`button`,{...e,children:t.pending?`Saving…`:t.error?`Try Again`:`Save Changes`})})})}function b(){return/* @__PURE__ */ a(u,{disabled:!0,children:`Disabled`})}function x(){let e=r(),[t,n]=i.useState(``),d=i.useId(),f=t.trim()!==``;return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(c,{children:`Title`}),/* @__PURE__ */ a(l,{value:t,onValueChange:e=>n(e)})]}),/* @__PURE__ */ o(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ a(u,{disabled:!f,focusableWhenDisabled:!0,"aria-describedby":d,onClick:()=>e(`Published “${t}”`),children:`Publish`}),/* @__PURE__ */ a(`p`,{id:d,"data-slot":`hint`,children:f?`Ready to publish.`:`Add a title to publish.`})]})]})}function S(){return/* @__PURE__ */ o(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ a(u,{render:/* @__PURE__ */ a(`a`,{href:`#installation`}),children:`Get Started`}),/* @__PURE__ */ a(u,{disabled:!0,render:/* @__PURE__ */ a(`a`,{href:`#changelog`}),children:`Changelog`})]})}function C(){let e=r();return/* @__PURE__ */ o(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault();let n=String(new FormData(t.currentTarget).get(`email`));e(`Subscribed ${n}`)},children:[/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(c,{children:`Email`}),/* @__PURE__ */ a(l,{name:`email`,type:`email`,defaultValue:`ada@example.com`})]}),/* @__PURE__ */ o(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ a(u,{type:`submit`,children:`Subscribe`}),/* @__PURE__ */ a(u,{type:`reset`,children:`Reset`})]})]})}function w(){return/* @__PURE__ */ o(`div`,{"data-slot":`row`,dir:`rtl`,children:[/* @__PURE__ */ o(u,{children:[`متابعة`,/* @__PURE__ */ a(t,{})]}),/* @__PURE__ */ a(u,{children:`إلغاء`})]})}var T={name:`button`,title:`Button`,description:`Run an action, show that it's working, and keep it reachable when disabled.`,sections:[{heading:null,text:"Button renders a native `button` and adds what it doesn't do on its own: it stays pending while an async action runs, so a form can't submit twice, announces slow actions to screen readers, can stay focusable while disabled, and keeps the same behavior when it renders a link. For a plain click handler, a native `button` is enough.",examples:[{id:`button/basic`,caption:`Click Button, or focus it and press Enter or Space. The console logs each press.`,Example:p,source:`import { Button } from "@ui-sdk/react/button"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return <Button onClick={() => log("Pressed")}>Button</Button>
}

export { Example }
`}]},{heading:`Pending`,text:"Return a Promise from `onClick` to keep the button pending until it settles. The button keeps focus and ignores further presses while it waits.",examples:[{id:`button/pending`,caption:`Press Save, then press it again while it saves. Nothing happens until the first action finishes.`,Example:h,source:`"use client"

import { Button } from "@ui-sdk/react/button"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Example() {
  return (
    <Button onClick={() => wait(1500)} pendingAnnouncement="Saving">
      Save
    </Button>
  )
}

export { Example }
`}]},{heading:`Pending Content`,text:'To change what the button shows while it waits, mark content with `data-show="idle"` or `data-show="pending"` and hide it in the other state with one CSS rule each, or use Tailwind\'s `in-data-pending` variant:',examples:[{id:`button/pending-content`,caption:`Press Save. Its arrow turns into a spinner while it saves.`,Example:_,source:`"use client"

import { Button } from "@ui-sdk/react/button"
import { ArrowDownToLineIcon, LoaderCircleIcon } from "lucide-react"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Example() {
  return (
    <Button onClick={() => wait(1500)} pendingAnnouncement="Saving">
      <ArrowDownToLineIcon data-show="idle" aria-hidden="true" />
      <LoaderCircleIcon
        data-show="pending"
        data-slot="spinner"
        aria-hidden="true"
      />
      Save
    </Button>
  )
}

export { Example }
`}]},{heading:`Handling Errors`,text:"If the handler throws or its Promise rejects, `state.error` holds the error. Use it to show a message or a retry label. The next press clears the error and runs the handler again.",examples:[{id:`button/render`,caption:`Choose Save Changes. Saving always fails here: the console shows the error and the label changes to Try Again.`,Example:y,source:`"use client"

import { Button } from "@ui-sdk/react/button"
import { useLog } from "../../../shared/react/log"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <Button
        onClick={async () => {
          await wait(1000)
          log("Couldn't save. Check your connection and try again.")
          throw new Error("Couldn't save")
        }}
        render={(props, state) => (
          <button {...props}>
            {state.pending
              ? "Saving…"
              : state.error
                ? "Try Again"
                : "Save Changes"}
          </button>
        )}
      />
    </div>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` to prevent presses and remove the button from the tab order. A disabled `<fieldset>` around the button disables it too.",examples:[{id:`button/disabled`,caption:`Try clicking the button. It does nothing, and Tab skips it.`,Example:b,source:`import { Button } from "@ui-sdk/react/button"

function Example() {
  return <Button disabled>Disabled</Button>
}

export { Example }
`}]},{heading:`Focusable When Disabled`,text:"Add `focusableWhenDisabled` when people should still be able to focus a disabled button. It uses `aria-disabled` instead of the native `disabled` attribute. Presses still do nothing.",examples:[{id:`button/focusable-when-disabled`,caption:`Focus Title, then press Tab to reach Publish while it is disabled. Enter a title to enable it, then choose Publish. The console logs what was published.`,Example:x,source:`"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [title, setTitle] = React.useState("")
  const hint = React.useId()
  const ready = title.trim() !== ""

  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input value={title} onValueChange={(value) => setTitle(value)} />
      </Field>
      <div data-slot="row">
        <Button
          disabled={!ready}
          focusableWhenDisabled
          aria-describedby={hint}
          onClick={() => log(\`Published “\${title}”\`)}
        >
          Publish
        </Button>
        <p id={hint} data-slot="hint">
          {ready ? "Ready to publish." : "Add a title to publish."}
        </p>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Links`,text:"Pass an `<a>` to `render` to make a link. It keeps its `href` and link semantics, including opening in a new tab. A disabled link cannot navigate and leaves the tab order.",examples:[{id:`button/link`,caption:`Choose Get Started to jump to Installation on this page. Changelog is disabled and does not navigate.`,Example:S,source:`import { Button } from "@ui-sdk/react/button"

function Example() {
  return (
    <div data-slot="row">
      <Button render={<a href="#installation" />}>Get Started</Button>
      <Button disabled render={<a href="#changelog" />}>
        Changelog
      </Button>
    </div>
  )
}

export { Example }
`}]},{heading:`Forms`,text:'Set `type="submit"` to submit a form or `type="reset"` to restore its default values. The default, `type="button"`, does neither.',examples:[{id:`button/form`,caption:`Edit the email and choose Subscribe, or press Enter in the field. The console logs each submission, and Reset restores the original email.`,Example:C,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Button } from "@ui-sdk/react/button"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const email = String(new FormData(event.currentTarget).get("email"))
        log(\`Subscribed \${email}\`)
      }}
    >
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input name="email" type="email" defaultValue="ada@example.com" />
      </Field>
      <div data-slot="row">
        <Button type="submit">Subscribe</Button>
        <Button type="reset">Reset</Button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`button/rtl`,caption:``,Example:w,source:`import { Button } from "@ui-sdk/react/button"
import { ChevronRightIcon } from "lucide-react"

export function Example() {
  return (
    <div data-slot="row" dir="rtl">
      <Button>
        متابعة
        <ChevronRightIcon />
      </Button>
      <Button>إلغاء</Button>
    </div>
  )
}
`}]}]};export{T as default};