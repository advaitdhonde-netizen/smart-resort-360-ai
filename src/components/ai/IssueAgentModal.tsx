import React, { useState, useRef, useMemo } from 'react';
import { aiService, IssueTicket, buildResortContextSummary } from '../../services/aiService';
import { useResortOS } from '../../context/ResortOSContext';
import {
  X,
  AlertTriangle,
  Upload,
  Camera,
  CheckCircle2,
  Wrench,
  Clock,
  Sparkles,
  Shield,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface IssueAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  reportedBy?: string;
}

export const IssueAgentModal: React.FC<IssueAgentModalProps> = ({
  isOpen,
  onClose,
  defaultLocation = 'Room 204',
  reportedBy = 'Staff / Guest',
}) => {
  const resortOS = useResortOS();
  const [complaint, setComplaint] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<IssueTicket | null>(null);
  const [issueHistory, setIssueHistory] = useState<IssueTicket[]>([
    {
      ticketId: 'TKT-904122',
      category: 'HVAC',
      affectedArea: 'Room 204 Split AC',
      severity: 'HIGH',
      urgency: 'IMMEDIATE',
      assignedDepartment: 'Engineering',
      assignedTechnician: 'Suresh Verma (Senior HVAC)',
      troubleshootingSteps: ['Check refrigerant circuit pressures', 'Inspect blower fan assembly', 'Test distribution board circuit breaker'],
      technicianSummary: 'HVAC cooling cycle diagnostic in progress. Split AC indoor unit blower vibration reported.',
      status: 'DISPATCHED',
      reportedAt: '10:14 AM Today',
      originalComplaint: 'Split AC indoor blower making mild rattling sound, low cooling.',
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageBase64(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSamplePhoto = () => {
    // Simulated realistic photo attachment for fast testing
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 400;
    sampleCanvas.height = 300;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#141820';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#c8aa6e';
      ctx.font = '14px monospace';
      ctx.fillText('[THERMAL SENSOR ANOMALY: ROOM 204 AC VENT]', 20, 150);
      const dataUrl = sampleCanvas.toDataURL('image/jpeg');
      setImageBase64(dataUrl);
      setImagePreview(dataUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorText(null);
    try {
      const res = await aiService.reportIssue({
        complaint: complaint.trim(),
        location,
        imageBase64: imageBase64 || undefined,
        reportedBy,
        context: liveContext,
      });

      setGeneratedTicket(res.ticket);
      setIssueHistory((prev) => [res.ticket, ...prev]);
    } catch (err: any) {
      console.error('Failed to submit issue to Gemini agent:', err);
      setErrorText(
        err.message?.includes('not configured')
          ? 'AI Issue Agent is not configured. Add GEMINI_API_KEY to the server environment.'
          : `Gemini Issue Triage Error: ${err.message || 'Unable to connect to AI server.'}`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setComplaint('');
    setImageBase64(null);
    setImagePreview(null);
    setGeneratedTicket(null);
    setErrorText(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#050505]/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#090b10] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent" />
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 text-[#c8aa6e]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c8aa6e]">
                AUTONOMOUS TRIAGE ENGINE
              </div>
              <h2 className="text-lg sm:text-xl font-editorial text-white">
                Dedicated AI Issue Agent
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {generatedTicket ? (
            /* Result Ticket View */
            <div className="p-6 bg-white/[0.02] border border-emerald-500/30 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-mono text-[#c8aa6e]">{generatedTicket.ticketId}</span>
                    <h3 className="text-lg font-editorial text-white">
                      Ticket Dispatched: {generatedTicket.category} Issue
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 uppercase ${
                      generatedTicket.severity === 'CRITICAL'
                        ? 'text-red-400 bg-red-400/10 border border-red-400/30'
                        : generatedTicket.severity === 'HIGH'
                        ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                        : 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30'
                    }`}
                  >
                    {generatedTicket.severity} SEVERITY
                  </span>
                  <span className="px-2 py-0.5 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 uppercase">
                    {generatedTicket.urgency}
                  </span>
                </div>
              </div>

              {/* Parsed Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-neutral-500 text-[11px] block">Assigned Department</span>
                  <span className="text-white font-medium">{generatedTicket.assignedDepartment}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-neutral-500 text-[11px] block">Assigned Specialist</span>
                  <span className="text-[#c8aa6e] font-medium">{generatedTicket.assignedTechnician}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-neutral-500 text-[11px] block">Affected Area</span>
                  <span className="text-white font-medium">{generatedTicket.affectedArea}</span>
                </div>
              </div>

              {/* Technician Summary */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs font-mono">
                <span className="text-[#c8aa6e] uppercase tracking-wider block">
                  Concise Technician Summary:
                </span>
                <p className="text-neutral-200 leading-relaxed font-light">
                  {generatedTicket.technicianSummary}
                </p>
                {generatedTicket.imageAnalysis && (
                  <div className="text-[11px] text-cyan-300 pt-2 border-t border-white/[0.05]">
                    {generatedTicket.imageAnalysis}
                  </div>
                )}
              </div>

              {/* Suggested Troubleshooting Steps */}
              <div className="space-y-2 text-xs font-mono">
                <span className="text-neutral-400 uppercase tracking-wider block">
                  AI Recommended Diagnostic Protocol:
                </span>
                <ul className="space-y-1 text-neutral-300">
                  {generatedTicket.troubleshootingSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#c8aa6e]">0{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-white text-xs font-mono uppercase transition-colors cursor-pointer"
                >
                  Report Another Anomaly
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] text-xs font-mono uppercase font-semibold transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-neutral-400 block">
                  Describe Anomaly or Complaint (Natural Language)
                </label>
                <textarea
                  required
                  rows={3}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="e.g. 'The AC in Room 204 is not cooling properly and making a faint whistling sound at night...'"
                  className="w-full p-3.5 bg-white/[0.03] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c8aa6e]/60 font-light resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-neutral-400 block">Room / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#c8aa6e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block">Reported By</label>
                  <input
                    type="text"
                    value={reportedBy}
                    disabled
                    className="w-full p-2.5 bg-white/[0.01] border border-white/5 text-neutral-400"
                  />
                </div>
              </div>

              {/* Multimodal Image Attachment */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 uppercase flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#c8aa6e]" />
                    Visual Diagnostic Evidence (Multimodal AI Vision)
                  </span>
                  <button
                    type="button"
                    onClick={handleSamplePhoto}
                    className="text-[11px] text-[#c8aa6e] hover:underline cursor-pointer"
                  >
                    + Attach Sample Anomaly Photo
                  </button>
                </div>

                {imagePreview ? (
                  <div className="relative inline-block border border-white/20 p-1">
                    <img src={imagePreview} alt="Issue preview" className="w-48 h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageBase64(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full cursor-pointer hover:bg-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border border-dashed border-white/15 hover:border-[#c8aa6e]/60 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-1" />
                    <span className="text-xs font-mono text-neutral-400">
                      Upload photo of leak, HVAC vent, or damaged fixture (optional)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3 bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(200,170,110,0.25)]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'AI Analyzing Complaint & Image...' : 'Triage Anomaly via AI Issue Agent'}</span>
              </button>
            </form>
          )}

          {/* Issue History Stream */}
          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            <span className="text-xs font-mono uppercase text-neutral-400 block tracking-wider">
              Recent Issue History & Resolution Telemetry
            </span>
            <div className="space-y-2">
              {issueHistory.map((hist) => (
                <div
                  key={hist.ticketId}
                  className="p-3 bg-white/[0.02] border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div>
                    <span className="text-[#c8aa6e] font-medium">{hist.ticketId}</span>
                    <span className="text-white ml-2">{hist.category} · {hist.affectedArea}</span>
                    <div className="text-[11px] text-neutral-500 truncate max-w-lg mt-0.5">
                      {hist.originalComplaint}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 text-[10px]">
                      {hist.status}
                    </span>
                    <span className="text-neutral-500 text-[11px]">{hist.reportedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
