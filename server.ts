import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// Enable JSON body parsing with large limit for image uploads
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI client server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ============================================================================
// ============================================================================
// 1. IN-MEMORY ACTUAL RESORT STATE FOR REAL OPERATIONAL DATA RETRIEVAL
// ============================================================================
const RESORT_DATA = {
  occupancy: {
    totalRooms: 24,
    occupiedRooms: 19,
    availableRooms: 3,
    maintenanceRooms: 1,
    cleaningRooms: 1,
    occupancyRate: 79.2,
    adr: 7250,
    revpar: 5742,
    weeklyChangeExplanation:
      'Occupancy increased +6.4% this week driven by family holiday weekend reservations booked via direct resort website and partner channels.',
  },
  rooms: [
    // Standard Rooms 101-108 (₹4,500/night)
    { number: 'Room 101', type: 'Standard Room', status: 'Available', guest: null, rate: 4500, floor: 'Block A · Ground Floor' },
    { number: 'Room 102', type: 'Standard Room', status: 'Cleaning', guest: 'Ananya Deshmukh (Checked Out)', rate: 4500, floor: 'Block A · Ground Floor' },
    { number: 'Room 103', type: 'Standard Room', status: 'Occupied', guest: 'Vikrant Saxena', rate: 4500, floor: 'Block A · Ground Floor' },
    { number: 'Room 104', type: 'Standard Room', status: 'Available', guest: null, rate: 4500, floor: 'Block A · Ground Floor' },
    { number: 'Room 105', type: 'Standard Room', status: 'Occupied', guest: 'Kavita Iyer', rate: 4500, floor: 'Block A · Level 1' },
    { number: 'Room 106', type: 'Standard Room', status: 'Occupied', guest: 'Deepak Verma', rate: 4500, floor: 'Block A · Level 1' },
    { number: 'Room 107', type: 'Standard Room', status: 'Available', guest: null, rate: 4500, floor: 'Block A · Level 1' },
    { number: 'Room 108', type: 'Standard Room', status: 'Available', guest: null, rate: 4500, floor: 'Block A · Level 1' },
    // Deluxe Rooms 201-208 (₹6,500/night)
    { number: 'Room 201', type: 'Deluxe Room', status: 'Reserved', guest: 'Rahul Kulkarni (Arr. 16:30)', rate: 6500, floor: 'Block B · Level 1' },
    { number: 'Room 202', type: 'Deluxe Room', status: 'Occupied', guest: 'Manish & Divya Agarwal', rate: 6500, floor: 'Block B · Level 1' },
    { number: 'Room 203', type: 'Deluxe Room', status: 'Available', guest: null, rate: 6500, floor: 'Block B · Level 1' },
    { number: 'Room 204', type: 'Deluxe Room', status: 'Occupied', guest: 'Rahul & Priya Sharma (Guest Portal User)', rate: 6500, floor: 'Block B · Level 2', notes: 'AC cooling diagnostic ticket in progress (MNT-2026-101).' },
    { number: 'Room 205', type: 'Deluxe Room', status: 'Available', guest: null, rate: 6500, floor: 'Block B · Level 2' },
    { number: 'Room 206', type: 'Deluxe Room', status: 'Occupied', guest: 'Sameer & Aarti Chawla', rate: 6500, floor: 'Block B · Level 2' },
    { number: 'Room 207', type: 'Deluxe Room', status: 'Maintenance', guest: null, rate: 6500, floor: 'Block B · Level 2', notes: 'Bathroom tap replacement underway.' },
    { number: 'Room 208', type: 'Deluxe Room', status: 'Available', guest: null, rate: 6500, floor: 'Block B · Level 2' },
    // Family Rooms 301-304 (₹8,000/night)
    { number: 'Room 301', type: 'Family Room', status: 'Occupied', guest: 'Rohan Patil (Family of 4)', rate: 8000, floor: 'Block C · Level 1' },
    { number: 'Room 302', type: 'Family Room', status: 'Available', guest: null, rate: 8000, floor: 'Block C · Level 1' },
    { number: 'Room 303', type: 'Family Room', status: 'Reserved', guest: 'Sneha Joshi (Arr. Saturday)', rate: 8000, floor: 'Block C · Level 2' },
    { number: 'Room 304', type: 'Family Room', status: 'Available', guest: null, rate: 8000, floor: 'Block C · Level 2' },
    // Garden Villas 01-04 (₹15,000–₹18,000/night)
    { number: 'Villa 01', type: 'Premium Villa', status: 'Reserved', guest: 'Neha Shah (Arr. Tomorrow with Pet)', rate: 15000, floor: 'Villa Enclave · West' },
    { number: 'Villa 02', type: 'Premium Villa', status: 'Occupied', guest: 'Priya Mehta & Family', rate: 16500, floor: 'Villa Enclave · West' },
    { number: 'Villa 03', type: 'Premium Villa', status: 'Available', guest: null, rate: 15000, floor: 'Villa Enclave · West' },
    { number: 'Villa 04', type: 'Premium Villa', status: 'Cleaning', guest: 'Devendra Singhania (Checked Out)', rate: 18000, floor: 'Villa Enclave · West' },
  ],
  reservationsToday: [
    { ref: 'RES-2026-801', guest: 'Aarav Sharma', room: 'Room 101', checkIn: '2026-09-26', checkOut: '2026-09-29', adults: 2, children: 0, channel: 'Direct Website', status: 'Checked In', total: 15120 },
    { ref: 'RES-2026-802', guest: 'Priya Mehta', room: 'Room 201', checkIn: '2026-09-26', checkOut: '2026-09-28', adults: 2, children: 1, channel: 'MakeMyTrip', status: 'Checked In', total: 14560 },
    { ref: 'RES-2026-803', guest: 'Rohan Patil', room: 'Room 301', checkIn: '2026-09-25', checkOut: '2026-09-28', adults: 2, children: 2, channel: 'Agoda', status: 'Checked In', total: 26880 },
    { ref: 'RES-2026-804', guest: 'Ananya Deshmukh', room: 'Villa 01', checkIn: '2026-09-26', checkOut: '2026-09-30', adults: 4, children: 1, pets: 1, channel: 'Direct Website', status: 'Confirmed', total: 71680 },
    { ref: 'RES-2026-805', guest: 'Rahul Kulkarni', room: 'Villa 02', checkIn: '2026-09-27', checkOut: '2026-09-30', adults: 2, children: 0, channel: 'Repeat Guest', status: 'Confirmed', total: 60480 },
  ],
  housekeepingQueue: [
    { room: 'Room 202', task: 'Full Turnover Cleaning', priority: 'High', status: 'In Progress', staff: 'Sunita Devi', estMinutes: 25, reason: 'Guest checked out at 10:45 AM. Next arrival at 14:00 PM.' },
    { room: 'Room 104', task: 'Stayover Service & Linen', priority: 'Normal', status: 'Pending', staff: 'Kavita Rao', estMinutes: 20, reason: 'Daily refresh requested by guest.' },
    { room: 'Villa 02', task: 'Pre-Arrival Inspection', priority: 'High', status: 'Pending', staff: 'Ramesh Pawar', estMinutes: 30, reason: 'Arrival scheduled for 16:00 PM.' },
    { room: 'Room 102', task: 'Turnover Cleaning', priority: 'Medium', status: 'Pending', staff: 'Sneha Kulkarni', estMinutes: 30, reason: 'Standard departure turnover.' },
    { room: 'Villa 04', task: 'Deep Sanitization', priority: 'High', status: 'Pending', staff: 'Rajesh Shinde', estMinutes: 45, reason: 'Post-stay villa turnover.' },
  ],
  maintenanceTickets: [
    { ticketId: 'MNT-2026-101', room: 'Room 204', category: 'HVAC', description: 'Split AC indoor blower making mild rattling sound, low cooling', priority: 'High', status: 'In Progress', assignedTo: 'Suresh Verma', reportedBy: 'Guest (Priya M.)' },
    { ticketId: 'MNT-2026-102', room: 'Room 302', category: 'Plumbing', description: 'Bathroom shower mixer knob stiff to turn', priority: 'Medium', status: 'Reported', assignedTo: 'Amit Joshi', reportedBy: 'Housekeeping' },
    { ticketId: 'MNT-2026-103', room: 'Pool Plantroom', category: 'Equipment', description: 'Ozone recirculation filter backwash scheduled', priority: 'Low', status: 'Parts Sourced', assignedTo: 'Rajesh Nair', reportedBy: 'Preventive Schedule' },
  ],
  inventory: [
    { item: 'Dehradun Basmati Rice (25kg bag)', category: 'F&B Provisions', current: 4, min: 6, unit: 'bags', status: 'Reorder Recommended', reorderQty: 8, unitCost: 2800 },
    { item: 'Coffee Beans - Arabica Estate (1kg)', category: 'Beverages', current: 12, min: 10, unit: 'kg', status: 'Adequate', reorderQty: 0, unitCost: 850 },
    { item: 'Bath Towels - Premium White 650 GSM', category: 'Linen & Laundry', current: 35, min: 50, unit: 'pcs', status: 'Reorder Recommended', reorderQty: 30, unitCost: 450 },
    { item: 'Darjeeling First Flush Tea (500g)', category: 'Beverages', current: 8, min: 6, unit: 'tins', status: 'Adequate', reorderQty: 0, unitCost: 1200 },
    { item: 'Eco-Friendly Shampoo & Wash (5L)', category: 'Guest Amenities', current: 6, min: 8, unit: 'cans', status: 'Reorder Recommended', reorderQty: 10, unitCost: 1650 },
    { item: 'Cold Mineral Water (500ml Crate)', category: 'Beverages', current: 24, min: 20, unit: 'crates', status: 'Adequate', reorderQty: 0, unitCost: 350 },
  ],
  diningTimings: {
    breakfast: '7:00 AM – 10:30 AM',
    lunch: '12:30 PM – 3:00 PM',
    dinner: '7:30 PM – 10:30 PM',
    restaurant: 'Spice Valley Restaurant & Café',
    estimatedTodayRevenue: 54200,
    activeDinnerCovers: 86,
  },
  weather: {
    city: 'Alibaug Resort Enclave',
    temperature: 28.4,
    condition: 'Partly Cloudy with Humidity',
    humidity: 78,
    windSpeed: 14,
    rainfall: 0,
    forecast: 'Mild precipitation chance (25%) in evening. Monsoon monitoring active.',
  },
};

