from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List

from ....database import get_db
from ....crud import rules as crud_rules
from ....schemas.universal_mandate import (
    UniversalMandate,
    UniversalMandateCreate,
    UniversalMandateUpdate
)
from ....schemas.api_responses import DataResponse, ListResponse

router = APIRouter(
    prefix="/mandates",
    tags=["Universal Mandates"]
)

@router.get(
    "/", 
    response_model=ListResponse[UniversalMandate],
    summary="Get Universal Mandates",
    operation_id="get_universal_mandates"
)
async def get_mandates(
    active_only: Annotated[bool, Query(True, description="Filter for active mandates only")],
    skip: Annotated[int, Query(0, ge=0, description="Number of mandates to skip")],
    limit: Annotated[int, Query(100, ge=1, le=100, description="Maximum number of mandates to return")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get all universal mandates with optional filtering."""
    try:
        mandates = await crud_rules.get_universal_mandates(
            db, active_only=active_only, skip=skip, limit=limit
        )
        return ListResponse(
            data=mandates,
            total=len(mandates),
            message="Universal mandates retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving universal mandates: {str(e)}"
        )

@router.post(
    "/",
    response_model=DataResponse[UniversalMandate],
    status_code=status.HTTP_201_CREATED,
    summary="Create Universal Mandate",
    operation_id="create_universal_mandate"
)
async def create_mandate(
    mandate: UniversalMandateCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Create a new universal mandate."""
    try:
        new_mandate = await crud_rules.create_universal_mandate(db, mandate)
        return DataResponse(
            data=new_mandate,
            message="Universal mandate created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating universal mandate: {str(e)}"
        )

@router.get(
    "/{mandate_id}",
    response_model=DataResponse[UniversalMandate],
    summary="Get Universal Mandate",
    operation_id="get_universal_mandate"
)
async def get_mandate(
    mandate_id: Annotated[str, Path(description="Mandate ID")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get a specific universal mandate by ID."""
    try:
        mandate = await crud_rules.get_universal_mandate(db, mandate_id)
        if not mandate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Universal mandate not found"
            )
        return DataResponse(
            data=mandate,
            message="Universal mandate retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving universal mandate: {str(e)}"
        )

@router.put(
    "/{mandate_id}",
    response_model=DataResponse[UniversalMandate],
    summary="Update Universal Mandate",
    operation_id="update_universal_mandate"
)
async def update_mandate(
    mandate_id: Annotated[str, Path(description="Mandate ID")],
    mandate_update: UniversalMandateUpdate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Update an existing universal mandate."""
    try:
        updated_mandate = await crud_rules.update_universal_mandate(
            db, mandate_id, mandate_update
        )
        if not updated_mandate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Universal mandate not found"
            )
        return DataResponse(
            data=updated_mandate,
            message="Universal mandate updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating universal mandate: {str(e)}"
        )

@router.delete(
    "/{mandate_id}",
    response_model=DataResponse[bool],
    status_code=status.HTTP_200_OK,
    summary="Delete Universal Mandate",
    operation_id="delete_universal_mandate"
)
def delete_mandate(
    mandate_id: Annotated[str, Path(description="ID of the mandate to delete")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Delete a universal mandate.
    
    This action cannot be undone. The mandate will be permanently removed.
    """
    success = crud_rules.delete_universal_mandate(db, mandate_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mandate not found")
    return DataResponse[bool](data=True, message="Universal mandate deleted successfully")
