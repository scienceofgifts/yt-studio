import { ModelDefinition, TaskDefinition, AiModelId, StudioTaskType, ModelPreferencesState } from '../types/models';

export const VERIFIED_MODELS: ModelDefinition[] = [
  {
    id: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    family: 'Flash',
    shortDescription: 'Flagship multimodal model with advanced video comprehension and prompt accuracy.',
    detailedNotes:
      'Combines fast generation with enhanced spatial, kinematic, and visual understanding for reference videos and high-fidelity prompt coordination.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: true,
    },
    knownLimitations: ['Standard rate limits apply during peak usage'],
    recommendedTasks: [
      'youtube-video-analysis',
      'reference-image-analysis',
      'image-prompt-generation',
      'animation-prompt-generation',
      'music-prompt-generation',
      'lessons-extraction',
      'production-recommendations',
    ],
    isDefault: true,
    backendAliases: ['gemini-3.8-flash'],
  },
  {
    id: 'gemini-3.7-flash',
    displayName: 'Gemini 3.7 Flash',
    family: 'Flash',
    shortDescription: 'Advanced Flash model optimized for balanced latency and rich multimodal reasoning.',
    detailedNotes: 'Provides stable reasoning and high-speed processing for creative prompt composition and video layering.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: true,
    },
    knownLimitations: [],
    recommendedTasks: ['youtube-video-analysis', 'image-prompt-generation'],
    backendAliases: ['gemini-3.7-flash'],
  },
  {
    id: 'gemini-3.6-flash',
    displayName: 'Gemini 3.6 Flash',
    family: 'Flash',
    shortDescription: 'High-performance Flash model for detailed cinematic analysis and structured output generation.',
    detailedNotes: 'Reliable checkpoint tuned for consistent multi-layer storytelling and asset parsing.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [],
    recommendedTasks: ['reference-image-analysis', 'animation-prompt-generation'],
    backendAliases: ['gemini-3.6-flash'],
  },
  {
    id: 'gemini-3.5-flash',
    displayName: 'Gemini 3.5 Flash',
    family: 'Flash',
    shortDescription: 'Balanced Flash checkpoint with robust multimodal understanding and prompt drafting.',
    detailedNotes: 'Well-tested production model for general creative work and ambience composition.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [],
    recommendedTasks: ['image-prompt-generation', 'music-prompt-generation'],
    backendAliases: ['gemini-3.5-flash'],
  },
  {
    id: 'gemini-3.5-flash-lite',
    displayName: 'Gemini 3.5 Flash Lite',
    family: 'Flash Lite',
    shortDescription: 'Lightweight high-speed Flash model for rapid prompt generation.',
    detailedNotes: 'Engineered for maximum responsiveness and quick text drafting.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [],
    recommendedTasks: ['reference-image-analysis', 'image-prompt-generation'],
    backendAliases: ['gemini-3.5-flash-lite'],
  },
  {
    id: 'gemini-flash-latest',
    displayName: 'Gemini Flash Latest',
    family: 'Flash',
    shortDescription: "Always routes to Google's latest stable Flash release with broad multimodal grounding.",
    detailedNotes: 'Dynamic alias targeting the newest stable production Flash checkpoint.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [],
    recommendedTasks: ['reference-image-analysis', 'image-prompt-generation', 'music-prompt-generation'],
    backendAliases: ['gemini-flash-latest'],
  },
  {
    id: 'gemini-flash-latest-lite',
    displayName: 'Gemini Flash Latest Lite',
    family: 'Flash Lite',
    shortDescription: 'Dynamic alias targeting the newest lightweight Flash production checkpoint.',
    detailedNotes: 'Optimized for fast iterations and high throughput.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: false,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [],
    recommendedTasks: ['image-prompt-generation'],
    backendAliases: ['gemini-flash-latest-lite'],
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite',
    family: 'Flash Lite',
    shortDescription: 'High-speed, cost-efficient lightweight multimodal model for prompts and quick iterations.',
    detailedNotes: 'Engineered for maximum responsiveness and high-throughput generation.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [],
    recommendedTasks: ['image-prompt-generation', 'animation-prompt-generation', 'music-prompt-generation'],
    backendAliases: ['gemini-3.1-flash-lite'],
  },
];

