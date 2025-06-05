from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ....database import get_db
from ....crud import rules as crud_rules
from ....schemas import rules as schemas

router = APIRouter()


@router.get('/roles/{role_id}', response_model=List[schemas.ErrorProtocol])
async def get_error_protocols(role_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve all error protocols for a specific agent role."""
    role = await crud_rules.get_agent_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail='Agent role not found')
    return role.error_protocols


@router.post('/roles/{role_id}', response_model=schemas.ErrorProtocol)
async def create_error_protocol(
    role_id: str,
    error_protocol: schemas.ErrorProtocolCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new error protocol for the given role."""
    return await crud_rules.create_error_protocol(db, role_id, error_protocol)


@router.put('/{protocol_id}', response_model=schemas.ErrorProtocol)
async def update_error_protocol(
    protocol_id: str,
    protocol_update: schemas.ErrorProtocolUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing error protocol."""
    result = await crud_rules.update_error_protocol(db, protocol_id, protocol_update)
    if not result:
        raise HTTPException(status_code=404, detail='Error protocol not found')
    return result


@router.delete('/{protocol_id}')
async def delete_error_protocol(protocol_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an error protocol by ID."""
    success = await crud_rules.delete_error_protocol(db, protocol_id)
    if not success:
        raise HTTPException(status_code=404, detail='Error protocol not found')
    return {'detail': 'Error protocol deleted'}
