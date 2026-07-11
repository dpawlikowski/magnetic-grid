# magnetic-grid - decyzje projektowe i plan implementacji

## Cel produktu

`magnetic-grid` ma byc lekka, konfigurowalna biblioteka React renderujaca na Canvas 2D siatke punktow, linii albo mesh, ktora reaguje na kursor jak pole magnetyczne. Efekt powinien byc natychmiast czytelny wizualnie, plynny przy typowych rozdzielczosciach ekranu i latwy do osadzenia jako tlo sekcji, hero albo pelnoekranowa instalacja interaktywna.

Najwazniejszy produktowy kierunek: komponent ma wygladac premium bez wymagania od uzytkownika znajomosci Canvas, animacji ani matematyki 2D.

## Zakres pierwszej wersji

Pierwsza stabilna wersja powinna dostarczyc:

- komponent React `<MagneticGrid />`,
- renderowanie wariantow `dots`, `lines` i `mesh`,
- kilka presetow wizualnych,
- obsluge myszy, touch i opcjonalnego automatycznego "ghost cursor",
- responsywne dopasowanie do rozmiaru kontenera,
- plynna animacje oparta o `requestAnimationFrame`,
- brak aktualizacji React state podczas ruchu kursora,
- demo pelnoekranowe pokazujace 2-3 presety i podstawowe kontrolki.

Wariant `custom` warto zaprojektowac w API od poczatku, ale zaimplementowac po ustabilizowaniu rdzenia renderowania.

## Decyzje architektoniczne

### Stack

- React jako cienki wrapper komponentu.
- Canvas 2D jako silnik renderowania.
- TypeScript od pierwszego commita.
- Vite jako srodowisko demo i developmentu.
- Biblioteka budowana przez `tsup` albo Vite library mode.
- Testy jednostkowe dla matematyki i normalizacji konfiguracji.
- Playwright lub visual smoke test dla demo, gdy UI bedzie gotowy.

Canvas 2D jest tu lepszy niz SVG, bo docelowo chcemy animowac setki lub tysiace elementow w kazdej klatce. React powinien tylko zamontowac canvas, przekazac propsy i zarzadzac cyklem zycia animacji.

### Podzial modulow

Proponowana struktura:

```text
src/
  MagneticGrid.tsx
  core/
    animation.ts
    canvas.ts
    grid.ts
    pointer.ts
    renderers.ts
    presets.ts
    types.ts
  demo/
    App.tsx
    controls.tsx
    styles.css
```

Rola modulow:

- `MagneticGrid.tsx` - publiczny komponent React i integracja z lifecycle.
- `core/grid.ts` - generowanie punktow, sasiadow i przeliczanie rozmiaru.
- `core/animation.ts` - petla `requestAnimationFrame` i aktualizacja pozycji.
- `core/pointer.ts` - mouse, touch, pointer leave, ghost cursor.
- `core/renderers.ts` - renderowanie `dots`, `lines`, `mesh`.
- `core/presets.ts` - gotowe konfiguracje.
- `core/types.ts` - publiczne i wewnetrzne typy.

### Model danych

Punkty powinny byc przechowywane w mutable strukturze trzymanej w `useRef`, a nie w React state.

Minimalny model punktu:

```ts
type GridPoint = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  col: number;
};
```

`ox` i `oy` sa pozycja bazowa. `x` i `y` sa pozycja animowana. `vx` i `vy` pozwalaja dodac bezwladnosc, tlumienie i efekt fali. Dla pierwszego prototypu mozna zaczac bez predkosci, ale warto zostawic ten ksztalt danych, bo daje lepsze zachowanie mesha bez przebudowy API.

### Algorytm pola magnetycznego

Bazowy algorytm:

```ts
const dx = pointer.x - point.x;
const dy = pointer.y - point.y;
const dist = Math.hypot(dx, dy);

if (dist < radius) {
  const influence = (1 - dist / radius) ** falloff;
  const direction = mode === "attract" ? 1 : -1;
  point.x += (dx / dist) * influence * strength * direction;
  point.y += (dy / dist) * influence * strength * direction;
} else {
  point.x += (point.ox - point.x) * returnSpeed;
  point.y += (point.oy - point.y) * returnSpeed;
}
```

