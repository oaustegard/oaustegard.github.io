import{t as e}from"../chunks/c-DWFCfNnK.js";import{t}from"../chunks/c-CA3STxaZ.js";import{t as n}from"../chunks/c-CU-88Fi-.js";import{t as r}from"../chunks/c-CgVzHSix.js";import{t as i}from"../chunks/c-D7ZpXmBq.js";import{t as a}from"../chunks/c-BvocofXA.js";import{t as o}from"../chunks/c-BHtAohdq.js";import{t as s}from"../chunks/c-CKwygB1M.js";import{useLog as c}from"./log.js";import*as l from"preact/compat";import{Fragment as u,jsx as d,jsxs as f}from"preact/compat/jsx-runtime";import{NavigationMenu as p,NavigationMenuContent as m,NavigationMenuItem as h,NavigationMenuLink as g,NavigationMenuLinkIcon as _,NavigationMenuList as v,NavigationMenuTrigger as y,NavigationMenuViewport as b}from"ui-sdk/navigation-menu.js";const x=[{title:`Introduction`,href:`#`,description:`Unstyled components with one core for every framework.`},{title:`Installation`,href:`#`,description:`Add the package for your framework and render your first part.`},{title:`Styling`,href:`#`,description:`Style parts with data attributes, CSS variables and any CSS.`}],S=[{title:`Alert Dialog`,href:`#`,description:`Asks for a decision before anything else on the page can be used.`},{title:`Hover Card`,href:`#`,description:`A preview of what a link points to, for people who pause on it.`},{title:`Progress`,href:`#`,description:`Shows how far along a task is, like an upload.`},{title:`Scroll Area`,href:`#`,description:`Scrolls its content with scrollbars you can style.`},{title:`Tabs`,href:`#`,description:`Shows one panel of content at a time, picked from a list of tabs.`},{title:`Tooltip`,href:`#`,description:`A short label for a control, shown on hover or keyboard focus.`}],C=[{title:`Backlog`,href:`#`,icon:i},{title:`To do`,href:`#`,icon:a},{title:`Done`,href:`#`,icon:r},{title:`All issues`,href:`#`,icon:e,mirror:!0}];function w(){return/* @__PURE__ */ f(p,{"aria-label":`Main`,children:[/* @__PURE__ */ f(v,{children:[/* @__PURE__ */ f(h,{value:`getting-started`,children:[/* @__PURE__ */ f(y,{children:[`Getting started`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ f(`ul`,{"data-slot":`grid`,children:[/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:`#`,"data-variant":`featured`,children:[/* @__PURE__ */ d(`span`,{children:`ui-sdk`}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:`Accessible components for React, Vue, Svelte, Solid and Web Components.`})]})}),x.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))]})})]}),/* @__PURE__ */ f(h,{value:`components`,children:[/* @__PURE__ */ f(y,{children:[`Components`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{"data-slot":`grid`,children:S.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]}),/* @__PURE__ */ f(h,{value:`with-icon`,children:[/* @__PURE__ */ f(y,{children:[`With Icon`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{children:C.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(_,{mirror:e.mirror,children:/* @__PURE__ */ d(e.icon,{})}),e.title]})},e.title))})})]}),/* @__PURE__ */ d(h,{children:/* @__PURE__ */ d(g,{href:`#`,children:`Docs`})})]}),/* @__PURE__ */ d(b,{sideOffset:8})]})}const T=[{title:`Introduction`,href:`#introduction`,description:`Unstyled components with one core for every framework.`},{title:`Installation`,href:`#installation`,description:`Add the package for your framework and render your first part.`},{title:`Styling`,href:`#styling`,description:`Style parts with data attributes, CSS variables and any CSS.`}];function E({href:e,onNavigate:t,...n}){return/* @__PURE__ */ d(`a`,{...n,href:e,onClick:r=>{n.onClick?.(r),r.preventDefault(),t(e)}})}function D(){let e=c(),[n,r]=l.useState(`#introduction`),i=t=>{r(t),e(`Navigated to ${t}`)};return/* @__PURE__ */ f(p,{"aria-label":`Docs`,children:[/* @__PURE__ */ f(v,{children:[/* @__PURE__ */ f(h,{value:`guides`,children:[/* @__PURE__ */ f(y,{children:[`Guides`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{children:T.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{render:/* @__PURE__ */ d(E,{href:e.href,onNavigate:i}),current:n===e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]}),/* @__PURE__ */ d(h,{children:/* @__PURE__ */ d(g,{render:/* @__PURE__ */ d(E,{href:`#components`,onNavigate:i}),current:n===`#components`,children:`Components`})})]}),/* @__PURE__ */ d(b,{sideOffset:8})]})}const O=[{value:`guides`,label:`Guides`,links:[{title:`Introduction`,href:`#`,description:`Unstyled components with one core for every framework.`},{title:`Installation`,href:`#`,description:`Add the package for your framework and render your first part.`},{title:`Styling`,href:`#`,description:`Style parts with data attributes, CSS variables and any CSS.`}]},{value:`components`,label:`Components`,links:[{title:`Alert Dialog`,href:`#`,description:`Asks for a decision before anything else on the page can be used.`},{title:`Hover Card`,href:`#`,description:`A preview of what a link points to, for people who pause on it.`},{title:`Progress`,href:`#`,description:`Shows how far along a task is, like an upload.`},{title:`Scroll Area`,href:`#`,description:`Scrolls its content with scrollbars you can style.`}]}];function k(){return/* @__PURE__ */ f(p,{"aria-label":`Sidebar`,orientation:`vertical`,children:[/* @__PURE__ */ f(v,{children:[O.map(e=>/* @__PURE__ */ f(h,{value:e.value,children:[/* @__PURE__ */ f(y,{children:[e.label,/* @__PURE__ */ d(n,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{children:e.links.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]},e.value)),/* @__PURE__ */ d(h,{children:/* @__PURE__ */ d(g,{href:`#`,children:`Docs`})})]}),/* @__PURE__ */ d(b,{sideOffset:8})]})}const A=[{value:`guides`,label:`Guides`,links:[{title:`Introduction`,href:`#`,description:`Unstyled components with one core for every framework.`},{title:`Installation`,href:`#`,description:`Add the package for your framework and render your first part.`},{title:`Styling`,href:`#`,description:`Style parts with data attributes, CSS variables and any CSS.`}]},{value:`components`,label:`Components`,links:[{title:`Alert Dialog`,href:`#`,description:`Asks for a decision before anything else on the page can be used.`},{title:`Hover Card`,href:`#`,description:`A preview of what a link points to, for people who pause on it.`},{title:`Progress`,href:`#`,description:`Shows how far along a task is, like an upload.`},{title:`Scroll Area`,href:`#`,description:`Scrolls its content with scrollbars you can style.`}]}];function j(){return/* @__PURE__ */ f(p,{"aria-label":`Main`,openOnHover:!1,children:[/* @__PURE__ */ d(v,{children:A.map(e=>/* @__PURE__ */ f(h,{value:e.value,children:[/* @__PURE__ */ f(y,{children:[e.label,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{children:e.links.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]},e.value))}),/* @__PURE__ */ d(b,{sideOffset:8})]})}const M=[{title:`Introduction`,href:`#`,description:`Unstyled components with one core for every framework.`},{title:`Installation`,href:`#`,description:`Add the package for your framework and render your first part.`},{title:`Styling`,href:`#`,description:`Style parts with data attributes, CSS variables and any CSS.`}],N=[{value:`overlays`,label:`Overlays`,links:[{title:`Dialog`,href:`#`},{title:`Popover`,href:`#`},{title:`Tooltip`,href:`#`}]},{value:`forms`,label:`Forms`,links:[{title:`Input`,href:`#`},{title:`Select`,href:`#`},{title:`Checkbox`,href:`#`}]}];function P(){return/* @__PURE__ */ f(p,{"aria-label":`Main`,children:[/* @__PURE__ */ f(v,{children:[/* @__PURE__ */ f(h,{value:`guides`,children:[/* @__PURE__ */ f(y,{children:[`Guides`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{children:M.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]}),/* @__PURE__ */ f(h,{value:`components`,children:[/* @__PURE__ */ f(y,{children:[`Components`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(p,{orientation:`vertical`,children:/* @__PURE__ */ d(v,{children:N.map(e=>/* @__PURE__ */ f(h,{value:e.value,children:[/* @__PURE__ */ f(y,{children:[e.label,/* @__PURE__ */ d(n,{})]}),/* @__PURE__ */ d(m,{sideOffset:9,alignOffset:-5,children:/* @__PURE__ */ d(`ul`,{children:e.links.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ d(g,{href:e.href,children:e.title})},e.title))})})]},e.value))})})})]})]}),/* @__PURE__ */ d(b,{sideOffset:8})]})}const F=[{title:`Introduction`,href:`#`,description:`Unstyled components with one core for every framework.`},{title:`Installation`,href:`#`,description:`Add the package for your framework and render your first part.`},{title:`Styling`,href:`#`,description:`Style parts with data attributes, CSS variables and any CSS.`}],I=[{title:`Alert Dialog`,href:`#`,description:`Asks for a decision before anything else on the page can be used.`},{title:`Hover Card`,href:`#`,description:`A preview of what a link points to, for people who pause on it.`},{title:`Progress`,href:`#`,description:`Shows how far along a task is, like an upload.`},{title:`Scroll Area`,href:`#`,description:`Scrolls its content with scrollbars you can style.`},{title:`Tabs`,href:`#`,description:`Shows one panel of content at a time, picked from a list of tabs.`},{title:`Tooltip`,href:`#`,description:`A short label for a control, shown on hover or keyboard focus.`}];function L(){let e=c();return/* @__PURE__ */ f(p,{"aria-label":`Main`,onValueChange:t=>e(t?`Showing ${t}`:`Closing`),onOpenChangeComplete:t=>e(t?`Finished opening`:`Finished closing`),children:[/* @__PURE__ */ f(v,{children:[/* @__PURE__ */ f(h,{value:`guides`,children:[/* @__PURE__ */ f(y,{children:[`Guides`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{children:F.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]}),/* @__PURE__ */ f(h,{value:`components`,children:[/* @__PURE__ */ f(y,{children:[`Components`,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{"data-slot":`grid`,children:I.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]})]}),/* @__PURE__ */ d(b,{sideOffset:8,"data-variant":`slide`})]})}const R=[{value:`guides`,label:`Guides`,links:[{title:`Introduction`,href:`#`,description:`Unstyled components with one core for every framework.`},{title:`Installation`,href:`#`,description:`Add the package for your framework and render your first part.`},{title:`Styling`,href:`#`,description:`Style parts with data attributes, CSS variables and any CSS.`}]},{value:`components`,label:`Components`,links:[{title:`Alert Dialog`,href:`#`,description:`Asks for a decision before anything else on the page can be used.`},{title:`Hover Card`,href:`#`,description:`A preview of what a link points to, for people who pause on it.`},{title:`Progress`,href:`#`,description:`Shows how far along a task is, like an upload.`},{title:`Scroll Area`,href:`#`,description:`Scrolls its content with scrollbars you can style.`}]}];function z(){return/* @__PURE__ */ f(p,{"aria-label":`Main`,children:[/* @__PURE__ */ f(v,{children:[R.map(e=>/* @__PURE__ */ f(h,{value:e.value,children:[/* @__PURE__ */ d(y,{render:(t,n)=>/* @__PURE__ */ f(`button`,{...t,children:[e.label,n.open?/* @__PURE__ */ d(o,{}):/* @__PURE__ */ d(s,{})]})}),/* @__PURE__ */ d(m,{render:/* @__PURE__ */ d(`section`,{"aria-label":e.label}),children:t=>/* @__PURE__ */ f(u,{children:[/* @__PURE__ */ d(`p`,{"data-slot":`hint`,children:t.motion?`Moved in ${t.motion}`:`Opened`}),/* @__PURE__ */ d(`ul`,{children:e.links.map((e,t)=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ d(g,{href:e.href,current:t===0,render:(t,n)=>/* @__PURE__ */ f(`a`,{...t,children:[/* @__PURE__ */ d(`span`,{children:e.title}),n.current&&/* @__PURE__ */ d(`span`,{"data-slot":`hint`,"data-show":`current`,children:`You're here`})]})})},e.title))})]})})]},e.value)),/* @__PURE__ */ f(h,{value:`pricing`,children:[/* @__PURE__ */ d(y,{disabled:!0,render:(e,t)=>/* @__PURE__ */ f(`button`,{...e,children:[`Pricing`,t.disabled&&/* @__PURE__ */ d(`span`,{"data-slot":`badge`,"data-show":`disabled`,children:`Soon`})]})}),/* @__PURE__ */ d(m,{children:`Plans for teams.`})]})]}),/* @__PURE__ */ d(b,{sideOffset:8})]})}const B=[{value:`guides`,label:`الأدلة`,links:[{title:`مقدمة`,href:`#`,description:`مكونات بلا أنماط بنواة واحدة لكل إطار عمل.`},{title:`التثبيت`,href:`#`,description:`أضف الحزمة لإطار عملك واعرض أول جزء.`},{title:`التنسيق`,href:`#`,description:`نسّق الأجزاء بسمات البيانات ومتغيرات CSS.`}]},{value:`components`,label:`المكونات`,links:[{title:`مربع تنبيه`,href:`#`,description:`يطلب قرارًا قبل استخدام أي شيء آخر في الصفحة.`},{title:`بطاقة التمرير`,href:`#`,description:`معاينة لما يشير إليه الرابط.`},{title:`علامات التبويب`,href:`#`,description:`تعرض لوحة واحدة من المحتوى في كل مرة.`}]}];function V(){return/* @__PURE__ */ d(`div`,{dir:`rtl`,children:/* @__PURE__ */ f(p,{"aria-label":`الرئيسية`,children:[/* @__PURE__ */ f(v,{children:[B.map(e=>/* @__PURE__ */ f(h,{value:e.value,children:[/* @__PURE__ */ f(y,{children:[e.label,/* @__PURE__ */ d(t,{})]}),/* @__PURE__ */ d(m,{children:/* @__PURE__ */ d(`ul`,{children:e.links.map(e=>/* @__PURE__ */ d(`li`,{children:/* @__PURE__ */ f(g,{href:e.href,children:[/* @__PURE__ */ d(`span`,{children:e.title}),/* @__PURE__ */ d(`span`,{"data-slot":`hint`,children:e.description})]})},e.title))})})]},e.value)),/* @__PURE__ */ d(h,{children:/* @__PURE__ */ d(g,{href:`#`,children:`المستندات`})})]}),/* @__PURE__ */ d(b,{sideOffset:8})]})})}var H={name:`navigation-menu`,title:`Navigation Menu`,description:`Groups site links into panels that open from a row of triggers.`,sections:[{heading:null,text:`Use a Navigation Menu for a site's main links, grouped into panels that open from a row of triggers. For a list of actions, use a Menu.`,examples:[{id:`navigation-menu/basic`,caption:`Open each section, then use Tab or the arrow keys to move through its links.`,Example:w,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkIcon,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CircleIcon,
  CircleCheckIcon,
  CircleQuestionMarkIcon,
} from "lucide-react"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

const components = [
  {
    title: "Alert Dialog",
    href: "#",
    description:
      "Asks for a decision before anything else on the page can be used.",
  },
  {
    title: "Hover Card",
    href: "#",
    description:
      "A preview of what a link points to, for people who pause on it.",
  },
  {
    title: "Progress",
    href: "#",
    description: "Shows how far along a task is, like an upload.",
  },
  {
    title: "Scroll Area",
    href: "#",
    description: "Scrolls its content with scrollbars you can style.",
  },
  {
    title: "Tabs",
    href: "#",
    description:
      "Shows one panel of content at a time, picked from a list of tabs.",
  },
  {
    title: "Tooltip",
    href: "#",
    description:
      "A short label for a control, shown on hover or keyboard focus.",
  },
]

const statuses = [
  { title: "Backlog", href: "#", icon: CircleQuestionMarkIcon },
  { title: "To do", href: "#", icon: CircleIcon },
  { title: "Done", href: "#", icon: CircleCheckIcon },
  { title: "All issues", href: "#", icon: ArrowRightIcon, mirror: true },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="getting-started">
          <NavigationMenuTrigger>
            Getting started
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul data-slot="grid">
              <li>
                <NavigationMenuLink href="#" data-variant="featured">
                  <span>ui-sdk</span>
                  <span data-slot="hint">
                    Accessible components for React, Vue, Svelte, Solid and Web
                    Components.
                  </span>
                </NavigationMenuLink>
              </li>
              {gettingStarted.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>
            Components
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul data-slot="grid">
              {components.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="with-icon">
          <NavigationMenuTrigger>
            With Icon
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {statuses.map((status) => (
                <li key={status.title}>
                  <NavigationMenuLink href={status.href}>
                    <NavigationMenuLinkIcon mirror={status.mirror}>
                      <status.icon />
                    </NavigationMenuLinkIcon>
                    {status.title}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
`}]},{heading:`Link Component`,text:'Render your router\'s link for client-side navigation. `current` marks the link for the current page with `aria-current="page"` and `data-current`.',examples:[{id:`navigation-menu/link-component`,caption:`Choose a link to update the current page without reloading the example.`,Example:D,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#introduction",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#installation",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#styling",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

function Link({
  href,
  onNavigate,
  ...props
}: React.ComponentProps<"a"> & {
  href: string
  onNavigate: (href: string) => void
}) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        props.onClick?.(event)
        event.preventDefault()
        onNavigate(href)
      }}
    />
  )
}

function Example() {
  const log = useLog()
  const [route, setRoute] = React.useState("#introduction")
  const navigate = (href: string) => {
    setRoute(href)
    log(\`Navigated to \${href}\`)
  }

  return (
    <NavigationMenu aria-label="Docs">
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>
            Guides
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {gettingStarted.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink
                    render={<Link href={page.href} onNavigate={navigate} />}
                    current={route === page.href}
                  >
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            render={<Link href="#components" onNavigate={navigate} />}
            current={route === "#components"}
          >
            Components
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'`orientation="vertical"` is for a sidebar: Up and Down move between the items, and panels open beside the menu, at the inline end, unless `side` says otherwise.',examples:[{id:`navigation-menu/vertical`,caption:`Use Up and Down between the sidebar items, then open a panel beside its trigger.`,Example:k,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronRightIcon } from "lucide-react"

const sections = [
  {
    value: "guides",
    label: "Guides",
    links: [
      {
        title: "Introduction",
        href: "#",
        description: "Unstyled components with one core for every framework.",
      },
      {
        title: "Installation",
        href: "#",
        description:
          "Add the package for your framework and render your first part.",
      },
      {
        title: "Styling",
        href: "#",
        description:
          "Style parts with data attributes, CSS variables and any CSS.",
      },
    ],
  },
  {
    value: "components",
    label: "Components",
    links: [
      {
        title: "Alert Dialog",
        href: "#",
        description:
          "Asks for a decision before anything else on the page can be used.",
      },
      {
        title: "Hover Card",
        href: "#",
        description:
          "A preview of what a link points to, for people who pause on it.",
      },
      {
        title: "Progress",
        href: "#",
        description: "Shows how far along a task is, like an upload.",
      },
      {
        title: "Scroll Area",
        href: "#",
        description: "Scrolls its content with scrollbars you can style.",
      },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Sidebar" orientation="vertical">
      <NavigationMenuList>
        {sections.map((section) => (
          <NavigationMenuItem key={section.value} value={section.value}>
            <NavigationMenuTrigger>
              {section.label}
              <ChevronRightIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul>
                {section.links.map((link) => (
                  <li key={link.title}>
                    <NavigationMenuLink href={link.href}>
                      <span>{link.title}</span>
                      <span data-slot="hint">{link.description}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
`}]},{heading:`Click Only`,text:"Resting the pointer on a trigger opens its panel. With `openOnHover` set to false, the menu opens on click only: pressing a trigger opens and closes its panel, and moving the pointer does nothing. Keyboard and touch work the same either way.",examples:[{id:`navigation-menu/click-only`,caption:`Click a trigger to open it. Moving the pointer between triggers does not open another panel.`,Example:j,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"

const sections = [
  {
    value: "guides",
    label: "Guides",
    links: [
      {
        title: "Introduction",
        href: "#",
        description: "Unstyled components with one core for every framework.",
      },
      {
        title: "Installation",
        href: "#",
        description:
          "Add the package for your framework and render your first part.",
      },
      {
        title: "Styling",
        href: "#",
        description:
          "Style parts with data attributes, CSS variables and any CSS.",
      },
    ],
  },
  {
    value: "components",
    label: "Components",
    links: [
      {
        title: "Alert Dialog",
        href: "#",
        description:
          "Asks for a decision before anything else on the page can be used.",
      },
      {
        title: "Hover Card",
        href: "#",
        description:
          "A preview of what a link points to, for people who pause on it.",
      },
      {
        title: "Progress",
        href: "#",
        description: "Shows how far along a task is, like an upload.",
      },
      {
        title: "Scroll Area",
        href: "#",
        description: "Scrolls its content with scrollbars you can style.",
      },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main" openOnHover={false}>
      <NavigationMenuList>
        {sections.map((section) => (
          <NavigationMenuItem key={section.value} value={section.value}>
            <NavigationMenuTrigger>
              {section.label}
              <ChevronDownIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul>
                {section.links.map((link) => (
                  <li key={link.title}>
                    <NavigationMenuLink href={link.href}>
                      <span>{link.title}</span>
                      <span data-slot="hint">{link.description}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
`}]},{heading:`Nested`,text:"A navigation menu inside another menu's content is a submenu. It renders a plain element instead of a second `<nav>` landmark, gets `data-nested`, and closes with its parent when the parent moves on to another item. Without a viewport of its own, its panels open beside its triggers. Pressing a link in it closes every menu.",examples:[{id:`navigation-menu/nested`,caption:`Open Components, then open Overlays or Forms. Escape closes the inner panel first.`,Example:P,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

const groups = [
  {
    value: "overlays",
    label: "Overlays",
    links: [
      { title: "Dialog", href: "#" },
      { title: "Popover", href: "#" },
      { title: "Tooltip", href: "#" },
    ],
  },
  {
    value: "forms",
    label: "Forms",
    links: [
      { title: "Input", href: "#" },
      { title: "Select", href: "#" },
      { title: "Checkbox", href: "#" },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>
            Guides
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {gettingStarted.map((link) => (
                <li key={link.title}>
                  <NavigationMenuLink href={link.href}>
                    <span>{link.title}</span>
                    <span data-slot="hint">{link.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>
            Components
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenu orientation="vertical">
              <NavigationMenuList>
                {groups.map((group) => (
                  <NavigationMenuItem key={group.value} value={group.value}>
                    <NavigationMenuTrigger>
                      {group.label}
                      <ChevronRightIcon />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent sideOffset={9} alignOffset={-5}>
                      <ul>
                        {group.links.map((link) => (
                          <li key={link.title}>
                            <NavigationMenuLink href={link.href}>
                              {link.title}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The viewport and contents get `data-starting-style` for their first frame and `data-ending-style` while they animate out, and stay mounted until their animation finishes. Contents also get `data-motion` while another item takes over: `from-end` or `from-start` on the one coming in, and `to-start` or `to-end` on the one giving way. Order is logical, so in right-to-left layouts the end is on the left. The viewport can transition `width`, `height`, `left` and `top` as it follows the open item.",examples:[{id:`navigation-menu/animation`,caption:`Switch between Guides and Components to see the viewport resize and the panels slide.`,Example:L,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

const components = [
  {
    title: "Alert Dialog",
    href: "#",
    description:
      "Asks for a decision before anything else on the page can be used.",
  },
  {
    title: "Hover Card",
    href: "#",
    description:
      "A preview of what a link points to, for people who pause on it.",
  },
  {
    title: "Progress",
    href: "#",
    description: "Shows how far along a task is, like an upload.",
  },
  {
    title: "Scroll Area",
    href: "#",
    description: "Scrolls its content with scrollbars you can style.",
  },
  {
    title: "Tabs",
    href: "#",
    description:
      "Shows one panel of content at a time, picked from a list of tabs.",
  },
  {
    title: "Tooltip",
    href: "#",
    description:
      "A short label for a control, shown on hover or keyboard focus.",
  },
]

function Example() {
  const log = useLog()

  return (
    <NavigationMenu
      aria-label="Main"
      onValueChange={(value) => log(value ? \`Showing \${value}\` : "Closing")}
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>
            Guides
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {gettingStarted.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>
            Components
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul data-slot="grid">
              {components.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} data-variant="slide" />
    </NavigationMenu>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Use render functions to change the markup or read a part's state. Here a trigger reads `open` to swap its icon, the content reads `motion`, the current link reads `current` to say you're there, and a disabled trigger reads `disabled` to show a badge.",examples:[{id:`navigation-menu/custom-rendering`,caption:`Open Guides to see its render state, then compare the current link and disabled trigger.`,Example:z,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { MinusIcon, PlusIcon } from "lucide-react"

const sections = [
  {
    value: "guides",
    label: "Guides",
    links: [
      {
        title: "Introduction",
        href: "#",
        description: "Unstyled components with one core for every framework.",
      },
      {
        title: "Installation",
        href: "#",
        description:
          "Add the package for your framework and render your first part.",
      },
      {
        title: "Styling",
        href: "#",
        description:
          "Style parts with data attributes, CSS variables and any CSS.",
      },
    ],
  },
  {
    value: "components",
    label: "Components",
    links: [
      {
        title: "Alert Dialog",
        href: "#",
        description:
          "Asks for a decision before anything else on the page can be used.",
      },
      {
        title: "Hover Card",
        href: "#",
        description:
          "A preview of what a link points to, for people who pause on it.",
      },
      {
        title: "Progress",
        href: "#",
        description: "Shows how far along a task is, like an upload.",
      },
      {
        title: "Scroll Area",
        href: "#",
        description: "Scrolls its content with scrollbars you can style.",
      },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        {sections.map((section) => (
          <NavigationMenuItem key={section.value} value={section.value}>
            <NavigationMenuTrigger
              render={(props, state) => (
                <button {...props}>
                  {section.label}
                  {state.open ? <MinusIcon /> : <PlusIcon />}
                </button>
              )}
            />
            <NavigationMenuContent
              render={<section aria-label={section.label} />}
            >
              {(state) => (
                <>
                  <p data-slot="hint">
                    {state.motion ? \`Moved in \${state.motion}\` : "Opened"}
                  </p>
                  <ul>
                    {section.links.map((link, index) => (
                      <li key={link.title}>
                        <NavigationMenuLink
                          href={link.href}
                          current={index === 0}
                          render={(props, linkState) => (
                            <a {...props}>
                              <span>{link.title}</span>
                              {linkState.current && (
                                <span data-slot="hint" data-show="current">
                                  You're here
                                </span>
                              )}
                            </a>
                          )}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem value="pricing">
          <NavigationMenuTrigger
            disabled
            render={(props, state) => (
              <button {...props}>
                Pricing
                {state.disabled && (
                  <span data-slot="badge" data-show="disabled">
                    Soon
                  </span>
                )}
              </button>
            )}
          />
          <NavigationMenuContent>Plans for teams.</NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`navigation-menu/rtl`,caption:``,Example:V,source:`"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"

const sections = [
  {
    value: "guides",
    label: "الأدلة",
    links: [
      {
        title: "مقدمة",
        href: "#",
        description: "مكونات بلا أنماط بنواة واحدة لكل إطار عمل.",
      },
      {
        title: "التثبيت",
        href: "#",
        description: "أضف الحزمة لإطار عملك واعرض أول جزء.",
      },
      {
        title: "التنسيق",
        href: "#",
        description: "نسّق الأجزاء بسمات البيانات ومتغيرات CSS.",
      },
    ],
  },
  {
    value: "components",
    label: "المكونات",
    links: [
      {
        title: "مربع تنبيه",
        href: "#",
        description: "يطلب قرارًا قبل استخدام أي شيء آخر في الصفحة.",
      },
      {
        title: "بطاقة التمرير",
        href: "#",
        description: "معاينة لما يشير إليه الرابط.",
      },
      {
        title: "علامات التبويب",
        href: "#",
        description: "تعرض لوحة واحدة من المحتوى في كل مرة.",
      },
    ],
  },
]

function Example() {
  return (
    <div dir="rtl">
      <NavigationMenu aria-label="الرئيسية">
        <NavigationMenuList>
          {sections.map((section) => (
            <NavigationMenuItem key={section.value} value={section.value}>
              <NavigationMenuTrigger>
                {section.label}
                <ChevronDownIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul>
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <NavigationMenuLink href={link.href}>
                        <span>{link.title}</span>
                        <span data-slot="hint">{link.description}</span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <NavigationMenuLink href="#">المستندات</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport sideOffset={8} />
      </NavigationMenu>
    </div>
  )
}

export { Example }
`}]}]};export{H as default};