from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt

from backend import models
from backend.schemas.user import UserCreate, UserUpdate, UserLogin
from backend.enums import UserRoleEnum
from .utils import service_transaction
from .exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError,
    AuthorizationError
)
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

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

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:
        """Get all users with pagination."""
        query = select(models.User).options(
            selectinload(models.User.user_roles)
        ).where(models.User.archived == False).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

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


        return user
        return user

    async def get_user_by_username(self, username: str) -> Optional[models.User]:  # Make async  # Delegate to CRUD
        return await get_user_by_username(self.db, username)  # Await CRUD call

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:  # Make async
        """
        Retrieve all users with pagination. Delegate to CRUD.
        """
        return await get_users(self.db, skip=skip, limit=limit)  # Await CRUD call

    async def create_user(self, user_create: UserCreate) -> models.User:  # Make async
        """
        Create a new user.

        Args:
            user_create: The user data

        Returns:
            The created user

        Raises:
            DuplicateEntityError: If the username already exists
            ValidationError: If the user data is invalid
        """  # Check if username already exists at the service layer
        if await username_exists(self.db, user_create.username):  # Await username_exists  # Use the proper service exception
            raise DuplicateEntityError("User", user_create.username)  # Use transaction context manager  # Need to check if service_transaction works with AsyncSession or needs an async version  # For now, assuming it might need adjustment, will read utils next.  # Keeping the structure for now, but it might change.  # with service_transaction(self.db, "create_user") as tx_db:  # This might need adjustment for async
        try:  # Delegate to CRUD create function if username is unique  # Since CRUD functions now handle their own commits/rollbacks, no need for service_transaction here
            return await create_user(self.db, user_create)  # Await CRUD call, use self.db directly
        except Exception as e:  # Convert any exceptions to service exceptions
            if isinstance(e, (EntityNotFoundError, DuplicateEntityError, ValidationError)):
                raise
            raise ValidationError(f"Error creating user: {str(e)}")

    async def update_user(self, user_id: str, user_update: UserUpdate) -> Optional[models.User]:  # Make async  # Delegate to CRUD update function
        return await update_user(self.db, user_id, user_update)  # Await CRUD call

    async def delete_user(self, user_id: str) -> Optional[models.User]:  # Make async  # Delegate to CRUD delete function
        return await delete_user(self.db, user_id)  # Await CRUD call

    async def authenticate_user(self, username: str, password: str) -> models.User:  # Make async
        """
        Authenticate a user by username and password.

        Args:
            username: The username
            password: The password

        Returns:
            The authenticated user

        Raises:
            AuthorizationError: If authentication fails
        """
        user = await crud_authenticate_user(self.db, username, password)  # Await CRUD call
        if not user:
            raise AuthorizationError("Invalid username or password")
        return user

