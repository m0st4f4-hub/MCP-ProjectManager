from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import logging
import redis
import json

from core.config import get_settings
from core.database import get_db
from models.user import User
from schemas.auth import TokenData

settings = get_settings()
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token security
security = HTTPBearer()

# Redis for token blacklisting and session management
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True
)

class EnhancedAuthService:
    """Enhanced authentication service with advanced security features."""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(
        self, 
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        # Store token metadata in Redis for session management
        self._store_token_metadata(encoded_jwt, data.get("sub"), "access", expire)
        
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create a JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        # Store token metadata
        self._store_token_metadata(encoded_jwt, data.get("sub"), "refresh", expire)
        
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify and decode a JWT token."""
        try:
            # Check if token is blacklisted
            if self._is_token_blacklisted(token):
                logger.warning(f"Attempted to use blacklisted token")
                return None
            
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            username = payload.get("sub")
            token_type = payload.get("type", "access")
            
            if username is None:
                return None
            
            # Verify token is still active in Redis
            if not self._is_token_active(token):
                logger.warning(f"Token not found in active sessions")
                return None
            
            token_data = TokenData(
                username=username,
                token_type=token_type,
                scopes=payload.get("scopes", []),
                user_id=payload.get("user_id")
            )
            
            return token_data
            
        except JWTError as e:
            logger.error(f"JWT verification failed: {str(e)}")
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """Create a new access token using a refresh token."""
        token_data = self.verify_token(refresh_token)
        
        if not token_data or token_data.token_type != "refresh":
            return None
        
        # Create new access token
        access_token_data = {
            "sub": token_data.username,
            "user_id": token_data.user_id,
            "scopes": token_data.scopes
        }
        
        return self.create_access_token(access_token_data)
    
    def blacklist_token(self, token: str):
        """Add a token to the blacklist."""
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                options={"verify_exp": False}  # Don't verify expiration for blacklisting
            )
            
            exp = payload.get("exp")
            if exp:
                # Calculate TTL for Redis (time until token would naturally expire)
                expire_time = datetime.fromtimestamp(exp)
                ttl = int((expire_time - datetime.utcnow()).total_seconds())
                
                if ttl > 0:
                    redis_client.setex(f"blacklist:{token}", ttl, "1")
                    logger.info(f"Token blacklisted for {ttl} seconds")
            
            # Remove from active sessions
            redis_client.delete(f"session:{token}")
            
        except JWTError:
            logger.error("Failed to blacklist invalid token")
    
    def logout_user(self, user_id: str):
        """Logout user by blacklisting all their active tokens."""
        # Get all active sessions for user
        pattern = f"session:*"
        for key in redis_client.scan_iter(match=pattern):
            session_data = redis_client.get(key)
            if session_data:
                try:
                    data = json.loads(session_data)
                    if data.get("user_id") == user_id:
                        token = key.replace("session:", "")
                        self.blacklist_token(token)
                except json.JSONDecodeError:
                    continue
        
        logger.info(f"Logged out all sessions for user {user_id}")
    
    def get_active_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all active sessions for a user."""
        sessions = []
        pattern = f"session:*"
        
        for key in redis_client.scan_iter(match=pattern):
            session_data = redis_client.get(key)
            if session_data:
                try:
                    data = json.loads(session_data)
                    if data.get("user_id") == user_id:
                        sessions.append({
                            "token_id": key.replace("session:", ""),
                            "created_at": data.get("created_at"),
                            "expires_at": data.get("expires_at"),
                            "token_type": data.get("token_type"),
                            "last_activity": data.get("last_activity")
                        })
                except json.JSONDecodeError:
                    continue
        
        return sessions
    
    def _store_token_metadata(
        self, 
        token: str, 
        user_id: str, 
        token_type: str, 
        expires_at: datetime
    ):
        """Store token metadata in Redis for session management."""
        session_data = {
            "user_id": user_id,
            "token_type": token_type,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        
        # Calculate TTL
        ttl = int((expires_at - datetime.utcnow()).total_seconds())
        
        if ttl > 0:
            redis_client.setex(
                f"session:{token}", 
                ttl, 
                json.dumps(session_data)
            )
    
    def _is_token_blacklisted(self, token: str) -> bool:
        """Check if a token is blacklisted."""
        return redis_client.exists(f"blacklist:{token}") > 0
    
    def _is_token_active(self, token: str) -> bool:
        """Check if a token is in active sessions."""
        session_data = redis_client.get(f"session:{token}")
        if session_data:
            # Update last activity
            try:
                data = json.loads(session_data)
                data["last_activity"] = datetime.utcnow().isoformat()
                
                # Get remaining TTL and update
                ttl = redis_client.ttl(f"session:{token}")
                if ttl > 0:
                    redis_client.setex(f"session:{token}", ttl, json.dumps(data))
                
                return True
            except json.JSONDecodeError:
                return False
        
        return False

# Global auth service instance
auth_service = EnhancedAuthService()

# Dependency functions
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token_data = auth_service.verify_token(credentials.credentials)
        if token_data is None:
            raise credentials_exception
        
        # Get user from database
        user = db.query(User).filter(
            User.username == token_data.username,
            User.is_active == True
        ).first()
        
        if user is None:
            raise credentials_exception
        
        return user
        
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise credentials_exception

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Get current admin user."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
