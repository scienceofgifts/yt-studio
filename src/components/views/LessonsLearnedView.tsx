import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { LessonLearnedItem } from '../../types/ambience';
import {
  Lightbulb,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Tag,
  AlertCircle,
  Search,
  Archive,
  RotateCcw,
  Sparkles,
  Edit3,
  TrendingUp,
  Award,
  Filter,
} from 'lucide-react';

export const LessonsLearnedView: React.FC = () => {
  const [lessons, setLessons] = useState<LessonLearnedItem[]>(() =>
    StorageService.getLessons()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LessonLearnedItem['category']>('Looping');
  const [promptType, setPromptType] = useState<LessonLearnedItem['promptType']>('general');
  const [observation, setObservation] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [observedResult, setObservedResult] = useState<LessonLearnedItem['observedResult']>('Worked well');
  const [attemptedCorrection, setAttemptedCorrection] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<LessonLearnedItem['confidenceLevel']>('High');
  const [models, setModels] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [issueTagsInput, setIssueTagsInput] = useState('');

  const categories = ['All', 'Looping', 'Water', 'Lighting', 'Camera', 'Audio Layering', 'Subjects', 'General'];

  const stats = useMemo(() => {
    const total = lessons.length;
    const active = lessons.filter((l) => !l.archived).length;
    const workedWell = lessons.filter((l) => l.observedResult === 'Worked well').length;
    const successRate = active > 0 ? Math.round((workedWell / active) * 100) : 0;
    return { total, active, successRate };
  }, [lessons]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Looping');
    setPromptType('general');
    setObservation('');
    setRecommendation('');
    setObservedResult('Worked well');
    setAttemptedCorrection('');
    setConfidenceLevel('High');
    setModels('');
    setTagsInput('');
    setIssueTagsInput('');
    setShowModal(true);
  };

  const handleEdit = (lesson: LessonLearnedItem) => {
    setEditingId(lesson.id);
    setTitle(lesson.title);
    setCategory(lesson.category);
    setPromptType(lesson.promptType || 'general');
    setObservation(lesson.observation);
    setRecommendation(lesson.recommendation);
    setObservedResult(lesson.observedResult || 'Worked well');
    setAttemptedCorrection(lesson.attemptedCorrection || '');
    setConfidenceLevel(lesson.confidenceLevel || 'High');
    setModels(lesson.effectiveForModels?.join(', ') || '');
    setTagsInput(lesson.tags?.join(', ') || '');
    setIssueTagsInput(lesson.issueTags?.join(', ') || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const issueTags = issueTagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const effectiveForModels = models.split(',').map((s) => s.trim()).filter(Boolean);

    const now = Date.now();
    const existing = editingId ? lessons.find((l) => l.id === editingId) : null;

    const item: LessonLearnedItem = {
      id: editingId || `lesson-${now}`,
      category,
      title: title.trim(),
      observation: observation.trim(),
      recommendation: recommendation.trim(),
      promptType,
      observedResult,
      attemptedCorrection: attemptedCorrection.trim(),
      confidenceLevel,
      effectiveForModels,
      tags,
      issueTags,
      archived: existing ? existing.archived : false,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    StorageService.saveLesson(item);
    setLessons(StorageService.getLessons());
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this lesson permanently?')) {
      StorageService.deleteLesson(id);
      setLessons(StorageService.getLessons());
    }
  };

  const handleToggleArchive = (item: LessonLearnedItem) => {
    const updated = { ...item, archived: !item.archived, updatedAt: Date.now() };
    StorageService.saveLesson(updated);
    setLessons(StorageService.getLessons());
  };

  const filtered = lessons.filter((l) => {
    if (!showArchived && l.archived) return false;
    if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;
    if (selectedType !== 'all' && l.promptType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.observation.toLowerCase().includes(q) ||
        l.recommendation.toLowerCase().includes(q) ||
        (l.tags && l.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Top Banner */}
      <div className="bg-[#101722]/90 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#E8AE62]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
            <Lightbulb className="w-5 h-5 text-[#E8AE62]" />
            Experience Memory & Production Lessons
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-1 max-w-xl leading-relaxed">
            Persistent studio memory recording successful prompts, observed failure artifacts, attempted corrections, and heuristic rules for future ambience projects.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors ${
              showArchived
                ? 'bg-[#E8AE62]/10 border-[#E8AE62] text-[#E8AE62]'
                : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? 'Hide Archived' : 'View Archived'}
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add New Lesson
          </button>
        </div>
      </div>

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-[#101722] border border-[#1E2B3E] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] text-[#A1AEC0] font-medium uppercase tracking-wider">Active Lessons</div>
            <div className="text-xl font-bold text-[#F2EEE6] mt-1 font-display">{stats.active}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#192434] text-[#E8AE62] border border-[#283952]">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101722] border border-[#1E2B3E] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] text-[#A1AEC0] font-medium uppercase tracking-wider">Historical Success Rate</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-display">{stats.successRate}%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/30 text-emerald-400 border border-emerald-800/40">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101722] border border-[#1E2B3E] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] text-[#A1AEC0] font-medium uppercase tracking-wider">Categories Tracked</div>
            <div className="text-xl font-bold text-[#F2EEE6] mt-1 font-display">{categories.length - 1}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#192434] text-[#E8AE62] border border-[#283952]">
            <Lightbulb className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl shadow-inner">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#192434] text-[#E8AE62] font-semibold border border-[#283952] shadow-sm'
                    : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Prompt Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
          >
            <option value="all">All Prompt Types</option>
            <option value="image">Image Only</option>
            <option value="video">Video Only</option>
            <option value="music">Music Only</option>
            <option value="general">General / Rule</option>
          </select>

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#A1AEC0] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
            />
          </div>
        </div>
      </div>

      {/* Lessons Cards List */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-[#101722]/50 border border-[#1E2B3E] rounded-2xl">
          <Lightbulb className="w-10 h-10 text-[#A1AEC0]/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">No Lessons Found</h3>
          <p className="text-xs text-[#A1AEC0] max-w-sm mx-auto">
            No experience memory entries match your current filter. Record outcomes or add lessons manually.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isWorked = item.observedResult === 'Worked well';
            const isFailed = item.observedResult === 'Failed';
            const isPartial = item.observedResult === 'Partially worked';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 shadow-md ${
                  item.archived
                    ? 'bg-[#0B1018]/50 border-[#1E2B3E]/50 opacity-60'
                    : 'bg-[#101722] border-[#1E2B3E] hover:border-[#283952] hover:bg-[#131D2C]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-semibold text-[#E8AE62] font-mono px-2.5 py-0.5 rounded-md bg-[#192434] border border-[#283952]">
                      {item.category}
                    </span>

                    {item.promptType && item.promptType !== 'general' && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#0B1018] text-blue-400 border border-[#1E2B3E]">
                        {item.promptType}
                      </span>
                    )}

                    <h3 className="text-sm font-semibold text-[#F2EEE6] font-display">{item.title}</h3>

                    {item.observedResult && (
                      <span
                        className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
                          isWorked
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                            : isFailed
                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                            : isPartial
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                            : 'bg-[#192434] text-[#A1AEC0] border-[#283952]'
                        }`}
                      >
                        {item.observedResult}
                      </span>
                    )}

                    {item.confidenceLevel && (
                      <span className="text-[10px] text-[#A1AEC0] font-mono">
                        Confidence: <strong className="text-[#F2EEE6]">{item.confidenceLevel}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] rounded-lg hover:bg-[#192434] transition-colors"
                      title="Edit Lesson"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(item)}
                      className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] rounded-lg hover:bg-[#192434] transition-colors"
                      title={item.archived ? 'Restore Lesson' : 'Archive Lesson'}
                    >
                      {item.archived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-[#A1AEC0] hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                      title="Delete Lesson"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                    <div className="flex items-center gap-1.5 text-[#A1AEC0] font-semibold mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Observed Result / Failure Artifact:
                    </div>
                    <p className="text-[#F2EEE6]/80 leading-relaxed">{item.observation}</p>
                    {item.attemptedCorrection && (
                      <p className="mt-2 text-[11px] text-[#A1AEC0] italic">
                        <strong className="text-[#F2EEE6] not-italic">Attempted fix:</strong> {item.attemptedCorrection}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#E8AE62]/10 border border-[#E8AE62]/30">
                    <div className="flex items-center gap-1.5 text-[#E8AE62] font-semibold mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E8AE62]" />
                      Studio Reusable Recommendation:
                    </div>
                    <p className="text-[#F2EEE6] leading-relaxed">{item.recommendation}</p>
                  </div>
                </div>

                {/* Issue Tags & General Tags */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E2B3E] text-[11px] text-[#A1AEC0]">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.issueTags && item.issueTags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-rose-400 font-semibold">Issues:</span>
                        {item.issueTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-rose-950/30 text-[10px] text-rose-300 border border-rose-900/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#E8AE62]" />
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#0B1018] text-[10px] text-[#E8AE62] border border-[#1E2B3E]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.effectiveForModels && item.effectiveForModels.length > 0 && (
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span>Models:</span>
                      {item.effectiveForModels.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Lesson Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
              {editingId ? 'Edit Experience Lesson' : 'Record Studio Lesson'}
            </h3>
            <p className="text-xs text-[#A1AEC0] mb-4">
              Document empirical prompt behavior, observed failure artifacts, or successful patterns.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stationary Fireplace Prevents Edge Tearing"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Prompt Type</label>
                  <select
                    value={promptType}
                    onChange={(e) => setPromptType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="music">Music</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Outcome</label>
                  <select
                    value={observedResult}
                    onChange={(e) => setObservedResult(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
                  >
                    <option value="Worked well">Worked well</option>
                    <option value="Partially worked">Partially worked</option>
                    <option value="Failed">Failed</option>
                    <option value="Not tested">Not tested</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Confidence</label>
                  <select
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">AI Models</label>
                  <input
                    type="text"
                    value={models}
                    onChange={(e) => setModels(e.target.value)}
                    placeholder="Runway Gen-3, Midjourney v6"
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Observed Problem / Result Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="What happened during generation?"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Attempted Correction / Fix</label>
                <input
                  type="text"
                  value={attemptedCorrection}
                  onChange={(e) => setAttemptedCorrection(e.target.value)}
                  placeholder="What tweak was tried?"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Studio Recommendation / Reusable Rule
                </label>
                <textarea
                  rows={2}
                  required
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="How should future prompts be structured?"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Issue Tags (comma separated)</label>
                  <input
                    type="text"
                    value={issueTagsInput}
                    onChange={(e) => setIssueTagsInput(e.target.value)}
                    placeholder="Camera moved unexpectedly, Loop jump"
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">General Tags</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="rain, cozy, fireplace"
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-colors shadow-md"
                >
                  {editingId ? 'Save Changes' : 'Log Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
