import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-b3fuBy5S.js";import{t as n}from"../chunks/c-ZgxiYuCF.js";import{t as r}from"../chunks/c-B_nFDu0k.js";import{useLog as i}from"./log.js";import*as a from"preact/compat";import{Fragment as o,jsx as s,jsxs as c}from"preact/compat/jsx-runtime";import{Checkbox as l,CheckboxIndicator as u}from"ui-sdk/checkbox.js";import{Resizable as d,ResizableHandle as f,ResizablePanel as p,createResizableController as m}from"ui-sdk/resizable.js";function h(){return/* @__PURE__ */ c(d,{children:[/* @__PURE__ */ c(p,{defaultSize:35,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Files`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`page.tsx`}),/* @__PURE__ */ s(`li`,{children:`layout.tsx`}),/* @__PURE__ */ s(`li`,{children:`globals.css`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize files`}),/* @__PURE__ */ s(p,{defaultSize:65,minSize:40,children:/* @__PURE__ */ c(d,{orientation:`vertical`,children:[/* @__PURE__ */ c(p,{defaultSize:60,minSize:30,children:[/* @__PURE__ */ s(`h3`,{children:`page.tsx`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Saved just now`})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize editor`}),/* @__PURE__ */ c(p,{defaultSize:40,minSize:30,children:[/* @__PURE__ */ s(`h3`,{children:`Terminal`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Ready on port 3000`})]})]})})]})}function g(){return/* @__PURE__ */ c(d,{orientation:`vertical`,children:[/* @__PURE__ */ c(p,{defaultSize:45,minSize:25,children:[/* @__PURE__ */ s(`h3`,{children:`Inbox`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`3 unread messages`})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize inbox`}),/* @__PURE__ */ c(p,{defaultSize:55,minSize:25,children:[/* @__PURE__ */ s(`h3`,{children:`Quarterly report`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`From Hollis Grant`})]})]})}function _(){return/* @__PURE__ */ c(d,{children:[/* @__PURE__ */ c(p,{defaultSize:35,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Channels`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`general`}),/* @__PURE__ */ s(`li`,{children:`design`}),/* @__PURE__ */ s(`li`,{children:`releases`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize channels`,children:/* @__PURE__ */ s(`div`,{})}),/* @__PURE__ */ c(p,{defaultSize:65,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`general`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Kofi Mensah: The release notes are ready.`})]})]})}function v(){return/* @__PURE__ */ c(d,{children:[/* @__PURE__ */ s(p,{defaultSize:30,minSize:25,collapsible:!0,collapsedSize:`48px`,children:/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ c(`li`,{"data-slot":`row`,children:[/* @__PURE__ */ s(t,{"aria-hidden":`true`}),/* @__PURE__ */ s(`span`,{children:`Files`})]}),/* @__PURE__ */ c(`li`,{"data-slot":`row`,children:[/* @__PURE__ */ s(n,{"aria-hidden":`true`}),/* @__PURE__ */ s(`span`,{children:`Search`})]}),/* @__PURE__ */ c(`li`,{"data-slot":`row`,children:[/* @__PURE__ */ s(r,{"aria-hidden":`true`}),/* @__PURE__ */ s(`span`,{children:`Settings`})]})]})}),/* @__PURE__ */ s(f,{"aria-label":`Resize sidebar`,children:/* @__PURE__ */ s(`div`,{})}),/* @__PURE__ */ c(p,{minSize:40,children:[/* @__PURE__ */ s(`h3`,{children:`README.md`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Edited by Inès Moreau`})]})]})}function y(){return/* @__PURE__ */ c(d,{children:[/* @__PURE__ */ c(p,{defaultSize:`200px`,minSize:`160px`,maxSize:`320px`,children:[/* @__PURE__ */ s(`h3`,{children:`Docs`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`Getting Started`}),/* @__PURE__ */ s(`li`,{children:`Components`}),/* @__PURE__ */ s(`li`,{children:`Guides`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize navigation`,children:/* @__PURE__ */ s(`div`,{})}),/* @__PURE__ */ c(p,{minSize:30,children:[/* @__PURE__ */ s(`h3`,{children:`Getting Started`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Install the packages`})]})]})}function b(){return/* @__PURE__ */ c(d,{defaultLayout:[25,35,40],children:[/* @__PURE__ */ c(p,{minSize:15,children:[/* @__PURE__ */ s(`h3`,{children:`Mail`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`Inbox`}),/* @__PURE__ */ s(`li`,{children:`Drafts`}),/* @__PURE__ */ s(`li`,{children:`Sent`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize folders`}),/* @__PURE__ */ c(p,{minSize:15,children:[/* @__PURE__ */ s(`h3`,{children:`Inbox`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`Hollis Grant`}),/* @__PURE__ */ s(`li`,{children:`Inès Moreau`}),/* @__PURE__ */ s(`li`,{children:`Kofi Mensah`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize inbox`}),/* @__PURE__ */ c(p,{minSize:15,children:[/* @__PURE__ */ s(`h3`,{children:`Quarterly report`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`From Hollis Grant`})]})]})}const x=e=>e.map(Math.round).join(` / `);function S(){let e=i(),[t,n]=a.useState([30,70]);return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>n([50,50]),children:`Split Evenly`}),/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>n([30,70]),children:`Reset`})]}),/* @__PURE__ */ c(d,{layout:t,onLayoutChange:(r,i)=>{x(r)!==x(t)&&e(`${x(r)} (${i.reason})`),n(r)},children:[/* @__PURE__ */ c(p,{minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Files`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`page.tsx`}),/* @__PURE__ */ s(`li`,{children:`layout.tsx`}),/* @__PURE__ */ s(`li`,{children:`globals.css`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize files`}),/* @__PURE__ */ c(p,{minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`page.tsx`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Saved just now`})]})]})]})}function C(){let e=i();return/* @__PURE__ */ c(d,{onLayoutCommit:(t,n)=>e(`Saved ${t.map(Math.round).join(` / `)} (${n.reason})`),children:[/* @__PURE__ */ c(p,{defaultSize:40,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Files`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`page.tsx`}),/* @__PURE__ */ s(`li`,{children:`layout.tsx`}),/* @__PURE__ */ s(`li`,{children:`globals.css`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize files`}),/* @__PURE__ */ c(p,{minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`page.tsx`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Saved just now`})]})]})}function w(){return/* @__PURE__ */ c(d,{autoSaveId:`docs-persistence`,children:[/* @__PURE__ */ c(p,{id:`docs-sidebar`,defaultSize:30,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Outline`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`Introduction`}),/* @__PURE__ */ s(`li`,{children:`Installation`}),/* @__PURE__ */ s(`li`,{children:`Usage`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize outline`,children:/* @__PURE__ */ s(`div`,{})}),/* @__PURE__ */ c(p,{id:`docs-content`,minSize:30,children:[/* @__PURE__ */ s(`h3`,{children:`Introduction`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Last edited by Wren Takahashi`})]})]})}const T={getItem:e=>sessionStorage.getItem(e),setItem:(e,t)=>sessionStorage.setItem(e,t)};function E(){return/* @__PURE__ */ c(d,{autoSaveId:`docs-storage`,storage:T,children:[/* @__PURE__ */ c(p,{id:`session-chats`,defaultSize:35,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Messages`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`Inès Moreau`}),/* @__PURE__ */ s(`li`,{children:`Kofi Mensah`}),/* @__PURE__ */ s(`li`,{children:`Wren Takahashi`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize messages`}),/* @__PURE__ */ c(p,{id:`session-thread`,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Inès Moreau`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Can we move the review to Friday?`})]})]})}function D(){let e=i(),[t]=a.useState(m);return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>t.collapse(`controller-sidebar`),children:`Collapse`}),/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>t.expand(`controller-sidebar`),children:`Expand`}),/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>t.resize(`controller-sidebar`,`240px`),children:`240px`}),/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>e(`Layout ${t.getLayout().map(Math.round).join(` / `)}${t.isCollapsed(`controller-sidebar`)?`, collapsed`:``}`),children:`Read`})]}),/* @__PURE__ */ c(d,{controller:t,children:[/* @__PURE__ */ c(p,{id:`controller-sidebar`,defaultSize:30,minSize:20,collapsible:!0,children:[/* @__PURE__ */ s(`h3`,{children:`Files`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`page.tsx`}),/* @__PURE__ */ s(`li`,{children:`layout.tsx`}),/* @__PURE__ */ s(`li`,{children:`globals.css`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize files`}),/* @__PURE__ */ c(p,{minSize:30,children:[/* @__PURE__ */ s(`h3`,{children:`page.tsx`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`Saved just now`})]})]})]})}function O(){return/* @__PURE__ */ c(d,{step:5,largeStep:25,children:[/* @__PURE__ */ c(p,{defaultSize:50,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Original`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`v1.2.0`})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize original`}),/* @__PURE__ */ c(p,{defaultSize:50,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`Changes`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`v1.3.0`})]})]})}function k(){let[t,n]=a.useState(!1);return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ c(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ s(l,{checked:t,onCheckedChange:e=>n(e===!0),children:/* @__PURE__ */ s(u,{children:/* @__PURE__ */ s(e,{"aria-hidden":`true`})})}),`Lock layout`]})}),/* @__PURE__ */ c(d,{disabled:t,children:[/* @__PURE__ */ c(p,{minSize:15,children:[/* @__PURE__ */ s(`h3`,{children:`Pinned`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`2 notes`})]}),/* @__PURE__ */ s(f,{disabled:!0,"aria-label":`Resize pinned`}),/* @__PURE__ */ c(p,{minSize:15,children:[/* @__PURE__ */ s(`h3`,{children:`Inbox`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`3 unread`})]}),/* @__PURE__ */ s(f,{"aria-label":`Resize inbox`}),/* @__PURE__ */ c(p,{minSize:15,children:[/* @__PURE__ */ s(`h3`,{children:`Message`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`From Kofi Mensah`})]})]})]})}function A(){return/* @__PURE__ */ c(d,{children:[/* @__PURE__ */ s(p,{defaultSize:35,minSize:20,collapsible:!0,children:e=>/* @__PURE__ */ c(o,{children:[/* @__PURE__ */ s(`h3`,{children:`Files`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:e.collapsed?`Collapsed`:`${Math.round(e.size)}%`})]})}),/* @__PURE__ */ s(f,{"aria-label":`Resize files`,render:/* @__PURE__ */ s(`div`,{})}),/* @__PURE__ */ s(p,{minSize:30,children:e=>/* @__PURE__ */ c(o,{children:[/* @__PURE__ */ s(`h3`,{children:`Editor`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`${Math.round(e.size)}%`})]})})]})}function j(){return/* @__PURE__ */ s(`div`,{dir:`rtl`,children:/* @__PURE__ */ c(d,{children:[/* @__PURE__ */ c(p,{defaultSize:35,minSize:20,children:[/* @__PURE__ */ s(`h3`,{children:`الملفات`}),/* @__PURE__ */ c(`ul`,{children:[/* @__PURE__ */ s(`li`,{children:`page.tsx`}),/* @__PURE__ */ s(`li`,{children:`layout.tsx`}),/* @__PURE__ */ s(`li`,{children:`globals.css`})]})]}),/* @__PURE__ */ s(f,{"aria-label":`تغيير حجم الملفات`}),/* @__PURE__ */ s(p,{defaultSize:65,minSize:40,children:/* @__PURE__ */ c(d,{orientation:`vertical`,children:[/* @__PURE__ */ c(p,{defaultSize:60,minSize:30,children:[/* @__PURE__ */ s(`h3`,{children:`page.tsx`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`حُفظ للتو`})]}),/* @__PURE__ */ s(f,{"aria-label":`تغيير حجم المحرر`}),/* @__PURE__ */ c(p,{defaultSize:40,minSize:30,children:[/* @__PURE__ */ s(`h3`,{children:`الطرفية`}),/* @__PURE__ */ s(`span`,{"data-slot":`hint`,children:`جاهز على المنفذ 3000`})]})]})})]})})}var M={name:`resizable`,title:`Resizable`,description:`Resize, collapse, and save panel layouts with pointer and keyboard controls.`,sections:[{heading:null,text:`Use a resizable group to let people size the panes of a layout, like a file list beside an editor, by dragging the handle between them or with the keyboard.`,examples:[{id:`resizable/basic`,caption:`Drag the handle beside Files, then the one between page.tsx and Terminal.`,Example:h,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={35} minSize={20}>
        <h3>Files</h3>
        <ul>
          <li>page.tsx</li>
          <li>layout.tsx</li>
          <li>globals.css</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize files" />
      <ResizablePanel defaultSize={65} minSize={40}>
        <Resizable orientation="vertical">
          <ResizablePanel defaultSize={60} minSize={30}>
            <h3>page.tsx</h3>
            <span data-slot="hint">Saved just now</span>
          </ResizablePanel>
          <ResizableHandle aria-label="Resize editor" />
          <ResizablePanel defaultSize={40} minSize={30}>
            <h3>Terminal</h3>
            <span data-slot="hint">Ready on port 3000</span>
          </ResizablePanel>
        </Resizable>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'Set `orientation="vertical"` to stack the panels, and give the group a height. ArrowUp and ArrowDown move the handle. Every part gets `data-orientation` with the group\'s direction, so a vertical group\'s handle is `[data-slot="resizable-handle"][data-orientation="vertical"]`.',examples:[{id:`resizable/vertical`,caption:`Drag the handle between Inbox and Quarterly report, or focus it and use ArrowUp and ArrowDown.`,Example:g,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable orientation="vertical">
      <ResizablePanel defaultSize={45} minSize={25}>
        <h3>Inbox</h3>
        <span data-slot="hint">3 unread messages</span>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize inbox" />
      <ResizablePanel defaultSize={55} minSize={25}>
        <h3>Quarterly report</h3>
        <span data-slot="hint">From Hollis Grant</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Handle`,text:`Put anything inside a handle, like a grip that shows it can be dragged. The handle can stay a thin line: its hit area is at least 10 pixels across, centered on it, and 24 for touch, without any styles.`,examples:[{id:`resizable/handle`,caption:`Grab the grip beside Channels, or focus the handle and use the arrow keys.`,Example:_,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={35} minSize={20}>
        <h3>Channels</h3>
        <ul>
          <li>general</li>
          <li>design</li>
          <li>releases</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize channels">
        <div />
      </ResizableHandle>
      <ResizablePanel defaultSize={65} minSize={20}>
        <h3>general</h3>
        <span data-slot="hint">Kofi Mensah: The release notes are ready.</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Collapsible`,text:"`collapsible` lets a panel collapse below its `minSize` to `collapsedSize`, 0 by default: by dragging past the midpoint to its collapsed size, with Enter or a double-click on its handle, or through the controller. Dragging back past the same point opens it at its minimum, and Enter restores the size it had. A collapsed panel gets `data-collapsed`, and at size 0 its content leaves the tab order and the accessibility tree.",examples:[{id:`resizable/collapsible`,caption:`Drag the sidebar closed to leave only its icons, or focus its handle and press Enter to collapse and restore it.`,Example:v,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import { FolderIcon, SearchIcon, SettingsIcon } from "lucide-react"

function Example() {
  return (
    <Resizable>
      <ResizablePanel
        defaultSize={30}
        minSize={25}
        collapsible
        collapsedSize="48px"
      >
        <ul>
          <li data-slot="row">
            <FolderIcon aria-hidden="true" />
            <span>Files</span>
          </li>
          <li data-slot="row">
            <SearchIcon aria-hidden="true" />
            <span>Search</span>
          </li>
          <li data-slot="row">
            <SettingsIcon aria-hidden="true" />
            <span>Settings</span>
          </li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize sidebar">
        <div />
      </ResizableHandle>
      <ResizablePanel minSize={40}>
        <h3>README.md</h3>
        <span data-slot="hint">Edited by Inès Moreau</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Sizes in Pixels`,text:'Sizes are percentages as numbers, or strings with `%`, `px` or `rem`. Pixel and rem bounds hold as the group resizes, so a navigation with `minSize="160px"` never gets narrower, and a change they cause reports the `resize` reason.',examples:[{id:`resizable/sizes`,caption:`Resize Docs. It stays between 160 and 320 pixels wide, whatever the width of the group.`,Example:y,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize="200px" minSize="160px" maxSize="320px">
        <h3>Docs</h3>
        <ul>
          <li>Getting Started</li>
          <li>Components</li>
          <li>Guides</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize navigation">
        <div />
      </ResizableHandle>
      <ResizablePanel minSize={30}>
        <h3>Getting Started</h3>
        <span data-slot="hint">Install the packages</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Default Layout`,text:"`defaultLayout` sets every panel's size at once, in order. Otherwise panels without `defaultSize` share what's left evenly.",examples:[{id:`resizable/default-layout`,caption:`The three mail panels start at 25, 35 and 40 percent. Resize any of them.`,Example:b,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable defaultLayout={[25, 35, 40]}>
      <ResizablePanel minSize={15}>
        <h3>Mail</h3>
        <ul>
          <li>Inbox</li>
          <li>Drafts</li>
          <li>Sent</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize folders" />
      <ResizablePanel minSize={15}>
        <h3>Inbox</h3>
        <ul>
          <li>Hollis Grant</li>
          <li>Inès Moreau</li>
          <li>Kofi Mensah</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize inbox" />
      <ResizablePanel minSize={15}>
        <h3>Quarterly report</h3>
        <span data-slot="hint">From Hollis Grant</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `layout` and `onLayoutChange` to control the group. The layout is one percentage per panel, in order, adding up to 100. Every change carries a reason, like `drag`, `step-key` or `collapse`, and `details.cancel()` keeps the current layout.",examples:[{id:`resizable/controlled`,caption:`Resize Files to log the layout and its reason. Split Evenly and Reset set the layout from outside.`,Example:S,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const format = (layout: number[]) => layout.map(Math.round).join(" / ")

function Example() {
  const log = useLog()
  const [layout, setLayout] = React.useState([30, 70])
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setLayout([50, 50])}>
          Split Evenly
        </button>
        <button type="button" onClick={() => setLayout([30, 70])}>
          Reset
        </button>
      </div>
      <Resizable
        layout={layout}
        onLayoutChange={(next, details) => {
          if (format(next) !== format(layout)) {
            log(\`\${format(next)} (\${details.reason})\`)
          }
          setLayout(next)
        }}
      >
        <ResizablePanel minSize={20}>
          <h3>Files</h3>
          <ul>
            <li>page.tsx</li>
            <li>layout.tsx</li>
            <li>globals.css</li>
          </ul>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize files" />
        <ResizablePanel minSize={20}>
          <h3>page.tsx</h3>
          <span data-slot="hint">Saved just now</span>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}

export { Example }
`}]},{heading:`Saving on Complete`,text:"`onLayoutChange` runs on every frame of a drag. `onLayoutCommit` runs once, when the interaction that changed the layout ends: the pointer lifts, the key comes up, or a panel collapses. Save there. Escape during a drag puts the panels back where they started, and nothing commits.",examples:[{id:`resizable/complete`,caption:`Drag the handle and release it, or press an arrow key. The console logs the layout once, when you let go.`,Example:C,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <Resizable
      onLayoutCommit={(layout, details) =>
        log(\`Saved \${layout.map(Math.round).join(" / ")} (\${details.reason})\`)
      }
    >
      <ResizablePanel defaultSize={40} minSize={20}>
        <h3>Files</h3>
        <ul>
          <li>page.tsx</li>
          <li>layout.tsx</li>
          <li>globals.css</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize files" />
      <ResizablePanel minSize={20}>
        <h3>page.tsx</h3>
        <span data-slot="hint">Saved just now</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Persistence`,text:"`autoSaveId` saves the layout in `localStorage` when an interaction completes and restores it when the group attaches in the browser. Server markup starts with the default sizes. Each set of panels keeps its own layout, so a panel that comes and goes gets its sizes back. Give panels an `id` so the saved layout survives changes elsewhere on the page.",examples:[{id:`resizable/persistence`,caption:`Resize Outline, then reload this page to restore its saved width.`,Example:w,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable autoSaveId="docs-persistence">
      <ResizablePanel id="docs-sidebar" defaultSize={30} minSize={20}>
        <h3>Outline</h3>
        <ul>
          <li>Introduction</li>
          <li>Installation</li>
          <li>Usage</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize outline">
        <div />
      </ResizableHandle>
      <ResizablePanel id="docs-content" minSize={30}>
        <h3>Introduction</h3>
        <span data-slot="hint">Last edited by Wren Takahashi</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Storage`,text:"`storage` takes anything with `getItem` and `setItem`, like `sessionStorage` or a cookie. That's the browser's storage shape, not the storage helpers Preferences takes, such as `createLocalStorage`, which each keep one value. Choose between local storage, session storage and a cookie as you would for a preference, under Remember the Choice.",examples:[{id:`resizable/storage`,caption:`Resize Messages, then reload. The width comes back in this tab, but not in a new one.`,Example:E,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
  type ResizableStorage,
} from "@ui-sdk/react/resizable"

const session: ResizableStorage = {
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
}

function Example() {
  return (
    <Resizable autoSaveId="docs-storage" storage={session}>
      <ResizablePanel id="session-chats" defaultSize={35} minSize={20}>
        <h3>Messages</h3>
        <ul>
          <li>Inès Moreau</li>
          <li>Kofi Mensah</li>
          <li>Wren Takahashi</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize messages" />
      <ResizablePanel id="session-thread" minSize={20}>
        <h3>Inès Moreau</h3>
        <span data-slot="hint">Can we move the review to Friday?</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"A controller, from `createResizableController()`, collapses, expands and resizes panels from anywhere, by id or index, and reads the layout with `getLayout()`. Changes it makes report the `imperative` reason.",examples:[{id:`resizable/controller`,caption:`Use Collapse, Expand and 240px to move Files from outside the group, and Read to log its sizes.`,Example:D,source:`"use client"

import {
  createResizableController,
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [editor] = React.useState(createResizableController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={() => editor.collapse("controller-sidebar")}
        >
          Collapse
        </button>
        <button
          type="button"
          onClick={() => editor.expand("controller-sidebar")}
        >
          Expand
        </button>
        <button
          type="button"
          onClick={() => editor.resize("controller-sidebar", "240px")}
        >
          240px
        </button>
        <button
          type="button"
          onClick={() =>
            log(
              \`Layout \${editor.getLayout().map(Math.round).join(" / ")}\${editor.isCollapsed("controller-sidebar") ? ", collapsed" : ""}\`
            )
          }
        >
          Read
        </button>
      </div>
      <Resizable controller={editor}>
        <ResizablePanel
          id="controller-sidebar"
          defaultSize={30}
          minSize={20}
          collapsible
        >
          <h3>Files</h3>
          <ul>
            <li>page.tsx</li>
            <li>layout.tsx</li>
            <li>globals.css</li>
          </ul>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize files" />
        <ResizablePanel minSize={30}>
          <h3>page.tsx</h3>
          <span data-slot="hint">Saved just now</span>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}

export { Example }
`}]},{heading:`Step Size`,text:"`step` sets how far an arrow key moves a handle, 1% by default, and `largeStep` how far Shift with an arrow moves it, 10% by default.",examples:[{id:`resizable/keyboard`,caption:`Focus the handle between Original and Changes. The arrow keys move it 5%, Shift with an arrow 25%, and Home and End as far as it goes.`,Example:O,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable step={5} largeStep={25}>
      <ResizablePanel defaultSize={50} minSize={20}>
        <h3>Original</h3>
        <span data-slot="hint">v1.2.0</span>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize original" />
      <ResizablePanel defaultSize={50} minSize={20}>
        <h3>Changes</h3>
        <span data-slot="hint">v1.3.0</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"`disabled` on a handle fixes it in place. On the group it fixes every handle. Disabled handles leave the tab order, and their panels keep their sizes. A disabled `<fieldset>` around the group fixes every handle too.",examples:[{id:`resizable/disabled`,caption:`The handle after Pinned stays fixed. Drag the one after Inbox, then check Lock layout to fix it too.`,Example:k,source:`"use client"

import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import { CheckIcon } from "lucide-react"
import * as React from "react"

function Example() {
  const [locked, setLocked] = React.useState(false)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Checkbox
            checked={locked}
            onCheckedChange={(next) => setLocked(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Lock layout
        </label>
      </div>
      <Resizable disabled={locked}>
        <ResizablePanel minSize={15}>
          <h3>Pinned</h3>
          <span data-slot="hint">2 notes</span>
        </ResizablePanel>
        <ResizableHandle disabled aria-label="Resize pinned" />
        <ResizablePanel minSize={15}>
          <h3>Inbox</h3>
          <span data-slot="hint">3 unread</span>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize inbox" />
        <ResizablePanel minSize={15}>
          <h3>Message</h3>
          <span data-slot="hint">From Kofi Mensah</span>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"`render`, `className` and `children` can be functions of the part's state, like a panel's `size` and whether it's `collapsed`, or whether a handle is `dragging` or `hovering`. See Parts and Composition for the rendering contract.",examples:[{id:`resizable/render`,caption:`Resize Files to see both panels report their size, or collapse it to see Collapsed.`,Example:A,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={35} minSize={20} collapsible>
        {(state) => (
          <>
            <h3>Files</h3>
            <span data-slot="hint">
              {state.collapsed ? "Collapsed" : \`\${Math.round(state.size)}%\`}
            </span>
          </>
        )}
      </ResizablePanel>
      <ResizableHandle aria-label="Resize files" render={<div />} />
      <ResizablePanel minSize={30}>
        {(state) => (
          <>
            <h3>Editor</h3>
            <span data-slot="hint">{\`\${Math.round(state.size)}%\`}</span>
          </>
        )}
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`resizable/rtl`,caption:``,Example:j,source:`"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <div dir="rtl">
      <Resizable>
        <ResizablePanel defaultSize={35} minSize={20}>
          <h3>الملفات</h3>
          <ul>
            <li>page.tsx</li>
            <li>layout.tsx</li>
            <li>globals.css</li>
          </ul>
        </ResizablePanel>
        <ResizableHandle aria-label="تغيير حجم الملفات" />
        <ResizablePanel defaultSize={65} minSize={40}>
          <Resizable orientation="vertical">
            <ResizablePanel defaultSize={60} minSize={30}>
              <h3>page.tsx</h3>
              <span data-slot="hint">حُفظ للتو</span>
            </ResizablePanel>
            <ResizableHandle aria-label="تغيير حجم المحرر" />
            <ResizablePanel defaultSize={40} minSize={30}>
              <h3>الطرفية</h3>
              <span data-slot="hint">جاهز على المنفذ 3000</span>
            </ResizablePanel>
          </Resizable>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}

export { Example }
`}]}]};export{M as default};