import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import {
  MUSIC_STYLES,
  MUSIC_MOODS,
  INSTRUMENTATION_OPTIONS,
  FOLEY_SOUND_LAYERS,
} from '../../data/catalog';
import { ReferenceInfluenceLevel } from '../../types/ambience';
import {
  Music,
  Headphones,
  Sliders,
  Sparkles,
  Volume2,
  Clock,
  Info,
  Check,
  RotateCcw,
  Loader2,
  Copy,
  ChevronRight,
} from 'lucide-react';

export const MusicWorkspace: React.FC = () => {
  const {
    config,
    updateConfig,
    resetSection,
    drafts,
    updateDraft,
    generateAiPrompts,
    isGeneratingPrompts,
    generationTarget,
    setWorkflowStage,
    showToast,
  } = useAmbience();
  const { music } = config;
  const [copied, setCopied] = useState(false);

  const handleCopyMusicPrompt = () => {
    navigator.clipboard.writeText(drafts.musicPrompt);
    setCopied(true);
    showToast('Copied Music prompt to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isGeneratingThis = isGeneratingPrompts && (generationTarget === 'music' || generationTarget === 'all');

  const toggleMood = (mood: string) => {
    updateConfig((prev) => {
      const moods = prev.music.moods.includes(mood)
        ? prev.music.moods.filter((m) => m !== mood)
        : [...prev.music.moods, mood];
      return {
        ...prev,
        music: { ...prev.music, moods },
      };
    });
  };

  const toggleInstrument = (inst: string) => {
    updateConfig((prev) => {
      const instrumentation = prev.music.instrumentation.includes(inst)
        ? prev.music.instrumentation.filter((i) => i !== inst)
        : [...prev.music.instrumentation, inst];
      return {
        ...prev,
        music: { ...prev.music, instrumentation },
      };
    });
  };

  const toggleFoley = (foley: string) => {
    updateConfig((prev) => {
      const environmentalSoundLayers = prev.music.environmentalSoundLayers.includes(foley)
        ? prev.music.environmentalSoundLayers.filter((f) => f !== foley)
        : [...prev.music.environmentalSoundLayers, foley];
      return {
        ...prev,
        music: { ...prev.music, environmentalSoundLayers },
      };
    });
  };

  const getInfluenceExplanation = (lvl: ReferenceInfluenceLevel) => {
    switch (lvl) {
      case 'none':
        return 'No external musical references applied. Composition follows genre and mood tags alone.';
      case 'low':
        return 'Low: Use only broad genre conventions and gentle emotional atmosphere cues.';
      case 'moderate':
        return 'Moderate: Target acoustic instrumentation, tempo, mood, and arrangement pacing.';
      case 'strong':
        return 'Strong: Closely target broad musical character, acoustic color, harmony, and orchestration style.';
      case 'very-strong':
        return 'Very Strong: Maximize similarity in broad musical traits, timbre, and tempo while composing a 100% original arrangement.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Music className="w-5 h-5 text-[#E8AE62]" />
            Music & Ambient Audio Scoring
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Craft the musical score, acoustic instrumentation, tempo pacing, and foley soundscapes
          </p>
        </div>

        <button
          type="button"
          onClick={() => resetSection('music')}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-xl transition-colors border border-[#1E2B3E]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Music
        </button>
      </div>

      {/* AI Music & Foley Scoring Generator Card */}
      <div className="bg-[#101722]/90 border border-[#1E2B3E] rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8AE62]/10 border border-[#E8AE62]/30 flex items-center justify-center text-[#E8AE62]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2EEE6] font-display">
                Intelligent Music & Foley Prompt Engine
              </h3>
              <p className="text-[11px] text-[#A1AEC0]">
                Translates instrumentation, arrangement, and foley layers into Suno/Udio production prompts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPrompts}
              onClick={() => generateAiPrompts('music')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-md ${
                isGeneratingThis
                  ? 'bg-[#192434] text-[#E8AE62] border border-[#E8AE62]/50 cursor-wait'
                  : 'bg-[#E8AE62] hover:bg-[#F2BE7D] text-[#0B1018]'
              }`}
            >
              {isGeneratingThis ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E8AE62]" />
                  <span>Generating Audio Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Music Prompt with AI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyMusicPrompt}
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

        {/* Music Prompt Text Preview */}
        <div className="relative">
          <textarea
            rows={4}
            value={drafts.musicPrompt}
            onChange={(e) => updateDraft('musicPrompt', e.target.value)}
            className="w-full p-3.5 text-xs font-mono leading-relaxed bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62] focus:ring-1 focus:ring-[#E8AE62]/20"
            placeholder="Generated Suno / Udio audio prompt..."
          />
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#A1AEC0]">
            <span>Model Targets: Suno v3.5 · Udio · Ambient Sound Engine</span>
            <span className="font-mono">{drafts.musicPrompt.length} chars</span>
          </div>
        </div>
      </div>

      {/* Music Style Selector */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-3 font-mono">
          Musical Genre & Atmospheric Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {MUSIC_STYLES.map((style) => {
            const isSelected = music.style === style;

            return (
              <button
                key={style}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    music: { ...prev.music, style },
                  }))
                }
                className={`p-3 rounded-xl border text-left text-xs font-medium transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold shadow-xs'
                    : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                }`}
              >
                <span>{style}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Moods & Instrumentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Multi-Select */}
        <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-3 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AE62]" />
            Atmospheric Moods ({music.moods.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSIC_MOODS.map((mood) => {
              const isSelected = music.moods.includes(mood);

              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => toggleMood(mood)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#E8AE62]" />}
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instrumentation Multi-Select */}
        <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-3 flex items-center gap-1.5 font-mono">
            <Headphones className="w-3.5 h-3.5 text-[#E8AE62]" />
            Instrumentation ({music.instrumentation.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENTATION_OPTIONS.map((inst) => {
              const isSelected = music.instrumentation.includes(inst);

              return (
                <button
                  key={inst}
                  type="button"
                  onClick={() => toggleInstrument(inst)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#E8AE62]" />}
                  {inst}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Musical Dynamic Sliders */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 flex items-center gap-2 font-display">
          <Sliders className="w-4 h-4 text-[#E8AE62]" />
          Compositional Dynamics & Pacing
        </h3>
        <p className="text-xs text-[#A1AEC0] mb-5">
          Control melodic prominence, harmonic density, tempo, and arrangement variation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#F2EEE6] font-mono">Melodic Prominence</label>
              <span className="text-xs font-mono text-[#E8AE62]">{music.melodicProminence}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={music.melodicProminence}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  music: { ...prev.music, melodicProminence: parseInt(e.target.value) },
                }))
              }
              className="w-full accent-[#E8AE62]"
            />
            <div className="flex justify-between text-[10px] text-[#A1AEC0] mt-1">
              <span>Ambient Drone</span>
              <span>Prominent Melody</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#F2EEE6] font-mono">Rhythmic Pulse</label>
              <span className="text-xs font-mono text-[#E8AE62]">{music.rhythmicIntensity}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={music.rhythmicIntensity}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  music: { ...prev.music, rhythmicIntensity: parseInt(e.target.value) },
                }))
              }
              className="w-full accent-[#E8AE62]"
            />
            <div className="flex justify-between text-[10px] text-[#A1AEC0] mt-1">
              <span>Free / Rubato</span>
              <span>Driving Pulse</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#F2EEE6] font-mono">Instrument Density</label>
              <span className="text-xs font-mono text-[#E8AE62]">{music.instrumentDensity}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={music.instrumentDensity}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  music: { ...prev.music, instrumentDensity: parseInt(e.target.value) },
                }))
              }
              className="w-full accent-[#E8AE62]"
            />
            <div className="flex justify-between text-[10px] text-[#A1AEC0] mt-1">
              <span>Solo / Sparse</span>
              <span>Full Ensemble</span>
            </div>
          </div>
        </div>

        {/* Arrangement Variation & Tempo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#1E2B3E]">
          <div>
            <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
              Tempo Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'very-slow', label: 'Very Slow (<60)' },
                { id: 'slow-60-75', label: 'Slow (60-75)' },
                { id: 'moderate-75-90', label: 'Moderate (75-90)' },
                { id: 'relaxed-90-105', label: 'Relaxed (90-105)' },
                { id: 'ambient-free', label: 'Ambient Free' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      music: { ...prev.music, tempoRange: t.id as any },
                    }))
                  }
                  className={`p-2 rounded-lg border text-[11px] font-medium text-center transition-colors ${
                    music.tempoRange === t.id
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
              Arrangement Progression
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'hypnotic-repetitive', label: 'Hypnotic Looping Cycles' },
                { id: 'subtle-evolving', label: 'Subtle Evolving Variations' },
                { id: 'moderate-cycles', label: 'Moderate Dynamic Movement' },
                { id: 'dynamic-story', label: 'Cinematic Narrative Flow' },
              ].map((arr) => (
                <button
                  key={arr.id}
                  type="button"
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      music: { ...prev.music, arrangementVariation: arr.id as any },
                    }))
                  }
                  className={`p-2 rounded-lg border text-[11px] font-medium text-center transition-colors ${
                    music.arrangementVariation === arr.id
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {arr.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Sound Layers (Foley) */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 flex items-center gap-1.5 font-mono">
          <Volume2 className="w-3.5 h-3.5 text-[#E8AE62]" />
          Environmental Soundscapes & Foley Layers ({music.environmentalSoundLayers.length} Active)
        </label>
        <p className="text-xs text-[#A1AEC0] mb-4">
          Layer real-world organic acoustics alongside the musical score for deep immersion
        </p>
        <div className="flex flex-wrap gap-2">
          {FOLEY_SOUND_LAYERS.map((foley) => {
            const isSelected = music.environmentalSoundLayers.includes(foley);

            return (
              <button
                key={foley}
                type="button"
                onClick={() => toggleFoley(foley)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                    : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#E8AE62]" />}
                {foley}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reference Music Influence Section */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-[#F2EEE6] flex items-center gap-1.5 font-display">
              <Headphones className="w-4 h-4 text-[#E8AE62]" />
              Reference Music Influence
            </h3>
            <p className="text-xs text-[#A1AEC0] mt-0.5">
              Guide broad orchestration conventions from an inspiration track while ensuring 100% original composition
            </p>
          </div>
        </div>

        {/* Influence Level Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-4">
          {(['none', 'low', 'moderate', 'strong', 'very-strong'] as ReferenceInfluenceLevel[]).map((lvl) => {
            const isSelected = music.referenceInfluence === lvl;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    music: { ...prev.music, referenceInfluence: lvl },
                  }))
                }
                className={`p-3 rounded-xl border text-center capitalize text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold shadow-xs'
                    : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                }`}
              >
                {lvl.replace('-', ' ')}
              </button>
            );
          })}
        </div>

        {/* Reference Artist input */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5 font-mono">
            Reference Artist, Soundtrack, Composer, or Track
          </label>
          <input
            type="text"
            value={music.referenceArtistOrTrack}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                music: { ...prev.music, referenceArtistOrTrack: e.target.value },
              }))
            }
            placeholder="e.g. John Williams Hogwarts winter theme, Howard Shore Shire pastoral suites, C418 Minecraft calm"
            className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
          />
        </div>

        {/* Contextual explanation */}
        <div className="mt-4 p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl flex items-start gap-3 text-xs text-[#A1AEC0]">
          <Info className="w-4 h-4 text-[#E8AE62] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#F2EEE6]">Influence Semantics:</span>{' '}
            {getInfluenceExplanation(music.referenceInfluence)}
            <div className="mt-1 text-[11px] text-[#A1AEC0]/70">
              * Note: The prompt compiler generates guidance strictly on tempo, acoustic timbre, instrumentation and harmonic color. No copyrighted melodic sequences are copied.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
