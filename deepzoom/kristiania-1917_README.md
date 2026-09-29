# Kristiania 1917 and Oslo Today

Aschehougs kart over Kristiania (3rd edition, 1917, Ivar Refsdal, 1:13 000) next to today's map of Oslo, kept in step as you pan and zoom.

**[Live](https://austegard.com/deepzoom/kristiania-1917.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/deepzoom/kristiania-1917.html)**

- **1917 map:** the National Library of Norway's scan ([nb.no](https://www.nb.no/items/2186ca144d5c37bab2d9b176aa3c8792)), loaded tile by tile over IIIF. Public domain.
- **Today's map:** Kartverket's topographic tiles (© Kartverket, CC BY 4.0). If those don't load, the page falls back to OpenStreetMap.
- **Alignment:** a least-squares affine fit to the 5 ground control points in the [Allmaps georeference](https://annotations.allmaps.org/maps/a7b30d806ba1fb3c) for this sheet. Residuals are 7.2 m RMS and 11.2 m at the worst point. When each point is left out of the fit in turn, it lands 6–22 m from its surveyed position.
- **Modes:**
  - **Side by side** shows the two maps in their own viewers, synced through the fit.
  - **Overlay** puts the 1917 sheet over today's map with adjustable opacity.
  - **Curtain** splits one view with a draggable divider.

Overlay and curtain place the sheet with the closest rotation-and-scale fit (11.8 m RMS), because OpenSeadragon positions an image by position, width and rotation only, with no skew. The **Alignment** panel lists the control points and residuals.

Tiles load from nb.no and kartverket.no, so this page needs a network connection.
