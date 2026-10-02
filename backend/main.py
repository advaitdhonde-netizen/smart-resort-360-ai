from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.models import RoleEnum
from backend.auth import (
    verify_password,
    create_access_token,
    get_current_user,
)
from backend.database import (
    USERS_DB,
    GUESTS_DB,
    ROOMS_DB,
    RESERVATIONS_DB,
    NOTIFICATIONS_DB,
    SERVICE_REQUESTS_DB,
    PAYMENTS_DB,
)

app = FastAPI(
    title="Smart Resort 360 API",
    description="Unified digital operating system backend for intelligent luxury resorts with role-based authorization",
    version="1.1.0",
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request & Response Models
class GuestCountResponse(BaseModel):
    total_guests: int
    vip_guests: int


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class ServiceRequestPayload(BaseModel):
    service_type: str
    details: str
    priority: str = "Normal"


class IssueReportPayload(BaseModel):
    category: str
    details: str
    urgency: str = "Medium"


class BookingPayload(BaseModel):
    category: str  # "DINING" | "WELLNESS" | "ACTIVITY"
    item_name: str
    schedule_time: str
    covers: int = 1
    notes: Optional[str] = None


class FeedbackPayload(BaseModel):
    rating: int
    category: str
    comment: str


# ============================================================================
# 1. PRESERVED EXISTING ENDPOINT
# ============================================================================
@app.get("/api/guests/count", response_model=GuestCountResponse)
async def get_guests_count():
    """
    Returns real-time count of total guests and VIP guests currently in-residence.
    """
    return {
        "total_guests": 42,
        "vip_guests": 12,
    }


# ============================================================================
# 2. AUTHENTICATION ENDPOINTS
# ============================================================================
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Authenticates user using secure hashed passwords.
    Returns signed HMAC-SHA256 JWT access token and user role profile.
    """
    user = next((u for u in USERS_DB if u["email"].lower() == credentials.email.lower()), None)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid cryptographic credentials. Please verify your email and passkey."
        )

    token_payload = {
        "sub": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
    }
    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
        }
    }


@app.get("/api/auth/me")
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns authenticated user's session profile.
    """
    return {"user": current_user}


# ============================================================================
# 3. CUSTOMER PORTAL PROTECTED ENDPOINTS (Strictly for Role = CUSTOMER)
# ============================================================================
@app.get("/api/customer/me")
async def get_customer_portal_data(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Customer portal unified data endpoint.
    Only accessible by authenticated CUSTOMER users.
    Returns guest stay details, digital key state, room telemetry, notifications, and bills.
    """
    if current_user["role"] != RoleEnum.CUSTOMER:
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Customer portal is reserved exclusively for resort residents."
        )

    guest = GUESTS_DB[0]
    room = ROOMS_DB[0]
    reservation = RESERVATIONS_DB[0]
    notifications = NOTIFICATIONS_DB
    service_requests = SERVICE_REQUESTS_DB
    bill = PAYMENTS_DB[0]

    recommendations = [
        {
            "id": "rec-1",
            "title": "Private Sunset Yacht Charter",
            "category": "Curated Excursion",
            "description": "Exclusive catamaran cruise through the outer archipelago with sommelier caviar service.",
            "duration": "2.5 Hours",
        },
        {
            "id": "rec-2",
            "title": "Subterranean Thermal Mineral Grotto",
            "category": "Vitality Ritual",
            "description": "Customized hydrotherapy immersion tailored for deep muscular recovery post-aviation.",
            "duration": "90 Minutes",
        },
        {
            "id": "rec-3",
            "title": "Chef’s Omakase & Rare Cellar Pairing",
            "category": "Gastronomy",
            "description": "Seven-course tasting experience featuring Miyazaki Wagyu A5 paired with premier grand crus.",
            "duration": "120 Minutes",
        },
    ]

    return {
        "guest": guest,
        "room": room,
        "reservation": reservation,
        "notifications": notifications,
        "service_requests": service_requests,
        "bill": bill,
        "recommendations": recommendations,
    }


@app.post("/api/customer/service-requests")
async def create_customer_service_request(
    payload: ServiceRequestPayload,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.CUSTOMER:
        raise HTTPException(status_code=403, detail="Customer privileges required.")
    
    new_req = {
        "id": f"req-{len(SERVICE_REQUESTS_DB) + 1}",
        "guest_id": "gst-harrington",
        "room_number": "Villa 12",
        "service_type": payload.service_type,
        "details": payload.details,
        "priority": payload.priority,
        "status": "In Progress",
        "created_at": "Just now",
    }
    SERVICE_REQUESTS_DB.insert(0, new_req)
    return {"status": "success", "request": new_req}


@app.post("/api/customer/report-issue")
async def report_customer_issue(
    payload: IssueReportPayload,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.CUSTOMER:
        raise HTTPException(status_code=403, detail="Customer privileges required.")

    return {
        "status": "received",
        "ticket_id": f"ISSUE-V12-{len(SERVICE_REQUESTS_DB) + 10}",
        "details": payload.details,
        "message": "Engineering specialist dispatched to verify with zero guest disturbance."
    }


@app.post("/api/customer/book-dining")
async def book_dining(
    payload: BookingPayload,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.CUSTOMER:
        raise HTTPException(status_code=403, detail="Customer privileges required.")

    return {
        "status": "confirmed",
        "confirmation_code": f"OBS-2026-{len(SERVICE_REQUESTS_DB) + 300}",
        "item_name": payload.item_name,
        "time": payload.schedule_time,
    }


# ============================================================================
# 4. STAFF PROTECTED ROUTE (Strictly for Staff / Management Roles)
# ============================================================================
@app.get("/api/staff/overview")
async def get_staff_overview(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Staff / Management overview endpoint.
    Strictly forbids CUSTOMER role!
    """
    if current_user["role"] == RoleEnum.CUSTOMER:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Guest accounts are strictly barred from internal management consoles and telemetry."
        )

    return {
        "status": "authorized",
        "user_role": current_user["role"],
        "active_turnarounds": 7,
        "active_maintenance": 3,
        "total_rooms": 18,
        "occupancy_rate": 84.6,
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Smart Resort 360 Unified Backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
