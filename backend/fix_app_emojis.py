#!/usr/bin/env python3
"""
Fix only emoji characters in our application code (not dependencies).
"""

import os
import re
from pathlib import Path

def remove_emojis_from_app_files():
    """Remove emoji characters from our application files only."""
    backend_dir = Path("D:/mcp/task-manager/backend")
    
    # Only process our application directories
    app_dirs = [
        backend_dir / "models",
        backend_dir / "schemas", 
        backend_dir / "routers",
        backend_dir / "services",
        backend_dir / "crud",
    ]
    
    files_fixed = 0
    
    for app_dir in app_dirs:
        if not app_dir.exists():
            continue
            
        for py_file in app_dir.rglob("*.py"):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Remove emojis but be more careful about indentation
                content = content.replace('🔍', '')
                content = content.replace('🚨', '')
                content = content.replace('✅', '')
                content = content.replace('❌', '')
                content = content.replace('⚠️', '')
                
                if content != original_content:
                    with open(py_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed {py_file}")
                    files_fixed += 1
                    
            except Exception as e:
                print(f"Error fixing {py_file}: {e}")
    
    print(f"Fixed {files_fixed} application files")

if __name__ == "__main__":
    remove_emojis_from_app_files()
