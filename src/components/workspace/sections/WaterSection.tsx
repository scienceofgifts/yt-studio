import React from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import {
  WATER_TYPES,
  WATER_PLACEMENTS,
  WATER_BEHAVIORS,
  WATER_VISIBILITIES,
  WATER_REFLECTIONS,
} from '../../../data/catalog';
import {
  Waves,
  Droplets,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
} from 'lucide-react';

export const WaterSection: React.FC = () => {
  const { config, updateConfig, toggleWater, resetSection } = useAmbience();
  const { water } = config;

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Waves className="w-4 h-4 text-cyan-400" />
            6. Water Bodies & Hydrological Features
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Configure lakes, rivers, rain puddles, reflective surfaces, and fluid loop stability
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Master Toggle: Include a water body */}
          <label className="flex items-center gap-2.5 cursor-pointer bg-[#0B1018] border border-[#1E2B3E] px-3.5 py-1.5 rounded-xl hover:border-[#283952] transition-colors">
            <span className="text-xs font-medium text-[#F2EEE6] flex items-center gap-1.5">
              {water.enabled ? <Droplets className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-[#A1AEC0]" />}
              Include a water body:
            </span>
            <input
              type="checkbox"
              checked={water.enabled}
              onChange={(e) => toggleWater(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                water.enabled ? 'bg-cyan-500 justify-end' : 'bg-[#1E2B3E] justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#0B1018] shadow-xs"></span>
            </span>
            <span className={`text-xs font-mono font-bold ${water.enabled ? 'text-cyan-400' : 'text-[#A1AEC0]'}`}>
              {water.enabled ? 'ON' : 'OFF'}
            </span>
          </label>

          <button
            type="button"
            onClick={() => resetSection('water')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {!water.enabled ? (
        <div className="p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#A1AEC0] flex items-center gap-2.5">
          <EyeOff className="w-4 h-4 text-[#A1AEC0] shrink-0" />
          <span>
            Water is currently disabled. All water elements (lakes, rivers, puddles) are strictly excluded from the active prompts. Toggle ON above to configure.
          </span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Loop Advisory banner */}
          <div className="p-3.5 bg-cyan-950/25 border border-cyan-800/40 rounded-xl flex items-start gap-2.5 text-xs text-cyan-200/90">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Loop Stability Advisory:</span> For seamless YouTube video looping, gentle ripples or calm flow is recommended. Water velocity above level 3 may cause morphological frame shifts in generative video engines.
            </div>
          </div>

          {/* Water Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
              Water Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {WATER_TYPES.map((type) => {
                const isSelected = water.type === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        water: { ...prev.water, type: type.id },
                      }))
                    }
                    className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#192434] border-cyan-500/80 text-cyan-300 font-semibold shadow-xs'
                        : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                    }`}
                  >
                    <span>{type.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {water.type === 'custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={water.customType || ''}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      water: { ...prev.water, customType: e.target.value },
                    }))
                  }
                  placeholder="e.g. Ancient subterranean bioluminescent canal"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Placement & Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#1E2B3E]">
            <div>
              <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
                Placement in Scene
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WATER_PLACEMENTS.map((plc) => (
                  <button
                    key={plc.id}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        water: { ...prev.water, placement: plc.id },
                      }))
                    }
                    className={`p-2 text-left rounded-lg border text-[11px] font-medium transition-colors ${
                      water.placement === plc.id
                        ? 'bg-[#192434] border-cyan-500 text-cyan-300'
                        : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                    }`}
                  >
                    {plc.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
                Water Scene Visibility
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WATER_VISIBILITIES.map((vis) => (
                  <button
                    key={vis.id}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        water: { ...prev.water, visibility: vis.id },
                      }))
                    }
                    className={`p-2 text-center rounded-lg border text-[11px] font-medium transition-colors ${
                      water.visibility === vis.id
                        ? 'bg-[#192434] border-cyan-500 text-cyan-300'
                        : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                    }`}
                  >
                    {vis.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Water Behavior & Reflections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#1E2B3E]">
            <div>
              <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
                Surface Dynamic Behavior
              </label>
              <div className="space-y-1.5">
                {WATER_BEHAVIORS.map((beh) => (
                  <button
                    key={beh.id}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        water: { ...prev.water, behavior: beh.id },
                      }))
                    }
                    className={`w-full p-2.5 text-left rounded-lg border text-[11px] font-medium transition-colors flex items-center justify-between ${
                      water.behavior === beh.id
                        ? 'bg-[#192434] border-cyan-500 text-cyan-300 font-semibold'
                        : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                    }`}
                  >
                    <span>{beh.name}</span>
                    {water.behavior === beh.id && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
                Surface Reflections
              </label>
              <div className="space-y-1.5">
                {WATER_REFLECTIONS.map((ref) => (
                  <button
                    key={ref.id}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        water: { ...prev.water, reflection: ref.id },
                      }))
                    }
                    className={`w-full p-2.5 text-left rounded-lg border text-[11px] font-medium transition-colors flex items-center justify-between ${
                      water.reflection === ref.id
                        ? 'bg-[#192434] border-cyan-500 text-cyan-300 font-semibold'
                        : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                    }`}
                  >
                    <span>{ref.name}</span>
                    {water.reflection === ref.id && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Advanced Toggles & Slider */}
          <div className="pt-4 border-t border-[#1E2B3E] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#F2EEE6] font-mono">
                    Movement Intensity (1 - 5)
                  </label>
                  <span className="text-xs font-mono text-cyan-400">
                    Level {water.movementIntensity} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={water.movementIntensity}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      water: { ...prev.water, movementIntensity: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-[#A1AEC0] mt-1">
                  <span>1 (Glassy / Still)</span>
                  <span>3 (Gentle Flow)</span>
                  <span>5 (Turbulent)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F2EEE6] mb-1.5 font-mono">
                  Animation Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() =>
                        updateConfig((prev) => ({
                          ...prev,
                          water: { ...prev.water, animationPriority: pri },
                        }))
                      }
                      className={`p-2 text-center rounded-lg border text-xs capitalize transition-colors ${
                        water.animationPriority === pri
                          ? 'bg-[#192434] border-cyan-500 text-cyan-300 font-semibold'
                          : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0]'
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkbox toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                <input
                  type="checkbox"
                  checked={water.rainHittingWater}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      water: { ...prev.water, rainHittingWater: e.target.checked },
                    }))
                  }
                  className="rounded bg-[#101722] border-[#1E2B3E] text-cyan-400 focus:ring-0"
                />
                <span className="text-xs text-[#F2EEE6]">Rain Hitting Water</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                <input
                  type="checkbox"
                  checked={water.preserveShorelineGeometry}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      water: { ...prev.water, preserveShorelineGeometry: e.target.checked },
                    }))
                  }
                  className="rounded bg-[#101722] border-[#1E2B3E] text-cyan-400 focus:ring-0"
                />
                <span className="text-xs text-[#F2EEE6]">Preserve Shoreline Geometry</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                <input
                  type="checkbox"
                  checked={water.loopSafeAnimation}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      water: { ...prev.water, loopSafeAnimation: e.target.checked },
                    }))
                  }
                  className="rounded bg-[#101722] border-[#1E2B3E] text-cyan-400 focus:ring-0"
                />
                <span className="text-xs text-[#F2EEE6]">Loop-Safe Mode</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
