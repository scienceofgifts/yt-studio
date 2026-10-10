import React from 'react';
import { WorldDefinition } from '../../../types/ambience';
import { WorldVisual } from '../../../data/worldVisuals';
import { VisualArtwork } from '../../common/VisualArtwork';
import { Check } from 'lucide-react';

interface WorldCardProps {
  world: WorldDefinition;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const WorldCard: React.FC<WorldCardProps> = ({ world, isSelected, onSelect }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(world.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(world.id);
        }
      }}
      className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-200 flex flex-col h-48 sm:h-52 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8AE62] ${
        isSelected
          ? 'border-[#E8AE62] ring-1 ring-[#E8AE62]/50 shadow-xl shadow-black/60 bg-[#151F2E]'
          : 'border-[#1E2B3E] hover:border-[#283952] hover:shadow-lg bg-[#0E1520]'
      }`}
    >
      {/* Top 68% Visual Artwork with Custom Image Support */}
      <div className="relative w-full h-[68%] overflow-hidden bg-[#070B10]">
        <VisualArtwork
          targetKey={`world:${world.id}`}
          targetLabel={world.name}
          defaultVisual={<WorldVisual worldId={world.id} className="w-full h-full object-cover" />}
          overlayScrim={true}
          alignControls="top-right"
        />

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-2.5 right-10 p-1 bg-[#E8AE62] text-[#0B1018] rounded-full shadow-md z-10 pointer-events-none">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}

        {/* Category micro-tag */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#0B1018]/80 backdrop-blur-xs border border-[#1E2B3E] text-[10px] font-medium text-[#A1AEC0] capitalize tracking-wide pointer-events-none z-10">
          {world.category.replace('-', ' ')}
        </div>
      </div>

      {/* Bottom 32% Information Container */}
      <div className="p-3 bg-[#0E1520] flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-xs font-semibold tracking-wide truncate transition-colors ${
              isSelected ? 'text-[#E8AE62]' : 'text-[#F2EEE6] group-hover:text-[#E8AE62]'
            }`}
          >
            {world.name}
          </h3>
        </div>

        <p className="text-[11px] text-[#A1AEC0] line-clamp-1 leading-snug">
          {world.tagline}
        </p>
      </div>
    </div>
  );
};
