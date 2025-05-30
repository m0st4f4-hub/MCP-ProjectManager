#!/usr/bin/env python3
"""
Secondary import fix for remaining issues.
"""

import os
import re
from pathlib import Path

def fix_enums_imports():
 """Fix remaining enums import issues."""
 backend_dir = Path("D:/mcp/task-manager/backend")
 
 # Files that might have incorrect enums imports
 files_to_check = [
 backend_dir / "schemas" / "task.py",
 backend_dir / "schemas" / "user.py", 
 backend_dir / "models" / "task.py",
 backend_dir / "models" / "user.py",
 backend_dir / "routers" / "tasks.py",
 backend_dir / "routers" / "users.py",
 ]
 
 for file_path in files_to_check:
 if not file_path.exists():
 continue
 
 try:
 with open(file_path, 'r', encoding='utf-8') as f:
 content = f.read()
 
 original_content = content
 
 # Fix enums imports based on file location
 if 'schemas' in str(file_path) or 'models' in str(file_path):
 # For files in schemas/ or models/, enums is in parent directory
 content = re.sub(r'from \.enums import', r'from ..enums import', content)
 elif 'routers' in str(file_path) or 'services' in str(file_path):
 # For files in routers/ or services/, enums is in parent directory
 content = re.sub(r'from \.enums import', r'from ..enums import', content)
 
 if content != original_content:
 with open(file_path, 'w', encoding='utf-8') as f:
 f.write(content)
 print(f"Fixed enums imports in {file_path}")
 
 except Exception as e:
 print(f"Error fixing {file_path}: {e}")
 
 print("Enums import fix completed.")

if __name__ == "__main__":
 fix_enums_imports()
