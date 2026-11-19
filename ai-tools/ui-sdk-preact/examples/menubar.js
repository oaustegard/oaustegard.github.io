import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-CU-88Fi-.js";import{t as n}from"../chunks/c-D7ZpXmBq.js";import{t as r}from"../chunks/c-BnWal148.js";import{t as i}from"../chunks/c-b3fuBy5S.js";import{n as a,t as o}from"../chunks/c-CdF4Sfnd.js";import{t as s}from"../chunks/c-ByJeGwM8.js";import{t as c}from"../chunks/c-B_nFDu0k.js";import{t as l}from"../chunks/c-CiOBso80.js";import{useLog as u}from"./log.js";import{Menubar as d}from"ui-sdk/menubar.js";import{Menu as f,MenuCheckboxItem as p,MenuContent as m,MenuGroupLabel as h,MenuItem as g,MenuItemIcon as _,MenuItemIndicator as v,MenuRadioGroup as y,MenuRadioItem as b,MenuSeparator as x,MenuSub as S,MenuSubContent as C,MenuSubTrigger as w,MenuTrigger as T}from"ui-sdk/menu.js";import*as E from"preact/compat";import{jsx as D,jsxs as O}from"preact/compat/jsx-runtime";const k=[`Q3 roadmap`,`Launch checklist`,`Offsite notes`],A=[`PDF`,`Markdown`,`HTML`],j=[`Light`,`Dark`,`System`];function M(){let n=u(),r=e=>n(`Chose ${e}`);return/* @__PURE__ */ O(d,{children:[/* @__PURE__ */ O(f,{onAction:r,children:[/* @__PURE__ */ D(T,{children:`File`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ D(g,{value:`New document`,shortcut:`mod+n`,children:`New Document`}),/* @__PURE__ */ D(g,{value:`Open`,shortcut:`mod+o`,children:`Open…`}),/* @__PURE__ */ O(S,{children:[/* @__PURE__ */ O(w,{children:[`Open Recent`,/* @__PURE__ */ D(t,{"aria-hidden":`true`})]}),/* @__PURE__ */ D(C,{children:k.map(e=>/* @__PURE__ */ D(g,{value:e,children:e},e))})]}),/* @__PURE__ */ D(x,{}),/* @__PURE__ */ O(S,{children:[/* @__PURE__ */ O(w,{children:[`Export`,/* @__PURE__ */ D(t,{"aria-hidden":`true`})]}),/* @__PURE__ */ D(C,{children:A.map(e=>/* @__PURE__ */ D(g,{value:`Export as ${e}`,children:e},e))})]}),/* @__PURE__ */ D(g,{value:`Print`,shortcut:`mod+p`,children:`Print…`})]})]}),/* @__PURE__ */ O(f,{onAction:r,children:[/* @__PURE__ */ D(T,{children:`Edit`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ D(g,{value:`Undo`,shortcut:`mod+z`,disabled:!0,children:`Undo`}),/* @__PURE__ */ D(g,{value:`Redo`,shortcut:`mod+shift+z`,children:`Redo`}),/* @__PURE__ */ D(x,{}),/* @__PURE__ */ D(g,{value:`Cut`,shortcut:`mod+x`,children:`Cut`}),/* @__PURE__ */ D(g,{value:`Copy`,shortcut:`mod+c`,children:`Copy`}),/* @__PURE__ */ D(g,{value:`Paste`,shortcut:`mod+v`,children:`Paste`}),/* @__PURE__ */ D(x,{}),/* @__PURE__ */ D(g,{value:`Find`,shortcut:`mod+f`,children:`Find…`})]})]}),/* @__PURE__ */ O(f,{onCheckedChange:(e,t)=>n(`${t.value} ${e?`on`:`off`}`),onValueChange:e=>n(`${e} appearance`),children:[/* @__PURE__ */ D(T,{children:`View`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ O(p,{value:`Ruler`,children:[/* @__PURE__ */ D(v,{children:/* @__PURE__ */ D(e,{"aria-hidden":`true`})}),`Show Ruler`]}),/* @__PURE__ */ O(p,{value:`Word count`,defaultChecked:!0,children:[/* @__PURE__ */ D(v,{children:/* @__PURE__ */ D(e,{"aria-hidden":`true`})}),`Show Word Count`]}),/* @__PURE__ */ D(x,{}),/* @__PURE__ */ O(y,{defaultValue:`System`,children:[/* @__PURE__ */ D(h,{children:`Appearance`}),j.map(e=>/* @__PURE__ */ O(b,{value:e,children:[/* @__PURE__ */ D(v,{}),e]},e))]})]})]})]})}function N(){return/* @__PURE__ */ O(d,{children:[/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`File`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ D(g,{children:`New File`}),/* @__PURE__ */ O(S,{children:[/* @__PURE__ */ O(w,{children:[`Share`,/* @__PURE__ */ D(t,{"aria-hidden":`true`})]}),/* @__PURE__ */ O(C,{children:[/* @__PURE__ */ D(g,{children:`Email link`}),/* @__PURE__ */ D(g,{children:`Messages`})]})]})]})]}),/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`Edit`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ D(g,{children:`Undo`}),/* @__PURE__ */ O(S,{children:[/* @__PURE__ */ O(w,{children:[`Find`,/* @__PURE__ */ D(t,{"aria-hidden":`true`})]}),/* @__PURE__ */ O(C,{children:[/* @__PURE__ */ D(g,{children:`Find…`}),/* @__PURE__ */ D(g,{children:`Find Next`})]})]})]})]})]})}function P(){return/* @__PURE__ */ D(d,{orientation:`vertical`,children:[`Inbox`,`Drafts`,`Archive`].map(e=>/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:e}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ O(g,{children:[`Open `,e]}),/* @__PURE__ */ D(g,{children:`Mark all as read`})]})]},e))})}function F(){let[t,n]=E.useState(!0);return/* @__PURE__ */ O(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ O(d,{children:[/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`View`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ O(p,{value:`status-bar`,checked:t,onCheckedChange:n,children:[/* @__PURE__ */ D(v,{children:/* @__PURE__ */ D(e,{})}),`Status Bar`]}),/* @__PURE__ */ O(p,{value:`activity-bar`,defaultChecked:!0,children:[/* @__PURE__ */ D(v,{children:/* @__PURE__ */ D(e,{})}),`Activity Bar`]})]})]}),/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`Format`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ O(p,{value:`strikethrough`,children:[/* @__PURE__ */ D(v,{children:/* @__PURE__ */ D(e,{})}),`Strikethrough`]}),/* @__PURE__ */ O(p,{value:`code`,children:[/* @__PURE__ */ D(v,{children:/* @__PURE__ */ D(e,{})}),`Code`]})]})]})]}),/* @__PURE__ */ O(`output`,{"data-slot":`output`,children:[`Status bar `,t?`shown`:`hidden`]})]})}function I(){return/* @__PURE__ */ O(d,{children:[/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`File`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ O(g,{children:[/* @__PURE__ */ D(_,{children:/* @__PURE__ */ D(r,{})}),`New File`]}),/* @__PURE__ */ O(g,{children:[/* @__PURE__ */ D(_,{children:/* @__PURE__ */ D(i,{})}),`Open Folder`]}),/* @__PURE__ */ O(g,{children:[/* @__PURE__ */ D(_,{children:/* @__PURE__ */ D(s,{})}),`Save`]})]})]}),/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`Edit`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ O(g,{children:[/* @__PURE__ */ D(_,{mirror:!0,children:/* @__PURE__ */ D(o,{})}),`Undo`]}),/* @__PURE__ */ O(g,{children:[/* @__PURE__ */ D(_,{mirror:!0,children:/* @__PURE__ */ D(a,{})}),`Redo`]})]})]}),/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`More`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ O(g,{children:[/* @__PURE__ */ D(_,{children:/* @__PURE__ */ D(c,{})}),`Settings`]}),/* @__PURE__ */ O(g,{children:[/* @__PURE__ */ D(_,{children:/* @__PURE__ */ D(n,{})}),`Help`]}),/* @__PURE__ */ D(x,{}),/* @__PURE__ */ O(g,{destructive:!0,children:[/* @__PURE__ */ D(_,{children:/* @__PURE__ */ D(l,{})}),`Delete`]})]})]})]})}const L=[{value:`hollis`,label:`Hollis`},{value:`ines`,label:`Inès`},{value:`kofi`,label:`Kofi`}],R=[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`},{value:`system`,label:`System`}];function z(){let[e,t]=E.useState(`system`);return/* @__PURE__ */ O(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ O(d,{children:[/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`Profiles`}),/* @__PURE__ */ D(m,{children:/* @__PURE__ */ D(y,{defaultValue:`ines`,children:L.map(e=>/* @__PURE__ */ O(b,{value:e.value,children:[/* @__PURE__ */ D(v,{}),e.label]},e.value))})})]}),/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`Theme`}),/* @__PURE__ */ D(m,{children:/* @__PURE__ */ D(y,{value:e,onValueChange:t,children:R.map(e=>/* @__PURE__ */ O(b,{value:e.value,children:[/* @__PURE__ */ D(v,{}),e.label]},e.value))})})]})]}),/* @__PURE__ */ O(`output`,{"data-slot":`output`,children:[`Theme: `,e]})]})}function B(){return/* @__PURE__ */ D(`div`,{dir:`rtl`,children:/* @__PURE__ */ O(d,{children:[/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`ملف`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ D(g,{children:`علامة تبويب جديدة`}),/* @__PURE__ */ O(S,{children:[/* @__PURE__ */ O(w,{children:[`مشاركة`,/* @__PURE__ */ D(t,{})]}),/* @__PURE__ */ O(C,{children:[/* @__PURE__ */ D(g,{children:`البريد الإلكتروني`}),/* @__PURE__ */ D(g,{children:`الرسائل`})]})]})]})]}),/* @__PURE__ */ O(f,{children:[/* @__PURE__ */ D(T,{children:`تحرير`}),/* @__PURE__ */ O(m,{children:[/* @__PURE__ */ D(g,{children:`تراجع`}),/* @__PURE__ */ D(g,{children:`إعادة`})]})]})]})})}var V={name:`menubar`,title:`Menubar`,description:`Move between an application’s menus with one tab stop.`,sections:[{heading:null,text:`Wrap a few Menus in a Menubar to connect their triggers. Tab enters the bar once; arrow keys move between menus, and pointing at another trigger switches an open menu.`,examples:[{id:`menubar/demo`,caption:`Tab into the bar and use Left and Right to choose a menu, or point at another trigger once one is open. File has submenus, Edit has shortcuts, and View has checkboxes and an appearance choice. The console logs each one.`,Example:M,source:`import {
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
import { Menubar } from "@ui-sdk/react/menubar"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const recent = ["Q3 roadmap", "Launch checklist", "Offsite notes"]
const formats = ["PDF", "Markdown", "HTML"]
const appearances = ["Light", "Dark", "System"]

