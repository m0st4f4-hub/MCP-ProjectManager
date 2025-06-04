#!/usr/bin/env python3
"""
Comprehensive flake8 issues fixer for the backend codebase.
Focuses on fixing critical syntax errors and major indentation issues.
"""

import os
import re
import subprocess
from pathlib import Path


class ComprehensiveFlake8Fixer:
    def __init__(self, backend_dir: str):
        self.backend_dir = Path(backend_dir)
        self.fixed_files = []
        self.critical_errors = []

    def fix_critical_syntax_errors(self):
        """Fix critical syntax errors that prevent code execution."""
        
        # Fix main.py indentation issue
        main_py = self.backend_dir / "main.py"
        if main_py.exists():
            self._fix_main_py_mock_class(main_py)
        
        # Fix alembic env.py syntax
        env_py = self.backend_dir / "alembic" / "env.py"
        if env_py.exists():
            self._fix_alembic_env(env_py)
        
        # Fix models base.py
        base_py = self.backend_dir / "models" / "base.py"
        if base_py.exists():
            self._fix_base_py_indentation(base_py)
        
        # Fix memory.py repr method
        memory_py = self.backend_dir / "models" / "memory.py"
        if memory_py.exists():
            self._fix_memory_py_repr(memory_py)
        
        # Fix crud memory.py import
        crud_memory = self.backend_dir / "crud" / "memory.py"
        if crud_memory.exists():
            self._fix_crud_memory_import(crud_memory)
        
        # Fix crud comments.py import
        crud_comments = self.backend_dir / "crud" / "comments.py"
        if crud_comments.exists():
            self._fix_crud_comments_import(crud_comments)

    def _fix_main_py_mock_class(self, filepath: Path):
        """Fix MockMCP class indentation in main.py."""
        try:
            content = filepath.read_text()
            
            # Fix the MockMCP class indentation
            fixed_content = re.sub(
                r"else:  # Mock MCP instance for /mcp-docs\nclass MockMCP:\ndef __init__\(self\):\n            self\.tools = {}\n    app\.state\.mcp_instance = MockMCP\(\)  # --- Health Check and Basic Routes ---",
                "else:  # Mock MCP instance for /mcp-docs\n    class MockMCP:\n        def __init__(self):\n            self.tools = {}\n    app.state.mcp_instance = MockMCP()\n\n# --- Health Check and Basic Routes ---",
                content
            )
            
            if fixed_content != content:
                filepath.write_text(fixed_content)
                self.fixed_files.append(str(filepath))
                print(f"Fixed main.py MockMCP class indentation")
        except Exception as e:
            print(f"Error fixing main.py: {e}")

    def _fix_alembic_env(self, filepath: Path):
        """Fix syntax issues in alembic env.py."""
        try:
            content = filepath.read_text()
            
            # Clean up comments mixed with code
            content = re.sub(
                r"from logging\.config import \(\n    fileConfig  # this is the Alembic Config object,\n    which provides  # access to the values within the \.ini file in use\.\n\)",
                "from logging.config import fileConfig",
                content
            )
            
            # Fix inline comments
            content = re.sub(
                r"config = context\.config  # Interpret the config file for Python logging\.  # This line sets up loggers basically\.",
                "config = context.config  # Interpret the config file for Python logging",
                content
            )
            
            filepath.write_text(content)
            self.fixed_files.append(str(filepath))
            print(f"Fixed alembic env.py syntax issues")
        except Exception as e:
            print(f"Error fixing alembic env.py: {e}")

    def _fix_base_py_indentation(self, filepath: Path):
        """Fix method indentation in base.py JSONText class."""
        try:
            content = filepath.read_text()
            
            # Fix JSONText class method indentation
            fixed_content = re.sub(
                r"class JSONText\(TypeDecorator\):\n    \"\"\"Stores JSON data as TEXT in SQLite, serializing/deserializing automatically\.\"\"\"\n    impl = Text\n\ndef process_bind_param\(self, value, dialect\):",
                "class JSONText(TypeDecorator):\n    \"\"\"Stores JSON data as TEXT in SQLite, serializing/deserializing automatically.\"\"\"\n    impl = Text\n\n    def process_bind_param(self, value, dialect):",
                content
            )
            
            fixed_content = re.sub(
                r"def process_result_value\(self, value, dialect\):",
                "    def process_result_value(self, value, dialect):",
                fixed_content
            )
            
            if fixed_content != content:
                filepath.write_text(fixed_content)
                self.fixed_files.append(str(filepath))
                print(f"Fixed base.py JSONText method indentation")
        except Exception as e:
            print(f"Error fixing base.py: {e}")

    def _fix_memory_py_repr(self, filepath: Path):
        """Fix __repr__ method in memory.py."""
        try:
            content = filepath.read_text()
            
            # Fix repr method indentation and string concatenation
            fixed_content = re.sub(
                r"def __repr__\(self\):\n        return f\"<MemoryEntity\(id={self\.id}, type='{self\.entity_type}',\"\n            \"source='{self\.source}'\)>\"",
                "    def __repr__(self):\n        return (f\"<MemoryEntity(id={self.id}, type='{self.entity_type}', \"\n                f\"source='{self.source}')>\")",
                content
            )
            
            if fixed_content != content:
                filepath.write_text(fixed_content)
                self.fixed_files.append(str(filepath))
                print(f"Fixed memory.py __repr__ method")
        except Exception as e:
            print(f"Error fixing memory.py: {e}")

    def _fix_crud_memory_import(self, filepath: Path):
        """Fix incomplete import in crud/memory.py."""
        try:
            content = filepath.read_text()
            
            # Fix incomplete import statement
            fixed_content = re.sub(
                r"# Timestamp: 2025-05-09T20:45:00Z\n\nMemoryEntityCreate,",
                "# Timestamp: 2025-05-09T20:45:00Z\n\nfrom backend.schemas import (\n    MemoryEntityCreate,",
                content
            )
            
            if fixed_content != content:
                filepath.write_text(fixed_content)
                self.fixed_files.append(str(filepath))
                print(f"Fixed crud/memory.py import statement")
        except Exception as e:
            print(f"Error fixing crud/memory.py: {e}")

    def _fix_crud_comments_import(self, filepath: Path):
        """Fix mixed comments in crud/comments.py."""
        try:
            content = filepath.read_text()
            
            # Fix mixed comments in import
            fixed_content = re.sub(
                r"from \. import \(\n    memory as memory_crud  # Keep for now,\n    might need async conversion later  # Import validation helpers  # Assume these are now async based on previous checks in task_validation\.py\n\)",
                "from . import (\n    memory as memory_crud  # Keep for now, might need async conversion later\n)\n# Import validation helpers\n# Assume these are now async based on previous checks in task_validation.py",
                content
            )
            
            if fixed_content != content:
                filepath.write_text(fixed_content)
                self.fixed_files.append(str(filepath))
                print(f"Fixed crud/comments.py import statement")
        except Exception as e:
            print(f"Error fixing crud/comments.py: {e}")

    def run_flake8_check(self):
        """Run flake8 to identify remaining issues."""
        try:
            result = subprocess.run(
                [
                    f"{self.backend_dir}/.venv/Scripts/flake8.exe",
                    str(self.backend_dir),
                    "--output-file", str(self.backend_dir / "post_fix_flake8.txt")
                ],
                capture_output=True,
                text=True,
                cwd=str(self.backend_dir)
            )
            
            print(f"Flake8 check completed. Exit code: {result.returncode}")
            return result.returncode == 0
        except Exception as e:
            print(f"Error running flake8: {e}")
            return False

    def fix_all(self):
        """Run all fixes."""
        print("Starting comprehensive flake8 fixes...")
        
        self.fix_critical_syntax_errors()
        
        print(f"\nFixed {len(self.fixed_files)} files:")
        for file in self.fixed_files:
            print(f"  - {file}")
        
        print("\nRunning post-fix flake8 check...")
        clean = self.run_flake8_check()
        
        if clean:
            print("✅ All critical syntax errors fixed!")
        else:
            print("⚠️ Some issues remain. Check post_fix_flake8.txt for details.")
        
        return clean


if __name__ == "__main__":
    backend_dir = "D:/mcp/task-manager/backend"
    fixer = ComprehensiveFlake8Fixer(backend_dir)
    fixer.fix_all()
