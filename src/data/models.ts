import { ModelDefinition, TaskDefinition, AiModelId, StudioTaskType, ModelPreferencesState } from '../types/models';

export const VERIFIED_MODELS: ModelDefinition[] = [
  {
    id: 'gemini-3.5-flash-lite',
    displayName: '3.5 Light',
    family: 'Flash Lite',
    shortDescription: 'High-speed, cost-efficient multimodal model for prompts and quick iterations.',
    detailedNotes:
      'Engineered for maximum responsiveness and high-throughput generation. Ideal for rapid scene prompt creation, formatting, and live synthesis.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [
      'Standard video and large context window compared to Pro tier',
      'Complex multi-step causal reasoning may benefit from 3.1 Pro or 3.8 Flash',
    ],
    recommendedTasks: [
      'image-prompt-generation',
      'animation-prompt-generation',
      'music-prompt-generation',
    ],
    isDefault: true,
    backendAliases: ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'],
  },
  {
    id: 'gemini-3.8-flash',
    displayName: '3.8 Flash',
    family: 'Flash',
    shortDescription: 'Next-gen balanced multimodal model with advanced video comprehension and prompt accuracy.',
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
    knownLimitations: [
      'Slightly higher compute overhead than 3.5 Light',
    ],
    recommendedTasks: [
      'youtube-video-analysis',
      'reference-image-analysis',
      'image-prompt-generation',
      'animation-prompt-generation',
      'music-prompt-generation',
      'lessons-extraction',
      'production-recommendations',
    ],
    backendAliases: ['gemini-3.8-flash'],
  },
  {
    id: 'gemini-flash-latest',
    displayName: 'Flash (Latest)',
    family: 'Flash',
    shortDescription: "Always routes to Google's latest stable Flash release with broad multimodal grounding.",
    detailedNotes:
      'Dynamic alias targeting the newest stable production Flash checkpoint. Provides optimal general performance across text and imagery.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: true,
      deepReasoning: false,
    },
    knownLimitations: [
      'Underlying checkpoint may update periodically per Google release cadence',
    ],
    recommendedTasks: [
      'reference-image-analysis',
      'image-prompt-generation',
      'music-prompt-generation',
    ],
    backendAliases: ['gemini-flash-latest'],
  },
  {
    id: 'gemini-3.1-pro-preview',
    displayName: '3.1 Pro',
    family: 'Pro',
    shortDescription: 'Deep reasoning model for intricate architectural breakdowns, complex blueprints, and intelligence audits.',
    detailedNotes:
      'Flagship frontier intelligence for multi-layer aesthetic deconstruction, identifying subtle loop hazards, and synthesizing production wisdom.',
    capabilities: {
      textSynthesis: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      structuredJson: true,
      highSpeedLatency: false,
      deepReasoning: true,
    },
    knownLimitations: [
      'Higher latency profile during peak studio production hours',
    ],
    recommendedTasks: [
      'youtube-video-analysis',
      'lessons-extraction',
      'production-recommendations',
    ],
    backendAliases: ['gemini-3.1-pro-preview'],
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
    recommendedModelId: 'gemini-3.5-flash-lite',
  },
  {
    id: 'image-prompt-generation',
    label: 'Image Prompt Generation',
    category: 'Prompt Studio',
    description: 'Generates photo-real text-to-image prompts tailored for Midjourney v6 and Flux.1.',
    requiredCapabilities: ['textSynthesis', 'structuredJson'],
    recommendedModelId: 'gemini-3.5-flash-lite',
  },
  {
    id: 'animation-prompt-generation',
    label: 'Animation Prompt Generation',
    category: 'Prompt Studio',
    description: 'Synthesizes locked camera, micro-motion physics, and seamless loop constraints for video models.',
    requiredCapabilities: ['textSynthesis', 'structuredJson'],
    recommendedModelId: 'gemini-3.5-flash-lite',
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
    recommendedModelId: 'gemini-3.1-pro-preview',
  },
];

export const DEFAULT_MODEL_PREFERENCES: ModelPreferencesState = {
  globalModel: 'gemini-3.5-flash-lite',
  taskOverrides: {
    'youtube-video-analysis': 'inherit',
    'reference-image-analysis': 'inherit',
    'image-prompt-generation': 'inherit',
    'animation-prompt-generation': 'inherit',
    'music-prompt-generation': 'inherit',
    'lessons-extraction': 'inherit',
    'production-recommendations': 'inherit',
  },
  lastSelectedModel: 'gemini-3.5-flash-lite',
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
