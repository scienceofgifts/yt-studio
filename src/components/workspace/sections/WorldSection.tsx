import React, { useState } from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import { WORLDS_CATALOG } from '../../../data/catalog';
import { WorldCategory } from '../../../types/ambience';
import { WorldCard } from '../cards/WorldCard';
import {
  Compass,
  Sparkles,
  TreePine,
  Gamepad2,
  Building2,
  PlusCircle,
  RotateCcw,
  BookmarkPlus,
} from 'lucide-react';

export const WorldSection: React.FC = () => {
  const { config, selectWorld, updateConfig, resetSection, saveCurrentAsPreset } = useAmbience();
  const [selectedCategory, setSelectedCategory] = useState<WorldCategory | 'all'>('all');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  const categories: { id: WorldCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Worlds', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'fantasy', label: 'Fantasy & Magical', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'cozy-nature', label: 'Cozy & Nature', icon: <TreePine className="w-3.5 h-3.5" /> },
    { id: 'gaming', label: 'Gaming-Inspired', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'urban-alt', label: 'Urban & Alternative', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'custom', label: 'Custom World', icon: <PlusCircle className="w-3.5 h-3.5" /> },
  ];

  const filteredWorlds = WORLDS_CATALOG.filter(
    (w) => selectedCategory === 'all' || w.category === selectedCategory
  );

  const activeWorld = WORLDS_CATALOG.find((w) => w.id === config.worldId);

  const handleSaveCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    saveCurrentAsPreset(presetName.trim(), presetDescription.trim(), 'Custom Worlds');
    setShowSavePresetModal(false);
    setPresetName('');
    setPresetDescription('');
  };

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Compass className="w-4 h-4 text-[#E8AE62]" />
            1. Choose Your Atmospheric World
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Select an overarching universe or design a custom setting to anchor lighting, acoustics, and lore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSavePresetModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F2EEE6] hover:text-[#E8AE62] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-lg transition-colors"
            title="Save current world & settings as preset"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-[#E8AE62]" />
            Save as Preset
          </button>
          <button
            type="button"
            onClick={() => resetSection('world')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
            title="Reset to default world"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#0B1018] border border-[#1E2B3E] rounded-xl mb-5">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#192434] text-[#E8AE62] font-semibold shadow-xs border border-[#283952]'
                  : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* World Visual Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorlds.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            isSelected={config.worldId === world.id}
            onSelect={selectWorld}
          />
        ))}
      </div>

      {/* Custom World Form */}
      {config.worldId === 'custom-world' && (
        <div className="mt-5 p-5 bg-[#0B1018] border border-[#E8AE62]/40 rounded-xl">
          <h3 className="text-xs font-semibold text-[#E8AE62] mb-3 flex items-center gap-1.5 font-display">
            <PlusCircle className="w-3.5 h-3.5" />
            Custom World Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#F2EEE6] mb-1.5">
                Custom Setting Name
              </label>
              <input
                type="text"
                value={config.customWorldName || ''}
                onChange={(e) =>
                  updateConfig((prev) => ({
                    ...prev,
                    customWorldName: e.target.value,
                  }))
                }
                placeholder="e.g. Celestial Observatory in the Asteroids"
                className="w-full px-3 py-2 text-xs bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#F2EEE6] mb-1.5">
                Atmospheric Lore & Description
              </label>
              <input
                type="text"
                value={config.customWorldDescription || ''}
                onChange={(e) =>
                  updateConfig((prev) => ({
                    ...prev,
                    customWorldDescription: e.target.value,
                  }))
                }
                placeholder="e.g. Orbiting observatory with brass lenses, zero-gravity rain bubbles"
                className="w-full px-3 py-2 text-xs bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Preset Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
              Save As Creative Preset
            </h3>
            <p className="text-xs text-[#A1AEC0] mb-4">
              Store current configuration ({activeWorld?.name}) into your local preset library.
            </p>
            <form onSubmit={handleSaveCustomPreset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">Preset Name</label>
                <input
                  type="text"
                  required
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g. My Gothic Fireplace Sanctuary"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Atmosphere and video details..."
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(false)}
                  className="px-3 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg transition-colors"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
