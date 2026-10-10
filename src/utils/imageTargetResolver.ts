import { WORLDS_CATALOG, LOCATIONS_CATALOG } from '../data/catalog';
import { StorageService } from '../services/storage';
import { ImageUsageInfo } from '../types/images';

export function resolveTargetInfo(targetKey: string): ImageUsageInfo {
  const [prefix, ...rest] = targetKey.split(':');
  const id = rest.join(':');

  if (prefix === 'world') {
    const world = WORLDS_CATALOG.find((w) => w.id === id);
    return {
      targetKey,
      label: world ? world.name : `World (${id})`,
      category: 'World',
    };
  }

  if (prefix === 'location') {
    const loc = LOCATIONS_CATALOG.find((l) => l.id === id);
    return {
      targetKey,
      label: loc ? loc.name : `Location (${id})`,
      category: 'Location',
    };
  }

  if (prefix === 'project') {
    const projects = StorageService.getProjects();
    const proj = projects.find((p) => p.id === id);
    return {
      targetKey,
      label: proj ? proj.name : `Project (${id})`,
      category: 'Project',
    };
  }

  if (prefix === 'preset') {
    const presets = StorageService.getPresets();
    const preset = presets.find((p) => p.id === id);
    return {
      targetKey,
      label: preset ? preset.name : `Preset (${id})`,
      category: 'Preset',
    };
  }

  if (prefix === 'scene-preview') {
    return {
      targetKey,
      label: 'Main Scene Preview Monitor',
      category: 'Scene Preview',
    };
  }

  return {
    targetKey,
    label: targetKey,
    category: 'World',
  };
}
