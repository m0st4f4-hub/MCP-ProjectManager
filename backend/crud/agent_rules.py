# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import AgentRule
from ..schemas import AgentRuleCreate, AgentRuleUpdate


def get_agent_rule(db: Session, rule_id: str) -> Optional[AgentRule]:
 """Get a specific agent rule by ID."""
 return db.query(AgentRule).filter(AgentRule.id == rule_id).first()


def get_agent_rules(db: Session, agent_id: str = None, skip: int = 0, limit: int = 100) -> List[AgentRule]:
 """Get agent rules, optionally filtered by agent_id."""
 query = db.query(AgentRule)
 if agent_id:
 query = query.filter(AgentRule.agent_id == agent_id)
 return query.offset(skip).limit(limit).all()


def get_active_agent_rules(db: Session, agent_id: str, skip: int = 0, limit: int = 100) -> List[AgentRule]:
 """Get active rules for a specific agent."""
 return db.query(AgentRule).filter(
 AgentRule.agent_id == agent_id,
 AgentRule.is_active == True
 ).offset(skip).limit(limit).all()


def create_agent_rule(db: Session, agent_rule: AgentRuleCreate) -> AgentRule:
 """Create a new agent rule."""
 db_agent_rule = AgentRule(
 agent_id=agent_rule.agent_id,
 rule_type=agent_rule.rule_type,
 rule_content=agent_rule.rule_content,
 is_active=agent_rule.is_active if agent_rule.is_active is not None else True
 )
 db.add(db_agent_rule)
 db.commit()
 db.refresh(db_agent_rule)
 return db_agent_rule


def update_agent_rule(db: Session, rule_id: str, agent_rule_update: AgentRuleUpdate) -> Optional[AgentRule]:
 """Update an existing agent rule."""
 db_agent_rule = get_agent_rule(db, rule_id)
 if db_agent_rule:
 update_data = agent_rule_update.model_dump(exclude_unset=True)
 for field, value in update_data.items():
 setattr(db_agent_rule, field, value)
 db.commit()
 db.refresh(db_agent_rule)
 return db_agent_rule


def delete_agent_rule(db: Session, rule_id: str) -> bool:
 """Delete an agent rule."""
 db_agent_rule = get_agent_rule(db, rule_id)
 if db_agent_rule:
 db.delete(db_agent_rule)
 db.commit()
 return True
 return False
