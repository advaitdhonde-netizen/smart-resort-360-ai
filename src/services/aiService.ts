export interface CopilotAction {
  type: 'CREATE_HOUSEKEEPING_TASK' | 'CREATE_MAINTENANCE_TICKET' | 'OPEN_MODULE' | 'VIEW_3D_ZONE';
  label: string;
  payload?: any;
}

export interface CopilotResponse {
  answer: string;
  groundedSources: string[];
  suggestedAction?: CopilotAction;
}

export interface ConciergeResponse {
  reply: string;
}

export interface IssueTicket {
  ticketId: string;
  category:
    | 'HVAC'
    | 'Electrical'
    | 'Plumbing'
    | 'Internet'
    | 'Housekeeping'
    | 'Room'
    | 'Restaurant'
    | 'Security'
    | 'Guest Service'
    | 'Equipment'
    | 'Other';
  affectedArea: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgency: 'IMMEDIATE' | 'WITHIN_1_HOUR' | 'SAME_DAY' | 'SCHEDULED';
  assignedDepartment: string;
  assignedTechnician: string;
  likelyCause?: string;
  immediateAction?: string;
  staffResponsible?: string;
  operationalImpact?: string;
  nextStep?: string;
  troubleshootingSteps: string[];
  technicianSummary: string;
  imageAnalysis?: string;
  status: string;
  reportedAt: string;
  originalComplaint: string;
}

export interface OperationsBriefing {
  timestamp: string;
  occupancy: string;
  arrivalsSummary: string;
  departuresSummary: string;
  housekeepingBacklog: string;
  criticalMaintenance: string;
  inventoryRisks: string;
  restaurantLoad: string;
  anomaliesDetected: string[];
  aiRecommendation: string;
}

export interface ConsequentialActionRequest {
  actionType:
    | 'CANCEL_RESERVATION'
    | 'ISSUE_REFUND'
    | 'CHANGE_BOOKING'
    | 'CHARGE_GUEST'
    | 'DELETE_DATA'
    | 'CHANGE_PERMISSIONS';
  payload: Record<string, any>;
  userConfirmed: boolean;
}

export interface ResortContextSummary {
  occupancy: {
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    cleaning: number;
    ratePercent: number;
    adr?: number;
    revpar?: number;
  };
  rooms: Array<{
    number: string;
    type: string;
    status: string;
    guest?: string;
    floor?: string;
    rate?: number;
  }>;
  housekeeping: {
    totalTasks: number;
    pendingCount: number;
    inProgressCount: number;
    tasks: Array<{ room: string; task: string; priority: string; status: string; staff: string }>;
  };
  maintenance: {
    totalIssues: number;
    openCount: number;
    tickets: Array<{ id: string; roomOrArea: string; category: string; description: string; priority: string; status: string; technician: string }>;
  };
  inventory: {
    lowStockCount: number;
    items: Array<{ name: string; current: number; min: number; unit: string; category: string }>;
  };
  restaurant: {
    totalTables: number;
    activeTables: number;
    kitchenPending: number;
    diningTimings: { breakfast: string; lunch: string; dinner: string; restaurantName?: string };
    todayRevenueEstimate: number;
  };
  reservations: {
    total: number;
    inHouse: number;
    arrivalsToday: Array<{ guest: string; room: string; checkIn: string; status: string }>;
  };
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    isSimulated?: boolean;
    simulationNote?: string;
    forecast?: string;
    outdoorVulnerability?: string[];
  };
}

function toSafeArray<T = any>(val: any, priorityKeys: string[] = []): T[] {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') {
    for (const key of priorityKeys) {
      if (Array.isArray(val[key])) return val[key];
    }
    for (const key of ['items', 'tasks', 'tickets', 'rooms', 'arrivalsToday', 'records', 'data', 'list']) {
      if (Array.isArray(val[key])) return val[key];
    }
  }
  return [];
}

