from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

try:
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
except ImportError:
    from models import RoleEnum
    from auth import (
        verify_password,
        create_access_token,
        get_current_user,
    )
    from database import (
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


@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Smart Resort 360 Unified Backend", "currency": "INR (₹)"}


# ============================================================================
# 5. RESORT OPERATIONAL STATE & GEMINI COPILOT (FASTAPI SERVICE)
# ============================================================================
RESORT_DATA = {
    "occupancy": {
        "totalRooms": 24,
        "occupiedRooms": 19,
        "availableRooms": 3,
        "maintenanceRooms": 1,
        "cleaningRooms": 1,
        "occupancyRate": 79.2,
        "adr": 7250,
        "revpar": 5742,
    },
    "rooms": [
        {"number": "Room 101", "type": "Standard Room", "status": "Available", "rate": 4500, "floor": "Block A · Ground Floor"},
        {"number": "Room 102", "type": "Standard Room", "status": "Cleaning", "rate": 4500, "floor": "Block A · Ground Floor"},
        {"number": "Room 103", "type": "Standard Room", "status": "Occupied", "rate": 4500, "floor": "Block A · Ground Floor"},
        {"number": "Room 104", "type": "Standard Room", "status": "Available", "rate": 4500, "floor": "Block A · Ground Floor"},
        {"number": "Room 105", "type": "Standard Room", "status": "Occupied", "rate": 4500, "floor": "Block A · Level 1"},
        {"number": "Room 106", "type": "Standard Room", "status": "Occupied", "rate": 4500, "floor": "Block A · Level 1"},
        {"number": "Room 107", "type": "Standard Room", "status": "Available", "rate": 4500, "floor": "Block A · Level 1"},
        {"number": "Room 108", "type": "Standard Room", "status": "Available", "rate": 4500, "floor": "Block A · Level 1"},
        {"number": "Room 201", "type": "Deluxe Room", "status": "Reserved", "rate": 6500, "floor": "Block B · Level 1"},
        {"number": "Room 202", "type": "Deluxe Room", "status": "Occupied", "rate": 6500, "floor": "Block B · Level 1"},
        {"number": "Room 203", "type": "Deluxe Room", "status": "Available", "rate": 6500, "floor": "Block B · Level 1"},
        {"number": "Room 204", "type": "Deluxe Room", "status": "Maintenance", "rate": 6500, "floor": "Block B · Level 2", "notes": "AC cooling diagnostic ticket in progress (MNT-2026-101)."},
        {"number": "Room 205", "type": "Deluxe Room", "status": "Occupied", "rate": 6500, "floor": "Block B · Level 2"},
        {"number": "Room 206", "type": "Deluxe Room", "status": "Occupied", "rate": 6500, "floor": "Block B · Level 2"},
        {"number": "Room 207", "type": "Deluxe Room", "status": "Occupied", "rate": 6500, "floor": "Block B · Level 2"},
        {"number": "Room 208", "type": "Deluxe Room", "status": "Available", "rate": 6500, "floor": "Block B · Level 2"},
        {"number": "Room 301", "type": "Family Room", "status": "Occupied", "rate": 8000, "floor": "Block C · Level 1"},
        {"number": "Room 302", "type": "Family Room", "status": "Available", "rate": 8000, "floor": "Block C · Level 1"},
        {"number": "Room 303", "type": "Family Room", "status": "Reserved", "rate": 8000, "floor": "Block C · Level 2"},
        {"number": "Room 304", "type": "Family Room", "status": "Available", "rate": 8000, "floor": "Block C · Level 2"},
        {"number": "Villa 01", "type": "Premium Villa", "status": "Reserved", "rate": 15000, "floor": "Villa Enclave · West"},
        {"number": "Villa 02", "type": "Premium Villa", "status": "Occupied", "rate": 16500, "floor": "Villa Enclave · West"},
        {"number": "Villa 03", "type": "Premium Villa", "status": "Available", "rate": 15000, "floor": "Villa Enclave · West"},
        {"number": "Villa 04", "type": "Premium Villa", "status": "Cleaning", "rate": 18000, "floor": "Villa Enclave · West"},
    ],
    "reservationsToday": [
        {"ref": "RES-2026-801", "guest": "Aarav Sharma", "room": "Room 101", "checkIn": "2026-09-26", "checkOut": "2026-09-29", "status": "Checked In"},
        {"ref": "RES-2026-802", "guest": "Priya Mehta", "room": "Room 201", "checkIn": "2026-09-26", "checkOut": "2026-09-28", "status": "Checked In"},
        {"ref": "RES-2026-803", "guest": "Rohan Patil", "room": "Room 301", "checkIn": "2026-09-25", "checkOut": "2026-09-28", "status": "Checked In"},
        {"ref": "RES-2026-804", "guest": "Ananya Deshmukh", "room": "Villa 01", "checkIn": "2026-09-26", "checkOut": "2026-09-30", "status": "Confirmed"},
        {"ref": "RES-2026-805", "guest": "Rahul Kulkarni", "room": "Villa 02", "checkIn": "2026-09-27", "checkOut": "2026-09-30", "status": "Confirmed"},
    ],
    "housekeepingQueue": [
        {"room": "Room 202", "task": "Full Turnover Cleaning", "priority": "High", "status": "In Progress", "staff": "Sunita Devi"},
        {"room": "Room 104", "task": "Stayover Service & Linen", "priority": "Normal", "status": "Pending", "staff": "Kavita Rao"},
        {"room": "Villa 02", "task": "Pre-Arrival Inspection", "priority": "High", "status": "Pending", "staff": "Ramesh Pawar"},
        {"room": "Room 102", "task": "Turnover Cleaning", "priority": "Medium", "status": "Pending", "staff": "Sneha Kulkarni"},
        {"room": "Villa 04", "task": "Deep Sanitization", "priority": "High", "status": "Pending", "staff": "Rajesh Shinde"},
    ],
    "maintenanceTickets": [
        {"ticketId": "MNT-2026-101", "room": "Room 204", "category": "HVAC", "description": "Split AC indoor blower making mild rattling sound, low cooling", "priority": "High", "status": "In Progress", "assignedTo": "Suresh Verma"},
        {"ticketId": "MNT-2026-102", "room": "Room 302", "category": "Plumbing", "description": "Bathroom shower mixer knob stiff to turn", "priority": "Medium", "status": "Reported", "assignedTo": "Amit Joshi"},
        {"ticketId": "MNT-2026-103", "room": "Pool Plantroom", "category": "Equipment", "description": "Ozone recirculation filter backwash scheduled", "priority": "Low", "status": "Parts Sourced", "assignedTo": "Rajesh Nair"},
    ],
    "inventory": [
        {"item": "Dehradun Basmati Rice (25kg bag)", "category": "F&B Provisions", "current": 4, "min": 6, "unit": "bags", "status": "Low / Reorder"},
        {"item": "Coffee Beans - Arabica Estate (1kg)", "category": "Beverages", "current": 12, "min": 10, "unit": "kg", "status": "Adequate"},
        {"item": "Bath Towels - Premium White 650 GSM", "category": "Linen & Laundry", "current": 35, "min": 50, "unit": "pcs", "status": "Low / Reorder"},
    ],
    "diningTimings": {
        "breakfast": "7:00 AM – 10:30 AM",
        "lunch": "12:30 PM – 3:00 PM",
        "dinner": "7:30 PM – 10:30 PM",
        "restaurant": "Spice Valley Restaurant & Café",
    },
    "weather": {
        "temperature": 28,
        "condition": "Partly Cloudy",
        "humidity": 78,
        "windSpeed": 14,
        "rainfall": 0,
        "forecast": "Afternoon thunderstorms expected (15–25mm around 15:30). High rain probability 65%.",
    },
}

COPILOT_SYSTEM_INSTRUCTION = """You are Smart Resort 360 Copilot, an intelligent resort operations assistant.
You help resort management and staff understand the resort's current operational state, answer questions, analyze problems, reason about weather impacts, explain data, and recommend actions.
You can answer natural-language questions that were not explicitly programmed into the application.
Use the supplied resort context as the source of truth for actual resort data. Never invent operational facts.
If requested info is unavailable, say so clearly. Distinguish actual data from simulated predictions.
Resort Specialty: Sustainable coastal luxury, beachfront Garden Villas with private plunge pools, Ayurvedic wellness spa, authentic coastal and regional Indian culinary excellence at Spice Valley Restaurant, and intelligent 3D digital twin operational architecture."""


def _extract_safe_array(source: Any, priority_keys: List[str] = None) -> List[Any]:
    if isinstance(source, list):
        return source
    if isinstance(source, dict):
        if priority_keys:
            for k in priority_keys:
                if isinstance(source.get(k), list):
                    return source[k]
        for k in ["items", "tasks", "tickets", "rooms", "arrivalsToday", "records", "data", "list"]:
            if isinstance(source.get(k), list):
                return source[k]
    return []


def _format_context_for_prompt(ctx: Any) -> str:
    c = ctx if isinstance(ctx, dict) else RESORT_DATA
    rooms = _extract_safe_array(c.get("rooms"), ["rooms"]) or RESORT_DATA["rooms"]
    reservations = _extract_safe_array(c.get("reservations"), ["arrivalsToday", "reservations"]) or _extract_safe_array(c.get("reservationsToday")) or RESORT_DATA["reservationsToday"]
    housekeeping = _extract_safe_array(c.get("housekeeping"), ["tasks"]) or _extract_safe_array(c.get("housekeepingTasks")) or RESORT_DATA["housekeepingQueue"]
    maintenance = _extract_safe_array(c.get("maintenance"), ["tickets", "issues"]) or _extract_safe_array(c.get("maintenanceTickets")) or RESORT_DATA["maintenanceTickets"]
    inventory = _extract_safe_array(c.get("inventory"), ["items"]) or _extract_safe_array(c.get("inventoryItems")) or RESORT_DATA["inventory"]

    compact = {
        "resort": {
            "name": "Smart Resort 360",
            "currency": "INR (₹)",
            "totalUnits": 24,
            "specialty": "Sustainable coastal luxury, beachfront Garden Villas with private plunge pools, Ayurvedic wellness spa, authentic regional Indian dining at Spice Valley, and 3D digital twin operations.",
            "zones": [
                "Block A: Standard Rooms 101–108 (Ground & Level 1)",
                "Block B: Deluxe Rooms 201–208 (Level 1 & Level 2)",
                "Block C: Family Suites 301–304 (Level 1 & Level 2)",
                "Villa Enclave: Garden Villas 01–04 (West Plunge Pool Villas)",
            ],
        },
        "occupancy": c.get("occupancy", RESORT_DATA["occupancy"]),
        "rooms": rooms,
        "reservationsToday": reservations,
        "housekeepingQueue": housekeeping,
        "maintenanceTickets": maintenance,
        "inventory": inventory,
        "diningTimings": c.get("diningTimings", RESORT_DATA["diningTimings"]),
        "weather": c.get("weather", RESORT_DATA["weather"]),
        "simulation": c.get("simulation", {"active": False, "scenario": "Normal live conditions"}),
    }
    import json
    return json.dumps(compact, indent=2)


def _call_gemini_api(contents: List[Dict[str, Any]], system_instruction: str = None, response_mime_type: str = None, temperature: float = 0.2) -> Dict[str, str]:
    import os, json, urllib.request, urllib.error, time
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI Copilot is not configured. Add GEMINI_API_KEY to the server environment.")

    candidate_models = ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash"]
    last_err = None

    for model in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": contents,
            "generationConfig": {"temperature": temperature}
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        if response_mime_type:
            payload["generationConfig"]["responseMimeType"] = response_mime_type

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "aistudio-build"}
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text = "".join(p.get("text", "") for p in parts)
                    return {"text": text, "modelUsed": model}
        except urllib.error.HTTPError as e:
            last_err = e.read().decode("utf-8")
            time.sleep(0.6)
        except Exception as e:
            last_err = str(e)
            time.sleep(0.6)

    raise HTTPException(status_code=500, detail=f"Gemini API request failed: {last_err}")


