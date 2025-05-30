# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from starlette.responses import JSONResponse
import uuid

from ..database import get_db
from ..services.project_service import ProjectService
from ..services.task_service import TaskService
from ..services.agent_service import AgentService
from ..services.project_member_service import ProjectMemberService
from ..services.project_file_association_service import ProjectFileAssociationService
from ..services.task_file_association_service import TaskFileAssociationService
from ..services.task_dependency_service import TaskDependencyService
from .. import models
from . import tasks # Import tasks router

# Import specific schema classes from their files
from ..schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectFileAssociation, ProjectFileAssociationCreate # Correct import location

# Import standardized API response models
from ..schemas.api_responses import DataResponse, ListResponse, ErrorResponse, PaginationParams

# Import service exceptions
from ..services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError

# Import auth dependencies and UserRoleEnum
from ..auth import get_current_active_user, RoleChecker
from ..enums import UserRoleEnum
from ..models import User as UserModel # For type hinting current_user

# Import AuditLogService
from ..services.audit_log_service import AuditLogService

# Import Pydantic for bulk association schema
from pydantic import BaseModel

# Define schema for bulk file association input
class BulkFileAssociationInput(BaseModel):
 file_memory_entity_ids: List[int]

router = APIRouter(
 tags=["Projects"],
)

# Dependency to get ProjectService instance
def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
 return ProjectService(db)

# Dependency to get TaskService instance
def get_task_service(db: Session = Depends(get_db)) -> TaskService:
 return TaskService(db)

# Dependency to get AgentService instance
def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
 return AgentService(db)

# Dependency to get ProjectMemberService instance
def get_project_member_service(db: Session = Depends(get_db)) -> ProjectMemberService:
 return ProjectMemberService(db)

# Dependency to get TaskFileAssociationService instance
def get_task_file_association_service(db: Session = Depends(get_db)) -> TaskFileAssociationService:
 return TaskFileAssociationService(db)

# Dependency to get TaskDependencyService instance
def get_task_dependency_service(db: Session = Depends(get_db)) -> TaskDependencyService:
 return TaskDependencyService(db)

# Dependency to get ProjectFileAssociationService instance
def get_project_file_association_service(db: Session = Depends(get_db)) -> ProjectFileAssociationService:
 return ProjectFileAssociationService(db)

# Dependency for AuditLogService
def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
 return AuditLogService(db)


@router.post("/", response_model=DataResponse[Project], summary="Create Project", operation_id="create_project",
 dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN]))]) # Protect endpoint
async def create_project(
 project: ProjectCreate,
 project_service: ProjectService = Depends(get_project_service),
 current_user: UserModel = Depends(get_current_active_user), # Inject current user
 audit_log_service: AuditLogService = Depends(get_audit_log_service) # Inject AuditLogService
):
 """Creates a new project. Requires ADMIN role.

 Optionally uses a project template.

 - **name**: Unique name for the project (required).
 - **description**: Optional description.
 - **template_id**: Optional ID of a project template to use.
 """
 try:
 db_project = await project_service.create_project(project=project, created_by_user_id=current_user.id)
 
 # Convert the SQLAlchemy model to Pydantic schema immediately
 # This ensures all attributes are loaded while the object is still attached to the session
 project_data = Project.model_validate(db_project)
 
 # Extract the needed data for audit log
 project_id = project_data.id
 project_name = project_data.name
 
 # Log project creation
 print(f"DEBUG: audit_log_service object in router: {audit_log_service}") # Debug print
 await audit_log_service.create_log(
 action="create_project",
 user_id=current_user.id,
 details={"project_id": project_id, "project_name": project_name}
 )
 
 # Return standardized response with the Pydantic model
 return DataResponse[Project](
 data=project_data,
 message="Project created successfully"
 )
 except DuplicateEntityError as e:
 # Convert to FastAPI HTTPException
 raise HTTPException(status_code=409, detail=str(e))
 except ValidationError as e:
 # Convert to FastAPI HTTPException
 raise HTTPException(status_code=400, detail=str(e))
 except EntityNotFoundError as e:
 # This could happen if template_id is invalid
 raise HTTPException(status_code=404, detail=str(e))


