/**
 * Centralized typed data model for Ambience Intelligence Studio
 */

export type WorldCategory = 'fantasy' | 'cozy-nature' | 'gaming' | 'urban-alt' | 'custom';

export interface WorldDefinition {
  id: string;
  name: string;
  category: WorldCategory;
  tagline: string;
  suggestedSetting?: SettingType;
  suggestedLighting?: string;
  suggestedSeason?: Season;
  suggestedTime?: TimeOfDay;
  suggestedMusicStyle?: string;
}

export type SettingType = 'indoor' | 'outdoor' | 'both-view-from-inside' | 'transitional' | 'custom';

export interface LocationOption {
  id: string;
  name: string;
  settingType: SettingType;
  description?: string;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'seasonless';

export type TimeOfDay =
  | 'dawn'
  | 'early-morning'
  | 'morning'
  | 'afternoon'
  | 'golden-hour'
  | 'sunset'
  | 'dusk'
  | 'blue-hour'
  | 'night'
  | 'midnight'
  | 'custom';

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'rain'
  | 'heavy-rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'heavy-snow'
  | 'fog'
  | 'mist'
  | 'windy'
  | 'blizzard'
  | 'custom';

export interface SkyConfig {
  showSky: boolean;
  clouds: 'none' | 'sparse' | 'scattered' | 'overcast' | 'dramatic';
  cloudAnimation: 'static' | 'subtle' | 'moving';
  sun: 'hidden' | 'visible' | 'low-horizon' | 'bright';
  moon: 'hidden' | 'crescent' | 'half' | 'full';
  stars: 'off' | 'subtle' | 'prominent';
  aurora: 'off' | 'subtle' | 'prominent';
  sunbeams: 'off' | 'subtle' | 'visible';
  distantLightning: 'off' | 'subtle' | 'prominent';
  staticBackgroundLoop: boolean;
}

export type WaterType =
  | 'none'
  | 'lake'
  | 'pond'
  | 'river'
  | 'stream'
  | 'waterfall'
  | 'ocean'
  | 'coastal'
  | 'canal'
  | 'fountain'
  | 'rain-puddles'
  | 'custom';

export type WaterPlacement =
  | 'foreground'
  | 'midground'
  | 'background'
  | 'alongside'
  | 'window-view'
  | 'custom';

export type WaterBehavior =
  | 'completely-still'
  | 'gentle-ripples'
  | 'calm-flowing'
  | 'noticeable-current'
  | 'waterfall-flow'
  | 'ocean-waves'
  | 'rain-ripples';

export type WaterVisibility = 'subtle' | 'clearly-visible' | 'dominant';

export type WaterReflection =
  | 'none'
  | 'natural'
  | 'lantern'
  | 'moonlight'
  | 'sunset';

export interface WaterConfig {
  enabled: boolean;
  type: WaterType;
  customType?: string;
  placement: WaterPlacement;
  customPlacement?: string;
  behavior: WaterBehavior;
  visibility: WaterVisibility;
  reflection: WaterReflection;
  rainHittingWater: boolean;
  movementIntensity: number; // 1 to 5
  animationPriority: 'low' | 'medium' | 'high';
  preserveShorelineGeometry: boolean;
  loopSafeAnimation: boolean;
}

export type PrimaryLighting =
  | 'fireplace'
  | 'candlelight'
  | 'lantern'
  | 'interior-lamps'
  | 'moonlight'
  | 'daylight'
  | 'golden-sunlight'
  | 'overcast'
  | 'neon'
  | 'magical-glow'
  | 'mixed';

export type ColorTemperature =
  | 'warm-amber'
  | 'neutral'
  | 'cool-blue'
  | 'blue-amber-contrast'
  | 'golden-sunset'
  | 'green-forest'
  | 'custom';

export type LightingIntensity = 'very-dim' | 'dim-cozy' | 'balanced' | 'bright' | 'dramatic';

export interface LightingConfig {
  primary: PrimaryLighting;
  colorTemperature: ColorTemperature;
  customColorTemp?: string;
  intensity: LightingIntensity;
  flickeringFlames: boolean;
  subtleFluctuation: boolean;
  reflections: boolean;
  volumetricRays: boolean;
  magicalEffects: boolean;
  constantThroughoutAnimation: boolean;
}

export interface SceneElementsConfig {
  excludePeopleAndAnimals: boolean; // Master control, default true
  lightSources: string[];
  interiorObjects: string[];
  outdoorElements: string[];
  livingSubjects: string[]; // Enabled only when excludePeopleAndAnimals is false
  customElements: string[];
}

export type CameraAngle =
  | 'wide'
  | 'medium'
  | 'close-up'
  | 'eye-level'
  | 'low-angle'
  | 'high-angle'
  | 'overhead'
  | 'isometric'
  | 'first-person'
  | 'through-window'
  | 'desk-level'
  | 'custom';

export type CompositionType =
  | 'symmetrical'
  | 'rule-of-thirds'
  | 'centered'
  | 'foreground-framing'
  | 'deep-perspective'
  | 'layered'
  | 'minimal'
  | 'custom';

export type CameraMovement =
  | 'locked'
  | 'slow-pan'
  | 'slow-push'
  | 'slow-pull'
  | 'slow-lateral'
  | 'subtle-handheld'
  | 'custom';

export interface CameraConfig {
  angle: CameraAngle;
  customAngle?: string;
  composition: CompositionType;
  customComposition?: string;
  movement: CameraMovement;
  customMovement?: string;
  lockedCamera: boolean;
  preserveComposition: boolean;
  avoidFocusChanges: boolean;
  avoidPerspectiveChanges: boolean;
  avoidCinematicTransitions: boolean;
}

export type VisualStyle =
  | 'photorealistic'
  | 'cinematic-realism'
  | 'painterly'
  | 'hand-painted'
  | 'storybook'
  | 'pixel-art'
  | 'isometric-game'
  | 'vintage-film'
  | 'watercolor'
  | 'dark-academia'
  | 'soft-fantasy'
  | 'stylized-3d'
  | 'custom';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | 'custom';

export interface VisualStyleConfig {
  style: VisualStyle;
  customStyleText?: string;
  realismIntensity: number; // 1 - 5
  detailLevel: number; // 1 - 5
  colorPalette: string;
  contrast: 'soft' | 'medium' | 'high';
  depthOfField: 'shallow' | 'medium' | 'deep';
  filmGrain: 'none' | 'subtle' | 'noticeable';
  aspectRatio: AspectRatio;
  customAspectRatio?: string;
}

export type MotionIntensity = 'barely-perceptible' | 'subtle' | 'moderate' | 'prominent';

export interface VideoAnimationConfig {
  subjects: Record<string, { enabled: boolean; intensity: MotionIntensity }>;
  durationSeconds: number; // 5, 8, 10, 16
  seamlessLoop: boolean;
  lockedCamera: boolean;
  preserveAllObjects: boolean;
  preserveSceneGeometry: boolean;
  preventNewObjects: boolean;
  preventPeopleAndAnimals: boolean;
  staticBackground: boolean;
  staticSky: boolean;
  staticDistantScenery: boolean;
  consistentLighting: boolean;
  naturalPhysicalMotion: boolean;
}

export type ReferenceInfluenceLevel = 'none' | 'low' | 'moderate' | 'strong' | 'very-strong';

export interface MusicConfig {
  style: string;
  moods: string[];
  instrumentation: string[];
  tempoRange: 'very-slow' | 'slow-60-75' | 'moderate-75-90' | 'relaxed-90-105' | 'ambient-free';
  melodicProminence: number; // 1 - 5
  rhythmicIntensity: number; // 1 - 5
  harmonicComplexity: number; // 1 - 5
  instrumentDensity: number; // 1 - 5
  emotionalIntensity: number; // 1 - 5
  arrangementVariation: 'hypnotic-repetitive' | 'subtle-evolving' | 'moderate-cycles' | 'dynamic-story';
  environmentalSoundLayers: string[];
  audioDurationMinutes: number;
  referenceInfluence: ReferenceInfluenceLevel;
  referenceArtistOrTrack: string;
}

export interface PromptDrafts {
  imagePrompt: string;
  imagePromptLocked: boolean;
  videoPrompt: string;
  videoPromptLocked: boolean;
  musicPrompt: string;
  musicPromptLocked: boolean;
}

export interface AmbienceConfig {
  // Section A
  worldId: string;
  customWorldName?: string;
  customWorldDescription?: string;

