import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { Reservation, BookingChannel } from '../../../types';
import {
  Plus,
  Check,
  X,
  Calendar,
  Search,
  Sparkles,
  Bot,
  Send,
  User,
  Users,
  Dog,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const ReservationsModule: React.FC = () => {
  const {
    reservations,
    createReservation,
    checkInReservation,
    checkOutReservation,
    cancelReservation,
    rooms,
    checkRoomAvailability,
  } = useResortOS();
  const { isLight } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'All' | string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Manual Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('Room 101');
  const [roomType, setRoomType] = useState('Standard Room');
  const [checkIn, setCheckIn] = useState('2026-10-01');
  const [checkOut, setCheckOut] = useState('2026-10-04');
  const [nights, setNights] = useState(3);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState('');
  const [bookingChannel, setBookingChannel] = useState<BookingChannel>('Direct Website');
  const [roomRate, setRoomRate] = useState(4500);
  const [specialRequests, setSpecialRequests] = useState('');

  // AI Reservation Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    guestName: string;
    roomType: string;
    recommendedRoom: string;
    adults: number;
    children: number;
    hasPets: boolean;
    checkIn: string;
    checkOut: string;
    nights: number;
    mealPlan: string;
    ratePerNight: number;
    totalINR: number;
    taxesINR: number;
    availableMatches: number;
    reasoning: string;
  } | null>(null);

  // Filtered Reservations List
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      r.status.toLowerCase().replace('-', ' ') === statusFilter.toLowerCase().replace('-', ' ');
    const matchesChannel =
      channelFilter === 'All' || r.bookingChannel === channelFilter || r.bookingSource === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  // Calculate Capacity
  const activeBookingsCount = reservations.filter(
    (r) => r.status === 'Confirmed' || r.status === 'Checked In' || r.status === 'Checked-In'
  ).length;
  const totalResortRooms = rooms.length; // 24
  const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;

    const calculatedTaxes = Math.round(roomRate * nights * 0.12);
    const calculatedTotal = roomRate * nights + calculatedTaxes;

    createReservation({
      guestName,
      guestEmail,
      guestPhone: guestPhone || '+91 98000 00000',
      roomNumber,
      roomType,
      checkIn,
      checkOut,
      nights,
      status: 'Confirmed',
      bookingChannel,
      paymentStatus: 'Pending Deposit',
      roomRate,
      taxes: calculatedTaxes,
      totalAmount: calculatedTotal,
      adults,
      children,
      hasPets,
      petDetails: hasPets ? petDetails || 'Pet dog' : undefined,
      specialRequests,
    });

    setShowManualModal(false);
    // Reset
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setSpecialRequests('');
  };

  // AI Extraction & Recommendation Logic
  const handleRunAiAssistant = (promptText?: string) => {
    const query = (promptText || aiPrompt).trim();
    if (!query) return;

    setAiParsing(true);
    setAiRecommendation(null);

    setTimeout(() => {
      const q = query.toLowerCase();

      // Extract guest name
      let extractedGuest = 'Guest';
      const nameMatch = query.match(/for ([A-Z][a-z]+ [A-Z][a-z]+)/);
      if (nameMatch) {
        extractedGuest = nameMatch[1];
      } else if (q.includes('rahul patil')) extractedGuest = 'Rahul Patil';
      else if (q.includes('priya mehta')) extractedGuest = 'Priya Mehta';
      else if (q.includes('aarav sharma')) extractedGuest = 'Aarav Sharma';
      else if (q.includes('ananya')) extractedGuest = 'Ananya Deshmukh';
      else extractedGuest = 'Walk-in Guest';

      // Extract adults and children
      let extractedAdults = 2;
      let extractedChildren = 0;
      if (q.includes('4 adults')) extractedAdults = 4;
      else if (q.includes('3 adults')) extractedAdults = 3;
      else if (q.includes('1 adult') || q.includes('solo')) extractedAdults = 1;
      else if (q.includes('family of four') || q.includes('family of 4')) {
        extractedAdults = 2;
        extractedChildren = 2;
      }

      if (q.includes('2 children') || q.includes('2 kids')) extractedChildren = 2;
      else if (q.includes('1 child') || q.includes('1 kid')) extractedChildren = 1;
      else if (q.includes('3 children') || q.includes('3 kids')) extractedChildren = 3;

      // Extract pet
      const isPet = q.includes('pet') || q.includes('dog') || q.includes('cat');

      // Extract room preference
      let targetType = 'Standard Room';
      let rate = 4500;
      if (q.includes('villa')) {
        targetType = 'Premium Villa';
        rate = 15000;
      } else if (q.includes('family') || extractedChildren >= 2 || extractedAdults >= 4) {
        targetType = 'Family Room';
        rate = 8000;
      } else if (q.includes('deluxe') || isPet) {
        targetType = 'Deluxe Room';
        rate = 6500;
      }

      // Check available inventory in target category
      const candidates = checkRoomAvailability(targetType, extractedAdults, extractedChildren, isPet);
      const chosenRoom =
        candidates.length > 0
          ? candidates[0]
          : rooms.find((r) => r.type === targetType) || rooms[0];

      // Extract nights
      let extractedNights = 3;
      const nightMatch = q.match(/(\d+)\s*nights?/);
      if (nightMatch) {
        extractedNights = parseInt(nightMatch[1]);
      } else if (q.includes('weekend')) {
        extractedNights = 2;
      }

      const mealPlan = q.includes('breakfast')
        ? 'Breakfast Included'
        : q.includes('dinner')
        ? 'Half Board (Breakfast + Dinner)'
        : 'Breakfast Included';

      const totalRoomCost = rate * extractedNights;
      const taxes = Math.round(totalRoomCost * 0.12);
      const totalCost = totalRoomCost + taxes;

      setAiRecommendation({
        guestName: extractedGuest,
        roomType: targetType,
        recommendedRoom: chosenRoom.number,
        adults: extractedAdults,
        children: extractedChildren,
        hasPets: isPet,
        checkIn: '2026-10-10',
        checkOut: `2026-10-${10 + extractedNights}`,
        nights: extractedNights,
        mealPlan,
        ratePerNight: rate,
        taxesINR: taxes,
        totalINR: totalCost,
        availableMatches: candidates.length,
        reasoning:
          candidates.length > 0
            ? `Found ${candidates.length} currently available ${targetType} unit(s). ${chosenRoom.number} is optimal for ${extractedAdults} adults ${extractedChildren > 0 ? `+ ${extractedChildren} children` : ''}${isPet ? ' with pet-friendly ground floor access' : ''}.`
            : `All ${targetType} units currently occupied. Assigned next turnaround slot for ${chosenRoom.number}.`,
      });

      setAiParsing(false);
    }, 450);
  };

  const handleConfirmAiRecommendation = () => {
    if (!aiRecommendation) return;

    createReservation({
      guestName: aiRecommendation.guestName,
      guestEmail: `${aiRecommendation.guestName.toLowerCase().replace(/\s+/g, '.')}@example.in`,
      guestPhone: '+91 98765 00000',
      roomNumber: aiRecommendation.recommendedRoom,
      roomType: aiRecommendation.roomType,
      checkIn: aiRecommendation.checkIn,
      checkOut: aiRecommendation.checkOut,
      nights: aiRecommendation.nights,
      status: 'Confirmed',
      bookingChannel: 'Phone',
      paymentStatus: 'Pending Deposit',
      roomRate: aiRecommendation.ratePerNight,
      taxes: aiRecommendation.taxesINR,
      totalAmount: aiRecommendation.totalINR,
      adults: aiRecommendation.adults,
      children: aiRecommendation.children,
      hasPets: aiRecommendation.hasPets,
      petDetails: aiRecommendation.hasPets ? 'Registered pet accompanying' : undefined,
      mealPlan: aiRecommendation.mealPlan as any,
      specialRequests: 'Created via AI Reservation Assistant',
    });

    setAiRecommendation(null);
    setAiPrompt('');
    setShowAiAssistant(false);
  };

  return (
    <div className={`space-y-6 ${isLight ? 'text-[#18251F]' : 'text-neutral-200'}`}>
      {/* 1. Header & Actions Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
        }`}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-editorial tracking-wide">
            01. Reservations
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            ROOM ALLOCATIONS · ARRIVALS & DEPARTURES · INDIAN RESORT CHANNEL MANAGER
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Reservation Assistant Trigger */}
          <button
            onClick={() => setShowAiAssistant((prev) => !prev)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
              showAiAssistant
                ? isLight
                  ? 'bg-[#18251F] text-white border-[#18251F]'
                  : 'bg-[#c8aa6e] text-black border-[#c8aa6e]'
                : isLight
                ? 'bg-[#E7E4DC] hover:bg-[#DCD9CC] text-[#18251F] border-[#B8AD9B]'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#c8aa6e] border-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Reservation Assistant</span>
          </button>

          {/* New Reservation Button */}
          <button
            onClick={() => setShowManualModal(true)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
              isLight
                ? 'bg-[#18251F] hover:bg-[#26332D] text-white border-[#18251F]'
                : 'bg-[#c8aa6e] hover:bg-[#d8bc7f] text-black border-[#c8aa6e]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* 2. AI Reservation Assistant Drawer / Card */}
      {showAiAssistant && (
        <div
          className={`p-5 border transition-all space-y-4 animate-fadeIn ${
            isLight
              ? 'bg-[#EEECE4] border-[#8F6834] shadow-sm'
              : 'bg-white/[0.03] border-[#c8aa6e]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className={`w-4 h-4 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
                AI Reservation Assistant · Natural Language Booking
              </h3>
            </div>
            <button
              onClick={() => setShowAiAssistant(false)}
              className="text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Enter staff notes, phone requests, or walk-in descriptions in plain English. The AI will extract the guest profile, check available inventory, and recommend optimal room allocations.
          </p>

          {/* Quick Example Chips */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {[
              "Book a room for Rahul Patil, 2 adults and 2 children, arriving October 10 for 3 nights. They need a family room and breakfast.",
              "Find me a pet-friendly room for 2 adults this weekend.",
              "Book a deluxe room for 3 nights for Priya Mehta.",
              "Which rooms are available for a family of four?",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiPrompt(chip);
                  handleRunAiAssistant(chip);
                }}
                className={`text-[11px] px-2.5 py-1 border rounded transition-colors text-left cursor-pointer ${
                  isLight
                    ? 'bg-[#F0EEE7] border-[#D0CCC0] hover:border-[#8F6834]'
                    : 'bg-white/[0.04] border-white/10 hover:border-[#c8aa6e]/60 text-neutral-300'
                }`}
              >
                "{chip.slice(0, 55)}..."
              </button>
            ))}
          </div>

          {/* Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAiAssistant();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Book a family room for Rohan Patil, 2 adults and 2 kids arriving next Friday for 3 nights..."
              className={`flex-1 p-2.5 text-xs font-mono border focus:outline-none ${
                isLight
                  ? 'bg-[#F0EEE7] border-[#D0CCC0] focus:border-[#8F6834]'
                  : 'bg-white/[0.04] border-white/10 focus:border-[#c8aa6e] text-white'
              }`}
            />
            <button
              type="submit"
              disabled={aiParsing || !aiPrompt.trim()}
              className={`px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? 'bg-[#18251F] text-white hover:bg-[#26332D] disabled:opacity-50'
                  : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f] disabled:opacity-50'
              }`}
            >
              {aiParsing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Process</span>
            </button>
          </form>

          {/* AI Recommendation Preview */}
          {aiRecommendation && (
            <div
              className={`p-4 border rounded space-y-3 animate-fadeIn ${
                isLight ? 'bg-[#E5E2D6] border-[#8F6834]' : 'bg-white/[0.05] border-[#c8aa6e]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase">
                    AI Recommendation Generated
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {aiRecommendation.availableMatches} Unit(s) Available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block text-[10px]">GUEST</span>
                  <span className="font-bold">{aiRecommendation.guestName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">RECOMMENDED ROOM</span>
                  <span className="font-bold text-[#8F6834] dark:text-[#c8aa6e]">
                    {aiRecommendation.recommendedRoom} ({aiRecommendation.roomType})
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">PARTY SIZE</span>
                  <span>
                    {aiRecommendation.adults} Adults
                    {aiRecommendation.children > 0 ? `, ${aiRecommendation.children} Kids` : ''}
                    {aiRecommendation.hasPets ? ' + Pet' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">STAY DURATION</span>
                  <span>
                    {aiRecommendation.nights} Nights ({aiRecommendation.checkIn})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2 border-t border-inherit">
                <div>
                  <span className="text-neutral-500 block text-[10px]">NIGHTLY RATE</span>
                  <span className="font-semibold">₹{aiRecommendation.ratePerNight.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">TAXES (12% GST)</span>
                  <span className="font-semibold">₹{aiRecommendation.taxesINR.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">TOTAL ESTIMATE</span>
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    ₹{aiRecommendation.totalINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className={`text-xs italic ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-300'}`}>
                "{aiRecommendation.reasoning}"
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirmAiRecommendation}
                  className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer text-center border ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  [CONFIRM RESERVATION]
                </button>
                <button
                  onClick={() => setAiRecommendation(null)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                    isLight ? 'border-[#D0CCC0] hover:bg-[#DCD9CC]' : 'border-white/10 hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-neutral-500">Active Bookings</div>
          <div className="text-xl font-bold font-mono">{activeBookingsCount}</div>
          <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            {totalResortRooms} Total Units in Property
          </div>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-neutral-500">Available Rooms</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {availableRoomsCount}
          </div>
          <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Ready for instant check-in
          </div>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-neutral-500">Occupancy Rate</div>
          <div className="text-xl font-bold font-mono">
            {Math.round(((totalResortRooms - availableRoomsCount) / totalResortRooms) * 100)}%
          </div>
          <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Healthy seasonal pace
          </div>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-neutral-500">Total Folio Value</div>
          <div className="text-xl font-bold font-mono text-[#8F6834] dark:text-[#c8aa6e]">
            ₹
            {reservations
              .reduce((sum, r) => sum + (r.totalAmount || 0), 0)
              .toLocaleString('en-IN')}
          </div>
          <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Across {reservations.length} reservations
          </div>
        </div>
      </div>

      {/* 4. Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest name, booking ref, or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs font-mono border focus:outline-none ${
              isLight
                ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#18251F] focus:border-[#8F6834]'
                : 'bg-white/[0.02] border-white/10 text-white focus:border-[#c8aa6e]'
            }`}
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          {['All', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                statusFilter === st
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

      {/* 5. Reservations Table */}
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
              <th className="p-3.5">Booking Ref</th>
              <th className="p-3.5">Guest & Contact</th>
              <th className="p-3.5">Room Allocated</th>
              <th className="p-3.5">Dates & Nights</th>
              <th className="p-3.5">Guests</th>
              <th className="p-3.5">Channel</th>
              <th className="p-3.5">Total (₹)</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {filteredReservations.map((res) => {
              const statusBadgeColor =
                res.status === 'Checked In' || res.status === 'Checked-In'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : res.status === 'Confirmed'
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                  : res.status === 'Checked Out' || res.status === 'Checked-Out'
                  ? 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

              return (
                <tr
                  key={res.id}
                  className={`hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors`}
                >
                  <td className="p-3.5 font-bold">{res.bookingRef}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{res.guestName}</div>
                    <div className="text-[11px] text-neutral-500">{res.guestPhone}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-[#8F6834] dark:text-[#c8aa6e]">{res.roomNumber}</div>
                    <div className="text-[11px] text-neutral-500">{res.roomType}</div>
                  </td>
                  <td className="p-3.5">
                    <div>{res.checkIn} → {res.checkOut}</div>
                    <div className="text-[11px] text-neutral-500">{res.nights} Nights</div>
                  </td>
                  <td className="p-3.5">
                    <div>{res.adults} Adults {res.children > 0 ? `, ${res.children} Kids` : ''}</div>
                    {res.hasPets && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <Dog className="w-3 h-3" /> Pet
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px]">
                      {res.bookingChannel || res.bookingSource || 'Direct'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold font-mono">
                    ₹{res.totalAmount.toLocaleString('en-IN')}
                    <div className="text-[10px] font-normal text-neutral-500">{res.paymentStatus}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border rounded ${statusBadgeColor}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {res.status === 'Confirmed' && (
                      <button
                        onClick={() => checkInReservation(res.id)}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border cursor-pointer ${
                          isLight
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        }`}
                        title="Check In guest and mark Room as Occupied"
                      >
                        Check In
                      </button>
                    )}
                    {(res.status === 'Checked In' || res.status === 'Checked-In') && (
                      <button
                        onClick={() => checkOutReservation(res.id)}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border cursor-pointer ${
                          isLight
                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                        title="Check Out guest and mark Room as Cleaning"
                      >
                        Check Out
                      </button>
                    )}
                    {res.status !== 'Cancelled' && res.status !== 'Checked Out' && res.status !== 'Checked-Out' && (
                      <button
                        onClick={() => cancelReservation(res.id)}
                        className={`px-2 py-1 text-[10px] uppercase border cursor-pointer ${
                          isLight
                            ? 'text-red-700 hover:bg-red-100 border-red-200'
                            : 'text-red-400 hover:bg-red-500/10 border-red-500/20'
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. Manual New Reservation Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xl p-6 border space-y-4 max-h-[90vh] overflow-y-auto ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className="text-lg font-editorial">Create New Reservation</h3>
              <button onClick={() => setShowManualModal(false)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Priya Mehta"
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@example.in"
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Booking Channel</label>
                  <select
                    value={bookingChannel}
                    onChange={(e) => setBookingChannel(e.target.value as BookingChannel)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    <option value="Direct Website">Direct Website</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Phone">Phone</option>
                    <option value="MakeMyTrip">MakeMyTrip</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Agoda">Agoda</option>
                    <option value="Travel Agent">Travel Agent</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Repeat Guest">Repeat Guest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Room Type & Allocation</label>
                  <select
                    value={roomNumber}
                    onChange={(e) => {
                      setRoomNumber(e.target.value);
                      const targetRoom = rooms.find((r) => r.number === e.target.value);
                      if (targetRoom) {
                        setRoomType(targetRoom.type);
                        setRoomRate(targetRoom.ratePerNight);
                      }
                    }}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    {rooms.map((rm) => (
                      <option key={rm.id} value={rm.number}>
                        {rm.number} · {rm.type} (₹{rm.ratePerNight.toLocaleString('en-IN')}/night) — [{rm.status}]
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Nightly Rate (₹)</label>
                  <input
                    type="number"
                    value={roomRate}
                    onChange={(e) => setRoomRate(parseInt(e.target.value) || 4500)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Nights</label>
                  <input
                    type="number"
                    min="1"
                    value={nights}
                    onChange={(e) => setNights(parseInt(e.target.value) || 1)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Children</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="petCheck"
                  checked={hasPets}
                  onChange={(e) => setHasPets(e.target.checked)}
                />
                <label htmlFor="petCheck" className="cursor-pointer">
                  Guest is traveling with pet (pet friendly room required)
                </label>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Vegetarian breakfast, baby cot in room, high floor"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div className="p-3 bg-black/5 dark:bg-white/5 border border-inherit rounded flex justify-between font-bold">
                <span>Calculated Total (with 12% GST):</span>
                <span>₹{(roomRate * nights * 1.12).toLocaleString('en-IN')}</span>
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
                  Create Confirmed Reservation
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
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
