# Task ID: 211
# Agent Role: DebuggingSpecialist
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:45:00Z

"""
CRUD operations for project file associations.
This file handles database operations for task dependencies.
"""

# from sqlalchemy.orm import Session # Removed synchronous Session import
from sqlalchemy import and_
from typing import List, Optional
from ..models import ProjectFileAssociation
# from ..schemas import ProjectFileAssociationCreate, MemoryEntityCreate, MemoryRelationCreate # Removed package import
# from backend.schemas.project_file_association import ProjectFileAssociationCreate # Incorrect import
from backend.schemas.project import ProjectFileAssociationCreate # Correct import location
from backend.schemas.memory import MemoryEntityCreate, MemoryRelationCreate

# Import necessary for async
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
from sqlalchemy import select, delete # Import select and delete for async
import logging

logger = logging.getLogger(__name__)

# Import memory_crud
from backend.crud import memory as memory_crud

# Import async utility functions
from .utils.file_association_utils import (
 file_entity_exists,
 project_entity_exists,
 association_exists,
 get_association # Now async
)
# Import projects crud for project existence check if needed (ensure it's async)
from . import projects as projects_crud # Assuming projects_crud is async


async def get_project_file_association(db: AsyncSession, project_id: str, file_memory_entity_id: int) -> Optional[ProjectFileAssociation]:
 """Get a specific project file association by project ID and file memory entity ID."""
 logger.debug(f"[DEBUG] get_project_file_association called with project_id: {project_id}, file_memory_entity_id: {file_memory_entity_id}") # Debug print
 # Await the async utility function
 association = await get_association(db, project_id, file_memory_entity_id)
 logger.debug(f"[DEBUG] get_project_file_association returned: {association}") # Debug print
 return association


async def get_project_files(db: AsyncSession, project_id: str, skip: int = 0, limit: int = 100) -> List[ProjectFileAssociation]:
 """Get all files associated with a project."""
 logger.debug(f"[DEBUG] get_project_files called with project_id: {project_id}, skip: {skip}, limit: {limit}") # Debug print
 result = await db.execute(
 select(ProjectFileAssociation).filter(
 ProjectFileAssociation.project_id == project_id
 ).offset(skip).limit(limit)
 )
 files = result.scalars().all()
 logger.debug(f"[DEBUG] get_project_files returned {len(files)} files") # Debug print
 return files


