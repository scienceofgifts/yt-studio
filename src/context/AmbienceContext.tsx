import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AmbienceConfig,
  Project,
  Preset,
  PromptDrafts,
  SettingType,
  WeatherCondition,
  ReferenceVideoLabItem,
  CreativeReplicationBlueprint,
  LessonLearnedItem,
  AssistantSession,
  AssistantActionType,
  AssistantMessage,
  ProductionRecipe,
  RecipeVariationType,
} from '../types/ambience';
import { generateRecipeVariation } from '../utils/recipeVariationGenerator';
import {
  SupportedGeminiModelId,
  StudioTaskType,
  TaskModelConfig,
  resolveModelForTask,
  getModelInfo,
  ModelCapabilityInfo,
} from '../data/modelRegistry';
import { StorageService } from '../services/storage';
import { ImageStorage } from '../services/imageStorage';
import { AiPromptService, GeneratedPromptsResult } from '../services/aiPromptService';
import { AssistantService } from '../services/assistantService';
import { compilePrompts, CompiledPrompts } from '../utils/promptCompiler';
import { detectConflicts, ConflictWarning } from '../utils/conflicts';
import { createDefaultAmbienceConfig } from '../data/starterPresets';
import { WORLDS_CATALOG } from '../data/catalog';

export type StudioView =
  | 'create'
  | 'projects'
  | 'workflow'
  | 'video-lab'
  | 'production-intelligence'
  | 'presets'
  | 'recipes'
  | 'images'
  | 'references'
  | 'history'
  | 'lessons'
  | 'settings'
  | 'assistant';

export type WorkflowStage = 'concept' | 'refine' | 'video' | 'music' | 'prompts';

interface AmbienceContextType {
  activeView: StudioView;
  setActiveView: (view: StudioView) => void;
  workflowStage: WorkflowStage;
  setWorkflowStage: (stage: WorkflowStage) => void;

  // Active Project & State
  projects: Project[];
  activeProject: Project;
  config: AmbienceConfig;
  drafts: PromptDrafts;
  isModified: boolean;

  // Conflict Warnings
  conflicts: ConflictWarning[];
  resolveConflict: (warning: ConflictWarning) => void;

  // Configuration Updates
  updateConfig: (updater: (prev: AmbienceConfig) => AmbienceConfig) => void;
  selectWorld: (worldId: string) => void;
  setSettingType: (settingType: SettingType) => void;
  setLocation: (locationId: string) => void;
  toggleWater: (enabled: boolean) => void;
  toggleSky: (enabled: boolean) => void;
  toggleLockedCamera: (locked: boolean) => void;
  applyLoopOptimizationPreset: () => void;

  // Resets
  resetSection: (section: 'world' | 'environment' | 'water' | 'lighting' | 'elements' | 'camera' | 'style' | 'video' | 'music') => void;
  resetEntireProject: () => void;

  // Project management
  saveActiveProject: () => void;
  createNewProject: (name: string, description?: string) => Project;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
  updateProject: (project: Project) => void;

  // Presets
  presets: Preset[];
  applyPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string, description: string, category: string) => void;
  deletePreset: (id: string) => void;

  // Drafts & Prompt Workbench
  updateDraft: (type: 'imagePrompt' | 'videoPrompt' | 'musicPrompt', value: string) => void;
  toggleDraftLock: (type: 'imagePromptLocked' | 'videoPromptLocked' | 'musicPromptLocked') => void;
  regenerateDraftsFromConfig: (forceAll?: boolean) => void;
  revertToCompiledPrompts: (target?: 'all' | 'image' | 'video' | 'music') => void;
  compiledPrompts: CompiledPrompts;

  // AI Prompt Generation
  isGeneratingPrompts: boolean;
  generationTarget: 'all' | 'image' | 'video' | 'music' | null;
  generationError: string | null;
  lastAiResult: GeneratedPromptsResult | null;
  selectedAiReferenceAssetId: string | null;
  setSelectedAiReferenceAssetId: (id: string | null) => void;
  directorInstructions: string;
  setDirectorInstructions: (instructions: string) => void;
  generateAiPrompts: (
    target?: 'all' | 'image' | 'video' | 'music',
    customReferenceAssetId?: string,
    customNotes?: string
  ) => Promise<boolean>;
  cancelGeneration: () => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Reference Video Lab (Phase 7)
  videoLabItems: ReferenceVideoLabItem[];
  saveVideoLabItem: (item: ReferenceVideoLabItem) => void;
  deleteVideoLabItem: (id: string) => void;
  toggleFavoriteVideoLabItem: (id: string) => void;
  createProjectFromBlueprint: (
    blueprint: CreativeReplicationBlueprint,
    title: string,
    sourceLabItem?: ReferenceVideoLabItem
  ) => Project;
  applyBlueprintToActiveProject: (blueprint: CreativeReplicationBlueprint) => void;

  // Model Selection & API Routing (Phase: Model Selector)
  modelConfig: TaskModelConfig;
  setGlobalModel: (modelId: SupportedGeminiModelId) => void;
  setTaskOverride: (taskType: StudioTaskType, modelId?: SupportedGeminiModelId) => void;
  resetTaskOverride: (taskType: StudioTaskType) => void;
  resetAllOverrides: () => void;
  getTaskActiveModel: (taskType: StudioTaskType) => {
    modelId: SupportedGeminiModelId;
    displayName: string;
    isOverride: boolean;
    modelInfo: ModelCapabilityInfo;
  };

  // Phase 9: Production Assistant
  assistantSessions: AssistantSession[];
  activeAssistantSession: AssistantSession | null;
  setActiveAssistantSessionId: (id: string | null) => void;
  isAssistantThinking: boolean;
  contextualPanelOpen: boolean;
  setContextualPanelOpen: (open: boolean) => void;
  toggleContextualPanel: () => void;
  runAssistantAction: (
    actionType: AssistantActionType,
    userMessage?: string,
    targetProjectId?: string
  ) => Promise<AssistantMessage | null>;
  applyAssistantPromptFix: (prompts: { imagePrompt?: string; videoPrompt?: string; musicPrompt?: string }) => void;
  saveAssistantNewLesson: (lesson: { category: LessonLearnedItem['category']; title: string; observation: string; recommendation: string }) => void;
  deleteAssistantSession: (id: string) => void;
  createNewAssistantSession: (title?: string) => AssistantSession;
  setMessageFeedback: (sessionId: string, messageId: string, feedback: 'helpful' | 'unhelpful') => void;

  // Phase 10: Production Recipes
  recipes: ProductionRecipe[];
  activeRecipeId: string | null;
  setActiveRecipeId: (id: string | null) => void;
  createRecipeFromConfig: (
    name: string,
    description: string,
    category: string,
    tags: string[],
    targetAudienceNotes?: string
  ) => ProductionRecipe;
  createRecipeFromProject: (
    projectId: string,
    name?: string,
    description?: string
  ) => ProductionRecipe | null;
  applyRecipe: (recipeId: string) => void;
  createProjectFromRecipe: (
    recipeId: string,
    projectName?: string
  ) => Project | null;
  updateRecipe: (recipe: ProductionRecipe) => void;
  duplicateRecipe: (recipeId: string) => ProductionRecipe | null;
  deleteRecipe: (recipeId: string) => void;
  toggleFavoriteRecipe: (recipeId: string) => void;
  toggleArchiveRecipe: (recipeId: string) => void;
  createRecipeVariation: (
    baseRecipeId: string,
    variationType: RecipeVariationType,
    targetValue?: string,
    customOverrides?: Partial<AmbienceConfig>
  ) => ProductionRecipe | null;
  exportRecipeJSON: (recipeId: string) => string;
  importRecipesJSON: (jsonStr: string) => { success: boolean; count: number; error?: string };
}

