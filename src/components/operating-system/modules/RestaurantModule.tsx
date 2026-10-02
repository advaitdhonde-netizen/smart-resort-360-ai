import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { RESORT_MENU_ITEMS } from '../../../data/resortData';
import { KitchenOrder, MenuCategory } from '../../../types';
import {
  UtensilsCrossed,
  Coffee,
  Clock,
  CheckCircle2,
  Plus,
  Flame,
  Search,
  Filter,
  Check,
  ChevronRight,
  Leaf,
  Drumstick,
} from 'lucide-react';

export const RestaurantModule: React.FC = () => {
  const {
    restaurantTables,
    kitchenOrders,
    updateKitchenOrderStatus,
    createKitchenOrder,
    reserveRestaurantTable,
    rooms,
  } = useResortOS();
  const { isLight } = useTheme();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'tables'>('orders');
  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuCategory>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Table reservation form state
  const [tableModal, setTableModal] = useState(false);
  const [resTableId, setResTableId] = useState('T-01');
  const [resGuestName, setResGuestName] = useState('');
  const [resTime, setResTime] = useState('20:00 PM');
  const [resCovers, setResCovers] = useState(2);
  const [resNotes, setResNotes] = useState('');

  // Kitchen Order Modal
  const [orderModal, setOrderModal] = useState(false);
  const [orderGuestName, setOrderGuestName] = useState('');
  const [orderTarget, setOrderTarget] = useState('Room 204');
  const [orderType, setOrderType] = useState<KitchenOrder['type']>('Room Service');
  const [selectedDishId, setSelectedDishId] = useState(RESORT_MENU_ITEMS[0].id);
  const [dishQty, setDishQty] = useState(1);

  // Filtered Menu Items
  const filteredMenuItems = RESORT_MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTableReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resGuestName) return;
    reserveRestaurantTable(resTableId, resGuestName, resTime, resCovers, resNotes);
    setTableModal(false);
    setResGuestName('');
    setResNotes('');
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dish = RESORT_MENU_ITEMS.find((d) => d.id === selectedDishId) || RESORT_MENU_ITEMS[0];
    createKitchenOrder({
      guestName: orderGuestName || 'Resort Guest',
      tableOrRoom: orderTarget,
      roomNumber: orderTarget.startsWith('Room') || orderTarget.startsWith('Villa') ? orderTarget : undefined,
      type: orderType,
      items: [{ name: dish.name, quantity: dishQty, price: dish.price }],
      total: dish.price * dishQty,
      status: 'Received',
    });
    setOrderModal(false);
  };

  return (
    <div className={`space-y-6 ${isLight ? 'text-[#18251F]' : 'text-neutral-200'}`}>
      {/* 1. Header & Meal Hours Status Banner */}
      <div
        className={`p-5 border space-y-4 ${
          isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-inherit pb-3">
          <div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className={`w-4 h-4 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
              <h2 className="text-xl font-editorial">The Palm Terrace & Grove Restaurant</h2>
            </div>
            <p className={`text-xs font-mono mt-0.5 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              MULTI-CUISINE DINING · TABLE MANAGEMENT · LIVE KITCHEN PIPELINE · ZERO BEEF POLICY
            </p>
          </div>

          <span className="px-3 py-1 text-xs font-mono font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            RESTAURANT STATUS: OPEN
          </span>
        </div>

        {/* Standard Meal Timing Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div
            className={`p-3 border rounded ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">BREAKFAST</span>
              <span className="text-[10px] text-neutral-500">Buffet & Live Counters</span>
            </div>
            <div className="text-base font-bold mt-1 text-[#8F6834] dark:text-[#c8aa6e]">
              7:00 AM – 10:30 AM
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">South Indian, Eggs to order, Fresh juices</div>
          </div>

          <div
            className={`p-3 border rounded ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">LUNCH</span>
              <span className="text-[10px] text-neutral-500">À la Carte & Thali</span>
            </div>
            <div className="text-base font-bold mt-1 text-[#8F6834] dark:text-[#c8aa6e]">
              12:30 PM – 3:00 PM
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Pizzas, Biryanis, Noodles, Curries</div>
          </div>

          <div
            className={`p-3 border rounded ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">DINNER</span>
              <span className="text-[10px] text-neutral-500">Lawn Barbecue & Acoustic</span>
            </div>
            <div className="text-base font-bold mt-1 text-[#8F6834] dark:text-[#c8aa6e]">
              7:30 PM – 10:30 PM
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Tandoori grills, Continental specials</div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-inherit pb-2 text-xs font-mono">
        <div className="flex gap-2">
          {[
            { id: 'orders', label: `Kitchen Orders (${kitchenOrders.length})` },
            { id: 'menu', label: `Restaurant Menu (${RESORT_MENU_ITEMS.length})` },
            { id: 'tables', label: `Tables (${restaurantTables.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? isLight
                    ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                    : 'bg-white/15 text-white border-white/20 font-bold'
                  : isLight
                  ? 'border-transparent text-[#68716B] hover:text-[#18251F]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOrderModal(true)}
            className={`px-3 py-1.5 uppercase font-semibold text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fire Order</span>
          </button>
          <button
            onClick={() => setTableModal(true)}
            className={`px-3 py-1.5 uppercase text-xs border transition-colors cursor-pointer ${
              isLight ? 'border-[#D0CCC0] hover:bg-[#DCD9CC]' : 'border-white/10 hover:bg-white/10'
            }`}
          >
            Reserve Table
          </button>
        </div>
      </div>

      {/* 3. TAB A: KITCHEN ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kitchenOrders.map((ord) => (
              <div
                key={ord.id}
                className={`p-4 border flex flex-col justify-between space-y-3 ${
                  isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-inherit">
                    <span className="font-bold text-xs font-mono text-[#8F6834] dark:text-[#c8aa6e]">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold">
                      {ord.type}
                    </span>
                  </div>

                  <div className="pt-2 text-xs font-mono space-y-0.5">
                    <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{ord.tableOrRoom}</div>
                    <div className="text-neutral-500">Guest: {ord.guestName} · {ord.time}</div>
                  </div>

                  <div className="py-2 space-y-1 text-xs font-mono">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-neutral-500 font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-inherit flex items-center justify-between">
                  <div className="font-bold text-xs font-mono">
                    Total: ₹{ord.total.toLocaleString('en-IN')}
                  </div>

                  {/* Order Status Controller */}
                  <select
                    value={ord.status}
                    onChange={(e) => updateKitchenOrderStatus(ord.id, e.target.value as any)}
                    className={`p-1 text-[11px] font-mono border rounded ${
                      ord.status === 'Completed' || ord.status === 'Delivered'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : ord.status === 'Preparing'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        : 'bg-black/5 dark:bg-white/5 border-inherit'
                    }`}
                  >
                    <option value="Received">Received</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB B: RESTAURANT MENU */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {['All', 'Breakfast', 'Indian', 'Continental', 'Chinese', 'Snacks', 'Beverages', 'Desserts', 'Kids Menu'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`px-3 py-1 border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? isLight
                        ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                        : 'bg-white/15 text-white border-white/20 font-bold'
                      : isLight
                      ? 'border-[#D0CCC0] bg-[#F0EEE7] text-[#4D5C4D]'
                      : 'border-white/10 text-neutral-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dish name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-8 pr-3 py-1 text-xs font-mono border ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 border rounded flex flex-col justify-between space-y-2 ${
                  isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      {item.isVeg ? (
                        <span className="w-3 h-3 rounded-full border border-emerald-600 flex items-center justify-center shrink-0" title="Pure Vegetarian">
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                        </span>
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-red-600 flex items-center justify-center shrink-0" title="Non-Vegetarian">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        </span>
                      )}
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-sm text-[#8F6834] dark:text-[#c8aa6e]">
                      ₹{item.price}
                    </span>
                  </div>

                  <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-inherit text-[10px] text-neutral-500">
                  <span>Prep: ~{item.prepTimeMinutes} mins</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">In Stock & Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB C: TABLES */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {restaurantTables.map((tbl) => (
            <div
              key={tbl.id}
              className={`p-4 border rounded space-y-2 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{tbl.tableNumber}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                    tbl.status === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : tbl.status === 'Occupied'
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {tbl.status}
                </span>
              </div>

              <div className="text-[11px] text-neutral-500">
                {tbl.section} · {tbl.capacity} Covers
              </div>

              {tbl.currentReservation && (
                <div
                  className={`p-2 border rounded space-y-0.5 text-[11px] ${
                    isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="font-bold">{tbl.currentReservation.guestName}</div>
                  <div>Time: {tbl.currentReservation.time} ({tbl.currentReservation.covers} Guests)</div>
                  {tbl.currentReservation.notes && (
                    <div className="italic text-neutral-500">"{tbl.currentReservation.notes}"</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table Reservation Modal */}
      {tableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 border space-y-4 ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <h3 className="text-base font-editorial font-bold">Reserve Restaurant Table</h3>
              <button onClick={() => setTableModal(false)} className="cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleTableReserveSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block mb-1 font-semibold">Select Table</label>
                <select
                  value={resTableId}
                  onChange={(e) => setResTableId(e.target.value)}
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                >
                  {restaurantTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} · {t.section} ({t.capacity} covers) — [{t.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={resGuestName}
                  onChange={(e) => setResGuestName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Time</label>
                  <input
                    type="text"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Covers</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={resCovers}
                    onChange={(e) => setResCovers(parseInt(e.target.value) || 1)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Special Notes</label>
                <input
                  type="text"
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="e.g. High chair needed, pool-facing"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 py-2 font-bold uppercase tracking-wider cursor-pointer border ${
                    isLight ? 'bg-[#18251F] text-white' : 'bg-[#c8aa6e] text-black'
                  }`}
                >
                  Confirm Table Booking
                </button>
                <button
                  type="button"
                  onClick={() => setTableModal(false)}
                  className={`px-4 py-2 uppercase border cursor-pointer ${isLight ? 'border-[#D0CCC0]' : 'border-white/10'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Fire Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 border space-y-4 ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <h3 className="text-base font-editorial font-bold">Fire Kitchen Order</h3>
              <button onClick={() => setOrderModal(false)} className="cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateOrderSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block mb-1 font-semibold">Destination (Room / Table)</label>
                <input
                  type="text"
                  required
                  value={orderTarget}
                  onChange={(e) => setOrderTarget(e.target.value)}
                  placeholder="e.g. Room 204 or Table T-03"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Guest Name</label>
                <input
                  type="text"
                  value={orderGuestName}
                  onChange={(e) => setOrderGuestName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    <option value="Room Service">Room Service</option>
                    <option value="Dine-In">Dine-In</option>
                    <option value="Takeaway">Takeaway</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Dish</label>
                  <select
                    value={selectedDishId}
                    onChange={(e) => setSelectedDishId(e.target.value)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    {RESORT_MENU_ITEMS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (₹{m.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 py-2 font-bold uppercase tracking-wider cursor-pointer border ${
                    isLight ? 'bg-[#18251F] text-white' : 'bg-[#c8aa6e] text-black'
                  }`}
                >
                  Send Order to Kitchen
                </button>
                <button
                  type="button"
                  onClick={() => setOrderModal(false)}
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
