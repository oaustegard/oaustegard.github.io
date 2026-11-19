import{$i as e,$o as t,Co as n,Gi as r,Hi as i,Io as a,Is as o,Ji as s,Ki as c,Mo as l,Oo as u,Qi as d,Ui as f,Uo as p,Wi as m,Xi as h,Yc as g,Yi as _,Zi as v,Zo as y,ea as b,fl as x,qi as S,rs as C,tl as w,wo as T}from"../chunks/c-CIXE4Nkk.js";const E=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function D(){return/* @__PURE__ */ w(i,{triggers:[{char:`@`,type:`mention`,items:E}],children:[/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type @ to mention someone…`})})]}),/* @__PURE__ */ w(`div`,{"data-slot":`visually-hidden`,children:/* @__PURE__ */ w(e,{})}),/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ w(m,{children:`No one found`}),/* @__PURE__ */ w(v,{children:e=>e.items.map(e=>/* @__PURE__ */ w(_,{value:e.value,label:e.label,children:e.label},e.value))})]})]})}const O=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}],k=[`away`,`remind`,`search`,`status`],A=[`announcements`,`design`,`design-reviews`,`engineering`,`general`,`launches`,`support`];function j(e,{signal:t}){return new Promise((n,r)=>{let i=setTimeout(()=>n(A.filter(t=>t.includes(e.toLowerCase()))),400);t.addEventListener(`abort`,()=>{clearTimeout(i),r(t.reason)})})}const M=[{char:`@`,items:O},{char:`/`,boundary:`start`,items:k},{char:`#`,items:j}];function ee(){return/* @__PURE__ */ w(i,{triggers:M,children:/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type @, / or #…`})})]})})}const N=[{value:`status`,label:`status`,arguments:[{name:`status`,hint:`<status>`,required:!0,items:[`available`,`busy`,`away`]},{name:`until`,hint:`[until]`,items:[`30m`,`1h`,`4h`,`today`],allowCustomValue:!1}]},{value:`search`,label:`search`,arguments:[{name:`query`,hint:`<query>`,required:!0}]},{value:`away`,label:`away`,after:`submit`},{value:`clear`,label:`clear`}];function P(){let e=l();return/* @__PURE__ */ w(`form`,{"data-slot":`stack`,onSubmit:t=>{t.preventDefault(),e(`Sent ${new FormData(t.currentTarget).get(`message`)}`)},children:/* @__PURE__ */ w(i,{triggers:[{char:`/`,boundary:`start`,type:`command`,items:N}],onSelect:(t,n)=>e([`Chose`,`/${t}`,...Object.values(n.arguments)].join(` `)),children:[/* @__PURE__ */ w(n,{name:`message`,children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type / for commands…`})})]}),/* @__PURE__ */ w(S,{})]})})}const F=[{value:`reply`,icon:C,mirror:!0},{value:`remind`,icon:o},{value:`search`,icon:t},{value:`share`,icon:y},{value:`clear`,icon:p}];function I(){return/* @__PURE__ */ w(i,{triggers:[{char:`/`,boundary:`start`,type:`command`}],children:[/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type / for commands…`})})]}),/* @__PURE__ */ w(f,{children:/* @__PURE__ */ w(v,{children:F.map(e=>/* @__PURE__ */ w(_,{value:e.value,children:[/* @__PURE__ */ w(h,{mirror:e.mirror,children:/* @__PURE__ */ w(e.icon,{})}),e.value]},e.value))})})]})}const L=[`announcements`,`design`,`design-reviews`,`engineering`,`general`,`launches`,`support`];function R(e,{signal:t}){return new Promise((n,r)=>{let i=setTimeout(()=>n(L.filter(t=>t.includes(e.toLowerCase())).map(e=>({value:e,label:e}))),600);t.addEventListener(`abort`,()=>{clearTimeout(i),r(t.reason)})})}function z(){return/* @__PURE__ */ w(i,{triggers:[{char:`#`,type:`channel`,items:R}],children:[/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type # to link a channel…`})})]}),/* @__PURE__ */ w(f,{children:[/* @__PURE__ */ w(e,{children:e=>e.loading?`Loading channels…`:e.count?`${e.count} ${e.count===1?`channel`:`channels`}`:``}),/* @__PURE__ */ w(m,{children:e=>e.empty&&!e.loading?`No channels match “${e.query}”`:null}),/* @__PURE__ */ w(v,{children:e=>e.items.map(e=>/* @__PURE__ */ w(_,{value:e.value,label:e.label,children:e.label},e.value))})]})]})}const B=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`,disabled:!0}];function V(){return/* @__PURE__ */ w(i,{triggers:[{char:`@`,spaces:2,maxLength:30,pattern:/[\p{L}.'-]/u,filter:`startsWith`,insert:e=>`@${e.label.split(` `)[0]} `}],children:[/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type @ and a first name…`})})]}),/* @__PURE__ */ w(f,{children:/* @__PURE__ */ w(v,{children:[/* @__PURE__ */ w(r,{children:[/* @__PURE__ */ w(c,{children:`People`}),B.map(e=>/* @__PURE__ */ w(_,{value:e.value,label:e.label,disabled:e.disabled,children:[e.label,/* @__PURE__ */ w(`span`,{"data-slot":`hint`,children:e.disabled?`Deactivated`:`@${e.value}`})]},e.value))]}),/* @__PURE__ */ w(d,{}),/* @__PURE__ */ w(_,{value:`here`,label:`here`,keywords:[`everyone`,`channel`],onSelect:(e,t)=>t.insert(`@here `),children:[/* @__PURE__ */ w(h,{children:/* @__PURE__ */ w(a,{})}),`Notify everyone here`]})]})})]})}const H=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function U(){return/* @__PURE__ */ w(i,{triggers:[{char:`@`,items:H}],autoHighlight:!1,loop:!1,children:[/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Task`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{render:/* @__PURE__ */ w(`input`,{}),placeholder:`Type @ to assign someone…`})})]}),/* @__PURE__ */ w(f,{children:/* @__PURE__ */ w(v,{children:e=>e.items.map(e=>/* @__PURE__ */ w(_,{value:e.value,label:e.label,children:e.label},e.value))})})]})}const W=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function G(){let[e,t]=x(null);return/* @__PURE__ */ w(i,{triggers:[{char:`@`,items:W}],children:[/* @__PURE__ */ w(n,{ref:t,children:[/* @__PURE__ */ w(u,{children:`Comment`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type @ to mention someone…`})})]}),/* @__PURE__ */ w(f,{side:`top`,align:`start`,sideOffset:8,alignOffset:-5,collisionPadding:16,anchor:e,container:e,keepMounted:!0,children:/* @__PURE__ */ w(v,{children:e=>e.items.map(e=>/* @__PURE__ */ w(_,{value:e.value,label:e.label,children:e.label},e.value))})})]})}const K=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}],q=[{value:`status`,label:`status`,arguments:[{name:`status`,hint:`<status>`,required:!0,items:[`available`,`busy`,`away`]}]}];function J(){let e=l(),[t,r]=x(!1);return/* @__PURE__ */ w(i,{triggers:[{char:`@`,items:K},{char:`/`,boundary:`start`,items:q}],open:t,onOpenChange:(t,n)=>{r(t),e(`${t?`Opening`:`Closing`} (${n.reason})`)},onOpenChangeComplete:t=>e(t?`Open`:`Closed`),onQueryChange:(t,n)=>e(`Query “${t}”${n.argument?` for ${n.argument}`:``}`),shortcut:`ctrl+j`,children:/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Type @ or /…`})})]})})}const Y=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function X(){let e=l(),[t]=x(b);return/* @__PURE__ */ w(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ w(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ w(`button`,{type:`button`,onMouseDown:e=>e.preventDefault(),onClick:async()=>{let n=await t.open({trigger:`@`});e(`Closed (${n.reason})`)},children:`Mention`}),/* @__PURE__ */ w(`button`,{type:`button`,onMouseDown:e=>e.preventDefault(),onClick:()=>t.insert((/* @__PURE__ */ new Date()).toLocaleDateString(`en-US`,{month:`long`,day:`numeric`})),children:`Insert Date`})]}),/* @__PURE__ */ w(i,{controller:t,triggers:[{char:`@`,items:Y}],children:[/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Message`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(s,{placeholder:`Write a message…`})})]}),/* @__PURE__ */ w(f,{children:/* @__PURE__ */ w(v,{children:e=>e.items.map(e=>/* @__PURE__ */ w(_,{value:e.value,label:e.label,children:e.label},e.value))})})]})]})}const Z=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function Q(){let[e,t]=x();return/* @__PURE__ */ w(i,{editor:e,triggers:[{char:`@`,items:Z}],children:[/* @__PURE__ */ w(n,{children:[/* @__PURE__ */ w(u,{children:`Notes`}),/* @__PURE__ */ w(T,{render:/* @__PURE__ */ w(`textarea`,{ref:n=>{n&&e?.element!==n&&t(g(n))},placeholder:`Type @ to mention someone…`})})]}),/* @__PURE__ */ w(f,{children:/* @__PURE__ */ w(v,{children:e=>e.items.map(e=>/* @__PURE__ */ w(_,{value:e.value,label:e.label,children:e.label},e.value))})})]})}var $={name:`trigger-menu`,title:`Trigger Menu`,description:`Opens suggestions at the caret when you type a trigger such as @, /, or #.`,sections:[{heading:null,text:"A trigger menu suggests what to insert when someone types a trigger character, like `@` for people or `/` for commands. It opens at the caret, narrows as they type, and inserts the choice into the text.",examples:[{id:`trigger-menu/demo`,caption:`Type @, narrow the list with a name, and press Enter to insert the highlighted person.`,Example:D,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
  TriggerMenuStatus,
} from "@ui-sdk/react/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "@", type: "mention", items: people }]}>
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ to mention someone…" />}
        />
      </Field>
      <div data-slot="visually-hidden">
        <TriggerMenuStatus />
      </div>
      <TriggerMenuContent>
        <TriggerMenuEmpty>No one found</TriggerMenuEmpty>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Triggers as Data`,text:"Give each trigger a `char` and its `items`. Items can be strings, objects, groups or a loader, and they render themselves when you leave out `TriggerMenuContent`. The same field can offer people after `@`, commands after `/` and channels after `#`.",examples:[{id:`trigger-menu/data`,caption:`Type @ for people, / at the start for commands, or # to load channels.`,Example:ee,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerDefinition,
  TriggerMenu,
  TriggerMenuInput,
} from "@ui-sdk/react/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

const commands = ["away", "remind", "search", "status"]

const channels = [
  "announcements",
  "design",
  "design-reviews",
  "engineering",
  "general",
  "launches",
  "support",
]

function searchChannels(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(
          channels.filter((channel) => channel.includes(query.toLowerCase()))
        ),
      400
    )
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

const triggers: TriggerDefinition[] = [
  { char: "@", items: people },
  { char: "/", boundary: "start", items: commands },
  { char: "#", items: searchChannels },
]

function Example() {
  return (
    <TriggerMenu triggers={triggers}>
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @, / or #…" />}
        />
      </Field>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Commands with Arguments`,text:'A trigger with `boundary: "start"` matches only at the start of the text, so a leading space escapes it. An item with `arguments` asks for each one in order: `TriggerMenuHint` shows what\'s left at the caret, Tab accepts the highlighted suggestion and moves to the next argument, Enter finishes once only optional arguments remain, and Backspace past an argument\'s start goes back. An argument without `items` is free text. `after: "submit"` sends the form once the item is inserted.',examples:[{id:`trigger-menu/commands`,caption:`Type /status, then press Tab to choose a status and an optional time, and Enter to finish. Choose /away to send it at once. The console logs each command.`,Example:P,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  TriggerMenu,
  TriggerMenuHint,
  TriggerMenuInput,
} from "@ui-sdk/react/trigger-menu"
import { useLog } from "../../../shared/react/log"

const commands = [
  {
    value: "status",
    label: "status",
    arguments: [
      {
        name: "status",
        hint: "<status>",
        required: true,
        items: ["available", "busy", "away"],
      },
      {
        name: "until",
        hint: "[until]",
        items: ["30m", "1h", "4h", "today"],
        allowCustomValue: false,
      },
    ],
  },
  {
    value: "search",
    label: "search",
    arguments: [{ name: "query", hint: "<query>", required: true }],
  },
  { value: "away", label: "away", after: "submit" as const },
  { value: "clear", label: "clear" },
]

function Example() {
  const log = useLog()
  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(\`Sent \${new FormData(event.currentTarget).get("message")}\`)
      }}
    >
      <TriggerMenu
        triggers={[
          { char: "/", boundary: "start", type: "command", items: commands },
        ]}
        onSelect={(value, details) =>
          log(
            ["Chose", \`/\${value}\`, ...Object.values(details.arguments)].join(
              " "
            )
          )
        }
      >
        <Field name="message">
          <FieldLabel>Message</FieldLabel>
          <FieldControl
            render={<TriggerMenuInput placeholder="Type / for commands…" />}
          />
        </Field>
        <TriggerMenuHint />
      </TriggerMenu>
    </form>
  )
}

export { Example }
`}]},{heading:`Icons`,text:"Put an item's icon in a `TriggerMenuItemIcon`, before its text. Screen readers skip it, and filtering and the text a choice inserts ignore it, so an SVG's `<title>`, an icon font's glyph or an emoji never joins the item's name or the field. Items as data have no icon, so compose the items that show one.",examples:[{id:`trigger-menu/icons`,caption:`Type / to open the commands, then type re to narrow them. Each icon sits before its name, and filtering ignores it.`,Example:I,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import {
  ClockIcon,
  ReplyIcon,
  SearchIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react"

const commands = [
  { value: "reply", icon: ReplyIcon, mirror: true },
  { value: "remind", icon: ClockIcon },
  { value: "search", icon: SearchIcon },
  { value: "share", icon: ShareIcon },
  { value: "clear", icon: TrashIcon },
]

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "/", boundary: "start", type: "command" }]}>
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type / for commands…" />}
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          {commands.map((command) => (
            <TriggerMenuItem key={command.value} value={command.value}>
              <TriggerMenuItemIcon mirror={command.mirror}>
                <command.icon />
              </TriggerMenuItemIcon>
              {command.value}
            </TriggerMenuItem>
          ))}
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Loading Items`,text:"A trigger's `items` can be a loader, called with the query and an `AbortSignal` once typing pauses. A newer query aborts the older load, so only its results land, and the last results stay while the next ones load. `TriggerMenuStatus` and `TriggerMenuEmpty` get `loading`, and while a load runs, `aria-busy` marks the list, so you can fade the results that are about to change.",examples:[{id:`trigger-menu/async`,caption:`Type # and a channel name. The list says it's loading, and older results fade while newer ones load.`,Example:z,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
  TriggerMenuStatus,
} from "@ui-sdk/react/trigger-menu"

const channels = [
  "announcements",
  "design",
  "design-reviews",
  "engineering",
  "general",
  "launches",
  "support",
]

function searchChannels(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(
          channels
            .filter((channel) => channel.includes(query.toLowerCase()))
            .map((channel) => ({ value: channel, label: channel }))
        ),
      600
    )
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  return (
    <TriggerMenu
      triggers={[{ char: "#", type: "channel", items: searchChannels }]}
    >
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type # to link a channel…" />}
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuStatus>
          {(state) =>
            state.loading
              ? "Loading channels…"
              : state.count
                ? \`\${state.count} \${state.count === 1 ? "channel" : "channels"}\`
                : ""
          }
        </TriggerMenuStatus>
        <TriggerMenuEmpty>
          {(state) =>
            state.empty && !state.loading
              ? \`No channels match “\${state.query}”\`
              : null
          }
        </TriggerMenuEmpty>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Custom Items`,text:"Compose `TriggerMenuItem`s with any content, in groups. `label` is what's matched and inserted, `keywords` adds words to match, and `disabled` keeps an item in the list without letting it be chosen. A trigger's `spaces`, `pattern` and `maxLength` decide what its query may hold, `filter` how it narrows the items, and `insert` what replaces the trigger and query. An item's own `onSelect` runs first and can insert something else with `details.insert()`.",examples:[{id:`trigger-menu/custom-items`,caption:`Type @ and the start of a first name to insert it, or choose Notify everyone here to insert @here. Deactivated people can't be chosen.`,Example:V,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuGroup,
  TriggerMenuGroupLabel,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuList,
  TriggerMenuSeparator,
} from "@ui-sdk/react/trigger-menu"
import { UsersIcon } from "lucide-react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik", disabled: true },
]

function Example() {
  return (
    <TriggerMenu
      triggers={[
        {
          char: "@",
          spaces: 2,
          maxLength: 30,
          pattern: /[\\p{L}.'-]/u,
          filter: "startsWith",
          insert: (item) => \`@\${item.label.split(" ")[0]} \`,
        },
      ]}
    >
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ and a first name…" />}
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          <TriggerMenuGroup>
            <TriggerMenuGroupLabel>People</TriggerMenuGroupLabel>
            {people.map((person) => (
              <TriggerMenuItem
                key={person.value}
                value={person.value}
                label={person.label}
                disabled={person.disabled}
              >
                {person.label}
                <span data-slot="hint">
                  {person.disabled ? "Deactivated" : \`@\${person.value}\`}
                </span>
              </TriggerMenuItem>
            ))}
          </TriggerMenuGroup>
          <TriggerMenuSeparator />
          <TriggerMenuItem
            value="here"
            label="here"
            keywords={["everyone", "channel"]}
            onSelect={(value, details) => details.insert("@here ")}
          >
            <TriggerMenuItemIcon>
              <UsersIcon />
            </TriggerMenuItemIcon>
            Notify everyone here
          </TriggerMenuItem>
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Input`,text:"Render the input part as an `<input>` for a single line. It's a combobox with `aria-expanded`. In a single line, Enter often submits a form, so this example sets `autoHighlight={false}`: Enter chooses only once an arrow key has highlighted a person, and `loop={false}` stops the arrows at either end of the list.",examples:[{id:`trigger-menu/input`,caption:`Type @ in the empty task. Nothing is highlighted until you press ArrowDown, then Enter assigns the person.`,Example:U,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  return (
    <TriggerMenu
      triggers={[{ char: "@", items: people }]}
      autoHighlight={false}
      loop={false}
    >
      <Field>
        <FieldLabel>Task</FieldLabel>
        <FieldControl
          render={
            <TriggerMenuInput
              render={<input />}
              placeholder="Type @ to assign someone…"
            />
          }
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Positioning`,text:"By default, the list opens below the trigger at the caret and flips to stay on screen. `side`, `align` and the offsets place it, and `anchor` positions it against another element. This example opens the list above the whole field, lines its items up with the label, and renders it inside the field with `container`.",examples:[{id:`trigger-menu/positioning`,caption:`Type @ in the comment. The list opens above the field, lined up with its label.`,Example:G,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  const [field, setField] = React.useState<HTMLDivElement | null>(null)
  return (
    <TriggerMenu triggers={[{ char: "@", items: people }]}>
      <Field ref={setField}>
        <FieldLabel>Comment</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ to mention someone…" />}
        />
      </Field>
      <TriggerMenuContent
        side="top"
        align="start"
        sideOffset={8}
        alignOffset={-5}
        collisionPadding={16}
        anchor={field}
        container={field}
        keepMounted
      >
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `open` and update it in `onOpenChange` to own the popup state. The details say why it changed. `onQueryChange` reports the text after the trigger and the argument being typed, and `onOpenChangeComplete` runs once the menu has finished opening or closing. Escape dismisses a match, and `shortcut` reopens it, Control+Space by default.",examples:[{id:`trigger-menu/controlled`,caption:`Type @ and a name, press Escape, then Control+J to reopen the list. The console logs each callback with its reason.`,Example:J,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import { TriggerMenu, TriggerMenuInput } from "@ui-sdk/react/trigger-menu"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

const commands = [
  {
    value: "status",
    label: "status",
    arguments: [
      {
        name: "status",
        hint: "<status>",
        required: true,
        items: ["available", "busy", "away"],
      },
    ],
  },
]

function Example() {
  const log = useLog()
  const [open, setOpen] = React.useState(false)
  return (
    <TriggerMenu
      triggers={[
        { char: "@", items: people },
        { char: "/", boundary: "start", items: commands },
      ]}
      open={open}
      onOpenChange={(next, details) => {
        setOpen(next)
        log(\`\${next ? "Opening" : "Closing"} (\${details.reason})\`)
      }}
      onOpenChangeComplete={(next) => log(next ? "Open" : "Closed")}
      onQueryChange={(query, details) =>
        log(
          \`Query “\${query}”\${details.argument ? \` for \${details.argument}\` : ""}\`
        )
      }
      shortcut="ctrl+j"
    >
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ or /…" />}
        />
      </Field>
    </TriggerMenu>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"Create a controller with `createTriggerMenuController()` and pass it as `controller` to open suggestions, insert text at the caret, or read the current match. `open()` types the trigger at the caret and returns a Promise that resolves when the menu closes.",examples:[{id:`trigger-menu/controller`,caption:`Press Mention and choose a person. The console logs why the list closed. Insert Date adds today's date at the caret.`,Example:X,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
  createTriggerMenuController,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  const log = useLog()
  const [menu] = React.useState(createTriggerMenuController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={async () => {
            const closed = await menu.open({ trigger: "@" })
            log(\`Closed (\${closed.reason})\`)
          }}
        >
          Mention
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            menu.insert(
              new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })
            )
          }
        >
          Insert Date
        </button>
      </div>
      <TriggerMenu controller={menu} triggers={[{ char: "@", items: people }]}>
        <Field>
          <FieldLabel>Message</FieldLabel>
          <FieldControl
            render={<TriggerMenuInput placeholder="Write a message…" />}
          />
        </Field>
        <TriggerMenuContent>
          <TriggerMenuList>
            {(state) =>
              (state.items as TriggerMenuDataItem[]).map((item) => (
                <TriggerMenuItem
                  key={item.value}
                  value={item.value}
                  label={item.label}
                >
                  {item.label}
                </TriggerMenuItem>
              ))
            }
          </TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </div>
  )
}

export { Example }
`}]},{heading:`Any Editor`,text:"Pass `editor` to connect the menu to a field you render yourself, or to another editor. `textFieldAdapter()` makes one for a textarea or an input.",examples:[{id:`trigger-menu/editor`,caption:`Type @ in the notes, a textarea connected through an editor adapter, and choose a person.`,Example:Q,source:`"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TextEditorAdapter,
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
  textFieldAdapter,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  const [editor, setEditor] = React.useState<TextEditorAdapter>()
  return (
    <TriggerMenu editor={editor} triggers={[{ char: "@", items: people }]}>
      <Field>
        <FieldLabel>Notes</FieldLabel>
        <FieldControl
          render={
            <textarea
              ref={(field) => {
                if (field && editor?.element !== field) {
                  setEditor(textFieldAdapter(field))
                }
              }}
              placeholder="Type @ to mention someone…"
            />
          }
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
`}]}]};export{$ as default};