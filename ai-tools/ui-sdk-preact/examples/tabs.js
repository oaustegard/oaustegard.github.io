import{t as e}from"../chunks/c-CCOgxx-k.js";import{t}from"../chunks/c-DLR1Qq0Q.js";import{t as n}from"../chunks/c-DLl0Awjp.js";import{useLog as r}from"./log.js";import*as i from"preact/compat";import{jsx as a,jsxs as o}from"preact/compat/jsx-runtime";import{Field as s,FieldLabel as c}from"ui-sdk/field.js";import{Input as l}from"ui-sdk/input.js";import{Textarea as u}from"ui-sdk/textarea.js";import{Tabs as d,TabsIndicator as f,TabsList as p,TabsPanel as m,TabsTab as h,TabsTabIcon as g}from"ui-sdk/tabs.js";import{createTabsController as _}from"ui-sdk/core/tabs.js";function v(){return/* @__PURE__ */ o(d,{defaultValue:`account`,children:[/* @__PURE__ */ o(p,{"aria-label":`Settings`,children:[/* @__PURE__ */ a(h,{value:`account`,children:`Account`}),/* @__PURE__ */ a(h,{value:`password`,children:`Password`})]}),/* @__PURE__ */ a(m,{value:`account`,children:`Update your name, email address and profile photo. Your team sees changes right away.`}),/* @__PURE__ */ a(m,{value:`password`,children:`Choose a new password for hollis@example.com. You stay signed in on this device.`})]})}function y(){return/* @__PURE__ */ o(d,{defaultValue:`general`,orientation:`vertical`,children:[/* @__PURE__ */ o(p,{"aria-label":`Preferences`,children:[/* @__PURE__ */ a(h,{value:`general`,children:`General`}),/* @__PURE__ */ a(h,{value:`security`,children:`Security`}),/* @__PURE__ */ a(h,{value:`integrations`,children:`Integrations`})]}),/* @__PURE__ */ a(m,{value:`general`,children:`Choose your language, time zone and the page you start on.`}),/* @__PURE__ */ a(m,{value:`security`,children:`Manage passkeys, signed-in sessions and recovery codes.`}),/* @__PURE__ */ a(m,{value:`integrations`,children:`Connect your calendar and chat apps to get reminders.`})]})}function b(){return/* @__PURE__ */ o(d,{defaultValue:`overview`,children:[/* @__PURE__ */ o(p,{"aria-label":`Dashboard`,children:[/* @__PURE__ */ a(h,{value:`overview`,children:`Overview`}),/* @__PURE__ */ a(h,{value:`analytics`,children:`Analytics`}),/* @__PURE__ */ a(h,{value:`reports`,disabled:!0,children:`Reports`})]}),/* @__PURE__ */ a(m,{value:`overview`,children:`Revenue, visitors and sign-ups for the last 30 days.`}),/* @__PURE__ */ a(m,{value:`analytics`,children:`Where your visitors come from and the pages they read most.`}),/* @__PURE__ */ a(m,{value:`reports`,children:`Monthly reports are available on the Pro plan.`})]})}function x(){return/* @__PURE__ */ o(d,{defaultValue:`inbox`,children:[/* @__PURE__ */ o(p,{"aria-label":`Mail`,children:[/* @__PURE__ */ o(h,{value:`inbox`,children:[/* @__PURE__ */ a(g,{children:/* @__PURE__ */ a(t,{})}),`Inbox`]}),/* @__PURE__ */ o(h,{value:`replies`,children:[/* @__PURE__ */ a(g,{mirror:!0,children:/* @__PURE__ */ a(n,{})}),`Replies`]}),/* @__PURE__ */ o(h,{value:`archive`,children:[/* @__PURE__ */ a(g,{children:/* @__PURE__ */ a(e,{})}),`Archive`]})]}),/* @__PURE__ */ a(m,{value:`inbox`,children:`3 new messages from Inès Moreau and Kofi Mensah.`}),/* @__PURE__ */ a(m,{value:`replies`,children:`Wren Takahashi replied to your message about the launch.`}),/* @__PURE__ */ a(m,{value:`archive`,children:`Messages you archived stay here and in search.`})]})}function S(){return/* @__PURE__ */ o(d,{defaultValue:`preview`,activation:`manual`,children:[/* @__PURE__ */ o(p,{"aria-label":`Snippet`,children:[/* @__PURE__ */ a(h,{value:`preview`,children:`Preview`}),/* @__PURE__ */ a(h,{value:`code`,children:`Code`})]}),/* @__PURE__ */ a(m,{value:`preview`,children:`Welcome back, Hollis. You have 3 unread messages.`}),/* @__PURE__ */ a(m,{value:`code`,children:/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(c,{children:`Source`}),/* @__PURE__ */ a(l,{defaultValue:`<Welcome name="Hollis" unread={3} />`})]})})]})}const C=[{value:`day`,label:`Day`,content:`128 visitors today, up 12% from yesterday.`},{value:`week`,label:`Week`,content:`1,024 visitors this week, up 8% from last week.`},{value:`month`,label:`Month`,content:`4,210 visitors this month, down 3% from last month.`},{value:`year`,label:`Year`,content:`48,930 visitors this year, up 21% from last year.`}];function w(){return/* @__PURE__ */ o(d,{defaultValue:`day`,loop:!1,children:[/* @__PURE__ */ a(p,{"aria-label":`Range`,children:C.map(e=>/* @__PURE__ */ a(h,{value:e.value,children:e.label},e.value))}),C.map(e=>/* @__PURE__ */ a(m,{value:e.value,children:e.content},e.value))]})}const T=[{value:`horizontal`,label:`Horizontal`},{value:`vertical`,label:`Vertical`}];function E(){let[e,t]=i.useState(`horizontal`);return/* @__PURE__ */ o(`div`,{children:[/* @__PURE__ */ a(`div`,{"data-slot":`controls`,role:`group`,"aria-label":`Orientation`,children:T.map(n=>/* @__PURE__ */ a(`button`,{type:`button`,"data-size":`sm`,"aria-pressed":e===n.value,onClick:()=>t(n.value),children:n.label},n.value))}),/* @__PURE__ */ o(d,{defaultValue:`music`,orientation:e,children:[/* @__PURE__ */ o(p,{"aria-label":`Library`,children:[/* @__PURE__ */ a(h,{value:`music`,children:`Music`}),/* @__PURE__ */ a(h,{value:`podcasts`,children:`Podcasts`}),/* @__PURE__ */ a(h,{value:`audiobooks`,children:`Audiobooks`}),/* @__PURE__ */ a(f,{})]}),/* @__PURE__ */ a(m,{value:`music`,children:`312 songs in 24 albums, synced to this device.`}),/* @__PURE__ */ a(m,{value:`podcasts`,children:`8 shows you follow, with 3 new episodes.`}),/* @__PURE__ */ a(m,{value:`audiobooks`,children:`2 books in progress, 6 hours left in total.`})]})]})}function D(){return/* @__PURE__ */ o(d,{defaultValue:`reply`,children:[/* @__PURE__ */ o(p,{"aria-label":`Comment`,children:[/* @__PURE__ */ a(h,{value:`reply`,children:`Reply`}),/* @__PURE__ */ a(h,{value:`formatting`,children:`Formatting`}),/* @__PURE__ */ a(f,{})]}),/* @__PURE__ */ a(m,{value:`reply`,keepMounted:!0,children:/* @__PURE__ */ o(s,{children:[/* @__PURE__ */ a(c,{children:`Message`}),/* @__PURE__ */ a(u,{rows:3,placeholder:`Write a reply…`})]})}),/* @__PURE__ */ o(m,{value:`formatting`,children:[/* @__PURE__ */ a(`p`,{children:"Use **bold**, _italics_ and `code` to format your reply."}),/* @__PURE__ */ a(`p`,{children:`Paste a link on its own line to show a preview.`})]})]})}const O=[{value:`shipping`,label:`Shipping`,text:`Orders leave our warehouse within two working days. Express delivery arrives the next morning.`},{value:`returns`,label:`Returns`,text:`Send anything back within 30 days. Opened electronics carry a restocking fee of 10 percent.`},{value:`warranty`,label:`Warranty`,text:`Every product has a two-year warranty. Batteries are covered for one year from delivery.`}];function k(){return/* @__PURE__ */ o(d,{defaultValue:`shipping`,hiddenUntilFound:!0,children:[/* @__PURE__ */ a(p,{"aria-label":`Policies`,children:O.map(e=>/* @__PURE__ */ a(h,{value:e.value,children:e.label},e.value))}),O.map(e=>/* @__PURE__ */ a(m,{value:e.value,children:e.text},e.value))]})}function A(){return/* @__PURE__ */ o(d,{defaultValue:`overview`,children:[/* @__PURE__ */ o(p,{"aria-label":`Project`,children:[/* @__PURE__ */ a(h,{value:`overview`,children:`Overview`}),/* @__PURE__ */ a(h,{value:`activity`,children:`Activity`}),/* @__PURE__ */ a(h,{value:`settings`,children:`Settings`}),/* @__PURE__ */ a(f,{})]}),/* @__PURE__ */ o(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ a(m,{value:`overview`,children:`The launch is on track for Friday, with 4 of 6 tasks done.`}),/* @__PURE__ */ a(m,{value:`activity`,children:`Inès Moreau deployed to production and Kofi Mensah left a review.`}),/* @__PURE__ */ a(m,{value:`settings`,children:`Rename the project, transfer it to another team or archive it.`})]})]})}function j(){let e=r(),[t]=i.useState(()=>_()),[n,s]=i.useState(`inbox`);return/* @__PURE__ */ o(`div`,{children:[/* @__PURE__ */ a(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ a(`button`,{type:`button`,onClick:()=>t.select(`sent`),children:`Show Sent Mail`})}),/* @__PURE__ */ o(d,{value:n,onValueChange:(t,n)=>{s(t),e(`value: ${t} (${n.reason})`)},controller:t,children:[/* @__PURE__ */ o(p,{"aria-label":`Mail`,children:[/* @__PURE__ */ a(h,{value:`inbox`,children:`Inbox`}),/* @__PURE__ */ a(h,{value:`drafts`,children:`Drafts`}),/* @__PURE__ */ a(h,{value:`sent`,children:`Sent`}),/* @__PURE__ */ a(f,{})]}),/* @__PURE__ */ a(m,{value:`inbox`,children:`3 unread messages from Hollis Grant and Inès Moreau.`}),/* @__PURE__ */ a(m,{value:`drafts`,children:`2 drafts, the last one edited yesterday at 4:12 PM.`}),/* @__PURE__ */ a(m,{value:`sent`,children:`12 messages sent this week, all delivered.`})]})]})}const M=[{value:`overview`,href:`#project-overview`,label:`Overview`,content:`Hollis Grant started this project in March. It has 14 open issues.`},{value:`activity`,href:`#project-activity`,label:`Activity`,content:`Wren Takahashi merged 3 pull requests and closed 5 issues this week.`},{value:`members`,href:`#project-members`,label:`Members`,content:`Hollis Grant owns the project. Wren Takahashi and 3 others can edit it.`}];function N(){return/* @__PURE__ */ o(d,{defaultValue:`overview`,children:[/* @__PURE__ */ o(p,{"aria-label":`Project`,children:[M.map(e=>/* @__PURE__ */ a(h,{value:e.value,render:/* @__PURE__ */ a(`a`,{href:e.href}),children:e.label},e.value)),/* @__PURE__ */ a(f,{})]}),M.map(e=>/* @__PURE__ */ a(m,{value:e.value,children:e.content},e.value))]})}const P=[{value:`inbox`,label:`Inbox`,count:12,content:`12 conversations, 3 of them unread.`},{value:`unread`,label:`Unread`,count:3,content:`Hollis Grant, Inès Moreau and Kofi Mensah wrote to you.`},{value:`archived`,label:`Archived`,count:0,content:`Nothing archived yet. Archived mail stays searchable.`}];function F(){return/* @__PURE__ */ o(d,{defaultValue:`inbox`,children:[/* @__PURE__ */ a(p,{"aria-label":`Mail`,children:P.map(e=>/* @__PURE__ */ a(h,{value:e.value,render:t=>/* @__PURE__ */ o(`button`,{...t,children:[t.children,e.count>0&&/* @__PURE__ */ a(`span`,{"data-slot":`badge`,children:e.count})]}),children:e.label},e.value))}),P.map(e=>/* @__PURE__ */ a(m,{value:e.value,children:e.content},e.value))]})}function I(){return/* @__PURE__ */ o(d,{defaultValue:`overview`,children:[/* @__PURE__ */ o(p,{"aria-label":`Dashboard`,children:[/* @__PURE__ */ a(h,{value:`overview`,children:`Overview`}),/* @__PURE__ */ a(h,{value:`analytics`,children:`Analytics`}),/* @__PURE__ */ a(h,{value:`reports`,children:`Reports`}),/* @__PURE__ */ a(f,{})]}),/* @__PURE__ */ a(m,{value:`overview`,children:`Revenue, visitors and sign-ups for the last 30 days.`}),/* @__PURE__ */ a(m,{value:`analytics`,children:`Where visitors come from and what they do.`}),/* @__PURE__ */ a(m,{value:`reports`,children:`Monthly reports, ready to download.`})]})}function L(){return/* @__PURE__ */ a(`div`,{dir:`rtl`,children:/* @__PURE__ */ o(d,{defaultValue:`account`,children:[/* @__PURE__ */ o(p,{"aria-label":`الإعدادات`,children:[/* @__PURE__ */ a(h,{value:`account`,children:`الحساب`}),/* @__PURE__ */ a(h,{value:`password`,children:`كلمة المرور`}),/* @__PURE__ */ a(h,{value:`notifications`,children:`الإشعارات`}),/* @__PURE__ */ a(f,{})]}),/* @__PURE__ */ a(m,{value:`account`,children:`عدّل اسمك وبريدك الإلكتروني وصورتك.`}),/* @__PURE__ */ a(m,{value:`password`,children:`غيّر كلمة المرور وفعّل التحقق بخطوتين.`}),/* @__PURE__ */ a(m,{value:`notifications`,children:`اختر ما نرسله إليك بالبريد.`})]})})}var R={name:`tabs`,title:`Tabs`,description:`Switch between related panels with one tab selected at a time.`,sections:[{heading:null,text:`Use Tabs when several views share the same space, such as settings sections or a preview and its source. Each tab opens the panel with the same value.`,examples:[{id:`tabs/basic`,caption:`Choose Password to show its panel. Use the left and right arrow keys to move between the tabs.`,Example:v,source:`"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList aria-label="Settings">
        <TabsTab value="account">Account</TabsTab>
        <TabsTab value="password">Password</TabsTab>
      </TabsList>
      <TabsPanel value="account">
        Update your name, email address and profile photo. Your team sees
        changes right away.
      </TabsPanel>
      <TabsPanel value="password">
        Choose a new password for hollis@example.com. You stay signed in on this
        device.
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'Set `orientation="vertical"` to use Up and Down Arrow instead. Style the list as a column beside the panels to match.',examples:[{id:`tabs/vertical`,caption:`Focus General, then press Down Arrow to choose Security. Up Arrow moves back through the vertical list.`,Example:y,source:`"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="general" orientation="vertical">
      <TabsList aria-label="Preferences">
        <TabsTab value="general">General</TabsTab>
        <TabsTab value="security">Security</TabsTab>
        <TabsTab value="integrations">Integrations</TabsTab>
      </TabsList>
      <TabsPanel value="general">
        Choose your language, time zone and the page you start on.
      </TabsPanel>
      <TabsPanel value="security">
        Manage passkeys, signed-in sessions and recovery codes.
      </TabsPanel>
      <TabsPanel value="integrations">
        Connect your calendar and chat apps to get reminders.
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Add `disabled` to a tab to prevent selection. Arrow keys can still focus it so people can discover it.",examples:[{id:`tabs/disabled`,caption:`Use the arrow keys to reach Reports. It can receive focus, but pressing it leaves the current panel selected.`,Example:b,source:`"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Dashboard">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="analytics">Analytics</TabsTab>
        <TabsTab value="reports" disabled>
          Reports
        </TabsTab>
      </TabsList>
      <TabsPanel value="overview">
        Revenue, visitors and sign-ups for the last 30 days.
      </TabsPanel>
      <TabsPanel value="analytics">
        Where your visitors come from and the pages they read most.
      </TabsPanel>
      <TabsPanel value="reports">
        Monthly reports are available on the Pro plan.
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Icons`,text:"Put decorative icons in `TabsTabIcon` so they stay out of the tab’s accessible name. Add `mirror` to directional icons, such as Reply, to flip them in right-to-left text. An icon-only tab still needs an `aria-label`.",examples:[{id:`tabs/icons`,caption:`Choose Replies. Its directional icon mirrors when the surrounding page uses right-to-left text.`,Example:x,source:`"use client"

import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  TabsTabIcon,
} from "@ui-sdk/react/tabs"
import { ArchiveIcon, MailIcon, ReplyIcon } from "lucide-react"

function Example() {
  return (
    <Tabs defaultValue="inbox">
      <TabsList aria-label="Mail">
        <TabsTab value="inbox">
          <TabsTabIcon>
            <MailIcon />
          </TabsTabIcon>
          Inbox
        </TabsTab>
        <TabsTab value="replies">
          <TabsTabIcon mirror>
            <ReplyIcon />
          </TabsTabIcon>
          Replies
        </TabsTab>
        <TabsTab value="archive">
          <TabsTabIcon>
            <ArchiveIcon />
          </TabsTabIcon>
          Archive
        </TabsTab>
      </TabsList>
      <TabsPanel value="inbox">
        3 new messages from Inès Moreau and Kofi Mensah.
      </TabsPanel>
      <TabsPanel value="replies">
        Wren Takahashi replied to your message about the launch.
      </TabsPanel>
      <TabsPanel value="archive">
        Messages you archived stay here and in search.
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Manual Activation`,text:'Set `activation="manual"` when opening a panel takes time, such as a view that fetches data. Arrow keys move focus; Enter or Space selects the focused tab.',examples:[{id:`tabs/manual`,caption:`Focus Preview, then press Right Arrow. Code receives focus; press Enter or Space to show its panel. Tab then moves into the Source field.`,Example:S,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="preview" activation="manual">
      <TabsList aria-label="Snippet">
        <TabsTab value="preview">Preview</TabsTab>
        <TabsTab value="code">Code</TabsTab>
      </TabsList>
      <TabsPanel value="preview">
        Welcome back, Hollis. You have 3 unread messages.
      </TabsPanel>
      <TabsPanel value="code">
        <Field>
          <FieldLabel>Source</FieldLabel>
          <Input defaultValue='<Welcome name="Hollis" unread={3} />' />
        </Field>
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Loop`,text:"Arrow keys normally wrap around at either end. Set `loop={false}` to stop there instead.",examples:[{id:`tabs/loop`,caption:`Focus Year and press Right Arrow. Focus stays at the end because looping is off.`,Example:w,source:`"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

const ranges = [
  {
    value: "day",
    label: "Day",
    content: "128 visitors today, up 12% from yesterday.",
  },
  {
    value: "week",
    label: "Week",
    content: "1,024 visitors this week, up 8% from last week.",
  },
  {
    value: "month",
    label: "Month",
    content: "4,210 visitors this month, down 3% from last month.",
  },
  {
    value: "year",
    label: "Year",
    content: "48,930 visitors this year, up 21% from last year.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="day" loop={false}>
      <TabsList aria-label="Range">
        {ranges.map((range) => (
          <TabsTab key={range.value} value={range.value}>
            {range.label}
          </TabsTab>
        ))}
      </TabsList>
      {ranges.map((range) => (
        <TabsPanel key={range.value} value={range.value}>
          {range.content}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Indicator`,text:"`TabsIndicator` measures the selected tab. Position it inside a relative tab list and use its CSS variables to make a marker that follows the selection. It measures again when a tab or the list changes size.",examples:[{id:`tabs/indicator`,caption:`Choose Podcasts, then choose Vertical. The same indicator measures and follows the selected tab in either layout.`,Example:E,source:`"use client"

import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"
import * as React from "react"

const orientations = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
] as const

function Example() {
  const [orientation, setOrientation] = React.useState<
    "horizontal" | "vertical"
  >("horizontal")

  return (
    <div>
      <div data-slot="controls" role="group" aria-label="Orientation">
        {orientations.map((option) => (
          <button
            key={option.value}
            type="button"
            data-size="sm"
            aria-pressed={orientation === option.value}
            onClick={() => setOrientation(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Tabs defaultValue="music" orientation={orientation}>
        <TabsList aria-label="Library">
          <TabsTab value="music">Music</TabsTab>
          <TabsTab value="podcasts">Podcasts</TabsTab>
          <TabsTab value="audiobooks">Audiobooks</TabsTab>
          <TabsIndicator />
        </TabsList>
        <TabsPanel value="music">
          312 songs in 24 albums, synced to this device.
        </TabsPanel>
        <TabsPanel value="podcasts">
          8 shows you follow, with 3 new episodes.
        </TabsPanel>
        <TabsPanel value="audiobooks">
          2 books in progress, 6 hours left in total.
        </TabsPanel>
      </Tabs>
    </div>
  )
}

export { Example }
`}]},{heading:`Keep Mounted`,text:"Panels normally unmount when another tab is selected. Add `keepMounted` to a panel to keep its content hidden in the page, preserving local state such as a draft.",examples:[{id:`tabs/keep-mounted`,caption:`Write a message, switch to Formatting, then return to Reply. Your draft is still there.`,Example:D,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="reply">
      <TabsList aria-label="Comment">
        <TabsTab value="reply">Reply</TabsTab>
        <TabsTab value="formatting">Formatting</TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="reply" keepMounted>
        <Field>
          <FieldLabel>Message</FieldLabel>
          <Textarea rows={3} placeholder="Write a reply…" />
        </Field>
      </TabsPanel>
      <TabsPanel value="formatting">
        <p>Use **bold**, _italics_ and \`code\` to format your reply.</p>
        <p>Paste a link on its own line to show a preview.</p>
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Find in Page`,text:"Add `hiddenUntilFound` to the tabs or a panel to keep closed content available to the browser’s Find command. A match selects its tab with the reason `find-in-page`. This also keeps the panel mounted.",examples:[{id:`tabs/find-in-page`,caption:`Use your browser’s Find command to search for “restocking fee”. Returns opens to reveal the match.`,Example:k,source:`"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

const policies = [
  {
    value: "shipping",
    label: "Shipping",
    text: "Orders leave our warehouse within two working days. Express delivery arrives the next morning.",
  },
  {
    value: "returns",
    label: "Returns",
    text: "Send anything back within 30 days. Opened electronics carry a restocking fee of 10 percent.",
  },
  {
    value: "warranty",
    label: "Warranty",
    text: "Every product has a two-year warranty. Batteries are covered for one year from delivery.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="shipping" hiddenUntilFound>
      <TabsList aria-label="Policies">
        {policies.map((policy) => (
          <TabsTab key={policy.value} value={policy.value}>
            {policy.label}
          </TabsTab>
        ))}
      </TabsList>
      {policies.map((policy) => (
        <TabsPanel key={policy.value} value={policy.value}>
          {policy.text}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"Panels expose `data-starting-style` as they enter and `data-ending-style` as they leave. The previous panel stays mounted through its exit animation, then unmounts or hides if it is kept mounted.",examples:[{id:`tabs/animation`,caption:`Move between Overview, Activity and Settings. The panels slide in the direction you moved.`,Example:A,source:`"use client"

import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
        <TabsIndicator />
      </TabsList>
      <div data-slot="stack">
        <TabsPanel value="overview">
          The launch is on track for Friday, with 4 of 6 tasks done.
        </TabsPanel>
        <TabsPanel value="activity">
          Inès Moreau deployed to production and Kofi Mensah left a review.
        </TabsPanel>
        <TabsPanel value="settings">
          Rename the project, transfer it to another team or archive it.
        </TabsPanel>
      </div>
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Use `value` and `onValueChange` to own the selected tab. State and Events covers the shared pattern. Call `details.cancel()` in the change callback to reject a change.",examples:[{id:`tabs/controlled`,caption:`Choose Drafts, then press Show Sent Mail. The console logs each new value with its reason.`,Example:j,source:`"use client"

import { createTabsController } from "@ui-sdk/core/tabs"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [tabs] = React.useState(() => createTabsController())
  const [value, setValue] = React.useState<string | null>("inbox")

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => tabs.select("sent")}>
          Show Sent Mail
        </button>
      </div>
      <Tabs
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(\`value: \${next} (\${details.reason})\`)
        }}
        controller={tabs}
      >
        <TabsList aria-label="Mail">
          <TabsTab value="inbox">Inbox</TabsTab>
          <TabsTab value="drafts">Drafts</TabsTab>
          <TabsTab value="sent">Sent</TabsTab>
          <TabsIndicator />
        </TabsList>
        <TabsPanel value="inbox">
          3 unread messages from Hollis Grant and Inès Moreau.
        </TabsPanel>
        <TabsPanel value="drafts">
          2 drafts, the last one edited yesterday at 4:12 PM.
        </TabsPanel>
        <TabsPanel value="sent">
          12 messages sent this week, all delivered.
        </TabsPanel>
      </Tabs>
    </div>
  )
}

export { Example }
`}]},{heading:`Links`,text:`Render a tab as a link when selection should navigate. It keeps its tab role; arrow keys follow the link when they select it. Modified clicks, such as Cmd-click, keep their normal browser behavior without selecting the tab.`,examples:[{id:`tabs/links`,caption:`Choose Activity. Its panel opens and the URL hash changes. Modified clicks keep the link’s usual browser behavior.`,Example:N,source:`"use client"

import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

const pages = [
  {
    value: "overview",
    href: "#project-overview",
    label: "Overview",
    content:
      "Hollis Grant started this project in March. It has 14 open issues.",
  },
  {
    value: "activity",
    href: "#project-activity",
    label: "Activity",
    content:
      "Wren Takahashi merged 3 pull requests and closed 5 issues this week.",
  },
  {
    value: "members",
    href: "#project-members",
    label: "Members",
    content:
      "Hollis Grant owns the project. Wren Takahashi and 3 others can edit it.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project">
        {pages.map((page) => (
          <TabsTab
            key={page.value}
            value={page.value}
            render={<a href={page.href} />}
          >
            {page.label}
          </TabsTab>
        ))}
        <TabsIndicator />
      </TabsList>
      {pages.map((page) => (
        <TabsPanel key={page.value} value={page.value}>
          {page.content}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Use `render` to change a part’s element or add to its content, as in the links example. Parts and Composition covers the shared rendering API. Each part’s state is listed under State.",examples:[{id:`tabs/render`,caption:`Each tab renders its own button with an unread count after the label. Choose Unread to see who wrote to you.`,Example:F,source:`"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

const folders = [
  {
    value: "inbox",
    label: "Inbox",
    count: 12,
    content: "12 conversations, 3 of them unread.",
  },
  {
    value: "unread",
    label: "Unread",
    count: 3,
    content: "Hollis Grant, Inès Moreau and Kofi Mensah wrote to you.",
  },
  {
    value: "archived",
    label: "Archived",
    count: 0,
    content: "Nothing archived yet. Archived mail stays searchable.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="inbox">
      <TabsList aria-label="Mail">
        {folders.map((folder) => (
          <TabsTab
            key={folder.value}
            value={folder.value}
            render={(props) => (
              <button {...props}>
                {props.children}
                {folder.count > 0 && (
                  <span data-slot="badge">{folder.count}</span>
                )}
              </button>
            )}
          >
            {folder.label}
          </TabsTab>
        ))}
      </TabsList>
      {folders.map((folder) => (
        <TabsPanel key={folder.value} value={folder.value}>
          {folder.content}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`tabs/line`,caption:``,Example:I,source:`import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

export function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Dashboard">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="analytics">Analytics</TabsTab>
        <TabsTab value="reports">Reports</TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="overview">
        Revenue, visitors and sign-ups for the last 30 days.
      </TabsPanel>
      <TabsPanel value="analytics">
        Where visitors come from and what they do.
      </TabsPanel>
      <TabsPanel value="reports">Monthly reports, ready to download.</TabsPanel>
    </Tabs>
  )
}
`},{id:`tabs/rtl`,caption:``,Example:L,source:`import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

export function Example() {
  return (
    <div dir="rtl">
      <Tabs defaultValue="account">
        <TabsList aria-label="الإعدادات">
          <TabsTab value="account">الحساب</TabsTab>
          <TabsTab value="password">كلمة المرور</TabsTab>
          <TabsTab value="notifications">الإشعارات</TabsTab>
          <TabsIndicator />
        </TabsList>
        <TabsPanel value="account">
          عدّل اسمك وبريدك الإلكتروني وصورتك.
        </TabsPanel>
        <TabsPanel value="password">
          غيّر كلمة المرور وفعّل التحقق بخطوتين.
        </TabsPanel>
        <TabsPanel value="notifications">اختر ما نرسله إليك بالبريد.</TabsPanel>
      </Tabs>
    </div>
  )
}
`}]}]};export{R as default};