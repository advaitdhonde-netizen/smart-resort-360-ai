import React from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  Package,
  Wrench,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const AnalyticsModule: React.FC = () => {
  const {
    rooms,
    reservations,
    housekeepingTasks,
    maintenanceIssues,
    kitchenOrders,
    inventoryItems,
    analytics,
  } = useResortOS();
  const { isLight } = useTheme();

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const occupancyPercentage = Math.round(((totalRooms - availableRooms) / totalRooms) * 100);

  const checkInsToday = reservations.filter(
    (r) => r.status === 'Confirmed' || r.status === 'Checked In'
  ).length;
  const checkOutsToday = reservations.filter((r) => r.status === 'Checked Out').length;
  const pendingHousekeeping = housekeepingTasks.filter(
    (t) => t.status === 'Pending' || t.status === 'In Progress'
  ).length;
  const openMaintenance = maintenanceIssues.filter((m) => m.status !== 'Resolved').length;
  const activeOrders = kitchenOrders.filter((o) => o.status !== 'Completed').length;
  const lowStockCount = inventoryItems.filter((i) => i.currentStock <= i.reorderLevel).length;

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
            11. Executive Analytics & Operations KPIs
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            REAL-TIME PROPERTY PERFORMANCE · REVENUE METRICS (₹ INR) · CAPACITY VELOCITY
          </p>
        </div>

        <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          SYSTEM HEALTH: 100% OPERATIONAL
        </span>
      </div>

      {/* 2. Top Executive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Today's Occupancy */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Today's Occupancy</span>
          <div className="text-2xl font-bold font-mono">{occupancyPercentage}%</div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            {totalRooms - availableRooms} of {totalRooms} rooms committed ({occupiedRooms} in-residence)
          </div>
        </div>

        {/* KPI 2: Available Rooms */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Available Rooms</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {availableRooms} Units
          </div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Cleaned, inspected & ready for arrival
          </div>
        </div>

        {/* KPI 3: Today's Revenue */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Today's Revenue</span>
          <div className="text-2xl font-bold font-mono text-[#8F6834] dark:text-[#c8aa6e]">
            ₹{analytics.dailyRevenue.toLocaleString('en-IN')}
          </div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            ADR: ₹{analytics.adr.toLocaleString('en-IN')} · RevPAR: ₹{analytics.revPar.toLocaleString('en-IN')}
          </div>
        </div>

        {/* KPI 4: Check-ins & Check-outs Today */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Arrivals & Departures</span>
          <div className="text-2xl font-bold font-mono">
            {checkInsToday} In / {checkOutsToday} Out
          </div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Front desk check-in wave synchronized
          </div>
        </div>

        {/* KPI 5: Pending Housekeeping */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Pending Housekeeping</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingHousekeeping} Tasks
          </div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Assigned across standard, deluxe & villas
          </div>
        </div>

        {/* KPI 6: Open Maintenance Issues */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Open Maintenance Issues</span>
          <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
            {openMaintenance} Active
          </div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Traceable AI diagnostic work orders
          </div>
        </div>

        {/* KPI 7: Restaurant Kitchen Orders */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Restaurant Orders</span>
          <div className="text-2xl font-bold font-mono">{kitchenOrders.length} Today</div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            {activeOrders} currently preparing / in delivery
          </div>
        </div>

        {/* KPI 8: Low Stock Items */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Low Stock Items</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {lowStockCount} Items
          </div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Reorder recommendation flagged
          </div>
        </div>

        {/* KPI 9: Month Revenue */}
        <div
          className={`p-5 border rounded space-y-1 ${
            isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">Month-to-Date Revenue</span>
          <div className="text-2xl font-bold font-mono text-[#8F6834] dark:text-[#c8aa6e]">
            ₹{analytics.monthRevenue.toLocaleString('en-IN')}
          </div>
          <div className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            Guest Satisfaction: ★ {analytics.guestSatisfaction} / 5.0
          </div>
        </div>
      </div>
    </div>
  );
};
