from sqlalchemy.orm import Session
from .. import models
# from .. import schemas # Removed broad import
from typing import List, Optional
from datetime import datetime, timedelta

# Import schema models directly
from backend.schemas.user import UserCreate, UserUpdate # Added direct imports

# Import token generation library
from jose import JWTError, jwt

# Import service utilities
from backend.services.utils import service_transaction
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError, AuthorizationError

# Import CRUD operations
from backend.crud.users import (
    create_user,
    get_user,
    get_user_by_username,
    get_users,
    update_user,
    delete_user,
    authenticate_user as crud_authenticate_user,
    username_exists
)

# Import configuration settings
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user(self, user_id: str) -> models.User:
        """
        Get a user by ID.
        
        Args:
            user_id: The user ID
            
        Returns:
            The user
            
        Raises:
            EntityNotFoundError: If the user is not found
        """
        user = get_user(self.db, user_id)
        if not user:
            raise EntityNotFoundError("User", user_id)
        return user

    def get_user_by_username(self, username: str) -> Optional[models.User]:
        # Delegate to CRUD
        return get_user_by_username(self.db, username)

    def get_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:
        """
        Retrieve all users with pagination. Delegate to CRUD.
        """
        return get_users(self.db, skip=skip, limit=limit)

    def create_user(self, user_create: UserCreate) -> models.User:
        """
        Create a new user.
        
        Args:
            user_create: The user data
            
        Returns:
            The created user
            
        Raises:
            DuplicateEntityError: If the username already exists
            ValidationError: If the user data is invalid
        """
        # Check if username already exists at the service layer
        if username_exists(self.db, user_create.username):
            # Use the proper service exception
            raise DuplicateEntityError("User", user_create.username)
        
        # Use transaction context manager
        with service_transaction(self.db, "create_user") as tx_db:
            try:
                # Delegate to CRUD create function if username is unique
                return create_user(tx_db, user_create)
            except Exception as e:
                # Convert any exceptions to service exceptions
                if isinstance(e, (EntityNotFoundError, DuplicateEntityError, ValidationError)):
                    raise
                raise ValidationError(f"Error creating user: {str(e)}")

    def update_user(self, user_id: str, user_update: UserUpdate) -> Optional[models.User]:
        # Delegate to CRUD update function
        return update_user(self.db, user_id, user_update)

    def delete_user(self, user_id: str) -> Optional[models.User]:
        # Delegate to CRUD delete function
        return delete_user(self.db, user_id)

    def authenticate_user(self, username: str, password: str) -> models.User:
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
        user = crud_authenticate_user(self.db, username, password)
        if not user:
            raise AuthorizationError("Invalid username or password")
        return user

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            # Use expiry from config
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
