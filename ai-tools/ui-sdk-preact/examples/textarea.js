import{Co as e,Eo as t,Mo as n,Oo as r,So as i,To as a,ba as o,fl as s,tl as c}from"../chunks/c-CIXE4Nkk.js";function l(){return/* @__PURE__ */ c(e,{name:`message`,children:[/* @__PURE__ */ c(r,{children:`Message`}),/* @__PURE__ */ c(o,{placeholder:`Type your message here…`})]})}function u(){return/* @__PURE__ */ c(e,{name:`feedback`,children:[/* @__PURE__ */ c(r,{children:`Feedback`}),/* @__PURE__ */ c(o,{placeholder:`What could we do better?`}),/* @__PURE__ */ c(a,{children:`Only the product team can see this.`})]})}function d(){return/* @__PURE__ */ c(e,{name:`notes`,children:[/* @__PURE__ */ c(r,{children:`Notes`}),/* @__PURE__ */ c(o,{autoResize:!0,placeholder:`Add notes for the delivery driver…`}),/* @__PURE__ */ c(a,{children:`Your driver sees these notes.`})]})}function f(){let[t,n]=s(`Product designer in Lisbon. I write about type and interfaces.`);return/* @__PURE__ */ c(e,{name:`bio`,children:[/* @__PURE__ */ c(r,{children:`Bio`}),/* @__PURE__ */ c(o,{value:t,onValueChange:n,maxLength:160}),/* @__PURE__ */ c(a,{children:[t.length,` / 160 characters`]})]})}function p(){let t=n(),[a]=s(i);return/* @__PURE__ */ c(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let n=new FormData(e.currentTarget);t(`Sent “${n.get(`message`)}”`),a.clear()},children:[/* @__PURE__ */ c(e,{name:`message`,children:[/* @__PURE__ */ c(r,{children:`Message`}),/* @__PURE__ */ c(o,{controller:a,required:!0,placeholder:`Write a reply to Hollis Grant…`})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:/* @__PURE__ */ c(`button`,{type:`submit`,"data-variant":`solid`,children:`Send Message`})})]})}function m(){return/* @__PURE__ */ c(e,{disabled:!0,children:[/* @__PURE__ */ c(r,{children:`Reply`}),/* @__PURE__ */ c(o,{defaultValue:`Replies are closed for this thread.`})]})}function h(){return/* @__PURE__ */ c(e,{invalid:!0,children:[/* @__PURE__ */ c(r,{children:`Review`}),/* @__PURE__ */ c(o,{defaultValue:`Great.`}),/* @__PURE__ */ c(t,{match:!0,children:`Write at least 20 characters.`})]})}function g(){return/* @__PURE__ */ c(e,{dir:`rtl`,name:`feedback`,children:[/* @__PURE__ */ c(r,{children:`ملاحظاتك`}),/* @__PURE__ */ c(o,{autoResize:!0,placeholder:`أخبرنا برأيك…`}),/* @__PURE__ */ c(a,{children:`نقرأ كل رسالة.`})]})}var _={name:`textarea`,title:`Textarea`,description:`Enter multiple lines of text, grow the field as you type, and connect it to a form.`,sections:[{heading:null,text:`A textarea is a native multi-line text field for messages, notes and descriptions. It works inside a field and a form, can grow with its text, and reports the same change reasons as Input.`,examples:[{id:`textarea/basic`,caption:`Click Message to focus the textarea, then type. Press Enter to start a new line.`,Example:l,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"

function Example() {
  return (
    <Field name="message">
      <FieldLabel>Message</FieldLabel>
      <Textarea placeholder="Type your message here…" />
    </Field>
  )
}

export { Example }
`}]},{heading:`Field`,text:"Wrap the textarea in a Field to give it a visible label and a description. The field also supplies its `name` when the textarea has none.",examples:[{id:`textarea/field`,caption:`Click Feedback to focus the textarea. A screen reader reads the description with the field.`,Example:u,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"

function Example() {
  return (
    <Field name="feedback">
      <FieldLabel>Feedback</FieldLabel>
      <Textarea placeholder="What could we do better?" />
      <FieldDescription>Only the product team can see this.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Auto Resize`,text:"Set `autoResize` to grow and shrink the textarea with its text. CSS `min-height` and `max-height` set its limits; past the maximum, the text scrolls inside it.",examples:[{id:`textarea/auto-resize`,caption:`Type several lines in Notes. The textarea grows with each line until it reaches its maximum height, then scrolls. Delete the lines and it shrinks back.`,Example:d,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"

function Example() {
  return (
    <Field name="notes">
      <FieldLabel>Notes</FieldLabel>
      <Textarea autoResize placeholder="Add notes for the delivery driver…" />
      <FieldDescription>Your driver sees these notes.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Keep `value` in state and update it with `onValueChange`. Here the character count is derived from that value, and the native `maxLength` caps the text.",examples:[{id:`textarea/controlled`,caption:`Edit Bio and watch the character count under it. The textarea stops accepting text at 160 characters.`,Example:f,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import * as React from "react"

function Example() {
  const [bio, setBio] = React.useState(
    "Product designer in Lisbon. I write about type and interfaces."
  )
  return (
    <Field name="bio">
      <FieldLabel>Bio</FieldLabel>
      <Textarea value={bio} onValueChange={setBio} maxLength={160} />
      <FieldDescription>{bio.length} / 160 characters</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Form`,text:"A textarea submits its value through a native form under its field's `name`. Pass a controller from `createInputController()` to change it from outside, here to empty it after sending. The native `required` constraint blocks an empty message.",examples:[{id:`textarea/button`,caption:`Type a message and press Send Message. The console logs it and the textarea clears. Pressing Send Message while it's empty is blocked.`,Example:p,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea, createInputController } from "@ui-sdk/react/textarea"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [message] = React.useState(createInputController)
  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        log(\`Sent “\${data.get("message")}”\`)
        message.clear()
      }}
    >
      <Field name="message">
        <FieldLabel>Message</FieldLabel>
        <Textarea
          controller={message}
          required
          placeholder="Write a reply to Hollis Grant…"
        />
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Send Message
        </button>
      </div>
    </form>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` on the textarea or its field to prevent editing and leave it out of the tab order and the submitted values.",examples:[{id:`textarea/disabled`,caption:`Try to edit Reply or reach it with Tab. The disabled textarea keeps its value but can't be changed.`,Example:m,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"

function Example() {
  return (
    <Field disabled>
      <FieldLabel>Reply</FieldLabel>
      <Textarea defaultValue="Replies are closed for this thread." />
    </Field>
  )
}

export { Example }
`}]},{heading:`Invalid`,text:"Set `invalid` on the field for an error your app decides. The field shows its error, associates it with the textarea and sets `aria-invalid`. Field covers native constraints and error matches.",examples:[{id:`textarea/invalid`,caption:`Focus Review. The textarea is marked invalid, and the error below says how long the review should be.`,Example:h,source:`import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"

function Example() {
  return (
    <Field invalid>
      <FieldLabel>Review</FieldLabel>
      <Textarea defaultValue="Great." />
      <FieldError match>Write at least 20 characters.</FieldError>
    </Field>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`textarea/rtl`,caption:``,Example:g,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"

function Example() {
  return (
    <Field dir="rtl" name="feedback">
      <FieldLabel>ملاحظاتك</FieldLabel>
      <Textarea autoResize placeholder="أخبرنا برأيك…" />
      <FieldDescription>نقرأ كل رسالة.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]}]};export{_ as default};