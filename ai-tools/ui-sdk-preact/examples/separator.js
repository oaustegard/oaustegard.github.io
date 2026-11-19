import{jsx as e,jsxs as t}from"preact/compat/jsx-runtime";import{Separator as n}from"ui-sdk/separator.js";function r(){return/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ e(`h3`,{children:`Hollis Grant`}),/* @__PURE__ */ e(`p`,{"data-slot":`hint`,children:`hollis@example.com`})]}),/* @__PURE__ */ e(n,{}),/* @__PURE__ */ e(`p`,{children:`Designs the billing and onboarding flows, and reviews every new pricing page.`})]})}function i(){return/* @__PURE__ */ t(`nav`,{"aria-label":`Legal`,"data-slot":`row`,children:[/* @__PURE__ */ e(`a`,{href:`#`,children:`Privacy`}),/* @__PURE__ */ e(n,{orientation:`vertical`}),/* @__PURE__ */ e(`a`,{href:`#`,children:`Terms`}),/* @__PURE__ */ e(n,{orientation:`vertical`}),/* @__PURE__ */ e(`a`,{href:`#`,children:`Cookies`})]})}function a(){return/* @__PURE__ */ t(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ e(`span`,{children:`24`}),/* @__PURE__ */ e(`span`,{"data-slot":`hint`,children:`Projects`})]}),/* @__PURE__ */ e(n,{orientation:`vertical`}),/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ e(`span`,{children:`1,280`}),/* @__PURE__ */ e(`span`,{"data-slot":`hint`,children:`Followers`})]}),/* @__PURE__ */ e(n,{orientation:`vertical`}),/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ e(`span`,{children:`312`}),/* @__PURE__ */ e(`span`,{"data-slot":`hint`,children:`Following`})]})]})}function o(){return/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ t(`dl`,{children:[/* @__PURE__ */ e(`dt`,{children:`Plan`}),/* @__PURE__ */ e(`dd`,{children:`Pro`})]}),/* @__PURE__ */ e(n,{}),/* @__PURE__ */ t(`dl`,{children:[/* @__PURE__ */ e(`dt`,{children:`Seats`}),/* @__PURE__ */ e(`dd`,{children:`8 of 10`})]}),/* @__PURE__ */ e(n,{}),/* @__PURE__ */ t(`dl`,{children:[/* @__PURE__ */ e(`dt`,{children:`Renews`}),/* @__PURE__ */ e(`dd`,{children:`December 1, 2026`})]})]})}function s(){return/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ e(`button`,{type:`button`,"data-variant":`solid`,children:`Sign In with Passkey`}),/* @__PURE__ */ t(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ e(n,{decorative:!0}),/* @__PURE__ */ e(`span`,{children:`or`}),/* @__PURE__ */ e(n,{decorative:!0})]}),/* @__PURE__ */ e(`button`,{type:`button`,children:`Email Me a Link`})]})}function c(){return/* @__PURE__ */ t(`div`,{"data-slot":`stack`,dir:`rtl`,children:[/* @__PURE__ */ t(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ e(`h3`,{children:`الحساب`}),/* @__PURE__ */ e(`p`,{"data-slot":`hint`,children:`إدارة ملفك الشخصي وتفضيلاتك.`})]}),/* @__PURE__ */ e(n,{}),/* @__PURE__ */ t(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ e(`span`,{children:`الملف الشخصي`}),/* @__PURE__ */ e(n,{orientation:`vertical`}),/* @__PURE__ */ e(`span`,{children:`الفوترة`}),/* @__PURE__ */ e(n,{orientation:`vertical`}),/* @__PURE__ */ e(`span`,{children:`الإعدادات`})]})]})}var l={name:`separator`,title:`Separator`,description:`Divide groups of content with a horizontal or vertical line.`,sections:[{heading:null,text:`Use a separator between groups of content that a reader should take as separate, like a profile's header and its bio.`,examples:[{id:`separator/basic`,caption:`Read the profile with a screen reader. It announces a separator between Hollis Grant's name and email and the bio below.`,Example:r,source:`import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="stack">
      <div data-slot="stack">
        <h3>Hollis Grant</h3>
        <p data-slot="hint">hollis@example.com</p>
      </div>
      <Separator />
      <p>
        Designs the billing and onboarding flows, and reviews every new pricing
        page.
      </p>
    </div>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'Set `orientation="vertical"` for a line between items in a row. It takes the row\'s height.',examples:[{id:`separator/vertical`,caption:`Read across Privacy, Terms and Cookies. A screen reader announces a vertical separator between each link.`,Example:i,source:`import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <nav aria-label="Legal" data-slot="row">
      <a href="#">Privacy</a>
      <Separator orientation="vertical" />
      <a href="#">Terms</a>
      <Separator orientation="vertical" />
      <a href="#">Cookies</a>
    </nav>
  )
}

export { Example }
`}]},{heading:`Stacked Content`,text:`A vertical separator stretches to the tallest item in its row, so it spans a number and its label.`,examples:[{id:`separator/menu`,caption:`Compare the lines with the stats. Each one runs the full height of Projects, Followers and Following.`,Example:a,source:`import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="row">
      <div data-slot="stack">
        <span>24</span>
        <span data-slot="hint">Projects</span>
      </div>
      <Separator orientation="vertical" />
      <div data-slot="stack">
        <span>1,280</span>
        <span data-slot="hint">Followers</span>
      </div>
      <Separator orientation="vertical" />
      <div data-slot="stack">
        <span>312</span>
        <span data-slot="hint">Following</span>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Rows`,text:`Put a separator between each pair of rows to divide a list of details.`,examples:[{id:`separator/list`,caption:`Read the plan details with a screen reader. It announces a separator between Plan, Seats and Renews.`,Example:o,source:`import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="stack">
      <dl>
        <dt>Plan</dt>
        <dd>Pro</dd>
      </dl>
      <Separator />
      <dl>
        <dt>Seats</dt>
        <dd>8 of 10</dd>
      </dl>
      <Separator />
      <dl>
        <dt>Renews</dt>
        <dd>December 1, 2026</dd>
      </dl>
    </div>
  )
}

export { Example }
`}]},{heading:`Decorative`,text:"Set `decorative` when the line adds no information. Here, the word “or” already says the two ways to sign in are separate, so a screen reader skips the lines.",examples:[{id:`separator/decorative`,caption:`Read from Sign In with Passkey to Email Me a Link with a screen reader. It reads “or” and skips the lines.`,Example:s,source:`import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="stack">
      <button type="button" data-variant="solid">
        Sign In with Passkey
      </button>
      <div data-slot="row">
        <Separator decorative />
        <span>or</span>
        <Separator decorative />
      </div>
      <button type="button">Email Me a Link</button>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`separator/rtl`,caption:``,Example:c,source:`import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="stack" dir="rtl">
      <div data-slot="stack">
        <h3>الحساب</h3>
        <p data-slot="hint">إدارة ملفك الشخصي وتفضيلاتك.</p>
      </div>
      <Separator />
      <div data-slot="row">
        <span>الملف الشخصي</span>
        <Separator orientation="vertical" />
        <span>الفوترة</span>
        <Separator orientation="vertical" />
        <span>الإعدادات</span>
      </div>
    </div>
  )
}

export { Example }
`}]}]};export{l as default};