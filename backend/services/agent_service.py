from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from .. import models, schemas
import uuid
from typing import List, Optional
# Keep HTTPException for raising exceptions within the service if appropriate
from fastapi import HTTPException


class AgentService:
    def __init__(self, db: Session):
        self.db = db

    def get_agent(self, agent_id: str, is_archived: Optional[bool] = False) -> Optional[models.Agent]:
        query = self.db.query(models.Agent).filter(models.Agent.id == agent_id)
        if is_archived is not None:
            query = query.filter(models.Agent.is_archived == is_archived)
        return query.first()

    def get_agent_by_name(self, name: str, is_archived: Optional[bool] = False) -> Optional[models.Agent]:
        query = self.db.query(models.Agent).filter(models.Agent.name == name)
        if is_archived is not None:
            query = query.filter(models.Agent.is_archived == is_archived)
        return query.first()

    def get_agents(
        self,
        skip: int = 0,
        search: Optional[str] = None,
        status: Optional[str] = None,
        is_archived: Optional[bool] = False,
        limit: Optional[int] = None
    ) -> List[models.Agent]:
        query = self.db.query(models.Agent)
        if search:
            search_term = f"%{search}%"
            query = query.filter(models.Agent.name.ilike(search_term))
        # Status filtering logic would go here if Agent model had a status field
        # if status:
        #     query = query.filter(models.Agent.status == status)  # Example

        if is_archived is not None:
            query = query.filter(models.Agent.is_archived == is_archived)

        query = query.order_by(models.Agent.name).offset(skip)
        if limit is not None:
            query = query.limit(limit)
        return query.all()

    def create_agent(self, agent: schemas.AgentCreate) -> models.Agent:
        # Check if agent name already exists
        existing_agent = self.get_agent_by_name(
            name=agent.name, is_archived=None)
        if existing_agent:
            # Use ValueError for business logic errors
            raise ValueError(f"Agent name '{agent.name}' already exists")

        # Generate ID within the service
        agent_id_str = str(uuid.uuid4().hex)
        db_agent = models.Agent(
            id=agent_id_str, **agent.model_dump(exclude_unset=True))

        self.db.add(db_agent)
        self.db.commit()
        self.db.refresh(db_agent)
        return db_agent

    def update_agent(self, agent_id: str, agent_update: schemas.AgentUpdate) -> Optional[models.Agent]:
        # Use is_archived=None to allow updating archived agents
        db_agent = self.get_agent(agent_id, is_archived=None)
        if not db_agent:
            return None  # Return None for not found, router will raise 404

        update_data = agent_update.model_dump(exclude_unset=True)

        # Check for name conflict if name is being updated
        if "name" in update_data and update_data["name"] != db_agent.name:
            existing = self.get_agent_by_name(
                name=update_data["name"], is_archived=None)
            if existing:
                raise ValueError(
                    f"Agent name '{update_data['name']}' already exists")

        for key, value in update_data.items():
            setattr(db_agent, key, value)

        self.db.commit()
        self.db.refresh(db_agent)
        return db_agent

    def delete_agent(self, agent_id: str) -> bool:
        # Use is_archived=None to allow deleting archived agents
        db_agent = self.get_agent(agent_id, is_archived=None)
        if db_agent:
            # agent_data = schemas.Agent.model_validate(db_agent)  # Service should return boolean for delete success
            self.db.delete(db_agent)
            self.db.commit()
            return True  # Return True if found and deleted
        return False  # Return False if not found

    # Placeholder for Agent archival logic if needed in the future
    def archive_agent(self, agent_id: str) -> Optional[models.Agent]:
        # Use is_archived=None to get agent regardless of current status
        agent = self.get_agent(agent_id, is_archived=None)
        if not agent:
            return None  # Router will raise 404
        if agent.is_archived:
            return agent  # Already archived
        agent.is_archived = True
        # Update updated_at if applicable
        # agent.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(agent)
        return agent

    def unarchive_agent(self, agent_id: str) -> Optional[models.Agent]:
        # Use is_archived=None to get agent regardless of current status
        agent = self.get_agent(agent_id, is_archived=None)
        if not agent:
            return None  # Router will raise 404
        if not agent.is_archived:
            return agent  # Already unarchived
        agent.is_archived = False
        # Update updated_at if applicable
        # agent.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(agent)
        return agent

    # Methods for managing agent rules
    def add_rule_to_agent(self, agent_id: str, rule_id: str) -> Optional[models.AgentRule]:
        # Check if agent and rule exist (optional)
        agent = self.get_agent(agent_id)
        # rule = self.db.query(models.Rule).filter(models.Rule.id == rule_id).first()  # Assuming a separate Rule model
        if not agent:  # or not rule:
            return None

        # Check if rule is already assigned
        existing_rule = self.db.query(models.AgentRule).filter(
            models.AgentRule.agent_id == agent_id,
            models.AgentRule.rule_id == rule_id
        ).first()
        if existing_rule:
            return existing_rule  # Rule already assigned

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
        return self.db.query(models.AgentRule).filter(models.AgentRule.agent_id == agent_id).all()
