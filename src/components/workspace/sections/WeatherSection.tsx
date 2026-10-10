import React from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import { WEATHER_CONDITIONS } from '../../../data/catalog';
import { WeatherCondition } from '../../../types/ambience';
import {
  CloudRain,
  Sun,
  CloudSun,
  Cloud,
  CloudDrizzle,
  CloudRainWind,
  CloudLightning,
  CloudSnow,
  Snowflake,
  Wind,
  CloudFog,
  Waves,
  Sparkle,
  AlertTriangle,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';

export const WeatherSection: React.FC = () => {
  const { config, updateConfig, conflicts, resolveConflict, resetSection } = useAmbience();

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-4 h-4 text-[#E8AE62]" />;
      case 'CloudSun': return <CloudSun className="w-4 h-4 text-amber-300" />;
      case 'Cloud': return <Cloud className="w-4 h-4 text-[#A1AEC0]" />;
      case 'CloudDrizzle': return <CloudDrizzle className="w-4 h-4 text-sky-300" />;
      case 'CloudRain': return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'CloudRainWind': return <CloudRainWind className="w-4 h-4 text-blue-500" />;
      case 'CloudLightning': return <CloudLightning className="w-4 h-4 text-[#E8AE62]" />;
      case 'CloudSnow': return <CloudSnow className="w-4 h-4 text-sky-200" />;
      case 'Snowflake': return <Snowflake className="w-4 h-4 text-sky-100" />;
      case 'CloudFog': return <CloudFog className="w-4 h-4 text-[#A1AEC0]" />;
      case 'Waves': return <Waves className="w-4 h-4 text-teal-300" />;
      case 'Wind': return <Wind className="w-4 h-4 text-[#A1AEC0]" />;
      default: return <Sparkle className="w-4 h-4 text-purple-300" />;
    }
  };

  const weatherConflict = conflicts.find((c) => c.section === 'Weather');

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <CloudRain className="w-4 h-4 text-[#E8AE62]" />
            4. Weather & Atmospheric Conditions
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Select primary meteorological conditions and blend secondary weather layers
          </p>
        </div>

        <button
          type="button"
          onClick={() => resetSection('environment')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Conflict Notice if Active */}
      {weatherConflict && (
        <div className="mb-5 p-3.5 bg-amber-950/30 border border-[#E8AE62]/50 rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#E8AE62] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#E8AE62]">{weatherConflict.title}</div>
              <div className="text-[11px] text-[#F2EEE6]/80 mt-0.5">{weatherConflict.message}</div>
            </div>
          </div>
          {weatherConflict.resolve && (
            <button
              type="button"
              onClick={() => resolveConflict(weatherConflict)}
              className="px-3 py-1 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg transition-colors whitespace-nowrap"
            >
              {weatherConflict.resolveActionLabel || 'Resolve'}
            </button>
          )}
        </div>
      )}

      {/* Primary Weather Condition */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 font-mono">
          Primary Weather
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {WEATHER_CONDITIONS.map((cond) => {
            const isSelected = config.primaryWeather === cond.id;

            return (
              <button
                key={cond.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    primaryWeather: cond.id,
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
                    {getWeatherIcon(cond.icon)}
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-[#E8AE62] font-semibold' : 'text-[#F2EEE6]'}`}>
                    {cond.name}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Weather Condition */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] font-mono">
            Secondary Atmosphere (Blended)
          </label>
          {config.secondaryWeather && (
            <button
              type="button"
              onClick={() => updateConfig((prev) => ({ ...prev, secondaryWeather: undefined }))}
              className="text-xs text-[#E8AE62] hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear Secondary
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {WEATHER_CONDITIONS.filter((c) => c.id !== config.primaryWeather).map((cond) => {
            const isSecondary = config.secondaryWeather === cond.id;

            return (
              <button
                key={cond.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    secondaryWeather: isSecondary ? undefined : cond.id,
                  }))
                }
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                  isSecondary
                    ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                    : 'bg-[#0B1018] hover:bg-[#151F2E] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                }`}
              >
                <span className={`text-[11px] truncate ${isSecondary ? 'font-semibold text-[#E8AE62]' : ''}`}>
                  + {cond.name}
                </span>
                {isSecondary && <Check className="w-3 h-3 text-[#E8AE62]" />}
              </button>
            );
          })}
        </div>

        {/* Custom Weather input */}
        {config.primaryWeather === 'custom' && (
          <div className="mt-4 p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
            <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
              Custom Weather Specification
            </label>
            <input
              type="text"
              value={config.customWeather || ''}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  customWeather: e.target.value,
                }))
              }
              placeholder="e.g. Atmospheric solar eclipse drizzle with warm updrafts"
              className="w-full px-3 py-2 text-xs bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
            />
          </div>
        )}
      </div>
    </section>
  );
};
