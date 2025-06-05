# Helper functions preserved for legacy CRUD tests
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend import models, schemas
from backend.models.base import ProjectMemberRole
from backend.crud import (
    agents as crud_agents,
    projects as crud_projects,
    tasks as crud_tasks,
    project_members as crud_project_members,
    project_file_associations as crud_project_file_associations,
    task_file_associations as crud_task_file_associations,
    task_dependencies as crud_task_dependencies,
    memory as memory_crud,
)


async def create_test_project(
    db: AsyncSession, name: str = "Test Project"
) -> models.Project:
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project"
    )
    return await crud_projects.create_project(db=db, project=project_schema)


async def create_test_agent(
    db: AsyncSession, name: str = "Test Agent"
) -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return await crud_agents.create_agent(db=db, agent=agent_schema)


async def create_test_task(
    db: AsyncSession,
    project_id: uuid.UUID,
    title: str = "Test Task",
    agent_id: int | None = None,
) -> models.Task:
    task_schema = schemas.TaskCreate(
        title=title,
        project_id=str(project_id),
        agent_id=agent_id,
    )
    return await crud_tasks.create_task(
        db=db,
        project_id=str(project_id),
        task=task_schema,
        agent_id=agent_id,
    )


async def create_test_project_member(
    db: AsyncSession,
    project_id: uuid.UUID,
    agent_id: int,
    role: ProjectMemberRole = ProjectMemberRole.MEMBER,
) -> models.ProjectMember:
    member_schema = schemas.ProjectMemberCreate(
        project_id=str(project_id),
        agent_id=agent_id,
        role=role,
    )
    return await crud_project_members.add_project_member(
        db=db, project_member=member_schema
    )


async def create_test_memory_entity(
    db: AsyncSession,
    name: str,
    entity_type: str,
    content: str,
) -> models.MemoryEntity:
    entity_schema = schemas.MemoryEntityCreate(
        name=name, entity_type=entity_type, content=content
    )
    return await memory_crud.create_memory_entity(db=db, entity=entity_schema)


async def create_test_project_file_association(
    db: AsyncSession,
    project_id: uuid.UUID,
    file_memory_entity_id: int,
) -> models.ProjectFileAssociation:
    association_schema = schemas.ProjectFileAssociationCreate(
        project_id=str(project_id),
        file_memory_entity_id=file_memory_entity_id,
    )
    return await (
        crud_project_file_associations.create_project_file_association(
            db=db, project_file=association_schema
        )
    )


async def create_test_task_file_association(
    db: AsyncSession,
    task_project_id: uuid.UUID,
    task_task_number: int,
    file_memory_entity_id: int,
) -> models.TaskFileAssociation:
    association_schema = schemas.TaskFileAssociationCreate(
        task_project_id=str(task_project_id),
        task_task_number=task_task_number,
        file_memory_entity_id=file_memory_entity_id,
    )
    return await crud_task_file_associations.create_task_file_association(
        db=db, task_file=association_schema
    )


async def create_test_task_dependency(
    db: AsyncSession,
    dependent_task_project_id: uuid.UUID,
    dependent_task_task_number: int,
    dependency_task_project_id: uuid.UUID,
    dependency_task_task_number: int,
) -> models.TaskDependency:
    dependency_schema = schemas.TaskDependencyCreate(
        predecessor_project_id=str(dependent_task_project_id),
        predecessor_task_number=dependent_task_task_number,
        successor_project_id=str(dependency_task_project_id),
        successor_task_number=dependency_task_task_number,
    )
    return await crud_task_dependencies.create_task_dependency(
        db=db, task_dependency=dependency_schema
    )