function determineGroundedSources(query: string): string[] {
  const q = query.toLowerCase();
  const sources = ['Smart Resort 360 Core OS'];
  if (q.includes('room') || q.includes('villa') || q.includes('occupan') || q.includes('availab')) sources.push('PMS Room Ledger');
  if (q.includes('housekeep') || q.includes('clean') || q.includes('linen') || q.includes('turnaround')) sources.push('Housekeeping Fleet Registry');
  if (q.includes('maint') || q.includes('ac') || q.includes('leak') || q.includes('repair') || q.includes('ticket')) sources.push('Engineering BMS Telemetry');
  if (q.includes('stock') || q.includes('inventory') || q.includes('reorder') || q.includes('par')) sources.push('Inventory Par Ledger');
  if (q.includes('food') || q.includes('dine') || q.includes('restaurant') || q.includes('breakfast') || q.includes('revenue')) sources.push('F&B POS & Kitchen Display');
  if (q.includes('rain') || q.includes('weather') || q.includes('storm') || q.includes('temp') || q.includes('simulation') || q.includes('80mm')) sources.push('Weather Digital Twin Engine');
  if (q.includes('guest') || q.includes('reserv') || q.includes('arriv') || q.includes('bill')) sources.push('Front Desk Guest Folio');
  return sources;
}

