import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { GuestBill } from '../../../types';
import {
  Receipt,
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Check,
  Plus,
} from 'lucide-react';

export const PaymentsModule: React.FC = () => {
  const { guestBills, settleFolio, addChargeToFolio, rooms } = useResortOS();
  const { isLight } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolioId, setSelectedFolioId] = useState<string>(guestBills[0]?.id || '');
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeCat, setChargeCat] = useState('Restaurant');
  const [chargeAmt, setChargeAmt] = useState(500);

  const selectedFolio = guestBills.find((b) => b.id === selectedFolioId) || guestBills[0];

  const filteredBills = guestBills.filter((b) => {
    return (
      b.folioNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCollectedINR = guestBills.reduce((sum, b) => sum + b.paymentsReceived, 0);
  const totalOutstandingINR = guestBills.reduce((sum, b) => sum + b.outstandingBalance, 0);

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolio || !chargeDesc || chargeAmt <= 0) return;
    addChargeToFolio(selectedFolio.roomNumber, chargeDesc, chargeCat as any, chargeAmt);
    setShowAddChargeModal(false);
    setChargeDesc('');
    setChargeAmt(500);
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
            09. Payments & Billing Ledger
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            REAL-TIME FOLIO SETTLEMENT · 12% GST COMPLIANT TAXATION · ALL VALUES IN INDIAN RUPEES (₹)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFolio && selectedFolio.outstandingBalance > 0 && (
            <button
              onClick={() => settleFolio(selectedFolio.id, 'UPI / Card')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isLight
                  ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                  : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Settle Selected Folio</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Total Payments Captured</span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{totalCollectedINR.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Settled via UPI, Cards & Cash
          </span>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Outstanding Guest Balance</span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            ₹{totalOutstandingINR.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Pending checkout settlement
          </span>
        </div>

        <div
          className={`p-4 border space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-neutral-500 uppercase text-[10px]">Total Active Folios</span>
          <div className="text-xl font-bold font-mono">{guestBills.length}</div>
          <span className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Across in-residence bookings
          </span>
        </div>
      </div>

      {/* 3. 2-Column Split: Folio List + Folio Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Folio List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search folio #, guest, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 text-xs font-mono border focus:outline-none ${
                isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
              }`}
            />
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredBills.map((b) => {
              const isSelected = selectedFolio?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedFolioId(b.id)}
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
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-[#8F6834] dark:text-[#c8aa6e]">{b.folioNumber}</div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{b.guestName}</div>
                      <div className="text-[11px] font-mono text-neutral-500">{b.roomNumber} · {b.invoiceId}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm font-mono">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mt-1 ${
                          b.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {b.status === 'Paid' ? 'SETTLED' : `DUE: ₹${b.outstandingBalance.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Folio Itemized Breakdown */}
        {selectedFolio && (
          <div
            className={`lg:col-span-2 p-6 border rounded space-y-5 ${
              isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
            }`}
          >
            {/* Folio Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-inherit">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-editorial font-bold">{selectedFolio.folioNumber}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                      selectedFolio.status === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {selectedFolio.status === 'Paid' ? 'PAID IN FULL' : 'PAYMENT PENDING'}
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-500 mt-0.5">
                  Guest: {selectedFolio.guestName} · {selectedFolio.roomNumber} · Invoice: {selectedFolio.invoiceId}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddChargeModal(true)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase border cursor-pointer flex items-center gap-1 ${
                    isLight ? 'bg-[#F0EEE7] border-[#D0CCC0] hover:bg-[#DCD9CC]' : 'bg-white/10 border-white/20 hover:bg-white/15'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room Charge</span>
                </button>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr
                    className={`border-b ${
                      isLight ? 'border-[#D0CCC0] text-[#18251F]' : 'border-white/10 text-neutral-300'
                    }`}
                  >
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {selectedFolio.charges.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 font-semibold text-neutral-900 dark:text-neutral-100">{c.description}</td>
                      <td className="py-2.5 text-neutral-500">{c.category}</td>
                      <td className="py-2.5 text-neutral-500">{c.date}</td>
                      <td className="py-2.5 text-right font-bold font-mono">
                        {c.amount < 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            -₹{Math.abs(c.amount).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          `₹${c.amount.toLocaleString('en-IN')}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Folio Summary Totals */}
            <div className="p-4 border rounded space-y-2 text-xs font-mono bg-black/5 dark:bg-white/5 border-inherit">
              <div className="flex justify-between">
                <span>Grand Subtotal (Charges & Dining):</span>
                <span>₹{selectedFolio.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Payments Received ({selectedFolio.paymentMethod}):</span>
                <span>-₹{selectedFolio.paymentsReceived.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-inherit flex justify-between font-bold text-sm">
                <span>Outstanding Balance Due:</span>
                <span
                  className={
                    selectedFolio.outstandingBalance > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  ₹{selectedFolio.outstandingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Settle Action */}
            {selectedFolio.outstandingBalance > 0 && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => settleFolio(selectedFolio.id, 'UPI / Card')}
                  className={`px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-bold border cursor-pointer flex items-center gap-2 ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settle Balance (₹{selectedFolio.outstandingBalance.toLocaleString('en-IN')})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Charge Modal */}
      {showAddChargeModal && selectedFolio && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 border space-y-4 ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <h3 className="text-base font-editorial font-bold">Add Charge to {selectedFolio.roomNumber}</h3>
              <button onClick={() => setShowAddChargeModal(false)} className="cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddCharge} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  required
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  placeholder="e.g. Palm Terrace Dinner, Laundry Express"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Category</label>
                  <select
                    value={chargeCat}
                    onChange={(e) => setChargeCat(e.target.value)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Room Service">Room Service</option>
                    <option value="Activities">Activities</option>
                    <option value="Laundry">Laundry</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={chargeAmt}
                    onChange={(e) => setChargeAmt(parseInt(e.target.value) || 0)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 py-2 font-bold uppercase tracking-wider cursor-pointer border ${
                    isLight ? 'bg-[#18251F] text-white hover:bg-[#26332D]' : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Post Charge to Folio
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddChargeModal(false)}
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
