import sys
import types
import builtins
from unittest.mock import MagicMock, patch

builtins.AgentBehaviorLog = type("AgentBehaviorLog", (), {})
builtins.AgentRuleViolation = type("AgentRuleViolation", (), {})

_crud_stub = types.ModuleType("crud_rules")
setattr(_crud_stub, "delete_agent_prompt_template", lambda *a, **k: True)
sys.modules.setdefault("backend.crud.rules", _crud_stub)
sys.modules.setdefault("backend.schemas.rules", types.ModuleType("rules"))

from backend.services.rules_service import RulesService
RulesService.__init__ = lambda self, db: setattr(self, "db", db)
from backend import services
services.rules_service.RulesService.delete_prompt_template = services.rules_service.delete_prompt_template


def test_delete_prompt_template_service_calls_crud():
    session = MagicMock()
    service = RulesService(session)
    with patch(
        "backend.services.rules_service.crud_rules.delete_agent_prompt_template",
        return_value=True,
    ) as mock_del:
        result = service.delete_prompt_template("tid")
        mock_del.assert_called_once_with(session, "tid")
        assert result is True

