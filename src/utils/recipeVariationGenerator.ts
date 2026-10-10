import {
  ProductionRecipe,
  AmbienceConfig,
  RecipeVariationType,
  Season,
  TimeOfDay,
  WeatherCondition,
} from '../types/ambience';
import { compilePrompts } from './promptCompiler';

export interface VariationOption {
  type: RecipeVariationType;
  label: string;
  description: string;
  iconName: string;
}

export const VARIATION_OPTIONS: VariationOption[] = [
  {
    type: 'seasonal',
    label: 'Seasonal Variation',
    description: 'Transform environmental season (e.g. Autumn -> Winter Blizzard, Spring Bloom)',
    iconName: 'SunSnow',
  },
  {
    type: 'time-of-day',
    label: 'Time of Day Variation',
    description: 'Shift lighting & time (e.g. Golden Hour -> Night Twilight, Blue Hour -> Midnight)',
    iconName: 'MoonStar',
  },
  {
    type: 'weather',
    label: 'Weather & Atmosphere',
    description: 'Change weather conditions (e.g. Clear Sky -> Heavy Downpour, Misty Fog -> Snow)',
    iconName: 'CloudRain',
  },
  {
    type: 'mood',
    label: 'Mood & Pacing',
    description: 'Modify lighting contrast, pacing, and musical mood (e.g. Cozy Gentle -> Dramatic)',
    iconName: 'Sparkles',
  },
  {
    type: 'custom',
    label: 'Custom Parameter Tweak',
    description: 'Select precise parameter overrides across lighting, audio, and scene layout',
    iconName: 'Sliders',
  },
];

export interface VariationResult {
  newConfig: AmbienceConfig;
  suggestedName: string;
  suggestedDescription: string;
  suggestedCategory: string;
  newPrompts: {
    imagePrompt: string;
    videoPrompt: string;
    musicPrompt: string;
  };
  changedParametersSummary: {
    parameter: string;
    oldValue: string;
    newValue: string;
  }[];
}

