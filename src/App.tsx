/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AmbienceProvider, useAmbience } from './context/AmbienceContext';
import { CustomImageProvider } from './context/CustomImageContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LiveSummaryPanel } from './components/layout/LiveSummaryPanel';
import { CreateWorkspace } from './components/workspace/CreateWorkspace';
import { ProjectsView } from './components/views/ProjectsView';
import { PresetsView } from './components/views/PresetsView';
import { RecipesView } from './components/views/RecipesView';
import { ImageLibraryView } from './components/views/ImageLibraryView';
import { ReferenceLibraryView } from './components/views/ReferenceLibraryView';
import { PromptHistoryView } from './components/views/PromptHistoryView';
import { LessonsLearnedView } from './components/views/LessonsLearnedView';
import { ProductionIntelligenceView } from './components/views/ProductionIntelligenceView';
import { ProductionWorkflowView } from './components/views/ProductionWorkflowView';
import { ReferenceVideoLabView } from './components/views/ReferenceVideoLabView';
import { ProductionAssistantView } from './components/views/ProductionAssistantView';
import { ContextualAssistantPanel } from './components/layout/ContextualAssistantPanel';
import { SettingsView } from './components/views/SettingsView';
import { ImageManagerModal } from './components/modals/ImageManagerModal';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const StudioMainContent: React.FC = () => {
  const { activeView, toastMessage } = useAmbience();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(true);

  return (
    <div className="flex h-screen bg-[#0B1018] text-[#F2EEE6] overflow-hidden font-sans selection:bg-[#E8AE62]/20 selection:text-[#E8AE62]">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0B1018]">
        {/* Top Header */}
        <Header
          onToggleSidebarMobile={() => setSidebarMobileOpen(!sidebarMobileOpen)}
          showSummaryPanel={showSummaryPanel}
          onToggleSummaryPanel={() => setShowSummaryPanel(!showSummaryPanel)}
        />

        {/* Viewport: Workspace + Optional Live Summary Panel */}
        <div className="flex-1 flex min-w-0 overflow-hidden bg-[#0B1018]">
          {/* Scrollable Main Workspace */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <ErrorBoundary fallbackTitle="Workspace View Error">
              {activeView === 'create' && <CreateWorkspace />}
              {activeView === 'recipes' && <RecipesView />}
              {activeView === 'assistant' && <ProductionAssistantView />}
              {activeView === 'workflow' && <ProductionWorkflowView />}
              {activeView === 'video-lab' && <ReferenceVideoLabView />}
              {activeView === 'projects' && <ProjectsView />}
              {activeView === 'production-intelligence' && <ProductionIntelligenceView />}
              {activeView === 'presets' && <PresetsView />}
              {activeView === 'images' && <ImageLibraryView />}
              {activeView === 'references' && <ReferenceLibraryView />}
              {activeView === 'history' && <PromptHistoryView />}
              {activeView === 'lessons' && <LessonsLearnedView />}
              {activeView === 'settings' && <SettingsView />}
            </ErrorBoundary>
          </main>

          {/* Right Live Summary Panel (Only active in 'create' view, toggleable) */}
          {activeView === 'create' && showSummaryPanel && (
            <div className="hidden xl:block">
              <LiveSummaryPanel />
            </div>
          )}
        </div>
      </div>

      {/* Contextual Assistant Slide-over Drawer */}
      <ContextualAssistantPanel />

      {/* Global Image Picker & Library Modal */}
      <ImageManagerModal />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#192434] border border-[#E8AE62]/40 text-[#F2EEE6] text-xs font-medium shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3">
          <span className="w-2 h-2 rounded-full bg-[#E8AE62] ring-2 ring-[#E8AE62]/30"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AmbienceProvider>
      <CustomImageProvider>
        <StudioMainContent />
      </CustomImageProvider>
    </AmbienceProvider>
  );
}
