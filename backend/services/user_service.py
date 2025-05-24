from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

# Import CRUD operations
from backend.crud.users import (
    create_user,
    get_user,
    get_user_by_username,
    get_users,
    update_user,
    delete_user
)

# No longer need to import validation helpers in service
# from backend.crud.user_validation import some_validation_function

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user(self, user_id: str) -> Optional[models.User]:
        # Delegate to CRUD
        return get_user(self.db, user_id)

    def get_user_by_username(self, username: str) -> Optional[models.User]:
        # Delegate to CRUD
        return get_user_by_username(self.db, username)

    def get_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:
        """
        Retrieve all users with pagination. Delegate to CRUD.
        """
        return get_users(self.db, skip=skip, limit=limit)

    def create_user(self, user_create: schemas.UserCreate) -> models.User:
        # Service layer orchestrates data preparation and calls CRUD.
        # Validation for username existence, password strength, etc. would go here or in validation module.

        # Delegate to CRUD create function
        return create_user(self.db, user_create)

    def update_user(self, user_id: str, user_update: schemas.UserUpdate) -> Optional[models.User]:
        # Delegate to CRUD update function
        return update_user(self.db, user_id, user_update)

    def delete_user(self, user_id: str) -> Optional[models.User]:
        # Delegate to CRUD delete function
        return delete_user(self.db, user_id)
