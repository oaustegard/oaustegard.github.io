# ui-sdk on Preact

A browsable showcase of [ui-sdk](https://ui-sdk.dev), Vercel's library of accessible, unstyled UI behaviors, running
on Preact 11. ui-sdk ships adapters for React, Vue, Svelte, Solid and web components, none for Preact; this page runs
its React adapter on Preact through `preact/compat`.

- **What's on it**: all 55 components, grouped in a menu of eight categories. Each component's page runs every upstream
  React example for it, 580 in all, live, with the docs' captions and the example's source under it. The sources are
  the upstream React code, compiled once and rendered by Preact unchanged.
- **Navigation**: the menubar (Components, View, Go), the search palette (Ctrl/⌘ K) and the source panels are ui-sdk
  components on Preact too. View sets the theme (system, light, dark) and whether sources start open; both are kept in
  this browser.
- **Contrast**: the page restyles the upstream examples in this site's palette. Every text color pair is at least
  4.5:1 and input borders at least 3:1, in both themes, checked with axe-core on every component page.
- **Files**: `app.js` is the shell, `examples/<name>.js` loads one component's examples when you open it, `esm/` is
  ui-sdk 0.1.0-beta.10 built for Preact, `vendor/` is Preact 11.2.0. ui-sdk and its examples are Apache-2.0
  (`LICENSE-ui-sdk.txt`), Preact is MIT, the icons are Lucide (ISC).
- `?log=1` on Oskar's devices sends the page's console to his log relay.

How the port was built and tested (2,868 of ui-sdk's 2,991 React tests pass on Preact, against React's 2,884), and
the build scripts for this page: [ui-sdk-preact](https://github.com/oaustegard/experiments/tree/main/ui-sdk-preact)
in oaustegard/experiments. To use the components in a page of your own, the `developing-preact` skill in
[claude-skills](https://github.com/oaustegard/claude-skills/tree/main/developing-preact) vendors the same build.
