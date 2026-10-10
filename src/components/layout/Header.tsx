import React, { useState } from 'react';
import { useAmbience, WorkflowStage } from '../../context/AmbienceContext';
import { GlobalModelSelector } from '../common/ModelSelector';
import {
  Menu,
  Save,
  ShieldCheck,
  Edit2,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  SlidersHorizontal,
  Film,
  Music,
  FileText,
  Clock,
  Bot,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebarMobile: () => void;
  showSummaryPanel: boolean;
  onToggleSummaryPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebarMobile,
  showSummaryPanel,
  onToggleSummaryPanel,
}) => {
  const {
    activeView,
    activeProject,
    isModified,
    saveActiveProject,
    renameProject,
    workflowStage,
    setWorkflowStage,
    applyLoopOptimizationPreset,
    toggleContextualPanel,
  } = useAmbience();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(activeProject.name);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      renameProject(activeProject.id, nameInput.trim());
      setIsEditingName(false);
    }
  };

  const stages: { id: WorkflowStage; label: string; icon: React.ReactNode; step: string }[] = [
    { id: 'concept', step: '01', label: 'Concept', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'refine', step: '02', label: 'Refine Scene', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'video', step: '03', label: 'Video Motion', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'music', step: '04', label: 'Music & Foley', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'prompts', step: '05', label: 'Prompt Desk', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-16 px-4 md:px-6 bg-[#101722]/95 border-b border-[#1E2B3E] backdrop-blur-md flex items-center justify-between gap-4 z-20 shrink-0">
      {/* Zone 1: Mobile Hamburger + Project Name */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebarMobile}
          className="md:hidden p-2 text-[#A1AEC0] hover:text-[#F2EEE6] rounded-xl hover:bg-[#192434] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {activeView === 'create' ? (
          <div className="flex items-center gap-2.5 truncate">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={() => {
                    if (nameInput.trim()) renameProject(activeProject.id, nameInput.trim());
                    setIsEditingName(false);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#0B1018] border border-[#E8AE62] rounded-lg text-[#F2EEE6] focus:outline-none focus:ring-1 focus:ring-[#E8AE62]"
                />
                <button type="submit" className="text-[#E8AE62] hover:text-[#F2EEE6] p-1 transition-colors">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2.5 truncate group">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F2EEE6] tracking-wide font-display truncate">
                      {activeProject.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(activeProject.name);
                        setIsEditingName(true);
                      }}
                      className="text-[#A1AEC0] opacity-60 hover:opacity-100 hover:text-[#E8AE62] p-1 transition-all"
                      title="Rename Project"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {isModified ? (
                  <span className="text-[10px] text-[#E8AE62] font-mono font-medium bg-[#E8AE62]/10 border border-[#E8AE62]/40 px-2 py-0.5 rounded-full">
                    Unsaved
                  </span>
                ) : (
                  <span className="text-[10px] text-[#A1AEC0] font-mono opacity-60 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    Synced
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold capitalize text-[#F2EEE6] font-display tracking-wide">
              {activeView === 'recipes'
                ? 'Production Recipes'
                : activeView === 'workflow'
                ? 'Production Workflow'
                : activeView === 'video-lab'
                ? 'Reference Video Lab'
                : activeView === 'production-intelligence'
                ? 'Production Intelligence'
                : activeView.replace('-', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Zone 2: Workflow Stages Navigation (When in Create view) */}
      {activeView === 'create' && (
        <div className="hidden lg:flex items-center gap-1 p-1 bg-[#0B1018] border border-[#1E2B3E] rounded-xl shadow-inner">
          {stages.map((stage) => {
            const isActive = workflowStage === stage.id;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setWorkflowStage(stage.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#192434] text-[#E8AE62] shadow-sm border border-[#283952] font-semibold'
                    : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                }`}
              >
                <span className={`text-[10px] font-mono ${isActive ? 'text-[#E8AE62]' : 'text-[#A1AEC0]/60'}`}>
                  {stage.step}
                </span>
                <span className={isActive ? 'text-[#E8AE62]' : 'text-[#A1AEC0]'}>
                  {stage.icon}
                </span>
                <span>{stage.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={toggleContextualPanel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#E8AE62] hover:text-[#F2EEE6] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-all shadow-sm active:scale-95"
          title="Open Contextual Production Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-[#E8AE62]" />
          <span className="hidden sm:inline">Assistant</span>
        </button>

        <GlobalModelSelector />

        {activeView === 'create' && (
          <>
            <button
              type="button"
              onClick={applyLoopOptimizationPreset}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E8AE62] hover:text-[#F2EEE6] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-all shadow-xs"
              title="One-click optimize for seamless YouTube loops"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E8AE62]" />
              <span>Loop Optimizer</span>
            </button>

            <button
              type="button"
              onClick={saveActiveProject}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-xl transition-all shadow-md min-h-[38px] sm:min-h-0 ${
                isModified
                  ? 'bg-[#E8AE62] hover:bg-[#F2BE7D] text-[#0B1018] shadow-[#E8AE62]/20'
                  : 'bg-[#192434] hover:bg-[#223146] text-[#F2EEE6] border border-[#283952]'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isModified ? 'Save Changes' : 'Saved'}</span>
              <span className="xs:hidden">{isModified ? 'Save' : 'Saved'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleSummaryPanel}
              className={`p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border transition-colors ${
                showSummaryPanel
                  ? 'bg-[#192434] text-[#E8AE62] border-[#283952]'
                  : 'bg-[#0B1018] text-[#A1AEC0] border-[#1E2B3E] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
              }`}
              title="Toggle Live Scene Summary Panel"
            >
              {showSummaryPanel ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
