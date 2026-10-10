import { AmbienceConfig, ReferenceVideoLabItem } from '../types/ambience';
import { WORLDS_CATALOG, LOCATIONS_CATALOG } from '../data/catalog';

export interface GeneratePromptRequestOptions {
  target?: 'all' | 'image' | 'video' | 'music';
  model?: string;
  config: AmbienceConfig;
  customInstructions?: string;
  referenceImage?: {
    mimeType: string;
    base64: string;
    name?: string;
  };
  signal?: AbortSignal;
}

export interface GeneratedPromptsResult {
  imagePrompt: string;
  videoPrompt: string;
  musicPrompt: string;
  reasoning: string;
  warnings: string[];
  modelUsed?: string;
}

export class AiPromptService {
  /**
   * Builds structured project context object from current AmbienceConfig
   */
  public static buildProjectContext(config: AmbienceConfig) {
    const world = WORLDS_CATALOG.find((w) => w.id === config.worldId);
    const location = LOCATIONS_CATALOG.find((l) => l.id === config.locationId);

    const worldName =
      config.worldId === 'custom-world' && config.customWorldName
        ? config.customWorldName
        : world?.name || 'Sanctuary';

    const locationName =
      config.locationId.startsWith('custom') && config.customLocation
        ? config.customLocation
        : location?.name || 'Sanctuary Interior';

    return {
      worldId: config.worldId,
      worldName,
      worldCategory: world?.category || 'custom',
      locationId: config.locationId,
      locationName,
      settingType: config.settingType,
      season: config.season,
      timeOfDay: config.timeOfDay === 'custom' && config.customTimeOfDay ? config.customTimeOfDay : config.timeOfDay,
      primaryWeather: config.primaryWeather === 'custom' && config.customWeather ? config.customWeather : config.primaryWeather,
      secondaryWeather: config.secondaryWeather,
      sky: {
        showSky: config.sky.showSky,
        clouds: config.sky.clouds,
        cloudAnimation: config.sky.cloudAnimation,
        sun: config.sky.sun,
        moon: config.sky.moon,
        stars: config.sky.stars,
        aurora: config.sky.aurora,
        sunbeams: config.sky.sunbeams,
        distantLightning: config.sky.distantLightning,
      },
      water: {
        enabled: config.water.enabled,
        type: config.water.type === 'custom' && config.water.customType ? config.water.customType : config.water.type,
        placement: config.water.placement,
        behavior: config.water.behavior,
        visibility: config.water.visibility,
        reflection: config.water.reflection,
        rainHittingWater: config.water.rainHittingWater,
        movementIntensity: config.water.movementIntensity,
      },
      lighting: {
        primary: config.lighting.primary,
        colorTemperature: config.lighting.colorTemperature,
        intensity: config.lighting.intensity,
        flickeringFlames: config.lighting.flickeringFlames,
        subtleFluctuation: config.lighting.subtleFluctuation,
        reflections: config.lighting.reflections,
        volumetricRays: config.lighting.volumetricRays,
      },
      elements: {
        excludePeopleAndAnimals: config.elements.excludePeopleAndAnimals,
        lightSources: config.elements.lightSources,
        interiorObjects: config.elements.interiorObjects,
        outdoorElements: config.elements.outdoorElements,
        livingSubjects: config.elements.livingSubjects,
        customElements: config.elements.customElements,
      },
      camera: {
        angle: config.camera.angle === 'custom' && config.camera.customAngle ? config.camera.customAngle : config.camera.angle,
        composition: config.camera.composition === 'custom' && config.camera.customComposition ? config.camera.customComposition : config.camera.composition,
        movement: config.camera.movement === 'custom' && config.camera.customMovement ? config.camera.customMovement : config.camera.movement,
        lockedCamera: config.camera.lockedCamera,
      },
      visualStyle: {
        style: config.visualStyle.style === 'custom' && config.visualStyle.customStyleText ? config.visualStyle.customStyleText : config.visualStyle.style,
        detailLevel: config.visualStyle.detailLevel,
        colorPalette: config.visualStyle.colorPalette,
        contrast: config.visualStyle.contrast,
        filmGrain: config.visualStyle.filmGrain,
        aspectRatio: config.visualStyle.aspectRatio === 'custom' && config.visualStyle.customAspectRatio ? config.visualStyle.customAspectRatio : config.visualStyle.aspectRatio,
      },
      video: {
        subjects: config.video.subjects,
        durationSeconds: config.video.durationSeconds,
        seamlessLoop: config.video.seamlessLoop,
        lockedCamera: config.video.lockedCamera,
        preserveAllObjects: config.video.preserveAllObjects,
        preserveSceneGeometry: config.video.preserveSceneGeometry,
        preventNewObjects: config.video.preventNewObjects,
        preventPeopleAndAnimals: config.video.preventPeopleAndAnimals,
        staticBackground: config.video.staticBackground,
        staticSky: config.video.staticSky,
        consistentLighting: config.video.consistentLighting,
      },
      music: {
        style: config.music.style,
        moods: config.music.moods,
        instrumentation: config.music.instrumentation,
        tempoRange: config.music.tempoRange,
        melodicProminence: config.music.melodicProminence,
        rhythmicIntensity: config.music.rhythmicIntensity,
        arrangementVariation: config.music.arrangementVariation,
        environmentalSoundLayers: config.music.environmentalSoundLayers,
        audioDurationMinutes: config.music.audioDurationMinutes,
        referenceInfluence: config.music.referenceInfluence,
        referenceArtistOrTrack: config.music.referenceArtistOrTrack,
      },
    };
  }

