export type ZoneId = 
  | 'central-pavilion'
  | 'ocean-villas'
  | 'infinity-pool'
  | 'culinary-pavilion'
  | 'wellness-spa'
  | 'arrival-pier';

export interface ResortZone {
  id: ZoneId;
  name: string;
  category: string;
  position: [number, number, number];
  description: string;
  operationalStatus: 'Optimal' | 'Active' | 'Attention';
  occupancy: string;
  currentActivity: string;
}

export type OperationalAreaId = 
  | 'reservations'
  | 'rooms'
  | 'guests'
  | 'housekeeping'
  | 'maintenance'
  | 'restaurant'
  | 'inventory'
  | 'staff'
  | 'payments'
  | 'feedback'
  | 'analytics'
  | 'audit';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'GENERAL_MANAGER'
  | 'FRONT_DESK'
  | 'HOUSEKEEPING'
  | 'MAINTENANCE'
  | 'RESTAURANT_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'STAFF'
  | 'CUSTOMER';

export interface RoleConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
  allowedModules: OperationalAreaId[];
  isCustomer?: boolean;
}

export interface OperationalArea {
  id: OperationalAreaId;
  index: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  liveMetric: string;
  metricLabel: string;
  targetZone: ZoneId;
  keyWorkflows: string[];
  authorizedRoles: UserRole[];
}

export type LightingMode = 'twilight' | 'midnight' | 'dawn';

// 01 Reservations Types
export type ReservationStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled' | 'Checked-In' | 'Checked-Out';

export type BookingChannel =
  | 'Direct Website'
  | 'Walk-in'
  | 'Phone'
  | 'Travel Agent'
  | 'MakeMyTrip'
  | 'Booking.com'
  | 'Agoda'
  | 'Corporate'
  | 'Repeat Guest';

export interface Reservation {
  id: string;
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: ReservationStatus;
  bookingChannel?: BookingChannel;
  bookingSource?: string; // backwards compatibility
  paymentStatus: 'Paid' | 'Authorized' | 'Pending Deposit' | 'Pending' | 'Partially Paid';
  roomRate: number; // in ₹ INR
  taxes: number;    // in ₹ INR
  totalAmount: number; // in ₹ INR
  adults: number;
  children: number;
  hasPets?: boolean;
  petDetails?: string;
  mealPlan?: 'Room Only' | 'Breakfast Included' | 'Half Board (Breakfast + Dinner)' | 'Full Board';
  specialRequests?: string;
  overbookingWarning?: boolean;
}

// 02 Rooms Types
export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance' | 'Out of Service';

export type RoomCategoryType = 'Standard Room' | 'Deluxe Room' | 'Family Room' | 'Premium Villa';

export interface Room {
  id: string;
  number: string;
  name: string;
  type: RoomCategoryType | string;
  capacity: string;
  status: RoomStatus;
  ratePerNight: number; // in ₹ INR
  currentGuest?: string;
  cleaningStatus: 'Clean' | 'Cleaning in Progress' | 'Needs Cleaning' | 'Inspected';
  inspectionStatus: 'Inspected & Certified' | 'Pending Inspection' | 'Touch-up Required';
  maintenanceStatus: 'Operational' | 'Issue Reported' | 'Under Maintenance';
  zoneId: ZoneId;
  floor: string;
  climateTemp: number;
  amenities: string[];
  isPetFriendly: boolean;
  isFamilyFriendly: boolean;
  bedConfiguration: string;
  lastCleaned: string;
}

// 03 Guests Types
export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  currentRoom: string;
  currentReservationRef?: string;
  stayCount: number;
  totalSpentINR: number;
  preferences: {
    dietary: string; // e.g. "Vegetarian", "Jain", "Non-Veg", "Vegan"
    pillow?: string;
    temperature: number;
    specialNeeds?: string;
    privacyWindow?: string;
  };
  childrenCount: number;
  childrenAges?: string;
  hasPets: boolean;
  petDetails?: string;
  bookingHistory: Array<{
    bookingRef: string;
    dates: string;
    room: string;
    totalINR: number;
  }>;
  activeRequests: Array<{
    id: string;
    service: string;
    time: string;
    status: 'Pending' | 'In Progress' | 'Fulfilled' | 'SUBMITTED' | 'ACCEPTED' | 'COMPLETED';
  }>;
  issuesReported: Array<{
    ticketId: string;
    issue: string;
    date: string;
    status: string;
  }>;
  feedbackHistory?: Array<{
    date: string;
    rating: number;
    comment: string;
  }>;
}

// 04 Housekeeping Types
export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  roomType: string;
  guestName?: string;
  taskType: 'Checkout Cleaning' | 'Deep Cleaning' | 'Linen Replacement' | 'Turnover Cleaning' | 'Stayover Refresh' | 'Evening Turndown';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Inspected' | 'Completed';
  assignedStaff: string;
  startTime: string;
  estMinutes: number;
  notes: string;
  linenStatus: 'Fresh Linens Stocked' | 'Linen Bag Collected' | 'Awaiting Laundry';
}

export interface LostAndFoundItem {
  id: string;
  item: string;
  location: string;
  foundBy: string;
  date: string;
  status: 'Stored in Vault' | 'Claimed & Returned';
}

