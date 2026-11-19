import{An as e,Co as t,Dn as n,Ds as r,Fo as i,Mo as a,On as o,Oo as s,Os as c,To as l,fl as u,hs as d,kn as f,ml as p,qs as m,tl as h,yo as g}from"../chunks/c-CIXE4Nkk.js";function _(){return/* @__PURE__ */ h(t,{name:`password`,children:[/* @__PURE__ */ h(s,{children:`Password`}),/* @__PURE__ */ h(n,{children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ h(l,{children:`Use at least 8 characters.`})]})}const v=[{label:`At least 8 characters`,test:e=>e.length>=8},{label:`A number`,test:e=>/\d/.test(e)},{label:`An uppercase and a lowercase letter`,test:e=>/[a-z]/.test(e)&&/[A-Z]/.test(e)}];function y(){let[e,a]=u(``);return/* @__PURE__ */ h(t,{name:`new-password`,children:[/* @__PURE__ */ h(s,{children:`Create a password`}),/* @__PURE__ */ h(n,{value:e,autoComplete:`new-password`,onValueChange:e=>a(e),children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ h(`ul`,{"data-slot":`stack`,"aria-label":`Password requirements`,children:v.map(t=>t.test(e)?/* @__PURE__ */ h(`li`,{"data-slot":`row`,children:[/* @__PURE__ */ h(m,{"aria-hidden":`true`}),/* @__PURE__ */ h(`span`,{"data-slot":`visually-hidden`,children:`Done:`}),t.label]},t.label):/* @__PURE__ */ h(`li`,{"data-slot":`row`,children:[/* @__PURE__ */ h(i,{"aria-hidden":`true`}),/* @__PURE__ */ h(`span`,{"data-slot":`visually-hidden`,children:`To do:`}),t.label]},t.label))})]})}function b(){return/* @__PURE__ */ h(t,{name:`wifi-password`,children:[/* @__PURE__ */ h(s,{children:`Wi-Fi password`}),/* @__PURE__ */ h(n,{defaultVisible:!0,defaultValue:`maple-orbit-42`,autoComplete:`new-password`,children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ h(l,{children:`Guests read it from here, so it starts shown.`})]})}function x(){return/* @__PURE__ */ h(t,{name:`password`,children:[/* @__PURE__ */ h(s,{children:`Password`}),/* @__PURE__ */ h(n,{children:e=>/* @__PURE__ */ h(p,{children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(`span`,{children:e.capsLock&&/* @__PURE__ */ h(d,{"aria-hidden":`true`})}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})}),/* @__PURE__ */ h(`p`,{"data-slot":`caps-lock`,children:`Caps Lock is on.`})]})}function S(){return/* @__PURE__ */ h(t,{disabled:!0,name:`password`,children:[/* @__PURE__ */ h(s,{children:`Password`}),/* @__PURE__ */ h(n,{defaultValue:`hunter22`,children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ h(l,{children:`Your administrator manages this password.`})]})}function C(){return/* @__PURE__ */ h(t,{name:`recovery-key`,children:[/* @__PURE__ */ h(s,{children:`Recovery key`}),/* @__PURE__ */ h(n,{readOnly:!0,defaultValue:`7Hq2-vX9p-Lm4c`,autoComplete:`off`,children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show recovery key`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ h(l,{children:`Keep it somewhere safe. You can show it, but not change it.`})]})}function w(){let e=a(),[i,l]=u(!1);return/* @__PURE__ */ h(t,{name:`password`,children:[/* @__PURE__ */ h(s,{children:`Password`}),/* @__PURE__ */ h(n,{visible:i,onVisibleChange:(t,n)=>{l(t),e(`${t?`Shown`:`Hidden`} (${n.reason})`)},children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]})}function T(){let i=a(),[l]=u(e);return/* @__PURE__ */ h(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>{l.setValue(`plum-kettle-orbit-42`),l.setVisible(!0)},children:`Suggest`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>l.toggleVisible(),children:`Toggle`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>l.clear(),children:`Clear`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>i(`${l.getValue().length} characters, ${l.isVisible()?`shown`:`hidden`}`),children:`Read`}),/* @__PURE__ */ h(`button`,{type:`button`,onClick:()=>l.focus(),children:`Focus`})]}),/* @__PURE__ */ h(t,{name:`new-password`,children:[/* @__PURE__ */ h(s,{children:`New password`}),/* @__PURE__ */ h(n,{controller:l,autoComplete:`new-password`,children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]})]})}function E(){let e=a();return/* @__PURE__ */ h(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ h(`form`,{"data-slot":`stack`,id:`sign-in`,onSubmit:t=>{t.preventDefault();let n=new FormData(t.currentTarget),r=String(n.get(`password`)).length;e(`Signed in as ${n.get(`email`)}, with a password of ${r} characters`)},children:/* @__PURE__ */ h(t,{name:`email`,children:[/* @__PURE__ */ h(s,{children:`Email`}),/* @__PURE__ */ h(g,{type:`email`,required:!0,autoComplete:`username`})]})}),/* @__PURE__ */ h(t,{children:[/* @__PURE__ */ h(s,{children:`Password`}),/* @__PURE__ */ h(n,{name:`password`,form:`sign-in`,required:!0,children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ h(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ h(`button`,{type:`submit`,form:`sign-in`,"data-variant":`solid`,children:`Sign In`}),/* @__PURE__ */ h(`button`,{type:`reset`,form:`sign-in`,children:`Reset`})]})]})}function D(){return/* @__PURE__ */ h(t,{name:`password`,children:[/* @__PURE__ */ h(s,{children:`Password`}),/* @__PURE__ */ h(n,{children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,render:(e,t)=>/* @__PURE__ */ h(`button`,{...e,children:t.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})})]})]})}function O(){return/* @__PURE__ */ h(`div`,{dir:`rtl`,children:/* @__PURE__ */ h(t,{name:`password`,children:[/* @__PURE__ */ h(s,{children:`كلمة المرور`}),/* @__PURE__ */ h(n,{children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`إظهار كلمة المرور`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ h(l,{children:`ثمانية أحرف على الأقل.`})]})})}function k(e){return[e.length>=8,e.length>=12,/[a-z]/.test(e)&&/[A-Z]/.test(e),/\d/.test(e)&&/[^a-zA-Z\d]/.test(e)].filter(Boolean).length}function A(){let[e,i]=u(``),a=k(e);return/* @__PURE__ */ h(t,{name:`new-password`,children:[/* @__PURE__ */ h(s,{children:`New password`}),/* @__PURE__ */ h(n,{value:e,onValueChange:e=>i(e),autoComplete:`new-password`,children:[/* @__PURE__ */ h(o,{}),/* @__PURE__ */ h(f,{"aria-label":`Show password`,children:e=>e.visible?/* @__PURE__ */ h(c,{"aria-hidden":`true`}):/* @__PURE__ */ h(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ h(`div`,{"data-slot":`strength`,"aria-hidden":`true`,children:[1,2,3,4].map(e=>/* @__PURE__ */ h(`div`,{"data-on":a>=e||void 0},e))}),/* @__PURE__ */ h(`output`,{"data-slot":`output`,children:e?`Strength: ${[`Weak`,`Weak`,`Fair`,`Good`,`Strong`][a]} (${e.length} characters)`:`Type a password to rate it.`})]})}var j={name:`password-input`,title:`Password Input`,description:`Enter a password, show or hide it, and use it in a native form.`,sections:[{heading:null,text:`A Password Input is a native password field with a button that shows and hides what's typed. It keeps the caret in place, offers the right password to password managers, and hides the password again when its form submits.`,examples:[{id:`password-input/basic`,caption:`Type a password, then choose Show password to reveal or hide it. Clicking the toggle keeps the caret in the field. With a keyboard, Tab to the toggle and press Space or Enter.`,Example:_,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput>
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>Use at least 8 characters.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`New Password`,text:'Use `autoComplete="new-password"` on the root when creating or changing a password. It tells the browser and password manager which kind of password to offer. The default is `current-password` for signing in.',examples:[{id:`password-input/new-password`,caption:`Type a password and watch the checklist update. Try adding digits and both uppercase and lowercase letters, then toggle its visibility.`,Example:y,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import * as React from "react"

const rules = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  { label: "A number", test: (password: string) => /\\d/.test(password) },
  {
    label: "An uppercase and a lowercase letter",
    test: (password: string) =>
      /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
]

function Example() {
  const [password, setPassword] = React.useState("")
  return (
    <Field name="new-password">
      <FieldLabel>Create a password</FieldLabel>
      <PasswordInput
        value={password}
        autoComplete="new-password"
        onValueChange={(value) => setPassword(value)}
      >
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <ul data-slot="stack" aria-label="Password requirements">
        {rules.map((rule) =>
          rule.test(password) ? (
            <li data-slot="row" key={rule.label}>
              <CheckIcon aria-hidden="true" />
              <span data-slot="visually-hidden">Done:</span>
              {rule.label}
            </li>
          ) : (
            <li data-slot="row" key={rule.label}>
              <XIcon aria-hidden="true" />
              <span data-slot="visually-hidden">To do:</span>
              {rule.label}
            </li>
          )
        )}
      </ul>
    </Field>
  )
}

export { Example }
`}]},{heading:`Shown at First`,text:"Set `defaultVisible` to start with the text visible, and `defaultValue` for its initial value. This can be useful for a Wi-Fi password someone needs to read or copy.",examples:[{id:`password-input/default-visible`,caption:`Read the Wi-Fi password, then choose Show password to hide it. Choose it again to reveal the value.`,Example:b,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field name="wifi-password">
      <FieldLabel>Wi-Fi password</FieldLabel>
      <PasswordInput
        defaultVisible
        defaultValue="maple-orbit-42"
        autoComplete="new-password"
      >
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>
        Guests read it from here, so it starts shown.
      </FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Caps Lock`,text:"Use `data-capslock` or the part's `capsLock` state for a warning. It updates from key events while the input is focused. The example reserves space for the icon and warning.",examples:[{id:`password-input/caps-lock`,caption:`Focus Password and press Caps Lock. The warning appears while Caps Lock is on. Turn it off or leave the field to hide the warning.`,Example:x,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"

function Example() {
  return (
    <Field name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput>
        {(state) => (
          <>
            <PasswordInputControl />
            <span>{state.capsLock && <LockIcon aria-hidden="true" />}</span>
            <PasswordInputToggle aria-label="Show password">
              {(toggle) =>
                toggle.visible ? (
                  <EyeOffIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )
              }
            </PasswordInputToggle>
          </>
        )}
      </PasswordInput>
      <p data-slot="caps-lock">Caps Lock is on.</p>
    </Field>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` on the root, its Field, or an enclosing fieldset to disable both the input and the toggle. The value is omitted from form submission.",examples:[{id:`password-input/disabled`,caption:`Try to edit Password or press its toggle. Both controls are disabled and are skipped by Tab.`,Example:S,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field disabled name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput defaultValue="hunter22">
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>
        Your administrator manages this password.
      </FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Read-Only`,text:"Set `readOnly` when the value can be read but not edited. The input stays focusable, the toggle still works, and the value still participates in form submission.",examples:[{id:`password-input/read-only`,caption:`Choose Show recovery key to read it. Try to type in the input; its value stays unchanged.`,Example:C,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field name="recovery-key">
      <FieldLabel>Recovery key</FieldLabel>
      <PasswordInput readOnly defaultValue="7Hq2-vX9p-Lm4c" autoComplete="off">
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show recovery key">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>
        Keep it somewhere safe. You can show it, but not change it.
      </FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controlled Visibility`,text:"Pass `visible` and update it in `onVisibleChange`. The reason distinguishes a toggle press, form submission, reset, page hide, or a controller action.",examples:[{id:`password-input/controlled`,caption:`Toggle Show password. The console logs each change and its reason.`,Example:w,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [visible, setVisible] = React.useState(false)
  return (
    <Field name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput
        visible={visible}
        onVisibleChange={(next, details) => {
          setVisible(next)
          log(\`\${next ? "Shown" : "Hidden"} (\${details.reason})\`)
        }}
      >
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"Create a `createPasswordInputController()` and pass it as `controller` for actions outside the input. Read or change the value, toggle visibility, or focus the input. Writes use the `imperative` reason.",examples:[{id:`password-input/controller`,caption:`Choose Suggest to fill and reveal a sample value. Try Toggle, Read, Clear, and Focus to call each action from outside the field.`,Example:T,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createPasswordInputController,
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [password] = React.useState(createPasswordInputController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={() => {
            password.setValue("plum-kettle-orbit-42")
            password.setVisible(true)
          }}
        >
          Suggest
        </button>
        <button type="button" onClick={() => password.toggleVisible()}>
          Toggle
        </button>
        <button type="button" onClick={() => password.clear()}>
          Clear
        </button>
        <button
          type="button"
          onClick={() =>
            log(
              \`\${password.getValue().length} characters, \${password.isVisible() ? "shown" : "hidden"}\`
            )
          }
        >
          Read
        </button>
        <button type="button" onClick={() => password.focus()}>
          Focus
        </button>
      </div>
      <Field name="new-password">
        <FieldLabel>New password</FieldLabel>
        <PasswordInput controller={password} autoComplete="new-password">
          <PasswordInputControl />
          <PasswordInputToggle aria-label="Show password">
            {(state) =>
              state.visible ? (
                <EyeOffIcon aria-hidden="true" />
              ) : (
                <EyeIcon aria-hidden="true" />
              )
            }
          </PasswordInputToggle>
        </PasswordInput>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Forms`,text:"The native input participates in `FormData`, validation, and reset. Use `form` to associate it with a form elsewhere in the page, as this example does.",examples:[{id:`password-input/form`,caption:`Enter an email and password, reveal the password, then press Enter in the field. Submission hides it again, and the console logs its length. Reset clears the form. Empty required fields block submission.`,Example:E,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <form
        data-slot="stack"
        id="sign-in"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const length = String(data.get("password")).length
          log(
            \`Signed in as \${data.get("email")}, with a password of \${length} characters\`
          )
        }}
      >
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" required autoComplete="username" />
        </Field>
      </form>
      <Field>
        <FieldLabel>Password</FieldLabel>
        <PasswordInput name="password" form="sign-in" required>
          <PasswordInputControl />
          <PasswordInputToggle aria-label="Show password">
            {(state) =>
              state.visible ? (
                <EyeOffIcon aria-hidden="true" />
              ) : (
                <EyeIcon aria-hidden="true" />
              )
            }
          </PasswordInputToggle>
        </PasswordInput>
      </Field>
      <div data-slot="row">
        <button type="submit" form="sign-in" data-variant="solid">
          Sign In
        </button>
        <button type="reset" form="sign-in">
          Reset
        </button>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`password-input/render`,caption:``,Example:D,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput>
        <PasswordInputControl />
        <PasswordInputToggle
          aria-label="Show password"
          render={(props, state) => (
            <button {...props}>
              {state.visible ? (
                <EyeOffIcon aria-hidden="true" />
              ) : (
                <EyeIcon aria-hidden="true" />
              )}
            </button>
          )}
        />
      </PasswordInput>
    </Field>
  )
}

export { Example }
`},{id:`password-input/rtl`,caption:``,Example:O,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <div dir="rtl">
      <Field name="password">
        <FieldLabel>كلمة المرور</FieldLabel>
        <PasswordInput>
          <PasswordInputControl />
          <PasswordInputToggle aria-label="إظهار كلمة المرور">
            {(state) =>
              state.visible ? (
                <EyeOffIcon aria-hidden="true" />
              ) : (
                <EyeIcon aria-hidden="true" />
              )
            }
          </PasswordInputToggle>
        </PasswordInput>
        <FieldDescription>ثمانية أحرف على الأقل.</FieldDescription>
      </Field>
    </div>
  )
}

export { Example }
`},{id:`password-input/value`,caption:``,Example:A,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"

function strength(password: string) {
  return [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\\d/.test(password) && /[^a-zA-Z\\d]/.test(password),
  ].filter(Boolean).length
}

function Example() {
  const [value, setValue] = React.useState("")
  const score = strength(value)
  return (
    <Field name="new-password">
      <FieldLabel>New password</FieldLabel>
      <PasswordInput
        value={value}
        onValueChange={(next) => setValue(next)}
        autoComplete="new-password"
      >
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <div data-slot="strength" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <div key={level} data-on={score >= level || undefined} />
        ))}
      </div>
      <output data-slot="output">
        {value
          ? \`Strength: \${["Weak", "Weak", "Fair", "Good", "Strong"][score]} (\${value.length} characters)\`
          : "Type a password to rate it."}
      </output>
    </Field>
  )
}

export { Example }
`}]}]};export{j as default};