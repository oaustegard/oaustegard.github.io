# Ann Arbor Real Estate

Ann Arbor and the 10 miles around downtown on one zoomable map. Public records come in as layers you can switch on and off, and for-sale listings come from the sources that allow it. Beyond 10 miles the map fades to the page background, and panning past the edge springs back.

**[Live](https://austegard.com/deepzoom/ann-arbor-real-estate.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/deepzoom/ann-arbor-real-estate.html)**

- **Base maps:** OpenStreetMap, Esri light grey, USGS topographic, Esri World Imagery, State of Michigan aerial imagery, and None.
- **On top of the base map:** both aerials again as see-through layers with their own opacity, so a photo can sit over the street map; Esri's roads and place names, which put streets over an aerial base; and the USGS 3DEP lidar hillshade, multiplied into whatever is under it.
- **Records:** City of Ann Arbor zoning, land use, historic districts and tax parcels; FEMA flood zones. The city layers stop at the city limits.
- **Boundaries:** the Ann Arbor city limits as a crisp line (on by default), plus school districts and cities, townships and villages, all from the State of Michigan.
- **Click** anywhere for the parcel (number, owner, use, year built, floor area, lot, land value, highest recorded sale, sale price per square foot, neighborhood, ward) together with zoning, historic district, FEMA flood zone, school district and municipality at that point. The card links the address to Zillow, to Redfin and Realtor.com (through a DuckDuckGo first-result search on each site, since their property URLs carry internal ids), to Google Maps, and to the city assessor and the county property search.
- **Search** takes an address or place (Esri's geocoder, limited to the 10-mile circle) or a Washtenaw parcel number such as `09-09-29-123-004`.
- **Links:** the URL keeps zoom, position, base map and layers (`#16/42.28080/-83.74830/osm/zpm`), and the query string keeps the property you opened. A link can also start a lookup: `?q=315 E Liberty St` searches an address or place, `?pin=09-09-29-123-004` a parcel number, and `?ll=42.2794,-83.7448` a point.
- **Sale dates** are not in any open city or county service. The parcel card shows the highest recorded sale and links to the city assessor's BS&A site, whose property pages carry the sale history with dates.

## Listings

No portal or MLS offers listing data to a page with no server. Zillow, Redfin and Realtor.com have no public API, and the MLS feed for the area (IDX through the Realtor boards) requires a broker agreement. The page uses what is open:

- **Tax-foreclosure auction:** Washtenaw County publishes this year's auction list as an open map layer. Switch it on to outline every parcel on it, with address, class, SEV and taxable value.
- **For sale (RentCast):** paste your own [RentCast](https://www.rentcast.io/api) API key to load active sale listings around the current view as pins, with price, beds, baths, floor area, HOA fee and days on market. The key stays in your browser's local storage and goes only to api.rentcast.io. The free plan allows 50 requests a month, so the page fetches only when you press the button. Whether RentCast answers browser requests (CORS) was not checked before publishing; if it does not, the button reports "Blocked or offline".
- **Portal links:** the Listings panel opens Zillow on the exact map bounds in view, and Redfin and Realtor.com on Ann Arbor.

## Coverage gaps

Washtenaw County's countywide parcel service answers only the county's own apps, so parcel records outside the City of Ann Arbor are not on the map. Clicking there still returns zoning (where the city has it), flood zone, school district and municipality, and links to the county property search.

There is no server behind this page. OpenSeadragon 6.1 treats each map service as one square image covering the Web Mercator world, with slippy-map tiles and ArcGIS export requests as its levels. The city's zoning and parcel layers hide themselves when zoomed out, so the page requests them at a lower dpi to make them draw a few zoom levels earlier. Tiles load as plain images, so no tile service needs CORS; the click and search lookups call the City of Ann Arbor, FEMA, State of Michigan, Washtenaw County and Esri services directly from the browser.
