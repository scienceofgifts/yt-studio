import React, { useState, useEffect } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { StorageService } from '../../services/storage';
import {
  AiPromptService,
  IdeaCardItem,
  DevelopedIdeaBlueprint,
} from '../../services/aiPromptService';
import {
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Check,
  Heart,
  Trash2,
  Sliders,
  Send,
  Wand2,
  Bookmark,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  RefreshCw,
  Compass,
  Layers,
  ArrowRight,
  Flame,
  Info,
} from 'lucide-react';

interface IdeaGeneratorState {
  topic: string;
  creativeObjective: string;
  additionalInstructions: string;
  // Advanced controls
  count: number;
  creativeDirection: string;
  originality: string;
  productionComplexity: string;
  // Generated Ideas & History
  ideas: IdeaCardItem[];
  developedBlueprints: Record<string, DevelopedIdeaBlueprint>;
  activeDevelopedId: string | null;
}

const STORAGE_KEY_IDEA_GENERATOR = 'ambience_idea_generator_state';

const CREATIVE_OBJECTIVES = [
  'Generate ambience video concepts',
  'Explore new environments and worlds',
  'Discover unusual visual combinations',
  'Develop ideas from a reference or existing concept',
  'Generate ideas for a particular niche',
  'Explore freely',
];

const QUICK_TOPIC_PRESETS = [
  'Cozy Rain Sanctuary',
  'Dark Academia Library',
  'Ancient Roman Villa',
  'Rainy Cyberpunk Apartment',
  'Gothic Fantasy Tavern',
  'Winter Mountain Cabin',
];

const DEFAULT_STATE: IdeaGeneratorState = {
  topic: 'Cozy autumn sanctuary with rain and fireplace',
  creativeObjective: 'Generate ambience video concepts',
  additionalInstructions: '',
  count: 10,
  creativeDirection: 'A balanced mixture',
  originality: 'Fresh and unexpected',
  productionComplexity: 'Moderate',
  ideas: [],
  developedBlueprints: {},
  activeDevelopedId: null,
};

