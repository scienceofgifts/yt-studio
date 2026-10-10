export type SupportedGeminiModelId =
  | 'gemini-3.8-flash'
  | 'gemini-3.7-flash'
  | 'gemini-3.6-flash'
  | 'gemini-3.5-flash'
  | 'gemini-3.5-flash-lite'
  | 'gemini-flash-latest'
  | 'gemini-flash-latest-lite'
  | 'gemini-3.1-flash-lite';

export type StudioTaskType =
  | 'video-analysis'
  | 'reference-analysis'
  | 'image-prompt'
  | 'video-prompt'
  | 'music-prompt'
  | 'lesson-extraction'
  | 'production-analysis'
  | 'assistant';

export interface TaskDefinition {
  id: StudioTaskType;
  label: string;
  shortLabel: string;
  description: string;
  category: 'perception' | 'prompting' | 'intelligence';
  iconName: string;
  recommendedFamily: 'Flash Lite' | 'Flash';
}

export interface ModelCapabilityInfo {
  id: SupportedGeminiModelId;
  displayName: string;
  family: 'Flash Lite' | 'Flash';
  generation: string;
  tagline: string;
  description: string;
  contextWindow: string;
  status: 'verified';
  isDefault?: boolean;
  capabilities: {
    text: boolean;
    imageAnalysis: boolean;
    videoAnalysis: boolean;
    audioPerception: boolean;
    structuredJson: boolean;
  };
  supportedTasks: StudioTaskType[];
  bestFor: string[];
}

export interface TaskModelConfig {
  globalModelId: SupportedGeminiModelId;
  taskOverrides: Partial<Record<StudioTaskType, SupportedGeminiModelId | 'inherit'>>;
}

export interface ModelExecutionMetadata {
  modelId: SupportedGeminiModelId;
  modelDisplayName: string;
  taskType: StudioTaskType;
  timestamp: number;
  selectionSource: 'global' | 'override';
  durationMs?: number;
}

export const VERIFIED_MODELS_LIST: ModelCapabilityInfo[] = [
  {
    id: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    family: 'Flash',
    generation: 'Gemini 3.8',
    isDefault: true,
    tagline: 'Flagship Flash Intelligence — Deep Multimodal Synthesis',
    description: 'Top-tier Flash model combining rapid execution with comprehensive multimodal reasoning, acoustic deconstruction, and creative blueprinting.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: true, audioPerception: true, structuredJson: true },
    supportedTasks: ['video-analysis', 'reference-analysis', 'image-prompt', 'video-prompt', 'music-prompt', 'lesson-extraction', 'production-analysis', 'assistant'],
    bestFor: ['Full YouTube Video Lab reverse-engineering', 'Creative Replication Blueprints', 'Cross-stage production intelligence'],
  },
  {
    id: 'gemini-3.7-flash',
    displayName: 'Gemini 3.7 Flash',
    family: 'Flash',
    generation: 'Gemini 3.7',
    tagline: 'Advanced Flash Intelligence with Balanced Latency',
    description: 'Optimized Flash model for robust creative prompt composition and video layering.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: true, audioPerception: true, structuredJson: true },
    supportedTasks: ['video-analysis', 'reference-analysis', 'image-prompt', 'video-prompt', 'music-prompt', 'lesson-extraction', 'production-analysis', 'assistant'],
    bestFor: ['Detailed scene decomposition', 'Balanced speed and reasoning'],
  },
  {
    id: 'gemini-3.6-flash',
    displayName: 'Gemini 3.6 Flash',
    family: 'Flash',
    generation: 'Gemini 3.6',
    tagline: 'High-Performance Cinematic Flash',
    description: 'Reliable checkpoint tuned for consistent multi-layer storytelling and asset parsing.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: true, audioPerception: false, structuredJson: true },
    supportedTasks: ['reference-analysis', 'image-prompt', 'video-prompt', 'music-prompt', 'assistant'],
    bestFor: ['Prompt drafting', 'Reference image parsing'],
  },
  {
    id: 'gemini-3.5-flash',
    displayName: 'Gemini 3.5 Flash',
    family: 'Flash',
    generation: 'Gemini 3.5',
    tagline: 'Robust Production Flash Checkpoint',
    description: 'Well-tested production model for general creative work and ambience composition.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: true, audioPerception: false, structuredJson: true },
    supportedTasks: ['reference-analysis', 'image-prompt', 'video-prompt', 'music-prompt', 'assistant'],
    bestFor: ['General ambience generation', 'Audio & music prompts'],
  },
  {
    id: 'gemini-3.5-flash-lite',
    displayName: 'Gemini 3.5 Flash Lite',
    family: 'Flash Lite',
    generation: 'Gemini 3.5',
    tagline: 'Ultra-Fast Lightweight Flash Lite',
    description: 'Engineered for maximum responsiveness and quick text drafting.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: true, audioPerception: false, structuredJson: true },
    supportedTasks: ['image-prompt', 'video-prompt', 'music-prompt', 'assistant'],
    bestFor: ['Rapid prompt iterations', 'Lightweight text formatting'],
  },
  {
    id: 'gemini-flash-latest',
    displayName: 'Gemini Flash Latest',
    family: 'Flash',
    generation: 'Continuous',
    tagline: 'Auto-Updated Flash Alias',
    description: 'Points automatically to the latest stable deployment of the Gemini Flash engine for guaranteed up-to-date performance.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: true, audioPerception: true, structuredJson: true },
    supportedTasks: ['video-analysis', 'reference-analysis', 'image-prompt', 'video-prompt', 'music-prompt', 'lesson-extraction', 'production-analysis', 'assistant'],
    bestFor: ['Continuous updates', 'General studio operations'],
  },
  {
    id: 'gemini-flash-latest-lite',
    displayName: 'Gemini Flash Latest Lite',
    family: 'Flash Lite',
    generation: 'Continuous',
    tagline: 'Auto-Updated Flash Lite Alias',
    description: 'Points automatically to the latest lightweight Flash production checkpoint.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: false, audioPerception: false, structuredJson: true },
    supportedTasks: ['image-prompt', 'video-prompt', 'assistant'],
    bestFor: ['Fast lightweight drafting'],
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite',
    family: 'Flash Lite',
    generation: 'Gemini 3.1',
    tagline: 'Ultra-Lightweight Baseline',
    description: 'Compact Gemini 3.1 Flash Lite model for baseline text structuring and swift prompt drafting.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: { text: true, imageAnalysis: true, videoAnalysis: true, audioPerception: false, structuredJson: true },
    supportedTasks: ['image-prompt', 'video-prompt', 'music-prompt', 'lesson-extraction', 'assistant'],
    bestFor: ['Text-only prompt compilation', 'Simple lesson tags'],
  },
];

