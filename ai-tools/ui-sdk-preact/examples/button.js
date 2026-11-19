import{Co as e,Mo as t,Oo as n,Ws as r,fl as i,gs as a,jn as o,ll as s,tc as c,tl as l,yo as u}from"../chunks/c-CIXE4Nkk.js";function d(){let e=t();return/* @__PURE__ */ l(o,{onClick:()=>e(`Pressed`),children:`Button`})}const f=e=>new Promise(t=>setTimeout(t,e));function p(){return/* @__PURE__ */ l(o,{onClick:()=>f(1500),pendingAnnouncement:`Saving`,children:`Save`})}const m=e=>new Promise(t=>setTimeout(t,e));function h(){return/* @__PURE__ */ l(o,{onClick:()=>m(1500),pendingAnnouncement:`Saving`,children:[/* @__PURE__ */ l(c,{"data-show":`idle`,"aria-hidden":`true`}),/* @__PURE__ */ l(a,{"data-show":`pending`,"data-slot":`spinner`,"aria-hidden":`true`}),`Save`]})}const g=e=>new Promise(t=>setTimeout(t,e));function _(){let e=t();return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ l(o,{onClick:async()=>{throw await g(1e3),e(`Couldn't save. Check your connection and try again.`),Error(`Couldn't save`)},render:(e,t)=>/* @__PURE__ */ l(`button`,{...e,children:t.pending?`Saving…`:t.error?`Try Again`:`Save Changes`})})})}function v(){return/* @__PURE__ */ l(o,{disabled:!0,children:`Disabled`})}function y(){let r=t(),[a,c]=i(``),d=s(),f=a.trim()!==``;return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ l(e,{children:[/* @__PURE__ */ l(n,{children:`Title`}),/* @__PURE__ */ l(u,{value:a,onValueChange:e=>c(e)})]}),/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(o,{disabled:!f,focusableWhenDisabled:!0,"aria-describedby":d,onClick:()=>r(`Published “${a}”`),children:`Publish`}),/* @__PURE__ */ l(`p`,{id:d,"data-slot":`hint`,children:f?`Ready to publish.`:`Add a title to publish.`})]})]})}function b(){return/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(o,{render:/* @__PURE__ */ l(`a`,{href:`#installation`}),children:`Get Started`}),/* @__PURE__ */ l(o,{disabled:!0,render:/* @__PURE__ */ l(`a`,{href:`#changelog`}),children:`Changelog`})]})}function x(){let r=t();return/* @__PURE__ */ l(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let t=String(new FormData(e.currentTarget).get(`email`));r(`Subscribed ${t}`)},children:[/* @__PURE__ */ l(e,{children:[/* @__PURE__ */ l(n,{children:`Email`}),/* @__PURE__ */ l(u,{name:`email`,type:`email`,defaultValue:`ada@example.com`})]}),/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(o,{type:`submit`,children:`Subscribe`}),/* @__PURE__ */ l(o,{type:`reset`,children:`Reset`})]})]})}function S(){return/* @__PURE__ */ l(`div`,{"data-slot":`row`,dir:`rtl`,children:[/* @__PURE__ */ l(o,{children:[`متابعة`,/* @__PURE__ */ l(r,{})]}),/* @__PURE__ */ l(o,{children:`إلغاء`})]})}var C={name:`button`,title:`Button`,description:`Run an action, show that it's working, and keep it reachable when disabled.`,sections:[{heading:null,text:"Button renders a native `button` and adds what it doesn't do on its own: it stays pending while an async action runs, so a form can't submit twice, announces slow actions to screen readers, can stay focusable while disabled, and keeps the same behavior when it renders a link. For a plain click handler, a native `button` is enough.",examples:[{id:`button/basic`,caption:`Click Button, or focus it and press Enter or Space. The console logs each press.`,Example:d,source:`import { Button } from "@ui-sdk/react/button"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return <Button onClick={() => log("Pressed")}>Button</Button>
}

export { Example }
`}]},{heading:`Pending`,text:"Return a Promise from `onClick` to keep the button pending until it settles. The button keeps focus and ignores further presses while it waits.",examples:[{id:`button/pending`,caption:`Press Save, then press it again while it saves. Nothing happens until the first action finishes.`,Example:p,source:`"use client"

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
`}]},{heading:`Pending Content`,text:'To change what the button shows while it waits, mark content with `data-show="idle"` or `data-show="pending"` and hide it in the other state with one CSS rule each, or use Tailwind\'s `in-data-pending` variant:',examples:[{id:`button/pending-content`,caption:`Press Save. Its arrow turns into a spinner while it saves.`,Example:h,source:`"use client"

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
`}]},{heading:`Handling Errors`,text:"If the handler throws or its Promise rejects, `state.error` holds the error. Use it to show a message or a retry label. The next press clears the error and runs the handler again.",examples:[{id:`button/render`,caption:`Choose Save Changes. Saving always fails here: the console shows the error and the label changes to Try Again.`,Example:_,source:`"use client"

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
`}]},{heading:`Disabled`,text:"Set `disabled` to prevent presses and remove the button from the tab order. A disabled `<fieldset>` around the button disables it too.",examples:[{id:`button/disabled`,caption:`Try clicking the button. It does nothing, and Tab skips it.`,Example:v,source:`import { Button } from "@ui-sdk/react/button"

function Example() {
  return <Button disabled>Disabled</Button>
}

export { Example }
`}]},{heading:`Focusable When Disabled`,text:"Add `focusableWhenDisabled` when people should still be able to focus a disabled button. It uses `aria-disabled` instead of the native `disabled` attribute. Presses still do nothing.",examples:[{id:`button/focusable-when-disabled`,caption:`Focus Title, then press Tab to reach Publish while it is disabled. Enter a title to enable it, then choose Publish. The console logs what was published.`,Example:y,source:`"use client"

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
`}]},{heading:`Links`,text:"Pass an `<a>` to `render` to make a link. It keeps its `href` and link semantics, including opening in a new tab. A disabled link cannot navigate and leaves the tab order.",examples:[{id:`button/link`,caption:`Choose Get Started to jump to Installation on this page. Changelog is disabled and does not navigate.`,Example:b,source:`import { Button } from "@ui-sdk/react/button"

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
`}]},{heading:`Forms`,text:'Set `type="submit"` to submit a form or `type="reset"` to restore its default values. The default, `type="button"`, does neither.',examples:[{id:`button/form`,caption:`Edit the email and choose Subscribe, or press Enter in the field. The console logs each submission, and Reset restores the original email.`,Example:x,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`button/rtl`,caption:``,Example:S,source:`import { Button } from "@ui-sdk/react/button"
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
`}]}]};export{C as default};