export const IdeaGeneratorView: React.FC = () => {
  const { setActiveView } = useAmbience();

  // Load state from local storage or default
  const [state, setState] = useState<IdeaGeneratorState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_IDEA_GENERATOR);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_STATE;
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [developingId, setDevelopingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Refine modal / input state
  const [refineIdeaId, setRefineIdeaId] = useState<string | null>(null);
  const [refineInstructions, setRefineInstructions] = useState('');

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IDEA_GENERATOR, JSON.stringify(state));
    } catch {
      // Ignore
    }
  }, [state]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyText = (text: string, idTag: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idTag);
    showToast('Copied to clipboard! (Formatting preserved)');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate Ideas Action
  const handleGenerateIdeas = async (
    overrideFeedback?: string,
    refIdea?: IdeaCardItem
  ) => {
    if (!state.topic.trim()) {
      setErrorMessage('Please enter a topic or starting point to generate ideas.');
      return;
    }

    if (isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const previousTitles = state.ideas.map((i) => i.title);

      const result = await AiPromptService.generateIdeas({
        topic: state.topic,
        creativeObjective: state.creativeObjective,
        additionalInstructions: state.additionalInstructions,
        count: state.count,
        creativeDirection: state.creativeDirection,
        originality: state.originality,
        productionComplexity: state.productionComplexity,
        previousIdeas: previousTitles,
        feedbackDirective: overrideFeedback,
        referenceIdea: refIdea,
      });

      setState((prev) => ({
        ...prev,
        ideas: result.ideas,
      }));

      showToast(`Generated ${result.ideas.length} creative ideas!`);
    } catch (err: any) {
      console.error('Error generating ideas:', err);
      setErrorMessage(err.message || 'Failed to generate ideas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Develop Single Idea Card
  const handleDevelopIdea = async (idea: IdeaCardItem) => {
    if (developingId === idea.id) return;
    setDevelopingId(idea.id);
    setErrorMessage(null);

    try {
      const result = await AiPromptService.developIdea({ idea });

      setState((prev) => ({
        ...prev,
        developedBlueprints: {
          ...prev.developedBlueprints,
          [idea.id]: result.developedBlueprint,
        },
        activeDevelopedId: idea.id,
      }));

      showToast(`Developed production blueprint for "${idea.title}"!`);
    } catch (err: any) {
      console.error('Error developing idea:', err);
      setErrorMessage(err.message || 'Failed to develop blueprint for this idea.');
    } finally {
      setDevelopingId(null);
    }
  };

  // Create Image Prompt (Sends concept to Quick Image Prompt Studio)
  const handleCreateImagePrompt = (idea: IdeaCardItem) => {
    try {
      const quickState = {
        startingPoint: 'idea',
        selectedReferenceId: null,
        customReference: null,
        referenceInstructions: '',
        idea: {
          subject: idea.suggestedSubject || idea.title,
          setting: idea.suggestedSetting || idea.settingAndAtmosphere,
          mood: idea.suggestedMood || idea.coreConcept,
          constraints: idea.suggestedConstraints || 'Uninhabited, no people or faces',
        },
        aspectRatio: '16:9',
        activePromptResult: null,
        variationLevel: 'balanced',
        variationCount: 4,
        variationInstructions: '',
        variations: [],
      };

      localStorage.setItem('ambience_quick_prompt_studio_state', JSON.stringify(quickState));
      showToast(`Transferring "${idea.title}" to Quick Image Prompts...`);
      setTimeout(() => {
        setActiveView('quick-prompts');
      }, 500);
    } catch {
      showToast('Could not send idea to Quick Image Prompts.');
    }
  };

  // Save Idea to Storage History
  const handleSaveIdea = (idea: IdeaCardItem) => {
    try {
      StorageService.addHistoryEntry({
        projectName: idea.title,
        type: 'bundle',
        promptText: `TITLE: ${idea.title}\nCORE CONCEPT: ${idea.coreConcept}\nVISUAL HOOK: ${idea.visualHook}\nSETTING & ATMOSPHERE: ${idea.settingAndAtmosphere}\nWHY IT WORKS: ${idea.whyItWorks}\nPRODUCTION APPROACH: ${idea.productionApproach}`,
        notes: `Idea Generator (${state.topic})`,
      });
      showToast(`Saved "${idea.title}" to Prompt History!`);
    } catch {
      showToast('Failed to save idea.');
    }
  };

  // Favorite / Reject Toggles
  const handleToggleFavorite = (id: string) => {
    setState((prev) => ({
      ...prev,
      ideas: prev.ideas.map((i) =>
        i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
      ),
    }));
  };

  const handleDismissIdea = (id: string) => {
    setState((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((i) => i.id !== id),
    }));
    showToast('Idea dismissed.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E2B3E] text-[#F2EEE6] border border-[#E8AE62] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#E8AE62] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#101722] via-[#1A2536] to-[#101722] border border-[#1E2B3E] rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8AE62]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8AE62]/10 border border-[#E8AE62]/20 text-[#E8AE62]">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2EEE6] font-display tracking-wide">
              Idea Generator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-[#E8AE62]/10 text-[#E8AE62] border border-[#E8AE62]/20 uppercase">
              Phase 2 - Creative Ideation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A1AEC0] max-w-2xl">
            Discover distinctive, intelligent visual concepts for ambience videos and creative worlds without generic lists or repetitive tropes.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('quick-prompts')}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#283952] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Quick Image Prompts</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-[#2A1215] border border-[#F87171]/40 rounded-xl text-xs text-[#F87171] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Ideation Error</p>
            <p className="text-[#F87171]/90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-[#F87171]/70 hover:text-[#F87171]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Input Controls Form */}
      <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          {/* Preset Topics */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] font-mono uppercase text-[#A1AEC0]/70 shrink-0">Presets:</span>
            {QUICK_TOPIC_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  setState((prev) => ({ ...prev, topic: preset }))
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                  state.topic === preset
                    ? 'bg-[#E8AE62]/10 text-[#E8AE62] border-[#E8AE62]/40 font-semibold'
                    : 'bg-[#0B1018] text-[#A1AEC0] border-[#1E2B3E] hover:text-[#F2EEE6]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Topic Input (7 Cols) */}
            <div className="md:col-span-7 space-y-1.5">
              <label className="text-xs font-semibold text-[#F2EEE6] flex items-center justify-between">
                <span>Topic or Starting Point <span className="text-[#F87171]">*</span></span>
                <span className="text-[10px] text-[#A1AEC0]/70 font-normal">Broad topics or specific concepts</span>
              </label>
              <input
                type="text"
                value={state.topic}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, topic: e.target.value }))
                }
                placeholder="e.g. Roman villa during rain, magical library, ancient forest tavern..."
                className="w-full px-4 py-2.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
              />
            </div>

            {/* Creative Objective (5 Cols) */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-[#F2EEE6]">
                Creative Objective
              </label>
              <select
                value={state.creativeObjective}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, creativeObjective: e.target.value }))
                }
                className="w-full px-3 py-2.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
              >
                {CREATIVE_OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Instructions Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A1AEC0] flex items-center justify-between">
              <span>Additional Instructions / Preferences <span className="text-[10px] opacity-70">(Optional)</span></span>
              <span className="text-[10px] text-[#A1AEC0]/70">Specific constraints or directions</span>
            </label>
            <input
              type="text"
              value={state.additionalInstructions}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  additionalInstructions: e.target.value,
                }))
              }
              placeholder="e.g., Focus on warm candle lighting, avoid sci-fi technology, emphasize nature sounds"
              className="w-full px-4 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
            />
          </div>
        </div>

        {/* Collapsible Advanced Controls Header */}
        <div className="pt-2 border-t border-[#1E2B3E]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-[#A1AEC0] hover:text-[#F2EEE6] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#E8AE62]" />
            <span>Advanced Ideation Controls</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Collapsible Advanced Options Grid */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-2 animate-in fade-in duration-200">
              {/* 1. Number of Ideas */}
              <div className="space-y-1.5 p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
                <label className="text-[11px] font-mono uppercase text-[#A1AEC0] block">
                  Number of Ideas
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, count: num }))}
                      className={`py-1 text-xs font-mono rounded transition-all ${
                        state.count === num
                          ? 'bg-[#E8AE62]/20 text-[#E8AE62] font-bold border border-[#E8AE62]/40'
                          : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Creative Direction */}
              <div className="space-y-1.5 p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
                <label className="text-[11px] font-mono uppercase text-[#A1AEC0] block">
                  Creative Direction
                </label>
                <select
                  value={state.creativeDirection}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, creativeDirection: e.target.value }))
                  }
                  className="w-full bg-transparent text-xs text-[#F2EEE6] focus:outline-none"
                >
                  <option value="A balanced mixture">Balanced Mixture</option>
                  <option value="Distinctive and original">Distinctive & Original</option>
                  <option value="Unusual and experimental">Unusual & Experimental</option>
                  <option value="Practical and production-friendly">Practical & Production-Friendly</option>
                </select>
              </div>

              {/* 3. Originality */}
              <div className="space-y-1.5 p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
                <label className="text-[11px] font-mono uppercase text-[#A1AEC0] block">
                  Originality Level
                </label>
                <select
                  value={state.originality}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, originality: e.target.value }))
                  }
                  className="w-full bg-transparent text-xs text-[#F2EEE6] focus:outline-none"
                >
                  <option value="Fresh and unexpected">Fresh & Unexpected</option>
                  <option value="Familiar but well-executed">Familiar & Well-Executed</option>
                  <option value="Highly unconventional">Highly Unconventional</option>
                </select>
              </div>

              {/* 4. Production Complexity */}
              <div className="space-y-1.5 p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
                <label className="text-[11px] font-mono uppercase text-[#A1AEC0] block">
                  Complexity
                </label>
                <select
                  value={state.productionComplexity}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, productionComplexity: e.target.value }))
                  }
                  className="w-full bg-transparent text-xs text-[#F2EEE6] focus:outline-none"
                >
                  <option value="Moderate">Moderate Complexity</option>
                  <option value="Simple">Simple / Fast</option>
                  <option value="Ambitious">Ambitious / High Detail</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Generate Primary Button */}
        <button
          type="button"
          onClick={() => handleGenerateIdeas()}
          disabled={isGenerating}
          className="w-full py-3.5 px-6 rounded-xl text-xs font-bold text-[#0B1018] bg-[#E8AE62] hover:bg-[#f3be7a] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Architecting {state.count} Creative Concepts...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate {state.count} Creative Ideas</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Ideas Workspace Grid */}
      {state.ideas.length > 0 && (
        <div className="space-y-6">
          {/* Section Header & Feedback Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B3E] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F2EEE6] font-display flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#E8AE62]" />
                <span>Generated Concepts ({state.ideas.length})</span>
              </h2>
              <p className="text-xs text-[#A1AEC0]">
                Explore, refine, or send concepts directly to Quick Image Prompts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGenerateIdeas('more_like_this')}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#152030] hover:bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#E8AE62]" />
                <span>More Like These</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateIdeas('something_different')}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#152030] hover:bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Something Different</span>
              </button>
            </div>
          </div>

          {/* Cards Grid (2 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.ideas.map((idea, index) => {
              const developedBlueprint = state.developedBlueprints[idea.id];
              const isDeveloping = developingId === idea.id;

              return (
                <div
                  key={idea.id || index}
                  className={`bg-[#101722] border rounded-2xl p-5 space-y-4 shadow-md transition-all relative flex flex-col justify-between ${
                    idea.isFavorite
                      ? 'border-[#E8AE62] bg-[#152030]/60'
                      : 'border-[#1E2B3E] hover:border-[#283952]'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Card Top Banner */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#192434] border border-[#283952] text-[10px] font-mono text-[#E8AE62] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <h3 className="text-sm font-bold text-[#F2EEE6] font-display truncate">
                            {idea.title}
                          </h3>
                        </div>
                        <p className="text-xs text-[#A1AEC0] leading-snug">
                          {idea.coreConcept}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(idea.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            idea.isFavorite
                              ? 'text-[#E8AE62] bg-[#E8AE62]/10'
                              : 'text-[#A1AEC0] hover:text-[#E8AE62] hover:bg-[#192434]'
                          }`}
                          title="Favorite Idea"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              idea.isFavorite ? 'fill-[#E8AE62]' : ''
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDismissIdea(idea.id)}
                          className="p-1.5 rounded-lg text-[#A1AEC0] hover:text-[#F87171] hover:bg-[#2A1215] transition-colors"
                          title="Dismiss Idea"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Hook Box */}
                    <div className="p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#E8AE62] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Visual Hook</span>
                      </div>
                      <p className="text-xs text-[#F2EEE6] leading-normal">
                        {idea.visualHook}
                      </p>
                    </div>

                    {/* Setting & Atmosphere */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#A1AEC0] tracking-wider block">
                        Setting & Atmosphere:
                      </span>
                      <p className="text-xs text-[#A1AEC0] leading-relaxed">
                        {idea.settingAndAtmosphere}
                      </p>
                    </div>

                    {/* Why It Works & Production Approach */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 bg-[#152030]/40 border border-[#1E2B3E] rounded-lg space-y-0.5">
                        <span className="text-[9px] font-mono uppercase text-[#38BDF8] font-semibold block">
                          Why It Works:
                        </span>
                        <p className="text-[11px] text-[#A1AEC0] leading-tight">
                          {idea.whyItWorks}
                        </p>
                      </div>

                      <div className="p-2.5 bg-[#152030]/40 border border-[#1E2B3E] rounded-lg space-y-0.5">
                        <span className="text-[9px] font-mono uppercase text-[#E8AE62] font-semibold block">
                          Production Approach:
                        </span>
                        <p className="text-[11px] text-[#A1AEC0] leading-tight">
                          {idea.productionApproach}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Developed Blueprint View if present */}
                    {developedBlueprint && (
                      <div className="p-4 bg-[#0B1018] border border-[#38BDF8]/40 rounded-xl space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-2">
                          <span className="text-xs font-bold text-[#38BDF8] font-display flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Developed Production Blueprint</span>
                          </span>
                          <span className="text-[10px] font-mono text-[#A1AEC0]">
                            Full Breakdown
                          </span>
                        </div>

                        <p className="text-xs text-[#F2EEE6]">
                          {developedBlueprint.expandedVision}
                        </p>

                        <div className="space-y-2 text-[11px] text-[#A1AEC0]">
                          <div>
                            <strong className="text-[#F2EEE6]">Spatial Layout:</strong>{' '}
                            {developedBlueprint.spatialLayout}
                          </div>
                          <div>
                            <strong className="text-[#F2EEE6]">Lighting:</strong>{' '}
                            {developedBlueprint.lightingDynamics}
                          </div>
                          <div>
                            <strong className="text-[#F2EEE6]">Soundscape:</strong>{' '}
                            {developedBlueprint.soundscapeArchitecture}
                          </div>
                          <div>
                            <strong className="text-[#F2EEE6]">Motion & Loop:</strong>{' '}
                            {developedBlueprint.motionAndLooping}
                          </div>
                        </div>

                        {developedBlueprint.recommendedPromptDraft && (
                          <div className="p-2.5 bg-[#101722] border border-[#1E2B3E] rounded-lg text-[10px] font-mono text-[#38BDF8]">
                            {developedBlueprint.recommendedPromptDraft}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-3 border-t border-[#1E2B3E] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Develop Button */}
                      <button
                        type="button"
                        onClick={() => handleDevelopIdea(idea)}
                        disabled={isDeveloping}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#152030] hover:bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors flex items-center gap-1"
                      >
                        {isDeveloping ? (
                          <RotateCcw className="w-3 h-3 animate-spin text-[#38BDF8]" />
                        ) : (
                          <Layers className="w-3 h-3 text-[#38BDF8]" />
                        )}
                        <span>{developedBlueprint ? 'Re-Develop' : 'Develop'}</span>
                      </button>

                      {/* Explore Variations */}
                      <button
                        type="button"
                        onClick={() => handleGenerateIdeas('more_like_this', idea)}
                        disabled={isGenerating}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#152030] hover:bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors flex items-center gap-1"
                        title="Generate variations of this concept"
                      >
                        <RefreshCw className="w-3 h-3 text-[#E8AE62]" />
                        <span>Variations</span>
                      </button>

                      {/* Copy Idea Card Text */}
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            `TITLE: ${idea.title}\nCORE CONCEPT: ${idea.coreConcept}\nVISUAL HOOK: ${idea.visualHook}\nSETTING & ATMOSPHERE: ${idea.settingAndAtmosphere}\nWHY IT WORKS: ${idea.whyItWorks}\nPRODUCTION APPROACH: ${idea.productionApproach}`,
                            `card-${index}`
                          )
                        }
                        className="p-1.5 rounded-lg text-[#A1AEC0] hover:text-[#F2EEE6] transition-colors"
                        title="Copy Idea Card"
                      >
                        {copiedId === `card-${index}` ? (
                          <Check className="w-3.5 h-3.5 text-[#38BDF8]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveIdea(idea)}
                        className="p-1.5 rounded-lg text-[#A1AEC0] hover:text-[#E8AE62] transition-colors"
                        title="Save to History"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Send to Quick Image Prompts */}
                    <button
                      type="button"
                      onClick={() => handleCreateImagePrompt(idea)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E8AE62] text-[#0B1018] hover:bg-[#f3be7a] transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create Image Prompt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
