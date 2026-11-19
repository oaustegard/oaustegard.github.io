import{t as e}from"../chunks/c-WfjOen3K.js";import{t}from"../chunks/c-CA3STxaZ.js";import{t as n}from"../chunks/c-BHtAohdq.js";import{n as r,r as i,t as a}from"../chunks/c-u-NNRFH-.js";import{t as o}from"../chunks/c-NPxkywtp.js";import{useLog as s}from"./log.js";import*as c from"preact/compat";import{Fragment as l,jsx as u,jsxs as d}from"preact/compat/jsx-runtime";import{Field as f,FieldDescription as ee,FieldError as te,FieldLabel as p}from"ui-sdk/field.js";import{Checkbox as m,CheckboxIndicator as h}from"ui-sdk/checkbox.js";import{Select as g,SelectArrow as ne,SelectClear as re,SelectContent as _,SelectEmpty as v,SelectGroup as y,SelectGroupLabel as b,SelectInput as x,SelectItem as S,SelectItemIcon as C,SelectItemIndicator as w,SelectItemText as T,SelectLabel as E,SelectList as D,SelectSelectAll as O,SelectSeparator as k,SelectStatus as ie,SelectTrigger as A,SelectValue as j,SelectValueIcon as ae,createSelectController as oe}from"ui-sdk/select.js";import{useAsyncOptions as se}from"ui-sdk/async-options.js";const ce=[{value:`viewer`,label:`Viewer`},{value:`commenter`,label:`Commenter`},{value:`editor`,label:`Editor`},{value:`admin`,label:`Admin`}];function le(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Role`}),/* @__PURE__ */ d(g,{placeholder:`Select a role`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:ce.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}const M=[{value:`free`,label:`Free`},{value:`pro`,label:`Pro`},{value:`team`,label:`Team`}],N=[{value:`enterprise`,label:`Enterprise`},{value:`education`,label:`Education`,disabled:!0}],P=[...M,{type:`separator`},{type:`group`,label:`Contact sales`,items:N}];function F(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Plan`}),/* @__PURE__ */ d(g,{items:P,defaultValue:`pro`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ d(_,{children:[M.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value)),/* @__PURE__ */ u(k,{}),/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{children:`Contact sales`}),N.map(t=>/* @__PURE__ */ d(S,{value:t.value,disabled:t.disabled,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))]})]})]})]})}const I=[{label:`Sans serif`,items:[{value:`inter`,label:`Inter`},{value:`geist`,label:`Geist`}]},{label:`Serif`,items:[{value:`source-serif`,label:`Source Serif`},{value:`lora`,label:`Lora`}]},{label:`Monospace`,items:[{value:`geist-mono`,label:`Geist Mono`},{value:`jetbrains-mono`,label:`JetBrains Mono`}]}];function L(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Font`}),/* @__PURE__ */ d(g,{placeholder:`Select a font`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:I.map((t,n)=>/* @__PURE__ */ d(c.Fragment,{children:[n>0&&/* @__PURE__ */ u(k,{}),/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{children:t.label}),t.items.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))]})]},t.label))})]})]})}function R(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Text alignment`}),/* @__PURE__ */ d(g,{defaultValue:`start`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(ae,{}),/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ d(_,{children:[/* @__PURE__ */ d(S,{value:`start`,children:[/* @__PURE__ */ u(C,{mirror:!0,children:/* @__PURE__ */ u(a,{})}),`Start`,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]}),/* @__PURE__ */ d(S,{value:`center`,children:[/* @__PURE__ */ u(C,{children:/* @__PURE__ */ u(i,{})}),`Center`,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]}),/* @__PURE__ */ d(S,{value:`end`,children:[/* @__PURE__ */ u(C,{mirror:!0,children:/* @__PURE__ */ u(r,{})}),`End`,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]})]})]})]})}const z=[{value:`ar`,label:`Argentina`,code:`+54`},{value:`au`,label:`Australia`,code:`+61`},{value:`at`,label:`Austria`,code:`+43`},{value:`be`,label:`Belgium`,code:`+32`},{value:`br`,label:`Brazil`,code:`+55`},{value:`ca`,label:`Canada`,code:`+1`},{value:`dk`,label:`Denmark`,code:`+45`},{value:`fr`,label:`France`,code:`+33`},{value:`de`,label:`Germany`,code:`+49`},{value:`gr`,label:`Greece`,code:`+30`},{value:`ie`,label:`Ireland`,code:`+353`},{value:`jp`,label:`Japan`,code:`+81`},{value:`es`,label:`Spain`,code:`+34`},{value:`se`,label:`Sweden`,code:`+46`},{value:`ch`,label:`Switzerland`,code:`+41`}];function B(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Country`}),/* @__PURE__ */ d(g,{defaultValue:`fr`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:z.map(t=>/* @__PURE__ */ d(S,{value:t.value,label:t.label,children:[t.label,/* @__PURE__ */ u(`span`,{"data-slot":`hint`,children:t.code}),/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}const V=[{value:`ca`,label:`Canada`},{value:`dk`,label:`Denmark`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`jp`,label:`Japan`},{value:`es`,label:`Spain`}],H=[{label:`Billing country`,disabled:!0},{label:`Shipping from`,readOnly:!0},{label:`Shipping to`}];function U(){return/* @__PURE__ */ u(`div`,{"data-slot":`stack`,children:H.map(n=>/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:n.label}),/* @__PURE__ */ d(g,{defaultValue:n.disabled||n.readOnly?`fr`:null,placeholder:`Select a country`,disabled:n.disabled,readOnly:n.readOnly,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:V.map(t=>/* @__PURE__ */ d(S,{value:t.value,disabled:t.value===`dk`,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]},n.label))})}const W=[{value:`hollis`,label:`Hollis Grant`},{value:`ines`,label:`Inès Moreau`},{value:`kofi`,label:`Kofi Mensah`},{value:`wren`,label:`Wren Takahashi`},{value:`tomasz`,label:`Tomasz Wójcik`}];function ue(){let n=s();return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Assignee`}),/* @__PURE__ */ d(g,{defaultValue:`ines`,placeholder:`Unassigned`,onValueChange:(e,t)=>n(`value: ${JSON.stringify(e)} (${t.reason})`),children:[/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(re,{"aria-label":`Clear assignee`,children:/* @__PURE__ */ u(o,{})})]}),/* @__PURE__ */ u(_,{children:W.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}const de=[{value:`en`,label:`English`},{value:`fr`,label:`French`},{value:`de`,label:`German`},{value:`ja`,label:`Japanese`},{value:`pt`,label:`Portuguese`},{value:`es`,label:`Spanish`}];function fe(){let n=s();return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Languages`}),/* @__PURE__ */ d(g,{multiple:!0,defaultValue:[`en`,`ja`],placeholder:`Select languages`,onValueChange:e=>n(`value: ${JSON.stringify(e)}`),children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{children:e=>e.placeholder?`Select languages`:e.labels.length>2?`${e.labels[0]} and ${e.labels.length-1} more`:e.label}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:de.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}const pe=[{value:`us-east`,label:`US East`},{value:`us-west`,label:`US West`},{value:`europe`,label:`Europe`},{value:`asia-pacific`,label:`Asia Pacific`},{value:`south-america`,label:`South America`}];function me(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Regions`}),/* @__PURE__ */ d(g,{multiple:!0,defaultValue:[`us-east`,`europe`,`asia-pacific`],placeholder:`Select regions`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{maxLabels:2,getMoreLabel:e=>`${e} more`}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ d(_,{children:[/* @__PURE__ */ u(O,{children:t=>/* @__PURE__ */ d(l,{children:[`Select all`,t.checked&&/* @__PURE__ */ u(e,{}),t.indeterminate&&/* @__PURE__ */ u(n,{})]})}),/* @__PURE__ */ u(k,{}),pe.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))]})]})]})}const he=[{label:`Americas`,items:[{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`mx`,label:`Mexico`}]},{label:`Europe`,items:[{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`es`,label:`Spain`}]},{label:`Asia Pacific`,items:[{value:`au`,label:`Australia`},{value:`jp`,label:`Japan`},{value:`sg`,label:`Singapore`}]}];function ge(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Country`}),/* @__PURE__ */ d(g,{placeholder:`Select a country`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ d(_,{children:[/* @__PURE__ */ u(x,{"aria-label":`Search countries`,placeholder:`Search countries…`}),/* @__PURE__ */ u(v,{children:`No countries found.`}),/* @__PURE__ */ u(D,{children:he.map(t=>/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{children:t.label}),t.items.map(t=>/* @__PURE__ */ d(S,{value:t.value,label:t.label,children:[/* @__PURE__ */ u(T,{children:e=>e.segments.map((e,t)=>e.match?/* @__PURE__ */ u(`b`,{children:e.text},t):e.text)}),/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))]},t.label))})]})]})]})}const _e=[{value:`ar`,label:`Argentina`},{value:`au`,label:`Australia`},{value:`at`,label:`Austria`},{value:`be`,label:`Belgium`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`cl`,label:`Chile`},{value:`cn`,label:`China`},{value:`dk`,label:`Denmark`},{value:`fi`,label:`Finland`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`gr`,label:`Greece`},{value:`in`,label:`India`},{value:`ie`,label:`Ireland`},{value:`it`,label:`Italy`},{value:`jp`,label:`Japan`},{value:`mx`,label:`Mexico`},{value:`nl`,label:`Netherlands`},{value:`no`,label:`Norway`},{value:`pt`,label:`Portugal`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`},{value:`ch`,label:`Switzerland`}];function ve(e,{signal:t,page:n}){return new Promise((r,i)=>{let a=setTimeout(()=>{let t=e.trim().toLowerCase(),i=_e.filter(e=>e.label.toLowerCase().includes(t));r({items:i.slice(n*6,n*6+6),hasMore:i.length>n*6+6})},400);t.addEventListener(`abort`,()=>{clearTimeout(a),i(t.reason)})})}function ye(){let[n,r]=c.useState(``),i=se(ve,{immediate:!0});return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Country`}),/* @__PURE__ */ d(g,{items:i.items,filter:!1,status:i.status,query:n,onQueryChange:e=>{r(e),i.setQuery(e)},onLoadMore:i.loadMore,placeholder:`Select a country`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ d(_,{children:[/* @__PURE__ */ u(x,{"aria-label":`Search countries`,placeholder:`Search countries…`}),/* @__PURE__ */ u(v,{children:e=>e.empty&&!e.loading?`No countries match “${e.query}”.`:null}),/* @__PURE__ */ u(D,{children:t=>t.items.map(t=>/* @__PURE__ */ d(S,{value:t.value,label:t.label,disabled:t.disabled,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))}),/* @__PURE__ */ u(ie,{children:e=>e.loading?`Loading…`:e.status===`error`?`Couldn't load countries.`:`${e.count} shown`})]})]})]})}const G=[{id:1,name:`Hollis Grant`,email:`hollis@example.com`},{id:2,name:`Inès Moreau`,email:`ines@example.com`},{id:3,name:`Kofi Mensah`,email:`kofi@example.com`},{id:4,name:`Wren Takahashi`,email:`wren@example.com`}];function be(){let n=s();return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Assignee`}),/* @__PURE__ */ d(g,{defaultValue:{...G[1]},onValueChange:e=>n(`Submits assignee=${e?e.id:``}`),name:`assignee`,itemToValue:e=>String(e.id),itemToLabel:e=>e.name,isItemEqualToValue:(e,t)=>e.id===t.id,placeholder:`Unassigned`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:G.map(t=>/* @__PURE__ */ d(S,{value:t,children:[/* @__PURE__ */ d(`span`,{"data-slot":`stack`,children:[t.name,/* @__PURE__ */ u(`span`,{"data-slot":`hint`,children:t.email})]}),/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.id))})]})]})}const xe=Array.from({length:1e4},(e,t)=>({value:`item-${t+1}`,label:`Item ${t+1}`}));function Se(e,t,n,r){return{start:Math.max(0,Math.floor(e/r)-4),end:Math.min(n,Math.ceil((e+t)/r)+4)}}function Ce(e,t,n,r){let i=e*r;return i<t?i:i+r>t+n?i+r-n:t}function we(){let e=c.useRef(null),[n,r]=c.useState(0);return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Item`}),/* @__PURE__ */ d(g,{items:xe,placeholder:`Select an item`,onHighlight:(t,{index:n})=>{let r=e.current;r&&n>=0&&(r.scrollTop=Ce(n,r.scrollTop,r.clientHeight,32))},children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:/* @__PURE__ */ u(`div`,{ref:e,style:{height:288},onScroll:e=>r(e.currentTarget.scrollTop),children:/* @__PURE__ */ u(D,{children:e=>{let t=e.items,{start:r,end:i}=Se(n,288,t.length,32);return/* @__PURE__ */ u(`div`,{style:{height:t.length*32},children:t.slice(r,i).map((e,t)=>/* @__PURE__ */ u(S,{value:e.value,label:e.label,index:r+t,style:{top:(r+t)*32,height:32},children:e.label},e.value))})}})})})]})]})}const Te=[{value:`urgent`,label:`Urgent`},{value:`high`,label:`High`},{value:`medium`,label:`Medium`},{value:`low`,label:`Low`},{value:`none`,label:`No priority`}];function Ee(){let[n,r]=c.useState(!0);return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,children:/* @__PURE__ */ d(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ u(m,{checked:n,onCheckedChange:e=>r(e===!0),children:/* @__PURE__ */ u(h,{children:/* @__PURE__ */ u(e,{})})}),`Align item with trigger`]})}),/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Priority`}),/* @__PURE__ */ d(g,{defaultValue:`medium`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{alignItemWithTrigger:n,children:Te.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})]})}const De=[{label:`North America`,items:[{value:`est`,label:`Eastern Standard Time`},{value:`cst`,label:`Central Standard Time`},{value:`mst`,label:`Mountain Standard Time`},{value:`pst`,label:`Pacific Standard Time`},{value:`akst`,label:`Alaska Standard Time`},{value:`hst`,label:`Hawaii Standard Time`}]},{label:`Europe & Africa`,items:[{value:`gmt`,label:`Greenwich Mean Time`},{value:`cet`,label:`Central European Time`},{value:`eet`,label:`Eastern European Time`},{value:`west`,label:`Western European Summer Time`},{value:`cat`,label:`Central Africa Time`},{value:`eat`,label:`East Africa Time`}]},{label:`Asia`,items:[{value:`msk`,label:`Moscow Time`},{value:`ist`,label:`India Standard Time`},{value:`cst-china`,label:`China Standard Time`},{value:`jst`,label:`Japan Standard Time`},{value:`kst`,label:`Korea Standard Time`},{value:`ist-indonesia`,label:`Indonesia Central Standard Time`}]},{label:`Australia & Pacific`,items:[{value:`awst`,label:`Australian Western Standard Time`},{value:`acst`,label:`Australian Central Standard Time`},{value:`aest`,label:`Australian Eastern Standard Time`},{value:`nzst`,label:`New Zealand Standard Time`},{value:`fjt`,label:`Fiji Time`}]}];function Oe(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Time zone`}),/* @__PURE__ */ d(g,{placeholder:`Select a time zone`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:De.map(t=>/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{children:t.label}),t.items.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))]},t.label))})]})]})}const ke=[{value:`standard`,label:`Standard`},{value:`express`,label:`Express`},{value:`overnight`,label:`Overnight`}];function Ae(){let n=s();return/* @__PURE__ */ d(`form`,{"data-slot":`stack`,onSubmit:e=>{e.preventDefault(),n(`Submitted shipping=${new FormData(e.currentTarget).get(`shipping`)}`)},children:[/* @__PURE__ */ d(f,{name:`shipping`,children:[/* @__PURE__ */ u(p,{children:`Shipping method`}),/* @__PURE__ */ d(g,{required:!0,placeholder:`Select a shipping method`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:ke.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]}),/* @__PURE__ */ u(ee,{children:`Express arrives in two business days.`}),/* @__PURE__ */ u(te,{match:`valueMissing`,children:`Choose a shipping method.`})]}),/* @__PURE__ */ u(`button`,{type:`submit`,"data-variant":`solid`,children:`Continue`})]})}const je=[{value:`au`,label:`Australia`},{value:`br`,label:`Brazil`},{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`jp`,label:`Japan`},{value:`es`,label:`Spain`},{value:`se`,label:`Sweden`}],Me=[`Design`,`Engineering`,`Marketing`,`Research`,`Sales`],Ne=[`Daily`,`Weekly`,`Monthly`];function Pe(){let n=s();return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`form`,{id:`select-newsletter`,"data-slot":`stack`,onSubmit:e=>{e.preventDefault();let t=[...new FormData(e.currentTarget)].map(([e,t])=>`${e}=${t}`);n(`Submitted ${t.join(`&`)}`)},children:[/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Country`}),/* @__PURE__ */ d(g,{name:`country`,autoComplete:`country`,required:!0,placeholder:`Select a country`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:je.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]}),/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Topics`}),/* @__PURE__ */ d(g,{name:`topics`,multiple:!0,defaultValue:[`Design`],children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Me.map(t=>/* @__PURE__ */ d(S,{value:t,children:[t,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t))})]})]})]}),/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Frequency`}),/* @__PURE__ */ d(g,{name:`frequency`,form:`select-newsletter`,defaultValue:`Weekly`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Ne.map(t=>/* @__PURE__ */ d(S,{value:t,children:[t,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t))})]})]}),/* @__PURE__ */ d(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ u(`button`,{type:`submit`,form:`select-newsletter`,"data-variant":`solid`,children:`Save`}),/* @__PURE__ */ u(`button`,{type:`reset`,form:`select-newsletter`,children:`Reset`})]})]})}const Fe=[{value:`backlog`,label:`Backlog`},{value:`todo`,label:`Todo`},{value:`in-progress`,label:`In Progress`},{value:`in-review`,label:`In Review`},{value:`done`,label:`Done`}];function Ie(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Status`}),/* @__PURE__ */ d(g,{defaultValue:`todo`,presentation:`sheet`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Fe.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}const Le=[{value:`viewer`,label:`Viewer`},{value:`commenter`,label:`Commenter`},{value:`editor`,label:`Editor`},{value:`admin`,label:`Admin`}];function Re(){let n=s();return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Role`}),/* @__PURE__ */ d(g,{defaultValue:`editor`,onOpenChangeComplete:e=>n(e?`Finished opening`:`Finished closing`),children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Le.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{keepMounted:!0,children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}const ze=[{value:`inter`,label:`Inter`},{value:`geist`,label:`Geist`},{value:`source-serif`,label:`Source Serif`},{value:`geist-mono`,label:`Geist Mono`}];function Be(){let[n,r]=c.useState(null);return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Font`}),/* @__PURE__ */ d(g,{container:n,defaultValue:`inter`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:ze.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]}),/* @__PURE__ */ u(`div`,{ref:r,"data-slot":`card`})]})}const Ve=[{value:`viewer`,label:`Viewer`},{value:`commenter`,label:`Commenter`},{value:`editor`,label:`Editor`},{value:`admin`,label:`Admin`},{value:`owner`,label:`Owner`}];function He(){let[n,r]=c.useState(`viewer`),[i,a]=c.useState(!1),o=s();return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>r(`editor`),children:`Make Editor`}),/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>a(!0),children:`Open`})]}),/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Role`}),/* @__PURE__ */ d(g,{value:n,onValueChange:(e,t)=>{if(e===`owner`){t.cancel(),o(`Only the owner can transfer ownership`);return}r(e),o(`value: ${e} (${t.reason})`)},open:i,onOpenChange:(e,t)=>{a(e),o(`open: ${e} (${t.reason})`)},children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Ve.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})]})}const K=[{value:`backlog`,label:`Backlog`},{value:`todo`,label:`Todo`},{value:`in-progress`,label:`In Progress`},{value:`done`,label:`Done`}],q=oe();function Ue(){let n=s();return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ u(`button`,{type:`button`,onClick:async()=>{let{reason:e}=await q.open();n(`Closed by ${e}, with ${q.getValue()??`nothing`}`)},children:`Open and Wait`}),/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>q.setValue(`done`),children:`Mark Done`}),/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>q.clear(),children:`Clear`}),/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>q.focus(),children:`Focus`})]}),/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Status`}),/* @__PURE__ */ d(A,{controller:q,children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]})]}),/* @__PURE__ */ u(g,{controller:q,items:K,placeholder:`Select a status`,children:/* @__PURE__ */ u(_,{children:K.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})})]})}const We=[{value:`hollis`,name:`Hollis Grant`,email:`hollis@example.com`},{value:`ines`,name:`Inès Moreau`,email:`ines@example.com`},{value:`kofi`,name:`Kofi Mensah`,email:`kofi@example.com`},{value:`wren`,name:`Wren Takahashi`,email:`wren@example.com`}];function Ge(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Reviewer`}),/* @__PURE__ */ d(g,{defaultValue:`hollis`,children:[/* @__PURE__ */ u(A,{render:e=>/* @__PURE__ */ d(`button`,{...e,children:[e.children,/* @__PURE__ */ u(t,{})]}),children:/* @__PURE__ */ u(j,{children:e=>/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`span`,{"data-slot":`badge`,children:e.label.slice(0,1)}),e.label]})})}),/* @__PURE__ */ u(_,{children:We.map(t=>/* @__PURE__ */ u(S,{value:t.value,label:t.name,disabled:t.value===`wren`,children:n=>/* @__PURE__ */ d(l,{children:[/* @__PURE__ */ u(`span`,{"data-slot":`badge`,children:t.name.slice(0,1)}),/* @__PURE__ */ d(`span`,{"data-slot":`stack`,children:[t.name,/* @__PURE__ */ u(`span`,{"data-slot":`hint`,children:n.disabled?`Out of office`:t.email})]}),/* @__PURE__ */ u(w,{render:(t,n)=>/* @__PURE__ */ u(`span`,{...t,children:n.selected&&/* @__PURE__ */ u(e,{})})})]})},t.value))})]})]})}const Ke=[{value:`urgent`,label:`Urgent`},{value:`high`,label:`High`},{value:`medium`,label:`Medium`},{value:`low`,label:`Low`},{value:`none`,label:`No priority`}];function qe(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Priority`}),/* @__PURE__ */ d(g,{loop:!1,defaultValue:`none`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Ke.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}const Je=[{value:`backlog`,label:`Backlog`},{value:`todo`,label:`Todo`},{value:`in-progress`,label:`In Progress`},{value:`done`,label:`Done`}],Ye=[{value:`pointer`,label:`Pointer`},{value:!0,label:`Modal`},{value:!1,label:`Non-modal`}];function Xe(){let[n,r]=c.useState(`pointer`),i=s();return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ u(`div`,{"data-slot":`controls`,role:`group`,"aria-label":`Modal`,children:Ye.map(e=>/* @__PURE__ */ u(`button`,{type:`button`,"aria-pressed":n===e.value,onClick:()=>r(e.value),children:e.label},e.label))}),/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Status`}),/* @__PURE__ */ d(g,{modal:n,defaultValue:`todo`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Je.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]}),/* @__PURE__ */ u(`button`,{type:`button`,onClick:()=>i(`Pressed Save Draft`),children:`Save Draft`})]})}const J=[{type:`group`,label:`Common`,items:[`Small`,`Medium`,`Large`]},{type:`group`,label:`Extended`,items:[`Extra small`,`Extra large`]}];function Ze(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Size`}),/* @__PURE__ */ d(g,{items:J,name:`size`,defaultValue:`Medium`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:J.map(t=>/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{children:t.label}),t.items.map(t=>/* @__PURE__ */ d(S,{value:t,children:[t,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t))]},t.label))})]})]})}const Qe=[`Extra small`,`Small`,`Medium`,`Large`,`Extra large`],Y=[`Paper`,`Ribbon`,`Box`];function $e(){return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Size`}),/* @__PURE__ */ d(g,{placeholder:`Select a size`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Qe.map(t=>/* @__PURE__ */ d(S,{value:t,children:[t,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t))})]})]}),/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Gift wrap`}),/* @__PURE__ */ d(g,{children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{placeholder:`None`}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Y.map(t=>/* @__PURE__ */ d(S,{value:t,children:[t,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t))})]})]})]})}const et=[{value:`inter`,label:`Inter`},{value:`geist`,label:`Geist`},{value:`source-serif`,label:`Source Serif`},{value:`geist-mono`,label:`Geist Mono`}],X=[{value:`top`,label:`Top`},{value:`right`,label:`Right`},{value:`bottom`,label:`Bottom`},{value:`left`,label:`Left`}],Z=[{value:`start`,label:`Start`},{value:`center`,label:`Center`},{value:`end`,label:`End`}];function tt(){let[n,r]=c.useState(`bottom`),[i,a]=c.useState(`start`),[o,s]=c.useState(null),[l,f]=c.useState(!1);return/* @__PURE__ */ d(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ d(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ d(g,{items:X,value:n,onValueChange:e=>e&&r(e),children:[/* @__PURE__ */ u(E,{children:`Side`}),/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:X.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]}),/* @__PURE__ */ d(g,{items:Z,value:i,onValueChange:e=>e&&a(e),children:[/* @__PURE__ */ u(E,{children:`Align`}),/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:Z.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]}),/* @__PURE__ */ d(`label`,{"data-slot":`label`,children:[/* @__PURE__ */ u(m,{checked:l,onCheckedChange:e=>f(e===!0),children:/* @__PURE__ */ u(h,{children:/* @__PURE__ */ u(e,{})})}),`Anchor to the box`]})]}),/* @__PURE__ */ u(`div`,{ref:s,"data-slot":`card`,children:/* @__PURE__ */ d(g,{defaultValue:`inter`,children:[/* @__PURE__ */ d(A,{"aria-label":`Font`,children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ d(_,{side:n,align:i,sideOffset:10,alignOffset:0,collisionPadding:16,anchor:l?o:null,children:[/* @__PURE__ */ u(ne,{}),et.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))]})]})})]})}const nt=[{value:`ar`,label:`العربية`},{value:`en`,label:`الإنجليزية`},{value:`fr`,label:`الفرنسية`},{value:`es`,label:`الإسبانية`},{value:`de`,label:`الألمانية`}];function rt(){return/* @__PURE__ */ u(`div`,{dir:`rtl`,children:/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`اللغة`}),/* @__PURE__ */ d(g,{placeholder:`اختر لغة`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:nt.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})})}const Q=[{value:`ar`,label:`Argentina`,code:`+54`},{value:`au`,label:`Australia`,code:`+61`},{value:`at`,label:`Austria`,code:`+43`},{value:`be`,label:`Belgium`,code:`+32`},{value:`br`,label:`Brazil`,code:`+55`},{value:`ca`,label:`Canada`,code:`+1`},{value:`cl`,label:`Chile`,code:`+56`},{value:`cn`,label:`China`,code:`+86`},{value:`dk`,label:`Denmark`,code:`+45`},{value:`fi`,label:`Finland`,code:`+358`},{value:`fr`,label:`France`,code:`+33`},{value:`de`,label:`Germany`,code:`+49`},{value:`gr`,label:`Greece`,code:`+30`},{value:`in`,label:`India`,code:`+91`},{value:`ie`,label:`Ireland`,code:`+353`},{value:`it`,label:`Italy`,code:`+39`},{value:`jp`,label:`Japan`,code:`+81`},{value:`mx`,label:`Mexico`,code:`+52`},{value:`nl`,label:`Netherlands`,code:`+31`},{value:`no`,label:`Norway`,code:`+47`},{value:`pt`,label:`Portugal`,code:`+351`},{value:`es`,label:`Spain`,code:`+34`},{value:`se`,label:`Sweden`,code:`+46`},{value:`ch`,label:`Switzerland`,code:`+41`}],it=[{type:`group`,label:`Popular`,items:[Q[5],Q[11],Q[16]]}];function at(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Country`}),/* @__PURE__ */ d(g,{items:Q,emptyItems:it,placeholder:`Select a country`,filter:`contains`,announcement:e=>e.type===`results`?`${e.count} ${e.count===1?`country`:`countries`} found`:null,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ d(_,{children:[/* @__PURE__ */ u(x,{"aria-label":`Search countries`,placeholder:`Search countries…`}),/* @__PURE__ */ u(v,{children:`No countries found.`}),/* @__PURE__ */ u(D,{children:e=>e.items.map(e=>`items`in e?/* @__PURE__ */ d(y,{children:[/* @__PURE__ */ u(b,{children:e.label}),e.items.map(e=>/* @__PURE__ */ u($,{country:e},e.value))]},e.label):/* @__PURE__ */ u($,{country:e},e.value))})]})]})]})}function $({country:t}){return/* @__PURE__ */ d(S,{value:t.value,label:t.label,children:[/* @__PURE__ */ u(T,{}),/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]})}const ot=[{value:`urgent`,label:`Urgent`},{value:`high`,label:`High`},{value:`medium`,label:`Medium`},{value:`low`,label:`Low`},{value:`none`,label:`No priority`}];function st(){return/* @__PURE__ */ d(f,{children:[/* @__PURE__ */ u(p,{children:`Priority`}),/* @__PURE__ */ d(g,{virtualFocus:!0,defaultValue:`none`,children:[/* @__PURE__ */ d(A,{children:[/* @__PURE__ */ u(j,{}),/* @__PURE__ */ u(t,{})]}),/* @__PURE__ */ u(_,{children:ot.map(t=>/* @__PURE__ */ d(S,{value:t.value,children:[t.label,/* @__PURE__ */ u(w,{children:/* @__PURE__ */ u(e,{})})]},t.value))})]})]})}var ct={name:`select`,title:`Select`,description:`Choose one value or several from a popup list.`,sections:[{heading:null,text:`Use a Select when someone needs to choose from a set of options. It handles opening the list, keyboard navigation, selection, and the value submitted with a form. You provide the parts and styles.`,examples:[{id:`select/demo`,caption:`Open Role and choose Editor. The list closes and the trigger shows your choice.`,Example:le,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "commenter", label: "Commenter" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <Select placeholder="Select a role">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Items as Data`,text:"Pass an array to `items` when your options come from data. A string is both the value and the label. Use an object when they differ:",examples:[{id:`select/data`,caption:`Open Plan to see the options, separator, and Contact sales group. Education is disabled; choose Enterprise to update the value.`,Example:F,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type ListData,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

const sales = [
  { value: "enterprise", label: "Enterprise" },
  { value: "education", label: "Education", disabled: true },
]

const items: ListData = [
  ...plans,
  { type: "separator" },
  { type: "group", label: "Contact sales", items: sales },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Plan</FieldLabel>
      <Select items={items} defaultValue="pro">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem key={plan.value} value={plan.value}>
              {plan.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Contact sales</SelectGroupLabel>
            {sales.map((plan) => (
              <SelectItem
                key={plan.value}
                value={plan.value}
                disabled={plan.disabled}
              >
                {plan.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Groups`,text:"Put related items inside `SelectGroup` and name each group with `SelectGroupLabel`. `SelectSeparator` adds a visual break without becoming an option.",examples:[{id:`select/groups`,caption:`Open Font and choose from Sans serif, Serif or Monospace. Each group has a label that screen readers announce.`,Example:L,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const fonts = [
  {
    label: "Sans serif",
    items: [
      { value: "inter", label: "Inter" },
      { value: "geist", label: "Geist" },
    ],
  },
  {
    label: "Serif",
    items: [
      { value: "source-serif", label: "Source Serif" },
      { value: "lora", label: "Lora" },
    ],
  },
  {
    label: "Monospace",
    items: [
      { value: "geist-mono", label: "Geist Mono" },
      { value: "jetbrains-mono", label: "JetBrains Mono" },
    ],
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Font</FieldLabel>
      <Select placeholder="Select a font">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <SelectSeparator />}
              <SelectGroup>
                <SelectGroupLabel>{group.label}</SelectGroupLabel>
                {group.items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    <SelectItemIndicator>
                      <CheckIcon />
                    </SelectItemIndicator>
                  </SelectItem>
                ))}
              </SelectGroup>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Icons`,text:"`SelectItemIcon` keeps an icon separate from the item's text, so it doesn't affect its accessible name, typeahead, or search. Add `SelectValueIcon` to the trigger to show the selected item's icon there too.",examples:[{id:`select/icons`,caption:`Choose Center or End. Both the label and the icon in the trigger update to match the selected item.`,Example:R,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
  SelectValueIcon,
} from "@ui-sdk/react/select"
import {
  CheckIcon,
  ChevronDownIcon,
  TextAlignCenterIcon,
  TextAlignEndIcon,
  TextAlignStartIcon,
} from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Text alignment</FieldLabel>
      <Select defaultValue="start">
        <SelectTrigger>
          <SelectValueIcon />
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="start">
            <SelectItemIcon mirror>
              <TextAlignStartIcon />
            </SelectItemIcon>
            Start
            <SelectItemIndicator>
              <CheckIcon />
            </SelectItemIndicator>
          </SelectItem>
          <SelectItem value="center">
            <SelectItemIcon>
              <TextAlignCenterIcon />
            </SelectItemIcon>
            Center
            <SelectItemIndicator>
              <CheckIcon />
            </SelectItemIndicator>
          </SelectItem>
          <SelectItem value="end">
            <SelectItemIcon mirror>
              <TextAlignEndIcon />
            </SelectItemIcon>
            End
            <SelectItemIndicator>
              <CheckIcon />
            </SelectItemIndicator>
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Typeahead`,text:`With the trigger focused and closed, typing selects the next matching option without opening the list. With the list open, typing moves the highlight; Enter chooses the highlighted item.`,examples:[{id:`select/typeahead`,caption:`Focus Country and type “sw” to select Sweden without opening the list. Open it and type “g” to highlight Germany, then press Enter.`,Example:B,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", code: "+54" },
  { value: "au", label: "Australia", code: "+61" },
  { value: "at", label: "Austria", code: "+43" },
  { value: "be", label: "Belgium", code: "+32" },
  { value: "br", label: "Brazil", code: "+55" },
  { value: "ca", label: "Canada", code: "+1" },
  { value: "dk", label: "Denmark", code: "+45" },
  { value: "fr", label: "France", code: "+33" },
  { value: "de", label: "Germany", code: "+49" },
  { value: "gr", label: "Greece", code: "+30" },
  { value: "ie", label: "Ireland", code: "+353" },
  { value: "jp", label: "Japan", code: "+81" },
  { value: "es", label: "Spain", code: "+34" },
  { value: "se", label: "Sweden", code: "+46" },
  { value: "ch", label: "Switzerland", code: "+41" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Select defaultValue="fr">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem
              key={country.value}
              value={country.value}
              label={country.label}
            >
              {country.label}
              <span data-slot="hint">{country.code}</span>
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Disabled`,text:`A disabled select can't be focused or changed and doesn't submit a value. A read-only select stays focusable and submits its value, but can't change. Keyboard navigation skips disabled items, and they can't be chosen.`,examples:[{id:`select/disabled`,caption:`Billing country is disabled and Shipping from is read-only. Open Shipping to and press the arrow keys: the highlight skips Denmark, which can't be chosen.`,Example:U,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ca", label: "Canada" },
  { value: "dk", label: "Denmark" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "es", label: "Spain" },
]

const fields = [
  { label: "Billing country", disabled: true },
  { label: "Shipping from", readOnly: true },
  { label: "Shipping to" },
]

function Example() {
  return (
    <div data-slot="stack">
      {fields.map((field) => (
        <Field key={field.label}>
          <FieldLabel>{field.label}</FieldLabel>
          <Select
            defaultValue={field.disabled || field.readOnly ? "fr" : null}
            placeholder="Select a country"
            disabled={field.disabled}
            readOnly={field.readOnly}
          >
            <SelectTrigger>
              <SelectValue />
              <ChevronDownIcon />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem
                  key={country.value}
                  value={country.value}
                  disabled={country.value === "dk"}
                >
                  {country.label}
                  <SelectItemIndicator>
                    <CheckIcon />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ))}
    </div>
  )
}

export { Example }
`}]},{heading:`Clear Button`,text:"`placeholder` appears while nothing is selected. Add `SelectClear` to return to that state. Clearing sets a single value to `null`, or multiple values to an empty array, and returns focus to the trigger.",examples:[{id:`select/clearable`,caption:`Press the clear button. The trigger shows Unassigned, focus returns to it, and the console logs null. Choose someone to bring the button back.`,Example:ue,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectClear,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
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

  return (
    <Field>
      <FieldLabel>Assignee</FieldLabel>
      <Select
        defaultValue="ines"
        placeholder="Unassigned"
        onValueChange={(value, details) =>
          log(\`value: \${JSON.stringify(value)} (\${details.reason})\`)
        }
      >
        <div data-slot="row">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectClear aria-label="Clear assignee">
            <XIcon />
          </SelectClear>
        </div>
        <SelectContent>
          {people.map((person) => (
            <SelectItem key={person.value} value={person.value}>
              {person.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Multiple`,text:"Set `multiple` to select more than one value. The value becomes an array, and choosing an item toggles it while keeping the list open.",examples:[{id:`select/multiple`,caption:`Choose several languages, then choose one again to remove it. The list stays open, and the console logs the array.`,Example:fe,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
]

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Languages</FieldLabel>
      <Select
        multiple
        defaultValue={["en", "ja"]}
        placeholder="Select languages"
        onValueChange={(value) => log(\`value: \${JSON.stringify(value)}\`)}
      >
        <SelectTrigger>
          <SelectValue>
            {(state) =>
              state.placeholder
                ? "Select languages"
                : state.labels.length > 2
                  ? \`\${state.labels[0]} and \${state.labels.length - 1} more\`
                  : state.label
            }
          </SelectValue>
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              {language.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Select All`,text:"Add `SelectSelectAll` to select or clear every enabled item. It shows a mixed state when only some are selected. Inside a `SelectGroup`, it applies to that group.",examples:[{id:`select/select-all`,caption:`Open Regions and press Select all. Press it again to clear the selection, then choose one region to see the mixed state.`,Example:me,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectSelectAll,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon, MinusIcon } from "lucide-react"

const regions = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "europe", label: "Europe" },
  { value: "asia-pacific", label: "Asia Pacific" },
  { value: "south-america", label: "South America" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Regions</FieldLabel>
      <Select
        multiple
        defaultValue={["us-east", "europe", "asia-pacific"]}
        placeholder="Select regions"
      >
        <SelectTrigger>
          <SelectValue
            maxLabels={2}
            getMoreLabel={(count) => \`\${count} more\`}
          />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectSelectAll>
            {(state) => (
              <>
                Select all
                {state.checked && <CheckIcon />}
                {state.indeterminate && <MinusIcon />}
              </>
            )}
          </SelectSelectAll>
          <SelectSeparator />
          {regions.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              {region.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Search with Groups`,text:"Add `SelectInput` inside `SelectContent` to filter the options. Put the items in `SelectList`, so the search field stays outside the scrollable list. `SelectEmpty` shows when nothing matches.",examples:[{id:`select/search-groups`,caption:`Open Country and type “ja”. Only Asia Pacific and Japan remain. Try “zz” to see the empty message, then clear the search to show every country.`,Example:ge,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectGroupLabel,
  SelectInput,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const regions = [
  {
    label: "Americas",
    items: [
      { value: "br", label: "Brazil" },
      { value: "ca", label: "Canada" },
      { value: "mx", label: "Mexico" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "fr", label: "France" },
      { value: "de", label: "Germany" },
      { value: "es", label: "Spain" },
    ],
  },
  {
    label: "Asia Pacific",
    items: [
      { value: "au", label: "Australia" },
      { value: "jp", label: "Japan" },
      { value: "sg", label: "Singapore" },
    ],
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Select placeholder="Select a country">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectInput
            aria-label="Search countries"
            placeholder="Search countries…"
          />
          <SelectEmpty>No countries found.</SelectEmpty>
          <SelectList>
            {regions.map((group) => (
              <SelectGroup key={group.label}>
                <SelectGroupLabel>{group.label}</SelectGroupLabel>
                {group.items.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    label={item.label}
                  >
                    <SelectItemText>
                      {(state) =>
                        state.segments.map((segment, index) =>
                          segment.match ? (
                            <b key={index}>{segment.text}</b>
                          ) : (
                            segment.text
                          )
                        )
                      }
                    </SelectItemText>
                    <SelectItemIndicator>
                      <CheckIcon />
                    </SelectItemIndicator>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Async Search`,text:"Use `filter={false}` when the server already filters your options. Connect `query` and `onQueryChange` to your loader, and pass its items and status to `Select`.",examples:[{id:`select/async-search`,caption:`Open Country and type “an”. Results arrive after a short delay. Clear the search and move or scroll to the last result to load another page.`,Example:ye,source:`"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectInput,
  SelectItem,
  SelectItemIndicator,
  SelectList,
  SelectStatus,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const countryList = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "cn", label: "China" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "in", label: "India" },
  { value: "ie", label: "Ireland" },
  { value: "it", label: "Italy" },
  { value: "jp", label: "Japan" },
  { value: "mx", label: "Mexico" },
  { value: "nl", label: "Netherlands" },
  { value: "no", label: "Norway" },
  { value: "pt", label: "Portugal" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

function searchCountries(
  query: string,
  { signal, page }: { signal: AbortSignal; page: number }
) {
  return new Promise<{ items: typeof countryList; hasMore: boolean }>(
    (resolve, reject) => {
      const timer = setTimeout(() => {
        const needle = query.trim().toLowerCase()
        const found = countryList.filter((country) =>
          country.label.toLowerCase().includes(needle)
        )
        resolve({
          items: found.slice(page * 6, page * 6 + 6),
          hasMore: found.length > page * 6 + 6,
        })
      }, 400)
      signal.addEventListener("abort", () => {
        clearTimeout(timer)
        reject(signal.reason)
      })
    }
  )
}

function Example() {
  const [query, setQuery] = React.useState("")
  const results = useAsyncOptions(searchCountries, { immediate: true })

  return (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Select
        items={results.items}
        filter={false}
        status={results.status}
        query={query}
        onQueryChange={(next) => {
          setQuery(next)
          results.setQuery(next)
        }}
        onLoadMore={results.loadMore}
        placeholder="Select a country"
      >
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectInput
            aria-label="Search countries"
            placeholder="Search countries…"
          />
          <SelectEmpty>
            {(state) =>
              state.empty && !state.loading
                ? \`No countries match “\${state.query}”.\`
                : null
            }
          </SelectEmpty>
          <SelectList>
            {(state) =>
              (
                state.items as {
                  value: string
                  label: string
                  disabled?: boolean
                }[]
              ).map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  disabled={item.disabled}
                >
                  {item.label}
                  <SelectItemIndicator>
                    <CheckIcon />
                  </SelectItemIndicator>
                </SelectItem>
              ))
            }
          </SelectList>
          <SelectStatus>
            {(state) =>
              state.loading
                ? "Loading…"
                : state.status === "error"
                  ? "Couldn't load countries."
                  : \`\${state.count} shown\`
            }
          </SelectStatus>
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Object Values`,text:`A value can be an object. Tell Select how to identify it, display it, and compare it with another copy:`,examples:[{id:`select/object-values`,caption:`Inès starts selected even though the initial value is a copy of her item. Choose another assignee; the console logs the ID the form submits.`,Example:be,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

type Member = { id: number; name: string; email: string }

const members: Member[] = [
  { id: 1, name: "Hollis Grant", email: "hollis@example.com" },
  { id: 2, name: "Inès Moreau", email: "ines@example.com" },
  { id: 3, name: "Kofi Mensah", email: "kofi@example.com" },
  { id: 4, name: "Wren Takahashi", email: "wren@example.com" },
]

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Assignee</FieldLabel>
      <Select
        defaultValue={{ ...members[1] }}
        onValueChange={(member) =>
          log(\`Submits assignee=\${member ? member.id : ""}\`)
        }
        name="assignee"
        itemToValue={(member) => String(member.id)}
        itemToLabel={(member) => member.name}
        isItemEqualToValue={(item, value) => item.id === value.id}
        placeholder="Unassigned"
      >
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => (
            <SelectItem key={member.id} value={member}>
              <span data-slot="stack">
                {member.name}
                <span data-slot="hint">{member.email}</span>
              </span>
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Virtualized`,text:"For a large list, pass every option through `items` and render only the visible rows. `onHighlight` tells your virtualizer which row to bring into view. Give each rendered item its full-list `index` so the accessibility attributes describe its position correctly.",examples:[{id:`select/virtualized`,caption:`Open Item and press End to reach Item 10000, then Home to return to the beginning. Scroll through the list; only nearby rows render.`,Example:we,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

const manyItems = Array.from({ length: 10_000 }, (_, index) => ({
  value: \`item-\${index + 1}\`,
  label: \`Item \${index + 1}\`,
}))

function visibleRows(
  scrollTop: number,
  height: number,
  count: number,
  row: number
) {
  const start = Math.max(0, Math.floor(scrollTop / row) - 4)
  const end = Math.min(count, Math.ceil((scrollTop + height) / row) + 4)
  return { start, end }
}

function scrollForRow(
  index: number,
  scrollTop: number,
  height: number,
  row: number
) {
  const top = index * row
  if (top < scrollTop) {
    return top
  }
  if (top + row > scrollTop + height) {
    return top + row - height
  }
  return scrollTop
}

const row = 32
const height = 288

function Example() {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)

  return (
    <Field>
      <FieldLabel>Item</FieldLabel>
      <Select
        items={manyItems}
        placeholder="Select an item"
        onHighlight={(value, { index }) => {
          const el = scroller.current
          if (el && index >= 0) {
            el.scrollTop = scrollForRow(
              index,
              el.scrollTop,
              el.clientHeight,
              row
            )
          }
        }}
      >
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          <div
            ref={scroller}
            style={{ height }}
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          >
            <SelectList>
              {(state) => {
                const items = state.items as { value: string; label: string }[]
                const { start, end } = visibleRows(
                  scrollTop,
                  height,
                  items.length,
                  row
                )
                return (
                  <div style={{ height: items.length * row }}>
                    {items.slice(start, end).map((item, offset) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        label={item.label}
                        index={start + offset}
                        style={{ top: (start + offset) * row, height: row }}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </div>
                )
              }}
            </SelectList>
          </div>
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Align Item with Trigger`,text:"Set `alignItemWithTrigger` on `SelectContent` to place the selected item over the trigger. It falls back to normal popup placement when opened by touch or when there isn't enough room.",examples:[{id:`select/align-item`,caption:`Open Priority: Medium sits over the trigger. Close it, uncheck Align item with trigger, and open it again to compare placement.`,Example:Ee,source:`"use client"

import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldLabel } from "@ui-sdk/react/field"
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

const priorities = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "No priority" },
]

function Example() {
  const [aligned, setAligned] = React.useState(true)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Checkbox
            checked={aligned}
            onCheckedChange={(next) => setAligned(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon />
            </CheckboxIndicator>
          </Checkbox>
          Align item with trigger
        </label>
      </div>
      <Field>
        <FieldLabel>Priority</FieldLabel>
        <Select defaultValue="medium">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={aligned}>
            {priorities.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

export { Example }
`}]},{heading:`Scrollable`,text:"Limit the content's height and allow vertical scrolling. `--available-height` tells you how much room the popup has; the highlighted item scrolls into view as you move with the keyboard.",examples:[{id:`select/scrollable`,caption:`Open Time zone and move down with the arrow keys. The list scrolls to keep the highlighted option visible.`,Example:Oe,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const timezones = [
  {
    label: "North America",
    items: [
      { value: "est", label: "Eastern Standard Time" },
      { value: "cst", label: "Central Standard Time" },
      { value: "mst", label: "Mountain Standard Time" },
      { value: "pst", label: "Pacific Standard Time" },
      { value: "akst", label: "Alaska Standard Time" },
      { value: "hst", label: "Hawaii Standard Time" },
    ],
  },
  {
    label: "Europe & Africa",
    items: [
      { value: "gmt", label: "Greenwich Mean Time" },
      { value: "cet", label: "Central European Time" },
      { value: "eet", label: "Eastern European Time" },
      { value: "west", label: "Western European Summer Time" },
      { value: "cat", label: "Central Africa Time" },
      { value: "eat", label: "East Africa Time" },
    ],
  },
  {
    label: "Asia",
    items: [
      { value: "msk", label: "Moscow Time" },
      { value: "ist", label: "India Standard Time" },
      { value: "cst-china", label: "China Standard Time" },
      { value: "jst", label: "Japan Standard Time" },
      { value: "kst", label: "Korea Standard Time" },
      { value: "ist-indonesia", label: "Indonesia Central Standard Time" },
    ],
  },
  {
    label: "Australia & Pacific",
    items: [
      { value: "awst", label: "Australian Western Standard Time" },
      { value: "acst", label: "Australian Central Standard Time" },
      { value: "aest", label: "Australian Eastern Standard Time" },
      { value: "nzst", label: "New Zealand Standard Time" },
      { value: "fjt", label: "Fiji Time" },
    ],
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Time zone</FieldLabel>
      <Select placeholder="Select a time zone">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((group) => (
            <SelectGroup key={group.label}>
              <SelectGroupLabel>{group.label}</SelectGroupLabel>
              {group.items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                  <SelectItemIndicator>
                    <CheckIcon />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`Invalid`,text:"Inside a Field, the field's label names the trigger, its description and errors describe it, and its `name` is used for submission. After invalid submission, the trigger gets `aria-invalid` and `data-invalid`.",examples:[{id:`select/invalid`,caption:`Press Continue without choosing a shipping method to show the error. Choose one and continue; the console logs the submitted value.`,Example:Ae,source:`"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const methods = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(
          \`Submitted shipping=\${new FormData(event.currentTarget).get("shipping")}\`
        )
      }}
    >
      <Field name="shipping">
        <FieldLabel>Shipping method</FieldLabel>
        <Select required placeholder="Select a shipping method">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {methods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          Express arrives in two business days.
        </FieldDescription>
        <FieldError match="valueMissing">Choose a shipping method.</FieldError>
      </Field>
      <button type="submit" data-variant="solid">
        Continue
      </button>
    </form>
  )
}

export { Example }
`}]},{heading:`Forms`,text:"Set `name` to include a select in form submission. `required` blocks submission until something is selected; resetting the form restores `defaultValue`. Multiple values submit as separate entries under the same name.",examples:[{id:`select/form`,caption:`Choose a country and some topics, change Frequency, then press Save; the console logs all three fields. Reset restores the initial choices.`,Example:Pe,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const countries = [
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
]

const topics = ["Design", "Engineering", "Marketing", "Research", "Sales"]

const frequencies = ["Daily", "Weekly", "Monthly"]

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <form
        id="select-newsletter"
        data-slot="stack"
        onSubmit={(event) => {
          event.preventDefault()
          const entries = [...new FormData(event.currentTarget)].map(
            ([name, value]) => \`\${name}=\${value}\`
          )
          log(\`Submitted \${entries.join("&")}\`)
        }}
      >
        <Field>
          <FieldLabel>Country</FieldLabel>
          <Select
            name="country"
            autoComplete="country"
            required
            placeholder="Select a country"
          >
            <SelectTrigger>
              <SelectValue />
              <ChevronDownIcon />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                  <SelectItemIndicator>
                    <CheckIcon />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Topics</FieldLabel>
          <Select name="topics" multiple defaultValue={["Design"]}>
            <SelectTrigger>
              <SelectValue />
              <ChevronDownIcon />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                  <SelectItemIndicator>
                    <CheckIcon />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </form>
      <Field>
        <FieldLabel>Frequency</FieldLabel>
        <Select name="frequency" form="select-newsletter" defaultValue="Weekly">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {frequencies.map((frequency) => (
              <SelectItem key={frequency} value={frequency}>
                {frequency}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div data-slot="row">
        <button type="submit" form="select-newsletter" data-variant="solid">
          Save
        </button>
        <button type="reset" form="select-newsletter">
          Reset
        </button>
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Presentation`,text:'Use `presentation="sheet"` to open the options in a bottom sheet, or `"auto"` to use a sheet on small touch screens. Choosing an item still selects it and closes the single-select list.',examples:[{id:`select/presentation`,caption:`Open Status to show the bottom sheet. Choose an option to close it, or drag down to dismiss it without changing the value.`,Example:Ie,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "in-review", label: "In Review" },
  { value: "done", label: "Done" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Status</FieldLabel>
      <Select defaultValue="todo" presentation="sheet">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]},{heading:`More examples`,text:``,examples:[{id:`select/animation`,caption:``,Example:Re,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "commenter", label: "Commenter" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
]

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <Select
        defaultValue="editor"
        onOpenChangeComplete={(open) =>
          log(open ? "Finished opening" : "Finished closing")
        }
      >
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
              <SelectItemIndicator keepMounted>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`},{id:`select/container`,caption:``,Example:Be,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
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

const fonts = [
  { value: "inter", label: "Inter" },
  { value: "geist", label: "Geist" },
  { value: "source-serif", label: "Source Serif" },
  { value: "geist-mono", label: "Geist Mono" },
]

function Example() {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)

  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Font</FieldLabel>
        <Select container={container} defaultValue="inter">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div ref={setContainer} data-slot="card" />
    </div>
  )
}

export { Example }
`},{id:`select/controlled`,caption:``,Example:He,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
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
import { useLog } from "../../../shared/react/log"

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "commenter", label: "Commenter" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
]

function Example() {
  const [value, setValue] = React.useState<string | null>("viewer")
  const [open, setOpen] = React.useState(false)
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setValue("editor")}>
          Make Editor
        </button>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
      </div>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <Select
          value={value}
          onValueChange={(next, details) => {
            if (next === "owner") {
              details.cancel()
              log("Only the owner can transfer ownership")
              return
            }
            setValue(next)
            log(\`value: \${next} (\${details.reason})\`)
          }}
          open={open}
          onOpenChange={(next, details) => {
            setOpen(next)
            log(\`open: \${next} (\${details.reason})\`)
          }}
        >
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

export { Example }
`},{id:`select/controller`,caption:``,Example:Ue,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
  createSelectController,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "../../../shared/react/log"

const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

const status = createSelectController<string>()

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={async () => {
            const { reason } = await status.open()
            log(\`Closed by \${reason}, with \${status.getValue() ?? "nothing"}\`)
          }}
        >
          Open and Wait
        </button>
        <button type="button" onClick={() => status.setValue("done")}>
          Mark Done
        </button>
        <button type="button" onClick={() => status.clear()}>
          Clear
        </button>
        <button type="button" onClick={() => status.focus()}>
          Focus
        </button>
      </div>
      <Field>
        <FieldLabel>Status</FieldLabel>
        <SelectTrigger controller={status}>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
      </Field>
      <Select
        controller={status}
        items={statuses}
        placeholder="Select a status"
      >
        <SelectContent>
          {statuses.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { Example }
`},{id:`select/custom-rendering`,caption:``,Example:Ge,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const members = [
  { value: "hollis", name: "Hollis Grant", email: "hollis@example.com" },
  { value: "ines", name: "Inès Moreau", email: "ines@example.com" },
  { value: "kofi", name: "Kofi Mensah", email: "kofi@example.com" },
  { value: "wren", name: "Wren Takahashi", email: "wren@example.com" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Reviewer</FieldLabel>
      <Select defaultValue="hollis">
        <SelectTrigger
          render={(props) => (
            <button {...props}>
              {props.children}
              <ChevronDownIcon />
            </button>
          )}
        >
          <SelectValue>
            {(state) => (
              <>
                <span data-slot="badge">{state.label.slice(0, 1)}</span>
                {state.label}
              </>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => (
            <SelectItem
              key={member.value}
              value={member.value}
              label={member.name}
              disabled={member.value === "wren"}
            >
              {(state) => (
                <>
                  <span data-slot="badge">{member.name.slice(0, 1)}</span>
                  <span data-slot="stack">
                    {member.name}
                    <span data-slot="hint">
                      {state.disabled ? "Out of office" : member.email}
                    </span>
                  </span>
                  <SelectItemIndicator
                    render={(props, indicator) => (
                      <span {...props}>
                        {indicator.selected && <CheckIcon />}
                      </span>
                    )}
                  />
                </>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`},{id:`select/loop`,caption:``,Example:qe,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const priorities = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "No priority" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Priority</FieldLabel>
      <Select loop={false} defaultValue="none">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {priorities.map((priority) => (
            <SelectItem key={priority.value} value={priority.value}>
              {priority.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`},{id:`select/modal`,caption:``,Example:Xe,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
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
import { useLog } from "../../../shared/react/log"

const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

const modes = [
  { value: "pointer", label: "Pointer" },
  { value: true, label: "Modal" },
  { value: false, label: "Non-modal" },
] as const

function Example() {
  const [modal, setModal] = React.useState<boolean | "pointer">("pointer")
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls" role="group" aria-label="Modal">
        {modes.map((mode) => (
          <button
            key={mode.label}
            type="button"
            aria-pressed={modal === mode.value}
            onClick={() => setModal(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <Field>
        <FieldLabel>Status</FieldLabel>
        <Select modal={modal} defaultValue="todo">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <button type="button" onClick={() => log("Pressed Save Draft")}>
        Save Draft
      </button>
    </div>
  )
}

export { Example }
`},{id:`select/options`,caption:``,Example:Ze,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
  type ListData,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const sizeGroups = [
  { type: "group", label: "Common", items: ["Small", "Medium", "Large"] },
  { type: "group", label: "Extended", items: ["Extra small", "Extra large"] },
] satisfies ListData

function Example() {
  return (
    <Field>
      <FieldLabel>Size</FieldLabel>
      <Select items={sizeGroups} name="size" defaultValue="Medium">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {sizeGroups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectGroupLabel>{group.label}</SelectGroupLabel>
              {group.items.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                  <SelectItemIndicator>
                    <CheckIcon />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`},{id:`select/placeholder`,caption:``,Example:$e,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const sizes = ["Extra small", "Small", "Medium", "Large", "Extra large"]

const wraps = ["Paper", "Ribbon", "Box"]

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Size</FieldLabel>
        <Select placeholder="Select a size">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Gift wrap</FieldLabel>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="None" />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {wraps.map((wrap) => (
              <SelectItem key={wrap} value={wrap}>
                {wrap}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

export { Example }
`},{id:`select/positioning`,caption:``,Example:tt,source:`"use client"

import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import {
  Select,
  SelectArrow,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const fonts = [
  { value: "inter", label: "Inter" },
  { value: "geist", label: "Geist" },
  { value: "source-serif", label: "Source Serif" },
  { value: "geist-mono", label: "Geist Mono" },
]

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
]

const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]

type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

function Example() {
  const [side, setSide] = React.useState<Side>("bottom")
  const [align, setAlign] = React.useState<Align>("start")
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)
  const [anchored, setAnchored] = React.useState(false)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={sides}
          value={side}
          onValueChange={(next) => next && setSide(next as Side)}
        >
          <SelectLabel>Side</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {sides.map((option) => (
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
          items={aligns}
          value={align}
          onValueChange={(next) => next && setAlign(next as Align)}
        >
          <SelectLabel>Align</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {aligns.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label data-slot="label">
          <Checkbox
            checked={anchored}
            onCheckedChange={(next) => setAnchored(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon />
            </CheckboxIndicator>
          </Checkbox>
          Anchor to the box
        </label>
      </div>
      <div ref={setBox} data-slot="card">
        <Select defaultValue="inter">
          <SelectTrigger aria-label="Font">
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent
            side={side}
            align={align}
            sideOffset={10}
            alignOffset={0}
            collisionPadding={16}
            anchor={anchored ? box : null}
          >
            <SelectArrow />
            {fonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export { Example }
`},{id:`select/rtl`,caption:``,Example:rt,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const languages = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
  { value: "fr", label: "الفرنسية" },
  { value: "es", label: "الإسبانية" },
  { value: "de", label: "الألمانية" },
]

function Example() {
  return (
    <div dir="rtl">
      <Field>
        <FieldLabel>اللغة</FieldLabel>
        <Select placeholder="اختر لغة">
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

export { Example }
`},{id:`select/searchable`,caption:``,Example:at,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectGroupLabel,
  SelectInput,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", code: "+54" },
  { value: "au", label: "Australia", code: "+61" },
  { value: "at", label: "Austria", code: "+43" },
  { value: "be", label: "Belgium", code: "+32" },
  { value: "br", label: "Brazil", code: "+55" },
  { value: "ca", label: "Canada", code: "+1" },
  { value: "cl", label: "Chile", code: "+56" },
  { value: "cn", label: "China", code: "+86" },
  { value: "dk", label: "Denmark", code: "+45" },
  { value: "fi", label: "Finland", code: "+358" },
  { value: "fr", label: "France", code: "+33" },
  { value: "de", label: "Germany", code: "+49" },
  { value: "gr", label: "Greece", code: "+30" },
  { value: "in", label: "India", code: "+91" },
  { value: "ie", label: "Ireland", code: "+353" },
  { value: "it", label: "Italy", code: "+39" },
  { value: "jp", label: "Japan", code: "+81" },
  { value: "mx", label: "Mexico", code: "+52" },
  { value: "nl", label: "Netherlands", code: "+31" },
  { value: "no", label: "Norway", code: "+47" },
  { value: "pt", label: "Portugal", code: "+351" },
  { value: "es", label: "Spain", code: "+34" },
  { value: "se", label: "Sweden", code: "+46" },
  { value: "ch", label: "Switzerland", code: "+41" },
]

const popularCountries = [
  {
    type: "group" as const,
    label: "Popular",
    items: [countries[5], countries[11], countries[16]],
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Select
        items={countries}
        emptyItems={popularCountries}
        placeholder="Select a country"
        filter="contains"
        announcement={(change) =>
          change.type === "results"
            ? \`\${change.count} \${change.count === 1 ? "country" : "countries"} found\`
            : null
        }
      >
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectInput
            aria-label="Search countries"
            placeholder="Search countries…"
          />
          <SelectEmpty>No countries found.</SelectEmpty>
          <SelectList>
            {(state) =>
              (
                state.items as (
                  (typeof countries)[number] | (typeof popularCountries)[number]
                )[]
              ).map((entry) =>
                "items" in entry ? (
                  <SelectGroup key={entry.label}>
                    <SelectGroupLabel>{entry.label}</SelectGroupLabel>
                    {entry.items.map((country) => (
                      <CountryItem key={country.value} country={country} />
                    ))}
                  </SelectGroup>
                ) : (
                  <CountryItem key={entry.value} country={entry} />
                )
              )
            }
          </SelectList>
        </SelectContent>
      </Select>
    </Field>
  )
}

function CountryItem({
  country,
}: {
  country: { value: string; label: string }
}) {
  return (
    <SelectItem value={country.value} label={country.label}>
      <SelectItemText />
      <SelectItemIndicator>
        <CheckIcon />
      </SelectItemIndicator>
    </SelectItem>
  )
}

export { Example }
`},{id:`select/virtual-focus`,caption:``,Example:st,source:`"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const priorities = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "No priority" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Priority</FieldLabel>
      <Select virtualFocus defaultValue="none">
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent>
          {priorities.map((priority) => (
            <SelectItem key={priority.value} value={priority.value}>
              {priority.label}
              <SelectItemIndicator>
                <CheckIcon />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { Example }
`}]}]};export{ct as default};