# Task ID: rules_framework_implementation  # Agent Role: ImplementationSpecialist  # Request ID: rules_integration  # Project: task-manager  # Timestamp: 2025-05-23T15:30:00Z

"""
Rules Service for integrating agent behavior with rules framework
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List, Union
from ..crud import rules as crud_rules
import json
import uuid

class RulesService:
    """Service for managing agent rules and behavior"""

def __init__(self, db: Session):
        self.db = db

def get_agent_prompt(self, agent_name: str, task_context: Dict[str, Any] = None, available_tools: List[Dict[str, Any]] = None) -> str:
        """Get the rules-based prompt for an agent"""
        return crud_rules.generate_agent_prompt_from_rules(self.db, agent_name, task_context, available_tools)

def validate_agent_task(self, agent_name: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate if an agent can perform a task according to rules"""
        violations_data = crud_rules.validate_task_against_agent_rules(self.db, agent_name, task_data)

        logged_violations = []
        for violation_data in violations_data:
            task_project_id = task_data.get('task_project_id')
            task_number = task_data.get('task_number')

            logged_violation = self.log_rule_violation(
                agent_name=agent_name,
                violation_type=violation_data.get('violation_type', 'unknown'),
                description=violation_data.get('description', 'No description provided.'),
                violated_rule_category=violation_data.get('violated_rule_category', 'unknown'),
                violated_rule_identifier=violation_data.get('violated_rule_identifier', 'unknown'),
                task_project_id=task_project_id,
                task_number=task_number,
                severity=violation_data.get('severity', 'medium')
            )
            logged_violations.append(logged_violation)

        return {
            "is_valid": len(violations_data) == 0,
            "violations": [violation.__dict__ for violation in logged_violations],
            "agent_name": agent_name
        }

def log_agent_action(self, agent_name: str, action_type: str, action_description: str = None,
                        task_project_id: Union[str, uuid.UUID] = None, task_number: Optional[int] = None, success: bool = True, error_message: str = None,
                        action_data: Dict[str, Any] = None, duration_seconds: Optional[int] = None) -> AgentBehaviorLog:
        """Log an agent action for behavior tracking"""  # Get agent role ID
        agent_role = crud_rules.get_agent_role_by_name(self.db, agent_name)
        if not agent_role:  # Create a default agent role if it doesn't exist
            from ..schemas import AgentRoleCreate
            agent_role = crud_rules.create_agent_role(self.db, AgentRoleCreate(
                name=agent_name,
                display_name=agent_name.replace("_", " ").title(),
                primary_purpose=f"Agent role for {agent_name}",
                is_active=True
            ))

        from ..schemas.agent_behavior_log import AgentBehaviorLogCreate
        behavior_log = AgentBehaviorLogCreate(
            agent_name=agent_name,
            agent_role_id=agent_role.id if agent_role else None,
            action_type=action_type,
            action_description=action_description,
            task_project_id=str(task_project_id) if task_project_id else None,
            task_task_number=task_number,
            success=success,
            error_message=error_message,
            action_data=json.dumps(action_data) if action_data else None,
            duration_seconds=duration_seconds
        )

        return crud_rules.log_agent_behavior(self.db, behavior_log)

def log_rule_violation(self, agent_name: str, violation_type: str, description: str,
                            violated_rule_category: str, violated_rule_identifier: str,
                            task_project_id: Union[str, uuid.UUID] = None, task_number: Optional[int] = None, severity: str = "medium") -> AgentRuleViolation:
        """Log a rule violation by an agent, including details about the violated rule."""  # Get agent role ID
        agent_role = crud_rules.get_agent_role_by_name(self.db, agent_name)
        if not agent_role:  # Create a default agent role if it doesn't exist
            from ..schemas import AgentRoleCreate
            agent_role = crud_rules.create_agent_role(self.db, AgentRoleCreate(
                name=agent_name,
                display_name=agent_name.replace("_", " ").title(),
                primary_purpose=f"Agent role for {agent_name}",
                is_active=True
            ))

        from ..schemas.agent_rule_violation import AgentRuleViolationCreate
        violation = AgentRuleViolationCreate(
            agent_name=agent_name,
            agent_role_id=agent_role.id if agent_role else None,
            violation_type=violation_type,
            violation_description=description,
            violated_rule_category=violated_rule_category,
            violated_rule_identifier=violated_rule_identifier,
            task_project_id=str(task_project_id) if task_project_id else None,
            task_task_number=task_number,
            severity=severity
        )

        return crud_rules.log_rule_violation(self.db, violation)

def check_agent_capabilities(self, agent_name: str, required_capabilities: List[str]) -> Dict[str, Any]:
        """Check if agent has required capabilities"""
        agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
        if not agent_role:
            return {
                "has_capabilities": False,
                "missing_capabilities": required_capabilities,
                "reason": f"No rules defined for agent: {agent_name}"
            }

        available_capabilities = [cap.capability for cap in agent_role.capabilities if cap.is_active]
        missing_capabilities = [cap for cap in required_capabilities if cap not in available_capabilities]

        return {
            "has_capabilities": len(missing_capabilities) == 0,
            "missing_capabilities": missing_capabilities,
            "available_capabilities": available_capabilities
        }

def get_handoff_recommendations(self, agent_name: str, current_task_state: str) -> List[Dict[str, str]]:
        """Get handoff recommendations based on agent rules"""
        agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
        if not agent_role:
            return []

        recommendations = []
        for criteria in agent_role.handoff_criteria:
            if criteria.is_active and criteria.criteria.lower() in current_task_state.lower():
                recommendations.append({
                    "criteria": criteria.criteria,
                    "description": criteria.description or "",
                    "target_agent": criteria.target_agent_role or "Any suitable agent",
                    "reason": f"Current task state matches handoff criteria: {criteria.criteria}"
                })

        return recommendations