  /**
   * Generates AI prompts by calling the server-side Gemini API with selected model
   */
  public static async generatePrompts(options: GeneratePromptRequestOptions): Promise<GeneratedPromptsResult> {
    const { target = 'all', model, config, customInstructions, referenceImage, signal } = options;
    const projectContext = this.buildProjectContext(config);

    const payload = {
      target,
      model,
      projectContext,
      customInstructions: customInstructions?.trim() || config.customNotes || undefined,
      referenceImage,
    };

    const response = await fetch('/api/gemini/generate-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Fallback to generic status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const json = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to generate prompt from Gemini AI.');
    }

    return {
      ...(json.data as GeneratedPromptsResult),
      modelUsed: json.modelUsed,
    };
  }

  /**
   * Phase 7: Analyzes a YouTube video URL and generates a complete Creative Replication Blueprint
   */
  public static async analyzeYouTubeVideo(options: {
    url: string;
    model?: string;
    customGoal?: string;
    notes?: string;
    signal?: AbortSignal;
  }): Promise<ReferenceVideoLabItem> {
    const { url, model, customGoal, notes, signal } = options;
    const response = await fetch('/api/gemini/analyze-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, model, customGoal, notes }),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.error) errorMessage = errorData.error;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const json = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to analyze YouTube video.');
    }

    const item = json.data as ReferenceVideoLabItem;
    if (json.modelUsed && !item.modelUsed) {
      item.modelUsed = {
        modelId: json.modelUsed,
        modelDisplayName: json.modelUsed,
        selectionSource: model && model !== 'inherit' ? 'override' : 'global',
      };
    }

    return item;
  }

  /**
   * Analyzes an uploaded reference image for lighting, depth planes, and materials
   */
  public static async analyzeReferenceImage(options: {
    imageBase64: string;
    mimeType?: string;
    title?: string;
    category?: string;
    notes?: string;
    model?: string;
    signal?: AbortSignal;
  }): Promise<any> {
    const { imageBase64, mimeType = 'image/jpeg', title = '', category = '', notes = '', model, signal } = options;
    const response = await fetch('/api/gemini/analyze-reference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64, mimeType, title, category, notes, model }),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.error) errorMessage = errorData.error;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const json = await response.json();
    if (!json.success || !json.analysis) {
      throw new Error(json.error || 'Failed to analyze reference image.');
    }

    return {
      analysis: json.analysis,
      modelUsed: json.modelUsed,
    };
  }
}
