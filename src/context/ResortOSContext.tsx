import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  OperationalAreaId,
  ZoneId,
  Reservation,
  Room,
  RoomStatus,
  GuestProfile,
  HousekeepingTask,
  LostAndFoundItem,
  MaintenanceIssue,
  RestaurantTable,
  KitchenOrder,
  InventoryItem,
  StaffMember,
  GuestBill,
  FeedbackItem,
  ResortAnalytics,
  AuditLogEntry,
} from '../types';
import {
  ROLE_CONFIGS,
  INITIAL_RESERVATIONS,
  INITIAL_ROOMS,
  INITIAL_GUESTS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_LOST_FOUND,
  INITIAL_MAINTENANCE_ISSUES,
  INITIAL_RESTAURANT_TABLES,
  INITIAL_KITCHEN_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_STAFF,
  INITIAL_BILLS,
  INITIAL_FEEDBACK,
  INITIAL_ANALYTICS,
  INITIAL_AUDIT_LOGS,
} from '../data/resortData';

interface ResortOSContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeModule: OperationalAreaId;
  setActiveModule: (mod: OperationalAreaId) => void;
  isOSOpen: boolean;
  openOS: (initialModule?: OperationalAreaId) => void;
  closeOS: () => void;
  allowedModules: OperationalAreaId[];
  isCustomer: boolean;
  
  // 01 Reservations
  reservations: Reservation[];
  createReservation: (res: Omit<Reservation, 'id' | 'bookingRef'>) => Reservation;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  checkInReservation: (id: string) => void;
  checkOutReservation: (id: string) => void;
  cancelReservation: (id: string) => void;
  checkRoomAvailability: (type?: string, adults?: number, children?: number, petFriendly?: boolean) => Room[];

  // 02 Rooms
  rooms: Room[];
  updateRoomStatus: (id: string, status: RoomStatus) => void;
  updateRoomInspection: (id: string, inspection: Room['inspectionStatus']) => void;
  updateRoomClimate: (id: string, temp: number) => void;
  getRoomByNumber: (num: string) => Room | undefined;

  // 03 Guests
  guests: GuestProfile[];
  addGuestRequest: (guestIdOrName: string, serviceText: string, category?: string) => void;
  getGuestByNameOrRoom: (query: string) => GuestProfile | undefined;

  // 04 Housekeeping
  housekeepingTasks: HousekeepingTask[];
  updateTaskStatus: (id: string, status: HousekeepingTask['status']) => void;
  createHousekeepingTask: (task: Omit<HousekeepingTask, 'id' | 'startTime'>) => void;
  lostAndFound: LostAndFoundItem[];

  // 05 Maintenance
  maintenanceIssues: MaintenanceIssue[];
  createWorkOrder: (issue: Omit<MaintenanceIssue, 'id' | 'ticketId' | 'loggedAt'>) => MaintenanceIssue;
  updateIssueStatus: (id: string, status: MaintenanceIssue['status']) => void;
  resolveMaintenanceIssue: (id: string, notes?: string) => void;

  // 06 Restaurant
  restaurantTables: RestaurantTable[];
  kitchenOrders: KitchenOrder[];
  createKitchenOrder: (order: Omit<KitchenOrder, 'id' | 'orderNumber' | 'time'>) => KitchenOrder;
  updateKitchenOrderStatus: (id: string, status: KitchenOrder['status']) => void;
  reserveRestaurantTable: (tableId: string, guestName: string, time: string, covers: number, notes?: string) => void;

  // 07 Inventory
  inventoryItems: InventoryItem[];
  addInventoryStock: (id: string, amount: number, notes?: string) => void;
  removeInventoryStock: (id: string, amount: number, notes?: string) => void;
  adjustInventoryQuantity: (id: string, newQuantity: number, notes?: string) => void;
  reorderInventoryItem: (id: string) => void;

  // 08 Staff
  staffMembers: StaffMember[];
  updateStaffAttendance: (id: string, attendance: StaffMember['attendance']) => void;

  // 09 Payments
  guestBills: GuestBill[];
  settleFolio: (id: string, paymentMethod?: string) => void;
  addChargeToFolio: (roomNumber: string, description: string, category: any, amount: number) => void;

  // 10 Feedback
  feedbackItems: FeedbackItem[];
  resolveFeedback: (id: string) => void;
  addFeedback: (fb: Omit<FeedbackItem, 'id' | 'date' | 'serviceRecoveryStatus'>) => void;

  // 11 Analytics
  analytics: ResortAnalytics;

  // 12 Audit
  auditLogs: AuditLogEntry[];
  logAction: (actionType: AuditLogEntry['actionType'], targetResource: string, details: string) => void;

  // 3D Integration
  locateOn3DTwin: (zoneId: ZoneId) => void;
}