def enforce_verification_requirements(self, agent_name: str, completed_actions: List[str]) -> Dict[str, Any]:
        """Check if agent has completed required verifications"""
        agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
        if not agent_role:
            return {"verification_complete": True, "missing_verifications": []}

        missing_verifications = []
        for requirement in agent_role.verification_requirements:
            if requirement.is_mandatory:  # Check if verification was completed
                verification_found = any(
                    requirement.requirement.lower() in action.lower()
                    for action in completed_actions
                )
                if not verification_found:
                    missing_verifications.append({
                        "requirement": requirement.requirement,
                        "description": requirement.description or "",
                        "is_mandatory": requirement.is_mandatory
                    })

        return {
            "verification_complete": len(missing_verifications) == 0,
            "missing_verifications": missing_verifications
        }

def get_error_protocol(self, agent_name: str, error_type: str) -> Optional[str]:
        """Get error handling protocol for an agent and error type"""
        agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
        if not agent_role:
            return None

        for protocol in agent_role.error_protocols:
            if protocol.is_active and protocol.error_type.lower() == error_type.lower():
                return protocol.protocol  # Return default protocol if specific one not found
        default_protocols = [p for p in agent_role.error_protocols if p.error_type.lower() == "default"]
        if default_protocols:
            return default_protocols[0].protocol

        return None

def get_universal_mandates_for_prompt(self) -> List[str]:
        """Get universal mandates formatted for agent prompts"""
        mandates = crud_rules.get_universal_mandates(self.db)
        return [f"**{mandate.title}**: {mandate.description}" for mandate in mandates]

def delete_universal_mandate(self, mandate_id: str) -> Optional[crud_rules.UniversalMandate]:
        """Delete a universal mandate by ID"""
        mandate = self.db.query(crud_rules.UniversalMandate).filter(
            crud_rules.UniversalMandate.id == mandate_id
        ).first()
        if not mandate:
            return None

        self.db.delete(mandate)
        self.db.commit()
        return mandate

def initialize_default_rules(self):
        """Initialize default rules for the system"""
        self._create_universal_mandates()
        self._create_default_agent_roles()

def _create_universal_mandates(self):
        """Create default universal mandates"""
        from ..schemas.universal_mandate import UniversalMandateCreate

        default_mandates = [
            {
                "title": "Code Production First Principle (CPFP)",
                "description": "The absolute, primary, and overriding objective is the generation of correct, functional, and contextually appropriate code and directly supporting artifacts.",
                "priority": 10
            },
            {
                "title": "Task-Driven Operation",
                "description": "All agent work MUST be initiated and tracked via an MCP Task. Agents MUST operate strictly within the scope and requirements defined in their assigned MCP Task.",
                "priority": 10
            },
            {
                "title": "Rigorous Verification & Validation",
                "description": "Agents MUST rigorously verify their own outputs and, where specified, the outputs of other agents or tools.",
                "priority": 9
            },
            {
                "title": "Professional Conduct and Communication",
                "description": "All agent communications must maintain a professional tone with clear, concise, and objective language.",
                "priority": 7
            },
            {
                "title": "Resource Awareness",
                "description": "Agents MUST use system resources efficiently and avoid unnecessary operations or redundant calls.",
                "priority": 8
            }
        ]

        for mandate_data in default_mandates:
            existing = self.db.query(crud_rules.UniversalMandate).filter(
                crud_rules.UniversalMandate.title == mandate_data["title"]
            ).first()

            if not existing:
                mandate = UniversalMandateCreate(**mandate_data)
                crud_rules.create_universal_mandate(self.db, mandate)

def _create_default_agent_roles(self):
        """Create default agent roles"""
        from ..schemas.agent_role import AgentRoleCreate

        default_roles = [
            {
                "name": "ProjectManager",
                "display_name": "Project Manager",
                "primary_purpose": "Orchestrates project workflows, manages tasks, ensures validation, and handles anomalies",
                "capabilities": [
                    "Task creation and assignment",
                    "Workflow orchestration",
                    "Strategic planning",
                    "Progress monitoring"
                ],
                "forbidden_actions": [
                    "Direct code implementation",
                    "Bypassing verification protocols"
                ]
            },
            {
                "name": "ImplementationSpecialist",
                "display_name": "Implementation Specialist",
                "primary_purpose": "Implements code modifications, feature development, and fixes, producing tested and functional code artifacts",
                "capabilities": [
                    "Code implementation",
                    "Feature development",
                    "Bug fixes",
                    "Unit testing"
                ],
                "forbidden_actions": [
                    "Modifying project requirements",
                    "Deploying to production without validation"
                ]
            },
            {
                "name": "InformationAnalyst",
                "display_name": "Information Analyst",
                "primary_purpose": "Analyzes files, code, web content, or other data based on MCP task requirements, producing structured reports",
                "capabilities": [
                    "Data analysis",
                    "Report generation",
                    "Code analysis",
                    "Research"
                ],
                "forbidden_actions": [
                    "Code modification",
                    "Task assignment"
                ]
            }
        ]

        for role_data in default_roles:
            existing = self.db.query(crud_rules.AgentRole).filter(
                crud_rules.AgentRole.name == role_data["name"]
            ).first()

            if not existing:
                capabilities = role_data.pop("capabilities", [])
                forbidden_actions = role_data.pop("forbidden_actions", [])

                role = AgentRoleCreate(**role_data)
                db_role = crud_rules.create_agent_role(self.db, role)  # Add capabilities
                for capability in capabilities:
                    crud_rules.add_agent_capability(self.db, db_role.id, capability)  # Add forbidden actions
                for action in forbidden_actions:
                    crud_rules.add_forbidden_action(self.db, db_role.id, action)
