import builtins
builtins.AgentBehaviorLog = type("AgentBehaviorLog", (), {})
builtins.AgentRuleViolation = type("AgentRuleViolation", (), {})
import types
import sys
# provide dummy crud.rules module before service import
_crud_stub = types.ModuleType("crud_rules")
for _n in ["generate_agent_prompt_from_rules","validate_task_against_agent_rules","get_agent_role_by_name","create_agent_role","log_agent_behavior","log_rule_violation","get_agent_role_with_details","get_universal_mandates","create_universal_mandate","add_agent_capability","add_forbidden_action"]:
    setattr(_crud_stub, _n, lambda *a, **k: None)
setattr(_crud_stub, "AgentRole", type("AgentRole", (), {}))
setattr(_crud_stub, "UniversalMandate", type("UniversalMandate", (), {}))
sys.modules.setdefault("backend.crud.rules", _crud_stub)
import sys
import types
_rules_module = types.ModuleType("rules")
for _n in ["AgentRoleCreate","AgentRoleUpdate","ConstraintCreate","ConstraintUpdate","CapabilityCreate","CapabilityUpdate","MandateCreate","MandateUpdate","ErrorProtocolCreate","ErrorProtocolUpdate","ValidationResult"]:
    setattr(_rules_module, _n, type(_n, (), {}))
sys.modules.setdefault("backend.schemas.rules", _rules_module)
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from backend.services.rules_service import RulesService

RulesService.__init__ = lambda self, db: setattr(self, "db", db)
from backend import services
services.rules_service.RulesService.get_agent_prompt = services.rules_service.get_agent_prompt
services.rules_service.RulesService.log_rule_violation = services.rules_service.log_rule_violation
services.rules_service.RulesService.validate_agent_task = services.rules_service.validate_agent_task
services.rules_service.RulesService.check_agent_capabilities = services.rules_service.check_agent_capabilities
services.rules_service.RulesService.get_error_protocol = services.rules_service.get_error_protocol
services.rules_service.RulesService.get_universal_mandates_for_prompt = services.rules_service.get_universal_mandates_for_prompt
def test_get_agent_prompt_calls_crud():
    session = MagicMock()
    service = RulesService(session)
    with patch("backend.services.rules_service.crud_rules.generate_agent_prompt_from_rules") as mock_gen:
        mock_gen.return_value = "prompt"
        result = service.get_agent_prompt("Agent", {"k": 1}, [])
        mock_gen.assert_called_once_with(session, "Agent", {"k": 1}, [])
        assert result == "prompt"


def test_validate_agent_task_logs_violations():
    session = MagicMock()
    service = RulesService(session)
    violations = [
        {"violation_type": "bad", "description": "d", "violated_rule_category": "c", "violated_rule_identifier": "id", "severity": "high"}
    ]
    with patch("backend.services.rules_service.crud_rules.validate_task_against_agent_rules", return_value=violations) as mock_validate, \
         patch.object(service, "log_rule_violation", return_value=SimpleNamespace(__dict__={"v": "v"})) as mock_log:
        result = service.validate_agent_task("Agent", {"task_project_id": "p", "task_number": 1})
        mock_validate.assert_called_once_with(session, "Agent", {"task_project_id": "p", "task_number": 1})
        mock_log.assert_called_once()
        assert not result["is_valid"]
        assert result["agent_name"] == "Agent"
        assert len(result["violations"]) == 1


def test_check_agent_capabilities():
    session = MagicMock()
    role = MagicMock()
    role.capabilities = [SimpleNamespace(capability="run", is_active=True)]
    with patch("backend.services.rules_service.crud_rules.get_agent_role_with_details", return_value=role):
        service = RulesService(session)
        result = service.check_agent_capabilities("Agent", ["run"])
        assert result["has_capabilities"]
        assert result["missing_capabilities"] == []
        assert result["available_capabilities"] == ["run"]


def test_get_error_protocol_with_default():
    session = MagicMock()
    specific = SimpleNamespace(error_type="Specific", protocol="do", is_active=True)
    default = SimpleNamespace(error_type="default", protocol="default", is_active=True)
    role = MagicMock(error_protocols=[specific, default])
    with patch("backend.services.rules_service.crud_rules.get_agent_role_with_details", return_value=role):
        service = RulesService(session)
        assert service.get_error_protocol("Agent", "Specific") == "do"
        assert service.get_error_protocol("Agent", "Other") == "default"


def test_get_universal_mandates_for_prompt():
    session = MagicMock()
    mandates = [SimpleNamespace(title="T", description="D")]
    with patch("backend.services.rules_service.crud_rules.get_universal_mandates", return_value=mandates):
        service = RulesService(session)
        assert service.get_universal_mandates_for_prompt() == ["**T**: D"]
