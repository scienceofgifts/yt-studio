import React from 'react';
import { useAmbience, StudioView } from '../../context/AmbienceContext';
import {
  Sparkles,
  FolderKanban,
  SlidersHorizontal,
  Bookmark,
  History,
  Lightbulb,
  Settings,
  Flame,
  ChevronRight,
  Disc3,
  Image as ImageIcon,
  BarChart3,
  Workflow,
  Youtube,
  Bot,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

import { useCustomImages } from '../../context/CustomImageContext';

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeView, setActiveView, projects, presets, recipes, videoLabItems } = useAmbience();
  const { assets } = useCustomImages();

  const navItems: { id: StudioView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'create', label: 'Create Studio', icon: <Flame className="w-4 h-4" /> },
    { id: 'recipes', label: 'Production Recipes', icon: <BookOpen className="w-4 h-4 text-[#E8AE62]" />, badge: `${recipes?.length || 0}` },
    { id: 'assistant', label: 'Production Assistant', icon: <Bot className="w-4 h-4 text-[#E8AE62]" />, badge: 'AI' },
    { id: 'workflow', label: 'Production Workflow', icon: <Workflow className="w-4 h-4" />, badge: `${projects.filter((p) => !p.archived).length}` },
    { id: 'video-lab', label: 'Reference Video Lab', icon: <Youtube className="w-4 h-4 text-[#F87171]" />, badge: `${videoLabItems?.length || 0}` },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, badge: `${projects.length}` },
    { id: 'production-intelligence', label: 'Production Intelligence', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'presets', label: 'Presets Library', icon: <SlidersHorizontal className="w-4 h-4" />, badge: `${presets.length}` },
    { id: 'images', label: 'Image Library', icon: <ImageIcon className="w-4 h-4" />, badge: `${assets.length}` },
    { id: 'references', label: 'Reference Library', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'history', label: 'Prompt History', icon: <History className="w-4 h-4" /> },
    { id: 'lessons', label: 'Lessons Learned', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'settings', label: 'Studio Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-68 bg-[#101722] border-r border-[#1E2B3E] flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Studio Brand Wordmark */}
          <div className="h-20 px-5 border-b border-[#1E2B3E] flex items-center gap-3.5 bg-[#0B1018]/60">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#192434] to-[#101722] border border-[#283952] flex items-center justify-center shrink-0 shadow-inner group">
              <Sparkles className="w-4 h-4 text-[#E8AE62] transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E8AE62] ring-2 ring-[#101722]" />
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold tracking-wide text-[#F2EEE6] font-display">
                Ambience Intelligence
              </div>
              <div className="text-[10px] text-[#A1AEC0] tracking-widest uppercase font-mono mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8AE62]/80 inline-block" />
                Creative Studio
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="p-3.5">
            <div className="px-2.5 py-1.5 mb-1.5 text-[10px] uppercase font-mono tracking-wider text-[#A1AEC0]/70 font-semibold">
              Workspaces & Archives
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveView(item.id);
                      onCloseMobile();
                    }}
                    className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#192434] text-[#F2EEE6] font-semibold border border-[#283952] shadow-sm'
                        : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]/80'
                    }`}
                  >
                    {/* Active vertical accent pill */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#E8AE62]" />
                    )}

                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-colors duration-150 ${
                          isActive
                            ? 'text-[#E8AE62]'
                            : 'text-[#A1AEC0] group-hover:text-[#F2EEE6]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                          isActive
                            ? 'bg-[#223146] text-[#E8AE62] border border-[#283952]'
                            : 'bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-[#E8AE62]" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Studio System Footnote */}
        <div className="p-4 mx-3 mb-3 rounded-xl bg-[#0B1018]/70 border border-[#1E2B3E] text-xs text-[#A1AEC0]">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#F2EEE6] mb-1">
            <span className="flex items-center gap-1.5">
              <Disc3 className="w-3 h-3 text-[#E8AE62] animate-spin" style={{ animationDuration: '8s' }} />
              Engine v1.4
            </span>
            <span className="text-[10px] font-mono text-[#E8AE62] bg-[#192434] px-1.5 py-0.5 rounded border border-[#283952]">
              Coordinated
            </span>
          </div>
          <div className="text-[10px] text-[#A1AEC0] leading-relaxed">
            Multi-modal prompt synchronization for Midjourney, Runway & Suno
          </div>
        </div>
      </aside>
    </>
  );
};
