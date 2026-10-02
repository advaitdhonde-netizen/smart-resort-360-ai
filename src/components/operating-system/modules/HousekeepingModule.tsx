import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { HousekeepingTask, Room, RoomStatus } from '../../../types';
import { INITIAL_ROOMS } from '../../../data/resortData';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Package,
  Layers,
  Check,
  User,
  ChevronDown,
} from 'lucide-react';

const getRoomStatusPill = (status: RoomStatus, isLight: boolean) => {
  switch (status) {
    case 'Available':
      return {
        badgeClass: isLight
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-400',
      };
    case 'Occupied':
      return {
        badgeClass: isLight
          ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
          : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        dotClass: 'bg-cyan-400',
      };
    case 'Reserved':
      return {
        badgeClass: isLight
          ? 'bg-[#8F6834]/15 text-[#8F6834] border-[#8F6834]/30'
          : 'bg-[#c8aa6e]/15 text-[#c8aa6e] border-[#c8aa6e]/30',
        dotClass: 'bg-[#c8aa6e]',
      };
    case 'Cleaning':
      return {
        badgeClass: isLight
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-400 animate-pulse',
      };
    case 'Maintenance':
      return {
        badgeClass: isLight
          ? 'bg-orange-100 text-orange-800 border-orange-300'
          : 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        dotClass: 'bg-orange-400',
      };
    case 'Out of Service':
      return {
        badgeClass: isLight
          ? 'bg-red-100 text-red-800 border-red-300'
          : 'bg-red-500/15 text-red-400 border-red-500/30',
        dotClass: 'bg-red-400',
      };
    default:
      return {
        badgeClass: isLight
          ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
          : 'bg-white/10 text-neutral-300 border-white/20',
        dotClass: 'bg-neutral-400',
      };
  }
};

interface RoomSelectorDropdownProps {
  rooms: Room[];
  selectedRoomNumber: string;
  onSelectRoom: (roomNumber: string) => void;
  isLight: boolean;
}

