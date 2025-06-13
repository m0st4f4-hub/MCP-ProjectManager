from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt

import models
from schemas.user import UserCreate, UserUpdate, UserLogin
from enums import UserRoleEnum
from .utils import service_transaction
from .exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError,
    AuthorizationError
)
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password."""
        return pwd_context.verify(plain_password, hashed_password)

    def _get_password_hash(self, password: str) -> str:
        """Generate password hash."""
        return pwd_context.hash(password)

    def _create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    async def get_user(self, user_id: str) -> models.User:
        """Get a user by ID."""
        query = select(models.User).options(
            selectinload(models.User.user_roles)
        ).where(
            and_(models.User.id == user_id, models.User.archived == False)
        )
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise EntityNotFoundError("User", user_id)
        return user

    async def get_users(
        self, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        role_filter: Optional[UserRoleEnum] = None,
        is_active: Optional[bool] = None,
        sort_by: Optional[str] = "created_at",
        sort_direction: Optional[str] = "desc"
    ) -> Tuple[List[models.User], int]:
        """Get all users with filtering and pagination."""
        # Base query
        query = select(models.User).options(
            selectinload(models.User.user_roles)
        )
        
        # Count query for total
        count_query = select(func.count(models.User.id))
        
        conditions = [models.User.archived == False]
        
        # Search in username, email, and full_name
        if search:
            search_condition = or_(
                models.User.username.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%"),
                models.User.full_name.ilike(f"%{search}%")
            )
            conditions.append(search_condition)
        
        # Filter by active status
        if is_active is not None:
            conditions.append(models.User.disabled == (not is_active))
        
        # Filter by role - this is complex due to the many-to-many relationship
        if role_filter is not None:
            # Join with UserRole table to filter by role
            query = query.join(models.UserRole).where(models.UserRole.role_name == role_filter)
            count_query = count_query.join(models.UserRole).where(models.UserRole.role_name == role_filter)
        
        # Apply all conditions
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        # Apply sorting
        sort_column = getattr(models.User, sort_by, models.User.created_at)
        if sort_direction.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute queries
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        count_result = await self.db.execute(count_query)
        total_count = count_result.scalar()
        
        return users, total_count

    async def get_user_by_username(self, username: str) -> models.User:
        """Get a user by username."""
        query = select(models.User).options(
            selectinload(models.User.user_roles)
        ).where(
            and_(models.User.username == username, models.User.archived == False)
        )
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise EntityNotFoundError("User", f"username={username}")
        return user

    @service_transaction
    async def create_user(self, user_create: UserCreate) -> models.User:
        """Create a new user."""
        # Check for duplicate username
        existing_user = await self.db.execute(
            select(models.User).where(models.User.username == user_create.username)
        )
        if existing_user.scalar_one_or_none():
            raise DuplicateEntityError("User", "username", user_create.username)

        # Check for duplicate email
        existing_email = await self.db.execute(
            select(models.User).where(models.User.email == user_create.email)
        )
        if existing_email.scalar_one_or_none():
            raise DuplicateEntityError("User", "email", user_create.email)

        hashed_password = self._get_password_hash(user_create.password)
        db_user = models.User(
            username=user_create.username,
            email=user_create.email,
            full_name=user_create.full_name,
            hashed_password=hashed_password,
            disabled=user_create.disabled,
            role=user_create.role
        )

        if user_create.roles:
            for role_name in user_create.roles:
                user_role = models.UserRole(user=db_user, role_name=role_name)
                db_user.user_roles.append(user_role)
        
        self.db.add(db_user)
        await self.db.flush()
        await self.db.refresh(db_user)
        return db_user

    @service_transaction
    async def update_user(self, user_id: str, user_update: UserUpdate) -> models.User:
        """Update a user."""
        db_user = await self.get_user(user_id)
        
        update_data = user_update.model_dump(exclude_unset=True)

        if "password" in update_data:
            db_user.hashed_password = self._get_password_hash(update_data["password"])
            del update_data["password"]

        for key, value in update_data.items():
            setattr(db_user, key, value)
            
        await self.db.flush()
        await self.db.refresh(db_user)
        return db_user

    @service_transaction
    async def delete_user(self, user_id: str):
        """Delete a user by archiving."""
        db_user = await self.get_user(user_id)
        db_user.archived = True
        db_user.disabled = True
        await self.db.flush()
        return {"message": "User archived successfully"}

    async def authenticate_user(self, username: str, password: str) -> Optional[models.User]:
        """Authenticate a user."""
        try:
            user = await self.get_user_by_username(username)
            if not user or not self._verify_password(password, user.hashed_password):
                return None
            if user.disabled:
                return None
            return user
        except EntityNotFoundError:
            return None

    async def login_user(self, login_data: UserLogin):
        """Handle user login and token generation."""
        user = await self.authenticate_user(login_data.username, login_data.password)
        if not user:
            raise AuthorizationError("Incorrect username or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self._create_access_token(
            data={"sub": user.username, "role": user.role.value},
            expires_delta=access_token_expires,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": int(access_token_expires.total_seconds()),
            "user": user,
        }

