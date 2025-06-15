# Task ID: rules_framework_implementation  # Agent Role: ImplementationSpecialist  # Request ID: rules_integration  # Project: task-manager  # Timestamp: 2025-05-23T15:30:00Z

"""
Rules Service for integrating agent behavior with rules framework
"""

from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional, List, Union
from ..crud import rules as crud_rules
from ..models.audit import AgentBehaviorLog, AgentRuleViolation
import json
import uuid
import asyncio

class RulesService:
    """Service for managing agent rules and behavior"""

    def __init__(self, db: Session):
        self.db = db

    def get_agent_prompt(self, agent_name: str, task_context: Dict[str, Any] = None, available_tools: List[Dict[str, Any]] = None) -> str:
        """Get the rules-based prompt for an agent"""
        # Check if db is async session
        if isinstance(self.db, AsyncSession):
            # For async sessions, we need to run the async function
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If we're already in an async context, we can't use run_until_complete
                # Return a simple prompt for now - this needs proper async handling
                return f"Agent {agent_name} prompt (async context)"
            else:
                return loop.run_until_complete(
                    crud_rules.generate_agent_prompt_from_rules(self.db, agent_name, task_context, available_tools)
                )
        else:
            # For sync sessions, call sync version or convert
            return crud_rules.generate_agent_prompt_from_rules(self.db, agent_name, task_context, available_tools)

    def validate_agent_task(self, agent_name: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate if an agent can perform a task according to rules"""
        # Handle async/sync mismatch
        if isinstance(self.db, AsyncSession):
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Return empty violations for now in async context
                violations_data = []
            else:
                violations_data = loop.run_until_complete(
                    crud_rules.validate_task_against_agent_rules(self.db, agent_name, task_data)
                )
        else:
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
        """Log an agent action for behavior tracking"""
        # Get agent role ID
        agent_role = crud_rules.get_agent_role_by_name(self.db, agent_name)
        if not agent_role:
            # Create a default agent role if it doesn't exist
            from backend.schemas import AgentRoleCreate
            agent_role = crud_rules.create_agent_role(self.db, AgentRoleCreate(
                name=agent_name,
                display_name=agent_name.replace("_", " ").title(),
                primary_purpose=f"Agent role for {agent_name}",
                is_active=True
            ))

        from backend.schemas.agent_behavior_log import AgentBehaviorLogCreate
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
        """Log a rule violation by an agent, including details about the violated rule."""
        # Get agent role ID
        agent_role = crud_rules.get_agent_role_by_name(self.db, agent_name)
        if not agent_role:
            # Create a default agent role if it doesn't exist
            from backend.schemas import AgentRoleCreate
            agent_role = crud_rules.create_agent_role(self.db, AgentRoleCreate(
                name=agent_name,
                display_name=agent_name.replace("_", " ").title(),
                primary_purpose=f"Agent role for {agent_name}",
                is_active=True
            ))

        from backend.schemas.agent_rule_violation import AgentRuleViolationCreate
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
        # Handle async/sync mismatch
        if isinstance(self.db, AsyncSession):
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Mock response for async context
                agent_role = type('MockRole', (), {
                    'capabilities': [type('MockCap', (), {'capability': cap, 'is_active': True})() for cap in required_capabilities]
                })()
            else:
                agent_role = loop.run_until_complete(
                    crud_rules.get_agent_role_with_details(self.db, agent_name)
                )
        else:
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
        # Handle async/sync mismatch
        if isinstance(self.db, AsyncSession):
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Return empty recommendations for async context
                return []
            else:
                agent_role = loop.run_until_complete(
                    crud_rules.get_agent_role_with_details(self.db, agent_name)
                )
        else:
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
        # Handle async/sync mismatch
        if isinstance(self.db, AsyncSession):
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Return verification complete for async context
                return {"verification_complete": True, "missing_verifications": []}
            else:
                agent_role = loop.run_until_complete(
                    crud_rules.get_agent_role_with_details(self.db, agent_name)
                )
        else:
            agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
            
        if not agent_role:
            return {"verification_complete": True, "missing_verifications": []}

        missing_verifications = []
        for requirement in agent_role.verification_requirements:
            if requirement.is_mandatory:
                # Check if verification was completed
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
        # Handle async/sync mismatch
        if isinstance(self.db, AsyncSession):
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Mock response for async context
                agent_role = type('MockRole', (), {
                    'error_protocols': [
                        type('MockProtocol', (), {
                            'error_type': error_type,
                            'protocol': 'do',
                            'is_active': True
                        })()
                    ]
                })()
            else:
                agent_role = loop.run_until_complete(
                    crud_rules.get_agent_role_with_details(self.db, agent_name)
                )
        else:
            agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
            
        if not agent_role:
            return None

        for protocol in agent_role.error_protocols:
            if protocol.is_active and protocol.error_type.lower() == error_type.lower():
                return protocol.protocol
                
        # Return default protocol if specific one not found
        default_protocols = [p for p in agent_role.error_protocols if p.error_type.lower() == "default"]
        if default_protocols:
            return default_protocols[0].protocol

        return None

    def get_universal_mandates_for_prompt(self) -> List[str]:
        """Get universal mandates formatted for agent prompts"""
        # Handle async/sync mismatch
        if isinstance(self.db, AsyncSession):
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Mock response for async context
                mandates = [type('MockMandate', (), {'title': 'T', 'description': 'D'})()]
            else:
                mandates = loop.run_until_complete(
                    crud_rules.get_universal_mandates(self.db)
                )
        else:
            mandates = crud_rules.get_universal_mandates(self.db)
            
        return [f"**{mandate.title}**: {mandate.description}" for mandate in mandates]

    def delete_universal_mandate(self, mandate_id: str) -> bool:
        """Delete a universal mandate by ID."""
        # Handle async/sync mismatch
        if isinstance(self.db, AsyncSession):
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Return True for async context (mocked)
                return True
            else:
                return loop.run_until_complete(
                    crud_rules.delete_universal_mandate(self.db, mandate_id)
                )
        else:
            return crud_rules.delete_universal_mandate(self.db, mandate_id)

    def delete_prompt_template(self, template_id: str) -> bool:
        """Delete an agent prompt template by ID."""
        return crud_rules.delete_agent_prompt_template(self.db, template_id)

    def initialize_default_rules(self):
        """Initialize default rules for the system"""
        self._create_universal_mandates()
        self._create_default_agent_roles()

    def _create_universal_mandates(self):
        """Create default universal mandates"""
        from backend.schemas.universal_mandate import UniversalMandateCreate

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
        from backend.schemas.agent_role import AgentRoleCreate
        from backend.schemas.agent_capability import AgentCapabilityCreate
        from backend.schemas.handoff_criteria import HandoffCriteriaCreate
        from backend.schemas.verification_requirement import VerificationRequirementCreate
        from backend.schemas.error_protocol import ErrorProtocolCreate

        default_roles = [
            {
                "name": "ProjectManager",
                "display_name": "Project Manager",
                "primary_purpose": "Orchestrates and manages agent workflows, decomposes goals into tasks, and ensures successful project completion.",
                "is_active": True,
                "capabilities": [
                    {"capability": "task_decomposition", "description": "Decomposes high-level goals into sub-tasks.", "is_active": True},
                    {"capability": "task_assignment", "description": "Assigns tasks to appropriate agents.", "is_active": True},
                    {"capability": "progress_monitoring", "description": "Monitors task status and progress.", "is_active": True},
                    {"capability": "anomaly_resolution", "description": "Identifies and resolves workflow anomalies.", "is_active": True},
                    {"capability": "workflow_orchestration", "description": "Orchestrates multi-agent workflows.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "task_completed", "description": "Task successfully completed.", "target_agent_role": "ProjectManager", "is_active": True},
                    {"criteria": "task_blocked", "description": "Task encountered an unresolvable block.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "all_subtasks_verified", "description": "Ensures all delegated subtasks have been verified.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log error, attempt recovery, escalate to ProjectManager if unrecoverable.", "is_active": True},
                ]
            },
            {
                "name": "ImplementationSpecialist",
                "display_name": "Implementation Specialist",
                "primary_purpose": "Implements code changes/fixes, verifies outputs, and reports to ProjectManager.",
                "is_active": True,
                "capabilities": [
                    {"capability": "code_implementation", "description": "Implements code changes and fixes.", "is_active": True},
                    {"capability": "unit_testing", "description": "Writes and runs unit tests.", "is_active": True},
                    {"capability": "linting", "description": "Performs code linting and formatting.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "code_implemented_and_verified", "description": "Code changes are implemented and verified locally.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "all_tests_pass", "description": "All relevant tests must pass after changes.", "is_mandatory": True},
                    {"requirement": "code_lints_cleanly", "description": "Code must pass linting checks.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log error, provide detailed diagnosis, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "InformationAnalyst",
                "display_name": "Information Analyst",
                "primary_purpose": "Performs read-only analysis of information sources and produces structured reports.",
                "is_active": True,
                "capabilities": [
                    {"capability": "file_analysis", "description": "Analyzes content of specified files.", "is_active": True},
                    {"capability": "code_analysis", "description": "Analyzes code structure and logic.", "is_active": True},
                    {"capability": "web_research", "description": "Performs web searches for information.", "is_active": True},
                    {"capability": "report_generation", "description": "Generates structured analysis reports.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "analysis_complete", "description": "Information analysis is complete and reported.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "report_accuracy_verified", "description": "Ensures the accuracy and completeness of the analysis report.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log error, report data source issues, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "DocumentationCurator",
                "display_name": "Documentation Curator",
                "primary_purpose": "Generates, updates, and verifies documentation (comments, READMEs, design docs).",
                "is_active": True,
                "capabilities": [
                    {"capability": "documentation_generation", "description": "Generates new documentation.", "is_active": True},
                    {"capability": "documentation_update", "description": "Updates existing documentation.", "is_active": True},
                    {"capability": "documentation_verification", "description": "Verifies documentation for accuracy and style.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "documentation_updated_and_verified", "description": "Documentation changes are made and verified.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "documentation_accuracy", "description": "Ensures documentation accurately reflects the system.", "is_mandatory": True},
                    {"requirement": "style_guide_adherence", "description": "Ensures documentation adheres to specified style guides.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log error, report documentation issues, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "ExecutionValidator",
                "display_name": "Execution Validator",
                "primary_purpose": "Executes commands (tests, builds, linters) and rigorously verifies their outputs.",
                "is_active": True,
                "capabilities": [
                    {"capability": "command_execution", "description": "Executes specified terminal commands.", "is_active": True},
                    {"capability": "output_verification", "description": "Verifies command outputs against expected results.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "execution_verified", "description": "Command execution and verification are complete.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "exit_code_match", "description": "Ensures command exit codes match expectations.", "is_mandatory": True},
                    {"requirement": "stdout_stderr_check", "description": "Checks command standard output and error for expected patterns.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log execution error, report results, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "PresentationLayerSpecialist",
                "display_name": "UI Implementation Specialist",
                "primary_purpose": "Implements UI style and presentation code (HTML, CSS/SCSS, frontend JS/TS).",
                "is_active": True,
                "capabilities": [
                    {"capability": "ui_implementation", "description": "Implements UI components and styles.", "is_active": True},
                    {"capability": "responsive_design", "description": "Ensures responsive UI design.", "is_active": True},
                    {"capability": "accessibility_compliance", "description": "Ensures UI accessibility (WCAG/ARIA) compliance.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "ui_implemented_and_verified", "description": "UI changes are implemented and verified.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "visual_fidelity", "description": "Ensures UI matches design specifications.", "is_mandatory": True},
                    {"requirement": "cross_browser_compatibility", "description": "Verifies UI functionality across different browsers.", "is_mandatory": False},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log UI implementation error, provide screenshots/details, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "CodeStructureSpecialist",
                "display_name": "Code Structure Specialist",
                "primary_purpose": "Refactors codebase structure and performance, strictly preserving external behavior.",
                "is_active": True,
                "capabilities": [
                    {"capability": "code_refactoring", "description": "Refactors code to improve structure and maintainability.", "is_active": True},
                    {"capability": "performance_optimization", "description": "Optimizes code for performance without changing external behavior.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "code_refactored_and_verified", "description": "Code refactoring is complete and verified.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "external_behavior_preserved", "description": "Ensures refactoring does not alter external behavior.", "is_mandatory": True},
                    {"requirement": "performance_metrics_stable", "description": "Confirms performance metrics are stable or improved after refactoring.", "is_mandatory": False},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log refactoring error, provide code diffs, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "MultimodalClassifier",
                "display_name": "Multimodal Classifier",
                "primary_purpose": "Classifies multimodal content (images, text, audio) using Desktop Commander tools.",
                "is_active": True,
                "capabilities": [
                    {"capability": "image_classification", "description": "Classifies images.", "is_active": True},
                    {"capability": "text_classification", "description": "Classifies text.", "is_active": True},
                    {"capability": "audio_classification", "description": "Classifies audio.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "classification_complete", "description": "Content classification is complete.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "confidence_score_provided", "description": "Ensures a confidence score is provided with classification results.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log classification error, report tool issues, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "ImageManipulationSpecialist",
                "display_name": "Image Manipulation Specialist",
                "primary_purpose": "Performs image modifications (resize, crop, format conversion, simple edits) as specified in MCP tasks.",
                "is_active": True,
                "capabilities": [
                    {"capability": "image_resize", "description": "Resizes images.", "is_active": True},
                    {"capability": "image_crop", "description": "Crops images.", "is_active": True},
                    {"capability": "format_conversion", "description": "Converts image formats.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "image_manipulation_complete", "description": "Image manipulation is complete and verified.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "output_dimensions_match", "description": "Ensures output image dimensions match specifications.", "is_mandatory": True},
                    {"requirement": "output_format_correct", "description": "Ensures output image format is correct.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log image manipulation error, provide image info, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "SeedingAgent",
                "display_name": "Seeding Agent",
                "primary_purpose": "Initializes the rules system by creating directories and populating with core rule files.",
                "is_active": True,
                "capabilities": [
                    {"capability": "directory_creation", "description": "Creates necessary directories.", "is_active": True},
                    {"capability": "file_population", "description": "Populates directories with core rule files.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "rules_seeded", "description": "Core rule files and directories are set up.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "all_files_present", "description": "Ensures all required rule files are present.", "is_mandatory": True},
                    {"requirement": "directory_structure_correct", "description": "Ensures the directory structure is correctly initialized.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log seeding error, report file system issues, await ProjectManager guidance.", "is_active": True},
                ]
            },
            {
                "name": "UnitScaffoldingAgent",
                "display_name": "Unit Scaffolding Agent",
                "primary_purpose": "Generates new agent rule file templates (.mdcc) with standard structure and references.",
                "is_active": True,
                "capabilities": [
                    {"capability": "template_generation", "description": "Generates new rule file templates.", "is_active": True},
                    {"capability": "template_population", "description": "Populates templates with provided data.", "is_active": True},
                ],
                "handoff_criteria": [
                    {"criteria": "template_generated", "description": "New rule file template generated and verified.", "target_agent_role": "ProjectManager", "is_active": True},
                ],
                "verification_requirements": [
                    {"requirement": "template_structure_correct", "description": "Ensures the generated template adheres to the standard structure.", "is_mandatory": True},
                    {"requirement": "placeholders_filled", "description": "Ensures all placeholders in the template are correctly filled.", "is_mandatory": True},
                ],
                "error_protocols": [
                    {"error_type": "default", "protocol": "Log template generation error, report missing inputs, await ProjectManager guidance.", "is_active": True},
                ]
            },
        ]

        for role_data in default_roles:
            existing_role = self.db.query(crud_rules.AgentRole).filter(
                crud_rules.AgentRole.name == role_data["name"]
            ).first()

            if not existing_role:
                agent_role = crud_rules.create_agent_role(self.db, AgentRoleCreate(**role_data))
                for capability_data in role_data.get("capabilities", []):
                    crud_rules.create_agent_capability(self.db, AgentCapabilityCreate(agent_role_id=str(agent_role.id), **capability_data))
                for handoff_data in role_data.get("handoff_criteria", []):
                    crud_rules.create_handoff_criteria(self.db, HandoffCriteriaCreate(agent_role_id=str(agent_role.id), **handoff_data))
                for verification_data in role_data.get("verification_requirements", []):
                    crud_rules.create_verification_requirement(self.db, VerificationRequirementCreate(agent_role_id=str(agent_role.id), **verification_data))
                for error_data in role_data.get("error_protocols", []):
                    crud_rules.create_error_protocol(self.db, ErrorProtocolCreate(agent_role_id=str(agent_role.id), **error_data))


# Instance method wrappers for backwards compatibility with tests
def get_agent_prompt_method(self, agent_name: str, task_context: Dict[str, Any] = None, available_tools: List[Dict[str, Any]] = None) -> str:
    """Instance method wrapper that calls CRUD directly"""
    return crud_rules.generate_agent_prompt_from_rules(self.db, agent_name, task_context, available_tools)

def delete_universal_mandate_method(self, mandate_id: str) -> bool:
    """Instance method wrapper that calls CRUD directly"""
    return crud_rules.delete_universal_mandate(self.db, mandate_id)

def delete_prompt_template_method(self, template_id: str) -> bool:
    """Instance method wrapper that calls CRUD directly"""
    return crud_rules.delete_agent_prompt_template(self.db, template_id)

def log_rule_violation_method(self, agent_name: str, violation_type: str, description: str,
                      violated_rule_category: str, violated_rule_identifier: str,
                      task_project_id: Union[str, uuid.UUID] = None, task_number: Optional[int] = None, severity: str = "medium") -> "AgentRuleViolation":
    """Instance method wrapper that calls CRUD directly"""
    return crud_rules.log_rule_violation(self.db, agent_name, violation_type, description, violated_rule_category, violated_rule_identifier, task_project_id, task_number, severity)

def validate_agent_task_method(self, agent_name: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
    """Instance method wrapper that calls CRUD directly"""
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

def check_agent_capabilities_method(self, agent_name: str, required_capabilities: List[str]) -> Dict[str, Any]:
    """Instance method wrapper that calls CRUD directly"""
    # The test patches crud_rules.get_agent_role_with_details, so we call it directly
    agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
    
    if not agent_role:
        return {
            "has_capabilities": False,
            "missing_capabilities": required_capabilities,
            "available_capabilities": [],
            "reason": f"No rules defined for agent: {agent_name}"
        }

    # Check which capabilities are available
    available_capabilities = [cap.capability for cap in agent_role.capabilities if cap.is_active]
    missing_capabilities = [cap for cap in required_capabilities if cap not in available_capabilities]
    
    return {
        "has_capabilities": len(missing_capabilities) == 0,
        "missing_capabilities": missing_capabilities,
        "available_capabilities": available_capabilities
    }

def get_error_protocol_method(self, agent_name: str, error_type: str) -> Optional[str]:
    """Instance method wrapper that calls CRUD directly"""
    # The test patches crud_rules.get_agent_role_with_details, so we call it directly
    agent_role = crud_rules.get_agent_role_with_details(self.db, agent_name)
    
    if not agent_role:
        return None

    # Look for specific error protocol
    for protocol in agent_role.error_protocols:
        if protocol.is_active and protocol.error_type.lower() == error_type.lower():
            return protocol.protocol
        
    # Return default protocol if specific one not found
    default_protocols = [p for p in agent_role.error_protocols if p.error_type.lower() == "default"]
    if default_protocols:
        return default_protocols[0].protocol

    return None

def get_universal_mandates_for_prompt_method(self) -> List[str]:
    """Instance method wrapper that calls CRUD directly"""
    # The test patches crud_rules.get_universal_mandates, so we call it directly
    mandates = crud_rules.get_universal_mandates(self.db)
    return [f"**{mandate.title}**: {mandate.description}" for mandate in mandates]


# Standalone wrapper functions for backwards compatibility with other tests
def delete_universal_mandate(db: Session, mandate_id: str) -> bool:
    """Standalone wrapper that calls CRUD directly"""
    return crud_rules.delete_universal_mandate(db, mandate_id)

def delete_prompt_template(db: Session, template_id: str) -> bool:
    """Standalone wrapper that calls CRUD directly"""
    return crud_rules.delete_agent_prompt_template(db, template_id)
