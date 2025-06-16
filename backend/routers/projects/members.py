from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import logging

from backend import models
from backend import schemas
from backend.database import get_sync_db as get_db
from backend.services.project_member_service import ProjectMemberService
from backend.services.audit_log_service import AuditLogService
from backend.schemas.api_responses import DataResponse, ListResponse


router = APIRouter(
    prefix="/{project_id}/members",
    tags=["Project Members"],
)  # Dependency to get ProjectMemberService instance


def get_project_member_service(db: Session = Depends(get_db)) -> ProjectMemberService:
    return ProjectMemberService(db)  # Dependency for AuditLogService


def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.get("/", response_model=ListResponse[schemas.ProjectMember], summary="Get Project Members", operation_id="get_project_members")


async def get_project_members_endpoint(
    project_id: str,
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, gt=0, description="Max records to return"),
    project_member_service: ProjectMemberService = Depends(get_project_member_service)
):
    """Get all members of a project."""
    try:
        all_members = await project_member_service.get_project_members(project_id, skip=0, limit=None)
        members = await project_member_service.get_project_members(project_id, skip=skip, limit=limit)
        return ListResponse[schemas.ProjectMember](
            data=members,
            total=len(all_members),
            page=skip // limit + 1,
            page_size=limit,
            has_more=skip + len(members) < len(all_members),
            message=f"Retrieved {len(members)} project members"
        )
    except Exception as e:
        logging.error(f"Error in GET /projects/{project_id}/members: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=DataResponse[schemas.ProjectMember], summary="Add Project Member", operation_id="add_project_member")


async def add_project_member_endpoint(
    project_id: str,
    member_data: schemas.ProjectMemberCreate,
    project_member_service: ProjectMemberService = Depends(get_project_member_service),    # current_user: ...  # Removed for single-user mode,
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Add a member to a project."""
    try:  # Extract user_id and role from member_data
        user_id = member_data.user_id
        role = member_data.role

        if not user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required")

        member = await project_member_service.add_member_to_project(
            project_id=project_id, user_id=user_id, role=role
        )  # Log member addition
        await audit_log_service.create_log(
            action="add_project_member",
            user_id="00000000-0000-0000-0000-000000000000",  # Placeholder
            details={"project_id": project_id, "added_user_id": user_id, "role": role}
        )  # Return standardized response
        return DataResponse[schemas.ProjectMember](
            data=member,
            message="Project member added successfully"
        )
    except Exception as e:
        logging.error(f"Error in POST /projects/{project_id}/members: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")


@router.delete("/{user_id}", response_model=DataResponse[bool], summary="Remove Project Member", operation_id="remove_project_member")


async def remove_project_member_endpoint(
    project_id: str,
    user_id: str,
    project_member_service: ProjectMemberService = Depends(get_project_member_service),    # current_user: ...  # Removed for single-user mode,
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Remove a member from a project."""
    try:
        success = await project_member_service.remove_member_from_project(
            project_id=project_id, user_id=user_id
        )

        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project member not found")  # Log member removal
        await audit_log_service.create_log(
            action="remove_project_member",
            user_id="00000000-0000-0000-0000-000000000000",  # Placeholder
            details={"project_id": project_id, "removed_user_id": user_id}
        )  # Return standardized response
        return DataResponse[bool](
            data=True,
            message="Project member removed successfully"
        )
    except Exception as e:
        logging.error(f"Error in DELETE /projects/{project_id}/members/{user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")
