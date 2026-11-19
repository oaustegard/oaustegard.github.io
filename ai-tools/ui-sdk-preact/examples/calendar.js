import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-CA3STxaZ.js";import{t as n}from"../chunks/c-DCB4QOj-.js";import{t as r}from"../chunks/c-CU-88Fi-.js";import{useLog as i}from"./log.js";import*as a from"preact/compat";import{Fragment as o,jsx as s,jsxs as c}from"preact/compat/jsx-runtime";import{Select as l,SelectContent as u,SelectItem as d,SelectItemIndicator as f,SelectTrigger as p,SelectValue as m}from"ui-sdk/select.js";import{Calendar as h,CalendarDay as g,CalendarGrid as _,CalendarHeading as v,CalendarMonthSelect as y,CalendarNext as b,CalendarPrevious as x,CalendarWeekday as S,CalendarWeekdays as C,CalendarWeeks as w,CalendarYearSelect as T,createCalendarController as E}from"ui-sdk/calendar.js";import{addDays as D,endOfMonth as O,startOfMonth as ee,todayDate as k}from"ui-sdk/core/date.js";function A(){return/* @__PURE__ */ c(h,{defaultValue:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function j(){return/* @__PURE__ */ c(h,{mode:`range`,months:2,monthFormat:`short`,defaultValue:[`2026-10-12`,`2026-10-16`],children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(_,{offset:0,children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]}),/* @__PURE__ */ c(_,{offset:1,children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})]})}function M(){let[e,t]=a.useState([`2026-10-07`,`2026-10-16`,`2026-10-26`]);return/* @__PURE__ */ s(`div`,{children:/* @__PURE__ */ c(h,{mode:`multiple`,value:e,onValueChange:e=>t(e),children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})})}const N=[`2026-10-08`,{from:`2026-10-20`,to:`2026-10-23`},{weekday:[0,6]}];function P(){return/* @__PURE__ */ c(h,{unavailable:N,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function F(){return/* @__PURE__ */ c(h,{defaultValue:`2026-10-16`,min:`2026-10-05`,max:`2026-11-20`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function I(){return/* @__PURE__ */ c(h,{disabled:!0,defaultValue:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function L(){return/* @__PURE__ */ c(h,{readOnly:!0,defaultValue:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function R(){return/* @__PURE__ */ c(h,{months:2,pageBy:`page`,monthFormat:`short`,defaultValue:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(_,{offset:0,children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]}),/* @__PURE__ */ c(_,{offset:1,children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})]})}function z(){return/* @__PURE__ */ c(h,{fixedWeeks:!0,showOutsideDays:!1,defaultMonth:`2026-02`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function B(){return/* @__PURE__ */ c(h,{defaultMonth:`1990-06`,min:`1920-01-01`,max:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(y,{}),/* @__PURE__ */ s(T,{})]}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}const V=[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`].map((e,t)=>({value:String(t+1).padStart(2,`0`),label:e})),H=[`2024`,`2025`,`2026`,`2027`,`2028`].map(e=>({value:e,label:e}));function U(){let[n,r]=a.useState(`2026-10`),[i,o]=n.split(`-`);return/* @__PURE__ */ c(h,{month:n,onMonthChange:r,defaultValue:`2026-10-16`,min:`2024-01-01`,max:`2028-12-31`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(v,{}),/* @__PURE__ */ c(l,{items:V,value:o,onValueChange:e=>e&&r(`${i}-${e}`),children:[/* @__PURE__ */ c(p,{"aria-label":`Month`,children:[/* @__PURE__ */ s(m,{}),/* @__PURE__ */ s(t,{})]}),/* @__PURE__ */ s(u,{children:V.map(t=>/* @__PURE__ */ c(d,{value:t.value,children:[t.label,/* @__PURE__ */ s(f,{children:/* @__PURE__ */ s(e,{})})]},t.value))})]}),/* @__PURE__ */ c(l,{items:H,value:i,onValueChange:e=>e&&r(`${e}-${o}`),children:[/* @__PURE__ */ c(p,{"aria-label":`Year`,children:[/* @__PURE__ */ s(m,{}),/* @__PURE__ */ s(t,{})]}),/* @__PURE__ */ s(u,{children:H.map(t=>/* @__PURE__ */ c(d,{value:t.value,children:[t.label,/* @__PURE__ */ s(f,{children:/* @__PURE__ */ s(e,{})})]},t.value))})]})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function W(){return/* @__PURE__ */ c(h,{locale:`de-DE`,weekStartsOn:1,weekdayFormat:`narrow`,defaultValue:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function G(){return/* @__PURE__ */ c(h,{months:2,pageBy:`page`,defaultValue:`2026-10-16`,weekdayFormat:`narrow`,monthFormat:`short`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ c(_,{offset:0,children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]}),/* @__PURE__ */ c(_,{offset:1,children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})]})}const K=e=>80+Number(e.slice(8))*7%5*10;function q(){return/* @__PURE__ */ c(h,{today:`2026-10-16`,defaultValue:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e,children:e=>/* @__PURE__ */ s(`abbr`,{title:e.name,"data-weekend":e.weekday===0||e.weekday===6||void 0,children:e.label})})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date,children:e=>/* @__PURE__ */ c(`span`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`span`,{children:e.label}),!e.outside&&!e.disabled&&/* @__PURE__ */ c(`span`,{"data-slot":`hint`,children:[`$`,K(e.date)]})]})})})]})]})}function J(){return/* @__PURE__ */ c(h,{mode:`range`,minDays:3,maxDays:8,unavailable:{from:`2026-10-17`,to:`2026-10-18`},allowUnavailable:!0,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})}function Y(){let e=i();return/* @__PURE__ */ s(`div`,{children:/* @__PURE__ */ c(h,{mode:`range`,onAnchorChange:t=>e(t?`Started on ${t}`:`Range finished`),onFocusedChange:t=>e(`Focus on ${t}`),children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})})}function X(){let[e,t]=a.useState(`2026-10-16`),[o,l]=a.useState(`2026-10`),u=i();return/* @__PURE__ */ s(`div`,{children:/* @__PURE__ */ c(h,{value:e,onValueChange:(e,n)=>{t(e),u(`Selected ${String(e)} (${n.reason})`)},month:o,onMonthChange:(e,t)=>{l(e),u(`Showing ${e} (${t.reason})`)},children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})})}function Z(){return/* @__PURE__ */ c(`div`,{children:[/* @__PURE__ */ c(h,{timeZone:`Pacific/Kiritimati`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]}),/* @__PURE__ */ s(`p`,{"data-slot":`hint`,children:`Today is marked as it is in Kiritimati, the first place to see each new day.`})]})}function Q(){let[e]=a.useState(()=>E()),t=t=>{e.setValue(t),e.focus(t)};return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>t(`2026-12-25`),children:`Go to Christmas`}),/* @__PURE__ */ s(`button`,{type:`button`,onClick:()=>t(k()),children:`Today`})]}),/* @__PURE__ */ c(h,{controller:e,defaultValue:`2026-10-16`,defaultMonth:`2026-10`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})]})}const $=`2026-10-16`,te=[{label:`Last 7 Days`,range:[D($,-6),$]},{label:`This Month`,range:[ee($),O($)]},{label:`Next 30 Days`,range:[$,D($,29)]}];function ne(){let[e]=a.useState(()=>E());return/* @__PURE__ */ c(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ s(`div`,{"data-slot":`controls`,children:te.map(t=>/* @__PURE__ */ s(`button`,{type:`button`,"data-size":`sm`,onClick:()=>{e.setValue([...t.range]),e.focus(t.range[0])},children:t.label},t.label))}),/* @__PURE__ */ c(h,{mode:`range`,controller:e,today:$,defaultMonth:`2026-10`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{"aria-hidden":`true`})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{"aria-hidden":`true`})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})]})}function re(e){let t=/* @__PURE__ */ new Date(`${e}T00:00:00Z`);t.setUTCDate(t.getUTCDate()+3-(t.getUTCDay()+6)%7);let n=new Date(Date.UTC(t.getUTCFullYear(),0,4)),r=(t.getTime()-n.getTime())/864e5;return 1+Math.round((r-3+(n.getUTCDay()+6)%7)/7)}function ie(){return/* @__PURE__ */ c(h,{defaultValue:`2026-10-16`,weekStartsOn:1,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,render:(e,t)=>/* @__PURE__ */ s(`button`,{...e,title:`Show ${t.month}`}),children:/* @__PURE__ */ s(n,{})}),/* @__PURE__ */ s(v,{children:e=>e.label}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{})})]}),/* @__PURE__ */ s(_,{children:e=>/* @__PURE__ */ c(o,{children:[/* @__PURE__ */ s(`thead`,{children:/* @__PURE__ */ c(`tr`,{children:[/* @__PURE__ */ s(`th`,{scope:`col`,children:/* @__PURE__ */ s(`abbr`,{title:`Week`,children:`Wk`})}),e.weekdays.map((e,t)=>/* @__PURE__ */ s(S,{index:t},e))]})}),/* @__PURE__ */ s(`tbody`,{children:e.weeks.map(e=>/* @__PURE__ */ c(`tr`,{children:[/* @__PURE__ */ s(`th`,{scope:`row`,"data-slot":`hint`,children:re(e[0].date)}),e.map(e=>e.hidden?/* @__PURE__ */ s(`td`,{},e.date):/* @__PURE__ */ s(g,{value:e.date},e.date))]},e[0].date))})]})})]})}function ae(){return/* @__PURE__ */ s(`div`,{dir:`rtl`,lang:`ar`,children:/* @__PURE__ */ c(h,{defaultValue:`2026-10-16`,children:[/* @__PURE__ */ c(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ s(x,{"data-variant":`ghost`,children:/* @__PURE__ */ s(n,{})}),/* @__PURE__ */ s(v,{}),/* @__PURE__ */ s(b,{"data-variant":`ghost`,children:/* @__PURE__ */ s(r,{})})]}),/* @__PURE__ */ c(_,{children:[/* @__PURE__ */ s(C,{children:e=>/* @__PURE__ */ s(S,{index:e})}),/* @__PURE__ */ s(w,{children:e=>/* @__PURE__ */ s(g,{value:e.date})})]})]})})}var oe={name:`calendar`,title:`Calendar`,description:`Choose one date, several dates, or a range from a month grid.`,sections:[{heading:null,text:`Calendar shows dates directly on the page. Use it for a booking flow, a schedule, or any place where the dates should stay visible. For a text field that opens a calendar, use Date Picker.`,examples:[{id:`calendar/basic`,caption:`Choose a date, then use Previous or Next to change the month. Arrow keys move through the days.`,Example:A,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar defaultValue="2026-10-16">
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Range`,text:'`mode="range"` chooses a start and then an end. Moving the pointer or focus previews the range; the value changes once both ends are chosen. A date before the start ends it too, and becomes the start. Escape cancels an unfinished range.',examples:[{id:`calendar/range`,caption:`Choose a start date, then move to an end date to preview the range. Choose the end to finish, or press Escape to cancel the unfinished range.`,Example:j,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar
      mode="range"
      months={2}
      monthFormat="short"
      defaultValue={["2026-10-12", "2026-10-16"]}
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
      <div data-slot="row">
        <CalendarGrid offset={0}>
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Multiple`,text:'`mode="multiple"` toggles each date independently. Its value is a sorted array, even when dates were chosen in another order.',examples:[{id:`calendar/multiple`,caption:`Choose another date to add it, or choose a selected date to remove it.`,Example:M,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"

function Example() {
  const [dates, setDates] = React.useState<string[]>([
    "2026-10-07",
    "2026-10-16",
    "2026-10-26",
  ])
  return (
    <div>
      <Calendar
        mode="multiple"
        value={dates}
        onValueChange={(value) => setDates(value as string[])}
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
      </Calendar>
    </div>
  )
}

export { Example }
`}]},{heading:`Unavailable Dates`,text:"`unavailable` accepts a date, `{ from, to }`, `{ weekday: [0, 6] }` for weekends, `{ before }`, `{ after }`, a predicate, or an array of these matchers. Weekday zero is Sunday.",examples:[{id:`calendar/unavailable`,caption:`Try an unavailable date, then choose an available one. Unavailable days remain focusable so their state can be heard.`,Example:P,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const unavailable = [
  "2026-10-08",
  { from: "2026-10-20", to: "2026-10-23" },
  { weekday: [0, 6] },
]

function Example() {
  return (
    <Calendar unavailable={unavailable}>
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Min and Max`,text:"`min` and `max` set the earliest and latest selectable dates. Dates outside those bounds cannot receive focus. Arrow keys stop at the bounds, and Previous and Next stop at their months.",examples:[{id:`calendar/min-max`,caption:`Move toward either end of the allowed dates. Keyboard navigation and month buttons stop at the limits.`,Example:F,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar defaultValue="2026-10-16" min="2026-10-05" max="2026-11-20">
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Disabled and Read Only`,text:"`disabled` prevents focus, selection, and month navigation. `readOnly` allows navigation so dates can be inspected, but keeps the selected value unchanged.",examples:[{id:`calendar/disabled`,caption:`Try choosing a date or changing months. A disabled calendar has no available controls.`,Example:I,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar disabled defaultValue="2026-10-16">
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
    </Calendar>
  )
}

export { Example }
`},{id:`calendar/read-only`,caption:`Move through dates and months. The selected value stays unchanged.`,Example:L,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar readOnly defaultValue="2026-10-16">
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Two Months`,text:"Set `months` to `2` and render grids with offsets `0` and `1`. Arrow keys move between the grids without turning the page. Dates that another visible month already shows leave an empty cell, so each date appears once.",examples:[{id:`calendar/two-months`,caption:`Move between October and November with arrow keys. Next advances both visible months to December and January.`,Example:R,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar
      months={2}
      pageBy="page"
      monthFormat="short"
      defaultValue="2026-10-16"
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
      <div data-slot="row">
        <CalendarGrid offset={0}>
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Fixed Weeks`,text:"`fixedWeeks` renders six week rows in every month. Set `showOutsideDays` to `false` to leave dates from neighboring months blank.",examples:[{id:`calendar/fixed-weeks`,caption:`Move from February to March. Both grids keep six week rows, and dates outside each month are hidden.`,Example:z,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar fixedWeeks showOutsideDays={false} defaultMonth="2026-02">
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Month and Year Selects`,text:"`CalendarMonthSelect` and `CalendarYearSelect` are native selects for jumping directly to a date, such as a birthday. The year options run from `min` to `max`, or ten years either side of the current year shown when bounds are missing. Months outside the bounds are disabled.",examples:[{id:`calendar/month-year-select`,caption:`Choose a year and month to jump directly to a birthday, then choose the day.`,Example:B,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarMonthSelect,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  CalendarYearSelect,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar defaultMonth="1990-06" min="1920-01-01" max="2026-10-16">
      <div data-slot="row">
        <CalendarPrevious data-variant="ghost">
          <ChevronLeftIcon aria-hidden="true" />
        </CalendarPrevious>
        <CalendarHeading />
        <div data-slot="row">
          <CalendarMonthSelect />
          <CalendarYearSelect />
        </div>
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Custom Month and Year Selects`,text:"The month and year selects are native `select` elements. To use your own select, control the calendar's `month` and drive it from your select's value, as with the Select component here. Keep a `CalendarHeading` in the calendar, visually hidden if you like, so a month change is still announced. Each grid names itself.",examples:[{id:`calendar/custom-select`,caption:`Choose a month or a year from the selects. The calendar follows, and the arrow keys still move between days.`,Example:U,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, index) => ({ value: String(index + 1).padStart(2, "0"), label }))
const years = ["2024", "2025", "2026", "2027", "2028"].map((year) => ({
  value: year,
  label: year,
}))

function Example() {
  const [month, setMonth] = React.useState("2026-10")
  const [year, monthOfYear] = month.split("-")

  return (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      defaultValue="2026-10-16"
      min="2024-01-01"
      max="2028-12-31"
    >
      <div data-slot="row">
        <CalendarHeading />
        <Select
          items={months}
          value={monthOfYear}
          onValueChange={(next) => next && setMonth(\`\${year}-\${next}\`)}
        >
          <SelectTrigger aria-label="Month">
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {months.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={years}
          value={year}
          onValueChange={(next) => next && setMonth(\`\${next}-\${monthOfYear}\`)}
        >
          <SelectTrigger aria-label="Year">
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {years.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CalendarGrid>
        <CalendarWeekdays>
          {(index) => <CalendarWeekday index={index} />}
        </CalendarWeekdays>
        <CalendarWeeks>
          {(cell) => <CalendarDay value={cell.date} />}
        </CalendarWeeks>
      </CalendarGrid>
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Language`,text:'`locale` controls month names, weekday headers, and full date labels. If you omit it, Calendar reads the surrounding page’s `lang` after it mounts, with the browser’s language as a fallback. The initial server and client render use English, so they always match. The first weekday follows the locale, and so changes after mount too, unless `weekStartsOn` sets it. `weekdayFormat` accepts `"narrow"`, `"short"`, or `"long"`.',examples:[{id:`calendar/locale`,caption:`Move through the calendar. Month names, weekday headers, and full date labels are in German, with Monday first.`,Example:W,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar
      locale="de-DE"
      weekStartsOn={1}
      weekdayFormat="narrow"
      defaultValue="2026-10-16"
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Name Formats`,text:'Set `weekdayFormat` for the weekday headers and `monthFormat` for the heading and the month select. Both take `"narrow"`, `"short"` or `"long"`, and follow the calendar\'s locale. Screen readers still hear full names: the grid and each day keep their long labels.',examples:[{id:`calendar/formats`,caption:`The weekday headers are narrow and the heading uses short month names: Oct – Nov 2026.`,Example:G,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar
      months={2}
      pageBy="page"
      defaultValue="2026-10-16"
      weekdayFormat="narrow"
      monthFormat="short"
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
      <div data-slot="row">
        <CalendarGrid offset={0}>
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Custom Days`,text:`A day’s children receive its state, including the date, label, selection, and whether it is outside the month. This example adds a price below each day. Weekday headers can have custom content too.`,examples:[{id:`calendar/custom-day`,caption:`Choose a date to see its price selected with it. Dates outside the current month have no price.`,Example:q,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const priceOf = (date: string) => 80 + ((Number(date.slice(8)) * 7) % 5) * 10

function Example() {
  return (
    <Calendar today="2026-10-16" defaultValue="2026-10-16">
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
          {(index) => (
            <CalendarWeekday index={index}>
              {(state) => (
                <abbr
                  title={state.name}
                  data-weekend={
                    state.weekday === 0 || state.weekday === 6 || undefined
                  }
                >
                  {state.label}
                </abbr>
              )}
            </CalendarWeekday>
          )}
        </CalendarWeekdays>
        <CalendarWeeks>
          {(cell) => (
            <CalendarDay value={cell.date}>
              {(state) => (
                <span data-slot="stack">
                  <span>{state.label}</span>
                  {!state.outside && !state.disabled && (
                    <span data-slot="hint">\${priceOf(state.date)}</span>
                  )}
                </span>
              )}
            </CalendarDay>
          )}
        </CalendarWeeks>
      </CalendarGrid>
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Range Limits`,text:"`minDays` and `maxDays` count both ends. A three-day range includes its start, the day between, and its end. A press that would break a limit keeps the start, so another end can be chosen. Until then, the dates that can't end the range are disabled.",examples:[{id:`calendar/range-limits`,caption:`In October 2026, choose October 15 then October 20. This example accepts 3–8 days and allows the range to span the unavailable weekend.`,Example:J,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Calendar
      mode="range"
      minDays={3}
      maxDays={8}
      unavailable={{ from: "2026-10-17", to: "2026-10-18" }}
      allowUnavailable
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
    </Calendar>
  )
}

export { Example }
`}]},{heading:`Range in Progress`,text:"The root's state has `anchor`, the start while an end is being picked, and `focused`, the date with the Tab stop. `onAnchorChange` and `onFocusedChange` report them before they change, to show the range being picked outside the calendar, and canceling either keeps things as they were. A day that takes focus because the months turned reports nothing.",examples:[{id:`calendar/range-progress`,caption:`Choose a start date, then move with the arrow keys. The console logs the start and each focused date until Enter picks the end.`,Example:Y,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  return (
    <div>
      <Calendar
        mode="range"
        onAnchorChange={(anchor) =>
          log(anchor ? \`Started on \${anchor}\` : "Range finished")
        }
        onFocusedChange={(focused) => log(\`Focus on \${focused}\`)}
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
      </Calendar>
    </div>
  )
}

export { Example }
`}]},{heading:`Controlled`,text:'The selection and displayed month are separate. `value` uses the shape for the chosen mode; `month` names the first displayed month, such as `"2026-10"`.',examples:[{id:`calendar/controlled`,caption:`Choose a date or change the month. The console logs each change and its reason.`,Example:X,source:`import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  type CalendarValue,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

export function Example() {
  const [value, setValue] = React.useState<CalendarValue>("2026-10-16")
  const [month, setMonth] = React.useState("2026-10")
  const log = useLog()
  return (
    <div>
      <Calendar
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(\`Selected \${String(next)} (\${details.reason})\`)
        }}
        month={month}
        onMonthChange={(next, details) => {
          setMonth(next)
          log(\`Showing \${next} (\${details.reason})\`)
        }}
      >
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon />
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
      </Calendar>
    </div>
  )
}
`}]},{heading:`Today`,text:'Today gets `aria-current="date"` and `data-today`. When there is no selection or starting month, the calendar opens on today’s month. It reads today on the client; set `today` to pin a date explicitly.',examples:[{id:`calendar/time-zone`,caption:`Find the marked date for today in Pacific/Kiritimati, which may differ from today in your time zone.`,Example:Z,source:`"use client"

import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <div>
      <Calendar timeZone="Pacific/Kiritimati">
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
      </Calendar>
      <p data-slot="hint">
        Today is marked as it is in Kiritimati, the first place to see each new
        day.
      </p>
    </div>
  )
}

export { Example }
`}]},{heading:`Driving It from Anywhere`,text:"A `createCalendarController()` instance can set the value, change months, and focus a date. Focusing a date in another month shows that month first. Controllers covers setup and lifecycle.",examples:[{id:`calendar/controller`,caption:`Press Go to Christmas to select December 25 and move focus there, or Today to jump back to today and select it.`,Example:Q,source:`"use client"

import { todayDate } from "@ui-sdk/core/date"
import * as React from "react"
import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  createCalendarController,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function Example() {
  const [calendar] = React.useState(() => createCalendarController())
  const select = (date: string) => {
    calendar.setValue(date)
    calendar.focus(date)
  }
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => select("2026-12-25")}>
          Go to Christmas
        </button>
        <button type="button" onClick={() => select(todayDate())}>
          Today
        </button>
      </div>
      <Calendar
        controller={calendar}
        defaultValue="2026-10-16"
        defaultMonth="2026-10"
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
      </Calendar>
    </div>
  )
}

export { Example }
`}]},{heading:`Presets`,text:`Drive a range calendar from buttons for the ranges people pick most. Each preset sets the value through the controller and moves focus to its first day, using the date helpers for the arithmetic.`,examples:[{id:`calendar/presets`,caption:`Choose Last 7 Days, This Month or Next 30 Days. The range is selected and the calendar shows its start.`,Example:ne,source:`"use client"

import { addDays, endOfMonth, startOfMonth } from "@ui-sdk/core/date"
import * as React from "react"
import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  createCalendarController,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const today = "2026-10-16"
const presets = [
  { label: "Last 7 Days", range: [addDays(today, -6), today] },
  { label: "This Month", range: [startOfMonth(today), endOfMonth(today)] },
  { label: "Next 30 Days", range: [today, addDays(today, 29)] },
] as const

function Example() {
  const [calendar] = React.useState(() => createCalendarController())

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            data-size="sm"
            onClick={() => {
              calendar.setValue([...preset.range])
              calendar.focus(preset.range[0])
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <Calendar
        mode="range"
        controller={calendar}
        today={today}
        defaultMonth="2026-10"
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
      </Calendar>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"The grid’s state exposes its month, label, weekdays, and weeks when you need to write the table yourself. Preserve empty cells marked `hidden` so dates shown by another month do not appear twice. Parts and Composition covers changing a part’s element without losing its behavior.",examples:[{id:`calendar/custom-grid`,caption:`The table is your own markup, built from the grid's state. Navigate and select as usual.`,Example:ie,source:`import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function isoWeek(date: string) {
  const day = new Date(\`\${date}T00:00:00Z\`)
  day.setUTCDate(day.getUTCDate() + 3 - ((day.getUTCDay() + 6) % 7))
  const firstThursday = new Date(Date.UTC(day.getUTCFullYear(), 0, 4))
  const days = (day.getTime() - firstThursday.getTime()) / 86400000
  return 1 + Math.round((days - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
}

export function Example() {
  return (
    <Calendar defaultValue="2026-10-16" weekStartsOn={1}>
      <div data-slot="row">
        <CalendarPrevious
          data-variant="ghost"
          render={(props, step) => (
            <button {...props} title={\`Show \${step.month}\`} />
          )}
        >
          <ChevronLeftIcon />
        </CalendarPrevious>
        <CalendarHeading>{(heading) => heading.label}</CalendarHeading>
        <CalendarNext data-variant="ghost">
          <ChevronRightIcon />
        </CalendarNext>
      </div>
      <CalendarGrid>
        {(grid) => (
          <>
            <thead>
              <tr>
                <th scope="col">
                  <abbr title="Week">Wk</abbr>
                </th>
                {grid.weekdays.map((weekday, index) => (
                  <CalendarWeekday key={weekday} index={index} />
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.weeks.map((week) => (
                <tr key={week[0]!.date}>
                  <th scope="row" data-slot="hint">
                    {isoWeek(week[0]!.date)}
                  </th>
                  {week.map((cell) =>
                    cell.hidden ? (
                      <td key={cell.date} />
                    ) : (
                      <CalendarDay key={cell.date} value={cell.date} />
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </>
        )}
      </CalendarGrid>
    </Calendar>
  )
}
`}]},{heading:`More examples`,text:``,examples:[{id:`calendar/rtl`,caption:``,Example:ae,source:`import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

export function Example() {
  return (
    <div dir="rtl" lang="ar">
      <Calendar defaultValue="2026-10-16">
        <div data-slot="row">
          <CalendarPrevious data-variant="ghost">
            <ChevronLeftIcon />
          </CalendarPrevious>
          <CalendarHeading />
          <CalendarNext data-variant="ghost">
            <ChevronRightIcon />
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
      </Calendar>
    </div>
  )
}
`}]}]};export{oe as default};