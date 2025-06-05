from sqlalchemy.orm import Session
from .. import models
from typing import List, Optional
from ..schemas.agent import AgentCreate, AgentUpdate
from backend.crud.agents import (
    create_agent,
    get_agent,
    get_agent_by_name,
    get_agents,
    update_agent,
    delete_agent
)
from backend.crud.agent_validation import agent_name_exists


class AgentService:
    def __init__(self, db: Session):
        self.db = db

    def get_agent(
        self, agent_id: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Agent]:
        return get_agent(self.db, agent_id, is_archived=is_archived)

    def get_agent_by_name(
        self, name: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Agent]:
        return get_agent_by_name(self.db, name, is_archived=is_archived)

    def get_agents(self) -> List[models.Agent]:
        return get_agents(self.db)

    def create_agent(self, agent: AgentCreate) -> models.Agent:
        if agent_name_exists(self.db, agent.name):
            raise ValueError(f"Agent name '{agent.name}' already exists")
        return create_agent(self.db, agent)

    def update_agent(
        self, agent_id: str, agent_update: AgentUpdate
    ) -> Optional[models.Agent]:
        db_agent = get_agent(self.db, agent_id, is_archived=None)
        if not db_agent:
            return None

        update_data = agent_update.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != db_agent.name:
            if agent_name_exists(
                self.db, update_data["name"], exclude_agent_id=agent_id
            ):
                raise ValueError(
                    f"Agent name '{update_data['name']}' already exists"
                )
        return update_agent(self.db, agent_id, agent_update)

    def delete_agent(self, agent_id: str) -> Optional[models.Agent]:
        result = delete_agent(self.db, agent_id)
        return result

    def archive_agent(self, agent_id: str) -> Optional[models.Agent]:
        agent = get_agent(self.db, agent_id, is_archived=None)
        if not agent:
            return None
        if agent.is_archived:
            return agent
        agent.is_archived = True
        self.db.commit()
        self.db.refresh(agent)
        return agent

    def unarchive_agent(self, agent_id: str) -> Optional[models.Agent]:
        agent = get_agent(self.db, agent_id, is_archived=None)
        if not agent:
            return None
        if not agent.is_archived:
            return agent
        agent.is_archived = False
        self.db.commit()
        self.db.refresh(agent)
        return agent

    def add_rule_to_agent(
        self, agent_id: str, rule_id: str
    ) -> Optional[models.AgentRule]:
        agent = get_agent(self.db, agent_id)
        if not agent:
            return None
        existing_rule = self.db.query(models.AgentRule).filter(
            models.AgentRule.agent_id == agent_id,
            models.AgentRule.rule_id == rule_id
        ).first()
        if existing_rule:
            return existing_rule

        db_agent_rule = models.AgentRule(agent_id=agent_id, rule_id=rule_id)
        self.db.add(db_agent_rule)
        self.db.commit()
        self.db.refresh(db_agent_rule)
        return db_agent_rule

    def remove_rule_from_agent(self, agent_id: str, rule_id: str) -> bool:
        db_agent_rule = self.db.query(models.AgentRule).filter(
            models.AgentRule.agent_id == agent_id,
            models.AgentRule.rule_id == rule_id
        ).first()
        if db_agent_rule:
            self.db.delete(db_agent_rule)
            self.db.commit()
            return True
        return False

    def get_agent_rules(self, agent_id: str) -> List[models.AgentRule]:
        return (
            self.db.query(models.AgentRule)
            .filter(models.AgentRule.agent_id == agent_id)
            .all()
        )
