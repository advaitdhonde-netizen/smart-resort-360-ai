from typing import List, Optional
from pydantic import BaseModel, EmailStr
from enum import Enum


class RoleEnum(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    OWNER = "OWNER"
    GENERAL_MANAGER = "GENERAL_MANAGER"
    FRONT_DESK = "FRONT_DESK"
    HOUSEKEEPING = "HOUSEKEEPING"
    MAINTENANCE = "MAINTENANCE"
    RESTAURANT_MANAGER = "RESTAURANT_MANAGER"
    INVENTORY_MANAGER = "INVENTORY_MANAGER"
    STAFF = "STAFF"
    CUSTOMER = "CUSTOMER"


class Permission(BaseModel):
    id: str
    code: str
    name: str
    description: str


class Role(BaseModel):
    id: str
    name: RoleEnum
    label: str
    description: str
    permissions: List[str]


class User(BaseModel):
    id: str
    email: str
    full_name: str
    role: RoleEnum
    is_active: bool = True
    created_at: str
    avatar_url: Optional[str] = None


class Guest(BaseModel):
    id: str
    user_id: str
    vip_tier: str
    assigned_room: str
    phone: str
    stay_count: int
    lifetime_spend: float
    dietary_preferences: str
    pillow_preferences: str
    room_temperature_target: float
    wine_preferences: str
    privacy_window: str


class Staff(BaseModel):
    id: str
    user_id: str
    department: str
    title: str
    shift: str
    attendance: str
    active_tasks: int
    performance_rating: float


class Room(BaseModel):
    id: str
    room_number: str
    name: str
    room_type: str
    status: str
    nightly_rate: float
    climate_target: float
    current_guest_id: Optional[str] = None
    inspection_status: str
    amenities: List[str]


class Reservation(BaseModel):
    id: str
    booking_ref: str
    guest_id: str
    guest_name: str
    room_number: str
    room_type: str
    check_in: str
    check_out: str
    nights: int
    status: str
    booking_source: str
    total_amount: float
    payment_status: str
    special_requests: Optional[str] = None


class ServiceRequest(BaseModel):
    id: str
    guest_id: str
    room_number: str
    service_type: str
    details: str
    priority: str
    status: str
    created_at: str


class Payment(BaseModel):
    id: str
    folio_ref: str
    guest_id: str
    amount: float
    currency: str = "USD"
    payment_method: str
    status: str
    created_at: str


class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str  # "FLIGHT" | "ORDER" | "SPA" | "SYSTEM"
    read: bool = False
    timestamp: str