async def create_project_file_association(db: AsyncSession, project_file: ProjectFileAssociationCreate) -> ProjectFileAssociation:
 """Associate a file with a project using file_memory_entity_id."""
 logger.debug(f"[DEBUG] create_project_file_association called with project_file: {project_file.model_dump_json()}") # Debug print

 # Validation using helpers (Await async helpers)
 # REMOVED: file_exists check using memory_crud
 # file_exists = await file_entity_exists(db, project_file.file_memory_entity_id)
 # logger.debug(f"[DEBUG] create_project_file_association - file_entity_exists: {file_exists}") # Debug print
 # if not file_exists:
 # raise ValueError(f"MemoryEntity with ID {project_file.file_memory_entity_id} not found.")

 # Check if project exists (Await async projects_crud function)
 project_exists_check = await projects_crud.get_project(db, project_file.project_id)
 logger.debug(f"[DEBUG] create_project_file_association - project_exists_check: {project_exists_check is not None}") # Debug print
 if not project_exists_check:
 raise ValueError(f"Project with ID {project_file.project_id} not found.")

 # Association existence check (optional, could raise or skip creation) (Await async helper)
 association_already_exists = await association_exists(db, project_file.project_id, project_file.file_memory_entity_id)
 logger.debug(f"[DEBUG] create_project_file_association - association_exists: {association_already_exists}") # Debug print

 if association_already_exists:
 # Await the async get function
 existing_assoc = await get_project_file_association(db, project_file.project_id, project_file.file_memory_entity_id)
 logger.debug(f"[DEBUG] create_project_file_association - returning existing association: {existing_assoc}") # Debug print
 return existing_assoc

 # REMOVED: Fetch MemoryEntity for the file using the provided ID
 # file_memory_entity = await memory_crud.get_memory_entity(db, entity_id=project_file.file_memory_entity_id)
 # logger.debug(f"[DEBUG] create_project_file_association - fetched file_memory_entity: {file_memory_entity}") # Debug print
 # if not file_memory_entity:
 # # This should ideally not happen if file_entity_exists passed, but double-check
 # raise ValueError(f"MemoryEntity with ID {project_file.file_memory_entity_id} not found after existence check.")

 # REMOVED: Handle the project MemoryEntity and relation creation as before.
 # project_entity_name = f"project_{project_file.project_id}"
 # REMOVED: Await async memory_crud function
 # project_memory_entity = await memory_crud.get_entity_by_name(db, name=project_entity_name)
 # logger.debug(f"[DEBUG] create_project_file_association - fetched project_memory_entity: {project_memory_entity}") # Debug print

 # if not project_memory_entity:
 # # This part can remain as it creates a project entity if it doesn't exist.
 # basic_project_entity_data = MemoryEntityCreate(
 # type="project",
 # name=project_entity_name,
 # description=f"Project with ID {project_file.project_id}",
 # metadata_={
 # "project_id": project_file.project_id
 # },
 # entity_type="project"
 # )
 # logger.debug(f"[DEBUG] create_project_file_association - creating project memory entity: {basic_project_entity_data.model_dump_json()}") # Debug print
 # # Await async memory_crud function
 # project_memory_entity = await memory_crud.create_memory_entity(db=db, entity=basic_project_entity_data)
 # logger.debug(f"[DEBUG] create_project_file_association - created project memory entity: {project_memory_entity}") # Debug print

 # REMOVED: Create MemoryRelation if both entities exist
 # if file_memory_entity and project_memory_entity:
 # relation_data = MemoryRelationCreate(
 # from_entity_id=file_memory_entity.id, # Use the fetched file_memory_entity's ID
 # to_entity_id=project_memory_entity.id,
 # relation_type="associated_with",
 # metadata_={
 # "association_type": "project_file"
 # }
 # )
 # logger.debug(f"[DEBUG] create_project_file_association - checking existing relations for: from={file_memory_entity.id}, to={project_memory_entity.id}, type=associated_with") # Debug print
 # # Await async memory_crud function
 # existing_relations = await memory_crud.get_memory_relations_between_entities(
 # db,
 # from_entity_id=file_memory_entity.id,
 # to_entity_id=project_memory_entity.id,
 # relation_type="associated_with"
 # )
 # logger.debug(f"[DEBUG] create_project_file_association - existing_relations: {existing_relations}") # Debug print

 # if not existing_relations:
 # logger.debug(f"[DEBUG] create_project_file_association - creating memory relation: {relation_data.model_dump_json()}") # Debug print
 # # Await async memory_crud function
 # await memory_crud.create_memory_relation(db=db, relation=relation_data)
 # logger.debug("[DEBUG] create_project_file_association - created memory relation") # Debug print
 # else:
 # logger.debug("[DEBUG] create_project_file_association - memory relation already exists") # Debug print

 # Create the ProjectFileAssociation in the main database
 logger.debug(f"[DEBUG] create_project_file_association - creating ProjectFileAssociation in main DB for project_id: {project_file.project_id}, file_memory_entity_id: {project_file.file_memory_entity_id}") # Debug print
 db_project_file = ProjectFileAssociation(
 project_id=project_file.project_id,
 # Use the file_memory_entity_id from the input schema
 file_memory_entity_id=project_file.file_memory_entity_id
 )
 db.add(db_project_file)
 await db.commit() # Await commit
 await db.refresh(db_project_file) # Await refresh
 logger.debug(f"[DEBUG] create_project_file_association - created ProjectFileAssociation: {db_project_file}") # Debug print
 return db_project_file