export const STUDIO_TASKS: TaskDefinition[] = [
  {
    id: 'youtube-video-analysis',
    label: 'YouTube Video Analysis',
    category: 'Video Lab',
    description: 'Deconstructs reference videos into visual, kinematic, acoustic layers and replication blueprints.',
    requiredCapabilities: ['videoUnderstanding', 'structuredJson'],
    recommendedModelId: 'gemini-3.8-flash',
  },
  {
    id: 'reference-image-analysis',
    label: 'Reference Image Analysis',
    category: 'Reference Library',
    description: 'Extracts palette, depth planes, lighting, and materials from uploaded reference stills.',
    requiredCapabilities: ['imageUnderstanding', 'structuredJson'],
    recommendedModelId: 'gemini-3.1-flash-lite',
  },
  {
    id: 'image-prompt-generation',
    label: 'Image Prompt Generation',
    category: 'Prompt Studio',
    description: 'Generates photo-real text-to-image prompts tailored for Midjourney v6 and Flux.1.',
    requiredCapabilities: ['textSynthesis', 'structuredJson'],
    recommendedModelId: 'gemini-3.1-flash-lite',
  },
  {
    id: 'animation-prompt-generation',
    label: 'Animation Prompt Generation',
    category: 'Prompt Studio',
    description: 'Synthesizes locked camera, micro-motion physics, and seamless loop constraints for video models.',
    requiredCapabilities: ['textSynthesis', 'structuredJson'],
    recommendedModelId: 'gemini-3.1-flash-lite',
  },
  {
    id: 'music-prompt-generation',
    label: 'Music Prompt Generation',
    category: 'Prompt Studio',
    description: 'Composes acoustic instrumentation, BPM ranges, and foley soundscape balance prompts.',
    requiredCapabilities: ['textSynthesis', 'structuredJson'],
    recommendedModelId: 'gemini-3.5-flash-lite',
  },
  {
    id: 'lessons-extraction',
    label: 'Experience Memory Lesson Extraction',
    category: 'Intelligence',
    description: 'Synthesizes actionable takeaways, loop seam hazards, and rules from completed productions.',
    requiredCapabilities: ['deepReasoning', 'structuredJson'],
    recommendedModelId: 'gemini-3.8-flash',
  },
  {
    id: 'production-recommendations',
    label: 'Production Analysis & Recommendations',
    category: 'Intelligence',
    description: 'Audits channel catalog metrics, analyzes viewer retention, and suggests next winning themes.',
    requiredCapabilities: ['deepReasoning', 'structuredJson'],
    recommendedModelId: 'gemini-3.8-flash',
  },
];

export const DEFAULT_MODEL_PREFERENCES: ModelPreferencesState = {
  globalModel: 'gemini-3.8-flash',
  taskOverrides: {
    'youtube-video-analysis': 'inherit',
    'reference-image-analysis': 'inherit',
    'image-prompt-generation': 'inherit',
    'animation-prompt-generation': 'inherit',
    'music-prompt-generation': 'inherit',
    'lessons-extraction': 'inherit',
    'production-recommendations': 'inherit',
  },
  lastSelectedModel: 'gemini-3.8-flash',
  updatedAt: Date.now(),
};

export function findModel(id: string): ModelDefinition | undefined {
  return VERIFIED_MODELS.find((m) => m.id === id);
}

export function getEffectiveModel(
  task: StudioTaskType,
  preferences: ModelPreferencesState
): { model: ModelDefinition; isOverridden: boolean } {
  const override = preferences.taskOverrides[task];
  if (override && override !== 'inherit') {
    const found = findModel(override);
    if (found) {
      return { model: found, isOverridden: true };
    }
  }

  const globalFound = findModel(preferences.globalModel) || VERIFIED_MODELS[0];
  return { model: globalFound, isOverridden: false };
}