// 05 Maintenance Types & AI Traceability
export interface MaintenanceIssueTrace {
  guestReport?: string;
  reportedBy: string;
  reportedAt: string;
  aiCategory: string;
  aiConfidence: string;
  detectedLocation: string;
  assignedPriority: 'Critical' | 'High' | 'Medium' | 'Low';
  workOrderId: string;
  assignedTechnician: string;
  technicianStartedAt?: string;
  repairCompletedAt?: string;
  inspectionPassed?: boolean;
  inspectionNotes?: string;
  resolutionStatus: 'Resolved' | 'In Progress' | 'Pending Inspection';
  resultingRoomStatus: RoomStatus;
}

export interface MaintenanceIssue {
  id: string;
  ticketId: string;
  title: string;
  roomOrFacility: string;
  roomNumber?: string;
  zoneId: ZoneId;
  equipment: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  severity: 'Operational Impact' | 'Precautionary' | 'Cosmetic';
  assignedTechnician: string;
  status: 'Open' | 'Dispatched' | 'Parts Sourced' | 'Resolved' | 'IN PROGRESS';
  estDowntime: string;
  isPreventive: boolean;
  loggedAt: string;
  trace?: MaintenanceIssueTrace;
}

// 06 Restaurant Types
export type MenuCategory = 
  | 'Breakfast'
  | 'Indian'
  | 'Continental'
  | 'Chinese'
  | 'Snacks'
  | 'Beverages'
  | 'Desserts'
  | 'Kids Menu';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number; // in ₹ INR
  isVeg: boolean;
  description: string;
  available: boolean;
  prepTimeMinutes: number;
}

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  section: 'Palm Terrace' | 'Garden Lawn' | 'Indoor AC Pavilion';
  capacity: number;
  status: 'Available' | 'Reserved' | 'Occupied';
  currentReservation?: {
    guestName: string;
    time: string;
    covers: number;
    notes?: string;
  };
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  guestName: string;
  tableOrRoom: string;
  roomNumber?: string;
  type: 'Dine-In' | 'Room Service' | 'Takeaway';
  items: Array<{ name: string; quantity: number; price: number; notes?: string }>;
  status: 'Received' | 'Preparing' | 'Ready' | 'Delivered' | 'Completed';
  total: number; // in ₹ INR
  time: string;
}

// 07 Inventory Types
export interface InventoryTransaction {
  id: string;
  timestamp: string;
  action: 'ADD_STOCK' | 'REMOVE_STOCK' | 'ADJUST_QUANTITY' | 'REORDER';
  amount: number;
  user: string;
  notes: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Linens & Bedding' | 'Guest Toiletries' | 'Kitchen & Dining Staples' | 'Housekeeping Supplies' | 'Beverages & Coffee';
  currentStock: number;
  minThreshold: number;
  reorderLevel: number;
  unit: string; // e.g. "pcs", "bottles", "kg", "packs"
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  reorderQuantity: number;
  unitCost: number; // in ₹ INR
  lastRestocked: string;
  transactions?: InventoryTransaction[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  category: string;
  itemsCount: number;
  totalCost: number; // in ₹ INR
  orderDate: string;
  status: 'Draft' | 'Sent to Supplier' | 'Delivered & Received';
}

// 08 Staff Types
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: 'Front Office' | 'Housekeeping' | 'Engineering' | 'Food & Beverage' | 'Guest Relations' | 'Administration';
  shift: 'Morning (06:00 - 14:30)' | 'General (09:00 - 17:30)' | 'Evening (14:00 - 22:30)' | 'Night (22:00 - 06:30)';
  attendance: 'On Duty' | 'Scheduled' | 'On Break' | 'Off Duty';
  activeTasks: number;
  performanceRating: number;
  contact: string;
}

// 09 Payments & Billing Types
export interface BillCharge {
  id: string;
  description: string;
  category: 'Room Charges' | 'Restaurant' | 'Room Service' | 'Activities' | 'Taxes (12% GST)' | 'Discounts' | 'Laundry';
  amount: number; // in ₹ INR
  date: string;
}

export interface GuestBill {
  id: string;
  folioNumber: string;
  guestName: string;
  roomNumber: string;
  reservationId?: string;
  invoiceId: string;
  charges: BillCharge[];
  totalAmount: number; // in ₹ INR
  paymentsReceived: number; // in ₹ INR
  outstandingBalance: number; // in ₹ INR
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Partially Paid' | 'Refunded';
}

// 10 Feedback & Experience Types
export interface FeedbackItem {
  id: string;
  guestName: string;
  roomNumber: string;
  rating: number; // 1-5
  category: 'Overall Stay' | 'Food & Dining' | 'Room Cleanliness' | 'Staff Service' | 'Facilities';
  comment: string;
  sentiment: 'Positive' | 'Neutral' | 'Critical';
  serviceRecoveryStatus: 'Resolved' | 'Action Pending' | 'Escalated to GM';
  date: string;
}

// 11 Analytics Types
export interface ResortAnalytics {
  occupancyRate: number;
  adr: number; // in ₹ INR
  revPar: number; // in ₹ INR
  dailyRevenue: number; // in ₹ INR
  monthRevenue: number; // in ₹ INR
  guestSatisfaction: number;
  revParChange: string;
  occupancyChange: string;
}

// 12 Audit & Security Types
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  actionType: 'AUTH_LOGIN' | 'RESERVATION_CREATED' | 'ROOM_STATUS_CHANGE' | 'PAYMENT_CAPTURE' | 'MAINTENANCE_DISPATCH' | 'ROLE_PERMISSION_CHANGE' | 'INVENTORY_RESTOCK';
  targetResource: string;
  details: string;
  ipAddress: string;
}