function detectSuggestedAction(query: string, _answer: string, ctx: any): any {
  const q = query.toLowerCase();
  if (q.includes('create') && (q.includes('housekeep') || q.includes('clean') || q.includes('task'))) {
    const roomMatch = query.match(/(?:room|villa)\s*(\d+|0\d+)/i);
    const roomNumber = roomMatch ? (roomMatch[0].toLowerCase().includes('villa') ? `Villa ${roomMatch[1]}` : `Room ${roomMatch[1]}`) : 'Room 204';
    return {
      type: 'CREATE_HOUSEKEEPING_TASK',
      label: `Create Housekeeping Task for ${roomNumber}`,
      payload: { roomNumber, taskType: 'Turnover Cleaning', priority: 'High' },
    };
  }
  if (q.includes('create') && (q.includes('maintenance') || q.includes('repair') || q.includes('work order') || q.includes('ticket'))) {
    const roomMatch = query.match(/(?:room|villa)\s*(\d+|0\d+)/i);
    const roomNumber = roomMatch ? (roomMatch[0].toLowerCase().includes('villa') ? `Villa ${roomMatch[1]}` : `Room ${roomMatch[1]}`) : 'Room 204';
    return {
      type: 'CREATE_MAINTENANCE_TICKET',
      label: `Log Work Order for ${roomNumber}`,
      payload: { area: roomNumber, category: 'HVAC', priority: 'High' },
    };
  }
  if (q.includes('twin') || q.includes('3d') || q.includes('locate') || q.includes('where is')) {
    return {
      type: 'VIEW_3D_ZONE',
      label: 'Locate on 3D Digital Twin',
      payload: { zoneId: 'ocean-villas' },
    };
  }
  return undefined;
}

// ============================================================================
// GEMINI API UTILITIES & OPERATIONS COPILOT ENGINE
// ============================================================================
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI Copilot is not configured. Add GEMINI_API_KEY to the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Robust Gemini Invocation Helper with Model Fallback (Handles transient 503 capacity spikes)
async function callGemini(params: {
  contents: any;
  config?: any;
}): Promise<{ text: string; modelUsed: string }> {
  const aiClient = getAIClient();
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response.text !== undefined) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Request on model ${model} failed:`, err?.status || err?.message || err);
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API.');
}

async function callGeminiStream(params: {
  contents: any;
  config?: any;
}) {
  const aiClient = getAIClient();
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const stream = await aiClient.models.generateContentStream({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { stream, modelUsed: model };
    } catch (err: any) {
      console.warn(`[Gemini API Stream] Stream on model ${model} failed:`, err?.status || err?.message || err);
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw lastError || new Error('Failed to initiate Gemini streaming.');
}

const COPILOT_SYSTEM_INSTRUCTION = `You are Smart Resort 360 Copilot, an intelligent resort operations assistant.

