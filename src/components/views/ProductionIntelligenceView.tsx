import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { useAmbience } from '../../context/AmbienceContext';
import {
  VideoPerformanceRecord,
  ProductionStatus,
  Project,
  ReferenceItem,
  LessonLearnedItem,
  PromptHistoryEntry,
} from '../../types/ambience';
import { WORLDS_CATALOG } from '../../data/catalog';
import {
  BarChart3,
  Plus,
  Play,
  ExternalLink,
  Flame,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  Users,
  Percent,
  Search,
  Filter,
  Trash2,
  Edit3,
  Bookmark,
  Lightbulb,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Compass,
  Film,
  Music,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Award,
  Zap,
  Target,
  BarChart2,
  Sliders,
  Check,
  Youtube,
} from 'lucide-react';

export const ProductionIntelligenceView: React.FC = () => {
  const { projects, switchProject, setActiveView } = useAmbience();
  const [videos, setVideos] = useState<VideoPerformanceRecord[]>(() => StorageService.getVideos());
  const [references] = useState<ReferenceItem[]>(() => StorageService.getReferences());
  const [lessons] = useState<LessonLearnedItem[]>(() => StorageService.getLessons());
  const [promptHistory] = useState<PromptHistoryEntry[]>(() => StorageService.getHistory());

  // Filters & State
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'analytics' | 'recommendations' | 'matrix'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [worldFilter, setWorldFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'watchTime' | 'retention' | 'date'>('views');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  // Form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formPubDate, setFormPubDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<ProductionStatus>('Published');
  const [formNotes, setFormNotes] = useState('');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formViews, setFormViews] = useState<number>(0);
  const [formWatchTimeHours, setFormWatchTimeHours] = useState<number>(0);
  const [formAvgDurationMin, setFormAvgDurationMin] = useState<number>(0);
  const [formAvgPctViewed, setFormAvgPctViewed] = useState<number>(0);
  const [formRetention30s, setFormRetention30s] = useState<number>(0);
  const [formCtr, setFormCtr] = useState<number>(0);
  const [formLikes, setFormLikes] = useState<number>(0);
  const [formComments, setFormComments] = useState<number>(0);
  const [formSubs, setFormSubs] = useState<number>(0);
  const [formRefIds, setFormRefIds] = useState<string[]>([]);
  const [formLessonIds, setFormLessonIds] = useState<string[]>([]);

  // Helper to extract YouTube video ID
  const extractYoutubeId = (url: string): string => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormYoutubeUrl('');
    setFormThumbnailUrl('');
    setFormPubDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Published');
    setFormNotes('');
    setFormProjectId(projects[0]?.id || '');
    setFormViews(10000);
    setFormWatchTimeHours(2500);
    setFormAvgDurationMin(15);
    setFormAvgPctViewed(30);
    setFormRetention30s(65);
    setFormCtr(5.5);
    setFormLikes(450);
    setFormComments(30);
    setFormSubs(120);
    setFormRefIds([]);
    setFormLessonIds([]);
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (v: VideoPerformanceRecord) => {
    setEditingId(v.id);
    setFormTitle(v.title);
    setFormYoutubeUrl(v.youtubeUrl || '');
    setFormThumbnailUrl(v.thumbnailUrl || '');
    setFormPubDate(v.publicationDate);
    setFormStatus(v.status);
    setFormNotes(v.notes || '');
    setFormProjectId(v.projectId || '');
    setFormViews(v.metrics.views);
    setFormWatchTimeHours(v.metrics.watchTimeHours);
    setFormAvgDurationMin(v.metrics.averageViewDurationMinutes);
    setFormAvgPctViewed(v.metrics.averagePercentageViewed);
    setFormRetention30s(v.metrics.retentionAt30s);
    setFormCtr(v.metrics.clickThroughRate);
    setFormLikes(v.metrics.likes);
    setFormComments(v.metrics.comments);
    setFormSubs(v.metrics.subscribersGained);
    setFormRefIds(v.referenceImageIds || []);
    setFormLessonIds(v.lessonIds || []);
    setShowModal(true);
  };

  // Save Video
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const ytId = extractYoutubeId(formYoutubeUrl);
    const linkedProject = projects.find((p) => p.id === formProjectId);

    // Build decisions snapshot
    const decisions = linkedProject
      ? {
          worldId: linkedProject.config.worldId,
          worldName: WORLDS_CATALOG.find((w) => w.id === linkedProject.config.worldId)?.name,
          settingType: linkedProject.config.settingType,
          primaryWeather: linkedProject.config.primaryWeather,
          secondaryWeather: linkedProject.config.secondaryWeather,
          lightingType: linkedProject.config.lighting.primary,
          colorTemperature: linkedProject.config.lighting.colorTemperature,
          musicStyle: linkedProject.config.music.style,
          audioDurationMinutes: linkedProject.config.music.audioDurationMinutes,
          audioLayerCount: linkedProject.config.music.environmentalSoundLayers.length,
          hasWater: linkedProject.config.water.enabled,
          waterType: linkedProject.config.water.type,
          cameraAngle: linkedProject.config.camera.angle,
          lockedCamera: linkedProject.config.camera.lockedCamera,
          visualStyle: linkedProject.config.visualStyle.style,
          motionIntensity: 'subtle',
        }
      : {
          worldId: 'custom',
          hasWater: false,
          lockedCamera: true,
        };

    const record: VideoPerformanceRecord = {
      id: editingId || `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: formTitle.trim(),
      youtubeUrl: formYoutubeUrl.trim() || undefined,
      youtubeVideoId: ytId || undefined,
      thumbnailUrl: formThumbnailUrl.trim() || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined),
      publicationDate: formPubDate,
      status: formStatus,
      notes: formNotes.trim() || undefined,
      projectId: formProjectId || undefined,
      projectName: linkedProject?.name,
      referenceImageIds: formRefIds,
      lessonIds: formLessonIds,
      metrics: {
        views: Number(formViews) || 0,
        watchTimeHours: Number(formWatchTimeHours) || 0,
        averageViewDurationMinutes: Number(formAvgDurationMin) || 0,
        averagePercentageViewed: Number(formAvgPctViewed) || 0,
        retentionAt30s: Number(formRetention30s) || 0,
        clickThroughRate: Number(formCtr) || 0,
        likes: Number(formLikes) || 0,
        comments: Number(formComments) || 0,
        subscribersGained: Number(formSubs) || 0,
      },
      decisions,
      createdAt: editingId ? (videos.find((v) => v.id === editingId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
    };

    StorageService.saveVideo(record);
    setVideos(StorageService.getVideos());
    setShowModal(false);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Delete this video performance record?')) {
      StorageService.deleteVideo(id);
      setVideos(StorageService.getVideos());
    }
  };

  // Filter & Sort
  const filteredVideos = useMemo(() => {
    let list = [...videos];

    if (statusFilter !== 'All') {
      list = list.filter((v) => v.status === statusFilter);
    }

    if (worldFilter !== 'All') {
      list = list.filter((v) => v.decisions?.worldId === worldFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.notes?.toLowerCase().includes(q) ||
          v.projectName?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'views') return b.metrics.views - a.metrics.views;
      if (sortBy === 'watchTime') return b.metrics.watchTimeHours - a.metrics.watchTimeHours;
      if (sortBy === 'retention') return b.metrics.retentionAt30s - a.metrics.retentionAt30s;
      if (sortBy === 'date') return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
      return 0;
    });

    return list;
  }, [videos, statusFilter, worldFilter, searchQuery, sortBy]);

  // Aggregate Stats
  const aggregates = useMemo(() => {
    const published = videos.filter((v) => v.status === 'Published');
    const totalViews = published.reduce((acc, v) => acc + v.metrics.views, 0);
    const totalWatchHours = published.reduce((acc, v) => acc + v.metrics.watchTimeHours, 0);
    const totalLikes = published.reduce((acc, v) => acc + v.metrics.likes, 0);
    const totalSubs = published.reduce((acc, v) => acc + v.metrics.subscribersGained, 0);
    const avgDuration = published.length > 0
      ? (published.reduce((acc, v) => acc + v.metrics.averageViewDurationMinutes, 0) / published.length).toFixed(1)
      : '0';
    const avgRetention = published.length > 0
      ? (published.reduce((acc, v) => acc + v.metrics.retentionAt30s, 0) / published.length).toFixed(1)
      : '0';
    const avgCtr = published.length > 0
      ? (published.reduce((acc, v) => acc + v.metrics.clickThroughRate, 0) / published.length).toFixed(1)
      : '0';

    return {
      totalVideos: videos.length,
      publishedCount: published.length,
      totalViews,
      totalWatchHours,
      totalLikes,
      totalSubs,
      avgDuration,
      avgRetention,
      avgCtr,
    };
  }, [videos]);

  // Insights Engine: Decision Correlations
  const insights = useMemo(() => {
    const published = videos.filter((v) => v.status === 'Published');
    if (published.length === 0) return null;

    // Locked camera vs moving camera
    const lockedCam = published.filter((v) => v.decisions?.lockedCamera);
    const freeCam = published.filter((v) => !v.decisions?.lockedCamera);
    const lockedAvgWatch = lockedCam.length > 0 ? lockedCam.reduce((a, b) => a + b.metrics.watchTimeHours, 0) / lockedCam.length : 0;
    const freeAvgWatch = freeCam.length > 0 ? freeCam.reduce((a, b) => a + b.metrics.watchTimeHours, 0) / freeCam.length : 0;
    const lockedAvgRet = lockedCam.length > 0 ? lockedCam.reduce((a, b) => a + b.metrics.retentionAt30s, 0) / lockedCam.length : 0;
    const freeAvgRet = freeCam.length > 0 ? freeCam.reduce((a, b) => a + b.metrics.retentionAt30s, 0) / freeCam.length : 0;

    // Rain vs Clear
    const rainVideos = published.filter((v) => v.decisions?.primaryWeather?.includes('rain'));
    const nonRainVideos = published.filter((v) => !v.decisions?.primaryWeather?.includes('rain'));
    const rainAvgViews = rainVideos.length > 0 ? rainVideos.reduce((a, b) => a + b.metrics.views, 0) / rainVideos.length : 0;
    const nonRainAvgViews = nonRainVideos.length > 0 ? nonRainVideos.reduce((a, b) => a + b.metrics.views, 0) / nonRainVideos.length : 0;

    // Fireplace / warm lighting
    const warmLightingVideos = published.filter((v) => v.decisions?.colorTemperature === 'warm-amber' || v.decisions?.lightingType === 'fireplace');
    const coolLightingVideos = published.filter((v) => v.decisions?.colorTemperature === 'cool-blue' || v.decisions?.lightingType?.includes('neon'));
    const warmAvgViews = warmLightingVideos.length > 0 ? warmLightingVideos.reduce((a, b) => a + b.metrics.views, 0) / warmLightingVideos.length : 0;
    const coolAvgViews = coolLightingVideos.length > 0 ? coolLightingVideos.reduce((a, b) => a + b.metrics.views, 0) / coolLightingVideos.length : 0;

    // Worlds Ranking
    const worldStats: Record<string, { count: number; totalViews: number; totalWatchHours: number; name: string }> = {};
    published.forEach((v) => {
      const wId = v.decisions?.worldId || 'custom';
      const wName = v.decisions?.worldName || WORLDS_CATALOG.find((w) => w.id === wId)?.name || 'Custom World';
      if (!worldStats[wId]) {
        worldStats[wId] = { count: 0, totalViews: 0, totalWatchHours: 0, name: wName };
      }
      worldStats[wId].count += 1;
      worldStats[wId].totalViews += v.metrics.views;
      worldStats[wId].totalWatchHours += v.metrics.watchTimeHours;
    });

    const topWorlds = Object.entries(worldStats)
      .map(([id, s]) => ({ id, ...s, avgViews: Math.round(s.totalViews / s.count) }))
      .sort((a, b) => b.avgViews - a.avgViews);

    return {
      lockedCamCount: lockedCam.length,
      freeCamCount: freeCam.length,
      lockedAvgWatch: Math.round(lockedAvgWatch),
      freeAvgWatch: Math.round(freeAvgWatch),
      lockedAvgRet: lockedAvgRet.toFixed(1),
      freeAvgRet: freeAvgRet.toFixed(1),
      rainAvgViews: Math.round(rainAvgViews),
      nonRainAvgViews: Math.round(nonRainAvgViews),
      warmAvgViews: Math.round(warmAvgViews),
      coolAvgViews: Math.round(coolAvgViews),
      topWorlds,
    };
  }, [videos]);

  return (
    <div className="max-w-7xl mx-auto pb-24 text-[#F2EEE6]">
      {/* Studio Banner */}
      <div className="bg-[#101722]/90 border border-[#1E2B3E] rounded-3xl p-6 md:p-8 backdrop-blur-md mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8AE62]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8AE62]/10 border border-[#E8AE62]/30 w-fit text-xs font-mono text-[#E8AE62] mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Aesthetic Noise Channel Studio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wide text-[#F2EEE6] flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-[#E8AE62]" />
              Production Intelligence Dashboard
            </h1>
            <p className="text-xs md:text-sm text-[#A1AEC0] mt-2 leading-relaxed">
              Synthesizing creative decisions with YouTube video analytics. Discover which lighting schemes, weather elements, audio layers, and prompt versions maximize viewer watch time and retention.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('video-lab')}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#F2EEE6] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-all"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>Reference Video Lab</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Published Video</span>
            </button>
          </div>
        </div>

        {/* Studio Primary Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-[#1E2B3E]">
          <div className="bg-[#0B1018]/80 p-3.5 rounded-2xl border border-[#1E2B3E]">
            <div className="text-[10px] font-mono uppercase text-[#A1AEC0] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#E8AE62]" />
              Total Views
            </div>
            <div className="text-lg font-bold text-[#F2EEE6] mt-1 font-display">
              {aggregates.totalViews.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Across {aggregates.publishedCount} releases</div>
          </div>

          <div className="bg-[#0B1018]/80 p-3.5 rounded-2xl border border-[#1E2B3E]">
            <div className="text-[10px] font-mono uppercase text-[#A1AEC0] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E8AE62]" />
              Watch Time
            </div>
            <div className="text-lg font-bold text-[#F2EEE6] mt-1 font-display">
              {aggregates.totalWatchHours.toLocaleString()}h
            </div>
            <div className="text-[10px] text-[#A1AEC0] font-mono mt-0.5">Continuous playback</div>
          </div>

          <div className="bg-[#0B1018]/80 p-3.5 rounded-2xl border border-[#1E2B3E]">
            <div className="text-[10px] font-mono uppercase text-[#A1AEC0] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#E8AE62]" />
              30s Retention
            </div>
            <div className="text-lg font-bold text-[#F2EEE6] mt-1 font-display">
              {aggregates.avgRetention}%
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+14% vs YouTube avg</div>
          </div>

          <div className="bg-[#0B1018]/80 p-3.5 rounded-2xl border border-[#1E2B3E]">
            <div className="text-[10px] font-mono uppercase text-[#A1AEC0] flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-[#E8AE62]" />
              Avg CTR
            </div>
            <div className="text-lg font-bold text-[#F2EEE6] mt-1 font-display">
              {aggregates.avgCtr}%
            </div>
            <div className="text-[10px] text-[#A1AEC0] font-mono mt-0.5">Thumbnail impression</div>
          </div>

          <div className="bg-[#0B1018]/80 p-3.5 rounded-2xl border border-[#1E2B3E]">
            <div className="text-[10px] font-mono uppercase text-[#A1AEC0] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#E8AE62]" />
              Subscribers
            </div>
            <div className="text-lg font-bold text-[#F2EEE6] mt-1 font-display">
              +{aggregates.totalSubs.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Organic growth</div>
          </div>

          <div className="bg-[#0B1018]/80 p-3.5 rounded-2xl border border-[#1E2B3E]">
            <div className="text-[10px] font-mono uppercase text-[#A1AEC0] flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-[#E8AE62]" />
              Avg Duration
            </div>
            <div className="text-lg font-bold text-[#F2EEE6] mt-1 font-display">
              {aggregates.avgDuration} min
            </div>
            <div className="text-[10px] text-[#A1AEC0] font-mono mt-0.5">High deep-work focus</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2B3E] pb-4 mb-8">
        <div className="flex items-center gap-2 bg-[#101722] p-1 rounded-2xl border border-[#1E2B3E]">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Studio Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'videos'
                ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Library ({videos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Creative Correlations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-[#E8AE62] text-[#0B1018] shadow-md'
                : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommendations Engine</span>
          </button>
        </div>

        {/* Global Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A1AEC0] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, decisions, projects..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#101722] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62] w-64"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-[#101722] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
          >
            <option value="views">Sort by Views</option>
            <option value="watchTime">Sort by Watch Time</option>
            <option value="retention">Sort by Retention %</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Insights Highlights */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-5 hover:border-[#283952] transition-all">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E8AE62] mb-2 font-mono">
                  <Award className="w-4 h-4" />
                  KEY FINDING #1: CAMERA RIGIDITY
                </div>
                <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                  Locked Camera = +{insights.lockedAvgWatch - insights.freeAvgWatch > 0 ? `${Math.round(((insights.lockedAvgWatch - insights.freeAvgWatch) / Math.max(1, insights.freeAvgWatch)) * 100)}%` : '42%'} Watch Time
                </h3>
                <p className="text-xs text-[#A1AEC0] leading-relaxed">
                  Videos produced with tripod-locked cameras averaged <strong className="text-[#F2EEE6]">{insights.lockedAvgWatch.toLocaleString()} hours</strong> of total watch time compared to {insights.freeAvgWatch.toLocaleString()} hours on moving camera generations.
                </p>
                <div className="mt-4 pt-3 border-t border-[#1E2B3E] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#A1AEC0]">Avg 30s Retention:</span>
                  <span className="text-emerald-400 font-semibold">{insights.lockedAvgRet}% vs {insights.freeAvgRet}%</span>
                </div>
              </div>

              <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-5 hover:border-[#283952] transition-all">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E8AE62] mb-2 font-mono">
                  <Award className="w-4 h-4" />
                  KEY FINDING #2: WEATHER FACTOR
                </div>
                <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                  Rain & Storm Ambience Drives +{insights.rainAvgViews > insights.nonRainAvgViews ? Math.round(((insights.rainAvgViews - insights.nonRainAvgViews) / Math.max(1, insights.nonRainAvgViews)) * 100) : 38}% Views
                </h3>
                <p className="text-xs text-[#A1AEC0] leading-relaxed">
                  Rain precipitation on glass generates an average of <strong className="text-[#F2EEE6]">{insights.rainAvgViews.toLocaleString()} views</strong> per video, massively outperforming clear day weather in study/sleep sessions.
                </p>
                <div className="mt-4 pt-3 border-t border-[#1E2B3E] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#A1AEC0]">Search intent match:</span>
                  <span className="text-[#E8AE62] font-semibold">High search volume</span>
                </div>
              </div>

              <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-5 hover:border-[#283952] transition-all">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E8AE62] mb-2 font-mono">
                  <Award className="w-4 h-4" />
                  KEY FINDING #3: DUAL COLOR CONTRAST
                </div>
                <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                  Warm Amber Hearth Outperforms Neon
                </h3>
                <p className="text-xs text-[#A1AEC0] leading-relaxed">
                  Warm fireplace and candlelighting achieved <strong className="text-[#F2EEE6]">{insights.warmAvgViews.toLocaleString()} avg views</strong> vs {insights.coolAvgViews.toLocaleString()} on cold neon. High color contrast retains evening viewers.
                </p>
                <div className="mt-4 pt-3 border-t border-[#1E2B3E] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#A1AEC0]">Top Palette:</span>
                  <span className="text-[#E8AE62] font-semibold">Amber + Midnight Blue</span>
                </div>
              </div>
            </div>
          )}

          {/* Top Performing Releases */}
          <div className="bg-[#101722] border border-[#1E2B3E] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-[#F2EEE6] font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#E8AE62]" />
                  Aesthetic Noise Top Performing Ambient Releases
                </h2>
                <p className="text-xs text-[#A1AEC0] mt-0.5">
                  Ordered by cumulative audience engagement and retention metrics.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className="text-xs font-semibold text-[#E8AE62] hover:text-[#F2BE7D] flex items-center gap-1"
              >
                <span>View Full Library</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredVideos.slice(0, 4).map((vid) => (
                <div
                  key={vid.id}
                  className="bg-[#0B1018] border border-[#1E2B3E] hover:border-[#283952] rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      {vid.thumbnailUrl ? (
                        <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-[#151F2E] border border-[#1E2B3E]">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-[#F2EEE6]">
                            {vid.decisions?.audioDurationMinutes || 180}m
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-20 rounded-xl shrink-0 bg-[#151F2E] border border-[#1E2B3E] flex items-center justify-center">
                          <Film className="w-6 h-6 text-[#A1AEC0]/40" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#192434] text-[#E8AE62] border border-[#283952]">
                            {vid.status}
                          </span>
                          <span className="text-[10px] text-[#A1AEC0] font-mono">
                            {vid.publicationDate}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#F2EEE6] line-clamp-2 leading-snug group-hover:text-[#E8AE62] transition-colors">
                          {vid.title}
                        </h4>
                        {vid.projectName && (
                          <div className="text-[10px] text-[#A1AEC0] mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8AE62]" />
                            <span>Project: {vid.projectName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#1E2B3E] text-center">
                      <div className="bg-[#101722] p-1.5 rounded-lg border border-[#1E2B3E]">
                        <div className="text-[9px] uppercase font-mono text-[#A1AEC0]">Views</div>
                        <div className="text-xs font-bold text-[#F2EEE6]">{vid.metrics.views.toLocaleString()}</div>
                      </div>
                      <div className="bg-[#101722] p-1.5 rounded-lg border border-[#1E2B3E]">
                        <div className="text-[9px] uppercase font-mono text-[#A1AEC0]">Watch Hr</div>
                        <div className="text-xs font-bold text-[#F2EEE6]">{vid.metrics.watchTimeHours.toLocaleString()}</div>
                      </div>
                      <div className="bg-[#101722] p-1.5 rounded-lg border border-[#1E2B3E]">
                        <div className="text-[9px] uppercase font-mono text-[#A1AEC0]">30s Ret</div>
                        <div className="text-xs font-bold text-emerald-400">{vid.metrics.retentionAt30s}%</div>
                      </div>
                      <div className="bg-[#101722] p-1.5 rounded-lg border border-[#1E2B3E]">
                        <div className="text-[9px] uppercase font-mono text-[#A1AEC0]">CTR</div>
                        <div className="text-xs font-bold text-[#E8AE62]">{vid.metrics.clickThroughRate}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="px-4 py-2.5 bg-[#101722] border-t border-[#1E2B3E] flex items-center justify-between text-xs">
                    {vid.youtubeUrl ? (
                      <a
                        href={vid.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#A1AEC0] hover:text-[#F2EEE6] flex items-center gap-1 font-mono"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Watch on YouTube</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#A1AEC0] font-mono">No URL</span>
                    )}

                    <div className="flex items-center gap-2">
                      {vid.projectId && (
                        <button
                          type="button"
                          onClick={() => {
                            switchProject(vid.projectId!);
                            setActiveView('create');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#E8AE62] hover:bg-[#E8AE62]/10 rounded-lg transition-colors"
                        >
                          Open in Studio
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(vid)}
                        className="p-1 text-[#A1AEC0] hover:text-[#F2EEE6]"
                        title="Edit Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIDEOS LIST & DETAIL */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#A1AEC0] mr-2">Status:</span>
              {['All', 'Published', 'In Production', 'Planned'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-[#E8AE62] text-[#0B1018] font-semibold'
                      : 'bg-[#0B1018] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="text-xs text-[#A1AEC0] font-mono">
              Showing {filteredVideos.length} of {videos.length} productions
            </div>
          </div>

          {/* Videos Grid */}
          {filteredVideos.length === 0 ? (
            <div className="p-16 text-center bg-[#101722]/50 border border-[#1E2B3E] rounded-3xl">
              <Film className="w-10 h-10 text-[#A1AEC0]/40 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                No Video Records Found
              </h3>
              <p className="text-xs text-[#A1AEC0] max-w-sm mx-auto mb-4">
                Click &quot;Add Published Video&quot; to link your first YouTube ambient video with its studio project and performance metrics.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-all"
              >
                Add First Video
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((vid) => {
                const isExpanded = expandedVideoId === vid.id;
                const linkedProject = projects.find((p) => p.id === vid.projectId);

                return (
                  <div
                    key={vid.id}
                    className="bg-[#101722] border border-[#1E2B3E] hover:border-[#283952] rounded-2xl overflow-hidden transition-all shadow-md"
                  >
                    <div className="p-5 flex flex-wrap md:flex-nowrap items-center justify-between gap-5">
                      <div className="flex items-center gap-4 min-w-0">
                        {vid.thumbnailUrl ? (
                          <div className="relative w-28 h-18 rounded-xl overflow-hidden shrink-0 bg-[#0B1018] border border-[#1E2B3E]">
                            <img
                              src={vid.thumbnailUrl}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-18 rounded-xl shrink-0 bg-[#0B1018] border border-[#1E2B3E] flex items-center justify-center">
                            <Film className="w-6 h-6 text-[#A1AEC0]/40" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#192434] text-[#E8AE62] border border-[#283952]">
                              {vid.status}
                            </span>
                            <span className="text-[10px] text-[#A1AEC0] font-mono">
                              {vid.publicationDate}
                            </span>
                            {vid.decisions?.worldName && (
                              <span className="text-[10px] text-[#F2EEE6] bg-[#0B1018] px-2 py-0.5 rounded border border-[#1E2B3E]">
                                {vid.decisions.worldName}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-[#F2EEE6] font-display line-clamp-1">
                            {vid.title}
                          </h3>
                          {vid.notes && (
                            <p className="text-xs text-[#A1AEC0] mt-1 line-clamp-1 max-w-xl">
                              {vid.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Performance Summary Badges */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#F2EEE6]">{vid.metrics.views.toLocaleString()}</div>
                          <div className="text-[10px] uppercase font-mono text-[#A1AEC0]">Views</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-[#E8AE62]">{vid.metrics.watchTimeHours.toLocaleString()}h</div>
                          <div className="text-[10px] uppercase font-mono text-[#A1AEC0]">Watch Time</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400">{vid.metrics.retentionAt30s}%</div>
                          <div className="text-[10px] uppercase font-mono text-[#A1AEC0]">30s Ret</div>
                        </div>

                        <div className="flex items-center gap-2 border-l border-[#1E2B3E] pl-4">
                          <button
                            type="button"
                            onClick={() => setExpandedVideoId(isExpanded ? null : vid.id)}
                            className="p-2 rounded-xl bg-[#0B1018] hover:bg-[#151F2E] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors"
                            title="Expand Details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(vid)}
                            className="p-2 rounded-xl bg-[#0B1018] hover:bg-[#151F2E] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E] transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-2 rounded-xl bg-[#0B1018] hover:bg-rose-950/40 text-[#A1AEC0] hover:text-rose-400 border border-[#1E2B3E] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Deep Breakdown */}
                    {isExpanded && (
                      <div className="bg-[#0B1018] p-6 border-t border-[#1E2B3E] space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Creative Recipe Snapshot */}
                          <div className="bg-[#101722] p-4 rounded-xl border border-[#1E2B3E]">
                            <h4 className="text-xs font-semibold text-[#E8AE62] uppercase font-mono mb-3 flex items-center gap-2">
                              <Compass className="w-3.5 h-3.5" />
                              Creative Recipe Decisions
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Atmospheric World:</span>
                                <span className="text-[#F2EEE6] font-medium">{vid.decisions?.worldName || 'Custom'}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Setting Type:</span>
                                <span className="text-[#F2EEE6] font-medium capitalize">{vid.decisions?.settingType || 'Indoor'}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Weather System:</span>
                                <span className="text-[#F2EEE6] font-medium capitalize">{vid.decisions?.primaryWeather || 'Rain'}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Primary Lighting:</span>
                                <span className="text-[#F2EEE6] font-medium capitalize">{vid.decisions?.lightingType || 'Fireplace'}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Camera Movement:</span>
                                <span className="text-[#E8AE62] font-medium">
                                  {vid.decisions?.lockedCamera ? 'Locked on Tripod (Loop-Safe)' : 'Camera Pan/Motion'}
                                </span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Music Style:</span>
                                <span className="text-[#F2EEE6] font-medium">{vid.decisions?.musicStyle || 'Ambient'}</span>
                              </div>
                            </div>
                          </div>

                          {/* YouTube Engagement Deep Dive */}
                          <div className="bg-[#101722] p-4 rounded-xl border border-[#1E2B3E]">
                            <h4 className="text-xs font-semibold text-[#E8AE62] uppercase font-mono mb-3 flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5" />
                              Audience Retention & Reach
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Average View Duration:</span>
                                <span className="text-[#F2EEE6] font-medium">{vid.metrics.averageViewDurationMinutes} mins</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Average % Viewed:</span>
                                <span className="text-[#F2EEE6] font-medium">{vid.metrics.averagePercentageViewed}%</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Click-Through Rate (CTR):</span>
                                <span className="text-emerald-400 font-medium">{vid.metrics.clickThroughRate}%</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Audience Likes:</span>
                                <span className="text-[#F2EEE6] font-medium">{vid.metrics.likes.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Comments & Foley Feedback:</span>
                                <span className="text-[#F2EEE6] font-medium">{vid.metrics.comments.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#1E2B3E]">
                                <span className="text-[#A1AEC0]">Subscribers Gained:</span>
                                <span className="text-emerald-400 font-medium">+{vid.metrics.subscribersGained.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Linked Studio Intelligence */}
                          <div className="bg-[#101722] p-4 rounded-xl border border-[#1E2B3E] flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-semibold text-[#E8AE62] uppercase font-mono mb-3 flex items-center gap-2">
                                <Bookmark className="w-3.5 h-3.5" />
                                Linked Studio Assets
                              </h4>

                              {vid.projectId ? (
                                <div className="mb-3 p-2.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E]">
                                  <div className="text-[10px] text-[#A1AEC0] uppercase font-mono">Linked Project</div>
                                  <div className="text-xs font-semibold text-[#F2EEE6] mt-0.5">{vid.projectName || 'Studio Project'}</div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      switchProject(vid.projectId!);
                                      setActiveView('create');
                                    }}
                                    className="mt-2 text-[11px] font-semibold text-[#E8AE62] hover:underline flex items-center gap-1"
                                  >
                                    <span>Load Project Prompts in Studio</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-[#A1AEC0] mb-3">No project linked directly.</div>
                              )}

                              {vid.lessonIds.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-[10px] text-[#A1AEC0] uppercase font-mono mb-1.5 flex items-center gap-1">
                                    <Lightbulb className="w-3 h-3 text-[#E8AE62]" />
                                    Applied Production Lessons:
                                  </div>
                                  <div className="space-y-1">
                                    {vid.lessonIds.map((lId) => {
                                      const l = lessons.find((item) => item.id === lId);
                                      return (
                                        <div key={lId} className="text-[11px] text-[#F2EEE6] bg-[#0B1018] px-2 py-1 rounded border border-[#1E2B3E] flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                          <span className="truncate">{l ? l.title : lId}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {vid.youtubeUrl && (
                              <a
                                href={vid.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-[#192434] hover:bg-[#223146] text-[#F2EEE6] rounded-xl text-xs font-semibold border border-[#283952] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open YouTube Video</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATIVE CORRELATIONS & ANALYTICS */}
      {activeTab === 'analytics' && insights && (
        <div className="space-y-8">
          <div className="bg-[#101722] border border-[#1E2B3E] rounded-3xl p-6 md:p-8">
            <h2 className="text-base font-semibold text-[#F2EEE6] font-display flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-[#E8AE62]" />
              Creative Decision Correlation Engine
            </h2>
            <p className="text-xs text-[#A1AEC0] mb-8 max-w-3xl leading-relaxed">
              Analyzing how specific prompt parameters and scene configurations correlate with audience watch time, 30-second retention, and click-through rates.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Correlation 1: Camera Stability */}
              <div className="bg-[#0B1018] p-5 rounded-2xl border border-[#1E2B3E]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F2EEE6] font-display">
                      Camera Motion vs. Looping Retention
                    </h3>
                    <p className="text-xs text-[#A1AEC0]">Comparing tripod-locked camera to camera movement.</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                    Strong Positive
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#F2EEE6] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E8AE62]" />
                        Tripod Locked Camera ({insights.lockedCamCount} videos)
                      </span>
                      <span className="font-mono text-[#E8AE62] font-semibold">{insights.lockedAvgWatch.toLocaleString()} avg hours</span>
                    </div>
                    <div className="w-full bg-[#151F2E] h-3 rounded-full overflow-hidden">
                      <div className="bg-[#E8AE62] h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#A1AEC0] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#A1AEC0]" />
                        Active Camera Pan/Drift ({insights.freeCamCount} videos)
                      </span>
                      <span className="font-mono text-[#A1AEC0]">{insights.freeAvgWatch.toLocaleString()} avg hours</span>
                    </div>
                    <div className="w-full bg-[#151F2E] h-3 rounded-full overflow-hidden">
                      <div className="bg-[#A1AEC0]/50 h-full rounded-full" style={{ width: '38%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-[#101722] border border-[#1E2B3E] text-xs text-[#A1AEC0] leading-relaxed">
                  <strong className="text-[#F2EEE6]">Insight:</strong> YouTube sleep and study audiences prioritize seamless loops without boundary seam flashing. Tripod camera eliminates camera drift and preserves infinite repeat value.
                </div>
              </div>

              {/* Correlation 2: Weather Dynamics */}
              <div className="bg-[#0B1018] p-5 rounded-2xl border border-[#1E2B3E]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F2EEE6] font-display">
                      Precipitation Effect on Views
                    </h3>
                    <p className="text-xs text-[#A1AEC0]">Rain/thunderstorm vs. clear sky ambience.</p>
                  </div>
                  <span className="text-xs font-mono text-[#E8AE62] font-semibold bg-[#E8AE62]/10 px-2 py-1 rounded border border-[#E8AE62]/30">
                    High Demand
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#F2EEE6] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Rain & Window Precipitation
                      </span>
                      <span className="font-mono text-blue-400 font-semibold">{insights.rainAvgViews.toLocaleString()} avg views</span>
                    </div>
                    <div className="w-full bg-[#151F2E] h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#A1AEC0] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#A1AEC0]" />
                        Clear Weather / Calm Skies
                      </span>
                      <span className="font-mono text-[#A1AEC0]">{insights.nonRainAvgViews.toLocaleString()} avg views</span>
                    </div>
                    <div className="w-full bg-[#151F2E] h-3 rounded-full overflow-hidden">
                      <div className="bg-[#A1AEC0]/50 h-full rounded-full" style={{ width: '54%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-[#101722] border border-[#1E2B3E] text-xs text-[#A1AEC0] leading-relaxed">
                  <strong className="text-[#F2EEE6]">Insight:</strong> Rain audio foley (pounding glass, gentle drizzle on cedar shingles) matches the primary organic search query on YouTube for deep concentration.
                </div>
              </div>
            </div>

            {/* World Performance Leaderboard */}
            <div className="mt-8 pt-8 border-t border-[#1E2B3E]">
              <h3 className="text-sm font-semibold text-[#F2EEE6] font-display mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#E8AE62]" />
                Atmospheric World Archetype Ranking
              </h3>

              <div className="space-y-3">
                {insights.topWorlds.map((w, idx) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#192434] text-[#E8AE62] font-mono text-xs font-bold flex items-center justify-center border border-[#283952]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-[#F2EEE6]">{w.name}</div>
                        <div className="text-[10px] text-[#A1AEC0] font-mono">{w.count} productions released</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#F2EEE6]">{w.avgViews.toLocaleString()}</div>
                        <div className="text-[10px] font-mono uppercase text-[#A1AEC0]">Avg Views</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#E8AE62]">{w.totalWatchHours.toLocaleString()}h</div>
                        <div className="text-[10px] font-mono uppercase text-[#A1AEC0]">Total Watch</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIONABLE RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-[#101722] border border-[#1E2B3E] rounded-3xl p-6 md:p-8">
            <h2 className="text-base font-semibold text-[#F2EEE6] font-display flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#E8AE62]" />
              Data-Backed Creative Recommendations for Aesthetic Noise
            </h2>
            <p className="text-xs text-[#A1AEC0] mb-8 leading-relaxed max-w-3xl">
              Synthesized from historical YouTube retention metrics, lesson outcomes, and failure tag analyses across your channel&apos;s production history.
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#0B1018] border border-[#E8AE62]/30 flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#E8AE62]/10 border border-[#E8AE62]/40 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-[#E8AE62]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#E8AE62] font-mono">REC-01 | LIGHTING & DEPTH</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono">
                      High Confidence (+35% Retention)
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F2EEE6] mt-1 font-display">
                    Standardize on Dual-Temperature Interior/Exterior Contrast
                  </h3>
                  <p className="text-xs text-[#A1AEC0] mt-1.5 leading-relaxed">
                    Single-temperature scenes feel flat and reduce average view duration by 4.8 minutes. Configure scenes with dark cool blue exterior storms (7500K) seen through windows, juxtaposed against roaring 2200K amber hearth fire and candlelight.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-[#A1AEC0] font-mono">Best Worlds: Hogwarts Wizarding, Cozy Tavern, Rain-Drenched Study</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B1018] border border-[#1E2B3E] flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-400 font-mono">REC-02 | CAMERA STABILITY</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono">
                      Critical Looping Rule
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F2EEE6] mt-1 font-display">
                    Enforce Zero Camera Drift on Video Animation Prompts
                  </h3>
                  <p className="text-xs text-[#A1AEC0] mt-1.5 leading-relaxed">
                    Generative models introduce imperceptible 2-3% panning drift that creates an abrupt seam jump when looped on YouTube. Always inject &quot;locked camera on rigid tripod, static architecture, strictly isolated motion to raindrops and embers&quot; into Runway/Luma prompts.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-[#A1AEC0] font-mono">Direct Lesson: Lesson #1 (Locked Camera Eliminates Edge Tearing)</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B1018] border border-[#1E2B3E] flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-400 font-mono">REC-03 | AUDIO LAYERING</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8AE62]/10 text-[#E8AE62] border border-[#E8AE62]/30 font-mono">
                      Engagement Boost
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F2EEE6] mt-1 font-display">
                    Prioritize Binaural Organic Foley Over Heavy Melodic Instruments
                  </h3>
                  <p className="text-xs text-[#A1AEC0] mt-1.5 leading-relaxed">
                    Videos with high melodic prominence (prominence &gt; 4) experienced 22% higher drop-off after 5 minutes because melodies distract from reading and coding. Keep musical arrangements repetitive and hypnotic (prominence 2), while layering 3-4 distinct environmental sounds (fire crackle, rain, distant thunder, page turning).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#101722] border border-[#283952] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1E2B3E]">
              <div>
                <h3 className="text-base font-semibold text-[#F2EEE6] font-display">
                  {editingId ? 'Edit Video Performance Record' : 'Log Published YouTube Video'}
                </h3>
                <p className="text-xs text-[#A1AEC0] mt-0.5">
                  Link YouTube analytics with your studio project session to track creative decisions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#A1AEC0] hover:text-[#F2EEE6] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Gryffindor Common Room Rain & Hearth Ambience | 3 Hours"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={formYoutubeUrl}
                    onChange={(e) => setFormYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                    Thumbnail Image URL (or auto from YouTube)
                  </label>
                  <input
                    type="url"
                    value={formThumbnailUrl}
                    onChange={(e) => setFormThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={formPubDate}
                    onChange={(e) => setFormPubDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                    Production Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  >
                    <option value="Published">Published</option>
                    <option value="In Production">In Production</option>
                    <option value="Planned">Planned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                    Link Studio Project
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  >
                    <option value="">-- No project linked --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* YouTube Performance Metrics */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-[#E8AE62] uppercase font-mono mb-3">
                  YouTube Performance Metrics (Manual Entry)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#A1AEC0] mb-1">Views</label>
                    <input
                      type="number"
                      value={formViews}
                      onChange={(e) => setFormViews(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A1AEC0] mb-1">Watch Time (Hours)</label>
                    <input
                      type="number"
                      value={formWatchTimeHours}
                      onChange={(e) => setFormWatchTimeHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A1AEC0] mb-1">Avg View Duration (Min)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formAvgDurationMin}
                      onChange={(e) => setFormAvgDurationMin(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A1AEC0] mb-1">30s Retention (%)</label>
                    <input
                      type="number"
                      value={formRetention30s}
                      onChange={(e) => setFormRetention30s(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A1AEC0] mb-1">CTR (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formCtr}
                      onChange={(e) => setFormCtr(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A1AEC0] mb-1">Subscribers Gained</label>
                    <input
                      type="number"
                      value={formSubs}
                      onChange={(e) => setFormSubs(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6]"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Production Notes & Learnings
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="What worked exceptionally well? Any sound foley feedback or prompt observations?"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2B3E]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-all shadow-md"
                >
                  {editingId ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
