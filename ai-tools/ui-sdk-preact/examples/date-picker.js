import{t as e}from"../chunks/c-DLjBScCO.js";import{t}from"../chunks/c-DCB4QOj-.js";import{t as n}from"../chunks/c-CU-88Fi-.js";import{t as r}from"../chunks/c-NPxkywtp.js";import{useLog as i}from"./log.js";import*as a from"preact/compat";import{jsx as o,jsxs as s}from"preact/compat/jsx-runtime";import{Field as c,FieldDescription as l,FieldError as u,FieldLabel as d}from"ui-sdk/field.js";import{CalendarDay as f,CalendarGrid as p,CalendarHeading as m,CalendarNext as h,CalendarPrevious as g,CalendarWeekday as _,CalendarWeekdays as v,CalendarWeeks as y,DatePicker as b,DatePickerClear as x,DatePickerContent as S,DatePickerHint as C,DatePickerInput as w,DatePickerPreset as T,DatePickerTrigger as E,createDatePickerController as D}from"ui-sdk/date-picker.js";function O(){return/* @__PURE__ */ s(b,{defaultValue:`2026-10-16`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Due date`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(C,{}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]})}function k(){return/* @__PURE__ */ s(b,{defaultValue:`2026-10-16`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Due date`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]}),/* @__PURE__ */ o(C,{children:e=>`Like ${e.example}`})]})}function A(){let[r,i]=a.useState(null);return/* @__PURE__ */ s(b,{mode:`range`,months:2,monthFormat:`short`,defaultValue:[`2026-10-12`,`2026-10-16`],children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,ref:i,children:[/* @__PURE__ */ o(w,{"aria-label":`Check in`,placeholder:`Check in`}),/* @__PURE__ */ o(`span`,{"data-slot":`hint`,children:`–`}),/* @__PURE__ */ o(w,{end:!0,"aria-label":`Check out`,placeholder:`Check out`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(S,{anchor:r,align:`center`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]}),/* @__PURE__ */ s(p,{offset:1,children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]})]})}function j(){return/* @__PURE__ */ s(b,{mode:`range`,today:`2026-10-16`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Check in`,placeholder:`Check in`}),/* @__PURE__ */ o(`span`,{"data-slot":`hint`,children:`–`}),/* @__PURE__ */ o(w,{end:!0,"aria-label":`Check out`,placeholder:`Check out`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]}),/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(T,{"data-variant":`ghost`,value:[`2026-10-10`,`2026-10-16`],children:`Last 7 Days`}),/* @__PURE__ */ o(T,{"data-variant":`ghost`,value:[`2026-09-17`,`2026-10-16`],children:`Last 30 Days`}),/* @__PURE__ */ o(T,{"data-variant":`ghost`,value:[`2026-10-01`,`2026-10-31`],children:`This Month`})]})]})]})}function M(){return/* @__PURE__ */ s(b,{min:`2026-10-05`,max:`2026-11-20`,unavailable:[{weekday:[0,6]}],defaultValue:`2026-10-16`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Delivery date`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(C,{}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]})}function N(){return/* @__PURE__ */ o(`div`,{lang:`de`,children:/* @__PURE__ */ s(b,{defaultValue:`2026-10-16`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Fälligkeitsdatum`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(C,{}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]})})}function P(){return/* @__PURE__ */ s(b,{defaultValue:`2026-10-16`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Due date`}),/* @__PURE__ */ o(x,{"data-variant":`ghost`,"aria-label":`Clear date`,children:/* @__PURE__ */ o(r,{"aria-hidden":`true`})}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(C,{}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]})}function F(){let[r,i]=a.useState(null),[c,l]=a.useState(!1);return/* @__PURE__ */ s(b,{mode:`range`,defaultMonth:`2026-10`,value:r,onValueChange:e=>{i(e),l(!1)},onOpenChange:e=>e&&l(!1),dismissible:r!==null,onDismissAttempt:()=>l(!0),children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Check in`,placeholder:`Check in`}),/* @__PURE__ */ o(`span`,{"data-slot":`hint`,children:`–`}),/* @__PURE__ */ o(w,{end:!0,"aria-label":`Check out`,placeholder:`Check out`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]}),c&&/* @__PURE__ */ o(`p`,{"data-slot":`hint`,role:`alert`,children:`Pick a check-out date to finish your stay.`})]})]})}function I(){let r=i(),[c,l]=a.useState(null),[u,d]=a.useState(null);return/* @__PURE__ */ s(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(b,{defaultOpen:!1,presentation:`auto`,container:u,onOpenChange:(e,t)=>r(`${e?`Opened`:`Closed`} (${t.reason})`),onOpenChangeComplete:e=>e||r(`Finished closing`),onMonthChange:(e,t)=>r(`Showing ${e} (${t.reason})`),children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,ref:l,children:[/* @__PURE__ */ o(w,{"aria-label":`Due date`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(C,{}),/* @__PURE__ */ s(S,{anchor:c,sideOffset:6,collisionPadding:16,keepMounted:!0,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]}),/* @__PURE__ */ o(`div`,{ref:d})]})}function L(){let r=i();return/* @__PURE__ */ s(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault(),r(`Submitted due=${new FormData(e.currentTarget).get(`due`)}`)},children:[/* @__PURE__ */ s(c,{name:`due`,children:[/* @__PURE__ */ o(d,{children:`Due date`}),/* @__PURE__ */ s(b,{required:!0,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]}),/* @__PURE__ */ o(l,{children:`When the invoice is due.`}),/* @__PURE__ */ o(`div`,{children:/* @__PURE__ */ o(u,{match:`valueMissing`,children:`Choose a due date.`})})]}),/* @__PURE__ */ o(`button`,{type:`submit`,children:`Submit`})]})}function R(){let[r,c]=a.useState(`2026-10-16`),l=i();return/* @__PURE__ */ s(b,{value:r,onValueChange:(e,t)=>{c(e),l(`${e??`No date`} (${t.reason})`)},children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Due date`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(C,{}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]})}const z=D();function B(){return/* @__PURE__ */ s(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ o(`button`,{type:`button`,onClick:()=>z.setValue(`2026-12-25`),children:`Choose Christmas`}),/* @__PURE__ */ o(`button`,{type:`button`,onClick:()=>z.open(),children:`Open`})]}),/* @__PURE__ */ s(b,{controller:z,defaultValue:`2026-10-16`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(w,{"aria-label":`Due date`}),/* @__PURE__ */ o(E,{"data-variant":`ghost`,children:/* @__PURE__ */ o(e,{"aria-hidden":`true`})})]}),/* @__PURE__ */ o(C,{}),/* @__PURE__ */ s(S,{children:[/* @__PURE__ */ s(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ o(g,{"data-variant":`ghost`,children:/* @__PURE__ */ o(t,{"aria-hidden":`true`})}),/* @__PURE__ */ o(m,{}),/* @__PURE__ */ o(h,{"data-variant":`ghost`,children:/* @__PURE__ */ o(n,{"aria-hidden":`true`})})]}),/* @__PURE__ */ s(p,{children:[/* @__PURE__ */ o(v,{children:e=>/* @__PURE__ */ o(_,{index:e})}),/* @__PURE__ */ o(y,{children:e=>/* @__PURE__ */ o(f,{value:e.date})})]})]})]})]})}var V={name:`date-picker`,title:`Date Picker`,description:`Type a date or choose one from a calendar, with support for ranges and forms.`,sections:[{heading:null,text:`Date Picker combines a text field with Calendar. People can type a date in their language or choose it from the popup. Your application receives an ISO date string either way.`,examples:[{id:`date-picker/basic`,caption:`Type a date and press Enter, or open the calendar and choose a day. The field formats the date when you commit it.`,Example:O,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <DatePicker defaultValue="2026-10-16">
      <div data-slot="row">
        <DatePickerInput aria-label="Due date" />
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerHint />
      <DatePickerContent>
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid>
          <CalendarWeekdays>
            {(index) => <CalendarWeekday index={index} />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => <CalendarDay value={cell.date} />}
          </CalendarWeeks>
        </CalendarGrid>
      </DatePickerContent>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Typing a Date`,text:"The input parses text when you press Enter or leave the field. It uses the locale’s date order, such as `10/16/2026` in American English or `16.10.2026` in German. It also accepts ISO dates, digits without separators, two-digit years, and month names in the locale or English. Dates without a year use the current year.",examples:[{id:`date-picker/invalid`,caption:`Type not a date and press Enter to mark the field invalid. Replace it with 10/18/2026 to clear the invalid state.`,Example:k,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <DatePicker defaultValue="2026-10-16">
      <div data-slot="row">
        <DatePickerInput aria-label="Due date" />
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerContent>
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid>
          <CalendarWeekdays>
            {(index) => <CalendarWeekday index={index} />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => <CalendarDay value={cell.date} />}
          </CalendarWeeks>
        </CalendarGrid>
      </DatePickerContent>
      <DatePickerHint>{(state) => \`Like \${state.example}\`}</DatePickerHint>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Range`,text:'`mode="range"` uses one input for the start and another with `end` for the end. The calendar stays open after the start is picked and closes once both dates are chosen. A typed end before the start is invalid.',examples:[{id:`date-picker/range`,caption:`Choose October 20, then October 23. The calendar stays open after the first date and closes after the second.`,Example:A,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"

function Example() {
  const [field, setField] = React.useState<HTMLElement | null>(null)
  return (
    <DatePicker
      mode="range"
      months={2}
      monthFormat="short"
      defaultValue={["2026-10-12", "2026-10-16"]}
    >
      <div data-slot="row" ref={setField}>
        <DatePickerInput aria-label="Check in" placeholder="Check in" />
        <span data-slot="hint">–</span>
        <DatePickerInput end aria-label="Check out" placeholder="Check out" />
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerContent anchor={field} align="center">
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <div data-slot="row">
          <CalendarGrid>
            <CalendarWeekdays>
              {(index) => <CalendarWeekday index={index} />}
            </CalendarWeekdays>
            <CalendarWeeks>
              {(cell) => <CalendarDay value={cell.date} />}
            </CalendarWeeks>
          </CalendarGrid>
          <CalendarGrid offset={1}>
            <CalendarWeekdays>
              {(index) => <CalendarWeekday index={index} />}
            </CalendarWeekdays>
            <CalendarWeeks>
              {(cell) => <CalendarDay value={cell.date} />}
            </CalendarWeeks>
          </CalendarGrid>
        </div>
      </DatePickerContent>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Presets`,text:"`DatePickerPreset` chooses its `value` and closes the popup. It exposes `aria-pressed` and `data-selected` when that value matches the selection. Your application calculates relative dates, such as the last seven days.",examples:[{id:`date-picker/presets`,caption:`Open the calendar and choose Last 7 Days. Reopen it to see the selected preset.`,Example:j,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerPreset,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <DatePicker mode="range" today="2026-10-16">
      <div data-slot="row">
        <DatePickerInput aria-label="Check in" placeholder="Check in" />
        <span data-slot="hint">–</span>
        <DatePickerInput end aria-label="Check out" placeholder="Check out" />
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerContent>
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid>
          <CalendarWeekdays>
            {(index) => <CalendarWeekday index={index} />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => <CalendarDay value={cell.date} />}
          </CalendarWeeks>
        </CalendarGrid>
        <div data-slot="row">
          <DatePickerPreset
            data-variant="ghost"
            value={["2026-10-10", "2026-10-16"]}
          >
            Last 7 Days
          </DatePickerPreset>
          <DatePickerPreset
            data-variant="ghost"
            value={["2026-09-17", "2026-10-16"]}
          >
            Last 30 Days
          </DatePickerPreset>
          <DatePickerPreset
            data-variant="ghost"
            value={["2026-10-01", "2026-10-31"]}
          >
            This Month
          </DatePickerPreset>
        </div>
      </DatePickerContent>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Min, Max and Unavailable Dates`,text:"`min`, `max`, and `unavailable` apply to typing, calendar selection, presets, and the controller. A date outside those rules is invalid when typed, a preset that holds one is disabled, and the controller refuses it. The controller also refuses a value while the picker is disabled or read-only. Calendar explains the available matchers and how unavailable dates differ from the bounds.",examples:[{id:`date-picker/min-max`,caption:`Try typing 11/21/2026, past the last allowed date, then 10/17/2026, a Saturday. Both are invalid and can't be picked; 10/19/2026 is accepted.`,Example:M,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <DatePicker
      min="2026-10-05"
      max="2026-11-20"
      unavailable={[{ weekday: [0, 6] }]}
      defaultValue="2026-10-16"
    >
      <div data-slot="row">
        <DatePickerInput aria-label="Delivery date" />
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerHint />
      <DatePickerContent>
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid>
          <CalendarWeekdays>
            {(index) => <CalendarWeekday index={index} />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => <CalendarDay value={cell.date} />}
          </CalendarWeeks>
        </CalendarGrid>
      </DatePickerContent>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Language`,text:"`locale` sets the input’s format, hint, month names, and date labels. If you omit it, Date Picker reads the surrounding page’s `lang` after it mounts, with the browser’s language as a fallback. The initial server and client render use English, so they always match. Date strings remain Gregorian ISO dates.",examples:[{id:`date-picker/locale`,caption:`Enter 3.12.2026 and press Enter. The field, format hint, and calendar use German dates.`,Example:N,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <div lang="de">
      <DatePicker defaultValue="2026-10-16">
        <div data-slot="row">
          <DatePickerInput aria-label="Fälligkeitsdatum" />
          <DatePickerTrigger data-variant="ghost">
            <CalendarIcon aria-hidden="true" />
          </DatePickerTrigger>
        </div>
        <DatePickerHint />
        <DatePickerContent>
          <div data-slot="row">
            <CalendarPrevious data-variant="ghost">
              <ChevronLeftIcon aria-hidden="true" />
            </CalendarPrevious>
            <CalendarHeading />
            <CalendarNext data-variant="ghost">
              <ChevronRightIcon aria-hidden="true" />
            </CalendarNext>
          </div>
          <CalendarGrid>
            <CalendarWeekdays>
              {(index) => <CalendarWeekday index={index} />}
            </CalendarWeekdays>
            <CalendarWeeks>
              {(cell) => <CalendarDay value={cell.date} />}
            </CalendarWeeks>
          </CalendarGrid>
        </DatePickerContent>
      </DatePicker>
    </div>
  )
}

export { Example }
`}]},{heading:`Clear`,text:"`DatePickerClear` clears the value and focuses the input. It gets `data-empty` when there is nothing to clear. Emptying a single-date input clears its value too.",examples:[{id:`date-picker/clear`,caption:`Press Clear to empty the value and focus the input. The Clear button disappears until there is a value again.`,Example:P,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerClear,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react"

function Example() {
  return (
    <DatePicker defaultValue="2026-10-16">
      <div data-slot="row">
        <DatePickerInput aria-label="Due date" />
        <DatePickerClear data-variant="ghost" aria-label="Clear date">
          <XIcon aria-hidden="true" />
        </DatePickerClear>
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerHint />
      <DatePickerContent>
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid>
          <CalendarWeekdays>
            {(index) => <CalendarWeekday index={index} />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => <CalendarDay value={cell.date} />}
          </CalendarWeeks>
        </CalendarGrid>
      </DatePickerContent>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Keep It Open Until Both Dates Are Picked`,text:"Set `dismissible` to `false` while a choice is incomplete. Escape, an outside press, or the system back gesture then leave the popup open. `onDismissAttempt` reports intentional attempts, so you can explain what is missing. Focus leaving is refused quietly. The trigger and imperative controls can still close it.",examples:[{id:`date-picker/dismissible`,caption:`Choose a check-in date, then press outside the calendar. The message asks for a check-out date before the popup can be dismissed.`,Example:F,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
  type DatePickerValue,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"

function Example() {
  const [value, setValue] = React.useState<DatePickerValue>(null)
  const [asking, setAsking] = React.useState(false)
  return (
    <DatePicker
      mode="range"
      defaultMonth="2026-10"
      value={value}
      onValueChange={(next) => {
        setValue(next)
        setAsking(false)
      }}
      onOpenChange={(open) => open && setAsking(false)}
      dismissible={value !== null}
      onDismissAttempt={() => setAsking(true)}
    >
      <div data-slot="row">
        <DatePickerInput aria-label="Check in" placeholder="Check in" />
        <span data-slot="hint">–</span>
        <DatePickerInput end aria-label="Check out" placeholder="Check out" />
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerContent>
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid>
          <CalendarWeekdays>
            {(index) => <CalendarWeekday index={index} />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => <CalendarDay value={cell.date} />}
          </CalendarWeeks>
        </CalendarGrid>
        {asking && (
          <p data-slot="hint" role="alert">
            Pick a check-out date to finish your stay.
          </p>
        )}
      </DatePickerContent>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Popup and Presentation`,text:"`DatePickerContent` opens below the input by default. Position it with `side`, `align`, and offsets, or provide a custom `anchor`. `container` changes where it renders; `keepMounted` retains it while closed, and `finalFocus` controls focus after it closes. Popups covers these shared options.",examples:[{id:`date-picker/popup`,caption:`Open the calendar. On a small touch screen it opens as a sheet, and the console logs each open, close and month change.`,Example:I,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"

function Example() {
  const log = useLog()
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)
  const [container, setContainer] = React.useState<HTMLElement | null>(null)
  return (
    <div data-slot="stack">
      <DatePicker
        defaultOpen={false}
        presentation="auto"
        container={container}
        onOpenChange={(open, details) =>
          log(\`\${open ? "Opened" : "Closed"} (\${details.reason})\`)
        }
        onOpenChangeComplete={(open) => open || log("Finished closing")}
        onMonthChange={(month, details) =>
          log(\`Showing \${month} (\${details.reason})\`)
        }
      >
        <div data-slot="row" ref={setAnchor}>
          <DatePickerInput aria-label="Due date" />
          <DatePickerTrigger data-variant="ghost">
            <CalendarIcon aria-hidden="true" />
          </DatePickerTrigger>
        </div>
        <DatePickerHint />
        <DatePickerContent
          anchor={anchor}
          sideOffset={6}
          collisionPadding={16}
          keepMounted
        >
          <div data-slot="row">
            <CalendarPrevious data-variant="ghost">
              <ChevronLeftIcon aria-hidden="true" />
            </CalendarPrevious>
            <CalendarHeading />
            <CalendarNext data-variant="ghost">
              <ChevronRightIcon aria-hidden="true" />
            </CalendarNext>
          </div>
          <CalendarGrid>
            <CalendarWeekdays>
              {(index) => <CalendarWeekday index={index} />}
            </CalendarWeekdays>
            <CalendarWeeks>
              {(cell) => <CalendarDay value={cell.date} />}
            </CalendarWeeks>
          </CalendarGrid>
        </DatePickerContent>
      </DatePicker>
      <div ref={setContainer} />
    </div>
  )
}

export { Example }
`}]},{heading:`Forms`,text:"`name` submits an ISO date. In range mode, use `startName` and `endName` for separate fields, or `name` to submit both ends under the same name. `required` blocks an empty submission, text that isn't a date blocks one too, a form reset restores `defaultValue`, and a disabled `fieldset` disables the picker. Server-rendered hidden inputs submit the initial value before hydration too.",examples:[{id:`date-picker/form`,caption:`Press Submit with an empty field to see the inline error, then choose a date and submit. The console logs the ISO date.`,Example:L,source:`"use client"

import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(\`Submitted due=\${new FormData(event.currentTarget).get("due")}\`)
      }}
    >
      <Field name="due">
        <FieldLabel>Due date</FieldLabel>
        <DatePicker required>
          <div data-slot="row">
            <DatePickerInput />
            <DatePickerTrigger data-variant="ghost">
              <CalendarIcon aria-hidden="true" />
            </DatePickerTrigger>
          </div>
          <DatePickerContent>
            <div data-slot="row">
              <CalendarPrevious data-variant="ghost">
                <ChevronLeftIcon aria-hidden="true" />
              </CalendarPrevious>
              <CalendarHeading />
              <CalendarNext data-variant="ghost">
                <ChevronRightIcon aria-hidden="true" />
              </CalendarNext>
            </div>
            <CalendarGrid>
              <CalendarWeekdays>
                {(index) => <CalendarWeekday index={index} />}
              </CalendarWeekdays>
              <CalendarWeeks>
                {(cell) => <CalendarDay value={cell.date} />}
              </CalendarWeeks>
            </CalendarGrid>
          </DatePickerContent>
        </DatePicker>
        <FieldDescription>When the invoice is due.</FieldDescription>
        <div>
          <FieldError match="valueMissing">Choose a due date.</FieldError>
        </div>
      </Field>
      <button type="submit">Submit</button>
    </form>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:'The selected value, displayed month, and open state are separate. `value` uses the shape for the chosen mode; `month` is the first displayed month, such as `"2026-10"`; `open` is a boolean.',examples:[{id:`date-picker/controlled`,caption:`Type or choose a date. The console logs each value and the reason for the change.`,Example:R,source:`import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"
import * as React from "react"
import type { DatePickerValue } from "@ui-sdk/react/date-picker"

function Example() {
  const [value, setValue] = React.useState<DatePickerValue>("2026-10-16")
  const log = useLog()
  return (
    <DatePicker
      value={value}
      onValueChange={(next, details) => {
        setValue(next)
        log(\`\${next ?? "No date"} (\${details.reason})\`)
      }}
    >
      <div data-slot="row">
        <DatePickerInput aria-label="Due date" />
        <DatePickerTrigger data-variant="ghost">
          <CalendarIcon aria-hidden="true" />
        </DatePickerTrigger>
      </div>
      <DatePickerHint />
      <DatePickerContent>
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid>
          <CalendarWeekdays>
            {(index) => <CalendarWeekday index={index} />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => <CalendarDay value={cell.date} />}
          </CalendarWeeks>
        </CalendarGrid>
      </DatePickerContent>
    </DatePicker>
  )
}

export { Example }
`}]},{heading:`Driving It from Anywhere`,text:"A `createDatePickerController()` instance can set the value, show a month, open or close the popup, and focus a date in the open calendar. Controllers covers setup and lifecycle; the controller reference lists the methods.",examples:[{id:`date-picker/controller`,caption:`Press Choose Christmas to set the date from outside, or Open to open the calendar.`,Example:B,source:`import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  createDatePickerController,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const controller = createDatePickerController()

function Example() {
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => controller.setValue("2026-12-25")}>
          Choose Christmas
        </button>
        <button type="button" onClick={() => controller.open()}>
          Open
        </button>
      </div>
      <DatePicker controller={controller} defaultValue="2026-10-16">
        <div data-slot="row">
          <DatePickerInput aria-label="Due date" />
          <DatePickerTrigger data-variant="ghost">
            <CalendarIcon aria-hidden="true" />
          </DatePickerTrigger>
        </div>
        <DatePickerHint />
        <DatePickerContent>
          <div data-slot="row">
            <CalendarPrevious data-variant="ghost">
              <ChevronLeftIcon aria-hidden="true" />
            </CalendarPrevious>
            <CalendarHeading />
            <CalendarNext data-variant="ghost">
              <ChevronRightIcon aria-hidden="true" />
            </CalendarNext>
          </div>
          <CalendarGrid>
            <CalendarWeekdays>
              {(index) => <CalendarWeekday index={index} />}
            </CalendarWeekdays>
            <CalendarWeeks>
              {(cell) => <CalendarDay value={cell.date} />}
            </CalendarWeeks>
          </CalendarGrid>
        </DatePickerContent>
      </DatePicker>
    </div>
  )
}

export { Example }
`}]}]};export{V as default};