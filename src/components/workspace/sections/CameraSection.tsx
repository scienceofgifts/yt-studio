import React from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import {
  CAMERA_ANGLES,
  COMPOSITION_TYPES,
  CAMERA_MOVEMENTS,
} from '../../../data/catalog';
import { CameraAngle, CompositionType, CameraMovement } from '../../../types/ambience';
import {
  Camera,
  Lock,
  Compass,
  AlertTriangle,
  Check,
  Video,
  RotateCcw,
} from 'lucide-react';

export const CameraSection: React.FC = () => {
  const { config, updateConfig, toggleLockedCamera, conflicts, resolveConflict, resetSection } = useAmbience();
  const { camera } = config;

  const cameraConflict = conflicts.find((c) => c.section === 'Camera');

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Camera className="w-4 h-4 text-[#E8AE62]" />
            9. Camera Perspective & Composition
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Configure camera angle, framing geometry, and locked stationary tripod stability
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Master Locked Camera Mode */}
          <label className="flex items-center gap-2.5 cursor-pointer bg-[#0B1018] border border-[#E8AE62]/60 px-3.5 py-1.5 rounded-xl shadow-xs">
            <Lock className="w-4 h-4 text-[#E8AE62] shrink-0" />
            <span className="text-xs font-semibold text-[#E8AE62]">
              Locked Tripod:
            </span>
            <input
              type="checkbox"
              checked={camera.lockedCamera}
              onChange={(e) => toggleLockedCamera(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                camera.lockedCamera ? 'bg-[#E8AE62] justify-end' : 'bg-[#1E2B3E] justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#0B1018] shadow-xs"></span>
            </span>
            <span className={`text-xs font-mono font-bold ${camera.lockedCamera ? 'text-[#E8AE62]' : 'text-[#A1AEC0]'}`}>
              {camera.lockedCamera ? 'LOCKED' : 'FREE'}
            </span>
          </label>

          <button
            type="button"
            onClick={() => resetSection('camera')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Conflict notice if Camera Movement contradicts Locked Camera */}
      {cameraConflict && (
        <div className="mb-5 p-3.5 bg-amber-950/30 border border-[#E8AE62]/50 rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#E8AE62] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#E8AE62]">{cameraConflict.title}</div>
              <div className="text-[11px] text-[#F2EEE6]/80 mt-0.5">{cameraConflict.message}</div>
            </div>
          </div>
          {cameraConflict.resolve && (
            <button
              type="button"
              onClick={() => resolveConflict(cameraConflict)}
              className="px-3 py-1 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg transition-colors whitespace-nowrap"
            >
              {cameraConflict.resolveActionLabel || 'Lock Movement'}
            </button>
          )}
        </div>
      )}

      {/* Camera Angle & Composition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
            Camera Angle & Shot Type
          </label>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {CAMERA_ANGLES.map((angle) => {
              const isSelected = camera.angle === angle.id;

              return (
                <button
                  key={angle.id}
                  type="button"
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      camera: { ...prev.camera, angle: angle.id as CameraAngle },
                    }))
                  }
                  className={`w-full p-2.5 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                  }`}
                >
                  <span>{angle.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
            Composition & Focal Layout
          </label>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {COMPOSITION_TYPES.map((comp) => {
              const isSelected = camera.composition === comp.id;

              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() =>
                    updateConfig((prev) => ({
                      ...prev,
                      camera: { ...prev.camera, composition: comp.id as CompositionType },
                    }))
                  }
                  className={`w-full p-2.5 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                  }`}
                >
                  <span>{comp.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Camera Movement Selection */}
      <div className="pt-4 border-t border-[#1E2B3E]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#F2EEE6] flex items-center gap-1.5 font-mono">
            <Video className="w-3.5 h-3.5 text-[#E8AE62]" />
            Camera Movement Dynamics
          </label>
          {camera.lockedCamera && (
            <span className="text-[11px] text-[#E8AE62] font-medium font-mono">
              Locked camera mode enforced
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {CAMERA_MOVEMENTS.map((mov) => {
            const isSelected = camera.movement === mov.id;

            return (
              <button
                key={mov.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    camera: {
                      ...prev.camera,
                      movement: mov.id as CameraMovement,
                      lockedCamera: mov.id === 'locked',
                    },
                    video: {
                      ...prev.video,
                      lockedCamera: mov.id === 'locked',
                    },
                  }))
                }
                className={`p-2.5 rounded-xl border text-xs text-left transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                    : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                }`}
              >
                <span className="truncate">{mov.name}</span>
                {isSelected && <Check className="w-3 h-3 text-[#E8AE62] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Independent Stability Toggles */}
      <div className="pt-5 mt-5 border-t border-[#1E2B3E]">
        <label className="block text-xs font-semibold text-[#F2EEE6] mb-3 font-mono">
          Stability Guarantees
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: 'preserveComposition', label: 'Preserve Composition Geometry' },
            { key: 'avoidFocusChanges', label: 'Avoid Focal Length & Zoom Drift' },
            { key: 'avoidPerspectiveChanges', label: 'Avoid Perspective Morphs' },
            { key: 'avoidCinematicTransitions', label: 'Prohibit Hard Cuts & Transitions' },
          ].map((item) => {
            const isChecked = camera[item.key as keyof typeof camera] as boolean;

            return (
              <label
                key={item.key}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] cursor-pointer hover:border-[#283952] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      camera: {
                        ...prev.camera,
                        [item.key]: e.target.checked,
                      },
                    }))
                  }
                  className="rounded bg-[#101722] border-[#1E2B3E] text-[#E8AE62] focus:ring-0"
                />
                <span className="text-[11px] text-[#F2EEE6] leading-tight">{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
};
