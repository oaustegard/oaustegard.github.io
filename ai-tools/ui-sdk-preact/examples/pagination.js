import{$s as e,As as t,Gs as n,Mo as r,Ws as i,_t as a,bt as o,ec as s,fl as c,gt as l,ht as u,ml as d,mt as f,tl as p,vt as m,yt as h}from"../chunks/c-CIXE4Nkk.js";function g(){let e=r();return/* @__PURE__ */ p(f,{"aria-label":`Pagination`,pageCount:10,onPageChange:(t,n)=>e(`Page ${t} (${n.reason})`),children:/* @__PURE__ */ p(m,{children:({items:e})=>/* @__PURE__ */ p(d,{children:[/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(o,{"data-variant":`ghost`,children:[/* @__PURE__ */ p(n,{}),/* @__PURE__ */ p(`span`,{"data-slot":`visually-hidden`,children:`Previous`})]})}),e.map(e=>/* @__PURE__ */ p(l,{children:typeof e==`number`?/* @__PURE__ */ p(a,{"data-variant":`ghost`,page:e}):/* @__PURE__ */ p(u,{children:/* @__PURE__ */ p(t,{})})},e)),/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(h,{"data-variant":`ghost`,children:[/* @__PURE__ */ p(`span`,{"data-slot":`visually-hidden`,children:`Next`}),/* @__PURE__ */ p(i,{})]})})]})})})}function _(){let e=r(),[s,g]=c(2),[_,v]=c(20);return/* @__PURE__ */ p(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ p(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ p(`p`,{children:[`Showing `,(s-1)*_+1,`–`,Math.min(s*_,95),` `,`of `,95]}),/* @__PURE__ */ p(`label`,{"data-slot":`label`,children:[`Rows per page`,/* @__PURE__ */ p(`select`,{value:_,onChange:t=>{v(Number(t.target.value)),g(1),e(`${t.target.value} rows per page`)},children:[/* @__PURE__ */ p(`option`,{value:10,children:`10`}),/* @__PURE__ */ p(`option`,{value:20,children:`20`}),/* @__PURE__ */ p(`option`,{value:50,children:`50`})]})]})]}),/* @__PURE__ */ p(f,{"aria-label":`Pagination`,total:95,pageSize:_,page:s,onPageChange:t=>{g(t),e(`Page ${t}`)},children:/* @__PURE__ */ p(m,{children:({items:e})=>/* @__PURE__ */ p(d,{children:[/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(o,{"data-variant":`ghost`,children:[/* @__PURE__ */ p(n,{}),/* @__PURE__ */ p(`span`,{"data-slot":`visually-hidden`,children:`Previous`})]})}),e.map(e=>/* @__PURE__ */ p(l,{children:typeof e==`number`?/* @__PURE__ */ p(a,{"data-variant":`ghost`,page:e}):/* @__PURE__ */ p(u,{children:/* @__PURE__ */ p(t,{})})},e)),/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(h,{"data-variant":`ghost`,children:[/* @__PURE__ */ p(`span`,{"data-slot":`visually-hidden`,children:`Next`}),/* @__PURE__ */ p(i,{})]})})]})})})]})}function v(){return/* @__PURE__ */ p(f,{"aria-label":`Pagination`,pageCount:10,children:/* @__PURE__ */ p(m,{children:({items:t})=>/* @__PURE__ */ p(d,{children:[/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(o,{"aria-label":`Previous page`,render:(e,t)=>/* @__PURE__ */ p(`button`,{...e,title:t.disabled?void 0:`Go to page ${t.page}`}),children:e=>/* @__PURE__ */ p(d,{children:[/* @__PURE__ */ p(s,{"aria-hidden":`true`}),!e.disabled&&/* @__PURE__ */ p(`span`,{"aria-hidden":`true`,children:e.page})]})})}),t.map(e=>/* @__PURE__ */ p(l,{children:typeof e==`number`?/* @__PURE__ */ p(a,{page:e,children:e=>e.current?`Page ${e.page}`:e.page}):/* @__PURE__ */ p(u,{})},e)),/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(h,{"aria-label":`Next page`,render:(e,t)=>/* @__PURE__ */ p(`button`,{...e,title:t.disabled?void 0:`Go to page ${t.page}`}),children:t=>/* @__PURE__ */ p(d,{children:[!t.disabled&&/* @__PURE__ */ p(`span`,{"aria-hidden":`true`,children:t.page}),/* @__PURE__ */ p(e,{"aria-hidden":`true`})]})})})]})})})}function y(){return/* @__PURE__ */ p(`div`,{dir:`rtl`,children:/* @__PURE__ */ p(f,{"aria-label":`ترقيم الصفحات`,pageCount:10,children:/* @__PURE__ */ p(m,{children:({items:e})=>/* @__PURE__ */ p(d,{children:[/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(o,{"data-variant":`ghost`,children:[/* @__PURE__ */ p(n,{}),/* @__PURE__ */ p(`span`,{"data-slot":`visually-hidden`,children:`السابق`})]})}),e.map(e=>/* @__PURE__ */ p(l,{children:typeof e==`number`?/* @__PURE__ */ p(a,{"data-variant":`ghost`,page:e}):/* @__PURE__ */ p(u,{children:/* @__PURE__ */ p(t,{})})},e)),/* @__PURE__ */ p(l,{children:/* @__PURE__ */ p(h,{"data-variant":`ghost`,children:[/* @__PURE__ */ p(`span`,{"data-slot":`visually-hidden`,children:`التالي`}),/* @__PURE__ */ p(i,{})]})})]})})})})}var b={name:`pagination`,title:`Pagination`,description:`Navigate pages with buttons, links, or your router.`,sections:[{heading:null,text:``,examples:[{id:`pagination/basic`,caption:`Choose a page, or use Previous and Next. The console logs each page and its reason, and the step at either end stays focusable as a button.`,Example:g,source:`"use client"

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
`}]},{heading:`Total and Page Size`,text:"Instead of `pageCount`, pass `total`, how many items there are, and `pageSize`, how many fit on a page (10 by default). Pagination calculates the page count, with a minimum of one. This example resets to page 1 when the page size changes.",examples:[{id:`pagination/total`,caption:`Choose a page, then change Rows per page. The console logs each change, and a new size starts again at page 1.`,Example:_,source:`"use client"

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
`}]},{heading:`Custom Rendering`,text:"Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. `className`, `style` and `children` can be functions of the same state: whether a link is `current`, and for a step, the `page` it goes to and whether it's `disabled`.",examples:[{id:`pagination/render`,caption:`Choose a page. The current page widens to say Page 3, and each arrow shows the page it goes to.`,Example:v,source:`"use client"

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
`}]},{heading:`More examples`,text:``,examples:[{id:`pagination/rtl`,caption:``,Example:y,source:`"use client"

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
`}]}]};export{b as default};