export function buildResortContextSummary(osState: {
  rooms?: any;
  reservations?: any;
  guests?: any;
  housekeepingTasks?: any;
  maintenanceIssues?: any;
  restaurantTables?: any;
  kitchenOrders?: any;
  inventoryItems?: any;
  guestBills?: any;
  analytics?: any;
  weather?: any;
}): ResortContextSummary {
  const rooms = toSafeArray(osState.rooms, ['rooms']);
  const reservations = toSafeArray(osState.reservations, ['arrivalsToday', 'reservations']);
  const housekeepingTasks = toSafeArray(osState.housekeepingTasks, ['tasks']);
  const maintenanceIssues = toSafeArray(osState.maintenanceIssues, ['tickets', 'issues']);
  const inventoryItems = toSafeArray(osState.inventoryItems, ['items']);
  const restaurantTables = toSafeArray(osState.restaurantTables, ['tables']);
  const kitchenOrders = toSafeArray(osState.kitchenOrders, ['orders']);

  const occupiedCount = rooms.filter((r) => r && r.status === 'Occupied').length;
  const availableCount = rooms.filter((r) => r && r.status === 'Available').length;
  const maintenanceCount = rooms.filter((r) => r && r.status === 'Maintenance').length;
  const cleaningCount = rooms.filter((r) => r && r.status === 'Cleaning').length;
  const totalRooms = rooms.length || 24;

  const lowStock = inventoryItems.filter(
    (i) => i && i.currentStock !== undefined && i.minThreshold !== undefined && i.currentStock <= i.minThreshold
  );

  return {
    occupancy: {
      total: totalRooms,
      occupied: occupiedCount,
      available: availableCount,
      maintenance: maintenanceCount,
      cleaning: cleaningCount,
      ratePercent: Math.round((occupiedCount / (totalRooms || 1)) * 100),
      adr: osState.analytics?.adr || 7250,
      revpar: osState.analytics?.revpar || 5742,
    },
    rooms: rooms.map((r) => ({
      number: r.number,
      type: r.type,
      status: r.status,
      guest: r.currentGuest,
      floor: r.floor,
      rate: r.ratePerNight,
    })),
    housekeeping: {
      totalTasks: housekeepingTasks.length,
      pendingCount: housekeepingTasks.filter((t) => t && t.status === 'Pending').length,
      inProgressCount: housekeepingTasks.filter((t) => t && t.status === 'In Progress').length,
      tasks: housekeepingTasks.map((t) => ({
        room: t.roomNumber || t.room || 'Area',
        task: t.taskType || t.task || 'Service',
        priority: t.priority || 'Normal',
        status: t.status || 'Pending',
        staff: t.assignedStaff || t.staff || 'Staff',
      })),
    },
    maintenance: {
      totalIssues: maintenanceIssues.length,
      openCount: maintenanceIssues.filter((m) => m && m.status !== 'Resolved').length,
      tickets: maintenanceIssues.map((m) => ({
        id: m.ticketId || m.id || 'TKT',
        roomOrArea: m.roomNumber || m.roomOrFacility || m.room || 'Facility',
        category: m.category || 'General',
        description: m.description || m.title || '',
        priority: m.priority || 'Medium',
        status: m.status || 'Open',
        technician: m.assignedTechnician || m.technician || 'Staff',
      })),
    },
    inventory: {
      lowStockCount: lowStock.length,
      items: lowStock.map((i) => ({
        name: i.name || i.item || 'Item',
        current: i.currentStock ?? i.current ?? 0,
        min: i.minThreshold ?? i.min ?? 0,
        unit: i.unit || 'units',
        category: i.category || 'General',
      })),
    },
    restaurant: {
      totalTables: restaurantTables.length || 12,
      activeTables: restaurantTables.filter((t) => t && t.status === 'Occupied').length,
      kitchenPending: kitchenOrders.filter((k) => k && k.status !== 'Served').length,
      diningTimings: {
        breakfast: '7:00 AM – 10:30 AM',
        lunch: '12:30 PM – 3:00 PM',
        dinner: '7:30 PM – 10:30 PM',
        restaurantName: 'Spice Valley Restaurant & Café',
      },
      todayRevenueEstimate: 54200,
    },
    reservations: {
      total: reservations.length,
      inHouse: occupiedCount,
      arrivalsToday: reservations
        .filter((r) => r && (r.status === 'Confirmed' || r.status === 'Checked In'))
        .map((r) => ({
          guest: r.guestName || r.guest || 'Guest',
          room: r.roomNumber || r.room || 'Room',
          checkIn: r.checkIn || 'Today',
          status: r.status || 'Confirmed',
        })),
    },
    weather: osState.weather || {
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 78,
      windSpeed: 14,
      rainfall: 0,
      forecast: 'Afternoon thunderstorms expected (15–25mm around 15:30). High rain probability 65%.',
      outdoorVulnerability: [
        'Infinity Pool & Deck: Suspend outdoor loungers and towel service if rainfall exceeds 15mm or thunder occurs.',
        'Spice Terrace: Roll down rain screens and redirect tables indoors.',
        'Beach Cabanas: High wind advisory if gusts exceed 40 km/h.',
        'Garden Villas: Check plunge pool drainage and automatic skimmers.'
      ]
    },
  };
}

