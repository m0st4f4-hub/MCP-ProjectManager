import pytest
from pydantic import ValidationError
from backend.schemas.error_protocol import ErrorProtocolCreate


def test_error_protocol_valid():
    proto = ErrorProtocolCreate(error_type="IO", handling_strategy="retry", priority=1)
    assert proto.error_type == "IO"


def test_error_protocol_missing_required():
    with pytest.raises(ValidationError):
        ErrorProtocolCreate(handling_strategy="retry")
