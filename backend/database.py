from backend.auth import hash_password
from backend.models import RoleEnum

# In-memory database with pre-hashed cryptographic credentials
# Designed cleanly to map directly to PostgreSQL / Supabase schemas in future phases

USERS_DB = [
    {
        "id": "usr-admin",
        "email": "admin@smartresort360.com",
        "password_hash": hash_password("admin360!"),
        "full_name": "Marcus Sterling",
        "role": RoleEnum.SUPER_ADMIN,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "usr-owner",
        "email": "owner@smartresort360.com",
        "password_hash": hash_password("owner360!"),
        "full_name": "Maximilian von Bern",
        "role": RoleEnum.OWNER,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "usr-gm",
        "email": "gm@smartresort360.com",
        "password_hash": hash_password("gm360!"),
        "full_name": "Claire Delacroix",
        "role": RoleEnum.GENERAL_MANAGER,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "usr-frontdesk",
        "email": "frontdesk@smartresort360.com",
        "password_hash": hash_password("frontdesk360!"),
        "full_name": "Julian Thorne",
        "role": RoleEnum.FRONT_DESK,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "usr-housekeeping",
        "email": "housekeeping@smartresort360.com",
        "password_hash": hash_password("housekeeping360!"),
        "full_name": "Elena Santos",
        "role": RoleEnum.HOUSEKEEPING,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "usr-maintenance",
        "email": "maintenance@smartresort360.com",
        "password_hash": hash_password("maintenance360!"),
        "full_name": "Victor Hansen",
        "role": RoleEnum.MAINTENANCE,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "usr-guest",
        "email": "guest@smartresort360.com",
        "password_hash": hash_password("guest360!"),
        "full_name": "Lord Alexander Harrington",
        "role": RoleEnum.CUSTOMER,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
]

GUESTS_DB = [
    {
        "id": "gst-harrington",
        "user_id": "usr-guest",
        "vip_tier": "Tier 1 Titanium",
        "assigned_room": "Villa 12",
        "phone": "+44 20 7946 0912",
        "stay_count": 6,
        "lifetime_spend": 142000.0,
        "dietary_preferences": "Strict gluten-free, prefers wild Mediterranean sea bass, lactose-intolerant",
        "pillow_preferences": "Siberian goose down, firm contoured back support",
        "room_temperature_target": 21.5,
        "wine_preferences": "Château Margaux 2010, Krug Clos d’Ambonnay",
        "privacy_window": "13:00 - 16:30 strict undisturbed work window",
    }
]

ROOMS_DB = [
    {
        "id": "rm-v12",
        "room_number": "Villa 12",
        "name": "Overwater Sunset Sanctuary 12",
        "room_type": "Overwater Villa",
        "status": "Occupied",
        "nightly_rate": 2700.0,
        "climate_target": 21.5,
        "current_guest_id": "gst-harrington",
        "inspection_status": "Inspected & Certified",
        "amenities": [
            "Private Infinity Plunge Pool",
            "Cantilevered Sunset Deck",
            "Submerged Wine Grotto",
            "Bang & Olufsen Spatial Acoustic System",
            "Private Jet Tender Pier Access",
            "Dornbracht Sensory Shower",
        ],
    }
]

RESERVATIONS_DB = [
    {
        "id": "res-101",
        "booking_ref": "SR-2026-9041",
        "guest_id": "gst-harrington",
        "guest_name": "Lord Alexander Harrington",
        "room_number": "Villa 12",
        "room_type": "Overwater Villa",
        "check_in": "2026-09-26",
        "check_out": "2026-10-03",
        "nights": 7,
        "status": "Confirmed",
        "booking_source": "Amex Centurion",
        "total_amount": 18900.0,
        "payment_status": "Paid",
        "special_requests": "Arriving via private jet 14:10. Chilled Krug 2008 & gluten-free patisserie in villa.",
    }
]

NOTIFICATIONS_DB = [
    {
        "id": "notif-1",
        "user_id": "usr-guest",
        "title": "Private Jet Radar Confirmed",
        "message": "Flight G650 touched down at Regional Island Airfield. Electric catamaran tender is waiting at Jetty Alpha.",
        "type": "FLIGHT",
        "read": False,
        "timestamp": "14:12 PM",
    },
    {
        "id": "notif-2",
        "user_id": "usr-guest",
        "title": "In-Villa Dining Dispatched",
        "message": "Your vintage champagne selection and Beluga caviar service is departing the kitchen in hot-box transit.",
        "type": "ORDER",
        "read": True,
        "timestamp": "14:35 PM",
    },
    {
        "id": "notif-3",
        "user_id": "usr-guest",
        "title": "Spa Hydrotherapy Reserved",
        "message": "Private mineral grotto slot reserved tomorrow at 16:00 for Lord Harrington.",
        "type": "SPA",
        "read": True,
        "timestamp": "15:00 PM",
    },
]

SERVICE_REQUESTS_DB = [
    {
        "id": "req-1",
        "guest_id": "gst-harrington",
        "room_number": "Villa 12",
        "service_type": "YACHT_CHARTER",
        "details": "Private supercatamaran archipelago sunset charter tomorrow at 17:30",
        "priority": "High",
        "status": "In Progress",
        "created_at": "10:45 AM",
    },
    {
        "id": "req-2",
        "guest_id": "gst-harrington",
        "room_number": "Villa 12",
        "service_type": "OSTEOPATHY",
        "details": "Deep-tissue osteopathy session at Villa 12 private deck at 18:00",
        "priority": "Normal",
        "status": "Fulfilled",
        "created_at": "11:15 AM",
    },
]

PAYMENTS_DB = [
    {
        "id": "bil-01",
        "folio_ref": "FOL-2026-101",
        "guest_id": "gst-harrington",
        "amount": 25150.0,
        "currency": "USD",
        "payment_method": "Centurion Black ···· 9012 (Tokenized on file)",
        "status": "Open",
        "created_at": "2026-09-26",
    }
]