  // Section B
  settingType: SettingType;
  locationId: string;
  customLocation?: string;

  // Section C
  season: Season;
  timeOfDay: TimeOfDay;
  customTimeOfDay?: string;

  // Section D
  primaryWeather: WeatherCondition;
  secondaryWeather?: WeatherCondition;
  customWeather?: string;

  // Section E
  sky: SkyConfig;

  // Section F
  water: WaterConfig;

  // Section G
  lighting: LightingConfig;

  // Section H
  elements: SceneElementsConfig;

  // Section I
  camera: CameraConfig;

  // Section J
  visualStyle: VisualStyleConfig;

  // Workspaces
  video: VideoAnimationConfig;
  music: MusicConfig;

  // Custom prompt instructions
  customNotes?: string;
}

export type PipelineStage =
  | 'concept'
  | 'references'
  | 'scene-design'
  | 'prompt-studio'
  | 'generation'
  | 'assembly'
  | 'youtube-readiness'
  | 'published';

export interface ProductionChecklist {
  imageGenerated: boolean;
  videoLooped: boolean;
  audioLayered: boolean;
  metadataDrafted: boolean;
  qualityChecked: boolean;
  exported: boolean;
}

export interface ProductionMetadata {
  youtubeTitle?: string;
  youtubeDescription?: string;
  youtubeTags?: string[];
  pinnedComment?: string;
  targetDurationMinutes?: number;
}

export interface ProductionAssetGenerationStatus {
  imageStatus: 'not_started' | 'generated' | 'approved';
  videoStatus: 'not_started' | 'generated' | 'approved';
  musicStatus: 'not_started' | 'generated' | 'approved';
  generatedImageSeed?: string;
  motionModelUsed?: string;
  audioDurationMinutes?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  config: AmbienceConfig;
  drafts: PromptDrafts;

