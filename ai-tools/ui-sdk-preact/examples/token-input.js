import{Co as e,Fo as t,Fs as n,Hi as r,Is as i,Ks as a,Mo as o,Oo as s,Qs as c,Ts as l,Ui as u,Wi as d,Xa as f,Yi as p,Zi as m,_r as h,ao as g,cl as _,do as v,fl as y,go as b,gr as x,hr as S,il as C,ll as w,mo as T,mr as E,nl as D,qa as O,qi as k,qs as A,rl as j,ro as M,tl as N,to as P,ul as F,uo as I,vr as L}from"../chunks/c-CIXE4Nkk.js";const R=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function z(){return/* @__PURE__ */ N(e,{children:[/* @__PURE__ */ N(s,{children:`Message`}),/* @__PURE__ */ N(E,{renderToken:e=>/* @__PURE__ */ N(x,{children:[e.label,/* @__PURE__ */ N(h,{children:/* @__PURE__ */ N(t,{"aria-hidden":`true`})})]}),children:[/* @__PURE__ */ N(S,{placeholder:`Type @ to mention someone…`}),/* @__PURE__ */ N(r,{triggers:[{char:`@`,type:`mention`,items:R}],children:/* @__PURE__ */ N(u,{children:/* @__PURE__ */ N(m,{children:e=>e.items.map(e=>/* @__PURE__ */ N(p,{value:e.value,label:e.label,children:e.label},e.value))})})})]})]})}const B=[{value:`src/app.tsx`,label:`app.tsx`,keywords:[`src`]},{value:`src/routes.ts`,label:`routes.ts`,keywords:[`src`]},{value:`src/styles.css`,label:`styles.css`,keywords:[`src`]},{value:`README.md`,label:`README.md`},{value:`package.json`,label:`package.json`}],V=[{value:`search`,label:`search`,arguments:[{name:`query`,hint:`<query>`,required:!0}]},{value:`review`,label:`review`},{value:`summarize`,label:`summarize`}],H=()=>new Promise(e=>setTimeout(e,800));function U(){let e=o(),[a]=y(L),[s,f]=y(!1),g=F(void 0);_(()=>()=>clearTimeout(g.current),[]);function v(t){if(s||!a.getLabel().trim())return;f(!0);let n=t.filter(e=>typeof e!=`string`&&e.type===`skill`);for(let e of n)typeof e!=`string`&&a.updateToken(e.id,{data:{...e.data,run:`running`}});g.current=setTimeout(()=>{for(let e of n)typeof e!=`string`&&a.updateToken(e.id,{data:{...e.data,run:`done`}});e(`Sent ${C(a.getValue())}`),a.clear(),f(!1)},1500)}return/* @__PURE__ */ N(E,{controller:a,onSubmit:v,renderToken:e=>/* @__PURE__ */ N(x,{children:[e.type===`skill`?/* @__PURE__ */ N(n,{"aria-hidden":`true`}):/* @__PURE__ */ N(l,{"aria-hidden":`true`}),e.type===`skill`?`/${e.label}`:e.label,e.data?.run===`running`&&/* @__PURE__ */ N(i,{"aria-hidden":`true`}),e.data?.run===`done`&&/* @__PURE__ */ N(A,{"aria-hidden":`true`}),/* @__PURE__ */ N(h,{children:/* @__PURE__ */ N(t,{"aria-hidden":`true`})})]}),children:[/* @__PURE__ */ N(`div`,{"data-slot":`card`,children:[/* @__PURE__ */ N(S,{"aria-label":`Prompt`,placeholder:`Ask anything. Type @ or /`}),/* @__PURE__ */ N(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ N(`button`,{type:`button`,"data-size":`sm`,onMouseDown:e=>e.preventDefault(),onClick:()=>a.insert({type:`file`,value:`README.md`,label:`README.md`},{resolve:H()}),children:`Attach README`}),/* @__PURE__ */ N(`button`,{type:`button`,"data-variant":`solid`,"data-size":`sm`,"data-shape":`round`,onClick:()=>v(a.getValue()),"aria-label":s?`Running`:`Send`,disabled:s,children:N(s?i:c,{"aria-hidden":`true`})})]})]}),/* @__PURE__ */ N(r,{triggers:[{char:`@`,type:`file`,items:B},{char:`/`,boundary:`start`,type:`skill`,items:V}],onSelect:(e,t)=>t.trigger===`@`?H():void 0,children:[/* @__PURE__ */ N(k,{}),/* @__PURE__ */ N(u,{children:[/* @__PURE__ */ N(d,{children:`No matches`}),/* @__PURE__ */ N(m,{children:e=>e.items.map(e=>/* @__PURE__ */ N(p,{value:e.value,label:e.label,disabled:e.disabled,children:e.label},e.value))})]})]})]})}const W=[{value:`whole`,label:`Whole`},{value:`select`,label:`Select`},{value:`revert`,label:`Revert`}],G=[{value:`src/app.tsx`,label:`app.tsx`,keywords:[`src`]},{value:`src/routes.ts`,label:`routes.ts`,keywords:[`src`]},{value:`src/styles.css`,label:`styles.css`,keywords:[`src`]},{value:`README.md`,label:`README.md`},{value:`package.json`,label:`package.json`}],K=[`Explain `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`,data:{trigger:`@`}},` in two sentences.`];function q(){let t=o(),[n,i]=y(`whole`);return/* @__PURE__ */ N(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ N(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ N(O,{items:W,value:n,onValueChange:e=>e&&i(e),children:[/* @__PURE__ */ N(g,{children:`Backspace`}),/* @__PURE__ */ N(I,{children:[/* @__PURE__ */ N(v,{}),/* @__PURE__ */ N(a,{"aria-hidden":`true`})]}),/* @__PURE__ */ N(f,{children:W.map(e=>/* @__PURE__ */ N(P,{value:e.value,children:[e.label,/* @__PURE__ */ N(M,{children:/* @__PURE__ */ N(A,{"aria-hidden":`true`})})]},e.value))})]})}),/* @__PURE__ */ N(e,{children:[/* @__PURE__ */ N(s,{children:`Prompt`}),/* @__PURE__ */ N(E,{tokenDeletion:n,defaultValue:K,renderToken:e=>/* @__PURE__ */ N(x,{children:[/* @__PURE__ */ N(l,{"aria-hidden":`true`}),e.label]}),onValueChange:(e,r)=>{for(let e of r.removed)t(`Removed ${e.label} (${n})`)},children:[/* @__PURE__ */ N(S,{}),/* @__PURE__ */ N(r,{triggers:[{char:`@`,type:`file`,items:G}],children:/* @__PURE__ */ N(u,{children:/* @__PURE__ */ N(m,{children:e=>e.items.map(e=>/* @__PURE__ */ N(p,{value:e.value,label:e.label,children:e.label},e.value))})})})]})]})]})}const J={format:e=>`<@${e.value}>`,parse:e=>e.split(/(<@[\w.-]+>)/).map(e=>{let t=/^<@([\w.-]+)>$/.exec(e)?.[1];return t?{type:`mention`,value:t,label:`@${t}`}:e})},Y=D(`Ping <@hollis> and <@ines> about the launch`,J);function X(){let t=o();return/* @__PURE__ */ N(e,{children:[/* @__PURE__ */ N(s,{children:`Message`}),/* @__PURE__ */ N(E,{codec:J,copy:`label`,defaultValue:Y,onValueChange:e=>t(C(e,J)),children:/* @__PURE__ */ N(S,{})})]})}const Z=[`Explain `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`},` in two sentences.`];function Q(){let t=o(),[n,r]=y(!1),[i,a]=y(!1),c=w();return/* @__PURE__ */ N(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ N(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ N(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ N(T,{checked:n,onCheckedChange:e=>r(e===!0),children:/* @__PURE__ */ N(b,{children:/* @__PURE__ */ N(A,{"aria-hidden":`true`})})}),`Disabled`]}),/* @__PURE__ */ N(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ N(T,{checked:i,onCheckedChange:e=>a(e===!0),children:/* @__PURE__ */ N(b,{children:/* @__PURE__ */ N(A,{"aria-hidden":`true`})})}),`Read-only`]})]}),/* @__PURE__ */ N(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ N(e,{disabled:n,children:[/* @__PURE__ */ N(s,{children:`Prompt`}),/* @__PURE__ */ N(E,{form:c,name:`prompt`,required:!0,defaultValue:Z,readOnly:i,children:/* @__PURE__ */ N(S,{})})]}),/* @__PURE__ */ N(`form`,{id:c,"data-slot":`row`,onSubmit:e=>{e.preventDefault(),t(`Submitted ${new FormData(e.currentTarget).get(`prompt`)??``}`)},children:[/* @__PURE__ */ N(`button`,{type:`submit`,"data-variant":`solid`,children:`Submit`}),/* @__PURE__ */ N(`button`,{type:`reset`,children:`Reset`})]})]})]})}const $=[{value:`src/app.tsx`,label:`app.tsx`,keywords:[`src`]},{value:`src/routes.ts`,label:`routes.ts`,keywords:[`src`]},{value:`src/styles.css`,label:`styles.css`,keywords:[`src`]},{value:`README.md`,label:`README.md`},{value:`package.json`,label:`package.json`}],ee=[`Explain `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`},` in two sentences.`];function te(){let t=o(),[n,i]=y(ee);return/* @__PURE__ */ N(e,{children:[/* @__PURE__ */ N(s,{children:`Prompt`}),/* @__PURE__ */ N(E,{value:n,onValueChange:(e,n)=>{i(e);let r=n.removed.map(e=>e.label).join(`, `);t(`${C(e)} (${n.reason}${r?`, removed ${r}`:``})`)},history:{limit:50,groupDelay:1e3},getTokenDescription:e=>e.type===`file`?`attached file`:e.type,children:[/* @__PURE__ */ N(S,{}),/* @__PURE__ */ N(r,{triggers:[{char:`@`,type:`file`,items:$}],children:/* @__PURE__ */ N(u,{children:/* @__PURE__ */ N(m,{children:e=>e.items.map(e=>/* @__PURE__ */ N(p,{value:e.value,label:e.label,children:e.label},e.value))})})})]})]})}const ne=[`Compare `,{type:`file`,value:`src/routes.ts`,label:`routes.ts`},` with `],re=()=>new Promise(e=>setTimeout(e,800));function ie(){let[t]=y(L),n=()=>t.getValue().find(e=>typeof e!=`string`);return/* @__PURE__ */ N(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ N(`div`,{"data-slot":`controls`,onMouseDown:e=>e.preventDefault(),children:[/* @__PURE__ */ N(`button`,{type:`button`,onClick:()=>t.insert({type:`file`,value:`package.json`,label:`package.json`},{at:`end`,resolve:re()}),children:`Attach File`}),/* @__PURE__ */ N(`button`,{type:`button`,onClick:()=>{let e=n();e&&t.updateToken(e.id,{label:e.value})},children:`Show Path`}),/* @__PURE__ */ N(`button`,{type:`button`,onClick:()=>{let e=n();e&&t.removeToken(e.id)},children:`Remove First`}),/* @__PURE__ */ N(`button`,{type:`button`,onClick:()=>t.undo(),children:`Undo`}),/* @__PURE__ */ N(`button`,{type:`button`,onClick:()=>t.clear(),children:`Clear`})]}),/* @__PURE__ */ N(e,{children:[/* @__PURE__ */ N(s,{children:`Prompt`}),/* @__PURE__ */ N(E,{controller:t,defaultValue:ne,children:/* @__PURE__ */ N(S,{})})]})]})}function ae(){let t=o();return/* @__PURE__ */ N(e,{children:[/* @__PURE__ */ N(s,{children:`Message`}),/* @__PURE__ */ N(E,{submitShortcut:`mod+enter`,onSubmit:e=>t(`Sent ${j(e)}`),children:/* @__PURE__ */ N(S,{placeholder:`Write a message…`})})]})}var oe={name:`token-input`,title:`Token Input`,description:`Mix editable text with tokens for files, people, tags, and other references.`,sections:[{heading:null,text:`A token input is a text field that holds tokens alongside the text, like the people mentioned in a message or the files attached to a prompt. Each token moves, deletes and copies as one piece.`,examples:[{id:`token-input/demo`,caption:`Type @ and choose a person with the arrow keys and Enter. Remove a token with Backspace, or press its remove button.`,Example:z,source:`import { Field, FieldLabel } from "@ui-sdk/react/field"
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