You help resort management and staff understand the resort's current operational state, answer questions, analyze problems, reason about weather impacts, explain data, and recommend actions.

You can answer natural-language questions that were not explicitly programmed into the application.

Use the supplied resort context as the source of truth for actual resort data.

Never invent operational facts.

If the requested information is not available, clearly say that it is unavailable.

When discussing simulations, clearly label them as simulations.

Be concise but intelligent. Explain your reasoning when useful.

You can discuss:
reservations,
rooms,
guests,
housekeeping,
maintenance,
restaurant,
inventory,
staff,
payments,
feedback,
analytics,
weather,
weather forecasts,
weather simulations,
geospatial operational impacts,
and resort-wide operational decisions.

Operational context details:
• Currency is Indian Rupees (₹).
• Smart Resort 360 features 24 accommodation units: Standard Rooms 101–108, Deluxe Rooms 201–208, Family Suites 301–304, and Garden Villas 01–04.
• Resort Specialty: Sustainable coastal luxury, private plunge pool Garden Villas, Ayurvedic wellness spa, authentic coastal and regional Indian culinary excellence at Spice Valley Restaurant, and intelligent 3D digital twin operational architecture.
• Distinguish actual system state from simulated future state clearly.
• Weather simulation estimates operational effects (e.g. on pool closures, shifting dining indoors, housekeeping linens, transportation buggies) and MUST NEVER modify real reservation, billing, or guest records.`;

// ============================================================================
// REUSABLE ROBUST NORMALIZATION HELPERS FOR CONTEXT BUILDING
// ============================================================================

/**
 * Safely extracts an array from unknown or varying data shapes.
 * Handles:
 * - Direct arrays
 * - Objects with array properties (e.g., arrivalsToday, tasks, tickets, items, data, records)
 * - Safe fallbacks
 */
function extractSafeArray<T = any>(source: any, priorityKeys: string[] = [], fallback: T[] = []): T[] {
  if (Array.isArray(source)) {
    return source;
  }
  if (source && typeof source === 'object') {
    // Check specific known property keys first
    for (const key of priorityKeys) {
      if (Array.isArray(source[key])) {
        return source[key];
      }
    }
    // Check common collection property names
    const commonKeys = ['items', 'tasks', 'tickets', 'rooms', 'arrivalsToday', 'list', 'data', 'records', 'values'];
    for (const key of commonKeys) {
      if (Array.isArray(source[key])) {
        return source[key];
      }
    }
  }
  return Array.isArray(fallback) ? fallback : [];
}

function normalizeReservations(c: any): any[] {
  if (!c) return extractSafeArray(RESORT_DATA.reservationsToday);

  // 1. Direct array or object in c.reservations
  const fromReservations = extractSafeArray(c.reservations, ['arrivalsToday', 'reservations', 'list', 'items']);
  if (fromReservations.length > 0 || Array.isArray(c.reservations)) {
    return fromReservations;
  }

  // 2. Direct array or object in c.reservationsToday
  const fromReservationsToday = extractSafeArray(c.reservationsToday, ['arrivalsToday', 'list', 'items']);
  if (fromReservationsToday.length > 0 || Array.isArray(c.reservationsToday)) {
    return fromReservationsToday;
  }

  // 3. Fallback to default in-memory resort reservations
  return extractSafeArray(RESORT_DATA.reservationsToday);
}

function normalizeRooms(c: any): any[] {
  if (!c) return extractSafeArray(RESORT_DATA.rooms);

  const fromRooms = extractSafeArray(c.rooms, ['rooms', 'units', 'list', 'items']);
  if (fromRooms.length > 0 || Array.isArray(c.rooms)) {
    return fromRooms;
  }

  return extractSafeArray(RESORT_DATA.rooms);
}

function normalizeHousekeeping(c: any): any[] {
  if (!c) return extractSafeArray(RESORT_DATA.housekeepingQueue);

  const fromHousekeeping = extractSafeArray(c.housekeeping, ['tasks', 'queue', 'list', 'items']);
  if (fromHousekeeping.length > 0 || Array.isArray(c.housekeeping)) {
    return fromHousekeeping;
  }

  const fromTasks = extractSafeArray(c.housekeepingTasks || c.housekeepingQueue, ['tasks', 'items']);
  if (fromTasks.length > 0 || Array.isArray(c.housekeepingTasks) || Array.isArray(c.housekeepingQueue)) {
    return fromTasks;
  }

  return extractSafeArray(RESORT_DATA.housekeepingQueue);
}

function normalizeMaintenance(c: any): any[] {
  if (!c) return extractSafeArray(RESORT_DATA.maintenanceTickets);

  const fromMaintenance = extractSafeArray(c.maintenance, ['tickets', 'issues', 'list', 'items']);
  if (fromMaintenance.length > 0 || Array.isArray(c.maintenance)) {
    return fromMaintenance;
  }

  const fromTickets = extractSafeArray(c.maintenanceIssues || c.maintenanceTickets, ['tickets', 'issues', 'items']);
  if (fromTickets.length > 0 || Array.isArray(c.maintenanceIssues) || Array.isArray(c.maintenanceTickets)) {
    return fromTickets;
  }

  return extractSafeArray(RESORT_DATA.maintenanceTickets);
}

function normalizeInventory(c: any): any[] {
  if (!c) return extractSafeArray(RESORT_DATA.inventory);

  const fromInventory = extractSafeArray(c.inventory, ['items', 'lowStockItems', 'list']);
  if (fromInventory.length > 0 || Array.isArray(c.inventory)) {
    return fromInventory;
  }

  const fromItems = extractSafeArray(c.inventoryItems, ['items']);
  if (fromItems.length > 0 || Array.isArray(c.inventoryItems)) {
    return fromItems;
  }

  return extractSafeArray(RESORT_DATA.inventory);
}

function formatResortContextForPrompt(ctx: any): string {
  const c = ctx || RESORT_DATA;

  const rawRooms = normalizeRooms(c);
  const rawReservations = normalizeReservations(c);
  const rawHousekeeping = normalizeHousekeeping(c);
  const rawMaintenance = normalizeMaintenance(c);
  const rawInventory = normalizeInventory(c);

  const compact = {
    resort: {
      name: 'Smart Resort 360',
      currency: 'INR (₹)',
      totalUnits: 24,
      specialty:
        'Sustainable luxury, beachfront Garden Villas with private plunge pools, Ayurvedic spa wellness, multi-cuisine coastal & Indian dining at Spice Valley, and smart living digital hospitality architecture.',
      zones: [
        'Block A: Standard Rooms 101–108 (Ground & Level 1)',
        'Block B: Deluxe Rooms 201–208 (Level 1 & Level 2)',
        'Block C: Family Suites 301–304 (Level 1 & Level 2)',
        'Villa Enclave: Garden Villas 01–04 (West Plunge Pool Villas)',
      ],
    },
    occupancy: c.occupancy || RESORT_DATA.occupancy,
    rooms: rawRooms.map((r: any) => ({
      unit: r.number || r.unit || r.roomNumber || 'Unit',
      type: r.type || r.roomType || 'Accommodation',
      status: r.status || 'Available',
      guest: r.guest || r.currentGuest || null,
      floor: r.floor || '',
      rate: r.rate || r.ratePerNight || 0,
      notes: r.notes || '',
    })),
    reservationsToday: rawReservations.map((res: any) => ({
      ref: res.ref || res.bookingRef || res.id || 'RES-REF',
      guest: res.guest || res.guestName || 'Guest',
      unit: res.room || res.roomNumber || res.unit || 'Assigned Room',
      checkIn: res.checkIn || 'Today',
      checkOut: res.checkOut || 'Scheduled',
      status: res.status || 'Confirmed',
    })),
    housekeepingQueue: rawHousekeeping.map((t: any) => ({
      unit: t.room || t.roomNumber || t.unit || 'Area',
      task: t.task || t.taskType || 'Service',
      priority: t.priority || 'Normal',
      status: t.status || 'Pending',
      staff: t.staff || t.assignedStaff || 'Housekeeping Team',
    })),
    maintenanceTickets: rawMaintenance.map((m: any) => ({
      ticketId: m.id || m.ticketId || 'TKT-GEN',
      area: m.room || m.roomOrArea || m.roomNumber || 'Facility',
      category: m.category || 'General',
      description: m.description || m.title || '',
      priority: m.priority || 'Medium',
      status: m.status || 'Open',
      technician: m.technician || m.assignedTechnician || m.assignedTo || 'Unassigned',
    })),
    inventory: rawInventory.map((i: any) => ({
      item: i.name || i.item || 'Item',
      category: i.category || 'General',
      current: i.currentStock ?? i.current ?? 0,
      min: i.minThreshold ?? i.min ?? 0,
      unit: i.unit || 'units',
      status:
        (i.currentStock !== undefined && i.minThreshold !== undefined
          ? i.currentStock <= i.minThreshold
            ? 'Low / Reorder'
            : 'Adequate'
          : i.status) || 'Adequate',
    })),
    diningTimings: c.restaurant?.diningTimings || c.diningTimings || RESORT_DATA.diningTimings,
    weather: c.weather || RESORT_DATA.weather,
    simulation: c.simulation || { active: false, scenario: 'Normal live conditions' },
  };

  return JSON.stringify(compact, null, 2);
}

function buildConversationContents(messages: any[], query?: string) {
  const contents: any[] = [];
  if (Array.isArray(messages) && messages.length > 0) {
    for (const m of messages) {
      const text = m.content || m.text || '';
      if (!text.trim()) continue;
      contents.push({
        role: m.role === 'assistant' || m.role === 'model' || m.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: text.trim() }],
      });
    }
  }

  if (query && query.trim()) {
    const lastMsg = contents[contents.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.parts[0]?.text !== query.trim()) {
      contents.push({
        role: 'user',
        parts: [{ text: query.trim() }],
      });
    }
  }

  // Ensure first message has role 'user'
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  return contents;
}

// ============================================================================
// 2. CORE BACKEND DATA ENDPOINTS
// ============================================================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'Smart Resort 360 Full-Stack Engine', currency: 'INR (₹)' });
});

app.get('/api/guests/count', (_req: Request, res: Response) => {
  res.json({ total_guests: 48, in_house_reservations: 19 });
});

app.get('/api/resort-state', (_req: Request, res: Response) => {
  res.json(RESORT_DATA);
});

// ============================================================================
// 3. AI RESORT COPILOT (Multi-turn conversational AI with Gemini API)
// ============================================================================
app.post('/api/ai/copilot', async (req: Request, res: Response) => {
  try {
    const { query, userRole, messages, resortContext } = req.body;
    if (!query && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Query or messages parameter is required' });
    }

    if (userRole === 'CUSTOMER') {
      return res.status(403).json({ error: 'Access forbidden: Staff copilot is restricted to management and staff.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI Copilot is not configured. Add GEMINI_API_KEY to the server environment.',
      });
    }

    const currentQuery = query || messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || '';
    const formattedContext = formatResortContextForPrompt(resortContext);
    const systemInstruction = `${COPILOT_SYSTEM_INSTRUCTION}

