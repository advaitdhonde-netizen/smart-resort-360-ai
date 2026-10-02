import hashlib
import hmac
import base64
import json
import secrets
import time
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET_KEY = "smart-resort-360-sovereign-enclave-secret-key"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 86400 * 7  # 7 days

security_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """
    Cryptographically secure password hashing using PBKDF2-HMAC-SHA256
    with 100,000 iterations and a unique cryptographic salt.
    Returns: salt$hash
    """
    if not salt:
        salt = secrets.token_hex(16)
    
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    hash_str = base64.b64encode(hash_bytes).decode('utf-8')
    return f"{salt}${hash_str}"


def verify_password(password: str, stored_hash: str) -> bool:
    """
    Constant-time comparison to prevent timing attacks.
    """
    try:
        salt, _ = stored_hash.split('$', 1)
        expected_hash = hash_password(password, salt)
        return hmac.compare_digest(expected_hash, stored_hash)
    except Exception:
        return False


def create_access_token(payload: Dict[str, Any]) -> str:
    """
    Generates a secure signed JSON Web Token (JWT) using HMAC-SHA256.
    """
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode('utf-8')).decode('utf-8').rstrip('=')
    
    full_payload = payload.copy()
    full_payload["exp"] = int(time.time()) + TOKEN_EXPIRY_SECONDS
    full_payload["iat"] = int(time.time())
    payload_b64 = base64.urlsafe_b64encode(json.dumps(full_payload).encode('utf-8')).decode('utf-8').rstrip('=')
    
    signing_input = f"{header_b64}.{payload_b64}"
    signature = hmac.new(
        JWT_SECRET_KEY.encode('utf-8'),
        signing_input.encode('utf-8'),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
    
    return f"{signing_input}.{sig_b64}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Validates token signature and expiration.
    """
    parts = token.split('.')
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Malformed cryptographic token structure")
    
    header_b64, payload_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}"
    
    expected_sig = hmac.new(
        JWT_SECRET_KEY.encode('utf-8'),
        signing_input.encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    # Pad base64 signature for decoding
    sig_padding = '=' * (-len(sig_b64) % 4)
    provided_sig = base64.urlsafe_b64decode(sig_b64 + sig_padding)
    
    if not hmac.compare_digest(expected_sig, provided_sig):
        raise HTTPException(status_code=401, detail="Invalid token cryptographic signature")
    
    # Decode payload
    payload_padding = '=' * (-len(payload_b64) % 4)
    payload_json = base64.urlsafe_b64decode(payload_b64 + payload_padding).decode('utf-8')
    payload = json.loads(payload_json)
    
    if payload.get("exp", 0) < time.time():
        raise HTTPException(status_code=401, detail="Token has expired. Please re-authenticate.")
    
    return payload


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication token required. Bearer header missing.")
    return decode_access_token(credentials.credentials)
