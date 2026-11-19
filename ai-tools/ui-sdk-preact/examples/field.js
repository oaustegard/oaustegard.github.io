import{t as e}from"../chunks/c-WfjOen3K.js";import{useLog as t}from"./log.js";import{jsx as n,jsxs as r}from"preact/compat/jsx-runtime";import{Field as i,FieldDescription as a,FieldError as o,FieldGroup as s,FieldLabel as c,FieldLegend as l,FieldSet as u}from"ui-sdk/field.js";import{Input as d}from"ui-sdk/input.js";import{Checkbox as f,CheckboxIndicator as p}from"ui-sdk/checkbox.js";function m(){return/* @__PURE__ */ n(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ r(i,{children:[/* @__PURE__ */ n(c,{children:`Username`}),/* @__PURE__ */ n(d,{name:`username`,placeholder:`hollis`,autoComplete:`username`}),/* @__PURE__ */ n(a,{children:`Choose a unique username for your account.`})]})})}function h(){let e=t();return/* @__PURE__ */ r(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Subscribed ${new FormData(t.currentTarget).get(`email`)}`)},children:[/* @__PURE__ */ r(i,{name:`email`,children:[/* @__PURE__ */ n(c,{children:`Email`}),/* @__PURE__ */ n(d,{type:`email`,required:!0,placeholder:`hollis@example.com`}),/* @__PURE__ */ n(a,{render:(e,t)=>/* @__PURE__ */ n(`p`,{...e,children:t.valid?`Looks good.`:`We'll send you a confirmation link.`})}),/* @__PURE__ */ n(o,{match:`valueMissing`,children:`Enter your email address.`}),/* @__PURE__ */ n(o,{match:`typeMismatch`,children:`Enter an email address like hollis@example.com.`})]}),/* @__PURE__ */ r(i,{name:`website`,children:[/* @__PURE__ */ n(c,{children:`Website`}),/* @__PURE__ */ n(d,{type:`url`,required:!0,placeholder:`https://example.com`}),/* @__PURE__ */ n(o,{})]}),/* @__PURE__ */ n(`button`,{type:`submit`,"data-variant":`solid`,children:`Subscribe`})]})}function g(){return/* @__PURE__ */ r(u,{children:[/* @__PURE__ */ n(l,{children:`Address`}),/* @__PURE__ */ n(a,{children:`We need your address to deliver your order.`}),/* @__PURE__ */ r(s,{children:[/* @__PURE__ */ r(i,{name:`street`,children:[/* @__PURE__ */ n(c,{children:`Street address`}),/* @__PURE__ */ n(d,{autoComplete:`street-address`})]}),/* @__PURE__ */ r(`div`,{"data-slot":`grid`,children:[/* @__PURE__ */ r(i,{name:`city`,children:[/* @__PURE__ */ n(c,{children:`City`}),/* @__PURE__ */ n(d,{autoComplete:`address-level2`})]}),/* @__PURE__ */ r(i,{name:`postal-code`,children:[/* @__PURE__ */ n(c,{children:`Postal code`}),/* @__PURE__ */ n(d,{autoComplete:`postal-code`})]})]})]})]})}function _(){return/* @__PURE__ */ r(u,{dir:`rtl`,children:[/* @__PURE__ */ n(l,{children:`العنوان`}),/* @__PURE__ */ n(a,{children:`نحتاج عنوانك لتوصيل طلبك.`}),/* @__PURE__ */ r(i,{name:`street`,children:[/* @__PURE__ */ n(c,{children:`الشارع`}),/* @__PURE__ */ n(d,{})]}),/* @__PURE__ */ r(i,{name:`city`,children:[/* @__PURE__ */ n(c,{children:`المدينة`}),/* @__PURE__ */ n(d,{})]})]})}function v(){return/* @__PURE__ */ r(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ r(i,{children:[/* @__PURE__ */ n(c,{children:`الاسم على البطاقة`}),/* @__PURE__ */ n(d,{name:`card-name`,autoComplete:`cc-name`,placeholder:`ليلى حسن`})]}),/* @__PURE__ */ r(i,{children:[/* @__PURE__ */ n(c,{children:`رقم البطاقة`}),/* @__PURE__ */ n(d,{name:`card-number`,inputMode:`numeric`,autoComplete:`cc-number`,placeholder:`1234 5678 9012 3456`}),/* @__PURE__ */ n(a,{children:`أدخل الرقم المكون من 16 خانة.`})]}),/* @__PURE__ */ r(i,{children:[/* @__PURE__ */ n(f,{name:`save-card`,defaultChecked:!0,children:/* @__PURE__ */ n(p,{children:/* @__PURE__ */ n(e,{})})}),/* @__PURE__ */ n(c,{children:`احفظ البطاقة للمدفوعات القادمة`})]})]})}var y={name:`field`,title:`Field`,description:`Connect a form control to its label, description, and validation errors.`,sections:[{heading:null,text:"A field connects a form control to its label, its description and the errors it shows, and wires up `id`, `for` and `aria-describedby` for you.",examples:[{id:`field/input`,caption:`Press Username to focus the input, then type a name.`,Example:m,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Username</FieldLabel>
        <Input name="username" placeholder="hollis" autoComplete="username" />
        <FieldDescription>
          Choose a unique username for your account.
        </FieldDescription>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Validation`,text:'Use native constraints such as `required`, `type="email"`, and `pattern`. Errors appear after a submit attempt and update as the value changes. The first invalid control takes focus.',examples:[{id:`field/validation`,caption:`Press Subscribe with an empty or invalid email, then correct it to clear the error.`,Example:h,source:`import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(\`Subscribed \${new FormData(event.currentTarget).get("email")}\`)
      }}
    >
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" required placeholder="hollis@example.com" />
        <FieldDescription
          render={(props, state) => (
            <p {...props}>
              {state.valid
                ? "Looks good."
                : "We'll send you a confirmation link."}
            </p>
          )}
        />
        <FieldError match="valueMissing">Enter your email address.</FieldError>
        <FieldError match="typeMismatch">
          Enter an email address like hollis@example.com.
        </FieldError>
      </Field>
      <Field name="website">
        <FieldLabel>Website</FieldLabel>
        <Input type="url" required placeholder="https://example.com" />
        <FieldError />
      </Field>
      <button type="submit" data-variant="solid">
        Subscribe
      </button>
    </form>
  )
}

export { Example }
`}]},{heading:`Field Sets`,text:`A field set groups related fields under a legend, and disables them together.`,examples:[{id:`field/field-set`,caption:`Move through the address fields. Their legend and description name the group.`,Example:g,source:`import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <FieldSet>
      <FieldLegend>Address</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
        <Field name="street">
          <FieldLabel>Street address</FieldLabel>
          <Input autoComplete="street-address" />
        </Field>
        <div data-slot="grid">
          <Field name="city">
            <FieldLabel>City</FieldLabel>
            <Input autoComplete="address-level2" />
          </Field>
          <Field name="postal-code">
            <FieldLabel>Postal code</FieldLabel>
            <Input autoComplete="postal-code" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`field/field-set-rtl`,caption:``,Example:_,source:`import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <FieldSet dir="rtl">
      <FieldLegend>العنوان</FieldLegend>
      <FieldDescription>نحتاج عنوانك لتوصيل طلبك.</FieldDescription>
      <Field name="street">
        <FieldLabel>الشارع</FieldLabel>
        <Input />
      </Field>
      <Field name="city">
        <FieldLabel>المدينة</FieldLabel>
        <Input />
      </Field>
    </FieldSet>
  )
}

export { Example }
`},{id:`field/rtl`,caption:``,Example:v,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <div data-slot="stack" dir="rtl">
      <Field>
        <FieldLabel>الاسم على البطاقة</FieldLabel>
        <Input name="card-name" autoComplete="cc-name" placeholder="ليلى حسن" />
      </Field>
      <Field>
        <FieldLabel>رقم البطاقة</FieldLabel>
        <Input
          name="card-number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
        />
        <FieldDescription>أدخل الرقم المكون من 16 خانة.</FieldDescription>
      </Field>
      <Field>
        <Checkbox name="save-card" defaultChecked>
          <CheckboxIndicator>
            <CheckIcon />
          </CheckboxIndicator>
        </Checkbox>
        <FieldLabel>احفظ البطاقة للمدفوعات القادمة</FieldLabel>
      </Field>
    </div>
  )
}

export { Example }
`}]}]};export{y as default};