async def delete_project_file_association(db: AsyncSession, project_id: str, file_memory_entity_id: int) -> bool:
 """Remove a file association from a project by project ID and file memory entity ID."""
 logger.debug(f"[DEBUG] delete_project_file_association called with project_id: {project_id}, file_memory_entity_id: {file_memory_entity_id}") # Debug print

 # REMOVED: Find the file memory entity by ID
 # file_memory_entity = await memory_crud.get_memory_entity(db, entity_id=file_memory_entity_id)
 # logger.debug(f"[DEBUG] delete_project_file_association - fetched file_memory_entity: {file_memory_entity}") # Debug print
 # Allow deleting the association even if the memory entity is not found (database might be out of sync)

 project_entity_name = f"project_{project_id}"
 # REMOVED: Await async memory_crud function
 # project_memory_entity = await memory_crud.get_entity_by_name(db, name=project_entity_name)
 # logger.debug(f"[DEBUG] delete_project_file_association - fetched project_memory_entity: {project_memory_entity}") # Debug print
 
 # REMOVED: Delete the MemoryRelation between the file and project entities
 # if file_memory_entity and project_memory_entity:
 # logger.debug(f"[DEBUG] delete_project_file_association - checking relations to delete for: from={file_memory_entity_id}, to={project_memory_entity.id}, type=associated_with") # Debug print
 # # Await async memory_crud function
 # relations_to_delete = await memory_crud.get_memory_relations_between_entities(
 # db,
 # from_entity_id=file_memory_entity_id, # Use the ID
 # to_entity_id=project_memory_entity.id,
 # relation_type="associated_with"
 # )
 # logger.debug(f"[DEBUG] delete_project_file_association - relations_to_delete: {relations_to_delete}") # Debug print
 # for relation in relations_to_delete:
 # logger.debug(f"[DEBUG] delete_project_file_association - deleting memory relation with id: {relation.id}") # Debug print
 # # Await async memory_crud function
 # await memory_crud.delete_memory_relation(db, relation_id=relation.id)
 # logger.debug("[DEBUG] delete_project_file_association - deleted memory relation") # Debug print

 # Get and delete the project file association in the main database (Await async get function)
 logger.debug(f"[DEBUG] delete_project_file_association - getting ProjectFileAssociation for project_id: {project_id}, file_memory_entity_id: {file_memory_entity_id}") # Debug print
 db_project_file = await get_project_file_association(
 db, project_id=project_id, file_memory_entity_id=file_memory_entity_id)
 logger.debug(f"[DEBUG] delete_project_file_association - fetched ProjectFileAssociation: {db_project_file}") # Debug print

 if db_project_file:
 logger.debug("[DEBUG] delete_project_file_association - deleting ProjectFileAssociation") # Debug print
 await db.delete(db_project_file) # Await delete
 await db.commit() # Await commit
 logger.debug("[DEBUG] delete_project_file_association - deleted ProjectFileAssociation") # Debug print
 return True
 logger.debug("[DEBUG] delete_project_file_association - ProjectFileAssociation not found") # Debug print
 return False


async def associate_file_with_project(db: AsyncSession, project_id: str, file_memory_entity_id: int) -> ProjectFileAssociation:
 """Associate a file with a project using file_memory_entity_id."""
 logger.debug(f"[DEBUG] associate_file_with_project called with project_id: {project_id}, file_memory_entity_id: {file_memory_entity_id}") # Debug print

 # Ensure MemoryEntity for the file exists. (Await async memory_crud function)
 file_memory_entity = await memory_crud.get_memory_entity(db, entity_id=file_memory_entity_id)
 logger.debug(f"[DEBUG] associate_file_with_project - fetched file_memory_entity: {file_memory_entity}") # Debug print
 if not file_memory_entity:
 raise ValueError(f"MemoryEntity with ID {file_memory_entity_id} not found.")

 # Create the schema using the provided file_memory_entity_id
 project_file = ProjectFileAssociationCreate(
 project_id=project_id,
 file_memory_entity_id=file_memory_entity_id # Use file_memory_entity_id
 )
 logger.debug(f"[DEBUG] associate_file_with_project - created schema: {project_file.model_dump_json()}") # Debug print
 # Await the async create function
 created_association = await create_project_file_association(db, project_file)
 logger.debug(f"[DEBUG] associate_file_with_project - created_association: {created_association}") # Debug print
 return created_association