def _determine_grounded_sources(query: str) -> List[str]:
    q = query.lower()
    sources = ["Smart Resort 360 Core OS"]
    if any(k in q for k in ["room", "villa", "occupan", "availab"]):
        sources.append("PMS Room Ledger")
    if any(k in q for k in ["housekeep", "clean", "linen", "turnaround"]):
        sources.append("Housekeeping Fleet Registry")
    if any(k in q for k in ["maint", "ac", "leak", "repair", "ticket"]):
        sources.append("Engineering BMS Telemetry")
    if any(k in q for k in ["stock", "inventory", "reorder", "par"]):
        sources.append("Inventory Par Ledger")
    if any(k in q for k in ["rain", "weather", "storm", "temp", "simulation", "80mm"]):
        sources.append("Weather Digital Twin Engine")
    return sources


@app.get("/api/resort-state")
async def get_resort_state():
    return RESORT_DATA


@app.post("/api/ai/copilot")
async def copilot_chat(request: Request):
    body = await request.json()
    query = body.get("query", "")
    messages = body.get("messages", [])
    user_role = body.get("userRole", "STAFF")
    resort_context = body.get("resortContext")

    if not query and not messages:
        raise HTTPException(status_code=400, detail="Query or messages parameter is required")

    formatted_context = _format_context_for_prompt(resort_context)
    system_instruction = f"{COPILOT_SYSTEM_INSTRUCTION}\n\nLIVE RESORT DATABASE CONTEXT:\n{formatted_context}"

    contents = []
    if messages:
        for m in messages:
            txt = m.get("content") or m.get("text") or ""
            if not txt.strip():
                continue
            role = "model" if m.get("role") in ["assistant", "model"] or m.get("sender") == "ai" else "user"
            contents.append({"role": role, "parts": [{"text": txt.strip()}]})

    cur_query = query or (messages[-1].get("content") if messages else "")
    if cur_query:
        if not contents or contents[-1].get("role") != "user" or contents[-1]["parts"][0]["text"] != cur_query.strip():
            contents.append({"role": "user", "parts": [{"text": cur_query.strip()}]})

    while contents and contents[0]["role"] != "user":
        contents.pop(0)

    result = _call_gemini_api(contents, system_instruction=system_instruction, temperature=0.2)
    sources = _determine_grounded_sources(cur_query)

    return {
        "answer": result["text"],
        "groundedSources": sources,
        "modelUsed": result["modelUsed"],
    }


