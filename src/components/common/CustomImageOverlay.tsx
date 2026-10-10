import React, { useState, useRef, useEffect } from 'react';
import { useCustomImages } from '../../context/CustomImageContext';
import { FocalPoint } from '../../types/images';
import {
  Image as ImageIcon,
  Upload,
  Layers,
  RotateCcw,
  MoreVertical,
  Crosshair,
  Check,
} from 'lucide-react';

interface CustomImageOverlayProps {
  targetKey: string;
  targetLabel: string;
  className?: string;
  align?: 'top-right' | 'top-left';
}

export const CustomImageOverlay: React.FC<CustomImageOverlayProps> = ({
  targetKey,
  targetLabel,
  className = '',
  align = 'top-right',
}) => {
  const { getCustomImage, restoreDefault, updateFocalPoint, openPickerForTarget } = useCustomImages();
  const [menuOpen, setMenuOpen] = useState(false);
  const [focalMenuOpen, setFocalMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const customInfo = getCustomImage(targetKey);
  const isCustom = !!customInfo;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setFocalMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleOpenPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    openPickerForTarget(targetKey, targetLabel);
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    await restoreDefault(targetKey);
  };

  const handleSetFocalPoint = async (e: React.MouseEvent, fp: FocalPoint) => {
    e.preventDefault();
    e.stopPropagation();
    await updateFocalPoint(targetKey, fp);
    setFocalMenuOpen(false);
    setMenuOpen(false);
  };

  const focalOptions: { id: FocalPoint; label: string }[] = [
    { id: 'center', label: 'Center (Default)' },
    { id: 'top', label: 'Top' },
    { id: 'bottom', label: 'Bottom' },
    { id: 'left', label: 'Left' },
    { id: 'right', label: 'Right' },
  ];

  return (
    <div
      ref={menuRef}
      className={`absolute z-20 ${
        align === 'top-right' ? 'top-2 right-2' : 'top-2 left-2'
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger button: subtle icon button appearing on card hover or always when custom image is active */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className={`p-1.5 rounded-lg backdrop-blur-md transition-all duration-150 flex items-center justify-center shadow-lg ${
          isCustom
            ? 'bg-[#0B1018]/85 text-[#E8AE62] border border-[#E8AE62]/50 hover:bg-[#192434] opacity-90 group-hover:opacity-100'
            : 'bg-[#0B1018]/70 text-[#A1AEC0] border border-[#1E2B3E] hover:text-[#F2EEE6] hover:bg-[#192434] opacity-0 group-hover:opacity-100'
        }`}
        title={isCustom ? `Custom image active for ${targetLabel}` : `Change image for ${targetLabel}`}
        aria-label="Image options"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </button>

      {/* Floating Dropdown Menu */}
      {menuOpen && (
        <div
          className={`absolute mt-1.5 w-52 bg-[#101722] border border-[#283952] rounded-xl shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 ${
            align === 'top-right' ? 'right-0' : 'left-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 mb-1 text-[10px] font-mono uppercase tracking-wider text-[#A1AEC0] border-b border-[#1E2B3E]">
            {isCustom ? 'Custom Artwork' : 'Card Artwork'}
          </div>

          <button
            type="button"
            onClick={handleOpenPicker}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#F2EEE6] hover:text-[#E8AE62] hover:bg-[#192434] rounded-lg transition-colors text-left"
          >
            <Upload className="w-3.5 h-3.5 text-[#E8AE62]" />
            <span>Upload New Image</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPicker}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#F2EEE6] hover:text-[#E8AE62] hover:bg-[#192434] rounded-lg transition-colors text-left"
          >
            <Layers className="w-3.5 h-3.5 text-[#E8AE62]" />
            <span>Choose from Library</span>
          </button>

          {isCustom && (
            <>
              {/* Focal Point Submenu Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFocalMenuOpen(!focalMenuOpen);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#F2EEE6] hover:text-[#E8AE62] hover:bg-[#192434] rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-[#A1AEC0]" />
                    <span>Adjust Crop / Focus</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#E8AE62] capitalize">
                    {customInfo.focalPoint}
                  </span>
                </button>

                {focalMenuOpen && (
                  <div className="my-1 p-1 bg-[#0B1018] border border-[#1E2B3E] rounded-lg space-y-0.5">
                    {focalOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={(e) => handleSetFocalPoint(e, opt.id)}
                        className={`w-full flex items-center justify-between px-2 py-1 text-[11px] rounded transition-colors ${
                          customInfo.focalPoint === opt.id
                            ? 'bg-[#192434] text-[#E8AE62] font-semibold'
                            : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {customInfo.focalPoint === opt.id && <Check className="w-3 h-3 text-[#E8AE62]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#1E2B3E] my-1" />

              <button
                type="button"
                onClick={handleRestore}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors text-left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Artwork</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
