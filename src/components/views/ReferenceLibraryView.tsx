import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ReferenceItem, ReferenceRole, ImageAnalysisResult, Project } from '../../types/ambience';
import {
  Bookmark,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Tag,
  Palette,
  Headphones,
  Check,
  Calendar,
  Upload,
  Search,
  Filter,
  Eye,
  Edit3,
  Layers,
  Camera,
  Sun,
  ShieldAlert,
  FolderPlus,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const ALL_ROLES: ReferenceRole[] = [
  'Composition',
  'Camera and perspective',
  'Lighting',
  'Color palette',
  'Environment and architecture',
  'Visual style',
  'Atmosphere',
  'Material and texture',
  'Animation inspiration',
  'General inspiration',
];

const CATEGORIES = [
  'All Categories',
  'Fantasy & Magic',
  'Cozy & Nature',
  'Gaming Ambience',
  'Urban & Sci-Fi',
  'Pastoral & Folk',
  'Audio Benchmarks',
];

export const ReferenceLibraryView: React.FC = () => {
  const [references, setReferences] = useState<ReferenceItem[]>(() => StorageService.getReferences());
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRole, setSelectedRole] = useState<string>('All');

  // Modal / Detail state
  const [activeItem, setActiveItem] = useState<ReferenceItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // New reference form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fantasy & Magic');
  const [notes, setNotes] = useState('');
  const [keywords, setKeywords] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [selectedRoles, setSelectedRoles] = useState<ReferenceRole[]>(['Composition', 'Lighting']);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Editable analysis state when viewing detail
  const [editingAnalysis, setEditingAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isEditingAnalysisMode, setIsEditingAnalysisMode] = useState(false);

  useEffect(() => {
    setReferences(StorageService.getReferences());
    setProjects(StorageService.getProjects());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setImageBase64(res);
      setMimeType(file.type || 'image/jpeg');
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRef: ReferenceItem = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      category,
      imageUrl: imageBase64 || undefined,
      mimeType: imageBase64 ? mimeType : undefined,
      tags: keywords.split(',').map((s) => s.trim()).filter(Boolean),
      roles: selectedRoles,
      assignedProjectIds: selectedProjectIds,
      notes: notes.trim(),
      atmosphereKeywords: keywords.split(',').map((s) => s.trim()).filter(Boolean),
      createdAt: Date.now(),
    };

    StorageService.saveReference(newRef);
    setReferences(StorageService.getReferences());
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setKeywords('');
    setImageBase64('');
    setSelectedRoles(['Composition', 'Lighting']);
    setSelectedProjectIds([]);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this reference item?')) {
      StorageService.deleteReference(id);
      setReferences(StorageService.getReferences());
      if (activeItem?.id === id) {
        setActiveItem(null);
      }
    }
  };

  const handleOpenDetail = (item: ReferenceItem) => {
    setActiveItem(item);
    setEditingAnalysis(item.analysis ? JSON.parse(JSON.stringify(item.analysis)) : null);
    setIsEditingAnalysisMode(false);
    setAnalysisError(null);
  };

  const handleRunAIAnalysis = async (item: ReferenceItem) => {
    if (!item.imageUrl) {
      alert('This reference item does not have an attached image for AI visual analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/gemini/analyze-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: item.imageUrl,
          mimeType: item.mimeType || 'image/jpeg',
          title: item.title,
          category: item.category,
          notes: item.notes,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze reference image.');
      }

      const updatedItem: ReferenceItem = {
        ...item,
        analysis: data.analysis,
      };

      StorageService.saveReference(updatedItem);
      setReferences(StorageService.getReferences());
      setActiveItem(updatedItem);
      setEditingAnalysis(data.analysis);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'AI analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysisEdits = () => {
    if (!activeItem || !editingAnalysis) return;
    const updated: ReferenceItem = {
      ...activeItem,
      analysis: {
        ...editingAnalysis,
        version: (editingAnalysis.version || 1) + 1,
      },
    };
    StorageService.saveReference(updated);
    setReferences(StorageService.getReferences());
    setActiveItem(updated);
    setIsEditingAnalysisMode(false);
  };

  const handleToggleRole = (role: ReferenceRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleToggleProjectAssignment = (projectId: string) => {
    if (selectedProjectIds.includes(projectId)) {
      setSelectedProjectIds(selectedProjectIds.filter((id) => id !== projectId));
    } else {
      setSelectedProjectIds([...selectedProjectIds, projectId]);
    }
  };

  // Filter references
  const filteredReferences = references.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesRole = selectedRole === 'All' || item.roles?.includes(selectedRole as ReferenceRole);

    return matchesSearch && matchesCategory && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4">
      {/* Top Banner */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
            <Bookmark className="w-5 h-5 text-[#E8AE62]" />
            Reference Library & Visual Intelligence
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-1">
            Store visual benchmarks, execute AI multimodal analysis, and assign design roles across projects
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Reference Entry
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#101722]/60 border border-[#1E2B3E] rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1AEC0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search references by title, notes, or tags..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
        >
          <option value="All">All Roles</option>
          {ALL_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Reference Items Grid */}
      {filteredReferences.length === 0 ? (
        <div className="p-16 text-center bg-[#101722]/50 border border-[#1E2B3E] rounded-2xl">
          <Bookmark className="w-10 h-10 text-[#A1AEC0]/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
            No Reference Entries Found
          </h3>
          <p className="text-xs text-[#A1AEC0] max-w-sm mx-auto mb-4">
            Upload visual references, art paintings, or film screenshots to feed AI prompt generation.
          </p>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-all shadow-md"
          >
            Upload First Reference
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReferences.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className="group p-4 rounded-2xl border border-[#1E2B3E] bg-[#101722] hover:border-[#283952] hover:bg-[#131D2C] transition-all duration-200 flex flex-col justify-between shadow-lg cursor-pointer relative overflow-hidden"
            >
              {/* Image Preview Thumbnail */}
              {item.imageUrl ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-[#0B1018] border border-[#1E2B3E]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#101722]/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-[#283952] text-[10px] text-[#E8AE62] font-mono">
                    <Sparkles className="w-3 h-3" />
                    {item.analysis ? 'AI Analyzed' : 'Ready'}
                  </div>
                </div>
              ) : (
                <div className="w-full h-28 rounded-xl bg-[#0B1018] border border-[#1E2B3E] flex items-center justify-center mb-3 text-[#A1AEC0]/40">
                  <Bookmark className="w-8 h-8" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F2EEE6] font-display line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-[#E8AE62] font-medium font-mono">
                      {item.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-[#A1AEC0] hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                    title="Delete reference"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#F2EEE6]/80 mb-3 line-clamp-2 leading-relaxed">
                  {item.notes || 'No notes provided.'}
                </p>

                {/* Roles badges */}
                {item.roles && item.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {item.roles.slice(0, 3).map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#192434] text-[9px] text-[#E8AE62] border border-[#283952] font-mono"
                      >
                        {role}
                      </span>
                    ))}
                    {item.roles.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#192434] text-[9px] text-[#A1AEC0] font-mono">
                        +{item.roles.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1E2B3E] text-[10px] text-[#A1AEC0] flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#E8AE62]" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <span className="text-[#E8AE62] flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View Analysis <Eye className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F2EEE6] font-display">
                  Upload & Register Creative Reference
                </h3>
                <p className="text-xs text-[#A1AEC0]">
                  Support PNG, JPEG, and WebP artwork for multimodal AI analysis
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#A1AEC0] hover:text-[#F2EEE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReference} className="space-y-4">
              {/* Image Upload Box */}
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                  Reference Image File (PNG, JPEG, WebP)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#283952] hover:border-[#E8AE62] rounded-xl bg-[#0B1018] cursor-pointer transition-colors p-2 text-center">
                    {imageBase64 ? (
                      <div className="flex items-center gap-3">
                        <img src={imageBase64} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                        <span className="text-xs text-[#E8AE62] font-medium">Image attached successfully</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#E8AE62] mb-1" />
                        <span className="text-xs text-[#F2EEE6] font-medium">Click to upload reference image</span>
                        <span className="text-[10px] text-[#A1AEC0]">PNG, JPG, or WEBP up to 25MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Rainy Tokyo Alleyway"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                    Tags & Keywords
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="rain, neon, cyberpunk, dark"
                    className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>
              </div>

              {/* Roles selection */}
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                  Assigned Reference Roles (Select applicable)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#0B1018] p-3 rounded-xl border border-[#1E2B3E] max-h-36 overflow-y-auto">
                  {ALL_ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-xs text-[#F2EEE6] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={() => handleToggleRole(role)}
                        className="rounded border-[#283952] bg-[#101722] text-[#E8AE62] focus:ring-0"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Project Assignment */}
              {projects.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                    Assign to Ambience Projects
                  </label>
                  <div className="flex flex-wrap gap-2 bg-[#0B1018] p-3 rounded-xl border border-[#1E2B3E]">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => handleToggleProjectAssignment(proj.id)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border font-mono transition-colors ${
                          selectedProjectIds.includes(proj.id)
                            ? 'bg-[#E8AE62] text-[#0B1018] border-[#E8AE62] font-semibold'
                            : 'bg-[#101722] text-[#A1AEC0] border-[#1E2B3E] hover:text-[#F2EEE6]'
                        }`}
                      >
                        {proj.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Creative Notes & Impressions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why does this reference inspire your ambience design?"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-colors shadow-md"
                >
                  Save Reference Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reference Detail & AI Analysis Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl max-w-4xl w-full shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E2B3E] flex items-center justify-between bg-[#131D2C]">
              <div>
                <span className="text-[10px] text-[#E8AE62] font-mono uppercase tracking-wider">
                  {activeItem.category} Reference
                </span>
                <h3 className="text-base font-semibold text-[#F2EEE6] font-display">
                  {activeItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-1.5 text-[#A1AEC0] hover:text-[#F2EEE6] rounded-lg hover:bg-[#1E2B3E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Image & Roles */}
                <div className="space-y-4">
                  {activeItem.imageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-[#1E2B3E] bg-[#0B1018] shadow-inner">
                      <img src={activeItem.imageUrl} alt={activeItem.title} className="w-full object-cover max-h-72" />
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl bg-[#0B1018] border border-[#1E2B3E] flex items-center justify-center text-[#A1AEC0]/40">
                      <Bookmark className="w-10 h-10" />
                    </div>
                  )}

                  {/* AI Analysis Trigger Button */}
                  <button
                    type="button"
                    disabled={isAnalyzing || !activeItem.imageUrl}
                    onClick={() => handleRunAIAnalysis(activeItem)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] disabled:opacity-50 rounded-xl shadow-md transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing with Gemini Vision...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {activeItem.analysis ? 'Reanalyze With Gemini Vision' : 'Analyze With Gemini Vision'}
                      </>
                    )}
                  </button>

                  {analysisError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{analysisError}</span>
                    </div>
                  )}

                  {/* Roles list */}
                  <div className="bg-[#0B1018] p-4 rounded-xl border border-[#1E2B3E]">
                    <h4 className="text-xs font-semibold text-[#F2EEE6] mb-2 flex items-center gap-1.5 font-display">
                      <Tag className="w-3.5 h-3.5 text-[#E8AE62]" /> Assigned Roles
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeItem.roles && activeItem.roles.length > 0 ? (
                        activeItem.roles.map((r, i) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-[#192434] text-[10px] text-[#E8AE62] border border-[#283952] font-mono">
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#A1AEC0]">No roles assigned.</span>
                      )}
                    </div>
                  </div>

                  {/* Project Assignments */}
                  <div className="bg-[#0B1018] p-4 rounded-xl border border-[#1E2B3E]">
                    <h4 className="text-xs font-semibold text-[#F2EEE6] mb-2 flex items-center gap-1.5 font-display">
                      <FolderPlus className="w-3.5 h-3.5 text-blue-400" /> Linked Projects
                    </h4>
                    <div className="space-y-1">
                      {activeItem.assignedProjectIds && activeItem.assignedProjectIds.length > 0 ? (
                        activeItem.assignedProjectIds.map((pid) => {
                          const p = projects.find((proj) => proj.id === pid);
                          return (
                            <div key={pid} className="text-xs text-[#F2EEE6] bg-[#131D2C] px-2.5 py-1.5 rounded-lg border border-[#1E2B3E] font-mono">
                              {p ? p.name : pid}
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-[#A1AEC0]">Not explicitly linked to any project.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Notes & AI Analysis Findings */}
                <div className="md:col-span-2 space-y-5">
                  <div className="bg-[#0B1018] p-4 rounded-xl border border-[#1E2B3E]">
                    <h4 className="text-xs font-semibold text-[#F2EEE6] mb-1.5 font-display">User Notes & Impressions</h4>
                    <p className="text-xs text-[#F2EEE6]/90 leading-relaxed">{activeItem.notes || 'No description notes provided.'}</p>
                  </div>

                  {/* AI Analysis Section */}
                  <div className="bg-[#0B1018] border border-[#1E2B3E] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#1E2B3E]">
                      <h4 className="text-xs font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
                        <Sparkles className="w-4 h-4 text-[#E8AE62]" />
                        Multimodal AI Visual Analysis
                        {activeItem.analysis?.isApproved && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-900/60 font-mono">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                      </h4>

                      {activeItem.analysis && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingAnalysisMode(!isEditingAnalysisMode)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-[#F2EEE6] bg-[#192434] hover:bg-[#283952] rounded-lg border border-[#283952]"
                          >
                            <Edit3 className="w-3 h-3" />
                            {isEditingAnalysisMode ? 'Cancel Edit' : 'Edit Analysis'}
                          </button>
                        </div>
                      )}
                    </div>

                    {!activeItem.analysis ? (
                      <div className="text-center py-10">
                        <Sparkles className="w-8 h-8 text-[#A1AEC0]/40 mx-auto mb-2" />
                        <p className="text-xs text-[#F2EEE6] font-medium mb-1">No AI Analysis Generated Yet</p>
                        <p className="text-[11px] text-[#A1AEC0] max-w-xs mx-auto mb-3">
                          Click "Analyze With Gemini Vision" to extract structured depth layers, lighting, color palettes, and animation potential.
                        </p>
                      </div>
                    ) : isEditingAnalysisMode && editingAnalysis ? (
                      /* Editable Analysis Form */
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-medium text-[#F2EEE6] mb-1">Main Subject & Environment</label>
                          <input
                            type="text"
                            value={editingAnalysis.mainSubject}
                            onChange={(e) => setEditingAnalysis({ ...editingAnalysis, mainSubject: e.target.value })}
                            className="w-full px-3 py-1.5 bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-medium text-[#F2EEE6] mb-1">Composition</label>
                            <input
                              type="text"
                              value={editingAnalysis.composition}
                              onChange={(e) => setEditingAnalysis({ ...editingAnalysis, composition: e.target.value })}
                              className="w-full px-3 py-1.5 bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6]"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-[#F2EEE6] mb-1">Lighting & Quality</label>
                            <input
                              type="text"
                              value={editingAnalysis.lighting}
                              onChange={(e) => setEditingAnalysis({ ...editingAnalysis, lighting: e.target.value })}
                              className="w-full px-3 py-1.5 bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-[#F2EEE6] mb-1">Atmosphere</label>
                          <input
                            type="text"
                            value={editingAnalysis.atmosphere}
                            onChange={(e) => setEditingAnalysis({ ...editingAnalysis, atmosphere: e.target.value })}
                            className="w-full px-3 py-1.5 bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6]"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-[#F2EEE6]">
                            <input
                              type="checkbox"
                              checked={editingAnalysis.isApproved}
                              onChange={(e) => setEditingAnalysis({ ...editingAnalysis, isApproved: e.target.checked })}
                              className="rounded border-[#283952] bg-[#101722] text-[#E8AE62]"
                            />
                            <span>Approve Findings for Prompt Engine</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleSaveAnalysisEdits}
                            className="px-3.5 py-1.5 font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg shadow-md"
                          >
                            Save Analysis Edits
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Analysis Findings */
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-[#101722] p-3 rounded-xl border border-[#1E2B3E]">
                            <span className="text-[10px] text-[#E8AE62] font-mono block mb-1">MAIN SUBJECT</span>
                            <p className="text-[#F2EEE6] leading-snug">{activeItem.analysis.mainSubject}</p>
                          </div>
                          <div className="bg-[#101722] p-3 rounded-xl border border-[#1E2B3E]">
                            <span className="text-[10px] text-[#E8AE62] font-mono block mb-1">COMPOSITION & FRAME</span>
                            <p className="text-[#F2EEE6] leading-snug">{activeItem.analysis.composition}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-[#101722] p-3 rounded-xl border border-[#1E2B3E]">
                            <span className="text-[10px] text-[#E8AE62] font-mono block mb-1">LIGHTING & COLOR TEMPERATURE</span>
                            <p className="text-[#F2EEE6] leading-snug">{activeItem.analysis.lighting}</p>
                          </div>
                          <div className="bg-[#101722] p-3 rounded-xl border border-[#1E2B3E]">
                            <span className="text-[10px] text-[#E8AE62] font-mono block mb-1">ATMOSPHERE & MOOD</span>
                            <p className="text-[#F2EEE6] leading-snug">{activeItem.analysis.atmosphere}</p>
                          </div>
                        </div>

                        {/* Color palette swatches */}
                        {activeItem.analysis.colorPalette && activeItem.analysis.colorPalette.length > 0 && (
                          <div className="bg-[#101722] p-3 rounded-xl border border-[#1E2B3E]">
                            <span className="text-[10px] text-[#E8AE62] font-mono block mb-1.5">EXTRACTED COLOR PALETTE</span>
                            <div className="flex flex-wrap gap-2">
                              {activeItem.analysis.colorPalette.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-md bg-[#192434] text-[10px] text-[#F2EEE6] border border-[#283952] font-mono flex items-center gap-1.5"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.startsWith('#') ? color : '#E8AE62' }}></span>
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Animation Opportunities & Difficulties */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
                            <span className="text-[10px] text-emerald-400 font-mono block mb-1">ANIMATION OPPORTUNITIES</span>
                            <ul className="list-disc list-inside space-y-1 text-[#F2EEE6]/90">
                              {activeItem.analysis.animationOpportunities?.map((op, idx) => (
                                <li key={idx} className="leading-snug">{op}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl">
                            <span className="text-[10px] text-amber-400 font-mono block mb-1">ANIMATION HAZARDS / LOOP DIFFICULTIES</span>
                            <ul className="list-disc list-inside space-y-1 text-[#F2EEE6]/90">
                              {activeItem.analysis.animationDifficulties?.map((diff, idx) => (
                                <li key={idx} className="leading-snug">{diff}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
