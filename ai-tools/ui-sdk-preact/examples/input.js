import{Co as e,Fo as t,Mo as n,Oo as r,To as i,bo as a,tl as o,xo as s,yo as c}from"../chunks/c-CIXE4Nkk.js";function l(){let l=n();return/* @__PURE__ */ o(e,{name:`website`,children:[/* @__PURE__ */ o(r,{children:`Website`}),/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ o(`span`,{children:`https://`}),/* @__PURE__ */ o(c,{placeholder:`example.com`,defaultValue:`hollisgrant.com`,onValueChange:(e,t)=>l(`${e?`“${e}”`:`Empty`} (${t.reason})`)}),/* @__PURE__ */ o(a,{"aria-label":`Clear website`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(i,{children:`Shown on your public profile.`})]})}function u(){return/* @__PURE__ */ o(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ o(e,{name:`name`,children:[/* @__PURE__ */ o(r,{children:`الاسم الكامل`}),/* @__PURE__ */ o(c,{placeholder:`ليلى حسن`}),/* @__PURE__ */ o(i,{children:`كما يظهر في ملفك الشخصي.`})]}),/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ o(c,{type:`search`,"aria-label":`بحث`,defaultValue:`حسن`}),/* @__PURE__ */ o(a,{"aria-label":`مسح البحث`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})})]})]})}var d={name:`input`,title:`Input`,description:`Enter text, add a clear button, and connect the value to your form or state.`,sections:[{heading:null,text:`An input is a native text field for short values like a name, an email address or a search. It works inside a field and a form, and adds a clear button, text around the input, and change reasons.`,examples:[{id:`input/basic`,caption:`Edit the website, then press Clear website. The text clears, focus returns to the input and the console logs the reason. Pressing https:// focuses the input too.`,Example:l,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
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
`}]},{heading:`More examples`,text:``,examples:[{id:`input/rtl`,caption:``,Example:u,source:`import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
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
`}]}]};export{d as default};