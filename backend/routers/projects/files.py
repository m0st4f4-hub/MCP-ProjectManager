from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List

from backend import models
from backend import schemas
from backend.database import get_db
from backend.services.project_file_association_service import ProjectFileAssociationService
from backend.services.audit_log_service import AuditLogService
from backend.schemas.project import ProjectFileAssociation, ProjectFileAssociationCreate
from backend.schemas.api_responses import DataResponse, ListResponse

router = APIRouter(
    prefix="/{project_id}/files",
    tags=["Project Files"],
)

async def get_project_file_association_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> ProjectFileAssociationService:
    return ProjectFileAssociationService(db)

async def get_audit_log_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> AuditLogService:
    return AuditLogService(db)

@router.get(
    "/",
    response_model=ListResponse[ProjectFileAssociation],
    summary="Get Project Files",
    operation_id="get_project_files"
)
async def get_project_files(
    project_id: Annotated[str, Path(description="Project ID")],
    service: Annotated[ProjectFileAssociationService, Depends(get_project_file_association_service)],
    skip: Annotated[int, Query(ge=0, description="Number of files to skip")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Maximum number of files to return")] = 100
):
    """Get all files associated with a project."""
    try:
        files = await service.get_files_for_project(
            project_id=project_id,
            skip=skip,
            limit=limit
        )
        return ListResponse(
            data=files,
            total=len(files),
            message="Project files retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving project files: {str(e)}"
        )

@router.post(
    "/",
    response_model=DataResponse[ProjectFileAssociation],
    status_code=status.HTTP_201_CREATED,
    summary="Associate File with Project",
    operation_id="associate_file_with_project"
)
async def associate_file_with_project(
    project_id: Annotated[str, Path(description="Project ID")],
    association: ProjectFileAssociationCreate,
    service: Annotated[ProjectFileAssociationService, Depends(get_project_file_association_service)],
    audit_service: Annotated[AuditLogService, Depends(get_audit_log_service)]
):
    """Associate a file with a project."""
    try:
        # Ensure the association is for the correct project
        association.project_id = project_id
        
        new_association = await service.create_association(association)
        
        # Log the action
        await audit_service.log_action(
            user_id="00000000-0000-0000-0000-000000000000",  # Placeholder
            action="associate_file_with_project",
            resource_type="project_file_association",
            resource_id=str(new_association.id),
            details={"project_id": project_id, "file_id": association.file_memory_entity_id}
        )
        
        return DataResponse(
            data=new_association,
            message="File associated with project successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error associating file with project: {str(e)}"
        )

@router.delete(
    "/{association_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove File Association",
    operation_id="remove_project_file_association"
)
async def remove_file_association(
    project_id: Annotated[str, Path(description="Project ID")],
    association_id: Annotated[str, Path(description="Association ID")],
    service: Annotated[ProjectFileAssociationService, Depends(get_project_file_association_service)],
    audit_service: Annotated[AuditLogService, Depends(get_audit_log_service)]
):
    """Remove a file association from a project."""
    try:
        success = await service.delete_association(association_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File association not found"
            )
        
        # Log the action
        await audit_service.log_action(
            user_id="00000000-0000-0000-0000-000000000000",  # Placeholder
            action="remove_file_from_project",
            resource_type="project_file_association", 
            resource_id=association_id,
            details={"project_id": project_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing file association: {str(e)}"
        )