export const STUDIO_TASKS: TaskDefinition[] = [
  {
    id: 'video-analysis',
    label: 'YouTube Video Analysis',
    shortLabel: 'Video Lab',
    description: 'Reverse-engineers reference YouTube ambience videos into structural layers.',
    category: 'perception',
    iconName: 'video',
    recommendedFamily: 'Flash',
  },
  {
    id: 'reference-analysis',
    label: 'Reference Image Analysis',
    shortLabel: 'Reference Stills',
    description: 'Deconstructs uploaded still images into palette and lighting parameters.',
    category: 'perception',
    iconName: 'image',
    recommendedFamily: 'Flash',
  },
  {
    id: 'image-prompt',
    label: 'Image Prompt Generation',
    shortLabel: 'Midjourney/Flux',
    description: 'Compiles cinematic master image prompts.',
    category: 'prompting',
    iconName: 'sparkles',
    recommendedFamily: 'Flash Lite',
  },
  {
    id: 'video-prompt',
    label: 'Animation Prompt Generation',
    shortLabel: 'Video Animation',
    description: 'Synthesizes camera lock and micro-motion physics constraints.',
    category: 'prompting',
    iconName: 'film',
    recommendedFamily: 'Flash Lite',
  },
  {
    id: 'music-prompt',
    label: 'Music & Foley Prompt Generation',
    shortLabel: 'Soundscape',
    description: 'Composes musical orchestration and environmental foley prompts.',
    category: 'prompting',
    iconName: 'music',
    recommendedFamily: 'Flash',
  },
  {
    id: 'lesson-extraction',
    label: 'Experience Memory Lesson Extraction',
    shortLabel: 'Lessons',
    description: 'Extracts production rules from completed projects.',
    category: 'intelligence',
    iconName: 'brain',
    recommendedFamily: 'Flash',
  },
  {
    id: 'production-analysis',
    label: 'Production Analysis & Recommendations',
    shortLabel: 'Analytics',
    description: 'Evaluates catalog metrics and viewer retention data.',
    category: 'intelligence',
    iconName: 'trending-up',
    recommendedFamily: 'Flash',
  },
  {
    id: 'assistant',
    label: 'Production Assistant Chat',
    shortLabel: 'Assistant',
    description: 'Conversational copilot for ambient studio workflows.',
    category: 'intelligence',
    iconName: 'message-square',
    recommendedFamily: 'Flash',
  },
];

export const STUDIO_TASKS_REGISTRY = STUDIO_TASKS;

export const DEFAULT_TASK_MODEL_CONFIG: TaskModelConfig = {
  globalModelId: 'gemini-3.8-flash',
  taskOverrides: {},
};

export function getModelInfo(modelId: string): ModelCapabilityInfo {
  return VERIFIED_MODELS_LIST.find((m) => m.id === modelId) || VERIFIED_MODELS_LIST[0];
}

export function resolveModelForTask(
  config: TaskModelConfig,
  taskId: StudioTaskType
): { modelId: SupportedGeminiModelId; displayName: string; isOverride: boolean; modelInfo: ModelCapabilityInfo } {
  const override = config.taskOverrides[taskId];
  const activeId = override && override !== 'inherit' ? override : config.globalModelId;
  const modelInfo = getModelInfo(activeId);
  return {
    modelId: modelInfo.id,
    displayName: modelInfo.displayName,
    isOverride: Boolean(override && override !== 'inherit'),
    modelInfo,
  };
}
