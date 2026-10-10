import React, { useState } from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import { VISUAL_STYLES, ASPECT_RATIOS } from '../../../data/catalog';
import { VisualStyle, AspectRatio } from '../../../types/ambience';
import {
  Palette,
  Ratio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
} from 'lucide-react';

export const VisualStyleSection: React.FC = () => {
  const { config, updateConfig, resetSection } = useAmbience();
  const { visualStyle } = config;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Palette className="w-4 h-4 text-[#E8AE62]" />
            10. Visual Style & Color Grading
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Artistic rendering philosophy, color grading palette, and output aspect ratio
          </p>
        </div>

        <button
          type="button"
          onClick={() => resetSection('style')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Visual Style Selection Grid */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 font-mono">
          Rendering Aesthetic Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VISUAL_STYLES.map((style) => {
            const isSelected = visualStyle.style === style.id;

            return (
              <button
                key={style.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    visualStyle: { ...prev.visualStyle, style: style.id as VisualStyle },
                  }))
                }
                className={`p-3.5 text-left rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] ring-1 ring-[#E8AE62]/40 shadow-md'
                    : 'bg-[#0E1520] hover:bg-[#151F2E] border-[#1E2B3E] hover:border-[#283952]'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[#E8AE62]' : 'text-[#F2EEE6]'}`}>
                    {style.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62] shrink-0 stroke-[3]" />}
                </div>
                <p className="text-[11px] leading-relaxed text-[#A1AEC0] line-clamp-2">
                  {style.description}
                </p>
              </button>
            );
          })}
        </div>

        {visualStyle.style === 'custom' && (
          <div className="mt-4 p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
            <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
              Custom Style Prompt Instructions
            </label>
            <input
              type="text"
              value={visualStyle.customStyleText || ''}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  visualStyle: { ...prev.visualStyle, customStyleText: e.target.value },
                }))
              }
              placeholder="e.g. 1920s Japanese woodblock print with damp watercolor wash"
              className="w-full px-3 py-2 text-xs bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
            />
          </div>
        )}
      </div>

      {/* Aspect Ratio Selector */}
      <div className="mb-6 pt-4 border-t border-[#1E2B3E]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 flex items-center gap-1.5 font-mono">
          <Ratio className="w-3.5 h-3.5 text-[#E8AE62]" />
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {ASPECT_RATIOS.map((ar) => {
            const isSelected = visualStyle.aspectRatio === ar.id;

            return (
              <button
                key={ar.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    visualStyle: { ...prev.visualStyle, aspectRatio: ar.id as AspectRatio },
                  }))
                }
                className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                    : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[#E8AE62]' : 'text-[#F2EEE6]'}`}>
                    {ar.name}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-[#E8AE62]" />}
                </div>
                <span className="text-[10px] text-[#A1AEC0]">{ar.useCase}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Visual Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1E2B3E] mb-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#F2EEE6] font-mono">
              Realism & Texture Intensity
            </label>
            <span className="text-xs font-mono text-[#E8AE62]">
              Level {visualStyle.realismIntensity} / 5
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={visualStyle.realismIntensity}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                visualStyle: { ...prev.visualStyle, realismIntensity: parseInt(e.target.value) },
              }))
            }
            className="w-full accent-[#E8AE62]"
          />
          <div className="flex justify-between text-[10px] text-[#A1AEC0] mt-1">
            <span>1 (Stylized)</span>
            <span>3 (Balanced)</span>
            <span>5 (Photographic)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#F2EEE6] font-mono">
              Atmospheric Detail Level
            </label>
            <span className="text-xs font-mono text-[#E8AE62]">
              Level {visualStyle.detailLevel} / 5
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={visualStyle.detailLevel}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                visualStyle: { ...prev.visualStyle, detailLevel: parseInt(e.target.value) },
              }))
            }
            className="w-full accent-[#E8AE62]"
          />
          <div className="flex justify-between text-[10px] text-[#A1AEC0] mt-1">
            <span>1 (Broad Strokes)</span>
            <span>3 (Clean Detailing)</span>
            <span>5 (Intricate Micro-Details)</span>
          </div>
        </div>
      </div>

      {/* Color Palette Description */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-[#F2EEE6] mb-1.5 font-mono">
          Color Palette & Tone Grading
        </label>
        <input
          type="text"
          value={visualStyle.colorPalette}
          onChange={(e) =>
            updateConfig((prev) => ({
              ...prev,
              visualStyle: { ...prev.visualStyle, colorPalette: e.target.value },
            }))
          }
          placeholder="e.g. Deep crimson, warm gold embers, dark oak, midnight blue glass reflections"
          className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
        />
      </div>

      {/* Collapsible Advanced Section */}
      <div className="pt-5 mt-5 border-t border-[#1E2B3E]">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-medium text-[#A1AEC0] hover:text-[#F2EEE6] py-1"
        >
          <span className="flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-[#E8AE62]" />
            Advanced Photographic Controls (Depth of Field, Film Grain, Contrast)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3 p-4 bg-[#0B1018] rounded-xl border border-[#1E2B3E]">
            <div>
              <label className="block text-[11px] font-semibold text-[#F2EEE6] mb-1.5 font-mono">
                Contrast Profile
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['soft', 'medium', 'high'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        visualStyle: { ...prev.visualStyle, contrast: c },
                      }))
                    }
                    className={`py-1.5 text-[11px] font-medium rounded-lg border capitalize ${
                      visualStyle.contrast === c
                        ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                        : 'bg-[#101722] border-[#1E2B3E] text-[#A1AEC0]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#F2EEE6] mb-1.5 font-mono">
                Depth of Field (Aperture)
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['shallow', 'medium', 'deep'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        visualStyle: { ...prev.visualStyle, depthOfField: d },
                      }))
                    }
                    className={`py-1.5 text-[11px] font-medium rounded-lg border capitalize ${
                      visualStyle.depthOfField === d
                        ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                        : 'bg-[#101722] border-[#1E2B3E] text-[#A1AEC0]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#F2EEE6] mb-1.5 font-mono">
                Film Grain Emulsion
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['none', 'subtle', 'noticeable'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        visualStyle: { ...prev.visualStyle, filmGrain: g },
                      }))
                    }
                    className={`py-1.5 text-[11px] font-medium rounded-lg border capitalize ${
                      visualStyle.filmGrain === g
                        ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                        : 'bg-[#101722] border-[#1E2B3E] text-[#A1AEC0]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
