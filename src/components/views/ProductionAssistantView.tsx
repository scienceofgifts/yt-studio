import React, { useState, useRef, useEffect } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import {
  AssistantActionType,
  AssistantMessage,
  AssistantDiagnosticResult,
  AssistantPromptComparison,
} from '../../types/ambience';
import { TaskModelBadgeSelector } from '../common/ModelSelector';
import {
  Bot,
  Sparkles,
  Stethoscope,
  Wand2,
  GitCompare,
  Lightbulb,
  Trophy,
  Youtube,
  Send,
  Loader2,
  Check,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  AlertTriangle,
  FolderKanban,
  Zap,
  ArrowRight,
  Layers,
  Copy,
  History,
  Info,
} from 'lucide-react';

export const ProductionAssistantView: React.FC = () => {
  const {
    projects,
    activeProject,
    switchProject,
    assistantSessions,
    activeAssistantSession,
    setActiveAssistantSessionId,
    createNewAssistantSession,
    deleteAssistantSession,
    runAssistantAction,
    isAssistantThinking,
    applyAssistantPromptFix,
    saveAssistantNewLesson,
    setMessageFeedback,
  } = useAmbience();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState<AssistantActionType>('general-query');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeAssistantSession?.messages, isAssistantThinking]);

  const handleSend = async (actionType: AssistantActionType = selectedAction, queryText?: string) => {
    const textToSend = queryText !== undefined ? queryText : inputMessage;
    if (!textToSend.trim() && actionType === 'general-query') return;

    setInputMessage('');
    await runAssistantAction(actionType, textToSend, selectedProjectId);
  };

  const actionChips: { id: AssistantActionType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'diagnose',
      label: 'Diagnose Problem',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      color: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/20',
    },
    {
      id: 'improve-prompt',
      label: 'Improve Prompt',
      icon: <Wand2 className="w-3.5 h-3.5" />,
      color: 'bg-[#E8AE62]/10 text-[#E8AE62] border-[#E8AE62]/30 hover:bg-[#E8AE62]/20',
    },
    {
      id: 'compare-prompts',
      label: 'Compare Versions',
      icon: <GitCompare className="w-3.5 h-3.5" />,
      color: 'bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/30 hover:bg-[#3B82F6]/20',
    },
    {
      id: 'find-lessons',
      label: 'Find Lessons',
      icon: <Lightbulb className="w-3.5 h-3.5" />,
      color: 'bg-[#10B981]/10 text-[#34D399] border-[#10B981]/30 hover:bg-[#10B981]/20',
    },
    {
      id: 'adapt-production',
      label: 'Adapt Top Video',
      icon: <Trophy className="w-3.5 h-3.5" />,
      color: 'bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20',
    },
    {
      id: 'review-reference-video',
      label: 'Review Lab Video',
      icon: <Youtube className="w-3.5 h-3.5" />,
      color: 'bg-[#EF4444]/10 text-[#F87171] border-[#EF4444]/30 hover:bg-[#EF4444]/20',
    },
  ];

  const currentProjectContext = projects.find((p) => p.id === selectedProjectId) || activeProject;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto space-y-4">
      {/* Top Header & Assistant Mode Control Bar */}
      <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#192434] to-[#101722] border border-[#E8AE62]/40 flex items-center justify-center shrink-0 shadow-inner group">
            <Bot className="w-6 h-6 text-[#E8AE62] transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#F2EEE6] font-display tracking-wide">
                Production Assistant
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#E8AE62]/10 text-[#E8AE62] border border-[#E8AE62]/30">
                Phase 9 Contextual AI
              </span>
            </div>
            <p className="text-xs text-[#A1AEC0] mt-0.5">
              Diagnose creative problems, optimize prompts, compare iterations, and learn from experience.
            </p>
          </div>
        </div>

        {/* Right Context Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Project Picker */}
          <div className="flex items-center gap-2 bg-[#0B1018] border border-[#1E2B3E] px-3 py-1.5 rounded-xl">
            <FolderKanban className="w-3.5 h-3.5 text-[#E8AE62]" />
            <span className="text-[11px] font-mono text-[#A1AEC0]">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                switchProject(e.target.value);
              }}
              className="bg-transparent text-xs font-medium text-[#F2EEE6] outline-none cursor-pointer max-w-[160px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#101722] text-[#F2EEE6]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector Badge for Assistant */}
          <TaskModelBadgeSelector task="assistant" />

          {/* New Session Button */}
          <button
            type="button"
            onClick={() => createNewAssistantSession()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#192434] hover:bg-[#223146] border border-[#283952] text-xs font-medium text-[#F2EEE6] transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#E8AE62]" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sessions Drawer + Right Chat Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Sessions History */}
        <div className="hidden lg:flex flex-col bg-[#101722] border border-[#1E2B3E] rounded-2xl p-3.5 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2B3E] mb-2">
            <span className="text-xs font-semibold text-[#F2EEE6] tracking-wide flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#E8AE62]" />
              Session History
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B1018] text-[#A1AEC0] border border-[#1E2B3E]">
              {assistantSessions.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {assistantSessions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#A1AEC0]/70 italic">
                No previous sessions. Start asking questions below!
              </div>
            ) : (
              assistantSessions.map((session) => {
                const isActive = activeAssistantSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setActiveAssistantSessionId(session.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#192434] text-[#F2EEE6] border border-[#283952] font-medium shadow-sm'
                        : 'text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#151F2E]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="truncate text-xs">{session.title}</div>
                      <div className="text-[10px] font-mono text-[#A1AEC0]/60 mt-0.5">
                        {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.messages.length} msgs
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAssistantSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#F87171] transition-opacity"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Chat & Diagnostic Output Area */}
        <div className="lg:col-span-3 flex flex-col bg-[#101722] border border-[#1E2B3E] rounded-2xl min-h-0 overflow-hidden shadow-2xl">
          {/* Quick Action Chips Bar */}
          <div className="px-4 py-3 bg-[#0B1018]/80 border-b border-[#1E2B3E] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1AEC0] shrink-0 mr-1">
              Suggested Actions:
            </span>
            {actionChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setSelectedAction(chip.id);
                  handleSend(chip.id, '');
                }}
                disabled={isAssistantThinking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 active:scale-95 disabled:opacity-50 ${chip.color}`}
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {(!activeAssistantSession || activeAssistantSession.messages.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#192434] to-[#101722] border border-[#E8AE62]/30 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-8 h-8 text-[#E8AE62]" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-bold text-[#F2EEE6] font-display">
                    Welcome to Production Assistant
                  </h3>
                  <p className="text-xs text-[#A1AEC0] leading-relaxed mt-1">
                    Select an action chip above or ask a production question about <strong className="text-[#E8AE62]">{currentProjectContext.name}</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeAssistantSession?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-4xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-[#E8AE62] text-[#0B1018]'
                      : 'bg-[#192434] text-[#E8AE62] border border-[#283952]'
                  }`}
                >
                  {msg.sender === 'user' ? 'YOU' : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content Bubble */}
                <div className={`space-y-3 flex-1 min-w-0 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block p-4 rounded-2xl text-xs leading-relaxed max-w-3xl ${
                      msg.sender === 'user'
                        ? 'bg-[#E8AE62] text-[#0B1018] font-medium rounded-tr-none shadow-md'
                        : 'bg-[#192434] border border-[#283952] text-[#F2EEE6] rounded-tl-none shadow-xl'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Rich Diagnostic Report Card */}
                    {msg.diagnosticResult && (
                      <DiagnosticReportCard
                        result={msg.diagnosticResult}
                        onAdoptFix={(prompts) => applyAssistantPromptFix(prompts)}
                        onSaveLesson={(lesson) => saveAssistantNewLesson(lesson)}
                      />
                    )}

                    {/* Rich Improved Prompts Card */}
                    {msg.improvedPrompts && (
                      <ImprovedPromptsCard
                        improved={msg.improvedPrompts}
                        onAdopt={(prompts) => applyAssistantPromptFix(prompts)}
                      />
                    )}

                    {/* Rich Side-by-Side Prompt Comparison Card */}
                    {msg.promptComparison && (
                      <PromptComparisonCard
                        comparison={msg.promptComparison}
                        onAdopt={(text) => applyAssistantPromptFix({ imagePrompt: text })}
                      />
                    )}

                    {/* Rich Adapted Production Card */}
                    {msg.adaptedProductionRef && (
                      <AdaptedProductionCard
                        refData={msg.adaptedProductionRef}
                        onAdopt={(prompts) => applyAssistantPromptFix(prompts)}
                      />
                    )}

                    {/* Found Lessons List */}
                    {msg.foundLessons && msg.foundLessons.length > 0 && (
                      <div className="mt-3 space-y-2 text-left">
                        <div className="text-[11px] font-semibold text-[#E8AE62] uppercase tracking-wider flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5" /> Found Lessons Learned:
                        </div>
                        {msg.foundLessons.map((l) => (
                          <div key={l.id} className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs space-y-1">
                            <div className="font-semibold text-[#F2EEE6] flex items-center justify-between">
                              <span>{l.title}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#192434] text-[#E8AE62]">
                                {l.category}
                              </span>
                            </div>
                            <p className="text-[#A1AEC0] text-[11px]">{l.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp & Feedback Buttons */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center gap-3 text-[10px] text-[#A1AEC0]/60 px-1">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => activeAssistantSession && setMessageFeedback(activeAssistantSession.id, msg.id, 'helpful')}
                          className={`p-1 hover:text-[#E8AE62] transition-colors ${msg.feedback === 'helpful' ? 'text-[#E8AE62]' : ''}`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => activeAssistantSession && setMessageFeedback(activeAssistantSession.id, msg.id, 'unhelpful')}
                          className={`p-1 hover:text-[#F87171] transition-colors ${msg.feedback === 'unhelpful' ? 'text-[#F87171]' : ''}`}
                          title="Not Helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAssistantThinking && (
              <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-[#192434] border border-[#283952] flex items-center justify-center shrink-0 text-[#E8AE62]">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-[#192434] border border-[#283952] text-xs text-[#E8AE62] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing project configuration & production history...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className="p-4 bg-[#0B1018] border-t border-[#1E2B3E]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask Assistant about "${currentProjectContext.name}" or request prompt improvements...`}
                disabled={isAssistantThinking}
                className="flex-1 bg-[#101722] border border-[#1E2B3E] focus:border-[#E8AE62] text-xs text-[#F2EEE6] placeholder-[#A1AEC0]/50 rounded-xl px-4 py-3 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isAssistantThinking || !inputMessage.trim()}
                className="px-4 py-3 rounded-xl bg-[#E8AE62] hover:bg-[#D99A4C] text-[#0B1018] font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-md"
              >
                {isAssistantThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Sub-Components for Rich Card Renderings
// ==========================================

const DiagnosticReportCard: React.FC<{
  result: AssistantDiagnosticResult;
  onAdoptFix: (prompts: { imagePrompt?: string; videoPrompt?: string; musicPrompt?: string }) => void;
  onSaveLesson: (lesson: { category: any; title: string; observation: string; recommendation: string }) => void;
}> = ({ result, onAdoptFix, onSaveLesson }) => {
  const severityColors = {
    high: 'bg-[#EF4444]/20 text-[#F87171] border-[#EF4444]/40',
    medium: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40',
    low: 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40',
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-bold text-[#F2EEE6] text-xs">{result.issueTitle}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${severityColors[result.severity]}`}>
          {result.severity.toUpperCase()} RISK
        </span>
      </div>

      <p className="text-xs text-[#A1AEC0]">{result.summary}</p>

      {/* Conflicts */}
      {result.detectedConflicts.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-[#F59E0B]">Detected Parameter Conflicts:</div>
          {result.detectedConflicts.map((c, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-[#101722] border border-[#1E2B3E] text-[11px] text-[#A1AEC0]">
              <strong className="text-[#F2EEE6]">{c.parameters.join(', ')}:</strong> {c.explanation}
            </div>
          ))}
        </div>
      )}

      {/* Kinematic Risks */}
      {result.motionOrLoopRisks.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-[#F87171]">Kinematic Motion & Seam Hazards:</div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[#A1AEC0]">
            {result.motionOrLoopRisks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Adjustments Table */}
      {result.recommendedAdjustments.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#E8AE62]">Recommended Adjustments:</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-[#A1AEC0] border border-[#1E2B3E] rounded-lg overflow-hidden">
              <thead className="bg-[#101722] text-[#F2EEE6]">
                <tr>
                  <th className="p-2 border-b border-[#1E2B3E]">Setting</th>
                  <th className="p-2 border-b border-[#1E2B3E]">Suggested Value</th>
                  <th className="p-2 border-b border-[#1E2B3E]">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {result.recommendedAdjustments.map((adj, i) => (
                  <tr key={i} className="border-b border-[#1E2B3E] last:border-0">
                    <td className="p-2 font-medium text-[#F2EEE6]">{adj.setting}</td>
                    <td className="p-2 text-[#E8AE62] font-mono">{adj.suggestedValue}</td>
                    <td className="p-2">{adj.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prompt Fixes with 1-click adoption */}
      {result.promptFixes.length > 0 && (
        <div className="p-3 rounded-lg bg-[#192434] border border-[#283952] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#E8AE62]">Suggested Prompt Revision:</span>
            <button
              type="button"
              onClick={() => {
                const fixes: any = {};
                result.promptFixes.forEach((f) => {
                  if (f.type === 'image') fixes.imagePrompt = f.suggestedSnippet;
                  if (f.type === 'video') fixes.videoPrompt = f.suggestedSnippet;
                  if (f.type === 'music') fixes.musicPrompt = f.suggestedSnippet;
                });
                onAdoptFix(fixes);
              }}
              className="px-2.5 py-1 rounded-md bg-[#E8AE62] text-[#0B1018] text-[10px] font-bold hover:bg-[#D99A4C] transition-all flex items-center gap-1 active:scale-95"
            >
              <Check className="w-3 h-3" /> Adopt Updates
            </button>
          </div>
          {result.promptFixes.map((f, i) => (
            <div key={i} className="text-[11px] font-mono text-[#F2EEE6] bg-[#0B1018] p-2 rounded border border-[#1E2B3E]">
              {f.suggestedSnippet}
            </div>
          ))}
        </div>
      )}

      {/* Suggested New Lesson Action */}
      {result.suggestedNewLesson && (
        <div className="pt-2 flex items-center justify-between border-t border-[#1E2B3E]">
          <span className="text-[11px] text-[#A1AEC0]">New lesson identified: "{result.suggestedNewLesson.title}"</span>
          <button
            type="button"
            onClick={() => onSaveLesson(result.suggestedNewLesson!)}
            className="px-2.5 py-1 rounded bg-[#101722] hover:bg-[#192434] border border-[#1E2B3E] text-[#34D399] text-[10px] font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Save to Lessons Learned
          </button>
        </div>
      )}
    </div>
  );
};

const ImprovedPromptsCard: React.FC<{
  improved: NonNullable<AssistantMessage['improvedPrompts']>;
  onAdopt: (prompts: { imagePrompt?: string; videoPrompt?: string; musicPrompt?: string }) => void;
}> = ({ improved, onAdopt }) => {
  return (
    <div className="mt-3 p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-2">
        <span className="text-xs font-bold text-[#E8AE62] flex items-center gap-1.5">
          <Wand2 className="w-4 h-4" /> Improved Coordinated Prompts:
        </span>
        <button
          type="button"
          onClick={() =>
            onAdopt({
              imagePrompt: improved.imagePrompt,
              videoPrompt: improved.videoPrompt,
              musicPrompt: improved.musicPrompt,
            })
          }
          className="px-3 py-1 rounded-lg bg-[#E8AE62] text-[#0B1018] text-xs font-bold hover:bg-[#D99A4C] transition-all flex items-center gap-1 active:scale-95"
        >
          <Check className="w-3.5 h-3.5" /> Apply All Prompts
        </button>
      </div>

      <p className="text-xs text-[#A1AEC0]">{improved.explanation}</p>

      {improved.imagePrompt && (
        <div>
          <div className="text-[10px] font-mono text-[#E8AE62] uppercase mb-1">Image Prompt (Midjourney / Flux):</div>
          <div className="p-2.5 rounded-lg bg-[#101722] border border-[#1E2B3E] font-mono text-[11px] text-[#F2EEE6]">
            {improved.imagePrompt}
          </div>
        </div>
      )}

      {improved.videoPrompt && (
        <div>
          <div className="text-[10px] font-mono text-[#34D399] uppercase mb-1">Video Animation Prompt (Runway / Luma):</div>
          <div className="p-2.5 rounded-lg bg-[#101722] border border-[#1E2B3E] font-mono text-[11px] text-[#F2EEE6]">
            {improved.videoPrompt}
          </div>
        </div>
      )}

      {improved.musicPrompt && (
        <div>
          <div className="text-[10px] font-mono text-[#60A5FA] uppercase mb-1">Music & Foley Prompt (Suno / Udio):</div>
          <div className="p-2.5 rounded-lg bg-[#101722] border border-[#1E2B3E] font-mono text-[11px] text-[#F2EEE6]">
            {improved.musicPrompt}
          </div>
        </div>
      )}
    </div>
  );
};

const PromptComparisonCard: React.FC<{
  comparison: AssistantPromptComparison;
  onAdopt: (text: string) => void;
}> = ({ comparison, onAdopt }) => {
  return (
    <div className="mt-4 p-4 rounded-xl bg-[#0B1018] border border-[#1E2B3E] space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-2">
        <span className="text-xs font-bold text-[#60A5FA] flex items-center gap-1.5">
          <GitCompare className="w-4 h-4" /> Side-by-Side Version Diff:
        </span>
        <button
          type="button"
          onClick={() => onAdopt(comparison.versionB.promptText)}
          className="px-2.5 py-1 rounded-md bg-[#3B82F6] text-[#F2EEE6] text-[10px] font-bold hover:bg-[#2563EB] transition-all flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Apply Version B
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
        <div className="p-3 rounded-lg bg-[#101722] border border-[#1E2B3E]">
          <div className="font-semibold text-[#A1AEC0] mb-1">{comparison.versionA.title}:</div>
          <p className="font-mono text-[#A1AEC0]/80">{comparison.versionA.promptText}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#192434] border border-[#283952]">
          <div className="font-semibold text-[#60A5FA] mb-1">{comparison.versionB.title}:</div>
          <p className="font-mono text-[#F2EEE6]">{comparison.versionB.promptText}</p>
        </div>
      </div>

      {comparison.differences.addedTokens.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-[#34D399] uppercase mb-1">Added Tokens / Parameters:</div>
          <div className="flex flex-wrap gap-1">
            {comparison.differences.addedTokens.map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] font-mono text-[10px]">
                +{t}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[#A1AEC0] italic">{comparison.rationale}</p>
    </div>
  );
};

const AdaptedProductionCard: React.FC<{
  refData: NonNullable<AssistantMessage['adaptedProductionRef']>;
  onAdopt: (prompts: { imagePrompt?: string; videoPrompt?: string; musicPrompt?: string }) => void;
}> = ({ refData, onAdopt }) => {
  return (
    <div className="mt-3 p-4 rounded-xl bg-[#0B1018] border border-[#8B5CF6]/40 space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-2">
        <span className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
          <Trophy className="w-4 h-4" /> Benchmark Adaptation: "{refData.sourceTitle}"
        </span>
        <button
          type="button"
          onClick={() => refData.appliedPrompts && onAdopt(refData.appliedPrompts)}
          className="px-2.5 py-1 rounded bg-[#8B5CF6] text-[#F2EEE6] text-[10px] font-bold hover:bg-[#7C3AED] transition-all flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Adapt Choices
        </button>
      </div>

      {refData.appliedPrompts?.imagePrompt && (
        <div className="p-2.5 rounded bg-[#101722] border border-[#1E2B3E] font-mono text-[11px] text-[#F2EEE6]">
          {refData.appliedPrompts.imagePrompt}
        </div>
      )}
    </div>
  );
};
