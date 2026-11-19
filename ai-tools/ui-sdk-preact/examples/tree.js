import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-CU-88Fi-.js";import{t as n}from"../chunks/c-BnWal148.js";import{t as r}from"../chunks/c-b3fuBy5S.js";import{t as i}from"../chunks/c-D5QH3sUe.js";import{useLog as a}from"./log.js";import*as o from"preact/compat";import{Fragment as s,jsx as c,jsxs as l}from"preact/compat/jsx-runtime";import{Switch as u,SwitchThumb as d}from"ui-sdk/switch.js";import{Tree as f,TreeGroup as p,TreeItem as m,TreeItemCheckbox as h,TreeItemIndicator as g,TreeItemLabel as _,createTreeController as v,treeFromPaths as y,visibleTreeRows as b}from"ui-sdk/tree.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const x={name:`folder-open`,size:24,node:[[`path`,{d:`m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2`,key:`usdka0`}]]};x.node;const ee=e(x),S={name:`rotate-cw`,size:24,node:[[`path`,{d:`M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8`,key:`1p45f6`}],[`path`,{d:`M21 3v5h-5`,key:`1q7to0`}]]}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
;S.node;const C=e(S),w=[{value:`app`,label:`app`,children:[{value:`app/layout.tsx`,label:`layout.tsx`},{value:`app/page.tsx`,label:`page.tsx`},{value:`app/settings`,label:`settings`,children:[{value:`app/settings/page.tsx`,label:`page.tsx`}]}]},{value:`components`,label:`components`,children:[{value:`components/button.tsx`,label:`button.tsx`},{value:`components/card.tsx`,label:`card.tsx`}]},{value:`components.json`,label:`components.json`},{value:`package.json`,label:`package.json`},{value:`README.md`,label:`README.md`}];function T({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ l(_,{children:[e.children?/* @__PURE__ */ l(s,{children:[/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),/* @__PURE__ */ c(r,{"aria-hidden":`true`}),/* @__PURE__ */ c(ee,{"aria-hidden":`true`})]}):/* @__PURE__ */ c(n,{"aria-hidden":`true`}),/* @__PURE__ */ c(`span`,{children:e.label})]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(T,{items:e.children})})]},e.value))}function te(){return/* @__PURE__ */ c(f,{"aria-label":`Files`,defaultExpanded:[`app`],defaultValue:`app/page.tsx`,children:/* @__PURE__ */ c(T,{items:w})})}const E=[`src/index.ts`,`src/lib/format.ts`,`src/lib/parse.ts`,`src/routes/home.tsx`,`src/routes/about.tsx`,`tests/`,`package.json`,`tsconfig.json`],D=y(E),O=new Set(E.filter(e=>!e.endsWith(`/`)));function k({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ c(_,{children:n=>/* @__PURE__ */ l(s,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),/* @__PURE__ */ c(`span`,{children:e.label}),n.pending&&/* @__PURE__ */ c(i,{"aria-hidden":`true`})]})}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(k,{items:e.children})})]},e.value))}function A(){let e=a();return/* @__PURE__ */ c(f,{"aria-label":`Project`,paths:E,defaultExpanded:[`src`],defaultValue:`src/index.ts`,activation:`automatic`,onAction:async t=>{O.has(t)&&(await new Promise(e=>setTimeout(e,600)),e(`Opened ${t}`))},children:/* @__PURE__ */ c(k,{items:D})})}const j=[{value:`inbox`,label:`Inbox`,children:[{value:`updates`,label:`Updates`},{value:`forums`,label:`Forums`},{value:`promotions`,label:`Promotions`}]},{value:`projects`,label:`Projects`,children:[{value:`website`,label:`Website`},{value:`mobile`,label:`Mobile app`}]},{value:`archive`,label:`Archive`},{value:`trash`,label:`Trash`}];function M({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ l(_,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(M,{items:e.children})})]},e.value))}function ne(){let e=a();return/* @__PURE__ */ c(f,{"aria-label":`Folders`,items:j,mode:`multiple`,defaultValue:[`updates`,`website`],onValueChange:t=>e(`${t.length} selected: ${t.join(`, `)}`),expandOnPress:!1,defaultExpanded:[`inbox`,`projects`],children:/* @__PURE__ */ c(M,{items:j})})}const N=[{value:`frontend`,label:`Frontend`,children:[{value:`react`,label:`React`},{value:`vue`,label:`Vue`},{value:`svelte`,label:`Svelte`}]},{value:`backend`,label:`Backend`,children:[{value:`node`,label:`Node`},{value:`databases`,label:`Databases`,children:[{value:`postgres`,label:`Postgres`},{value:`sqlite`,label:`SQLite`}]}]}];function P({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ l(_,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),/* @__PURE__ */ c(h,{}),e.label]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(P,{items:e.children})})]},e.value))}function re(){let e=a();return/* @__PURE__ */ c(f,{"aria-label":`Stack`,items:N,checkable:!0,mode:`none`,checkStrategy:`trunk`,defaultChecked:[`react`,`postgres`],onCheckedChange:t=>e(`Checked ${t.join(`, `)||`nothing`}`),defaultExpanded:[`frontend`,`backend`,`databases`],children:/* @__PURE__ */ c(P,{items:N})})}const F=[{value:`getting-started`,label:`Getting started`,children:[{value:`introduction`,label:`Introduction`,href:`#introduction`},{value:`installation`,label:`Installation`,href:`#installation`}]},{value:`components`,label:`Components`,children:[{value:`accordion`,label:`Accordion`,href:`#accordion`},{value:`dialog`,label:`Dialog`,href:`#dialog`},{value:`tree`,label:`Tree`,href:`#tree`}]},{value:`changelog`,label:`Changelog`,href:`#changelog`}],I=new Set(F.flatMap(e=>[e,...e.children??[]]).filter(e=>e.href).map(e=>e.value));function L({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ l(_,{render:e.href?/* @__PURE__ */ c(`a`,{href:e.href}):void 0,children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(L,{items:e.children})})]},e.value))}function R(){let[e,t]=o.useState(`tree`);return/* @__PURE__ */ c(f,{"aria-label":`Docs`,items:F,mode:`none`,current:e,onAction:(e,{event:n})=>{I.has(e)&&(n?.preventDefault(),t(e))},children:/* @__PURE__ */ c(L,{items:F})})}const z=[{value:`plans`,label:`Plans`,children:[{value:`free`,label:`Free`},{value:`pro`,label:`Pro`},{value:`enterprise`,label:`Enterprise`,disabled:!0}]},{value:`legacy`,label:`Legacy plans`,disabled:!0,children:[{value:`starter`,label:`Starter`}]},{value:`custom`,label:`Custom`}];function B({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,disabled:e.disabled,children:[/* @__PURE__ */ l(_,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(B,{items:e.children})})]},e.value))}function V(){let[e,t]=o.useState(!0);return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ l(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ c(u,{checked:e,onCheckedChange:t,children:/* @__PURE__ */ c(d,{})}),`Focusable when disabled`]})}),/* @__PURE__ */ c(f,{"aria-label":`Plans`,items:z,defaultExpanded:[`plans`],focusableWhenDisabled:e,children:/* @__PURE__ */ c(B,{items:z})})]})}const H=[{value:`users`,label:`users`,branch:!0},{value:`orders`,label:`orders`,branch:!0},{value:`archive`,label:`archive`,branch:!0}];let U=!1;async function W(e,t){if(await new Promise((e,n)=>{let r=setTimeout(e,800);t.addEventListener(`abort`,()=>(clearTimeout(r),n(t.reason)))}),e===`archive`&&!U)throw U=!0,Error(`Network error`);return Array.from({length:3},(t,n)=>({value:`${e}/${n+1}`,label:`${e.slice(0,-1)}_${n+1}.json`}))}function G({items:e,loaded:n}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,branch:e.branch,children:[/* @__PURE__ */ l(_,{children:[e.branch&&/* @__PURE__ */ c(g,{children:e=>e.loading?/* @__PURE__ */ c(i,{"aria-hidden":`true`}):e.failed?/* @__PURE__ */ c(C,{"aria-hidden":`true`}):/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]}),n[e.value]&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(G,{items:n[e.value],loaded:n})})]},e.value))}function K(){let[e,t]=o.useState({});return/* @__PURE__ */ c(f,{"aria-label":`Database`,loadChildren:async(e,{signal:n})=>{let r=await W(e,n);t(t=>({...t,[e]:r}))},announcement:({type:e,label:t})=>({expanded:`Expanded`,collapsed:`Collapsed`,loading:`Loading ${t}`,"load-failed":`${t} didn't load. Try again.`})[e],children:/* @__PURE__ */ c(G,{items:H,loaded:e})})}const q=Array.from({length:100},(e,t)=>({value:`folder-${t+1}`,label:`Folder ${t+1}`,children:Array.from({length:100},(e,n)=>({value:`folder-${t+1}/file-${n+1}`,label:`File ${n+1}.txt`}))}));function J(){let e=o.useRef(null),[n,r]=o.useState(0),[i,a]=o.useState([`folder-1`]),s=o.useMemo(()=>b(q,i),[i]),u=Math.max(0,Math.floor(n/32)-4),d=Math.min(s.length,Math.ceil((n+288)/32)+4);return/* @__PURE__ */ c(`div`,{"data-slot":`scroll`,ref:e,onScroll:e=>r(e.currentTarget.scrollTop),children:/* @__PURE__ */ c(f,{"aria-label":`Archive`,items:q,expanded:i,onExpandedChange:a,onHighlight:(t,{index:n})=>{let i=e.current;if(!i)return;let a=n*32;a<i.scrollTop?i.scrollTop=a:a+32>i.scrollTop+i.clientHeight-10&&(i.scrollTop=a+32-i.clientHeight+10),r(i.scrollTop)},style:{height:s.length*32},children:s.slice(u,d).map(({item:e,index:n})=>/* @__PURE__ */ c(m,{value:e.value,style:{top:n*32},children:/* @__PURE__ */ l(_,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]})},e.value))})})}const Y=[{value:`planets`,label:`Planets`,children:[{value:`mercury`,label:`Mercury`},{value:`venus`,label:`Venus`},{value:`earth`,label:`Earth`,children:[{value:`moon`,label:`The Moon`}]},{value:`mars`,label:`Mars`,children:[{value:`phobos`,label:`Phobos`},{value:`deimos`,label:`Deimos`}]}]},{value:`dwarf-planets`,label:`Dwarf planets`,children:[{value:`ceres`,label:`Ceres`},{value:`pluto`,label:`Pluto`,children:[{value:`charon`,label:`Charon`}]}]}];function X({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ l(_,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(X,{items:e.children})})]},e.value))}function ie(){return/* @__PURE__ */ c(f,{"aria-label":`Solar system`,items:Y,hiddenUntilFound:!0,children:/* @__PURE__ */ c(X,{items:Y})})}const Z=[{value:`account`,label:`Account`,children:[{value:`profile`,label:`Profile`},{value:`security`,label:`Security`,children:[{value:`password`,label:`Password`},{value:`two-factor`,label:`Two-factor authentication`}]}]},{value:`workspace`,label:`Workspace`,children:[{value:`members`,label:`Members`},{value:`billing`,label:`Billing`}]}];function Q({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ l(_,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c(Q,{items:e.children})})]},e.value))}function ae(){let[e]=o.useState(()=>v());return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ l(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ c(`button`,{type:`button`,onClick:()=>e.expandAll(),children:`Expand All`}),/* @__PURE__ */ c(`button`,{type:`button`,onClick:()=>e.collapseAll(),children:`Collapse All`}),/* @__PURE__ */ c(`button`,{type:`button`,onClick:()=>{e.setValue(`two-factor`),e.reveal(`two-factor`)},children:`Find Two-Factor`})]}),/* @__PURE__ */ c(f,{"aria-label":`Settings`,items:Z,controller:e,children:/* @__PURE__ */ c(Q,{items:Z})})]})}const oe=[{value:`documents`,label:`المستندات`,children:[{value:`reports`,label:`التقارير`},{value:`invoices`,label:`الفواتير`}]},{value:`photos`,label:`الصور`,children:[{value:`trips`,label:`الرحلات`},{value:`family`,label:`العائلة`}]},{value:`downloads`,label:`التنزيلات`}];function $({items:e}){return e.map(e=>/* @__PURE__ */ l(m,{value:e.value,children:[/* @__PURE__ */ l(_,{children:[e.children&&/* @__PURE__ */ c(g,{children:/* @__PURE__ */ c(t,{"aria-hidden":`true`})}),e.label]}),e.children&&/* @__PURE__ */ c(p,{children:/* @__PURE__ */ c($,{items:e.children})})]},e.value))}function se(){return/* @__PURE__ */ c(`div`,{dir:`rtl`,children:/* @__PURE__ */ c(f,{"aria-label":`الملفات`,defaultExpanded:[`documents`],children:/* @__PURE__ */ c($,{items:oe})})})}var ce={name:`tree`,title:`Tree`,description:`Browse a hierarchy of files, pages, or choices with expandable branches.`,sections:[{heading:null,text:`Use a Tree when items have children, like files in folders or pages in a docs sidebar. Start with nested parts, then add selection, checkboxes, or children loaded from a server as you need them.`,examples:[{id:`tree/demo`,caption:`Expand components to see its files. Use the arrow keys to move between rows and open or close branches.`,Example:te,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
} from "@ui-sdk/react/tree"
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react"

type Node = { value: string; label: string; children?: Node[] }

const files: Node[] = [
  {
    value: "app",
    label: "app",
    children: [
      { value: "app/layout.tsx", label: "layout.tsx" },
      { value: "app/page.tsx", label: "page.tsx" },
      {
        value: "app/settings",
        label: "settings",
        children: [{ value: "app/settings/page.tsx", label: "page.tsx" }],
      },
    ],
  },
  {
    value: "components",
    label: "components",
    children: [
      { value: "components/button.tsx", label: "button.tsx" },
      { value: "components/card.tsx", label: "card.tsx" },
    ],
  },
  { value: "components.json", label: "components.json" },
  { value: "package.json", label: "package.json" },
  { value: "README.md", label: "README.md" },
]

function Items({ items }: { items: Node[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel>
        {item.children ? (
          <>
            <TreeItemIndicator>
              <ChevronRightIcon aria-hidden="true" />
            </TreeItemIndicator>
            <FolderIcon aria-hidden="true" />
            <FolderOpenIcon aria-hidden="true" />
          </>
        ) : (
          <FileIcon aria-hidden="true" />
        )}
        <span>{item.label}</span>
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  return (
    <Tree
      aria-label="Files"
      defaultExpanded={["app"]}
      defaultValue="app/page.tsx"
    >
      <Items items={files} />
    </Tree>
  )
}

export { Example }
`}]},{heading:`File Paths`,text:"Pass `paths` for a file explorer. Folders become branches and sort before files; a path ending in `/` represents an empty folder. `treeFromPaths()` returns the same data when you want to render the rows yourself.",examples:[{id:`tree/paths`,caption:`Arrow down to package.json, then press Enter. It shows a spinner while it opens, then the console logs Opened package.json.`,Example:A,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  treeFromPaths,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon, LoaderCircleIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const paths = [
  "src/index.ts",
  "src/lib/format.ts",
  "src/lib/parse.ts",
  "src/routes/home.tsx",
  "src/routes/about.tsx",
  "tests/",
  "package.json",
  "tsconfig.json",
]

const items = treeFromPaths(paths)
const files = new Set(paths.filter((path) => !path.endsWith("/")))

function Items({ items }: { items: TreeItemData[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel>
        {(state) => (
          <>
            {item.children && (
              <TreeItemIndicator>
                <ChevronRightIcon aria-hidden="true" />
              </TreeItemIndicator>
            )}
            <span>{item.label}</span>
            {state.pending && <LoaderCircleIcon aria-hidden="true" />}
          </>
        )}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  const log = useLog()
  return (
    <Tree
      aria-label="Project"
      paths={paths}
      defaultExpanded={["src"]}
      defaultValue="src/index.ts"
      activation="automatic"
      onAction={async (value) => {
        if (!files.has(value)) {
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 600))
        log(\`Opened \${value}\`)
      }}
    >
      <Items items={items} />
    </Tree>
  )
}

export { Example }
`}]},{heading:`Multiple Selection`,text:'`mode="multiple"` makes the value an array. Cmd-click or Ctrl-click toggles one item, Shift extends a range, and Cmd+A or Ctrl+A selects the visible items. This example sets `expandOnPress` to `false`, so clicking Inbox or Projects selects the folder without closing it.',examples:[{id:`tree/multiple`,caption:`Cmd-click or Ctrl-click Archive to add it to the selection. Shift-click or Shift+Arrow extends a range, and the console logs what's selected.`,Example:ne,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const items: TreeItemData[] = [
  {
    value: "inbox",
    label: "Inbox",
    children: [
      { value: "updates", label: "Updates" },
      { value: "forums", label: "Forums" },
      { value: "promotions", label: "Promotions" },
    ],
  },
  {
    value: "projects",
    label: "Projects",
    children: [
      { value: "website", label: "Website" },
      { value: "mobile", label: "Mobile app" },
    ],
  },
  { value: "archive", label: "Archive" },
  { value: "trash", label: "Trash" },
]

function Items({ items }: { items: TreeItemData[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel>
        {item.children && (
          <TreeItemIndicator>
            <ChevronRightIcon aria-hidden="true" />
          </TreeItemIndicator>
        )}
        {item.label}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  const log = useLog()
  return (
    <Tree
      aria-label="Folders"
      items={items}
      mode="multiple"
      defaultValue={["updates", "website"]}
      onValueChange={(value) =>
        log(\`\${value.length} selected: \${value.join(", ")}\`)
      }
      expandOnPress={false}
      defaultExpanded={["inbox", "projects"]}
    >
      <Items items={items} />
    </Tree>
  )
}

export { Example }
`}]},{heading:`Checkboxes`,text:"Add `checkable` and `TreeItemCheckbox` for a checked state separate from selection. Space checks the focused item. Checking a branch checks its descendants, and a partly checked branch reports a mixed state.",examples:[{id:`tree/checkboxes`,caption:`Press Space on Vue, then on Frontend. Frontend is mixed while only some of its items are checked, and the console logs the trunk strategy's values.`,Example:re,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemCheckbox,
  TreeItemIndicator,
  TreeItemLabel,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const items: TreeItemData[] = [
  {
    value: "frontend",
    label: "Frontend",
    children: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
      { value: "svelte", label: "Svelte" },
    ],
  },
  {
    value: "backend",
    label: "Backend",
    children: [
      { value: "node", label: "Node" },
      {
        value: "databases",
        label: "Databases",
        children: [
          { value: "postgres", label: "Postgres" },
          { value: "sqlite", label: "SQLite" },
        ],
      },
    ],
  },
]

function Items({ items }: { items: TreeItemData[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel>
        {item.children && (
          <TreeItemIndicator>
            <ChevronRightIcon aria-hidden="true" />
          </TreeItemIndicator>
        )}
        <TreeItemCheckbox />
        {item.label}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  const log = useLog()
  return (
    <Tree
      aria-label="Stack"
      items={items}
      checkable
      mode="none"
      checkStrategy="trunk"
      defaultChecked={["react", "postgres"]}
      onCheckedChange={(checked) =>
        log(\`Checked \${checked.join(", ") || "nothing"}\`)
      }
      defaultExpanded={["frontend", "backend", "databases"]}
    >
      <Items items={items} />
    </Tree>
  )
}

export { Example }
`}]},{heading:`Links`,text:'Set `mode="none"` for a navigation tree, then render labels as links. `current` identifies the current page with `aria-current="page"`, expands its ancestors, and gives it the initial Tab stop. Update it when your route changes.',examples:[{id:`tree/links`,caption:`Choose Dialog. The current-page marker moves to it, and you stay on this docs page.`,Example:R,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"
import * as React from "react"

const pages: TreeItemData[] = [
  {
    value: "getting-started",
    label: "Getting started",
    children: [
      { value: "introduction", label: "Introduction", href: "#introduction" },
      { value: "installation", label: "Installation", href: "#installation" },
    ],
  },
  {
    value: "components",
    label: "Components",
    children: [
      { value: "accordion", label: "Accordion", href: "#accordion" },
      { value: "dialog", label: "Dialog", href: "#dialog" },
      { value: "tree", label: "Tree", href: "#tree" },
    ],
  },
  { value: "changelog", label: "Changelog", href: "#changelog" },
]

const links = new Set(
  pages
    .flatMap((page) => [page, ...(page.children ?? [])])
    .filter((page) => page.href)
    .map((page) => page.value)
)

function Items({ items }: { items: TreeItemData[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel render={item.href ? <a href={item.href} /> : undefined}>
        {item.children && (
          <TreeItemIndicator>
            <ChevronRightIcon aria-hidden="true" />
          </TreeItemIndicator>
        )}
        {item.label}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  const [current, setCurrent] = React.useState("tree")
  return (
    <Tree
      aria-label="Docs"
      items={pages}
      mode="none"
      current={current}
      onAction={(value, { event }) => {
        if (!links.has(value)) {
          return
        }
        event?.preventDefault()
        setCurrent(value)
      }}
    >
      <Items items={pages} />
    </Tree>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:"Disabled items can't be selected, checked, expanded, or run. They stay focusable so screen readers can find them. Set `focusableWhenDisabled` to `false` to skip them, or `disabled` on the root to disable the whole tree. A disabled `<fieldset>` around the tree disables it too.",examples:[{id:`tree/disabled`,caption:`Arrow through Enterprise while Focusable when disabled is on. Turn it off and the same arrow keys skip disabled items.`,Example:V,source:`"use client"

import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"
import * as React from "react"

const items: TreeItemData[] = [
  {
    value: "plans",
    label: "Plans",
    children: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise", disabled: true },
    ],
  },
  {
    value: "legacy",
    label: "Legacy plans",
    disabled: true,
    children: [{ value: "starter", label: "Starter" }],
  },
  { value: "custom", label: "Custom" },
]

function Items({ items }: { items: TreeItemData[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value} disabled={item.disabled}>
      <TreeItemLabel>
        {item.children && (
          <TreeItemIndicator>
            <ChevronRightIcon aria-hidden="true" />
          </TreeItemIndicator>
        )}
        {item.label}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  const [focusable, setFocusable] = React.useState(true)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Switch checked={focusable} onCheckedChange={setFocusable}>
            <SwitchThumb />
          </Switch>
          Focusable when disabled
        </label>
      </div>
      <Tree
        aria-label="Plans"
        items={items}
        defaultExpanded={["plans"]}
        focusableWhenDisabled={focusable}
      >
        <Items items={items} />
      </Tree>
    </div>
  )
}

export { Example }
`}]},{heading:`Loading Children`,text:"Mark an item as a `branch` before its children exist. `loadChildren` runs the first time that branch expands while empty. Load and render its children, then let the promise resolve; the tree expands the branch once they are ready.",examples:[{id:`tree/lazy`,caption:`Expand users to load its files. Archive fails on its first attempt and shows a retry icon; expand it again to load it.`,Example:K,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon, LoaderCircleIcon, RotateCwIcon } from "lucide-react"
import * as React from "react"

type Node = { value: string; label: string; branch?: boolean }

const top: Node[] = [
  { value: "users", label: "users", branch: true },
  { value: "orders", label: "orders", branch: true },
  { value: "archive", label: "archive", branch: true },
]

let archiveAsked = false
async function fetchChildren(value: string, signal: AbortSignal) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 800)
    signal.addEventListener(
      "abort",
      () => (clearTimeout(timer), reject(signal.reason))
    )
  })
  if (value === "archive" && !archiveAsked) {
    archiveAsked = true
    throw new Error("Network error")
  }
  return Array.from({ length: 3 }, (_, index) => ({
    value: \`\${value}/\${index + 1}\`,
    label: \`\${value.slice(0, -1)}_\${index + 1}.json\`,
  }))
}

function Items({
  items,
  loaded,
}: {
  items: Node[]
  loaded: Record<string, Node[]>
}) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value} branch={item.branch}>
      <TreeItemLabel>
        {item.branch && (
          <TreeItemIndicator>
            {(state) =>
              state.loading ? (
                <LoaderCircleIcon aria-hidden="true" />
              ) : state.failed ? (
                <RotateCwIcon aria-hidden="true" />
              ) : (
                <ChevronRightIcon aria-hidden="true" />
              )
            }
          </TreeItemIndicator>
        )}
        {item.label}
      </TreeItemLabel>
      {loaded[item.value] && (
        <TreeGroup>
          <Items items={loaded[item.value]} loaded={loaded} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  const [loaded, setLoaded] = React.useState<Record<string, Node[]>>({})
  return (
    <Tree
      aria-label="Database"
      loadChildren={async (value, { signal }) => {
        const children = await fetchChildren(value, signal)
        setLoaded((loaded) => ({ ...loaded, [value]: children }))
      }}
      announcement={({ type, label }) =>
        ({
          expanded: "Expanded",
          collapsed: "Collapsed",
          loading: \`Loading \${label}\`,
          "load-failed": \`\${label} didn't load. Try again.\`,
        })[type]
      }
    >
      <Items items={top} loaded={loaded} />
    </Tree>
  )
}

export { Example }
`}]},{heading:`Virtualized`,text:"Pass the full `items` hierarchy and use `visibleTreeRows(items, expanded)` to flatten the open branches. Render the nearby rows with their position; the tree supplies the correct ARIA hierarchy even though the DOM is flat.",examples:[{id:`tree/virtualized`,caption:`Expand folders or press End to focus Folder 100. The tree has 10,100 items, but only nearby rows render.`,Example:J,source:`"use client"

import {
  Tree,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  visibleTreeRows,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"
import * as React from "react"

const items: TreeItemData[] = Array.from({ length: 100 }, (_, folder) => ({
  value: \`folder-\${folder + 1}\`,
  label: \`Folder \${folder + 1}\`,
  children: Array.from({ length: 100 }, (_, file) => ({
    value: \`folder-\${folder + 1}/file-\${file + 1}\`,
    label: \`File \${file + 1}.txt\`,
  })),
}))

const row = 32
const height = 288

function Example() {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [expanded, setExpanded] = React.useState(["folder-1"])
  const rows = React.useMemo(() => visibleTreeRows(items, expanded), [expanded])
  const start = Math.max(0, Math.floor(scrollTop / row) - 4)
  const end = Math.min(rows.length, Math.ceil((scrollTop + height) / row) + 4)
  return (
    <div
      data-slot="scroll"
      ref={scroller}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <Tree
        aria-label="Archive"
        items={items}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onHighlight={(_value, { index }) => {
          const el = scroller.current
          if (!el) {
            return
          }
          const top = index * row
          if (top < el.scrollTop) {
            el.scrollTop = top
          } else if (top + row > el.scrollTop + el.clientHeight - 10) {
            el.scrollTop = top + row - el.clientHeight + 10
          }
          setScrollTop(el.scrollTop)
        }}
        style={{ height: rows.length * row }}
      >
        {rows.slice(start, end).map(({ item, index }) => (
          <TreeItem
            key={item.value}
            value={item.value}
            style={{ top: index * row }}
          >
            <TreeItemLabel>
              {item.children && (
                <TreeItemIndicator>
                  <ChevronRightIcon aria-hidden="true" />
                </TreeItemIndicator>
              )}
              {item.label}
            </TreeItemLabel>
          </TreeItem>
        ))}
      </Tree>
    </div>
  )
}

export { Example }
`}]},{heading:`Find in Page`,text:'`hiddenUntilFound` keeps collapsed groups in the DOM with `hidden="until-found"`. In browsers that support it, Find in Page can match a hidden item and open its ancestors. Use `keepMounted` when you only need collapsed content to stay mounted, without browser search.',examples:[{id:`tree/find-in-page`,caption:`Use your browser's Find command to look for Phobos, a moon of Mars. The matching branches open to reveal it.`,Example:ie,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"

const items: TreeItemData[] = [
  {
    value: "planets",
    label: "Planets",
    children: [
      { value: "mercury", label: "Mercury" },
      { value: "venus", label: "Venus" },
      {
        value: "earth",
        label: "Earth",
        children: [{ value: "moon", label: "The Moon" }],
      },
      {
        value: "mars",
        label: "Mars",
        children: [
          { value: "phobos", label: "Phobos" },
          { value: "deimos", label: "Deimos" },
        ],
      },
    ],
  },
  {
    value: "dwarf-planets",
    label: "Dwarf planets",
    children: [
      { value: "ceres", label: "Ceres" },
      {
        value: "pluto",
        label: "Pluto",
        children: [{ value: "charon", label: "Charon" }],
      },
    ],
  },
]

function Items({ items }: { items: TreeItemData[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel>
        {item.children && (
          <TreeItemIndicator>
            <ChevronRightIcon aria-hidden="true" />
          </TreeItemIndicator>
        )}
        {item.label}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  return (
    <Tree aria-label="Solar system" items={items} hiddenUntilFound>
      <Items items={items} />
    </Tree>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"A `createTreeController()` instance can expand or collapse branches, change selection and checkboxes, or focus an item. `reveal(value)` opens an item's ancestors, scrolls it into view, and focuses it. Supply the hierarchy through `items`, as this example does, or keep collapsed groups mounted so their descendants are known. See Controllers for setup and lifecycle.",examples:[{id:`tree/controller`,caption:`Press Find Two-Factor to open Account and Security, then select and focus Two-factor authentication. Collapse All closes every branch.`,Example:ae,source:`"use client"

import {
  createTreeController,
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"
import * as React from "react"

const sections: TreeItemData[] = [
  {
    value: "account",
    label: "Account",
    children: [
      { value: "profile", label: "Profile" },
      {
        value: "security",
        label: "Security",
        children: [
          { value: "password", label: "Password" },
          { value: "two-factor", label: "Two-factor authentication" },
        ],
      },
    ],
  },
  {
    value: "workspace",
    label: "Workspace",
    children: [
      { value: "members", label: "Members" },
      { value: "billing", label: "Billing" },
    ],
  },
]

function Items({ items }: { items: TreeItemData[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel>
        {item.children && (
          <TreeItemIndicator>
            <ChevronRightIcon aria-hidden="true" />
          </TreeItemIndicator>
        )}
        {item.label}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  const [settings] = React.useState(() => createTreeController())
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => settings.expandAll()}>
          Expand All
        </button>
        <button type="button" onClick={() => settings.collapseAll()}>
          Collapse All
        </button>
        <button
          type="button"
          onClick={() => {
            settings.setValue("two-factor")
            settings.reveal("two-factor")
          }}
        >
          Find Two-Factor
        </button>
      </div>
      <Tree aria-label="Settings" items={sections} controller={settings}>
        <Items items={sections} />
      </Tree>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`tree/rtl`,caption:``,Example:se,source:`"use client"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
} from "@ui-sdk/react/tree"
import { ChevronRightIcon } from "lucide-react"

type Node = { value: string; label: string; children?: Node[] }

const folders: Node[] = [
  {
    value: "documents",
    label: "المستندات",
    children: [
      { value: "reports", label: "التقارير" },
      { value: "invoices", label: "الفواتير" },
    ],
  },
  {
    value: "photos",
    label: "الصور",
    children: [
      { value: "trips", label: "الرحلات" },
      { value: "family", label: "العائلة" },
    ],
  },
  { value: "downloads", label: "التنزيلات" },
]

function Items({ items }: { items: Node[] }) {
  return items.map((item) => (
    <TreeItem key={item.value} value={item.value}>
      <TreeItemLabel>
        {item.children && (
          <TreeItemIndicator>
            <ChevronRightIcon aria-hidden="true" />
          </TreeItemIndicator>
        )}
        {item.label}
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <Items items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

function Example() {
  return (
    <div dir="rtl">
      <Tree aria-label="الملفات" defaultExpanded={["documents"]}>
        <Items items={folders} />
      </Tree>
    </div>
  )
}

export { Example }
`}]}]};export{ce as default};