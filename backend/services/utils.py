"""
Transaction utility for service layer operations.
This module provides a context manager for handling database transactions.
"""

from contextlib import contextmanager
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

@contextmanager
def service_transaction(db: Session, operation_name: str = "Operation"):
    """
    Context manager for handling service layer transactions.
    
    Args:
        db: The database session
        operation_name: Name of the operation for logging
        
    Yields:
        The database session
        
    Raises:
        Any exception that occurs during the transaction
    """
    try:
        logger.debug(f"Starting transaction: {operation_name}")
        yield db
        db.commit()
        logger.debug(f"Transaction committed: {operation_name}")
    except Exception as e:
        db.rollback()
        logger.error(f"Transaction rolled back: {operation_name}. Error: {str(e)}")
        raise
