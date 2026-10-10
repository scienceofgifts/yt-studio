import React from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import {
  Cloud,
  Sun,
  Moon,
  Sparkles,
  Zap,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

export const SkySection: React.FC = () => {
  const { config, updateConfig, toggleSky } = useAmbience();
  const { sky } = config;

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header with prominent Show Sky toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Cloud className="w-4 h-4 text-[#E8AE62]" />
            5. Sky & Celestial Elements
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Explicit atmospheric sky control, celestial bodies, and loop-stability anchoring
          </p>
        </div>

        {/* Master Toggle: Show Sky */}
        <label className="flex items-center gap-2.5 cursor-pointer bg-[#0B1018] border border-[#1E2B3E] px-3.5 py-1.5 rounded-xl hover:border-[#283952] transition-colors">
          <span className="text-xs font-medium text-[#F2EEE6] flex items-center gap-1.5">
            {sky.showSky ? <Eye className="w-3.5 h-3.5 text-[#E8AE62]" /> : <EyeOff className="w-3.5 h-3.5 text-[#A1AEC0]" />}
            Show Sky:
          </span>
          <input
            type="checkbox"
            checked={sky.showSky}
            onChange={(e) => toggleSky(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              sky.showSky ? 'bg-[#E8AE62] justify-end' : 'bg-[#1E2B3E] justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#0B1018] shadow-xs"></span>
          </span>
          <span className={`text-xs font-mono font-bold ${sky.showSky ? 'text-[#E8AE62]' : 'text-[#A1AEC0]'}`}>
            {sky.showSky ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>

      {!sky.showSky && (
        <div className="mb-4 p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#A1AEC0] flex items-center gap-2.5">
          <EyeOff className="w-4 h-4 text-[#A1AEC0] shrink-0" />
          <span>
            Sky rendering is disabled for this scene (common for deep underground, enclosed rooms, or tight interiors). Controls below are preserved.
          </span>
        </div>
      )}

      {/* Sky Controls Grid */}
      <div className={`space-y-5 transition-opacity ${sky.showSky ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {/* Clouds & Cloud Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
              Cloud Cover
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['none', 'sparse', 'scattered', 'overcast', 'dramatic'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, clouds: opt },
                    }))
                  }
                  className={`py-2 px-2 text-[11px] font-medium rounded-lg border text-center capitalize transition-colors ${
                    sky.clouds === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
              Cloud Motion
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['static', 'subtle', 'moving'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, cloudAnimation: opt },
                    }))
                  }
                  className={`py-2 px-2 text-[11px] font-medium rounded-lg border text-center capitalize transition-colors ${
                    sky.cloudAnimation === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                  }`}
                >
                  {opt === 'static' ? 'Static (Loop)' : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Celestial Bodies: Sun & Moon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1E2B3E]">
          <div>
            <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 flex items-center gap-1.5 font-mono">
              <Sun className="w-3.5 h-3.5 text-[#E8AE62]" />
              Sun Presence
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['hidden', 'visible', 'low-horizon', 'bright'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, sun: opt },
                    }))
                  }
                  className={`py-2 px-1 text-[11px] font-medium rounded-lg border text-center capitalize transition-colors ${
                    sky.sun === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {opt.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 flex items-center gap-1.5 font-mono">
              <Moon className="w-3.5 h-3.5 text-blue-300" />
              Moon Phase
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['hidden', 'crescent', 'half', 'full'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, moon: opt },
                    }))
                  }
                  className={`py-2 px-1 text-[11px] font-medium rounded-lg border text-center capitalize transition-colors ${
                    sky.moon === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Night & Special Atmospheric Effects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1E2B3E]">
          <div>
            <label className="block text-[11px] font-semibold text-[#F2EEE6] mb-1.5 font-mono">
              Stars
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['off', 'subtle', 'prominent'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, stars: opt },
                    }))
                  }
                  className={`py-1 text-[10px] font-medium rounded-md border capitalize ${
                    sky.stars === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                      : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#F2EEE6] mb-1.5 font-mono">
              Aurora
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['off', 'subtle', 'prominent'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, aurora: opt },
                    }))
                  }
                  className={`py-1 text-[10px] font-medium rounded-md border capitalize ${
                    sky.aurora === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                      : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#F2EEE6] mb-1.5 font-mono">
              Sunbeams
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['off', 'subtle', 'visible'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, sunbeams: opt },
                    }))
                  }
                  className={`py-1 text-[10px] font-medium rounded-md border capitalize ${
                    sky.sunbeams === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                      : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#F2EEE6] mb-1.5 font-mono">
              Lightning
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['off', 'subtle', 'prominent'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!sky.showSky}
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      sky: { ...prev.sky, distantLightning: opt },
                    }))
                  }
                  className={`py-1 text-[10px] font-medium rounded-md border capitalize ${
                    sky.distantLightning === opt
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                      : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loop Optimization Toggle */}
        <div className="pt-4 border-t border-[#1E2B3E] flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sky.staticBackgroundLoop}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  sky: { ...prev.sky, staticBackgroundLoop: e.target.checked },
                }))
              }
              className="rounded bg-[#0B1018] border-[#1E2B3E] text-[#E8AE62] focus:ring-0"
            />
            <span className="text-xs text-[#F2EEE6] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#E8AE62]" />
              Lock Sky Horizon (Keeps distant mountains & sky static for seamless YouTube loop)
            </span>
          </label>
        </div>
      </div>
    </section>
  );
};
