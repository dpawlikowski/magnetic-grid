# CONTRIBUTING — magnetic-grid

Krótka specyfikacja projektu. Przeczytaj, zanim zaczniesz edytować kod.

---

## Czym jest ten projekt

`magnetic-grid` to jeden komponent React (`<MagneticGrid />`) rysujący na
`<canvas>` siatkę punktów, które reagują na kursor — przyciągają się do niego
albo od niego uciekają — i sprężynują z powrotem do pozycji spoczynkowej. Do tego
kilka wariantów renderowania (mesh / lines / dots / custom), cztery presety i
tryb bezobsługowego „ghost cursora", żeby tło nigdy nie było statyczne.

To jest **biblioteka frontendowa bez backendu**. Cała animacja dzieje się w jednej
pętli `requestAnimationFrame` po stronie klienta.

---

## Architektura — przeczytaj, zanim coś zmienisz

Logika jest celowo rozbita na czyste, testowalne moduły w `src/core/`. Komponent
`MagneticGrid.tsx` tylko je spina: trzyma refy, pętlę animacji i obsługę pointera.

```
src/
  core/
    types.ts       # wszystkie typy publiczne (jedno źródło prawdy)
    presets.ts     # defaultConfig, presets, CONFIG_LIMITS, resolveConfig
    grid.ts        # createGrid — buduje punkty + krawędzie z gęstości
    animation.ts   # updatePoints — fizyka: sprężyna + siła od pointera + damping
    renderers.ts   # renderGrid — rysuje mesh / lines / dots / custom
    canvas.ts      # resizeCanvas — DPR-aware sizing (cap 2×)
  MagneticGrid.tsx # komponent — rAF loop, pointer, ghost cursor, reduced motion
  index.ts         # barrel — publiczne API
  demo/            # interaktywne demo (nie wchodzi do paczki npm)
```

### Zasady, których się trzymamy

1. **`core/` jest czyste.** Moduły w `core/` nie dotykają Reacta ani DOM-u poza
   przekazanym kontekstem renderowania. Dzięki temu każdy z nich ma bezpośrednie
   testy jednostkowe. Nie wciągaj do nich Reacta.
2. **`resolveConfig` jest jedynym miejscem, gdzie powstaje finalny config.**
   Kolejność scalania to `defaultConfig → preset → props`, a potem **clamp** do
   `CONFIG_LIMITS`. Jeśli dodajesz nowe pole numeryczne — dodaj mu granice w
   `CONFIG_LIMITS` i clamp w `resolveConfig`. UI (suwaki w demie) czyta zakresy
   z `CONFIG_LIMITS`, nie hardkoduje własnych liczb.
3. **Wydajność jest częścią kontraktu.** `createGrid` ma twardy limit
   `MAX_POINTS = 5000` (przy dużym oknie / dużej gęstości spacing jest zwiększany,
   żeby go nie przekroczyć). DPR jest capowany do 2× w `canvas.ts`. Jest jedna
   pętla `rAF`. Nie mnóż obserwatorów ani pętli.
4. **`prefers-reduced-motion` jest respektowany.** Przy włączonej preferencji
   pętla przestaje aplikować siłę pointera i grid zastyga w statycznej klatce.
   Nie omijaj tego przy dodawaniu nowych efektów.
5. **Typy publiczne mieszkają w `core/types.ts`** i są re-eksportowane z
   `index.ts`. Nowy prop komponentu = nowe pole w `MagneticGridConfig` /
   `MagneticGridProps`.

---

## Publiczne API

```ts
import { MagneticGrid } from "magnetic-grid";
import {
  defaultConfig,
  presets,
  resolveConfig,
} from "magnetic-grid";
import type {
  MagneticGridProps,
  MagneticGridConfig,
  MagneticGridVariant,   // "dots" | "lines" | "mesh" | "custom"
  MagneticGridMode,      // "attract" | "repel"
  MagneticGridPreset,    // "silk" | "gravity" | "neon" | "calm"
  CustomRenderer,
  RenderContext,
  GridPoint,
  GridEdge,
  GhostCursorOptions,
} from "magnetic-grid";
```

Każdy prop `<MagneticGrid />` jest opcjonalny — bez żadnego propsa dostajesz
`defaultConfig`. `preset` ustawia bazę, którą pojedyncze propsy nadpisują.

---

## Komendy

```bash
npm install              # instalacja (dodaj --legacy-peer-deps jeśli konflikt)
npm run dev              # demo na http://localhost:5173
npm run test:run         # testy (vitest) — 35 przypadków
npm run lint             # eslint (flat config w eslint.config.js)
npm run typecheck        # tsc -b
npm run build:lib        # build biblioteki do dist/ (+ .d.ts)
npm run build:demo       # build demo do dist-demo/ (to co ląduje na Pages)
```

---

## Zasady przy edycji kodu

1. **Po każdej zmianie:** `npm run typecheck && npm run test:run` — musi być zielone.
2. **Regresja = test.** Naprawiasz błąd → dopisz test, który by go złapał.
   Testuj zachowanie (co widać na wyjściu / w configu), nie szczegóły implementacji.
3. **Nowe pole configu** → granice w `CONFIG_LIMITS` + clamp w `resolveConfig` +
   test w `presets.test.ts`.
4. **Nie hardkoduj zakresów suwaków** w demie — czytaj z `CONFIG_LIMITS`.
5. **Najmniejsza kompletna zmiana.** Nie refaktoruj przy okazji niezwiązanego kodu.

---

## Znane ograniczenia

- **Sufit 5000 punktów** — przy bardzo dużych kontenerach i wysokiej gęstości
  faktyczny spacing rośnie ponad zadaną `density`, żeby zmieścić się w limicie.
  To celowe: chroni frame time.
- **SSR** — komponent renderuje `<canvas>`, a cała animacja odpala się dopiero
  po stronie klienta (w `useEffect`). Na serwerze nic się nie liczy.
- **Wariant `custom`** wymaga podania `renderCustom`; bez niego spada do `mesh`.
