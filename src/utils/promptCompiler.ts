import { AmbienceConfig } from '../types/ambience';
import { WORLDS_CATALOG, LOCATIONS_CATALOG } from '../data/catalog';

export interface CompiledPrompts {
  imagePrompt: string;
  videoPrompt: string;
  musicPrompt: string;
  summaryTitle: string;
}

export const compilePrompts = (config: AmbienceConfig): CompiledPrompts => {
  const world = WORLDS_CATALOG.find((w) => w.id === config.worldId);
  const location = LOCATIONS_CATALOG.find((l) => l.id === config.locationId);

  const worldName = config.worldId === 'custom-world' && config.customWorldName
    ? config.customWorldName
    : world?.name || 'Atmospheric Ambience';

  const locationName = config.locationId.startsWith('custom') && config.customLocation
    ? config.customLocation
    : location?.name || 'Sanctuary';

  // --- IMAGE PROMPT COMPILER ---
  const imageParts: string[] = [];

  // 1. Setting and world establishing phrase
  imageParts.push(
    `Cinematic, atmospheric scene of ${worldName}, featuring a ${locationName.toLowerCase()}`
  );

  // 2. Setting perspective
  if (config.settingType === 'both-view-from-inside') {
    imageParts.push('viewed from inside looking out through rain-streaked glass windowpanes');
  } else if (config.settingType === 'transitional') {
    imageParts.push('under a sheltered, covered veranda protected from the elements');
  } else if (config.settingType === 'indoor') {
    imageParts.push('interior sanctuary architectural view');
  } else {
    imageParts.push('outdoor atmospheric vista');
  }

  // 3. Season, Time & Weather
  const seasonStr = config.season !== 'seasonless' ? `${config.season} season` : 'timeless mood';
  const timeStr = config.timeOfDay === 'custom' && config.customTimeOfDay ? config.customTimeOfDay : config.timeOfDay.replace('-', ' ');
  const weatherStr = config.primaryWeather === 'custom' && config.customWeather ? config.customWeather : config.primaryWeather.replace('-', ' ');
  let weatherClause = `${weatherStr} weather at ${timeStr}, ${seasonStr}`;
  if (config.secondaryWeather && config.secondaryWeather !== config.primaryWeather) {
    weatherClause += ` with subtle ${config.secondaryWeather.replace('-', ' ')}`;
  }
  imageParts.push(weatherClause);

  // 4. Sky elements (ONLY if showSky is true)
  if (config.sky.showSky) {
    const skyDetails: string[] = [];
    if (config.sky.clouds !== 'none') skyDetails.push(`${config.sky.clouds} clouds`);
    if (config.sky.sun !== 'hidden') skyDetails.push(`${config.sky.sun.replace('-', ' ')} sun`);
    if (config.sky.moon !== 'hidden') skyDetails.push(`${config.sky.moon} moon`);
    if (config.sky.stars !== 'off') skyDetails.push(`${config.sky.stars} starry sky`);
    if (config.sky.aurora !== 'off') skyDetails.push(`${config.sky.aurora} aurora borealis`);
    if (config.sky.sunbeams !== 'off') skyDetails.push('visible volumetric sunbeams');
    if (skyDetails.length > 0) {
      imageParts.push(`Sky featuring ${skyDetails.join(', ')}`);
    }
  }

  // 5. Water bodies (STRICT: ONLY if water.enabled is true)
  if (config.water.enabled && config.water.type !== 'none') {
    const waterType = config.water.type === 'custom' && config.water.customType ? config.water.customType : config.water.type;
    const waterDetails = [
      `${waterType} positioned in the ${config.water.placement}`,
      `surface with ${config.water.behavior.replace('-', ' ')}`,
      `${config.water.visibility} presence`,
    ];
    if (config.water.reflection !== 'none') {
      waterDetails.push(`${config.water.reflection} reflections on the water surface`);
    }
    if (config.water.rainHittingWater) {
      waterDetails.push('fine rain drops rippling across the surface');
    }
    imageParts.push(`Water elements: ${waterDetails.join(', ')}`);
  }

  // 6. Lighting configuration
  const lightingParts: string[] = [];
  lightingParts.push(`illuminated primarily by ${config.lighting.primary.replace('-', ' ')}`);
  lightingParts.push(`color temperature: ${config.lighting.colorTemperature.replace('-', ' ')}`);
  lightingParts.push(`intensity: ${config.lighting.intensity.replace('-', ' ')}`);
  if (config.lighting.flickeringFlames) lightingParts.push('flickering flame dynamics');
  if (config.lighting.reflections) lightingParts.push('soft surface specular reflections');
  if (config.lighting.volumetricRays) lightingParts.push('atmospheric volumetric light shafts and dust motes');
  imageParts.push(`Lighting: ${lightingParts.join(', ')}`);

  // 7. Selected Scene Elements
  const elementTokens: string[] = [];
  if (config.elements.lightSources.length > 0) {
    elementTokens.push(`fixtures including ${config.elements.lightSources.join(', ')}`);
  }
  if (config.elements.interiorObjects.length > 0) {
    elementTokens.push(`interior details: ${config.elements.interiorObjects.join(', ')}`);
  }
  if (config.elements.outdoorElements.length > 0) {
    elementTokens.push(`surroundings: ${config.elements.outdoorElements.join(', ')}`);
  }
  if (!config.elements.excludePeopleAndAnimals && config.elements.livingSubjects.length > 0) {
    elementTokens.push(`subtle figures: ${config.elements.livingSubjects.join(', ')}`);
  }
  if (elementTokens.length > 0) {
    imageParts.push(elementTokens.join('; '));
  }

  // 8. Camera & Composition
  imageParts.push(
    `Composition: ${config.camera.composition.replace('-', ' ')}, ${config.camera.angle.replace('-', ' ')} angle`
  );

  // 9. Visual Style & Aspect Ratio
  const styleStr = config.visualStyle.style === 'custom' && config.visualStyle.customStyleText
    ? config.visualStyle.customStyleText
    : config.visualStyle.style.replace('-', ' ');
  let styleDetails = `Style: ${styleStr}, detail level ${config.visualStyle.detailLevel}/5, ${config.visualStyle.contrast} contrast`;
  if (config.visualStyle.colorPalette) {
    styleDetails += `, palette: ${config.visualStyle.colorPalette}`;
  }
  if (config.visualStyle.filmGrain !== 'none') {
    styleDetails += `, ${config.visualStyle.filmGrain} film grain texture`;
  }
  imageParts.push(styleDetails);

  // Negative tags and aspect ratio parameters
  const negativeTags: string[] = [];
  if (config.elements.excludePeopleAndAnimals) {
    negativeTags.push('people, human characters, faces, animals, pets, silhouettes');
  }
  negativeTags.push('modern plastic, bright neon oversaturation, distorted artifacts, blurry geometry, low resolution');

  const arParam = config.visualStyle.aspectRatio === 'custom' && config.visualStyle.customAspectRatio
    ? `--ar ${config.visualStyle.customAspectRatio}`
    : `--ar ${config.visualStyle.aspectRatio}`;

  const imagePrompt = `${imageParts.join('. ')}. --no ${negativeTags.join(', ')} ${arParam} --v 6.1 --style raw`;

  // --- VIDEO PROMPT COMPILER ---
  const videoParts: string[] = [];

  // 1. Camera stability
  if (config.camera.lockedCamera || config.video.lockedCamera) {
    videoParts.push('LOCKED CAMERA: Completely stationary camera on a heavy tripod. Zero panning, zero tilting, zero camera shake, and zero focal length change.');
  } else {
    videoParts.push(`Camera movement: subtle ${config.camera.movement.replace('-', ' ')}.`);
  }

  // 2. Animated subjects & motion intensity
  const activeMotion: string[] = [];
  Object.entries(config.video.subjects).forEach(([key, val]) => {
    if (val.enabled) {
      activeMotion.push(`${key} moving with ${val.intensity.replace('-', ' ')} motion`);
    }
  });

  if (activeMotion.length > 0) {
    videoParts.push(`Environmental motion: ${activeMotion.join(', ')}.`);
  } else {
    videoParts.push('Environmental motion: Very gentle ambient breathing motion only.');
  }

  // 3. Water motion details (if water enabled)
  if (config.water.enabled && config.water.type !== 'none') {
    videoParts.push(
      `Water dynamics: ${config.water.behavior.replace('-', ' ')}, movement level ${config.water.movementIntensity}/5. Shoreline and surrounding geometry must remain strictly preserved with no morphing.`
    );
  }

  // 4. Loop & Stability Constraints
  const loopRules: string[] = [];
  if (config.video.seamlessLoop) {
    loopRules.push('Seamless continuous loop: Start and end frames match identically');
  }
  if (config.video.staticBackground) {
    loopRules.push('Background structures and architectural silhouettes remain completely static');
  }
  if (config.video.staticSky && config.sky.showSky) {
    loopRules.push('Sky and cloud shapes maintain position with minimal drifting');
  }
  if (config.video.consistentLighting) {
    loopRules.push('Consistent lighting throughout; no sudden light flickers or flashes');
  }
  if (config.video.preventNewObjects) {
    loopRules.push('No new objects, items, or visual artifacts may appear or disappear');
  }
  if (config.video.preventPeopleAndAnimals || config.elements.excludePeopleAndAnimals) {
    loopRules.push('Strictly uninhabited: no people, humans, birds, or animals entering the frame');
  }
  if (config.video.naturalPhysicalMotion) {
    loopRules.push('All smoke, rain, and flame motion adheres to natural fluid physics');
  }

  if (loopRules.length > 0) {
    videoParts.push(`Loop & scene constraints: ${loopRules.join('; ')}.`);
  }

  videoParts.push(`Duration: ${config.video.durationSeconds}s loop cycle, 4K high fidelity.`);

  const videoPrompt = videoParts.join('\n\n');

  // --- MUSIC PROMPT COMPILER ---
  const musicParts: string[] = [];

  // Style and Mood
  musicParts.push(`[Style: ${config.music.style}]`);
  if (config.music.moods.length > 0) {
    musicParts.push(`[Mood: ${config.music.moods.join(', ')}]`);
  }

  // Instrumentation
  if (config.music.instrumentation.length > 0) {
    musicParts.push(`[Instrumentation: ${config.music.instrumentation.join(', ')}]`);
  }

  // Tempo & Dynamics
  musicParts.push(
    `[Tempo: ${config.music.tempoRange.replace('-', ' ')}, Melodic Prominence: ${config.music.melodicProminence}/5, Rhythmic Intensity: ${config.music.rhythmicIntensity}/5, Density: ${config.music.instrumentDensity}/5]`
  );

  // Arrangement
  musicParts.push(`[Arrangement: ${config.music.arrangementVariation.replace('-', ' ')}, Target Duration: ${config.music.audioDurationMinutes} minutes continuous ambience]`);

  // Environmental Foley Soundscapes
  if (config.music.environmentalSoundLayers.length > 0) {
    musicParts.push(`[Integrated Foley & Environmental Sound Layers: ${config.music.environmentalSoundLayers.join(', ')}]`);
  }

  // Reference Influence
  if (config.music.referenceInfluence !== 'none' && config.music.referenceArtistOrTrack) {
    const influenceDescriptions: Record<string, string> = {
      low: 'broad genre and gentle mood cues',
      moderate: 'target instrumentation, tempo, atmosphere and arrangement cues',
      strong: 'closely target the combination of broad musical traits, acoustic instrumentation, harmonic character, and arrangement',
      'very-strong': 'maximize similarity in broad musical character, tempo, and timbre while creating a fully original composition',
    };
    musicParts.push(
      `[Creative Context: Level "${config.music.referenceInfluence}" - ${influenceDescriptions[config.music.referenceInfluence]} inspired by "${config.music.referenceArtistOrTrack}". Original composition, no copyright melody reproduction.]`
    );
  }

  const musicPrompt = musicParts.join('\n\n');

  const summaryTitle = `${worldName} · ${locationName} · ${seasonStr} · ${timeStr}`;

  return {
    imagePrompt,
    videoPrompt,
    musicPrompt,
    summaryTitle,
  };
};
