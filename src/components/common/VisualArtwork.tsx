import React, { useState } from 'react';
import { useCustomImages } from '../../context/CustomImageContext';
import { CustomImageOverlay } from './CustomImageOverlay';
import { FocalPoint } from '../../types/images';

interface VisualArtworkProps {
  targetKey: string;
  targetLabel: string;
  defaultVisual: React.ReactNode;
  fallbackTargetKey?: string;
  className?: string;
  showControls?: boolean;
  alignControls?: 'top-right' | 'top-left';
  overlayScrim?: boolean;
}

export const VisualArtwork: React.FC<VisualArtworkProps> = ({
  targetKey,
  targetLabel,
  defaultVisual,
  fallbackTargetKey,
  className = 'w-full h-full',
  showControls = true,
  alignControls = 'top-right',
  overlayScrim = false,
}) => {
  const { getCustomImage } = useCustomImages();
  const [imageError, setImageError] = useState(false);

  const customInfo = getCustomImage(targetKey) || (fallbackTargetKey ? getCustomImage(fallbackTargetKey) : null);

  const getFocalPosition = (fp: FocalPoint = 'center'): string => {
    switch (fp) {
      case 'top': return '50% 15%';
      case 'bottom': return '50% 85%';
      case 'left': return '15% 50%';
      case 'right': return '85% 50%';
      default: return 'center center';
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {customInfo && !imageError ? (
        <img
          src={customInfo.asset.dataUrl}
          alt={targetLabel}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition: getFocalPosition(customInfo.focalPoint) }}
        />
      ) : (
        <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
          {defaultVisual}
        </div>
      )}

      {/* Optional gradient scrim */}
      {overlayScrim && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1520] via-transparent to-black/20 pointer-events-none" />
      )}

      {/* Unobtrusive Custom Image Controls */}
      {showControls && (
        <CustomImageOverlay
          targetKey={targetKey}
          targetLabel={targetLabel}
          align={alignControls}
        />
      )}
    </div>
  );
};
