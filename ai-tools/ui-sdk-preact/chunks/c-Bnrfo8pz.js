import{createContext as e,createElement as t,forwardRef as n,useContext as r}from"preact/compat";
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const i=e=>e?.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase();
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
function a(e,t,n=[]){if(t==null)throw Error(`[lucide]: iconNode is required when icon name is used`);return{name:i(e),size:24,node:t,...n.length>0?{aliases:n}:{}}}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const o=e=>{let t=``,n=!1;for(let r of e){if(r===`-`||r===`_`||r<=` `){n=t.length>0;continue}t.length===0?t+=r.toLowerCase():t+=n?r.toUpperCase():r,n=!1}return t},s=e=>{
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let t=o(e);return t.charAt(0).toUpperCase()+t.slice(1)},c=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),l={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
;
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
function u(e){return e!=null}function d(e,t={}){let n=t.attributeNames??{},r=e=>n[e]??e,i=e.size??e.width??l.width,a=e.size??e.height??l.height,o=e.aliases?.filter(e=>typeof e==`string`&&e.trim()!==``).map(e=>`lucide-${e}`)??[],s=[...e.name?[`lucide-${e.name}`]:[],...o],d=t.className?.split(` `).filter(Boolean)??[],f=t.includeDefaultClasses===!1?c(...d):c(`lucide`,...s,...d),p=t.absoluteStrokeWidth?Number(t.strokeWidth??l[`stroke-width`])*Number(e.size??e.width??l.width)/Number(t.size??t.width??l.width):t.strokeWidth??l[`stroke-width`];return[`svg`,{...Object.entries(l).reduce((e,[t,n])=>(e[r(t)]=n,e),{}),...`color`in t&&t.color&&{[r(`stroke`)]:t.color},...`size`in t&&u(t.size)&&{[r(`width`)]:t.size,[r(`height`)]:t.size},...`width`in t&&u(t.width)&&{[r(`width`)]:t.width},...`height`in t&&u(t.height)&&{[r(`height`)]:t.height},[r(`stroke-width`)]:p,...f&&{[r(`class`)]:f},[r(`viewBox`)]:`0 0 ${i} ${a}`,...t.hasA11yProp===!1?{[r(`aria-hidden`)]:`true`}:{},...`attributes`in t&&t.attributes},e.node.map(e=>{let[n,i,a]=e,o=t.nonScalingStroke?{[r(`vector-effect`)]:`non-scaling-stroke`,...i}:i;return a?[n,o,a]:[n,o]})]}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
function f(e,t={}){return d(e,{...t,attributeNames:{...t.attributeNames,class:`className`,"stroke-width":`strokeWidth`,"stroke-linecap":`strokeLinecap`,"stroke-linejoin":`strokeLinejoin`,"vector-effect":`vectorEffect`}})}
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const p=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},m=e({}),h=()=>r(m),g=n(({color:e,size:n,width:r,height:i,strokeWidth:a,absoluteStrokeWidth:o,nonScalingStroke:s,className:l=``,children:u,iconNode:d=[],icon:m={node:d,aliases:[],size:24},...g},_)=>{
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let{size:v=24,strokeWidth:y=2,absoluteStrokeWidth:b=!1,nonScalingStroke:x=!1,color:S=`currentColor`,className:C=``}=h()??{},w=!!u||p(g),[T,E,D=[]]=f(m,{color:e??S,width:r??n??v,height:i??n??v,strokeWidth:a??y,absoluteStrokeWidth:o??b,nonScalingStroke:s??x,className:c(C,l),hasA11yProp:w,attributes:g});return t(T,{ref:_,...E},[...D.map(([e,n])=>t(e,n)),...Array.isArray(u)?u:[u]])});
/**
* @license lucide-react v1.52.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
function _(e,r=[],i=[]){let o=typeof e==`string`?a(e,r,i):e,c=n(({className:e,...n},r)=>t(g,{ref:r,icon:o,className:e,...n}));return o.name&&(c.displayName=s(o.name)),c}export{_ as t};