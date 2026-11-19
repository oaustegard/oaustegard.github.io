import{Ks as e,Xa as t,a as n,c as r,cl as i,d as a,do as o,f as s,fl as c,i as l,l as u,o as d,qa as f,qs as p,r as m,ro as h,s as g,tl as _,to as v,u as y,uo as b}from"../chunks/c-CIXE4Nkk.js";const x=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22640%22%20height%3D%22420%22%3E%3Crect%20width%3D%22640%22%20height%3D%22420%22%20fill%3D%22%23e5e5e5%22%2F%3E%3Ccircle%20cx%3D%22460%22%20cy%3D%22150%22%20r%3D%2256%22%20fill%3D%22%23fafafa%22%2F%3E%3Cpath%20d%3D%22M0%20280%20120%20170l110%20100%20120-130%20130%20125%2090-60%2070%2040v175H0z%22%20fill%3D%22%23a3a3a3%22%2F%3E%3Cpath%20d%3D%22M0%20330l160-80%20120%2070%20150-80%20210%2085v95H0z%22%20fill%3D%22%23525252%22%2F%3E%3Cpath%20d%3D%22M0%20380q160-35%20320-10t320-5v55H0z%22%20fill%3D%22%23262626%22%2F%3E%3C%2Fsvg%3E`,S=[{value:`free`,label:`Free`,ratio:void 0},{value:`square`,label:`Square`,ratio:1},{value:`landscape`,label:`4:3`,ratio:4/3},{value:`wide`,label:`16:9`,ratio:16/9}],C=[`nw`,`n`,`ne`,`e`,`se`,`s`,`sw`,`w`];function w(){let[r,a]=c(`free`),[l,w]=c(),[T,E]=c();i(()=>()=>{T&&URL.revokeObjectURL(T)},[T]);async function D(){if(!l)return;let e=await s(x,l);E(URL.createObjectURL(e))}return/* @__PURE__ */ _(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ _(`div`,{"data-slot":`controls`,children:[/* @__PURE__ */ _(f,{value:r,onValueChange:a,children:[/* @__PURE__ */ _(b,{"aria-label":`Aspect ratio`,children:[/* @__PURE__ */ _(o,{}),/* @__PURE__ */ _(e,{})]}),/* @__PURE__ */ _(t,{children:S.map(e=>/* @__PURE__ */ _(v,{value:e.value,children:[e.label,/* @__PURE__ */ _(h,{children:/* @__PURE__ */ _(p,{})})]},e.value))})]}),/* @__PURE__ */ _(`button`,{type:`button`,"data-variant":`solid`,onClick:D,children:`Crop`})]}),/* @__PURE__ */ _(m,{"aria-label":`Photo`,src:x,aspectRatio:S.find(e=>e.value===r)?.ratio,minWidth:64,minHeight:64,crop:l,onCropChange:w,children:/* @__PURE__ */ _(y,{children:[/* @__PURE__ */ _(g,{alt:`Mountains at sunset`}),/* @__PURE__ */ _(u,{children:/* @__PURE__ */ _(n,{})}),C.map(e=>/* @__PURE__ */ _(d,{position:e},e))]})}),/* @__PURE__ */ _(`div`,{"data-slot":`image-cropper-result`,children:T&&/* @__PURE__ */ _(`img`,{src:T,alt:`Your crop`})})]})}const T=[{label:`Free`,value:void 0},{label:`Square`,value:1},{label:`Wide`,value:16/9}],E=[`nw`,`n`,`ne`,`e`,`se`,`s`,`sw`,`w`];function D(){let[e,t]=c();return/* @__PURE__ */ _(`div`,{"data-slot":`stack`,children:[/* @__PURE__ */ _(`div`,{"data-slot":`controls`,children:T.map(n=>/* @__PURE__ */ _(`button`,{type:`button`,"aria-pressed":e===n.value,onClick:()=>t(n.value),children:n.label},n.label))}),/* @__PURE__ */ _(m,{"aria-label":`Photo`,src:`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22640%22%20height%3D%22420%22%3E%3Crect%20width%3D%22640%22%20height%3D%22420%22%20fill%3D%22%23e5e5e5%22%2F%3E%3Ccircle%20cx%3D%22460%22%20cy%3D%22150%22%20r%3D%2256%22%20fill%3D%22%23fafafa%22%2F%3E%3Cpath%20d%3D%22M0%20280%20120%20170l110%20100%20120-130%20130%20125%2090-60%2070%2040v175H0z%22%20fill%3D%22%23a3a3a3%22%2F%3E%3Cpath%20d%3D%22M0%20330l160-80%20120%2070%20150-80%20210%2085v95H0z%22%20fill%3D%22%23525252%22%2F%3E%3Cpath%20d%3D%22M0%20380q160-35%20320-10t320-5v55H0z%22%20fill%3D%22%23262626%22%2F%3E%3C%2Fsvg%3E`,aspectRatio:e,minWidth:64,minHeight:64,children:[/* @__PURE__ */ _(y,{children:[/* @__PURE__ */ _(g,{alt:`Mountains at sunset`}),/* @__PURE__ */ _(u,{children:/* @__PURE__ */ _(n,{})}),E.map(e=>/* @__PURE__ */ _(d,{position:e},e))]}),/* @__PURE__ */ _(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ _(l,{children:`Flip`}),/* @__PURE__ */ _(l,{direction:`vertical`,children:`Flip Vertically`})]})]})]})}const O=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22640%22%20height%3D%22420%22%3E%3Crect%20width%3D%22640%22%20height%3D%22420%22%20fill%3D%22%23e5e5e5%22%2F%3E%3Ccircle%20cx%3D%22460%22%20cy%3D%22150%22%20r%3D%2256%22%20fill%3D%22%23fafafa%22%2F%3E%3Cpath%20d%3D%22M0%20280%20120%20170l110%20100%20120-130%20130%20125%2090-60%2070%2040v175H0z%22%20fill%3D%22%23a3a3a3%22%2F%3E%3Cpath%20d%3D%22M0%20330l160-80%20120%2070%20150-80%20210%2085v95H0z%22%20fill%3D%22%23525252%22%2F%3E%3Cpath%20d%3D%22M0%20380q160-35%20320-10t320-5v55H0z%22%20fill%3D%22%23262626%22%2F%3E%3C%2Fsvg%3E`;function k(){let[e,t]=c(),[n,o]=c();i(()=>()=>{n&&URL.revokeObjectURL(n)},[n]);async function l(){if(!e)return;let t=await s(O,e,{width:128,shape:`circle`});o(URL.createObjectURL(t))}return/* @__PURE__ */ _(m,{"aria-label":`Profile photo`,src:O,mode:`frame`,aspectRatio:1,shape:`circle`,maxZoom:4,crop:e,onCropChange:t,children:[/* @__PURE__ */ _(y,{children:[/* @__PURE__ */ _(g,{alt:`Mountains at sunset`}),/* @__PURE__ */ _(u,{})]}),/* @__PURE__ */ _(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ _(a,{}),/* @__PURE__ */ _(r,{children:`Rotate`})]}),/* @__PURE__ */ _(`div`,{"data-slot":`row`,children:[/* @__PURE__ */ _(`button`,{type:`button`,onClick:l,children:`Save Avatar`}),n&&/* @__PURE__ */ _(`img`,{"data-slot":`image-cropper-avatar`,src:n,alt:`Your new avatar`})]})]})}var A={name:`image-cropper`,title:`Image Cropper`,description:`Choose the part of an image to keep by moving and resizing a selection, or by panning and zooming the image under it.`,sections:[{heading:null,text:"Use an image cropper to choose the part of a photo to keep, like a profile picture or a cover image. The crop is a box in the image's own pixels, with a quarter-turn rotation and a flip, ready to pass to `cropImage`.",examples:[{id:`image-cropper/basic`,caption:`Pick a ratio, drag the selection or one of its handles, then press Crop. Tab to the selection and use the arrow keys, with Shift to move further.`,Example:w,source:`"use client"

import * as React from "react"
import { cropImage } from "@ui-sdk/react/image"
import {
  ImageCropper,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
  type ImageCrop,
} from "@ui-sdk/react/image-cropper"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const photo = \`data:image/svg+xml,\${encodeURIComponent(
  \`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>\`
)}\`

const ratios = [
  { value: "free", label: "Free", ratio: undefined },
  { value: "square", label: "Square", ratio: 1 },
  { value: "landscape", label: "4:3", ratio: 4 / 3 },
  { value: "wide", label: "16:9", ratio: 16 / 9 },
]

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const

function Example() {
  const [ratio, setRatio] = React.useState<string | null>("free")
  const [crop, setCrop] = React.useState<ImageCrop>()
  const [result, setResult] = React.useState<string>()

  React.useEffect(
    () => () => {
      if (result) {
        URL.revokeObjectURL(result)
      }
    },
    [result]
  )

  async function save() {
    if (!crop) {
      return
    }
    const file = await cropImage(photo, crop)
    setResult(URL.createObjectURL(file))
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select value={ratio} onValueChange={setRatio}>
          <SelectTrigger aria-label="Aspect ratio">
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {ratios.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button type="button" data-variant="solid" onClick={save}>
          Crop
        </button>
      </div>
      <ImageCropper
        aria-label="Photo"
        src={photo}
        aspectRatio={ratios.find((item) => item.value === ratio)?.ratio}
        minWidth={64}
        minHeight={64}
        crop={crop}
        onCropChange={setCrop}
      >
        <ImageCropperViewport>
          <ImageCropperImage alt="Mountains at sunset" />
          <ImageCropperSelection>
            <ImageCropperGrid />
          </ImageCropperSelection>
          {handles.map((position) => (
            <ImageCropperHandle key={position} position={position} />
          ))}
        </ImageCropperViewport>
      </ImageCropper>
      <div data-slot="image-cropper-result">
        {result && <img src={result} alt="Your crop" />}
      </div>
    </div>
  )
}

export { Example }
`}]},{heading:`Aspect Ratio`,text:"Set `aspectRatio` to keep the crop's width over its height, like `1` for a square or `16 / 9`. Changing it fits the crop to the new ratio about its middle. Without one, the crop is free, and holding Shift while dragging a handle keeps its current ratio. `minWidth` and `minHeight` stop it getting too small, in image pixels.",examples:[{id:`image-cropper/aspect-ratio`,caption:`Choose Square or Wide, then drag an edge. Flip mirrors the image and the crop with it.`,Example:D,source:`"use client"

import * as React from "react"
import {
  ImageCropper,
  ImageCropperFlip,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@ui-sdk/react/image-cropper"

const photo = \`data:image/svg+xml,\${encodeURIComponent(
  \`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>\`
)}\`

const ratios = [
  { label: "Free", value: undefined },
  { label: "Square", value: 1 },
  { label: "Wide", value: 16 / 9 },
]

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const

function Example() {
  const [aspectRatio, setAspectRatio] = React.useState<number>()
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        {ratios.map((ratio) => (
          <button
            key={ratio.label}
            type="button"
            aria-pressed={aspectRatio === ratio.value}
            onClick={() => setAspectRatio(ratio.value)}
          >
            {ratio.label}
          </button>
        ))}
      </div>
      <ImageCropper
        aria-label="Photo"
        src={photo}
        aspectRatio={aspectRatio}
        minWidth={64}
        minHeight={64}
      >
        <ImageCropperViewport>
          <ImageCropperImage alt="Mountains at sunset" />
          <ImageCropperSelection>
            <ImageCropperGrid />
          </ImageCropperSelection>
          {handles.map((position) => (
            <ImageCropperHandle key={position} position={position} />
          ))}
        </ImageCropperViewport>
        <div data-slot="row">
          <ImageCropperFlip>Flip</ImageCropperFlip>
          <ImageCropperFlip direction="vertical">
            Flip Vertically
          </ImageCropperFlip>
        </div>
      </ImageCropper>
    </div>
  )
}

export { Example }
`}]},{heading:`Frame Mode`,text:'Set `mode="frame"` for an avatar editor. The selection stays still and as large as it fits, and you pan the image under it with a drag, and zoom with the wheel, a pinch or the zoom input. Handles don\'t show in a frame.',examples:[{id:`image-cropper/avatar`,caption:`Drag the image or move the zoom, then press Save Avatar. The new avatar shows beside the button.`,Example:k,source:`"use client"

import * as React from "react"
import { cropImage } from "@ui-sdk/react/image"
import {
  ImageCropper,
  ImageCropperImage,
  ImageCropperRotate,
  ImageCropperSelection,
  ImageCropperViewport,
  ImageCropperZoom,
  type ImageCrop,
} from "@ui-sdk/react/image-cropper"

const photo = \`data:image/svg+xml,\${encodeURIComponent(
  \`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>\`
)}\`

function Example() {
  const [crop, setCrop] = React.useState<ImageCrop>()
  const [avatar, setAvatar] = React.useState<string>()

  React.useEffect(
    () => () => {
      if (avatar) {
        URL.revokeObjectURL(avatar)
      }
    },
    [avatar]
  )

  async function save() {
    if (!crop) {
      return
    }
    const file = await cropImage(photo, crop, { width: 128, shape: "circle" })
    setAvatar(URL.createObjectURL(file))
  }

  return (
    <ImageCropper
      aria-label="Profile photo"
      src={photo}
      mode="frame"
      aspectRatio={1}
      shape="circle"
      maxZoom={4}
      crop={crop}
      onCropChange={setCrop}
    >
      <ImageCropperViewport>
        <ImageCropperImage alt="Mountains at sunset" />
        <ImageCropperSelection />
      </ImageCropperViewport>
      <div data-slot="row">
        <ImageCropperZoom />
        <ImageCropperRotate>Rotate</ImageCropperRotate>
      </div>
      <div data-slot="row">
        <button type="button" onClick={save}>
          Save Avatar
        </button>
        {avatar && (
          <img
            data-slot="image-cropper-avatar"
            src={avatar}
            alt="Your new avatar"
          />
        )}
      </div>
    </ImageCropper>
  )
}

export { Example }
`}]}]};export{A as default};