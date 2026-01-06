from datetime import datetime,timezone, timedelta
from typing import Optional
from jwt import PyJWTError, decode, encode, ExpiredSignatureError
from pwdlib import PasswordHash
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dbAccess.user import get_user_by_username
from app.exceptions import AuthenticationError, AuthorizationError

# JWT Configuration
SECRET_KEY = "your-secret-key-here-change-in-production"  # In production, use environment variable
REFRESH_SECRET_KEY = "your-refresh-secret-key-here-change-in-production"  # Separate secret for refresh tokens
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Access token: 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Refresh token: 7 days

# Password hashing with Argon2
pwd_context = PasswordHash.recommended()

# Security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT refresh token with longer expiry"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_refresh_token(token: str) -> Optional[str]:
    """Verify refresh token and return username if valid"""
    try:
        payload = decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        token_type = payload.get("type")
        if token_type != "refresh":
            return None
        username: str = payload.get("sub")
        return username
    except ExpiredSignatureError:
        return None
    except PyJWTError:
        return None

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    """Dependency to get current authenticated user"""
    try:
        payload = decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise AuthenticationError(
                message="Invalid token: missing subject",
                details={"token_payload": payload}
            )
    except PyJWTError as e:
        raise AuthenticationError(
            message="Invalid or expired token",
            details={"jwt_error": str(e)}
        )

    user = await get_user_by_username(db, username)
    if user is None:
        raise AuthenticationError(
            message="User not found",
            details={"username": username}
        )

    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    """Dependency to get current active user"""
    if not current_user.is_active:
        raise AuthorizationError(
            message="User account is inactive",
            details={"user_id": current_user.id, "is_active": current_user.is_active}
        )
    return current_user