function Example() {
  const log = useLog()
  const chose = (value: string) => log(\`Chose \${value}\`)

  return (
    <Menubar>
      <Menu onAction={chose}>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem value="New document" shortcut="mod+n">
            New Document
          </MenuItem>
          <MenuItem value="Open" shortcut="mod+o">
            Open…
          </MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              Open Recent
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              {recent.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger>
              Export
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              {formats.map((format) => (
                <MenuItem key={format} value={\`Export as \${format}\`}>
                  {format}
                </MenuItem>
              ))}
            </MenuSubContent>
          </MenuSub>
          <MenuItem value="Print" shortcut="mod+p">
            Print…
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu onAction={chose}>
        <MenuTrigger>Edit</MenuTrigger>
        <MenuContent>
          <MenuItem value="Undo" shortcut="mod+z" disabled>
            Undo
          </MenuItem>
          <MenuItem value="Redo" shortcut="mod+shift+z">
            Redo
          </MenuItem>
          <MenuSeparator />
          <MenuItem value="Cut" shortcut="mod+x">
            Cut
          </MenuItem>
          <MenuItem value="Copy" shortcut="mod+c">
            Copy
          </MenuItem>
          <MenuItem value="Paste" shortcut="mod+v">
            Paste
          </MenuItem>
          <MenuSeparator />
          <MenuItem value="Find" shortcut="mod+f">
            Find…
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu
        onCheckedChange={(checked, details) =>
          log(\`\${details.value} \${checked ? "on" : "off"}\`)
        }
        onValueChange={(value) => log(\`\${value} appearance\`)}
      >
        <MenuTrigger>View</MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem value="Ruler">
            <MenuItemIndicator>
              <CheckIcon aria-hidden="true" />
            </MenuItemIndicator>
            Show Ruler
          </MenuCheckboxItem>
          <MenuCheckboxItem value="Word count" defaultChecked>
            <MenuItemIndicator>
              <CheckIcon aria-hidden="true" />
            </MenuItemIndicator>
            Show Word Count
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuRadioGroup defaultValue="System">
            <MenuGroupLabel>Appearance</MenuGroupLabel>
            {appearances.map((appearance) => (
              <MenuRadioItem key={appearance} value={appearance}>
                <MenuItemIndicator />
                {appearance}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </Menubar>
  )
}

export { Example }
`}]},{heading:`Submenu`,text:`A submenu still uses Menu’s Sub, SubTrigger, and SubContent. The arrow toward it enters that level. On an ordinary item, the same arrow can move to the next top-level menu instead.`,examples:[{id:`menubar/submenu`,caption:`Open File and enter Share with the arrow key. Go back to File, then move to Edit without leaving the menubar.`,Example:N,source:`import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"
import { ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Menubar>
      <Menu>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem>New File</MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              Share
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Email link</MenuItem>
              <MenuItem>Messages</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>Edit</MenuTrigger>
        <MenuContent>
          <MenuItem>Undo</MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              Find
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Find…</MenuItem>
              <MenuItem>Find Next</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    </Menubar>
  )
}

export { Example }
`}]},{heading:`Vertical`,text:'Set `orientation="vertical"` to move between triggers with Up and Down. The arrow toward the popup opens it; the arrow back closes it and returns to the trigger.',examples:[{id:`menubar/vertical`,caption:`Use Up and Down to choose Inbox, Drafts, or Archive. Right opens its menu in left-to-right text; Left returns to its trigger.`,Example:P,source:`import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"

function Example() {
  return (
    <Menubar orientation="vertical">
      {["Inbox", "Drafts", "Archive"].map((label) => (
        <Menu key={label}>
          <MenuTrigger>{label}</MenuTrigger>
          <MenuContent>
            <MenuItem>Open {label}</MenuItem>
            <MenuItem>Mark all as read</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </Menubar>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`menubar/checkbox`,caption:``,Example:F,source:`import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItemIndicator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"
import { CheckIcon } from "lucide-react"
import * as React from "react"

export function Example() {
  const [statusBar, setStatusBar] = React.useState(true)
  return (
    <div data-slot="stack">
      <Menubar>
        <Menu>
          <MenuTrigger>View</MenuTrigger>
          <MenuContent>
            <MenuCheckboxItem
              value="status-bar"
              checked={statusBar}
              onCheckedChange={setStatusBar}
            >
              <MenuItemIndicator>
                <CheckIcon />
              </MenuItemIndicator>
              Status Bar
            </MenuCheckboxItem>
            <MenuCheckboxItem value="activity-bar" defaultChecked>
              <MenuItemIndicator>
                <CheckIcon />
              </MenuItemIndicator>
              Activity Bar
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger>Format</MenuTrigger>
          <MenuContent>
            <MenuCheckboxItem value="strikethrough">
              <MenuItemIndicator>
                <CheckIcon />
              </MenuItemIndicator>
              Strikethrough
            </MenuCheckboxItem>
            <MenuCheckboxItem value="code">
              <MenuItemIndicator>
                <CheckIcon />
              </MenuItemIndicator>
              Code
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
      </Menubar>
      <output data-slot="output">
        Status bar {statusBar ? "shown" : "hidden"}
      </output>
    </div>
  )
}
`},{id:`menubar/icons`,caption:``,Example:I,source:`import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemIcon,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"
import {
  CircleHelpIcon,
  FileIcon,
  FolderIcon,
  RedoIcon,
  SaveIcon,
  SettingsIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react"

export function Example() {
  return (
    <Menubar>
      <Menu>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem>
            <MenuItemIcon>
              <FileIcon />
            </MenuItemIcon>
            New File
          </MenuItem>
          <MenuItem>
            <MenuItemIcon>
              <FolderIcon />
            </MenuItemIcon>
            Open Folder
          </MenuItem>
          <MenuItem>
            <MenuItemIcon>
              <SaveIcon />
            </MenuItemIcon>
            Save
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>Edit</MenuTrigger>
        <MenuContent>
          <MenuItem>
            <MenuItemIcon mirror>
              <UndoIcon />
            </MenuItemIcon>
            Undo
          </MenuItem>
          <MenuItem>
            <MenuItemIcon mirror>
              <RedoIcon />
            </MenuItemIcon>
            Redo
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>More</MenuTrigger>
        <MenuContent>
          <MenuItem>
            <MenuItemIcon>
              <SettingsIcon />
            </MenuItemIcon>
            Settings
          </MenuItem>
          <MenuItem>
            <MenuItemIcon>
              <CircleHelpIcon />
            </MenuItemIcon>
            Help
          </MenuItem>
          <MenuSeparator />
          <MenuItem destructive>
            <MenuItemIcon>
              <TrashIcon />
            </MenuItemIcon>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  )
}
`},{id:`menubar/radio`,caption:``,Example:z,source:`import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"
import * as React from "react"

const profiles = [
  { value: "hollis", label: "Hollis" },
  { value: "ines", label: "Inès" },
  { value: "kofi", label: "Kofi" },
]

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export function Example() {
  const [theme, setTheme] = React.useState("system")
  return (
    <div data-slot="stack">
      <Menubar>
        <Menu>
          <MenuTrigger>Profiles</MenuTrigger>
          <MenuContent>
            <MenuRadioGroup defaultValue="ines">
              {profiles.map((profile) => (
                <MenuRadioItem key={profile.value} value={profile.value}>
                  <MenuItemIndicator />
                  {profile.label}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger>Theme</MenuTrigger>
          <MenuContent>
            <MenuRadioGroup value={theme} onValueChange={setTheme}>
              {themes.map((option) => (
                <MenuRadioItem key={option.value} value={option.value}>
                  <MenuItemIndicator />
                  {option.label}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      </Menubar>
      <output data-slot="output">Theme: {theme}</output>
    </div>
  )
}
`},{id:`menubar/rtl`,caption:``,Example:B,source:`import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"
import { ChevronRightIcon } from "lucide-react"

export function Example() {
  return (
    <div dir="rtl">
      <Menubar>
        <Menu>
          <MenuTrigger>ملف</MenuTrigger>
          <MenuContent>
            <MenuItem>علامة تبويب جديدة</MenuItem>
            <MenuSub>
              <MenuSubTrigger>
                مشاركة
                <ChevronRightIcon />
              </MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>البريد الإلكتروني</MenuItem>
                <MenuItem>الرسائل</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger>تحرير</MenuTrigger>
          <MenuContent>
            <MenuItem>تراجع</MenuItem>
            <MenuItem>إعادة</MenuItem>
          </MenuContent>
        </Menu>
      </Menubar>
    </div>
  )
}
`}]}]};export{V as default};