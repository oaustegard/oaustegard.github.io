import{t as e}from"../chunks/c-BHtAohdq.js";import{useLog as t}from"./log.js";import*as n from"preact/compat";import{jsx as r,jsxs as i}from"preact/compat/jsx-runtime";import{Field as a,FieldDescription as o,FieldError as s,FieldLabel as c}from"ui-sdk/field.js";import{OTPInput as l,OTPInputGroup as u,OTPInputSeparator as d,OTPInputSlot as f}from"ui-sdk/otp-input.js";function p(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Verification code`}),/* @__PURE__ */ i(l,{maxLength:6,children:[/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(f,{index:0}),/* @__PURE__ */ r(f,{index:1}),/* @__PURE__ */ r(f,{index:2})]}),/* @__PURE__ */ r(d,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})}),/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(f,{index:3}),/* @__PURE__ */ r(f,{index:4}),/* @__PURE__ */ r(f,{index:5})]})]})]})}function m(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`PIN`}),/* @__PURE__ */ r(l,{maxLength:4,textAlign:`center`,children:/* @__PURE__ */ r(u,{children:[0,1,2,3].map(e=>/* @__PURE__ */ r(f,{index:e},e))})})]})}function h(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Recovery code`}),/* @__PURE__ */ i(l,{maxLength:8,pattern:`alphanumeric`,children:[/* @__PURE__ */ r(u,{children:[0,1,2,3].map(e=>/* @__PURE__ */ r(f,{index:e},e))}),/* @__PURE__ */ r(d,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})}),/* @__PURE__ */ r(u,{children:[4,5,6,7].map(e=>/* @__PURE__ */ r(f,{index:e},e))})]})]})}function g(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Device code`}),/* @__PURE__ */ r(l,{maxLength:6,pattern:/[0-9A-F]/i,inputMode:`text`,children:/* @__PURE__ */ r(u,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ r(f,{index:e},e))})})]})}function _(){let[e,t]=n.useState(!0);return/* @__PURE__ */ i(a,{invalid:e,children:[/* @__PURE__ */ r(c,{children:`Verification code`}),/* @__PURE__ */ r(l,{defaultValue:`482913`,onValueChange:()=>t(!1),children:/* @__PURE__ */ r(u,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ r(f,{index:e},e))})}),/* @__PURE__ */ r(s,{children:`That code has expired. Request a new one.`})]})}function v(){let e=t(),[o,s]=n.useState(``);return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`One-time password`}),/* @__PURE__ */ r(l,{value:o,onValueChange:(t,n)=>{s(t),e(`${t||`Empty`} (${n.reason})`)},children:/* @__PURE__ */ r(u,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ r(f,{index:e},e))})})]})}function y(){let e=t();return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Verification code`}),/* @__PURE__ */ r(l,{onValueCommit:(t,n)=>e(`Checking ${t} (${n.reason})`),children:/* @__PURE__ */ r(u,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ r(f,{index:e},e))})})]})}function b(){let e=t();return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(`form`,{id:`verify-sign-in`,onSubmit:t=>{t.preventDefault();let n=[...new FormData(t.currentTarget)].map(([e,t])=>`${e}=${t}`);e(`Submitted ${n.join(`, `)}`)},children:/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Verification code`}),/* @__PURE__ */ r(l,{name:`code`,required:!0,children:/* @__PURE__ */ r(u,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ r(f,{index:e},e))})}),/* @__PURE__ */ r(o,{children:`Enter the six-digit code we sent to hollis@example.com.`}),/* @__PURE__ */ r(s,{})]})}),/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(c,{children:`Recovery code (optional)`}),/* @__PURE__ */ r(l,{name:`recovery`,form:`verify-sign-in`,maxLength:8,pattern:`alphanumeric`,children:/* @__PURE__ */ r(u,{children:[0,1,2,3,4,5,6,7].map(e=>/* @__PURE__ */ r(f,{index:e},e))})}),/* @__PURE__ */ r(s,{})]}),/* @__PURE__ */ i(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ r(`button`,{type:`reset`,form:`verify-sign-in`,children:`Reset`}),/* @__PURE__ */ r(`button`,{type:`submit`,form:`verify-sign-in`,"data-variant":`solid`,children:`Verify`})]})]})}function x(){return/* @__PURE__ */ r(l,{maxLength:5,"aria-label":`Invite code`,children:e=>/* @__PURE__ */ r(u,{children:e.slots.map((e,t)=>/* @__PURE__ */ r(f,{index:t,render:/* @__PURE__ */ r(`span`,{}),children:e=>e.char??(e.hasFakeCaret&&/* @__PURE__ */ r(`span`,{}))},t))})})}function S(){return/* @__PURE__ */ i(a,{dir:`rtl`,children:[/* @__PURE__ */ r(c,{children:`رمز التحقق`}),/* @__PURE__ */ r(l,{maxLength:6,children:/* @__PURE__ */ r(u,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ r(f,{index:e},e))})})]})}function C(){return/* @__PURE__ */ i(l,{maxLength:6,"aria-label":`Verification code`,children:[/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(f,{index:0}),/* @__PURE__ */ r(f,{index:1})]}),/* @__PURE__ */ r(d,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})}),/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(f,{index:2}),/* @__PURE__ */ r(f,{index:3})]}),/* @__PURE__ */ r(d,{children:/* @__PURE__ */ r(e,{"aria-hidden":`true`})}),/* @__PURE__ */ i(u,{children:[/* @__PURE__ */ r(f,{index:4}),/* @__PURE__ */ r(f,{index:5})]})]})}var w={name:`otp-input`,title:`OTP Input`,description:`Enter a one-time code with support for pasting, autofill, and native form validation.`,sections:[{heading:null,text:`Use an OTP Input for a short code sent by text or email, like a sign-in or verification code. Each character gets its own slot, and a pasted or autofilled code fills them all at once.`,examples:[{id:`otp-input/basic`,caption:`Type a six-digit code or paste 123-456. Click a slot to edit it, use the arrow keys to move, and use your usual undo shortcut to undo a change.`,Example:p,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from "@ui-sdk/react/otp-input"
import { MinusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Verification code</FieldLabel>
      <OTPInput maxLength={6}>
        <OTPInputGroup>
          <OTPInputSlot index={0} />
          <OTPInputSlot index={1} />
          <OTPInputSlot index={2} />
        </OTPInputGroup>
        <OTPInputSeparator>
          <MinusIcon aria-hidden="true" />
        </OTPInputSeparator>
        <OTPInputGroup>
          <OTPInputSlot index={3} />
          <OTPInputSlot index={4} />
          <OTPInputSlot index={5} />
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Four Digits`,text:"Set `maxLength` to the code's length and render that many slots. The default length is six.",examples:[{id:`otp-input/four-digits`,caption:`Enter four digits in PIN. Once it is full, typing another digit replaces the selected slot. Click another slot to edit it.`,Example:m,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"

function Example() {
  return (
    <Field>
      <FieldLabel>PIN</FieldLabel>
      <OTPInput maxLength={4} textAlign="center">
        <OTPInputGroup>
          {[0, 1, 2, 3].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Alphanumeric`,text:"Set `pattern` to `digits`, `letters`, or `alphanumeric`. The default is `digits`. The pattern filters characters and selects a suitable keyboard on touch devices.",examples:[{id:`otp-input/alphanumeric`,caption:`Type letters and digits into Recovery code, or paste ab12-cd34. The hyphen is removed and the eight characters fill the slots.`,Example:h,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from "@ui-sdk/react/otp-input"
import { MinusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Recovery code</FieldLabel>
      <OTPInput maxLength={8} pattern="alphanumeric">
        <OTPInputGroup>
          {[0, 1, 2, 3].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
        <OTPInputSeparator>
          <MinusIcon aria-hidden="true" />
        </OTPInputSeparator>
        <OTPInputGroup>
          {[4, 5, 6, 7].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Custom Pattern`,text:"Pass a regular expression, such as `/[0-9A-F]/i` to accept hexadecimal characters. Use `inputMode` to choose the keyboard separately. The example displays letters in uppercase without changing their stored case.",examples:[{id:`otp-input/pattern`,caption:`Try typing 12zzab into Device code. The z characters are rejected; the accepted value is 12ab, displayed as 12AB.`,Example:g,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"

function Example() {
  return (
    <Field>
      <FieldLabel>Device code</FieldLabel>
      <OTPInput maxLength={6} pattern={/[0-9A-F]/i} inputMode="text">
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Validation`,text:"Inside a Field, pass `invalid` when your code rejects the value, such as a code the server didn't accept. The field marks the input with `aria-invalid` and connects its `FieldError`. Outside a field, pass `aria-invalid` and `aria-describedby` yourself.",examples:[{id:`otp-input/invalid`,caption:`Verification code is marked invalid, and the error below explains why. Edit any digit to clear the error.`,Example:_,source:`"use client"

import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import * as React from "react"

function Example() {
  const [invalid, setInvalid] = React.useState(true)

  return (
    <Field invalid={invalid}>
      <FieldLabel>Verification code</FieldLabel>
      <OTPInput defaultValue="482913" onValueChange={() => setInvalid(false)}>
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
      <FieldError>That code has expired. Request a new one.</FieldError>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the change callback to reject a change. Incoming values are filtered by the pattern and limited to `maxLength`, just like typed values.",examples:[{id:`otp-input/controlled`,caption:`Enter, paste, or delete digits in One-time password. The console logs each new code and its reason.`,Example:v,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState("")

  return (
    <Field>
      <FieldLabel>One-time password</FieldLabel>
      <OTPInput
        value={value}
        onValueChange={(value, details) => {
          setValue(value)
          log(\`\${value || "Empty"} (\${details.reason})\`)
        }}
      >
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`On Complete`,text:"`onValueCommit` runs when a change fills every slot, including typing, paste, autofill, and controller writes. Changing an already-full code runs it again. Form resets and page restoration do not.",examples:[{id:`otp-input/complete`,caption:`Fill all six slots. The console logs the complete code and the change reason. Replace a digit to log it again; deleting one logs nothing.`,Example:y,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Verification code</FieldLabel>
      <OTPInput
        onValueCommit={(value, details) =>
          log(\`Checking \${value} (\${details.reason})\`)
        }
      >
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Forms`,text:"Set `name` to include the code in `FormData`. `required` blocks an empty code, and a partial code fails length validation. Reset restores the default value. Use `form` to associate a control outside the form with its ID.",examples:[{id:`otp-input/form`,caption:`Choose Verify with an empty or partial code to see validation. Enter all six digits and choose Verify to log the form values. Recovery code sits outside the form but submits with it. Reset clears both fields.`,Example:b,source:`"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <form
        id="verify-sign-in"
        onSubmit={(event) => {
          event.preventDefault()
          const data = [...new FormData(event.currentTarget)].map(
            ([name, value]) => \`\${name}=\${value}\`
          )
          log(\`Submitted \${data.join(", ")}\`)
        }}
      >
        <Field>
          <FieldLabel>Verification code</FieldLabel>
          <OTPInput name="code" required>
            <OTPInputGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <OTPInputSlot key={index} index={index} />
              ))}
            </OTPInputGroup>
          </OTPInput>
          <FieldDescription>
            Enter the six-digit code we sent to hollis@example.com.
          </FieldDescription>
          <FieldError />
        </Field>
      </form>
      <Field>
        <FieldLabel>Recovery code (optional)</FieldLabel>
        <OTPInput
          name="recovery"
          form="verify-sign-in"
          maxLength={8}
          pattern="alphanumeric"
        >
          <OTPInputGroup>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <OTPInputSlot key={index} index={index} />
            ))}
          </OTPInputGroup>
        </OTPInput>
        <FieldError />
      </Field>
      <div data-slot="row">
        <button type="reset" form="verify-sign-in">
          Reset
        </button>
        <button type="submit" form="verify-sign-in" data-variant="solid">
          Verify
        </button>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`otp-input/render`,caption:``,Example:x,source:`"use client"

import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"

function Example() {
  return (
    <OTPInput maxLength={5} aria-label="Invite code">
      {(state) => (
        <OTPInputGroup>
          {state.slots.map((_, index) => (
            <OTPInputSlot key={index} index={index} render={<span />}>
              {(slot) => slot.char ?? (slot.hasFakeCaret && <span />)}
            </OTPInputSlot>
          ))}
        </OTPInputGroup>
      )}
    </OTPInput>
  )
}

export { Example }
`},{id:`otp-input/rtl`,caption:``,Example:S,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"

function Example() {
  return (
    <Field dir="rtl">
      <FieldLabel>رمز التحقق</FieldLabel>
      <OTPInput maxLength={6}>
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
`},{id:`otp-input/separator`,caption:``,Example:C,source:`"use client"

import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from "@ui-sdk/react/otp-input"
import { MinusIcon } from "lucide-react"

function Example() {
  return (
    <OTPInput maxLength={6} aria-label="Verification code">
      <OTPInputGroup>
        <OTPInputSlot index={0} />
        <OTPInputSlot index={1} />
      </OTPInputGroup>
      <OTPInputSeparator>
        <MinusIcon aria-hidden="true" />
      </OTPInputSeparator>
      <OTPInputGroup>
        <OTPInputSlot index={2} />
        <OTPInputSlot index={3} />
      </OTPInputGroup>
      <OTPInputSeparator>
        <MinusIcon aria-hidden="true" />
      </OTPInputSeparator>
      <OTPInputGroup>
        <OTPInputSlot index={4} />
        <OTPInputSlot index={5} />
      </OTPInputGroup>
    </OTPInput>
  )
}

export { Example }
`}]}]};export{w as default};