@app.post("/api/ai/copilot/stream")
async def copilot_chat_stream(request: Request):
    from fastapi.responses import StreamingResponse
    import json
    body = await request.json()
    query = body.get("query", "")
    messages = body.get("messages", [])
    resort_context = body.get("resortContext")

    formatted_context = _format_context_for_prompt(resort_context)
    system_instruction = f"{COPILOT_SYSTEM_INSTRUCTION}\n\nLIVE RESORT DATABASE CONTEXT:\n{formatted_context}"

    cur_query = query or (messages[-1].get("content") if messages else "")
    contents = [{"role": "user", "parts": [{"text": cur_query}]}]

    result = _call_gemini_api(contents, system_instruction=system_instruction, temperature=0.2)
    sources = _determine_grounded_sources(cur_query)

    async def event_generator():
        chunk_text = result["text"]
        # Stream response chunks
        words = chunk_text.split(" ")
        for i in range(0, len(words), 5):
            c = " ".join(words[i:i+5]) + " "
            yield f"data: {json.dumps({'chunk': c})}\n\n"
        yield f"data: {json.dumps({'done': True, 'answer': chunk_text, 'groundedSources': sources, 'modelUsed': result['modelUsed']})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/ai/concierge")
async def guest_concierge(request: Request):
    body = await request.json()
    query = body.get("query", "")
    guest_name = body.get("guestName", "Guest")
    room_number = body.get("roomNumber", "Room 101")

    prompt = f"You are the AI Guest Concierge for Smart Resort 360 assisting {guest_name} in {room_number}. Answer warmly: {query}"
    res = _call_gemini_api([{"role": "user", "parts": [{"text": prompt}]}], temperature=0.3)
    return {"reply": res["text"]}


