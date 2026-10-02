import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { MaintenanceIssue, ZoneId } from '../../../types';
import {
  Compass,
  Wrench,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Bot,
  User,
  ShieldCheck,
  Search,
  Sparkles,
  Camera,
  Activity,
} from 'lucide-react';

export const MaintenanceModule: React.FC = () => {
  const {
    maintenanceIssues,
    createWorkOrder,
    updateIssueStatus,
    resolveMaintenanceIssue,
    locateOn3DTwin,
    rooms,
  } = useResortOS();
  const { isLight } = useTheme();

  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    maintenanceIssues[0]?.id || ''
  );
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for creating work order
  const [title, setTitle] = useState('');
  const [roomOrFacility, setRoomOrFacility] = useState('Room 204');
  const [zoneId, setZoneId] = useState<ZoneId>('ocean-villas');
  const [equipment, setEquipment] = useState('Daikin Inverter AC');
  const [priority, setPriority] = useState<MaintenanceIssue['priority']>('Medium');
  const [assignedTechnician, setAssignedTechnician] = useState('Rajesh Kumar (HVAC Lead)');
  const [guestReportText, setGuestReportText] = useState('');

  const selectedIssue =
    maintenanceIssues.find((i) => i.id === selectedIssueId) || maintenanceIssues[0];

  const filteredIssues = maintenanceIssues.filter((iss) => {
    const matchesStatus = filterStatus === 'All' || iss.status === filterStatus;
    const matchesSearch =
      iss.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.roomOrFacility.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newIssue = createWorkOrder({
      title,
      roomOrFacility,
      roomNumber: roomOrFacility,
      zoneId,
      equipment,
      priority,
      severity: 'Operational Impact',
      assignedTechnician,
      status: 'IN PROGRESS',
      estDowntime: '30 mins',
      isPreventive: false,
      trace: {
        guestReport: guestReportText || `Reported by staff: ${title} at ${roomOrFacility}`,
        reportedBy: 'Staff Front Desk / Guest Request',
        reportedAt: 'Just now',
        aiCategory: title.toLowerCase().includes('ac') ? 'HVAC' : title.toLowerCase().includes('water') ? 'Plumbing' : 'General Maintenance',
        aiConfidence: '97.8%',
        detectedLocation: roomOrFacility,
        assignedPriority: priority,
        workOrderId: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
        assignedTechnician,
        technicianStartedAt: 'Just now',
        resolutionStatus: 'In Progress',
        resultingRoomStatus: 'Maintenance',
      },
    });

    setSelectedIssueId(newIssue.id);
    setShowModal(false);
    setTitle('');
    setGuestReportText('');
  };

  return (
    <div className={`space-y-6 ${isLight ? 'text-[#18251F]' : 'text-neutral-200'}`}>
      {/* 1. Header Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
        }`}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-editorial tracking-wide">
            05. Maintenance & Facilities Engineering
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            AI-POWERED ISSUE CLASSIFICATION · TRACEABLE RESOLUTION WORKFLOW · 3D TWIN LOCATION PINPOINTING
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
            isLight
              ? 'bg-[#18251F] text-white hover:bg-[#26332D] border-[#18251F]'
              : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f] border-[#c8aa6e]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* 2. Top Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Open Work Orders</span>
          <div className="text-xl font-bold">
            {maintenanceIssues.filter((i) => i.status !== 'Resolved').length}
          </div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Active facility repair requests
          </span>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">AI Diagnostics Accuracy</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">98.2%</div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Sensor telemetry + NLP classification
          </span>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Average Resolution Time</span>
          <div className="text-xl font-bold text-[#8F6834] dark:text-[#c8aa6e]">28 Mins</div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Automated technician routing
          </span>
        </div>
      </div>

      {/* 3. Section: ISSUE TRACE (Hackathon Highlight) */}
      {selectedIssue && (
        <div
          className={`p-5 sm:p-6 border space-y-4 ${
            isLight
              ? 'bg-[#E7E4DC] border-[#8F6834] shadow-sm'
              : 'bg-white/[0.04] border-[#c8aa6e]/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-inherit">
            <div>
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                  LIVE ISSUE TRACE · {selectedIssue.ticketId}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                    selectedIssue.status === 'Resolved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {selectedIssue.status}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                Audit how this problem was detected, diagnosed by AI, routed to engineering, and verified for resolution.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => locateOn3DTwin(selectedIssue.zoneId)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-[#EEECE4] hover:bg-[#DCD9CC] text-[#18251F] border-[#B8AD9B]'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Locate on 3D Twin</span>
              </button>

              {selectedIssue.status !== 'Resolved' && (
                <button
                  onClick={() => resolveMaintenanceIssue(selectedIssue.id)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved & Update Room</span>
                </button>
              )}
            </div>
          </div>

          {/* Visual Step-by-Step Trace Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            {/* Step 1: Guest / Staff Report */}
            <div
              className={`p-3.5 border rounded space-y-1.5 ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold uppercase">
                <span>Step 1: Detection</span>
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold">Guest / Staff Report</div>
              <p className={`text-[11px] leading-relaxed italic ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
                "{selectedIssue.trace?.guestReport || selectedIssue.title}"
              </p>
              <div className="text-[10px] text-neutral-500 pt-1">
                By: {selectedIssue.trace?.reportedBy || 'Resort Sensor'} · {selectedIssue.loggedAt}
              </div>
            </div>

            {/* Step 2: AI Classification & Room Identification */}
            <div
              className={`p-3.5 border rounded space-y-1.5 ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold uppercase">
                <span>Step 2: AI Diagnosis</span>
                <Bot className="w-3.5 h-3.5 text-[#8F6834] dark:text-[#c8aa6e]" />
              </div>
              <div className="font-bold">Category & Room ID</div>
              <div className="space-y-0.5 text-[11px]">
                <div>Category: <strong>{selectedIssue.trace?.aiCategory || 'HVAC'}</strong></div>
                <div>Location: <strong>{selectedIssue.roomOrFacility}</strong></div>
                <div>Priority: <strong>{selectedIssue.priority} Priority</strong></div>
                <div>Confidence: <strong>{selectedIssue.trace?.aiConfidence || '98%'}</strong></div>
              </div>
            </div>

            {/* Step 3: Work Order & Tech Dispatch */}
            <div
              className={`p-3.5 border rounded space-y-1.5 ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold uppercase">
                <span>Step 3: Engineering</span>
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold">Work Order & Dispatch</div>
              <div className="space-y-0.5 text-[11px]">
                <div>Work Order: <strong>{selectedIssue.ticketId}</strong></div>
                <div>Assigned: <strong>{selectedIssue.assignedTechnician}</strong></div>
                <div>Equipment: <strong>{selectedIssue.equipment}</strong></div>
                <div>Est. Downtime: <strong>{selectedIssue.estDowntime}</strong></div>
              </div>
            </div>

            {/* Step 4: Repair & Room Status Lifecycle Handover */}
            <div
              className={`p-3.5 border rounded space-y-1.5 ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold uppercase">
                <span>Step 4: Lifecycle Handover</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="font-bold">Inspection & Room State</div>
              <div className="space-y-0.5 text-[11px]">
                <div>
                  Status:{' '}
                  <strong className={selectedIssue.status === 'Resolved' ? 'text-emerald-500' : 'text-amber-500'}>
                    {selectedIssue.status === 'Resolved' ? 'REPAIRED & TESTED' : 'IN REPAIR'}
                  </strong>
                </div>
                <div>
                  Room Result:{' '}
                  <strong>
                    {selectedIssue.status === 'Resolved' ? 'Marked Operational' : 'Marked Maintenance'}
                  </strong>
                </div>
                <p className="text-[10px] text-neutral-500 pt-0.5">
                  {selectedIssue.trace?.inspectionNotes || 'Inspection verification automatically synchronizes with Front Desk.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work order #, equipment, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs font-mono border focus:outline-none ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10 text-white'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['All', 'IN PROGRESS', 'Resolved', 'Open'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                filterStatus === st
                  ? isLight
                    ? 'bg-[#18251F] text-white border-[#18251F]'
                    : 'bg-white/15 text-white border-white/20'
                  : isLight
                  ? 'border-transparent text-[#68716B] hover:text-[#18251F]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Work Orders Table */}
      <div
        className={`border overflow-x-auto ${
          isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
        }`}
      >
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr
              className={`border-b ${
                isLight ? 'border-[#D0CCC0] bg-[#E5E2D6] text-[#18251F]' : 'border-white/10 bg-white/[0.03] text-neutral-300'
              }`}
            >
              <th className="p-3.5">Ticket #</th>
              <th className="p-3.5">Issue Description</th>
              <th className="p-3.5">Facility / Room</th>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Assigned Technician</th>
              <th className="p-3.5">Logged</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {filteredIssues.map((iss) => {
              const isSelected = selectedIssueId === iss.id;
              return (
                <tr
                  key={iss.id}
                  onClick={() => setSelectedIssueId(iss.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? isLight
                        ? 'bg-[#E5E2D6]'
                        : 'bg-white/[0.06]'
                      : 'hover:bg-black/5 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="p-3.5 font-bold text-[#8F6834] dark:text-[#c8aa6e]">
                    {iss.ticketId}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{iss.title}</div>
                    <div className="text-[11px] text-neutral-500">{iss.equipment}</div>
                  </td>
                  <td className="p-3.5 font-medium">{iss.roomOrFacility}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        iss.priority === 'Critical'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : iss.priority === 'High'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {iss.priority}
                    </span>
                  </td>
                  <td className="p-3.5">{iss.assignedTechnician}</td>
                  <td className="p-3.5 text-neutral-500">{iss.loggedAt}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        iss.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {iss.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssueId(iss.id);
                      }}
                      className="px-2 py-1 text-[10px] uppercase font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Trace
                    </button>
                    {iss.status !== 'Resolved' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveMaintenanceIssue(iss.id);
                        }}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border cursor-pointer ${
                          isLight
                            ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                            : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                        }`}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. New Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg p-6 border space-y-4 ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className="text-lg font-editorial">Create Maintenance Work Order</h3>
              <button onClick={() => setShowModal(false)} className="cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block mb-1 font-semibold">Issue Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AC fan rattling or bathroom tap leaking"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Room / Location</label>
                  <select
                    value={roomOrFacility}
                    onChange={(e) => setRoomOrFacility(e.target.value)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    {rooms.map((rm) => (
                      <option key={rm.id} value={rm.number}>
                        {rm.number} ({rm.type})
                      </option>
                    ))}
                    <option value="Main Pool Deck">Main Pool Deck</option>
                    <option value="Palm Terrace Kitchen">Palm Terrace Kitchen</option>
                    <option value="Lobby Entrance">Lobby Entrance</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Equipment / Asset</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="e.g. Daikin Inverter AC, Jaquar Tap"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Assigned Technician</label>
                <select
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                >
                  <option value="Rajesh Kumar (HVAC Lead)">Rajesh Kumar (HVAC Lead)</option>
                  <option value="Vikram Singh (Plumbing Lead)">Vikram Singh (Plumbing Lead)</option>
                  <option value="Manoj Pillai (Pool & Electrical)">Manoj Pillai (Pool & Electrical)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Original Guest / Staff Notes</label>
                <textarea
                  rows={2}
                  value={guestReportText}
                  onChange={(e) => setGuestReportText(e.target.value)}
                  placeholder="Describe original complaint..."
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 py-2.5 font-bold uppercase tracking-wider cursor-pointer border ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Dispatch Work Order & Trace
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2.5 uppercase border cursor-pointer ${
                    isLight ? 'border-[#D0CCC0]' : 'border-white/10 text-neutral-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