export const aiService = {
  // 1. AI Resort Copilot (Standard JSON request)
  async askCopilot(
    query: string,
    userRole: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: ResortContextSummary
  ): Promise<CopilotResponse> {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        userRole,
        messages: history,
        resortContext: context,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `AI Copilot request failed with status ${res.status}`);
    }
    return await res.json();
  },

  // 1b. AI Resort Copilot (Real-time SSE Streaming)
  async askCopilotStream(
    query: string,
    userRole: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: ResortContextSummary,
    onChunk?: (chunk: string) => void
  ): Promise<CopilotResponse> {
    const res = await fetch('/api/ai/copilot/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        userRole,
        messages: history,
        resortContext: context,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `AI Copilot stream failed with status ${res.status}`);
    }

    if (!res.body) {
      throw new Error('ReadableStream not supported on this response.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedAnswer = '';
    let finalSources: string[] = ['Smart Resort 360 Core OS'];
    let finalAction: CopilotAction | undefined;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.replace(/^data:\s*/, '');
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.chunk) {
            accumulatedAnswer += parsed.chunk;
            if (onChunk) onChunk(parsed.chunk);
          }
          if (parsed.done) {
            if (parsed.answer) accumulatedAnswer = parsed.answer;
            if (parsed.groundedSources) finalSources = parsed.groundedSources;
            if (parsed.suggestedAction) finalAction = parsed.suggestedAction;
          }
        } catch (parseErr: any) {
          if (parseErr.message && !parseErr.message.includes('Unexpected')) {
            throw parseErr;
          }
        }
      }
    }

    return {
      answer: accumulatedAnswer,
      groundedSources: finalSources,
      suggestedAction: finalAction,
    };
  },

  // 2. AI Guest Concierge for Customers
  async askConcierge(query: string, guestName: string, roomNumber: string): Promise<ConciergeResponse> {
    const res = await fetch('/api/ai/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, guestName, roomNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to query AI concierge');
    }
    return await res.json();
  },

  // 3. Dedicated AI Issue Agent (with multimodal image support)
  async reportIssue(data: {
    complaint: string;
    location: string;
    imageBase64?: string;
    reportedBy: string;
    context?: ResortContextSummary;
  }): Promise<{ ticket: IssueTicket }> {
    const res = await fetch('/api/ai/issue-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaint: data.complaint,
        location: data.location,
        imageBase64: data.imageBase64,
        reportedBy: data.reportedBy,
        resortContext: data.context,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process issue through Gemini AI agent');
    }
    return await res.json();
  },

  // 4. AI Operations Briefing
  async getOperationsBriefing(): Promise<{ briefing: OperationsBriefing }> {
    const res = await fetch('/api/ai/operations-briefing');
    if (!res.ok) throw new Error('Failed to retrieve operations briefing');
    return await res.json();
  },

  // 5. Consequential Action Human Confirmation Guardrail
  async executeConsequentialAction(
    data: ConsequentialActionRequest
  ): Promise<{ status: string; message?: string; auditReceipt?: string }> {
    const res = await fetch('/api/ai/execute-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
};
