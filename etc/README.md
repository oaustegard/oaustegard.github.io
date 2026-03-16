# Five Years of Your Life — US Housing Affordability, 1960–2025

**Live page:** [oaustegard.github.io/etc/housing-affordability.html](https://oaustegard.github.io/etc/housing-affordability.html)

A data-driven look at the US housing price-to-income ratio over six decades, with interactive charts highlighting the national trajectory and stark regional divergence.

## Origin

This page was prompted by [a Bluesky thread](https://bsky.app) (March 2026) in which someone discovered the price-to-income ratio metric and its historical progression for the first time. They noted that while everyone paying attention understands there's a housing access problem, the specific numbers — and particularly their trajectory over 60 years — are surprisingly unfamiliar to most people. The thread asked: "Did you know these numbers? If not, I wonder why not."

The claims in the thread (ratio of ~2.1 in 1960, ~2.6 as a "healthy" benchmark, over 5 since 2005) checked out. This page compiles the data behind those claims and presents it visually.

*(Author of the original thread is anonymous pending their confirmation they'd like to be credited.)*

## Research methodology

Data was compiled in March 2026 using Claude (Anthropic) as a research assistant, with all claims verified against primary sources. The research involved:

1. **Cross-referencing multiple data series** — The page presents two distinct methodological approaches (Census home-value series and FRED new-home-sale series) because they produce meaningfully different ratio levels while confirming the same trajectory. This distinction is important: the Census series (median home value ÷ median family income) produces lower ratios because it includes the entire housing stock; the MSPUS series (median new home sale price ÷ median household income) produces higher ratios because new homes are larger and more expensive.

2. **Validating specific claims** — Each numeric claim from the original thread was checked against primary sources:
   - "2.1 in 1960" → Census: $11,900 / $5,620 = 2.12 ✓
   - "2.6 is good" → Industry rule-of-thumb for "affordable" ratio, cited by CityLab and NAR ✓  
   - "Over 5 since 2005" → MSPUS series first hit 5.1 in 2005, above or near 5.0 most years since ✓

3. **Metro-level data** — Regional breakdowns sourced primarily from the Demographia International Housing Affordability 2025 Edition (Q3 2024 data) and Harvard JCHS analyses, which use consistent methodology across markets.

4. **Distribution analysis** — The "hollowing out" of the affordable middle (2019 vs 2024 metro bracket distribution) is derived from Harvard JCHS reports comparing the distribution of the 100 largest metros across ratio brackets.

5. **Real-growth scissors chart** — Inflation-adjusted cumulative growth indexed to 1960=100 is approximated from Census/BLS CPI-adjusted figures reported by Clever Real Estate and Visual Capitalist. The headline figures (121% real home price growth vs 29% real income growth since 1960) are from those analyses.

## Data sources

### Primary data

| Source | What it provides | URL |
|--------|-----------------|-----|
| **US Census Bureau** | Decennial median home values and family income (1950–2000) | [census.gov](https://www.census.gov/) |
| **FRED (Federal Reserve Economic Data)** | MSPUS (median sale price of new homes), MEHOINUSA646N (median household income) | [fred.stlouisfed.org](https://fred.stlouisfed.org/) |
| **Harvard Joint Center for Housing Studies** | National and metro-level price-to-income analysis, distribution breakdowns | [jchs.harvard.edu](https://www.jchs.harvard.edu/blog/home-prices-surge-five-times-median-income-nearing-historic-highs) |
| **Demographia** | International Housing Affordability 2025 Edition — metro-level median multiples | [chapman.edu (PDF)](https://www.chapman.edu/communication/_files/Demographia-International-Housing-Affordability-2025-Edition.pdf) |
| **National Association of Realtors (NAR)** | Regional median prices, Housing Affordability Index | [nar.realtor](https://www.nar.realtor/blogs/economists-outlook/latest-housing-affordability-index-data-graphs) |

### Secondary / analytical sources

| Source | What it provides | URL |
|--------|-----------------|-----|
| Clever Real Estate | Compiled Census time series, 1960–present | [listwithclever.com](https://listwithclever.com/research/home-price-v-income-historical-study/) |
| Visual Capitalist | Income vs home price charts, 1985–2025 | [visualcapitalist.com](https://www.visualcapitalist.com/charted-american-income-vs-home-prices-1985-2025/) |
| LongtermTrends | Interactive historical ratio chart | [longtermtrends.com](https://www.longtermtrends.com/home-price-median-annual-income-ratio/) |
| Construction Coverage | Metro-level ratio rankings (2025 edition) | [constructioncoverage.com](https://constructioncoverage.com/research/cities-with-highest-home-price-to-income-ratios) |
| FHFA | Lock-in effect research (Working Paper 24-03) | [fhfa.gov](https://www.fhfa.gov/research/papers/wp2403) |
| Federal Reserve | Mobility and lock-in analysis | [federalreserve.gov](https://www.federalreserve.gov/econres/feds/locked-in-rate-hikes-housing-markets-and-mobility.htm) |
| Dallas Fed | Housing shortage and Texas metro blueprint | [dallasfed.org](https://www.dallasfed.org/research/swe/2025/swe2517) |
| Zillow | Housing deficit estimates (4.7M units) | [zillowgroup.com](https://investors.zillowgroup.com/investors/news-and-events/news/news-details/2025/US-housing-deficit-grew-to-4-7-million-despite-construction-surge/default.aspx) |
| Atlanta Fed | Home Ownership Affordability Monitor | [atlantafed.org](https://www.atlantafed.org/economy-matters/community-and-economic-development/2022/07/11/affordability-declines) |
| NAHB | Cost of Housing Index, regulatory cost estimates | [nahb.org](https://www.nahb.org/news-and-economics/housing-economics/indices/cost-of-housing-index) |
| Freddie Mac | Primary Mortgage Market Survey (PMMS) rates | [freddiemac.com](https://www.freddiemac.com/pmms) |
| Statista | House prices vs income visualization | [statista.com](https://www.statista.com/chart/34534/median-house-price-versus-median-income-in-the-us/) |

## Technical notes

- The page is a single static HTML file with no build step, using [Chart.js 4.4](https://www.chartjs.org/) and the [chartjs-plugin-annotation](https://www.chartjs-plugin-annotation.pages.dev/) from CDN.
- All data is embedded inline in JavaScript — no external data files to load.
- Typography: DM Serif Display (headlines) + Source Sans 3 (body) + JetBrains Mono (data) via Google Fonts.
- Responsive down to 320px viewport width.

## License

Content and analysis: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Underlying data is from public US government sources and published reports as cited above.

---

*Published March 2026 by [Oskar Austegard](https://austegard.com). Research compiled with assistance from Claude (Anthropic).*