Docelowo lepszy bedzie wariant oparty o predkosc:

- sila pola dodaje energie do `vx` i `vy`,
- sprezyna ciagnie punkt do `origin`,
- `damping` wygasza oscylacje,
- renderowanie pokazuje lag i falowanie zamiast natychmiastowego przeskoku.

To da bardziej organiczne wrazenie "czasoprzestrzeni" i pozwoli sensownie odroznic presety.

### Rendering

Renderery powinny dzialac na tej samej tablicy punktow:

- `dots` - `arc` albo male kwadraty; najlepszy jako subtelne tlo.
- `lines` - linie pionowe i poziome miedzy sasiadami; bardzo czytelna deformacja.
- `mesh` - siatka laczaca punkty z prawym i dolnym sasiadem; jeden `beginPath`, wiele `moveTo/lineTo`, jeden `stroke`.
- `custom` - funkcja uzytkownika otrzymujaca `ctx`, punkty, rozmiar i czas.

Mesh musi byc renderowany batchem. Nie wolno robic osobnego `stroke` dla kazdej krawedzi, bo koszt rosnie szybko przy wiekszych siatkach.

### API komponentu

Proponowane API:

```ts
type MagneticGridProps = {
  variant?: "dots" | "lines" | "mesh" | "custom";
  preset?: "silk" | "gravity" | "neon" | "calm";
  density?: number;
  radius?: number;
  strength?: number;
  falloff?: number;
  mode?: "attract" | "repel";
  returnSpeed?: number;
  damping?: number;
  color?: string;
  background?: string;
  lineWidth?: number;
  dotSize?: number;
  interactive?: boolean;
  ghostCursor?: boolean | GhostCursorOptions;
  respectReducedMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
  renderCustom?: CustomRenderer;
};
```

Zasada API: propsy podstawowe maja dawac szybka kontrole, a presety maja byc najlepsza droga dla uzytkownika, ktory chce efektu bez strojenia parametrow.

### Responsywnosc i gesty

Komponent powinien mierzyc kontener przez `ResizeObserver`. Canvas musi byc skalowany przez `devicePixelRatio`, ale style CSS powinny zostac w pikselach CSS.

Pointer:

- `pointermove` zapisuje tylko ostatnia pozycje do refa,
- aktualna klatka animacji zuzywa najnowsza pozycje,
- po `pointerleave` punkty wracaja do origin albo aktywuje sie ghost cursor,
- `touchmove` dziala tak samo jak pointer, bez scroll-jank w pelnoekranowym demo,
- `prefers-reduced-motion` ogranicza animacje albo wylacza ghost cursor.

### UX demo

Pierwszy ekran demo powinien byc od razu dzialajacym efektem, nie landing page'em. Najlepszy uklad:

- pelnoekranowy canvas jako tlo,
- kompaktowy panel kontrolny przy krawedzi,
- segmented control dla wariantu,
- przyciski presetow,
- suwaki dla `radius`, `strength`, `density`,
- przelacznik `attract/repel`,
- subtelny licznik FPS i liczby punktow dla wiarygodnosci technicznej.

Panel nie powinien zaslaniac glownego efektu. Na mobile kontrole moga wejsc w dolny sheet albo prosty pasek presetow.

## Etapy implementacji

### Etap 1 - fundament projektu

1. Zainicjalizowac projekt Vite + React + TypeScript.
2. Dodac ESLint, Prettier i podstawowy `tsconfig`.
3. Ustalic eksport biblioteki z `src/index.ts`.
4. Przygotowac minimalne demo uruchamiane przez `npm run dev`.

Kryterium gotowosci: pusta aplikacja demo uruchamia sie lokalnie, a komponent moze byc importowany z `src`.

### Etap 2 - pierwszy efekt wow

1. Dodac `<MagneticGrid />` z canvasem wypelniajacym kontener.
2. Wygenerowac regularna siatke punktow.
3. Obsluzyc `ResizeObserver` i `devicePixelRatio`.
4. Dodac petle `requestAnimationFrame`.
5. Zaimplementowac przyciaganie punktow do kursora i powrot do origin.
6. Wyrenderowac wariant `mesh`.

Kryterium gotowosci: pelnoekranowa siatka faluje za kursorem w 60 FPS na typowym laptopie.

