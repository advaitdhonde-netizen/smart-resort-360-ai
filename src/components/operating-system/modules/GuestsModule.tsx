import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { GuestProfile } from '../../../types';
import {
  User,
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  Heart,
  Dog,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Send,
  Plus,
} from 'lucide-react';

export const GuestsModule: React.FC = () => {
  const { guests, addGuestRequest } = useResortOS();
  const { isLight } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<string>(guests[0]?.id || '');
  const [newRequestText, setNewRequestText] = useState('');

  const selectedGuest = guests.find((g) => g.id === selectedGuestId) || guests[0];

  const filteredGuests = guests.filter((g) => {
    return (
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.currentRoom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestText.trim() || !selectedGuest) return;
    addGuestRequest(selectedGuest.id, newRequestText.trim());
    setNewRequestText('');
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
            03. Guests & In-Residence Directory
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            GUEST DOSSIERS · STAY HISTORY · FAMILY PREFERENCES & PET REGISTRATION
          </p>
        </div>

        <span className={`px-3 py-1 border rounded text-xs font-mono ${isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/5 border-white/10'}`}>
          Active Profiles: <strong>{guests.length}</strong>
        </span>
      </div>

      {/* 2. Main 2-Column Split: Directory List + Detailed Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Guest Directory List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest name, room, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 text-xs font-mono border focus:outline-none ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
              }`}
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredGuests.map((g) => {
              const isSelected = selectedGuest?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGuestId(g.id)}
                  className={`p-3.5 border rounded cursor-pointer transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-[#E7E4DC] border-[#8F6834] shadow-sm'
                        : 'bg-white/[0.08] border-[#c8aa6e]'
                      : isLight
                      ? 'bg-[#EEECE4] border-[#D0CCC0] hover:bg-[#E5E2D6]'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{g.name}</div>
                      <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                        {g.currentRoom} · {g.stayCount} stay(s)
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-semibold">
                      ₹{g.totalSpentINR.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 text-[10px] font-mono">
                    {g.preferences.dietary && (
                      <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400">
                        {g.preferences.dietary}
                      </span>
                    )}
                    {g.childrenCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        {g.childrenCount} Kids
                      </span>
                    )}
                    {g.hasPets && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Dog className="w-2.5 h-2.5" /> Pet
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Complete Guest Profile Inspector */}
        {selectedGuest && (
          <div
            className={`lg:col-span-2 p-6 border space-y-5 rounded ${
              isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
            }`}
          >
            {/* Header: Name, Room, Stays, Contact */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-inherit">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-editorial font-bold">{selectedGuest.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                    isLight ? 'bg-[#E5E2D6] text-[#8F6834]' : 'bg-white/10 text-[#c8aa6e]'
                  }`}>
                    {selectedGuest.currentRoom}
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-500 mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {selectedGuest.phone}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedGuest.email}
                  </span>
                </div>
              </div>

              <div className="text-right text-xs font-mono">
                <div className="text-[10px] text-neutral-500 uppercase">Total Lifetime Spend</div>
                <div className="text-base font-bold text-[#8F6834] dark:text-[#c8aa6e]">
                  ₹{selectedGuest.totalSpentINR.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-neutral-500">{selectedGuest.stayCount} Completed Stays</div>
              </div>
            </div>

            {/* Profile Grid: Preferences, Family & Pet Support */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {/* Preferences */}
              <div
                className={`p-3.5 border rounded space-y-2 ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  <span>Stay Preferences</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div>Dietary: <strong>{selectedGuest.preferences.dietary}</strong></div>
                  <div>Climate Comfort: <strong>{selectedGuest.preferences.temperature}°C</strong></div>
                  {selectedGuest.preferences.pillow && (
                    <div>Pillow: <strong>{selectedGuest.preferences.pillow}</strong></div>
                  )}
                  {selectedGuest.preferences.specialNeeds && (
                    <div className="text-neutral-500 italic">"{selectedGuest.preferences.specialNeeds}"</div>
                  )}
                </div>
              </div>

              {/* Family & Pets */}
              <div
                className={`p-3.5 border rounded space-y-2 ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Family & Companions</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div>
                    Children:{' '}
                    <strong>
                      {selectedGuest.childrenCount > 0
                        ? `${selectedGuest.childrenCount} (${selectedGuest.childrenAges || 'Ages registered'})`
                        : 'None registered'}
                    </strong>
                  </div>
                  <div>
                    Pets:{' '}
                    <strong>
                      {selectedGuest.hasPets
                        ? `Yes (${selectedGuest.petDetails || 'Pet dog'})`
                        : 'No pets accompanying'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Service Requests */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Active Guest Requests ({selectedGuest.activeRequests.length})
                </span>
              </div>

              {selectedGuest.activeRequests.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedGuest.activeRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-2.5 border rounded flex justify-between items-center ${
                        isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{req.service}</span>
                        <span className="text-[10px] text-neutral-500 ml-2">Logged: {req.time}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-500 italic text-[11px]">No active service requests pending.</div>
              )}

              {/* Add New Request Form */}
              <form onSubmit={handleAddRequest} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={newRequestText}
                  onChange={(e) => setNewRequestText(e.target.value)}
                  placeholder="Log service request (e.g. Extra pillows, dental kit, late check-out inquiry)..."
                  className={`flex-1 p-2 text-xs font-mono border ${
                    isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newRequestText.trim()}
                  className={`px-3 py-2 text-xs font-mono uppercase font-bold border cursor-pointer ${
                    isLight ? 'bg-[#18251F] text-white hover:bg-[#26332D]' : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Log Request
                </button>
              </form>
            </div>

            {/* Stay History Table */}
            <div className="space-y-2 text-xs font-mono pt-2 border-t border-inherit">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Stay History & Bookings
              </span>
              <div className="divide-y divide-inherit border rounded overflow-hidden">
                {selectedGuest.bookingHistory.map((bh, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex justify-between items-center ${
                      isLight ? 'bg-[#F0EEE7]' : 'bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[#8F6834] dark:text-[#c8aa6e]">{bh.bookingRef}</span>
                      <span className="ml-2 font-medium">{bh.room}</span>
                      <span className="text-[11px] text-neutral-500 ml-2">({bh.dates})</span>
                    </div>
                    <span className="font-bold font-mono">₹{bh.totalINR.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