@app.post("/api/ai/issue-agent")
async def issue_agent(request: Request):
    body = await request.json()
    complaint = body.get("complaint", "")
    location = body.get("location", "Room 204")
    reported_by = body.get("reportedBy", "Staff")
    resort_context = body.get("resortContext")

    formatted_context = _format_context_for_prompt(resort_context)
    system_instruction = f"""You are Smart Resort 360 Issue Intelligence. Analyze the reported issue and return a valid JSON object matching:
{{
  "category": "HVAC" | "Electrical" | "Plumbing" | "Internet" | "Housekeeping" | "Room" | "Restaurant" | "Security" | "Guest Service" | "Equipment" | "Other",
  "affectedArea": "{location}",
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
  "technicianSummary": string
}}
Resort Context:
{formatted_context}"""

    res = _call_gemini_api(
        [{"role": "user", "parts": [{"text": f"Diagnose: {complaint} at {location}. Reported by: {reported_by}"}]}],
        system_instruction=system_instruction,
        response_mime_type="application/json",
        temperature=0.1
    )
    import json, time
    parsed = json.loads(res["text"])
    ticket = {
        "ticketId": f"TKT-{str(int(time.time()))[-6:]}",
        **parsed,
        "status": "DISPATCHED",
        "reportedAt": "Today",
        "originalComplaint": complaint,
    }
    return {"ticket": ticket}