@router.get("/", response_model=ListResponse[Project], summary="List Projects", operation_id="list_projects")
async def get_project_list(
 pagination: PaginationParams = Depends(),
 search: Optional[str] = None,
 status: Optional[str] = None,
 is_archived: Optional[bool] = Query(
 None, description="Filter by archived status. False for non-archived, True for archived, null/None for all."),
 project_service: ProjectService = Depends(get_project_service)
):
 """Retrieves a list of projects."""
 try:
 # Get all projects matching filters for total count
 all_matching_projects = await project_service.get_projects(
 skip=0, limit=None, # Fetch all for count
 search=search, status=status, is_archived=is_archived
 )
 total = len(all_matching_projects)
 
 # Get paginated projects
 projects = await project_service.get_projects(
 skip=pagination.offset, limit=pagination.page_size, # Use page_size for actual data
 search=search, status=status, is_archived=is_archived
 )

 # Convert SQLAlchemy models to Pydantic models
 pydantic_projects = [Project.model_validate(
 project) for project in projects]

 # Return standardized response
 return ListResponse[Project](
 data=pydantic_projects,
 total=total,
 page=pagination.page,
 page_size=pagination.page_size,
 has_more=pagination.offset + len(projects) < total,
 message=f"Retrieved {len(projects)} projects"
 )
 except Exception as e:
 # Log unexpected errors
 import logging
 logging.error(f"Error in get_project_list: {str(e)}")
 raise HTTPException(
 status_code=500,
 detail=f"Error retrieving projects: {str(e)}"
 )


@router.get("/{project_id}", response_model=DataResponse[Project], summary="Get Project by ID", operation_id="get_project_by_id")
async def get_project_by_id_endpoint(
 project_id: str,
 is_archived: Optional[bool] = Query(
 False, description="Set to true to fetch if archived, null/None to fetch regardless of status."),
 project_service: ProjectService = Depends(get_project_service)
):
 """Retrieves a specific project by its ID."""
 try:
 db_project = await project_service.get_project(
 project_id=project_id, is_archived=is_archived)
 
 # Return standardized response
 return DataResponse[Project](
 data=Project.model_validate(db_project),
 message=f"Project '{db_project.name}' retrieved successfully"
 )
 except EntityNotFoundError as e:
 # Status message based on filter
 status_search_message = ""
 if is_archived is True:
 status_search_message = " (archived)"
 elif is_archived is False:
 status_search_message = " (active)"
 
 raise HTTPException(
 status_code=404, 
 detail=f"Project not found{status_search_message}"
 )


