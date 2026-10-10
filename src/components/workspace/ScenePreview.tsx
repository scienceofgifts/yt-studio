import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { WORLDS_CATALOG, LOCATIONS_CATALOG } from '../../data/catalog';
import { WorldVisual } from '../../data/worldVisuals';
import { VisualArtwork } from '../common/VisualArtwork';
import {
  Maximize2,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Camera,
  Lock,
  Layers,
  Sliders,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export const ScenePreview: React.FC = () => {
  const {
    config,
    drafts,
    setWorkflowStage,
    showToast,
    generateAiPrompts,
    isGeneratingPrompts,
    generationTarget,
    selectedAiReferenceAssetId,
  } = useAmbience();
  const [copied, setCopied] = useState(false);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [showRefModal, setShowRefModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'canvas' | 'reference'>('canvas');
  const [inputUrl, setInputUrl] = useState('');

  const world = WORLDS_CATALOG.find((w) => w.id === config.worldId);
  const location = LOCATIONS_CATALOG.find((l) => l.id === config.locationId);

  const worldName =
    config.worldId === 'custom-world' && config.customWorldName
      ? config.customWorldName
      : world?.name || 'Sanctuary';

  const locationName = config.customLocation || location?.name || 'Location';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(drafts.imagePrompt);
    setCopied(true);
    showToast('Copied Image generation prompt to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setReferenceUrl(inputUrl.trim());
      setActiveTab('reference');
      setShowRefModal(false);
      showToast('Custom reference moodboard image attached');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReferenceUrl(event.target.result as string);
          setActiveTab('reference');
          setShowRefModal(false);
          showToast('Attached local reference artwork');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Atmospheric color tone adjustments based on lighting & time
  const getTimeLightingOverlay = () => {
    if (config.timeOfDay === 'sunset' || config.timeOfDay === 'golden-hour') {
      return 'bg-amber-950/20 mix-blend-color-burn';
    }
    if (config.timeOfDay === 'midnight' || config.timeOfDay === 'night') {
      return 'bg-blue-950/25 mix-blend-multiply';
    }
    if (config.timeOfDay === 'dawn') {
      return 'bg-rose-950/20 mix-blend-screen';
    }
    return '';
  };

  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden border border-[#1E2B3E] bg-[#0E1520] shadow-2xl transition-all">
      {/* Top Film Slate Bar */}
      <div className="px-4 py-2.5 bg-[#101722]/90 border-b border-[#1E2B3E] flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-[#F2EEE6] tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AE62]" />
            <span className="font-display tracking-wider uppercase text-[11px]">Cinematic Moodboard</span>
            <span className="text-[#A1AEC0] font-normal">·</span>
            <span className="text-[#E8AE62] font-medium">{worldName}</span>
          </div>

          <span className="text-[#A1AEC0] hidden sm:inline">/</span>
          <span className="text-[#A1AEC0] hidden sm:inline text-[11px]">{locationName}</span>
        </div>

        {/* Toolbar & Aspect Ratio */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0B1018] p-0.5 rounded-lg border border-[#1E2B3E]">
            <button
              type="button"
              onClick={() => setActiveTab('canvas')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === 'canvas'
                  ? 'bg-[#192434] text-[#E8AE62] shadow-xs'
                  : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              Atmospheric Canvas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reference')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === 'reference'
                  ? 'bg-[#192434] text-[#E8AE62] shadow-xs'
                  : 'text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              Reference Image {referenceUrl && '•'}
            </button>
          </div>

          <span className="px-2 py-0.5 rounded bg-[#151F2E] text-[10px] font-mono text-[#A1AEC0] border border-[#1E2B3E] hidden md:inline">
            {config.visualStyle.aspectRatio}
          </span>
        </div>
      </div>

      {/* Main Cinematic Visual Area (16:9 ratio) */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[380px] bg-[#070B10] flex items-center justify-center overflow-hidden group">
        {activeTab === 'canvas' ? (
          <div className="w-full h-full relative">
            {/* Base World Archetype Vector Canvas or Custom Artwork */}
            <VisualArtwork
              targetKey={`scene-preview:${config.worldId}:${config.locationId}`}
              targetLabel={`${worldName} - ${locationName}`}
              fallbackTargetKey={`world:${config.worldId}`}
              defaultVisual={<WorldVisual worldId={config.worldId} className="w-full h-full object-cover" />}
              showControls={true}
              alignControls="top-right"
            />

            {/* Ambient Lighting & Time Tint Scrim */}
            <div className={`absolute inset-0 pointer-events-none ${getTimeLightingOverlay()}`} />

            {/* Weather Overlay Details */}
            {(config.primaryWeather === 'rain' ||
              config.primaryWeather === 'heavy-rain' ||
              config.primaryWeather === 'drizzle' ||
              config.primaryWeather === 'thunderstorm') && (
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(105deg, transparent, transparent 15px, rgba(160, 210, 240, 0.4) 16px, transparent 18px)',
                  backgroundSize: '120px 100%',
                }}
              />
            )}

            {/* Mist / Fog Scrim */}
            {(config.primaryWeather === 'fog' || config.primaryWeather === 'mist') && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-400/20 via-slate-500/10 to-transparent" />
            )}

            {/* Cinematic Letterbox Gradient Scrim */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0B1018] via-transparent to-black/20" />

            {/* Active Composition Metadata Pill Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 pointer-events-auto">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-[#F2EEE6]">
                  <span className="px-2 py-0.5 rounded bg-[#101722]/80 backdrop-blur-md border border-[#1E2B3E] text-[11px] text-[#E8AE62]">
                    {config.season.toUpperCase()} · {config.timeOfDay.toUpperCase().replace('-', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#101722]/80 backdrop-blur-md border border-[#1E2B3E] text-[11px] text-[#F2EEE6]">
                    {config.primaryWeather.replace('-', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#101722]/80 backdrop-blur-md border border-[#1E2B3E] text-[11px] text-[#A1AEC0] flex items-center gap-1">
                    <Camera className="w-3 h-3 text-[#E8AE62]" />
                    {config.camera.angle}
                    {config.camera.lockedCamera && <Lock className="w-2.5 h-2.5 text-[#E8AE62] ml-0.5" />}
                  </span>
                </div>
                <div className="text-[11px] text-[#A1AEC0] bg-[#0B1018]/60 backdrop-blur-xs px-2 py-0.5 rounded inline-block max-w-xl truncate">
                  {config.lighting.primary.replace('-', ' ')} lighting · {config.visualStyle.style.replace('-', ' ')}
                </div>
              </div>

              {/* Action Buttons on Canvas */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefModal(true)}
                  className="px-3 py-1.5 text-xs font-medium text-[#F2EEE6] bg-[#192434]/80 hover:bg-[#223146] border border-[#283952] rounded-lg backdrop-blur-md transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E8AE62]" />
                  Attach Reference
                </button>

                <button
                  type="button"
                  disabled={isGeneratingPrompts}
                  onClick={() => generateAiPrompts('image')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#F2EEE6] bg-[#192434] hover:bg-[#223146] border border-[#E8AE62]/50 hover:border-[#E8AE62] rounded-lg transition-all flex items-center gap-1.5"
                  title="Generate image prompt with Gemini 3.8 Flash"
                >
                  {isGeneratingPrompts && (generationTarget === 'image' || generationTarget === 'all') ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E8AE62]" />
                      <span>Writing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#E8AE62]" />
                      <span>AI Prompt</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Prompt' : 'Copy Prompt'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Reference Image View */
          <div className="w-full h-full relative flex items-center justify-center">
            {referenceUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={referenceUrl}
                  alt="Creative Reference Artwork"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1018]/90 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs text-[#F2EEE6] font-medium bg-[#101722]/80 backdrop-blur-md px-2.5 py-1 rounded border border-[#1E2B3E]">
                    User Reference Moodboard
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRefModal(true)}
                    className="px-3 py-1.5 text-xs text-[#F2EEE6] bg-[#192434]/90 hover:bg-[#223146] rounded-lg border border-[#283952] transition-colors"
                  >
                    Change Reference
                  </button>
                </div>
              </div>
            ) : (
              /* Intentional Empty State */
              <div className="p-8 text-center max-w-md">
                <div className="w-12 h-12 rounded-xl bg-[#192434] border border-[#283952] flex items-center justify-center mx-auto mb-3 text-[#E8AE62]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                  No Reference Image Attached Yet
                </h4>
                <p className="text-xs text-[#A1AEC0] mb-4 leading-relaxed">
                  Attach a reference photo or artwork from your hard drive or web URL to ground your scene in visual style.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRefModal(true)}
                    className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload / Attach Artwork
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('canvas')}
                    className="px-3 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#192434] rounded-lg border border-[#1E2B3E]"
                  >
                    View Canvas Mood
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reference Modal */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
              Attach Reference Artwork
            </h3>
            <p className="text-xs text-[#A1AEC0] mb-4">
              Add a moodboard inspiration image to guide prompt creation and visual styling.
            </p>

            <form onSubmit={handleSetReference} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/artwork.jpg"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
                />
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#1E2B3E] w-full" />
                <span className="bg-[#101722] px-2 text-[10px] text-[#A1AEC0] uppercase tracking-wider absolute">
                  or upload file
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                  Upload from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-[#A1AEC0] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#192434] file:text-[#E8AE62] hover:file:bg-[#223146] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="px-3 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg transition-colors"
                >
                  Apply Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
