import{Bt as e,Ft as t,It as n,Ks as r,Lt as i,Mo as a,Pt as o,Rt as s,Vt as c,ac as l,fl as u,ic as d,qs as f,rc as p,tl as m,zt as h}from"../chunks/c-CIXE4Nkk.js";const g=[{title:`Deployed to production`,dateTime:`2026-11-10T14:32`,time:`Today, 2:32 PM`,description:`Version 2.4.1 is live in every region.`},{title:`Checks passed`,dateTime:`2026-11-10T14:20`,time:`Today, 2:20 PM`,description:`312 tests and the bundle size budget.`},{title:`Pull request merged`,dateTime:`2026-11-10T13:58`,time:`Today, 1:58 PM`,description:`Ada merged Cache search results into main.`},{title:`Review requested`,dateTime:`2026-11-09T17:05`,time:`Yesterday, 5:05 PM`,description:`Grace and Linus were asked to review.`}];function _(){return/* @__PURE__ */ m(o,{"aria-label":`Activity`,children:g.map(r=>/* @__PURE__ */ m(i,{children:[/* @__PURE__ */ m(s,{}),/* @__PURE__ */ m(t,{}),/* @__PURE__ */ m(e,{children:r.title}),/* @__PURE__ */ m(h,{dateTime:r.dateTime,children:r.time}),/* @__PURE__ */ m(n,{children:r.description})]},r.title))})}const v=[{title:`Kickoff`,dateTime:`2026-01`,time:`January`},{title:`Design review`,dateTime:`2026-03`,time:`March`},{title:`Beta`,dateTime:`2026-06`,time:`June`},{title:`Launch`,dateTime:`2026-09`,time:`September`}];function y(){return/* @__PURE__ */ m(o,{orientation:`horizontal`,loop:!1,"aria-label":`Roadmap`,children:v.map(n=>/* @__PURE__ */ m(i,{children:[/* @__PURE__ */ m(s,{}),/* @__PURE__ */ m(t,{}),/* @__PURE__ */ m(e,{children:n.title}),/* @__PURE__ */ m(h,{dateTime:n.dateTime,children:n.time})]},n.title))})}const b=[{value:`placed`,title:`Order placed`,dateTime:`2026-11-01`,time:`Nov 1`,description:`We received your order.`,status:`complete`},{value:`packed`,title:`Packed`,dateTime:`2026-11-02`,time:`Nov 2`,description:`Your items left the shelf.`,status:`complete`},{value:`shipped`,title:`Shipped`,dateTime:`2026-11-03`,time:`Nov 3`,description:`On its way with the carrier.`,status:`current`},{value:`delivered`,title:`Delivered`,dateTime:`2026-11-05`,time:`Nov 5`,description:`Expected by Thursday.`,status:`upcoming`}];function x(){let[r]=u(()=>c());return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ m(`button`,{onClick:()=>r.focus(`shipped`),children:`Go to Current Step`})}),/* @__PURE__ */ m(o,{"aria-label":`Order status`,controller:r,children:b.map(r=>/* @__PURE__ */ m(i,{value:r.value,status:r.status,children:[/* @__PURE__ */ m(s,{children:r.status===`complete`&&/* @__PURE__ */ m(f,{"aria-hidden":`true`})}),/* @__PURE__ */ m(t,{}),/* @__PURE__ */ m(e,{children:r.title}),/* @__PURE__ */ m(h,{dateTime:r.dateTime,children:r.time}),/* @__PURE__ */ m(n,{children:r.description})]},r.value))})]})}const S=[{title:`Version 2.4`,dateTime:`2026-10-28`,time:`October 28`,description:`Faster search and resumable uploads.`,changes:[`Search now matches file contents, not only names.`,`Uploads resume after the connection drops.`]},{title:`Version 2.3`,dateTime:`2026-09-30`,time:`September 30`,description:`Shared links and a new sidebar.`,changes:[`Shared links remember the folder they were opened from.`,`The sidebar collapses to icons on narrow screens.`]},{title:`Version 2.2`,dateTime:`2026-08-26`,time:`August 26`,description:`Dark mode follows your system.`,changes:[`Dark mode follows the system setting.`,`Avatars are sharper.`]}];function C(){return/* @__PURE__ */ m(o,{"aria-label":`Changelog`,children:S.map(a=>/* @__PURE__ */ m(i,{children:[/* @__PURE__ */ m(s,{}),/* @__PURE__ */ m(t,{}),/* @__PURE__ */ m(e,{children:a.title}),/* @__PURE__ */ m(h,{dateTime:a.dateTime,children:a.time}),/* @__PURE__ */ m(n,{children:a.description}),/* @__PURE__ */ m(p,{children:[/* @__PURE__ */ m(l,{children:[`What Changed`,/* @__PURE__ */ m(r,{"aria-hidden":`true`})]}),/* @__PURE__ */ m(d,{children:/* @__PURE__ */ m(`ul`,{children:a.changes.map(e=>/* @__PURE__ */ m(`li`,{children:e},e))})})]})]},a.title))})}const w=[{id:1,author:`Ada`,date:`2026-11-10`,time:`Nov 10`,text:`Shipped the new onboarding flow.`},{id:2,author:`Grace`,date:`2026-11-10`,time:`Nov 10`,text:`Fixed the flaky upload test.`},{id:3,author:`Linus`,date:`2026-11-09`,time:`Nov 9`,text:`Moved the docs to the new theme.`},{id:4,author:`Margaret`,date:`2026-11-09`,time:`Nov 9`,text:`Wrote the launch checklist.`},{id:5,author:`Ada`,date:`2026-11-08`,time:`Nov 8`,text:`Cut search latency in half.`},{id:6,author:`Grace`,date:`2026-11-07`,time:`Nov 7`,text:`Added keyboard shortcuts to the editor.`},{id:7,author:`Linus`,date:`2026-11-06`,time:`Nov 6`,text:`Cleaned up the old billing code.`},{id:8,author:`Margaret`,date:`2026-11-05`,time:`Nov 5`,text:`Ran the accessibility review.`},{id:9,author:`Ada`,date:`2026-11-04`,time:`Nov 4`,text:`Started the mobile layout.`}];function T(){let r=a(),[c,l]=u(3),[d,f]=u(!1);function p(){f(!0),setTimeout(()=>{l(e=>e+3),f(!1),r(`Loaded 3 more updates`)},600)}return/* @__PURE__ */ m(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ m(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ m(`button`,{disabled:d||c>=w.length,onClick:p,children:d?`Loading…`:`Load More`})}),/* @__PURE__ */ m(o,{feed:!0,busy:d,"aria-label":`Team updates`,children:w.slice(0,c).map(r=>/* @__PURE__ */ m(i,{children:[/* @__PURE__ */ m(s,{}),/* @__PURE__ */ m(t,{}),/* @__PURE__ */ m(e,{children:r.author}),/* @__PURE__ */ m(h,{dateTime:r.date,children:r.time}),/* @__PURE__ */ m(n,{children:r.text})]},r.id))})]})}var E={name:`timeline`,title:`Timeline`,description:`Show dated events in order, like an activity feed, a changelog or an order's progress, with arrow keys between them.`,sections:[{heading:null,text:`Use a Timeline for a list of things that happened, or will: a project's activity, an order's status history, a release's milestones. It's a list for screen readers, with one tab stop for keyboards, and the arrow keys move between events.`,examples:[{id:`timeline/demo`,caption:`Tab into the activity, then use Up and Down to move between events. Home and End jump to the first and last.`,Example:_,source:`"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"

const events = [
  {
    title: "Deployed to production",
    dateTime: "2026-11-10T14:32",
    time: "Today, 2:32 PM",
    description: "Version 2.4.1 is live in every region.",
  },
  {
    title: "Checks passed",
    dateTime: "2026-11-10T14:20",
    time: "Today, 2:20 PM",
    description: "312 tests and the bundle size budget.",
  },
  {
    title: "Pull request merged",
    dateTime: "2026-11-10T13:58",
    time: "Today, 1:58 PM",
    description: "Ada merged Cache search results into main.",
  },
  {
    title: "Review requested",
    dateTime: "2026-11-09T17:05",
    time: "Yesterday, 5:05 PM",
    description: "Grace and Linus were asked to review.",
  },
]

function Example() {
  return (
    <Timeline aria-label="Activity">
      {events.map((event) => (
        <TimelineItem key={event.title}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{event.title}</TimelineTitle>
          <TimelineTime dateTime={event.dateTime}>{event.time}</TimelineTime>
          <TimelineDescription>{event.description}</TimelineDescription>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export { Example }
`}]},{heading:`Horizontal`,text:'Set `orientation="horizontal"` for a row, like a roadmap. Left and Right move between events instead of Up and Down, and they swap in right-to-left text. Set `loop={false}` to stop at either end.',examples:[{id:`timeline/horizontal`,caption:`Tab into the roadmap and press Right to reach Launch. Right again stays there.`,Example:y,source:`"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"

const milestones = [
  { title: "Kickoff", dateTime: "2026-01", time: "January" },
  { title: "Design review", dateTime: "2026-03", time: "March" },
  { title: "Beta", dateTime: "2026-06", time: "June" },
  { title: "Launch", dateTime: "2026-09", time: "September" },
]

function Example() {
  return (
    <Timeline orientation="horizontal" loop={false} aria-label="Roadmap">
      {milestones.map((milestone) => (
        <TimelineItem key={milestone.title}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{milestone.title}</TimelineTitle>
          <TimelineTime dateTime={milestone.dateTime}>
            {milestone.time}
          </TimelineTime>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export { Example }
`}]},{heading:`Status`,text:'Give each item a `status` of `"complete"`, `"current"` or `"upcoming"` for a process, like an order\'s progress. The current event gets `aria-current="step"`, and Tab lands on it first. Every part of an event shows its status with `data-complete`, `data-current` or `data-upcoming`.',examples:[{id:`timeline/status`,caption:`Tab into the order status. Focus starts on Shipped, the current step. Move away, then choose Go to Current Step.`,Example:x,source:`"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
  createTimelineController,
  type TimelineStatus,
} from "@ui-sdk/react/timeline"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const steps: {
  value: string
  title: string
  dateTime: string
  time: string
  description: string
  status: TimelineStatus
}[] = [
  {
    value: "placed",
    title: "Order placed",
    dateTime: "2026-11-01",
    time: "Nov 1",
    description: "We received your order.",
    status: "complete",
  },
  {
    value: "packed",
    title: "Packed",
    dateTime: "2026-11-02",
    time: "Nov 2",
    description: "Your items left the shelf.",
    status: "complete",
  },
  {
    value: "shipped",
    title: "Shipped",
    dateTime: "2026-11-03",
    time: "Nov 3",
    description: "On its way with the carrier.",
    status: "current",
  },
  {
    value: "delivered",
    title: "Delivered",
    dateTime: "2026-11-05",
    time: "Nov 5",
    description: "Expected by Thursday.",
    status: "upcoming",
  },
]

function Example() {
  const [controller] = React.useState(() => createTimelineController())
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button onClick={() => controller.focus("shipped")}>
          Go to Current Step
        </button>
      </div>
      <Timeline aria-label="Order status" controller={controller}>
        {steps.map((step) => (
          <TimelineItem
            key={step.value}
            value={step.value}
            status={step.status}
          >
            <TimelineMarker>
              {step.status === "complete" && <CheckIcon aria-hidden="true" />}
            </TimelineMarker>
            <TimelineConnector />
            <TimelineTitle>{step.title}</TimelineTitle>
            <TimelineTime dateTime={step.dateTime}>{step.time}</TimelineTime>
            <TimelineDescription>{step.description}</TimelineDescription>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}

export { Example }
`}]},{heading:`Details`,text:`Put a Collapsible inside an item for details that can open. Its trigger is a button inside the event, so Tab reaches it after the event, and arrow keys still move between events.`,examples:[{id:`timeline/details`,caption:`Tab to What Changed under Version 2.4 and press Enter. Shift+Tab back to the event, then press Down for Version 2.3.`,Example:C,source:`"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

const releases = [
  {
    title: "Version 2.4",
    dateTime: "2026-10-28",
    time: "October 28",
    description: "Faster search and resumable uploads.",
    changes: [
      "Search now matches file contents, not only names.",
      "Uploads resume after the connection drops.",
    ],
  },
  {
    title: "Version 2.3",
    dateTime: "2026-09-30",
    time: "September 30",
    description: "Shared links and a new sidebar.",
    changes: [
      "Shared links remember the folder they were opened from.",
      "The sidebar collapses to icons on narrow screens.",
    ],
  },
  {
    title: "Version 2.2",
    dateTime: "2026-08-26",
    time: "August 26",
    description: "Dark mode follows your system.",
    changes: ["Dark mode follows the system setting.", "Avatars are sharper."],
  },
]

function Example() {
  return (
    <Timeline aria-label="Changelog">
      {releases.map((release) => (
        <TimelineItem key={release.title}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{release.title}</TimelineTitle>
          <TimelineTime dateTime={release.dateTime}>
            {release.time}
          </TimelineTime>
          <TimelineDescription>{release.description}</TimelineDescription>
          <Collapsible>
            <CollapsibleTrigger>
              What Changed
              <ChevronDownIcon aria-hidden="true" />
            </CollapsibleTrigger>
            <CollapsiblePanel>
              <ul>
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </CollapsiblePanel>
          </Collapsible>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export { Example }
`}]},{heading:`Feed`,text:"Set `feed` for a timeline that loads more as people scroll, like a social feed. It follows the WAI-ARIA feed pattern: the root becomes a `feed` and each item an `article` with its position and the count, and Page Down and Page Up move between articles from anywhere inside one.",examples:[{id:`timeline/feed`,caption:`Tab into the updates and press Page Down. Choose Load More: the feed is busy until three more updates arrive. The console logs each load.`,Example:T,source:`"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const updates = [
  {
    id: 1,
    author: "Ada",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Shipped the new onboarding flow.",
  },
  {
    id: 2,
    author: "Grace",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Fixed the flaky upload test.",
  },
  {
    id: 3,
    author: "Linus",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Moved the docs to the new theme.",
  },
  {
    id: 4,
    author: "Margaret",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Wrote the launch checklist.",
  },
  {
    id: 5,
    author: "Ada",
    date: "2026-11-08",
    time: "Nov 8",
    text: "Cut search latency in half.",
  },
  {
    id: 6,
    author: "Grace",
    date: "2026-11-07",
    time: "Nov 7",
    text: "Added keyboard shortcuts to the editor.",
  },
  {
    id: 7,
    author: "Linus",
    date: "2026-11-06",
    time: "Nov 6",
    text: "Cleaned up the old billing code.",
  },
  {
    id: 8,
    author: "Margaret",
    date: "2026-11-05",
    time: "Nov 5",
    text: "Ran the accessibility review.",
  },
  {
    id: 9,
    author: "Ada",
    date: "2026-11-04",
    time: "Nov 4",
    text: "Started the mobile layout.",
  },
]

const pageSize = 3

function Example() {
  const log = useLog()
  const [count, setCount] = React.useState(pageSize)
  const [busy, setBusy] = React.useState(false)

  function loadMore() {
    setBusy(true)
    setTimeout(() => {
      setCount((count) => count + pageSize)
      setBusy(false)
      log(\`Loaded \${pageSize} more updates\`)
    }, 600)
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button disabled={busy || count >= updates.length} onClick={loadMore}>
          {busy ? "Loading…" : "Load More"}
        </button>
      </div>
      <Timeline feed busy={busy} aria-label="Team updates">
        {updates.slice(0, count).map((update) => (
          <TimelineItem key={update.id}>
            <TimelineMarker />
            <TimelineConnector />
            <TimelineTitle>{update.author}</TimelineTitle>
            <TimelineTime dateTime={update.date}>{update.time}</TimelineTime>
            <TimelineDescription>{update.text}</TimelineDescription>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}

export { Example }
`}]}]};export{E as default};