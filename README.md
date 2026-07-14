# magnetic-grid

Lekki, konfigurowalny komponent React renderujący na Canvas 2D siatkę punktów, linii albo mesha, która reaguje na kursor jak pole magnetyczne — przyciąga, odpycha, faluje i wraca do formy. Zaprojektowany jako tło sekcji hero, pełnoekranowa instalacja interaktywna albo subtelny akcent wizualny, bez wymagania od użytkownika znajomości Canvasu czy matematyki 2D.

**[Zobacz działające demo →](https://dpawlikowski.github.io/magnetic-grid/)**

## Funkcje

- Trzy gotowe warianty renderowania: `dots`, `lines`, `mesh` (+ `custom` dla własnego renderera).
- Cztery presety wizualne: `silk`, `gravity`, `neon`, `calm`.
- Fizyka oparta o sprężynę i tłumienie (`velocity + spring + damping`) — ruch ma lag i naturalne wygaszanie zamiast natychmiastowego przeskoku.
- Tryb `attract` i `repel`.
- Obsługa myszy, dotyku oraz automatycznego "ghost cursor" na urządzeniach bez wskaźnika lub w stanie bezczynności.
- Pełna responsywność przez `ResizeObserver` i skalowanie pod `devicePixelRatio`.
- Zero aktualizacji React state podczas ruchu kursora ani w pętli animacji — dane żyją w refach, więc komponent nie traci płynności.
- Honoruje `prefers-reduced-motion`.
- Callback `onFrame` do podpięcia własnej telemetrii (np. licznika FPS) bez wpływu na wydajność renderowania.

## Demo

Repozytorium zawiera pełnoekranowe demo (`src/demo`) z panelem kontrolnym: przełącznikiem presetów, wariantu, trybu `attract`/`repel` oraz suwakami promienia, siły i gęstości siatki, wraz z licznikiem punktów i FPS.

Demo jest automatycznie budowane i publikowane na GitHub Pages przy każdym pushu do `main` (patrz [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)). Aby to zadziałało w danym repozytorium, trzeba raz włączyć w ustawieniach GitHuba **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Uruchomienie demo lokalnie:

```bash
npm install
npm run dev
```

## Instalacja

Pakiet nie jest jeszcze publikowany w rejestrze npm — w projekcie korzystającym z `magnetic-grid` jako zależności lokalnej/git wystarczy zbudować bibliotekę (`npm run build`) i zainstalować katalog `dist`, albo dodać repozytorium jako zależność git. Wymaga `react` i `react-dom` w wersji 18 lub wyższej jako peer dependencies.

## Szybki start

```tsx
import { MagneticGrid } from "magnetic-grid";

function Hero() {
  return (
    <div style={{ height: "100vh" }}>
      <MagneticGrid preset="gravity" variant="mesh" />
    </div>
  );
}
```

Komponent wypełnia rodzica (`width: 100%; height: 100%`) — kontener musi mieć jawnie ustalony rozmiar.

## API

Wszystkie propsy są opcjonalne — bez nich komponent używa `defaultConfig`.

| Prop                  | Typ                                              | Domyślnie                    | Opis                                                          |
| --------------------- | ------------------------------------------------- | ----------------------------- | -------------------------------------------------------------- |
| `preset`               | `"silk" \| "gravity" \| "neon" \| "calm"`         | —                              | Gotowy zestaw parametrów; jawne propsy nadpisują wartości presetu. |
| `variant`              | `"dots" \| "lines" \| "mesh" \| "custom"`         | `"mesh"`                       | Sposób renderowania siatki.                                    |
| `mode`                 | `"attract" \| "repel"`                            | `"attract"`                    | Czy punkty są przyciągane, czy odpychane od kursora.            |
| `density`              | `number` (12–96)                                  | `32`                           | Odstęp między punktami w pikselach CSS (mniej = gęściej).       |
| `radius`               | `number` (24–520)                                 | `160`                          | Promień oddziaływania kursora w px.                             |
| `strength`             | `number` (0–90)                                   | `18`                           | Siła oddziaływania pola.                                        |
| `falloff`              | `number` (0.75–5)                                 | `2`                            | Krzywizna zaniku siły wraz z odległością od kursora.             |
| `returnSpeed`          | `number` (0.01–0.24)                              | `0.08`                         | Jak szybko punkt wraca do pozycji bazowej ("sztywność sprężyny"). |
| `damping`              | `number` (0.55–0.98)                              | `0.86`                         | Tłumienie prędkości punktu (wygaszanie oscylacji).               |
| `color`                | `string` (CSS color)                              | `"rgba(242, 247, 255, 0.68)"` | Kolor punktów/linii.                                            |
| `background`           | `string` (CSS color)                              | `"#07090d"`                   | Kolor tła canvasu.                                              |
| `lineWidth`            | `number` (0.2–6)                                  | `1`                            | Grubość linii dla wariantów `lines`/`mesh`.                     |
| `dotSize`              | `number` (0.5–12)                                 | `2`                            | Promień kropki dla wariantu `dots`.                             |
| `interactive`          | `boolean`                                         | `true`                         | Wyłącza reagowanie na wskaźnik (siatka zostaje statyczna/ghost). |
| `ghostCursor`          | `boolean \| { enabled?, speed?, radius? }`        | `true`                         | Automatyczny, orbitujący kursor, gdy nie ma realnego wskaźnika.  |
| `respectReducedMotion` | `boolean`                                         | `true`                         | Wyłącza animację, gdy system ma włączone `prefers-reduced-motion`. |
| `renderCustom`         | `(context: RenderContext) => void`                | —                              | Własny renderer, używany gdy `variant="custom"`.                |
| `onFrame`              | `(stats: FrameStats) => void`                     | —                              | Callback wywoływany raz na klatkę animacji — `{ time, delta, pointCount }`. |
| `className` / `style`  | standardowe propsy DOM                            | —                              | Przekazywane na kontener komponentu.                            |
| `aria-label`           | `string`                                          | `"Interactive magnetic grid"` | Etykieta dostępności dla elementu `<canvas role="img">`.        |

Wszystkie wartości liczbowe są przycinane (`clamp`) do zakresów zdefiniowanych w `CONFIG_LIMITS` (`src/core/presets.ts`), więc niebezpieczne wartości z zewnątrz (np. z suwaka UI) nigdy nie trafiają do fizyki jako `NaN` czy wartości poza sensownym zakresem.

## Presety

| Preset     | Wariant  | Charakter                                      |
| ---------- | -------- | ----------------------------------------------- |
| `silk`     | `mesh`   | Delikatna, jedwabista siatka o niskiej sile.     |
| `gravity`  | `mesh`   | Wyraźne, "cięższe" odkształcenie z dużym promieniem. |
| `neon`     | `lines`  | Kontrastowe linie w kolorze neonowej zieleni.    |
| `calm`     | `dots`   | Subtelne, ciepłe kropki o niskiej sile — dobre jako tło. |

## Rozwój lokalny

```bash
npm install       # instalacja zależności
npm run dev       # demo z hot-reloadem (Vite)
npm run lint      # ESLint
npm run typecheck # tsc --build, bez emitu
npm test          # vitest w trybie watch
npm run test:run  # vitest, pojedynczy przebieg (CI)
```

## Build

```bash
npm run build        # bibliotekowy build ESM do dist/ (src/index.ts)
npm run build:demo   # statyczny build demo (index.html) do dist-demo/
npm run preview      # podgląd zbudowanej biblioteki
npm run preview:demo # podgląd zbudowanego demo
```

`build:demo` respektuje zmienną środowiskową `DEMO_BASE_PATH` (używaną przez workflow GitHub Pages do ustawienia właściwej podścieżki `/<nazwa-repo>/`). Lokalnie, bez tej zmiennej, demo buduje się z bazą `/`.

## Struktura projektu

```text
src/
  MagneticGrid.tsx     # publiczny komponent React
  index.ts             # publiczne eksporty pakietu
  core/
    animation.ts        # pętla fizyki (spring + damping)
    canvas.ts            # skalowanie canvasu pod devicePixelRatio
    grid.ts               # generowanie siatki punktów i krawędzi
    presets.ts            # domyślna konfiguracja, presety, clamp/resolveConfig
    renderers.ts           # renderery dots/lines/mesh/custom
    types.ts                # typy publiczne i wewnętrzne
  demo/
    App.tsx              # UI demo (panel kontrolny, presety, suwaki)
    gridControls.ts        # stałe i logika demo (poza komponentem, testowalna)
    main.tsx                 # punkt wejścia demo
    styles.css                # style demo
.github/workflows/
  deploy-pages.yml       # build + deploy demo na GitHub Pages
```

Szerszy opis decyzji architektonicznych znajduje się w [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md).

## Testy

Projekt jest pokryty testami jednostkowymi (Vitest + Testing Library) obejmującymi m.in.:

- generowanie i skalowanie siatki (`core/grid`, `core/canvas`),
- fizykę punktów — sprężynę, tłumienie, przyciąganie/odpychanie (`core/animation`),
- łączenie presetów i przycinanie wartości do bezpiecznych zakresów (`core/presets`),
- renderowanie poszczególnych wariantów (`core/renderers`),
- zachowanie komponentu `<MagneticGrid>` (dostępność, `onFrame`, cykl życia),
- UI demo (przełączanie presetów/wariantów/trybu, reset, licznik punktów i FPS).

```bash
npm run test:run
```

## Licencja

Licencja projektu nie została jeszcze ustalona.
