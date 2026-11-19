import{t as e}from"../chunks/c-CA3STxaZ.js";import*as t from"preact/compat";import{jsx as n,jsxs as r}from"preact/compat/jsx-runtime";import{Field as i,FieldLabel as a}from"ui-sdk/field.js";import{Textarea as o}from"ui-sdk/textarea.js";import{Accordion as s,AccordionHeader as c,AccordionItem as l,AccordionPanel as u,AccordionTrigger as d}from"ui-sdk/accordion.js";import{createAccordionController as f}from"ui-sdk/core/accordion.js";const p=[{value:`shipping`,label:`What are your shipping options?`,content:[`We offer standard (5 to 7 days), express (2 to 3 days) and overnight shipping.`,`Every order ships with tracking, and orders over $50 ship free.`]},{value:`returns`,label:`What is your return policy?`,content:[`Return any unused item in its original packaging within 30 days. Refunds arrive within 5 to 7 business days.`]},{value:`support`,label:`How can I reach support?`,content:[`Write to us by email or chat, or call us. We answer within 24 hours on business days.`]}];function m(){return/* @__PURE__ */ n(s,{defaultValue:[`shipping`],children:p.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content.map(e=>/* @__PURE__ */ n(`p`,{children:e},e))})]},t.value))})}const h=[{value:`notifications`,label:`Notification settings`,content:`Choose what we email you about, and how often.`},{value:`privacy`,label:`Privacy and security`,content:`Turn on two-factor authentication and review signed-in devices.`},{value:`billing`,label:`Billing and subscription`,content:`Update your payment method and download past invoices.`}];function g(){return/* @__PURE__ */ n(s,{multiple:!0,defaultValue:[`notifications`],children:h.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))})}const _=[{value:`access`,label:`Can I access my account history?`,content:`Yes. Every order and payment from the last five years is in your account.`},{value:`premium`,label:`Premium feature information`,content:`Premium includes priority support and early access to new features.`,disabled:!0},{value:`email`,label:`How do I update my email address?`,content:`Open Settings, then Account, and change it there. We'll send a confirmation link.`}];function v(){return/* @__PURE__ */ n(s,{children:_.map(t=>/* @__PURE__ */ r(l,{value:t.value,disabled:t.disabled,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))})}const y=[{value:`overview`,label:`Overview`,content:`A summary of the project, its goals and its owners.`},{value:`timeline`,label:`Timeline`,content:`Kickoff in March, beta in June and launch in September.`},{value:`budget`,label:`Budget`,content:`Approved for two engineers and one designer for six months.`}];function b(){return/* @__PURE__ */ n(s,{collapsible:!1,defaultValue:[`overview`],children:y.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))})}const x=[{value:`account`,label:`Account`,content:`Your name, email address and profile photo.`},{value:`security`,label:`Security`,content:`Your password, passkeys and two-factor authentication.`},{value:`sessions`,label:`Sessions`,content:`Devices signed in to your account in the last 30 days.`}];function S(){let[i]=t.useState(()=>f()),[a,o]=t.useState([`account`]);return/* @__PURE__ */ r(`div`,{children:[/* @__PURE__ */ n(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ n(`button`,{type:`button`,onClick:()=>i.open(`security`),children:`Review security`})}),/* @__PURE__ */ n(s,{multiple:!0,value:a,onValueChange:o,controller:i,children:x.map(t=>/* @__PURE__ */ r(l,{value:t.value,onOpenChange:(e,n)=>{!e&&t.value===`security`&&!window.confirm(`Close the security settings?`)&&n.cancel()},children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))})]})}function C(){return/* @__PURE__ */ r(s,{defaultValue:[`reply`],children:[/* @__PURE__ */ r(l,{value:`reply`,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[`Reply to this thread`,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{keepMounted:!0,children:/* @__PURE__ */ r(i,{children:[/* @__PURE__ */ n(a,{children:`Message`}),/* @__PURE__ */ n(o,{rows:3,placeholder:`Write a reply…`})]})})]}),/* @__PURE__ */ r(l,{value:`formatting`,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[`Formatting`,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:/* @__PURE__ */ n(`p`,{children:"Use **bold**, _italics_ and `code`. Links paste as previews."})})]})]})}const w=[{value:`fruit`,label:`Which fruit do you stock?`,content:`Apples, pears, mangoes and, in summer, pineapple.`},{value:`organic`,label:`Is it organic?`,content:`Everything we stock is certified organic.`},{value:`delivery`,label:`When do you deliver?`,content:`Every weekday morning before 10.`}];function T(){return/* @__PURE__ */ n(s,{hiddenUntilFound:!0,children:w.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))})}function E(){return/* @__PURE__ */ r(`div`,{children:[/* @__PURE__ */ r(`nav`,{"data-slot":`controls`,"aria-label":`Jump to`,children:[/* @__PURE__ */ n(`a`,{href:`#refund-timeline`,children:`Jump to the refund timeline`}),/* @__PURE__ */ n(`a`,{href:`#return-label`,children:`Print a return label`})]}),/* @__PURE__ */ r(s,{hiddenUntilFound:!0,children:[/* @__PURE__ */ r(l,{value:`returns`,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[`Returns`,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:/* @__PURE__ */ r(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ n(`p`,{children:`Return any unused item in its original packaging within 30 days.`}),/* @__PURE__ */ n(`p`,{id:`return-label`,children:`To print a return label, open the order and choose Return. The label is free.`})]})})]}),/* @__PURE__ */ r(l,{value:`refunds`,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[`Refunds`,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:/* @__PURE__ */ r(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ n(`p`,{children:`Refunds go back to the card you paid with.`}),/* @__PURE__ */ n(`p`,{id:`refund-timeline`,children:`Timeline: we inspect the item within 2 days of receiving it, and your bank shows the refund 5 to 7 business days later.`})]})})]}),/* @__PURE__ */ r(l,{value:`exchanges`,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[`Exchanges`,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:/* @__PURE__ */ n(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ n(`p`,{children:`Start a return, choose Exchange and pick the new size. Shipping both ways is free.`})})})]})]})]})}const D=[{value:`one`,label:`Why animate the height?`,content:`So the content below slides instead of jumping.`},{value:`two`,label:`Where does the height come from?`,content:`The panel measures itself and writes the result to a CSS variable while it animates.`},{value:`three`,label:`Does it animate on first paint?`,content:`No. Panels open on the server or on mount show at once.`}];function O(){return/* @__PURE__ */ n(s,{defaultValue:[`one`],children:D.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))})}const k=[{value:`week-1`,label:`Week 1: Foundations`,content:`Set up your editor, meet the command line and write your first script.`},{value:`week-2`,label:`Week 2: Data and types`,content:`Strings, numbers, lists and objects, and how to tell them apart when a program runs.`},{value:`week-3`,label:`Week 3: Control flow`,content:`Conditions, loops and functions. The project this week is a small text adventure.`},{value:`week-4`,label:`Week 4: Working with files`,content:`Read and write files, parse CSV and JSON, and handle the errors that come with them.`},{value:`week-5`,label:`Week 5: Final project`,content:`Build a tool you'll use yourself, then present it to the group in a five-minute demo.`}];function A(){let[e]=t.useState(()=>f());return/* @__PURE__ */ r(`div`,{children:[/* @__PURE__ */ r(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ n(`button`,{type:`button`,onClick:()=>e.openAll(),children:`Expand all`}),/* @__PURE__ */ n(`button`,{type:`button`,onClick:()=>e.closeAll(),children:`Collapse all`})]}),/* @__PURE__ */ n(`div`,{"data-slot":`scroll`,children:/* @__PURE__ */ n(s,{multiple:!0,controller:e,children:k.map(e=>/* @__PURE__ */ n(j,{week:e},e.value))})})]})}function j({week:i}){let a=t.useRef(null),o=t.useRef(!1);return/* @__PURE__ */ r(l,{ref:a,value:i.value,onOpenChange:(e,t)=>{o.current=e&&t.reason===`trigger-press`},onOpenChangeComplete:e=>{e&&o.current&&a.current?.scrollIntoView({block:`nearest`,behavior:`smooth`})},children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[i.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:i.content})]})}const M=[{value:`profile`,label:`Profile`,content:`Your name, photo and the email address people see.`},{value:`notifications`,label:`Notifications`,topics:[{value:`email`,label:`Email`,content:`A weekly digest, and mentions as they happen.`},{value:`push`,label:`Push`,content:`Direct messages and replies to your comments.`}]},{value:`billing`,label:`Billing`,topics:[{value:`payment`,label:`Payment methods`,content:`A Visa card ending in 4242, used for every renewal.`},{value:`invoices`,label:`Invoices`,content:`Download a PDF of any invoice from the last two years.`}]}];function N(){return/* @__PURE__ */ n(s,{defaultValue:[`notifications`],children:M.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.topics?/* @__PURE__ */ n(s,{multiple:!0,children:t.topics.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{render:/* @__PURE__ */ n(`h4`,{}),children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))}):/* @__PURE__ */ n(`div`,{children:t.content})})]},t.value))})}const P=[{value:`returns`,question:`What is your return policy?`,answer:`Return any unused item within 30 days. Once it reaches us, your refund is on its way.`},{value:`refunds`,question:`How long do refunds take?`,answer:`Refunds reach your card within 5 to 7 business days after we receive the item.`},{value:`shipping`,question:`Do you ship internationally?`,answer:`We ship to 40 countries. Duties are included in the price at checkout.`},{value:`tracking`,question:`How do I track my order?`,answer:`Every shipping email has a tracking link. You'll also find it under Orders.`},{value:`exchange`,question:`Can I exchange an item for another size?`,answer:`Yes. Start a return, choose Exchange and pick the new size. Shipping is free.`},{value:`gift`,question:`Can I send an order as a gift?`,answer:`Add a gift note at checkout and we'll leave the prices off the packing slip.`}];function F(e,t){let n=t.trim().toLowerCase();return!n||e.question.toLowerCase().includes(n)||e.answer.toLowerCase().includes(n)}function I(e,t){let n=t.trim().toLowerCase();if(!n)return[{text:e,match:!1}];let r=[],i=0;for(let t=e.toLowerCase().indexOf(n);t!==-1;)t>i&&r.push({text:e.slice(i,t),match:!1}),r.push({text:e.slice(t,t+n.length),match:!0}),i=t+n.length,t=e.toLowerCase().indexOf(n,i);return i<e.length&&r.push({text:e.slice(i),match:!1}),r}function L({text:e,query:t}){return I(e,t).map((e,t)=>e.match?/* @__PURE__ */ n(`mark`,{children:e.text},t):e.text)}function R(){let[i,a]=t.useState(``),[o,f]=t.useState([]),p=P.filter(e=>F(e,i));return/* @__PURE__ */ r(`div`,{children:[/* @__PURE__ */ n(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ n(`input`,{type:`search`,"aria-label":`Search questions`,placeholder:`Search questions…`,value:i,onChange:e=>{let t=e.target.value;a(t),f(t.trim()?P.filter(e=>F(e,t)).map(e=>e.value):[])}})}),/* @__PURE__ */ n(s,{multiple:!0,value:o,onValueChange:f,children:p.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[/* @__PURE__ */ n(`span`,{children:/* @__PURE__ */ n(L,{text:t.question,query:i})}),/* @__PURE__ */ n(e,{"aria-hidden":`true`})]})}),/* @__PURE__ */ n(u,{children:/* @__PURE__ */ n(L,{text:t.answer,query:i})})]},t.value))}),/* @__PURE__ */ n(`p`,{"data-slot":`hint`,role:`status`,children:p.length===0&&`No questions match “${i}”.`})]})}const z=[{value:`install`,label:`Install the package`,content:`Add it with your package manager. It has no dependencies.`},{value:`import`,label:`Import the parts`,content:`Import the accordion parts you need from the package.`},{value:`style`,label:`Style it`,content:`Every part renders its state as data attributes you can style.`}];function B(){return/* @__PURE__ */ n(s,{multiple:!0,defaultValue:[`install`],children:z.map(e=>/* @__PURE__ */ r(l,{value:e.value,children:[/* @__PURE__ */ n(c,{render:/* @__PURE__ */ n(`h4`,{}),children:/* @__PURE__ */ n(d,{render:(e,t)=>/* @__PURE__ */ r(`button`,{...e,children:[t.index>=0&&/* @__PURE__ */ n(`span`,{"data-slot":`hint`,"aria-hidden":!0,children:String(t.index+1).padStart(2,`0`)}),/* @__PURE__ */ n(`span`,{children:e.children}),/* @__PURE__ */ n(`span`,{"data-slot":`hint`,"aria-hidden":!0,children:t.open?`Hide`:`Show`})]}),children:e.label})}),/* @__PURE__ */ n(u,{children:e.content})]},e.value))})}const V=[{value:`shipping`,label:`ما هي خيارات الشحن؟`,content:`نقدم الشحن العادي والسريع والشحن في اليوم التالي.`},{value:`returns`,label:`ما هي سياسة الإرجاع؟`,content:`يمكنك إرجاع أي منتج غير مستخدم خلال ٣٠ يومًا.`},{value:`support`,label:`كيف أتواصل مع الدعم؟`,content:`راسلنا عبر البريد أو الدردشة، ونرد خلال ٢٤ ساعة.`}];function H(){return/* @__PURE__ */ n(`div`,{dir:`rtl`,children:/* @__PURE__ */ n(s,{defaultValue:[`shipping`],children:V.map(t=>/* @__PURE__ */ r(l,{value:t.value,children:[/* @__PURE__ */ n(c,{children:/* @__PURE__ */ r(d,{children:[t.label,/* @__PURE__ */ n(e,{})]})}),/* @__PURE__ */ n(u,{children:t.content})]},t.value))})})}var U={name:`accordion`,title:`Accordion`,description:`Show and hide sections of content from their headings.`,sections:[{heading:null,text:`Use an Accordion for content people can explore one section at a time, such as answers, settings, or a course outline. Each heading is a button that opens its panel.`,examples:[{id:`accordion/basic`,caption:`Press “What is your return policy?”. Its answer opens and the shipping answer closes. Press the same heading again to close it.`,Example:m,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "shipping",
    label: "What are your shipping options?",
    content: [
      "We offer standard (5 to 7 days), express (2 to 3 days) and overnight shipping.",
      "Every order ships with tracking, and orders over $50 ship free.",
    ],
  },
  {
    value: "returns",
    label: "What is your return policy?",
    content: [
      "Return any unused item in its original packaging within 30 days. Refunds arrive within 5 to 7 business days.",
    ],
  },
  {
    value: "support",
    label: "How can I reach support?",
    content: [
      "Write to us by email or chat, or call us. We answer within 24 hours on business days.",
    ],
  },
]

function Example() {
  return (
    <Accordion defaultValue={["shipping"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            {item.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
`}]},{heading:`Multiple`,text:"Add `multiple` to let several items stay open. Opening one then leaves the others as they are.",examples:[{id:`accordion/multiple`,caption:`Open Privacy and security. Notification settings stays open; close either section independently.`,Example:g,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "notifications",
    label: "Notification settings",
    content: "Choose what we email you about, and how often.",
  },
  {
    value: "privacy",
    label: "Privacy and security",
    content: "Turn on two-factor authentication and review signed-in devices.",
  },
  {
    value: "billing",
    label: "Billing and subscription",
    content: "Update your payment method and download past invoices.",
  },
]

function Example() {
  return (
    <Accordion multiple defaultValue={["notifications"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Set `disabled` on an item or on a single trigger to prevent changes, or on the accordion to disable every item. Disabled triggers stay in the tab order so people can still discover them. A disabled `<fieldset>` around the accordion disables it too.",examples:[{id:`accordion/disabled`,caption:`Tab to Premium feature information. It stays focusable, and pressing it leaves its panel closed. Try “How do I update my email address?” instead.`,Example:v,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "access",
    label: "Can I access my account history?",
    content:
      "Yes. Every order and payment from the last five years is in your account.",
  },
  {
    value: "premium",
    label: "Premium feature information",
    content:
      "Premium includes priority support and early access to new features.",
    disabled: true,
  },
  {
    value: "email",
    label: "How do I update my email address?",
    content:
      "Open Settings, then Account, and change it there. We'll send a confirmation link.",
  },
]

function Example() {
  return (
    <Accordion>
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
        >
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
`}]},{heading:`Collapsible`,text:'Set `collapsible={false}` when the open item should stay open until another item replaces it. Pair it with `defaultValue={["overview"]}` so a panel starts open.',examples:[{id:`accordion/collapsible`,caption:`Open Timeline, then press it again. It stays open until you choose another heading.`,Example:b,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "overview",
    label: "Overview",
    content: "A summary of the project, its goals and its owners.",
  },
  {
    value: "timeline",
    label: "Timeline",
    content: "Kickoff in March, beta in June and launch in September.",
  },
  {
    value: "budget",
    label: "Budget",
    content: "Approved for two engineers and one designer for six months.",
  },
]

function Example() {
  return (
    <Accordion collapsible={false} defaultValue={["overview"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Use `value` and `onValueChange` to own the open items. State and Events covers the shared pattern.",examples:[{id:`accordion/controlled`,caption:`Press Security to open it, then press it again. Cancel the confirmation and Security stays open; accept it and the section closes.`,Example:S,source:`"use client"

import { createAccordionController } from "@ui-sdk/core/accordion"
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const items = [
  {
    value: "account",
    label: "Account",
    content: "Your name, email address and profile photo.",
  },
  {
    value: "security",
    label: "Security",
    content: "Your password, passkeys and two-factor authentication.",
  },
  {
    value: "sessions",
    label: "Sessions",
    content: "Devices signed in to your account in the last 30 days.",
  },
]

function Example() {
  const [accordion] = React.useState(() => createAccordionController())
  const [value, setValue] = React.useState(["account"])

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => accordion.open("security")}>
          Review security
        </button>
      </div>
      <Accordion
        multiple
        value={value}
        onValueChange={setValue}
        controller={accordion}
      >
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            onOpenChange={(open, details) => {
              if (
                !open &&
                item.value === "security" &&
                !window.confirm("Close the security settings?")
              ) {
                details.cancel()
              }
            }}
          >
            <AccordionHeader>
              <AccordionTrigger>
                {item.label}
                <ChevronDownIcon aria-hidden="true" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>{item.content}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export { Example }
`}]},{heading:`Keep Mounted`,text:"A closed panel normally unmounts. Add `keepMounted` to one panel or the whole accordion to keep its content hidden in the page. This preserves local state, such as a draft in a field.",examples:[{id:`accordion/keep-mounted`,caption:`Write a message, switch to Formatting, then return to Reply to this thread. Your draft is still there.`,Example:C,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <Accordion defaultValue={["reply"]}>
      <AccordionItem value="reply">
        <AccordionHeader>
          <AccordionTrigger>
            Reply to this thread
            <ChevronDownIcon aria-hidden="true" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel keepMounted>
          <Field>
            <FieldLabel>Message</FieldLabel>
            <Textarea rows={3} placeholder="Write a reply…" />
          </Field>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="formatting">
        <AccordionHeader>
          <AccordionTrigger>
            Formatting
            <ChevronDownIcon aria-hidden="true" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          <p>Use **bold**, _italics_ and \`code\`. Links paste as previews.</p>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export { Example }
`}]},{heading:`Find in Page`,text:"Add `hiddenUntilFound` to keep closed panels available to the browser's Find command. A match opens the item immediately, without an animation, with the reason `find-in-page`.",examples:[{id:`accordion/find-in-page`,caption:`Use your browser’s Find command to search for “pineapple”. The closed “Which fruit do you stock?” panel opens to reveal the match.`,Example:T,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "fruit",
    label: "Which fruit do you stock?",
    content: "Apples, pears, mangoes and, in summer, pineapple.",
  },
  {
    value: "organic",
    label: "Is it organic?",
    content: "Everything we stock is certified organic.",
  },
  {
    value: "delivery",
    label: "When do you deliver?",
    content: "Every weekday morning before 10.",
  },
]

function Example() {
  return (
    <Accordion hiddenUntilFound>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
`},{id:`accordion/deep-link`,caption:`Press Jump to the refund timeline. The closed Refunds panel opens and the browser moves to the linked paragraph.`,Example:E,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <div>
      <nav data-slot="controls" aria-label="Jump to">
        <a href="#refund-timeline">Jump to the refund timeline</a>
        <a href="#return-label">Print a return label</a>
      </nav>
      <Accordion hiddenUntilFound>
        <AccordionItem value="returns">
          <AccordionHeader>
            <AccordionTrigger>
              Returns
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <div data-slot="stack">
              <p>
                Return any unused item in its original packaging within 30 days.
              </p>
              <p id="return-label">
                To print a return label, open the order and choose Return. The
                label is free.
              </p>
            </div>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="refunds">
          <AccordionHeader>
            <AccordionTrigger>
              Refunds
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <div data-slot="stack">
              <p>Refunds go back to the card you paid with.</p>
              <p id="refund-timeline">
                Timeline: we inspect the item within 2 days of receiving it, and
                your bank shows the refund 5 to 7 business days later.
              </p>
            </div>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="exchanges">
          <AccordionHeader>
            <AccordionTrigger>
              Exchanges
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <div data-slot="stack">
              <p>
                Start a return, choose Exchange and pick the new size. Shipping
                both ways is free.
              </p>
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"Each part has a `data-slot`, such as `accordion-panel`. The panel exposes its measured height as `--accordion-panel-height`. Animate that height to or from zero with `data-starting-style` and `data-ending-style`:",examples:[{id:`accordion/animation`,caption:`Open or close an item. Its panel animates its height.`,Example:O,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "one",
    label: "Why animate the height?",
    content: "So the content below slides instead of jumping.",
  },
  {
    value: "two",
    label: "Where does the height come from?",
    content:
      "The panel measures itself and writes the result to a CSS variable while it animates.",
  },
  {
    value: "three",
    label: "Does it animate on first paint?",
    content: "No. Panels open on the server or on mount show at once.",
  },
]

function Example() {
  return (
    <Accordion defaultValue={["one"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
`}]},{heading:`Expand All`,text:"With `multiple`, a controller's `openAll()` opens every enabled item. `closeAll()` closes every item that may close. Controllers explains how to connect one.",examples:[{id:`accordion/expand-all`,caption:`Press Expand all or Collapse all. Open an individual week near the bottom to scroll it into view after its panel opens.`,Example:A,source:`"use client"

import { createAccordionController } from "@ui-sdk/core/accordion"
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const weeks = [
  {
    value: "week-1",
    label: "Week 1: Foundations",
    content:
      "Set up your editor, meet the command line and write your first script.",
  },
  {
    value: "week-2",
    label: "Week 2: Data and types",
    content:
      "Strings, numbers, lists and objects, and how to tell them apart when a program runs.",
  },
  {
    value: "week-3",
    label: "Week 3: Control flow",
    content:
      "Conditions, loops and functions. The project this week is a small text adventure.",
  },
  {
    value: "week-4",
    label: "Week 4: Working with files",
    content:
      "Read and write files, parse CSV and JSON, and handle the errors that come with them.",
  },
  {
    value: "week-5",
    label: "Week 5: Final project",
    content:
      "Build a tool you'll use yourself, then present it to the group in a five-minute demo.",
  },
]

function Example() {
  const [syllabus] = React.useState(() => createAccordionController())
  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => syllabus.openAll()}>
          Expand all
        </button>
        <button type="button" onClick={() => syllabus.closeAll()}>
          Collapse all
        </button>
      </div>
      <div data-slot="scroll">
        <Accordion multiple controller={syllabus}>
          {weeks.map((week) => (
            <Week key={week.value} week={week} />
          ))}
        </Accordion>
      </div>
    </div>
  )
}

function Week({ week }: { week: (typeof weeks)[number] }) {
  const item = React.useRef<HTMLDivElement>(null)
  const pressed = React.useRef(false)

  return (
    <AccordionItem
      ref={item}
      value={week.value}
      onOpenChange={(open, details) => {
        pressed.current = open && details.reason === "trigger-press"
      }}
      onOpenChangeComplete={(open) => {
        if (open && pressed.current) {
          item.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
        }
      }}
    >
      <AccordionHeader>
        <AccordionTrigger>
          {week.label}
          <ChevronDownIcon aria-hidden="true" />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>{week.content}</AccordionPanel>
    </AccordionItem>
  )
}

export { Example }
`}]},{heading:`Nested`,text:`Put another accordion inside a panel when a section has its own expandable sections. Each accordion tracks its own items. Give the inner headings a lower level than the outer headings.`,examples:[{id:`accordion/nested`,caption:`Open Billing, then Invoices inside it. The inner accordion changes without closing Billing.`,Example:N,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const sections: {
  value: string
  label: string
  content?: string
  topics?: { value: string; label: string; content: string }[]
}[] = [
  {
    value: "profile",
    label: "Profile",
    content: "Your name, photo and the email address people see.",
  },
  {
    value: "notifications",
    label: "Notifications",
    topics: [
      {
        value: "email",
        label: "Email",
        content: "A weekly digest, and mentions as they happen.",
      },
      {
        value: "push",
        label: "Push",
        content: "Direct messages and replies to your comments.",
      },
    ],
  },
  {
    value: "billing",
    label: "Billing",
    topics: [
      {
        value: "payment",
        label: "Payment methods",
        content: "A Visa card ending in 4242, used for every renewal.",
      },
      {
        value: "invoices",
        label: "Invoices",
        content: "Download a PDF of any invoice from the last two years.",
      },
    ],
  },
]

function Example() {
  return (
    <Accordion defaultValue={["notifications"]}>
      {sections.map((section) => (
        <AccordionItem key={section.value} value={section.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {section.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            {section.topics ? (
              <Accordion multiple>
                {section.topics.map((topic) => (
                  <AccordionItem key={topic.value} value={topic.value}>
                    <AccordionHeader render={<h4 />}>
                      <AccordionTrigger>
                        {topic.label}
                        <ChevronDownIcon aria-hidden="true" />
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionPanel>{topic.content}</AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div>{section.content}</div>
            )}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
`}]},{heading:`FAQ Search`,text:"Combine a search field with a controlled accordion: filter the questions and set `value` to the matching items. The example also highlights matches and leaves the triggers usable while the search is active.",examples:[{id:`accordion/search`,caption:`Search for “refund” to show and open matching answers. Try “zzz” for the empty result, then clear the search to restore all questions.`,Example:R,source:`"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const faq = [
  {
    value: "returns",
    question: "What is your return policy?",
    answer:
      "Return any unused item within 30 days. Once it reaches us, your refund is on its way.",
  },
  {
    value: "refunds",
    question: "How long do refunds take?",
    answer:
      "Refunds reach your card within 5 to 7 business days after we receive the item.",
  },
  {
    value: "shipping",
    question: "Do you ship internationally?",
    answer:
      "We ship to 40 countries. Duties are included in the price at checkout.",
  },
  {
    value: "tracking",
    question: "How do I track my order?",
    answer:
      "Every shipping email has a tracking link. You'll also find it under Orders.",
  },
  {
    value: "exchange",
    question: "Can I exchange an item for another size?",
    answer:
      "Yes. Start a return, choose Exchange and pick the new size. Shipping is free.",
  },
  {
    value: "gift",
    question: "Can I send an order as a gift?",
    answer:
      "Add a gift note at checkout and we'll leave the prices off the packing slip.",
  },
]

function matches(question: (typeof faq)[number], query: string) {
  const search = query.trim().toLowerCase()
  return (
    !search ||
    question.question.toLowerCase().includes(search) ||
    question.answer.toLowerCase().includes(search)
  )
}

function highlight(text: string, query: string) {
  const search = query.trim().toLowerCase()
  if (!search) {
    return [{ text, match: false }]
  }
  const parts: { text: string; match: boolean }[] = []
  let start = 0
  for (let index = text.toLowerCase().indexOf(search); index !== -1;) {
    if (index > start) {
      parts.push({ text: text.slice(start, index), match: false })
    }
    parts.push({ text: text.slice(index, index + search.length), match: true })
    start = index + search.length
    index = text.toLowerCase().indexOf(search, start)
  }
  if (start < text.length) {
    parts.push({ text: text.slice(start), match: false })
  }
  return parts
}

function Highlight({ text, query }: { text: string; query: string }) {
  return highlight(text, query).map((part, index) =>
    part.match ? <mark key={index}>{part.text}</mark> : part.text
  )
}

function Example() {
  const [query, setQuery] = React.useState("")
  const [value, setValue] = React.useState<string[]>([])
  const results = faq.filter((question) => matches(question, query))

  return (
    <div>
      <div data-slot="controls">
        <input
          type="search"
          aria-label="Search questions"
          placeholder="Search questions…"
          value={query}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setValue(
              next.trim()
                ? faq
                    .filter((question) => matches(question, next))
                    .map((question) => question.value)
                : []
            )
          }}
        />
      </div>
      <Accordion multiple value={value} onValueChange={setValue}>
        {results.map((question) => (
          <AccordionItem key={question.value} value={question.value}>
            <AccordionHeader>
              <AccordionTrigger>
                <span>
                  <Highlight text={question.question} query={query} />
                </span>
                <ChevronDownIcon aria-hidden="true" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>
              <Highlight text={question.answer} query={query} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <p data-slot="hint" role="status">
        {results.length === 0 && \`No questions match “\${query}”.\`}
      </p>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Use `render` to choose another heading level or element. Parts and Composition covers custom elements and part state. Accordion's states are listed under State.",examples:[{id:`accordion/render`,caption:`Each step is an h4 with its number and a Show or Hide hint that follows its open state. Open Import the parts to see it update.`,Example:B,source:`import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"

const steps = [
  {
    value: "install",
    label: "Install the package",
    content: "Add it with your package manager. It has no dependencies.",
  },
  {
    value: "import",
    label: "Import the parts",
    content: "Import the accordion parts you need from the package.",
  },
  {
    value: "style",
    label: "Style it",
    content: "Every part renders its state as data attributes you can style.",
  },
]

export function Example() {
  return (
    <Accordion multiple defaultValue={["install"]}>
      {steps.map((step) => (
        <AccordionItem key={step.value} value={step.value}>
          <AccordionHeader render={<h4 />}>
            <AccordionTrigger
              render={(props, state) => (
                <button {...props}>
                  {state.index >= 0 && (
                    <span data-slot="hint" aria-hidden>
                      {String(state.index + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span>{props.children}</span>
                  <span data-slot="hint" aria-hidden>
                    {state.open ? "Hide" : "Show"}
                  </span>
                </button>
              )}
            >
              {step.label}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{step.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
`}]},{heading:`More examples`,text:``,examples:[{id:`accordion/rtl`,caption:``,Example:H,source:`import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "shipping",
    label: "ما هي خيارات الشحن؟",
    content: "نقدم الشحن العادي والسريع والشحن في اليوم التالي.",
  },
  {
    value: "returns",
    label: "ما هي سياسة الإرجاع؟",
    content: "يمكنك إرجاع أي منتج غير مستخدم خلال ٣٠ يومًا.",
  },
  {
    value: "support",
    label: "كيف أتواصل مع الدعم؟",
    content: "راسلنا عبر البريد أو الدردشة، ونرد خلال ٢٤ ساعة.",
  },
]

export function Example() {
  return (
    <div dir="rtl">
      <Accordion defaultValue={["shipping"]}>
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionHeader>
              <AccordionTrigger>
                {item.label}
                <ChevronDownIcon />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>{item.content}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
`}]}]};export{U as default};