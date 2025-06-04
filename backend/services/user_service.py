from sqlalchemy.orm import Session
from .. import models  # from .. import schemas  # Removed broad import
from typing import List, Optional
from datetime import datetime, timedelta, timezone  # Import schema models directly
from ..schemas.user import (
    UserCreate,
    UserUpdate  # Added direct imports  # Import token generation library
)
from jose import JWTError, jwt  # Import service utilities
from .utils import service_transaction
from .exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError,
    AuthorizationError  # Import CRUD operations
)
from backend.crud.users import (
    create_user,
    get_user,
    get_user_by_username,
    get_users,
    update_user,
    delete_user,
    authenticate_user as crud_authenticate_user,
)
from backend.crud.user_validation import username_exists
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession

class UserService:
    def __init__(self, db: AsyncSession):  # Change to AsyncSession
        self.db = db

    async def get_user(self, user_id: str) -> models.User:  # Make async
        """
        Get a user by ID.

        Args:
            user_id: The user ID

        Returns:
            The user

        Raises:
            EntityNotFoundError: If the user is not found
        """
        user = await get_user(self.db, user_id)  # Await CRUD call
        if not user:
            raise EntityNotFoundError("User", user_id)
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