const RoomSelectorDropdown: React.FC<RoomSelectorDropdownProps> = ({
  rooms,
  selectedRoomNumber,
  onSelectRoom,
  isLight,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or touch
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.number === selectedRoomNumber) || rooms[0];
  }, [rooms, selectedRoomNumber]);

  const selectedPill = selectedRoom ? getRoomStatusPill(selectedRoom.status, isLight) : null;

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.number.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        (r.currentGuest && r.currentGuest.toLowerCase().includes(q)) ||
        (r.floor && r.floor.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === 'All' ||
        (categoryFilter === 'Standard' && r.type.includes('Standard')) ||
        (categoryFilter === 'Deluxe' && r.type.includes('Deluxe')) ||
        (categoryFilter === 'Family' && r.type.includes('Family')) ||
        (categoryFilter === 'Villa' && (r.type.includes('Villa') || r.number.includes('Villa')));

      return matchesSearch && matchesCategory;
    });
  }, [rooms, searchQuery, categoryFilter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      if (!isOpen) {
        setIsOpen(true);
        e.preventDefault();
      }
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full py-2 px-3 text-xs font-mono border flex items-center justify-between transition-all cursor-pointer text-left select-none ${
          isLight
            ? 'bg-[#F0EEE7] border-[#D0CCC0] hover:border-[#8F6834] text-[#18251F]'
            : 'bg-[#0b0e14] border-white/15 hover:border-[#c8aa6e]/60 text-white'
        } ${
          isOpen
            ? isLight
              ? 'border-[#8F6834] ring-1 ring-[#8F6834]/40'
              : 'border-[#c8aa6e] ring-1 ring-[#c8aa6e]/50'
            : ''
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <span className="font-bold text-xs tracking-wide shrink-0">
            {selectedRoom ? selectedRoom.number : selectedRoomNumber}
          </span>
          <span className="text-[11px] text-neutral-400 truncate hidden sm:inline">
            · {selectedRoom?.type || 'Room'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedRoom && selectedPill && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${selectedPill.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedPill.dotClass}`} />
              <span>{selectedRoom.status}</span>
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#c8aa6e]' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 top-full mt-1 border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
            isLight
              ? 'bg-[#FAF8F2] border-[#8F6834]/40 text-[#18251F]'
              : 'bg-[#090b10] border-[#c8aa6e]/40 text-neutral-200'
          }`}
          style={{ maxHeight: '320px' }}
        >
          {/* Search & Category Filter Toolbar */}
          <div
            className={`p-2 border-b space-y-1.5 ${
              isLight ? 'border-[#E0DDD2] bg-[#F2EFE8]' : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="relative">
              <Search className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 24 units (e.g. 204, villa, cleaning)..."
                className={`w-full pl-7 pr-6 py-1 text-[11px] font-mono border ${
                  isLight
                    ? 'bg-[#FAF8F2] border-[#D0CCC0] text-[#18251F] placeholder-neutral-400'
                    : 'bg-white/[0.05] border-white/15 text-white placeholder-neutral-500'
                } focus:outline-none focus:border-[#c8aa6e]`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Category Chips */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 text-[10px] font-mono scrollbar-none">
              {[
                { id: 'All', label: `All (${rooms.length})` },
                { id: 'Standard', label: 'Standard (8)' },
                { id: 'Deluxe', label: 'Deluxe (8)' },
                { id: 'Family', label: 'Family (4)' },
                { id: 'Villa', label: 'Villas (4)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-0.5 border text-[10px] whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? isLight
                        ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                        : 'bg-[#c8aa6e] text-black border-[#c8aa6e] font-bold'
                      : isLight
                      ? 'border-[#D0CCC0] text-neutral-600 hover:text-black bg-white/40'
                      : 'border-white/10 text-neutral-400 hover:text-white bg-white/[0.02]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Unit Options List */}
          <div
            className="max-h-52 overflow-y-auto overscroll-contain divide-y divide-white/[0.04]"
            role="listbox"
          >
            {filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400 font-mono">
                No accommodation units match your search.
              </div>
            ) : (
              filteredRooms.map((r) => {
                const isSelected = r.number === selectedRoomNumber;
                const pill = getRoomStatusPill(r.status, isLight);

                return (
                  <button
                    key={r.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectRoom(r.number);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isLight
                        ? 'hover:bg-[#EAE7DC]'
                        : 'hover:bg-[#c8aa6e]/15'
                    } ${
                      isSelected
                        ? isLight
                          ? 'bg-[#EAE7DC] text-[#18251F] font-semibold border-l-2 border-l-[#8F6834]'
                          : 'bg-[#c8aa6e]/20 text-white font-semibold border-l-2 border-l-[#c8aa6e]'
                        : isLight
                        ? 'text-[#2C3E35]'
                        : 'text-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isSelected ? (isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]') : ''
                          }`}
                        >
                          {r.number}
                        </span>
                        <span className="text-[11px] opacity-75 font-sans truncate">
                          · {r.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono truncate">
                        <span>{r.floor}</span>
                        {r.currentGuest && (
                          <span className="truncate">· {r.currentGuest}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono border ${pill.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pill.dotClass}`} />
                        <span>{r.status}</span>
                      </span>
                      {isSelected ? (
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                          }`}
                        />
                      ) : (
                        <div className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const HousekeepingModule: React.FC = () => {
  const {
    housekeepingTasks,
    updateTaskStatus,
    createHousekeepingTask,
    lostAndFound,
    rooms,
  } = useResortOS();
  const { isLight } = useTheme();

  // Dynamically include every valid room and villa with current status from context/resort data
  const allRooms: Room[] = useMemo(() => {
    const contextMap = new Map((rooms || []).map((r) => [r.number, r]));
    return INITIAL_ROOMS.map((initRoom) => {
      const match = contextMap.get(initRoom.number) || (rooms || []).find((r) => r.id === initRoom.id);
      return match || initRoom;
    });
  }, [rooms]);

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New task form state
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('Room 101');
  const [selectedTaskType, setSelectedTaskType] = useState<HousekeepingTask['taskType']>('Stayover Refresh');
  const [selectedPriority, setSelectedPriority] = useState<HousekeepingTask['priority']>('Medium');
  const [assignedStaff, setAssignedStaff] = useState('Sneha Kulkarni');
  const [estMinutes, setEstMinutes] = useState(30);
  const [taskNotes, setTaskNotes] = useState('');

  const filteredTasks = housekeepingTasks.filter((task) => {
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesSearch =
      task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedStaff.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = housekeepingTasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = housekeepingTasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = housekeepingTasks.filter((t) => t.status === 'Completed' || t.status === 'Inspected').length;

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = allRooms.find((r) => r.number === selectedRoomNumber);
    createHousekeepingTask({
      roomNumber: selectedRoomNumber,
      roomType: targetRoom?.type || 'Standard Room',
      guestName: targetRoom?.currentGuest || 'Pending Arrival',
      taskType: selectedTaskType,
      priority: selectedPriority,
      status: 'Pending',
      assignedStaff,
      estMinutes,
      notes: taskNotes || 'Standard cleaning procedure',
      linenStatus: 'Fresh Linens Stocked',
    });
    setShowNewTaskModal(false);
    setTaskNotes('');
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
            04. Housekeeping & Turnaround Queue
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            STANDARD, DELUXE, FAMILY & VILLA TURNOVERS · LINEN TRACKING · SUPERVISOR INSPECTIONS
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
            isLight
              ? 'bg-[#18251F] text-white hover:bg-[#26332D] border-[#18251F]'
              : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f] border-[#c8aa6e]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Cleaning Task</span>
        </button>
      </div>

      {/* 2. Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Queue Total</span>
          <div className="text-xl font-bold">{housekeepingTasks.length}</div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            All active & inspected
          </span>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Pending Turnaround</span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Awaiting attendant start
          </span>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">In Progress</span>
          <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{inProgressCount}</div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Currently cleaning
          </span>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Inspected & Certified</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Released to Front Desk
          </span>
        </div>
      </div>

      {/* 3. Filters and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Pending', 'In Progress', 'Completed', 'Inspected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                filterStatus === st
                  ? isLight
                    ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                    : 'bg-white/15 text-white border-white/20 font-bold'
                  : isLight
                  ? 'border-transparent text-[#68716B] hover:text-[#18251F]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room # or staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-8 pr-3 py-1.5 text-xs font-mono border ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
            }`}
          />
        </div>
      </div>

      {/* 4. Housekeeping Tasks Table */}
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
              <th className="p-3.5">Room & Type</th>
              <th className="p-3.5">Cleaning Task</th>
              <th className="p-3.5">Guest / Event</th>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Assigned Attendant</th>
              <th className="p-3.5">Linen Status</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {filteredTasks.map((t) => {
              const priorityBadge =
                t.priority === 'High'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : t.priority === 'Medium'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20';

              const statusBadge =
                t.status === 'Completed' || t.status === 'Inspected'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : t.status === 'In Progress'
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

              return (
                <tr key={t.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-[#8F6834] dark:text-[#c8aa6e]">{t.roomNumber}</div>
                    <div className="text-[11px] text-neutral-500">{t.roomType}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{t.taskType}</div>
                    <div className="text-[11px] text-neutral-500">{t.notes}</div>
                  </td>
                  <td className="p-3.5 font-medium">{t.guestName || 'Scheduled Turnaround'}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${priorityBadge}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div>{t.assignedStaff}</div>
                    <div className="text-[10px] text-neutral-500">Est. {t.estMinutes} mins</div>
                  </td>
                  <td className="p-3.5 text-[11px] text-neutral-500">{t.linenStatus}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${statusBadge}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                    {t.status === 'Pending' && (
                      <button
                        onClick={() => updateTaskStatus(t.id, 'In Progress')}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border cursor-pointer ${
                          isLight ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        Start
                      </button>
                    )}
                    {t.status === 'In Progress' && (
                      <button
                        onClick={() => updateTaskStatus(t.id, 'Completed')}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border cursor-pointer ${
                          isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        Finish
                      </button>
                    )}
                    {t.status === 'Completed' && (
                      <button
                        onClick={() => updateTaskStatus(t.id, 'Inspected')}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border cursor-pointer ${
                          isLight ? 'bg-[#18251F] text-white' : 'bg-[#c8aa6e] text-black'
                        }`}
                        title="Certify inspection and mark Room Available for guest"
                      >
                        Inspect
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. Lost & Found Section */}
      <div
        className={`p-5 border space-y-3 ${
          isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-inherit">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
            Lost & Found Registry
          </h3>
          <span className="text-xs font-mono text-neutral-500">{lostAndFound.length} Items Logged</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          {lostAndFound.map((item) => (
            <div
              key={item.id}
              className={`p-3 border rounded space-y-1 ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="font-bold">{item.item}</div>
              <div className="text-[11px] text-neutral-500">Location: {item.location}</div>
              <div className="text-[11px] text-neutral-500">Found By: {item.foundBy} · {item.date}</div>
              <span className="inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-semibold">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 border space-y-4 max-h-[92vh] overflow-y-auto ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <div>
                <h3 className="text-base font-editorial font-bold">Create Housekeeping Task</h3>
                <p className="text-[10px] text-neutral-400 font-mono">
                  Dispatch room turnaround or refreshing task to housekeeping staff
                </p>
              </div>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block mb-1 font-semibold flex items-center justify-between">
                  <span>Select Accommodation Unit</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {allRooms.length} units total (101–108, 201–208, 301–304, Villas)
                  </span>
                </label>
                <RoomSelectorDropdown
                  rooms={allRooms}
                  selectedRoomNumber={selectedRoomNumber}
                  onSelectRoom={setSelectedRoomNumber}
                  isLight={isLight}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Task Type</label>
                  <select
                    value={selectedTaskType}
                    onChange={(e) => setSelectedTaskType(e.target.value as any)}
                    className={`w-full p-2 border ${
                      isLight
                        ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#18251F]'
                        : 'bg-[#0b0e14] border-white/15 text-white'
                    } focus:outline-none focus:border-[#c8aa6e] cursor-pointer`}
                  >
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Checkout Cleaning">Checkout Cleaning</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Deep Cleaning">Deep Cleaning</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Stayover Refresh">Stayover Refresh</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Linen Replacement">Linen Replacement</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Turnover Cleaning">Turnover Cleaning</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Evening Turndown">Evening Turndown</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className={`w-full p-2 border ${
                      isLight
                        ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#18251F]'
                        : 'bg-[#0b0e14] border-white/15 text-white'
                    } focus:outline-none focus:border-[#c8aa6e] cursor-pointer`}
                  >
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Low">Low</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Medium">Medium</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Assigned Attendant</label>
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className={`w-full p-2 border ${
                      isLight
                        ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#18251F]'
                        : 'bg-[#0b0e14] border-white/15 text-white'
                    } focus:outline-none focus:border-[#c8aa6e] cursor-pointer`}
                  >
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Sneha Kulkarni">Sneha Kulkarni</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Sunita Bai">Sunita Bai</option>
                    <option className={isLight ? 'bg-[#F0EEE7] text-[#18251F]' : 'bg-[#0b0e14] text-white'} value="Rajesh Shinde">Rajesh Shinde</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Est. Minutes</label>
                  <input
                    type="number"
                    value={estMinutes}
                    onChange={(e) => setEstMinutes(parseInt(e.target.value) || 30)}
                    className={`w-full p-2 border ${
                      isLight
                        ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#18251F]'
                        : 'bg-[#0b0e14] border-white/15 text-white'
                    } focus:outline-none focus:border-[#c8aa6e]`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Instructions / Notes</label>
                <input
                  type="text"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="e.g. Extra towels requested, quiet knock"
                  className={`w-full p-2 border ${
                    isLight
                      ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#18251F]'
                      : 'bg-[#0b0e14] border-white/15 text-white'
                  } focus:outline-none focus:border-[#c8aa6e]`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 py-2 font-bold uppercase tracking-wider cursor-pointer border ${
                    isLight ? 'bg-[#18251F] text-white hover:bg-[#26332D]' : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className={`px-4 py-2 uppercase border cursor-pointer ${isLight ? 'border-[#D0CCC0]' : 'border-white/10'}`}
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
