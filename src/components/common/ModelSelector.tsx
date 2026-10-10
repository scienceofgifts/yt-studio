import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAmbience } from '../../context/AmbienceContext';
import {
  VERIFIED_MODELS_LIST,
  STUDIO_TASKS,
  SupportedGeminiModelId,
  StudioTaskType,
  getModelInfo,
  resolveModelForTask,
  ModelCapabilityInfo,
} from '../../data/modelRegistry';
import {
  Sparkles,
  ChevronDown,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Cpu,
  Eye,
  Film,
  Music,
  Lightbulb,
  BarChart3,
  Camera,
  Youtube,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';

interface PopoverPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  maxHeight: number;
  width?: number | string;
  isMobile: boolean;
  alignAbove: boolean;
}

/**
 * Calculates accurate viewport-relative coordinates for popovers.
 * Evaluates available space above and below the trigger element to guarantee
 * the menu remains 100% visible and accessible inside the viewport.
 */
function calculatePopoverPosition(
  triggerEl: HTMLElement | null,
  preferredWidth: number = 420,
  preferredMaxHeight: number = 620
): PopoverPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < 640;
  const margin = 12; // Safety padding from screen edges

  if (!triggerEl) {
    return {
      top: 60,
      left: margin,
      right: margin,
      maxHeight: Math.min(preferredMaxHeight, viewportHeight - 80),
      isMobile,
      alignAbove: false,
    };
  }

  const rect = triggerEl.getBoundingClientRect();

  // Space below and above the trigger element (accounting for 6px gap and margin)
  const spaceBelow = Math.max(0, viewportHeight - rect.bottom - margin - 6);
  const spaceAbove = Math.max(0, rect.top - margin - 6);

  // We prefer opening BELOW the trigger.
  // We ONLY open ABOVE if space below is tight (< 200px) AND space above is strictly greater than space below AND space above is at least 180px.
  const alignAbove = spaceBelow < 200 && spaceAbove > spaceBelow && spaceAbove >= 180;

  if (isMobile) {
    if (alignAbove) {
      // Open above trigger on mobile
      const bottomPos = Math.max(margin, viewportHeight - rect.top + 6);
      const availableHeight = Math.max(120, viewportHeight - bottomPos - margin);
      return {
        bottom: bottomPos,
        left: margin,
        right: margin,
        maxHeight: Math.min(preferredMaxHeight, availableHeight),
        isMobile: true,
        alignAbove: true,
      };
    } else {
      // Open below trigger on mobile
      const topPos = Math.max(margin, Math.min(rect.bottom + 6, viewportHeight - margin - 120));
      const availableHeight = Math.max(120, viewportHeight - topPos - margin);
      return {
        top: topPos,
        left: margin,
        right: margin,
        maxHeight: Math.min(preferredMaxHeight, availableHeight),
        isMobile: true,
        alignAbove: false,
      };
    }
  } else {
    // Desktop / Tablet (>= 640px)
    const actualWidth = Math.min(preferredWidth, viewportWidth - margin * 2);
    const triggerRightOffset = viewportWidth - rect.right;
    // Align with trigger's right edge, constrained to stay within screen boundaries
    const rightPos = Math.max(margin, Math.min(triggerRightOffset, viewportWidth - actualWidth - margin));

    if (alignAbove) {
      const bottomPos = Math.max(margin, viewportHeight - rect.top + 6);
      const availableHeight = Math.max(120, viewportHeight - bottomPos - margin);
      return {
        bottom: bottomPos,
        right: rightPos,
        width: actualWidth,
        maxHeight: Math.min(preferredMaxHeight, availableHeight),
        isMobile: false,
        alignAbove: true,
      };
    } else {
      const topPos = Math.max(margin, Math.min(rect.bottom + 6, viewportHeight - margin - 120));
      const availableHeight = Math.max(120, viewportHeight - topPos - margin);
      return {
        top: topPos,
        right: rightPos,
        width: actualWidth,
        maxHeight: Math.min(preferredMaxHeight, availableHeight),
        isMobile: false,
        alignAbove: false,
      };
    }
  }
}

interface GlobalModelSelectorProps {
  className?: string;
}

