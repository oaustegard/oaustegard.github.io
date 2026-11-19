import{Ao as e,Co as t,Do as n,Eo as r,Mo as i,Oo as a,To as o,go as s,ko as c,mo as l,qs as u,tl as d,yo as f}from"../chunks/c-CIXE4Nkk.js";function p(){return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ d(t,{children:[/* @__PURE__ */ d(a,{children:`Username`}),/* @__PURE__ */ d(f,{name:`username`,placeholder:`hollis`,autoComplete:`username`}),/* @__PURE__ */ d(o,{children:`Choose a unique username for your account.`})]})})}function m(){let e=i();return/* @__PURE__ */ d(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Subscribed ${new FormData(t.currentTarget).get(`email`)}`)},children:[/* @__PURE__ */ d(t,{name:`email`,children:[/* @__PURE__ */ d(a,{children:`Email`}),/* @__PURE__ */ d(f,{type:`email`,required:!0,placeholder:`hollis@example.com`}),/* @__PURE__ */ d(o,{render:(e,t)=>/* @__PURE__ */ d(`p`,{...e,children:t.valid?`Looks good.`:`We'll send you a confirmation link.`})}),/* @__PURE__ */ d(r,{match:`valueMissing`,children:`Enter your email address.`}),/* @__PURE__ */ d(r,{match:`typeMismatch`,children:`Enter an email address like hollis@example.com.`})]}),/* @__PURE__ */ d(t,{name:`website`,children:[/* @__PURE__ */ d(a,{children:`Website`}),/* @__PURE__ */ d(f,{type:`url`,required:!0,placeholder:`https://example.com`}),/* @__PURE__ */ d(r,{})]}),/* @__PURE__ */ d(`button`,{type:`submit`,"data-variant":`solid`,children:`Subscribe`})]})}function h(){return/* @__PURE__ */ d(e,{children:[/* @__PURE__ */ d(c,{children:`Address`}),/* @__PURE__ */ d(o,{children:`We need your address to deliver your order.`}),/* @__PURE__ */ d(n,{children:[/* @__PURE__ */ d(t,{name:`street`,children:[/* @__PURE__ */ d(a,{children:`Street address`}),/* @__PURE__ */ d(f,{autoComplete:`street-address`})]}),/* @__PURE__ */ d(`div`,{"data-slot":`grid`,children:[/* @__PURE__ */ d(t,{name:`city`,children:[/* @__PURE__ */ d(a,{children:`City`}),/* @__PURE__ */ d(f,{autoComplete:`address-level2`})]}),/* @__PURE__ */ d(t,{name:`postal-code`,children:[/* @__PURE__ */ d(a,{children:`Postal code`}),/* @__PURE__ */ d(f,{autoComplete:`postal-code`})]})]})]})]})}function g(){return/* @__PURE__ */ d(e,{dir:`rtl`,children:[/* @__PURE__ */ d(c,{children:`العنوان`}),/* @__PURE__ */ d(o,{children:`نحتاج عنوانك لتوصيل طلبك.`}),/* @__PURE__ */ d(t,{name:`street`,children:[/* @__PURE__ */ d(a,{children:`الشارع`}),/* @__PURE__ */ d(f,{})]}),/* @__PURE__ */ d(t,{name:`city`,children:[/* @__PURE__ */ d(a,{children:`المدينة`}),/* @__PURE__ */ d(f,{})]})]})}function _(){return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ d(t,{children:[/* @__PURE__ */ d(a,{children:`الاسم على البطاقة`}),/* @__PURE__ */ d(f,{name:`card-name`,autoComplete:`cc-name`,placeholder:`ليلى حسن`})]}),/* @__PURE__ */ d(t,{children:[/* @__PURE__ */ d(a,{children:`رقم البطاقة`}),/* @__PURE__ */ d(f,{name:`card-number`,inputMode:`numeric`,autoComplete:`cc-number`,placeholder:`1234 5678 9012 3456`}),/* @__PURE__ */ d(o,{children:`أدخل الرقم المكون من 16 خانة.`})]}),/* @__PURE__ */ d(t,{children:[/* @__PURE__ */ d(l,{name:`save-card`,defaultChecked:!0,children:/* @__PURE__ */ d(s,{children:/* @__PURE__ */ d(u,{})})}),/* @__PURE__ */ d(a,{children:`احفظ البطاقة للمدفوعات القادمة`})]})]})}var v={name:`field`,title:`Field`,description:`Connect a form control to its label, description, and validation errors.`,sections:[{heading:null,text:"A field connects a form control to its label, its description and the errors it shows, and wires up `id`, `for` and `aria-describedby` for you.",examples:[{id:`field/input`,caption:`Press Username to focus the input, then type a name.`,Example:p,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`Validation`,text:'Use native constraints such as `required`, `type="email"`, and `pattern`. Errors appear after a submit attempt and update as the value changes. The first invalid control takes focus.',examples:[{id:`field/validation`,caption:`Press Subscribe with an empty or invalid email, then correct it to clear the error.`,Example:m,source:`import {
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
`}]},{heading:`Field Sets`,text:`A field set groups related fields under a legend, and disables them together.`,examples:[{id:`field/field-set`,caption:`Move through the address fields. Their legend and description name the group.`,Example:h,source:`import {
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
`}]},{heading:`More examples`,text:``,examples:[{id:`field/field-set-rtl`,caption:``,Example:g,source:`import {
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
`},{id:`field/rtl`,caption:``,Example:_,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
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
`}]}]};export{v as default};