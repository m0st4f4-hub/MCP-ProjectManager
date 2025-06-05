from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List  # Import logging at the top of the file
import logging

from ... import models
from ... import schemas
from ...database import get_sync_db as get_db
from ...services.project_file_association_service import ProjectFileAssociationService
from ...services.audit_log_service import AuditLogService
from ...auth import get_current_active_user
from ...models import User as UserModel  # For type hinting current_user  # Import standardized API response models
from ...schemas.api_responses import (
    DataResponse,
    ListResponse  # Import Pydantic for bulk association schema
)
from pydantic import BaseModel


class BulkFileAssociationInput(BaseModel):
    file_memory_entity_ids: List[int]


router = APIRouter(
    prefix="/{project_id}/files",
    tags=["Project Files"],
)  # Dependency to get ProjectFileAssociationService instance


def get_project_file_association_service(db: Session = Depends(get_db)) -> ProjectFileAssociationService:
    return ProjectFileAssociationService(db)  # Dependency for AuditLogService


def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.get("/", response_model=ListResponse[schemas.ProjectFileAssociation], summary="Get Project Files", operation_id="get_project_files")


async def get_project_files_endpoint(
    project_id: str,
    project_file_service: ProjectFileAssociationService = Depends(get_project_file_association_service)
):
    """Get all files associated with a project."""
    try:
        files = await project_file_service.get_project_files(project_id)  # Return standardized response
        return ListResponse[schemas.ProjectFileAssociation](
            data=files,
            total=len(files),
            page=1,
            page_size=len(files),
            has_more=False,
            message=f"Retrieved {len(files)} project files"
        )
    except Exception as e:
        logging.error(f"Error in GET /projects/{project_id}/files: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=DataResponse[schemas.ProjectFileAssociation], summary="Associate File with Project", operation_id="associate_project_file")


async def associate_project_file_endpoint(
    project_id: str,
    file_data: dict,
    project_file_service: ProjectFileAssociationService = Depends(get_project_file_association_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Associate a file with a project."""
    try:  # Extract file_id from file_data (frontend sends file_id, backend expects file_memory_entity_id)
        file_id = file_data.get("file_id")

        if not file_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="file_id is required")  # Convert file_id to file_memory_entity_id (assuming they're the same for now)
        file_memory_entity_id = int(file_id) if isinstance(file_id, str) and file_id.isdigit() else file_id

        file_association = await project_file_service.associate_file_with_project(
            project_id=project_id, file_memory_entity_id=file_memory_entity_id
        )  # Log file association
        await audit_log_service.create_log(
            action="associate_project_file",
            user_id=current_user.id,
            details={"project_id": project_id, "file_memory_entity_id": file_memory_entity_id}
        )  # Return standardized response
        return DataResponse[schemas.ProjectFileAssociation](
            data=file_association,
            message="File associated with project successfully"
        )
    except Exception as e:
        logging.error(f"Error in POST /projects/{project_id}/files: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")


@router.delete("/{file_id}", response_model=DataResponse[bool], summary="Disassociate File from Project", operation_id="disassociate_project_file")


async def disassociate_project_file_endpoint(
    project_id: str,
    file_id: str,
    project_file_service: ProjectFileAssociationService = Depends(get_project_file_association_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Disassociate a file from a project."""
    try:  # Convert file_id to file_memory_entity_id
        file_memory_entity_id = int(file_id) if file_id.isdigit() else file_id

        success = await project_file_service.disassociate_file_from_project(
            project_id=project_id, file_memory_entity_id=file_memory_entity_id
        )

        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project file association not found")  # Log file disassociation
        await audit_log_service.create_log(
            action="disassociate_project_file",
            user_id=current_user.id,
            details={"project_id": project_id, "file_memory_entity_id": file_memory_entity_id}
        )  # Return standardized response
        return DataResponse[bool](
            data=True,
            message="File disassociated from project successfully"
        )
    except Exception as e:
        logging.error(f"Error in DELETE /projects/{project_id}/files/{file_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")