  // Phase 6 Workflow Automation additions
  stage?: PipelineStage;
  completedStages?: PipelineStage[];
  archived?: boolean;
  targetReleaseDate?: string;
  assignedReferenceIds?: string[];
  productionMetadata?: ProductionMetadata;
  checklist?: ProductionChecklist;
  assetStatus?: ProductionAssetGenerationStatus;
  notes?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  isStarter?: boolean;
  createdAt: number;
  config: AmbienceConfig;
}

export type ReferenceRole =
  | 'Composition'
  | 'Camera and perspective'
  | 'Lighting'
  | 'Color palette'
  | 'Environment and architecture'
  | 'Visual style'
  | 'Atmosphere'
  | 'Material and texture'
  | 'Animation inspiration'
  | 'General inspiration';

export interface ImageAnalysisResult {
  mainSubject: string;
  composition: string;
  cameraAngle: string;
  depthLayers: {
    foreground: string;
    middleGround: string;
    background: string;
  };
  lighting: string;
  colorPalette: string[];
  materialsAndTextures: string[];
  atmosphere: string;
  visualStyle: string;
  importantDetails: string[];
  animationOpportunities: string[];
  animationDifficulties: string[];
  rawObservations: string;
  isApproved: boolean;
  version: number;
  analyzedAt: number;
  modelId?: string;
  modelDisplayName?: string;
}

export interface ReferenceItem {
  id: string;
  title: string;
  sourceUrl?: string;
  category: string;
  imageUrl?: string;
  mimeType?: string;
  tags: string[];
  roles: ReferenceRole[];
  assignedProjectIds: string[];
  notes: string;
  atmosphereKeywords: string[];
  colorNotes?: string;
  audioNotes?: string;
  analysis?: ImageAnalysisResult;
  createdAt: number;
}

export interface PromptHistoryEntry {
  id: string;
  projectId?: string;
  projectName: string;
  type: 'image' | 'video' | 'music' | 'bundle';
  promptText: string;
  createdAt: number;
  rating?: number;
  notes?: string;
  modelId?: string;
  modelDisplayName?: string;
  modelSource?: 'global' | 'override';
}

export interface LessonLearnedItem {
  id: string;
  category: 'Looping' | 'Water' | 'Lighting' | 'Camera' | 'Audio Layering' | 'Subjects' | 'General';
  title: string;
  observation: string;
  recommendation: string;
  effectiveForModels?: string[];
  extractedByModel?: string;
  promptType?: 'image' | 'video' | 'music' | 'bundle' | 'general';
  projectId?: string;
  projectName?: string;
  originalPrompt?: string;
  observedResult?: 'Worked well' | 'Partially worked' | 'Failed' | 'Not tested';
  attemptedCorrection?: string;
  finalOutcome?: string;
  confidenceLevel?: 'High' | 'Medium' | 'Low';
  tags?: string[];
  issueTags?: string[];
  archived?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export type ProductionStatus = 'Planned' | 'In Production' | 'Published';

export interface VideoPerformanceMetrics {
  views: number;
  watchTimeHours: number;
  averageViewDurationMinutes: number; // e.g. 18.5 min
  averagePercentageViewed: number; // e.g. 35%
  retentionAt30s: number; // e.g. 68%
  clickThroughRate: number; // e.g. 5.4%
  likes: number;
  comments: number;
  subscribersGained: number;
}

export interface CreativeDecisionBreakdown {
  worldId?: string;
  worldName?: string;
  settingType?: SettingType;
  primaryWeather?: WeatherCondition;
  secondaryWeather?: WeatherCondition;
  lightingType?: string;
  colorTemperature?: string;
  musicStyle?: string;
  audioDurationMinutes?: number;
  audioLayerCount?: number;
  hasWater: boolean;
  waterType?: string;
  cameraAngle?: string;
  lockedCamera: boolean;
  visualStyle?: string;
  motionIntensity?: string;
}

export interface VideoPerformanceRecord {
  id: string;
  title: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  thumbnailUrl?: string;
  publicationDate: string; // YYYY-MM-DD
  status: ProductionStatus;
  notes?: string;

