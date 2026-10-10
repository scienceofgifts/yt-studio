export type SupportedGeminiModelId =
  | 'gemini-3.5-flash-lite'
  | 'gemini-3.5-flash'
  | 'gemini-3.6-flash'
  | 'gemini-3.7-flash'
  | 'gemini-3.8-flash'
  | 'gemini-flash-latest'
  | 'gemini-flash-lite-latest'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-pro-preview';

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
  recommendedFamily: 'Flash Lite' | 'Flash' | 'Pro';
}

export interface ModelCapabilityInfo {
  id: SupportedGeminiModelId;
  displayName: string;
  family: 'Flash Lite' | 'Flash' | 'Pro';
  generation: string;
  tagline: string;
  description: string;
  contextWindow: string;
  status: 'verified' | 'preview';
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
  taskOverrides: Partial<Record<StudioTaskType, SupportedGeminiModelId>>;
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
    id: 'gemini-3.5-flash-lite',
    displayName: '3.5 Light',
    family: 'Flash Lite',
    generation: 'Gemini 3.5',
    isDefault: true,
    tagline: 'Default Studio Model — Ultra-Fast, Cost-Efficient Multimodal Engine',
    description:
      'Optimized for rapid prompt iteration, reference deconstruction, and low-latency studio workflow. Verified for text, vision, and structured JSON.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Everyday prompt generation', 'Quick scene refinements', 'Responsive reference tags'],
  },
  {
    id: 'gemini-3.5-flash',
    displayName: '3.5 Flash',
    family: 'Flash',
    generation: 'Gemini 3.5',
    tagline: 'Balanced Speed & Multimodal Depth',
    description:
      'High-throughput multimodal Flash model with enhanced spatial understanding and balanced kinematic prompt formatting.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Reference image analysis', 'Audio foley coordination', 'YouTube video deconstructions'],
  },
  {
    id: 'gemini-3.6-flash',
    displayName: '3.6 Flash',
    family: 'Flash',
    generation: 'Gemini 3.6',
    tagline: 'Enhanced Visual Hierarchy & Kinematic Physics',
    description:
      'Intermediate 3.6 generation featuring refined video physics understanding and sharper prompt separation.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Video animation constraints', 'Loop seam hazard identification'],
  },
  {
    id: 'gemini-3.7-flash',
    displayName: '3.7 Flash',
    family: 'Flash',
    generation: 'Gemini 3.7',
    tagline: 'Advanced Reasoning & Three-Plane Depth Perception',
    description:
      'Next-generation Flash architecture with heightened aesthetic deconstruction and architectural composition precision.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Complex lighting temperature analysis', 'Atmospheric physics prompts'],
  },
  {
    id: 'gemini-3.8-flash',
    displayName: '3.8 Flash',
    family: 'Flash',
    generation: 'Gemini 3.8',
    tagline: 'Flagship Flash Intelligence — Deep Multimodal Synthesis',
    description:
      'Top-tier Flash model combining rapid execution with comprehensive multimodal reasoning, acoustic deconstruction, and creative blueprinting.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Full YouTube Video Lab reverse-engineering', 'Creative Replication Blueprints', 'Cross-stage production intelligence'],
  },
  {
    id: 'gemini-flash-latest',
    displayName: 'Flash Latest',
    family: 'Flash',
    generation: 'Continuous',
    tagline: 'Auto-Updated Flash Alias',
    description:
      'Points automatically to the latest stable deployment of the Gemini Flash engine for guaranteed up-to-date performance.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Continuous updates', 'General studio operations'],
  },
  {
    id: 'gemini-flash-lite-latest',
    displayName: 'Flash Lite Latest',
    family: 'Flash Lite',
    generation: 'Continuous',
    tagline: 'Auto-Updated Lite Alias',
    description:
      'Points automatically to the latest lightweight Flash Lite build for high-efficiency throughput.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Rapid draft recompilation', 'Quick experiments'],
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: '3.1 Light',
    family: 'Flash Lite',
    generation: 'Gemini 3.1',
    tagline: 'Ultra-Lightweight Baseline',
    description:
      'Compact Gemini 3.1 Flash Lite model for baseline text structuring and swift prompt drafting.',
    contextWindow: '1M tokens',
    status: 'verified',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: false,
      structuredJson: true,
    },
    supportedTasks: [
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
    ],
    bestFor: ['Text-only prompt compilation', 'Simple lesson tags'],
  },
  {
    id: 'gemini-3.1-pro-preview',
    displayName: '3.1 Pro (Preview)',
    family: 'Pro',
    generation: 'Gemini 3.1',
    tagline: 'Advanced Complex STEM & Creative Reasoning',
    description:
      'Deep reasoning model for intricate prompt architectural coordination, multi-variable conflict resolution, and statistical analytics.',
    contextWindow: '2M tokens',
    status: 'preview',
    capabilities: {
      text: true,
      imageAnalysis: true,
      videoAnalysis: true,
      audioPerception: true,
      structuredJson: true,
    },
    supportedTasks: [
      'video-analysis',
      'reference-analysis',
      'image-prompt',
      'video-prompt',
      'music-prompt',
      'lesson-extraction',
      'production-analysis',
    ],
    bestFor: ['Complex correlation matrix in Production Intelligence', 'Deep lesson synthesis'],
  },
];

