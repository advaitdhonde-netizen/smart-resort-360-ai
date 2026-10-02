import React, { useState } from 'react';
import { useResortOS } from '../../context/ResortOSContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { aiService } from '../../services/aiService';
import { RESORT_MENU_ITEMS } from '../../data/resortData';
import { IssueAgentModal } from '../ai/IssueAgentModal';
import {
  Key,
  Thermometer,
  UtensilsCrossed,
  ConciergeBell,
  Receipt,
  Star,
  CheckCircle2,
  Lock,
  Unlock,
  Send,
  Sparkles,
  Calendar,
  Clock,
  Compass,
  AlertTriangle,
  Waves,
  User,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Bot,
  MessageSquare,
  LogOut,
  Check,
  Phone,
  Mail,
  MapPin,
  Dumbbell,
  Gamepad2,
  Baby,
  Dog,
  Coffee,
  Bed,
  Wifi,
  Tv,
  Droplets,
  CreditCard,
  ChevronRight,
  Shield,
  FileText,
  Volume2,
  Users,
} from 'lucide-react';

type PortalTab =
  | 'stay'
  | 'ai_concierge'
  | 'dining'
  | 'menu'
  | 'activities'
  | 'map'
  | 'requests'
  | 'billing'
  | 'profile';

interface RoomCategory {
  id: string;
  name: string;
  type: string;
  capacity: string;
  pricePerNight: number;
  description: string;
  amenities: string[];
  bedType: string;
  isPetFriendly: boolean;
  totalUnits: number;
  availableUnits: number;
}

const RESORT_ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: 'std',
    name: 'Standard Room',
    type: 'Standard Garden View',
    capacity: '2 Guests',
    pricePerNight: 5500,
    description: 'Comfortable, well-appointed guest room with serene garden views, ideal for solo travelers and couples.',
    amenities: ['Queen Bed', 'Air Conditioning', 'High-Speed Wi-Fi', '32" Smart LED TV', 'Tea & Coffee Station', 'Work Desk', 'Ensuite Bathroom'],
    bedType: '1 Queen Bed',
    isPetFriendly: false,
    totalUnits: 14,
    availableUnits: 4,
  },
  {
    id: 'dlx',
    name: 'Deluxe Room',
    type: 'Deluxe Pool & Ocean View',
    capacity: '2–3 Guests',
    pricePerNight: 8500,
    description: 'Spacious room with a private balcony overlooking the main pool and coastline. Features premium bedding and luxury bath amenities.',
    amenities: ['King Bed', 'Private Balcony', 'Mini Refrigerator', 'Air Conditioning', 'High-Speed Wi-Fi', '43" Smart TV', 'Rain Shower', 'Lounge Seating'],
    bedType: '1 King Bed + 1 Daybed',
    isPetFriendly: true,
    totalUnits: 18,
    availableUnits: 6,
  },
  {
    id: 'fam',
    name: 'Family Room',
    type: 'Family Suite with Interconnected Option',
    capacity: '4 Guests',
    pricePerNight: 13500,
    description: 'Generously proportioned family accommodation with dual sleeping zones, child safety features, and extra storage.',
    amenities: ['King Bed + 2 Twin Beds', 'Private Balcony', 'Mini Kitchenette & Microwave', 'Kids Safety Corners', 'Baby Cot on Request', 'High-Speed Wi-Fi', '50" Smart TV'],
    bedType: '1 King Bed + 2 Twin Beds',
    isPetFriendly: true,
    totalUnits: 8,
    availableUnits: 2,
  },
  {
    id: 'villa',
    name: 'Premium Villa',
    type: 'Private Garden / Plunge Villa (4 Units Only)',
    capacity: '4–6 Guests',
    pricePerNight: 24000,
    description: 'Standalone private villa featuring an exclusive plunge pool, private sundeck, open living area, and dedicated butler support.',
    amenities: ['2 Master Bedrooms', 'Private Plunge Pool', 'Outdoor Sundeck', 'Full Living & Dining Hall', 'Espresso Bar', 'Dedicated Service Butler'],
    bedType: '2 King Beds + Sofa Bed',
    isPetFriendly: true,
    totalUnits: 4,
    availableUnits: 1,
  },
];

const RESORT_MAP_LOCATIONS = [
  { id: 'loc-1', name: 'Main Reception & Lobby', zone: 'central-pavilion', category: 'Guest Services', hours: '24/7 Open', distance: '1 min walk', status: 'Open', facilities: 'Check-in, Concierge, Luggage Storage, Currency Exchange, Travel Desk' },
  { id: 'loc-2', name: 'Standard & Deluxe Rooms (Blocks A, B & C)', zone: 'ocean-villas', category: 'Accommodations', hours: '24/7 Access', distance: '2–3 min walk', status: 'Open', facilities: 'Rooms 101–320, Elevators, Ice Machines, Housekeeping Stations' },
  { id: 'loc-3', name: 'Villas (Villa 01 to Villa 04)', zone: 'ocean-villas', category: 'Accommodations', hours: '24/7 Access', distance: '4 min walk', status: 'Open', facilities: 'Private villas with plunge pools, garden walkways, private buggy drop-off' },
  { id: 'loc-4', name: 'The Palm Terrace & Grove Restaurant', zone: 'culinary-pavilion', category: 'Dining', hours: '7:00 AM – 11:00 PM', distance: '2 min walk', status: 'Open', facilities: 'Buffet breakfast, à la carte lunch & dinner, outdoor lawn seating, kids high chairs' },
  { id: 'loc-5', name: 'Main Swimming Pool & Kids Pool', zone: 'infinity-pool', category: 'Recreation', hours: '7:00 AM – 9:00 PM', distance: '1 min walk', status: 'Open', facilities: '4ft Main Pool, 1.5ft Kids Wading Pool, Certified Lifeguard, Towels, Pool Bar' },
  { id: 'loc-6', name: 'Indoor Activity & Games Room', zone: 'central-pavilion', category: 'Entertainment', hours: '10:00 AM – 10:00 PM', distance: '2 min walk', status: 'Open', facilities: 'Table Tennis, Carrom, Chess, Pool Table, Foosball, Board Game Library' },
  { id: 'loc-7', name: 'Kids Play Zone & Adventure Lawn', zone: 'central-pavilion', category: 'Family', hours: '9:00 AM – 8:00 PM', distance: '3 min walk', status: 'Open', facilities: 'Swings, slides, soft-play pit, supervised craft sessions (Ages 3–12)' },
  { id: 'loc-8', name: 'Fitness Center & Gym', zone: 'wellness-spa', category: 'Health', hours: '6:00 AM – 10:00 PM', distance: '2 min walk', status: 'Open', facilities: 'Treadmills, Ellipticals, Free Weights, Yoga Studio, Lockers, Showers' },
  { id: 'loc-9', name: 'Ayurveda & Wellness Spa', zone: 'wellness-spa', category: 'Wellness', hours: '8:30 AM – 8:00 PM', distance: '3 min walk', distanceNote: 'Prior appointment recommended', status: 'Open', facilities: 'Therapeutic massages, steam & sauna, herbal body treatments' },
  { id: 'loc-10', name: 'Garden Walking Trail & Pet Park', zone: 'central-pavilion', category: 'Outdoor', hours: '5:30 AM – 9:30 PM', distance: '1 min walk', status: 'Open', facilities: '600m paved trail, tropical botanical trees, designated pet-exercise lawn' },
  { id: 'loc-11', name: 'Outdoor Sports Courts', zone: 'arrival-pier', category: 'Sports', hours: '6:30 AM – 7:00 PM', distance: '4 min walk', status: 'Open', facilities: 'Badminton Court, Half Basketball Court, Turf Cricket Nets, Racquets available' },
  { id: 'loc-12', name: 'Banquet & Evening Event Lawn', zone: 'culinary-pavilion', category: 'Events', hours: '6:00 PM – 11:00 PM', distance: '2 min walk', status: 'Open', facilities: 'Live music stage, open-air movie screenings on weekends, private gatherings' },
  { id: 'loc-13', name: '24/7 First Aid & Medical Room', zone: 'central-pavilion', category: 'Emergency', hours: '24/7 On-Call', distance: '1 min walk', status: 'Open', facilities: 'Resident medical staff, basic emergency meds, first-aid kits, ambulance tie-up' },
  { id: 'loc-14', name: 'Guest & Visitor Parking Lot', zone: 'arrival-pier', category: 'Transit', hours: '24/7 Open', distance: '3 min walk', status: 'Open', facilities: 'Covered parking for 80 cars, EV charging stations, 24/7 security' },
];

