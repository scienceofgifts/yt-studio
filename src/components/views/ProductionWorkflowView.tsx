import React, { useState, useMemo } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { StorageService } from '../../services/storage';
import {
  Project,
  PipelineStage,
  ProductionChecklist,
  ProductionMetadata,
  ReferenceItem,
  LessonLearnedItem,
} from '../../types/ambience';
import { WORLDS_CATALOG } from '../../data/catalog';
import { WorldVisual } from '../../data/worldVisuals';
import { VisualArtwork } from '../common/VisualArtwork';
import {
  Workflow,
  Plus,
  Play,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Bookmark,
  Layers,
  FileText,
  Video,
  Music,
  Share2,
  Youtube,
  BarChart3,
  Sliders,
  ChevronRight,
  ExternalLink,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Search,
  AlertCircle,
  Lightbulb,
  Check,
  Edit3,
  ArrowRight,
  FileDown,
} from 'lucide-react';

interface StageDefinition {
  id: PipelineStage;
  stepNumber: number;
  label: string;
  tagline: string;
  description: string;
  destinationView: 'create' | 'references' | 'history' | 'production-intelligence';
  workflowStage?: 'concept' | 'refine' | 'video' | 'music' | 'prompts';
}

const PIPELINE_STAGES: StageDefinition[] = [
  {
    id: 'concept',
    stepNumber: 1,
    label: 'Concept',
    tagline: 'World, Location & Creative Direction',
    description: 'Select fantasy world archetype, setting type, season, and core time of day atmosphere.',
    destinationView: 'create',
    workflowStage: 'concept',
  },
  {
    id: 'references',
    stepNumber: 2,
    label: 'References',
    tagline: 'Curate & Assign Visual Knowledge',
    description: 'Select reference artworks and define roles (lighting, composition, mood, color palette).',
    destinationView: 'references',
  },
  {
    id: 'scene-design',
    stepNumber: 3,
    label: 'Scene Design',
    tagline: 'Camera, Lighting & Environmental Elements',
    description: 'Fine-tune water physics, sky details, locked camera tripod framing, and warmth balance.',
    destinationView: 'create',
    workflowStage: 'refine',
  },
  {
    id: 'prompt-studio',
    stepNumber: 4,
    label: 'Prompt Studio',
    tagline: 'Deterministic Compilation & AI Refinement',
    description: 'Compile deterministic prompt baselines and generate nuanced AI prompt variations.',
    destinationView: 'create',
    workflowStage: 'prompts',
  },
  {
    id: 'generation',
    stepNumber: 5,
    label: 'Generation',
    tagline: 'Image, Video & Music Model Generation',
    description: 'Generate keyframe master in Midjourney/Flux, animate in Runway/Luma, create binaural music.',
    destinationView: 'create',
    workflowStage: 'video',
  },
  {
    id: 'assembly',
    stepNumber: 6,
    label: 'Assembly & Loop',
    tagline: 'Multi-layer Foley & Seamless Looping',
    description: 'Audit video for edge tearing, layer crackling hearth embers with rain, verify 3-hour loop.',
    destinationView: 'create',
    workflowStage: 'music',
  },
  {
    id: 'youtube-readiness',
    stepNumber: 7,
    label: 'YouTube Readiness',
    tagline: 'Metadata, SEO Titles, Tags & Pinned Comments',
    description: 'Package title, chapters, description, tags, and production checklist for Aesthetic Noise.',
    destinationView: 'create',
  },
  {
    id: 'published',
    stepNumber: 8,
    label: 'Published',
    tagline: 'Live On YouTube & Metric Tracking',
    description: 'Track real-world audience retention, view velocity, and record lessons in Production Intelligence.',
    destinationView: 'production-intelligence',
  },
];

