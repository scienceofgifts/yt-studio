import {
  Project,
  Preset,
  AmbienceConfig,
  PromptDrafts,
  ReferenceItem,
  PromptHistoryEntry,
  LessonLearnedItem,
  VideoPerformanceRecord,
  ReferenceVideoLabItem,
  VideoDepthPlanes,
  VideoAestheticAnalysis,
  VideoKinematicAnalysis,
  VideoAcousticAnalysis,
  CreativeReplicationBlueprint,
  AssistantSession,
  ProductionRecipe,
} from '../types/ambience';
import { STARTER_PRESETS, createDefaultAmbienceConfig } from '../data/starterPresets';
import { STARTER_RECIPES } from '../data/starterRecipes';
import { compilePrompts } from '../utils/promptCompiler';
import {
  TaskModelConfig,
  SupportedGeminiModelId,
  StudioTaskType,
  DEFAULT_TASK_MODEL_CONFIG,
} from '../data/modelRegistry';

const STORAGE_KEYS = {
  PROJECTS: 'ambience_studio_projects_v1',
  ACTIVE_PROJECT_ID: 'ambience_studio_active_project_id_v1',
  PRESETS: 'ambience_studio_presets_v1',
  RECIPES: 'ambience_studio_recipes_v1',
  REFERENCES: 'ambience_studio_references_v1',
  HISTORY: 'ambience_studio_history_v1',
  LESSONS: 'ambience_studio_lessons_v1',
  VIDEOS: 'ambience_studio_videos_v1',
  VIDEO_LAB: 'ambience_studio_video_lab_v1',
  SETTINGS: 'ambience_studio_settings_v1',
  MODEL_CONFIG: 'ambience_studio_model_config_v1',
  ASSISTANT_SESSIONS: 'ambience_studio_assistant_sessions_v1',
};

const DEFAULT_LESSONS: LessonLearnedItem[] = [
  {
    id: 'lesson-1',
    category: 'Looping',
    title: 'Locked Camera Eliminates Edge Tearing',
    observation: 'Even 2% camera drift in video generation models causes boundary frame mismatch and seam flashing in 1-hour YouTube loops.',
    recommendation: 'Always enforce locked camera on tripod in prompts, and freeze background architecture. Restrict motion strictly to raindrops, fire, and smoke motes.',
    effectiveForModels: ['Runway Gen-3', 'Luma Dream Machine', 'Kling 1.5'],
    createdAt: 1712000000000,
  },
  {
    id: 'lesson-2',
    category: 'Water',
    title: 'High Velocity Water Causes Morphing',
    observation: 'Fast-moving rivers or heavy breaking ocean waves tend to deform the surrounding shoreline geometry over multiple animation seconds.',
    recommendation: 'Keep water movement intensity at 1 or 2 for seamless loops. Rely on rain-puddle surface ripples rather than large turbulent river rapids.',
    effectiveForModels: ['Runway Gen-3', 'Sora'],
    createdAt: 1712000000001,
  },
  {
    id: 'lesson-3',
    category: 'Subjects',
    title: 'Living Subjects Degrade Looping Stillness',
    observation: 'Living humans and animals cause limb morphing, floating artifacts, and distracting non-repeating movements in long ambience playback.',
    recommendation: 'Enable the master exclude living subjects switch for YouTube study and sleep ambience. Focus exclusively on architecture, hearth fire, and weather.',
    effectiveForModels: ['Midjourney v6', 'Flux.1', 'Runway Gen-3'],
    createdAt: 1712000000002,
  },
  {
    id: 'lesson-4',
    category: 'Lighting',
    title: 'Dual Temperature Contrast Enhances Depth',
    observation: 'Monochromatic warm or cool palettes feel flat. The most successful ambience videos contrast deep cool blue exterior rain with warm 2200K amber hearth interior.',
    recommendation: 'Configure "Blue and amber contrast" or use window views where exterior rain is twilight blue and interior desk lamps glow warm gold.',
    effectiveForModels: ['Midjourney v6', 'Flux Schnell'],
    createdAt: 1712000000003,
  },
];

const DEFAULT_REFERENCES: ReferenceItem[] = [
  {
    id: 'ref-1',
    title: 'Hogwarts Gryffindor Tower Storm Ambience',
    category: 'Fantasy & Magic',
    tags: ['rain', 'fireplace', 'gothic', 'warm-cozy'],
    roles: ['Composition', 'Lighting', 'Atmosphere', 'Material and texture'],
    assignedProjectIds: ['proj-default-1'],
    notes: 'Key atmospheric traits: deep crackle hearth, rain pounding heavy leaded glass, antique leather armchair textures, floating magical sparks.',
    atmosphereKeywords: ['Intimate', 'Mysterious', 'Warm Sanctuary', 'Winter Blizzard Outside'],
    colorNotes: 'Deep burgundies, warm candle gold #D97706, cobalt night shadows.',
    audioNotes: 'Heavy rain rumble, distinct wood pops every 8-12 seconds, subtle celesta chords.',
    createdAt: 1712000000000,
  },
  {
    id: 'ref-2',
    title: 'The Shire Hobbit Hole Twilight Garden',
    category: 'Pastoral & Folk',
    tags: ['folk', 'celtic', 'cottage', 'pastoral'],
    roles: ['Environment and architecture', 'Color palette', 'General inspiration'],
    assignedProjectIds: [],
    notes: 'Circular timber doorway looking out at rolling green knolls, garden wheelbarrow, smoking stone chimneys, gentle sunset breeze.',
    atmosphereKeywords: ['Nostalgic', 'Wholesome', 'Peaceful Haven'],
    colorNotes: 'Moss green, golden amber sunset, terracotta pots, rustic oak.',
    audioNotes: 'Acoustic tin whistle, acoustic nylon guitar, distant sheep, soft evening wind.',
    createdAt: 1712000000001,
  },
];

