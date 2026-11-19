import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-WfjOen3K.js";import{t as n}from"../chunks/c-CU-88Fi-.js";import{t as r}from"../chunks/c-C6DDKR93.js";import{t as i}from"../chunks/c-BwdqlraN.js";import{t as a}from"../chunks/c-BnWal148.js";import{t as o}from"../chunks/c-b3fuBy5S.js";import{t as s}from"../chunks/c-GkCruRXY.js";import{t as c}from"../chunks/c-DLR1Qq0Q.js";import{t as l}from"../chunks/c-DLl0Awjp.js";import{t as u}from"../chunks/c-BWO92vTp.js";import{t as d}from"../chunks/c-CiOBso80.js";import{useLog as f}from"./log.js";import{Menu as p,MenuCheckboxItem as m,MenuContent as h,MenuContextTrigger as g,MenuGroup as _,MenuGroupLabel as v,MenuItem as y,MenuItemIcon as b,MenuItemIndicator as x,MenuRadioGroup as S,MenuRadioItem as C,MenuSeparator as w,MenuSub as T,MenuSubContent as E,MenuSubTrigger as D,MenuTrigger as O,createMenuController as k}from"ui-sdk/menu.js";import*as A from"preact/compat";import{Fragment as j,jsx as M,jsxs as N}from"preact/compat/jsx-runtime";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const P={name:`download`,size:24,node:[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]};P.node;const F=e(P);function I(){let e=f();return/* @__PURE__ */ N(p,{onAction:t=>e(`Chose ${t}`),children:[/* @__PURE__ */ M(O,{children:`Open Menu`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ N(_,{children:[/* @__PURE__ */ M(v,{children:`Project`}),/* @__PURE__ */ M(y,{value:`overview`,children:`Overview`}),/* @__PURE__ */ M(y,{value:`members`,children:`Members`}),/* @__PURE__ */ M(y,{value:`settings`,children:`Settings`})]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(_,{children:[/* @__PURE__ */ M(v,{children:`Help`}),/* @__PURE__ */ M(y,{value:`docs`,children:`Documentation`}),/* @__PURE__ */ M(y,{value:`feedback`,children:`Send feedback`})]})]})]})}function L(){let e=f();return/* @__PURE__ */ N(p,{onAction:t=>e(`Chose ${t}`),children:[/* @__PURE__ */ M(O,{children:`Edit`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ M(y,{value:`undo`,shortcut:`mod+z`,children:`Undo`}),/* @__PURE__ */ M(y,{value:`redo`,shortcut:`mod+shift+z`,children:`Redo`}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(T,{children:[/* @__PURE__ */ N(D,{children:[`Find`,/* @__PURE__ */ M(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ N(E,{children:[/* @__PURE__ */ M(y,{value:`find`,shortcut:`mod+f`,children:`Find…`}),/* @__PURE__ */ M(y,{value:`find-next`,shortcut:`mod+g`,children:`Find next`}),/* @__PURE__ */ M(y,{value:`find-previous`,shortcut:`mod+shift+g`,children:`Find previous`})]})]}),/* @__PURE__ */ N(T,{children:[/* @__PURE__ */ N(D,{children:[`Transform`,/* @__PURE__ */ M(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ N(E,{children:[/* @__PURE__ */ N(T,{children:[/* @__PURE__ */ N(D,{children:[`Case`,/* @__PURE__ */ M(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ N(E,{children:[/* @__PURE__ */ M(y,{value:`uppercase`,children:`Uppercase`}),/* @__PURE__ */ M(y,{value:`lowercase`,children:`Lowercase`})]})]}),/* @__PURE__ */ M(y,{value:`trim`,children:`Trim whitespace`})]})]})]})]})}function R(){let e=f();return/* @__PURE__ */ N(p,{onAction:t=>e(`Chose ${t}`),children:[/* @__PURE__ */ M(O,{children:`File`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ M(y,{value:`new-tab`,shortcut:`mod+t`,children:`New tab`}),/* @__PURE__ */ M(y,{value:`new-window`,shortcut:`mod+n`,children:`New window`}),/* @__PURE__ */ M(y,{value:`open`,shortcut:`mod+o`,children:`Open…`}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ M(y,{value:`save`,shortcut:`mod+s`,children:`Save`}),/* @__PURE__ */ M(y,{value:`save-as`,shortcut:`mod+shift+s`,children:`Save as…`}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ M(y,{value:`print`,shortcut:`mod+p`,children:`Print…`})]})]})}function z(){let e=f();return/* @__PURE__ */ N(p,{onAction:t=>e(`Chose ${t}`),children:[/* @__PURE__ */ N(O,{children:[/* @__PURE__ */ M(u,{}),`Share`]}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ N(y,{value:`copy-link`,children:[/* @__PURE__ */ M(b,{children:/* @__PURE__ */ M(s,{})}),`Copy link`]}),/* @__PURE__ */ N(y,{value:`email`,children:[/* @__PURE__ */ M(b,{children:/* @__PURE__ */ M(c,{})}),`Email`]}),/* @__PURE__ */ N(y,{value:`reply`,children:[/* @__PURE__ */ M(b,{mirror:!0,children:/* @__PURE__ */ M(l,{})}),`Reply`]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(y,{value:`download`,children:[/* @__PURE__ */ M(b,{children:/* @__PURE__ */ M(F,{})}),`Download`]}),/* @__PURE__ */ N(y,{value:`embed`,children:[/* @__PURE__ */ M(b,{children:/* @__PURE__ */ M(r,{})}),`Embed`]})]})]})}function B(){let e=f();return/* @__PURE__ */ N(p,{onCheckedChange:(t,n)=>e(`${n.value} ${t?`on`:`off`}`),children:[/* @__PURE__ */ M(O,{children:`View`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ N(_,{children:[/* @__PURE__ */ M(v,{children:`Appearance`}),/* @__PURE__ */ N(m,{value:`status-bar`,defaultChecked:!0,children:[/* @__PURE__ */ M(x,{keepMounted:!0,children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`Status bar`]}),/* @__PURE__ */ N(m,{value:`minimap`,children:[/* @__PURE__ */ M(x,{keepMounted:!0,children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`Minimap`]})]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(m,{value:`line-numbers`,defaultChecked:!0,children:[/* @__PURE__ */ M(x,{keepMounted:!0,children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`Line numbers`]}),/* @__PURE__ */ N(m,{value:`word-wrap`,children:[/* @__PURE__ */ M(x,{keepMounted:!0,children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`Word wrap`]})]})]})}function V(){let e=f();return/* @__PURE__ */ N(p,{children:[/* @__PURE__ */ M(O,{children:`Panel`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ N(S,{name:`position`,defaultValue:`bottom`,onValueChange:t=>e(`Panel at the ${t}`),children:[/* @__PURE__ */ M(v,{children:`Position`}),[`Top`,`Bottom`,`Right`].map(e=>/* @__PURE__ */ N(C,{value:e.toLowerCase(),children:[/* @__PURE__ */ M(x,{}),e]},e))]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(S,{defaultValue:`comfortable`,onValueChange:t=>e(`${t} density`),children:[/* @__PURE__ */ M(v,{children:`Density`}),[`Compact`,`Comfortable`].map(e=>/* @__PURE__ */ N(C,{value:e.toLowerCase(),children:[/* @__PURE__ */ M(x,{}),e]},e))]})]})]})}function H(){let e=f();return/* @__PURE__ */ N(p,{onAction:t=>e(`Chose ${t}`),children:[/* @__PURE__ */ M(g,{tabIndex:0,children:`Right-click or long-press here`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ M(y,{value:`back`,children:`Back`}),/* @__PURE__ */ M(y,{value:`forward`,disabled:!0,children:`Forward`}),/* @__PURE__ */ M(y,{value:`reload`,children:`Reload`}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ M(y,{value:`save`,children:`Save page as…`}),/* @__PURE__ */ M(y,{value:`print`,children:`Print…`})]})]})}function U(){let e=f();return/* @__PURE__ */ N(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ N(p,{onAction:t=>e(`Chose ${t}`),children:[/* @__PURE__ */ M(O,{children:`Document`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ M(y,{value:`undo`,shortcut:`mod+z`,disabled:!0,children:`Undo`}),/* @__PURE__ */ M(y,{value:`redo`,shortcut:`mod+shift+z`,children:`Redo`}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(m,{value:`autosave`,defaultChecked:!0,disabled:!0,children:[/* @__PURE__ */ M(x,{children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`Autosave`]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(S,{defaultValue:`pdf`,children:[/* @__PURE__ */ M(v,{children:`Export as`}),/* @__PURE__ */ N(C,{value:`pdf`,children:[/* @__PURE__ */ M(x,{children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`PDF`]}),/* @__PURE__ */ N(C,{value:`docx`,disabled:!0,children:[/* @__PURE__ */ M(x,{children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`Word`]}),/* @__PURE__ */ N(C,{value:`markdown`,children:[/* @__PURE__ */ M(x,{children:/* @__PURE__ */ M(t,{"aria-hidden":`true`})}),`Markdown`]})]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(T,{children:[/* @__PURE__ */ N(D,{disabled:!0,children:[`Move to`,/* @__PURE__ */ M(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ M(E,{children:/* @__PURE__ */ M(y,{children:`Archive`})})]})]})]}),/* @__PURE__ */ N(p,{children:[/* @__PURE__ */ M(O,{disabled:!0,children:`Locked`}),/* @__PURE__ */ M(h,{children:/* @__PURE__ */ M(y,{children:`Unlock`})})]})]})}function W(){let e=f();return/* @__PURE__ */ N(p,{onOpenChange:t=>e(t?`Opening`:`Closing`),onOpenChangeComplete:t=>e(t?`Finished opening`:`Finished closing`),children:[/* @__PURE__ */ M(O,{children:`Animated`}),/* @__PURE__ */ N(h,{keepMounted:!0,children:[/* @__PURE__ */ M(y,{children:`Back`}),/* @__PURE__ */ M(y,{children:`Forward`}),/* @__PURE__ */ M(y,{children:`Reload`}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(T,{children:[/* @__PURE__ */ N(D,{children:[`More tools`,/* @__PURE__ */ M(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ N(E,{children:[/* @__PURE__ */ M(y,{children:`Save page as…`}),/* @__PURE__ */ M(y,{children:`Developer tools`})]})]})]})]})}function G(){let e=f();return/* @__PURE__ */ N(p,{presentation:`sheet`,onAction:t=>e(`Chose ${t}`),children:[/* @__PURE__ */ M(O,{children:`Options`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ N(y,{value:`share`,children:[/* @__PURE__ */ M(u,{}),`Share`]}),/* @__PURE__ */ N(y,{value:`copy-link`,children:[/* @__PURE__ */ M(s,{}),`Copy link`]}),/* @__PURE__ */ N(T,{children:[/* @__PURE__ */ N(D,{children:[/* @__PURE__ */ M(F,{}),`Move to`,/* @__PURE__ */ M(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ N(E,{children:[/* @__PURE__ */ M(y,{value:`inbox`,children:`Inbox`}),/* @__PURE__ */ M(y,{value:`archive`,children:`Archive`})]})]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(y,{value:`delete`,destructive:!0,children:[/* @__PURE__ */ M(d,{"aria-hidden":`true`}),`Delete`]})]})]})}const K=[{name:`Roadmap.pdf`,size:`2.4 MB`},{name:`Budget.xlsx`,size:`860 KB`},{name:`Team photo.jpg`,size:`5.1 MB`}];function q(){let[e]=A.useState(()=>k()),t=f();return/* @__PURE__ */ N(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ M(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ N(`button`,{onClick:async n=>{let r=await e.open({payload:K[0],anchor:n.currentTarget});t(`Closed with ${r.reason}`)},children:[`Open `,K[0].name,` Actions`]})}),/* @__PURE__ */ M(`ul`,{"data-slot":`list`,children:K.map(t=>/* @__PURE__ */ N(`li`,{"data-slot":`row`,children:[t.name,/* @__PURE__ */ M(`span`,{"data-slot":`hint`,children:t.size}),/* @__PURE__ */ M(O,{controller:e,payload:t,"aria-label":`Actions for ${t.name}`,"data-variant":`ghost`,"data-size":`sm`,children:/* @__PURE__ */ M(i,{"aria-hidden":`true`})})]},t.name))}),/* @__PURE__ */ M(p,{controller:e,onAction:n=>t(`${n} ${e.getPayload()?.name}`),children:/* @__PURE__ */ M(h,{align:`end`,children:e=>/* @__PURE__ */ N(j,{children:[/* @__PURE__ */ N(_,{children:[/* @__PURE__ */ M(v,{children:e.payload?.name}),/* @__PURE__ */ M(y,{value:`open`,children:`Open`}),/* @__PURE__ */ M(y,{value:`rename`,children:`Rename`}),/* @__PURE__ */ M(y,{value:`duplicate`,children:`Duplicate`})]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ M(y,{value:`delete`,children:`Delete`})]})})})]})}function J(){let[e,t]=A.useState(``);return/* @__PURE__ */ N(`div`,{dir:`rtl`,"data-slot":`stack`,children:[/* @__PURE__ */ N(p,{onAction:t,children:[/* @__PURE__ */ M(O,{children:`ملف`}),/* @__PURE__ */ N(h,{children:[/* @__PURE__ */ N(y,{value:`new`,shortcut:`mod+n`,children:[/* @__PURE__ */ M(a,{}),`جديد`]}),/* @__PURE__ */ N(y,{value:`open`,shortcut:`mod+o`,children:[/* @__PURE__ */ M(o,{}),`فتح…`]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(T,{children:[/* @__PURE__ */ N(D,{children:[/* @__PURE__ */ M(u,{}),`مشاركة`,/* @__PURE__ */ M(n,{})]}),/* @__PURE__ */ N(E,{children:[/* @__PURE__ */ N(y,{value:`email`,children:[/* @__PURE__ */ M(c,{}),`البريد الإلكتروني`]}),/* @__PURE__ */ N(y,{value:`copy-link`,children:[/* @__PURE__ */ M(s,{}),`نسخ الرابط`]})]})]}),/* @__PURE__ */ M(w,{}),/* @__PURE__ */ N(y,{value:`delete`,children:[/* @__PURE__ */ M(d,{}),`حذف`]})]})]}),/* @__PURE__ */ M(`output`,{"data-slot":`output`,children:e?`نُفّذ: ${e}`:`اختر عنصرًا`})]})}var Y={name:`menu`,title:`Menu`,description:`Choose actions and settings from a button or a context menu.`,sections:[{heading:null,text:`Start with a trigger and a few actions. Add groups, checkboxes, radio choices, or submenus as the task grows. The menu handles focus, arrow keys, typeahead, and dismissal.`,examples:[{id:`menu/basic`,caption:`Press Open Menu and choose an item, with the pointer or the arrow keys and Enter. The menu closes and the console logs your choice.`,Example:I,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu onAction={(value) => log(\`Chose \${value}\`)}>
      <MenuTrigger>Open Menu</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Project</MenuGroupLabel>
          <MenuItem value="overview">Overview</MenuItem>
          <MenuItem value="members">Members</MenuItem>
          <MenuItem value="settings">Settings</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Help</MenuGroupLabel>
          <MenuItem value="docs">Documentation</MenuItem>
          <MenuItem value="feedback">Send feedback</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Submenus`,text:`Nest a Sub, SubTrigger, and SubContent to add another level. Hover or press the arrow key toward a submenu to open it. The menu lets a pointer travel diagonally into the submenu without accidentally choosing an item it passes over. Escape closes only the submenu and returns focus to its trigger, as the menu pattern asks.`,examples:[{id:`menu/submenu`,caption:`Open Edit, then Find or Transform. Use the arrows to enter and leave each level; choosing an action closes the menu tree.`,Example:L,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu onAction={(value) => log(\`Chose \${value}\`)}>
      <MenuTrigger>Edit</MenuTrigger>
      <MenuContent>
        <MenuItem value="undo" shortcut="mod+z">
          Undo
        </MenuItem>
        <MenuItem value="redo" shortcut="mod+shift+z">
          Redo
        </MenuItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>
            Find
            <ChevronRightIcon aria-hidden="true" />
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem value="find" shortcut="mod+f">
              Find…
            </MenuItem>
            <MenuItem value="find-next" shortcut="mod+g">
              Find next
            </MenuItem>
            <MenuItem value="find-previous" shortcut="mod+shift+g">
              Find previous
            </MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>
            Transform
            <ChevronRightIcon aria-hidden="true" />
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuSub>
              <MenuSubTrigger>
                Case
                <ChevronRightIcon aria-hidden="true" />
              </MenuSubTrigger>
              <MenuSubContent>
                <MenuItem value="uppercase">Uppercase</MenuItem>
                <MenuItem value="lowercase">Lowercase</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuItem value="trim">Trim whitespace</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Shortcuts`,text:"An item’s `shortcut` displays a platform-specific hint and sets `aria-keyshortcuts`. `mod+s` reads as Command+S on Apple platforms and Control+S elsewhere.",examples:[{id:`menu/shortcuts`,caption:`Open File to see shortcut hints for your platform. Choose an item to report its action; this markup example does not register global shortcuts.`,Example:R,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu onAction={(value) => log(\`Chose \${value}\`)}>
      <MenuTrigger>File</MenuTrigger>
      <MenuContent>
        <MenuItem value="new-tab" shortcut="mod+t">
          New tab
        </MenuItem>
        <MenuItem value="new-window" shortcut="mod+n">
          New window
        </MenuItem>
        <MenuItem value="open" shortcut="mod+o">
          Open…
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="save" shortcut="mod+s">
          Save
        </MenuItem>
        <MenuItem value="save-as" shortcut="mod+shift+s">
          Save as…
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="print" shortcut="mod+p">
          Print…
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Icons`,text:"Put decorative icons in ItemIcon so screen readers and typeahead ignore them. `mirror` flips a directional icon in right-to-left text. An icon-only item still needs an `aria-label`.",examples:[{id:`menu/icons`,caption:`Open Share and type an item’s name. The icons aren’t part of the item’s accessible name or the text typeahead matches.`,Example:z,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemIcon,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import {
  CodeIcon,
  DownloadIcon,
  LinkIcon,
  MailIcon,
  ReplyIcon,
  ShareIcon,
} from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu onAction={(value) => log(\`Chose \${value}\`)}>
      <MenuTrigger>
        <ShareIcon />
        Share
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="copy-link">
          <MenuItemIcon>
            <LinkIcon />
          </MenuItemIcon>
          Copy link
        </MenuItem>
        <MenuItem value="email">
          <MenuItemIcon>
            <MailIcon />
          </MenuItemIcon>
          Email
        </MenuItem>
        <MenuItem value="reply">
          <MenuItemIcon mirror>
            <ReplyIcon />
          </MenuItemIcon>
          Reply
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="download">
          <MenuItemIcon>
            <DownloadIcon />
          </MenuItemIcon>
          Download
        </MenuItem>
        <MenuItem value="embed">
          <MenuItemIcon>
            <CodeIcon />
          </MenuItemIcon>
          Embed
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Checkboxes`,text:"Checkbox items toggle independently and stay open by default. Use `checked` with `onCheckedChange`, or `defaultChecked` for an uncontrolled item. An ItemIndicator renders the check; `keepMounted` preserves its space while unchecked. Style `data-checked` and `data-unchecked` for each state.",examples:[{id:`menu/checkboxes`,caption:`Open View and toggle Status bar or Minimap. The menu stays open so you can change several settings, and the console logs each one.`,Example:B,source:`"use client"

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItemIndicator,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { CheckIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu
      onCheckedChange={(checked, details) =>
        log(\`\${details.value} \${checked ? "on" : "off"}\`)
      }
    >
      <MenuTrigger>View</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Appearance</MenuGroupLabel>
          <MenuCheckboxItem value="status-bar" defaultChecked>
            <MenuItemIndicator keepMounted>
              <CheckIcon aria-hidden="true" />
            </MenuItemIndicator>
            Status bar
          </MenuCheckboxItem>
          <MenuCheckboxItem value="minimap">
            <MenuItemIndicator keepMounted>
              <CheckIcon aria-hidden="true" />
            </MenuItemIndicator>
            Minimap
          </MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuCheckboxItem value="line-numbers" defaultChecked>
          <MenuItemIndicator keepMounted>
            <CheckIcon aria-hidden="true" />
          </MenuItemIndicator>
          Line numbers
        </MenuCheckboxItem>
        <MenuCheckboxItem value="word-wrap">
          <MenuItemIndicator keepMounted>
            <CheckIcon aria-hidden="true" />
          </MenuItemIndicator>
          Word wrap
        </MenuCheckboxItem>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Radio Group`,text:"Radio items choose one value in their group and stay open by default. Use `value` with `onValueChange`, or `defaultValue` for an uncontrolled group. Give the group a `name` when it should identify itself in the menu’s value-change callback.",examples:[{id:`menu/radio-group`,caption:`Open Panel and choose a position. Only one item in each group is checked, the menu stays open, and the console logs the change.`,Example:V,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuGroupLabel,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu>
      <MenuTrigger>Panel</MenuTrigger>
      <MenuContent>
        <MenuRadioGroup
          name="position"
          defaultValue="bottom"
          onValueChange={(value) => log(\`Panel at the \${value}\`)}
        >
          <MenuGroupLabel>Position</MenuGroupLabel>
          {["Top", "Bottom", "Right"].map((option) => (
            <MenuRadioItem key={option} value={option.toLowerCase()}>
              <MenuItemIndicator />
              {option}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        <MenuSeparator />
        <MenuRadioGroup
          defaultValue="comfortable"
          onValueChange={(value) => log(\`\${value} density\`)}
        >
          <MenuGroupLabel>Density</MenuGroupLabel>
          {["Compact", "Comfortable"].map((option) => (
            <MenuRadioItem key={option} value={option.toLowerCase()}>
              <MenuItemIndicator />
              {option}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Context Menu`,text:`A ContextTrigger opens at a right-click or long press. Give the area a tab stop so Shift+F10 and the context-menu key can open it from the keyboard. Right-clicking elsewhere in the same area repositions an open menu.`,examples:[{id:`menu/context-menu`,caption:`Right-click or long-press the area, or focus it and press Shift+F10. Choose an action and the console logs it.`,Example:H,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuSeparator,
} from "@ui-sdk/react/menu"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu onAction={(value) => log(\`Chose \${value}\`)}>
      <MenuContextTrigger tabIndex={0}>
        Right-click or long-press here
      </MenuContextTrigger>
      <MenuContent>
        <MenuItem value="back">Back</MenuItem>
        <MenuItem value="forward" disabled>
          Forward
        </MenuItem>
        <MenuItem value="reload">Reload</MenuItem>
        <MenuSeparator />
        <MenuItem value="save">Save page as…</MenuItem>
        <MenuItem value="print">Print…</MenuItem>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Disabled Items`,text:"Disabled items remain focusable so people can discover them, but cannot run or open a submenu. A disabled Trigger is a native disabled button and cannot receive focus. Add `focusableWhenDisabled` to keep it in the tab order, so it can host a tooltip that says why; presses still do nothing.",examples:[{id:`menu/disabled`,caption:`Open Document and move through its items with the arrow keys. Disabled actions remain discoverable but cannot run; Locked cannot open a menu.`,Example:U,source:`"use client"

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <div data-slot="row">
      <Menu onAction={(value) => log(\`Chose \${value}\`)}>
        <MenuTrigger>Document</MenuTrigger>
        <MenuContent>
          <MenuItem value="undo" shortcut="mod+z" disabled>
            Undo
          </MenuItem>
          <MenuItem value="redo" shortcut="mod+shift+z">
            Redo
          </MenuItem>
          <MenuSeparator />
          <MenuCheckboxItem value="autosave" defaultChecked disabled>
            <MenuItemIndicator>
              <CheckIcon aria-hidden="true" />
            </MenuItemIndicator>
            Autosave
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuRadioGroup defaultValue="pdf">
            <MenuGroupLabel>Export as</MenuGroupLabel>
            <MenuRadioItem value="pdf">
              <MenuItemIndicator>
                <CheckIcon aria-hidden="true" />
              </MenuItemIndicator>
              PDF
            </MenuRadioItem>
            <MenuRadioItem value="docx" disabled>
              <MenuItemIndicator>
                <CheckIcon aria-hidden="true" />
              </MenuItemIndicator>
              Word
            </MenuRadioItem>
            <MenuRadioItem value="markdown">
              <MenuItemIndicator>
                <CheckIcon aria-hidden="true" />
              </MenuItemIndicator>
              Markdown
            </MenuRadioItem>
          </MenuRadioGroup>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger disabled>
              Move to
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Archive</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger disabled>Locked</MenuTrigger>
        <MenuContent>
          <MenuItem>Unlock</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The menu stays mounted through an exit animation. `data-starting-style`, `data-ending-style`, `data-side`, and `--transform-origin` describe the transition. `keepMounted` leaves the closed content hidden afterward; `onOpenChangeComplete` reports when it finishes.",examples:[{id:`menu/animation`,caption:`Open Animated, then its More tools submenu, and close them. The console logs Opening or Closing, then when the animation finishes.`,Example:W,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu
      onOpenChange={(open) => log(open ? "Opening" : "Closing")}
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <MenuTrigger>Animated</MenuTrigger>
      <MenuContent keepMounted>
        <MenuItem>Back</MenuItem>
        <MenuItem>Forward</MenuItem>
        <MenuItem>Reload</MenuItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>
            More tools
            <ChevronRightIcon aria-hidden="true" />
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Save page as…</MenuItem>
            <MenuItem>Developer tools</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Presentation`,text:'`presentation="auto"` uses a sheet on small touch screens and a popover elsewhere; `"sheet"` always requests a sheet. The sheet keeps menu roles and keys. Submenus replace the current level, and Escape or the arrow toward the parent goes back. Context menus and menus in a menubar remain popovers.',examples:[{id:`menu/presentation`,caption:`Open Options as a sheet, enter Move to, then go back or choose a destination. You can drag downward to dismiss the sheet.`,Example:G,source:`"use client"

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import {
  ChevronRightIcon,
  DownloadIcon,
  LinkIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Menu presentation="sheet" onAction={(value) => log(\`Chose \${value}\`)}>
      <MenuTrigger>Options</MenuTrigger>
      <MenuContent>
        <MenuItem value="share">
          <ShareIcon />
          Share
        </MenuItem>
        <MenuItem value="copy-link">
          <LinkIcon />
          Copy link
        </MenuItem>
        <MenuSub>
          <MenuSubTrigger>
            <DownloadIcon />
            Move to
            <ChevronRightIcon aria-hidden="true" />
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem value="inbox">Inbox</MenuItem>
            <MenuItem value="archive">Archive</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem value="delete" destructive>
          <TrashIcon aria-hidden="true" />
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

export { Example }
`}]},{heading:`Triggers Outside the Menu`,text:"Connect external triggers and one menu to a `createMenuController<File>()`. Each trigger passes its row as `payload`, which the content reads from its state. Only the active trigger is expanded and receives focus back. Code can also open with a `payload` and `anchor`; the Promise resolves when the menu closes.",examples:[{id:`menu/payload`,caption:`Open the actions for different files. One menu shows the active row; opening from code uses the same payload and reports the closing reason.`,Example:q,source:`"use client"

import * as React from "react"
import {
  createMenuController,
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { EllipsisIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

type File = { name: string; size: string }

const files: File[] = [
  { name: "Roadmap.pdf", size: "2.4 MB" },
  { name: "Budget.xlsx", size: "860 KB" },
  { name: "Team photo.jpg", size: "5.1 MB" },
]

function Example() {
  const [menu] = React.useState(() => createMenuController<File>())
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          onClick={async (event) => {
            const result = await menu.open({
              payload: files[0],
              anchor: event.currentTarget,
            })
            log(\`Closed with \${result.reason}\`)
          }}
        >
          Open {files[0].name} Actions
        </button>
      </div>
      <ul data-slot="list">
        {files.map((file) => (
          <li key={file.name} data-slot="row">
            {file.name}
            <span data-slot="hint">{file.size}</span>
            <MenuTrigger
              controller={menu}
              payload={file}
              aria-label={\`Actions for \${file.name}\`}
              data-variant="ghost"
              data-size="sm"
            >
              <EllipsisIcon aria-hidden="true" />
            </MenuTrigger>
          </li>
        ))}
      </ul>
      <Menu
        controller={menu}
        onAction={(action) => log(\`\${action} \${menu.getPayload()?.name}\`)}
      >
        <MenuContent<File> align="end">
          {(state) => (
            <>
              <MenuGroup>
                <MenuGroupLabel>{state.payload?.name}</MenuGroupLabel>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="rename">Rename</MenuItem>
                <MenuItem value="duplicate">Duplicate</MenuItem>
              </MenuGroup>
              <MenuSeparator />
              <MenuItem value="delete">Delete</MenuItem>
            </>
          )}
        </MenuContent>
      </Menu>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`menu/rtl`,caption:``,Example:J,source:`import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  LinkIcon,
  MailIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react"
import * as React from "react"

export function Example() {
  const [action, setAction] = React.useState("")

  return (
    <div dir="rtl" data-slot="stack">
      <Menu onAction={setAction}>
        <MenuTrigger>ملف</MenuTrigger>
        <MenuContent>
          <MenuItem value="new" shortcut="mod+n">
            <FileIcon />
            جديد
          </MenuItem>
          <MenuItem value="open" shortcut="mod+o">
            <FolderIcon />
            فتح…
          </MenuItem>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger>
              <ShareIcon />
              مشاركة
              <ChevronRightIcon />
            </MenuSubTrigger>
            <MenuSubContent>
              <MenuItem value="email">
                <MailIcon />
                البريد الإلكتروني
              </MenuItem>
              <MenuItem value="copy-link">
                <LinkIcon />
                نسخ الرابط
              </MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuItem value="delete">
            <TrashIcon />
            حذف
          </MenuItem>
        </MenuContent>
      </Menu>
      <output data-slot="output">
        {action ? \`نُفّذ: \${action}\` : "اختر عنصرًا"}
      </output>
    </div>
  )
}
`}]}]};export{Y as default};