const AmbienceContext = createContext<AmbienceContextType | null>(null);

export const AmbienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<StudioView>('create');
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('concept');
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => StorageService.getActiveProjectId());
  const [presets, setPresets] = useState<Preset[]>(() => StorageService.getPresets());
  const [recipes, setRecipes] = useState<ProductionRecipe[]>(() => StorageService.getRecipes());
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Generation States
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState<boolean>(false);
  const [generationTarget, setGenerationTarget] = useState<'all' | 'image' | 'video' | 'music' | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastAiResult, setLastAiResult] = useState<GeneratedPromptsResult | null>(null);
  const [selectedAiReferenceAssetId, setSelectedAiReferenceAssetId] = useState<string | null>(null);
  const [directorInstructions, setDirectorInstructions] = useState<string>('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const activeProject = useMemo(() => {
    const found = projects.find((p) => p.id === activeProjectId);
    return found || projects[0] || StorageService.createInitialProject();
  }, [projects, activeProjectId]);

  const [config, setConfig] = useState<AmbienceConfig>(activeProject.config);
  const [drafts, setDrafts] = useState<PromptDrafts>(activeProject.drafts);
  const [isModified, setIsModified] = useState<boolean>(false);

  // Deterministic compiled baseline prompts
  const compiledPrompts = useMemo(() => compilePrompts(config), [config]);

  // Sync state when active project changes
  useEffect(() => {
    setConfig(activeProject.config);
    setDrafts(activeProject.drafts);
    setIsModified(false);
  }, [activeProject.id]);

  // Conflict detection
  const conflicts = useMemo(() => detectConflicts(config), [config]);

  const resolveConflict = useCallback((warning: ConflictWarning) => {
    if (warning.resolve) {
      setConfig((prev) => {
        const updated = warning.resolve!(prev);
        setIsModified(true);
        return updated;
      });
      showToast(`Resolved: ${warning.title}`);
    }
  }, [showToast]);

  // General config updater
  const updateConfig = useCallback((updater: (prev: AmbienceConfig) => AmbienceConfig) => {
    setConfig((prev) => {
      const updated = updater(prev);
      setIsModified(true);
      return updated;
    });
  }, []);

  // Update prompt drafts automatically if not locked
  useEffect(() => {
    const compiled = compilePrompts(config);
    setDrafts((prev) => ({
      imagePrompt: prev.imagePromptLocked ? prev.imagePrompt : compiled.imagePrompt,
      imagePromptLocked: prev.imagePromptLocked,
      videoPrompt: prev.videoPromptLocked ? prev.videoPrompt : compiled.videoPrompt,
      videoPromptLocked: prev.videoPromptLocked,
      musicPrompt: prev.musicPromptLocked ? prev.musicPrompt : compiled.musicPrompt,
      musicPromptLocked: prev.musicPromptLocked,
    }));
  }, [config]);

  // Selecting a world influences relevant defaults without overwriting explicit changes
  const selectWorld = useCallback((worldId: string) => {
    const world = WORLDS_CATALOG.find((w) => w.id === worldId);
    setConfig((prev) => {
      const next = { ...prev, worldId };
      if (world) {
        if (world.suggestedSetting && !prev.customLocation) {
          next.settingType = world.suggestedSetting;
        }
        if (world.suggestedSeason) {
          next.season = world.suggestedSeason;
        }
        if (world.suggestedTime) {
          next.timeOfDay = world.suggestedTime;
        }
        if (world.suggestedMusicStyle) {
          next.music = {
            ...next.music,
            style: world.suggestedMusicStyle,
          };
        }
      }
      setIsModified(true);
      return next;
    });
    showToast(`World set: ${world?.name || worldId}`);
  }, [showToast]);

  const setSettingType = useCallback((settingType: SettingType) => {
    setConfig((prev) => {
      let defaultLoc = 'common-room';
      if (settingType === 'outdoor') defaultLoc = 'village';
      else if (settingType === 'both-view-from-inside') defaultLoc = 'rainy-window-view';
      else if (settingType === 'transitional') defaultLoc = 'covered-porch';

      setIsModified(true);
      return {
        ...prev,
        settingType,
        locationId: defaultLoc,
      };
    });
  }, []);

  const setLocation = useCallback((locationId: string) => {
    setConfig((prev) => {
      setIsModified(true);
      return { ...prev, locationId };
    });
  }, []);

  const toggleWater = useCallback((enabled: boolean) => {
    setConfig((prev) => {
      setIsModified(true);
      return {
        ...prev,
        water: {
          ...prev.water,
          enabled,
        },
      };
    });
  }, []);

  const toggleSky = useCallback((enabled: boolean) => {
    setConfig((prev) => {
      setIsModified(true);
      return {
        ...prev,
        sky: {
          ...prev.sky,
          showSky: enabled,
        },
      };
    });
  }, []);

  const toggleLockedCamera = useCallback((locked: boolean) => {
    setConfig((prev) => {
      setIsModified(true);
      return {
        ...prev,
        camera: {
          ...prev.camera,
          lockedCamera: locked,
        },
        video: {
          ...prev.video,
          lockedCamera: locked,
        },
      };
    });
  }, []);

  const applyLoopOptimizationPreset = useCallback(() => {
    setConfig((prev) => {
      setIsModified(true);
      return {
        ...prev,
        camera: {
          ...prev.camera,
          lockedCamera: true,
          avoidFocusChanges: true,
          avoidPerspectiveChanges: true,
          avoidCinematicTransitions: true,
        },
        video: {
          ...prev.video,
          seamlessLoop: true,
          lockedCamera: true,
          preserveAllObjects: true,
          preserveSceneGeometry: true,
          preventNewObjects: true,
          preventPeopleAndAnimals: true,
          staticBackground: true,
          staticSky: true,
          staticDistantScenery: true,
          consistentLighting: true,
          naturalPhysicalMotion: true,
        },
        water: {
          ...prev.water,
          movementIntensity: Math.min(prev.water.movementIntensity, 2),
          loopSafeAnimation: true,
          preserveShorelineGeometry: true,
        },
      };
    });
    showToast('Applied Loop Optimization preset');
  }, [showToast]);

  // Section reset logic
  const resetSection = useCallback((section: string) => {
    const defaults = createDefaultAmbienceConfig();
    setConfig((prev) => {
      setIsModified(true);
      switch (section) {
        case 'world':
          return {
            ...prev,
            worldId: defaults.worldId,
            customWorldName: undefined,
            customWorldDescription: undefined,
          };
        case 'environment':
          return {
            ...prev,
            settingType: defaults.settingType,
            locationId: defaults.locationId,
            season: defaults.season,
            timeOfDay: defaults.timeOfDay,
            primaryWeather: defaults.primaryWeather,
            secondaryWeather: undefined,
            sky: defaults.sky,
          };
        case 'water':
          return {
            ...prev,
            water: defaults.water,
          };
        case 'lighting':
          return {
            ...prev,
            lighting: defaults.lighting,
          };
        case 'elements':
          return {
            ...prev,
            elements: defaults.elements,
          };
        case 'camera':
          return {
            ...prev,
            camera: defaults.camera,
          };
        case 'style':
          return {
            ...prev,
            visualStyle: defaults.visualStyle,
          };
        case 'video':
          return {
            ...prev,
            video: defaults.video,
          };
        case 'music':
          return {
            ...prev,
            music: defaults.music,
          };
        default:
          return prev;
      }
    });
    showToast(`Reset ${section} section to studio defaults`);
  }, [showToast]);

  const resetEntireProject = useCallback(() => {
    const fresh = createDefaultAmbienceConfig();
    setConfig(fresh);
    const compiled = compilePrompts(fresh);
    setDrafts({
      imagePrompt: compiled.imagePrompt,
      imagePromptLocked: false,
      videoPrompt: compiled.videoPrompt,
      videoPromptLocked: false,
      musicPrompt: compiled.musicPrompt,
      musicPromptLocked: false,
    });
    setIsModified(true);
    showToast('Reset entire project configuration');
  }, [showToast]);

  // Project persistence
  const saveActiveProject = useCallback(() => {
    const updated: Project = {
      ...activeProject,
      config,
      drafts,
      updatedAt: Date.now(),
    };
    StorageService.saveProject(updated);
    setProjects(StorageService.getProjects());
    setIsModified(false);
    showToast(`Project "${activeProject.name}" saved`);
  }, [activeProject, config, drafts, showToast]);

  const createNewProject = useCallback((name: string, description?: string): Project => {
    const newProj = StorageService.createNewProject(name, description);
    setProjects(StorageService.getProjects());
    setActiveProjectId(newProj.id);
    StorageService.setActiveProjectId(newProj.id);
    showToast(`Created project "${name}"`);
    return newProj;
  }, [showToast]);

  const updateProject = useCallback((project: Project) => {
    StorageService.saveProject(project);
    setProjects(StorageService.getProjects());
    if (project.id === activeProjectId) {
      setConfig(project.config);
      setDrafts(project.drafts);
    }
  }, [activeProjectId]);

  const renameProject = useCallback((id: string, name: string) => {
    StorageService.renameProject(id, name);
    setProjects(StorageService.getProjects());
    showToast('Project renamed');
  }, [showToast]);

  const duplicateProject = useCallback((id: string) => {
    const duplicated = StorageService.duplicateProject(id);
    if (duplicated) {
      setProjects(StorageService.getProjects());
      setActiveProjectId(duplicated.id);
      StorageService.setActiveProjectId(duplicated.id);
      showToast(`Duplicated into "${duplicated.name}"`);
    }
  }, [showToast]);

  const deleteProject = useCallback((id: string) => {
    const remaining = StorageService.deleteProject(id);
    setProjects(remaining);
    const active = StorageService.getActiveProjectId();
    setActiveProjectId(active);
    showToast('Project deleted');
  }, [showToast]);

  const switchProject = useCallback((id: string) => {
    StorageService.setActiveProjectId(id);
    setActiveProjectId(id);
    setActiveView('create');
    showToast('Switched project');
  }, [showToast]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    setConfig(JSON.parse(JSON.stringify(preset.config)));
    setIsModified(true);
    setActiveView('create');
    showToast(`Applied preset: ${preset.name}`);
  }, [presets, showToast]);

  const saveCurrentAsPreset = useCallback((name: string, description: string, category: string) => {
    const newPreset: Preset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      description,
      category,
      isStarter: false,
      createdAt: Date.now(),
      config: JSON.parse(JSON.stringify(config)),
    };
    StorageService.savePreset(newPreset);
    setPresets(StorageService.getPresets());
    showToast(`Saved preset "${name}"`);
  }, [config, showToast]);

  const deletePreset = useCallback((id: string) => {
    StorageService.deletePreset(id);
    setPresets(StorageService.getPresets());
    showToast('Preset removed');
  }, [showToast]);

  // Phase 10: Production Recipe Callbacks
  const createRecipeFromConfig = useCallback(
    (
      name: string,
      description: string,
      category: string,
      tags: string[],
      targetAudienceNotes?: string
    ): ProductionRecipe => {
      const compiled = compilePrompts(config);
      const newRecipe: ProductionRecipe = {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name || 'Untitled Recipe',
        description: description || 'Saved studio ambience recipe',
        category: category || 'Custom',
        tags: tags.length > 0 ? tags : ['custom', 'recipe'],
        favorite: false,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        config: JSON.parse(JSON.stringify(config)),
        promptTemplates: {
          imagePrompt: drafts.imagePrompt || compiled.imagePrompt,
          videoPrompt: drafts.videoPrompt || compiled.videoPrompt,
          musicPrompt: drafts.musicPrompt || compiled.musicPrompt,
        },
        recommendedAesthetic: {
          styleName: config.visualStyle.style,
          colorPalette: [config.visualStyle.colorPalette],
          lightingMood: `${config.lighting.primary} - ${config.lighting.colorTemperature}`,
          motionPacing: config.camera.movement === 'locked' ? 'Ultra-Slow / Meditative' : 'Gentle',
        },
        targetAudienceNotes,
      };
      StorageService.saveRecipe(newRecipe);
      setRecipes(StorageService.getRecipes());
      showToast(`Saved recipe "${newRecipe.name}"`);
      return newRecipe;
    },
    [config, drafts, showToast]
  );

  const createRecipeFromProject = useCallback(
    (projectId: string, customName?: string, customDesc?: string): ProductionRecipe | null => {
      const targetProj = projects.find((p) => p.id === projectId);
      if (!targetProj) return null;

      const compiled = compilePrompts(targetProj.config);
      const newRecipe: ProductionRecipe = {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: customName || targetProj.name,
        description: customDesc || targetProj.description || `Converted from project ${targetProj.name}`,
        category: 'Production Snapshots',
        tags: ['project-derived', targetProj.config.settingType],
        favorite: false,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        config: JSON.parse(JSON.stringify(targetProj.config)),
        promptTemplates: {
          imagePrompt: targetProj.drafts.imagePrompt || compiled.imagePrompt,
          videoPrompt: targetProj.drafts.videoPrompt || compiled.videoPrompt,
          musicPrompt: targetProj.drafts.musicPrompt || compiled.musicPrompt,
        },
        linkedProjectIds: [targetProj.id],
      };
      StorageService.saveRecipe(newRecipe);
      setRecipes(StorageService.getRecipes());
      showToast(`Created recipe from project "${targetProj.name}"`);
      return newRecipe;
    },
    [projects, showToast]
  );

  const applyRecipe = useCallback(
    (recipeId: string) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return;

      setConfig(JSON.parse(JSON.stringify(recipe.config)));
      const compiled = compilePrompts(recipe.config);
      setDrafts({
        imagePrompt: recipe.promptTemplates.imagePrompt || compiled.imagePrompt,
        imagePromptLocked: false,
        videoPrompt: recipe.promptTemplates.videoPrompt || compiled.videoPrompt,
        videoPromptLocked: false,
        musicPrompt: recipe.promptTemplates.musicPrompt || compiled.musicPrompt,
        musicPromptLocked: false,
      });
      setIsModified(true);
      setActiveView('create');
      showToast(`Applied recipe: ${recipe.name}`);
    },
    [recipes, showToast]
  );

  const createProjectFromRecipe = useCallback(
    (recipeId: string, projectName?: string): Project | null => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return null;

      const newProj = StorageService.createNewProject(
        projectName || `${recipe.name} Production`,
        `Based on Recipe: ${recipe.name}`
      );
      newProj.config = JSON.parse(JSON.stringify(recipe.config));
      const compiled = compilePrompts(recipe.config);
      newProj.drafts = {
        imagePrompt: recipe.promptTemplates.imagePrompt || compiled.imagePrompt,
        imagePromptLocked: false,
        videoPrompt: recipe.promptTemplates.videoPrompt || compiled.videoPrompt,
        videoPromptLocked: false,
        musicPrompt: recipe.promptTemplates.musicPrompt || compiled.musicPrompt,
        musicPromptLocked: false,
      };
      newProj.notes = `Created from Recipe: ${recipe.name} (v${recipe.version})`;
      StorageService.saveProject(newProj);

      recipe.linkedProjectIds = Array.from(new Set([...(recipe.linkedProjectIds || []), newProj.id]));
      StorageService.saveRecipe(recipe);

      setProjects(StorageService.getProjects());
      setRecipes(StorageService.getRecipes());
      setActiveProjectId(newProj.id);
      setConfig(newProj.config);
      setDrafts(newProj.drafts);
      setActiveView('create');
      showToast(`Created new project from recipe "${recipe.name}"`);
      return newProj;
    },
    [recipes, showToast]
  );

  const updateRecipe = useCallback(
    (recipe: ProductionRecipe) => {
      StorageService.saveRecipe(recipe);
      setRecipes(StorageService.getRecipes());
      showToast(`Recipe "${recipe.name}" updated`);
    },
    [showToast]
  );

  const duplicateRecipe = useCallback(
    (recipeId: string): ProductionRecipe | null => {
      const duplicated = StorageService.duplicateRecipe(recipeId);
      if (duplicated) {
        setRecipes(StorageService.getRecipes());
        showToast(`Duplicated into "${duplicated.name}"`);
      }
      return duplicated;
    },
    [showToast]
  );

  const deleteRecipe = useCallback(
    (recipeId: string) => {
      StorageService.deleteRecipe(recipeId);
      setRecipes(StorageService.getRecipes());
      showToast('Recipe deleted');
    },
    [showToast]
  );

  const toggleFavoriteRecipe = useCallback(
    (recipeId: string) => {
      const updated = StorageService.toggleFavoriteRecipe(recipeId);
      if (updated) {
        setRecipes(StorageService.getRecipes());
      }
    },
    []
  );

  const toggleArchiveRecipe = useCallback(
    (recipeId: string) => {
      const updated = StorageService.toggleArchiveRecipe(recipeId);
      if (updated) {
        setRecipes(StorageService.getRecipes());
        showToast(updated.archived ? 'Recipe archived' : 'Recipe unarchived');
      }
    },
    [showToast]
  );

  const createRecipeVariation = useCallback(
    (
      baseRecipeId: string,
      variationType: RecipeVariationType,
      targetValue?: string,
      customOverrides?: Partial<AmbienceConfig>
    ): ProductionRecipe | null => {
      const base = recipes.find((r) => r.id === baseRecipeId);
      if (!base) return null;

      const variationResult = generateRecipeVariation(base, variationType, targetValue, customOverrides);

      const variationRecipe: ProductionRecipe = {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: variationResult.suggestedName,
        description: variationResult.suggestedDescription,
        category: variationResult.suggestedCategory,
        tags: Array.from(new Set([...base.tags, 'variation', variationType])),
        favorite: false,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: (base.version || 1) + 1,
        parentRecipeId: base.id,
        variationType,
        variationNotes: `Generated as ${variationType} variation from ${base.name}`,
        config: variationResult.newConfig,
        promptTemplates: variationResult.newPrompts,
        recommendedAesthetic: base.recommendedAesthetic,
        targetAudienceNotes: base.targetAudienceNotes,
        linkedLessonIds: base.linkedLessonIds,
      };

      StorageService.saveRecipe(variationRecipe);
      setRecipes(StorageService.getRecipes());
      showToast(`Created variation "${variationRecipe.name}"`);
      return variationRecipe;
    },
    [recipes, showToast]
  );

  const exportRecipeJSON = useCallback(
    (recipeId: string): string => {
      const recipe = recipes.find((r) => r.id === recipeId);
      return JSON.stringify(recipe || {}, null, 2);
    },
    [recipes]
  );

  const importRecipesJSON = useCallback(
    (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        const itemsToImport: ProductionRecipe[] = Array.isArray(parsed) ? parsed : [parsed];
        let count = 0;
        for (const item of itemsToImport) {
          if (item.name && item.config) {
            if (!item.id) {
              item.id = `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            }
            StorageService.saveRecipe(item);
            count++;
          }
        }
        setRecipes(StorageService.getRecipes());
        showToast(`Imported ${count} recipe(s)`);
        return { success: true, count };
      } catch (err: any) {
        return { success: false, count: 0, error: err.message || 'Invalid JSON format' };
      }
    },
    [showToast]
  );

  // Draft editing
  const updateDraft = useCallback((type: 'imagePrompt' | 'videoPrompt' | 'musicPrompt', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [type]: value,
      [`${type}Locked`]: true, // Auto-lock when user manually edits
    }));
    setIsModified(true);
  }, []);

  const toggleDraftLock = useCallback((type: 'imagePromptLocked' | 'videoPromptLocked' | 'musicPromptLocked') => {
    setDrafts((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  const regenerateDraftsFromConfig = useCallback((forceAll = false) => {
    const compiled = compilePrompts(config);
    setDrafts((prev) => ({
      imagePrompt: forceAll || !prev.imagePromptLocked ? compiled.imagePrompt : prev.imagePrompt,
      imagePromptLocked: prev.imagePromptLocked,
      videoPrompt: forceAll || !prev.videoPromptLocked ? compiled.videoPrompt : prev.videoPrompt,
      videoPromptLocked: prev.videoPromptLocked,
      musicPrompt: forceAll || !prev.musicPromptLocked ? compiled.musicPrompt : prev.musicPrompt,
      musicPromptLocked: prev.musicPromptLocked,
    }));
    showToast('Recompiled prompt drafts from current configuration');
  }, [config, showToast]);

  const revertToCompiledPrompts = useCallback((target: 'all' | 'image' | 'video' | 'music' = 'all') => {
    const compiled = compilePrompts(config);
    setDrafts((prev) => ({
      imagePrompt: target === 'all' || target === 'image' ? compiled.imagePrompt : prev.imagePrompt,
      imagePromptLocked: target === 'all' || target === 'image' ? false : prev.imagePromptLocked,
      videoPrompt: target === 'all' || target === 'video' ? compiled.videoPrompt : prev.videoPrompt,
      videoPromptLocked: target === 'all' || target === 'video' ? false : prev.videoPromptLocked,
      musicPrompt: target === 'all' || target === 'music' ? compiled.musicPrompt : prev.musicPrompt,
      musicPromptLocked: target === 'all' || target === 'music' ? false : prev.musicPromptLocked,
    }));
    showToast(target === 'all' ? 'Reverted prompts to compiler defaults' : `Reverted ${target} prompt to compiler defaults`);
  }, [config, showToast]);

  // AI Prompt Generation Implementation
  const cancelGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsGeneratingPrompts(false);
      setGenerationTarget(null);
      showToast('AI prompt generation cancelled');
    }
  }, [abortController, showToast]);

  const generateAiPrompts = useCallback(async (
    target: 'all' | 'image' | 'video' | 'music' = 'all',
    customReferenceAssetId?: string,
    customNotes?: string
  ): Promise<boolean> => {
    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingPrompts(true);
    setGenerationTarget(target);
    setGenerationError(null);

    try {
      const assetIdToUse = customReferenceAssetId !== undefined ? customReferenceAssetId : selectedAiReferenceAssetId;
      let referenceImage: { mimeType: string; base64: string; name?: string } | undefined = undefined;

      if (assetIdToUse) {
        const asset = await ImageStorage.getAsset(assetIdToUse);
        if (asset && asset.dataUrl) {
          referenceImage = {
            mimeType: asset.mimeType,
            base64: asset.dataUrl,
            name: asset.name,
          };
        }
      }

      const notesToUse = customNotes !== undefined ? customNotes : directorInstructions;

      const taskType: StudioTaskType =
        target === 'image'
          ? 'image-prompt'
          : target === 'video'
          ? 'video-prompt'
          : target === 'music'
          ? 'music-prompt'
          : 'image-prompt';

      const activeTaskModel = resolveModelForTask(modelConfig, taskType);

      const result = await AiPromptService.generatePrompts({
        target,
        model: activeTaskModel.modelId,
        config,
        customInstructions: notesToUse,
        referenceImage,
        signal: controller.signal,
      });

      setLastAiResult(result);

      setDrafts((prev) => {
        const next = { ...prev };
        if ((target === 'all' || target === 'image') && result.imagePrompt) {
          next.imagePrompt = result.imagePrompt;
        }
        if ((target === 'all' || target === 'video') && result.videoPrompt) {
          next.videoPrompt = result.videoPrompt;
        }
        if ((target === 'all' || target === 'music') && result.musicPrompt) {
          next.musicPrompt = result.musicPrompt;
        }
        return next;
      });

      setIsModified(true);
      showToast(target === 'all' ? 'AI prompts generated successfully' : `AI ${target} prompt generated`);
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return false;
      }
      const msg = err.message || 'Failed to generate prompt.';
      setGenerationError(msg);
      showToast(`AI generation error: ${msg}`);
      return false;
    } finally {
      setIsGeneratingPrompts(false);
      setGenerationTarget(null);
      setAbortController(null);
    }
  }, [config, directorInstructions, selectedAiReferenceAssetId, showToast]);

  // Reference Video Lab States & Operations (Phase 7)
  const [videoLabItems, setVideoLabItems] = useState<ReferenceVideoLabItem[]>(() =>
    StorageService.getVideoLabItems()
  );

  const saveVideoLabItem = useCallback(
    (item: ReferenceVideoLabItem) => {
      StorageService.saveVideoLabItem(item);
      setVideoLabItems(StorageService.getVideoLabItems());
      showToast(`Saved analysis for "${item.title.slice(0, 32)}..."`);
    },
    [showToast]
  );

  const deleteVideoLabItem = useCallback(
    (id: string) => {
      StorageService.deleteVideoLabItem(id);
      setVideoLabItems(StorageService.getVideoLabItems());
      showToast('Removed video analysis from lab');
    },
    [showToast]
  );

  const toggleFavoriteVideoLabItem = useCallback(
    (id: string) => {
      const updated = StorageService.toggleFavoriteVideoLabItem(id);
      setVideoLabItems(StorageService.getVideoLabItems());
      if (updated) {
        showToast(updated.favorite ? 'Added to favorites' : 'Removed from favorites');
      }
    },
    [showToast]
  );

  const createProjectFromBlueprint = useCallback(
    (
      blueprint: CreativeReplicationBlueprint,
      title: string,
      sourceLabItem?: ReferenceVideoLabItem
    ): Project => {
      const newProj = StorageService.createNewProject(
        title,
        blueprint.directorVision
          ? blueprint.directorVision.slice(0, 140)
          : 'Created from Reference Video Lab blueprint'
      );
      if (blueprint.translatedConfig) {
        newProj.config = {
          ...newProj.config,
          ...blueprint.translatedConfig,
        };
        if (blueprint.translatedConfig.worldId) {
          const foundWorld = WORLDS_CATALOG.find((w) => w.id === blueprint.translatedConfig.worldId);
          if (foundWorld) {
            newProj.config.worldId = foundWorld.id;
            newProj.config.customWorldName = foundWorld.name;
          }
        }
      }
      newProj.drafts = {
        imagePrompt: blueprint.imagePrompt || newProj.drafts.imagePrompt,
        imagePromptLocked: true,
        videoPrompt: blueprint.videoPrompt || newProj.drafts.videoPrompt,
        videoPromptLocked: true,
        musicPrompt: blueprint.musicPrompt || newProj.drafts.musicPrompt,
        musicPromptLocked: true,
      };
      newProj.stage = 'prompt-studio';
      newProj.checklist = {
        imageGenerated: false,
        videoLooped: false,
        audioLayered: false,
        metadataDrafted: false,
        qualityChecked: false,
        exported: false,
      };
      newProj.completedStages = ['concept', 'references', 'scene-design'];
      StorageService.saveProject(newProj);
      setProjects(StorageService.getProjects());
      setActiveProjectId(newProj.id);
      StorageService.setActiveProjectId(newProj.id);
      setConfig(newProj.config);
      setDrafts(newProj.drafts);
      setIsModified(false);
      showToast(`Created project "${newProj.name}" from Video Lab blueprint!`);
      return newProj;
    },
    [showToast]
  );

  const applyBlueprintToActiveProject = useCallback(
    (blueprint: CreativeReplicationBlueprint) => {
      if (blueprint.translatedConfig) {
        setConfig((prev) => {
          const next = { ...prev, ...blueprint.translatedConfig };
          if (blueprint.translatedConfig.worldId) {
            const foundWorld = WORLDS_CATALOG.find((w) => w.id === blueprint.translatedConfig.worldId);
            if (foundWorld) {
              next.worldId = foundWorld.id;
              next.customWorldName = foundWorld.name;
            }
          }
          return next;
        });
      }
      setDrafts((prev) => ({
        imagePrompt: blueprint.imagePrompt || prev.imagePrompt,
        imagePromptLocked: true,
        videoPrompt: blueprint.videoPrompt || prev.videoPrompt,
        videoPromptLocked: true,
        musicPrompt: blueprint.musicPrompt || prev.musicPrompt,
        musicPromptLocked: true,
      }));
      setIsModified(true);
      showToast('Applied blueprint configuration & prompts to active project');
    },
    [showToast]
  );

  // Model Selection & API Routing (Phase: Model Selector)
  const [modelConfig, setModelConfig] = useState<TaskModelConfig>(() =>
    StorageService.getModelConfig()
  );

  const setGlobalModel = useCallback(
    (modelId: SupportedGeminiModelId) => {
      const updated = StorageService.setGlobalModel(modelId);
      setModelConfig(updated);
      showToast(`Global model set to ${getModelInfo(modelId).displayName}`);
    },
    [showToast]
  );

  const setTaskOverride = useCallback(
    (taskType: StudioTaskType, modelId?: SupportedGeminiModelId) => {
      const updated = StorageService.setTaskOverride(taskType, modelId);
      setModelConfig(updated);
      const info = modelId ? getModelInfo(modelId).displayName : 'Inherit Global';
      showToast(`Task model override updated: ${info}`);
    },
    [showToast]
  );

  const resetTaskOverride = useCallback(
    (taskType: StudioTaskType) => {
      const updated = StorageService.resetTaskOverride(taskType);
      setModelConfig(updated);
      showToast(`Reset task to inherit global model (${getModelInfo(updated.globalModelId).displayName})`);
    },
    [showToast]
  );

  const resetAllOverrides = useCallback(() => {
    const updated = StorageService.resetAllOverrides();
    setModelConfig(updated);
    showToast('All task overrides reset to inherit global model');
  }, [showToast]);

  const getTaskActiveModel = useCallback(
    (taskType: StudioTaskType) => resolveModelForTask(modelConfig, taskType),
    [modelConfig]
  );

  // Phase 9 Assistant States
  const [assistantSessions, setAssistantSessions] = useState<AssistantSession[]>(() =>
    StorageService.getAssistantSessions()
  );
  const [activeAssistantSessionId, setActiveAssistantSessionId] = useState<string | null>(null);
  const [isAssistantThinking, setIsAssistantThinking] = useState<boolean>(false);
  const [contextualPanelOpen, setContextualPanelOpen] = useState<boolean>(false);

  const activeAssistantSession = useMemo(() => {
    if (activeAssistantSessionId) {
      return assistantSessions.find((s) => s.id === activeAssistantSessionId) || null;
    }
    return assistantSessions[0] || null;
  }, [assistantSessions, activeAssistantSessionId]);

  const toggleContextualPanel = useCallback(() => {
    setContextualPanelOpen((prev) => !prev);
  }, []);

  const createNewAssistantSession = useCallback((title?: string) => {
    const newSession: AssistantSession = {
      id: `session-${Date.now()}`,
      title: title || `Assistant Chat (${new Date().toLocaleDateString()})`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      projectId: activeProjectId,
      projectName: activeProject.name,
      messages: [],
    };
    StorageService.saveAssistantSession(newSession);
    setAssistantSessions(StorageService.getAssistantSessions());
    setActiveAssistantSessionId(newSession.id);
    return newSession;
  }, [activeProjectId, activeProject.name]);

  const deleteAssistantSession = useCallback((id: string) => {
    StorageService.deleteAssistantSession(id);
    setAssistantSessions(StorageService.getAssistantSessions());
    if (activeAssistantSessionId === id) {
      setActiveAssistantSessionId(null);
    }
    showToast('Deleted assistant session');
  }, [activeAssistantSessionId, showToast]);

  const setMessageFeedback = useCallback((sessionId: string, messageId: string, feedback: 'helpful' | 'unhelpful') => {
    AssistantService.setMessageFeedback(sessionId, messageId, feedback);
    setAssistantSessions(StorageService.getAssistantSessions());
    showToast(feedback === 'helpful' ? 'Marked as helpful' : 'Feedback recorded');
  }, [showToast]);

  const applyAssistantPromptFix = useCallback((prompts: { imagePrompt?: string; videoPrompt?: string; musicPrompt?: string }) => {
    setDrafts((prev) => {
      const updated = {
        ...prev,
        ...(prompts.imagePrompt ? { imagePrompt: prompts.imagePrompt } : {}),
        ...(prompts.videoPrompt ? { videoPrompt: prompts.videoPrompt } : {}),
        ...(prompts.musicPrompt ? { musicPrompt: prompts.musicPrompt } : {}),
      };
      const proj = projects.find((p) => p.id === activeProjectId);
      if (proj) {
        StorageService.saveProject({
          ...proj,
          drafts: updated,
          updatedAt: Date.now(),
        });
        setProjects(StorageService.getProjects());
      }
      return updated;
    });
    showToast('Adopted Assistant prompt updates into project');
  }, [activeProjectId, projects, showToast]);

  const saveAssistantNewLesson = useCallback((lessonData: { category: LessonLearnedItem['category']; title: string; observation: string; recommendation: string }) => {
    const newLesson: LessonLearnedItem = {
      id: `lesson-${Date.now()}`,
      category: lessonData.category,
      title: lessonData.title,
      observation: lessonData.observation,
      recommendation: lessonData.recommendation,
      projectId: activeProjectId,
      projectName: activeProject.name,
      createdAt: Date.now(),
    };
    StorageService.saveLesson(newLesson);
    showToast(`Added to Lessons Learned: ${newLesson.title}`);
  }, [activeProjectId, activeProject.name, showToast]);

  const runAssistantAction = useCallback(async (
    actionType: AssistantActionType,
    userMessage: string = '',
    targetProjectId?: string
  ) => {
    setIsAssistantThinking(true);
    let session = activeAssistantSession;
    if (!session) {
      session = createNewAssistantSession();
    }

    const currentProject = projects.find((p) => p.id === (targetProjectId || activeProjectId)) || activeProject;
    const history = StorageService.getHistory();
    const lessons = StorageService.getLessons();
    const references = StorageService.getReferences();
    const videos = StorageService.getVideos();
    const videoLab = StorageService.getVideoLabItems();

    const userMsg: AssistantMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: Date.now(),
      text: userMessage || `Action: ${actionType.replace('-', ' ').toUpperCase()}`,
      actionType,
      projectId: currentProject.id,
    };

    AssistantService.addMessageToSession(session.id, userMsg);
    setAssistantSessions(StorageService.getAssistantSessions());

    try {
      const activeModel = getTaskActiveModel('assistant');
      const response = await AssistantService.queryAssistant({
        actionType,
        userMessage: userMsg.text,
        projectId: currentProject.id,
        activeProject: currentProject,
        allProjects: projects,
        allLessons: lessons,
        allReferences: references,
        allPerformanceVideos: videos,
        allVideoLabItems: videoLab,
        promptHistory: history,
        sessionHistory: session.messages,
        model: activeModel.modelId,
      });

      if (response.success && response.message) {
        AssistantService.addMessageToSession(session.id, response.message);
        setAssistantSessions(StorageService.getAssistantSessions());
        setIsAssistantThinking(false);
        return response.message;
      }
    } catch (err: any) {
      showToast(`Assistant error: ${err.message || 'Failed'}`);
    } finally {
      setIsAssistantThinking(false);
    }
    return null;
  }, [activeAssistantSession, activeProjectId, activeProject, createNewAssistantSession, getTaskActiveModel, projects, showToast]);

  return (
    <AmbienceContext.Provider
      value={{
        activeView,
        setActiveView,
        workflowStage,
        setWorkflowStage,
        projects,
        activeProject,
        config,
        drafts,
        isModified,
        conflicts,
        resolveConflict,
        updateConfig,
        selectWorld,
        setSettingType,
        setLocation,
        toggleWater,
        toggleSky,
        toggleLockedCamera,
        applyLoopOptimizationPreset,
        resetSection,
        resetEntireProject,
        saveActiveProject,
        createNewProject,
        renameProject,
        duplicateProject,
        deleteProject,
        switchProject,
        updateProject,
        presets,
        applyPreset,
        saveCurrentAsPreset,
        deletePreset,
        updateDraft,
        toggleDraftLock,
        regenerateDraftsFromConfig,
        revertToCompiledPrompts,
        compiledPrompts,
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
        toastMessage,
        showToast,
        videoLabItems,
        saveVideoLabItem,
        deleteVideoLabItem,
        toggleFavoriteVideoLabItem,
        createProjectFromBlueprint,
        applyBlueprintToActiveProject,
        modelConfig,
        setGlobalModel,
        setTaskOverride,
        resetTaskOverride,
        resetAllOverrides,
        getTaskActiveModel,
        assistantSessions,
        activeAssistantSession,
        setActiveAssistantSessionId,
        isAssistantThinking,
        contextualPanelOpen,
        setContextualPanelOpen,
        toggleContextualPanel,
        runAssistantAction,
        applyAssistantPromptFix,
        saveAssistantNewLesson,
        deleteAssistantSession,
        createNewAssistantSession,
        setMessageFeedback,
        // Phase 10: Production Recipes
        recipes,
        activeRecipeId,
        setActiveRecipeId,
        createRecipeFromConfig,
        createRecipeFromProject,
        applyRecipe,
        createProjectFromRecipe,
        updateRecipe,
        duplicateRecipe,
        deleteRecipe,
        toggleFavoriteRecipe,
        toggleArchiveRecipe,
        createRecipeVariation,
        exportRecipeJSON,
        importRecipesJSON,
      }}
    >
      {children}
    </AmbienceContext.Provider>
  );
};

export const useAmbience = (): AmbienceContextType => {
  const ctx = useContext(AmbienceContext);
  if (!ctx) throw new Error('useAmbience must be used within AmbienceProvider');
  return ctx;
};

