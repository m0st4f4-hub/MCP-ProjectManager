# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy.types import TypeDecorator, Text
from typing import Dict, Any
import json

class JSONText(TypeDecorator):
    """Stores JSON data as TEXT in SQLite, serializing/deserializing automatically."""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None

    # Add `Dict[str, Any]` type hint to support Mapped[]
    python_type = Dict[str, Any] 