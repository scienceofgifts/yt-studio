import React from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import {
  PRIMARY_LIGHTINGS,
  COLOR_TEMPERATURES,
  LIGHTING_INTENSITIES,
} from '../../../data/catalog';
import { PrimaryLighting, ColorTemperature, LightingIntensity } from '../../../types/ambience';
import {
  Flame,
  Sparkles,
  Lamp,
  LampDesk,
  Moon,
  Sun,
  SunMedium,
  Cloud,
  Zap,
  Wand2,
  Layers,
  RotateCcw,
  Check,
} from 'lucide-react';

export const LightingSection: React.FC = () => {
  const { config, updateConfig, resetSection } = useAmbience();
  const { lighting } = config;

  const getPrimaryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4 text-[#E8AE62]" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'Lamp': return <Lamp className="w-4 h-4 text-[#E8AE62]" />;
      case 'LampDesk': return <LampDesk className="w-4 h-4 text-amber-200" />;
      case 'Moon': return <Moon className="w-4 h-4 text-blue-300" />;
      case 'Sun': return <Sun className="w-4 h-4 text-amber-400" />;
      case 'SunMedium': return <SunMedium className="w-4 h-4 text-amber-300" />;
      case 'Cloud': return <Cloud className="w-4 h-4 text-[#A1AEC0]" />;
      case 'Zap': return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'Wand2': return <Wand2 className="w-4 h-4 text-purple-400" />;
      default: return <Layers className="w-4 h-4 text-[#A1AEC0]" />;
    }
  };

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Flame className="w-4 h-4 text-[#E8AE62]" />
            7. Lighting & Optical Atmosphere
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Craft the primary illumination source, Kelvin color warmth, and volumetric dynamics
          </p>
        </div>

        <button
          type="button"
          onClick={() => resetSection('lighting')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Primary Light Source Grid */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 font-mono">
          Primary Light Source
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {PRIMARY_LIGHTINGS.map((light) => {
            const isSelected = lighting.primary === light.id;

            return (
              <button
                key={light.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    lighting: { ...prev.lighting, primary: light.id as PrimaryLighting },
                  }))
                }
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] ring-1 ring-[#E8AE62]/40 shadow-md'
                    : 'bg-[#0E1520] hover:bg-[#151F2E] border-[#1E2B3E] hover:border-[#283952]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E]">
                    {getPrimaryIcon(light.icon)}
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-[#E8AE62] font-semibold' : 'text-[#F2EEE6]'}`}>
                    {light.name}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Temperature & Intensity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1E2B3E]">
        <div>
          <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
            Color Temperature
          </label>
          <div className="space-y-1.5">
            {COLOR_TEMPERATURES.map((temp) => {
              const isSelected = lighting.colorTemperature === temp.id;

              return (
                <button
                  key={temp.id}
                  type="button"
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      lighting: { ...prev.lighting, colorTemperature: temp.id as ColorTemperature },
                    }))
                  }
                  className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                      style={{ backgroundColor: temp.hex }}
                    />
                    <span className={`text-xs ${isSelected ? 'font-semibold text-[#E8AE62]' : ''}`}>
                      {temp.name}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62]" />}
                </button>
              );
            })}
          </div>

          {lighting.colorTemperature === 'custom' && (
            <div className="mt-3">
              <input
                type="text"
                value={lighting.customColorTemp || ''}
                onChange={(e) =>
                  updateConfig((prev) => ({
                    ...prev,
                    lighting: { ...prev.lighting, customColorTemp: e.target.value },
                  }))
                }
                placeholder="e.g. 1800K candle glow with violet rim highlights"
                className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
            Lighting Intensity
          </label>
          <div className="space-y-1.5">
            {LIGHTING_INTENSITIES.map((intensity) => {
              const isSelected = lighting.intensity === intensity.id;

              return (
                <button
                  key={intensity.id}
                  type="button"
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      lighting: { ...prev.lighting, intensity: intensity.id as LightingIntensity },
                    }))
                  }
                  className={`w-full p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                  }`}
                >
                  <span className="text-xs">{intensity.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Dynamics & Toggles */}
      <div className="pt-5 mt-5 border-t border-[#1E2B3E]">
        <label className="block text-xs font-semibold text-[#F2EEE6] mb-3 font-mono">
          Dynamics & Volumetric Effects
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'flickeringFlames', label: 'Flickering Hearth Flames' },
            { key: 'subtleFluctuation', label: 'Subtle Light Fluctuation' },
            { key: 'reflections', label: 'Specular Surface Reflections' },
            { key: 'volumetricRays', label: 'Volumetric Light Rays (God Rays)' },
            { key: 'magicalEffects', label: 'Magical Ambient Embers & Glow' },
            { key: 'constantThroughoutAnimation', label: 'Keep Lighting Constant Throughout' },
          ].map((toggle) => {
            const isChecked = lighting[toggle.key as keyof typeof lighting] as boolean;

            return (
              <label
                key={toggle.key}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] cursor-pointer hover:border-[#283952] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      lighting: {
                        ...prev.lighting,
                        [toggle.key]: e.target.checked,
                      },
                    }))
                  }
                  className="rounded bg-[#101722] border-[#1E2B3E] text-[#E8AE62] focus:ring-0"
                />
                <span className="text-xs text-[#F2EEE6]">{toggle.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
};
