import{t as e}from"../chunks/c-BasF5OXx.js";import{t}from"../chunks/c-DWFCfNnK.js";import{t as n}from"../chunks/c-DCB4QOj-.js";import{t as r}from"../chunks/c-CU-88Fi-.js";import{t as i}from"../chunks/c-BwdqlraN.js";import{useLog as a}from"./log.js";import*as o from"preact/compat";import{Fragment as s,jsx as c,jsxs as l}from"preact/compat/jsx-runtime";import{Pagination as u,PaginationEllipsis as d,PaginationItem as f,PaginationLink as p,PaginationList as m,PaginationNext as h,PaginationPrevious as g}from"ui-sdk/pagination.js";function _(){let e=a();return/* @__PURE__ */ c(u,{"aria-label":`Pagination`,pageCount:10,onPageChange:(t,n)=>e(`Page ${t} (${n.reason})`),children:/* @__PURE__ */ c(m,{children:({items:e})=>/* @__PURE__ */ l(s,{children:[/* @__PURE__ */ c(f,{children:/* @__PURE__ */ l(g,{"data-variant":`ghost`,children:[/* @__PURE__ */ c(n,{}),/* @__PURE__ */ c(`span`,{"data-slot":`visually-hidden`,children:`Previous`})]})}),e.map(e=>/* @__PURE__ */ c(f,{children:typeof e==`number`?/* @__PURE__ */ c(p,{"data-variant":`ghost`,page:e}):/* @__PURE__ */ c(d,{children:/* @__PURE__ */ c(i,{})})},e)),/* @__PURE__ */ c(f,{children:/* @__PURE__ */ l(h,{"data-variant":`ghost`,children:[/* @__PURE__ */ c(`span`,{"data-slot":`visually-hidden`,children:`Next`}),/* @__PURE__ */ c(r,{})]})})]})})})}function v(){let e=a(),[t,_]=o.useState(2),[v,y]=o.useState(20);return/* @__PURE__ */ l(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ l(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ l(`p`,{children:[`Showing `,(t-1)*v+1,`–`,Math.min(t*v,95),` `,`of `,95]}),/* @__PURE__ */ l(`label`,{"data-slot":`label`,children:[`Rows per page`,/* @__PURE__ */ l(`select`,{value:v,onChange:t=>{y(Number(t.target.value)),_(1),e(`${t.target.value} rows per page`)},children:[/* @__PURE__ */ c(`option`,{value:10,children:`10`}),/* @__PURE__ */ c(`option`,{value:20,children:`20`}),/* @__PURE__ */ c(`option`,{value:50,children:`50`})]})]})]}),/* @__PURE__ */ c(u,{"aria-label":`Pagination`,total:95,pageSize:v,page:t,onPageChange:t=>{_(t),e(`Page ${t}`)},children:/* @__PURE__ */ c(m,{children:({items:e})=>/* @__PURE__ */ l(s,{children:[/* @__PURE__ */ c(f,{children:/* @__PURE__ */ l(g,{"data-variant":`ghost`,children:[/* @__PURE__ */ c(n,{}),/* @__PURE__ */ c(`span`,{"data-slot":`visually-hidden`,children:`Previous`})]})}),e.map(e=>/* @__PURE__ */ c(f,{children:typeof e==`number`?/* @__PURE__ */ c(p,{"data-variant":`ghost`,page:e}):/* @__PURE__ */ c(d,{children:/* @__PURE__ */ c(i,{})})},e)),/* @__PURE__ */ c(f,{children:/* @__PURE__ */ l(h,{"data-variant":`ghost`,children:[/* @__PURE__ */ c(`span`,{"data-slot":`visually-hidden`,children:`Next`}),/* @__PURE__ */ c(r,{})]})})]})})})]})}function y(){return/* @__PURE__ */ c(u,{"aria-label":`Pagination`,pageCount:10,children:/* @__PURE__ */ c(m,{children:({items:n})=>/* @__PURE__ */ l(s,{children:[/* @__PURE__ */ c(f,{children:/* @__PURE__ */ c(g,{"aria-label":`Previous page`,render:(e,t)=>/* @__PURE__ */ c(`button`,{...e,title:t.disabled?void 0:`Go to page ${t.page}`}),children:t=>/* @__PURE__ */ l(s,{children:[/* @__PURE__ */ c(e,{"aria-hidden":`true`}),!t.disabled&&/* @__PURE__ */ c(`span`,{"aria-hidden":`true`,children:t.page})]})})}),n.map(e=>/* @__PURE__ */ c(f,{children:typeof e==`number`?/* @__PURE__ */ c(p,{page:e,children:e=>e.current?`Page ${e.page}`:e.page}):/* @__PURE__ */ c(d,{})},e)),/* @__PURE__ */ c(f,{children:/* @__PURE__ */ c(h,{"aria-label":`Next page`,render:(e,t)=>/* @__PURE__ */ c(`button`,{...e,title:t.disabled?void 0:`Go to page ${t.page}`}),children:e=>/* @__PURE__ */ l(s,{children:[!e.disabled&&/* @__PURE__ */ c(`span`,{"aria-hidden":`true`,children:e.page}),/* @__PURE__ */ c(t,{"aria-hidden":`true`})]})})})]})})})}function b(){return/* @__PURE__ */ c(`div`,{dir:`rtl`,children:/* @__PURE__ */ c(u,{"aria-label":`ترقيم الصفحات`,pageCount:10,children:/* @__PURE__ */ c(m,{children:({items:e})=>/* @__PURE__ */ l(s,{children:[/* @__PURE__ */ c(f,{children:/* @__PURE__ */ l(g,{"data-variant":`ghost`,children:[/* @__PURE__ */ c(n,{}),/* @__PURE__ */ c(`span`,{"data-slot":`visually-hidden`,children:`السابق`})]})}),e.map(e=>/* @__PURE__ */ c(f,{children:typeof e==`number`?/* @__PURE__ */ c(p,{"data-variant":`ghost`,page:e}):/* @__PURE__ */ c(d,{children:/* @__PURE__ */ c(i,{})})},e)),/* @__PURE__ */ c(f,{children:/* @__PURE__ */ l(h,{"data-variant":`ghost`,children:[/* @__PURE__ */ c(`span`,{"data-slot":`visually-hidden`,children:`التالي`}),/* @__PURE__ */ c(r,{})]})})]})})})})}var x={name:`pagination`,title:`Pagination`,description:`Navigate pages with buttons, links, or your router.`,sections:[{heading:null,text:``,examples:[{id:`pagination/basic`,caption:`Choose a page, or use Previous and Next. The console logs each page and its reason, and the step at either end stays focusable as a button.`,Example:_,source:`"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()

  return (
    <Pagination
      aria-label="Pagination"
      pageCount={10}
      onPageChange={(page, details) => log(\`Page \${page} (\${details.reason})\`)}
    >
      <PaginationList>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious data-variant="ghost">
                <ChevronLeftIcon />
                <span data-slot="visually-hidden">Previous</span>
              </PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink data-variant="ghost" page={item} />
                ) : (
                  <PaginationEllipsis>
                    <EllipsisIcon />
                  </PaginationEllipsis>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext data-variant="ghost">
                <span data-slot="visually-hidden">Next</span>
                <ChevronRightIcon />
              </PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  )
}

export { Example }
`}]},{heading:`Total and Page Size`,text:"Instead of `pageCount`, pass `total`, how many items there are, and `pageSize`, how many fit on a page (10 by default). Pagination calculates the page count, with a minimum of one. This example resets to page 1 when the page size changes.",examples:[{id:`pagination/total`,caption:`Choose a page, then change Rows per page. The console logs each change, and a new size starts again at page 1.`,Example:v,source:`"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "../../../shared/react/log"

function Example() {
  const log = useLog()
  const [page, setPage] = React.useState(2)
  const [pageSize, setPageSize] = React.useState(20)
  const total = 95

  return (
    <div data-slot="stack">
      <div data-slot="row">
        <p>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
          of {total}
        </p>
        <label data-slot="label">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
              log(\`\${event.target.value} rows per page\`)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      <Pagination
        aria-label="Pagination"
        total={total}
        pageSize={pageSize}
        page={page}
        onPageChange={(next) => {
          setPage(next)
          log(\`Page \${next}\`)
        }}
      >
        <PaginationList>
          {({ items }) => (
            <>
              <PaginationItem>
                <PaginationPrevious data-variant="ghost">
                  <ChevronLeftIcon />
                  <span data-slot="visually-hidden">Previous</span>
                </PaginationPrevious>
              </PaginationItem>
              {items.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink data-variant="ghost" page={item} />
                  ) : (
                    <PaginationEllipsis>
                      <EllipsisIcon />
                    </PaginationEllipsis>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext data-variant="ghost">
                  <span data-slot="visually-hidden">Next</span>
                  <ChevronRightIcon />
                </PaginationNext>
              </PaginationItem>
            </>
          )}
        </PaginationList>
      </Pagination>
    </div>
  )
}

export { Example }
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. `className`, `style` and `children` can be functions of the same state: whether a link is `current`, and for a step, the `page` it goes to and whether it's `disabled`.",examples:[{id:`pagination/render`,caption:`Choose a page. The current page widens to say Page 3, and each arrow shows the page it goes to.`,Example:y,source:`"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

function Example() {
  return (
    <Pagination aria-label="Pagination" pageCount={10}>
      <PaginationList>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious
                aria-label="Previous page"
                render={(props, state) => (
                  <button
                    {...props}
                    title={
                      state.disabled ? undefined : \`Go to page \${state.page}\`
                    }
                  />
                )}
              >
                {(state) => (
                  <>
                    <ArrowLeftIcon aria-hidden="true" />
                    {!state.disabled && (
                      <span aria-hidden="true">{state.page}</span>
                    )}
                  </>
                )}
              </PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink page={item}>
                    {(state) =>
                      state.current ? \`Page \${state.page}\` : state.page
                    }
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                aria-label="Next page"
                render={(props, state) => (
                  <button
                    {...props}
                    title={
                      state.disabled ? undefined : \`Go to page \${state.page}\`
                    }
                  />
                )}
              >
                {(state) => (
                  <>
                    {!state.disabled && (
                      <span aria-hidden="true">{state.page}</span>
                    )}
                    <ArrowRightIcon aria-hidden="true" />
                  </>
                )}
              </PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`pagination/rtl`,caption:``,Example:b,source:`"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react"

function Example() {
  return (
    <div dir="rtl">
      <Pagination aria-label="ترقيم الصفحات" pageCount={10}>
        <PaginationList>
          {({ items }) => (
            <>
              <PaginationItem>
                <PaginationPrevious data-variant="ghost">
                  <ChevronLeftIcon />
                  <span data-slot="visually-hidden">السابق</span>
                </PaginationPrevious>
              </PaginationItem>
              {items.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink data-variant="ghost" page={item} />
                  ) : (
                    <PaginationEllipsis>
                      <EllipsisIcon />
                    </PaginationEllipsis>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext data-variant="ghost">
                  <span data-slot="visually-hidden">التالي</span>
                  <ChevronRightIcon />
                </PaginationNext>
              </PaginationItem>
            </>
          )}
        </PaginationList>
      </Pagination>
    </div>
  )
}

export { Example }
`}]}]};export{x as default};