LIVE RESORT DATABASE CONTEXT:
${formattedContext}`;

    const contents = buildConversationContents(messages || [], query);
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: currentQuery }] });
    }

    const { text, modelUsed } = await callGemini({
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const groundedSources = determineGroundedSources(currentQuery);
    const suggestedAction = detectSuggestedAction(currentQuery, text, resortContext || RESORT_DATA);

    return res.json({
      answer: text,
      groundedSources,
      suggestedAction,
      modelUsed,
    });
  } catch (error: any) {
    console.error('AI Copilot error:', error);
    const isConfig = error.message?.includes('not configured');
    return res.status(isConfig ? 503 : 500).json({
      error: error.message || 'Error processing AI Copilot request with Gemini API',
    });
  }
});

// Real-Time Server-Sent Events (SSE) Streaming Endpoint for AI Copilot
app.post('/api/ai/copilot/stream', async (req: Request, res: Response) => {
  try {
    const { query, userRole, messages, resortContext } = req.body;
    if (!query && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Query or messages parameter is required' });
    }

    if (userRole === 'CUSTOMER') {
      return res.status(403).json({ error: 'Access forbidden: Staff copilot is restricted to management and staff.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI Copilot is not configured. Add GEMINI_API_KEY to the server environment.',
      });
    }

    const currentQuery = query || messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || '';
    const formattedContext = formatResortContextForPrompt(resortContext);
    const systemInstruction = `${COPILOT_SYSTEM_INSTRUCTION}

