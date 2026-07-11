import { Activity, CircleDot, Grid3X3, Move, Sparkles, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { MagneticGrid } from "../MagneticGrid";
import type {
  MagneticGridMode,
  MagneticGridPreset,
  MagneticGridVariant,
} from "../core/types";
import {
  GHOST_CURSOR_SPEED,
  INITIAL_CONTROLS,
  SLIDER_RANGES,
  estimatePointCount,
} from "./gridControls";

const presetOptions: MagneticGridPreset[] = ["silk", "gravity", "neon", "calm"];
const variantOptions: Array<{
  value: MagneticGridVariant;
  label: string;
  icon: typeof Grid3X3;
}> = [
  { value: "mesh", label: "Mesh", icon: Grid3X3 },
  { value: "lines", label: "Lines", icon: Waves },
  { value: "dots", label: "Dots", icon: CircleDot },
];

const presetLabels: Record<MagneticGridPreset, string> = {
  silk: "Silk",
  gravity: "Gravity",
  neon: "Neon",
  calm: "Calm",
};

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step = 1, onChange }: SliderProps) {
  return (
    <label className="control">
      <span>
        {label}
        <strong>{value}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

export function App() {
  const [preset, setPreset] = useState<MagneticGridPreset>(INITIAL_CONTROLS.preset);
  const [variant, setVariant] = useState<MagneticGridVariant>(INITIAL_CONTROLS.variant);
  const [mode, setMode] = useState<MagneticGridMode>(INITIAL_CONTROLS.mode);
  const [radius, setRadius] = useState(INITIAL_CONTROLS.radius);
  const [strength, setStrength] = useState(INITIAL_CONTROLS.strength);
  const [density, setDensity] = useState(INITIAL_CONTROLS.density);

  const pointEstimate = useMemo(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    return estimatePointCount(window.innerWidth, window.innerHeight, density);
  }, [density]);

  return (
    <main className="app">
      <MagneticGrid
        className="stage"
        preset={preset}
        variant={variant}
        mode={mode}
        radius={radius}
        strength={strength}
        density={density}
        ghostCursor={{ enabled: true, speed: GHOST_CURSOR_SPEED }}
      />

      <section className="panel" aria-label="Magnetic grid controls">
        <header className="panelHeader">
          <div>
            <p>magnetic-grid</p>
            <h1>Canvas field playground</h1>
          </div>
          <div className="meter" title="Estimated points">
            <Activity size={16} aria-hidden="true" />
            <span>{pointEstimate}</span>
          </div>
        </header>

        <div className="buttonGrid" aria-label="Presets">
          {presetOptions.map((option) => (
            <button
              className={option === preset ? "chip active" : "chip"}
              key={option}
              type="button"
              onClick={() => setPreset(option)}
            >
              <Sparkles size={15} aria-hidden="true" />
              {presetLabels[option]}
            </button>
          ))}
        </div>

        <div className="segmented" aria-label="Variant">
          {variantOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                className={option.value === variant ? "active" : ""}
                key={option.value}
                type="button"
                title={option.label}
                onClick={() => setVariant(option.value)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="modeRow">
          <button
            className={mode === "attract" ? "modeButton active" : "modeButton"}
            type="button"
            onClick={() => setMode("attract")}
          >
            <Move size={16} aria-hidden="true" />
            Attract
          </button>
          <button
            className={mode === "repel" ? "modeButton active" : "modeButton"}
            type="button"
            onClick={() => setMode("repel")}
          >
            <Move size={16} aria-hidden="true" />
            Repel
          </button>
        </div>

        <div className="sliders">
          <Slider label="Radius" min={SLIDER_RANGES.radius.min} max={SLIDER_RANGES.radius.max} value={radius} onChange={setRadius} />
          <Slider label="Strength" min={SLIDER_RANGES.strength.min} max={SLIDER_RANGES.strength.max} value={strength} onChange={setStrength} />
          <Slider label="Density" min={SLIDER_RANGES.density.min} max={SLIDER_RANGES.density.max} value={density} onChange={setDensity} />
        </div>
      </section>
    </main>
  );
}
