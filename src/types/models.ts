export type AiModelId =
  | 'gemini-3.5-flash-lite'
  | 'gemini-3.8-flash'
  | 'gemini-flash-latest'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite';

export type StudioTaskType =
  | 'youtube-video-analysis'
  | 'reference-image-analysis'
  | 'image-prompt-generation'
  | 'animation-prompt-generation'
  | 'music-prompt-generation'
  | 'lessons-extraction'
  | 'production-recommendations';

export interface ModelCapabilityMatrix {
  textSynthesis: boolean;
  imageUnderstanding: boolean;
  videoUnderstanding: boolean;
  structuredJson: boolean;
  highSpeedLatency: boolean;
  deepReasoning: boolean;
}

export interface ModelDefinition {
  id: AiModelId;
  displayName: string;
  family: 'Flash Lite' | 'Flash' | 'Pro';
  shortDescription: string;
  detailedNotes: string;
  capabilities: ModelCapabilityMatrix;
  knownLimitations: string[];
  recommendedTasks: StudioTaskType[];
  isDefault?: boolean;
  backendAliases: string[];
}

export interface TaskDefinition {
  id: StudioTaskType;
  label: string;
  category: 'Video Lab' | 'Reference Library' | 'Prompt Studio' | 'Intelligence';
  description: string;
  requiredCapabilities: (keyof ModelCapabilityMatrix)[];
  recommendedModelId: AiModelId;
}

export interface ModelPreferencesState {
  globalModel: AiModelId;
  taskOverrides: Record<StudioTaskType, AiModelId | 'inherit'>;
  lastSelectedModel?: AiModelId;
  updatedAt: number;
}
