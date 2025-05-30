#!/usr/bin/env python3
"""
Fix imports in router files.
"""

import os
import re
from pathlib import Path

def fix_router_imports():
 """Fix router file imports."""
 backend_dir = Path("D:/mcp/task-manager/backend")
 routers_dir = backend_dir / "routers"
 
 for py_file in routers_dir.glob("*.py"):
 if py_file.name.startswith('__'):
 continue
 
 try:
 with open(py_file, 'r', encoding='utf-8') as f:
 content = f.read()
 
 original_content = content
 
 # Fix router imports - from . patterns should be from ..
 content = re.sub(r'from \.schemas\.', r'from ..schemas.', content)
 content = re.sub(r'from \.services\.', r'from ..services.', content)
 content = re.sub(r'from \.models', r'from ..models', content)
 content = re.sub(r'from \.auth', r'from ..auth', content)
 content = re.sub(r'from \.crud\.', r'from ..crud.', content)
 content = re.sub(r'from \.config', r'from ..config', content)
 content = re.sub(r'from \.database', r'from ..database', content)
 content = re.sub(r'from \.enums', r'from ..enums', content)
 
 if content != original_content:
 with open(py_file, 'w', encoding='utf-8') as f:
 f.write(content)
 print(f"Fixed imports in {py_file}")
 
 except Exception as e:
 print(f"Error fixing {py_file}: {e}")
 
 print("Router import fix completed.")

if __name__ == "__main__":
 fix_router_imports()