export const GlobalModelSelector: React.FC<GlobalModelSelectorProps> = ({ className = '' }) => {
  const {
    modelConfig,
    setGlobalModel,
    setTaskOverride,
    resetTaskOverride,
    resetAllOverrides,
  } = useAmbience();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'tasks' | 'info'>('global');
  const [inspectedModelId, setInspectedModelId] = useState<SupportedGeminiModelId>(
    modelConfig.globalModelId || 'gemini-3.5-flash-lite'
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPosition | null>(null);

  // Recalculate popover position on open, window resize, or scroll
  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      if (triggerRef.current) {
        setPopoverPos(calculatePopoverPosition(triggerRef.current, 420, 620));
      }
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Handle click outside and Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      const inTrigger = triggerRef.current && triggerRef.current.contains(target);
      const inMenu = menuRef.current && menuRef.current.contains(target);

      if (!inTrigger && !inMenu) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentGlobalInfo = getModelInfo(modelConfig.globalModelId);
  const inspectedInfo = getModelInfo(inspectedModelId);

  // Count active overrides
  const overrideCount = Object.keys(modelConfig.taskOverrides).filter(
    (k) => modelConfig.taskOverrides[k as StudioTaskType] && modelConfig.taskOverrides[k as StudioTaskType] !== modelConfig.globalModelId
  ).length;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen && triggerRef.current) {
            setPopoverPos(calculatePopoverPosition(triggerRef.current, 420, 620));
          }
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs min-h-[38px] sm:min-h-0 ${
          isOpen
            ? 'bg-[#192434] text-[#E8AE62] border-[#E8AE62]/50 ring-1 ring-[#E8AE62]/30'
            : 'bg-[#101722] hover:bg-[#151F2E] text-[#F2EEE6] border-[#1E2B3E] hover:border-[#283952]'
        }`}
        title="Select AI Model and configure task overrides"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#E8AE62]" />
          <span className="font-semibold tracking-tight text-[#F2EEE6]">
            {currentGlobalInfo.displayName}
          </span>
          {overrideCount > 0 && (
            <span
              className="px-1.5 py-0.2 text-[10px] bg-[#E8AE62]/15 text-[#E8AE62] border border-[#E8AE62]/30 rounded-full font-mono"
              title={`${overrideCount} task overrides active`}
            >
              +{overrideCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#A1AEC0] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#E8AE62]' : ''
          }`}
        />
      </button>

      {/* Render Popover Portal into document.body to break out of containing block / backdrop-blur traps */}
      {isOpen &&
        popoverPos &&
        createPortal(
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto animate-in fade-in duration-150"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Popover Menu Container */}
            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                top: popoverPos.top !== undefined ? `${popoverPos.top}px` : undefined,
                bottom: popoverPos.bottom !== undefined ? `${popoverPos.bottom}px` : undefined,
                left: popoverPos.left !== undefined ? `${popoverPos.left}px` : undefined,
                right: popoverPos.right !== undefined ? `${popoverPos.right}px` : undefined,
                maxHeight: `${popoverPos.maxHeight}px`,
                width: typeof popoverPos.width === 'number' ? `${popoverPos.width}px` : popoverPos.width,
              }}
              className="pointer-events-auto bg-[#0E1520] border border-[#1E2B3E] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 z-[10000]"
            >
              {/* Header */}
              <div className="p-3.5 bg-[#141C28] border-b border-[#1E2B3E] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#E8AE62]/10 border border-[#E8AE62]/20 rounded-lg text-[#E8AE62]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F2EEE6] font-display">
                      Gemini Model Routing
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#A1AEC0]">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Server Proxy</span>
                      <span className="opacity-40">•</span>
                      <span>Local Preferences</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#1E2B3E] rounded-xl transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#1E2B3E] bg-[#0B1018] p-1 gap-1 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('global')}
                  className={`flex-1 py-2 sm:py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-0 ${
                    activeTab === 'global'
                      ? 'bg-[#192434] text-[#E8AE62] shadow-xs border border-[#283952]'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141C28]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Global Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 py-2 sm:py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-0 ${
                    activeTab === 'tasks'
                      ? 'bg-[#192434] text-[#E8AE62] shadow-xs border border-[#283952]'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141C28]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Task Overrides</span>
                  {overrideCount > 0 && (
                    <span className="text-[10px] bg-[#E8AE62]/20 text-[#E8AE62] px-1.5 py-0.2 rounded-full font-mono">
                      {overrideCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2 sm:py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-0 ${
                    activeTab === 'info'
                      ? 'bg-[#192434] text-[#E8AE62] shadow-xs border border-[#283952]'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#141C28]'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Model Info</span>
                </button>
              </div>

              {/* Body Content */}
              <div className="p-3.5 overflow-y-auto space-y-3 flex-1 text-xs">
                {/* TAB 1: GLOBAL MODEL SELECTOR */}
                {activeTab === 'global' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#A1AEC0] px-1">
                      <span>Choose studio-wide default engine:</span>
                      <span className="font-mono text-[#E8AE62] text-[10px]">
                        Current: {currentGlobalInfo.displayName}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {VERIFIED_MODELS_LIST.map((model) => {
                        const isSelected = modelConfig.globalModelId === model.id;
                        return (
                          <div
                            key={model.id}
                            onClick={() => {
                              setGlobalModel(model.id);
                              setInspectedModelId(model.id);
                              setIsOpen(false);
                            }}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#192434] border-[#E8AE62] ring-1 ring-[#E8AE62]/30 shadow-sm'
                                : 'bg-[#101722] hover:bg-[#151F2E] border-[#1E2B3E] hover:border-[#283952]'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className={`font-semibold text-xs tracking-tight ${
                                    isSelected ? 'text-[#E8AE62]' : 'text-[#F2EEE6]'
                                  }`}
                                >
                                  {model.displayName}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#1E2B3E] text-[#A1AEC0] font-mono">
                                  {model.family}
                                </span>
                                {model.isDefault && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                                    Studio Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#A1AEC0] line-clamp-1 leading-relaxed">
                                {model.tagline}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-[10px] text-[#A1AEC0]/70 font-mono">
                                <span>ID: {model.id}</span>
                                <span>•</span>
                                <span>{model.contextWindow}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectedModelId(model.id);
                                  setActiveTab('info');
                                }}
                                className="p-1 text-[#A1AEC0] hover:text-[#E8AE62] transition-colors rounded-md"
                                title="Inspect model capabilities"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-[#E8AE62] border-[#E8AE62] text-[#0B1018]'
                                    : 'border-[#283952]'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#1E2B3E] flex items-center justify-between text-[11px] text-[#A1AEC0]">
                      <span>Default for new installations: <strong>3.5 Light</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setGlobalModel('gemini-3.5-flash-lite');
                          setInspectedModelId('gemini-3.5-flash-lite');
                        }}
                        className="text-[#E8AE62] hover:underline text-[10px] font-medium"
                      >
                        Reset to 3.5 Light
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: TASK-SPECIFIC OVERRIDES */}
                {activeTab === 'tasks' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#A1AEC0] px-1">
                      <span>Override models for specific studio workflows:</span>
                      {overrideCount > 0 && (
                        <button
                          type="button"
                          onClick={resetAllOverrides}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[10px] font-medium transition-colors"
                          title="Reset all task overrides to inherit the global model"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset All</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {STUDIO_TASKS.map((task) => {
                        const activeModelInfo = resolveModelForTask(modelConfig, task.id);
                        const isOverridden = activeModelInfo.isOverride;

                        return (
                          <div
                            key={task.id}
                            className={`p-2.5 rounded-xl border transition-all ${
                              isOverridden
                                ? 'bg-[#192434]/70 border-[#E8AE62]/40'
                                : 'bg-[#101722] border-[#1E2B3E]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs text-[#F2EEE6]">
                                  {task.label}
                                </span>
                                <span className="text-[10px] text-[#A1AEC0]/60 font-mono">
                                  ({task.shortLabel})
                                </span>
                              </div>
                              {isOverridden ? (
                                <span className="text-[10px] bg-[#E8AE62]/20 text-[#E8AE62] px-1.5 py-0.2 rounded-md font-mono">
                                  Overridden
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#A1AEC0]/60 font-mono">
                                  Inherits Global
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-[#A1AEC0] mb-2 line-clamp-1">
                              {task.description}
                            </p>

                            <div className="flex items-center gap-2">
                              <select
                                value={
                                  modelConfig.taskOverrides[task.id] || 'inherit'
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'inherit') {
                                    resetTaskOverride(task.id);
                                  } else {
                                    setTaskOverride(task.id, val as SupportedGeminiModelId);
                                  }
                                }}
                                className={`flex-1 py-1 px-2 text-xs rounded-lg border bg-[#0B1018] focus:outline-none transition-colors ${
                                  isOverridden
                                    ? 'border-[#E8AE62]/60 text-[#E8AE62]'
                                    : 'border-[#1E2B3E] text-[#F2EEE6]'
                                }`}
                              >
                                <option value="inherit">
                                  Inherit Global ({currentGlobalInfo.displayName})
                                </option>
                                <optgroup label="Available Overrides">
                                  {VERIFIED_MODELS_LIST.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.displayName} ({m.family})
                                    </option>
                                  ))}
                                </optgroup>
                              </select>

                              {isOverridden && (
                                <button
                                  type="button"
                                  onClick={() => resetTaskOverride(task.id)}
                                  className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] bg-[#0B1018] border border-[#1E2B3E] hover:border-[#283952] rounded-lg transition-colors"
                                  title="Reset this task to inherit global model"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: MODEL INFORMATION PANEL */}
                {activeTab === 'info' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#A1AEC0]">
                      <span>Model Architecture & Capabilities</span>
                      <select
                        value={inspectedModelId}
                        onChange={(e) => setInspectedModelId(e.target.value as SupportedGeminiModelId)}
                        className="py-1 px-2 text-xs rounded-lg border border-[#1E2B3E] bg-[#0B1018] text-[#E8AE62]"
                      >
                        {VERIFIED_MODELS_LIST.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-[#141C28] border border-[#1E2B3E] rounded-xl space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-semibold text-sm text-[#F2EEE6] flex items-center gap-2">
                            {inspectedInfo.displayName}
                            {inspectedInfo.id === modelConfig.globalModelId && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8AE62]/20 text-[#E8AE62] border border-[#E8AE62]/30">
                                Global Default
                              </span>
                            )}
                          </h5>
                          <span className="text-[10px] text-[#A1AEC0] font-mono">
                            Model ID: {inspectedInfo.id} • {inspectedInfo.generation}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                          {inspectedInfo.status === 'verified' ? 'Verified Backend' : 'Preview'}
                        </span>
                      </div>

                      <p className="text-xs text-[#A1AEC0] leading-relaxed">
                        {inspectedInfo.description}
                      </p>

                      {/* Capabilities Matrix */}
                      <div className="space-y-1.5 pt-2 border-t border-[#1E2B3E]">
                        <span className="text-[11px] font-medium text-[#F2EEE6] block">
                          Supported Capabilities
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E] flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[#F2EEE6]">Text Generation</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E] flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[#F2EEE6]">Vision Analysis</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E] flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[#F2EEE6]">Video Lab Understanding</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E] flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[#F2EEE6]">Structured JSON</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E] flex items-center gap-1.5">
                            {inspectedInfo.capabilities.audioPerception ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <span className="text-[#A1AEC0]/40 font-mono">—</span>
                            )}
                            <span className="text-[#F2EEE6]">Acoustic Foley Reasoning</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E] flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-[#E8AE62]" />
                            <span className="text-[#F2EEE6]">{inspectedInfo.contextWindow} Window</span>
                          </div>
                        </div>
                      </div>

                      {/* Best For */}
                      <div className="pt-2 border-t border-[#1E2B3E]">
                        <span className="text-[11px] font-medium text-[#F2EEE6] block mb-1">
                          Recommended Studio Tasks
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {inspectedInfo.bestFor.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] text-[10px] text-[#A1AEC0]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-[11px] text-[#A1AEC0] flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#E8AE62] shrink-0 mt-0.5" />
                      <p>
                        All Gemini API requests are safely routed through your server or Cloudflare Worker with <code className="text-[#E8AE62] font-mono">GEMINI_API_KEY</code> stored server-side.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Notice */}
              <div className="p-2.5 bg-[#0B1018] border-t border-[#1E2B3E] text-[10px] text-[#A1AEC0]/70 flex items-center justify-between shrink-0">
                <span>Stored in local browser preferences</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-[#E8AE62] hover:text-[#F2EEE6] font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

interface TaskModelBadgeSelectorProps {
  task: StudioTaskType;
  className?: string;
  compact?: boolean;
}

export const TaskModelBadgeSelector: React.FC<TaskModelBadgeSelectorProps> = ({
  task,
  className = '',
  compact = false,
}) => {
  const {
    modelConfig,
    setTaskOverride,
    resetTaskOverride,
    getTaskActiveModel,
  } = useAmbience();

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPosition | null>(null);

  const activeModel = getTaskActiveModel(task);
  const currentGlobalInfo = getModelInfo(modelConfig.globalModelId);
  const taskDef = STUDIO_TASKS.find((t) => t.id === task);

  // Recalculate popover position on open, window resize, or scroll
  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      if (triggerRef.current) {
        setPopoverPos(calculatePopoverPosition(triggerRef.current, 320, 500));
      }
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Handle click outside and Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      const inTrigger = triggerRef.current && triggerRef.current.contains(target);
      const inMenu = menuRef.current && menuRef.current.contains(target);

      if (!inTrigger && !inMenu) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen && triggerRef.current) {
            setPopoverPos(calculatePopoverPosition(triggerRef.current, 320, 500));
          }
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-lg border text-xs font-medium transition-all ${
          activeModel.isOverride
            ? 'bg-[#192434] text-[#E8AE62] border-[#E8AE62]/50 hover:bg-[#223146]'
            : 'bg-[#101722] text-[#A1AEC0] hover:text-[#F2EEE6] border-[#1E2B3E] hover:border-[#283952]'
        }`}
        title={`Model for ${taskDef?.label || task}: ${activeModel.displayName} (${
          activeModel.isOverride ? 'Task Override' : 'Inheriting Global'
        })`}
      >
        <Cpu className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-[#E8AE62]" />
        {!compact && (
          <span className="text-[10px] text-[#A1AEC0] uppercase font-mono tracking-wider">
            Model:
          </span>
        )}
        <span className="font-semibold text-[#F2EEE6]">{activeModel.displayName}</span>
        {activeModel.isOverride ? (
          <span className="text-[9px] px-1 py-0.2 bg-[#E8AE62]/20 text-[#E8AE62] rounded font-mono">
            Override
          </span>
        ) : (
          <span className="text-[9px] text-[#A1AEC0]/60 font-mono">Global</span>
        )}
        <ChevronDown className="w-3 h-3 text-[#A1AEC0]" />
      </button>

      {/* Render Popover Portal into document.body */}
      {isOpen &&
        popoverPos &&
        createPortal(
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto animate-in fade-in duration-100"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                top: popoverPos.top !== undefined ? `${popoverPos.top}px` : undefined,
                bottom: popoverPos.bottom !== undefined ? `${popoverPos.bottom}px` : undefined,
                left: popoverPos.left !== undefined ? `${popoverPos.left}px` : undefined,
                right: popoverPos.right !== undefined ? `${popoverPos.right}px` : undefined,
                maxHeight: `${popoverPos.maxHeight}px`,
                width: typeof popoverPos.width === 'number' ? `${popoverPos.width}px` : popoverPos.width,
              }}
              className="pointer-events-auto bg-[#0E1520] border border-[#1E2B3E] rounded-2xl shadow-2xl p-3 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-100 overflow-y-auto z-[10000]"
            >
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-[#1E2B3E]">
                <span className="font-semibold text-xs text-[#F2EEE6]">
                  {taskDef?.shortLabel || 'Task'} Model Routing
                </span>
                <div className="flex items-center gap-2">
                  {activeModel.isOverride && (
                    <button
                      type="button"
                      onClick={() => {
                        resetTaskOverride(task);
                        setIsOpen(false);
                      }}
                      className="text-[10px] text-[#E8AE62] hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#A1AEC0] hover:text-[#F2EEE6] rounded-lg"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 overflow-y-auto">
                {/* Option: Inherit Global */}
                <button
                  type="button"
                  onClick={() => {
                    resetTaskOverride(task);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    !activeModel.isOverride
                      ? 'bg-[#192434] text-[#E8AE62] font-semibold'
                      : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                  }`}
                >
                  <div>
                    <span className="block text-xs">
                      Inherit Global ({currentGlobalInfo.displayName})
                    </span>
                    <span className="block text-[10px] text-[#A1AEC0]/70">
                      Follows application header default
                    </span>
                  </div>
                  {!activeModel.isOverride && <Check className="w-3.5 h-3.5 text-[#E8AE62]" />}
                </button>

                {/* Overrides List */}
                <div className="pt-1 border-t border-[#1E2B3E]/60 text-[10px] text-[#A1AEC0]/60 font-mono px-1">
                  Task Overrides:
                </div>

                {VERIFIED_MODELS_LIST.map((m) => {
                  const isCurrent =
                    modelConfig.taskOverrides[task] === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setTaskOverride(task, m.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-[#192434] text-[#E8AE62] font-semibold'
                          : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                      }`}
                    >
                      <div>
                        <span className="block text-xs text-[#F2EEE6]">{m.displayName}</span>
                        <span className="block text-[10px] text-[#A1AEC0]/70 font-mono">
                          {m.family} • {m.contextWindow}
                        </span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#E8AE62]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
