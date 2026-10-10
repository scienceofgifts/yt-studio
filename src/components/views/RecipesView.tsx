import React, { useState, useMemo } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { ProductionRecipe, RecipeVariationType } from '../../types/ambience';
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Copy,
  Download,
  Upload,
  Layers,
  Sparkles,
  Flame,
  Check,
  Edit2,
  Trash2,
  Archive,
  ArrowRight,
  ExternalLink,
  Sliders,
  SunSnow,
  MoonStar,
  CloudRain,
  Tag,
  Lightbulb,
  BarChart3,
  GitBranch,
  X,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { VARIATION_OPTIONS } from '../../utils/recipeVariationGenerator';

export const RecipesView: React.FC = () => {
  const {
    recipes,
    projects,
    applyRecipe,
    createProjectFromRecipe,
    createRecipeFromConfig,
    createRecipeFromProject,
    updateRecipe,
    duplicateRecipe,
    deleteRecipe,
    toggleFavoriteRecipe,
    toggleArchiveRecipe,
    createRecipeVariation,
    exportRecipeJSON,
    importRecipesJSON,
    showToast,
  } = useAmbience();

  const lessons = useMemo(() => StorageService.getLessons(), []);
  const videos = useMemo(() => StorageService.getVideos(), []);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  // Modals state
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<ProductionRecipe | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'prompts' | 'variations' | 'lessons'>('overview');
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveRecipeName, setSaveRecipeName] = useState('');
  const [saveRecipeDesc, setSaveRecipeDesc] = useState('');
  const [saveRecipeCategory, setSaveRecipeCategory] = useState('Custom');
  const [saveRecipeTags, setSaveRecipeTags] = useState('cozy, study, ambience');
  const [saveTargetAudience, setSaveTargetAudience] = useState('');

  const [variationBaseRecipe, setVariationBaseRecipe] = useState<ProductionRecipe | null>(null);
  const [selectedVariationType, setSelectedVariationType] = useState<RecipeVariationType>('seasonal');
  const [variationTargetValue, setVariationTargetValue] = useState<string>('winter');

  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [exportJsonText, setExportJsonText] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);

  const [editingRecipe, setEditingRecipe] = useState<ProductionRecipe | null>(null);

  // Extract unique categories & tags
  const categories = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [recipes]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.tags) r.tags.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [recipes]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      if (showArchivedOnly) {
        if (!r.archived) return false;
      } else {
        if (r.archived) return false;
      }

      if (showFavoritesOnly && !r.favorite) return false;

      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;

      if (selectedTag !== 'all' && (!r.tags || !r.tags.includes(selectedTag))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchCat = r.category.toLowerCase().includes(q);
        const matchTags = r.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchCat && !matchTags) return false;
      }

      return true;
    });
  }, [recipes, searchQuery, selectedCategory, selectedTag, showFavoritesOnly, showArchivedOnly]);

  const stats = useMemo(() => {
    const total = recipes.filter((r) => !r.archived).length;
    const favorites = recipes.filter((r) => r.favorite && !r.archived).length;
    const variations = recipes.filter((r) => r.parentRecipeId && !r.archived).length;
    return { total, favorites, variations, categoriesCount: categories.length };
  }, [recipes, categories]);

  const handleCreateSaveRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveRecipeName.trim()) return;
    const tagArray = saveRecipeTags.split(',').map((t) => t.trim()).filter(Boolean);
    createRecipeFromConfig(
      saveRecipeName.trim(),
      saveRecipeDesc.trim(),
      saveRecipeCategory,
      tagArray,
      saveTargetAudience.trim()
    );
    setShowSaveModal(false);
    setSaveRecipeName('');
    setSaveRecipeDesc('');
  };

  const handleVariationSubmit = () => {
    if (!variationBaseRecipe) return;
    createRecipeVariation(
      variationBaseRecipe.id,
      selectedVariationType,
      variationTargetValue
    );
    setVariationBaseRecipe(null);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importRecipesJSON(importJsonText);
    if (res.success) {
      setImportJsonText('');
      setShowImportExportModal(false);
    } else {
      showToast(`Import failed: ${res.error}`);
    }
  };

  const handleOpenExport = (recipe?: ProductionRecipe) => {
    if (recipe) {
      setExportJsonText(exportRecipeJSON(recipe.id));
    } else {
      setExportJsonText(JSON.stringify(recipes, null, 2));
    }
    setShowImportExportModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Top Header & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#101722] via-[#151F2E] to-[#101722] border border-[#1E2B3E] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8AE62]/10 border border-[#E8AE62]/30 flex items-center justify-center text-[#E8AE62]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-[#F2EEE6] tracking-tight">
              Production Recipe Builder
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8AE62]/20 text-[#E8AE62] border border-[#E8AE62]/40 font-semibold">
              Phase 10
            </span>
          </div>
          <p className="text-xs text-[#A1AEC0] max-w-2xl leading-relaxed">
            Saved, reusable production snapshots of ambience video setups. Create controlled seasonal, time-of-day, and weather variations while preserving aesthetic balance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8AE62] hover:bg-[#D99B4E] text-[#0B1018] font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Save Current Config</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenExport()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#192434] hover:bg-[#223146] text-[#F2EEE6] font-medium text-xs border border-[#283952] transition-all"
          >
            <FileCode className="w-4 h-4 text-[#E8AE62]" />
            <span>Import / Export</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#101722]/80 border border-[#1E2B3E] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8AE62]/10 border border-[#E8AE62]/30 flex items-center justify-center text-[#E8AE62]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#F2EEE6]">{stats.total}</div>
            <div className="text-[10px] text-[#A1AEC0] uppercase tracking-wider font-mono">Active Recipes</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#101722]/80 border border-[#1E2B3E] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8AE62]/10 border border-[#E8AE62]/30 flex items-center justify-center text-[#E8AE62]">
            <Star className="w-4 h-4 fill-[#E8AE62]" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#F2EEE6]">{stats.favorites}</div>
            <div className="text-[10px] text-[#A1AEC0] uppercase tracking-wider font-mono">Favorites</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#101722]/80 border border-[#1E2B3E] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8AE62]/10 border border-[#E8AE62]/30 flex items-center justify-center text-[#E8AE62]">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#F2EEE6]">{stats.variations}</div>
            <div className="text-[10px] text-[#A1AEC0] uppercase tracking-wider font-mono">Variations</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#101722]/80 border border-[#1E2B3E] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8AE62]/10 border border-[#E8AE62]/30 flex items-center justify-center text-[#E8AE62]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#F2EEE6]">{stats.categoriesCount}</div>
            <div className="text-[10px] text-[#A1AEC0] uppercase tracking-wider font-mono">Categories</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#101722] border border-[#1E2B3E] space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#A1AEC0]" />
            <input
              type="text"
              placeholder="Search recipes, tags, weather..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/50 focus:outline-none focus:border-[#E8AE62]/60 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#A1AEC0] hover:text-[#F2EEE6]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
                showFavoritesOnly
                  ? 'bg-[#E8AE62]/20 border-[#E8AE62]/50 text-[#E8AE62]'
                  : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-[#E8AE62]' : ''}`} />
              <span>Favorites Only</span>
            </button>

            <button
              type="button"
              onClick={() => setShowArchivedOnly(!showArchivedOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
                showArchivedOnly
                  ? 'bg-[#223146] border-[#3B82F6]/50 text-[#3B82F6]'
                  : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-[11px] font-mono text-[#A1AEC0] shrink-0 mr-1">Category:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#E8AE62] text-[#0B1018] font-semibold'
                : 'bg-[#0B1018] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E]'
            }`}
          >
            All Categories ({recipes.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#E8AE62] text-[#0B1018] font-semibold'
                  : 'bg-[#0B1018] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#101722]/50 border border-[#1E2B3E] space-y-3">
          <BookOpen className="w-10 h-10 text-[#A1AEC0]/40 mx-auto" />
          <p className="text-sm text-[#F2EEE6] font-medium">No production recipes found</p>
          <p className="text-xs text-[#A1AEC0]">Try resetting your search filters or click "Save Current Config" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => {
            const parentRecipe = recipe.parentRecipeId
              ? recipes.find((r) => r.id === recipe.parentRecipeId)
              : null;

            return (
              <div
                key={recipe.id}
                className="group relative rounded-2xl bg-[#101722] border border-[#1E2B3E] hover:border-[#283952] transition-all duration-200 p-5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#192434] text-[#E8AE62] border border-[#283952]">
                          {recipe.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E]">
                          v{recipe.version}
                        </span>
                        {parentRecipe && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/30 flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            <span>Var of {parentRecipe.name.slice(0, 15)}...</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#F2EEE6] font-display tracking-wide truncate group-hover:text-[#E8AE62] transition-colors">
                        {recipe.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavoriteRecipe(recipe.id)}
                      className="p-1.5 rounded-lg bg-[#0B1018] text-[#A1AEC0] hover:text-[#E8AE62] border border-[#1E2B3E] transition-colors shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${recipe.favorite ? 'fill-[#E8AE62] text-[#E8AE62]' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#A1AEC0] line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Badges Summary */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E] capitalize">
                      {recipe.config.season}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E] capitalize">
                      {recipe.config.timeOfDay}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E] capitalize">
                      {recipe.config.primaryWeather}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E]">
                      {recipe.config.lighting.primary}
                    </span>
                  </div>

                  {/* Intelligence Indicators */}
                  <div className="pt-2 border-t border-[#1E2B3E]/60 flex items-center justify-between text-[11px] text-[#A1AEC0]">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#E8AE62]" />
                      <span>{recipe.linkedLessonIds?.length || 0} Lessons</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>{recipe.linkedProjectIds?.length || 0} Projects</span>
                    </div>
                  </div>
                </div>

                {/* Primary Card Buttons */}
                <div className="pt-4 mt-4 border-t border-[#1E2B3E] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyRecipe(recipe.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#E8AE62]/10 hover:bg-[#E8AE62] text-[#E8AE62] hover:text-[#0B1018] border border-[#E8AE62]/40 font-semibold text-xs transition-all"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Apply Workspace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => createProjectFromRecipe(recipe.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#192434] hover:bg-[#223146] text-[#F2EEE6] border border-[#283952] font-medium text-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Project</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setVariationBaseRecipe(recipe);
                      }}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Create Variation</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRecipeDetail(recipe)}
                        className="text-[11px] font-medium text-[#E8AE62] hover:underline"
                      >
                        Details & Prompts →
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteRecipe(recipe.id)}
                        className="p-1 rounded text-[#A1AEC0]/60 hover:text-[#F87171] transition-colors"
                        title="Delete Recipe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RECIPE DETAILS MODAL */}
      {selectedRecipeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#101722] border border-[#1E2B3E] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1E2B3E] bg-[#151F2E]/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8AE62]/20 text-[#E8AE62] border border-[#E8AE62]/40">
                    {selectedRecipeDetail.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E]">
                    Version {selectedRecipeDetail.version}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-display text-[#F2EEE6]">
                  {selectedRecipeDetail.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecipeDetail(null)}
                className="p-2 rounded-xl bg-[#0B1018] text-[#A1AEC0] hover:text-[#F2EEE6] border border-[#1E2B3E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-[#1E2B3E] bg-[#0B1018]">
              {(['overview', 'prompts', 'variations', 'lessons'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveDetailTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                    activeDetailTab === tab
                      ? 'border-[#E8AE62] text-[#E8AE62]'
                      : 'border-transparent text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#F2EEE6]">
              {activeDetailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#E8AE62]">
                      Recipe Description & Notes
                    </h4>
                    <p className="text-xs text-[#A1AEC0] leading-relaxed">
                      {selectedRecipeDetail.description}
                    </p>
                    {selectedRecipeDetail.targetAudienceNotes && (
                      <div className="pt-2 text-[11px] text-[#A1AEC0]">
                        <span className="font-semibold text-[#F2EEE6]">Target Audience Notes: </span>
                        {selectedRecipeDetail.targetAudienceNotes}
                      </div>
                    )}
                  </div>

                  {/* Core Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                      <span className="text-[10px] font-mono text-[#A1AEC0] block">World</span>
                      <span className="font-semibold text-[#F2EEE6] capitalize">{selectedRecipeDetail.config.worldId}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                      <span className="text-[10px] font-mono text-[#A1AEC0] block">Setting Type</span>
                      <span className="font-semibold text-[#F2EEE6] capitalize">{selectedRecipeDetail.config.settingType}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                      <span className="text-[10px] font-mono text-[#A1AEC0] block">Season / Time</span>
                      <span className="font-semibold text-[#F2EEE6] capitalize">{selectedRecipeDetail.config.season} / {selectedRecipeDetail.config.timeOfDay}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                      <span className="text-[10px] font-mono text-[#A1AEC0] block">Weather</span>
                      <span className="font-semibold text-[#F2EEE6] capitalize">{selectedRecipeDetail.config.primaryWeather}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                      <span className="text-[10px] font-mono text-[#A1AEC0] block">Lighting</span>
                      <span className="font-semibold text-[#F2EEE6] capitalize">{selectedRecipeDetail.config.lighting.primary}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                      <span className="text-[10px] font-mono text-[#A1AEC0] block">Camera</span>
                      <span className="font-semibold text-[#F2EEE6] capitalize">{selectedRecipeDetail.config.camera.movement} ({selectedRecipeDetail.config.camera.angle})</span>
                    </div>
                  </div>

                  {/* Aesthetic Summary */}
                  {selectedRecipeDetail.recommendedAesthetic && (
                    <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#E8AE62]">
                        Recommended Aesthetic & Style
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[#A1AEC0]">Style Name: </span>
                          <span className="font-medium text-[#F2EEE6]">{selectedRecipeDetail.recommendedAesthetic.styleName}</span>
                        </div>
                        <div>
                          <span className="text-[#A1AEC0]">Lighting Mood: </span>
                          <span className="font-medium text-[#F2EEE6]">{selectedRecipeDetail.recommendedAesthetic.lightingMood}</span>
                        </div>
                        <div>
                          <span className="text-[#A1AEC0]">Motion Pacing: </span>
                          <span className="font-medium text-[#F2EEE6]">{selectedRecipeDetail.recommendedAesthetic.motionPacing}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'prompts' && (
                <div className="space-y-4">
                  {/* Image Prompt */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#E8AE62] uppercase tracking-wider">Image Generation Prompt Template</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecipeDetail.promptTemplates.imagePrompt || '');
                          showToast('Copied image prompt');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#192434] text-[#E8AE62] text-[10px] hover:bg-[#223146]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-[#A1AEC0] bg-[#101722] p-3 rounded-lg border border-[#1E2B3E] leading-relaxed">
                      {selectedRecipeDetail.promptTemplates.imagePrompt || 'No image prompt configured'}
                    </p>
                  </div>

                  {/* Video Prompt */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#E8AE62] uppercase tracking-wider">Video Animation Prompt Template</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecipeDetail.promptTemplates.videoPrompt || '');
                          showToast('Copied video prompt');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#192434] text-[#E8AE62] text-[10px] hover:bg-[#223146]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-[#A1AEC0] bg-[#101722] p-3 rounded-lg border border-[#1E2B3E] leading-relaxed">
                      {selectedRecipeDetail.promptTemplates.videoPrompt || 'No video prompt configured'}
                    </p>
                  </div>

                  {/* Music Prompt */}
                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#E8AE62] uppercase tracking-wider">Music & Foley Audio Prompt Template</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecipeDetail.promptTemplates.musicPrompt || '');
                          showToast('Copied music prompt');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#192434] text-[#E8AE62] text-[10px] hover:bg-[#223146]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-[#A1AEC0] bg-[#101722] p-3 rounded-lg border border-[#1E2B3E] leading-relaxed">
                      {selectedRecipeDetail.promptTemplates.musicPrompt || 'No music prompt configured'}
                    </p>
                  </div>
                </div>
              )}

              {activeDetailTab === 'variations' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#A1AEC0]">
                    Parent-child variation lineage tree for this recipe:
                  </p>

                  <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#F2EEE6]">
                      <GitBranch className="w-4 h-4 text-[#E8AE62]" />
                      <span>Recipe Lineage</span>
                    </div>

                    {selectedRecipeDetail.parentRecipeId ? (
                      <div className="text-xs text-[#60A5FA]">
                        Parent Recipe ID: {selectedRecipeDetail.parentRecipeId}
                      </div>
                    ) : (
                      <div className="text-xs text-[#34D399]">
                        Root Base Recipe (No Parent)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDetailTab === 'lessons' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-[#F2EEE6]">
                    Linked Experience Memory Lessons ({selectedRecipeDetail.linkedLessonIds?.length || 0})
                  </h4>

                  {selectedRecipeDetail.linkedLessonIds?.length ? (
                    selectedRecipeDetail.linkedLessonIds.map((lId) => {
                      const lObj = lessons.find((l: any) => l.id === lId);
                      if (!lObj) return null;
                      return (
                        <div key={lId} className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-1">
                          <div className="font-semibold text-[#E8AE62]">{lObj.title}</div>
                          <div className="text-[11px] text-[#A1AEC0]">{lObj.recommendation}</div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#A1AEC0]">No specific lessons attached to this recipe yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#1E2B3E] bg-[#151F2E]/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleOpenExport(selectedRecipeDetail)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B1018] hover:bg-[#192434] text-[#A1AEC0] border border-[#1E2B3E] text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Recipe JSON</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    applyRecipe(selectedRecipeDetail.id);
                    setSelectedRecipeDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E8AE62] hover:bg-[#D99B4E] text-[#0B1018] font-semibold text-xs transition-colors"
                >
                  Apply to Active Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE / CREATE RECIPE MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateSaveRecipeSubmit}
            className="w-full max-w-lg rounded-2xl bg-[#101722] border border-[#1E2B3E] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2B3E]">
              <h3 className="text-base font-bold font-display text-[#F2EEE6]">
                Save Current Config as Recipe
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-[#A1AEC0] hover:text-[#F2EEE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A1AEC0] mb-1 font-mono">Recipe Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cozy Winter Hearth Sanctuary"
                  value={saveRecipeName}
                  onChange={(e) => setSaveRecipeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div>
                <label className="block text-[#A1AEC0] mb-1 font-mono">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the setup and mood..."
                  value={saveRecipeDesc}
                  onChange={(e) => setSaveRecipeDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1AEC0] mb-1 font-mono">Category</label>
                  <select
                    value={saveRecipeCategory}
                    onChange={(e) => setSaveRecipeCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  >
                    <option value="Fantasy & Magic">Fantasy & Magic</option>
                    <option value="Cozy Nature">Cozy Nature</option>
                    <option value="Cyberpunk & Sci-Fi">Cyberpunk & Sci-Fi</option>
                    <option value="Seasonal & Festive">Seasonal & Festive</option>
                    <option value="Lo-Fi Study">Lo-Fi Study</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A1AEC0] mb-1 font-mono">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="cozy, rain, fireplace"
                    value={saveRecipeTags}
                    onChange={(e) => setSaveRecipeTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1AEC0] mb-1 font-mono">Target Audience Notes</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube study/sleep 3-hour focus audience"
                  value={saveTargetAudience}
                  onChange={(e) => setSaveTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2B3E] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl bg-[#0B1018] text-[#A1AEC0] hover:text-[#F2EEE6] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#E8AE62] hover:bg-[#D99B4E] text-[#0B1018] font-semibold text-xs"
              >
                Save Recipe
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VARIATION BUILDER MODAL (PHASE 10B) */}
      {variationBaseRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-[#101722] border border-[#1E2B3E] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2B3E]">
              <div>
                <h3 className="text-base font-bold font-display text-[#F2EEE6]">
                  Recipe Variation Builder
                </h3>
                <p className="text-xs text-[#A1AEC0]">
                  Create controlled variation of "{variationBaseRecipe.name}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariationBaseRecipe(null)}
                className="text-[#A1AEC0] hover:text-[#F2EEE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Variation Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VARIATION_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedVariationType(opt.type)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedVariationType === opt.type
                      ? 'bg-[#192434] border-[#E8AE62] text-[#F2EEE6]'
                      : 'bg-[#0B1018] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#E8AE62] mb-0.5">{opt.label}</div>
                  <div className="text-[11px] text-[#A1AEC0] leading-snug">{opt.description}</div>
                </button>
              ))}
            </div>

            {/* Target Value Selection */}
            {selectedVariationType === 'seasonal' && (
              <div className="space-y-1 text-xs">
                <label className="block text-[#A1AEC0] font-mono">Select Target Season:</label>
                <select
                  value={variationTargetValue}
                  onChange={(e) => setVariationTargetValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6]"
                >
                  <option value="winter">Winter Snow Blizzard</option>
                  <option value="autumn">Autumn Heavy Rain</option>
                  <option value="spring">Spring Fresh Drizzle</option>
                  <option value="summer">Summer Sunshine</option>
                </select>
              </div>
            )}

            {selectedVariationType === 'time-of-day' && (
              <div className="space-y-1 text-xs">
                <label className="block text-[#A1AEC0] font-mono">Select Target Time of Day:</label>
                <select
                  value={variationTargetValue}
                  onChange={(e) => setVariationTargetValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6]"
                >
                  <option value="night">Midnight Night Hearth</option>
                  <option value="golden-hour">Golden Hour Sunset</option>
                  <option value="blue-hour">Blue Hour Twilight</option>
                </select>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs space-y-1">
              <span className="font-semibold text-[#E8AE62]">Automatic Adaptation Rule:</span>
              <p className="text-[#A1AEC0] leading-relaxed">
                The Variation Builder will update season, lighting, water settings, and automatically rewrite prompt templates to maintain aesthetic balance.
              </p>
            </div>

            <div className="pt-3 border-t border-[#1E2B3E] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVariationBaseRecipe(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1018] text-[#A1AEC0] hover:text-[#F2EEE6] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVariationSubmit}
                className="px-4 py-2 rounded-xl bg-[#E8AE62] hover:bg-[#D99B4E] text-[#0B1018] font-semibold text-xs"
              >
                Generate Variation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT / EXPORT MODAL */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-[#101722] border border-[#1E2B3E] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2B3E]">
              <h3 className="text-base font-bold font-display text-[#F2EEE6]">
                Portable JSON Recipe Export / Import
              </h3>
              <button
                type="button"
                onClick={() => setShowImportExportModal(false)}
                className="text-[#A1AEC0] hover:text-[#F2EEE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Export Area */}
            {exportJsonText && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#E8AE62]">Exported Recipe Data:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(exportJsonText);
                      setCopiedExport(true);
                      setTimeout(() => setCopiedExport(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#192434] text-[#E8AE62] text-[10px]"
                  >
                    {copiedExport ? <CheckCircle2 className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedExport ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={exportJsonText}
                  className="w-full p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] font-mono text-[10px] text-[#A1AEC0]"
                />
              </div>
            )}

            {/* Import Area */}
            <div className="space-y-2 text-xs">
              <span className="font-mono text-[#E8AE62]">Paste Recipe JSON to Import:</span>
              <textarea
                rows={5}
                placeholder="Paste recipe JSON string here..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] font-mono text-[10px] text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
              />
            </div>

            <div className="pt-3 border-t border-[#1E2B3E] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportExportModal(false)}
                className="px-4 py-2 rounded-xl bg-[#0B1018] text-[#A1AEC0] hover:text-[#F2EEE6] text-xs font-medium"
              >
                Close
              </button>
              {importJsonText && (
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="px-4 py-2 rounded-xl bg-[#E8AE62] hover:bg-[#D99B4E] text-[#0B1018] font-semibold text-xs"
                >
                  Import Recipe
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
