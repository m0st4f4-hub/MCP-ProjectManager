from sqlalchemy.ext.asyncio import AsyncSession
import models
from typing import List, Optional
from schemas.agent import AgentCreate, AgentUpdate
from crud.agents import (
    create_agent,
    get_agent,
    get_agent_by_name,
    get_agents,
    update_agent,
    delete_agent
)
from crud.agent_validation import agent_name_exists


class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_agent(
        self, agent_id: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Agent]:
        return await get_agent(self.db, agent_id, is_archived=is_archived)

    async def get_agent_by_name(
        self, name: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Agent]:
        return await get_agent_by_name(self.db, name, is_archived=is_archived)

    async def get_agents(self) -> List[models.Agent]:
        return await get_agents(self.db)

    async def create_agent(self, agent: AgentCreate) -> models.Agent:
        if await agent_name_exists(self.db, agent.name):
            raise ValueError(f"Agent name '{agent.name}' already exists")
        return await create_agent(self.db, agent)

    async def update_agent(
        self, agent_id: str, agent_update: AgentUpdate
    ) -> Optional[models.Agent]:
        db_agent = await get_agent(self.db, agent_id, is_archived=None)
        if not db_agent:
            return None

        update_data = agent_update.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != db_agent.name:
            if await agent_name_exists(
                self.db, update_data["name"], exclude_agent_id=agent_id
            ):
                raise ValueError(
                    f"Agent name '{update_data['name']}' already exists"
                )
        return await update_agent(self.db, agent_id, agent_update)

    async def delete_agent(self, agent_id: str) -> Optional[models.Agent]:
        result = await delete_agent(self.db, agent_id)
        return result

    async def archive_agent(self, agent_id: str) -> Optional[models.Agent]:
        agent = await get_agent(self.db, agent_id, is_archived=None)
        if not agent:
            return None
        if agent.is_archived:
            return agent
        agent.is_archived = True
        await self.db.commit()
        await self.db.refresh(agent)
        return agent

    async def unarchive_agent(self, agent_id: str) -> Optional[models.Agent]:
        agent = await get_agent(self.db, agent_id, is_archived=None)
        if not agent:
            return None
        if not agent.is_archived:
            return agent
        agent.is_archived = False
        await self.db.commit()
        await self.db.refresh(agent)
        return agent

    async def add_rule_to_agent(
        self, agent_id: str, rule_id: str
    ) -> Optional[models.AgentRule]:
        agent = await get_agent(self.db, agent_id)
        if not agent:
            return None
        
        # Need to use async query pattern
        from sqlalchemy.future import select
        stmt = select(models.AgentRule).where(
            models.AgentRule.agent_id == agent_id,
            models.AgentRule.rule_id == rule_id
        )
        result = await self.db.execute(stmt)
        existing_rule = result.scalar_one_or_none()
        
        if existing_rule:
            return existing_rule

        db_agent_rule = models.AgentRule(agent_id=agent_id, rule_id=rule_id)
        self.db.add(db_agent_rule)
        await self.db.commit()
        await self.db.refresh(db_agent_rule)
        return db_agent_rule

    async def remove_rule_from_agent(self, agent_id: str, rule_id: str) -> bool:
        from sqlalchemy.future import select
        stmt = select(models.AgentRule).where(
            models.AgentRule.agent_id == agent_id,
            models.AgentRule.rule_id == rule_id
        )
        result = await self.db.execute(stmt)
        db_agent_rule = result.scalar_one_or_none()
        
        if db_agent_rule:
            await self.db.delete(db_agent_rule)
            await self.db.commit()
            return True
        return False

    async def get_agent_rules(self, agent_id: str) -> List[models.AgentRule]:
        from sqlalchemy.future import select
        stmt = select(models.AgentRule).where(models.AgentRule.agent_id == agent_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()
