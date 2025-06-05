import sys
import types
import builtins
from unittest.mock import MagicMock, patch

builtins.AgentBehaviorLog = type("AgentBehaviorLog", (), {})
builtins.AgentRuleViolation = type("AgentRuleViolation", (), {})

_crud_stub = types.ModuleType("crud_rules")
setattr(_crud_stub, "delete_universal_mandate", lambda *a, **k: True)
sys.modules.setdefault("backend.crud.rules", _crud_stub)
sys.modules.setdefault("backend.schemas.rules", types.ModuleType("rules"))

from backend.services.rules_service import RulesService
RulesService.__init__ = lambda self, db: setattr(self, "db", db)
from backend import services
services.rules_service.RulesService.delete_universal_mandate = services.rules_service.delete_universal_mandate


def test_delete_universal_mandate_service_calls_crud():
    session = MagicMock()
    service = RulesService(session)
    with patch(
        "backend.services.rules_service.crud_rules.delete_universal_mandate",
        return_value=True,
    ) as mock_del:
        result = service.delete_universal_mandate("mid")
        mock_del.assert_called_once_with(session, "mid")
        assert result is True
