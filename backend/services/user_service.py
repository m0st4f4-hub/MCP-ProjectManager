from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user(self, user_id: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.username == username).first()

    def get_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:
        return self.db.query(models.User).offset(skip).limit(limit).all()

    def create_user(self, user: schemas.UserCreate) -> models.User:
        # In a real app, you'd hash the password here
        fake_hashed_password = user.password + "notreallyhashed"
        db_user = models.User(username=user.username,
                              hashed_password=fake_hashed_password)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update_user(self, user_id: str, user_update: schemas.UserUpdate) -> Optional[models.User]:
        db_user = self.get_user(user_id)
        if db_user:
            update_data = user_update.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_user, key, value)
            self.db.commit()
            self.db.refresh(db_user)
        return db_user

    def delete_user(self, user_id: str) -> Optional[models.User]:
        db_user = self.get_user(user_id)
        if db_user:
            self.db.delete(db_user)
            self.db.commit()
        return db_user