  // Studio Connections
  projectId?: string;
  projectName?: string;
  imagePromptVersionId?: string;
  videoPromptVersionId?: string;
  musicPromptVersionId?: string;
  referenceImageIds: string[];
  lessonIds: string[];

  // Performance metrics
  metrics: VideoPerformanceMetrics;

  // Snapshot of creative decisions (or pulled from linked project)
  decisions: CreativeDecisionBreakdown;

  createdAt: number;
  updatedAt: number;
}

// ==========================================
// Phase 7: Reference Video Lab Types
// ==========================================

export interface VideoDepthPlanes {
  foreground: string;
  middleGround: string;
  background: string;
}

export interface VideoColorSwatch {
  hex: string;
  name: string;
  role: string;
}

export interface VideoAestheticAnalysis {
  worldArchetype: string;
  locationType: SettingType;
  season: Season;
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
  secondaryWeather?: WeatherCondition;
  waterElements: {
    enabled: boolean;
    type?: string;
    behavior?: string;
    notes?: string;
  };
  lighting: {
    primarySource: string;
    colorTemperature: string;
    intensity: string;
    volumetricRays: boolean;
    flickeringFlames: boolean;
    reflections: boolean;
    notes: string;
  };
  colorPalette: VideoColorSwatch[];
  materialsAndTextures: string[];
  atmosphericEffects: string[];
  depthPlanes: VideoDepthPlanes;
  composition: {
    angle: string;
    framing: string;
    focalLengthFeel: string;
    notes: string;
  };
}

export interface VideoKinematicAnalysis {
  cameraBehavior: 'Locked Tripod' | 'Subtle Slow Drift' | 'Slow Push-in' | 'Dynamic Handheld';
  motionSubjects: string[];
  motionPacing: 'Ultra-Slow / Meditative' | 'Gentle / Relaxed' | 'Moderate';
  loopCycleEstimateSeconds: number;
  loopSeamHazards: string[];
  cinematicRules: string[];
}

export interface VideoFoleyLayer {
  name: string;
  percentage: number;
  description: string;
}

export interface VideoAcousticAnalysis {
  musicalStyle: string;
  instrumentation: string[];
  tempoBpmRange: string;
  foleyLayers: VideoFoleyLayer[];
  frequencyMasteringNotes: string;
  keyMoods: string[];
}

export interface BlueprintReusableLesson {
  category: LessonLearnedItem['category'];
  title: string;
  recommendation: string;
  observation: string;
}

export interface CreativeReplicationBlueprint {
  directorVision: string;
  translatedConfig: Partial<AmbienceConfig>;
  imagePrompt: string;
  videoPrompt: string;
  musicPrompt: string;
  productionChecklist: string[];
  reusableLessons: BlueprintReusableLesson[];
}

export interface ReferenceVideoLabItem {
  id: string;
  url: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: string;
  analyzedAt: number;
  favorite?: boolean;
  notes?: string;
  tags?: string[];
  matchConfidence: number; // 0 - 100
  aesthetic: VideoAestheticAnalysis;
  kinematics: VideoKinematicAnalysis;
  acoustics: VideoAcousticAnalysis;
  blueprint: CreativeReplicationBlueprint;
  modelUsed?: {
    modelId: string;
    modelDisplayName: string;
    selectionSource: 'global' | 'override';
    durationMs?: number;
  };
}

// ==========================================
// Phase 9: Intelligent Production Assistant Types
// ==========================================

export type AssistantActionType =
  | 'diagnose'
  | 'improve-prompt'
  | 'compare-prompts'
  | 'find-lessons'
  | 'adapt-production'
  | 'review-reference-video'
  | 'general-query';

export interface AssistantDiagnosticResult {
  issueTitle: string;
  severity: 'high' | 'medium' | 'low';
  summary: string;
  detectedConflicts: {
    parameters: string[];
    explanation: string;
  }[];
  motionOrLoopRisks: string[];
  recommendedAdjustments: {
    category: string;
    setting: string;
    suggestedValue: string;
    reason: string;
  }[];
  promptFixes: {
    type: 'image' | 'video' | 'music';
    currentSnippet?: string;
    suggestedSnippet: string;
    explanation: string;
  }[];
  matchingLessonIds: string[];
  suggestedNewLesson?: {
    category: LessonLearnedItem['category'];
    title: string;
    observation: string;
    recommendation: string;
  };
}

export interface AssistantPromptComparison {
  versionA: {
    title: string;
    promptText: string;
    type: 'image' | 'video' | 'music';
  };
  versionB: {
    title: string;
    promptText: string;
    type: 'image' | 'video' | 'music';
  };
  differences: {
    addedTokens: string[];
    removedTokens: string[];
    modifiedParameters: string[];
  };
  rationale: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  text: string;
  actionType?: AssistantActionType;
  projectId?: string;
  diagnosticResult?: AssistantDiagnosticResult;
  improvedPrompts?: {
    imagePrompt?: string;
    videoPrompt?: string;
    musicPrompt?: string;
    explanation: string;
  };
  promptComparison?: AssistantPromptComparison;
  foundLessons?: LessonLearnedItem[];
  adaptedProductionRef?: {
    sourceTitle: string;
    appliedConfig: Partial<AmbienceConfig>;
    appliedPrompts?: Partial<PromptDrafts>;
  };
  suggestedWorkflowSteps?: {
    stage: PipelineStage;
    actions: string[];
    bottlenecks: string[];
  };
  feedback?: 'helpful' | 'unhelpful';
}

export interface AssistantSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  projectId?: string;
  projectName?: string;
  messages: AssistantMessage[];
}

// ==========================================
// Phase 10: Production Recipe Builder Types
// ==========================================

export type RecipeVariationType =
  | 'seasonal'
  | 'time-of-day'
  | 'weather'
  | 'mood'
  | 'custom';

export interface RecipePromptTemplates {
  imagePrompt?: string;
  videoPrompt?: string;
  musicPrompt?: string;
}

export interface RecipeRecommendedAesthetic {
  styleName?: string;
  colorPalette?: string[];
  lightingMood?: string;
  motionPacing?: string;
}

export interface ProductionRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  favorite?: boolean;
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
  version: number;
  parentRecipeId?: string;
  variationType?: RecipeVariationType;
  variationNotes?: string;
  config: AmbienceConfig;
  promptTemplates: RecipePromptTemplates;
  recommendedAesthetic?: RecipeRecommendedAesthetic;
  targetAudienceNotes?: string;
  linkedLessonIds?: string[];
  linkedProjectIds?: string[];
  linkedVideoLabItemIds?: string[];
  performanceNotes?: string;
}


