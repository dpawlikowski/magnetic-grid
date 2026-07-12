# magnetic-grid

An interactive magnetic grid background for React. A field of points sits at rest until the cursor moves near — then they lean toward it (or scatter away) and spring back when it leaves. Rendered on a single `<canvas>`, with mesh, line and dot variants, four presets, and a bring-your-own renderer escape hatch.

```bash
npm install magnetic-grid
```

```tsx
import { MagneticGrid } from "magnetic-grid";

<div style={{ position: "relative", height: 480 }}>
  <MagneticGrid preset="silk" />
</div>
```

**[→ Live demo](https://dpawlikowski.github.io/magnetic-grid/)**

---

## Why

Most "interactive background" snippets you find are one of two things: a wall of copy-pasted canvas code with every constant hard-wired, or a heavy particle library that pulls in its own render loop and fights your bundle. I wanted the middle ground — a single declarative component you drop into a hero section, tune with props, and forget about.

The design goals, in order:

1. **Declarative.** Everything is a prop. No imperative setup, no refs to wire, no `useEffect` on your side.
2. **Cheap.** One `requestAnimationFrame` loop, a hard cap on point count, and a device-pixel-ratio ceiling so a 4K monitor doesn't melt. It runs behind your content, so it must never be the thing that drops frames.
3. **Considerate.** Respects `prefers-reduced-motion` out of the box, and animates itself with a "ghost cursor" when no real pointer is present so it isn't dead on touch devices or first paint.
4. **Escapable.** When the built-in variants aren't what you want, `renderCustom` hands you the live points and the 2D context and gets out of the way.

---

## Quick start

The grid fills its **positioned parent**, so give the parent a size and `position: relative` (or `absolute`/`fixed`) and let the grid sit behind your content:

```tsx
import { MagneticGrid } from "magnetic-grid";

function Hero() {
  return (
    <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <MagneticGrid
        preset="gravity"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1>Your content on top</h1>
      </div>
    </section>
  );
}
```

That's the whole integration. Everything below is optional tuning.

---

## Presets

Presets are just a bundle of prop defaults. Pick one as a starting point, then override individual props on top of it.

| Preset | Look | Variant |
|---|---|---|
| `silk` | Soft, slow, pale mesh — the safe default for text-heavy heroes | `mesh` |
| `gravity` | Denser, wider pull radius, heavier — feels like a gravity well | `mesh` |
| `neon` | Teal lines on near-black, higher contrast | `lines` |
| `calm` | Warm sparse dots, gentle motion | `dots` |

```tsx
<MagneticGrid preset="neon" strength={30} />   {/* neon, but pull harder */}
```

---

## Variants

`variant` controls how the point field is drawn each frame:

| Variant | Renders |
|---|---|
| `mesh` | Lines connecting each point to its right and bottom neighbour — a deforming lattice |
| `lines` | Full-width/height rules through each point, axis chosen by its drift direction |
| `dots` | A filled circle at each point |
| `custom` | Nothing built-in — your `renderCustom` callback draws instead |

---

## Modes

| Mode | Behaviour |
|---|---|
| `attract` | Points move **toward** the pointer (default) |
| `repel` | Points are pushed **away** from the pointer |

The force falls off with distance inside `radius`, shaped by `falloff` (a higher exponent = a tighter, punchier hotspot). Outside `radius` a point feels nothing but its own spring pulling it home.

---

## Props

Every prop is optional. With no props you get `defaultConfig` (a `mesh` grid, `attract` mode). A `preset` sets the baseline; individual props override it.

### Behaviour

| Prop | Type | Default | Range | What it does |
|---|---|---|---|---|
| `preset` | `"silk" \| "gravity" \| "neon" \| "calm"` | — | — | Baseline bundle of the props below |
| `variant` | `"mesh" \| "lines" \| "dots" \| "custom"` | `"mesh"` | — | How the field is drawn |
| `mode` | `"attract" \| "repel"` | `"attract"` | — | Pointer pulls points in or pushes them out |
| `density` | `number` | `32` | `12`–`96` | Target spacing (px) between points — **lower is denser** |
| `radius` | `number` | `160` | `24`–`520` | Pointer influence radius in px |
| `strength` | `number` | `18` | `0`–`90` | Force magnitude at the pointer |
| `falloff` | `number` | `2` | `0.75`–`5` | Exponent on the inverse-distance falloff |
| `returnSpeed` | `number` | `0.08` | `0.01`–`0.24` | Spring constant pulling points home |
| `damping` | `number` | `0.86` | `0.55`–`0.98` | Per-frame velocity decay (higher = looser, more overshoot) |

### Appearance

| Prop | Type | Default | Range | What it does |
|---|---|---|---|---|
| `color` | `string` | `rgba(242,247,255,0.68)` | — | Stroke/fill colour of the grid |
| `background` | `string` | `#07090d` | — | Canvas fill drawn each frame behind the grid |
| `lineWidth` | `number` | `1` | `0.2`–`6` | Line width for `mesh`/`lines` |
| `dotSize` | `number` | `2` | `0.5`–`12` | Radius of each dot for `dots` |

### Interaction & motion

| Prop | Type | Default | What it does |
|---|---|---|---|
| `interactive` | `boolean` | `true` | Whether real pointer movement affects the grid |
| `ghostCursor` | `boolean \| GhostCursorOptions` | `true` | Idle self-animation when no pointer is present (see below) |
| `respectReducedMotion` | `boolean` | `true` | Freeze to a static frame when the OS requests reduced motion |

### React plumbing

| Prop | Type | What it does |
|---|---|---|
| `className` | `string` | Class on the wrapping `<div>` |
| `style` | `CSSProperties` | Inline style on the wrapping `<div>` — this is how you position it |
| `renderCustom` | `CustomRenderer` | Custom draw callback; used when `variant="custom"` |
| `aria-label` | `string` | Accessible label on the canvas (default: `"Interactive magnetic grid"`) |

> Numeric props are **clamped** to the ranges above by `resolveConfig` — pass something out of range and it's pulled back to the nearest bound rather than breaking the animation. The ranges live in the exported `CONFIG_LIMITS` object, which is also what the demo's sliders read from.

---

## Ghost cursor

With no pointer over the canvas (first paint, touch devices, a hero the user hasn't reached yet) the grid would otherwise sit frozen. The ghost cursor traces a slow [Lissajous](https://en.wikipedia.org/wiki/Lissajous_curve) orbit around the centre so the field is always gently alive. A real pointer takes over the moment it enters, and the ghost resumes when it leaves.

```tsx
{/* off */}
<MagneticGrid ghostCursor={false} />

{/* tuned */}
<MagneticGrid
  ghostCursor={{
    speed: 0.0005,   // angular speed, radians per ms
    radius: 220,     // orbit radius in px (defaults to ~26% of the smaller side)
  }}
/>
```

`GhostCursorOptions` is `{ enabled?: boolean; speed?: number; radius?: number }`.

---

## Custom renderer

Set `variant="custom"` and pass `renderCustom`. It runs once per frame **after** the physics has moved the points, with everything you need to draw:

```tsx
import { MagneticGrid, type RenderContext } from "magnetic-grid";

function drawGlowDots({ ctx, points, config }: RenderContext) {
  ctx.fillStyle = config.color;
  for (const p of points) {
    // p.x / p.y are the live positions; p.ox / p.oy are the resting positions
    const drift = Math.hypot(p.x - p.ox, p.y - p.oy);
    ctx.globalAlpha = Math.min(1, 0.3 + drift / 40);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2 + drift / 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

<MagneticGrid variant="custom" renderCustom={drawGlowDots} />;
```

The `RenderContext` you receive:

```ts
type RenderContext = {
  ctx: CanvasRenderingContext2D;   // already DPR-scaled — draw in CSS pixels
  points: GridPoint[];             // { ox, oy, x, y, vx, vy, row, col }
  edges: GridEdge[];               // { from, to } indices into points (mesh connectivity)
  width: number;                   // CSS pixels
  height: number;                  // CSS pixels
  time: number;                    // requestAnimationFrame timestamp
  config: MagneticGridConfig;      // the fully resolved, clamped config
};
```

The canvas is **not** cleared for you between your draws in the sense that the background fill happens first, then your callback — so you get a fresh `config.background` fill each frame and paint on top. `ctx` is already transformed for the device pixel ratio; work in plain CSS pixels and ignore `devicePixelRatio` entirely.

---

## Accessibility

- **`prefers-reduced-motion`** is honoured by default. When the OS reports it, the grid stops responding to the pointer and holds a single static frame. It's live-updated too — toggling the OS setting takes effect without a remount. Opt out with `respectReducedMotion={false}` only if you have a specific reason.
- The canvas carries an `aria-label` (override via the `aria-label` prop). It's decorative by nature, so keep any real content in the DOM on top of it, not baked into the canvas.

---

## Performance notes

- **One animation loop.** A single `requestAnimationFrame` drives physics + render. No per-point timers, no React re-renders during animation — prop changes rebuild the config via `useMemo`, nothing else.
- **Point ceiling.** `createGrid` caps the field at **5000 points**. Past that it widens the spacing beyond your `density` rather than letting the count (and per-frame work) grow unbounded on huge viewports.
- **DPR capped at 2×.** Beyond 2× device pixels the extra canvas resolution costs GPU and memory for no visible gain, so it's clamped.
- **Resize-aware.** A `ResizeObserver` on the parent rebuilds the grid on layout changes — no polling, no window `resize` listener that misses container-only changes.
- **Runs behind content.** It's a background. If you stack many on one page, pause off-screen instances yourself (e.g. unmount or gate on an `IntersectionObserver`) — a canvas rAF loop keeps running even when scrolled out of view.

---

## Browser support

Anything with `<canvas>` 2D and `ResizeObserver` — every current evergreen browser (Chrome, Edge, Firefox, Safari). There are no Houdini/`@property` or WebGL requirements. On the server the component renders an empty `<canvas>` and the animation starts on the client in `useEffect`, so it's SSR-safe.

---

## Development

```bash
npm install          # add --legacy-peer-deps if you hit a peer conflict
npm run dev          # demo at http://localhost:5173
npm run test:run     # unit tests (vitest)
npm run lint         # eslint (flat config)
npm run typecheck    # tsc -b
npm run build:lib    # library → dist/ (+ .d.ts)
npm run build:demo   # demo → dist-demo/ (what ships to GitHub Pages)
```

---

## Architecture

The physics and rendering are deliberately split out of the component into pure, directly-testable modules. The component only owns the browser-facing lifecycle: the rAF loop, pointer events, ghost cursor, and reduced-motion handling.

```
src/
├── core/
│   ├── types.ts       # every public type — single source of truth
│   ├── presets.ts     # defaultConfig, presets, CONFIG_LIMITS, resolveConfig
│   ├── grid.ts        # createGrid — points + edges from a density
│   ├── animation.ts   # updatePoints — spring + pointer force + damping
│   ├── renderers.ts   # renderGrid — mesh / lines / dots / custom
│   └── canvas.ts       # resizeCanvas — DPR-aware sizing (capped 2×)
├── MagneticGrid.tsx   # the component — rAF loop, pointer, ghost cursor
├── demo/              # interactive demo app (not part of the npm package)
└── index.ts           # public API re-exports
```

The per-frame pipeline is a straight line: `updatePoints` mutates positions in place (spring toward `ox/oy`, add the pointer force inside `radius`, apply `damping`), then `renderGrid` draws the result. Keeping them separate is why the whole thing has 35 unit tests without touching a real canvas — `updatePoints` and `createGrid` are just functions over plain data.

---

## Technical notes

**Why clamp instead of validate-and-throw?** A background that throws mid-render because a slider went one pixel too far is worse than one that quietly stays sane. `resolveConfig` clamps to `CONFIG_LIMITS` and moves on. The limits are exported so UIs can bound their controls to the same numbers instead of guessing.

**Why a spring model instead of easing back to origin?** Springs (`vx/vy` with a return force and damping) give the overshoot and settle that reads as "physical". A pure lerp-home looks mechanical. `returnSpeed` is the stiffness, `damping` is the friction — the two presets that feel heaviest (`gravity`) lower `damping` for more overshoot.

**Why cap the DPR at 2 and the points at 5000?** Both are frame-time guardrails. Canvas cost scales with pixels drawn and points iterated; without ceilings a large retina display would quietly quadruple the work for no perceptible improvement.

---

## License

MIT © Dominik Pawlikowski