const DEFAULT_VIDEOS: VideoPerformanceRecord[] = [
  {
    id: 'vid-1',
    title: 'Gryffindor Common Room Rain & Hearth Ambience | 3 Hours Study & Sleep',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeVideoId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    publicationDate: '2024-02-14',
    status: 'Published',
    notes: 'Our highest-performing video to date. Deep warm amber lighting with heavy window rain contrast provided immense viewer retention.',
    projectId: 'proj-default-1',
    projectName: 'Hogwarts Hearth & Rain',
    referenceImageIds: ['ref-1'],
    lessonIds: ['lesson-1', 'lesson-4'],
    metrics: {
      views: 342500,
      watchTimeHours: 128400,
      averageViewDurationMinutes: 22.5,
      averagePercentageViewed: 37.5,
      retentionAt30s: 74,
      clickThroughRate: 6.8,
      likes: 12400,
      comments: 680,
      subscribersGained: 2450,
    },
    decisions: {
      worldId: 'hogwarts-wizarding',
      worldName: 'Hogwarts & Wizarding Ambience',
      settingType: 'indoor',
      primaryWeather: 'rain',
      secondaryWeather: 'fog',
      lightingType: 'fireplace',
      colorTemperature: 'warm-amber',
      musicStyle: 'Magical orchestral',
      audioDurationMinutes: 180,
      audioLayerCount: 4,
      hasWater: false,
      cameraAngle: 'wide',
      lockedCamera: true,
      visualStyle: 'cinematic-realism',
      motionIntensity: 'subtle',
    },
    createdAt: 1707868800000,
    updatedAt: 1707868800000,
  },
  {
    id: 'vid-2',
    title: 'Cozy Hobbit Hole Autumn Hearth & Gentle Pipe Smoke | Tolkien Ambience',
    youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    youtubeVideoId: 'jNQXAC9IVRw',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    publicationDate: '2024-03-01',
    status: 'Published',
    notes: 'Subtle acoustic Celtic instrumentation worked exceptionally well. Watch time peaked in early morning study hours.',
    projectId: 'proj-default-1',
    projectName: 'The Shire Hobbit Hole',
    referenceImageIds: ['ref-2'],
    lessonIds: ['lesson-1', 'lesson-3'],
    metrics: {
      views: 189200,
      watchTimeHours: 64300,
      averageViewDurationMinutes: 20.4,
      averagePercentageViewed: 34.0,
      retentionAt30s: 69,
      clickThroughRate: 5.9,
      likes: 7100,
      comments: 410,
      subscribersGained: 1280,
    },
    decisions: {
      worldId: 'the-shire-village',
      worldName: 'The Shire & Cozy Fantasy Villages',
      settingType: 'both-view-from-inside',
      primaryWeather: 'clear',
      secondaryWeather: 'mist',
      lightingType: 'golden-sunlight',
      colorTemperature: 'warm-amber',
      musicStyle: 'Celtic-inspired',
      audioDurationMinutes: 180,
      audioLayerCount: 3,
      hasWater: false,
      cameraAngle: 'medium',
      lockedCamera: true,
      visualStyle: 'painterly',
      motionIntensity: 'subtle',
    },
    createdAt: 1709251200000,
    updatedAt: 1709251200000,
  },
  {
    id: 'vid-3',
    title: 'Cyberpunk Rainstorm Apartment | Neon Drizzle & Lofi Synth Chill',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    youtubeVideoId: '9bZkp7q19f0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    publicationDate: '2024-03-20',
    status: 'Published',
    notes: 'High CTR due to striking neon magenta / cyan palette, but watch time dropped slightly due to too much motion in the background highway.',
    referenceImageIds: [],
    lessonIds: ['lesson-2'],
    metrics: {
      views: 112000,
      watchTimeHours: 26800,
      averageViewDurationMinutes: 14.3,
      averagePercentageViewed: 23.8,
      retentionAt30s: 58,
      clickThroughRate: 7.4,
      likes: 3900,
      comments: 215,
      subscribersGained: 740,
    },
    decisions: {
      worldId: 'cyberpunk-neon',
      worldName: 'Cyberpunk Neon Metropolis',
      settingType: 'indoor',
      primaryWeather: 'heavy-rain',
      lightingType: 'neon-signs',
      colorTemperature: 'cool-blue',
      musicStyle: 'Lofi synthwave chill',
      audioDurationMinutes: 120,
      audioLayerCount: 5,
      hasWater: true,
      waterType: 'rain-puddles',
      cameraAngle: 'wide',
      lockedCamera: false,
      visualStyle: 'cinematic-realism',
      motionIntensity: 'moderate',
    },
    createdAt: 1710892800000,
    updatedAt: 1710892800000,
  },
  {
    id: 'vid-4',
    title: 'Medieval Tavern Hearth & Rainy Courtyard | Deep Binaural Crackle',
    youtubeUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    youtubeVideoId: '2Vv-BfVoq4g',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    publicationDate: '2024-04-05',
    status: 'Published',
    notes: 'Excellent evergreen retention. The combination of locked camera and heavy interior wood textures creates total relaxation.',
    referenceImageIds: ['ref-1'],
    lessonIds: ['lesson-1', 'lesson-4'],
    metrics: {
      views: 94600,
      watchTimeHours: 35900,
      averageViewDurationMinutes: 22.8,
      averagePercentageViewed: 38.0,
      retentionAt30s: 76,
      clickThroughRate: 5.2,
      likes: 4200,
      comments: 290,
      subscribersGained: 810,
    },
    decisions: {
      worldId: 'medieval-fantasy',
      worldName: 'Medieval Fantasy Tavern',
      settingType: 'indoor',
      primaryWeather: 'rain',
      lightingType: 'candlelight',
      colorTemperature: 'warm-amber',
      musicStyle: 'Medieval lute & ambient',
      audioDurationMinutes: 180,
      audioLayerCount: 4,
      hasWater: false,
      cameraAngle: 'medium',
      lockedCamera: true,
      visualStyle: 'cinematic-realism',
      motionIntensity: 'barely-perceptible',
    },
    createdAt: 1712275200000,
    updatedAt: 1712275200000,
  },
];

