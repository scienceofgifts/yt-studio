import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { WORLDS_CATALOG } from '../../data/catalog';
import { WorldVisual } from '../../data/worldVisuals';
import { VisualArtwork } from '../common/VisualArtwork';
import {
  FolderKanban,
  Plus,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Check,
  Compass,
  BarChart3,
  Workflow,
  BookOpen,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    activeProject,
    switchProject,
    createNewProject,
    duplicateProject,
    deleteProject,
    renameProject,
    createRecipeFromProject,
    setActiveView,
  } = useAmbience();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createNewProject(newProjectName.trim(), newProjectDesc.trim());
    setShowCreateModal(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const handleRename = (id: string) => {
    if (renameInput.trim()) {
      renameProject(id, renameInput.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Top Banner */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 mb-8 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
            <FolderKanban className="w-5 h-5 text-[#E8AE62]" />
            Creative Project Sessions
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-1">
            Manage, duplicate, and switch between your cinematic ambience production sessions
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project Session
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((proj) => {
          const isActive = proj.id === activeProject.id;
          const world = WORLDS_CATALOG.find((w) => w.id === proj.config.worldId);

          return (
            <div
              key={proj.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-[#151F2E] border-[#E8AE62] ring-1 ring-[#E8AE62]/50 shadow-xl'
                  : 'bg-[#101722] hover:bg-[#131D2C] border-[#1E2B3E] hover:border-[#283952] shadow-lg'
              }`}
            >
              {/* Top Visual Banner (35% height) */}
              <div className="relative w-full h-32 bg-[#070B10] overflow-hidden">
                <VisualArtwork
                  targetKey={`project:${proj.id}`}
                  targetLabel={proj.name}
                  fallbackTargetKey={`world:${proj.config.worldId}`}
                  defaultVisual={<WorldVisual worldId={proj.config.worldId} className="w-full h-full object-cover" />}
                  overlayScrim={true}
                  alignControls="top-right"
                />

                {/* World Tag */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#0B1018]/80 backdrop-blur-xs border border-[#1E2B3E] text-[10px] font-medium text-[#E8AE62] flex items-center gap-1 z-10 pointer-events-none">
                  <Compass className="w-3 h-3" />
                  <span>{world?.name || proj.config.worldId}</span>
                </div>

                {/* Active Indicator Badge */}
                {isActive && (
                  <div className="absolute top-3 right-10 px-2 py-0.5 rounded-md bg-[#E8AE62] text-[#0B1018] text-[10px] font-bold font-mono shadow-md z-10 pointer-events-none">
                    ACTIVE PROJECT
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {editingId === proj.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          className="px-2.5 py-1 text-xs bg-[#0B1018] border border-[#E8AE62] rounded-lg text-[#F2EEE6] w-full focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleRename(proj.id)}
                          className="text-[#E8AE62] p-1"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#F2EEE6] font-display">
                          {proj.name}
                        </h3>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(proj.id);
                          setRenameInput(proj.name);
                        }}
                        className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] rounded-lg hover:bg-[#192434] transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateProject(proj.id)}
                        className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] rounded-lg hover:bg-[#192434] transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteProject(proj.id)}
                          className="p-1.5 text-[#A1AEC0] hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#A1AEC0] mb-4 leading-relaxed line-clamp-2">
                    {proj.description || world?.tagline || 'Atmospheric video and music configuration'}
                  </p>

                  {/* Atmospheric Configuration Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] capitalize">
                      {proj.config.season}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] text-[#F2EEE6] capitalize">
                      {proj.config.primaryWeather}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] text-[#A1AEC0] capitalize">
                      {proj.config.lighting.primary.replace('-', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#0B1018] border border-[#1E2B3E] text-[#E8AE62] font-mono">
                      {proj.config.visualStyle.aspectRatio}
                    </span>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-[#1E2B3E] flex items-center justify-between">
                  <span className="text-[10px] text-[#A1AEC0] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#E8AE62]" />
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => createRecipeFromProject(proj.id)}
                      className="text-[11px] text-[#A1AEC0] hover:text-[#E8AE62] flex items-center gap-1 font-mono transition-colors"
                      title="Save this project session setup as a Production Recipe"
                    >
                      <BookOpen className="w-3 h-3 text-[#E8AE62]" />
                      <span>Save Recipe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('workflow')}
                      className="text-[11px] text-[#A1AEC0] hover:text-[#E8AE62] flex items-center gap-1 font-mono transition-colors"
                      title="Manage end-to-end production pipeline"
                    >
                      <Workflow className="w-3 h-3" />
                      <span>Pipeline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('production-intelligence')}
                      className="text-[11px] text-[#A1AEC0] hover:text-[#E8AE62] flex items-center gap-1 font-mono transition-colors"
                      title="View YouTube analytics for this project"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Intelligence</span>
                    </button>

                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => switchProject(proj.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#E8AE62] hover:text-[#F2BE7D] transition-colors"
                      >
                        <span>Load Studio Canvas</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-[#E8AE62] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E8AE62]" />
                        Currently Editing
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101722] border border-[#283952] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
              Create New Project Session
            </h3>
            <p className="text-xs text-[#A1AEC0] mb-4">
              Initialize a clean creative workspace for your atmospheric video.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Victorian Rain at Midnight"
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#F2EEE6] mb-1">
                  Creative Notes / Target Ambience
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Atmospheric tone, focal objects, audio foley notes..."
                  className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-colors shadow-md"
                >
                  Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
