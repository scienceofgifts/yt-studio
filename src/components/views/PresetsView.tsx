import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { WorldVisual } from '../../data/worldVisuals';
import { VisualArtwork } from '../common/VisualArtwork';
import { WORLDS_CATALOG } from '../../data/catalog';
import {
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Trash2,
  Check,
  Flame,
  CloudRain,
  Music,
  Camera,
  Layers,
  Compass,
} from 'lucide-react';

export const PresetsView: React.FC = () => {
  const { presets, applyPreset, deletePreset } = useAmbience();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Starter Presets',
    'Fantasy & Magic',
    'Cozy & Nature',
    'Gaming',
    'Custom Worlds',
  ];

  const filtered = presets.filter((p) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Starter Presets') return p.isStarter;
    if (selectedCategory === 'Custom Worlds') return !p.isStarter;
    return p.category === selectedCategory;
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Top Banner */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
            <SlidersHorizontal className="w-5 h-5 text-[#E8AE62]" />
            Atmospheric Preset Library
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-1">
            Curated and custom ambience archetypes with coordinated visual, motion, and acoustic settings
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl mb-6 shadow-inner">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-[#192434] text-[#E8AE62] font-semibold border border-[#283952] shadow-sm'
                  : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((preset) => {
          const world = WORLDS_CATALOG.find((w) => w.id === preset.config.worldId);

          return (
            <div
              key={preset.id}
              className="rounded-2xl border border-[#1E2B3E] bg-[#101722] hover:border-[#283952] hover:bg-[#131D2C] transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg group"
            >
              {/* Visual World Banner */}
              <div className="relative w-full h-28 bg-[#070B10] overflow-hidden">
                <VisualArtwork
                  targetKey={`preset:${preset.id}`}
                  targetLabel={preset.name}
                  fallbackTargetKey={`world:${preset.config.worldId}`}
                  defaultVisual={<WorldVisual worldId={preset.config.worldId} className="w-full h-full object-cover" />}
                  overlayScrim={true}
                  alignControls="top-right"
                />

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#0B1018]/80 backdrop-blur-xs border border-[#1E2B3E] text-[10px] font-medium text-[#E8AE62] flex items-center gap-1 z-10 pointer-events-none">
                  <Compass className="w-3 h-3" />
                  <span>{world?.name || preset.config.worldId}</span>
                </div>

                <div className="absolute top-2.5 right-10 z-10 pointer-events-none">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#192434] text-[#A1AEC0] border border-[#283952]">
                    {preset.category}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-[#F2EEE6] font-display">
                      {preset.name}
                    </h3>

                    {!preset.isStarter && (
                      <button
                        type="button"
                        onClick={() => deletePreset(preset.id)}
                        className="p-1 text-[#A1AEC0] hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[#A1AEC0] mb-4 leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>

                  {/* Core Attributes Strip */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#F2EEE6] mb-4 bg-[#0B1018] p-3 rounded-xl border border-[#1E2B3E]">
                    <div className="flex items-center gap-1.5 truncate">
                      <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate capitalize">{preset.config.primaryWeather}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Flame className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
                      <span className="truncate capitalize">{preset.config.lighting.primary.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Camera className="w-3.5 h-3.5 text-[#A1AEC0] shrink-0" />
                      <span className="truncate capitalize">{preset.config.camera.angle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{preset.config.music.style}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Apply Bar */}
                <div className="pt-3 border-t border-[#1E2B3E] flex items-center justify-between">
                  <span className="text-[10px] text-[#A1AEC0] font-mono">
                    {preset.isStarter ? 'Verified Studio Starter' : 'Custom User Preset'}
                  </span>

                  <button
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
                  >
                    Apply Preset
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
