
# Changelog

All notable changes to `magnetic-grid` are documented here. The format loosely
follows [Keep a Changelog](https://keepachangelog.com/); versions follow semver.

## [Unreleased]

### Added

- Packaging metadata for distribution: `description`, `author`, `license`,
  `main`/`module`/`types`, an `exports` map, `files`, `keywords`, `repository`,
  `homepage` and `bugs`. The package is no longer marked `private`.
- Split build pipeline — `build:lib` (externalises React, emits `dist/` + `.d.ts`
  declarations via `tsconfig.lib.json`) and `build:demo` (the GitHub Pages demo
  into `dist-demo/`). `vite.config.ts` switches on `BUILD_MODE`.
- GitHub Actions: `CI` (lint → typecheck → test → build:lib) and `Deploy Demo`
  (builds the demo and publishes it to GitHub Pages under `/magnetic-grid/`).
- `LICENSE` (MIT), `CONTRIBUTING.md`, `.gitattributes` (LF normalisation) and
  this changelog.

## [0.1.0]

### Initial release

- `<MagneticGrid />` — canvas-rendered grid of points that spring back to rest
  and react to the pointer with an inverse-distance force.
- Variants: `mesh`, `lines`, `dots`, and `custom` (bring your own renderer via
  `renderCustom`).
- Modes: `attract` and `repel`.
- Presets: `silk`, `gravity`, `neon`, `calm` (`resolveConfig` merges
  `defaults → preset → props`, then clamps every numeric field to `CONFIG_LIMITS`).
- Ghost cursor — a Lissajous idle orbit keeps the grid alive with no pointer
  present; configurable via `ghostCursor` (`boolean | { enabled, speed, radius }`).
- Accessibility: honours `prefers-reduced-motion` (freezes to a static frame),
  ships a sensible `aria-label`.
- Performance: device-pixel-ratio capped at 2×, a hard 5000-point ceiling in
  `createGrid`, single `requestAnimationFrame` loop, `ResizeObserver`-driven
  regrid on container resize.
- Interactive demo with live controls for every knob.
- 35 unit tests (Vitest + Testing Library) across grid, animation, renderers,
  presets and the component.