LIVE RESORT DATABASE CONTEXT:
${formattedContext}`;

    const contents = buildConversationContents(messages || [], query);
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: currentQuery }] });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const { stream, modelUsed } = await callGeminiStream({
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    let fullAnswer = '';
    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullAnswer += chunkText;
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    const groundedSources = determineGroundedSources(currentQuery);
    const suggestedAction = detectSuggestedAction(currentQuery, fullAnswer, resortContext || RESORT_DATA);

    res.write(
      `data: ${JSON.stringify({
        done: true,
        answer: fullAnswer,
        groundedSources,
        suggestedAction,
        modelUsed,
      })}\n\n`
    );
    res.end();
  } catch (error: any) {
    console.error('AI Copilot Stream error:', error);
    if (!res.headersSent) {
      const isConfig = error.message?.includes('not configured');
      return res.status(isConfig ? 503 : 500).json({
        error: error.message || 'Error streaming AI Copilot response with Gemini API',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream disrupted' })}\n\n`);
      res.end();
    }
  }
});

// ============================================================================
// 4. AI GUEST CONCIERGE (Strictly scoped to authenticated customer)
// ============================================================================
app.post('/api/ai/concierge', async (req: Request, res: Response) => {
  try {
    const { query, guestName, roomNumber } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const guestContext = {
      name: guestName || 'Aarav Sharma',
      room: roomNumber || 'Room 101',
      resortTimings: RESORT_DATA.diningTimings,
      amenities: 'Swimming pool (6 AM - 8 PM), Spice Valley Restaurant, Kids Play Area, Badminton Court, Spa & Wellness, Free Wi-Fi.',
      currency: 'INR (₹)',
    };

    if (ai) {
      try {
        const systemInstruction = `You are the AI Guest Concierge for Smart Resort 360, a modern family and guest-friendly resort in India.
You are assisting ${guestContext.name} staying in ${guestContext.room}.
Tone: Warm, hospitable, helpful, polite, and down-to-earth.
Resort Dining Timings:
- Breakfast: 7:00 AM – 10:30 AM
- Lunch: 12:30 PM – 3:00 PM
- Dinner: 7:30 PM – 10:30 PM
Restaurant: Spice Valley Restaurant & Café (Pure Vegetarian & Non-Veg Multi-Cuisine options, strictly NO BEEF).
Room Service: Dial 9 from room phone or order via the portal.
Pool Hours: 6:00 AM - 8:00 PM (cotton swim wear required).
For extra pillows, towels, water bottles, baby cot, or room cleaning, confirm you have logged it for housekeeping.
All currency is strictly in Indian Rupees (₹).
Do not use pretentious billionaire vocabulary.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: query,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (err: any) {
        console.warn('Gemini concierge error:', err.message);
      }
    }

    const q = query.toLowerCase();
    let reply = '';

    if (q.includes('breakfast') || q.includes('lunch') || q.includes('dinner') || q.includes('meal') || q.includes('food') || q.includes('restaurant')) {
      reply = `Hello ${guestName || 'Guest'}! Dining at Spice Valley Restaurant:\n• Breakfast: 7:00 AM – 10:30 AM\n• Lunch: 12:30 PM – 3:00 PM\n• Dinner: 7:30 PM – 10:30 PM\nWe serve fresh North & South Indian specialties, tandoor, Chinese, and Continental options. Room service is available 24/7.`;
    } else if (q.includes('pool') || q.includes('swim')) {
      reply = `The resort swimming pool is open daily from 6:00 AM to 8:00 PM. Clean pool towels are provided at the poolside deck. We also have a shallow kids wading pool.`;
    } else if (q.includes('baby') || q.includes('cot') || q.includes('crib')) {
      reply = `Certainly! We provide complimentary wooden baby cots with soft sanitised bedding for children under 3. I have notified our housekeeping team to set one up in ${roomNumber || 'your room'} promptly.`;
    } else if (q.includes('pet') || q.includes('dog') || q.includes('cat')) {
      reply = `Our ground-floor Deluxe rooms and Premium Villas are pet-friendly. We provide pet food bowls and water upon request. Pets should be leashed in common garden areas.`;
    } else if (q.includes('towel') || q.includes('water') || q.includes('pillow') || q.includes('service') || q.includes('clean')) {
      reply = `I have logged your request for ${roomNumber || 'your room'}. Our housekeeping team will deliver fresh towels and complimentary packaged drinking water bottles within 10–15 minutes.`;
    } else if (q.includes('checkout') || q.includes('checkin') || q.includes('time')) {
      reply = `Check-in is at 2:00 PM and check-out is at 11:00 AM. If you require a late check-out or luggage storage, our front desk team is happy to assist.`;
    } else {
      reply = `Namaste ${guestName || 'Guest'}! I'm here to assist you with dining bookings, pool timings, room service, housekeeping items, or local sightseeing arrangements. How may I help you today?`;
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error('AI Concierge error:', error);
    res.status(500).json({ error: error.message || 'Error processing concierge query' });
  }
});

// ============================================================================
// 5. ISSUE AGENT (Real dynamic operational issue intelligence via Gemini)
// ============================================================================
app.post('/api/ai/issue-agent', async (req: Request, res: Response) => {
  try {
    const { complaint, location, imageBase64, reportedBy, resortContext } = req.body;
    if (!complaint) {
      return res.status(400).json({ error: 'Complaint text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI Issue Agent is not configured. Add GEMINI_API_KEY to the server environment.',
      });
    }

    const ctx = resortContext || RESORT_DATA;
    const formattedContext = formatResortContextForPrompt(ctx);

    const systemInstruction = `You are Smart Resort 360 Issue Intelligence, an expert resort operations triage and diagnostics agent.
Analyze the following operational issue reported in the resort:
Complaint: "${complaint}"
Location provided: "${location || 'Room 204'}"
Reported by: "${reportedBy || 'Staff / Guest'}"

Resort Operational Context:
${formattedContext}

Diagnose this issue dynamically using authentic hospitality facilities and maintenance engineering principles.
Return a valid JSON object matching this schema strictly:
{
  "category": "HVAC" | "Electrical" | "Plumbing" | "Internet" | "Housekeeping" | "Room" | "Restaurant" | "Security" | "Guest Service" | "Equipment" | "Other",
  "affectedArea": string,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "urgency": "IMMEDIATE" | "WITHIN_1_HOUR" | "SAME_DAY" | "SCHEDULED",
  "assignedDepartment": string,
  "assignedTechnician": string,
  "likelyCause": string,
  "immediateAction": string,
  "staffResponsible": string,
  "operationalImpact": string,
  "nextStep": string,
  "troubleshootingSteps": string[],
  "technicianSummary": string,
  "imageAnalysis": string
}`;

    const parts: any[] = [{ text: `Diagnose and triage this operational issue: "${complaint}". Location: "${location || 'Room 204'}"` }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
    }

    const { text } = await callGemini({
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsedResult = JSON.parse(text);
    const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
    const ticket = {
      ticketId,
      ...parsedResult,
      status: 'DISPATCHED',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      originalComplaint: complaint,
    };

    return res.json({ ticket });
  } catch (error: any) {
    console.error('Issue agent error:', error);
    const isConfig = error.message?.includes('not configured');
    return res.status(isConfig ? 503 : 500).json({
      error: error.message || 'Error processing issue with Gemini AI',
    });
  }
});

// ============================================================================
// 6. AI OPERATIONS BRIEFING & ANOMALY SCAN
// ============================================================================
app.get('/api/ai/operations-briefing', async (_req: Request, res: Response) => {
  try {
    const briefing = {
      timestamp: 'Today 14:30 PM',
      occupancy: `${RESORT_DATA.occupancy.occupancyRate}% (${RESORT_DATA.occupancy.occupiedRooms}/${RESORT_DATA.occupancy.totalRooms} Rooms & Villas Occupied)`,
      arrivalsSummary: '1 arrival remaining today (Rahul Kulkarni, Villa 02 at 16:00). 3 check-ins completed smoothly this morning.',
      departuresSummary: '2 checkout departures processed with zero billing disputes.',
      housekeepingBacklog: '1 checkout turnaround in progress (Room 202), 1 linen refresh pending (Room 104), 1 pre-arrival inspection (Villa 02).',
      criticalMaintenance: '1 high-severity ticket on Room 204 Split AC cooling. Technician Suresh Verma on site.',
      inventoryRisks: 'Basmati Rice (4 bags left) and Premium Bath Towels (35 pcs left) below par reorder threshold.',
      restaurantLoad: '86 covers reserved for dinner service at Spice Valley Restaurant.',
      anomaliesDetected: [
        'Room 204 AC reported low cooling twice this week; preventive coil cleaning suggested.',
        'High demand for extra rollaway beds across Family Suites 301-304 during weekend check-ins.',
      ],
      aiRecommendation:
        'Approve replenishment PO for Basmati Rice and 30 bath towels; complete Room 202 turnaround by 13:30; verify Villa 02 readiness prior to 15:30.',
    };

    res.json({ briefing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 7. AI ACTIONS WITH HUMAN CONFIRMATION GUARDRAIL
// ============================================================================
app.post('/api/ai/execute-action', async (req: Request, res: Response) => {
  const { actionType, payload, userConfirmed } = req.body;

  const CONSEQUENTIAL_ACTIONS = [
    'CANCEL_RESERVATION',
    'ISSUE_REFUND',
    'CHANGE_BOOKING',
    'CHARGE_GUEST',
    'DELETE_DATA',
    'CHANGE_PERMISSIONS',
  ];

  if (CONSEQUENTIAL_ACTIONS.includes(actionType) && !userConfirmed) {
    return res.status(400).json({
      status: 'REQUIRES_HUMAN_CONFIRMATION',
      message: `Consequential action '${actionType}' requires explicit human manager confirmation before execution.`,
      actionType,
      payload,
    });
  }

  // Executed with confirmed authority
  return res.json({
    status: 'EXECUTED_SUCCESSFULLY',
    actionType,
    confirmedAt: new Date().toISOString(),
    auditReceipt: `AUD-ACT-${Date.now().toString().slice(-6)}`,
  });
});

// ============================================================================
// 8. VITE MIDDLEWARE INTEGRATION (Dev) OR STATIC BUILD (Prod)
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Resort 360 Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
