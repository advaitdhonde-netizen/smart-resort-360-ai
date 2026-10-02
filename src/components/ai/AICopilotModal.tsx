import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  aiService,
  OperationsBriefing,
  ConsequentialActionRequest,
  CopilotAction,
  buildResortContextSummary,
} from '../../services/aiService';
import { useResortOS } from '../../context/ResortOSContext';
import {
  X,
  Sparkles,
  Send,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Wrench,
  Package,
  Layers,
  ShieldAlert,
  Clock,
  MessageSquare,
  HelpCircle,
  Database,
  RotateCcw,
  RefreshCw,
  CornerDownLeft,
  AlertCircle,
  ExternalLink,
  Bot,
} from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  suggestedAction?: CopilotAction;
  error?: boolean;
  timestamp: string;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  const resortOS = useResortOS();
  const [activeTab, setActiveTab] = useState<
    'copilot' | 'briefing' | 'housekeeping' | 'maintenance' | 'inventory' | 'anomalies' | 'consequential'
  >('copilot');

  // Multi-Turn Copilot Chat state
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'ai',
      text: 'Good day. I am Smart Resort 360 Copilot, your intelligent resort operations assistant powered by the Gemini API. I have live operational visibility into room occupancy, housekeeping turnaround, BMS engineering tickets, restaurant covers, inventory stock, and weather telemetry. Ask me any question, diagnostic inquiry, or what-if scenario.',
      sources: ['Smart Resort 360 Core OS', 'PMS Room Ledger', 'BMS Telemetry'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Operations Briefing state
  const [briefing, setBriefing] = useState<OperationsBriefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  // Consequential Action state
  const [actionType, setActionType] = useState<ConsequentialActionRequest['actionType']>('CANCEL_RESERVATION');
  const [actionTarget, setActionTarget] = useState('Reservation RES-2026-801 (Aarav Sharma)');
  const [pendingConfirmation, setPendingConfirmation] = useState<ConsequentialActionRequest | null>(null);
  const [actionExecutedNotice, setActionExecutedNotice] = useState<string | null>(null);

  // Build live compact structured resort context
  const liveContext = useMemo(() => {
    return buildResortContextSummary({
      rooms: resortOS.rooms,
      reservations: resortOS.reservations,
      guests: resortOS.guests,
      housekeepingTasks: resortOS.housekeepingTasks,
      maintenanceIssues: resortOS.maintenanceIssues,
      restaurantTables: resortOS.restaurantTables,
      kitchenOrders: resortOS.kitchenOrders,
      inventoryItems: resortOS.inventoryItems,
      guestBills: resortOS.guestBills,
      analytics: resortOS.analytics,
    });
  }, [
    resortOS.rooms,
    resortOS.reservations,
    resortOS.guests,
    resortOS.housekeepingTasks,
    resortOS.maintenanceIssues,
    resortOS.restaurantTables,
    resortOS.kitchenOrders,
    resortOS.inventoryItems,
    resortOS.guestBills,
    resortOS.analytics,
  ]);

  useEffect(() => {
    if (isOpen && !briefing) {
      loadBriefing();
    }
  }, [isOpen]);

  // Auto-scroll on new message or stream chunk
  useEffect(() => {
    if (activeTab === 'copilot') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, isStreaming, activeTab]);

  if (!isOpen) return null;

  const loadBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const data = await aiService.getOperationsBriefing();
      setBriefing(data.briefing);
    } catch (err) {
      console.error('Failed to load briefing:', err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading || isStreaming) return;

    const userMsgId = `usr-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Multi-turn history formatted for Gemini
    const history = chatLog
      .filter((m) => !m.error)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

    setChatLog((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text, timestamp },
      { id: aiMsgId, sender: 'ai', text: '', sources: ['Gemini Operations Engine'], timestamp },
    ]);
    setQueryInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setLastFailedQuery(null);

    try {
      const res = await aiService.askCopilotStream(
        text,
        userRole,
        history,
        liveContext,
        (chunk) => {
          setChatLog((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, text: msg.text + chunk } : msg
            )
          );
        }
      );

      setChatLog((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                text: res.answer || msg.text,
                sources: res.groundedSources || ['Smart Resort 360 Core OS'],
                suggestedAction: res.suggestedAction,
              }
            : msg
        )
      );
    } catch (err: any) {
      console.error('AI Copilot error:', err);
      setLastFailedQuery(text);
      const isMissingConfig = err.message?.includes('not configured');
      const errText = isMissingConfig
        ? 'AI Copilot is not configured. Add GEMINI_API_KEY to the server environment.'
        : `Gemini Operational Reasoning Error: ${err.message || 'Unable to connect to AI server.'}`;

      setChatLog((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                text: errText,
                error: true,
                sources: ['Error State'],
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      // Remove failed message from chat log and re-send
      setChatLog((prev) => prev.filter((m) => !m.error));
      handleSendQuery(lastFailedQuery);
    }
  };

  const handleClearConversation = () => {
    setChatLog([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: 'Conversation session cleared. Smart Resort 360 Copilot is ready. Ask any arbitrary question regarding occupancy, room turnover, engineering issues, restaurant demand, or weather impact simulations.',
        sources: ['Smart Resort 360 Core OS'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLastFailedQuery(null);
  };

  const handleExecuteAction = (action: CopilotAction) => {
    if (action.type === 'CREATE_HOUSEKEEPING_TASK') {
      resortOS.createHousekeepingTask({
        roomNumber: action.payload?.roomNumber || 'Room 204',
        roomType: 'Deluxe Room',
        guestName: 'Assigned via Copilot',
        taskType: action.payload?.taskType || 'Turnover Cleaning',
        priority: action.payload?.priority || 'High',
        status: 'Pending',
        assignedStaff: 'Sunita Devi',
        estMinutes: 30,
        notes: 'Dispatched via AI Copilot recommendation.',
        linenStatus: 'Fresh Linens Stocked',
      });
      setExecutedActions((prev) => ({ ...prev, [action.label]: true }));
    } else if (action.type === 'CREATE_MAINTENANCE_TICKET') {
      const roomNum = action.payload?.area || 'Room 204';
      resortOS.createWorkOrder({
        title: `Work Order: ${action.payload?.category || 'HVAC'} Diagnostic`,
        roomOrFacility: roomNum,
        roomNumber: roomNum,
        zoneId: roomNum.toLowerCase().includes('villa') ? 'ocean-villas' : 'central-pavilion',
        equipment: action.payload?.category ? `${action.payload.category} Unit` : 'Air Conditioning Unit',
        priority: 'High',
        severity: 'Operational Impact',
        status: 'Open',
        assignedTechnician: 'Suresh Verma',
        estDowntime: '45 mins',
        isPreventive: false,
      });
      setExecutedActions((prev) => ({ ...prev, [action.label]: true }));
    } else if (action.type === 'OPEN_MODULE') {
      if (action.payload?.module) {
        resortOS.setActiveModule(action.payload.module);
        onClose();
      }
    } else if (action.type === 'VIEW_3D_ZONE') {
      if (action.payload?.zoneId) {
        resortOS.locateOn3DTwin(action.payload.zoneId);
        onClose();
      }
    }
  };

  const triggerConsequentialAction = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingConfirmation({
      actionType,
      payload: { target: actionTarget, initiatedBy: userRole, timestamp: new Date().toISOString() },
      userConfirmed: false,
    });
  };

  const handleApproveAction = async () => {
    if (!pendingConfirmation) return;
    try {
      const res = await aiService.executeConsequentialAction({
        ...pendingConfirmation,
        userConfirmed: true,
      });
      setActionExecutedNotice(
        `Action '${pendingConfirmation.actionType}' approved and executed. Audit receipt: ${res.auditReceipt || 'AUD-OK'}`
      );
      setPendingConfirmation(null);
      setTimeout(() => setActionExecutedNotice(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const quickPrompts = [
    'What is the current occupancy?',
    'Which rooms need housekeeping?',
    'Which rooms are under maintenance?',
    'Why is Room 204 unavailable?',
    "What is today's restaurant revenue?",
    'Show me low-stock inventory.',
    'What happens if rainfall reaches 80mm?',
    'Which outdoor operations are affected by rain?',
    'What should management focus on right now?',
    "Give me a summary of today's resort operations.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#050505]/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] bg-[#090b10] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Gold Hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent" />

        {/* Master Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 text-[#c8aa6e]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c8aa6e] flex items-center gap-2">
                <span>GEMINI-POWERED OPERATIONAL INTELLIGENCE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-lg sm:text-xl font-editorial text-white">
                Smart Resort 360 AI Copilot
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 bg-white/[0.03] px-3 py-1 border border-white/10">
              ROLE: {userRole}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
              title="Close Copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Intelligence Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/[0.08] px-6 py-2 bg-white/[0.015] text-xs font-mono">
          {[
            { id: 'copilot', label: 'RESORT COPILOT CHAT', icon: MessageSquare },
            { id: 'briefing', label: 'OPERATIONS BRIEFING', icon: FileText },
            { id: 'housekeeping', label: 'HOUSEKEEPING ASSISTANT', icon: Clock },
            { id: 'maintenance', label: 'MAINTENANCE INTELLIGENCE', icon: Wrench },
            { id: 'inventory', label: 'INVENTORY RISKS', icon: Package },
            { id: 'anomalies', label: 'ANOMALY DETECTION', icon: AlertTriangle },
            { id: 'consequential', label: 'CONSEQUENTIAL ACTIONS', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'border-[#c8aa6e]/60 bg-white/[0.06] text-white font-medium'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#c8aa6e]' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: RESORT COPILOT CHAT WITH MULTI-TURN MEMORY & REAL GEMINI */}
        {activeTab === 'copilot' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden p-4 sm:p-6 space-y-3">
            {/* Toolbar: Clear Chat & Shortcuts */}
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                <Bot className="w-3.5 h-3.5 text-[#c8aa6e]" />
                <span>Conversational AI Assistant (Arbitrary Natural Language Queries)</span>
              </div>
              <button
                onClick={handleClearConversation}
                className="px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear conversation history"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">
                Suggested Shortcuts (Click to ask or type your own question):
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendQuery(prompt)}
                    disabled={isLoading || isStreaming}
                    className="px-3 py-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#c8aa6e]/50 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer text-left shrink-0 whitespace-nowrap disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Conversation Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {chatLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 text-xs font-mono leading-relaxed space-y-2 max-w-[92%] ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-[#c8aa6e]/15 border border-[#c8aa6e]/40 text-white'
                      : msg.error
                      ? 'mr-auto bg-red-950/20 border border-red-500/40 text-red-200'
                      : 'mr-auto bg-white/[0.02] border border-white/[0.07] text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pb-1 border-b border-white/[0.05]">
                    <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      {msg.sender === 'user' ? (
                        <>You ({userRole})</>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-[#c8aa6e]" />
                          <span>Smart Resort 360 Copilot</span>
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-3">
                      {msg.sources && msg.sources.length > 0 && (
                        <span className="text-[#c8aa6e] flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          <span>Sources: {msg.sources.join(', ')}</span>
                        </span>
                      )}
                      {msg.timestamp && (
                        <span className="text-neutral-500">{msg.timestamp}</span>
                      )}
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="whitespace-pre-line font-light">
                    {msg.text || (
                      <span className="inline-flex items-center gap-1.5 text-neutral-400">
                        <span className="w-2 h-2 rounded-full bg-[#c8aa6e] animate-ping" />
                        Generating response with Gemini...
                      </span>
                    )}
                  </div>

                  {/* Suggested Action Card if generated */}
                  {msg.suggestedAction && (
                    <div className="mt-3 p-3 bg-white/[0.04] border border-[#c8aa6e]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c8aa6e]" />
                        <span className="text-xs text-white font-medium">
                          {msg.suggestedAction.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleExecuteAction(msg.suggestedAction!)}
                        disabled={executedActions[msg.suggestedAction.label]}
                        className={`px-3 py-1.5 text-[11px] font-mono uppercase font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          executedActions[msg.suggestedAction.label]
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#c8aa6e] hover:bg-[#d8bc7f] text-black border-[#c8aa6e]'
                        }`}
                      >
                        {executedActions[msg.suggestedAction.label] ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Action Dispatched</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3 h-3" />
                            <span>Execute Action</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Error state with Retry button */}
                  {msg.error && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-red-300 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        Gemini request failed. Your conversation history is preserved.
                      </span>
                      <button
                        onClick={handleRetry}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin-reverse" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming pulse indicator */}
              {isStreaming && (
                <div className="p-3 bg-white/[0.02] border border-white/[0.05] text-xs font-mono text-[#c8aa6e] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Streaming operational reasoning from Gemini...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Query Input Area with multi-line and Enter/Shift+Enter */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(queryInput);
              }}
              className="space-y-2 pt-2 border-t border-white/[0.08]"
            >
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendQuery(queryInput);
                    }
                  }}
                  rows={2}
                  placeholder="Ask any arbitrary question (e.g., 'What happens if rainfall reaches 80mm?', 'Why is Room 204 unavailable?')... (Enter to send, Shift+Enter for newline)"
                  className="flex-1 p-3 bg-white/[0.03] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c8aa6e] font-mono resize-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || isStreaming || !queryInput.trim()}
                  className="px-5 bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] text-xs font-mono uppercase font-semibold transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-[10px]">Send</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
                <span>Enter to send · Shift+Enter for new line</span>
                <span>Context: 24 Rooms & Villas · Live Telemetry · Weather State Attached</span>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: AI OPERATIONS BRIEFING */}
        {activeTab === 'briefing' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono uppercase text-[#c8aa6e]">EXECUTIVE COCKPIT</span>
                <h3 className="text-xl font-editorial text-white">Daily Operational Briefing</h3>
              </div>
              <button
                onClick={loadBriefing}
                className="px-3 py-1.5 text-xs font-mono uppercase text-neutral-300 hover:text-white bg-white/[0.04] border border-white/10 cursor-pointer"
              >
                Refresh Data
              </button>
            </div>

            {briefing && (
              <div className="space-y-6 text-xs font-mono">
                {/* Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-neutral-500 block">OCCUPANCY</span>
                    <span className="text-white text-base font-medium">{briefing.occupancy}</span>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-neutral-500 block">RESTAURANT LOAD</span>
                    <span className="text-white text-base font-medium">{briefing.restaurantLoad}</span>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-neutral-500 block">HOUSEKEEPING</span>
                    <span className="text-amber-400 text-base font-medium">{briefing.housekeepingBacklog}</span>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-neutral-500 block">CRITICAL TICKETS</span>
                    <span className="text-red-400 text-base font-medium">1 Active Ticket</span>
                  </div>
                </div>

                {/* Narrative Sections */}
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[#c8aa6e] uppercase tracking-wider block">Arrivals & Departures:</span>
                    <p className="text-neutral-300 leading-relaxed font-light">{briefing.arrivalsSummary}</p>
                    <p className="text-neutral-400 font-light">{briefing.departuresSummary}</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[#c8aa6e] uppercase tracking-wider block">Critical Maintenance & Plant Health:</span>
                    <p className="text-neutral-300 leading-relaxed font-light">{briefing.criticalMaintenance}</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[#c8aa6e] uppercase tracking-wider block">Inventory Par Threshold Warnings:</span>
                    <p className="text-neutral-300 leading-relaxed font-light">{briefing.inventoryRisks}</p>
                  </div>

                  <div className="p-5 bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 space-y-2">
                    <div className="flex items-center gap-2 text-[#c8aa6e] font-semibold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Executive Action Directives:</span>
                    </div>
                    <p className="text-white leading-relaxed font-light">{briefing.aiRecommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI HOUSEKEEPING ASSISTANT */}
        {activeTab === 'housekeeping' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono uppercase text-[#c8aa6e]">DYNAMIC FLEET DISPATCH</span>
                <h3 className="text-xl font-editorial text-white">AI Housekeeping Turnaround Optimizer</h3>
              </div>
              <span className="text-emerald-400">ARRIVAL RADAR SYNCHRONIZED</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-neutral-400 uppercase tracking-wider block">AI Suggested Turnaround Sequencing:</span>
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white/[0.02] border-l-2 border-red-400 space-y-1">
                    <div className="flex justify-between text-white font-medium">
                      <span>#1. Room 202 (Checkout Turnover Cleaning)</span>
                      <span className="text-red-400 uppercase">PRIORITY 1: HIGH</span>
                    </div>
                    <p className="text-neutral-400 font-light">
                      Reasoning: Guest checked out at 10:45 AM. Next arrival allocated for 14:00 PM. Assigned to Sunita Devi (~15 mins remaining).
                    </p>
                  </div>

                  <div className="p-3 bg-white/[0.02] border-l-2 border-amber-400 space-y-1">
                    <div className="flex justify-between text-white font-medium">
                      <span>#2. Villa 02 (Pre-Arrival Inspection)</span>
                      <span className="text-amber-400 uppercase">PRIORITY 2: SCHEDULED</span>
                    </div>
                    <p className="text-neutral-400 font-light">
                      Reasoning: Rahul Kulkarni arriving at 16:00 PM. Requires pool deck check and AC pre-cooling before arrival.
                    </p>
                  </div>

                  <div className="p-3 bg-white/[0.02] border-l-2 border-cyan-400 space-y-1">
                    <div className="flex justify-between text-white font-medium">
                      <span>#3. Room 104 (Stayover Linen Refresh)</span>
                      <span className="text-cyan-400 uppercase">PRIORITY 3: ROUTINE</span>
                    </div>
                    <p className="text-neutral-400 font-light">
                      Reasoning: Sneha Joshi requested fresh towels and extra pillows during afternoon service window.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI MAINTENANCE INTELLIGENCE */}
        {activeTab === 'maintenance' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono uppercase text-[#c8aa6e]">RECURRING ANOMALY CORRELATION</span>
                <h3 className="text-xl font-editorial text-white">AI Maintenance Predictive Intelligence</h3>
              </div>
              <span className="text-[#c8aa6e]">HVAC DIAGNOSTIC TELEMETRY</span>
            </div>

            <div className="p-5 bg-white/[0.02] border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Issue Pattern Detected on Room 204:</span>
              </div>
              <p className="text-neutral-200 leading-relaxed font-light">
                &ldquo;Room 204 Daikin Split AC has had two low-cooling tickets this week (MNT-098, MNT-101). The indoor blower filter is clogged and refrigerant pressure is slightly lower than normal.&rdquo;
              </p>

              <div className="p-4 bg-black/40 border border-white/10 space-y-2">
                <span className="text-white font-semibold block">AI Suggested Action:</span>
                <p className="text-neutral-300 font-light">
                  Clean evaporator coil filters and top up R-32 refrigerant. Assigned to technician Suresh Verma. Estimated completion: 45 minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI INVENTORY INTELLIGENCE */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono uppercase text-[#c8aa6e]">PREDICTIVE REPLENISHMENT</span>
                <h3 className="text-xl font-editorial text-white">AI Supply Chain & Restock Triggers</h3>
              </div>
              <span className="text-cyan-400">PAR LEVEL TELEMETRY</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white/[0.02] border border-white/[0.06] space-y-3">
                <span className="text-[#c8aa6e] uppercase tracking-wider block">Low Stock Alert & Reorder Triggers:</span>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white">Dehradun Basmati Rice (25kg)</span>
                    <span className="text-red-400">4 Bags (Min: 6)</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    High weekend kitchen consumption. Suggest auto-PO for 8 bags (₹22,400).
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                  <div className="flex justify-between">
                    <span className="text-white">Premium Bath Towels 650 GSM</span>
                    <span className="text-amber-400">35 Pcs (Min: 50)</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    High pool and room turnover demand. Suggest restock of 30 pcs (₹13,500).
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/[0.06] space-y-3">
                <span className="text-[#c8aa6e] uppercase tracking-wider block">Kitchen Provisions & Fresh Produce:</span>
                <p className="text-neutral-300 font-light leading-relaxed">
                  Daily farm supplies arrived at 06:30 AM from local organic grower cooperative. Zero food waste logged across breakfast service.
                </p>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                  F&B inventory yield running at 98.2% optimal.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI ANOMALY DETECTION */}
        {activeTab === 'anomalies' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono uppercase text-[#c8aa6e]">AUTOMATED RESORT TELEMETRY SCAN</span>
                <h3 className="text-xl font-editorial text-white">Live Operational Anomalies</h3>
              </div>
              <span className="text-emerald-400">SCAN FREQUENCY: REAL-TIME</span>
            </div>

            <div className="space-y-3">
              {[
                { title: 'AC Cooling Diagnostic (Room 204)', desc: 'Split AC low airflow reported twice during warm afternoon peak.', severity: 'HIGH', category: 'HVAC' },
                { title: 'High Demand for Extra Rollaway Beds', desc: 'Family Suite weekend check-ins required 3 additional child cots.', severity: 'MEDIUM', category: 'FRONT DESK' },
                { title: 'Early Check-in Completed (Room 101)', desc: 'Aarav Sharma checked in smoothly 45 mins before standard time.', severity: 'INFO', category: 'RESERVATIONS' },
              ].map((anomaly, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-white font-medium">{anomaly.title}</span>
                    <p className="text-neutral-400 font-light">{anomaly.desc}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-mono ${
                    anomaly.severity === 'HIGH' ? 'text-red-400 bg-red-400/10' : anomaly.severity === 'MEDIUM' ? 'text-amber-400 bg-amber-400/10' : 'text-cyan-400 bg-cyan-400/10'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CONSEQUENTIAL ACTIONS (WITH HUMAN CONFIRMATION GUARDRAIL) */}
        {activeTab === 'consequential' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400">SAFETY GUARDRAILS</span>
                <h3 className="text-xl font-editorial text-white">Consequential Actions Engine</h3>
              </div>
              <span className="text-neutral-400">HUMAN IN THE LOOP REQUIRED</span>
            </div>

            <p className="text-neutral-400 font-light">
              AI is restricted from executing consequential actions (cancellations, refunds, rate modifications, ledger charges, data deletion) without explicit human confirmation.
            </p>

            {actionExecutedNotice && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{actionExecutedNotice}</span>
              </div>
            )}

            <form onSubmit={triggerConsequentialAction} className="p-5 bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="space-y-1">
                <label className="text-neutral-400 block">Select Consequential Action</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ConsequentialActionRequest['actionType'])}
                  className="w-full p-2.5 bg-[#0e1118] border border-white/10 text-white focus:outline-none focus:border-[#c8aa6e]"
                >
                  <option value="CANCEL_RESERVATION">CANCEL_RESERVATION (Affects revenue & availability)</option>
                  <option value="ISSUE_REFUND">ISSUE_REFUND (Financial ledger disbursement)</option>
                  <option value="CHANGE_BOOKING">CHANGE_BOOKING (Room & rate reassignment)</option>
                  <option value="CHARGE_GUEST">CHARGE_GUEST (Tokenized card capture)</option>
                  <option value="CHANGE_PERMISSIONS">CHANGE_PERMISSIONS (RBAC privilege elevation)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 block">Target Resource / Guest</label>
                <input
                  type="text"
                  value={actionTarget}
                  onChange={(e) => setActionTarget(e.target.value)}
                  className="w-full p-2.5 bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#c8aa6e]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 uppercase font-semibold transition-colors cursor-pointer"
              >
                Initiate Action Draft
              </button>
            </form>

            {/* Human Confirmation Modal Dialog */}
            {pendingConfirmation && (
              <div className="p-6 bg-red-500/10 border-2 border-red-500/40 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                  <div>
                    <span className="text-xs font-mono uppercase text-red-400 font-bold block">
                      HUMAN MANAGER CONFIRMATION REQUIRED
                    </span>
                    <h4 className="text-base font-editorial text-white">
                      Confirm Consequential Action: {pendingConfirmation.actionType}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  Are you sure you want to execute <strong className="text-white">{pendingConfirmation.actionType}</strong> on <strong className="text-white">{pendingConfirmation.payload.target}</strong>? This action directly affects sovereign resort ledgers and guest contracts.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleApproveAction}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase font-semibold transition-colors cursor-pointer"
                  >
                    Approve & Execute Action
                  </button>
                  <button
                    onClick={() => setPendingConfirmation(null)}
                    className="px-4 py-2 border border-white/20 text-neutral-300 hover:text-white text-xs font-mono uppercase cursor-pointer"
                  >
                    Reject & Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