@app.get("/api/ai/operations-briefing")
async def operations_briefing():
    return {
        "briefing": {
            "timestamp": "Today 14:30 PM",
            "occupancy": "79.2% (19/24 Units Occupied)",
            "arrivalsSummary": "1 arrival remaining today (Rahul Kulkarni, Villa 02 at 16:00).",
            "departuresSummary": "2 departures processed with zero billing disputes.",
            "housekeepingBacklog": "1 checkout turnaround in progress (Room 202), 1 stayover pending (Room 104).",
            "criticalMaintenance": "1 high-priority ticket on Room 204 Split AC cooling. Technician Suresh Verma on site.",
            "inventoryRisks": "Basmati Rice (4 bags) and Premium Bath Towels (35 pcs) below par.",
            "restaurantLoad": "86 covers reserved for dinner at Spice Valley Restaurant.",
            "anomaliesDetected": [
                "Room 204 AC reported low cooling twice this week; coil cleaning recommended."
            ],
            "aiRecommendation": "Approve replenishment PO for Basmati Rice and towels; complete Room 202 turnaround by 13:30."
        }
    }


@app.post("/api/ai/execute-action")
async def execute_action(request: Request):
    body = await request.json()
    action_type = body.get("actionType")
    user_confirmed = body.get("userConfirmed", False)
    if not user_confirmed:
        raise HTTPException(status_code=400, detail="Action requires human confirmation")
    import time
    return {
        "status": "EXECUTED_SUCCESSFULLY",
        "actionType": action_type,
        "confirmedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "auditReceipt": f"AUD-ACT-{str(int(time.time()))[-6:]}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

