import React, { useState, useEffect, useMemo } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { useCustomImages } from '../../context/CustomImageContext';
import { StorageService } from '../../services/storage';
import {
  FileText,
  Copy,
  Check,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  BookmarkCheck,
  Info,
  Layers,
  Film,
  Music,
  ImageIcon,
  Loader2,
  XCircle,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
  Plus,
  RefreshCw,
  Compass,
  Lightbulb,
} from 'lucide-react';
import { LessonLearnedItem } from '../../types/ambience';
import { TaskModelBadgeSelector } from '../common/ModelSelector';

export const PromptWorkbench: React.FC = () => {
  const {
    config,
    drafts,
    updateDraft,
    toggleDraftLock,
    regenerateDraftsFromConfig,
    revertToCompiledPrompts,
    compiledPrompts,
    activeProject,
    showToast,
    isGeneratingPrompts,
    generationTarget,
    generationError,
    lastAiResult,
    selectedAiReferenceAssetId,
    setSelectedAiReferenceAssetId,
    directorInstructions,
    setDirectorInstructions,
    generateAiPrompts,
    cancelGeneration,
    conflicts,
  } = useAmbience();

  const { assets, openLibraryModal } = useCustomImages();

  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'music'>('image');
  const [copied, setCopied] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [historyNotes, setHistoryNotes] = useState('');
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Record outcome as lesson modal state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonCategory, setLessonCategory] = useState<'Looping' | 'Water' | 'Lighting' | 'Camera' | 'Audio Layering' | 'Subjects' | 'General'>('Looping');
  const [lessonResult, setLessonResult] = useState<'Worked well' | 'Partially worked' | 'Failed' | 'Not tested'>('Worked well');
  const [lessonObservation, setLessonObservation] = useState('');
  const [lessonRecommendation, setLessonRecommendation] = useState('');
  const [lessonConfidence, setLessonConfidence] = useState<'High' | 'Medium' | 'Low'>('High');

  const handleOpenLessonModal = () => {
    setLessonTitle(`${activeProject.name} (${activeTab.toUpperCase()}) Outcome`);
    setLessonObservation('');
    setLessonRecommendation('');
    setLessonModalOpen(true);
  };

  const handleSaveLessonFromWorkbench = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    const newLesson: LessonLearnedItem = {
      id: `lesson-${Date.now()}`,
      category: lessonCategory,
      title: lessonTitle.trim(),
      promptType: activeTab,
      projectId: activeProject.id,
      projectName: activeProject.name,
      originalPrompt: currentPromptText,
      observedResult: lessonResult,
      observation: lessonObservation.trim(),
      recommendation: lessonRecommendation.trim(),
      confidenceLevel: lessonConfidence,
      createdAt: Date.now(),
    };

    StorageService.saveLesson(newLesson);
    setLessonModalOpen(false);
    showToast('Recorded production outcome as Experience Memory lesson!');
  };

  // Timer for generation feedback
  useEffect(() => {
    let interval: any;
    if (isGeneratingPrompts) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingPrompts]);

  const currentPromptText =
    activeTab === 'image'
      ? drafts.imagePrompt
      : activeTab === 'video'
      ? drafts.videoPrompt
      : drafts.musicPrompt;

  const currentCompiledText =
    activeTab === 'image'
      ? compiledPrompts.imagePrompt
      : activeTab === 'video'
      ? compiledPrompts.videoPrompt
      : compiledPrompts.musicPrompt;

  const isLocked =
    activeTab === 'image'
      ? drafts.imagePromptLocked
      : activeTab === 'video'
      ? drafts.videoPromptLocked
      : drafts.musicPromptLocked;

  const selectedAsset = useMemo(() => {
    if (!selectedAiReferenceAssetId) return null;
    return assets.find((a) => a.id === selectedAiReferenceAssetId) || null;
  }, [assets, selectedAiReferenceAssetId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPromptText);
    setCopied(true);
    showToast(`Copied ${activeTab.toUpperCase()} prompt to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToHistory = () => {
    StorageService.addHistoryEntry({
      projectId: activeProject.id,
      projectName: activeProject.name,
      type: activeTab,
      promptText: currentPromptText,
      notes: historyNotes.trim() || undefined,
    });
    setSaveModalOpen(false);
    setHistoryNotes('');
    showToast(`Logged to Prompt History archive`);
  };

  const handleQuickDirective = (phrase: string) => {
    const trimmed = directorInstructions.trim();
    if (!trimmed) {
      setDirectorInstructions(phrase);
    } else if (!trimmed.includes(phrase)) {
      setDirectorInstructions(`${trimmed}. ${phrase}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Studio Command Header Banner */}
      <div className="bg-[#101722]/90 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-[#E8AE62]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
              <Sparkles className="w-5 h-5 text-[#E8AE62]" />
              AI Prompt Engine & Production Workbench
            </h2>
            <p className="text-xs text-[#A1AEC0] mt-1 max-w-2xl leading-relaxed">
              Coordinated multimodal prompt generation for Midjourney v6.1 / Flux.1, Runway Gen-3 Alpha, and Suno v3.5 audio scoring powered by Gemini 3.8 Flash.
            </p>
          </div>

          {/* Model Status Badge & Task Override */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#A1AEC0] hidden sm:inline">Engine:</span>
            <TaskModelBadgeSelector
              task={
                activeTab === 'image'
                  ? 'image-prompt'
                  : activeTab === 'video'
                  ? 'video-prompt'
                  : 'music-prompt'
              }
            />
          </div>
        </div>

        {/* Primary AI Generation Controls */}
        <div className="mt-6 pt-5 border-t border-[#1E2B3E] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Generate All Prompts Button */}
            <button
              type="button"
              disabled={isGeneratingPrompts}
              onClick={() => generateAiPrompts('all')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-lg ${
                isGeneratingPrompts && generationTarget === 'all'
                  ? 'bg-[#192434] text-[#E8AE62] border border-[#E8AE62]/50 cursor-wait'
                  : 'bg-[#E8AE62] hover:bg-[#F2BE7D] text-[#0B1018] active:scale-[0.98]'
              }`}
            >
              {isGeneratingPrompts && generationTarget === 'all' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E8AE62]" />
                  <span>Generating Prompts ({elapsedSeconds}s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#0B1018]" />
                  <span>Generate All Prompts with AI</span>
                </>
              )}
            </button>

            {/* Generate Active Tab Prompt Button */}
            <button
              type="button"
              disabled={isGeneratingPrompts}
              onClick={() => generateAiPrompts(activeTab)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl bg-[#192434] hover:bg-[#223146] text-[#F2EEE6] border border-[#283952] transition-colors"
            >
              {isGeneratingPrompts && generationTarget === activeTab ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E8AE62]" />
                  <span>Writing {activeTab.toUpperCase()} Prompt...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#E8AE62]" />
                  <span>Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Only</span>
                </>
              )}
            </button>

            {/* Cancel Button if running */}
            {isGeneratingPrompts && (
              <button
                type="button"
                onClick={cancelGeneration}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/50 rounded-xl transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>

          {/* Quick Stats / Revert Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCompareMode(!showCompareMode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
                showCompareMode
                  ? 'bg-[#E8AE62]/10 border-[#E8AE62] text-[#E8AE62]'
                  : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {showCompareMode ? 'Hide Baseline Compare' : 'Compare Baseline'}
            </button>

            <button
              type="button"
              onClick={() => revertToCompiledPrompts('all')}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] transition-colors"
              title="Reset all prompts to the deterministic rule-based compiler"
            >
              Reset to Deterministic
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {generationError && (
          <div className="mt-4 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-3 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-300">Prompt Generation Error:</span> {generationError}
            </div>
            <button
              type="button"
              onClick={() => generateAiPrompts(generationTarget || 'all')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-rose-900/60 hover:bg-rose-900 text-rose-100 rounded-lg border border-rose-700/60 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* AI Context Configuration Deck: Reference Image & Director's Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Multimodal Reference Image Context (4 cols) */}
        <div className="lg:col-span-5 bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
                <ImageIcon className="w-4 h-4 text-[#E8AE62]" />
                Visual Reference Context for AI
              </h3>
              <button
                type="button"
                onClick={openLibraryModal}
                className="text-[11px] text-[#E8AE62] hover:text-[#F2BE7D] font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Library
              </button>
            </div>
            <p className="text-[11px] text-[#A1AEC0] mb-3 leading-relaxed">
              Select an uploaded moodboard or scene master image. Gemini multimodal vision will examine its composition, lighting, and textures.
            </p>

            {/* Reference Image Selector Dropdown */}
            <div className="space-y-2.5">
              <div className="relative">
                <select
                  value={selectedAiReferenceAssetId || ''}
                  onChange={(e) => setSelectedAiReferenceAssetId(e.target.value || null)}
                  className="w-full pl-3 pr-8 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] appearance-none focus:outline-none focus:border-[#E8AE62]"
                >
                  <option value="">None (Text-only prompt generation)</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.width ? `${asset.width}x${asset.height}` : 'Custom'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#A1AEC0] absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* Selected Image Thumbnail Preview Card */}
              {selectedAsset ? (
                <div className="p-2.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#151F2E] shrink-0 border border-[#283952]">
                    <img
                      src={selectedAsset.dataUrl}
                      alt={selectedAsset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#F2EEE6] truncate">{selectedAsset.name}</p>
                    <p className="text-[10px] text-[#A1AEC0] font-mono">
                      {selectedAsset.mimeType} · {(selectedAsset.size / 1024).toFixed(0)} KB
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] text-[#E8AE62] font-semibold tracking-wider uppercase">
                      Attached to AI Prompt Payload
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAiReferenceAssetId(null)}
                    className="text-[#A1AEC0] hover:text-rose-400 p-1"
                    title="Remove reference image"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#0B1018]/50 border border-dashed border-[#1E2B3E] rounded-xl text-center text-[11px] text-[#A1AEC0]">
                  No reference image selected. Pure project configuration logic applied.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E2B3E]/60 text-[10px] text-[#A1AEC0] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#E8AE62] shrink-0" />
            <span>Card artwork thumbnails are never transmitted as scene references unless selected here.</span>
          </div>
        </div>

        {/* Director's Custom Directives & Refinements (7 cols) */}
        <div className="lg:col-span-7 bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#F2EEE6] mb-1 flex items-center gap-2 font-display">
              <SlidersHorizontal className="w-4 h-4 text-[#E8AE62]" />
              Director's Custom Instructions & Stylistic Notes
            </h3>
            <p className="text-[11px] text-[#A1AEC0] mb-3">
              Provide specific nuances, lighting preferences, or narrative details for the AI prompt engineer to incorporate.
            </p>

            <textarea
              rows={3}
              value={directorInstructions}
              onChange={(e) => setDirectorInstructions(e.target.value)}
              placeholder="e.g. Focus on deep rain streaks on glass, warm amber candle reflections, and a slow melancholy cello melody in the background..."
              className="w-full p-3 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] placeholder:text-[#A1AEC0]/50 focus:outline-none focus:border-[#E8AE62] focus:ring-1 focus:ring-[#E8AE62]/20"
            />

            {/* Quick Inspiration Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-[#A1AEC0] self-center mr-1">Quick Add:</span>
              {[
                'Heavy rain on window glass',
                'Deep warm fireplace embers',
                'Strict locked stationary tripod',
                'Lo-fi vinyl crackle & warm piano',
                'Completely uninhabited sanctuary',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickDirective(chip)}
                  className="px-2 py-0.5 text-[10px] rounded-lg bg-[#151F2E] hover:bg-[#1E2B3E] text-[#A1AEC0] hover:text-[#E8AE62] border border-[#1E2B3E] transition-colors"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>

          {/* AI Creative Reasoning Badge if generated */}
          {lastAiResult?.reasoning && (
            <div className="mt-3 p-2.5 bg-[#0B1018] border border-[#E8AE62]/30 rounded-xl text-[11px] text-[#F2EEE6]/90 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E8AE62] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#E8AE62]">Gemini Creative Synthesis:</span>{' '}
                {lastAiResult.reasoning}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contradiction Warnings if detected */}
      {(conflicts.length > 0 || (lastAiResult?.warnings && lastAiResult.warnings.length > 0)) && (
        <div className="p-4 bg-amber-950/30 border border-[#E8AE62]/50 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#E8AE62] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-[#F2EEE6]">
            <div className="font-semibold text-[#E8AE62]">Project Contradiction Notice:</div>
            {conflicts.map((c, i) => (
              <div key={i} className="text-[#A1AEC0]">
                • <strong className="text-[#F2EEE6]">{c.title}:</strong> {c.message}
              </div>
            ))}
            {lastAiResult?.warnings?.map((w, i) => (
              <div key={`w-${i}`} className="text-[#A1AEC0]">
                • <span className="text-[#E8AE62]">{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Prompt Output Canvas */}
      <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E2B3E] px-5 pt-3 bg-[#0B1018]/60 flex-wrap gap-2">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-xl transition-all border-t border-x ${
                activeTab === 'image'
                  ? 'bg-[#101722] border-[#1E2B3E] text-[#E8AE62] border-b-transparent shadow-sm'
                  : 'border-transparent text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#E8AE62]" />
              Image Generation Prompt
              {drafts.imagePromptLocked && <Lock className="w-3 h-3 text-[#E8AE62] ml-1" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-xl transition-all border-t border-x ${
                activeTab === 'video'
                  ? 'bg-[#101722] border-[#1E2B3E] text-[#E8AE62] border-b-transparent shadow-sm'
                  : 'border-transparent text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-blue-400" />
              Video Animation Prompt
              {drafts.videoPromptLocked && <Lock className="w-3 h-3 text-[#E8AE62] ml-1" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-xl transition-all border-t border-x ${
                activeTab === 'music'
                  ? 'bg-[#101722] border-[#1E2B3E] text-[#E8AE62] border-b-transparent shadow-sm'
                  : 'border-transparent text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-purple-400" />
              Music & Foley Audio Prompt
              {drafts.musicPromptLocked && <Lock className="w-3 h-3 text-[#E8AE62] ml-1" />}
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 pb-2">
            {/* Lock / Unlock */}
            <button
              type="button"
              onClick={() =>
                toggleDraftLock(
                  activeTab === 'image'
                    ? 'imagePromptLocked'
                    : activeTab === 'video'
                    ? 'videoPromptLocked'
                    : 'musicPromptLocked'
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isLocked
                  ? 'bg-[#E8AE62]/10 border-[#E8AE62]/60 text-[#E8AE62]'
                  : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
              title={isLocked ? 'Prompt is locked against recompiler overwrites' : 'Lock to preserve custom edits'}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>

            {/* Recompile from settings */}
            <button
              type="button"
              onClick={() => regenerateDraftsFromConfig(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F2EEE6] hover:text-[#E8AE62] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-colors"
              title="Recompile from current configuration settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recompile
            </button>

            {/* Save to Prompt History */}
            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F2EEE6] hover:text-[#E8AE62] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-colors"
              title="Save to Prompt History archive"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              Save to History
            </button>

            {/* Record Outcome as Lesson */}
            <button
              type="button"
              onClick={handleOpenLessonModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#E8AE62] hover:text-[#F2BE7D] bg-[#E8AE62]/10 hover:bg-[#E8AE62]/20 border border-[#E8AE62]/30 rounded-xl transition-colors"
              title="Record production outcome and observation as Experience Memory lesson"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Record Outcome
            </button>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-all shadow-md active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Prompt'}
            </button>
          </div>
        </div>

        {/* Prompt Editor & Compare Area */}
        <div className="p-6">
          <div className="flex items-center justify-between text-xs text-[#A1AEC0] mb-3">
            <span>
              Target Production Model:{' '}
              <strong className="text-[#F2EEE6] font-mono">
                {activeTab === 'image'
                  ? 'Midjourney v6.1 / Flux.1 Pro / SDXL'
                  : activeTab === 'video'
                  ? 'Runway Gen-3 Alpha / Kling 1.5 / Luma Dream Machine'
                  : 'Suno v3.5 / Udio / Ambient Sound Engine'}
              </strong>
            </span>
            <span>
              {isLocked ? (
                <span className="text-[#E8AE62] font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Custom Edits Locked
                </span>
              ) : (
                <span className="text-[#A1AEC0] font-mono">Synced with current studio settings</span>
              )}
            </span>
          </div>

          {showCompareMode ? (
            /* Side-by-side comparison mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-[#E8AE62]">
                  <span>Active Working Prompt</span>
                  <span className="text-[10px] text-[#A1AEC0] font-mono">
                    {currentPromptText.length} chars
                  </span>
                </div>
                <textarea
                  rows={13}
                  value={currentPromptText}
                  onChange={(e) =>
                    updateDraft(
                      activeTab === 'image'
                        ? 'imagePrompt'
                        : activeTab === 'video'
                        ? 'videoPrompt'
                        : 'musicPrompt',
                      e.target.value
                    )
                  }
                  className="w-full p-4 text-xs font-mono leading-relaxed bg-[#0B1018] border border-[#E8AE62]/40 rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-[#A1AEC0]">
                  <span>Deterministic Baseline Compiler</span>
                  <button
                    type="button"
                    onClick={() => revertToCompiledPrompts(activeTab)}
                    className="text-[10px] text-[#E8AE62] hover:underline"
                  >
                    Restore Baseline
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={13}
                  value={currentCompiledText}
                  className="w-full p-4 text-xs font-mono leading-relaxed bg-[#070B10] border border-[#1E2B3E] rounded-xl text-[#A1AEC0] opacity-80 cursor-default"
                />
              </div>
            </div>
          ) : (
            /* Standard Full-width prompt editor */
            <textarea
              rows={13}
              value={currentPromptText}
              onChange={(e) =>
                updateDraft(
                  activeTab === 'image'
                    ? 'imagePrompt'
                    : activeTab === 'video'
                    ? 'videoPrompt'
                    : 'musicPrompt',
                  e.target.value
                )
              }
              placeholder="Prompt content..."
              className="w-full p-4 text-xs font-mono leading-relaxed bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62] focus:ring-1 focus:ring-[#E8AE62]/30 selection:bg-[#E8AE62]/20"
            />
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#A1AEC0]">
            <span className="font-mono">
              Characters: {currentPromptText.length} · Words: {currentPromptText.split(/\s+/).filter(Boolean).length}
            </span>
            <span>Manual modifications automatically lock this prompt to prevent accidental recompilation.</span>
          </div>
        </div>
      </div>

      {/* Save to History Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
              Save Prompt to History Library
            </h3>
            <p className="text-xs text-[#A1AEC0] mb-4">
              Store this prompt version in your local studio archive for future reference and production testing.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                Version Notes / Seed Details
              </label>
              <textarea
                rows={3}
                value={historyNotes}
                onChange={(e) => setHistoryNotes(e.target.value)}
                placeholder="e.g. Tested on Runway Gen-3 with seed 48201. Great fireplace stability, zero tearing."
                className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="px-3.5 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToHistory}
                className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-colors shadow-md"
              >
                Save Archive Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Outcome as Lesson Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#E8AE62]" />
              Record Production Outcome as Lesson
            </h3>
            <p className="text-xs text-[#A1AEC0] mb-4">
              Log generation success or artifact observation into Experience Memory for future projects.
            </p>
            <form onSubmit={handleSaveLessonFromWorkbench} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Category</label>
                  <select
                    value={lessonCategory}
                    onChange={(e) => setLessonCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
                  >
                    <option value="Looping">Looping</option>
                    <option value="Water">Water</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Camera">Camera</option>
                    <option value="Audio Layering">Audio Layering</option>
                    <option value="Subjects">Subjects</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Observed Result</label>
                  <select
                    value={lessonResult}
                    onChange={(e) => setLessonResult(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
                  >
                    <option value="Worked well">Worked well</option>
                    <option value="Partially worked">Partially worked</option>
                    <option value="Failed">Failed</option>
                    <option value="Not tested">Not tested</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Observed Problem / Success Artifact
                </label>
                <textarea
                  rows={2}
                  required
                  value={lessonObservation}
                  onChange={(e) => setLessonObservation(e.target.value)}
                  placeholder="What happened when running this prompt?"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Studio Recommendation / Heuristic
                </label>
                <textarea
                  rows={2}
                  required
                  value={lessonRecommendation}
                  onChange={(e) => setLessonRecommendation(e.target.value)}
                  placeholder="What prompt guardrail or fix should be reused?"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-colors shadow-md"
                >
                  Save to Experience Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