const ResortOSContext = createContext<ResortOSContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'sr360_v2_';

function getStoredOrDefault<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (item) {
      const parsed = JSON.parse(item);
      // For rooms: if stored rooms count is less than defaultVal count (24 units), merge so all rooms are available
      if (key === 'rooms' && Array.isArray(defaultVal) && Array.isArray(parsed) && parsed.length < defaultVal.length) {
        const parsedMap = new Map(parsed.map((r: any) => [r.number || r.id, r]));
        return defaultVal.map((defRoom: any) => parsedMap.get(defRoom.number) || parsedMap.get(defRoom.id) || defRoom) as unknown as T;
      }
      return parsed;
    }
  } catch (e) {
    console.warn(`Could not read ${key} from storage:`, e);
  }
  return defaultVal;
}

export const ResortOSProvider: React.FC<{
  children: React.ReactNode;
  onLocate3DZone?: (zoneId: ZoneId) => void;
}> = ({ children, onLocate3DZone }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('SUPER_ADMIN');
  const [activeModule, setActiveModule] = useState<OperationalAreaId>('reservations');
  const [isOSOpen, setIsOSOpen] = useState(false);

  // Entities with persistence
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    getStoredOrDefault('reservations', INITIAL_RESERVATIONS)
  );
  const [rooms, setRooms] = useState<Room[]>(() =>
    getStoredOrDefault('rooms', INITIAL_ROOMS)
  );
  const [guests, setGuests] = useState<GuestProfile[]>(() =>
    getStoredOrDefault('guests', INITIAL_GUESTS)
  );
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(() =>
    getStoredOrDefault('housekeepingTasks', INITIAL_HOUSEKEEPING_TASKS)
  );
  const [lostAndFound, setLostAndFound] = useState<LostAndFoundItem[]>(() =>
    getStoredOrDefault('lostAndFound', INITIAL_LOST_FOUND)
  );
  const [maintenanceIssues, setMaintenanceIssues] = useState<MaintenanceIssue[]>(() =>
    getStoredOrDefault('maintenanceIssues', INITIAL_MAINTENANCE_ISSUES)
  );
  const [restaurantTables, setRestaurantTables] = useState<RestaurantTable[]>(() =>
    getStoredOrDefault('restaurantTables', INITIAL_RESTAURANT_TABLES)
  );
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(() =>
    getStoredOrDefault('kitchenOrders', INITIAL_KITCHEN_ORDERS)
  );
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() =>
    getStoredOrDefault('inventoryItems', INITIAL_INVENTORY)
  );
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() =>
    getStoredOrDefault('staffMembers', INITIAL_STAFF)
  );
  const [guestBills, setGuestBills] = useState<GuestBill[]>(() =>
    getStoredOrDefault('guestBills', INITIAL_BILLS)
  );
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() =>
    getStoredOrDefault('feedbackItems', INITIAL_FEEDBACK)
  );
  const [analytics, setAnalytics] = useState<ResortAnalytics>(() =>
    getStoredOrDefault('analytics', INITIAL_ANALYTICS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    getStoredOrDefault('auditLogs', INITIAL_AUDIT_LOGS)
  );

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'reservations', JSON.stringify(reservations));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'rooms', JSON.stringify(rooms));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'guests', JSON.stringify(guests));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'housekeepingTasks', JSON.stringify(housekeepingTasks));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'maintenanceIssues', JSON.stringify(maintenanceIssues));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'restaurantTables', JSON.stringify(restaurantTables));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'kitchenOrders', JSON.stringify(kitchenOrders));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'inventoryItems', JSON.stringify(inventoryItems));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'guestBills', JSON.stringify(guestBills));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'feedbackItems', JSON.stringify(feedbackItems));
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [reservations, rooms, guests, housekeepingTasks, maintenanceIssues, restaurantTables, kitchenOrders, inventoryItems, guestBills, feedbackItems]);

  const currentRoleConfig = ROLE_CONFIGS.find((r) => r.role === currentRole) || ROLE_CONFIGS[0];
  const allowedModules = currentRoleConfig.allowedModules;
  const isCustomer = currentRole === 'CUSTOMER';

  const logAction = (actionType: AuditLogEntry['actionType'], targetResource: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentRoleConfig.label,
      role: currentRole,
      actionType,
      targetResource,
      details,
      ipAddress: '10.240.2.14',
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  // --------------------------------------------------------------------------
  // 01. RESERVATIONS
  // --------------------------------------------------------------------------
  const createReservation = (res: Omit<Reservation, 'id' | 'bookingRef'>): Reservation => {
    const bookingRef = `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReservation: Reservation = {
      ...res,
      id: `res-${Date.now()}`,
      bookingRef,
      roomRate: res.roomRate || 6500,
      taxes: res.taxes || Math.round((res.roomRate || 6500) * (res.nights || 1) * 0.12),
      totalAmount: res.totalAmount || Math.round((res.roomRate || 6500) * (res.nights || 1) * 1.12),
    };

    setReservations((prev) => [newReservation, ...prev]);

    // Synchronize Room Status: if reserved or confirmed, set room to Reserved
    setRooms((prev) =>
      prev.map((rm) =>
        rm.number === res.roomNumber
          ? {
              ...rm,
              status: 'Reserved',
              currentGuest: `${res.guestName} (Arr. ${res.checkIn})`,
            }
          : rm
      )
    );

    // Create Guest Profile if not existing
    setGuests((prev) => {
      const existing = prev.find((g) => g.email.toLowerCase() === res.guestEmail.toLowerCase() || g.name.toLowerCase() === res.guestName.toLowerCase());
      if (existing) {
        return prev.map((g) =>
          g.id === existing.id
            ? {
                ...g,
                currentRoom: res.roomNumber,
                currentReservationRef: bookingRef,
                stayCount: g.stayCount + 1,
                totalSpentINR: g.totalSpentINR + newReservation.totalAmount,
                bookingHistory: [
                  { bookingRef, dates: `${res.checkIn} – ${res.checkOut}`, room: res.roomNumber, totalINR: newReservation.totalAmount },
                  ...g.bookingHistory,
                ],
              }
            : g
        );
      } else {
        const newGuest: GuestProfile = {
          id: `gst-${Date.now()}`,
          name: res.guestName,
          email: res.guestEmail,
          phone: res.guestPhone,
          currentRoom: res.roomNumber,
          currentReservationRef: bookingRef,
          stayCount: 1,
          totalSpentINR: newReservation.totalAmount,
          preferences: {
            dietary: 'Standard',
            temperature: 22.5,
          },
          childrenCount: res.children || 0,
          hasPets: res.hasPets || false,
          petDetails: res.petDetails,
          bookingHistory: [
            { bookingRef, dates: `${res.checkIn} – ${res.checkOut}`, room: res.roomNumber, totalINR: newReservation.totalAmount },
          ],
          activeRequests: [],
          issuesReported: [],
        };
        return [newGuest, ...prev];
      }
    });

    // Create Initial Folio in Payments
    const newBill: GuestBill = {
      id: `bil-${Date.now()}`,
      folioNumber: `FOL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: res.guestName,
      roomNumber: res.roomNumber,
      reservationId: newReservation.id,
      invoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      charges: [
        {
          id: `c-${Date.now()}-1`,
          description: `${res.roomType} Accommodation (${res.nights} Nights @ ₹${res.roomRate.toLocaleString('en-IN')})`,
          category: 'Room Charges',
          amount: res.roomRate * res.nights,
          date: 'Booking',
        },
        {
          id: `c-${Date.now()}-2`,
          description: 'Goods & Services Tax (12% GST)',
          category: 'Taxes (12% GST)',
          amount: newReservation.taxes,
          date: 'Booking',
        },
      ],
      totalAmount: newReservation.totalAmount,
      paymentsReceived: res.paymentStatus === 'Paid' ? newReservation.totalAmount : 0,
      outstandingBalance: res.paymentStatus === 'Paid' ? 0 : newReservation.totalAmount,
      paymentMethod: res.paymentStatus === 'Paid' ? 'Paid Online' : 'Pending at Check-in',
      status: res.paymentStatus === 'Paid' ? 'Paid' : 'Pending',
    };
    setGuestBills((prev) => [newBill, ...prev]);

    logAction('RESERVATION_CREATED', res.roomNumber, `Created reservation ${bookingRef} for ${res.guestName}`);
    return newReservation;
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (status === 'Checked In' || status === 'Checked-In') {
            checkInReservation(id);
          } else if (status === 'Checked Out' || status === 'Checked-Out') {
            checkOutReservation(id);
          }
          return { ...r, status };
        }
        return r;
      })
    );
  };

  const checkInReservation = (id: string) => {
    const res = reservations.find((r) => r.id === id);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Checked In' } : r))
    );

    // Update Room status to OCCUPIED
    setRooms((prev) =>
      prev.map((rm) =>
        rm.number === res.roomNumber
          ? {
              ...rm,
              status: 'Occupied',
              currentGuest: res.guestName,
              cleaningStatus: 'Clean',
            }
          : rm
      )
    );

    logAction('ROOM_STATUS_CHANGE', res.roomNumber, `Guest ${res.guestName} checked in. Room marked OCCUPIED.`);
  };

  const checkOutReservation = (id: string) => {
    const res = reservations.find((r) => r.id === id);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Checked Out' } : r))
    );

    // Update Room status to CLEANING
    setRooms((prev) =>
      prev.map((rm) =>
        rm.number === res.roomNumber
          ? {
              ...rm,
              status: 'Cleaning',
              currentGuest: `${res.guestName} (Checked Out)`,
              cleaningStatus: 'Needs Cleaning',
              inspectionStatus: 'Pending Inspection',
            }
          : rm
      )
    );

    // Automatically create a Housekeeping Task for Checkout Cleaning
    createHousekeepingTask({
      roomNumber: res.roomNumber,
      roomType: res.roomType,
      guestName: `${res.guestName} (Departure)`,
      taskType: 'Checkout Cleaning',
      priority: 'High',
      status: 'Pending',
      assignedStaff: 'Sneha Kulkarni',
      estMinutes: 35,
      notes: 'Full linen replacement, bath sanitization, and minibar restock for next arrival.',
      linenStatus: 'Awaiting Laundry',
    });

    logAction('ROOM_STATUS_CHANGE', res.roomNumber, `Guest ${res.guestName} checked out. Room marked CLEANING.`);
  };

  const cancelReservation = (id: string) => {
    const res = reservations.find((r) => r.id === id);
    if (res) {
      setRooms((prev) =>
        prev.map((rm) =>
          rm.number === res.roomNumber && rm.status === 'Reserved'
            ? { ...rm, status: 'Available', currentGuest: undefined }
            : rm
        )
      );
    }
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r))
    );
    if (res) {
      logAction('RESERVATION_CREATED', res.roomNumber, `Reservation ${res.bookingRef} cancelled.`);
    }
  };

  const checkRoomAvailability = (
    type?: string,
    adults?: number,
    children?: number,
    petFriendly?: boolean
  ): Room[] => {
    return rooms.filter((rm) => {
      if (rm.status !== 'Available') return false;
      if (type && !rm.type.toLowerCase().includes(type.toLowerCase())) return false;
      if (petFriendly && !rm.isPetFriendly) return false;
      if (children && children > 0 && !rm.isFamilyFriendly) return false;
      return true;
    });
  };

  // --------------------------------------------------------------------------
  // 02. ROOMS
  // --------------------------------------------------------------------------
  const updateRoomStatus = (id: string, status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((rm) => {
        if (rm.id === id) {
          const updated = { ...rm, status };
          if (status === 'Available') {
            updated.currentGuest = undefined;
            updated.cleaningStatus = 'Inspected';
            updated.inspectionStatus = 'Inspected & Certified';
          }
          logAction('ROOM_STATUS_CHANGE', rm.number, `Room status changed to ${status}`);
          return updated;
        }
        return rm;
      })
    );
  };

  const updateRoomInspection = (id: string, inspection: Room['inspectionStatus']) => {
    setRooms((prev) =>
      prev.map((rm) => (rm.id === id ? { ...rm, inspectionStatus: inspection } : rm))
    );
  };

  const updateRoomClimate = (id: string, temp: number) => {
    setRooms((prev) =>
      prev.map((rm) => (rm.id === id ? { ...rm, climateTemp: temp } : rm))
    );
  };

  const getRoomByNumber = (num: string) => {
    return rooms.find((r) => r.number.toLowerCase() === num.toLowerCase());
  };

  // --------------------------------------------------------------------------
  // 03. GUESTS
  // --------------------------------------------------------------------------
  const addGuestRequest = (guestIdOrName: string, serviceText: string, category: string = 'Guest Service') => {
    const newReq = {
      id: `req-${Date.now()}`,
      service: serviceText,
      time: 'Just now',
      status: 'In Progress' as const,
    };
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestIdOrName || g.name.toLowerCase().includes(guestIdOrName.toLowerCase())
          ? { ...g, activeRequests: [newReq, ...g.activeRequests] }
          : g
      )
    );
  };

  const getGuestByNameOrRoom = (query: string) => {
    const q = query.toLowerCase();
    return guests.find(
      (g) => g.name.toLowerCase().includes(q) || g.currentRoom.toLowerCase().includes(q)
    );
  };

  // --------------------------------------------------------------------------
  // 04. HOUSEKEEPING
  // --------------------------------------------------------------------------
  const updateTaskStatus = (id: string, status: HousekeepingTask['status']) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          // If task completed and inspected, update room status to Available!
          if (status === 'Completed' || status === 'Inspected') {
            setRooms((rmPrev) =>
              rmPrev.map((rm) =>
                rm.number === t.roomNumber && (rm.status === 'Cleaning' || rm.status === 'Out of Service')
                  ? {
                      ...rm,
                      status: 'Available',
                      cleaningStatus: 'Inspected',
                      inspectionStatus: 'Inspected & Certified',
                      currentGuest: undefined,
                      lastCleaned: 'Just now (Inspected)',
                    }
                  : rm
              )
            );
          }
          return { ...t, status };
        }
        return t;
      })
    );
  };

  const createHousekeepingTask = (task: Omit<HousekeepingTask, 'id' | 'startTime'>) => {
    const newTask: HousekeepingTask = {
      ...task,
      id: `hk-${Date.now()}`,
      startTime: 'Just now',
    };
    setHousekeepingTasks((prev) => [newTask, ...prev]);
  };

  // --------------------------------------------------------------------------
  // 05. MAINTENANCE + AI TRACEABILITY
  // --------------------------------------------------------------------------
  const createWorkOrder = (issue: Omit<MaintenanceIssue, 'id' | 'ticketId' | 'loggedAt'>): MaintenanceIssue => {
    const ticketId = `WO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newIssue: MaintenanceIssue = {
      ...issue,
      id: `maint-${Date.now()}`,
      ticketId,
      loggedAt: 'Just now',
    };

    setMaintenanceIssues((prev) => [newIssue, ...prev]);

    // If a room is associated, update its maintenance status to 'Under Maintenance' and status to 'Maintenance'
    if (issue.roomNumber || issue.roomOrFacility) {
      const roomNum = issue.roomNumber || issue.roomOrFacility;
      setRooms((prev) =>
        prev.map((rm) =>
          rm.number.toLowerCase() === roomNum.toLowerCase() || roomNum.includes(rm.number)
            ? {
                ...rm,
                status: rm.status === 'Occupied' ? 'Occupied' : 'Maintenance',
                maintenanceStatus: 'Under Maintenance',
              }
            : rm
        )
      );
    }

    logAction('MAINTENANCE_DISPATCH', issue.roomOrFacility, `Created work order ${ticketId}: ${issue.title}`);
    return newIssue;
  };

  const updateIssueStatus = (id: string, status: MaintenanceIssue['status']) => {
    setMaintenanceIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, status } : iss))
    );
    if (status === 'Resolved') {
      resolveMaintenanceIssue(id);
    }
  };

  const resolveMaintenanceIssue = (id: string, notes?: string) => {
    setMaintenanceIssues((prev) =>
      prev.map((iss) => {
        if (iss.id === id) {
          const roomNum = iss.roomNumber || iss.roomOrFacility;
          // Restore room maintenance status
          setRooms((rmPrev) =>
            rmPrev.map((rm) =>
              rm.number.toLowerCase() === roomNum.toLowerCase() || roomNum.includes(rm.number)
                ? {
                    ...rm,
                    maintenanceStatus: 'Operational',
                    status: rm.status === 'Maintenance' ? 'Available' : rm.status,
                  }
                : rm
            )
          );
          return {
            ...iss,
            status: 'Resolved',
            trace: iss.trace
              ? {
                  ...iss.trace,
                  repairCompletedAt: 'Just now',
                  inspectionPassed: true,
                  inspectionNotes: notes || 'Technician repair verified and tested.',
                  resolutionStatus: 'Resolved',
                  resultingRoomStatus: 'Available',
                }
              : undefined,
          };
        }
        return iss;
      })
    );
  };

  // --------------------------------------------------------------------------
  // 06. RESTAURANT
  // --------------------------------------------------------------------------
  const createKitchenOrder = (order: Omit<KitchenOrder, 'id' | 'orderNumber' | 'time'>): KitchenOrder => {
    const orderNumber = `K-${Math.floor(800 + Math.random() * 200)}`;
    const newOrder: KitchenOrder = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber,
      time: 'Just now',
    };

    setKitchenOrders((prev) => [newOrder, ...prev]);

    // If it is room service, automatically add charge to the guest's folio!
    if (order.type === 'Room Service' && (order.roomNumber || order.tableOrRoom)) {
      const roomNum = order.roomNumber || order.tableOrRoom;
      addChargeToFolio(roomNum, `Room Service Order #${orderNumber} (${order.items.map((i) => i.name).join(', ')})`, 'Room Service', order.total);
    }

    logAction('AUTH_LOGIN', 'Restaurant POS', `New order ${orderNumber} for ${order.tableOrRoom} (₹${order.total})`);
    return newOrder;
  };

  const updateKitchenOrderStatus = (id: string, status: KitchenOrder['status']) => {
    setKitchenOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const reserveRestaurantTable = (
    tableId: string,
    guestName: string,
    time: string,
    covers: number,
    notes?: string
  ) => {
    setRestaurantTables((prev) =>
      prev.map((tbl) =>
        tbl.id === tableId || tbl.tableNumber === tableId
          ? {
              ...tbl,
              status: 'Reserved',
              currentReservation: { guestName, time, covers, notes },
            }
          : tbl
      )
    );
  };

  // --------------------------------------------------------------------------
  // 07. INVENTORY
  // --------------------------------------------------------------------------
  const addInventoryStock = (id: string, amount: number, notes?: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = item.currentStock + amount;
          const status = newStock <= item.minThreshold ? 'Low Stock' : 'In Stock';
          const newTx = {
            id: `tx-${Date.now()}`,
            timestamp: 'Just now',
            action: 'ADD_STOCK' as const,
            amount,
            user: currentRoleConfig.label,
            notes: notes || 'Stock received',
          };
          return {
            ...item,
            currentStock: newStock,
            status,
            transactions: [newTx, ...(item.transactions || [])],
            lastRestocked: 'Today',
          };
        }
        return item;
      })
    );
    logAction('INVENTORY_RESTOCK', id, `Added ${amount} units of stock`);
  };

  const removeInventoryStock = (id: string, amount: number, notes?: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.currentStock - amount);
          const status = newStock === 0 ? 'Out of Stock' : newStock <= item.minThreshold ? 'Low Stock' : 'In Stock';
          const newTx = {
            id: `tx-${Date.now()}`,
            timestamp: 'Just now',
            action: 'REMOVE_STOCK' as const,
            amount,
            user: currentRoleConfig.label,
            notes: notes || 'Stock issued for resort operations',
          };
          return {
            ...item,
            currentStock: newStock,
            status,
            transactions: [newTx, ...(item.transactions || [])],
          };
        }
        return item;
      })
    );
  };

  const adjustInventoryQuantity = (id: string, newQuantity: number, notes?: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const status = newQuantity === 0 ? 'Out of Stock' : newQuantity <= item.minThreshold ? 'Low Stock' : 'In Stock';
          const newTx = {
            id: `tx-${Date.now()}`,
            timestamp: 'Just now',
            action: 'ADJUST_QUANTITY' as const,
            amount: newQuantity - item.currentStock,
            user: currentRoleConfig.label,
            notes: notes || 'Audit stock count adjustment',
          };
          return {
            ...item,
            currentStock: Math.max(0, newQuantity),
            status,
            transactions: [newTx, ...(item.transactions || [])],
          };
        }
        return item;
      })
    );
  };

  const reorderInventoryItem = (id: string) => {
    const item = inventoryItems.find((i) => i.id === id);
    if (!item) return;

    // Simulate placing a purchase order
    addInventoryStock(id, item.reorderQuantity, `Reordered from ${item.supplier}`);
    logAction('INVENTORY_RESTOCK', item.name, `Confirmed reorder of ${item.reorderQuantity} ${item.unit}`);
  };

  // --------------------------------------------------------------------------
  // 08. STAFF
  // --------------------------------------------------------------------------
  const updateStaffAttendance = (id: string, attendance: StaffMember['attendance']) => {
    setStaffMembers((prev) =>
      prev.map((st) => (st.id === id ? { ...st, attendance } : st))
    );
  };

  // --------------------------------------------------------------------------
  // 09. PAYMENTS & FOLIO
  // --------------------------------------------------------------------------
  const settleFolio = (id: string, paymentMethod: string = 'UPI / Card') => {
    setGuestBills((prev) =>
      prev.map((b) =>
        b.id === id || b.folioNumber === id
          ? {
              ...b,
              paymentsReceived: b.totalAmount,
              outstandingBalance: 0,
              paymentMethod,
              status: 'Paid',
            }
          : b
      )
    );
    logAction('PAYMENT_CAPTURE', id, `Settled folio balance via ${paymentMethod}`);
  };

  const addChargeToFolio = (roomNumber: string, description: string, category: any, amount: number) => {
    setGuestBills((prev) =>
      prev.map((b) => {
        if (b.roomNumber.toLowerCase() === roomNumber.toLowerCase() && b.status !== 'Paid') {
          const newCharge = {
            id: `c-${Date.now()}`,
            description,
            category,
            amount,
            date: 'Today',
          };
          const newTotal = b.totalAmount + amount;
          return {
            ...b,
            charges: [...b.charges, newCharge],
            totalAmount: newTotal,
            outstandingBalance: newTotal - b.paymentsReceived,
          };
        }
        return b;
      })
    );
  };

  // --------------------------------------------------------------------------
  // 10. FEEDBACK
  // --------------------------------------------------------------------------
  const resolveFeedback = (id: string) => {
    setFeedbackItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, serviceRecoveryStatus: 'Resolved' } : f))
    );
  };

  const addFeedback = (fb: Omit<FeedbackItem, 'id' | 'date' | 'serviceRecoveryStatus'>) => {
    const newItem: FeedbackItem = {
      ...fb,
      id: `fb-${Date.now()}`,
      date: 'Today',
      serviceRecoveryStatus: fb.rating < 4 ? 'Action Pending' : 'Resolved',
    };
    setFeedbackItems((prev) => [newItem, ...prev]);
  };

  // --------------------------------------------------------------------------
  // MODAL & 3D CONTROLS
  // --------------------------------------------------------------------------
  const openOS = (initialModule?: OperationalAreaId) => {
    if (initialModule && allowedModules.includes(initialModule)) {
      setActiveModule(initialModule);
    }
    setIsOSOpen(true);
  };

  const closeOS = () => {
    setIsOSOpen(false);
  };

  const locateOn3DTwin = (zoneId: ZoneId) => {
    if (onLocate3DZone) {
      onLocate3DZone(zoneId);
    }
  };

  return (
    <ResortOSContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeModule,
        setActiveModule,
        isOSOpen,
        openOS,
        closeOS,
        allowedModules,
        isCustomer,

        reservations,
        createReservation,
        updateReservationStatus,
        checkInReservation,
        checkOutReservation,
        cancelReservation,
        checkRoomAvailability,

        rooms,
        updateRoomStatus,
        updateRoomInspection,
        updateRoomClimate,
        getRoomByNumber,

        guests,
        addGuestRequest,
        getGuestByNameOrRoom,

        housekeepingTasks,
        updateTaskStatus,
        createHousekeepingTask,
        lostAndFound,

        maintenanceIssues,
        createWorkOrder,
        updateIssueStatus,
        resolveMaintenanceIssue,

        restaurantTables,
        kitchenOrders,
        createKitchenOrder,
        updateKitchenOrderStatus,
        reserveRestaurantTable,

        inventoryItems,
        addInventoryStock,
        removeInventoryStock,
        adjustInventoryQuantity,
        reorderInventoryItem,

        staffMembers,
        updateStaffAttendance,

        guestBills,
        settleFolio,
        addChargeToFolio,

        feedbackItems,
        resolveFeedback,
        addFeedback,

        analytics,
        auditLogs,
        logAction,

        locateOn3DTwin,
      }}
    >
      {children}
    </ResortOSContext.Provider>
  );
};

export const useResortOS = (): ResortOSContextType => {
  const context = useContext(ResortOSContext);
  if (!context) {
    throw new Error('useResortOS must be used within a ResortOSProvider');
  }
  return context;
};
