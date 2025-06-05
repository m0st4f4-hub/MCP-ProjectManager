from unittest.mock import MagicMock, patch

from backend.services.rules_service import RulesService


def test_delete_universal_mandate_calls_crud():
    session = MagicMock()
    service = RulesService(session)
    with patch("backend.services.rules_service.crud_rules.delete_universal_mandate", return_value=True) as mock_delete:
        result = service.delete_universal_mandate("m1")
        mock_delete.assert_called_once_with(session, "m1")
        assert result is True