export function normalizeVideoLabItem(raw: any): ReferenceVideoLabItem {
  const item = raw && typeof raw === 'object' ? raw : {};

  const depthPlanes: VideoDepthPlanes = {
    foreground: item.aesthetic?.depthPlanes?.foreground || item.aesthetic?.depth_planes?.foreground || 'Clear foreground framing anchor',
    middleGround: item.aesthetic?.depthPlanes?.middleGround || item.aesthetic?.depth_planes?.middleGround || 'Central focal region and primary subjects',
    background: item.aesthetic?.depthPlanes?.background || item.aesthetic?.depth_planes?.background || 'Distant horizon and ambient backdrop',
  };

  const lighting = {
    primarySource: item.aesthetic?.lighting?.primarySource || 'Warm ambient key light',
    colorTemperature: item.aesthetic?.lighting?.colorTemperature || 'Warm Amber (2700K)',
    intensity: item.aesthetic?.lighting?.intensity || 'cozy-dim',
    volumetricRays: Boolean(item.aesthetic?.lighting?.volumetricRays),
    flickeringFlames: Boolean(item.aesthetic?.lighting?.flickeringFlames),
    reflections: Boolean(item.aesthetic?.lighting?.reflections),
    notes: item.aesthetic?.lighting?.notes || 'Balanced soft chiaroscuro contrast',
  };

  const aesthetic: VideoAestheticAnalysis = {
    worldArchetype: item.aesthetic?.worldArchetype || 'Cozy Ambience Sanctuary',
    locationType: item.aesthetic?.locationType || 'indoor',
    season: item.aesthetic?.season || 'autumn',
    timeOfDay: item.aesthetic?.timeOfDay || 'night',
    weather: item.aesthetic?.weather || 'rain',
    secondaryWeather: item.aesthetic?.secondaryWeather || undefined,
    waterElements: {
      enabled: Boolean(item.aesthetic?.waterElements?.enabled),
      type: item.aesthetic?.waterElements?.type || 'none',
      behavior: item.aesthetic?.waterElements?.behavior || 'none',
      notes: item.aesthetic?.waterElements?.notes || '',
    },
    lighting,
    colorPalette: Array.isArray(item.aesthetic?.colorPalette) && item.aesthetic.colorPalette.length > 0
      ? item.aesthetic.colorPalette
      : [
          { hex: '#D97706', name: 'Warm Amber Gold', role: 'Key Light Glow' },
          { hex: '#1E293B', name: 'Deep Night Cobalt', role: 'Backdrop Shadow' },
        ],
    materialsAndTextures: Array.isArray(item.aesthetic?.materialsAndTextures) && item.aesthetic.materialsAndTextures.length > 0
      ? item.aesthetic.materialsAndTextures
      : ['Aged wood grain', 'Rain-streaked glass pane'],
    atmosphericEffects: Array.isArray(item.aesthetic?.atmosphericEffects) && item.aesthetic.atmosphericEffects.length > 0
      ? item.aesthetic.atmosphericEffects
      : ['Gentle airborne dust motes', 'Soft window rain rivulets'],
    depthPlanes,
    composition: {
      angle: item.aesthetic?.composition?.angle || 'eye-level',
      framing: item.aesthetic?.composition?.framing || 'Medium wide shot',
      focalLengthFeel: item.aesthetic?.composition?.focalLengthFeel || '35mm widescreen',
      notes: item.aesthetic?.composition?.notes || '',
    },
  };

  const kinematics: VideoKinematicAnalysis = {
    cameraBehavior: item.kinematics?.cameraBehavior || 'Locked Tripod',
    motionSubjects: Array.isArray(item.kinematics?.motionSubjects) && item.kinematics.motionSubjects.length > 0
      ? item.kinematics.motionSubjects
      : ['Subtle flame flicker', 'Rain streaming down glass'],
    motionPacing: item.kinematics?.motionPacing || 'Ultra-Slow / Meditative',
    loopCycleEstimateSeconds: typeof item.kinematics?.loopCycleEstimateSeconds === 'number' ? item.kinematics.loopCycleEstimateSeconds : 10,
    loopSeamHazards: Array.isArray(item.kinematics?.loopSeamHazards) && item.kinematics.loopSeamHazards.length > 0
      ? item.kinematics.loopSeamHazards
      : ['Ensure consistent flame geometry across seam'],
    cinematicRules: Array.isArray(item.kinematics?.cinematicRules) && item.kinematics.cinematicRules.length > 0
      ? item.kinematics.cinematicRules
      : ['Lock tripod strictly; zero camera movement'],
  };

  const acoustics: VideoAcousticAnalysis = {
    musicalStyle: item.acoustics?.musicalStyle || 'Subtle Ambient Acoustic',
    instrumentation: Array.isArray(item.acoustics?.instrumentation) && item.acoustics.instrumentation.length > 0
      ? item.acoustics.instrumentation
      : ['Warm Synth Pad', 'Environmental Foley'],
    tempoBpmRange: item.acoustics?.tempoBpmRange || '60 BPM',
    foleyLayers: Array.isArray(item.acoustics?.foleyLayers) && item.acoustics.foleyLayers.length > 0
      ? item.acoustics.foleyLayers
      : [{ name: 'Window Rain', percentage: 60, description: 'Steady rain on window pane' }],
    frequencyMasteringNotes: item.acoustics?.frequencyMasteringNotes || 'Rolled off high frequencies above 7kHz',
    keyMoods: Array.isArray(item.acoustics?.keyMoods) && item.acoustics.keyMoods.length > 0
      ? item.acoustics.keyMoods
      : ['Calm', 'Immersive', 'Restful'],
  };

  const blueprint: CreativeReplicationBlueprint = {
    directorVision: item.blueprint?.directorVision || 'Synthesize a high-retention cozy sanctuary for Aesthetic Noise.',
    translatedConfig: item.blueprint?.translatedConfig || {},
    imagePrompt: item.blueprint?.imagePrompt || '',
    videoPrompt: item.blueprint?.videoPrompt || '',
    musicPrompt: item.blueprint?.musicPrompt || '',
    productionChecklist: Array.isArray(item.blueprint?.productionChecklist) ? item.blueprint.productionChecklist : [],
    reusableLessons: Array.isArray(item.blueprint?.reusableLessons) ? item.blueprint.reusableLessons : [],
  };

  const videoId = item.videoId || 'default';
  const defaultThumbnail = videoId !== 'default'
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';

  return {
    id: item.id || `vlab-${Date.now()}`,
    url: item.url || (videoId !== 'default' ? `https://www.youtube.com/watch?v=${videoId}` : ''),
    videoId,
    title: item.title || 'YouTube Ambience Benchmark',
    channelTitle: item.channelTitle || 'Ambient Channel',
    thumbnailUrl: item.thumbnailUrl || defaultThumbnail,
    duration: item.duration || '2:00:00',
    analyzedAt: typeof item.analyzedAt === 'number' ? item.analyzedAt : Date.now(),
    favorite: Boolean(item.favorite),
    notes: item.notes || '',
    tags: Array.isArray(item.tags) ? item.tags : ['YouTube Benchmark', 'Ambience'],
    matchConfidence: typeof item.matchConfidence === 'number' ? item.matchConfidence : 90,
    aesthetic,
    kinematics,
    acoustics,
    blueprint,
    modelUsed: item.modelUsed,
  };
}

