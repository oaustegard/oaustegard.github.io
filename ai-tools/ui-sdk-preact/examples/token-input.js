import{t as e}from"../chunks/c-Bnrfo8pz.js";import{t}from"../chunks/c-WfjOen3K.js";import{t as n}from"../chunks/c-CA3STxaZ.js";import{t as r}from"../chunks/c-C55Oxqjg.js";import{t as i}from"../chunks/c-C6DDKR93.js";import{t as a}from"../chunks/c-BnWal148.js";import{t as o}from"../chunks/c-NPxkywtp.js";import{useLog as s}from"./log.js";import*as c from"preact/compat";import{jsx as l,jsxs as u}from"preact/compat/jsx-runtime";import{Field as d,FieldLabel as f}from"ui-sdk/field.js";import{Checkbox as p,CheckboxIndicator as m}from"ui-sdk/checkbox.js";import{Select as h,SelectContent as g,SelectItem as _,SelectItemIndicator as v,SelectLabel as y,SelectTrigger as b,SelectValue as x}from"ui-sdk/select.js";import{TriggerMenu as S,TriggerMenuContent as C,TriggerMenuEmpty as w,TriggerMenuHint as T,TriggerMenuItem as E,TriggerMenuList as D}from"ui-sdk/trigger-menu.js";import{TokenInput as O,TokenInputEditor as k,TokenInputToken as A,TokenInputTokenRemove as j,createTokenInputController as M,fromText as N,toLabel as P,toText as F}from"ui-sdk/token-input.js";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const I={name:`arrow-up`,size:24,node:[[`path`,{d:`m5 12 7-7 7 7`,key:`hav0vg`}],[`path`,{d:`M12 19V5`,key:`x0mq9r`}]]};I.node;const L=e(I),R=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function z(){return/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ l(f,{children:`Message`}),/* @__PURE__ */ u(O,{renderToken:e=>/* @__PURE__ */ u(A,{children:[e.label,/* @__PURE__ */ l(j,{children:/* @__PURE__ */ l(o,{"aria-hidden":`true`})})]}),children:[/* @__PURE__ */ l(k,{placeholder:`Type @ to mention someone…`}),/* @__PURE__ */ l(S,{triggers:[{char:`@`,type:`mention`,items:R}],children:/* @__PURE__ */ l(C,{children:/* @__PURE__ */ l(D,{children:e=>e.items.map(e=>/* @__PURE__ */ l(E,{value:e.value,label:e.label,children:e.label},e.value))})})})]})]})}const B=[{value:`src/app.tsx`,label:`app.tsx`,keywords:[`src`]},{value:`src/routes.ts`,label:`routes.ts`,keywords:[`src`]},{value:`src/styles.css`,label:`styles.css`,keywords:[`src`]},{value:`README.md`,label:`README.md`},{value:`package.json`,label:`package.json`}],V=[{value:`search`,label:`search`,arguments:[{name:`query`,hint:`<query>`,required:!0}]},{value:`review`,label:`review`},{value:`summarize`,label:`summarize`}],H=()=>new Promise(e=>setTimeout(e,800));function U(){let e=s(),[n]=c.useState(M),[d,f]=c.useState(!1),p=c.useRef(void 0);c.useEffect(()=>()=>clearTimeout(p.current),[]);function m(t){if(d||!n.getLabel().trim())return;f(!0);let r=t.filter(e=>typeof e!=`string`&&e.type===`skill`);for(let e of r)typeof e!=`string`&&n.updateToken(e.id,{data:{...e.data,run:`running`}});p.current=setTimeout(()=>{for(let e of r)typeof e!=`string`&&n.updateToken(e.id,{data:{...e.data,run:`done`}});e(`Sent ${F(n.getValue())}`),n.clear(),f(!1)},1500)}return/* @__PURE__ */ u(O,{controller:n,onSubmit:m,renderToken:e=>/* @__PURE__ */ u(A,{children:[e.type===`skill`?/* @__PURE__ */ l(i,{"aria-hidden":`true`}):/* @__PURE__ */ l(a,{"aria-hidden":`true`}),e.type===`skill`?`/${e.label}`:e.label,e.data?.run===`running`&&/* @__PURE__ */ l(r,{"aria-hidden":`true`}),e.data?.run===`done`&&/* @__PURE__ */ l(t,{"aria-hidden":`true`}),/* @__PURE__ */ l(j,{children:/* @__PURE__ */ l(o,{"aria-hidden":`true`})})]}),children:[/* @__PURE__ */ u(`div`,{"data-slot":`card`,children:[/* @__PURE__ */ l(k,{"aria-label":`Prompt`,placeholder:`Ask anything. Type @ or /`}),/* @__PURE__ */ u(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(`button`,{type:`button`,"data-size":`sm`,onMouseDown:e=>e.preventDefault(),onClick:()=>n.insert({type:`file`,value:`README.md`,label:`README.md`},{resolve:H()}),children:`Attach README`}),/* @__PURE__ */ l(`button`,{type:`button`,"data-variant":`solid`,"data-size":`sm`,"data-shape":`round`,onClick:()=>m(n.getValue()),"aria-label":d?`Running`:`Send`,disabled:d,children:l(d?r:L,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ u(S,{triggers:[{char:`@`,type:`file`,items:B},{char:`/`,boundary:`start`,type:`skill`,items:V}],onSelect:(e,t)=>t.trigger===`@`?H():void 0,children:[/* @__PURE__ */ l(T,{}),/* @__PURE__ */ u(C,{children:[/* @__PURE__ */ l(w,{children:`No matches`}),/* @__PURE__ */ l(D,{children:e=>e.items.map(e=>/* @__PURE__ */ l(E,{value:e.value,label:e.label,disabled:e.disabled,children:e.label},e.value))})]})]})]})}const W=[{value:`whole`,label:`Whole`},{value:`select`,label:`Select`},{value:`revert`,label:`Revert`}],G=[{value:`src/app.tsx`,label:`app.tsx`,keywords:[`src`]},{value:`src/routes.ts`,label:`routes.ts`,keywords:[`src`]},{value:`src/styles.css`,label:`styles.css`,keywords:[`src`]},{value:`README.md`,label:`README.md`},{value:`package.json`,label:`package.json`}],K=[`Explain `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`,data:{trigger:`@`}},` in two sentences.`];function q(){let e=s(),[r,i]=c.useState(`whole`);return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ l(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ u(h,{items:W,value:r,onValueChange:e=>e&&i(e),children:[/* @__PURE__ */ l(y,{children:`Backspace`}),/* @__PURE__ */ u(b,{children:[/* @__PURE__ */ l(x,{}),/* @__PURE__ */ l(n,{"aria-hidden":`true`})]}),/* @__PURE__ */ l(g,{children:W.map(e=>/* @__PURE__ */ u(_,{value:e.value,children:[e.label,/* @__PURE__ */ l(v,{children:/* @__PURE__ */ l(t,{"aria-hidden":`true`})})]},e.value))})]})}),/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ l(f,{children:`Prompt`}),/* @__PURE__ */ u(O,{tokenDeletion:r,defaultValue:K,renderToken:e=>/* @__PURE__ */ u(A,{children:[/* @__PURE__ */ l(a,{"aria-hidden":`true`}),e.label]}),onValueChange:(t,n)=>{for(let t of n.removed)e(`Removed ${t.label} (${r})`)},children:[/* @__PURE__ */ l(k,{}),/* @__PURE__ */ l(S,{triggers:[{char:`@`,type:`file`,items:G}],children:/* @__PURE__ */ l(C,{children:/* @__PURE__ */ l(D,{children:e=>e.items.map(e=>/* @__PURE__ */ l(E,{value:e.value,label:e.label,children:e.label},e.value))})})})]})]})]})}const J={format:e=>`<@${e.value}>`,parse:e=>e.split(/(<@[\w.-]+>)/).map(e=>{let t=/^<@([\w.-]+)>$/.exec(e)?.[1];return t?{type:`mention`,value:t,label:`@${t}`}:e})},Y=N(`Ping <@hollis> and <@ines> about the launch`,J);function X(){let e=s();return/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ l(f,{children:`Message`}),/* @__PURE__ */ l(O,{codec:J,copy:`label`,defaultValue:Y,onValueChange:t=>e(F(t,J)),children:/* @__PURE__ */ l(k,{})})]})}const Z=[`Explain `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`},` in two sentences.`];function Q(){let e=s(),[n,r]=c.useState(!1),[i,a]=c.useState(!1),o=c.useId();return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ u(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ l(p,{checked:n,onCheckedChange:e=>r(e===!0),children:/* @__PURE__ */ l(m,{children:/* @__PURE__ */ l(t,{"aria-hidden":`true`})})}),`Disabled`]}),/* @__PURE__ */ u(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ l(p,{checked:i,onCheckedChange:e=>a(e===!0),children:/* @__PURE__ */ l(m,{children:/* @__PURE__ */ l(t,{"aria-hidden":`true`})})}),`Read-only`]})]}),/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(d,{disabled:n,children:[/* @__PURE__ */ l(f,{children:`Prompt`}),/* @__PURE__ */ l(O,{form:o,name:`prompt`,required:!0,defaultValue:Z,readOnly:i,children:/* @__PURE__ */ l(k,{})})]}),/* @__PURE__ */ u(`form`,{id:o,"data-slot":`row`,onSubmit:t=>{t.preventDefault(),e(`Submitted ${new FormData(t.currentTarget).get(`prompt`)??``}`)},children:[/* @__PURE__ */ l(`button`,{type:`submit`,"data-variant":`solid`,children:`Submit`}),/* @__PURE__ */ l(`button`,{type:`reset`,children:`Reset`})]})]})]})}const $=[{value:`src/app.tsx`,label:`app.tsx`,keywords:[`src`]},{value:`src/routes.ts`,label:`routes.ts`,keywords:[`src`]},{value:`src/styles.css`,label:`styles.css`,keywords:[`src`]},{value:`README.md`,label:`README.md`},{value:`package.json`,label:`package.json`}],ee=[`Explain `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`},` in two sentences.`];function te(){let e=s(),[t,n]=c.useState(ee);return/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ l(f,{children:`Prompt`}),/* @__PURE__ */ u(O,{value:t,onValueChange:(t,r)=>{n(t);let i=r.removed.map(e=>e.label).join(`, `);e(`${F(t)} (${r.reason}${i?`, removed ${i}`:``})`)},history:{limit:50,groupDelay:1e3},getTokenDescription:e=>e.type===`file`?`attached file`:e.type,children:[/* @__PURE__ */ l(k,{}),/* @__PURE__ */ l(S,{triggers:[{char:`@`,type:`file`,items:$}],children:/* @__PURE__ */ l(C,{children:/* @__PURE__ */ l(D,{children:e=>e.items.map(e=>/* @__PURE__ */ l(E,{value:e.value,label:e.label,children:e.label},e.value))})})})]})]})}const ne=[`Compare `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`},` with `],re=()=>new Promise(e=>setTimeout(e,800));function ie(){let[e]=c.useState(M),t=()=>e.getValue().find(e=>typeof e!=`string`);return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,onMouseDown:e=>e.preventDefault(),children:[/* @__PURE__ */ l(`button`,{type:`button`,onClick:()=>e.insert({type:`file`,value:`package.json`,label:`package.json`},{at:`end`,resolve:re()}),children:`Attach File`}),/* @__PURE__ */ l(`button`,{type:`button`,onClick:()=>{let n=t();n&&e.updateToken(n.id,{label:n.value})},children:`Show Path`}),/* @__PURE__ */ l(`button`,{type:`button`,onClick:()=>{let n=t();n&&e.removeToken(n.id)},children:`Remove First`}),/* @__PURE__ */ l(`button`,{type:`button`,onClick:()=>e.undo(),children:`Undo`}),/* @__PURE__ */ l(`button`,{type:`button`,onClick:()=>e.clear(),children:`Clear`})]}),/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ l(f,{children:`Prompt`}),/* @__PURE__ */ l(O,{controller:e,defaultValue:ne,children:/* @__PURE__ */ l(k,{})})]})]})}function ae(){let e=s();return/* @__PURE__ */ u(d,{children:[/* @__PURE__ */ l(f,{children:`Message`}),/* @__PURE__ */ l(O,{submitShortcut:`mod+enter`,onSubmit:t=>e(`Sent ${P(t)}`),children:/* @__PURE__ */ l(k,{placeholder:`Write a message…`})})]})}var oe={name:`token-input`,title:`Token Input`,description:`Mix editable text with tokens for files, people, tags, and other references.`,sections:[{heading:null,text:`A token input is a text field that holds tokens alongside the text, like the people mentioned in a message or the files attached to a prompt. Each token moves, deletes and copies as one piece.`,examples:[{id:`token-input/demo`,caption:`Type @ and choose a person with the arrow keys and Enter. Remove a token with Backspace, or press its remove button.`,Example:z,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import { XIcon } from "lucide-react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Message</FieldLabel>
      <TokenInput
        renderToken={(token) => (
          <TokenInputToken>
            {token.label}
            <TokenInputTokenRemove>
              <XIcon aria-hidden="true" />
            </TokenInputTokenRemove>
          </TokenInputToken>
        )}
      >
        <TokenInputEditor placeholder="Type @ to mention someone…" />
        <TriggerMenu triggers={[{ char: "@", type: "mention", items: people }]}>
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
      </TokenInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Prompt Input`,text:"Combine file suggestions, skills, and a send action. This example marks files as pending while they load, then uses `updateToken()` to show a skill running. Enter sends; Shift+Enter adds a line. An open suggestion menu or an active input method takes precedence over sending.",examples:[{id:`token-input/prompt-input`,caption:`Type @ for files or / at the start for skills. For /search, enter a query and press Enter to insert the command. Press Enter again to send, and the console logs the message.`,Example:U,source:`import {
  createTokenInputController,
  toText,
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuHint,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import {
  ArrowUpIcon,
  CheckIcon,
  ClockIcon,
  CodeIcon,
  FileIcon,
  XIcon,
} from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const skills = [
  {
    value: "search",
    label: "search",
    arguments: [{ name: "query", hint: "<query>", required: true }],
  },
  { value: "review", label: "review" },
  { value: "summarize", label: "summarize" },
]

const loadFile = () => new Promise<void>((resolve) => setTimeout(resolve, 800))

function Example() {
  const log = useLog()
  const [prompt] = React.useState(createTokenInputController)
  const [running, setRunning] = React.useState(false)
  const sendTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  React.useEffect(() => () => clearTimeout(sendTimer.current), [])

  function send(value: TokenInputValue) {
    if (running || !prompt.getLabel().trim()) {
      return
    }
    setRunning(true)
    const skillTokens = value.filter(
      (segment) => typeof segment !== "string" && segment.type === "skill"
    )
    for (const skill of skillTokens) {
      if (typeof skill !== "string") {
        prompt.updateToken(skill.id!, {
          data: { ...skill.data, run: "running" },
        })
      }
    }
    sendTimer.current = setTimeout(() => {
      for (const skill of skillTokens) {
        if (typeof skill !== "string") {
          prompt.updateToken(skill.id!, {
            data: { ...skill.data, run: "done" },
          })
        }
      }
      log(\`Sent \${toText(prompt.getValue())}\`)
      prompt.clear()
      setRunning(false)
    }, 1500)
  }

  return (
    <TokenInput
      controller={prompt}
      onSubmit={send}
      renderToken={(token) => (
        <TokenInputToken>
          {token.type === "skill" ? (
            <CodeIcon aria-hidden="true" />
          ) : (
            <FileIcon aria-hidden="true" />
          )}
          {token.type === "skill" ? \`/\${token.label}\` : token.label}
          {token.data?.run === "running" && <ClockIcon aria-hidden="true" />}
          {token.data?.run === "done" && <CheckIcon aria-hidden="true" />}
          <TokenInputTokenRemove>
            <XIcon aria-hidden="true" />
          </TokenInputTokenRemove>
        </TokenInputToken>
      )}
    >
      <div data-slot="card">
        <TokenInputEditor
          aria-label="Prompt"
          placeholder="Ask anything. Type @ or /"
        />
        <div data-slot="row">
          <button
            type="button"
            data-size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              prompt.insert(
                { type: "file", value: "README.md", label: "README.md" },
                { resolve: loadFile() }
              )
            }
          >
            Attach README
          </button>
          <button
            type="button"
            data-variant="solid"
            data-size="sm"
            data-shape="round"
            onClick={() => send(prompt.getValue())}
            aria-label={running ? "Running" : "Send"}
            disabled={running}
          >
            {running ? (
              <ClockIcon aria-hidden="true" />
            ) : (
              <ArrowUpIcon aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <TriggerMenu
        triggers={[
          { char: "@", type: "file", items: files },
          { char: "/", boundary: "start", type: "skill", items: skills },
        ]}
        onSelect={(value, details) =>
          details.trigger === "@" ? loadFile() : undefined
        }
      >
        <TriggerMenuHint />
        <TriggerMenuContent>
          <TriggerMenuEmpty>No matches</TriggerMenuEmpty>
          <TriggerMenuList>
            {(state) =>
              (state.items as TriggerMenuDataItem[]).map((item) => (
                <TriggerMenuItem
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  disabled={item.disabled}
                >
                  {item.label}
                </TriggerMenuItem>
              ))
            }
          </TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </TokenInput>
  )
}

export { Example }
`}]},{heading:`Deleting Tokens`,text:"Choose what Backspace does at a token with `tokenDeletion`:",examples:[{id:`token-input/deletion`,caption:`Choose a Backspace behavior, click just after routes.ts, and press Backspace. Undo to try another behavior.`,Example:q,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  type TokenDeletion,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import { CheckIcon, ChevronDownIcon, FileIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const modes = [
  { value: "whole", label: "Whole" },
  { value: "select", label: "Select" },
  { value: "revert", label: "Revert" },
]

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const draft: TokenInputValue = [
  "Explain ",
  {
    type: "file",
    value: "src/routes.ts",
    label: "routes.ts",
    data: { trigger: "@" },
  },
  " in two sentences.",
]

function Example() {
  const log = useLog()
  const [deletion, setDeletion] = React.useState<TokenDeletion>("whole")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={modes}
          value={deletion}
          onValueChange={(next) => next && setDeletion(next as TokenDeletion)}
        >
          <SelectLabel>Backspace</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon aria-hidden="true" />
          </SelectTrigger>
          <SelectContent>
            {modes.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
                <SelectItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Field>
        <FieldLabel>Prompt</FieldLabel>
        <TokenInput
          tokenDeletion={deletion}
          defaultValue={draft}
          renderToken={(token) => (
            <TokenInputToken>
              <FileIcon aria-hidden="true" />
              {token.label}
            </TokenInputToken>
          )}
          onValueChange={(value, details) => {
            for (const token of details.removed) {
              log(\`Removed \${token.label} (\${deletion})\`)
            }
          }}
        >
          <TokenInputEditor />
          <TriggerMenu triggers={[{ char: "@", type: "file", items: files }]}>
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
        </TokenInput>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Codec`,text:"A codec converts tokens to text for the clipboard, forms, and saved drafts. The default writes `@label`. Copy that text into another app and paste it back to restore the token.",examples:[{id:`token-input/codec`,caption:`Edit the message. The console logs it in the custom format, with each mention as <@id>.`,Example:X,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  fromText,
  toText,
  TokenInput,
  TokenInputEditor,
  type TokenCodec,
} from "@ui-sdk/react/token-input"
import { useLog } from "../../../shared/react/log"

const chat: TokenCodec = {
  format: (token) => \`<@\${token.value}>\`,
  parse: (text) =>
    text.split(/(<@[\\w.-]+>)/).map((part) => {
      const id = /^<@([\\w.-]+)>$/.exec(part)?.[1]
      return id ? { type: "mention", value: id, label: \`@\${id}\` } : part
    }),
}

const draft = fromText("Ping <@hollis> and <@ines> about the launch", chat)

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Message</FieldLabel>
      <TokenInput
        codec={chat}
        copy="label"
        defaultValue={draft}
        onValueChange={(value) => log(toText(value, chat))}
      >
        <TokenInputEditor />
      </TokenInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Form`,text:"Give the input a `name` to submit its serialized text. `required`, `disabled`, and `readOnly` control form behavior. The `form` option associates it with a form elsewhere on the page, as shown here.",examples:[{id:`token-input/form`,caption:`Press Submit to log the prompt's serialized value. Try Disabled and Read-only, then Reset.`,Example:Q,source:`import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  TokenInput,
  TokenInputEditor,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import { CheckIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " in two sentences.",
]

function Example() {
  const log = useLog()
  const [disabled, setDisabled] = React.useState(false)
  const [readOnly, setReadOnly] = React.useState(false)
  const formId = React.useId()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Checkbox
            checked={disabled}
            onCheckedChange={(next) => setDisabled(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Disabled
        </label>
        <label data-slot="label">
          <Checkbox
            checked={readOnly}
            onCheckedChange={(next) => setReadOnly(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Read-only
        </label>
      </div>
      <div data-slot="stack">
        <Field disabled={disabled}>
          <FieldLabel>Prompt</FieldLabel>
          <TokenInput
            form={formId}
            name="prompt"
            required
            defaultValue={draft}
            readOnly={readOnly}
          >
            <TokenInputEditor />
          </TokenInput>
        </Field>
        <form
          id={formId}
          data-slot="row"
          onSubmit={(event) => {
            event.preventDefault()
            log(
              \`Submitted \${new FormData(event.currentTarget).get("prompt") ?? ""}\`
            )
          }}
        >
          <button type="submit" data-variant="solid">
            Submit
          </button>
          <button type="reset">Reset</button>
        </form>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `value` and update it in `onValueChange`. The change details include the reason, input type, and removed tokens. The input still manages its editing history.",examples:[{id:`token-input/controlled`,caption:`Type, add a file with @, or remove a token. The console logs the value and the reason for each change.`,Example:te,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  toText,
  TokenInput,
  TokenInputEditor,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " in two sentences.",
]

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<TokenInputValue>(draft)

  return (
    <Field>
      <FieldLabel>Prompt</FieldLabel>
      <TokenInput
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          const removed = details.removed.map((token) => token.label).join(", ")
          log(
            \`\${toText(next)} (\${details.reason}\${removed ? \`, removed \${removed}\` : ""})\`
          )
        }}
        history={{ limit: 50, groupDelay: 1000 }}
        getTokenDescription={(token) =>
          token.type === "file" ? "attached file" : token.type
        }
      >
        <TokenInputEditor />
        <TriggerMenu triggers={[{ char: "@", type: "file", items: files }]}>
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
      </TokenInput>
    </Field>
  )
}

export { Example }
`}]},{heading:`Controller`,text:"Use `createTokenInputController()` to insert, update, or remove tokens from code. Pass a promise as `resolve` to mark an inserted token as pending until its data is ready. Updating a token doesn't add an undo step.",examples:[{id:`token-input/controller`,caption:`Attach a file and watch it load. Show the first token's full path or remove it, then use Undo or Clear.`,Example:ie,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createTokenInputController,
  TokenInput,
  TokenInputEditor,
  type Token,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import * as React from "react"

const draft: TokenInputValue = [
  "Compare ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " with ",
]

const loadFile = () => new Promise<void>((resolve) => setTimeout(resolve, 800))

function Example() {
  const [prompt] = React.useState(createTokenInputController)
  const firstToken = () =>
    prompt
      .getValue()
      .find((segment): segment is Token => typeof segment !== "string")

  return (
    <div data-slot="stack">
      <div data-slot="controls" onMouseDown={(event) => event.preventDefault()}>
        <button
          type="button"
          onClick={() =>
            prompt.insert(
              { type: "file", value: "package.json", label: "package.json" },
              { at: "end", resolve: loadFile() }
            )
          }
        >
          Attach File
        </button>
        <button
          type="button"
          onClick={() => {
            const token = firstToken()
            if (token) {
              prompt.updateToken(token.id!, { label: token.value })
            }
          }}
        >
          Show Path
        </button>
        <button
          type="button"
          onClick={() => {
            const token = firstToken()
            if (token) {
              prompt.removeToken(token.id!)
            }
          }}
        >
          Remove First
        </button>
        <button type="button" onClick={() => prompt.undo()}>
          Undo
        </button>
        <button type="button" onClick={() => prompt.clear()}>
          Clear
        </button>
      </div>
      <Field>
        <FieldLabel>Prompt</FieldLabel>
        <TokenInput controller={prompt} defaultValue={draft}>
          <TokenInputEditor />
        </TokenInput>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Submit Shortcut`,text:"Set `submitShortcut` to `mod+enter` for a multiline message. Enter then inserts a line, and Command or Control+Enter submits.",examples:[{id:`token-input/submit-shortcut`,caption:`Write a message. Enter adds a line; Command+Enter on a Mac or Control+Enter elsewhere sends it to the console.`,Example:ae,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  toLabel,
  TokenInput,
  TokenInputEditor,
} from "@ui-sdk/react/token-input"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Message</FieldLabel>
      <TokenInput
        submitShortcut="mod+enter"
        onSubmit={(value) => log(\`Sent \${toLabel(value)}\`)}
      >
        <TokenInputEditor placeholder="Write a message…" />
      </TokenInput>
    </Field>
  )
}

export { Example }
`}]}]};export{oe as default};