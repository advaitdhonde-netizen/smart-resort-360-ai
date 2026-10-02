import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { StaffMember } from '../../../types';
import { User, Phone, CheckCircle2, Clock, Search, Filter } from 'lucide-react';

export const StaffModule: React.FC = () => {
  const { staffMembers, updateStaffAttendance } = useResortOS();
  const { isLight } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  const filteredStaff = staffMembers.filter((st) => {
    const matchesDept = departmentFilter === 'All' || st.department === departmentFilter;
    const matchesSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.contact.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const onDutyCount = staffMembers.filter((s) => s.attendance === 'On Duty').length;

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
            08. Staff & Team Roster
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            DEPARTMENTAL ROSTER · SHIFT CHOREOGRAPHY · ON-DUTY ATTENDANCE MANAGEMENT
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`px-3 py-1 border rounded ${isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/5 border-white/10'}`}>
            Total Staff: <strong>{staffMembers.length}</strong>
          </span>
          <span className="px-3 py-1 border rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold">
            On Duty: <strong>{onDutyCount}</strong>
          </span>
        </div>
      </div>

      {/* 2. Filters and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Front Office', 'Housekeeping', 'Engineering', 'Food & Beverage', 'Guest Relations'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1 border transition-colors cursor-pointer ${
                departmentFilter === dept
                  ? isLight
                    ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                    : 'bg-white/15 text-white border-white/20 font-bold'
                  : isLight
                  ? 'border-[#D0CCC0] bg-[#F0EEE7] text-[#4D5C4D]'
                  : 'border-white/10 text-neutral-400'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-8 pr-3 py-1 text-xs font-mono border ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
            }`}
          />
        </div>
      </div>

      {/* 3. Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((st) => (
          <div
            key={st.id}
            className={`p-4 border rounded flex flex-col justify-between space-y-3 ${
              isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
            }`}
          >
            <div>
              <div className="flex items-start justify-between pb-2 border-b border-inherit">
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{st.name}</div>
                  <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                    {st.role} · {st.department}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded border ${
                    st.attendance === 'On Duty'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : st.attendance === 'Scheduled'
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                      : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
                  }`}
                >
                  {st.attendance}
                </span>
              </div>

              <div className="py-2.5 space-y-1 text-xs font-mono">
                <div>Shift: <strong>{st.shift}</strong></div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Phone className="w-3 h-3" />
                  <span>{st.contact}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-500">Active Tasks:</span>
                  <span className="font-semibold">{st.activeTasks} assigned</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Service Rating:</span>
                  <span className="font-bold text-[#8F6834] dark:text-[#c8aa6e]">★ {st.performanceRating}</span>
                </div>
              </div>
            </div>

            {/* Attendance Toggle */}
            <div className="pt-2 border-t border-inherit flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] text-neutral-500 uppercase">Set Attendance:</span>
              <select
                value={st.attendance}
                onChange={(e) => updateStaffAttendance(st.id, e.target.value as any)}
                className={`p-1 text-[11px] font-mono border rounded ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                }`}
              >
                <option value="On Duty">On Duty</option>
                <option value="Scheduled">Scheduled</option>
                <option value="On Break">On Break</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