const DEFAULT_VIDEO_LAB_ITEMS: ReferenceVideoLabItem[] = [
  {
    id: 'vlab-hogwarts-rain',
    url: 'https://www.youtube.com/watch?v=CHFif_y2TyM',
    videoId: 'CHFif_y2TyM',
    title: 'Rainy Gryffindor Common Room Ambience | Fireplace & Stormy Window',
    channelTitle: 'Ambient Worlds',
    thumbnailUrl: 'https://img.youtube.com/vi/CHFif_y2TyM/hqdefault.jpg',
    duration: '3:00:00',
    analyzedAt: 1712200000000,
    favorite: true,
    tags: ['Dark Academia', 'Rainy Hearth', 'Gothic Fantasy', 'Cozy Sanctuary'],
    notes: 'Classic YouTube study benchmark. Features master-class lighting temperature contrast and rain cadence.',
    matchConfidence: 96,
    aesthetic: {
      worldArchetype: 'Wizarding Common Room / Dark Academia',
      locationType: 'indoor',
      season: 'autumn',
      timeOfDay: 'night',
      weather: 'rain',
      secondaryWeather: 'thunderstorm',
      waterElements: {
        enabled: false,
        notes: 'Strictly window precipitation; no indoor water bodies.',
      },
      lighting: {
        primarySource: 'Roaring stone fireplace & hanging brass lamps',
        colorTemperature: 'Deep Amber (2100K) interior vs Cobalt Blue (7000K) storm exterior',
        intensity: 'dim-cozy',
        volumetricRays: true,
        flickeringFlames: true,
        reflections: true,
        notes: 'Strong chiaroscuro. Deep shadows in upper timber ceiling beams.',
      },
      colorPalette: [
        { hex: '#D97706', name: 'Hearth Amber Gold', role: 'Primary Key Glow' },
        { hex: '#1E293B', name: 'Cobalt Night Storm', role: 'Window Sill Backdrop' },
        { hex: '#7F1D1D', name: 'Velvet Scarlet Crimson', role: 'Upholstery & Tapestry' },
        { hex: '#451A03', name: 'Aged Dark Mahogany', role: 'Carved Wood Bookcases' },
      ],
      materialsAndTextures: [
        'Aged rough-hewn granite fireplace',
        'Weathered dark oak wood grain',
        'Rain-streaked leaded stained glass',
        'Tufted vintage leather and crimson wool',
      ],
      atmosphericEffects: [
        'Slow golden dust motes drifting across hearth glow',
        'Heavy rain rivulets sliding down glass panes',
        'Subtle wisps of wood smoke rising into stone flue',
      ],
      depthPlanes: {
        foreground: 'Carved study desk edge with warm candle and steaming porcelain mug',
        middleGround: 'Tufted velvet wingback armchair centered next to roaring stone hearth',
        background: 'Tall arched gothic leaded window revealing stormy night castle spires',
      },
      composition: {
        angle: 'eye-level',
        framing: 'Centrally anchored hearth with lateral study alcoves',
        focalLengthFeel: '35mm cinematic widescreen with deep depth of field',
        notes: 'Cozy envelopment; viewer feels safe inside while storm rages outdoors.',
      },
    },
    kinematics: {
      cameraBehavior: 'Locked Tripod',
      motionSubjects: [
        'Subtle flicker of hearth flame licking logs',
        'Rain droplet rivulets streaming down glass pane',
        'Gentle drift of illuminated airborne dust motes',
      ],
      motionPacing: 'Ultra-Slow / Meditative',
      loopCycleEstimateSeconds: 12,
      loopSeamHazards: [
        'Avoid rapid log collapse or changing flame geometry',
        'Keep glass rain rivulets cyclical without sudden drying',
        'Enforce 100% tripod stability without horizontal sway',
      ],
      cinematicRules: [
        'Tripod locked strictly; zero camera pan or push-in',
        'No moving humanoids, ghosts, or pets',
        'Lighting level stays constant across loop boundary',
      ],
    },
    acoustics: {
      musicalStyle: 'Subtle Cinematic Cello & Felt Piano',
      instrumentation: ['Warm felt piano', 'Soft legato cello', 'Gentle celesta accents'],
      tempoBpmRange: '62 BPM (Rubato)',
      foleyLayers: [
        { name: 'Rain on Leaded Glass', percentage: 42, description: 'Steady rhythmic patter and occasional heavier gust' },
        { name: 'Roaring Hearth Crackles', percentage: 38, description: 'Low warm bass hum with dry pine sparks popping periodically' },
        { name: 'Distant Rolling Thunder', percentage: 12, description: 'Low rumble below 80Hz, muffled by heavy stone walls' },
        { name: 'Room Resonance / Tone', percentage: 8, description: 'Cozy silence floor, faint antique clock pendulum' },
      ],
      frequencyMasteringNotes: 'High shelf rolled off above 7.5 kHz to ensure fatigue-free 4+ hour study sessions. Low-end rumble cleaned at 40 Hz.',
      keyMoods: ['Warm Sanctuary', 'Deep Focus', 'Nostalgic Intimacy', 'Winter Comfort'],
    },
    blueprint: {
      directorVision: "Translate the iconic wizarding hearth warmth into an original Aesthetic Noise sanctuary: 'The Alchemist\\'s Rainy Archive'. Replace branded IP with an ancient celestial library overlooking rain-swept highland mountains.",
      translatedConfig: {
        worldId: 'wizarding-common-room',
        season: 'autumn',
        timeOfDay: 'night',
        primaryWeather: 'rain',
        secondaryWeather: 'thunderstorm',
        settingType: 'indoor',
        customLocation: "The Alchemist's High Scriptorium",
      },
      imagePrompt: 'Cinematic wide shot of an ancient celestial scriptorium library with a massive roaring hearth of carved dark granite, tall leaded gothic arched windows battered by a violent nighttime rainstorm, towering floor-to-ceiling carved oak bookshelves filled with leather tomes, warm amber light glowing from the fireplace and brass desk lamps contrasting sharply with cold cobalt blue stormy rain outside, tufted crimson velvet armchair, no people, hyper-detailed textures, volumetric god rays through mist, 8k resolution, shot on Arri Alexa 35mm --ar 16:9 --style raw',
      videoPrompt: 'Completely locked stationary camera on tripod. In the cozy scriptorium, flames in the stone fireplace gently flicker and crackle with delicate embers floating upward. Outside the gothic leaded window, rain streams rhythmically down the glass panes. Airborne dust motes drift lazily through the warm golden lamplight. Architecture, bookshelves, and furniture remain 100% static and frozen. Seamless cyclical ambient loop, zero camera movement, no jump cuts, photorealistic motion physics.',
      musicPrompt: 'Deep atmospheric ambient soundscape with warm felt piano playing slow nostalgic chords in minor key, paired with a layered foley mix: 45% steady rain against window panes, 35% crackling hearth logs with subtle wood snaps, 15% distant muffled thunder rumble, 5% antique clock tick. Warm analog tape saturation, rolled-off high frequencies, ultra-calm tempo 60 BPM, designed for infinite focus and relaxation.',
      productionChecklist: [
        'Image master rendered in Midjourney / Flux at 16:9',
        'Upscaled to clean 4K with texture preservation',
        'Video animated in Runway Gen-3 with locked camera prompt',
        'Audio foley mixed with high-cut filter for ear fatigue prevention',
        '10-second loop tested in DaVinci Resolve for seamless seam blending',
      ],
      reusableLessons: [
        {
          category: 'Looping',
          title: 'Hearth Ember Seam Alignment',
          observation: 'Flame height variations at frame 0 and frame 240 cause noticeable flicker on loop repetition.',
          recommendation: 'Use a cross-fade of 0.8 seconds on the video loop seam, or prompt video models for steady low-burn embers rather than large leaping bonfires.',
        },
        {
          category: 'Lighting',
          title: 'Color Temperature Split Ratio',
          observation: 'Scenes with 70% warm interior / 30% cool exterior perform 2.4x higher on average watch time.',
          recommendation: 'Position the window in the background third to create natural eye rest while keeping the main frame immersed in warm 2100K amber glow.',
        },
      ],
    },
  },
  {
    id: 'vlab-cyberpunk-rain',
    url: 'https://www.youtube.com/watch?v=GLk7-ZJ4B5s',
    videoId: 'GLk7-ZJ4B5s',
    title: 'Cyberpunk Rooftop Apartment Ambience | Tokyo Rain & Neon Lo-Fi',
    channelTitle: 'Aesthetic Noise Archive',
    thumbnailUrl: 'https://img.youtube.com/vi/GLk7-ZJ4B5s/hqdefault.jpg',
    duration: '2:30:00',
    analyzedAt: 1712100000000,
    favorite: false,
    tags: ['Cyberpunk', 'Neon Rain', 'Lo-Fi Chill', 'Tokyo Night'],
    notes: 'Premier example of modern rainy city aesthetic. Excellent neon reflection dynamics on wet glass.',
    matchConfidence: 94,
    aesthetic: {
      worldArchetype: 'Futuristic Cyberpunk Loft / Neon Rain',
      locationType: 'indoor',
      season: 'autumn',
      timeOfDay: 'night',
      weather: 'rain',
      secondaryWeather: 'mist',
      waterElements: {
        enabled: true,
        type: 'rain-puddles',
        behavior: 'rippling',
        notes: 'Rooftop balcony puddles reflecting holographic signage.',
      },
      lighting: {
        primarySource: 'Holographic billboard spill & warm Edison desk light',
        colorTemperature: 'Bioluminescent Cyan (#06B6D4) and Neon Magenta (#EC4899) balanced by warm interior lamp (2700K)',
        intensity: 'dim-cozy',
        volumetricRays: true,
        flickeringFlames: false,
        reflections: true,
        notes: 'Wet balcony floor mirrors towering illuminated skyscraper facades.',
      },
      colorPalette: [
        { hex: '#06B6D4', name: 'Electric Cyan Glow', role: 'Exterior Neon Reflections' },
        { hex: '#EC4899', name: 'Neon Magenta', role: 'Distant City Signage' },
        { hex: '#E8AE62', name: 'Warm Amber Desk Lamp', role: 'Interior Cozy Anchor' },
        { hex: '#0B0F19', name: 'Deep Midnight Slate', role: 'Interior Shadows' },
      ],
      materialsAndTextures: [
        'Rain-drenched industrial glass balcony doors',
        'Brushed anodized dark aluminum frames',
        'Wet concrete terrace reflecting city neons',
        'Warm textured wood writing desk with coffee mug',
      ],
      atmosphericEffects: [
        'Heavy raindrops streaking down sliding glass door',
        'Rising steam and misty vapor between skyscraper canyons',
        'Soft neon light flares diffusing in rainy atmosphere',
      ],
      depthPlanes: {
        foreground: 'Modern wooden workbench with vintage analog audio monitors and warm reading lamp',
        middleGround: 'Floor-to-ceiling glass patio door with sliding balcony opening and wet railing',
        background: 'Sprawling high-density cyber-metropolis with floating transit lanes and holographic advertisements',
      },
      composition: {
        angle: 'eye-level',
        framing: 'Interior sanctuary framing looking out toward vast vertical city',
        focalLengthFeel: '28mm wide-angle with cinematic anamorphic bokeh',
        notes: 'High spatial depth, sense of peaceful isolation above a bustling city.',
      },
    },
    kinematics: {
      cameraBehavior: 'Locked Tripod',
      motionSubjects: [
        'Raindrops beating and trickling on glass window panels',
        'Steam rising slowly from ventilation pipe on balcony',
        'Subtle pulsating glow of neon signs in far background',
      ],
      motionPacing: 'Gentle / Relaxed',
      loopCycleEstimateSeconds: 10,
      loopSeamHazards: [
        'Ensure holographic neon signs do not rapidly change text',
        'Lock flying vehicle traffic so vehicles do not blink or disappear at loop point',
      ],
      cinematicRules: [
        'Stationary tripod lock; no digital zoom or wobble',
        'Zero human silhouettes in the window',
        'No abrupt neon flashing',
      ],
    },
    acoustics: {
      musicalStyle: 'Mellow Lo-Fi Beats & Chillhop Rhodes',
      instrumentation: ['Fender Rhodes EP', 'Vinyl crackle', 'Muted jazz guitar', 'Subtle 70 BPM boom-bap kick/snare'],
      tempoBpmRange: '72 BPM',
      foleyLayers: [
        { name: 'City Rain on Balcony Glass', percentage: 40, description: 'Detailed high-frequency splatter on metal railing and glass' },
        { name: 'Lo-Fi Chillhop Instrumental', percentage: 35, description: 'Warm nostalgic chords with subtle sidechain compression' },
        { name: 'Distant City Rumble & Sirens', percentage: 15, description: 'Deep low hum of metropolis transit, very distant and muffled' },
        { name: 'Vinyl Dust & Tape Flutter', percentage: 10, description: 'Gentle vintage crackle providing warm continuous noise floor' },
      ],
      frequencyMasteringNotes: 'Smooth low-pass filter on drums to keep snare non-intrusive. Sub-bass kept round and tight.',
      keyMoods: ['Urban Solitude', 'Late Night Coding', 'Relaxed Melancholy', 'Futuristic Calm'],
    },
    blueprint: {
      directorVision: 'Capture the romantic, contemplative side of cyberpunk: quiet rain, glowing signs, and warm tea in a high-rise studio without dystopian violence or abrasive noise.',
      translatedConfig: {
        worldId: 'cyberpunk-apartment',
        season: 'autumn',
        timeOfDay: 'night',
        primaryWeather: 'rain',
        secondaryWeather: 'mist',
        settingType: 'indoor',
        customLocation: 'Skyline Terrace Loft',
      },
      imagePrompt: 'Cinematic interior of a cozy minimalist high-tech apartment loft in Neo Tokyo at 2 AM during a heavy rainstorm, floor-to-ceiling glass balcony doors covered in rain rivulets looking out at a sprawling neon-lit cyberpunk cityscape with towers glowing in cyan and magenta light, inside the room a warm wooden desk with an illuminated retro keyboard and cup of steaming green tea glowing in warm 2700K amber, wet concrete terrace outside reflecting neon reflections, no people, hyper-realistic, 8k resolution, cinematic lighting --ar 16:9 --style raw',
      videoPrompt: 'Stationary locked tripod camera. Rain steadily hits and streams down the large glass sliding doors. On the wet balcony, small rain puddle ripples gently disturb neon reflections. In the far distance, skyscraper neons have a very subtle gentle pulse. In the foreground, delicate steam rises from the tea mug. Zero camera movement, seamless loop, peaceful ambient motion physics, no sudden cuts.',
      musicPrompt: 'Chill lo-fi hip hop ambient beat at 72 BPM with warm Fender Rhodes keys, subtle vinyl hiss, acoustic nylon guitar licks, mixed with 40% crisp city rain and balcony drops. Cozy, peaceful, relaxing mix for late-night productivity.',
      productionChecklist: [
        'Generate 16:9 concept art with cyber-rain palette',
        'Upscale with detail preservation',
        'Generate looped 10s video with locked camera enforcement',
        'Layer authentic Tokyo binaural rain recording under lo-fi track',
      ],
      reusableLessons: [
        {
          category: 'Lighting',
          title: 'Neon Reflection Balance',
          observation: 'Excessive neon glow overpowers the interior cozy feeling.',
          recommendation: 'Anchor the immediate foreground with warm 2700K incandescent light to keep the scene inviting and domestic.',
        },
      ],
    },
  },
];