### Etap 3 - jakosc ruchu

1. Przejsc z bezposredniego przesuwania punktow na model `velocity + spring + damping`.
2. Dodac `mode: attract | repel`.
3. Dodac `falloff`, `returnSpeed`, `damping` i sensowne limity wartosci.
4. Zoptymalizowac petle przez wczesne pomijanie punktow poza promieniem.
5. Unikac alokacji obiektow w kazdej klatce.

Kryterium gotowosci: ruch ma lag, sprezystosc i naturalne wygaszanie bez drgania po zatrzymaniu kursora.

### Etap 4 - warianty renderowania

1. Dodac renderer `dots`.
2. Dodac renderer `lines`.
3. Uporzadkowac `mesh` jako renderer korzystajacy z listy sasiadow.
4. Zaprojektowac i dodac `renderCustom`.
5. Dodac `lineWidth`, `dotSize`, `color`, `background`.

Kryterium gotowosci: wszystkie warianty korzystaja z tego samego modelu fizyki i zmieniaja tylko sposob rysowania.

### Etap 5 - presety i demo

1. Dodac presety `silk`, `gravity`, `neon`, `calm`.
2. Zbudowac panel kontrolny demo.
3. Dodac mobile layout panelu.
4. Dodac ghost cursor jako tryb idle i mobile fallback.
5. Dodac `prefers-reduced-motion`.

Kryterium gotowosci: demo sprzedaje efekt w kilka sekund i pozwala szybko porownac warianty.

### Etap 6 - stabilizacja biblioteki

1. Dodac testy jednostkowe dla generowania gridu, clampowania propsow i fizyki punktu.
2. Dodac test smoke dla mount/unmount komponentu.
3. Sprawdzic brak wyciekow rAF po unmount.
4. Przygotowac build biblioteki ESM/CJS, jesli CJS jest potrzebny.
5. Dodac README z instalacja, API, presetami i przykladami.

Kryterium gotowosci: komponent mozna opublikowac lub uzyc w innym projekcie bez kopiowania kodu demo.

## Ryzyka i decyzje do pilnowania

- Zbyt wysoka gestosc siatki szybko podniesie koszt CPU. Potrzebny limit punktow i rozsadne domyslne `density`.
- Canvas musi byc skalowany pod `devicePixelRatio`, inaczej efekt bedzie rozmyty na ekranach retina.
- React state w `pointermove` zepsuje plynnosc. Dane animacji musza zyc w refach i strukturach mutable.
- Mesh renderowany wieloma `stroke` bedzie niepotrzebnie drogi. Potrzebny jeden path na klatke.
- Demo nie powinno wygladac jak strona marketingowa. To ma byc narzedzie/plac zabaw, ktory od razu reaguje.
- Mobile bez kursora potrzebuje ghost cursor albo touch interaction, inaczej efekt straci sens na telefonie.
- `custom renderer` nie powinien dawac dostepu do wewnetrznych mutable struktur w sposob, ktory utrudni pozniejsze zmiany. Warto udokumentowac kontrakt.

## Proponowane domyslne wartosci

```ts
const defaultConfig = {
  variant: "mesh",
  density: 32,
  radius: 160,
  strength: 18,
  falloff: 2,
  mode: "attract",
  returnSpeed: 0.08,
  damping: 0.86,
  lineWidth: 1,
  dotSize: 2,
  color: "rgba(255,255,255,0.72)",
  background: "#0b0d10",
  interactive: true,
  ghostCursor: true,
  respectReducedMotion: true,
};
```

`density` powinno oznaczac odstep miedzy punktami w pikselach CSS, nie liczbe punktow. To jest bardziej intuicyjne dla responsywnego canvasu.

## Kolejnosc pracy rekomendowana dla repo

1. Zainicjalizowac projekt i demo.
2. Zrobic najprostszy `mesh` z bezposrednia deformacja.
3. Dopiero potem dodac fizyke ze sprezyna.
4. Dodac warianty renderowania.
5. Dodac presety i kontrolki.
6. Dopisac testy i README.
7. Przygotowac paczkowanie biblioteki.

Taka kolejnosc minimalizuje ryzyko: najpierw powstaje widoczny efekt, potem dopracowanie ruchu i API.