@router.put("/{project_id}", response_model=DataResponse[Project], summary="Update Project", operation_id="update_project_by_id")
async def update_project(
 project_id: str,
 project_update: ProjectUpdate,
 project_service: ProjectService = Depends(get_project_service),
 current_user: UserModel = Depends(get_current_active_user),
 audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
 try:
 db_project = await project_service.update_project(
 project_id=project_id, project_update=project_update)
 
 # Log project update
 await audit_log_service.create_log(
 action="update_project",
 user_id=current_user.id,
 details={"project_id": project_id, "changes": project_update.model_dump(exclude_unset=True)}
 )
 
 # Return standardized response
 return DataResponse[Project](
 data=Project.model_validate(db_project),
 message="Project updated successfully"
 )
 except EntityNotFoundError as e:
 raise HTTPException(status_code=404, detail=str(e))
 except DuplicateEntityError as e:
 raise HTTPException(status_code=409, detail=str(e))
 except ValidationError as e:
 raise HTTPException(status_code=400, detail=str(e))
 except Exception as e:
 import logging
 logging.error(f"Unexpected error in PUT /projects/{project_id}: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{project_id}", response_model=DataResponse[Project], summary="Delete Project", operation_id="delete_project_by_id")
async def delete_project(
 project_id: str,
 project_service: ProjectService = Depends(get_project_service)
):
 db_project = await project_service.delete_project(project_id=project_id)
 if db_project is None:
 raise HTTPException(status_code=404, detail="Project not found")
 
 # Return standardized response
 return DataResponse[Project](
 data=Project.model_validate(db_project), # Return the deleted project data
 message="Project deleted successfully"
 )


@router.post("/{project_id}/archive", response_model=DataResponse[Project], summary="Archive Project", operation_id="archive_project")
async def archive_project(
 project_id: str,
 project_service: ProjectService = Depends(get_project_service),
 current_user: UserModel = Depends(get_current_active_user),
 audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
 """Archive a project by setting is_archived to True."""
 try:
 # Use the update_project method with is_archived=True
 project_update = ProjectUpdate(is_archived=True)
 db_project = await project_service.update_project(
 project_id=project_id, project_update=project_update)
 
 # Log project archive
 await audit_log_service.create_log(
 action="archive_project",
 user_id=current_user.id,
 details={"project_id": project_id}
 )
 
 # Return standardized response
 return DataResponse[Project](
 data=Project.model_validate(db_project),
 message="Project archived successfully"
 )
 except EntityNotFoundError as e:
 raise HTTPException(status_code=404, detail=str(e))
 except Exception as e:
 import logging
 logging.error(f"Unexpected error in POST /projects/{project_id}/archive: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{project_id}/unarchive", response_model=DataResponse[Project], summary="Unarchive Project", operation_id="unarchive_project")
async def unarchive_project(
 project_id: str,
 project_service: ProjectService = Depends(get_project_service),
 current_user: UserModel = Depends(get_current_active_user),
 audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
 """Unarchive a project by setting is_archived to False."""
 try:
 # Use the update_project method with is_archived=False
 project_update = ProjectUpdate(is_archived=False)
 db_project = await project_service.update_project(
 project_id=project_id, project_update=project_update)
 
 # Log project unarchive
 await audit_log_service.create_log(
 action="unarchive_project",
 user_id=current_user.id,
 details={"project_id": project_id}
 )
 
 # Return standardized response
 return DataResponse[Project](
 data=Project.model_validate(db_project),
 message="Project unarchived successfully"
 )
 except EntityNotFoundError as e:
 raise HTTPException(status_code=404, detail=str(e))
 except Exception as e:
 import logging
 logging.error(f"Unexpected error in POST /projects/{project_id}/unarchive: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


# --- Project Member Endpoints ---

@router.get("/{project_id}/members", response_model=ListResponse[models.ProjectMember], summary="Get Project Members", operation_id="get_project_members")
async def get_project_members_endpoint(
 project_id: str,
 project_member_service: ProjectMemberService = Depends(get_project_member_service)
):
 """Get all members of a project."""
 try:
 members = await project_member_service.get_project_members(project_id)
 
 # Return standardized response
 return ListResponse[models.ProjectMember](
 data=members,
 total=len(members),
 page=1,
 page_size=len(members),
 has_more=False,
 message=f"Retrieved {len(members)} project members"
 )
 except Exception as e:
 import logging
 logging.error(f"Error in GET /projects/{project_id}/members: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{project_id}/members", response_model=DataResponse[models.ProjectMember], summary="Add Project Member", operation_id="add_project_member")
async def add_project_member_endpoint(
 project_id: str,
 member_data: dict,
 project_member_service: ProjectMemberService = Depends(get_project_member_service),
 current_user: UserModel = Depends(get_current_active_user),
 audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
 """Add a member to a project."""
 try:
 # Extract user_id and role from member_data
 user_id = member_data.get("user_id")
 role = member_data.get("role", "member")
 
 if not user_id:
 raise HTTPException(status_code=400, detail="user_id is required")
 
 member = await project_member_service.add_member_to_project(
 project_id=project_id, user_id=user_id, role=role
 )
 
 # Log member addition
 await audit_log_service.create_log(
 action="add_project_member",
 user_id=current_user.id,
 details={"project_id": project_id, "added_user_id": user_id, "role": role}
 )
 
 # Return standardized response
 return DataResponse[models.ProjectMember](
 data=member,
 message="Project member added successfully"
 )
 except Exception as e:
 import logging
 logging.error(f"Error in POST /projects/{project_id}/members: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{project_id}/members/{user_id}", response_model=DataResponse[bool], summary="Remove Project Member", operation_id="remove_project_member")
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
 raise HTTPException(status_code=404, detail="Project member not found")
 
 # Log member removal
 await audit_log_service.create_log(
 action="remove_project_member",
 user_id=current_user.id,
 details={"project_id": project_id, "removed_user_id": user_id}
 )
 
 # Return standardized response
 return DataResponse[bool](
 data=True,
 message="Project member removed successfully"
 )
 except Exception as e:
 import logging
 logging.error(f"Error in DELETE /projects/{project_id}/members/{user_id}: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


# --- Project File Association Endpoints ---

@router.get("/{project_id}/files", response_model=ListResponse[models.ProjectFileAssociation], summary="Get Project Files", operation_id="get_project_files")
async def get_project_files_endpoint(
 project_id: str,
 project_file_service: ProjectFileAssociationService = Depends(get_project_file_association_service)
):
 """Get all files associated with a project."""
 try:
 files = await project_file_service.get_project_files(project_id)
 
 # Return standardized response
 return ListResponse[models.ProjectFileAssociation](
 data=files,
 total=len(files),
 page=1,
 page_size=len(files),
 has_more=False,
 message=f"Retrieved {len(files)} project files"
 )
 except Exception as e:
 import logging
 logging.error(f"Error in GET /projects/{project_id}/files: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{project_id}/files", response_model=DataResponse[models.ProjectFileAssociation], summary="Associate File with Project", operation_id="associate_project_file")
async def associate_project_file_endpoint(
 project_id: str,
 file_data: dict,
 project_file_service: ProjectFileAssociationService = Depends(get_project_file_association_service),
 current_user: UserModel = Depends(get_current_active_user),
 audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
 """Associate a file with a project."""
 try:
 # Extract file_id from file_data (frontend sends file_id, backend expects file_memory_entity_id)
 file_id = file_data.get("file_id")
 
 if not file_id:
 raise HTTPException(status_code=400, detail="file_id is required")
 
 # Convert file_id to file_memory_entity_id (assuming they're the same for now)
 file_memory_entity_id = int(file_id) if isinstance(file_id, str) and file_id.isdigit() else file_id
 
 file_association = await project_file_service.associate_file_with_project(
 project_id=project_id, file_memory_entity_id=file_memory_entity_id
 )
 
 # Log file association
 await audit_log_service.create_log(
 action="associate_project_file",
 user_id=current_user.id,
 details={"project_id": project_id, "file_memory_entity_id": file_memory_entity_id}
 )
 
 # Return standardized response
 return DataResponse[models.ProjectFileAssociation](
 data=file_association,
 message="File associated with project successfully"
 )
 except Exception as e:
 import logging
 logging.error(f"Error in POST /projects/{project_id}/files: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{project_id}/files/{file_id}", response_model=DataResponse[bool], summary="Disassociate File from Project", operation_id="disassociate_project_file")
async def disassociate_project_file_endpoint(
 project_id: str,
 file_id: str,
 project_file_service: ProjectFileAssociationService = Depends(get_project_file_association_service),
 current_user: UserModel = Depends(get_current_active_user),
 audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
 """Disassociate a file from a project."""
 try:
 # Convert file_id to file_memory_entity_id 
 file_memory_entity_id = int(file_id) if file_id.isdigit() else file_id
 
 success = await project_file_service.disassociate_file_from_project(
 project_id=project_id, file_memory_entity_id=file_memory_entity_id
 )
 
 if not success:
 raise HTTPException(status_code=404, detail="Project file association not found")
 
 # Log file disassociation
 await audit_log_service.create_log(
 action="disassociate_project_file",
 user_id=current_user.id,
 details={"project_id": project_id, "file_memory_entity_id": file_memory_entity_id}
 )
 
 # Return standardized response
 return DataResponse[bool](
 data=True,
 message="File disassociated from project successfully"
 )
 except Exception as e:
 import logging
 logging.error(f"Error in DELETE /projects/{project_id}/files/{file_id}: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")


# --- Planning and Agent Prompt Generation ---

@router.post("/generate-planning-prompt", response_model=DataResponse[dict], summary="Generate Planning Prompt", operation_id="generate_planning_prompt")
async def generate_planning_prompt_endpoint(
 request_data: dict,
 current_user: UserModel = Depends(get_current_active_user),
 audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
 """Generate a project manager planning prompt based on a goal."""
 try:
 goal = request_data.get("goal", "")
 
 if not goal:
 raise HTTPException(status_code=400, detail="Goal is required")
 
 # Generate a comprehensive planning prompt
 planning_prompt = f"""# Project Manager Planning Session

## Goal
{goal}

## Planning Framework

### 1. Goal Analysis
- Break down the goal into specific, measurable objectives
- Identify key success criteria and deliverables
- Define scope and constraints

### 2. Task Breakdown
- Identify major phases and milestones
- Break down phases into specific tasks
- Estimate effort and dependencies between tasks

### 3. Resource Planning
- Identify required skills and team members
- Determine necessary tools and technologies
- Plan for potential risks and mitigation strategies

### 4. Timeline and Milestones
- Create realistic timeline with buffer time
- Define key checkpoints and review gates
- Plan for iterative feedback and adjustments

### 5. Success Metrics
- Define quantifiable success indicators
- Plan monitoring and tracking mechanisms
- Establish regular review and adjustment cycles

## Next Steps
1. Review and refine this planning framework
2. Create detailed task breakdown structure
3. Assign responsibilities and timelines
4. Begin execution with regular monitoring

## Agent Coordination
Consider which specialized agents might be needed:
- Development agents for technical implementation
- Review agents for quality assurance
- Documentation agents for maintaining records
- Testing agents for validation

---
*Generated by Task Manager Planning Assistant*
"""
 
 # Log the planning request
 await audit_log_service.create_log(
 action="generate_planning_prompt",
 user_id=current_user.id,
 details={"goal": goal}
 )
 
 return DataResponse[dict](
 data={"prompt": planning_prompt},
 message="Planning prompt generated successfully"
 )
 
 except Exception as e:
 import logging
 logging.error(f"Error in POST /projects/generate-planning-prompt: {e}")
 raise HTTPException(
 status_code=500, detail=f"Internal server error: {str(e)}")
