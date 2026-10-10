import React from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import { LOCATIONS_CATALOG } from '../../../data/catalog';
import { SettingType } from '../../../types/ambience';
import { LocationCard } from '../cards/LocationCard';
import {
  Home,
  Trees,
  Maximize2,
  Tent,
  Sliders,
  MapPin,
  RotateCcw,
} from 'lucide-react';

export const LocationSection: React.FC = () => {
  const { config, setSettingType, setLocation, updateConfig, resetSection } = useAmbience();

  const settingTypes: { id: SettingType; label: string; icon: React.ReactNode }[] = [
    { id: 'indoor', label: 'Indoor', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'outdoor', label: 'Outdoor', icon: <Trees className="w-3.5 h-3.5" /> },
    { id: 'both-view-from-inside', label: 'View from Inside', icon: <Maximize2 className="w-3.5 h-3.5" /> },
    { id: 'transitional', label: 'Transitional / Sheltered', icon: <Tent className="w-3.5 h-3.5" /> },
    { id: 'custom', label: 'Custom Setting', icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  // Filter locations strictly based on the selected settingType
  const filteredLocations = LOCATIONS_CATALOG.filter(
    (loc) => loc.settingType === config.settingType
  );

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <MapPin className="w-4 h-4 text-[#E8AE62]" />
            2. Location & Architectural Setting
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Choose the structural perspective first, then pick the specific architectural chamber or landscape vista
          </p>
        </div>

        <button
          type="button"
          onClick={() => resetSection('environment')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
          title="Reset location settings"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Prominent Segmented Control for Setting Type */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 font-mono">
          Perspective Mode
        </label>
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
          {settingTypes.map((type) => {
            const isSelected = config.settingType === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSettingType(type.id)}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-[#192434] text-[#E8AE62] font-semibold shadow-xs border border-[#283952]'
                    : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                }`}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Image Tiles Grid for Specific Locations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] font-mono">
            Specific Setting ({filteredLocations.length} Options Available)
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredLocations.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              isSelected={config.locationId === loc.id}
              onSelect={setLocation}
            />
          ))}
        </div>

        {/* Custom Location Input */}
        {(config.locationId.startsWith('custom') || config.settingType === 'custom') && (
          <div className="mt-4 p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
            <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
              Custom Location Specification
            </label>
            <input
              type="text"
              value={config.customLocation || ''}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  customLocation: e.target.value,
                }))
              }
              placeholder="e.g. Alchemist's greenhouse observatory at the edge of the world"
              className="w-full px-3 py-2 text-xs bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
            />
          </div>
        )}
      </div>
    </section>
  );
};