export const ProductionWorkflowView: React.FC = () => {
  const {
    projects,
    activeProject,
    switchProject,
    createNewProject,
    duplicateProject,
    deleteProject,
    setActiveView,
    setWorkflowStage,
    updateProject,
    showToast,
  } = useAmbience();

  // View state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected project for deep pipeline inspector
  const [inspectingProjectId, setInspectingProjectId] = useState<string>(activeProject.id);

  // New Production modal
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTargetDuration, setNewTargetDuration] = useState<number>(180);

  // Available references and lessons for context
  const references = useMemo(() => StorageService.getReferences(), []);
  const lessons = useMemo(() => StorageService.getLessons(), []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (!showArchived && p.archived) return false;
      if (showArchived && !p.archived) return false;
      if (filterStage !== 'all' && (p.stage || 'concept') !== filterStage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesWorld = (p.config.customWorldName || p.config.worldId).toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesWorld) return false;
      }
      return true;
    });
  }, [projects, showArchived, filterStage, searchQuery]);

  const inspectedProject = useMemo(() => {
    return projects.find((p) => p.id === inspectingProjectId) || activeProject;
  }, [projects, inspectingProjectId, activeProject]);

  // Calculate project pipeline completion percent
  const getStageProgress = (proj: Project): number => {
    const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === (proj.stage || 'concept'));
    const checklist = proj.checklist;
    let checkBonus = 0;
    if (checklist) {
      const items = [
        checklist.imageGenerated,
        checklist.videoLooped,
        checklist.audioLayered,
        checklist.metadataDrafted,
        checklist.qualityChecked,
        checklist.exported,
      ];
      const completed = items.filter(Boolean).length;
      checkBonus = (completed / items.length) * 20;
    }
    const baseProgress = Math.min(80, Math.round(((currentIdx + 1) / PIPELINE_STAGES.length) * 80));
    return Math.min(100, Math.round(baseProgress + checkBonus));
  };

  const getNextRecommendedAction = (proj: Project): { label: string; action: () => void; stageId: PipelineStage } => {
    const stage = proj.stage || 'concept';
    switch (stage) {
      case 'concept':
        return {
          label: 'Select Reference Images',
          stageId: 'references',
          action: () => {
            switchProject(proj.id);
            setActiveView('references');
          },
        };
      case 'references':
        return {
          label: 'Design Scene Parameters',
          stageId: 'scene-design',
          action: () => {
            switchProject(proj.id);
            setWorkflowStage('refine');
            setActiveView('create');
          },
        };
      case 'scene-design':
        return {
          label: 'Generate Studio Prompts',
          stageId: 'prompt-studio',
          action: () => {
            switchProject(proj.id);
            setWorkflowStage('prompts');
            setActiveView('create');
          },
        };
      case 'prompt-studio':
        return {
          label: 'Run Asset Generation',
          stageId: 'generation',
          action: () => {
            switchProject(proj.id);
            setWorkflowStage('video');
            setActiveView('create');
          },
        };
      case 'generation':
        return {
          label: 'Audit & Loop Assembly',
          stageId: 'assembly',
          action: () => {
            switchProject(proj.id);
            setWorkflowStage('music');
            setActiveView('create');
          },
        };
      case 'assembly':
        return {
          label: 'Draft YouTube Metadata',
          stageId: 'youtube-readiness',
          action: () => {
            setInspectingProjectId(proj.id);
          },
        };
      case 'youtube-readiness':
        return {
          label: 'Publish & Log Intelligence',
          stageId: 'published',
          action: () => {
            setActiveView('production-intelligence');
          },
        };
      case 'published':
      default:
        return {
          label: 'Review Performance Intelligence',
          stageId: 'published',
          action: () => {
            setActiveView('production-intelligence');
          },
        };
    }
  };

  const handleCreateNewProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = createNewProject(newTitle.trim(), newDescription.trim());
    if (created) {
      const updated: Project = {
        ...created,
        stage: 'concept',
        productionMetadata: {
          youtubeTitle: `${newTitle.trim()} | Relaxing Ambience for Study & Deep Sleep`,
          youtubeDescription: `Immerse yourself in pure atmospheric stillness crafted by Aesthetic Noise.\n\nRelax and study with carefully balanced acoustics and cinematic visual design.`,
          youtubeTags: ['ambience', 'study music', 'aesthetic noise', 'sleep sounds', 'binaural'],
          targetDurationMinutes: newTargetDuration,
        },
      };
      updateProject(updated);
      setInspectingProjectId(created.id);
    }
    setShowNewModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleAdvanceStage = (proj: Project, nextStage: PipelineStage) => {
    const completedStages = new Set(proj.completedStages || []);
    if (proj.stage) completedStages.add(proj.stage);
    const updated: Project = {
      ...proj,
      stage: nextStage,
      completedStages: Array.from(completedStages),
      updatedAt: Date.now(),
    };
    updateProject(updated);
    showToast(`Advanced to ${nextStage.replace('-', ' ')}`);
  };

  const handleToggleChecklist = (proj: Project, key: keyof ProductionChecklist) => {
    const current = proj.checklist || {
      imageGenerated: false,
      videoLooped: false,
      audioLayered: false,
      metadataDrafted: false,
      qualityChecked: false,
      exported: false,
    };
    const updated: Project = {
      ...proj,
      checklist: {
        ...current,
        [key]: !current[key],
      },
      updatedAt: Date.now(),
    };
    updateProject(updated);
  };

  const handleToggleArchive = (id: string) => {
    const res = StorageService.toggleArchiveProject(id);
    if (res) {
      updateProject(res);
      showToast(res.archived ? 'Project archived' : 'Project restored from archive');
    }
  };

  const handleMetadataChange = (
    proj: Project,
    field: keyof ProductionMetadata,
    value: string | number | string[]
  ) => {
    const currMeta = proj.productionMetadata || {};
    const updated: Project = {
      ...proj,
      productionMetadata: {
        ...currMeta,
        [field]: value,
      },
      updatedAt: Date.now(),
    };
    updateProject(updated);
  };

  const handleExportYouTubePackage = (proj: Project) => {
    const meta = proj.productionMetadata || {};
    const packageText = `=====================================================
AESTHETIC NOISE — PRODUCTION RELEASE PACKAGE
Project: ${proj.name}
World: ${proj.config.customWorldName || proj.config.worldId}
Generated At: ${new Date().toISOString()}
Target Duration: ${meta.targetDurationMinutes || 180} minutes
=====================================================

1. YOUTUBE VIDEO TITLE
${meta.youtubeTitle || `${proj.name} | 3 Hours Ambience`}

2. VIDEO DESCRIPTION
${meta.youtubeDescription || 'No description provided.'}

3. YOUTUBE TAGS (COMMA-SEPARATED)
${(meta.youtubeTags || ['ambience', 'aesthetic noise', 'study music', 'binaural']).join(', ')}

4. PINNED COMMENT / TIMESTAMPS
${meta.pinnedComment || '0:00 - Immersion Start\n1:00:00 - Deep Focus\n2:00:00 - Nightfall Sleep'}

5. KEYFRAME PROMPT
${proj.drafts.imagePrompt}

6. VIDEO MOTION PROMPT
${proj.drafts.videoPrompt}

7. MUSIC & FOLEY PROMPT
${proj.drafts.musicPrompt}

8. APPLIED PRODUCTION CHECKLIST
- Image Keyframe Generated: ${proj.checklist?.imageGenerated ? 'YES' : 'NO'}
- Video Seamless Loop Audited: ${proj.checklist?.videoLooped ? 'YES' : 'NO'}
- Layered Audio & Foley Mixed: ${proj.checklist?.audioLayered ? 'YES' : 'NO'}
- Metadata Drafted: ${proj.checklist?.metadataDrafted ? 'YES' : 'NO'}
- Visual Quality Checked: ${proj.checklist?.qualityChecked ? 'YES' : 'NO'}
- Master File Exported: ${proj.checklist?.exported ? 'YES' : 'NO'}
`;

    const blob = new Blob([packageText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${proj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-youtube-package.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported YouTube release package');
  };

  // Lessons relevant to the inspected project
  const relevantLessons = useMemo(() => {
    if (!inspectedProject) return [];
    return lessons.filter((l) => {
      if (l.category === 'Looping') return true;
      if (inspectedProject.config.water.enabled && l.category === 'Water') return true;
      if (inspectedProject.config.lighting.primary && l.category === 'Lighting') return true;
      return false;
    }).slice(0, 3);
  }, [lessons, inspectedProject]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-28 text-[#F2EEE6]">
      {/* Hero Header & Pipeline Overview */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E2B3E]">
          <div>
            <div className="flex items-center gap-2.5 text-[#E8AE62] text-xs font-mono tracking-wider uppercase mb-1">
              <Workflow className="w-4 h-4" />
              <span>Aesthetic Noise Production Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight font-display text-[#F2EEE6]">
              Production Workflow
            </h1>
            <p className="text-xs md:text-sm text-[#A1AEC0] mt-1 max-w-2xl">
              End-to-end guided pipeline for producing, publishing, and learning from cinematic YouTube ambience productions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('video-lab')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#192434] hover:bg-[#223146] border border-[#283952] text-xs font-semibold text-[#F2EEE6] transition-all"
              title="Reverse-engineer YouTube videos into original production blueprints"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>Reference Video Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8AE62] hover:bg-[#F2BE7D] text-[#0B1018] font-semibold text-xs transition-all shadow-lg shadow-[#E8AE62]/10 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Production</span>
            </button>
          </div>
        </div>

        {/* Pipeline Stage Bar */}
        <div className="mt-6 pt-2 overflow-x-auto pb-2">
          <div className="flex items-center min-w-[780px] justify-between relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#1E2B3E] -z-0" />
            {PIPELINE_STAGES.map((st) => {
              const activeCount = projects.filter((p) => !p.archived && (p.stage || 'concept') === st.id).length;
              const isSelectedFilter = filterStage === st.id;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilterStage(isSelectedFilter ? 'all' : st.id)}
                  className={`flex flex-col items-center group relative z-10 focus:outline-none transition-transform ${
                    isSelectedFilter ? 'scale-105' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold border transition-all ${
                      isSelectedFilter
                        ? 'bg-[#E8AE62] text-[#0B1018] border-[#E8AE62] ring-4 ring-[#E8AE62]/20'
                        : activeCount > 0
                        ? 'bg-[#192434] text-[#E8AE62] border-[#E8AE62]/50 hover:border-[#E8AE62]'
                        : 'bg-[#101722] text-[#A1AEC0] border-[#1E2B3E] group-hover:border-[#283952]'
                    }`}
                  >
                    {st.stepNumber}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-medium tracking-wide transition-colors ${
                      isSelectedFilter
                        ? 'text-[#E8AE62] font-semibold'
                        : 'text-[#A1AEC0] group-hover:text-[#F2EEE6]'
                    }`}
                  >
                    {st.label}
                  </span>
                  <span className="text-[10px] text-[#A1AEC0]/70 font-mono">
                    {activeCount > 0 ? `${activeCount} in stage` : '—'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Projects Stream + Right Deep Pipeline Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Projects Library & Stage Filter (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Controls Bar: Search, Stage Filter & Layout Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101722] border border-[#1E2B3E] p-3 rounded-2xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#A1AEC0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search productions, worlds, atmospheres..."
                className="w-full bg-transparent text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/60 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Stage Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="bg-[#0B1018] border border-[#1E2B3E] rounded-xl px-2.5 py-1.5 text-xs text-[#A1AEC0] focus:border-[#E8AE62] focus:outline-none capitalize"
                >
                  <option value="all">All Stages ({projects.filter((p) => !p.archived).length})</option>
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stepNumber}. {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Archived Toggle */}
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
                  showArchived
                    ? 'bg-[#192434] text-[#E8AE62] border-[#E8AE62]'
                    : 'text-[#A1AEC0] border-[#1E2B3E] hover:text-[#F2EEE6]'
                }`}
                title="Toggle Archived Productions"
              >
                <Archive className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Archived</span>
              </button>

              {/* View Switcher */}
              <div className="flex items-center border border-[#1E2B3E] rounded-xl bg-[#0B1018] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg ${
                    viewMode === 'cards' ? 'bg-[#192434] text-[#E8AE62]' : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg ${
                    viewMode === 'table' ? 'bg-[#192434] text-[#E8AE62]' : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                  title="Compact List View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div className="p-10 border border-dashed border-[#1E2B3E] rounded-2xl text-center bg-[#101722]/40">
              <Workflow className="w-8 h-8 text-[#A1AEC0]/40 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-[#F2EEE6]">No productions found</h3>
              <p className="text-xs text-[#A1AEC0] mt-1 max-w-sm mx-auto">
                {showArchived
                  ? 'No productions are currently in the archive.'
                  : 'Start a new production or clear current stage filters.'}
              </p>
              {!showArchived && (
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#E8AE62] text-[#0B1018] text-xs font-semibold hover:bg-[#F2BE7D]"
                >
                  Create New Production
                </button>
              )}
            </div>
          )}

          {/* Cards View Layout */}
          {viewMode === 'cards' && (
            <div className="space-y-4">
              {filteredProjects.map((proj) => {
                const currentStage = PIPELINE_STAGES.find((s) => s.id === (proj.stage || 'concept')) || PIPELINE_STAGES[0];
                const progress = getStageProgress(proj);
                const nextAction = getNextRecommendedAction(proj);
                const isInspected = inspectedProject.id === proj.id;
                const isActive = activeProject.id === proj.id;
                const world = WORLDS_CATALOG.find((w) => w.id === proj.config.worldId);

                return (
                  <div
                    key={proj.id}
                    onClick={() => setInspectingProjectId(proj.id)}
                    className={`group cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden bg-[#101722] hover:border-[#E8AE62]/60 ${
                      isInspected
                        ? 'border-[#E8AE62] ring-1 ring-[#E8AE62]/40 shadow-xl shadow-black/40'
                        : 'border-[#1E2B3E]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-stretch">
                      {/* Visual Thumbnail */}
                      <div className="sm:w-44 h-36 sm:h-auto shrink-0 relative bg-[#0B1018] overflow-hidden">
                        <VisualArtwork
                          targetKey={`world-${proj.config.worldId}`}
                          targetLabel={world?.name || proj.name}
                          defaultVisual={
                            <WorldVisual
                              worldId={proj.config.worldId}
                            />
                          }
                          className="w-full h-full object-cover"
                          showControls={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* Stage Badge on thumbnail */}
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-[#0B1018]/90 border border-[#283952] text-[10px] font-mono text-[#E8AE62] flex items-center gap-1.5 backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8AE62]" />
                          <span>Stage {currentStage.stepNumber}: {currentStage.label}</span>
                        </div>

                        {isActive && (
                          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Active in Studio</span>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-[#F2EEE6] font-display group-hover:text-[#E8AE62] transition-colors leading-tight">
                                {proj.name}
                              </h3>
                              <p className="text-xs text-[#A1AEC0] mt-1 line-clamp-1">
                                {proj.description || world?.tagline || 'Atmospheric video production'}
                              </p>
                            </div>

                            {/* Card Actions Menu */}
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => duplicateProject(proj.id)}
                                className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] rounded-lg hover:bg-[#192434] transition-colors"
                                title="Duplicate Production"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleArchive(proj.id)}
                                className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] rounded-lg hover:bg-[#192434] transition-colors"
                                title={proj.archived ? 'Restore' : 'Archive'}
                              >
                                {proj.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                              </button>
                              {projects.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => deleteProject(proj.id)}
                                  className="p-1.5 text-[#A1AEC0] hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                                  title="Delete Production"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Atmospheric Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-[#A1AEC0]">
                            <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] capitalize">
                              {proj.config.season}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] capitalize">
                              {proj.config.primaryWeather}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] capitalize">
                              {proj.config.lighting.primary.replace('-', ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] font-mono text-[#E8AE62]">
                              {proj.config.visualStyle.aspectRatio}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Progress + Recommended Action */}
                        <div className="mt-4 pt-3 border-t border-[#1E2B3E] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-[#0B1018] rounded-full h-1.5 overflow-hidden border border-[#1E2B3E]">
                              <div
                                className="bg-[#E8AE62] h-full rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-[#A1AEC0]">{progress}% complete</span>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                switchProject(proj.id);
                                nextAction.action();
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#192434] hover:bg-[#223146] border border-[#283952] text-xs font-semibold text-[#E8AE62] transition-colors"
                            >
                              <span>Next: {nextAction.label}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                switchProject(proj.id);
                                setActiveView('create');
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] transition-colors"
                              title="Resume in Studio Canvas"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Compact List Layout */}
          {viewMode === 'table' && (
            <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2B3E] bg-[#0B1018] text-[#A1AEC0] font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Production</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Progress</th>
                    <th className="py-3 px-3">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B3E]">
                  {filteredProjects.map((proj) => {
                    const currentStage = PIPELINE_STAGES.find((s) => s.id === (proj.stage || 'concept')) || PIPELINE_STAGES[0];
                    const progress = getStageProgress(proj);
                    const isInspected = inspectedProject.id === proj.id;

                    return (
                      <tr
                        key={proj.id}
                        onClick={() => setInspectingProjectId(proj.id)}
                        className={`cursor-pointer hover:bg-[#151F2E] transition-colors ${
                          isInspected ? 'bg-[#192434]/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#F2EEE6]">{proj.name}</div>
                          <div className="text-[11px] text-[#A1AEC0]">{proj.config.customWorldName || proj.config.worldId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] text-[10px] font-mono text-[#E8AE62]">
                            {currentStage.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#0B1018] rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#E8AE62] h-full" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-[#A1AEC0]">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#A1AEC0] font-mono text-[11px]">
                          {new Date(proj.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                switchProject(proj.id);
                                setActiveView('create');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#192434] text-[#E8AE62] hover:bg-[#223146] text-[11px] font-medium"
                            >
                              Resume
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateProject(proj.id)}
                              className="p-1 text-[#A1AEC0] hover:text-[#E8AE62]"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Deep Production Pipeline Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-5 shadow-xl relative">
            {/* Inspector Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#1E2B3E]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#E8AE62] flex items-center gap-1.5">
                  <Sliders className="w-3 h-3" />
                  <span>Pipeline Inspector</span>
                </div>
                <h2 className="text-base font-semibold text-[#F2EEE6] font-display mt-0.5">
                  {inspectedProject.name}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleExportYouTubePackage(inspectedProject)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#192434] hover:bg-[#223146] border border-[#283952] text-[11px] font-medium text-[#E8AE62] transition-colors"
                  title="Export complete YouTube title, description, tags & checklist as text"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export Package</span>
                </button>
              </div>
            </div>

            {/* Stage Progress Roadmap */}
            <div className="mt-4">
              <div className="text-[11px] font-medium text-[#A1AEC0] mb-2.5 flex items-center justify-between">
                <span>Production Stage Status</span>
                <span className="font-mono text-[#E8AE62] text-[10px]">
                  Step {PIPELINE_STAGES.findIndex((s) => s.id === (inspectedProject.stage || 'concept')) + 1} of 8
                </span>
              </div>

              <div className="space-y-1.5">
                {PIPELINE_STAGES.map((st) => {
                  const currentStageId = inspectedProject.stage || 'concept';
                  const isCurrent = currentStageId === st.id;
                  const isCompleted = (inspectedProject.completedStages || []).includes(st.id);

                  return (
                    <div
                      key={st.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        isCurrent
                          ? 'bg-[#192434] border border-[#E8AE62]/50 text-[#F2EEE6]'
                          : isCompleted
                          ? 'bg-[#0B1018]/50 text-[#A1AEC0]'
                          : 'text-[#A1AEC0]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleAdvanceStage(inspectedProject, st.id)}
                          className="shrink-0 focus:outline-none"
                          title="Set as current active stage"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <div className="w-4 h-4 rounded-full border-2 border-[#E8AE62] flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#E8AE62]" />
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-[#283952]" />
                          )}
                        </button>
                        <div className="truncate">
                          <span className={`font-medium ${isCurrent ? 'text-[#E8AE62]' : ''}`}>
                            {st.stepNumber}. {st.label}
                          </span>
                          <span className="text-[10px] text-[#A1AEC0] block truncate">
                            {st.tagline}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              switchProject(inspectedProject.id);
                              if (st.workflowStage) setWorkflowStage(st.workflowStage);
                              setActiveView(st.destinationView);
                            }}
                            className="px-2 py-1 rounded-md bg-[#E8AE62] hover:bg-[#F2BE7D] text-[#0B1018] text-[10px] font-bold flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality & Production Checklist */}
            <div className="mt-6 pt-5 border-t border-[#1E2B3E]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#F2EEE6] font-display">
                  Release Checklist
                </span>
                <span className="text-[10px] font-mono text-[#A1AEC0]">
                  Required for YouTube publish
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'imageGenerated', label: 'Keyframe Approved' },
                  { key: 'videoLooped', label: 'Loop Seams Audited' },
                  { key: 'audioLayered', label: 'Layered Foley Mixed' },
                  { key: 'metadataDrafted', label: 'Metadata Drafted' },
                  { key: 'qualityChecked', label: '4K Render Inspected' },
                  { key: 'exported', label: 'Exported Master' },
                ].map((item) => {
                  const checklist = inspectedProject.checklist || {
                    imageGenerated: false,
                    videoLooped: false,
                    audioLayered: false,
                    metadataDrafted: false,
                    qualityChecked: false,
                    exported: false,
                  };
                  const isChecked = checklist[item.key as keyof ProductionChecklist];

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleChecklist(inspectedProject, item.key as keyof ProductionChecklist)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:border-[#283952]'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-[#283952]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-medium truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* YouTube Packaging & SEO Metadata Editor */}
            <div className="mt-6 pt-5 border-t border-[#1E2B3E]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#F2EEE6] font-display flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-rose-500" />
                  YouTube Video Metadata
                </span>
                <span className="text-[10px] font-mono text-[#E8AE62]">
                  Target: {inspectedProject.productionMetadata?.targetDurationMinutes || 180} min
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-[#A1AEC0] block mb-1">
                    YouTube Optimized Title
                  </label>
                  <input
                    type="text"
                    value={inspectedProject.productionMetadata?.youtubeTitle || ''}
                    onChange={(e) => handleMetadataChange(inspectedProject, 'youtubeTitle', e.target.value)}
                    placeholder="Gryffindor Common Room Rain & Hearth Ambience | 3 Hours Study & Sleep"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] text-xs focus:border-[#E8AE62] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A1AEC0] block mb-1">
                    Video Description & Layer Notes
                  </label>
                  <textarea
                    rows={3}
                    value={inspectedProject.productionMetadata?.youtubeDescription || ''}
                    onChange={(e) => handleMetadataChange(inspectedProject, 'youtubeDescription', e.target.value)}
                    placeholder="Immerse yourself in 3 hours of rain tapping on stone windows..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] text-xs focus:border-[#E8AE62] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A1AEC0] block mb-1">
                    Pinned Comment & Chapters
                  </label>
                  <textarea
                    rows={2}
                    value={inspectedProject.productionMetadata?.pinnedComment || ''}
                    onChange={(e) => handleMetadataChange(inspectedProject, 'pinnedComment', e.target.value)}
                    placeholder="Timestamps: 0:00 - Heavy Rain, 1:00:00 - Night Hearth..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] text-xs focus:border-[#E8AE62] focus:outline-none resize-none font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Experience Memory Insights applied to this production */}
            {relevantLessons.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#1E2B3E]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8AE62] mb-3">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Applied Experience Lessons</span>
                </div>

                <div className="space-y-2">
                  {relevantLessons.map((l) => (
                    <div
                      key={l.id}
                      className="p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[11px]"
                    >
                      <div className="flex items-center justify-between text-[#E8AE62] font-medium">
                        <span>{l.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#192434] text-[#A1AEC0]">
                          {l.category}
                        </span>
                      </div>
                      <p className="text-[#A1AEC0] mt-1 leading-relaxed text-[10px]">
                        {l.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Production Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-[#F2EEE6] font-display flex items-center gap-2">
                <Workflow className="w-4 h-4 text-[#E8AE62]" />
                New Production Pipeline
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-[#A1AEC0] hover:text-[#F2EEE6] text-xs font-mono"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-[#A1AEC0] mb-5">
              Initialize a production cycle for Aesthetic Noise with full pipeline tracking.
            </p>

            <form onSubmit={handleCreateNewProduction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1AEC0] mb-1.5">
                  Production Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Autumn Hearth at Bag End"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:border-[#E8AE62] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1AEC0] mb-1.5">
                  Creative Direction & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Atmosphere goals, target audience, specific mood..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:border-[#E8AE62] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1AEC0] mb-1.5">
                  Target YouTube Duration (Minutes)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 180, 480].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setNewTargetDuration(mins)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono border transition-colors ${
                        newTargetDuration === mins
                          ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
                          : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0]'
                      }`}
                    >
                      {mins / 60} Hours ({mins}m)
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#A1AEC0] hover:text-[#F2EEE6] rounded-xl hover:bg-[#192434] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#E8AE62] text-[#0B1018] hover:bg-[#F2BE7D] transition-colors disabled:opacity-50"
                >
                  Initialize Production
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
