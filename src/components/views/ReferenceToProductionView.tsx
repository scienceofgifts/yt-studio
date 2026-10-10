import React, { useState, useEffect } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { StorageService } from '../../services/storage';
import {
  AiPromptService,
  RefToProductionResult,
} from '../../services/aiPromptService';
import { ReferenceVideoLabItem } from '../../types/ambience';
import {
  Film,
  Video,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  RotateCcw,
  Edit3,
  Save,
  Send,
  ChevronRight,
  ArrowRight,
  Layers,
  Wand2,
  Compass,
  SlidersHorizontal,
  Sliders,
  Youtube,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';

interface RefToProdState {
  currentStage: 1 | 2 | 3 | 4;
  selectedLabItemId: string | null;
  customVideoUrl: string;
  creativeInterpretation: {
    subject: string;
    setting: string;
    visualStyle: string;
    mood: string;
    preserveQualities: string[];
    changeQualities: string;
    additionalInstructions: string;
  };
  openingImagePrompt: string;
  videoMotionPrompt: string;
  promptReasoning: string;
  imageModifiedAfterVideoGen: boolean;
}

const STORAGE_KEY_REF_TO_PROD = 'ambience_ref_to_prod_state';

const PRESERVE_OPTIONS = [
  'Camera Movement & framing',
  'Lighting & Color Contrast',
  'Motion Pacing & Speed',
  'Environmental Atmosphere',
  'Acoustic & Foley Layering',
];

const STYLE_OPTIONS = [
  'cinematic-realism',
  'dark academia',
  'photorealistic',
  'painterly',
  'historical realism',
  'fantasy realism',
  'vintage film',
];

const DEFAULT_STATE: RefToProdState = {
  currentStage: 1,
  selectedLabItemId: 'vlab-hogwarts-rain',
  customVideoUrl: '',
  creativeInterpretation: {
    subject: 'A medieval castle sanctuary during late autumn',
    setting: 'A stone hearth hall looking through Gothic leaded windows onto a rain-swept pine forest',
    visualStyle: 'cinematic-realism',
    mood: 'cozy, majestic, serene, atmospheric',
    preserveQualities: ['Camera Movement & framing', 'Lighting & Color Contrast'],
    changeQualities: 'Replace wizarding common room with medieval stone fortress architecture',
    additionalInstructions: 'Focus on warm hearth firelight against cold blue rain light outside',
  },
  openingImagePrompt: '',
  videoMotionPrompt: '',
  promptReasoning: '',
  imageModifiedAfterVideoGen: false,
};

export const ReferenceToProductionView: React.FC = () => {
  const { setActiveView } = useAmbience();

  // Load state
  const [state, setState] = useState<RefToProdState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REF_TO_PROD);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_STATE;
  });

  const [labItems, setLabItems] = useState<ReferenceVideoLabItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [isGeneratingImagePrompt, setIsGeneratingImagePrompt] = useState(false);
  const [isGeneratingVideoPrompt, setIsGeneratingVideoPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Edit states
  const [isEditingImagePrompt, setIsEditingImagePrompt] = useState(false);
  const [isEditingVideoPrompt, setIsEditingVideoPrompt] = useState(false);

  // Advanced options toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLabItems(StorageService.getVideoLabItems());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REF_TO_PROD, JSON.stringify(state));
    } catch {
      // Ignore
    }
  }, [state]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyText = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(tag);
    showToast('Copied to clipboard! (Line breaks preserved)');
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // Selected Lab Video Item
  const selectedLabItem = labItems.find((v) => v.id === state.selectedLabItemId) || labItems[0] || null;

  // Handle Analyzing New Video URL
  const handleAnalyzeNewVideo = async () => {
    if (!state.customVideoUrl.trim()) return;
    setIsAnalyzingVideo(true);
    setErrorMessage(null);

    try {
      const newItem = await AiPromptService.analyzeYouTubeVideo({
        url: state.customVideoUrl.trim(),
      });

      StorageService.saveVideoLabItem(newItem);
      setLabItems(StorageService.getVideoLabItems());

      setState((prev) => ({
        ...prev,
        selectedLabItemId: newItem.id,
        customVideoUrl: '',
      }));

      showToast(`Analyzed video "${newItem.title}"!`);
    } catch (err: any) {
      console.error('Error analyzing new video:', err);
      setErrorMessage(err.message || 'Failed to analyze video URL.');
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // Stage 3: Generate Opening Image Prompt
  const handleGenerateImagePrompt = async () => {
    if (isGeneratingImagePrompt) return;
    setIsGeneratingImagePrompt(true);
    setErrorMessage(null);

    try {
      const result = await AiPromptService.generateRefToProductionPrompts({
        target: 'image',
        referenceData: {
          title: selectedLabItem?.title || 'Reference Video',
          url: selectedLabItem?.url,
          aesthetic: selectedLabItem?.aesthetic,
          kinematics: selectedLabItem?.kinematics,
          acoustics: selectedLabItem?.acoustics,
          blueprint: selectedLabItem?.blueprint,
        },
        creativeInterpretation: state.creativeInterpretation,
      });

      setState((prev) => ({
        ...prev,
        openingImagePrompt: result.openingImagePrompt,
        promptReasoning: result.reasoning,
        currentStage: 3,
        imageModifiedAfterVideoGen: false,
      }));

      showToast('Opening image prompt generated!');
    } catch (err: any) {
      console.error('Error generating image prompt:', err);
      setErrorMessage(err.message || 'Failed to generate image prompt.');
    } finally {
      setIsGeneratingImagePrompt(false);
    }
  };

  // Stage 4: Generate Video Motion Prompt
  const handleGenerateVideoPrompt = async () => {
    if (!state.openingImagePrompt) {
      setErrorMessage('Please generate an Opening Image Prompt first.');
      return;
    }

    if (isGeneratingVideoPrompt) return;
    setIsGeneratingVideoPrompt(true);
    setErrorMessage(null);

    try {
      const result = await AiPromptService.generateRefToProductionPrompts({
        target: 'video',
        referenceData: {
          title: selectedLabItem?.title || 'Reference Video',
          url: selectedLabItem?.url,
          aesthetic: selectedLabItem?.aesthetic,
          kinematics: selectedLabItem?.kinematics,
          acoustics: selectedLabItem?.acoustics,
          blueprint: selectedLabItem?.blueprint,
        },
        creativeInterpretation: state.creativeInterpretation,
        existingImagePrompt: state.openingImagePrompt,
      });

      setState((prev) => ({
        ...prev,
        videoMotionPrompt: result.videoMotionPrompt,
        currentStage: 4,
        imageModifiedAfterVideoGen: false,
      }));

      showToast('Video motion prompt generated!');
    } catch (err: any) {
      console.error('Error generating video prompt:', err);
      setErrorMessage(err.message || 'Failed to generate video motion prompt.');
    } finally {
      setIsGeneratingVideoPrompt(false);
    }
  };

  // Send Image Prompt to Quick Image Prompt Studio
  const handleSendToQuickPrompts = () => {
    try {
      const quickState = {
        startingPoint: 'idea',
        selectedReferenceId: null,
        customReference: null,
        referenceInstructions: '',
        idea: {
          subject: state.creativeInterpretation.subject,
          setting: state.creativeInterpretation.setting,
          mood: state.creativeInterpretation.mood,
          constraints: 'Uninhabited, no people or face morphing',
        },
        aspectRatio: '16:9',
        activePromptResult: {
          prompt: state.openingImagePrompt,
          reasoning: state.promptReasoning,
        },
        variationLevel: 'balanced',
        variationCount: 4,
        variationInstructions: '',
        variations: [],
      };

      localStorage.setItem('ambience_quick_prompt_studio_state', JSON.stringify(quickState));
      showToast('Opening Image Prompt sent to Quick Image Prompts!');
      setTimeout(() => setActiveView('quick-prompts'), 500);
    } catch {
      showToast('Failed to send to Quick Image Prompts.');
    }
  };

  // Save Complete Production Project
  const handleSaveProject = () => {
    try {
      StorageService.addHistoryEntry({
        projectName: state.creativeInterpretation.subject || selectedLabItem?.title || 'Production Workflow',
        type: 'bundle',
        promptText: `--- OPENING IMAGE PROMPT ---\n${state.openingImagePrompt}\n\n--- VIDEO MOTION PROMPT ---\n${state.videoMotionPrompt}`,
        notes: `Reference to Production Workflow (${selectedLabItem?.title || 'Reference'})`,
      });
      showToast('Saved complete production project to history!');
    } catch {
      showToast('Failed to save project.');
    }
  };

  // Toggle preserve options
  const togglePreserveOption = (opt: string) => {
    setState((prev) => {
      const current = prev.creativeInterpretation.preserveQualities;
      const next = current.includes(opt)
        ? current.filter((item) => item !== opt)
        : [...current, opt];
      return {
        ...prev,
        creativeInterpretation: {
          ...prev.creativeInterpretation,
          preserveQualities: next,
        },
      };
    });
  };

  const filteredLabItems = labItems.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E2B3E] text-[#F2EEE6] border border-[#A78BFA] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#A78BFA] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#101722] via-[#1C1830] to-[#101722] border border-[#1E2B3E] rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A78BFA]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA]">
              <Film className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2EEE6] font-display tracking-wide">
              Reference to Production
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20 uppercase">
              Phase 3 - Guided Workflow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A1AEC0] max-w-2xl">
            Transform reference video mechanics into an original creative concept, a detailed opening image prompt, and an aligned video motion prompt.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('video-lab')}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#283952] transition-colors flex items-center gap-1.5"
          >
            <Youtube className="w-3.5 h-3.5 text-[#F87171]" />
            <span>Open Video Lab</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-[#2A1215] border border-[#F87171]/40 rounded-xl text-xs text-[#F87171] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Workflow Error</p>
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

      {/* 4-Stage Workflow Progress Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-[#101722] border border-[#1E2B3E] rounded-2xl">
        {[
          { num: 1, title: '1. Select Reference', sub: selectedLabItem ? selectedLabItem.title : 'Choose video' },
          { num: 2, title: '2. Interpretation', sub: state.creativeInterpretation.subject || 'Define concept' },
          { num: 3, title: '3. Image Prompt', sub: state.openingImagePrompt ? 'Generated' : 'Pending' },
          { num: 4, title: '4. Video Prompt', sub: state.videoMotionPrompt ? 'Generated' : 'Pending' },
        ].map((step) => {
          const isActive = state.currentStage === step.num;
          const isDone = state.currentStage > step.num || (step.num === 3 && state.openingImagePrompt) || (step.num === 4 && state.videoMotionPrompt);

          return (
            <button
              key={step.num}
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, currentStage: step.num as any }))
              }
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isActive
                  ? 'bg-[#192434] border-[#A78BFA] text-[#F2EEE6] shadow-sm font-semibold'
                  : isDone
                  ? 'bg-[#0B1018] border-[#283952] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0]/60 hover:text-[#A1AEC0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display">{step.title}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8]" />}
              </div>
              <p className="text-[10px] text-[#A1AEC0] truncate mt-0.5">
                {step.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* STAGE 1: SELECT & ANALYZE REFERENCE VIDEO */}
      {state.currentStage === 1 && (
        <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E2B3E] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#F2EEE6] font-display flex items-center gap-2">
                <Youtube className="w-4 h-4 text-[#F87171]" />
                <span>Stage 1: Select Reference Video</span>
              </h2>
              <p className="text-xs text-[#A1AEC0]">
                Choose an analyzed video from your Reference Video Lab or analyze a new YouTube link
              </p>
            </div>

            {/* Analyze New URL Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={state.customVideoUrl}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, customVideoUrl: e.target.value }))
                }
                placeholder="Analyze new YouTube URL..."
                className="px-3 py-1.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#A78BFA] w-64"
              />
              <button
                type="button"
                onClick={handleAnalyzeNewVideo}
                disabled={isAnalyzingVideo || !state.customVideoUrl.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#A78BFA] text-[#0B1018] text-xs font-semibold hover:bg-[#c4b5fd] disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1"
              >
                {isAnalyzingVideo ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>Analyze</span>
              </button>
            </div>
          </div>

          {/* Active Reference Selected Detail */}
          {selectedLabItem && (
            <div className="p-4 bg-[#152030] border border-[#A78BFA]/40 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-48 h-28 rounded-xl bg-[#0B1018] overflow-hidden shrink-0 border border-[#283952] relative">
                  <img
                    src={selectedLabItem.thumbnailUrl}
                    alt={selectedLabItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#F2EEE6]">
                    {selectedLabItem.duration || 'Video Reference'}
                  </div>
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F2EEE6] font-display truncate">
                      {selectedLabItem.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 shrink-0">
                      {selectedLabItem.matchConfidence || 95}% Match
                    </span>
                  </div>

                  <p className="text-xs text-[#A1AEC0] line-clamp-2">
                    {selectedLabItem.notes || selectedLabItem.blueprint?.directorVision}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#A1AEC0] pt-1">
                    <div>
                      <strong className="text-[#F2EEE6]">World:</strong>{' '}
                      {selectedLabItem.aesthetic?.worldArchetype}
                    </div>
                    <div>
                      <strong className="text-[#F2EEE6]">Camera:</strong>{' '}
                      {selectedLabItem.kinematics?.cameraBehavior}
                    </div>
                    <div>
                      <strong className="text-[#F2EEE6]">Pacing:</strong>{' '}
                      {selectedLabItem.kinematics?.motionPacing}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reference List Selector */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A1AEC0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference video lab..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#A78BFA]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {filteredLabItems.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, selectedLabItemId: v.id }))
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    state.selectedLabItemId === v.id
                      ? 'bg-[#192434] border-[#A78BFA] shadow-sm'
                      : 'bg-[#0B1018] border-[#1E2B3E] hover:border-[#283952]'
                  }`}
                >
                  <div className="w-14 h-10 rounded-lg bg-[#192434] overflow-hidden shrink-0 border border-[#283952]">
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#F2EEE6] truncate">
                      {v.title}
                    </div>
                    <div className="text-[10px] text-[#A1AEC0] truncate">
                      {v.aesthetic?.worldArchetype || 'Video Reference'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stage 1 Continue Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, currentStage: 2 }))}
              className="py-2.5 px-5 rounded-xl text-xs font-semibold text-[#0B1018] bg-[#A78BFA] hover:bg-[#c4b5fd] transition-all flex items-center gap-2 shadow-md"
            >
              <span>Continue to Creative Interpretation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: DEFINE CREATIVE INTERPRETATION */}
      {state.currentStage === 2 && (
        <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#F2EEE6] font-display flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#A78BFA]" />
                <span>Stage 2: Define Creative Interpretation</span>
              </h2>
              <p className="text-xs text-[#A1AEC0]">
                Preserve core camera & atmospheric techniques while developing a brand new scene
              </p>
            </div>

            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, currentStage: 1 }))}
              className="text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
            >
              Back to Reference
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Subject / Concept */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F2EEE6]">
                New Subject or Concept <span className="text-[#F87171]">*</span>
              </label>
              <textarea
                rows={2}
                value={state.creativeInterpretation.subject}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    creativeInterpretation: {
                      ...prev.creativeInterpretation,
                      subject: e.target.value,
                    },
                  }))
                }
                placeholder="Describe your primary new subject or scene..."
                className="w-full p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#A78BFA] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Setting */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A1AEC0]">
                  New Setting / Environment <span className="text-[10px] opacity-70">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={state.creativeInterpretation.setting}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      creativeInterpretation: {
                        ...prev.creativeInterpretation,
                        setting: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Japanese tea house in winter"
                  className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              {/* Visual Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A1AEC0]">
                  Visual Style
                </label>
                <select
                  value={state.creativeInterpretation.visualStyle}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      creativeInterpretation: {
                        ...prev.creativeInterpretation,
                        visualStyle: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] focus:outline-none focus:border-[#A78BFA]"
                >
                  {STYLE_OPTIONS.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preserve Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-[#A1AEC0] block">
                What to Preserve from Reference Video:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESERVE_OPTIONS.map((opt) => {
                  const isSelected = state.creativeInterpretation.preserveQualities.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePreserveOption(opt)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 text-xs ${
                        isSelected
                          ? 'bg-[#192434] border-[#A78BFA] text-[#F2EEE6]'
                          : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#A78BFA] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A1AEC0] shrink-0" />
                      )}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What to Change */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1AEC0]">
                What to Change / Replace <span className="text-[10px] opacity-70">(Optional)</span>
              </label>
              <input
                type="text"
                value={state.creativeInterpretation.changeQualities}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    creativeInterpretation: {
                      ...prev.creativeInterpretation,
                      changeQualities: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. Replace modern city architecture with ancient stone fortress"
                className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#A78BFA]"
              />
            </div>

            {/* Additional Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1AEC0]">
                Additional Instructions / Creative Constraints <span className="text-[10px] opacity-70">(Optional)</span>
              </label>
              <input
                type="text"
                value={state.creativeInterpretation.additionalInstructions}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    creativeInterpretation: {
                      ...prev.creativeInterpretation,
                      additionalInstructions: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. Emphasize warm fireplace glow vs cold blue rain outside"
                className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#A78BFA]"
              />
            </div>
          </div>

          {/* Stage 2 Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, currentStage: 1 }))}
              className="px-4 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleGenerateImagePrompt}
              disabled={isGeneratingImagePrompt}
              className="py-2.5 px-6 rounded-xl text-xs font-bold text-[#0B1018] bg-[#A78BFA] hover:bg-[#c4b5fd] disabled:opacity-50 transition-all flex items-center gap-2 shadow-md"
            >
              {isGeneratingImagePrompt ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Opening Image Prompt...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Opening Image Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3 & 4: GENERATED PROMPTS UNIFIED VIEW */}
      {(state.currentStage === 3 || state.currentStage === 4) && (
        <div className="space-y-6">
          {/* Modified Warning Banner */}
          {state.imageModifiedAfterVideoGen && (
            <div className="p-3 bg-[#2A1E10] border border-[#E8AE62]/50 rounded-xl text-xs text-[#E8AE62] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Opening image prompt was modified after video motion prompt was created. Re-generate video prompt to maintain alignment.</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateVideoPrompt}
                className="px-2.5 py-1 rounded-lg bg-[#E8AE62] text-[#0B1018] font-bold text-[10px] shrink-0"
              >
                Re-Align Video
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Opening Image Prompt */}
            <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 space-y-4 shadow-md relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                    <h3 className="text-sm font-bold text-[#F2EEE6] font-display">
                      1. Opening Image Prompt
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingImagePrompt(!isEditingImagePrompt)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#283952]"
                    >
                      {isEditingImagePrompt ? 'Done' : 'Edit'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyText(state.openingImagePrompt, 'image-prompt')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#38BDF8] text-[#0B1018] hover:bg-[#7dd3fc]"
                    >
                      {copiedTag === 'image-prompt' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {isEditingImagePrompt ? (
                  <textarea
                    rows={8}
                    value={state.openingImagePrompt}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        openingImagePrompt: e.target.value,
                        imageModifiedAfterVideoGen: Boolean(prev.videoMotionPrompt),
                      }))
                    }
                    className="w-full p-3 bg-[#0B1018] border border-[#38BDF8]/40 rounded-xl text-xs font-mono text-[#F2EEE6] leading-relaxed focus:outline-none resize-y custom-scrollbar"
                  />
                ) : (
                  <div className="p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs font-mono text-[#F2EEE6] leading-relaxed whitespace-pre-wrap select-text border-l-4 border-l-[#38BDF8] max-h-80 overflow-y-auto custom-scrollbar">
                    {state.openingImagePrompt || 'Image prompt pending generation...'}
                  </div>
                )}
              </div>

              {/* Card 1 Footer Actions */}
              <div className="pt-3 border-t border-[#1E2B3E] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleSendToQuickPrompts}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#152030] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Create Variations</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateImagePrompt}
                  disabled={isGeneratingImagePrompt}
                  className="text-xs text-[#A1AEC0] hover:text-[#F2EEE6] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Card 2: Video Motion Prompt */}
            <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 space-y-4 shadow-md relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-3">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#A78BFA]" />
                    <h3 className="text-sm font-bold text-[#F2EEE6] font-display">
                      2. Video Motion Prompt
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {state.videoMotionPrompt && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingVideoPrompt(!isEditingVideoPrompt)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#283952]"
                        >
                          {isEditingVideoPrompt ? 'Done' : 'Edit'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(state.videoMotionPrompt, 'video-prompt')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#A78BFA] text-[#0B1018] hover:bg-[#c4b5fd]"
                        >
                          {copiedTag === 'video-prompt' ? 'Copied!' : 'Copy'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {state.videoMotionPrompt ? (
                  isEditingVideoPrompt ? (
                    <textarea
                      rows={8}
                      value={state.videoMotionPrompt}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          videoMotionPrompt: e.target.value,
                        }))
                      }
                      className="w-full p-3 bg-[#0B1018] border border-[#A78BFA]/40 rounded-xl text-xs font-mono text-[#F2EEE6] leading-relaxed focus:outline-none resize-y custom-scrollbar"
                    />
                  ) : (
                    <div className="p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs font-mono text-[#F2EEE6] leading-relaxed whitespace-pre-wrap select-text border-l-4 border-l-[#A78BFA] max-h-80 overflow-y-auto custom-scrollbar">
                      {state.videoMotionPrompt}
                    </div>
                  )
                ) : (
                  <div className="p-8 bg-[#0B1018] border border-[#1E2B3E] border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-3 min-h-[180px]">
                    <Film className="w-6 h-6 text-[#A78BFA]" />
                    <p className="text-xs text-[#A1AEC0]">
                      Click below to synthesize the video motion prompt aligned with your opening image.
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateVideoPrompt}
                      disabled={isGeneratingVideoPrompt}
                      className="py-2 px-4 bg-[#A78BFA] text-[#0B1018] rounded-xl text-xs font-bold hover:bg-[#c4b5fd] flex items-center gap-1.5"
                    >
                      {isGeneratingVideoPrompt ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                      <span>Generate Video Motion Prompt</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card 2 Footer Actions */}
              {state.videoMotionPrompt && (
                <div className="pt-3 border-t border-[#1E2B3E] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `--- OPENING IMAGE PROMPT ---\n${state.openingImagePrompt}\n\n--- VIDEO MOTION PROMPT ---\n${state.videoMotionPrompt}`,
                        'bundle'
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#152030] hover:bg-[#192434] text-[#F2EEE6] border border-[#1E2B3E] flex items-center gap-1.5"
                  >
                    {copiedTag === 'bundle' ? (
                      <Check className="w-3.5 h-3.5 text-[#38BDF8]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#E8AE62]" />
                    )}
                    <span>Copy Both Prompts</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateVideoPrompt}
                    disabled={isGeneratingVideoPrompt}
                    className="text-xs text-[#A1AEC0] hover:text-[#F2EEE6] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate Video</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Bottom Control Bar */}
          <div className="p-4 bg-[#101722] border border-[#1E2B3E] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, currentStage: 2 }))}
                className="px-3 py-1.5 rounded-xl text-xs text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#152030] border border-[#1E2B3E]"
              >
                Refine Interpretation
              </button>

              <button
                type="button"
                onClick={() =>
                  setState({
                    ...DEFAULT_STATE,
                    currentStage: 1,
                  })
                }
                className="px-3 py-1.5 rounded-xl text-xs text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#152030] border border-[#1E2B3E]"
              >
                Start New Workflow
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveProject}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E8AE62] text-[#0B1018] hover:bg-[#f3be7a] flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Complete Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
