import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { WORLDS_CATALOG, LOCATIONS_CATALOG } from '../../data/catalog';
import {
  Compass,
  MapPin,
  Calendar,
  CloudRain,
  Waves,
  Flame,
  Camera,
  Boxes,
  Palette,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Lock,
  Copy,
  Check,
  X,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const LiveSummaryPanel: React.FC = () => {
  const {
    config,
    updateConfig,
    conflicts,
    resolveConflict,
    resetEntireProject,
    resetSection,
    drafts,
    setActiveView,
    setWorkflowStage,
    showToast,
  } = useAmbience();

  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);

  const world = WORLDS_CATALOG.find((w) => w.id === config.worldId);
  const location = LOCATIONS_CATALOG.find((l) => l.id === config.locationId);

  const worldLabel =
    config.worldId === 'custom-world' && config.customWorldName
      ? config.customWorldName
      : world?.name || 'World';
  const locationLabel = config.customLocation || location?.name || 'Location';

  const handleCopyImagePrompt = () => {
    navigator.clipboard.writeText(drafts.imagePrompt);
    setCopiedQuick(true);
    showToast('Copied Image prompt to clipboard');
    setTimeout(() => setCopiedQuick(false), 2000);
  };

  return (
    <aside className="w-80 shrink-0 bg-[#101722]/95 border-l border-[#1E2B3E] flex flex-col h-full overflow-y-auto p-4 select-none backdrop-blur-md">
      {/* Title & Status */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1E2B3E] mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8AE62] ring-2 ring-[#E8AE62]/30" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F2EEE6] font-display">
              Live Scene Summary
            </h3>
          </div>
          <p className="text-[11px] text-[#A1AEC0] mt-0.5">
            Active composition parameters
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveView('create');
            setWorkflowStage('prompts');
          }}
          className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E] hover:border-[#283952] text-[#A1AEC0] hover:text-[#E8AE62] transition-colors"
          title="Open Prompt Workbench"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Active Conflicts Widget */}
      {conflicts.length > 0 && (
        <div className="mb-4 space-y-2">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="p-3 bg-amber-950/30 border border-[#E8AE62]/60 rounded-xl text-xs"
            >
              <div className="flex items-start gap-2 text-[#E8AE62] font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{conflict.title}</span>
              </div>
              <p className="text-[11px] text-[#F2EEE6]/80 mb-2 leading-relaxed">
                {conflict.message}
              </p>
              {conflict.resolve && (
                <button
                  type="button"
                  onClick={() => resolveConflict(conflict)}
                  className="w-full py-1 px-2 text-[11px] font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg transition-colors"
                >
                  {conflict.resolveActionLabel || 'Auto-Resolve Conflict'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Structured Summary Chips with Actions */}
      <div className="space-y-2 mb-6">
        {/* World Chip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <Compass className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span className="text-[#A1AEC0]">World:</span>
            <span className="font-medium text-[#F2EEE6] truncate">{worldLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => resetSection('world')}
            className="text-[#A1AEC0] hover:text-[#F2EEE6] p-0.5"
            title="Reset world"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Setting & Location Chip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <MapPin className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span className="text-[#A1AEC0]">Location:</span>
            <span className="font-medium text-[#F2EEE6] truncate">{locationLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => resetSection('environment')}
            className="text-[#A1AEC0] hover:text-[#F2EEE6] p-0.5"
            title="Reset location"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Temporal Season & Time */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <Calendar className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span className="text-[#A1AEC0]">Time:</span>
            <span className="font-medium text-[#F2EEE6] capitalize">
              {config.season} · {config.timeOfDay.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Weather Chip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <CloudRain className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span className="text-[#A1AEC0]">Weather:</span>
            <span className="font-medium text-[#F2EEE6] capitalize truncate">
              {config.primaryWeather}
              {config.secondaryWeather ? ` + ${config.secondaryWeather}` : ''}
            </span>
          </div>
          {config.secondaryWeather && (
            <button
              type="button"
              onClick={() => updateConfig((c) => ({ ...c, secondaryWeather: undefined }))}
              className="text-[#A1AEC0] hover:text-rose-400 p-0.5"
              title="Remove secondary weather"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Water Chip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[#A1AEC0]">Water:</span>
            <span className="font-medium text-[#F2EEE6] capitalize truncate">
              {config.water.enabled ? `${config.water.type} (${config.water.placement})` : 'Disabled'}
            </span>
          </div>
          {config.water.enabled && (
            <button
              type="button"
              onClick={() =>
                updateConfig((c) => ({
                  ...c,
                  water: { ...c.water, enabled: false, type: 'none' },
                }))
              }
              className="text-[#A1AEC0] hover:text-rose-400 p-0.5"
              title="Disable water body"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Lighting Chip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <Flame className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span className="text-[#A1AEC0]">Light:</span>
            <span className="font-medium text-[#F2EEE6] capitalize truncate">
              {config.lighting.primary.replace('-', ' ')}
            </span>
          </div>
          <span className="text-[10px] text-[#E8AE62] font-mono">
            {config.lighting.colorTemperature.replace('-', ' ')}
          </span>
        </div>

        {/* Camera Chip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <Camera className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span className="text-[#A1AEC0]">Camera:</span>
            <span className="font-medium text-[#F2EEE6] capitalize truncate">
              {config.camera.angle} · {config.camera.lockedCamera ? 'Locked' : config.camera.movement}
            </span>
          </div>
          {config.camera.lockedCamera && (
            <span title="Locked stationary camera">
              <Lock className="w-3 h-3 text-[#E8AE62] shrink-0" />
            </span>
          )}
        </div>

        {/* Exclude People/Animals Status */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <Boxes className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-[#A1AEC0]">Living:</span>
            <span className="font-medium text-[#F2EEE6]">
              {config.elements.excludePeopleAndAnimals ? 'Strictly Uninhabited' : `${config.elements.livingSubjects.length} subjects`}
            </span>
          </div>
        </div>

        {/* Visual Style & Aspect Ratio */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs hover:border-[#283952] transition-colors">
          <div className="flex items-center gap-2 truncate pr-1">
            <Palette className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span className="text-[#A1AEC0]">Style:</span>
            <span className="font-medium text-[#F2EEE6] capitalize truncate">
              {config.visualStyle.style.replace('-', ' ')}
            </span>
          </div>
          <span className="text-[10px] text-[#E8AE62] font-mono font-bold bg-[#192434] px-1.5 py-0.5 rounded border border-[#283952]">
            {config.visualStyle.aspectRatio}
          </span>
        </div>
      </div>

      {/* Quick Prompt Copy Box */}
      <div className="mt-auto pt-4 border-t border-[#1E2B3E]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1AEC0] font-mono">
            Image Prompt Preview
          </span>
          <button
            type="button"
            onClick={handleCopyImagePrompt}
            className="flex items-center gap-1 text-[11px] text-[#E8AE62] hover:text-[#F2EEE6] font-medium transition-colors"
          >
            {copiedQuick ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
            {copiedQuick ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-[10px] font-mono text-[#A1AEC0] bg-[#0B1018] p-3 rounded-xl border border-[#1E2B3E] line-clamp-4 leading-relaxed">
          {drafts.imagePrompt}
        </p>

        {/* Reset Actions */}
        <div className="mt-4 pt-3 border-t border-[#1E2B3E]">
          {!confirmResetAll ? (
            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="w-full py-2 px-3 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl border border-rose-900/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Entire Project
            </button>
          ) : (
            <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl text-center">
              <p className="text-[11px] text-rose-300 mb-2 leading-snug">Reset all project parameters to studio defaults?</p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(false)}
                  className="px-3 py-1 text-[11px] text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#0B1018] rounded-lg border border-[#1E2B3E]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetEntireProject();
                    setConfirmResetAll(false);
                  }}
                  className="px-3 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