export function generateRecipeVariation(
  baseRecipe: ProductionRecipe,
  variationType: RecipeVariationType,
  targetValue?: string, // e.g. 'winter' or 'night' or 'heavy-snow' or 'dramatic'
  customOverrides?: Partial<AmbienceConfig>
): VariationResult {
  const newConfig: AmbienceConfig = JSON.parse(JSON.stringify(baseRecipe.config));
  const changedSummary: { parameter: string; oldValue: string; newValue: string }[] = [];

  let nameSuffix = '';
  let category = baseRecipe.category;

  if (variationType === 'seasonal') {
    const oldSeason = newConfig.season;
    const targetSeason: Season = (targetValue as Season) || (oldSeason === 'autumn' ? 'winter' : oldSeason === 'winter' ? 'spring' : 'autumn');
    newConfig.season = targetSeason;

    if (targetSeason === 'winter') {
      newConfig.primaryWeather = 'heavy-snow';
      newConfig.secondaryWeather = 'blizzard';
      nameSuffix = 'Winter Snow Version';
      category = 'Seasonal & Festive';
    } else if (targetSeason === 'autumn') {
      newConfig.primaryWeather = 'rain';
      nameSuffix = 'Autumn Rain Version';
    } else if (targetSeason === 'spring') {
      newConfig.primaryWeather = 'drizzle';
      nameSuffix = 'Spring Drizzle Version';
    } else if (targetSeason === 'summer') {
      newConfig.primaryWeather = 'clear';
      nameSuffix = 'Summer Sunlight Version';
    }

    changedSummary.push({ parameter: 'Season', oldValue: oldSeason, newValue: targetSeason });
    changedSummary.push({ parameter: 'Primary Weather', oldValue: baseRecipe.config.primaryWeather, newValue: newConfig.primaryWeather });
  } else if (variationType === 'time-of-day') {
    const oldTime = newConfig.timeOfDay;
    const targetTime: TimeOfDay = (targetValue as TimeOfDay) || (oldTime === 'night' ? 'golden-hour' : 'night');
    newConfig.timeOfDay = targetTime;

    if (targetTime === 'night' || targetTime === 'midnight') {
      newConfig.lighting.primary = 'fireplace';
      newConfig.lighting.colorTemperature = 'warm-amber';
      nameSuffix = 'Midnight Night Edition';
    } else if (targetTime === 'golden-hour' || targetTime === 'sunset') {
      newConfig.lighting.primary = 'golden-sunlight';
      newConfig.lighting.colorTemperature = 'golden-sunset';
      nameSuffix = 'Golden Hour Sunset Edition';
    } else if (targetTime === 'blue-hour' || targetTime === 'dusk') {
      newConfig.lighting.colorTemperature = 'cool-blue';
      nameSuffix = 'Blue Hour Twilight Edition';
    }

    changedSummary.push({ parameter: 'Time of Day', oldValue: oldTime, newValue: targetTime });
    changedSummary.push({ parameter: 'Color Temperature', oldValue: baseRecipe.config.lighting.colorTemperature, newValue: newConfig.lighting.colorTemperature });
  } else if (variationType === 'weather') {
    const oldWeather = newConfig.primaryWeather;
    const targetWeather: WeatherCondition = (targetValue as WeatherCondition) || (oldWeather === 'rain' ? 'heavy-rain' : 'rain');
    newConfig.primaryWeather = targetWeather;

    if (targetWeather === 'heavy-rain' || targetWeather === 'thunderstorm') {
      newConfig.sky.clouds = 'dramatic';
      newConfig.sky.distantLightning = 'subtle';
      nameSuffix = 'Heavy Storm Edition';
    } else if (targetWeather === 'fog' || targetWeather === 'mist') {
      newConfig.sky.clouds = 'overcast';
      nameSuffix = 'Misty Fog Edition';
    } else if (targetWeather === 'heavy-snow') {
      newConfig.sky.clouds = 'overcast';
      nameSuffix = 'Heavy Snow Edition';
    }

    changedSummary.push({ parameter: 'Primary Weather', oldValue: oldWeather, newValue: targetWeather });
  } else if (variationType === 'mood') {
    const oldLighting = newConfig.lighting.intensity;
    newConfig.lighting.intensity = 'dramatic';
    newConfig.visualStyle.contrast = 'high';
    nameSuffix = 'Dramatic Cinematic Edition';

    changedSummary.push({ parameter: 'Lighting Intensity', oldValue: oldLighting, newValue: 'dramatic' });
    changedSummary.push({ parameter: 'Visual Contrast', oldValue: baseRecipe.config.visualStyle.contrast, newValue: 'high' });
  } else if (variationType === 'custom' && customOverrides) {
    Object.assign(newConfig, customOverrides);
    nameSuffix = 'Custom Variation';
    changedSummary.push({ parameter: 'Custom Configuration', oldValue: 'Base Setup', newValue: 'Custom Overrides Applied' });
  }

  // Compile new prompts using studio prompt compiler
  const compiled = compilePrompts(newConfig);

  // Derive smart adapted prompts from base recipe templates
  let adaptedImagePrompt = baseRecipe.promptTemplates.imagePrompt || compiled.imagePrompt;
  let adaptedVideoPrompt = baseRecipe.promptTemplates.videoPrompt || compiled.videoPrompt;
  let adaptedMusicPrompt = baseRecipe.promptTemplates.musicPrompt || compiled.musicPrompt;

  if (variationType === 'seasonal') {
    if (newConfig.season === 'winter') {
      adaptedImagePrompt = adaptedImagePrompt.replace(/autumn|fall|spring|summer/gi, 'winter snow').replace(/rain|drizzle/gi, 'heavy swirling snowfall and frost');
      adaptedVideoPrompt = adaptedVideoPrompt.replace(/raindrops|rain/gi, 'soft snowflakes drifting lazily').replace(/rain rivulets/gi, 'frost crystals');
      adaptedMusicPrompt = adaptedMusicPrompt.replace(/rain rumble|rain patter/gi, 'howling arctic blizzard wind and low hearth fire crackle');
    } else if (newConfig.season === 'autumn') {
      adaptedImagePrompt = adaptedImagePrompt.replace(/winter|snow|spring|summer/gi, 'autumn golden foliage').replace(/snowfall/gi, 'gentle autumn rain');
      adaptedVideoPrompt = adaptedVideoPrompt.replace(/snowflakes|snow/gi, 'subtle rain drops trickling on window glass');
    }
  } else if (variationType === 'time-of-day') {
    if (newConfig.timeOfDay === 'night' || newConfig.timeOfDay === 'midnight') {
      adaptedImagePrompt = adaptedImagePrompt.replace(/daytime|sunlight|golden hour/gi, 'midnight darkness with warm glowing interior lamps');
    } else if (newConfig.timeOfDay === 'golden-hour') {
      adaptedImagePrompt = adaptedImagePrompt.replace(/night|midnight|darkness/gi, 'golden hour warm sunlight filtering through windows');
    }
  }

  const suggestedName = `${baseRecipe.name} [${nameSuffix || 'Variation'}]`;
  const suggestedDescription = `Variation of "${baseRecipe.name}" (Version ${baseRecipe.version + 1}). Adapted with ${variationType} transformation.`;

  return {
    newConfig,
    suggestedName,
    suggestedDescription,
    suggestedCategory: category,
    newPrompts: {
      imagePrompt: adaptedImagePrompt,
      videoPrompt: adaptedVideoPrompt,
      musicPrompt: adaptedMusicPrompt,
    },
    changedParametersSummary: changedSummary,
  };
}
