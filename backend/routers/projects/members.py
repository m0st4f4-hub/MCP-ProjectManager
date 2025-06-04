from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from ... import models
from ... import schemas
from ...database import get_sync_db as get_db
from ...services.project_member_service import ProjectMemberService
from ...services.audit_log_service import AuditLogService
from ...auth import get_current_active_user
from ...models import User as UserModel  # For type hinting current_user  # Import standardized API response models
from ...schemas.api_responses import DataResponse, ListResponse


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
    project_member_service: ProjectMemberService = Depends(get_project_member_service)
):
    """Get all members of a project."""
    try:
        members = await project_member_service.get_project_members(project_id)  # Return standardized response
        return ListResponse[schemas.ProjectMember](
            data=members,
            total=len(members),
            page=1,
            page_size=len(members),
            has_more=False,
            message=f"Retrieved {len(members)} project members"
        )
    except Exception as e:
        logging.error(f"Error in GET /projects/{project_id}/members: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=DataResponse[schemas.ProjectMember], summary="Add Project Member", operation_id="add_project_member")


async def add_project_member_endpoint(
    project_id: str,
    member_data: dict,
    project_member_service: ProjectMemberService = Depends(get_project_member_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Add a member to a project."""
    try:  # Extract user_id and role from member_data
        user_id = member_data.get("user_id")
        role = member_data.get("role", "member")

        if not user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required")

        member = await project_member_service.add_member_to_project(
            project_id=project_id, user_id=user_id, role=role
        )  # Log member addition
        await audit_log_service.create_log(
            action="add_project_member",
            user_id=current_user.id,
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
    project_member_service: ProjectMemberService = Depends(get_project_member_service),
    current_user: UserModel = Depends(get_current_active_user),
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
            user_id=current_user.id,
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
