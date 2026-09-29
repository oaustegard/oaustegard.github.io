# Eiendomskart: Norway Property Map

Every registered property in Norway on one zoomable map. Click a parcel to outline it and see its cadastral number, area and addresses. Search by address, place name or gnr/bnr.

**[Live](https://austegard.com/deepzoom/eiendomskart.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/deepzoom/eiendomskart.html)**

- **Property lines:** Kartverket's cadastral map service (Matrikkelen, CC BY 4.0), drawn from zoom 14. Labels such as 208/646 appear once you are close enough.
- **Base maps:** Kartverket topographic and greyscale tiles (CC BY 4.0), OpenStreetMap (ODbL), EOX Sentinel-2 cloudless 2025 (CC BY-NC-SA 4.0), a lidar surface-model hillshade that shows individual buildings and trees (Kartverket, CC BY 4.0), and the first edition of the Economic Map of Norway.
- **Overlays:** buildings, address points and terrain hillshade, each with its own opacity.
- **Click or tap** a parcel for gnr/bnr, municipality, area, boundary accuracy class, last update and every address on the property, with a link to SeEiendom for owners and transfers. A double-click zooms.
- **Search** takes an address (`Storgata 28B`), a place name (`Preikestolen`) or a cadastral number: `208/646` looks in the municipality at the centre of the map, `Bærum 41/1` or `3201 41/1` in the one named.
- **Links:** the URL keeps zoom, position, base map and overlays (`#17/59.91390/10.75220/lidar/pb`), so any view can be shared.

The satellite layer is Sentinel-2 at 10 m per pixel, too coarse to see a garden. Norway's aerial photos (Norge i bilder) would show one, but their map service only answers approved addresses, so they are not here. The lidar surface model is the open substitute at property scale.

There is no server behind this page. OpenSeadragon 6.1 treats each map service as one square image covering the Web Mercator world, with slippy-map tiles and WMS requests as its levels, and the browser calls Geonorge's search and property APIs directly. It needs a network connection.
