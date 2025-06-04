from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ...database import get_sync_db as get_db
from ...crud import rules as crud_rules
from ...schemas.agent_prompt_template import (
    AgentPromptTemplate,
    AgentPromptTemplateCreate,
    AgentPromptTemplateUpdate
)

router = APIRouter()  # Prompt Templates
@router.get("/agent-roles/{agent_name}", response_model=AgentPromptTemplate)


def get_prompt_template(
    agent_name: str,
    template_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get prompt template for an agent"""
    template = crud_rules.get_agent_prompt_template(db, agent_name, template_name)
    if not template:
    raise HTTPException(status_code=404, detail="Prompt template not found")
    return template

@router.post("/", response_model=AgentPromptTemplate)


def create_prompt_template(
    template: AgentPromptTemplateCreate,
    db: Session = Depends(get_db)
):
    """Create a new prompt template"""
    return crud_rules.create_agent_prompt_template(db, template)

@router.put("/{template_id}", response_model=AgentPromptTemplate)


def update_prompt_template(
    template_id: str,
    template_update: AgentPromptTemplateUpdate,
    db: Session = Depends(get_db)
):
    """Update a prompt template"""
    result = crud_rules.update_agent_prompt_template(db, template_id, template_update)
    if not result:
    raise HTTPException(status_code=404, detail="Prompt template not found")
    return result
