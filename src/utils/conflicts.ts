import { AmbienceConfig } from '../types/ambience';

export interface ConflictWarning {
  id: string;
  section: string;
  title: string;
  message: string;
  severity: 'warning' | 'info';
  resolveActionLabel?: string;
  resolve?: (config: AmbienceConfig) => AmbienceConfig;
}

export const detectConflicts = (config: AmbienceConfig): ConflictWarning[] => {
  const warnings: ConflictWarning[] = [];

  // 1. Weather contradiction
  const precipitationTypes = ['rain', 'heavy-rain', 'drizzle', 'thunderstorm', 'snow', 'heavy-snow', 'blizzard'];
  const clearTypes = ['clear'];

  if (
    (clearTypes.includes(config.primaryWeather) && config.secondaryWeather && precipitationTypes.includes(config.secondaryWeather)) ||
    (precipitationTypes.includes(config.primaryWeather) && config.secondaryWeather && clearTypes.includes(config.secondaryWeather))
  ) {
    warnings.push({
      id: 'weather-clear-precip',
      section: 'Weather',
      title: 'Conflicting Weather Conditions',
      message: `Combining "${config.primaryWeather}" with "${config.secondaryWeather}" creates contradictory meteorological conditions.`,
      severity: 'warning',
      resolveActionLabel: 'Clear Secondary Weather',
      resolve: (c) => ({ ...c, secondaryWeather: undefined }),
    });
  }

  // 2. Camera movement vs Locked Camera mode
  if (config.camera.lockedCamera && config.camera.movement !== 'locked') {
    warnings.push({
      id: 'camera-movement-locked',
      section: 'Camera',
      title: 'Camera Motion vs Locked Mode',
      message: `Locked Camera is enabled, but camera movement is set to "${config.camera.movement}".`,
      severity: 'warning',
      resolveActionLabel: 'Lock Movement',
      resolve: (c) => ({
        ...c,
        camera: { ...c.camera, movement: 'locked' },
        video: { ...c.video, lockedCamera: true },
      }),
    });
  }

  // 3. Exclude People & Animals vs Living Subjects selected
  if (config.elements.excludePeopleAndAnimals && config.elements.livingSubjects.length > 0) {
    warnings.push({
      id: 'elements-living-excluded',
      section: 'Elements',
      title: 'Living Subjects Inactive',
      message: 'Master toggle "Exclude people and animals" is active, which suppresses selected living subjects.',
      severity: 'info',
      resolveActionLabel: 'Clear Living Subjects',
      resolve: (c) => ({
        ...c,
        elements: { ...c.elements, livingSubjects: [] },
      }),
    });
  }

  // 4. Sky disabled but sky celestial elements active
  if (!config.sky.showSky && (config.sky.sun !== 'hidden' || config.sky.moon !== 'hidden' || config.sky.aurora !== 'off')) {
    warnings.push({
      id: 'sky-disabled-elements',
      section: 'Sky',
      title: 'Sky Inactive',
      message: 'Sky is toggled Off for this scene, so celestial elements will not be rendered in the prompts.',
      severity: 'info',
      resolveActionLabel: 'Show Sky',
      resolve: (c) => ({
        ...c,
        sky: { ...c.sky, showSky: true },
      }),
    });
  }

  // 5. Water loop difficulty notice
  if (config.video.seamlessLoop && config.water.enabled && config.water.movementIntensity > 3) {
    warnings.push({
      id: 'water-loop-difficulty',
      section: 'Water & Video',
      title: 'Water Motion vs Seamless Loop',
      message: 'High water movement intensity (above 3) is challenging for AI video models to loop seamlessly without frame tears.',
      severity: 'warning',
      resolveActionLabel: 'Optimize Water for Loop',
      resolve: (c) => ({
        ...c,
        water: { ...c.water, movementIntensity: 2, loopSafeAnimation: true },
      }),
    });
  }

  return warnings;
};
