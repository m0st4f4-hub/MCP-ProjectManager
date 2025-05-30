#!/usr/bin/env python3
"""
Fix imports in service files.
"""

import os
import re
from pathlib import Path

def fix_service_imports():
 """Fix service file imports."""
 backend_dir = Path("D:/mcp/task-manager/backend")
 services_dir = backend_dir / "services"
 
 for py_file in services_dir.glob("*.py"):
 if py_file.name.startswith('__'):
 continue
 
 try:
 with open(py_file, 'r', encoding='utf-8') as f:
 content = f.read()
 
 original_content = content
 
 # Fix service imports
 content = re.sub(r'from \.schemas\.', r'from ..schemas.', content)
 content = re.sub(r'from \.services\.', r'from .', content)
 content = re.sub(r'from \.models\.', r'from ..models.', content)
 content = re.sub(r'from \.crud\.', r'from ..crud.', content)
 
 if content != original_content:
 with open(py_file, 'w', encoding='utf-8') as f:
 f.write(content)
 print(f"Fixed imports in {py_file}")
 
 except Exception as e:
 print(f"Error fixing {py_file}: {e}")
 
 print("Service import fix completed.")

if __name__ == "__main__":
 fix_service_imports()
