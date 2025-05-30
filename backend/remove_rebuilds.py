#!/usr/bin/env python3
"""
Remove model_rebuild calls from schema files.
"""

import os
import re
from pathlib import Path

def remove_model_rebuild_calls():
 """Remove model_rebuild calls from schema files."""
 backend_dir = Path("D:/mcp/task-manager/backend")
 schemas_dir = backend_dir / "schemas"
 
 for py_file in schemas_dir.glob("*.py"):
 if py_file.name.startswith('__'):
 continue
 
 try:
 with open(py_file, 'r', encoding='utf-8') as f:
 content = f.read()
 
 original_content = content
 
 # Remove model_rebuild calls and their surrounding lines
 patterns = [
 r'.*\.model_rebuild\(\).*\n', # Remove model_rebuild calls
 r'# Update forward references.*\n', # Remove comments about forward refs
 r'# This needs to be outside TYPE_CHECKING.*\n', # Remove TYPE_CHECKING comments
 r'# if TYPE_CHECKING:.*\n', # Remove TYPE_CHECKING comments
 r'# Moved outside TYPE_CHECKING.*\n', # Remove TYPE_CHECKING comments
 r'# Explicitly trigger forward reference resolution.*\n', # Remove forward ref comments
 ]
 
 for pattern in patterns:
 content = re.sub(pattern, '', content)
 
 # Clean up extra blank lines
 content = re.sub(r'\n{3,}', '\n\n', content)
 
 if content != original_content:
 with open(py_file, 'w', encoding='utf-8') as f:
 f.write(content)
 print(f"Removed model_rebuild calls from {py_file}")
 
 except Exception as e:
 print(f"Error fixing {py_file}: {e}")
 
 print("Model rebuild removal completed.")

if __name__ == "__main__":
 remove_model_rebuild_calls()
