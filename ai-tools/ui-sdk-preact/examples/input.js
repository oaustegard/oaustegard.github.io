import{t as e}from"../chunks/c-NPxkywtp.js";import{useLog as t}from"./log.js";import{jsx as n,jsxs as r}from"preact/compat/jsx-runtime";import{Field as i,FieldDescription as a,FieldLabel as o}from"ui-sdk/field.js";import{Input as s,InputClear as c,InputGroup as l}from"ui-sdk/input.js";function u(){let u=t();return/* @__PURE__ */ r(i,{name:`website`,children:[/* @__PURE__ */ n(o,{children:`Website`}),/* @__PURE__ */ r(l,{children:[/* @__PURE__ */ n(`span`,{children:`https://`}),/* @__PURE__ */ n(s,{placeholder:`example.com`,defaultValue:`hollisgrant.com`,onValueChange:(e,t)=>u(`${e?`“${e}”`:`Empty`} (${t.reason})`)}),/* @__PURE__ */ n(c,{"aria-label":`Clear website`,children:/* @__PURE__ */ n(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ n(a,{children:`Shown on your public profile.`})]})}function d(){return/* @__PURE__ */ r(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ r(i,{name:`name`,children:[/* @__PURE__ */ n(o,{children:`الاسم الكامل`}),/* @__PURE__ */ n(s,{placeholder:`ليلى حسن`}),/* @__PURE__ */ n(a,{children:`كما يظهر في ملفك الشخصي.`})]}),/* @__PURE__ */ r(l,{children:[/* @__PURE__ */ n(s,{type:`search`,"aria-label":`بحث`,defaultValue:`حسن`}),/* @__PURE__ */ n(c,{"aria-label":`مسح البحث`,children:/* @__PURE__ */ n(e,{"aria-hidden":`true`})})]})]})}var f={name:`input`,title:`Input`,description:`Enter text, add a clear button, and connect the value to your form or state.`,sections:[{heading:null,text:`An input is a native text field for short values like a name, an email address or a search. It works inside a field and a form, and adds a clear button, text around the input, and change reasons.`,examples:[{id:`input/basic`,caption:`Edit the website, then press Clear website. The text clears, focus returns to the input and the console logs the reason. Pressing https:// focuses the input too.`,Example:u,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input, InputClear, InputGroup } from "@ui-sdk/react/input"
import { XIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Field name="website">
      <FieldLabel>Website</FieldLabel>
      <InputGroup>
        <span>https://</span>
        <Input
          placeholder="example.com"
          defaultValue="hollisgrant.com"
          onValueChange={(value, details) =>
            log(\`\${value ? \`“\${value}”\` : "Empty"} (\${details.reason})\`)
          }
        />
        <InputClear aria-label="Clear website">
          <XIcon aria-hidden="true" />
        </InputClear>
      </InputGroup>
      <FieldDescription>Shown on your public profile.</FieldDescription>
    </Field>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`input/rtl`,caption:``,Example:d,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input, InputClear, InputGroup } from "@ui-sdk/react/input"
import { XIcon } from "lucide-react"

function Example() {
  return (
    <div data-slot="stack" dir="rtl">
      <Field name="name">
        <FieldLabel>الاسم الكامل</FieldLabel>
        <Input placeholder="ليلى حسن" />
        <FieldDescription>كما يظهر في ملفك الشخصي.</FieldDescription>
      </Field>
      <InputGroup>
        <Input type="search" aria-label="بحث" defaultValue="حسن" />
        <InputClear aria-label="مسح البحث">
          <XIcon aria-hidden="true" />
        </InputClear>
      </InputGroup>
    </div>
  )
}

export { Example }
`}]}]};export{f as default};