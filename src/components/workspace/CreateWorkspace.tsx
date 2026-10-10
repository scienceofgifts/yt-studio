import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { ScenePreview } from './ScenePreview';
import { WorldSection } from './sections/WorldSection';
import { LocationSection } from './sections/LocationSection';
import { SeasonTimeSection } from './sections/SeasonTimeSection';
import { WeatherSection } from './sections/WeatherSection';
import { SkySection } from './sections/SkySection';
import { WaterSection } from './sections/WaterSection';
import { LightingSection } from './sections/LightingSection';
import { ElementsSection } from './sections/ElementsSection';
import { CameraSection } from './sections/CameraSection';
import { VisualStyleSection } from './sections/VisualStyleSection';
import { VideoWorkspace } from './VideoWorkspace';
import { MusicWorkspace } from './MusicWorkspace';
import { PromptWorkbench } from './PromptWorkbench';
import {
  ListFilter,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const CreateWorkspace: React.FC = () => {
  const { workflowStage, setWorkflowStage } = useAmbience();
  const [continuousScroll, setContinuousScroll] = useState(false);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Prominent Cinematic Landscape Scene Preview */}
      <ScenePreview />

      {/* Mode Switcher toolbar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="text-xs text-[#A1AEC0] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8AE62]" />
          <span>
            {continuousScroll
              ? 'Continuous Workspace: All creative sections visible'
              : `Workflow Step: ${workflowStage.toUpperCase()}`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setContinuousScroll(!continuousScroll)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            continuousScroll
              ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62]'
              : 'bg-[#101722] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          {continuousScroll ? 'Switch to Step-by-Step' : 'Show All 10 Sections'}
        </button>
      </div>

      {continuousScroll ? (
        /* Continuous Mode: All Sections in Sequence */
        <div>
          <WorldSection />
          <LocationSection />
          <SeasonTimeSection />
          <WeatherSection />
          <SkySection />
          <WaterSection />
          <LightingSection />
          <ElementsSection />
          <CameraSection />
          <VisualStyleSection />
        </div>
      ) : (
        /* Stage-Driven View */
        <div>
          {workflowStage === 'concept' && (
            <div>
              <WorldSection />
              <LocationSection />
              <SeasonTimeSection />
              <WeatherSection />
              <SkySection />

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setWorkflowStage('refine')}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
                >
                  Proceed to Refine Scene
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {workflowStage === 'refine' && (
            <div>
              <WaterSection />
              <LightingSection />
              <ElementsSection />
              <CameraSection />
              <VisualStyleSection />

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setWorkflowStage('concept')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#101722] hover:bg-[#192434] border border-[#1E2B3E] rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Concept
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowStage('video')}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
                >
                  Proceed to Video Animation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {workflowStage === 'video' && (
            <div>
              <VideoWorkspace />

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setWorkflowStage('refine')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#101722] hover:bg-[#192434] border border-[#1E2B3E] rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Refine Scene
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowStage('music')}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
                >
                  Proceed to Music & Foley
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {workflowStage === 'music' && (
            <div>
              <MusicWorkspace />

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setWorkflowStage('video')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#101722] hover:bg-[#192434] border border-[#1E2B3E] rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Video Animation
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowStage('prompts')}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
                >
                  Open Prompt Workbench
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {workflowStage === 'prompts' && (
            <div>
              <PromptWorkbench />

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setWorkflowStage('music')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#101722] hover:bg-[#192434] border border-[#1E2B3E] rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Music & Foley
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
