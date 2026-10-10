import React, { useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { AssistantActionType } from '../../types/ambience';
import {
  Bot,
  X,
  Stethoscope,
  Wand2,
  GitCompare,
  Lightbulb,
  Send,
  Loader2,
  Sparkles,
  Check,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export const ContextualAssistantPanel: React.FC = () => {
  const {
    activeProject,
    contextualPanelOpen,
    setContextualPanelOpen,
    activeAssistantSession,
    runAssistantAction,
    isAssistantThinking,
    applyAssistantPromptFix,
  } = useAmbience();

  const [inputMessage, setInputMessage] = useState('');

  if (!contextualPanelOpen) return null;

  const handleAction = async (actionType: AssistantActionType, text?: string) => {
    await runAssistantAction(actionType, text || inputMessage, activeProject.id);
    setInputMessage('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in"
        onClick={() => setContextualPanelOpen(false)}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#101722] border-l border-[#1E2B3E] shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1E2B3E] bg-[#0B1018] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#192434] border border-[#E8AE62]/40 flex items-center justify-center text-[#E8AE62]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F2EEE6] font-display flex items-center gap-2">
                Contextual Assistant
              </h2>
              <p className="text-[11px] text-[#A1AEC0] truncate max-w-[260px]">
                Active Project: <strong className="text-[#E8AE62]">{activeProject.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setContextualPanelOpen(false)}
            className="p-1.5 rounded-lg text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#1E2B3E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3 bg-[#192434]/60 border-b border-[#1E2B3E] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleAction('diagnose')}
            disabled={isAssistantThinking}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-medium hover:bg-[#F59E0B]/20 transition-all shrink-0"
          >
            <Stethoscope className="w-3.5 h-3.5" /> Diagnose
          </button>

          <button
            type="button"
            onClick={() => handleAction('improve-prompt')}
            disabled={isAssistantThinking}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E8AE62]/10 text-[#E8AE62] border border-[#E8AE62]/30 text-xs font-medium hover:bg-[#E8AE62]/20 transition-all shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" /> Optimize Prompts
          </button>

          <button
            type="button"
            onClick={() => handleAction('compare-prompts')}
            disabled={isAssistantThinking}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/30 text-xs font-medium hover:bg-[#3B82F6]/20 transition-all shrink-0"
          >
            <GitCompare className="w-3.5 h-3.5" /> Compare
          </button>

          <button
            type="button"
            onClick={() => handleAction('find-lessons')}
            disabled={isAssistantThinking}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30 text-xs font-medium hover:bg-[#10B981]/20 transition-all shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Lessons
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(!activeAssistantSession || activeAssistantSession.messages.length === 0) && (
            <div className="py-12 text-center text-xs text-[#A1AEC0]/70 space-y-2">
              <Sparkles className="w-6 h-6 text-[#E8AE62] mx-auto opacity-80" />
              <p>Ask a question or tap a diagnostic action above to audit <strong className="text-[#F2EEE6]">{activeProject.name}</strong>.</p>
            </div>
          )}

          {activeAssistantSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded-xl text-xs ${
                msg.sender === 'user'
                  ? 'bg-[#E8AE62] text-[#0B1018] ml-6 font-medium'
                  : 'bg-[#192434] border border-[#283952] text-[#F2EEE6] mr-2 space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Improved Prompts Quick Adopt */}
              {msg.improvedPrompts && (
                <div className="mt-2 p-2.5 rounded bg-[#0B1018] border border-[#1E2B3E] space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-[#E8AE62] font-semibold">
                    <span>Improved Prompt Available</span>
                    <button
                      type="button"
                      onClick={() =>
                        applyAssistantPromptFix({
                          imagePrompt: msg.improvedPrompts?.imagePrompt,
                          videoPrompt: msg.improvedPrompts?.videoPrompt,
                          musicPrompt: msg.improvedPrompts?.musicPrompt,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-[#E8AE62] text-[#0B1018] text-[10px] font-bold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Adopt
                    </button>
                  </div>
                  {msg.improvedPrompts.imagePrompt && (
                    <div className="font-mono text-[#F2EEE6] truncate">{msg.improvedPrompts.imagePrompt}</div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isAssistantThinking && (
            <div className="p-3 rounded-xl bg-[#192434] border border-[#283952] text-xs text-[#E8AE62] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Diagnosing project parameters...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 bg-[#0B1018] border-t border-[#1E2B3E]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputMessage.trim()) {
                handleAction('general-query');
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Assistant about this production..."
              disabled={isAssistantThinking}
              className="flex-1 bg-[#101722] border border-[#1E2B3E] focus:border-[#E8AE62] text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/50 rounded-xl px-3 py-2.5 outline-none"
            />
            <button
              type="submit"
              disabled={isAssistantThinking || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-[#E8AE62] hover:bg-[#D99A4C] text-[#0B1018] transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
