from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Optional

from ....database import get_db
from ....crud import rules as crud_rules
from ....schemas.agent_prompt_template import (
    AgentPromptTemplate,
    AgentPromptTemplateCreate,
    AgentPromptTemplateUpdate
)
from ....schemas.api_responses import DataResponse

router = APIRouter(
    prefix="/templates",
    tags=["Prompt Templates"]
)

@router.get(
    "/agent-roles/{agent_name}", 
    response_model=DataResponse[AgentPromptTemplate],
    summary="Get Prompt Template",
    operation_id="get_prompt_template"
)
async def get_prompt_template(
    agent_name: Annotated[str, Path(description="Agent name")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get prompt template for an agent role."""
    try:
        template = await crud_rules.get_agent_prompt_template(db, agent_name)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prompt template not found for agent: {agent_name}"
            )
        return DataResponse(
            data=template,
            message="Prompt template retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving prompt template: {str(e)}"
        )

@router.post(
    "/agent-roles/{agent_name}",
    response_model=DataResponse[AgentPromptTemplate],
    status_code=status.HTTP_201_CREATED,
    summary="Create Prompt Template",
    operation_id="create_prompt_template"
)
async def create_prompt_template(
    agent_name: Annotated[str, Path(description="Agent name")],
    template: AgentPromptTemplateCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Create a new prompt template for an agent role."""
    try:
        new_template = await crud_rules.create_agent_prompt_template(db, agent_name, template)
        return DataResponse(
            data=new_template,
            message="Prompt template created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating prompt template: {str(e)}"
        )

@router.put(
    "/agent-roles/{agent_name}",
    response_model=DataResponse[AgentPromptTemplate],
    summary="Update Prompt Template",
    operation_id="update_prompt_template"
)
async def update_prompt_template(
    agent_name: Annotated[str, Path(description="Agent name")],
    template_update: AgentPromptTemplateUpdate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Update an existing prompt template."""
    try:
        updated_template = await crud_rules.update_agent_prompt_template(
            db, agent_name, template_update
        )
        if not updated_template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prompt template not found for agent: {agent_name}"
            )
        return DataResponse(
            data=updated_template,
            message="Prompt template updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating prompt template: {str(e)}"
        )

@router.delete(
    "/{template_id}", 
    response_model=DataResponse[bool],
    status_code=status.HTTP_200_OK,
    summary="Delete Prompt Template",
    operation_id="delete_prompt_template"
)
def delete_prompt_template(
    template_id: Annotated[str, Path(description="ID of the template to delete")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Delete a prompt template.
    
    This action cannot be undone. The template will be permanently removed.
    """
    success = crud_rules.delete_agent_prompt_template(db, template_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt template not found")
    return DataResponse[bool](data=True, message="Prompt template deleted successfully")
