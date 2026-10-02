import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { Room, RoomStatus } from '../../../types';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  Filter,
  Search,
  Dog,
  Users,
  Bed,
  Thermometer,
} from 'lucide-react';

export const RoomsModule: React.FC = () => {
  const { rooms, updateRoomStatus, updateRoomInspection, updateRoomClimate, locateOn3DTwin } = useResortOS();
  const { isLight } = useTheme();

  const [filterStatus, setFilterStatus] = useState<'All' | RoomStatus>('All');
  const [filterCategory, setFilterCategory] = useState<'All' | string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter((r) => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesCategory =
      filterCategory === 'All' ||
      (filterCategory === 'Standard' && r.type.includes('Standard')) ||
      (filterCategory === 'Deluxe' && r.type.includes('Deluxe')) ||
      (filterCategory === 'Family' && r.type.includes('Family')) ||
      (filterCategory === 'Villa' && r.type.includes('Villa'));
    const matchesSearch =
      r.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.currentGuest && r.currentGuest.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 border-emerald-400/30';
      case 'Occupied':
        return 'text-cyan-700 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-400/10 border-cyan-400/30';
      case 'Reserved':
        return 'text-[#8F6834] bg-[#8F6834]/15 dark:text-[#c8aa6e] dark:bg-[#c8aa6e]/10 border-[#8F6834]/40';
      case 'Cleaning':
        return 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-400/10 border-amber-400/30';
      case 'Maintenance':
        return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-400/10 border-orange-400/30';
      case 'Out of Service':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-400/10 border-red-400/30';
    }
  };

  // Metrics
  const total = rooms.length;
  const available = rooms.filter((r) => r.status === 'Available').length;
  const occupied = rooms.filter((r) => r.status === 'Occupied').length;
  const reserved = rooms.filter((r) => r.status === 'Reserved').length;
  const cleaning = rooms.filter((r) => r.status === 'Cleaning').length;
  const maintenance = rooms.filter((r) => r.status === 'Maintenance').length;

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
            02. Rooms & Accommodation Inventory
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            COMPLETE RESORT INVENTORY · 24 MONITORED UNITS · LIVE HOUSEKEEPING & MAINTENANCE STATUS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className={`px-2.5 py-1 border rounded ${isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/5 border-white/10'}`}>
            Total: <strong>{total}</strong>
          </span>
          <span className="px-2.5 py-1 border rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Available: <strong>{available}</strong>
          </span>
          <span className="px-2.5 py-1 border rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
            Occupied: <strong>{occupied}</strong>
          </span>
          <span className="px-2.5 py-1 border rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            Turnaround: <strong>{cleaning}</strong>
          </span>
          {maintenance > 0 && (
            <span className="px-2.5 py-1 border rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
              Maint: <strong>{maintenance}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {[
            { id: 'All', label: 'All Units (24)' },
            { id: 'Standard', label: 'Standard (8)' },
            { id: 'Deluxe', label: 'Deluxe (8)' },
            { id: 'Family', label: 'Family (4)' },
            { id: 'Villa', label: 'Villas (4 Only)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                filterCategory === cat.id
                  ? isLight
                    ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                    : 'bg-white/15 text-white border-white/20 font-semibold'
                  : isLight
                  ? 'border-[#D0CCC0] bg-[#F0EEE7] text-[#4D5C4D] hover:text-[#18251F]'
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown & Search */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room # or guest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-8 pr-3 py-1.5 border focus:outline-none ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
              }`}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={`p-1.5 border ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
      </div>

      {/* 3. Complete Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((rm) => (
          <div
            key={rm.id}
            className={`p-4 border flex flex-col justify-between space-y-3 transition-all ${
              isLight
                ? rm.status === 'Occupied'
                  ? 'bg-[#E7E4DC] border-[#B8AD9B] shadow-sm'
                  : 'bg-[#EEECE4] border-[#D0CCC0]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
            }`}
          >
            {/* Header: Room Number, Type, Status */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-editorial font-bold">{rm.number}</div>
                  <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                    {rm.type} · {rm.floor}
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border rounded ${getStatusBadge(rm.status)}`}>
                  {rm.status}
                </span>
              </div>

              {/* Badges: Capacity, Pet, Family */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-medium">
                  {rm.capacity}
                </span>
                {rm.isPetFriendly && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <Dog className="w-2.5 h-2.5" /> Pet Friendly
                  </span>
                )}
                {rm.isFamilyFriendly && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" /> Family
                  </span>
                )}
              </div>

              {/* Current Occupancy or Availability */}
              <div
                className={`mt-2.5 p-2.5 border rounded text-xs font-mono space-y-1 ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/[0.06]'
                }`}
              >
                <div className="text-[10px] uppercase text-neutral-500 font-semibold">Current Occupant / State</div>
                <div className="font-semibold truncate">
                  {rm.currentGuest || 'Vacant & Ready for Guest'}
                </div>
                <div className="text-[11px] flex justify-between text-neutral-500 pt-0.5 border-t border-inherit">
                  <span>Price: ₹{rm.ratePerNight.toLocaleString('en-IN')}/nt</span>
                  <span className="flex items-center gap-0.5">
                    <Thermometer className="w-3 h-3" /> {rm.climateTemp}°C
                  </span>
                </div>
              </div>

              {/* Housekeeping & Maintenance Status Indicators */}
              <div className="pt-2 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Housekeeping:</span>
                  <span
                    className={`font-semibold ${
                      rm.cleaningStatus === 'Inspected' || rm.cleaningStatus === 'Clean'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : rm.cleaningStatus === 'Cleaning in Progress'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-500'
                    }`}
                  >
                    {rm.cleaningStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Maintenance:</span>
                  <span
                    className={`font-semibold ${
                      rm.maintenanceStatus === 'Operational'
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-orange-500'
                    }`}
                  >
                    {rm.maintenanceStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Status Dropdown & 3D Twin Locate */}
            <div className={`pt-2.5 border-t space-y-2 ${isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'}`}>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-mono uppercase text-neutral-500">Set Status:</label>
                <select
                  value={rm.status}
                  onChange={(e) => updateRoomStatus(rm.id, e.target.value as RoomStatus)}
                  className={`flex-1 p-1 text-[11px] font-mono border ${
                    isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                  }`}
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>

              <button
                onClick={() => locateOn3DTwin(rm.zoneId)}
                className={`w-full py-1.5 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isLight
                    ? 'bg-[#E5E2D6] border-[#B8AD9B] text-[#18251F] hover:bg-[#DCD9CC]'
                    : 'bg-white/[0.04] border-white/10 text-neutral-300 hover:text-white'
                }`}
              >
                <Compass className={`w-3 h-3 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
                <span>Locate {rm.number} on 3D Twin</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
