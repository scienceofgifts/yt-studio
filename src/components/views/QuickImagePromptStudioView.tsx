import React, { useState, useEffect } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { StorageService } from '../../services/storage';
import { AiPromptService, QuickImagePromptResult, PromptVariationItem } from '../../services/aiPromptService';
import { ReferenceItem } from '../../types/ambience';
import {
  Sparkles,
  Bookmark,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Wand2,
  Image as ImageIcon,
  Layers,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  Send,
  HelpCircle,
  X,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Eye,
  Info,
} from 'lucide-react';

interface QuickPromptState {
  startingPoint: 'reference' | 'idea';
  selectedReferenceId: string | null;
  customReference: {
    title: string;
    imageUrl: string;
    mimeType: string;
    notes: string;
  } | null;
  referenceInstructions: string;
  idea: {
    subject: string;
    setting: string;
    mood: string;
    constraints: string;
  };
  aspectRatio: string;
  // Results
  activePromptResult: QuickImagePromptResult | null;
  variationLevel: 'subtle' | 'balanced' | 'bold';
  variationCount: number;
  variationInstructions: string;
  variations: PromptVariationItem[];
}

const STORAGE_KEY_QUICK_PROMPT = 'ambience_quick_prompt_studio_state';

const DEFAULT_STATE: QuickPromptState = {
  startingPoint: 'reference',
  selectedReferenceId: null,
  customReference: null,
  referenceInstructions: '',
  idea: {
    subject: 'A serene rainy sanctuary with a warm crackling stone fireplace and antique timber bookshelves',
    setting: 'Cozy interior looking out through large Gothic arched glass windows onto a stormy autumn forest',
    mood: 'Warm amber firelight contrasting cold cobalt storm light, dark academia, serene, cinematic',
    constraints: 'Uninhabited, strictly no people or animals, no modern electronics',
  },
  aspectRatio: '16:9',
  activePromptResult: null,
  variationLevel: 'balanced',
  variationCount: 4,
  variationInstructions: '',
  variations: [],
};

