#!/usr/bin/env python3
"""
Fix forward references in schema files.
"""

import os
import re
from pathlib import Path

def fix_forward_references():
 """Fix backend.schemas forward references."""
 backend_dir = Path("D:/mcp/task-manager/backend")
 schemas_dir = backend_dir / "schemas"
 
 for py_file in schemas_dir.glob("*.py"):
 if py_file.name.startswith('__'):
 continue
 
 try:
 with open(py_file, 'r', encoding='utf-8') as f:
 content = f.read()
 
 original_content = content
 
 # Fix forward references like: 'backend.schemas.task.Task' -> 'Task'
 patterns = [
 (r'"backend\.schemas\.\w+\.(\w+)"', r'"\1"'),
 (r"'backend\.schemas\.\w+\.(\w+)'", r"'\1'"),
 (r'backend\.schemas\.\w+\.(\w+)', r'\1'),
 ]
 
 for old_pattern, new_pattern in patterns:
 content = re.sub(old_pattern, new_pattern, content)
 
 if content != original_content:
 with open(py_file, 'w', encoding='utf-8') as f:
 f.write(content)
 print(f"Fixed forward references in {py_file}")
 
 except Exception as e:
 print(f"Error fixing {py_file}: {e}")
 
 print("Forward reference fix completed.")

if __name__ == "__main__":
 fix_forward_references()
