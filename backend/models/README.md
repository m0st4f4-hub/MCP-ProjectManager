# SQLAlchemy Models (`backend/models`)

This directory contains the SQLAlchemy ORM models that define the structure of the database for the MCP Project Manager Suite.

Key models include:

*   `Project`: Represents a project.
*   `Task`: Represents a task within a project.
*   `Agent`: Represents an AI agent.
*   `User`: Represents a user.
*   `Memory`: Models for the Knowledge Graph/Memory service.
*   `TaskDependency`: Defines dependencies between tasks.
*   `TaskFileAssociation`: Links tasks to associated files/Memory entities.
*   `Comment`: Represents comments on tasks.
*   `AuditLog`: Records audit trails of actions.
*   `AgentHandoffCriteria`, `AgentVerificationRequirement`, `AgentForbiddenAction`, `AgentErrorProtocol`, `AgentCapability`, `AgentRole`: Models related to agent capabilities and protocols.
*   `UniversalMandate`: Represents system-wide mandates.
*   `Workflow`, `ProjectMember`, `ProjectTemplate`, `TaskStatus`, `TaskRelations`, `Core`, `Base`, `Types`: Other supporting models and base classes. 