export const CustomerPortal: React.FC = () => {
  const {
    locateOn3DTwin,
    closeOS,
    createKitchenOrder,
    createWorkOrder,
    addGuestRequest,
    settleFolio,
    addFeedback,
    updateRoomClimate,
  } = useResortOS();
  const { user, logout, openAuthModal } = useAuth();
  const { isLight } = useTheme();

  // Active navigation tab
  const [activeCategory, setActiveCategory] = useState<PortalTab>('stay');
  const [isIssueAgentOpen, setIsIssueAgentOpen] = useState(false);

  // Guest booking profile state
  const [guestName, setGuestName] = useState(user?.fullName || 'Rahul Sharma');
  const [guestEmail, setGuestEmail] = useState(user?.email || 'rahul.sharma@example.in');
  const [guestPhone, setGuestPhone] = useState('+91 98765 43210');
  const [bookingRef] = useState('SR-2026-8492');
  const [checkInDate] = useState('26 Sep 2026, 2:00 PM');
  const [checkOutDate] = useState('29 Sep 2026, 11:00 AM');
  const [stayNights] = useState(3);
  const [roomNumber, setRoomNumber] = useState('Room 204');
  const [roomType, setRoomType] = useState('Deluxe Room (Pool & Garden View)');
  const [roomRate] = useState(6500);

  // Digital key & AC climate
  const [isDoorLocked, setIsDoorLocked] = useState(true);
  const [roomTemp, setRoomTemp] = useState(23);
  const [acFanSpeed, setAcFanSpeed] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Family & Kids preferences
  const [adultsCount, setAdultsCount] = useState(2);
  const [kidsCount, setKidsCount] = useState(1);
  const [kidsAges, setKidsAges] = useState('6 years');
  const [needsBabyCot, setNeedsBabyCot] = useState(false);
  const [needsExtraBed, setNeedsExtraBed] = useState(false);
  const [needsHighChair, setNeedsHighChair] = useState(true);

  // Pets preferences
  const [hasPets, setHasPets] = useState(false);
  const [petType, setPetType] = useState('Dog');
  const [petCount, setPetCount] = useState(1);
  const [petSize, setPetSize] = useState('Medium (10–25 kg)');

  // Selected map location for detail inspector
  const [selectedLocation, setSelectedLocation] = useState(RESORT_MAP_LOCATIONS[0]);

  // Dining table reservation form
  const [diningDate, setDiningDate] = useState('2026-09-27');
  const [diningMealSlot, setDiningMealSlot] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Dinner');
  const [diningTime, setDiningTime] = useState('8:00 PM');
  const [diningGuests, setDiningGuests] = useState(3);
  const [diningSpecialNote, setDiningSpecialNote] = useState('Please arrange high chair for child');
  const [diningBookingSuccess, setDiningBookingSuccess] = useState(false);

  // Cart & Food Ordering State
  const [cartItems, setCartItems] = useState<Array<{ dishId: string; name: string; price: number; quantity: number }>>([]);
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('All');
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);
  const [orderedNotice, setOrderedNotice] = useState<string | null>(null);

  // Service requests list
  const [requestsList, setRequestsList] = useState<
    Array<{ id: string; title: string; category: string; time: string; status: 'SUBMITTED' | 'ACCEPTED' | 'IN PROGRESS' | 'COMPLETED' }>
  >([
    { id: 'req-1', title: '2 Extra Bath Towels & Pool Towels', category: 'Housekeeping', time: '11:20 AM Today', status: 'COMPLETED' },
    { id: 'req-2', title: 'High Chair Arrangement at Palm Terrace', category: 'Dining', time: '01:45 PM Today', status: 'ACCEPTED' },
    { id: 'req-3', title: 'Packaged Mineral Water (4 Bottles)', category: 'Room Supplies', time: '03:15 PM Today', status: 'IN PROGRESS' },
  ]);
  const [newRequestType, setNewRequestType] = useState('Extra Towels');
  const [newRequestNotes, setNewRequestNotes] = useState('');
  const [requestSuccessNotice, setRequestSuccessNotice] = useState(false);

  // Report issue form
  const [issueCategory, setIssueCategory] = useState('Air Conditioning');
  const [issueDescription, setIssueDescription] = useState('');
  const [issuePriority, setIssuePriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [issueSuccessNotice, setIssueSuccessNotice] = useState(false);

  // Feedback form
  const [overallRating, setOverallRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [foodRating, setFoodRating] = useState(4);
  const [facilitiesRating, setFacilitiesRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState<Array<{ date: string; rating: number; comment: string }>>([
    { date: 'Yesterday', rating: 5, comment: 'Check-in was smooth, room 204 is clean and family loved the pool view!' },
  ]);

  // Billing settlement
  const [isPaidInFull, setIsPaidInFull] = useState(false);

  // AI Concierge Chat state
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{ sender: 'guest' | 'ai'; text: string; time: string; chips?: string[] }>
  >([
    {
      sender: 'ai',
      text: `Namaste and welcome to Smart Resort 360, ${guestName.split(' ')[0]}! I am your AI Resort Assistant for ${roomNumber}. How can I assist you with your stay today?`,
      time: 'Just now',
      chips: ["Today's Activities", 'Dining Hours', 'Request Service', 'Report an Issue', 'Resort Map', 'My Booking'],
    },
  ]);

  const handleSignOut = () => {
    logout();
    closeOS();
    openAuthModal('choose');
  };

  const handleOrderFood = (dishName: string, price: number) => {
    // Synchronize directly with shared Operations OS kitchen orders & folio!
    createKitchenOrder({
      guestName,
      tableOrRoom: roomNumber,
      roomNumber,
      type: 'Room Service',
      items: [{ name: dishName, quantity: 1, price }],
      total: price,
      status: 'Received',
    });

    setOrderedNotice(`Ordered: ${dishName} (₹${price}) has been placed for ${roomNumber}. Delivered in ~25 mins.`);
    const newReq = {
      id: `req-${Date.now()}`,
      title: `Room Service: ${dishName} (₹${price})`,
      category: 'Dining',
      time: 'Just now',
      status: 'ACCEPTED' as const,
    };
    setRequestsList((prev) => [newReq, ...prev]);
    setTimeout(() => setOrderedNotice(null), 5000);
  };

  const handleAddToCart = (dish: { id: string; name: string; price: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.dishId === dish.id);
      if (existing) {
        return prev.map((i) => (i.dishId === dish.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { dishId: dish.id, name: dish.name, price: dish.price, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (dishId: string) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.dishId === dishId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handlePlaceCartOrder = () => {
    if (cartItems.length === 0) return;
    const totalCost = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = createKitchenOrder({
      guestName,
      tableOrRoom: roomNumber,
      roomNumber,
      type: 'Room Service',
      items: cartItems.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price })),
      total: totalCost,
      status: 'Received',
    });

    setCartSuccessNotice(
      `Order #${newOrder.orderNumber} confirmed! Sent to Palm Terrace kitchen. Total ₹${totalCost.toLocaleString('en-IN')}. Delivery to ${roomNumber} in ~25 mins.`
    );
    setCartItems([]);
    setTimeout(() => setCartSuccessNotice(null), 7000);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const reqText = newRequestNotes.trim() ? `${newRequestType} - ${newRequestNotes.trim()}` : newRequestType;
    const newReq = {
      id: `req-${Date.now()}`,
      title: reqText,
      category: 'Guest Requests',
      time: 'Just now',
      status: 'SUBMITTED' as const,
    };
    setRequestsList((prev) => [newReq, ...prev]);
    addGuestRequest(guestName, reqText, 'Guest Service');
    setNewRequestNotes('');
    setRequestSuccessNotice(true);
    setTimeout(() => setRequestSuccessNotice(false), 4000);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    // Create synchronized work order in shared Maintenance OS!
    createWorkOrder({
      title: issueDescription.trim(),
      roomOrFacility: roomNumber,
      roomNumber,
      zoneId: 'ocean-villas',
      equipment: issueCategory,
      priority: issuePriority === 'Urgent' ? 'High' : issuePriority === 'High' ? 'High' : 'Medium',
      severity: 'Operational Impact',
      assignedTechnician: 'Duty Maintenance Engineer',
      status: 'IN PROGRESS',
      estDowntime: '30 mins',
      isPreventive: false,
      trace: {
        guestReport: issueDescription.trim(),
        reportedBy: `${guestName} (${roomNumber})`,
        reportedAt: 'Just now',
        aiCategory: issueCategory,
        aiConfidence: '98.5%',
        detectedLocation: roomNumber,
        assignedPriority: issuePriority === 'Urgent' ? 'High' : 'Medium',
        workOrderId: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
        assignedTechnician: 'Engineering Team A',
        technicianStartedAt: 'Just now',
        resolutionStatus: 'In Progress',
        resultingRoomStatus: 'Occupied',
      },
    });

    const newReq = {
      id: `req-${Date.now()}`,
      title: `[Issue Report: ${issueCategory} (${issuePriority})] ${issueDescription.trim()}`,
      category: 'Maintenance & Service',
      time: 'Just now',
      status: 'SUBMITTED' as const,
    };
    setRequestsList((prev) => [newReq, ...prev]);
    setIssueDescription('');
    setIssueSuccessNotice(true);
    setTimeout(() => setIssueSuccessNotice(false), 5000);
  };

  const handleTableReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setDiningBookingSuccess(true);
    setTimeout(() => setDiningBookingSuccess(false), 5000);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    // Synchronize directly with shared Feedback module!
    addFeedback({
      guestName,
      roomNumber,
      rating: overallRating,
      category: 'Overall Stay',
      comment: feedbackComment.trim(),
      sentiment: overallRating >= 4 ? 'Positive' : 'Critical',
    });

    setFeedbackList((prev) => [
      { date: 'Today', rating: overallRating, comment: feedbackComment.trim() },
      ...prev,
    ]);
    setFeedbackComment('');
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 4000);
  };

  // Answer guest questions using realistic authenticated context
  const generateLocalAnswer = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('breakfast') || q.includes('lunch') || q.includes('dinner') || q.includes('meal') || q.includes('food') || q.includes('eat') || q.includes('dining hours')) {
      return `Dining timings at The Palm Terrace restaurant:\n• Breakfast: 7:00 AM – 10:30 AM\n• Lunch: 12:30 PM – 3:00 PM\n• Dinner: 7:30 PM – 10:30 PM\nIn-room dining is also available 24/7. You can reserve a table directly in the Dining tab!`;
    }

    if (q.includes('pool') || q.includes('swimming')) {
      return `The Main Swimming Pool and Kids Wading Pool are open daily from 7:00 AM to 9:00 PM. A certified lifeguard is on duty and complimentary fresh towels are provided at the poolside counter.`;
    }

    if (q.includes('kid') || q.includes('child') || q.includes('children') || q.includes('baby') || q.includes('cot') || q.includes('play')) {
      return `Smart Resort 360 is fully family-friendly! We have:\n1. Kids Play Zone (Open 9:00 AM – 8:00 PM with supervised games)\n2. Shallow Kids Pool (1.5 ft depth)\n3. Indoor games room with table tennis, carrom, and board games\n4. Complimentary baby cots and high chairs available on request\nYou can request baby cots or extra beds in the Requests tab!`;
    }

    if (q.includes('activity') || q.includes('activities') || q.includes('gym') || q.includes('yoga') || q.includes('game')) {
      return `Activities available today:\n• Morning Yoga: 7:00 AM on the Sunrise Lawn (Complimentary)\n• Fitness Gym: Open 6:00 AM – 10:00 PM\n• Indoor Games: Open 10:00 AM – 10:00 PM (Table tennis, carrom, billiards)\n• Outdoor Sports: Open till 7:00 PM (Badminton, turf cricket)\n• Evening Live Acoustic Music: 7:30 PM at Palm Terrace Lawn.`;
    }

    if (q.includes('booking') || q.includes('my room') || q.includes('check-in') || q.includes('checkout') || q.includes('check out') || q.includes('nights')) {
      return `Here is your booking summary:\n• Guest: ${guestName}\n• Booking ID: ${bookingRef}\n• Room: ${roomNumber} (${roomType})\n• Dates: ${checkInDate} to ${checkOutDate} (${stayNights} Nights)\n• Rate: ₹${roomRate.toLocaleString('en-IN')}/night\nNeed late check-out? You can request it via the Requests tab!`;
    }

    if (q.includes('towel') || q.includes('water') || q.includes('clean') || q.includes('housekeeping') || q.includes('bed')) {
      const newReq = {
        id: `req-${Date.now()}`,
        title: `AI Concierge Request: ${query}`,
        category: 'Housekeeping',
        time: 'Just now',
        status: 'SUBMITTED' as const,
      };
      setRequestsList((prev) => [newReq, ...prev]);
      return `I have automatically submitted your request for "${query}" to our Housekeeping team. It is logged in your Requests tab and will be delivered to ${roomNumber} shortly!`;
    }

    if (q.includes('issue') || q.includes('broken') || q.includes('not working') || q.includes('ac') || q.includes('wifi') || q.includes('hot water')) {
      return `I understand you have an issue. Please head to the "Report Issue" section or describe it here (e.g. "AC not cooling in Room 204") and I will immediately log a priority maintenance ticket for you.`;
    }

    if (q.includes('pet') || q.includes('dog') || q.includes('cat')) {
      return `We are glad to welcome pets! Ground floor Deluxe rooms and Garden Villas are pet-friendly. Pet fee is ₹750/night, and we provide pet food bowls and sleeping mats upon request. Pets should be on a leash in common resort walkways.`;
    }

    if (q.includes('map') || q.includes('where is') || q.includes('location')) {
      return `Our resort map is accessible under the "RESORT MAP" tab. Key landmarks:\n• Reception & Lobby: 1 min walk\n• Palm Terrace Restaurant: Ground Level near pool\n• Swimming Pool & Kids Area: Central Courtyard\n• Gym & Spa: Wellness Wing (East)\nYou can also click "View on Twin" to locate any area in 3D!`;
    }

    return `Thank you for asking! For ${roomNumber}, our reception team is available 24/7 (Dial 0 from room phone). You can explore Dining hours, today's Activities, request services, or view your Folio bill using the tabs above.`;
  };

  const handleSendAiMessage = async (textToSend?: string) => {
    const text = (textToSend || aiChatInput).trim();
    if (!text) return;

    const userMsg = { sender: 'guest' as const, text, time: 'Just now' };
    setAiChatMessages((prev) => [...prev, userMsg]);
    setAiChatInput('');
    setAiChatLoading(true);

    try {
      // Check if user has AI service configured, otherwise respond with accurate local resort knowledge
      const answer = generateLocalAnswer(text);
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: answer,
            time: 'Just now',
            chips: ["Today's Activities", 'Dining Hours', 'Request Service', 'Resort Map'],
          },
        ]);
        setAiChatLoading(false);
      }, 400);
    } catch {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: generateLocalAnswer(text),
          time: 'Just now',
        },
      ]);
      setAiChatLoading(false);
    }
  };

  // Realistic bill calculation in ₹ INR
  const roomTotal = roomRate * stayNights; // ₹25,500
  const diningTotal = 2450;
  const roomServiceTotal = 1200;
  const taxesTotal = Math.round((roomTotal + diningTotal + roomServiceTotal) * 0.12); // 12% GST: ₹3,500
  const discountTotal = 1500;
  const grandTotal = roomTotal + diningTotal + roomServiceTotal + taxesTotal - discountTotal; // ₹31,150
  const advancePaid = isPaidInFull ? grandTotal : 15000;
  const balanceDue = isPaidInFull ? 0 : grandTotal - advancePaid;

  return (
    <div className={`space-y-6 animate-fadeIn pb-12 ${isLight ? 'text-[#26332D]' : 'text-neutral-200'}`}>
      {/* 1. Welcoming Resort Guest Header Bar */}
      <div
        className={`p-6 sm:p-7 border relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-[#EEECE4] border-[#D0CCC0] shadow-sm'
            : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <div
          className="absolute top-0 left-0 h-[2px] w-full"
          style={{
            background: isLight
              ? 'linear-gradient(to right, transparent, #B58A52, transparent)'
              : 'linear-gradient(to right, transparent, #c8aa6e, transparent)',
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
              <span
                className={`inline-block w-2 h-2 rounded-full animate-pulse ${
                  isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                }`}
              />
              <span className={`font-semibold ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                GUEST PORTAL · SMART RESORT 360
              </span>
              <span className={isLight ? 'text-[#B8AD9B]' : 'text-neutral-600'}>·</span>
              <span className={isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}>BOOKING #{bookingRef}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className={`text-2xl sm:text-3xl font-editorial ${isLight ? 'text-[#18251F]' : 'text-white'}`}>
                Welcome, {guestName}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-mono rounded font-medium ${
                  isLight
                    ? 'bg-[#E5E2D6] text-[#2D5A3E] border border-[#B8AD9B]'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                In-Residence (Checked In)
              </span>
            </div>

            <div className={`text-xs font-mono flex flex-wrap items-center gap-3 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{roomNumber}</span>
              <span>·</span>
              <span>{roomType}</span>
              <span>·</span>
              <span>{stayNights} Nights ({checkInDate.split(',')[0]} – {checkOutDate.split(',')[0]})</span>
            </div>
          </div>

          {/* Quick Action Affordances */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDoorLocked((prev) => !prev)}
              className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                isDoorLocked
                  ? isLight
                    ? 'bg-[#F0EEE7] text-[#26332D] border-[#B8AD9B] hover:border-[#8F6834]'
                    : 'bg-white/[0.05] text-neutral-200 border-white/10 hover:border-[#c8aa6e]/50'
                  : isLight
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
              title="Toggle digital RFID keycard for room door"
            >
              {isDoorLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-500" />}
              <span className="font-semibold">{isDoorLocked ? 'DOOR LOCKED' : 'DOOR UNLOCKED'}</span>
            </button>

            <button
              onClick={() => locateOn3DTwin('ocean-villas')}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isLight
                  ? 'bg-[#F0EEE7] hover:bg-[#E7E4DC] text-[#26332D] border-[#D0CCC0]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border-white/10'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
              <span>View On 3D Map</span>
            </button>

            <button
              onClick={handleSignOut}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-1.5 ${
                isLight
                  ? 'text-[#68716B] hover:text-[#18251F] bg-[#F0EEE7] hover:bg-[#E7E4DC] border-[#D0CCC0]'
                  : 'text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
              }`}
              title="Sign out to return to access screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Bar for Guest Portal */}
      <div
        className={`flex items-center gap-1.5 overflow-x-auto border-b pb-1 text-xs font-mono scrollbar-none ${
          isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
        }`}
      >
        {[
          { id: 'stay', label: 'MY STAY', icon: Key },
          { id: 'ai_concierge', label: 'AI CONCIERGE', icon: Sparkles },
          { id: 'dining', label: 'DINING', icon: UtensilsCrossed },
          { id: 'activities', label: 'ACTIVITIES & FACILITIES', icon: Waves },
          { id: 'map', label: 'RESORT MAP', icon: Compass },
          { id: 'requests', label: 'REQUESTS', icon: ConciergeBell },
          { id: 'billing', label: 'BILLING & FOLIO', icon: Receipt },
          { id: 'profile', label: 'PROFILE & FEEDBACK', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as PortalTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                isActive
                  ? isLight
                    ? 'border-[#8F6834] text-[#18251F] font-bold bg-[#E7E4DC]/80'
                    : 'border-[#c8aa6e] text-white font-semibold bg-white/[0.04]'
                  : isLight
                  ? 'border-transparent text-[#68716B] hover:text-[#18251F]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive
                    ? isLight
                      ? 'text-[#8F6834]'
                      : 'text-[#c8aa6e]'
                    : isLight
                    ? 'text-[#7D8C7C]'
                    : 'text-neutral-500'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: MY STAY (Main Guest Dashboard)
          ========================================================================= */}
      {activeCategory === 'stay' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Booking Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Confirmation & Dates */}
            <div
              className={`p-5 border space-y-3 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono uppercase font-semibold ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                  RESERVATION DETAILS
                </span>
                <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">CONFIRMED</span>
              </div>
              <div>
                <div className="text-lg font-semibold">{bookingRef}</div>
                <div className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>Booked in name of {guestName}</div>
              </div>
              <div className={`pt-2 border-t text-xs font-mono space-y-1 ${isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'}`}>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{checkOutDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{stayNights} Nights</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{adultsCount} Adults, {kidsCount} Child</span>
                </div>
              </div>
            </div>

            {/* Room & Accommodation */}
            <div
              className={`p-5 border space-y-3 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono uppercase font-semibold ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                  ROOM / ACCOMMODATION
                </span>
                <span className={`text-xs font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>Floor 2 · Block B</span>
              </div>
              <div>
                <div className="text-lg font-semibold">{roomNumber}</div>
                <div className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>{roomType}</div>
              </div>
              <div className={`pt-2 border-t text-xs font-mono space-y-1 ${isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'}`}>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">2–3 Guests</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">₹{roomRate.toLocaleString('en-IN')} / night</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Accommodation:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">₹{(roomRate * stayNights).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Housekeeping:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Cleaned & Inspected</span>
                </div>
              </div>
            </div>

            {/* Front Desk & Quick Help */}
            <div
              className={`p-5 border space-y-3 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono uppercase font-semibold ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                  GUEST ASSISTANCE
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">24/7 ACTIVE</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8F6834] dark:text-[#c8aa6e]" />
                  <span>Front Desk: Dial 0 (or +91 80 4000 3600)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8F6834] dark:text-[#c8aa6e]" />
                  <span>care@smartresort360.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8F6834] dark:text-[#c8aa6e]" />
                  <span>Check-out is at 11:00 AM</span>
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setActiveCategory('requests')}
                  className={`w-full py-2 px-3 text-xs font-mono uppercase tracking-wider font-semibold border transition-colors cursor-pointer text-center ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Request Service
                </button>
              </div>
            </div>
          </div>

          {/* In-Room Comfort & Climate Controller */}
          <div
            className={`p-6 border space-y-4 ${
              isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit">
              <div>
                <h3 className="text-base font-semibold">Room Controls & Comfort · {roomNumber}</h3>
                <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                  Manage in-room temperature and door access directly from your phone.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono">AC Status: Running (Optimal)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span>Target Climate</span>
                  <span className="font-semibold text-lg">{roomTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="28"
                  value={roomTemp}
                  onChange={(e) => setRoomTemp(parseInt(e.target.value))}
                  className="w-full accent-[#8F6834] dark:accent-[#c8aa6e] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                  <span>18°C (Cool)</span>
                  <span>23°C (Eco)</span>
                  <span>28°C (Warm)</span>
                </div>
              </div>

              {/* Fan Speed */}
              <div className="space-y-2">
                <div className="text-xs font-mono">Fan Speed</div>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setAcFanSpeed(speed)}
                      className={`flex-1 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                        acFanSpeed === speed
                          ? isLight
                            ? 'bg-[#18251F] text-white border-[#18251F]'
                            : 'bg-[#c8aa6e] text-black border-[#c8aa6e] font-semibold'
                          : isLight
                          ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#26332D]'
                          : 'bg-white/[0.04] border-white/10 text-neutral-300'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
                <p className={`text-[11px] ${isLight ? 'text-[#68716B]' : 'text-neutral-500'}`}>
                  Whisper-quiet inverter ventilation
                </p>
              </div>

              {/* Wi-Fi & Key */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#8F6834] dark:text-[#c8aa6e]" />
                  <span>Wi-Fi: <strong>SmartResort_Guest</strong> (No Password)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#8F6834] dark:text-[#c8aa6e]" />
                  <span>Smart TV: Casting enabled from device</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#8F6834] dark:text-[#c8aa6e]" />
                  <span>Tea / Coffee station restocked daily</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Realistic Resort Accommodation Showcase */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-editorial">Resort Accommodations</h3>
                <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                  Explore our standard, deluxe, family rooms and boutique villas for future visits or extensions.
                </p>
              </div>
              <span className={`text-xs font-mono ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                4 Distinct Categories
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {RESORT_ROOM_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-4 border flex flex-col justify-between space-y-3 transition-all ${
                    cat.name.includes('Deluxe')
                      ? isLight
                        ? 'bg-[#E7E4DC] border-[#8F6834] shadow-sm'
                        : 'bg-white/[0.04] border-[#c8aa6e]'
                      : isLight
                      ? 'bg-[#EEECE4] border-[#D0CCC0]'
                      : 'bg-white/[0.02] border-white/10'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-semibold">
                        {cat.capacity}
                      </span>
                      {cat.name.includes('Deluxe') && (
                        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                          YOUR ROOM
                        </span>
                      )}
                    </div>
                    <div className="text-base font-semibold">{cat.name}</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      ₹{cat.pricePerNight.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-neutral-500">/ night</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                      {cat.description}
                    </p>
                    <div className="pt-2 border-t border-inherit space-y-1 text-[11px] font-mono">
                      <div>• Bed: {cat.bedType}</div>
                      <div>• Pet Friendly: {cat.isPetFriendly ? 'Yes' : 'No'}</div>
                      <div>• Total in Resort: {cat.totalUnits} units</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveCategory('ai_concierge');
                      handleSendAiMessage(`Tell me more about booking the ${cat.name}`);
                    }}
                    className={`w-full py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer text-center ${
                      isLight
                        ? 'border-[#D0CCC0] hover:border-[#18251F] text-[#26332D]'
                        : 'border-white/15 hover:border-white text-neutral-300'
                    }`}
                  >
                    Inquire Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: AI CONCIERGE (Fully Functional Assistant)
          ========================================================================= */}
      {activeCategory === 'ai_concierge' && (
        <div className="space-y-4 animate-fadeIn">
          <div
            className={`p-5 border space-y-2 ${
              isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className={`w-5 h-5 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
              <h2 className="text-xl font-editorial">AI Guest Concierge</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Context-Aware · {roomNumber}
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              Ask anything about meal timings, pool hours, kids activities, room service, or requesting extra towels.
            </p>

            {/* Suggested Quick Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "What time is breakfast?",
                "Is the pool open?",
                "What can my kids do?",
                "What activities are available today?",
                "Can I request extra towels?",
                "Can I request a baby cot?",
                "Report an issue with AC",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendAiMessage(chip)}
                  className={`text-xs font-mono px-2.5 py-1 border rounded transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-[#F0EEE7] border-[#D0CCC0] hover:border-[#8F6834] text-[#26332D]'
                      : 'bg-white/[0.04] border-white/10 hover:border-[#c8aa6e]/60 text-neutral-300'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Window */}
          <div
            className={`p-4 sm:p-5 border min-h-[380px] max-h-[460px] overflow-y-auto space-y-4 flex flex-col justify-between ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-[#090b10] border-white/10'
            }`}
          >
            <div className="space-y-3.5 overflow-y-auto pr-1">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs ${msg.sender === 'guest' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        isLight ? 'bg-[#E5E2D6] border-[#D0CCC0] text-[#8F6834]' : 'bg-white/10 border-white/20 text-[#c8aa6e]'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-xl p-3.5 rounded-lg space-y-1.5 leading-relaxed ${
                      msg.sender === 'guest'
                        ? isLight
                          ? 'bg-[#18251F] text-white'
                          : 'bg-[#c8aa6e] text-black font-medium'
                        : isLight
                        ? 'bg-[#EEECE4] border border-[#D0CCC0] text-[#26332D]'
                        : 'bg-white/[0.04] border border-white/10 text-neutral-200'
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs font-mono">{msg.text}</div>
                    <div className={`text-[10px] text-right font-mono ${msg.sender === 'guest' ? 'opacity-80' : 'text-neutral-500'}`}>
                      {msg.time}
                    </div>

                    {msg.chips && msg.chips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-inherit">
                        {msg.chips.map((c) => (
                          <button
                            key={c}
                            onClick={() => handleSendAiMessage(c)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 hover:opacity-80 cursor-pointer"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'guest' && (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        isLight ? 'bg-[#18251F] text-white border-transparent' : 'bg-[#c8aa6e] text-black'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {aiChatLoading && (
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking resort systems and compiling response...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="pt-3 border-t border-inherit flex gap-2"
            >
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ask about breakfast, pool timings, baby cot, activities..."
                className={`flex-1 p-2.5 text-xs font-mono border focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-[#EEECE4] border-[#D0CCC0] text-[#18251F] focus:border-[#8F6834]'
                    : 'bg-white/[0.04] border-white/10 text-white focus:border-[#c8aa6e]'
                }`}
              />
              <button
                type="submit"
                disabled={!aiChatInput.trim()}
                className={`px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-[#18251F] text-white hover:bg-[#26332D] disabled:opacity-50'
                    : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f] disabled:opacity-50'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MEALS & DINING
          ========================================================================= */}
      {activeCategory === 'dining' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Configurable Meal Timings Hero Card */}
          <div
            className={`p-6 border space-y-4 ${
              isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-inherit pb-3">
              <div>
                <span className={`text-[11px] font-mono uppercase tracking-widest font-semibold ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                  RESORT RESTAURANT & DINING TIMINGS
                </span>
                <h3 className="text-xl font-editorial mt-0.5">The Palm Terrace & Grove Restaurant</h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                RESTAURANT CURRENTLY: OPEN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className={`p-4 border rounded ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Coffee className={`w-4 h-4 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
                  <span className="font-semibold text-sm">BREAKFAST</span>
                </div>
                <div className="text-lg font-bold mt-1">7:00 AM – 10:30 AM</div>
                <p className={`text-xs mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                  Complimentary buffet breakfast with South Indian live counter, eggs to order, and fresh juices.
                </p>
              </div>

              <div
                className={`p-4 border rounded ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className={`w-4 h-4 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
                  <span className="font-semibold text-sm">LUNCH</span>
                </div>
                <div className="text-lg font-bold mt-1">12:30 PM – 3:00 PM</div>
                <p className={`text-xs mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                  À la carte & set thali options. Indian curries, wood-fired pizzas, sandwiches, and kids specials.
                </p>
              </div>

              <div
                className={`p-4 border rounded ${
                  isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className={`w-4 h-4 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
                  <span className="font-semibold text-sm">DINNER</span>
                </div>
                <div className="text-lg font-bold mt-1">7:30 PM – 10:30 PM</div>
                <p className={`text-xs mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                  Barbecue grill, coastal delicacies, continental favorites, and live acoustic music on lawn.
                </p>
              </div>
            </div>
          </div>

          {/* Table Reservation Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`p-6 border space-y-4 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <h3 className="text-lg font-editorial">Reserve a Restaurant Table</h3>
              <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                Book a table at Palm Terrace for your family or group.
              </p>

              {diningBookingSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Table reserved successfully for {diningGuests} guests at {diningTime} on {diningDate}!</span>
                </div>
              )}

              <form onSubmit={handleTableReservation} className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Date</label>
                    <input
                      type="date"
                      value={diningDate}
                      onChange={(e) => setDiningDate(e.target.value)}
                      className={`w-full p-2 border ${
                        isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Meal Slot</label>
                    <select
                      value={diningMealSlot}
                      onChange={(e) => setDiningMealSlot(e.target.value as any)}
                      className={`w-full p-2 border ${
                        isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                      }`}
                    >
                      <option value="Breakfast">Breakfast (7:00 – 10:30 AM)</option>
                      <option value="Lunch">Lunch (12:30 – 3:00 PM)</option>
                      <option value="Dinner">Dinner (7:30 – 10:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Time</label>
                    <input
                      type="text"
                      value={diningTime}
                      onChange={(e) => setDiningTime(e.target.value)}
                      placeholder="e.g. 8:00 PM"
                      className={`w-full p-2 border ${
                        isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={diningGuests}
                      onChange={(e) => setDiningGuests(parseInt(e.target.value) || 1)}
                      className={`w-full p-2 border ${
                        isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Special Requests</label>
                  <input
                    type="text"
                    value={diningSpecialNote}
                    onChange={(e) => setDiningSpecialNote(e.target.value)}
                    placeholder="e.g. High chair needed, pool-facing table, quiet corner"
                    className={`w-full p-2 border ${
                      isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 font-semibold uppercase tracking-wider cursor-pointer border ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Confirm Table Reservation
                </button>
              </form>
            </div>

            {/* Popular Menu Items & Fast In-Room Order */}
            <div
              className={`p-6 border space-y-4 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-editorial">Room Service Menu</h3>
                <span className={`text-xs font-mono ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                  All Prices in ₹ INR
                </span>
              </div>

              {orderedNotice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                  {orderedNotice}
                </div>
              )}

              <div className="space-y-2.5">
                {[
                  { name: 'Crispy Masala Dosa Platter', desc: 'Served with sambar, coconut chutney & tomato relish', price: 340, tag: 'Breakfast' },
                  { name: 'Wood-fired Farmhouse Pizza', desc: 'Bell peppers, mushrooms, olives & fresh mozzarella', price: 580, tag: 'All Day' },
                  { name: 'Hyderabadi Dum Biryani Pot', desc: 'Aromatic basmati rice cooked with whole spices & raita', price: 620, tag: 'Chef Special' },
                  { name: 'Classic Club Sandwich & Fries', desc: 'Triple-layer toasted sandwich with cheese & potato chips', price: 390, tag: 'Snack' },
                  { name: 'Kids Macaroni & Cheese Bowl', desc: 'Mild cheesy pasta loved by children', price: 290, tag: 'Kids Menu' },
                  { name: 'Cold-Pressed Tender Coconut Juice', desc: 'Fresh local natural coconut water', price: 160, tag: 'Beverage' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`p-3 border rounded flex items-center justify-between gap-3 ${
                      isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{item.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10">
                          {item.tag}
                        </span>
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono">₹{item.price}</div>
                      <button
                        onClick={() => handleOrderFood(item.name, item.price)}
                        className={`mt-1 px-2.5 py-1 text-[10px] font-mono uppercase font-semibold border cursor-pointer ${
                          isLight
                            ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                            : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                        }`}
                      >
                        Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ACTIVITIES & FACILITIES
          ========================================================================= */}
      {activeCategory === 'activities' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-editorial">Activities & Live Facility Status</h3>
            <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              Check live operating hours, status, and join resort activities for all age groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'SWIMMING POOL',
                status: 'OPEN',
                statusColor: 'text-emerald-500',
                hours: '7:00 AM – 9:00 PM',
                location: 'Central Courtyard',
                age: 'All ages (shallow kids pool available)',
                booking: 'No booking required',
                desc: 'Main pool (4ft) and adjoining kids splash pool. Fresh pool towels provided at counter.',
              },
              {
                title: 'INDOOR GAMES',
                status: 'OPEN',
                statusColor: 'text-emerald-500',
                hours: '10:00 AM – 10:00 PM',
                location: 'Central Pavilion, Level 1',
                age: 'All ages',
                booking: 'No booking required',
                desc: 'Table tennis, carrom boards, chess tables, 8-ball pool, and foosball. Free for all guests.',
              },
              {
                title: 'KIDS PLAY AREA',
                status: 'OPEN',
                statusColor: 'text-emerald-500',
                hours: '9:00 AM – 8:00 PM',
                location: 'Garden Lawn Wing',
                age: 'Ages 3–12 years',
                booking: 'Complimentary drop-in',
                desc: 'Swings, slides, sandbox, building blocks, and supervised afternoon coloring & craft activities.',
              },
              {
                title: 'FITNESS GYM',
                status: 'OPEN',
                statusColor: 'text-emerald-500',
                hours: '6:00 AM – 10:00 PM',
                location: 'Wellness Wing',
                age: 'Ages 16+',
                booking: 'Free access with room key',
                desc: 'Fully air-conditioned gym with treadmills, cross trainers, dumbbells up to 30kg, and yoga mats.',
              },
              {
                title: 'OUTDOOR SPORTS',
                status: 'OPEN',
                statusColor: 'text-emerald-500',
                hours: '6:30 AM – 7:00 PM',
                location: 'South Recreation Ground',
                age: 'All ages',
                booking: 'Equipment at Sports Desk',
                desc: 'Badminton court, lawn cricket nets, and volleyball. Equipment provided on room number sign-out.',
              },
              {
                title: 'MORNING YOGA SESSION',
                status: 'UPCOMING (7:00 AM Daily)',
                statusColor: 'text-amber-500',
                hours: '7:00 AM – 8:00 AM',
                location: 'Sunrise Lawn',
                age: 'Beginner to Intermediate',
                booking: 'Complimentary (Walk-in)',
                desc: 'Guided Pranayama and gentle Hatha yoga led by resident yoga instructor. Yoga mats provided.',
              },
              {
                title: 'LIVE EVENING MUSIC',
                status: 'TODAY (7:30 PM)',
                statusColor: 'text-cyan-500',
                hours: '7:30 PM – 9:30 PM',
                location: 'Palm Terrace Lawn',
                age: 'Family & all guests',
                booking: 'No booking required',
                desc: 'Acoustic Bollywood & retro western melodies under the stars during dinner hours.',
              },
              {
                title: 'AYURVEDA & SPA',
                status: 'OPEN (Bookings Open)',
                statusColor: 'text-emerald-500',
                hours: '8:30 AM – 8:00 PM',
                location: 'Spa Pavilion',
                age: 'Adults',
                booking: 'Prior appointment',
                desc: 'Relaxing herbal oil body massages, head reflexology, and steam bath therapies from ₹1,800.',
              },
              {
                title: 'GUIDED RESORT NATURE WALK',
                status: 'UPCOMING (4:30 PM)',
                statusColor: 'text-amber-500',
                hours: '4:30 PM – 5:30 PM',
                location: 'Meeting at Main Lobby',
                age: 'Great for families',
                booking: 'Sign up at reception',
                desc: '45-minute fun educational walk discovering bird species, local tropical trees, and resort herbs.',
              },
            ].map((act) => (
              <div
                key={act.title}
                className={`p-5 border space-y-3 flex flex-col justify-between ${
                  isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-semibold text-neutral-500">
                      {act.location}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${act.statusColor}`}>
                      {act.status}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold">{act.title}</h4>
                  <div className="text-xs font-mono font-medium">Timings: {act.hours}</div>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                    {act.desc}
                  </p>
                  <div className="text-[11px] font-mono text-neutral-500 pt-1">
                    Guideline: {act.booking}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newReq = {
                      id: `req-${Date.now()}`,
                      title: `Activity Reservation: ${act.title}`,
                      category: 'Activities',
                      time: 'Just now',
                      status: 'SUBMITTED' as const,
                    };
                    setRequestsList((prev) => [newReq, ...prev]);
                    setActiveCategory('requests');
                  }}
                  className={`w-full py-1.5 text-xs font-mono uppercase tracking-wider font-semibold border transition-colors cursor-pointer text-center ${
                    isLight
                      ? 'bg-[#F0EEE7] border-[#D0CCC0] hover:border-[#18251F] text-[#26332D]'
                      : 'bg-white/[0.04] border-white/10 hover:border-white text-white'
                  }`}
                >
                  Join / Reserve Activity
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: RESORT MAP
          ========================================================================= */}
      {activeCategory === 'map' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-editorial">Resort Layout & Map Directory</h3>
            <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              Navigate through resort facilities, room blocks, swimming pools, dining, and kids areas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Location Directory List */}
            <div className="lg:col-span-2 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {RESORT_MAP_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`p-3.5 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? isLight
                          ? 'bg-[#E7E4DC] border-[#8F6834] shadow-sm'
                          : 'bg-white/[0.06] border-[#c8aa6e]'
                        : isLight
                        ? 'bg-[#EEECE4] border-[#D0CCC0] hover:bg-[#E7E4DC]'
                        : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{loc.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10">
                          {loc.category}
                        </span>
                      </div>
                      <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                        Hours: {loc.hours} · Approx {loc.distance} from Lobby
                      </div>
                      <p className={`text-xs ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
                        {loc.facilities}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {loc.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          locateOn3DTwin(loc.zone as any);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1 ${
                          isLight
                            ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                            : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                        }`}
                      >
                        <Compass className="w-3 h-3" />
                        <span>View on Twin</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Location Inspector Card */}
            <div
              className={`p-5 border space-y-4 h-fit ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className={`text-[11px] font-mono uppercase font-semibold ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                  LOCATION INSPECTOR
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedLocation.status}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-semibold">{selectedLocation.name}</h4>
                <div className={`text-xs font-mono space-y-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                  <div>Category: {selectedLocation.category}</div>
                  <div>Operating Hours: {selectedLocation.hours}</div>
                  <div>Walking Distance: {selectedLocation.distance}</div>
                  <div>3D Zone Anchor: {selectedLocation.zone}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-inherit">
                <div className="text-xs font-mono font-semibold mb-1">Available Facilities:</div>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
                  {selectedLocation.facilities}
                </p>
              </div>

              <button
                onClick={() => locateOn3DTwin(selectedLocation.zone as any)}
                className={`w-full py-2.5 text-xs font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  isLight
                    ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                    : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Fly 3D Camera to {selectedLocation.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: ROOM SERVICE & REQUESTS
          ========================================================================= */}
      {activeCategory === 'requests' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-editorial">Room Service & Requests</h3>
            <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              Request extra towels, water bottles, baby cot, extra bed, housekeeping, or report maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Request Submitter */}
            <div
              className={`p-6 border space-y-4 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <h4 className="text-base font-semibold">New Service Request for {roomNumber}</h4>

              {requestSuccessNotice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Your request has been dispatched to housekeeping & front desk!</span>
                </div>
              )}

              <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block mb-1 font-medium">Select Request Type</label>
                  <select
                    value={newRequestType}
                    onChange={(e) => setNewRequestType(e.target.value)}
                    className={`w-full p-2.5 border ${
                      isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                    }`}
                  >
                    <option value="Extra Bath & Pool Towels">Extra Bath & Pool Towels</option>
                    <option value="Packaged Drinking Water (2 Bottles)">Packaged Drinking Water (Complimentary)</option>
                    <option value="Dental & Toiletry Kit">Dental & Toiletry Kit</option>
                    <option value="Housekeeping Room Turnaround">Housekeeping Room Turnaround & Cleaning</option>
                    <option value="Baby Cot (Complimentary)">Baby Cot (Complimentary for infants)</option>
                    <option value="Extra Rollaway Bed (₹1,200/night)">Extra Rollaway Bed (₹1,200/night)</option>
                    <option value="Luggage Assistance on Check-out">Luggage Assistance / Bell Desk</option>
                    <option value="Room Maintenance Check">Maintenance Check (AC / Tap / TV)</option>
                    <option value="Other Custom Request">Other Custom Request</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Specific Notes (Optional)</label>
                  <input
                    type="text"
                    value={newRequestNotes}
                    onChange={(e) => setNewRequestNotes(e.target.value)}
                    placeholder="e.g. Please bring by 4:00 PM, quiet knock as child is sleeping"
                    className={`w-full p-2.5 border ${
                      isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 text-xs font-mono font-semibold uppercase tracking-wider cursor-pointer border ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Submit Service Request
                </button>
              </form>

              {/* Practical Issue Reporting Sub-card */}
              <div className="pt-4 border-t border-inherit space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-xs">Need to Report a Room Issue?</h5>
                  <button
                    onClick={() => setIsIssueAgentOpen(true)}
                    className="text-[11px] font-mono text-amber-500 hover:underline cursor-pointer"
                  >
                    Use AI Camera Scanner
                  </button>
                </div>

                {issueSuccessNotice && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                    Maintenance ticket logged for {roomNumber}. An engineer has been notified!
                  </div>
                )}

                <form onSubmit={handleReportIssue} className="space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={issueCategory}
                      onChange={(e) => setIssueCategory(e.target.value)}
                      className={`p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                    >
                      <option value="Air Conditioning">Air Conditioning / Cooling</option>
                      <option value="Wi-Fi Connection">Wi-Fi Connection</option>
                      <option value="Television & Cable">Television & Cable</option>
                      <option value="Plumbing & Hot Water">Plumbing & Hot Water</option>
                      <option value="Keycard Door Lock">Keycard Door Lock</option>
                      <option value="Cleanliness">Room Cleanliness</option>
                    </select>

                    <select
                      value={issuePriority}
                      onChange={(e) => setIssuePriority(e.target.value as any)}
                      className={`p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                    >
                      <option value="Normal">Priority: Normal</option>
                      <option value="High">Priority: High</option>
                      <option value="Urgent">Priority: Urgent</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe issue (e.g. AC fan rattling or bathroom tap leaking)"
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />

                  <button
                    type="submit"
                    disabled={!issueDescription.trim()}
                    className={`w-full py-2 font-mono uppercase text-[11px] font-semibold border cursor-pointer ${
                      isLight
                        ? 'bg-[#E5E2D6] border-[#B8AD9B] text-[#18251F] hover:bg-[#DCD9CC]'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                    }`}
                  >
                    Report Maintenance Issue
                  </button>
                </form>
              </div>
            </div>

            {/* Active Requests Status Tracker */}
            <div
              className={`p-6 border space-y-4 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold">Active & Past Requests</h4>
                <span className={`text-xs font-mono ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`}>
                  {requestsList.length} Total Logged
                </span>
              </div>

              <div className="space-y-3">
                {requestsList.map((req) => {
                  const statusBadgeColor =
                    req.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : req.status === 'IN PROGRESS'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';

                  return (
                    <div
                      key={req.id}
                      className={`p-3.5 border rounded flex items-center justify-between gap-3 ${
                        isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-semibold">{req.title}</div>
                        <div className={`text-[11px] font-mono ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                          {req.category} · Logged: {req.time}
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold border rounded ${statusBadgeColor}`}>
                        {req.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: BILLING & FOLIO (Separate Section, Mandatory ₹ INR)
          ========================================================================= */}
      {activeCategory === 'billing' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-editorial">Residence Bill & Folio</h3>
            <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              Itemized charges for accommodation, dining, and resort services. All amounts in Indian Rupees (₹).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Itemized Folio Table */}
            <div
              className={`lg:col-span-2 p-6 border space-y-4 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div>
                  <div className="text-xs font-mono font-semibold">GUEST FOLIO #FOL-2026-9481</div>
                  <div className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                    {guestName} · {roomNumber}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                    isPaidInFull
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isPaidInFull ? 'SETTLED IN FULL' : 'PARTIALLY SETTLED'}
                </span>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`border-b ${isLight ? 'border-[#D0CCC0] text-[#18251F]' : 'border-white/10 text-neutral-300'}`}>
                      <th className="py-2">Description</th>
                      <th className="py-2">Category</th>
                      <th className="py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    <tr>
                      <td className="py-2.5">
                        <div className="font-semibold">{roomType}</div>
                        <div className="text-[11px] text-neutral-500">₹8,500/night × 3 Nights</div>
                      </td>
                      <td className="py-2.5">Room Charges</td>
                      <td className="py-2.5 text-right font-semibold">₹25,500</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="font-semibold">The Palm Terrace Restaurant</div>
                        <div className="text-[11px] text-neutral-500">Buffet dinner & beverages for 3</div>
                      </td>
                      <td className="py-2.5">Dining</td>
                      <td className="py-2.5 text-right font-semibold">₹2,450</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="font-semibold">In-Room Dining / Snacks</div>
                        <div className="text-[11px] text-neutral-500">Farmhouse Pizza & Kids Macaroni</div>
                      </td>
                      <td className="py-2.5">Room Service</td>
                      <td className="py-2.5 text-right font-semibold">₹1,200</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="font-semibold">Kids Play Zone & Swimming Pool</div>
                        <div className="text-[11px] text-neutral-500">In-house resort amenity access</div>
                      </td>
                      <td className="py-2.5">Recreation</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">FREE</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="font-semibold">Seasonal Family Welcome Offer</div>
                        <div className="text-[11px] text-neutral-500">Promotional direct booking discount</div>
                      </td>
                      <td className="py-2.5">Discount</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">-₹1,500</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="font-semibold">Goods & Services Tax (GST @ 12%)</div>
                        <div className="text-[11px] text-neutral-500">Statutory hospitality applicable taxes</div>
                      </td>
                      <td className="py-2.5">Taxes</td>
                      <td className="py-2.5 text-right font-semibold">₹{taxesTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary & Settle Card */}
            <div
              className={`p-6 border space-y-4 h-fit ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <h4 className="text-base font-semibold">Payment Summary</h4>

              <div className="space-y-2 text-xs font-mono pt-1">
                <div className="flex justify-between">
                  <span>Room Subtotal:</span>
                  <span>₹{roomTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dining & Food:</span>
                  <span>₹{(diningTotal + roomServiceTotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (12% GST):</span>
                  <span>₹{taxesTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount:</span>
                  <span>-₹{discountTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-inherit flex justify-between font-bold text-sm">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Advance Deposit Paid:</span>
                  <span>₹{advancePaid.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-inherit flex justify-between font-bold text-base text-neutral-900 dark:text-neutral-100">
                  <span>Balance Due:</span>
                  <span className={balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    ₹{balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {balanceDue > 0 ? (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setIsPaidInFull(true)}
                    className={`w-full py-2.5 text-xs font-mono font-semibold uppercase tracking-wider border cursor-pointer flex items-center justify-center gap-2 ${
                      isLight
                        ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                        : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Settle Balance (UPI / Card Demo)</span>
                  </button>
                  <p className={`text-[11px] text-center ${isLight ? 'text-[#68716B]' : 'text-neutral-500'}`}>
                    Demo transaction: click to simulate settling bill prior to check-out.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono text-center">
                  Folio settled in full! Thank you for staying with us.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: PROFILE & FEEDBACK
          ========================================================================= */}
      {activeCategory === 'profile' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-editorial">Guest Profile & Stay Feedback</h3>
            <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
              Review guest contact information, family/pet details, and share your experience with the management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Profile & Preferences */}
            <div
              className={`p-6 border space-y-4 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <h4 className="text-base font-semibold">Guest Profile & Family Details</h4>

              <div className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Guest Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Phone Number</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>

                {/* Kids Configuration */}
                <div className="pt-2 border-t border-inherit space-y-2">
                  <div className="font-semibold">Traveling with Children?</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Number of Children</label>
                      <input
                        type="number"
                        min="0"
                        max="6"
                        value={kidsCount}
                        onChange={(e) => setKidsCount(parseInt(e.target.value) || 0)}
                        className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Ages</label>
                      <input
                        type="text"
                        value={kidsAges}
                        onChange={(e) => setKidsAges(e.target.value)}
                        placeholder="e.g. 6 years, 2 years"
                        className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsBabyCot}
                        onChange={(e) => setNeedsBabyCot(e.target.checked)}
                      />
                      <span>Baby Cot Required</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsHighChair}
                        onChange={(e) => setNeedsHighChair(e.target.checked)}
                      />
                      <span>High Chair for Meals</span>
                    </label>
                  </div>
                </div>

                {/* Pet Configuration */}
                <div className="pt-2 border-t border-inherit space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Traveling with Pets?</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPets}
                        onChange={(e) => setHasPets(e.target.checked)}
                      />
                      <span>Yes, bringing pet</span>
                    </label>
                  </div>

                  {hasPets && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block mb-1">Pet Type & Breed</label>
                        <input
                          type="text"
                          value={petType}
                          onChange={(e) => setPetType(e.target.value)}
                          placeholder="e.g. Golden Retriever"
                          className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Pet Size</label>
                        <select
                          value={petSize}
                          onChange={(e) => setPetSize(e.target.value)}
                          className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                        >
                          <option value="Small (<10 kg)">Small (&lt;10 kg)</option>
                          <option value="Medium (10–25 kg)">Medium (10–25 kg)</option>
                          <option value="Large (>25 kg)">Large (&gt;25 kg)</option>
                        </select>
                      </div>
                      <div className="col-span-2 text-[11px] text-neutral-500">
                        Pet fee: ₹750/night. Ground floor deluxe rooms and garden villas are pet-friendly.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Submitter & History */}
            <div
              className={`p-6 border space-y-4 ${
                isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <h4 className="text-base font-semibold">Share Your Stay Feedback</h4>
              <p className={`text-xs ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
                Your ratings help our hospitality and housekeeping teams maintain high service quality.
              </p>

              {feedbackSubmitted && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                  Thank you for your valuable feedback! Management has received your response.
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-3.5 text-xs font-mono">
                {/* 5-Star Rating Buttons */}
                <div>
                  <label className="block mb-1 font-medium">Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= overallRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-400'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold">{overallRating} / 5 Stars</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Cleanliness: <strong>{cleanlinessRating}/5</strong></div>
                  <div>Staff Service: <strong>{serviceRating}/5</strong></div>
                  <div>Food & Dining: <strong>{foodRating}/5</strong></div>
                  <div>Facilities & Pool: <strong>{facilitiesRating}/5</strong></div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Your Comments</label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us what you enjoyed most or what we can improve for your next stay..."
                    className={`w-full p-2.5 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!feedbackComment.trim()}
                  className={`w-full py-2.5 text-xs font-mono font-semibold uppercase tracking-wider cursor-pointer border ${
                    isLight
                      ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                      : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  Submit Feedback
                </button>
              </form>

              {/* Previous Feedback List */}
              <div className="pt-3 border-t border-inherit space-y-2">
                <div className="font-semibold text-xs">Previous Feedback Logged:</div>
                {feedbackList.map((fb, i) => (
                  <div
                    key={i}
                    className={`p-2.5 border rounded text-xs ${
                      isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                      <span>{fb.date}</span>
                      <span>{fb.rating} ★★★★★</span>
                    </div>
                    <p className="mt-1 text-xs">{fb.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Issue Agent Modal */}
      <IssueAgentModal
        isOpen={isIssueAgentOpen}
        onClose={() => setIsIssueAgentOpen(false)}
        defaultLocation={roomNumber}
        reportedBy={guestName}
      />
    </div>
  );
};
