import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { StorageService } from '../../services/storage';
import {
  VERIFIED_MODELS_LIST,
  STUDIO_TASKS,
  SupportedGeminiModelId,
  getModelInfo,
} from '../../data/modelRegistry';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertTriangle,
  Sliders,
  Database,
  Cpu,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    showToast,
    modelConfig,
    setGlobalModel,
    setTaskOverride,
    resetTaskOverride,
    resetAllOverrides,
  } = useAmbience();
  const [importJson, setImportJson] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const handleExport = () => {
    const jsonStr = StorageService.exportFullStudioJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ambience_intelligence_studio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded studio JSON backup');
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const success = StorageService.importFullStudioJSON(importJson.trim());
    if (success) {
      showToast('Studio data restored successfully. Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      showToast('Failed to parse JSON backup format');
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear ALL local projects, presets, and history? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
            <Settings className="w-5 h-5 text-[#E8AE62]" />
            Studio Preferences & Storage
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-1">
            Manage local storage configuration, backup archives, and engine capabilities
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Gemini Model Selection & Task Overrides Section */}
        <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B3E] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
                <Cpu className="w-4 h-4 text-[#E8AE62]" />
                Gemini Model Routing & Engine Selection
              </h3>
              <p className="text-xs text-[#A1AEC0] mt-0.5">
                Set studio default model and optional task-specific overrides. Default: <strong>3.5 Light</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloudflare Server Proxy</span>
              </span>
            </div>
          </div>

          {/* Global Default Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F2EEE6] uppercase tracking-wider font-mono">
                Global Default Engine
              </span>
              <span className="text-[11px] text-[#E8AE62] font-mono">
                Active: {getModelInfo(modelConfig.globalModelId).displayName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {VERIFIED_MODELS_LIST.map((model) => {
                const isSelected = modelConfig.globalModelId === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setGlobalModel(model.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#192434] border-[#E8AE62] ring-1 ring-[#E8AE62]/40 shadow-sm'
                        : 'bg-[#0B1018] hover:bg-[#151F2E] border-[#1E2B3E] hover:border-[#283952]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`font-semibold text-xs ${
                            isSelected ? 'text-[#E8AE62]' : 'text-[#F2EEE6]'
                          }`}
                        >
                          {model.displayName}
                        </span>
                        {model.isDefault && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#A1AEC0] line-clamp-2 leading-relaxed">
                        {model.tagline}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#1E2B3E] flex items-center justify-between text-[10px] font-mono text-[#718096]">
                      <span>{model.family}</span>
                      <span className={isSelected ? 'text-[#E8AE62]' : ''}>
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task-Specific Overrides */}
          <div className="pt-5 border-t border-[#1E2B3E] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#F2EEE6] uppercase tracking-wider font-mono">
                  Task-Specific Overrides
                </span>
                <p className="text-[11px] text-[#A1AEC0] mt-0.5">
                  Tasks set to "Inherit Global" automatically follow your chosen global model.
                </p>
              </div>
              <button
                type="button"
                onClick={resetAllOverrides}
                className="text-xs text-[#E8AE62] hover:underline flex items-center gap-1 transition-colors"
                title="Reset all task overrides to inherit the global model"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All to Global</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {STUDIO_TASKS.map((task) => {
                const currentOverride = modelConfig.taskOverrides[task.id];
                const isOverridden = Boolean(currentOverride && currentOverride !== modelConfig.globalModelId);

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isOverridden
                        ? 'bg-[#192434]/50 border-[#E8AE62]/40'
                        : 'bg-[#0B1018] border-[#1E2B3E]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-xs text-[#F2EEE6] truncate">
                          {task.label}
                        </span>
                        {isOverridden && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E8AE62]/20 text-[#E8AE62] font-mono">
                            Override
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#A1AEC0] line-clamp-1">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={currentOverride || 'inherit'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'inherit') {
                            resetTaskOverride(task.id);
                          } else {
                            setTaskOverride(task.id, val as SupportedGeminiModelId);
                          }
                        }}
                        className={`text-xs py-1 px-2 rounded-lg border bg-[#101722] focus:outline-none ${
                          isOverridden
                            ? 'border-[#E8AE62]/60 text-[#E8AE62]'
                            : 'border-[#1E2B3E] text-[#F2EEE6]'
                        }`}
                      >
                        <option value="inherit">
                          Inherit Global ({getModelInfo(modelConfig.globalModelId).displayName})
                        </option>
                        {VERIFIED_MODELS_LIST.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName}
                          </option>
                        ))}
                      </select>

                      {isOverridden && (
                        <button
                          type="button"
                          onClick={() => resetTaskOverride(task.id)}
                          className="p-1 text-[#A1AEC0] hover:text-[#E8AE62] rounded transition-colors"
                          title="Reset to global model"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[11px] text-[#A1AEC0] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E8AE62] shrink-0" />
            <span>
              Preferences are stored locally in your browser. All API requests route securely through the server proxy without exposing your Gemini API key to client browsers.
            </span>
          </div>
        </div>

        {/* Persistence & Backup Section */}
        <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 shadow-md">
          <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 flex items-center gap-2 font-display">
            <Download className="w-4 h-4 text-[#E8AE62]" />
            Studio State Backup & Portability
          </h3>
          <p className="text-xs text-[#A1AEC0] mb-5 leading-relaxed">
            Export all saved projects, custom presets, reference notes, and lessons into an offline JSON backup.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              Export Full Studio Backup (JSON)
            </button>

            <button
              type="button"
              onClick={() => setShowImportArea(!showImportArea)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#F2EEE6] hover:text-[#E8AE62] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" />
              {showImportArea ? 'Close Import Area' : 'Import from JSON'}
            </button>
          </div>

          {showImportArea && (
            <div className="mt-5 pt-5 border-t border-[#1E2B3E]">
              <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                Paste Backup JSON Content
              </label>
              <textarea
                rows={5}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{"version": "1.0", "projects": [...], "presets": [...]}'
                className="w-full p-3 text-xs font-mono bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62] mb-3"
              />
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-colors"
              >
                Restore Studio State
              </button>
            </div>
          )}
        </div>

        {/* Phase Architecture Notes */}
        <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 shadow-md">
          <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 flex items-center gap-2 font-display">
            <Cpu className="w-4 h-4 text-[#E8AE62]" />
            Studio Engine Architecture
          </h3>
          <div className="space-y-2.5 mt-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
              <span className="text-[#F2EEE6]">Configuration State Engine</span>
              <span className="text-[#E8AE62] font-mono font-medium">Active (Shared Central Model)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
              <span className="text-[#F2EEE6]">Deterministic Prompt Compiler</span>
              <span className="text-[#E8AE62] font-mono font-medium">Active (Image / Video / Audio)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
              <span className="text-[#F2EEE6]">Local Storage Persistence</span>
              <span className="text-[#E8AE62] font-mono font-medium">Active (Isolated Client Storage)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
              <span className="text-[#F2EEE6]">Direct Generative AI Execution</span>
              <span className="text-[#A1AEC0] font-mono">Planned (Phase 2 Backend Integration)</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-rose-300 mb-1 flex items-center gap-2 font-display">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Danger Zone
          </h3>
          <p className="text-xs text-rose-200/80 mb-4 leading-relaxed">
            Reset all application data and remove all custom projects, presets, and history entries.
          </p>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 rounded-xl transition-colors"
          >
            Clear Entire Local Storage & Reset
          </button>
        </div>
      </div>
    </div>
  );
};
