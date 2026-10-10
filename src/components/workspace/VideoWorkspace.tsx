import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { ANIMATION_SUBJECT_KEYS } from '../../data/catalog';
import { MotionIntensity } from '../../types/ambience';
import {
  Video,
  Film,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Lock,
  Layers,
  Clock,
  Check,
  Loader2,
  Copy,
  ChevronRight,
  Info,
} from 'lucide-react';

export const VideoWorkspace: React.FC = () => {
  const {
    config,
    updateConfig,
    applyLoopOptimizationPreset,
    resetSection,
    drafts,
    updateDraft,
    generateAiPrompts,
    isGeneratingPrompts,
    generationTarget,
    setWorkflowStage,
    showToast,
  } = useAmbience();

  const { video } = config;
  const [copied, setCopied] = useState(false);

  const toggleSubject = (key: string, enabled: boolean) => {
    updateConfig((prev) => ({
      ...prev,
      video: {
        ...prev.video,
        subjects: {
          ...prev.video.subjects,
          [key]: {
            enabled,
            intensity: prev.video.subjects[key]?.intensity || 'subtle',
          },
        },
      },
    }));
  };

  const setSubjectIntensity = (key: string, intensity: MotionIntensity) => {
    updateConfig((prev) => ({
      ...prev,
      video: {
        ...prev.video,
        subjects: {
          ...prev.video.subjects,
          [key]: {
            enabled: true,
            intensity,
          },
        },
      },
    }));
  };

  const handleCopyVideoPrompt = () => {
    navigator.clipboard.writeText(drafts.videoPrompt);
    setCopied(true);
    showToast('Copied Video animation prompt to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const hasHighWaterWarning = config.water.enabled && config.water.movementIntensity > 3 && video.seamlessLoop;

  const isGeneratingThis = isGeneratingPrompts && (generationTarget === 'video' || generationTarget === 'all');

  return (
    <div className="space-y-6">
      {/* Workspace Header Banner */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Film className="w-5 h-5 text-[#E8AE62]" />
            Video Animation & Loop Engineering
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Image-to-video dynamics, environmental particle physics, and seamless loop optimization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={applyLoopOptimizationPreset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Apply Loop Optimization
          </button>
          <button
            type="button"
            onClick={() => resetSection('video')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-xl transition-colors border border-[#1E2B3E]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* AI Video Prompt Generator Card */}
      <div className="bg-[#101722]/90 border border-[#1E2B3E] rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8AE62]/10 border border-[#E8AE62]/30 flex items-center justify-center text-[#E8AE62]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2EEE6] font-display">
                Intelligent Video Animation Prompt Engine
              </h3>
              <p className="text-[11px] text-[#A1AEC0]">
                Translates physical motion constraints, camera locks, and loop parameters into Runway/Kling prompts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPrompts}
              onClick={() => generateAiPrompts('video')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-md ${
                isGeneratingThis
                  ? 'bg-[#192434] text-[#E8AE62] border border-[#E8AE62]/50 cursor-wait'
                  : 'bg-[#E8AE62] hover:bg-[#F2BE7D] text-[#0B1018]'
              }`}
            >
              {isGeneratingThis ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E8AE62]" />
                  <span>Generating Video Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Video Prompt with AI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyVideoPrompt}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#F2EEE6] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              type="button"
              onClick={() => setWorkflowStage('prompts')}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#E8AE62] hover:text-[#F2BE7D] transition-colors"
            >
              <span>Workbench</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video Prompt Text Preview */}
        <div className="relative">
          <textarea
            rows={4}
            value={drafts.videoPrompt}
            onChange={(e) => updateDraft('videoPrompt', e.target.value)}
            className="w-full p-3.5 text-xs font-mono leading-relaxed bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62] focus:ring-1 focus:ring-[#E8AE62]/20"
            placeholder="Generated Runway / Kling animation prompt..."
          />
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#A1AEC0]">
            <span>Model Targets: Runway Gen-3 Alpha · Kling 1.5 · Luma Dream Machine</span>
            <span className="font-mono">{drafts.videoPrompt.length} chars</span>
          </div>
        </div>
      </div>

      {/* Difficulty & Warning Banner */}
      {hasHighWaterWarning && (
        <div className="p-4 bg-amber-950/30 border border-[#E8AE62]/50 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#E8AE62] shrink-0 mt-0.5" />
          <div className="text-xs text-[#F2EEE6]/90">
            <span className="font-semibold text-[#E8AE62]">Loop Difficulty Notice:</span> Water movement intensity is set to high while Seamless Loop mode is active. High velocity water causes boundary frame mismatch in AI video models. Consider lowering water intensity to level 2 for seamless loop perfection.
          </div>
        </div>
      )}

      {/* Animation Subjects Grid */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 flex items-center gap-2 font-display">
          <Sparkles className="w-4 h-4 text-[#E8AE62]" />
          Environmental Motion Subjects
        </h3>
        <p className="text-xs text-[#A1AEC0] mb-5">
          Enable individual environmental movements and tune their velocity intensity
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ANIMATION_SUBJECT_KEYS.map((subj) => {
            const current = video.subjects[subj.key] || { enabled: false, intensity: subj.defaultIntensity };
            const isEnabled = current.enabled;

            return (
              <div
                key={subj.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isEnabled
                    ? 'bg-[#151F2E] border-[#E8AE62]/60 shadow-md'
                    : 'bg-[#0E1520] border-[#1E2B3E] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => toggleSubject(subj.key, e.target.checked)}
                      className="rounded bg-[#0B1018] border-[#1E2B3E] text-[#E8AE62] focus:ring-0"
                    />
                    <span className={`text-xs font-semibold ${isEnabled ? 'text-[#E8AE62]' : 'text-[#F2EEE6]'}`}>
                      {subj.label}
                    </span>
                  </label>

                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${isEnabled ? 'bg-[#192434] text-[#E8AE62] border border-[#283952]' : 'bg-[#0B1018] text-[#A1AEC0]'}`}>
                    {isEnabled ? 'Active' : 'Muted'}
                  </span>
                </div>

                {/* Movement Intensity selector */}
                <div className={`grid grid-cols-4 gap-1.5 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  {(['barely-perceptible', 'subtle', 'moderate', 'prominent'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      disabled={!isEnabled}
                      onClick={() => setSubjectIntensity(subj.key, lvl)}
                      className={`py-1.5 text-[10px] font-medium rounded-lg border text-center capitalize transition-colors ${
                        current.intensity === lvl
                          ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                          : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                      }`}
                    >
                      {lvl.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Duration & Global Stability Constraints */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 flex items-center gap-2 font-display">
          <Lock className="w-4 h-4 text-[#E8AE62]" />
          Loop & Boundary Stability Controls
        </h3>
        <p className="text-xs text-[#A1AEC0] mb-5">
          Rigid parameters enforced in prompt generation to prevent frame morphing, cuts, and temporal drift
        </p>

        {/* Duration selector */}
        <div className="mb-5 pb-5 border-b border-[#1E2B3E] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E8AE62]" />
            <span className="text-xs font-semibold text-[#F2EEE6] font-mono">Loop Animation Duration:</span>
          </div>
          <div className="flex gap-2">
            {[4, 5, 8, 10, 16].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    video: { ...prev.video, durationSeconds: sec },
                  }))
                }
                className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                  video.durationSeconds === sec
                    ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                    : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                }`}
              >
                {sec}s Cycle
              </button>
            ))}
          </div>
        </div>

        {/* Global Stability Constraint Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'seamlessLoop', label: 'Seamless Continuous Loop (Identical endpoints)' },
            { key: 'lockedCamera', label: 'Locked Stationary Camera (Tripod mount)' },
            { key: 'preserveAllObjects', label: 'Preserve All Existing Scene Objects' },
            { key: 'preserveSceneGeometry', label: 'Preserve Scene & Architecture Geometry' },
            { key: 'preventNewObjects', label: 'Prevent New Objects or Artifacts Appearing' },
            { key: 'preventPeopleAndAnimals', label: 'Prevent People & Animals Entering Scene' },
            { key: 'staticBackground', label: 'Keep Background Architecture Static' },
            { key: 'staticSky', label: 'Keep Sky & Cloud Shapes Static' },
            { key: 'staticDistantScenery', label: 'Keep Distant Scenery & Mountains Static' },
            { key: 'consistentLighting', label: 'Consistent Lighting (No flashing or shifts)' },
            { key: 'naturalPhysicalMotion', label: 'Adhere Strictly to Natural Physical Motion' },
          ].map((item) => {
            const isChecked = video[item.key as keyof typeof video] as boolean;

            return (
              <label
                key={item.key}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] cursor-pointer hover:border-[#283952] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      video: {
                        ...prev.video,
                        [item.key]: e.target.checked,
                      },
                    }))
                  }
                  className="rounded bg-[#101722] border-[#1E2B3E] text-[#E8AE62] focus:ring-0"
                />
                <span className="text-xs text-[#F2EEE6] leading-tight">{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
