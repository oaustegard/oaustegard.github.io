import{Cn as e,Co as t,En as n,Eo as r,Mo as i,Oo as a,Tn as o,To as s,fl as c,fs as l,tl as u,wn as d}from"../chunks/c-CIXE4Nkk.js";function f(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`Verification code`}),/* @__PURE__ */ u(e,{maxLength:6,children:[/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ u(n,{index:0}),/* @__PURE__ */ u(n,{index:1}),/* @__PURE__ */ u(n,{index:2})]}),/* @__PURE__ */ u(o,{children:/* @__PURE__ */ u(l,{"aria-hidden":`true`})}),/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ u(n,{index:3}),/* @__PURE__ */ u(n,{index:4}),/* @__PURE__ */ u(n,{index:5})]})]})]})}function p(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`PIN`}),/* @__PURE__ */ u(e,{maxLength:4,textAlign:`center`,children:/* @__PURE__ */ u(d,{children:[0,1,2,3].map(e=>/* @__PURE__ */ u(n,{index:e},e))})})]})}function m(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`Recovery code`}),/* @__PURE__ */ u(e,{maxLength:8,pattern:`alphanumeric`,children:[/* @__PURE__ */ u(d,{children:[0,1,2,3].map(e=>/* @__PURE__ */ u(n,{index:e},e))}),/* @__PURE__ */ u(o,{children:/* @__PURE__ */ u(l,{"aria-hidden":`true`})}),/* @__PURE__ */ u(d,{children:[4,5,6,7].map(e=>/* @__PURE__ */ u(n,{index:e},e))})]})]})}function h(){return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`Device code`}),/* @__PURE__ */ u(e,{maxLength:6,pattern:/[0-9A-F]/i,inputMode:`text`,children:/* @__PURE__ */ u(d,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ u(n,{index:e},e))})})]})}function g(){let[i,o]=c(!0);return/* @__PURE__ */ u(t,{invalid:i,children:[/* @__PURE__ */ u(a,{children:`Verification code`}),/* @__PURE__ */ u(e,{defaultValue:`482913`,onValueChange:()=>o(!1),children:/* @__PURE__ */ u(d,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ u(n,{index:e},e))})}),/* @__PURE__ */ u(r,{children:`That code has expired. Request a new one.`})]})}function _(){let r=i(),[o,s]=c(``);return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`One-time password`}),/* @__PURE__ */ u(e,{value:o,onValueChange:(e,t)=>{s(e),r(`${e||`Empty`} (${t.reason})`)},children:/* @__PURE__ */ u(d,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ u(n,{index:e},e))})})]})}function v(){let r=i();return/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`Verification code`}),/* @__PURE__ */ u(e,{onValueCommit:(e,t)=>r(`Checking ${e} (${t.reason})`),children:/* @__PURE__ */ u(d,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ u(n,{index:e},e))})})]})}function y(){let o=i();return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`form`,{id:`verify-sign-in`,onSubmit:e=>{e.preventDefault();let t=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);o(`Submitted ${t.join(`, `)}`)},children:/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`Verification code`}),/* @__PURE__ */ u(e,{name:`code`,required:!0,children:/* @__PURE__ */ u(d,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ u(n,{index:e},e))})}),/* @__PURE__ */ u(s,{children:`Enter the six-digit code we sent to hollis@example.com.`}),/* @__PURE__ */ u(r,{})]})}),/* @__PURE__ */ u(t,{children:[/* @__PURE__ */ u(a,{children:`Recovery code (optional)`}),/* @__PURE__ */ u(e,{name:`recovery`,form:`verify-sign-in`,maxLength:8,pattern:`alphanumeric`,children:/* @__PURE__ */ u(d,{children:[0,1,2,3,4,5,6,7].map(e=>/* @__PURE__ */ u(n,{index:e},e))})}),/* @__PURE__ */ u(r,{})]}),/* @__PURE__ */ u(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(`button`,{type:`reset`,form:`verify-sign-in`,children:`Reset`}),/* @__PURE__ */ u(`button`,{type:`submit`,form:`verify-sign-in`,"data-variant":`solid`,children:`Verify`})]})]})}function b(){return/* @__PURE__ */ u(e,{maxLength:5,"aria-label":`Invite code`,children:e=>/* @__PURE__ */ u(d,{children:e.slots.map((e,t)=>/* @__PURE__ */ u(n,{index:t,render:/* @__PURE__ */ u(`span`,{}),children:e=>e.char??(e.hasFakeCaret&&/* @__PURE__ */ u(`span`,{}))},t))})})}function x(){return/* @__PURE__ */ u(t,{dir:`rtl`,children:[/* @__PURE__ */ u(a,{children:`رمز التحقق`}),/* @__PURE__ */ u(e,{maxLength:6,children:/* @__PURE__ */ u(d,{children:[0,1,2,3,4,5].map(e=>/* @__PURE__ */ u(n,{index:e},e))})})]})}function S(){return/* @__PURE__ */ u(e,{maxLength:6,"aria-label":`Verification code`,children:[/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ u(n,{index:0}),/* @__PURE__ */ u(n,{index:1})]}),/* @__PURE__ */ u(o,{children:/* @__PURE__ */ u(l,{"aria-hidden":`true`})}),/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ u(n,{index:2}),/* @__PURE__ */ u(n,{index:3})]}),/* @__PURE__ */ u(o,{children:/* @__PURE__ */ u(l,{"aria-hidden":`true`})}),/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ u(n,{index:4}),/* @__PURE__ */ u(n,{index:5})]})]})}var C={name:`otp-input`,title:`OTP Input`,description:`Enter a one-time code with support for pasting, autofill, and native form validation.`,sections:[{heading:null,text:`Use an OTP Input for a short code sent by text or email, like a sign-in or verification code. Each character gets its own slot, and a pasted or autofilled code fills them all at once.`,examples:[{id:`otp-input/basic`,caption:`Type a six-digit code or paste 123-456. Click a slot to edit it, use the arrow keys to move, and use your usual undo shortcut to undo a change.`,Example:f,source:`"use client"

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
`}]},{heading:`Four Digits`,text:"Set `maxLength` to the code's length and render that many slots. The default length is six.",examples:[{id:`otp-input/four-digits`,caption:`Enter four digits in PIN. Once it is full, typing another digit replaces the selected slot. Click another slot to edit it.`,Example:p,source:`"use client"

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
`}]},{heading:`Alphanumeric`,text:"Set `pattern` to `digits`, `letters`, or `alphanumeric`. The default is `digits`. The pattern filters characters and selects a suitable keyboard on touch devices.",examples:[{id:`otp-input/alphanumeric`,caption:`Type letters and digits into Recovery code, or paste ab12-cd34. The hyphen is removed and the eight characters fill the slots.`,Example:m,source:`"use client"

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
`}]},{heading:`Custom Pattern`,text:"Pass a regular expression, such as `/[0-9A-F]/i` to accept hexadecimal characters. Use `inputMode` to choose the keyboard separately. The example displays letters in uppercase without changing their stored case.",examples:[{id:`otp-input/pattern`,caption:`Try typing 12zzab into Device code. The z characters are rejected; the accepted value is 12ab, displayed as 12AB.`,Example:h,source:`"use client"

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
`}]},{heading:`Validation`,text:"Inside a Field, pass `invalid` when your code rejects the value, such as a code the server didn't accept. The field marks the input with `aria-invalid` and connects its `FieldError`. Outside a field, pass `aria-invalid` and `aria-describedby` yourself.",examples:[{id:`otp-input/invalid`,caption:`Verification code is marked invalid, and the error below explains why. Edit any digit to clear the error.`,Example:g,source:`"use client"

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
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the change callback to reject a change. Incoming values are filtered by the pattern and limited to `maxLength`, just like typed values.",examples:[{id:`otp-input/controlled`,caption:`Enter, paste, or delete digits in One-time password. The console logs each new code and its reason.`,Example:_,source:`"use client"

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
`}]},{heading:`On Complete`,text:"`onValueCommit` runs when a change fills every slot, including typing, paste, autofill, and controller writes. Changing an already-full code runs it again. Form resets and page restoration do not.",examples:[{id:`otp-input/complete`,caption:`Fill all six slots. The console logs the complete code and the change reason. Replace a digit to log it again; deleting one logs nothing.`,Example:v,source:`"use client"

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
`}]},{heading:`Forms`,text:"Set `name` to include the code in `FormData`. `required` blocks an empty code, and a partial code fails length validation. Reset restores the default value. Use `form` to associate a control outside the form with its ID.",examples:[{id:`otp-input/form`,caption:`Choose Verify with an empty or partial code to see validation. Enter all six digits and choose Verify to log the form values. Recovery code sits outside the form but submits with it. Reset clears both fields.`,Example:y,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`otp-input/render`,caption:``,Example:b,source:`"use client"

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
`},{id:`otp-input/rtl`,caption:``,Example:x,source:`"use client"

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
`},{id:`otp-input/separator`,caption:``,Example:S,source:`"use client"

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
`}]}]};export{C as default};