export class StorageService {
  // Presets
  static getPresets(): Preset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESETS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(STARTER_PRESETS));
        return STARTER_PRESETS;
      }
      return JSON.parse(data);
    } catch {
      return STARTER_PRESETS;
    }
  }

  static savePreset(preset: Preset): void {
    const presets = this.getPresets().filter((p) => p.id !== preset.id);
    presets.unshift(preset);
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  }

  static deletePreset(id: string): void {
    const presets = this.getPresets().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  }

  // Production Recipes (Phase 10)
  static getRecipes(): ProductionRecipe[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(STARTER_RECIPES));
        return STARTER_RECIPES;
      }
      return JSON.parse(data);
    } catch {
      return STARTER_RECIPES;
    }
  }

  static saveRecipe(recipe: ProductionRecipe): void {
    const recipes = this.getRecipes().filter((r) => r.id !== recipe.id);
    const updated = { ...recipe, updatedAt: Date.now() };
    recipes.unshift(updated);
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }

  static deleteRecipe(id: string): void {
    const recipes = this.getRecipes().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }

  static duplicateRecipe(id: string): ProductionRecipe | null {
    const recipes = this.getRecipes();
    const existing = recipes.find((r) => r.id === id);
    if (!existing) return null;

    const dup: ProductionRecipe = {
      ...existing,
      id: `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${existing.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      favorite: false,
      config: JSON.parse(JSON.stringify(existing.config)),
      promptTemplates: JSON.parse(JSON.stringify(existing.promptTemplates)),
    };
    this.saveRecipe(dup);
    return dup;
  }

  static toggleFavoriteRecipe(id: string): ProductionRecipe | null {
    const recipes = this.getRecipes();
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      recipe.favorite = !recipe.favorite;
      recipe.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      return recipe;
    }
    return null;
  }

  static toggleArchiveRecipe(id: string): ProductionRecipe | null {
    const recipes = this.getRecipes();
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      recipe.archived = !recipe.archived;
      recipe.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      return recipe;
    }
    return null;
  }

  // Projects
  static getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        const defaultProj = this.createInitialProject();
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([defaultProj]));
        return [defaultProj];
      }
      const parsed: Project[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const defaultProj = this.createInitialProject();
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([defaultProj]));
        return [defaultProj];
      }
      return parsed;
    } catch {
      const defaultProj = this.createInitialProject();
      return [defaultProj];
    }
  }

  static createInitialProject(): Project {
    const config = createDefaultAmbienceConfig();
    const compiled = compilePrompts(config);
    const drafts: PromptDrafts = {
      imagePrompt: compiled.imagePrompt,
      imagePromptLocked: false,
      videoPrompt: compiled.videoPrompt,
      videoPromptLocked: false,
      musicPrompt: compiled.musicPrompt,
      musicPromptLocked: false,
    };

    return {
      id: 'proj-default-1',
      name: 'Hogwarts Hearth & Rain',
      description: 'Atmospheric winter rain with roaring stone fireplace and floating dust motes',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stage: 'prompt-studio',
      completedStages: ['concept', 'references', 'scene-design'],
      archived: false,
      checklist: {
        imageGenerated: true,
        videoLooped: false,
        audioLayered: false,
        metadataDrafted: true,
        qualityChecked: false,
        exported: false,
      },
      productionMetadata: {
        youtubeTitle: 'Gryffindor Common Room Rain & Hearth Ambience | 3 Hours Study & Sleep',
        youtubeDescription: 'Immerse yourself in 3 hours of cozy winter rain tapping against gothic arched windows while a massive stone hearth crackles. Perfect for studying, reading, and deep sleep.\n\n🎵 4-Layer Binaural Audio: Hearth embers, heavy rain, soft cello, wind chime motes.',
        youtubeTags: ['hogwarts ambience', 'rain study sounds', 'fireplace sleep', 'aesthetic noise', 'cozy fantasy room'],
        pinnedComment: 'Timestamps:\n0:00 - Heavy evening rain & hearth spark\n1:00:00 - Midnight downpour & low embers\n2:00:00 - Distant thunder & sleep lull',
        targetDurationMinutes: 180,
      },
      assetStatus: {
        imageStatus: 'approved',
        videoStatus: 'not_started',
        musicStatus: 'not_started',
        motionModelUsed: 'Runway Gen-3',
        audioDurationMinutes: 180,
      },
      config,
      drafts,
    };
  }

  static getActiveProjectId(): string {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    if (active) return active;
    const projects = this.getProjects();
    return projects[0]?.id || 'proj-default-1';
  }

  static setActiveProjectId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  }

  static saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    const updated = { ...project, updatedAt: Date.now() };
    if (index >= 0) {
      projects[index] = updated;
    } else {
      projects.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  static createNewProject(name: string, description = ''): Project {
    const config = createDefaultAmbienceConfig();
    const compiled = compilePrompts(config);
    const newProj: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name || 'Untitled Ambience Project',
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stage: 'concept',
      completedStages: [],
      archived: false,
      checklist: {
        imageGenerated: false,
        videoLooped: false,
        audioLayered: false,
        metadataDrafted: false,
        qualityChecked: false,
        exported: false,
      },
      productionMetadata: {
        youtubeTitle: `${name || 'Atmospheric Ambience'} | Relaxing Ambience for Study & Sleep`,
        youtubeDescription: `Relax and focus with this immersive ambience video crafted by Aesthetic Noise.\n\nEnjoy pure ambient relaxation with gentle layered audio and cinematic stillness.`,
        youtubeTags: ['ambience', 'study music', 'relaxing sounds', 'aesthetic noise'],
        targetDurationMinutes: 180,
      },
      assetStatus: {
        imageStatus: 'not_started',
        videoStatus: 'not_started',
        musicStatus: 'not_started',
      },
      config,
      drafts: {
        imagePrompt: compiled.imagePrompt,
        imagePromptLocked: false,
        videoPrompt: compiled.videoPrompt,
        videoPromptLocked: false,
        musicPrompt: compiled.musicPrompt,
        musicPromptLocked: false,
      },
    };
    this.saveProject(newProj);
    this.setActiveProjectId(newProj.id);
    return newProj;
  }

  static duplicateProject(id: string): Project | null {
    const projects = this.getProjects();
    const existing = projects.find((p) => p.id === id);
    if (!existing) return null;

    const dup: Project = {
      ...existing,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${existing.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      config: JSON.parse(JSON.stringify(existing.config)),
      drafts: JSON.parse(JSON.stringify(existing.drafts)),
    };
    this.saveProject(dup);
    return dup;
  }

  static renameProject(id: string, name: string): void {
    const projects = this.getProjects();
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      proj.name = name;
      proj.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }
  }

  static toggleArchiveProject(id: string): Project | null {
    const projects = this.getProjects();
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      proj.archived = !proj.archived;
      proj.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      return proj;
    }
    return null;
  }

  static deleteProject(id: string): Project[] {
    const projects = this.getProjects().filter((p) => p.id !== id);
    if (projects.length === 0) {
      const fresh = this.createInitialProject();
      projects.push(fresh);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projects;
  }

  // References
  static getReferences(): ReferenceItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFERENCES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.REFERENCES, JSON.stringify(DEFAULT_REFERENCES));
        return DEFAULT_REFERENCES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_REFERENCES;
    }
  }

  static saveReference(item: ReferenceItem): void {
    const items = this.getReferences().filter((r) => r.id !== item.id);
    items.unshift(item);
    localStorage.setItem(STORAGE_KEYS.REFERENCES, JSON.stringify(items));
  }

  static deleteReference(id: string): void {
    const items = this.getReferences().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REFERENCES, JSON.stringify(items));
  }

  // Lessons Learned
  static getLessons(): LessonLearnedItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(DEFAULT_LESSONS));
        return DEFAULT_LESSONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_LESSONS;
    }
  }

  static saveLesson(item: LessonLearnedItem): void {
    const items = this.getLessons().filter((l) => l.id !== item.id);
    items.unshift(item);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(items));
  }

  static deleteLesson(id: string): void {
    const items = this.getLessons().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(items));
  }

  // Prompt History
  static getHistory(): PromptHistoryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addHistoryEntry(entry: Omit<PromptHistoryEntry, 'id' | 'createdAt'>): void {
    const history = this.getHistory();
    const newEntry: PromptHistoryEntry = {
      ...entry,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    history.unshift(newEntry);
    // Keep max 100 entries
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
  }

  static clearHistory(): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  }

  // Video Performance Records (Production Intelligence)
  static getVideos(): VideoPerformanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(DEFAULT_VIDEOS));
        return DEFAULT_VIDEOS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_VIDEOS;
    }
  }

  static saveVideo(item: VideoPerformanceRecord): void {
    const items = this.getVideos().filter((v) => v.id !== item.id);
    items.unshift(item);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(items));
  }

  static deleteVideo(id: string): void {
    const items = this.getVideos().filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(items));
  }

  // Reference Video Lab Items (Phase 7)
  static getVideoLabItems(): ReferenceVideoLabItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEO_LAB);
      if (!data) {
        const normalizedDefaults = DEFAULT_VIDEO_LAB_ITEMS.map(normalizeVideoLabItem);
        localStorage.setItem(STORAGE_KEYS.VIDEO_LAB, JSON.stringify(normalizedDefaults));
        return normalizedDefaults;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeVideoLabItem);
      }
      const normalizedDefaults = DEFAULT_VIDEO_LAB_ITEMS.map(normalizeVideoLabItem);
      localStorage.setItem(STORAGE_KEYS.VIDEO_LAB, JSON.stringify(normalizedDefaults));
      return normalizedDefaults;
    } catch {
      return DEFAULT_VIDEO_LAB_ITEMS.map(normalizeVideoLabItem);
    }
  }

  static saveVideoLabItem(item: ReferenceVideoLabItem): void {
    const normalizedItem = normalizeVideoLabItem(item);
    const items = this.getVideoLabItems().filter((v) => v.id !== normalizedItem.id);
    items.unshift(normalizedItem);
    localStorage.setItem(STORAGE_KEYS.VIDEO_LAB, JSON.stringify(items));
  }

  static deleteVideoLabItem(id: string): void {
    const items = this.getVideoLabItems().filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VIDEO_LAB, JSON.stringify(items));
  }

  static toggleFavoriteVideoLabItem(id: string): ReferenceVideoLabItem | null {
    const items = this.getVideoLabItems();
    const item = items.find((v) => v.id === id);
    if (item) {
      item.favorite = !item.favorite;
      localStorage.setItem(STORAGE_KEYS.VIDEO_LAB, JSON.stringify(items));
      return item;
    }
    return null;
  }

  // Assistant Sessions (Phase 9)
  static getAssistantSessions(): AssistantSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSISTANT_SESSIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveAssistantSession(session: AssistantSession): void {
    const sessions = this.getAssistantSessions().filter((s) => s.id !== session.id);
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.ASSISTANT_SESSIONS, JSON.stringify(sessions));
  }

  static deleteAssistantSession(id: string): void {
    const sessions = this.getAssistantSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSISTANT_SESSIONS, JSON.stringify(sessions));
  }

  // Model Selection & Task Overrides (Phase: Model Selector & API Routing)
  static getModelConfig(): TaskModelConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(DEFAULT_TASK_MODEL_CONFIG));
        return DEFAULT_TASK_MODEL_CONFIG;
      }
      const parsed = JSON.parse(data);
      return {
        globalModelId: parsed.globalModelId || DEFAULT_TASK_MODEL_CONFIG.globalModelId,
        taskOverrides: parsed.taskOverrides || {},
      };
    } catch {
      return DEFAULT_TASK_MODEL_CONFIG;
    }
  }

  static saveModelConfig(config: TaskModelConfig): void {
    localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(config));
  }

  static setGlobalModel(modelId: SupportedGeminiModelId): TaskModelConfig {
    const current = this.getModelConfig();
    const updated: TaskModelConfig = {
      ...current,
      globalModelId: modelId,
    };
    this.saveModelConfig(updated);
    return updated;
  }

  static setTaskOverride(
    taskType: StudioTaskType,
    modelId?: SupportedGeminiModelId
  ): TaskModelConfig {
    const current = this.getModelConfig();
    const overrides = { ...current.taskOverrides };
    if (!modelId || modelId === current.globalModelId) {
      delete overrides[taskType];
    } else {
      overrides[taskType] = modelId;
    }
    const updated: TaskModelConfig = {
      ...current,
      taskOverrides: overrides,
    };
    this.saveModelConfig(updated);
    return updated;
  }

  static resetTaskOverride(taskType: StudioTaskType): TaskModelConfig {
    const current = this.getModelConfig();
    const overrides = { ...current.taskOverrides };
    delete overrides[taskType];
    const updated: TaskModelConfig = {
      ...current,
      taskOverrides: overrides,
    };
    this.saveModelConfig(updated);
    return updated;
  }

  static resetAllOverrides(): TaskModelConfig {
    const current = this.getModelConfig();
    const updated: TaskModelConfig = {
      ...current,
      taskOverrides: {},
    };
    this.saveModelConfig(updated);
    return updated;
  }

  // Full Studio Export / Import
  static exportFullStudioJSON(): string {
    return JSON.stringify(
      {
        version: '1.4',
        exportedAt: new Date().toISOString(),
        projects: this.getProjects(),
        presets: this.getPresets(),
        recipes: this.getRecipes(),
        references: this.getReferences(),
        lessons: this.getLessons(),
        history: this.getHistory(),
        videos: this.getVideos(),
        videoLab: this.getVideoLabItems(),
        modelConfig: this.getModelConfig(),
      },
      null,
      2
    );
  }

  static importFullStudioJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.projects && Array.isArray(parsed.projects)) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(parsed.projects));
      }
      if (parsed.presets && Array.isArray(parsed.presets)) {
        localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(parsed.presets));
      }
      if (parsed.recipes && Array.isArray(parsed.recipes)) {
        localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(parsed.recipes));
      }
      if (parsed.references && Array.isArray(parsed.references)) {
        localStorage.setItem(STORAGE_KEYS.REFERENCES, JSON.stringify(parsed.references));
      }
      if (parsed.lessons && Array.isArray(parsed.lessons)) {
        localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(parsed.lessons));
      }
      if (parsed.videos && Array.isArray(parsed.videos)) {
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(parsed.videos));
      }
      if (parsed.videoLab && Array.isArray(parsed.videoLab)) {
        localStorage.setItem(STORAGE_KEYS.VIDEO_LAB, JSON.stringify(parsed.videoLab));
      }
      if (parsed.modelConfig && typeof parsed.modelConfig === 'object') {
        localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(parsed.modelConfig));
      }
      return true;
    } catch {
      return false;
    }
  }
}
