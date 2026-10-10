import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { PromptHistoryEntry } from '../../types/ambience';
import {
  History,
  Copy,
  Check,
  Trash2,
  Search,
  Calendar,
  ImageIcon,
  Film,
  Music,
} from 'lucide-react';

export const PromptHistoryView: React.FC = () => {
  const [history, setHistory] = useState<PromptHistoryEntry[]>(() =>
    StorageService.getHistory()
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all prompt history records?')) {
      StorageService.clearHistory();
      setHistory([]);
    }
  };

  const filtered = history.filter((entry) => {
    if (filterType !== 'all' && entry.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        entry.promptText.toLowerCase().includes(q) ||
        entry.projectName.toLowerCase().includes(q) ||
        (entry.notes && entry.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Top Banner */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
            <History className="w-5 h-5 text-[#E8AE62]" />
            Prompt Archive & History
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-1">
            Chronological record of generated and saved prompt variations
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl border border-rose-900/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-1.5 p-1.5 bg-[#0B1018] border border-[#1E2B3E] rounded-xl shadow-inner">
          {(['all', 'image', 'video', 'music'] as const).map((t) => {
            const isActive = filterType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  isActive
                    ? 'bg-[#192434] text-[#E8AE62] font-semibold border border-[#283952] shadow-sm'
                    : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                }`}
              >
                {t === 'all' ? 'All Types' : `${t} Prompts`}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#A1AEC0] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts or notes..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
          />
        </div>
      </div>

      {/* History Items */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-[#101722]/50 border border-[#1E2B3E] rounded-2xl">
          <History className="w-10 h-10 text-[#A1AEC0]/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
            No Prompt Logs Found
          </h3>
          <p className="text-xs text-[#A1AEC0] max-w-sm mx-auto">
            Use &quot;Save to History&quot; in the Prompt Workbench to archive successful prompt versions here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-[#1E2B3E] bg-[#101722] hover:border-[#283952] hover:bg-[#131D2C] transition-all duration-200 shadow-md"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E]">
                      {item.type === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5 text-[#E8AE62]" />
                      ) : item.type === 'video' ? (
                        <Film className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Music className="w-3.5 h-3.5 text-purple-400" />
                      )}
                    </span>
                    <span className="text-xs font-semibold text-[#F2EEE6] font-display">
                      {item.projectName}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#0B1018] text-[#E8AE62] border border-[#1E2B3E]">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#A1AEC0] flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-[#E8AE62]" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.promptText)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-all shadow-sm"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <p className="text-xs font-mono text-[#F2EEE6]/90 bg-[#0B1018] p-3.5 rounded-xl border border-[#1E2B3E] whitespace-pre-wrap leading-relaxed line-clamp-4">
                  {item.promptText}
                </p>

                {item.notes && (
                  <div className="mt-2.5 text-[11px] text-[#E8AE62] bg-[#E8AE62]/10 px-3 py-1.5 rounded-xl border border-[#E8AE62]/30">
                    <span className="font-semibold">Production Note:</span> {item.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