export const STUDIO_TASKS: TaskDefinition[] = [
  {
    id: 'video-analysis',
    label: 'YouTube Video Lab',
    shortLabel: 'Video Lab',
    description: 'Reverse-engineers public YouTube ambience videos into original production blueprints.',
    category: 'perception',
    iconName: 'Youtube',
    recommendedFamily: 'Flash',
  },
  {
    id: 'reference-analysis',
    label: 'Reference Image Analysis',
    shortLabel: 'Image Analysis',
    description: 'Extracts 3-plane depth, lighting Kelvin, and materials from uploaded reference art.',
    category: 'perception',
    iconName: 'Image',
    recommendedFamily: 'Flash',
  },
  {
    id: 'image-prompt',
    label: 'Image Prompt Generation',
    shortLabel: 'Image Prompt',
    description: 'Generates Midjourney v6.1 and Flux.1 Pro production aesthetic prompts.',
    category: 'prompting',
    iconName: 'Camera',
    recommendedFamily: 'Flash Lite',
  },
  {
    id: 'video-prompt',
    label: 'Video Animation Prompts',
    shortLabel: 'Video Prompt',
    description: 'Drafts kinematic motion vectors, locked camera rules, and loop seam constraints.',
    category: 'prompting',
    iconName: 'Film',
    recommendedFamily: 'Flash',
  },
  {
    id: 'music-prompt',
    label: 'Music & Foley Prompts',
    shortLabel: 'Audio Foley',
    description: 'Coordinates layered acoustic foley mixes, tempo BPM, and ear-fatigue curves.',
    category: 'prompting',
    iconName: 'Music',
    recommendedFamily: 'Flash Lite',
  },
  {
    id: 'lesson-extraction',
    label: 'Experience Memory Lessons',
    shortLabel: 'Lessons',
    description: 'Extracts reusable production rules and failure fixes from project outcomes.',
    category: 'intelligence',
    iconName: 'Lightbulb',
    recommendedFamily: 'Flash Lite',
  },
  {
    id: 'production-analysis',
    label: 'Production Intelligence',
    shortLabel: 'Analytics',
    description: 'Analyzes channel retention correlations and generates strategic studio recommendations.',
    category: 'intelligence',
    iconName: 'BarChart3',
    recommendedFamily: 'Flash',
  },
  {
    id: 'assistant',
    label: 'Production Assistant',
    shortLabel: 'Assistant',
    description: 'Contextual AI engineer to diagnose problems, improve prompts, and optimize productions.',
    category: 'intelligence',
    iconName: 'Bot',
    recommendedFamily: 'Flash',
  },
];

export const DEFAULT_MODEL_ID: SupportedGeminiModelId = 'gemini-3.5-flash-lite';

export const DEFAULT_TASK_MODEL_CONFIG: TaskModelConfig = {
  globalModelId: DEFAULT_MODEL_ID,
  taskOverrides: {},
};

export function getModelInfo(modelId: string): ModelCapabilityInfo {
  const found = VERIFIED_MODELS_LIST.find((m) => m.id === modelId);
  return (
    found || {
      id: DEFAULT_MODEL_ID,
      displayName: '3.5 Light',
      family: 'Flash Lite',
      generation: 'Gemini 3.5',
      isDefault: true,
      tagline: 'Default Studio Model',
      description: 'Standard studio model.',
      contextWindow: '1M tokens',
      status: 'verified',
      capabilities: {
        text: true,
        imageAnalysis: true,
        videoAnalysis: true,
        audioPerception: true,
        structuredJson: true,
      },
      supportedTasks: [
        'video-analysis',
        'reference-analysis',
        'image-prompt',
        'video-prompt',
        'music-prompt',
        'lesson-extraction',
        'production-analysis',
      ],
      bestFor: ['Studio operations'],
    }
  );
}

export function getDisplayName(modelId: string): string {
  const info = getModelInfo(modelId);
  return info.displayName;
}

export function resolveModelForTask(
  config: TaskModelConfig,
  taskType: StudioTaskType
): {
  modelId: SupportedGeminiModelId;
  displayName: string;
  isOverride: boolean;
  modelInfo: ModelCapabilityInfo;
} {
  const override = config.taskOverrides[taskType];
  const isOverride = Boolean(override && override !== config.globalModelId);
  const activeModelId = override || config.globalModelId || DEFAULT_MODEL_ID;
  const modelInfo = getModelInfo(activeModelId);

  return {
    modelId: activeModelId,
    displayName: modelInfo.displayName,
    isOverride,
    modelInfo,
  };
}
