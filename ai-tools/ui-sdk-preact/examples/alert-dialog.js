import{Ac as e,Ba as t,Ga as n,Ha as r,Ka as i,Mo as a,Ua as o,Va as s,Wa as c,fl as l,ja as u,jc as d,ml as f,tl as p,ul as m,za as h}from"../chunks/c-CIXE4Nkk.js";function g(){return/* @__PURE__ */ p(h,{children:[/* @__PURE__ */ p(i,{children:`Delete Project`}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`Delete this project?`}),/* @__PURE__ */ p(o,{children:`This permanently deletes the project, its files and its deployment history for everyone on your team.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Cancel`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`Delete`})]})]})]})}function _(){let[e,a]=l(!1);return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ p(h,{open:e,onOpenChange:a,children:[/* @__PURE__ */ p(i,{children:`Review Changes`}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`Discard unsaved changes?`}),/* @__PURE__ */ p(o,{children:`Your edits will be lost if you leave without saving.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Keep Editing`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`Discard`})]})]})]})})}function v(){return/* @__PURE__ */ p(h,{children:[/* @__PURE__ */ p(i,{shortcut:`mod+shift+h`,children:[`Clear History`,/* @__PURE__ */ p(c,{})]}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`Clear your history?`}),/* @__PURE__ */ p(o,{children:`Recent searches and visited pages are removed from this device.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Cancel`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`Clear`})]})]})]})}function y(){return/* @__PURE__ */ p(h,{children:[/* @__PURE__ */ p(i,{children:`Leave Workspace`}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`Leave this workspace?`}),/* @__PURE__ */ p(o,{children:`You'll lose access to its projects until someone invites you again.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Cancel`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`Leave`})]})]})]})}function b(){let[e,a]=l(!1);return/* @__PURE__ */ p(h,{open:e,onOpenChange:a,children:[/* @__PURE__ */ p(i,{children:`Delete Workspace`}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`Delete this workspace?`}),/* @__PURE__ */ p(o,{children:`All 12 projects and their deployments will be deleted for everyone on your team.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Cancel`}),/* @__PURE__ */ p(h,{onOpenChange:(e,t)=>{!e&&t.returnValue===`confirm`&&a(!1)},children:[/* @__PURE__ */ p(i,{"data-variant":`solid`,children:`Delete`}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`Are you absolutely sure?`}),/* @__PURE__ */ p(o,{children:`There's no way to get the workspace back.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Go Back`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`Delete Workspace`})]})]})]})]})]})]})}function x(){let e=m(0);async function a(){if(await new Promise(e=>setTimeout(e,1200)),e.current++===0)throw Error(`Couldn't delete the project.`)}return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:/* @__PURE__ */ p(h,{pendingAnnouncement:`Deleting project`,children:[/* @__PURE__ */ p(i,{children:`Delete Project`}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`Delete project?`}),/* @__PURE__ */ p(o,{children:`This permanently deletes the project, its files and its deployment history for everyone on your team.`})]}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,action:a,render:(e,t)=>/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`p`,{"data-slot":`hint`,role:`alert`,children:t.error instanceof Error&&t.error.message}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Cancel`}),/* @__PURE__ */ p(`button`,{...e,children:t.pending?`Deleting…`:t.error?`Try Again`:`Delete`})]})]})})]})]})})}function S(){let t=a();async function n(){let n=await e({title:`Archive this project?`,description:`It moves to Archived, and you can restore it anytime.`,confirmLabel:`Archive`});t(n?`Archived the project`:`Kept the project`)}return/* @__PURE__ */ p(f,{children:[/* @__PURE__ */ p(`button`,{type:`button`,onClick:n,children:`Archive Project`}),/* @__PURE__ */ p(u,{})]})}function C(){let[e]=l(()=>d()),[i,a]=l([`Acme`,`Globex`,`Initech`]),c=m(null);async function u(t,n){if(!await e({name:t}))return;let r=n.closest(`li`);((r?.nextElementSibling??r?.previousElementSibling)?.querySelector(`button`)??c.current)?.focus(),a(e=>e.filter(e=>e!==t))}return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ p(`button`,{ref:c,type:`button`,onClick:()=>a([`Acme`,`Globex`,`Initech`]),children:`Reset Projects`})}),/* @__PURE__ */ p(`ul`,{"data-slot":`list`,"aria-label":`Projects`,children:[i.map(e=>/* @__PURE__ */ p(`li`,{"data-slot":`row`,children:[e,/* @__PURE__ */ p(`button`,{type:`button`,"data-size":`sm`,"aria-label":`Delete ${e}`,onClick:t=>u(e,t.currentTarget),children:`Delete`})]},e)),i.length===0&&/* @__PURE__ */ p(`li`,{"data-slot":`row`,children:`All projects deleted.`})]}),/* @__PURE__ */ p(h,{controller:e.controller,children:[/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:e=>/* @__PURE__ */ p(f,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:[`Delete `,e.payload?.name,`?`]}),/* @__PURE__ */ p(o,{children:`The project and its files will be deleted for everyone on your team.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Cancel`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`Delete`})]})]})})]})]})}function w(){let[e]=l(()=>d()),i=a();async function c(){let t=e({name:`Acme`}),n=e({name:`Globex`}),[r,a]=await Promise.all([t,n]);i(`Acme: ${r?`confirmed`:`canceled`}`),i(`Globex: ${a?`confirmed`:`canceled`}`)}return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`button`,{type:`button`,onClick:c,children:`Review Two Projects`}),/* @__PURE__ */ p(h,{controller:e.controller,children:[/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:e=>/* @__PURE__ */ p(f,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:[`Archive `,e.payload?.name,`?`]}),/* @__PURE__ */ p(o,{children:`Archived projects leave the active list. You can restore them later.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`Cancel`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`Archive`})]})]})})]})]})}function T(){return/* @__PURE__ */ p(`div`,{dir:`rtl`,children:/* @__PURE__ */ p(h,{children:[/* @__PURE__ */ p(i,{children:`حذف الحساب`}),/* @__PURE__ */ p(t,{}),/* @__PURE__ */ p(r,{children:[/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(n,{children:`هل أنت متأكد تمامًا؟`}),/* @__PURE__ */ p(o,{children:`لا يمكن التراجع عن هذا الإجراء. سيؤدي إلى حذف حسابك نهائيًا.`})]}),/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(s,{children:`إلغاء`}),/* @__PURE__ */ p(s,{"data-variant":`solid`,value:`confirm`,children:`متابعة`})]})]})]})})}var E={name:`alert-dialog`,title:`Alert Dialog`,description:`Ask someone to confirm an action before you continue.`,sections:[{heading:null,text:`Use an alert dialog when someone needs to answer a question before an action continues, such as deleting a project.`,examples:[{id:`alert-dialog/basic`,caption:`Open the dialog with Enter to start on Cancel. Tab stays inside, clicking outside leaves it open, and Escape closes it and returns focus to the trigger.`,Example:g,source:`import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete Project</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the project, its files and its deployment
            history for everyone on your team.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose data-variant="solid" value="confirm">
            Delete
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:"Pass `open` and `onOpenChange` when your app needs to read or control whether the dialog is open. State and Events explains controlled state and canceling a change.",examples:[{id:`alert-dialog/controlled`,caption:`Choose Review Changes, then Keep Editing or Discard.`,Example:_,source:`"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const [open, setOpen] = React.useState(false)

  return (
    <div data-slot="stack">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Review Changes</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <div data-slot="stack">
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits will be lost if you leave without saving.
            </AlertDialogDescription>
          </div>
          <div data-slot="row">
            <AlertDialogClose>Keep Editing</AlertDialogClose>
            <AlertDialogClose data-variant="solid" value="confirm">
              Discard
            </AlertDialogClose>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Shortcut`,text:"Give the trigger a `shortcut` to open the dialog from the keyboard, and put `AlertDialogShortcut` inside it to show the keys. Dialog covers the shortcut syntax.",examples:[{id:`alert-dialog/shortcut`,caption:`Press Cmd+Shift+H (Ctrl+Shift+H on Windows and Linux) to open the dialog without clicking.`,Example:v,source:`import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogShortcut,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger shortcut="mod+shift+h">
        Clear History
        <AlertDialogShortcut />
      </AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Clear your history?</AlertDialogTitle>
          <AlertDialogDescription>
            Recent searches and visited pages are removed from this device.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose data-variant="solid" value="confirm">
            Clear
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
`}]},{heading:`Animation`,text:"The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the dialog stays mounted until the exit finishes:",examples:[{id:`alert-dialog/animation`,caption:`Open and close the dialog. It slides up and fades in, and slides down and fades out before it unmounts.`,Example:y,source:`import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Leave Workspace</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Leave this workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            You'll lose access to its projects until someone invites you again.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose data-variant="solid" value="confirm">
            Leave
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
`}]},{heading:`Nested`,text:'An alert dialog opened inside another joins its stack, such as a second confirmation before something can\'t be undone. Escape closes the topmost one and returns focus to its trigger. The dialog underneath gets `data-nested-open`, so you can show which layer is active. To close both once the last question is answered, control the outer dialog and close it when the inner one closes with `returnValue` `"confirm"`.',examples:[{id:`alert-dialog/nested`,caption:`Choose Delete Workspace, then Delete. Press Escape to step back to the first question, or choose Delete Workspace to close both.`,Example:b,source:`import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"
import * as React from "react"

function Example() {
  const [open, setOpen] = React.useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>Delete Workspace</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            All 12 projects and their deployments will be deleted for everyone
            on your team.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialog
            onOpenChange={(nested, details) => {
              if (!nested && details.returnValue === "confirm") {
                setOpen(false)
              }
            }}
          >
            <AlertDialogTrigger data-variant="solid">Delete</AlertDialogTrigger>
            <AlertDialogBackdrop />
            <AlertDialogContent>
              <div data-slot="stack">
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  There's no way to get the workspace back.
                </AlertDialogDescription>
              </div>
              <div data-slot="row">
                <AlertDialogClose>Go Back</AlertDialogClose>
                <AlertDialogClose data-variant="solid" value="confirm">
                  Delete Workspace
                </AlertDialogClose>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
`}]},{heading:`Async Action`,text:"An `action` on a Close part runs before it closes the dialog. Return a Promise to keep the dialog open until the work finishes. A resolved Promise closes it with the reason `action`; a rejection keeps it open and puts the error in that part's state.",examples:[{id:`alert-dialog/async-action`,caption:`Choose Delete Project, then Delete. The first attempt fails so you can try again. While Deleting… is shown, Cancel and Escape leave the dialog open. A successful retry closes it.`,Example:x,source:`"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const attempts = React.useRef(0)

  async function deleteProject() {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    if (attempts.current++ === 0) {
      throw new Error("Couldn't delete the project.")
    }
  }

  return (
    <div data-slot="stack">
      <AlertDialog pendingAnnouncement="Deleting project">
        <AlertDialogTrigger>Delete Project</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <div data-slot="stack">
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project, its files and its deployment
              history for everyone on your team.
            </AlertDialogDescription>
          </div>
          <AlertDialogClose
            data-variant="solid"
            value="confirm"
            action={deleteProject}
            render={(props, state) => (
              <div data-slot="stack">
                <p data-slot="hint" role="alert">
                  {state.error instanceof Error && state.error.message}
                </p>
                <div data-slot="row">
                  <AlertDialogClose>Cancel</AlertDialogClose>
                  <button {...props}>
                    {state.pending
                      ? "Deleting…"
                      : state.error
                        ? "Try Again"
                        : "Delete"}
                  </button>
                </div>
              </div>
            )}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Confirm From Anywhere`,text:"The shared `confirm()` asks a question without any dialog markup. Render `OverlayHost` once near the root of your app, and it shows each question as an alert dialog. `confirm()` resolves `true` when someone agrees. Confirm Options lists what you can pass.",examples:[{id:`alert-dialog/confirm-anywhere`,caption:`Choose Archive Project, then Archive or Cancel. The console shows the answer.`,Example:S,source:`import { confirm } from "@ui-sdk/react/alert-dialog"
import { OverlayHost } from "@ui-sdk/react/overlays"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  async function archive() {
    const yes = await confirm({
      title: "Archive this project?",
      description: "It moves to Archived, and you can restore it anytime.",
      confirmLabel: "Archive",
    })
    log(yes ? "Archived the project" : "Kept the project")
  }

  return (
    <>
      <button type="button" onClick={archive}>
        Archive Project
      </button>
      <OverlayHost />
    </>
  )
}

export { Example }
`}]},{heading:`Confirm`,text:"Use `createConfirm<Payload>()` to ask a question from an event handler and await the answer. Create it once, then pass its `controller` to your alert dialog. The content reads the question's data from `state.payload`.",examples:[{id:`alert-dialog/confirm`,caption:`Delete a project. Cancel or Escape keeps it; Delete removes it and focuses a neighboring row's button. Reset Projects brings the list back.`,Example:C,source:`"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  createConfirm,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const [confirm] = React.useState(() => createConfirm<{ name: string }>())
  const [projects, setProjects] = React.useState(["Acme", "Globex", "Initech"])
  const reset = React.useRef<HTMLButtonElement>(null)

  async function remove(name: string, button: HTMLButtonElement) {
    if (!(await confirm({ name }))) {
      return
    }
    const row = button.closest("li")
    const next = (
      row?.nextElementSibling ?? row?.previousElementSibling
    )?.querySelector("button")
    const target = next ?? reset.current
    target?.focus()
    setProjects((list) => list.filter((project) => project !== name))
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          ref={reset}
          type="button"
          onClick={() => setProjects(["Acme", "Globex", "Initech"])}
        >
          Reset Projects
        </button>
      </div>
      <ul data-slot="list" aria-label="Projects">
        {projects.map((name) => (
          <li data-slot="row" key={name}>
            {name}
            <button
              type="button"
              data-size="sm"
              aria-label={\`Delete \${name}\`}
              onClick={(event) => remove(name, event.currentTarget)}
            >
              Delete
            </button>
          </li>
        ))}
        {projects.length === 0 && (
          <li data-slot="row">All projects deleted.</li>
        )}
      </ul>
      <AlertDialog controller={confirm.controller}>
        <AlertDialogBackdrop />
        <AlertDialogContent<{
          name: string
        }>>
          {(state) => (
            <>
              <div data-slot="stack">
                <AlertDialogTitle>
                  Delete {state.payload?.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  The project and its files will be deleted for everyone on your
                  team.
                </AlertDialogDescription>
              </div>
              <div data-slot="row">
                <AlertDialogClose>Cancel</AlertDialogClose>
                <AlertDialogClose data-variant="solid" value="confirm">
                  Delete
                </AlertDialogClose>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
`}]},{heading:`Queued Questions`,text:`Calls to the same confirm function wait their turn. You can ask two questions at once; the second appears only after the first has an answer.`,examples:[{id:`alert-dialog/queue`,caption:`Choose Review Two Projects. Answer the Acme question, then the Globex question. The console shows both answers once the second one is in.`,Example:w,source:`"use client"

import * as React from "react"
import { useLog } from "../../../shared/react/log"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  createConfirm,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const [confirm] = React.useState(() => createConfirm<{ name: string }>())
  const log = useLog()

  async function review() {
    const acme = confirm({ name: "Acme" })
    const globex = confirm({ name: "Globex" })
    const [first, second] = await Promise.all([acme, globex])
    log(\`Acme: \${first ? "confirmed" : "canceled"}\`)
    log(\`Globex: \${second ? "confirmed" : "canceled"}\`)
  }

  return (
    <div data-slot="stack">
      <button type="button" onClick={review}>
        Review Two Projects
      </button>
      <AlertDialog controller={confirm.controller}>
        <AlertDialogBackdrop />
        <AlertDialogContent<{
          name: string
        }>>
          {(state) => (
            <>
              <div data-slot="stack">
                <AlertDialogTitle>
                  Archive {state.payload?.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Archived projects leave the active list. You can restore them
                  later.
                </AlertDialogDescription>
              </div>
              <div data-slot="row">
                <AlertDialogClose>Cancel</AlertDialogClose>
                <AlertDialogClose data-variant="solid" value="confirm">
                  Archive
                </AlertDialogClose>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`alert-dialog/rtl`,caption:``,Example:T,source:`import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

export function Example() {
  return (
    <div dir="rtl">
      <AlertDialog>
        <AlertDialogTrigger>حذف الحساب</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <div data-slot="stack">
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيؤدي إلى حذف حسابك نهائيًا.
            </AlertDialogDescription>
          </div>
          <div data-slot="row">
            <AlertDialogClose>إلغاء</AlertDialogClose>
            <AlertDialogClose data-variant="solid" value="confirm">
              متابعة
            </AlertDialogClose>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
`}]}]};export{E as default};