export const QuickImagePromptStudioView: React.FC = () => {
  const { setActiveView, updateConfig, drafts, activeProject } = useAmbience();

  // Load state from local storage or default
  const [state, setState] = useState<QuickPromptState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUICK_PROMPT);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_STATE;
  });

  // Reference items from storage
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Loading & Action states
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Edit prompt state
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPromptText, setEditedPromptText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load references
  useEffect(() => {
    setReferences(StorageService.getReferences());
  }, []);

  // Persist state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUICK_PROMPT, JSON.stringify(state));
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
    showToast('Copied to clipboard! (Line breaks preserved)');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Custom reference upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setState((prev) => ({
        ...prev,
        startingPoint: 'reference',
        selectedReferenceId: null,
        customReference: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: base64,
          mimeType: file.type || 'image/jpeg',
          notes: 'Uploaded direct reference image',
        },
      }));
      showToast('Custom reference image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // Selected reference item
  const selectedRefObj = references.find((r) => r.id === state.selectedReferenceId) || null;
  const activeRefImage = state.customReference || (selectedRefObj ? {
    title: selectedRefObj.title,
    imageUrl: selectedRefObj.imageUrl || '',
    mimeType: selectedRefObj.mimeType || 'image/jpeg',
    notes: selectedRefObj.notes,
    analysis: selectedRefObj.analysis,
  } : null);

  // Handle Quick Image Prompt Generation
  const handleGeneratePrompt = async () => {
    if (isGeneratingPrompt) return;
    setIsGeneratingPrompt(true);
    setErrorMessage(null);

    try {
      let result: QuickImagePromptResult;

      if (state.startingPoint === 'reference') {
        if (!activeRefImage) {
          throw new Error('Please select a reference image or upload one to continue.');
        }

        result = await AiPromptService.generateQuickImagePrompt({
          mode: 'reference',
          referenceImage: {
            title: activeRefImage.title,
            imageUrl: activeRefImage.imageUrl,
            mimeType: activeRefImage.mimeType,
            notes: activeRefImage.notes,
            analysis: (activeRefImage as any).analysis,
          },
          userInstructions: state.referenceInstructions,
          aspectRatio: state.aspectRatio,
        });
      } else {
        if (!state.idea.subject.trim()) {
          throw new Error('Please enter a subject or concept for your prompt idea.');
        }

        result = await AiPromptService.generateQuickImagePrompt({
          mode: 'idea',
          idea: state.idea,
          aspectRatio: state.aspectRatio,
        });
      }

      setState((prev) => ({
        ...prev,
        activePromptResult: result,
        variations: [], // Reset previous variations when new prompt is generated
      }));

      setEditedPromptText(result.prompt);
      setIsEditingPrompt(false);
      showToast('Detailed prompt generated successfully!');
    } catch (err: any) {
      console.error('Error generating quick prompt:', err);
      setErrorMessage(err.message || 'Failed to generate prompt. Please try again.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Handle Controlled Variations Generation
  const handleGenerateVariations = async () => {
    const basePrompt = isEditingPrompt ? editedPromptText : state.activePromptResult?.prompt;
    if (!basePrompt) {
      setErrorMessage('Please generate a prompt first before creating variations.');
      return;
    }

    if (isGeneratingVariations) return;
    setIsGeneratingVariations(true);
    setErrorMessage(null);

    try {
      const result = await AiPromptService.generateQuickPromptVariations({
        basePrompt,
        variationLevel: state.variationLevel,
        count: state.variationCount,
        userInstructions: state.variationInstructions,
      });

      setState((prev) => ({
        ...prev,
        variations: result.variations,
      }));

      showToast(`Generated ${result.variations.length} ${state.variationLevel} variations!`);
    } catch (err: any) {
      console.error('Error generating variations:', err);
      setErrorMessage(err.message || 'Failed to generate variations. Please try again.');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  // Save prompt to storage history
  const handleSaveToHistory = (promptText: string, notes?: string) => {
    try {
      StorageService.addHistoryEntry({
        projectName: state.startingPoint === 'reference' ? (activeRefImage?.title || 'Reference Prompt') : 'Concept Idea Prompt',
        type: 'image',
        promptText,
        notes: notes || `Quick Image Studio (${state.startingPoint})`,
        modelDisplayName: state.activePromptResult?.modelUsed || 'Gemini 3.8 Flash',
      });
      showToast('Prompt saved to Prompt History!');
    } catch {
      showToast('Failed to save to history.');
    }
  };

  // Send prompt to Active Project / Create Studio
  const handleSendToProject = (promptText: string) => {
    try {
      if (activeProject) {
        updateConfig((prev) => ({
          ...prev,
          customNotes: promptText,
        }));
      }
      // Set draft
      drafts.imagePrompt = promptText;
      showToast('Prompt sent to Create Studio! Opening workspace...');
      setTimeout(() => {
        setActiveView('create');
      }, 600);
    } catch {
      showToast('Could not send prompt to project.');
    }
  };

  // Filter reference items
  const filteredReferences = references.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(references.map((r) => r.category)))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E2B3E] text-[#F2EEE6] border border-[#38BDF8] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#101722] via-[#152030] to-[#101722] border border-[#1E2B3E] rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2EEE6] font-display tracking-wide">
              Quick Image Prompts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 uppercase">
              Fast Workflow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A1AEC0] max-w-2xl">
            Streamlined workflow to convert reference images or raw ideas into production-ready Midjourney & Flux prompts with controlled variations.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('references')}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#283952] transition-colors flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Open Reference Library</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-[#2A1215] border border-[#F87171]/40 rounded-xl text-xs text-[#F87171] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Generation Error</p>
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

      {/* Main Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Workflow Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-5 space-y-5 shadow-sm">
            {/* Mode Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A1AEC0] uppercase tracking-wider font-mono block">
                1. Choose Starting Point
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, startingPoint: 'reference' }))
                  }
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    state.startingPoint === 'reference'
                      ? 'bg-[#192434] text-[#38BDF8] border border-[#283952] shadow-sm font-semibold'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Use Reference</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, startingPoint: 'idea' }))
                  }
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    state.startingPoint === 'idea'
                      ? 'bg-[#192434] text-[#38BDF8] border border-[#283952] shadow-sm font-semibold'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Start from Idea</span>
                </button>
              </div>
            </div>

            {/* STARTING POINT A: USE REFERENCE */}
            {state.startingPoint === 'reference' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#F2EEE6] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Select Reference Image</span>
                  </label>
                  <label className="text-[11px] text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Custom</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Active Reference Selected Display */}
                {activeRefImage ? (
                  <div className="p-3 bg-[#152030] border border-[#38BDF8]/40 rounded-xl flex items-center gap-3 relative group">
                    <div className="w-16 h-16 rounded-lg bg-[#0B1018] overflow-hidden shrink-0 border border-[#283952]">
                      <img
                        src={activeRefImage.imageUrl}
                        alt={activeRefImage.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#F2EEE6] truncate">
                        {activeRefImage.title}
                      </div>
                      <div className="text-[10px] text-[#A1AEC0] truncate mt-0.5">
                        {activeRefImage.notes || 'Reference Item'}
                      </div>
                      {(activeRefImage as any).analysis && (
                        <div className="inline-flex items-center gap-1 text-[9px] text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-md mt-1 border border-[#38BDF8]/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>AI Visual Cues Attached</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          selectedReferenceId: null,
                          customReference: null,
                        }))
                      }
                      className="p-1 text-[#A1AEC0] hover:text-[#F87171] hover:bg-[#2A1215] rounded-lg transition-colors"
                      title="Clear selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Reference Selector List */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A1AEC0]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search reference library..."
                          className="w-full pl-8 pr-3 py-1.5 bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/50 focus:outline-none focus:border-[#38BDF8]"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-xs text-[#A1AEC0] px-2 py-1.5 focus:outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="max-h-52 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                      {filteredReferences.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#A1AEC0] bg-[#0B1018] rounded-xl border border-[#1E2B3E]">
                          No references found matching search.
                        </div>
                      ) : (
                        filteredReferences.map((ref) => (
                          <button
                            key={ref.id}
                            type="button"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                selectedReferenceId: ref.id,
                                customReference: null,
                              }))
                            }
                            className="w-full p-2 rounded-xl bg-[#0B1018] hover:bg-[#152030] border border-[#1E2B3E] hover:border-[#283952] transition-all flex items-center gap-3 text-left group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-[#192434] overflow-hidden shrink-0 border border-[#283952]">
                              {ref.imageUrl ? (
                                <img
                                  src={ref.imageUrl}
                                  alt={ref.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#A1AEC0]">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-[#F2EEE6] truncate group-hover:text-[#38BDF8]">
                                {ref.title}
                              </div>
                              <div className="text-[10px] text-[#A1AEC0] truncate">
                                {ref.category}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#A1AEC0] group-hover:text-[#F2EEE6] shrink-0" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Optional Modification Instructions */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-[#A1AEC0] flex items-center justify-between">
                    <span>Optional Change Instructions</span>
                    <span className="text-[10px] text-[#A1AEC0]/70 font-normal">What to preserve or adjust</span>
                  </label>
                  <textarea
                    rows={3}
                    value={state.referenceInstructions}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        referenceInstructions: e.target.value,
                      }))
                    }
                    placeholder="e.g., Preserve fireplace and warm wood textures, but add heavy thunderstorm rain outside the Gothic window."
                    className="w-full p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#38BDF8] resize-none"
                  />
                </div>
              </div>
            )}

            {/* STARTING POINT B: START FROM AN IDEA */}
            {state.startingPoint === 'idea' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F2EEE6]">
                    Subject or Concept <span className="text-[#F87171]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={state.idea.subject}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        idea: { ...prev.idea, subject: e.target.value },
                      }))
                    }
                    placeholder="Describe your primary subject or core visual concept..."
                    className="w-full p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#38BDF8] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A1AEC0]">
                    Setting or Environment <span className="text-[10px] opacity-70">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={state.idea.setting}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        idea: { ...prev.idea, setting: e.target.value },
                      }))
                    }
                    placeholder="e.g., Gothic cathedral library at twilight"
                    className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A1AEC0]">
                    Mood or Aesthetic <span className="text-[10px] opacity-70">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={state.idea.mood}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        idea: { ...prev.idea, mood: e.target.value },
                      }))
                    }
                    placeholder="e.g., Cozy amber warmth, rainy atmosphere, dark academia"
                    className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A1AEC0]">
                    Constraints / Exclusions <span className="text-[10px] opacity-70">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={state.idea.constraints}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        idea: { ...prev.idea, constraints: e.target.value },
                      }))
                    }
                    placeholder="e.g., Uninhabited, no people or faces, no modern technology"
                    className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>
            )}

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5 pt-1 border-t border-[#1E2B3E]">
              <label className="text-xs font-semibold text-[#A1AEC0] block">
                Target Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['16:9', '9:16', '1:1', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, aspectRatio: ratio }))
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all border ${
                      state.aspectRatio === ratio
                        ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8] font-semibold'
                        : 'bg-[#0B1018] text-[#A1AEC0] border-[#1E2B3E] hover:text-[#F2EEE6]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGeneratePrompt}
              disabled={isGeneratingPrompt}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-[#0B1018] bg-[#38BDF8] hover:bg-[#7dd3fc] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isGeneratingPrompt ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Detailed Prompt...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Detailed Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Prompt Result & Controlled Variations (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. Active Detailed Prompt Result Card */}
          {state.activePromptResult ? (
            <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 space-y-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F2EEE6] font-display">
                      Generated Production Prompt
                    </h3>
                    <p className="text-[10px] text-[#A1AEC0]">
                      Midjourney v6.1 & Flux.1 Pro Compatible
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#283952] transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingPrompt ? 'View' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        isEditingPrompt ? editedPromptText : state.activePromptResult!.prompt,
                        'main-prompt'
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#38BDF8] text-[#0B1018] hover:bg-[#7dd3fc] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedId === 'main-prompt' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editable or Display Prompt Text Area */}
              {isEditingPrompt ? (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={editedPromptText}
                    onChange={(e) => setEditedPromptText(e.target.value)}
                    className="w-full p-4 bg-[#0B1018] border border-[#38BDF8]/40 rounded-xl text-xs font-mono text-[#F2EEE6] leading-relaxed focus:outline-none focus:border-[#38BDF8] resize-y custom-scrollbar"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditedPromptText(state.activePromptResult!.prompt);
                        setIsEditingPrompt(false);
                      }}
                      className="px-3 py-1 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPrompt(false);
                        showToast('Prompt edits saved!');
                      }}
                      className="px-3 py-1 bg-[#192434] border border-[#283952] rounded-lg text-xs font-semibold text-[#F2EEE6]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs font-mono text-[#F2EEE6] leading-relaxed whitespace-pre-wrap select-text border-l-4 border-l-[#38BDF8]">
                  {state.activePromptResult.prompt}
                </div>
              )}

              {/* Reasoning & Observed/Inferred Badges */}
              {state.activePromptResult.reasoning && (
                <div className="p-3 bg-[#152030]/50 border border-[#1E2B3E] rounded-xl text-xs text-[#A1AEC0] space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] font-semibold flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Prompt Architecture Reasoning</span>
                  </div>
                  <p className="leading-normal">{state.activePromptResult.reasoning}</p>

                  {(state.activePromptResult.visibleDetails?.length || 0) > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-[#A1AEC0]/70 font-mono">Visible cues:</span>
                      {state.activePromptResult.visibleDetails?.map((det, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#192434] text-[10px] text-[#F2EEE6] border border-[#283952]"
                        >
                          {det}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E2B3E]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveToHistory(
                        isEditingPrompt ? editedPromptText : state.activePromptResult!.prompt
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#152030] hover:bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-[#E8AE62]" />
                    <span>Save to History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendToProject(
                        isEditingPrompt ? editedPromptText : state.activePromptResult!.prompt
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#152030] hover:bg-[#192434] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Send to Create Studio</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePrompt}
                  disabled={isGeneratingPrompt}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#A1AEC0] hover:text-[#F2EEE6] flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          ) : (
            /* Placeholder State */
            <div className="p-12 bg-[#101722] border border-[#1E2B3E] border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[320px]">
              <div className="w-12 h-12 rounded-2xl bg-[#192434] border border-[#283952] flex items-center justify-center text-[#38BDF8]">
                <Wand2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#F2EEE6]">
                  Ready to Synthesize Prompt
                </h3>
                <p className="text-xs text-[#A1AEC0] max-w-sm">
                  Select a reference image or enter a concept idea on the left, then click "Generate Detailed Prompt".
                </p>
              </div>
            </div>
          )}

          {/* B. Controlled Image Variations Panel */}
          {state.activePromptResult && (
            <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B3E] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#F2EEE6] font-display flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#E8AE62]" />
                    <span>Controlled Image Variations</span>
                  </h3>
                  <p className="text-[10px] text-[#A1AEC0]">
                    Generate multiple complete standalone prompt directions
                  </p>
                </div>

                {/* Variation Count Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A1AEC0]">Count:</span>
                  <div className="flex items-center bg-[#0B1018] border border-[#1E2B3E] rounded-lg p-0.5">
                    {[2, 3, 4, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setState((prev) => ({ ...prev, variationCount: num }))
                        }
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                          state.variationCount === num
                            ? 'bg-[#E8AE62]/20 text-[#E8AE62] font-bold'
                            : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Variation Level Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A1AEC0]">
                  Variation Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: 'subtle',
                      title: 'Subtle',
                      desc: 'Preserve subject, framing; tweak lighting/decor',
                    },
                    {
                      id: 'balanced',
                      title: 'Balanced',
                      desc: 'Preserve theme; allow environment/lighting shifts',
                    },
                    {
                      id: 'bold',
                      title: 'Bold',
                      desc: 'Preserve core spirit; explore new layouts & moods',
                    },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          variationLevel: lvl.id as any,
                        }))
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        state.variationLevel === lvl.id
                          ? 'bg-[#192434] border-[#E8AE62] text-[#F2EEE6] shadow-sm'
                          : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#E8AE62] mb-0.5">
                        {lvl.title}
                      </div>
                      <div className="text-[10px] text-[#A1AEC0] leading-tight">
                        {lvl.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Guidance for Variations */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={state.variationInstructions}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      variationInstructions: e.target.value,
                    }))
                  }
                  placeholder="Optional guidance (e.g., Explore different weather & times of day)"
                  className="w-full px-3 py-2 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              {/* Generate Variations Button */}
              <button
                type="button"
                onClick={handleGenerateVariations}
                disabled={isGeneratingVariations}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#F2EEE6] bg-[#152030] hover:bg-[#192434] border border-[#283952] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isGeneratingVariations ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#E8AE62]" />
                    <span>Architecting {state.variationCount} Variations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#E8AE62]" />
                    <span>
                      Generate {state.variationCount} {state.variationLevel.toUpperCase()} Variations
                    </span>
                  </>
                )}
              </button>

              {/* Render Variations List */}
              {state.variations.length > 0 && (
                <div className="pt-4 border-t border-[#1E2B3E] space-y-4">
                  <h4 className="text-xs font-semibold text-[#A1AEC0] uppercase tracking-wider font-mono">
                    Generated Variations ({state.variations.length})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.variations.map((variant, idx) => (
                      <div
                        key={variant.id || idx}
                        className="bg-[#0B1018] border border-[#1E2B3E] rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-[#283952] transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#E8AE62] font-display">
                              {variant.title || `Variation ${idx + 1}`}
                            </span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#192434] text-[#38BDF8] border border-[#283952]">
                              {state.variationLevel}
                            </span>
                          </div>

                          {variant.angleSummary && (
                            <p className="text-[11px] text-[#A1AEC0] italic">
                              "{variant.angleSummary}"
                            </p>
                          )}

                          <div className="p-3 bg-[#101722] border border-[#1E2B3E] rounded-lg text-[11px] font-mono text-[#F2EEE6] leading-relaxed whitespace-pre-wrap select-text max-h-48 overflow-y-auto custom-scrollbar">
                            {variant.prompt}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#1E2B3E]/60 gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyText(variant.prompt, `var-${idx}`)}
                            className="px-2.5 py-1 rounded-md bg-[#192434] hover:bg-[#283952] text-[#F2EEE6] text-[10px] font-medium transition-colors flex items-center gap-1"
                          >
                            {copiedId === `var-${idx}` ? (
                              <>
                                <Check className="w-3 h-3 text-[#38BDF8]" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveToHistory(variant.prompt, `Variation ${idx + 1}`)}
                              className="p-1 text-[#A1AEC0] hover:text-[#E8AE62] transition-colors"
                              title="Save to History"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendToProject(variant.prompt)}
                              className="p-1 text-[#A1AEC0] hover:text-[#38BDF8] transition-colors"
                              title="Send to Create Studio"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
