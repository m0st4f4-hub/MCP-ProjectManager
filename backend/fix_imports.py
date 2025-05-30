#!/usr/bin/env python3
"""
Script to systematically fix import issues in the backend.
This will convert absolute backend.* imports to relative imports.
"""

import os
import re
from pathlib import Path

def fix_imports_in_file(file_path: Path):
 """Fix imports in a single file."""
 if not file_path.suffix == '.py':
 return False
 
 try:
 with open(file_path, 'r', encoding='utf-8') as f:
 content = f.read()
 
 original_content = content
 
 # Fix backend.* imports to relative imports
 patterns = [
 # backend.models.* -> .models.* or .* depending on context
 (r'from backend\.models\.(\w+) import', r'from .models.\1 import'),
 (r'from backend\.models import', r'from .models import'),
 (r'import backend\.models\.(\w+)', r'from .models import \1'),
 
 # backend.schemas.* -> .schemas.* or .*
 (r'from backend\.schemas\.(\w+) import', r'from .schemas.\1 import'),
 (r'from backend\.schemas import', r'from .schemas import'),
 (r'import backend\.schemas\.(\w+)', r'from .schemas import \1'),
 
 # backend.services.* -> .services.* or .*
 (r'from backend\.services\.(\w+) import', r'from .services.\1 import'),
 (r'from backend\.services import', r'from .services import'),
 
 # backend.enums -> .enums
 (r'from backend\.enums import', r'from .enums import'),
 (r'import backend\.enums', r'from . import enums'),
 
 # backend.auth -> .auth
 (r'from backend\.auth import', r'from .auth import'),
 
 # backend.database -> .database
 (r'from backend\.database import', r'from .database import'),
 ]
 
 for old_pattern, new_pattern in patterns:
 content = re.sub(old_pattern, new_pattern, content)
 
 # Handle special cases within schemas and models directories
 if 'schemas' in str(file_path):
 # In schemas, backend.schemas.* becomes just .*
 content = re.sub(r'from \.schemas\.(\w+) import', r'from .\1 import', content)
 content = re.sub(r'from backend\.enums import', r'from ..enums import', content)
 
 if 'models' in str(file_path):
 # In models, backend.models.* becomes just .*
 content = re.sub(r'from \.models\.(\w+) import', r'from .\1 import', content)
 content = re.sub(r'from backend\.enums import', r'from ..enums import', content)
 
 if 'routers' in str(file_path):
 # Routers need to import from parent package
 content = re.sub(r'from backend\.schemas\.(\w+) import', r'from ..schemas.\1 import', content)
 content = re.sub(r'from backend\.services\.(\w+) import', r'from ..services.\1 import', content)
 content = re.sub(r'from backend\.models import', r'from ..models import', content)
 content = re.sub(r'from backend\.enums import', r'from ..enums import', content)
 content = re.sub(r'from backend\.auth import', r'from ..auth import', content)
 
 if 'services' in str(file_path):
 # Services need parent package imports 
 content = re.sub(r'from backend\.models\.(\w+) import', r'from ..models.\1 import', content)
 content = re.sub(r'from backend\.schemas\.(\w+) import', r'from ..schemas.\1 import', content)
 content = re.sub(r'from backend\.enums import', r'from ..enums import', content)
 
 if content != original_content:
 with open(file_path, 'w', encoding='utf-8') as f:
 f.write(content)
 print(f"Fixed imports in {file_path}")
 return True
 
 except Exception as e:
 print(f"Error fixing {file_path}: {e}")
 return False
 
 return False

def main():
 """Main function to fix all imports."""
 backend_dir = Path("D:/mcp/task-manager/backend")
 
 if not backend_dir.exists():
 print("Backend directory not found!")
 return
 
 print("Fixing import issues in backend...")
 
 # Directories to process
 dirs_to_process = [
 backend_dir / "models",
 backend_dir / "schemas", 
 backend_dir / "routers",
 backend_dir / "services",
 backend_dir / "tests",
 ]
 
 files_processed = 0
 files_fixed = 0
 
 for dir_path in dirs_to_process:
 if not dir_path.exists():
 continue
 
 print(f"Processing {dir_path}...")
 
 for py_file in dir_path.rglob("*.py"):
 if py_file.name.startswith('__pycache__'):
 continue
 files_processed += 1
 if fix_imports_in_file(py_file):
 files_fixed += 1
 
 print(f"Processed {files_processed} files, fixed {files_fixed} files")

if __name__ == "__main__":
 main()
