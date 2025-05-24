from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from .. import models
# from .. import models, schemas # Remove the old import
import uuid
from typing import List, Optional
# Keep HTTPException for raising exceptions within the service if appropriate
from fastapi import HTTPException

# Import specific schema classes from their files
from backend.schemas.agent import AgentCreate, AgentUpdate # Import from the specific file

# Import CRUD operations
from backend.crud.agents import (
    create_agent,
    get_agent,
    get_agent_by_name,
    get_agents,
    update_agent,
    delete_agent
)

# Import validation helpers
from backend.crud.agent_validation import agent_name_exists

class AgentService:
    def __init__(self, db: Session):
        self.db = db

    def get_agent(self, agent_id: str, is_archived: Optional[bool] = False) -> Optional[models.Agent]:
        # Delegate to CRUD
        return get_agent(self.db, agent_id, is_archived=is_archived) # Pass is_archived if CRUD supports it

    def get_agent_by_name(self, name: str, is_archived: Optional[bool] = False) -> Optional[models.Agent]:
        # Delegate to CRUD
        return get_agent_by_name(self.db, name, is_archived=is_archived) # Pass is_archived if CRUD supports it

    def get_agents(self) -> List[models.Agent]:
        """
        Retrieve all agents. Delegate to CRUD.
        """
        return get_agents(self.db)

    def create_agent(self, agent: AgentCreate) -> models.Agent:
        # Use validation helper
        if agent_name_exists(self.db, agent.name):
            raise ValueError(f"Agent name '{agent.name}' already exists")

        # Delegate to CRUD create function
        # The CRUD function handles ID generation
        return create_agent(self.db, agent)

    def update_agent(self, agent_id: str, agent_update: AgentUpdate) -> Optional[models.Agent]:
        # Get the existing agent using CRUD. Allow updating archived agents.
        db_agent = get_agent(self.db, agent_id, is_archived=None) # Assuming CRUD get_agent supports is_archived
        if not db_agent:
            return None  # Return None for not found, router will handle 404

        update_data = agent_update.model_dump(exclude_unset=True)

        # Use validation helper if name is being updated
        if "name" in update_data and update_data["name"] != db_agent.name:
             if agent_name_exists(self.db, update_data["name"], exclude_agent_id=agent_id):
                raise ValueError(
                    f"Agent name '{update_data['name']}' already exists")

        # Delegate update logic to CRUD if needed, or perform simple update here
        # Given CRUD already has update_agent, let's use it
        return update_agent(self.db, agent_id, agent_update)

    def delete_agent(self, agent_id: str) -> Optional[models.Agent]:
        # Delegate to CRUD delete function. Allow deleting archived agents.
        # Assuming CRUD delete_agent returns Optional[Agent] or None
        result = delete_agent(self.db, agent_id) # Assuming CRUD delete returns Optional[Agent] or None
        # The router expects the Agent object or None, not a boolean.
        return result # Return CRUD result directly

    # Placeholder for Agent archival logic if needed in the future
    def archive_agent(self, agent_id: str) -> Optional[models.Agent]:
        # Delegate to CRUD or keep here? Let's keep in service for now if it involves business logic.
        # Use is_archived=None to get agent regardless of current status
        agent = get_agent(self.db, agent_id, is_archived=None)
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
        # Delegate to CRUD or keep here? Let's keep in service for now.
        # Use is_archived=None to get agent regardless of current status
        agent = get_agent(self.db, agent_id, is_archived=None)
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

    # Methods for managing agent rules - Keep in service for now, might move later
    def add_rule_to_agent(self, agent_id: str, rule_id: str) -> Optional[models.AgentRule]:
        # Check if agent and rule exist (optional - validation logic)
        agent = get_agent(self.db, agent_id) # Use CRUD get_agent
        # rule = self.db.query(models.Rule).filter(models.Rule.id == rule_id).first()  # Assuming a separate Rule model
        if not agent:  # or not rule:
            return None # Indicate failure if agent/rule not found

        # Check if rule is already assigned (validation logic)
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
        # Delegate delete logic if needed, or keep here
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
        # Delegate to CRUD or keep here? Keep here for now.
        return self.db.query(models.AgentRule).filter(models.AgentRule.agent_id == agent_id).all()