# async def get_files_for_project is already converted

async def disassociate_file_from_project(
 db: AsyncSession,
 project_id: str,
 file_memory_entity_id: int # This function signature expects the integer ID
) -> bool:
 """Remove a file association from a project by project ID and file memory entity ID."""
 logger.debug(f"[DEBUG] disassociate_file_from_project called with project_id: {project_id}, file_memory_entity_id: {file_memory_entity_id}") # Debug print

 # Find the file memory entity by ID to get its name for memory relation deletion (Await async memory_crud function)
 file_memory_entity = await memory_crud.get_memory_entity(db, entity_id=file_memory_entity_id)
 logger.debug(f"[DEBUG] disassociate_file_from_project - fetched file_memory_entity: {file_memory_entity}") # Debug print
 if not file_memory_entity:
 # If the memory entity doesn't exist, the association shouldn't either (or was already removed)
 logger.debug("[DEBUG] disassociate_file_from_project - file_memory_entity not found, returning False") # Debug print
 return False

 project_entity_name = f"project_{project_id}"
 # Await async memory_crud function
 project_memory_entity = await memory_crud.get_entity_by_name(db, name=project_entity_name)
 logger.debug(f"[DEBUG] disassociate_file_from_project - fetched project_memory_entity: {project_memory_entity}") # Debug print

 # Delete the MemoryRelation between the file and project entities (Await async memory_crud functions)
 if file_memory_entity and project_memory_entity:
 logger.debug(f"[DEBUG] disassociate_file_from_project - checking relations to delete for: from={file_memory_entity_id}, to={project_memory_entity.id}, type=associated_with") # Debug print
 # Await async memory_crud function
 relations_to_delete = await memory_crud.get_memory_relations_between_entities(
 db,
 from_entity_id=file_memory_entity_id, # Use the ID
 to_entity_id=project_memory_entity.id,
 relation_type="associated_with"
 )
 logger.debug(f"[DEBUG] disassociate_file_from_project - relations_to_delete: {relations_to_delete}") # Debug print
 for relation in relations_to_delete:
 logger.debug(f"[DEBUG] disassociate_file_from_project - deleting memory relation with id: {relation.id}") # Debug print
 # Await async memory_crud function
 await memory_crud.delete_memory_relation(db, relation_id=relation.id)
 logger.debug("[DEBUG] disassociate_file_from_project - deleted memory relation") # Debug print

 # Get and delete the project file association in the main database (Await async get function)
 logger.debug(f"[DEBUG] disassociate_file_from_project - getting ProjectFileAssociation for project_id: {project_id}, file_memory_entity_id: {file_memory_entity_id}") # Debug print
 db_project_file = await get_project_file_association(
 db, project_id=project_id, file_memory_entity_id=file_memory_entity_id)
 logger.debug(f"[DEBUG] disassociate_file_from_project - fetched ProjectFileAssociation: {db_project_file}") # Debug print

 if db_project_file:
 logger.debug("[DEBUG] disassociate_file_from_project - deleting ProjectFileAssociation") # Debug print
 await db.delete(db_project_file) # Await delete
 await db.commit() # Await commit
 logger.debug("[DEBUG] disassociate_file_from_project - deleted ProjectFileAssociation") # Debug print
 return True
 logger.debug("[DEBUG] disassociate_file_from_project - ProjectFileAssociation not found, returning False") # Debug print
 return False