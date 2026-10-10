import React, { useState, useMemo } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { StorageService } from '../../services/storage';
import { AiPromptService } from '../../services/aiPromptService';
import {
  ReferenceVideoLabItem,
  CreativeReplicationBlueprint,
  ReferenceItem,
  LessonLearnedItem,
} from '../../types/ambience';
import {
  Youtube,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  Volume2,
  Film,
  Camera,
  Flame,
  Check,
  Copy,
  Plus,
  Star,
  Trash2,
  Compass,
  Lightbulb,
  Workflow,
  BookOpen,
  ArrowRight,
  Eye,
  Clock,
  ShieldCheck,
  Sliders,
  Download,
  Share2,
  RefreshCw,
  Info,
  Maximize2,
  Music,
  Cpu,
} from 'lucide-react';
import { TaskModelBadgeSelector } from '../common/ModelSelector';

export const ReferenceVideoLabView: React.FC = () => {
  const {
    videoLabItems,
    saveVideoLabItem,
    deleteVideoLabItem,
    toggleFavoriteVideoLabItem,
    createProjectFromBlueprint,
    applyBlueprintToActiveProject,
    setActiveView,
    showToast,
    getTaskActiveModel,
  } = useAmbience();

  // Input & state
  const [inputUrl, setInputUrl] = useState<string>('');
  const [directorGoal, setDirectorGoal] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState<string>('');

  // Selected item for deep inspection
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    return videoLabItems.length > 0 ? videoLabItems[0].id : '';
  });

  // Active deconstruction tab
  const [activeTab, setActiveTab] = useState<'blueprint' | 'aesthetic' | 'kinematics' | 'acoustics' | 'player'>('blueprint');

  // Filter & search for saved analyses
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Copy feedback tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Find currently inspected item
  const selectedItem = useMemo(() => {
    return videoLabItems.find((v) => v.id === selectedItemId) || videoLabItems[0] || null;
  }, [videoLabItems, selectedItemId]);

  // Filtered saved library
  const filteredLibrary = useMemo(() => {
    return videoLabItems.filter((item) => {
      if (favoritesOnly && !item.favorite) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.channelTitle.toLowerCase().includes(q) ||
        item.aesthetic.worldArchetype.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [videoLabItems, favoritesOnly, searchQuery]);

  // Helper to copy text
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard');
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  // Preset quick inputs
  const presetExamples = [
    {
      title: 'Hogwarts Hearth & Rain',
      url: 'https://www.youtube.com/watch?v=CHFif_y2TyM',
      tag: 'Dark Academia',
    },
    {
      title: 'Cyberpunk Tokyo Rain',
      url: 'https://www.youtube.com/watch?v=GLk7-ZJ4B5s',
      tag: 'Cyberpunk',
    },
    {
      title: 'Studio Ghibli Summer Train',
      url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
      tag: 'Nostalgic Anime',
    },
    {
      title: 'Nordic Blizzard Cabin',
      url: 'https://www.youtube.com/watch?v=coP1Gph_zUQ',
      tag: 'Winter Hearth',
    },
  ];

  // Run Gemini analysis on input URL
  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || inputUrl).trim();
    if (!targetUrl) {
      showToast('Please enter a YouTube video URL');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStage('Validating YouTube video stream & stream metadata...');

    try {
      setTimeout(() => setAnalysisStage('Deconstructing visual framing, lighting physics & depth planes...'), 1200);
      setTimeout(() => setAnalysisStage('Analyzing kinematics, motion vectors & loop seam hazards...'), 2400);
      setTimeout(() => setAnalysisStage('Synthesizing Acoustic Noise creative replication blueprint...'), 3800);

      const activeTaskModel = getTaskActiveModel('video-analysis');

      const result = await AiPromptService.analyzeYouTubeVideo({
        url: targetUrl,
        model: activeTaskModel.modelId,
        customGoal: directorGoal.trim() || undefined,
      });

      saveVideoLabItem(result);
      setSelectedItemId(result.id);
      setInputUrl('');
      setDirectorGoal('');
      showToast(`Successfully analyzed "${result.title.slice(0, 36)}..."`);
    } catch (err: any) {
      console.error('Video analysis error:', err);
      const msg = err.message || 'Failed to analyze YouTube video.';
      setAnalysisError(msg);
      showToast(`Analysis failed: ${msg}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Action: 1-Click Create Project from Blueprint
  const handleCreateProject = () => {
    if (!selectedItem) return;
    const project = createProjectFromBlueprint(
      selectedItem.blueprint,
      `${selectedItem.title.replace(/\|.*/, '').trim() || 'Aesthetic Blueprint'} (Replication)`,
      selectedItem
    );
    setActiveView('workflow');
  };

  // Action: Apply Blueprint to Active Project
  const handleApplyToActive = () => {
    if (!selectedItem) return;
    applyBlueprintToActiveProject(selectedItem.blueprint);
    setActiveView('create');
  };

  // Action: Save to Reference Library
  const handleSaveToReferenceLibrary = () => {
    if (!selectedItem) return;
    const refItem: ReferenceItem = {
      id: `ref-vlab-${selectedItem.videoId}-${Date.now()}`,
      title: `${selectedItem.title.slice(0, 50)} (Video Benchmark)`,
      category: 'Video Benchmark',
      imageUrl: selectedItem.thumbnailUrl,
      tags: [...(selectedItem.tags || []), 'YouTube Benchmark', selectedItem.aesthetic.worldArchetype],
      roles: ['Composition', 'Lighting', 'Atmosphere'],
      assignedProjectIds: [],
      notes: `Extracted from YouTube reference: ${selectedItem.url}\nChannel: ${selectedItem.channelTitle}\nDirector Vision: ${selectedItem.blueprint.directorVision}`,
      atmosphereKeywords: selectedItem.acoustics.keyMoods || ['Cinematic', 'Atmospheric'],
      colorNotes: selectedItem.aesthetic.colorPalette.map((c) => `${c.name} (${c.hex})`).join(', '),
      audioNotes: `${selectedItem.acoustics.musicalStyle} | Foley: ${selectedItem.acoustics.foleyLayers.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}`,
      createdAt: Date.now(),
    };
    StorageService.saveReference(refItem);
    showToast('Saved video benchmark into Reference Library');
  };

  // Action: Record Lessons into Experience Memory
  const handleRecordLessons = () => {
    if (!selectedItem || !selectedItem.blueprint.reusableLessons.length) return;
    let addedCount = 0;
    selectedItem.blueprint.reusableLessons.forEach((lesson, index) => {
      const lessonItem: LessonLearnedItem = {
        id: `lesson-vlab-${Date.now()}-${index}`,
        category: lesson.category || 'Looping',
        title: lesson.title || 'Video Benchmark Insight',
        observation: lesson.observation,
        recommendation: lesson.recommendation,
        effectiveForModels: ['Runway Gen-3', 'Midjourney v6.1', 'Suno v3.5'],
        promptType: 'bundle',
        observedResult: 'Worked well',
        confidenceLevel: 'High',
        tags: ['YouTube Lab', selectedItem.aesthetic.worldArchetype],
        createdAt: Date.now(),
      };
      StorageService.saveLesson(lessonItem);
      addedCount++;
    });
    showToast(`Recorded ${addedCount} lessons to Experience Memory`);
  };

  // Action: Export Full Blueprint Markdown
  const handleExportMarkdown = () => {
    if (!selectedItem) return;
    const md = `# Creative Replication Blueprint: ${selectedItem.title}
Source URL: ${selectedItem.url}
Channel: ${selectedItem.channelTitle}
Analyzed: ${new Date(selectedItem.analyzedAt).toLocaleDateString()}
Confidence: ${selectedItem.matchConfidence}%

## 1. Director's Vision (Aesthetic Noise Reinterpretation)
${selectedItem.blueprint.directorVision}

## 2. Visual Architecture
- World Archetype: ${selectedItem.aesthetic.worldArchetype}
- Season & Time: ${selectedItem.aesthetic.season}, ${selectedItem.aesthetic.timeOfDay}
- Weather: ${selectedItem.aesthetic.weather}${selectedItem.aesthetic.secondaryWeather ? ` (${selectedItem.aesthetic.secondaryWeather})` : ''}
- Lighting: ${selectedItem.aesthetic.lighting.primarySource} (${selectedItem.aesthetic.lighting.colorTemperature})
- Foreground: ${selectedItem.aesthetic.depthPlanes.foreground}
- Middle Ground: ${selectedItem.aesthetic.depthPlanes.middleGround}
- Background: ${selectedItem.aesthetic.depthPlanes.background}
- Materials: ${selectedItem.aesthetic.materialsAndTextures.join(', ')}
- Atmospheric FX: ${selectedItem.aesthetic.atmosphericEffects.join(', ')}

## 3. Kinematic Motion Physics & Loop Safety
- Camera: ${selectedItem.kinematics.cameraBehavior}
- Motion Pacing: ${selectedItem.kinematics.motionPacing}
- Loop Cycle: ~${selectedItem.kinematics.loopCycleEstimateSeconds} seconds
- Motion Anchors: ${selectedItem.kinematics.motionSubjects.join(', ')}
- Seam Hazards: ${selectedItem.kinematics.loopSeamHazards.join('; ')}

## 4. Acoustic Foley & Musical Score
- Style: ${selectedItem.acoustics.musicalStyle} (${selectedItem.acoustics.tempoBpmRange})
- Instrumentation: ${selectedItem.acoustics.instrumentation.join(', ')}
- Foley Layers:
${selectedItem.acoustics.foleyLayers.map((l) => `  * ${l.name} (${l.percentage}%): ${l.description}`).join('\n')}
- Mastering Notes: ${selectedItem.acoustics.frequencyMasteringNotes}

## 5. Production Prompts

### Master Image Prompt (Midjourney / Flux)
\`\`\`
${selectedItem.blueprint.imagePrompt}
\`\`\`

### Video Animation Prompt (Runway Gen-3 / Kling)
\`\`\`
${selectedItem.blueprint.videoPrompt}
\`\`\`

### Audio Foley Score Prompt (Suno / Udio / Sound Engine)
\`\`\`
${selectedItem.blueprint.musicPrompt}
\`\`\`
`;
    handleCopy(md, 'export-all');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2B3E] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <Youtube className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-[#F2EEE6] tracking-tight font-display">
              Reference Video Lab
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-[#E8AE62]/10 border border-[#E8AE62]/20 text-[#E8AE62]">
              YouTube AI Reverse-Engineering
            </span>
          </div>
          <p className="text-sm text-[#A1AEC0] max-w-3xl">
            Analyze public YouTube ambience videos with Gemini multimodal intelligence. Reverse-engineer lighting
            physics, three-plane depth framing, and acoustic layers into an original, 100% IP-compliant production
            blueprint for Aesthetic Noise.
          </p>
        </div>

        {/* Global Blueprint Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#101722] border border-[#1E2B3E] text-right">
            <div className="text-[10px] uppercase font-semibold text-[#718096]">Saved Blueprints</div>
            <div className="text-base font-bold text-[#F2EEE6]">{videoLabItems.length}</div>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('workflow')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E2B3E] hover:bg-[#2A3C55] text-xs font-semibold text-[#F2EEE6] transition-colors"
          >
            <Workflow className="w-4 h-4 text-[#E8AE62]" />
            <span>Workflow Center</span>
          </button>
        </div>
      </div>

      {/* URL Input & Analysis Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141E2D] to-[#101722] border border-[#1E2B3E] shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main YouTube URL Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-400">
              <Youtube className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
              placeholder="Paste public YouTube URL (e.g., https://www.youtube.com/watch?v=... or youtu.be/...)"
              className="w-full pl-11 pr-4 py-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-sm text-[#F2EEE6] placeholder-[#4A5568] focus:outline-none focus:border-[#E8AE62] focus:ring-1 focus:ring-[#E8AE62] transition-all"
            />
          </div>

          {/* Optional Creative Goal Note */}
          <div className="lg:w-80">
            <input
              type="text"
              value={directorGoal}
              onChange={(e) => setDirectorGoal(e.target.value)}
              placeholder="Replication goal (optional, e.g. adapt to winter cabin)"
              className="w-full px-3.5 py-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#4A5568] focus:outline-none focus:border-[#E8AE62] focus:ring-1 focus:ring-[#E8AE62] transition-all"
            />
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs tracking-wide uppercase transition-all shadow-lg ${
              isAnalyzing
                ? 'bg-[#1E2B3E] text-[#A1AEC0] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#E8AE62] to-[#D97706] text-[#0B1018] hover:shadow-[#E8AE62]/20 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Deconstructing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Analyze Video</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Presets & Model Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#718096] text-[11px] font-medium mr-1">Quick Benchmarks:</span>
            {presetExamples.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleAnalyze(preset.url)}
                disabled={isAnalyzing}
                className="px-2.5 py-1 rounded-lg bg-[#0B1018] hover:bg-[#1A2636] border border-[#1E2B3E] hover:border-[#E8AE62]/40 text-[11px] text-[#A1AEC0] hover:text-[#F2EEE6] transition-all flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8AE62]"></span>
                <span>{preset.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#718096]">Engine:</span>
            <TaskModelBadgeSelector task="video-analysis" />
          </div>
        </div>

        {/* Progress or Status */}
        {isAnalyzing && (
          <div className="p-4 rounded-xl bg-[#0B1018]/90 border border-[#E8AE62]/30 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-5 h-5 text-[#E8AE62] animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#F2EEE6]">Multimodal Gemini AI Perception Active</div>
              <div className="text-[11px] text-[#E8AE62] truncate">{analysisStage}</div>
            </div>
          </div>
        )}

        {/* Analysis Error Message */}
        {analysisError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Analysis Notice: </span>
              {analysisError}
            </div>
            <button
              type="button"
              onClick={() => setAnalysisError(null)}
              className="text-red-400 hover:text-red-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Philosophy & Constraints Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0B1018]/60 border border-[#1E2B3E]/80 text-[11px] text-[#A1AEC0]">
          <Info className="w-4 h-4 text-[#E8AE62] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-[#F2EEE6]">Creative Replication Philosophy: </span>
            Aesthetic Noise reverse-engineers the creative essence—depth hierarchy, illumination physics, motion
            frequency, and acoustic layering—generating 100% original scenes and prompts without copying copyrighted frames or artist assets.
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Saved Library / Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Saved Video Benchmarks Library (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F2EEE6] tracking-wide flex items-center gap-2">
              <Film className="w-4 h-4 text-[#E8AE62]" />
              <span>Reference Library ({filteredLibrary.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                favoritesOnly
                  ? 'bg-[#E8AE62]/20 border-[#E8AE62] text-[#E8AE62]'
                  : 'bg-[#101722] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
              title="Show Favorites"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search benchmarks, tags, archetypes..."
              className="w-full pl-9 pr-3 py-2 bg-[#101722] border border-[#1E2B3E] rounded-xl text-xs text-[#F2EEE6] placeholder-[#4A5568] focus:outline-none focus:border-[#E8AE62]"
            />
          </div>

          {/* Cards List */}
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredLibrary.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#101722] border border-[#1E2B3E] text-xs text-[#718096]">
                No reference videos found. Paste a YouTube URL above to analyze.
              </div>
            ) : (
              filteredLibrary.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#141E2D] border-[#E8AE62] shadow-lg shadow-[#E8AE62]/5'
                        : 'bg-[#101722] border-[#1E2B3E] hover:border-[#2A3C55] hover:bg-[#131B27]'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Video Thumbnail */}
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-[#0B1018] shrink-0 border border-[#1E2B3E]">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] text-[#F2EEE6] font-mono">
                          {item.duration || '2:00:00'}
                        </div>
                      </div>

                      {/* Video Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-semibold text-[#E8AE62] truncate">
                            {item.aesthetic.worldArchetype}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteVideoLabItem(item.id);
                            }}
                            className={`p-1 rounded text-xs transition-colors ${
                              item.favorite ? 'text-[#E8AE62]' : 'text-[#4A5568] hover:text-[#F2EEE6]'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <h3 className="text-xs font-semibold text-[#F2EEE6] line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        <div className="flex items-center justify-between text-[10px] text-[#718096] mt-1.5">
                          <span className="truncate">{item.channelTitle}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#0B1018] border border-[#1E2B3E] text-[#A1AEC0]">
                            {item.matchConfidence}% match
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions on Hover/Select */}
                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#1E2B3E]/60 text-[10px]">
                      <span className="text-[#718096]">
                        {new Date(item.analyzedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#718096] hover:text-[#E8AE62] flex items-center gap-1"
                          title="Open on YouTube"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteVideoLabItem(item.id);
                          }}
                          className="text-[#718096] hover:text-red-400 transition-colors"
                          title="Delete from Library"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep Blueprint & Deconstruction Inspector (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedItem ? (
            <div className="p-6 rounded-2xl bg-[#101722] border border-[#1E2B3E] shadow-2xl space-y-6">
              {/* Benchmark Header Banner */}
              <div className="flex flex-col md:flex-row gap-5 items-start justify-between border-b border-[#1E2B3E] pb-6">
                <div className="flex gap-4">
                  <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-black border border-[#1E2B3E] shrink-0 shadow-md">
                    <img
                      src={selectedItem.thumbnailUrl}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-mono text-[#F2EEE6]">{selectedItem.duration || '2:00:00'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8AE62]/10 border border-[#E8AE62]/20 text-[#E8AE62]">
                        {selectedItem.aesthetic.worldArchetype}
                      </span>
                      <span className="text-xs text-[#718096]">{selectedItem.channelTitle}</span>
                      {selectedItem.modelUsed && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E2B3E] text-[#E8AE62] border border-[#283952] flex items-center gap-1">
                          <Cpu className="w-2.5 h-2.5" />
                          <span>{selectedItem.modelUsed.modelId}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-[#F2EEE6] font-display tracking-tight leading-snug">
                      {selectedItem.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {selectedItem.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] text-[10px] text-[#A1AEC0]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Replication Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8AE62] to-[#D97706] text-[#0B1018] text-xs font-bold shadow-lg hover:shadow-[#E8AE62]/20 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Studio Project</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyToActive}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#1E2B3E] hover:bg-[#2A3C55] text-[11px] font-semibold text-[#F2EEE6] transition-colors"
                      title="Load translated prompts into active workbench"
                    >
                      Apply to Active
                    </button>
                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="p-2 rounded-xl bg-[#1E2B3E] hover:bg-[#2A3C55] text-[#A1AEC0] hover:text-[#F2EEE6] transition-colors"
                      title="Copy Full Blueprint Markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div className="flex items-center gap-1.5 border-b border-[#1E2B3E] pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    activeTab === 'blueprint'
                      ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141E2D]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Production Blueprint</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('aesthetic')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    activeTab === 'aesthetic'
                      ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141E2D]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Visual Atmosphere</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('kinematics')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    activeTab === 'kinematics'
                      ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141E2D]'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Kinematics & Loop Safety</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('acoustics')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    activeTab === 'acoustics'
                      ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141E2D]'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Acoustic Foley Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('player')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    activeTab === 'player'
                      ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141E2D]'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Video Preview</span>
                </button>
              </div>

              {/* Tab 1: Production Blueprint (The Core Deliverable) */}
              {activeTab === 'blueprint' && (
                <div className="space-y-6">
                  {/* Director's Vision Card */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#E8AE62] uppercase tracking-wider">
                      <Compass className="w-4 h-4" />
                      <span>Director's Creative Synthesis (Aesthetic Noise Translation)</span>
                    </div>
                    <p className="text-xs text-[#F2EEE6] leading-relaxed">
                      {selectedItem.blueprint.directorVision}
                    </p>
                  </div>

                  {/* Production Prompts Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1AEC0]">
                        Coordinated Production Prompts
                      </h3>
                      <span className="text-[11px] text-[#718096]">
                        Optimized for Midjourney v6.1, Runway Gen-3 & Suno
                      </span>
                    </div>

                    {/* Image Prompt */}
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#E8AE62] flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          <span>1. Master Visual Image Prompt (Midjourney / Flux)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedItem.blueprint.imagePrompt, 'img-prompt')}
                          className="flex items-center gap-1 text-[11px] text-[#A1AEC0] hover:text-[#E8AE62] transition-colors"
                        >
                          {copiedKey === 'img-prompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'img-prompt' ? 'Copied' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                      <p className="text-xs font-mono text-[#F2EEE6] bg-[#141E2D]/60 p-3 rounded-lg leading-relaxed select-all">
                        {selectedItem.blueprint.imagePrompt}
                      </p>
                    </div>

                    {/* Video Prompt */}
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#E8AE62] flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5" />
                          <span>2. Video Animation Prompt (Runway Gen-3 / Kling 1.5)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedItem.blueprint.videoPrompt, 'vid-prompt')}
                          className="flex items-center gap-1 text-[11px] text-[#A1AEC0] hover:text-[#E8AE62] transition-colors"
                        >
                          {copiedKey === 'vid-prompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'vid-prompt' ? 'Copied' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                      <p className="text-xs font-mono text-[#F2EEE6] bg-[#141E2D]/60 p-3 rounded-lg leading-relaxed select-all">
                        {selectedItem.blueprint.videoPrompt}
                      </p>
                    </div>

                    {/* Music Prompt */}
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#E8AE62] flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5" />
                          <span>3. Music Score & Foley Prompt (Suno / Udio / Sound Engine)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedItem.blueprint.musicPrompt, 'mus-prompt')}
                          className="flex items-center gap-1 text-[11px] text-[#A1AEC0] hover:text-[#E8AE62] transition-colors"
                        >
                          {copiedKey === 'mus-prompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'mus-prompt' ? 'Copied' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                      <p className="text-xs font-mono text-[#F2EEE6] bg-[#141E2D]/60 p-3 rounded-lg leading-relaxed select-all">
                        {selectedItem.blueprint.musicPrompt}
                      </p>
                    </div>
                  </div>

                  {/* Production Checklist & Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Checklist */}
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2.5">
                      <div className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#E8AE62]" />
                        <span>Production Readiness Checklist</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#F2EEE6]">
                        {selectedItem.blueprint.productionChecklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8AE62] shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cross-Studio Actions */}
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider flex items-center gap-1.5">
                          <Share2 className="w-4 h-4 text-[#E8AE62]" />
                          <span>Studio Integration</span>
                        </div>
                        <p className="text-[11px] text-[#718096]">
                          Save reference assets and lessons across your workspace.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleSaveToReferenceLibrary}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#141E2D] hover:bg-[#1E2B3E] text-xs font-semibold text-[#F2EEE6] border border-[#1E2B3E] transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#E8AE62]" />
                          <span>Save to Reference Library</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRecordLessons}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#141E2D] hover:bg-[#1E2B3E] text-xs font-semibold text-[#F2EEE6] border border-[#1E2B3E] transition-colors"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-[#E8AE62]" />
                          <span>Record Lessons into Experience Memory</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Visual Atmosphere Deconstruction */}
              {activeTab === 'aesthetic' && (
                <div className="space-y-6">
                  {/* Three-Plane Depth Hierarchy */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8AE62] flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>Three-Plane Depth Staging</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[#141E2D]/60 border border-[#1E2B3E] space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#718096]">Foreground Plane</span>
                        <p className="text-xs text-[#F2EEE6] leading-relaxed">
                          {selectedItem.aesthetic.depthPlanes.foreground}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#141E2D]/60 border border-[#1E2B3E] space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#E8AE62]">Middle Ground (Focus)</span>
                        <p className="text-xs text-[#F2EEE6] leading-relaxed">
                          {selectedItem.aesthetic.depthPlanes.middleGround}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#141E2D]/60 border border-[#1E2B3E] space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#718096]">Background / Horizon</span>
                        <p className="text-xs text-[#F2EEE6] leading-relaxed">
                          {selectedItem.aesthetic.depthPlanes.background}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lighting & Color Architecture */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lighting Architecture */}
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2.5">
                      <h4 className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-[#E8AE62]" />
                        <span>Lighting Architecture</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                          <span className="text-[#718096]">Primary Light:</span>
                          <span className="text-[#F2EEE6] font-medium">{selectedItem.aesthetic.lighting.primarySource}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                          <span className="text-[#718096]">Color Temperature:</span>
                          <span className="text-[#E8AE62] font-medium">{selectedItem.aesthetic.lighting.colorTemperature}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                          <span className="text-[#718096]">Volumetric Rays / Flames:</span>
                          <span className="text-[#F2EEE6]">
                            {selectedItem.aesthetic.lighting.volumetricRays ? 'Volumetric Rays Active' : 'Diffused'} •{' '}
                            {selectedItem.aesthetic.lighting.flickeringFlames ? 'Flickering Embers' : 'Static Light'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A1AEC0] italic pt-1">
                          {selectedItem.aesthetic.lighting.notes}
                        </p>
                      </div>
                    </div>

                    {/* Color Palette Swatches */}
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2.5">
                      <h4 className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-[#E8AE62]" />
                        <span>Extracted Color Palette</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {selectedItem.aesthetic.colorPalette.map((swatch, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-[#141E2D]/60 border border-[#1E2B3E]"
                          >
                            <span
                              className="w-7 h-7 rounded-md shrink-0 shadow-inner border border-white/10"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-[#F2EEE6] truncate">{swatch.name}</div>
                              <div className="text-[10px] font-mono text-[#E8AE62]">{swatch.hex}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Materials & Atmospheric Effects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                      <h4 className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider">
                        Materials & Textures
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.aesthetic.materialsAndTextures.map((mat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#141E2D] border border-[#1E2B3E] text-xs text-[#F2EEE6]"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                      <h4 className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider">
                        Atmospheric Physics & FX
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.aesthetic.atmosphericEffects.map((fx, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#141E2D] border border-[#1E2B3E] text-xs text-[#E8AE62]"
                          >
                            {fx}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Kinematics & Loop Analysis */}
              {activeTab === 'kinematics' && (
                <div className="space-y-6">
                  {/* Motion Physics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#718096]">Camera Movement</span>
                      <div className="text-sm font-bold text-[#F2EEE6] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#E8AE62]" />
                        <span>{selectedItem.kinematics.cameraBehavior}</span>
                      </div>
                      <p className="text-[11px] text-[#A1AEC0] pt-1">
                        Locked tripod ensures zero pixel shift on looping boundaries.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#718096]">Motion Pacing</span>
                      <div className="text-sm font-bold text-[#F2EEE6] flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#E8AE62]" />
                        <span>{selectedItem.kinematics.motionPacing}</span>
                      </div>
                      <p className="text-[11px] text-[#A1AEC0] pt-1">
                        Gentle frequency preserves viewer relaxation and sleep state.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#718096]">Estimated Loop Cycle</span>
                      <div className="text-sm font-bold text-[#F2EEE6] flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 text-[#E8AE62]" />
                        <span>~{selectedItem.kinematics.loopCycleEstimateSeconds} Seconds</span>
                      </div>
                      <p className="text-[11px] text-[#A1AEC0] pt-1">
                        Optimal loop window for Runway Gen-3 and Kling video models.
                      </p>
                    </div>
                  </div>

                  {/* Active Dynamic Subjects */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                    <h4 className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider">
                      Dynamic Motion Subjects (What Moves)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {selectedItem.kinematics.motionSubjects.map((sub, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#141E2D]/60 border border-[#1E2B3E] text-xs text-[#F2EEE6] flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#E8AE62]" />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seam Hazards & Looping Safeguards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        <span>Identified Loop Seam Hazards</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-red-200/90">
                        {selectedItem.kinematics.loopSeamHazards.map((hazard, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-400 font-bold">•</span>
                            <span>{hazard}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Cinematic Loop Safeguards</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-emerald-200/90">
                        {selectedItem.kinematics.cinematicRules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Acoustic & Foley Profile */}
              {activeTab === 'acoustics' && (
                <div className="space-y-6">
                  {/* Acoustic Header Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#718096]">Musical Style</span>
                      <div className="text-xs font-bold text-[#F2EEE6]">{selectedItem.acoustics.musicalStyle}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#718096]">Tempo & Meter</span>
                      <div className="text-xs font-bold text-[#E8AE62]">{selectedItem.acoustics.tempoBpmRange}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#718096]">Core Moods</span>
                      <div className="text-xs font-bold text-[#F2EEE6]">
                        {selectedItem.acoustics.keyMoods?.join(', ') || 'Calm, Immersive'}
                      </div>
                    </div>
                  </div>

                  {/* Layered Foley Mix Breakdown */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8AE62] flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4" />
                      <span>Environmental Foley Mix Layering</span>
                    </h3>
                    <div className="space-y-3">
                      {selectedItem.acoustics.foleyLayers.map((layer, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-[#F2EEE6]">{layer.name}</span>
                            <span className="font-mono text-[#E8AE62] font-bold">{layer.percentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#141E2D] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E8AE62] to-[#D97706] rounded-full"
                              style={{ width: `${layer.percentage}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-[#718096]">{layer.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mastering & Ear Fatigue Advice */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                    <h4 className="text-xs font-bold text-[#A1AEC0] uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-[#E8AE62]" />
                      <span>Frequency Curve & Ear Fatigue Mastering</span>
                    </h4>
                    <p className="text-xs text-[#F2EEE6] leading-relaxed">
                      {selectedItem.acoustics.frequencyMasteringNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 5: Embedded YouTube Video Preview */}
              {activeTab === 'player' && (
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#1E2B3E] shadow-xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${selectedItem.videoId}?rel=0&modestbranding=1`}
                      title={selectedItem.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#718096]">
                    <span>Original Source: {selectedItem.channelTitle}</span>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#E8AE62] hover:underline"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#101722] border border-[#1E2B3E] space-y-4">
              <Youtube className="w-12 h-12 text-[#E8AE62]/40 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#F2EEE6]">No Video Selected</h3>
                <p className="text-xs text-[#A1AEC0] max-w-sm mx-auto">
                  Select a reference video from the left library, or paste a public YouTube URL above to run AI reverse-engineering.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
