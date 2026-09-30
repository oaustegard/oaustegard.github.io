# Eiendomskart: Norway Property Map

Every registered property in Norway on one zoomable map. Click a parcel to outline it and see its cadastral number, area and addresses. Search by address, place name or gnr/bnr.

**[Live](https://austegard.com/deepzoom/eiendomskart.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/deepzoom/eiendomskart.html)**

- **Property lines:** Kartverket's cadastral map service (Matrikkelen, CC BY 4.0), drawn from zoom 14. Labels such as 208/646 appear once you are close enough.
- **Base maps:** Kartverket topographic and greyscale tiles (CC BY 4.0), OpenStreetMap (ODbL), Esri World Imagery aerial photos (0.3–0.5 m, mostly 2018–2025), EOX Sentinel-2 cloudless 2025 (CC BY-NC-SA 4.0), the first edition of the Economic Map of Norway, and None, which leaves only the relief layers on white.
- **Relief:** terrain hillshade (bare ground) and a lidar surface-model hillshade that shows individual buildings and trees (both Kartverket, CC BY 4.0). They are multiplied into whichever base map is under them, so contour colours and photo detail stay visible through the shading. Where a model has no data, outside Norway or outside lidar coverage, the layer draws nothing.
- **Overlays:** buildings and address points. Every relief layer and overlay has its own opacity.
- **Click or tap** a parcel for gnr/bnr, municipality, area, boundary accuracy class, last update and every address on the property, with a link to SeEiendom for owners and transfers. A double-click zooms.
- **Search** takes an address (`Storgata 28B`), a place name (`Preikestolen`) or a cadastral number: `208/646` looks in the municipality at the centre of the map, `Bærum 41/1` or `3201 41/1` in the one named.
- **Links:** the URL keeps zoom, position, base map and overlays (`#17/59.91390/10.75220/topo/lpb`), so any view can be shared. Older links that used `lidar` as the base map open with the lidar relief on a blank base.

Kartverket's own aerial photos (Norge i bilder) are sharper and newer, but their map service answers only approved addresses. Geodata's cache of the same photos has an open URL, but its terms require a Geodata agreement, so the aerial layer uses Esri's instead. Esri stops at zoom 18, since outside the cities its zoom-19 tiles are "Map data not yet available" placeholders. Past that the page enlarges the zoom-18 tiles, and the lidar surface is the sharper view at single-parcel scale.

There is no server behind this page. OpenSeadragon 6.1 treats each map service as one square image covering the Web Mercator world, with slippy-map tiles and WMS requests as its levels, and the browser calls Geonorge's search and property APIs directly. It needs a network connection.
