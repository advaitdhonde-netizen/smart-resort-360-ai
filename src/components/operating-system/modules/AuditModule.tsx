import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { ShieldCheck, Search } from 'lucide-react';

export const AuditModule: React.FC = () => {
  const { auditLogs } = useResortOS();
  const { isLight } = useTheme();
  const [filterAction, setFilterAction] = useState('All');

  const filteredLogs = auditLogs.filter(
    (log) => filterAction === 'All' || log.actionType === filterAction
  );

  return (
    <div className={`space-y-6 ${isLight ? 'text-[#18251F]' : 'text-neutral-200'}`}>
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
        }`}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-editorial tracking-wide">
            12. Audit Trail & Operational Security
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            EVENT STREAM · ROLE-BASED ACCESS CONTROL PRIVILEGE LOGS · TRACEABLE AUDIT TRAIL
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>ZERO-TRUST ENCLAVE ACTIVE</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        {['All', 'AUTH_LOGIN', 'RESERVATION_CREATED', 'ROOM_STATUS_CHANGE', 'PAYMENT_CAPTURE', 'MAINTENANCE_DISPATCH', 'INVENTORY_RESTOCK'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              filterAction === act
                ? isLight
                  ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                  : 'bg-white/15 text-white border-white/20 font-bold'
                : isLight
                ? 'border-[#D0CCC0] bg-[#F0EEE7] text-[#4D5C4D]'
                : 'border-white/10 text-neutral-400'
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div
        className={`border overflow-x-auto ${
          isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-[#07090d] border-white/[0.08]'
        }`}
      >
        <table className="w-full text-left text-xs font-mono">
          <thead
            className={`border-b ${
              isLight ? 'bg-[#E5E2D6] border-[#D0CCC0] text-[#18251F]' : 'bg-white/[0.03] border-white/10 text-neutral-400'
            }`}
          >
            <tr>
              <th className="py-3 px-4 uppercase tracking-wider">Timestamp</th>
              <th className="py-3 px-4 uppercase tracking-wider">Actor / Role</th>
              <th className="py-3 px-4 uppercase tracking-wider">Action Type</th>
              <th className="py-3 px-4 uppercase tracking-wider">Target Resource</th>
              <th className="py-3 px-4 uppercase tracking-wider">Operational Details</th>
              <th className="py-3 px-4 uppercase tracking-wider">Node IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">{log.timestamp}</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">{log.actor}</div>
                  <div className="text-[11px] text-[#8F6834] dark:text-[#c8aa6e]">{log.role}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono text-cyan-700 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-500/10 border border-cyan-500/20 rounded">
                    {log.actionType}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">{log.targetResource}</td>
                <td className="py-3 px-4 max-w-xs truncate">{log.details}</td>
                <td className="py-3 px-4 text-neutral-500">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
