import{useLog as e}from"./log.js";import*as t from"preact/compat";import{Fragment as n,jsx as r,jsxs as i}from"preact/compat/jsx-runtime";import{ScrollArea as a,ScrollAreaContent as o,ScrollAreaCorner as s,ScrollAreaScrollbar as c,ScrollAreaThumb as l,ScrollAreaViewport as u,createScrollAreaController as d}from"ui-sdk/scroll-area.js";const f=Array.from({length:50},(e,t)=>`v1.2.0-beta.${50-t}`);function p(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(u,{role:`region`,"aria-label":`Tags`,children:/* @__PURE__ */ i(o,{children:[/* @__PURE__ */ r(`h3`,{children:`Tags`}),/* @__PURE__ */ r(`ul`,{children:f.map(e=>/* @__PURE__ */ r(`li`,{children:e},e))})]})}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})})]})}const m=[{name:`Sand`,color:`#e6d8bf`},{name:`Clay`,color:`#c98b6b`},{name:`Rust`,color:`#a4502f`},{name:`Moss`,color:`#7d8b5a`},{name:`Sage`,color:`#b5c2a3`},{name:`Fog`,color:`#c9d1d6`},{name:`Slate`,color:`#5b6b78`},{name:`Ink`,color:`#2b2f36`}];function h(){return/* @__PURE__ */ i(a,{type:`auto`,children:[/* @__PURE__ */ r(u,{role:`region`,"aria-label":`Palette`,children:/* @__PURE__ */ r(o,{children:/* @__PURE__ */ r(`ul`,{children:m.map(e=>/* @__PURE__ */ i(`li`,{children:[/* @__PURE__ */ r(`div`,{"data-slot":`swatch`,style:{background:e.color}}),e.name]},e.name))})})}),/* @__PURE__ */ r(c,{orientation:`horizontal`,children:/* @__PURE__ */ r(l,{})})]})}const g=[{version:`v1.12.0`,date:`Oct 28, 2026`,status:`Latest`,downloads:`18,204`,size:`4.3 MB`,node:`20+`},{version:`v1.11.2`,date:`Oct 14, 2026`,status:`Stable`,downloads:`26,931`,size:`4.2 MB`,node:`20+`},{version:`v1.11.1`,date:`Oct 2, 2026`,status:`Stable`,downloads:`9,412`,size:`4.2 MB`,node:`20+`},{version:`v1.11.0`,date:`Sep 23, 2026`,status:`Stable`,downloads:`31,077`,size:`4.2 MB`,node:`20+`},{version:`v1.10.3`,date:`Sep 9, 2026`,status:`Stable`,downloads:`12,640`,size:`4.1 MB`,node:`18+`},{version:`v1.10.2`,date:`Aug 27, 2026`,status:`Stable`,downloads:`8,315`,size:`4.1 MB`,node:`18+`},{version:`v1.10.1`,date:`Aug 18, 2026`,status:`Stable`,downloads:`5,902`,size:`4.1 MB`,node:`18+`},{version:`v1.10.0`,date:`Aug 5, 2026`,status:`Stable`,downloads:`22,486`,size:`4.0 MB`,node:`18+`},{version:`v1.9.4`,date:`Jul 21, 2026`,status:`Deprecated`,downloads:`3,118`,size:`3.9 MB`,node:`18+`},{version:`v1.9.3`,date:`Jul 8, 2026`,status:`Deprecated`,downloads:`2,764`,size:`3.9 MB`,node:`18+`},{version:`v1.9.2`,date:`Jun 24, 2026`,status:`Deprecated`,downloads:`1,950`,size:`3.9 MB`,node:`18+`},{version:`v1.9.1`,date:`Jun 10, 2026`,status:`Deprecated`,downloads:`1,208`,size:`3.8 MB`,node:`18+`}];function _(){return/* @__PURE__ */ i(a,{type:`auto`,children:[/* @__PURE__ */ r(u,{role:`region`,"aria-label":`Releases`,children:/* @__PURE__ */ r(o,{children:/* @__PURE__ */ i(`table`,{children:[/* @__PURE__ */ r(`thead`,{children:/* @__PURE__ */ i(`tr`,{children:[/* @__PURE__ */ r(`th`,{children:`Version`}),/* @__PURE__ */ r(`th`,{children:`Released`}),/* @__PURE__ */ r(`th`,{children:`Status`}),/* @__PURE__ */ r(`th`,{children:`Downloads`}),/* @__PURE__ */ r(`th`,{children:`Size`}),/* @__PURE__ */ r(`th`,{children:`Node`})]})}),/* @__PURE__ */ r(`tbody`,{children:g.map(e=>/* @__PURE__ */ i(`tr`,{children:[/* @__PURE__ */ r(`th`,{scope:`row`,children:e.version}),/* @__PURE__ */ r(`td`,{children:e.date}),/* @__PURE__ */ r(`td`,{children:e.status}),/* @__PURE__ */ r(`td`,{children:e.downloads}),/* @__PURE__ */ r(`td`,{children:e.size}),/* @__PURE__ */ r(`td`,{children:e.node})]},e.version))})]})})}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})}),/* @__PURE__ */ r(c,{orientation:`horizontal`,children:/* @__PURE__ */ r(l,{})}),/* @__PURE__ */ r(s,{})]})}const v=[{version:`v1.12.0`,date:`Oct 28`,text:`Scroll areas follow streamed content and stop when you scroll up.`},{version:`v1.11.2`,date:`Oct 14`,text:`Focus returns to the right trigger when a nested dialog closes.`},{version:`v1.11.1`,date:`Oct 2`,text:`Date pickers keep the selected month when the locale changes.`},{version:`v1.11.0`,date:`Sep 23`,text:`Menus open on Arrow Down and skip disabled items while typing.`},{version:`v1.10.3`,date:`Sep 9`,text:`Toasts pause their timers while the window is in the background.`},{version:`v1.10.2`,date:`Aug 27`,text:`Sliders snap to the nearest step when dragged past either end.`},{version:`v1.10.1`,date:`Aug 18`,text:`Tooltips wait for a short delay before moving to a new trigger.`},{version:`v1.10.0`,date:`Aug 5`,text:`Comboboxes can load their options while you type.`}];function y(){return/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(u,{role:`region`,"aria-label":`Release notes`,children:/* @__PURE__ */ r(o,{children:v.map(e=>/* @__PURE__ */ i(`article`,{children:[/* @__PURE__ */ i(`h3`,{children:[e.version,` `,/* @__PURE__ */ r(`span`,{"data-slot":`hint`,children:e.date})]}),/* @__PURE__ */ r(`p`,{children:e.text})]},e.version))})}),/* @__PURE__ */ r(`div`,{"data-slot":`top-fade`}),/* @__PURE__ */ r(`div`,{"data-slot":`bottom-fade`}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})})]})}const b=[{from:`Hollis Grant`,subject:`Launch checklist for Thursday`},{from:`Inès Moreau`,subject:`Updated pricing page copy`},{from:`Kofi Mensah`,subject:`Design review notes`},{from:`Wren Takahashi`,subject:`Q4 roadmap draft`},{from:`Tomasz Wójcik`,subject:`Re: Staging deploy failed`},{from:`Hollis Grant`,subject:`Invoices for October`},{from:`Inès Moreau`,subject:`Customer interview recordings`},{from:`Kofi Mensah`,subject:`New icons for the dashboard`},{from:`Wren Takahashi`,subject:`Offsite agenda`},{from:`Tomasz Wójcik`,subject:`Database migration plan`}];function x(){return/* @__PURE__ */ r(a,{children:/* @__PURE__ */ r(u,{role:`region`,"aria-label":`Inbox`,children:/* @__PURE__ */ r(o,{children:/* @__PURE__ */ r(`ul`,{children:b.map(e=>/* @__PURE__ */ i(`li`,{children:[e.from,/* @__PURE__ */ r(`span`,{"data-slot":`hint`,children:e.subject})]},e.subject))})})})})}const S=[`hover`,`scroll`,`auto`,`always`],C=Array.from({length:20},(e,t)=>`v1.2.0-beta.${50-t}`);function w(){return/* @__PURE__ */ r(`div`,{"data-slot":`grid`,children:S.map(e=>/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(`code`,{children:[`type="`,e,`"`]}),/* @__PURE__ */ i(a,{type:e,children:[/* @__PURE__ */ r(u,{children:/* @__PURE__ */ r(o,{children:/* @__PURE__ */ r(`ul`,{children:C.map(e=>/* @__PURE__ */ r(`li`,{children:e},e))})})}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})})]})]},e))})}const T=[{value:0,label:`No delay`},{value:2e3,label:`2000 ms delay`}],E=Array.from({length:20},(e,t)=>`v1.2.0-beta.${50-t}`);function D(){return/* @__PURE__ */ r(`div`,{"data-slot":`grid`,children:T.map(e=>/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ r(`span`,{"data-slot":`hint`,children:e.label}),/* @__PURE__ */ i(a,{type:`scroll`,scrollHideDelay:e.value,children:[/* @__PURE__ */ r(u,{children:/* @__PURE__ */ r(o,{children:/* @__PURE__ */ r(`ul`,{children:E.map(e=>/* @__PURE__ */ r(`li`,{children:e},e))})})}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})})]})]},e.value))})}const O=Array.from({length:50},(e,t)=>`v1.2.0-beta.${50-t}`);function k(){let n=e(),[s]=t.useState(d),f=t.useRef(`start`);return/* @__PURE__ */ i(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ i(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>s.scrollToStart({behavior:`smooth`}),children:`Back to Top`}),/* @__PURE__ */ r(`button`,{type:`button`,onClick:()=>s.scrollToEnd({behavior:`instant`}),children:`Jump to the End`})]}),/* @__PURE__ */ i(a,{controller:s,children:[/* @__PURE__ */ r(u,{role:`region`,"aria-label":`Tags`,onScroll:()=>{let e=s.isAtEnd()?`end`:s.isAtStart()?`start`:null;e&&e!==f.current&&n(`At the ${e}`),f.current=e},children:/* @__PURE__ */ i(o,{children:[/* @__PURE__ */ r(`h3`,{children:`Tags`}),/* @__PURE__ */ r(`ul`,{children:O.map(e=>/* @__PURE__ */ r(`li`,{children:e},e))})]})}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})})]})]})}const A=Array.from({length:50},(e,t)=>`v1.2.0-beta.${50-t}`);function j(){return/* @__PURE__ */ r(a,{render:/* @__PURE__ */ r(`section`,{}),children:e=>/* @__PURE__ */ i(n,{children:[/* @__PURE__ */ r(u,{render:/* @__PURE__ */ r(`article`,{}),"aria-label":`Releases`,children:/* @__PURE__ */ r(o,{children:/* @__PURE__ */ r(`ul`,{children:A.map(e=>/* @__PURE__ */ r(`li`,{children:e},e))})})}),/* @__PURE__ */ r(`p`,{"data-slot":`hint`,"aria-hidden":!0,children:e.atStart?`Scroll for older releases`:`More releases below`}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})})]})})}const M=Array.from({length:40},(e,t)=>`وسم ${t+1}`);function N(){return/* @__PURE__ */ r(`div`,{dir:`rtl`,children:/* @__PURE__ */ i(a,{children:[/* @__PURE__ */ r(u,{children:/* @__PURE__ */ i(o,{children:[/* @__PURE__ */ r(`h4`,{children:`الوسوم`}),M.map(e=>/* @__PURE__ */ r(`div`,{children:e},e))]})}),/* @__PURE__ */ r(c,{children:/* @__PURE__ */ r(l,{})})]})})}var P={name:`scroll-area`,title:`Scroll Area`,description:`Add styled scrollbars, edge indicators, and follow-to-end behavior to native scrolling.`,sections:[{heading:null,text:`Use a scroll area when content needs its own scrolling region with scrollbars that match your design. The browser still does the scrolling, so the wheel, touch, keyboard and find in page work as usual.`,examples:[{id:`scroll-area/basic`,caption:`Scroll the tags with the wheel, the keyboard or the scrollbar thumb. The scrollbar shows while the pointer is over the list.`,Example:p,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const tags = Array.from(
  { length: 50 },
  (_, index) => \`v1.2.0-beta.\${50 - index}\`
)

function Example() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Tags">
        <ScrollAreaContent>
          <h3>Tags</h3>
          <ul>
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

export { Example }
`}]},{heading:`Horizontal`,text:'A horizontal scrollbar scrolls the inline axis. With one, the content grows as wide as it needs instead of wrapping. Here `type="auto"` keeps the scrollbar in view, so the row reads as one that scrolls.',examples:[{id:`scroll-area/horizontal`,caption:`Drag the scrollbar, or use Shift and the wheel, to scroll the palette from Sand to Ink.`,Example:h,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const swatches = [
  { name: "Sand", color: "#e6d8bf" },
  { name: "Clay", color: "#c98b6b" },
  { name: "Rust", color: "#a4502f" },
  { name: "Moss", color: "#7d8b5a" },
  { name: "Sage", color: "#b5c2a3" },
  { name: "Fog", color: "#c9d1d6" },
  { name: "Slate", color: "#5b6b78" },
  { name: "Ink", color: "#2b2f36" },
]

function Example() {
  return (
    <ScrollArea type="auto">
      <ScrollAreaViewport role="region" aria-label="Palette">
        <ScrollAreaContent>
          <ul>
            {swatches.map((swatch) => (
              <li key={swatch.name}>
                <div data-slot="swatch" style={{ background: swatch.color }} />
                {swatch.name}
              </li>
            ))}
          </ul>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

export { Example }
`}]},{heading:`Both Axes`,text:"With both scrollbars, each stops short of the corner where they meet, which `ScrollAreaCorner` fills.",examples:[{id:`scroll-area/both-axes`,caption:`Scroll the releases down and across. The header row stays in place, and the scrollbars stop short of the corner.`,Example:_,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const releases = [
  {
    version: "v1.12.0",
    date: "Oct 28, 2026",
    status: "Latest",
    downloads: "18,204",
    size: "4.3 MB",
    node: "20+",
  },
  {
    version: "v1.11.2",
    date: "Oct 14, 2026",
    status: "Stable",
    downloads: "26,931",
    size: "4.2 MB",
    node: "20+",
  },
  {
    version: "v1.11.1",
    date: "Oct 2, 2026",
    status: "Stable",
    downloads: "9,412",
    size: "4.2 MB",
    node: "20+",
  },
  {
    version: "v1.11.0",
    date: "Sep 23, 2026",
    status: "Stable",
    downloads: "31,077",
    size: "4.2 MB",
    node: "20+",
  },
  {
    version: "v1.10.3",
    date: "Sep 9, 2026",
    status: "Stable",
    downloads: "12,640",
    size: "4.1 MB",
    node: "18+",
  },
  {
    version: "v1.10.2",
    date: "Aug 27, 2026",
    status: "Stable",
    downloads: "8,315",
    size: "4.1 MB",
    node: "18+",
  },
  {
    version: "v1.10.1",
    date: "Aug 18, 2026",
    status: "Stable",
    downloads: "5,902",
    size: "4.1 MB",
    node: "18+",
  },
  {
    version: "v1.10.0",
    date: "Aug 5, 2026",
    status: "Stable",
    downloads: "22,486",
    size: "4.0 MB",
    node: "18+",
  },
  {
    version: "v1.9.4",
    date: "Jul 21, 2026",
    status: "Deprecated",
    downloads: "3,118",
    size: "3.9 MB",
    node: "18+",
  },
  {
    version: "v1.9.3",
    date: "Jul 8, 2026",
    status: "Deprecated",
    downloads: "2,764",
    size: "3.9 MB",
    node: "18+",
  },
  {
    version: "v1.9.2",
    date: "Jun 24, 2026",
    status: "Deprecated",
    downloads: "1,950",
    size: "3.9 MB",
    node: "18+",
  },
  {
    version: "v1.9.1",
    date: "Jun 10, 2026",
    status: "Deprecated",
    downloads: "1,208",
    size: "3.8 MB",
    node: "18+",
  },
]

function Example() {
  return (
    <ScrollArea type="auto">
      <ScrollAreaViewport role="region" aria-label="Releases">
        <ScrollAreaContent>
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Released</th>
                <th>Status</th>
                <th>Downloads</th>
                <th>Size</th>
                <th>Node</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => (
                <tr key={release.version}>
                  <th scope="row">{release.version}</th>
                  <td>{release.date}</td>
                  <td>{release.status}</td>
                  <td>{release.downloads}</td>
                  <td>{release.size}</td>
                  <td>{release.node}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollArea>
  )
}

export { Example }
`}]},{heading:`Edge Fades`,text:"The root holds how far the content reaches past each edge, as `--scroll-area-overflow-y-start`, `--scroll-area-overflow-y-end` and their `x` versions, and how far along the view is, as `--scroll-area-progress-y` and `-x`. A fade as tall as `min(2rem, var(--scroll-area-overflow-y-start))` is gone at the top and full once there's more above. For a fade that only switches, use `data-at-y-start` and `data-at-y-end`.",examples:[{id:`scroll-area/edge-fade`,caption:`Scroll the release notes. The top fade grows in as you leave the top, and the bottom fade shrinks away at the end.`,Example:y,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const notes = [
  {
    version: "v1.12.0",
    date: "Oct 28",
    text: "Scroll areas follow streamed content and stop when you scroll up.",
  },
  {
    version: "v1.11.2",
    date: "Oct 14",
    text: "Focus returns to the right trigger when a nested dialog closes.",
  },
  {
    version: "v1.11.1",
    date: "Oct 2",
    text: "Date pickers keep the selected month when the locale changes.",
  },
  {
    version: "v1.11.0",
    date: "Sep 23",
    text: "Menus open on Arrow Down and skip disabled items while typing.",
  },
  {
    version: "v1.10.3",
    date: "Sep 9",
    text: "Toasts pause their timers while the window is in the background.",
  },
  {
    version: "v1.10.2",
    date: "Aug 27",
    text: "Sliders snap to the nearest step when dragged past either end.",
  },
  {
    version: "v1.10.1",
    date: "Aug 18",
    text: "Tooltips wait for a short delay before moving to a new trigger.",
  },
  {
    version: "v1.10.0",
    date: "Aug 5",
    text: "Comboboxes can load their options while you type.",
  },
]

function Example() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Release notes">
        <ScrollAreaContent>
          {notes.map((note) => (
            <article key={note.version}>
              <h3>
                {note.version} <span data-slot="hint">{note.date}</span>
              </h3>
              <p>{note.text}</p>
            </article>
          ))}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <div data-slot="top-fade" />
      <div data-slot="bottom-fade" />
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

export { Example }
`}]},{heading:`Native Scrollbars`,text:`Leave out the Scrollbar parts to keep the browser's own scrollbars, with everything else: data attributes, edge variables, sticking to the end and the controller.`,examples:[{id:`scroll-area/native-scrollbars`,caption:`Scroll the inbox with the browser's own scrollbar. The scroll area still tracks its edges and state.`,Example:x,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const messages = [
  { from: "Hollis Grant", subject: "Launch checklist for Thursday" },
  { from: "Inès Moreau", subject: "Updated pricing page copy" },
  { from: "Kofi Mensah", subject: "Design review notes" },
  { from: "Wren Takahashi", subject: "Q4 roadmap draft" },
  { from: "Tomasz Wójcik", subject: "Re: Staging deploy failed" },
  { from: "Hollis Grant", subject: "Invoices for October" },
  { from: "Inès Moreau", subject: "Customer interview recordings" },
  { from: "Kofi Mensah", subject: "New icons for the dashboard" },
  { from: "Wren Takahashi", subject: "Offsite agenda" },
  { from: "Tomasz Wójcik", subject: "Database migration plan" },
]

function Example() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Inbox">
        <ScrollAreaContent>
          <ul>
            {messages.map((message) => (
              <li key={message.subject}>
                {message.from}
                <span data-slot="hint">{message.subject}</span>
              </li>
            ))}
          </ul>
        </ScrollAreaContent>
      </ScrollAreaViewport>
    </ScrollArea>
  )
}

export { Example }
`}]},{heading:`When Scrollbars Show`,text:"`type` decides when each scrollbar gets `data-visible`:",examples:[{id:`scroll-area/type`,caption:`Hover and scroll each list to compare. The auto and always scrollbars show from the start; hover waits for the pointer and scroll for scrolling.`,Example:w,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  type ScrollAreaType,
} from "@ui-sdk/react/scroll-area"

const types: ScrollAreaType[] = ["hover", "scroll", "auto", "always"]

const tags = Array.from(
  { length: 20 },
  (_, index) => \`v1.2.0-beta.\${50 - index}\`
)

function Example() {
  return (
    <div data-slot="grid">
      {types.map((type) => (
        <div data-slot="stack" key={type}>
          <code>type="{type}"</code>
          <ScrollArea type={type}>
            <ScrollAreaViewport>
              <ScrollAreaContent>
                <ul>
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar>
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Hide Delay`,text:'With `"scroll"` and `"hover"`, `scrollHideDelay` keeps a scrollbar for a while after scrolling stops or the pointer leaves, in ms. It defaults to 600.',examples:[{id:`scroll-area/hide-delay`,caption:`Scroll each list and stop. The scrollbar on the left hides at once; the one on the right waits 2000 milliseconds.`,Example:D,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const delays = [
  { value: 0, label: "No delay" },
  { value: 2000, label: "2000 ms delay" },
]

const tags = Array.from(
  { length: 20 },
  (_, index) => \`v1.2.0-beta.\${50 - index}\`
)

function Example() {
  return (
    <div data-slot="grid">
      {delays.map((delay) => (
        <div data-slot="stack" key={delay.value}>
          <span data-slot="hint">{delay.label}</span>
          <ScrollArea type="scroll" scrollHideDelay={delay.value}>
            <ScrollAreaViewport>
              <ScrollAreaContent>
                <ul>
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar>
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"A controller, from `createScrollAreaController()`, scrolls the area from anywhere and reads where it is. Pass it as `controller`.",examples:[{id:`scroll-area/controller`,caption:`Press Jump to the End, then Back to Top. The console logs each end of the list as the view reaches it.`,Example:k,source:`"use client"

import {
  createScrollAreaController,
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const tags = Array.from(
  { length: 50 },
  (_, index) => \`v1.2.0-beta.\${50 - index}\`
)

function Example() {
  const log = useLog()
  const [controller] = React.useState(createScrollAreaController)
  const edge = React.useRef<string | null>("start")

  const read = () => {
    const next = controller.isAtEnd()
      ? "end"
      : controller.isAtStart()
        ? "start"
        : null
    if (next && next !== edge.current) {
      log(\`At the \${next}\`)
    }
    edge.current = next
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={() => controller.scrollToStart({ behavior: "smooth" })}
        >
          Back to Top
        </button>
        <button
          type="button"
          onClick={() => controller.scrollToEnd({ behavior: "instant" })}
        >
          Jump to the End
        </button>
      </div>
      <ScrollArea controller={controller}>
        <ScrollAreaViewport role="region" aria-label="Tags" onScroll={read}>
          <ScrollAreaContent>
            <h3>Tags</h3>
            <ul>
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar>
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:'Every part takes `render`, to render a different element or component in its place, like `render={<section />}`. `render`, `className`, `style` and `children` can be functions of the part\'s state, like `className={(state) => (state.atEnd ? "done" : undefined)}`.',examples:[{id:`scroll-area/render`,caption:`Scroll the releases. The hint under the list reads the root's state, changes once you leave the top, and disappears at the end.`,Example:j,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const tags = Array.from(
  { length: 50 },
  (_, index) => \`v1.2.0-beta.\${50 - index}\`
)

function Example() {
  return (
    <ScrollArea render={<section />}>
      {(state) => (
        <>
          <ScrollAreaViewport render={<article />} aria-label="Releases">
            <ScrollAreaContent>
              <ul>
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </ScrollAreaContent>
          </ScrollAreaViewport>
          <p data-slot="hint" aria-hidden>
            {state.atStart
              ? "Scroll for older releases"
              : "More releases below"}
          </p>
          <ScrollAreaScrollbar>
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </>
      )}
    </ScrollArea>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`scroll-area/rtl`,caption:``,Example:N,source:`"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const tags = Array.from({ length: 40 }, (_, index) => \`وسم \${index + 1}\`)

function Example() {
  return (
    <div dir="rtl">
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent>
            <h4>الوسوم</h4>
            {tags.map((tag) => (
              <div key={tag}>{tag}</div>
            ))}
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar>
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    </div>
  )
}

export { Example }
`}]}]};export{P as default};