import React from 'react';
import { LocationOption } from '../../../types/ambience';
import { LocationVisual } from '../../../data/locationVisuals';
import { VisualArtwork } from '../../common/VisualArtwork';
import { Check } from 'lucide-react';

interface LocationCardProps {
  location: LocationOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, onSelect }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(location.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(location.id);
        }
      }}
      className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-200 flex flex-col h-44 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8AE62] ${
        isSelected
          ? 'border-[#E8AE62] ring-1 ring-[#E8AE62]/50 shadow-xl shadow-black/60 bg-[#151F2E]'
          : 'border-[#1E2B3E] hover:border-[#283952] hover:shadow-lg bg-[#0E1520]'
      }`}
    >
      {/* Visual Artwork Thumbnail with Custom Image Support */}
      <div className="relative w-full h-[65%] overflow-hidden bg-[#070B10]">
        <VisualArtwork
          targetKey={`location:${location.id}`}
          targetLabel={location.name}
          defaultVisual={<LocationVisual locationId={location.id} settingType={location.settingType} className="w-full h-full object-cover" />}
          overlayScrim={true}
          alignControls="top-right"
        />

        {/* Selected check badge */}
        {isSelected && (
          <div className="absolute top-2.5 right-10 p-1 bg-[#E8AE62] text-[#0B1018] rounded-full shadow-md z-10 pointer-events-none">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}
      </div>

      {/* Bottom Text Content */}
      <div className="p-2.5 bg-[#0E1520] flex-1 flex flex-col justify-between">
        <h4
          className={`text-xs font-semibold tracking-wide truncate transition-colors ${
            isSelected ? 'text-[#E8AE62]' : 'text-[#F2EEE6] group-hover:text-[#E8AE62]'
          }`}
        >
          {location.name}
        </h4>

        {location.description && (
          <p className="text-[10px] text-[#A1AEC0] line-clamp-1 leading-snug">
            {location.description}
          </p>
        )}
      </div>
    </div>
  );
};
