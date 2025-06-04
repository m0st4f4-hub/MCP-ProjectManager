#!/usr/bin/env python3
"""
Quick indentation fixer for critical class method issues.
"""

import re
from pathlib import Path


def fix_class_method_indentation(file_path: Path):
    """Fix method indentation in class files."""
    try:
        content = file_path.read_text()
        
        # Fix methods that should be indented in a class
        # Pattern: async def or def at start of line (should be indented)
        fixed_content = re.sub(
            r'\nclass (\w+):\n((?:(?:def|async def) .+\n(?:[ ]{8,}.+\n)*)*)',
            lambda m: f'\nclass {m.group(1)}:\n' + '\n'.join(
                '    ' + line if line.strip() and not line.startswith('    ') and not line.startswith('#')
                else line for line in m.group(2).split('\n')
            ),
            content
        )
        
        # More specific fix for methods starting at beginning of line
        fixed_content = re.sub(
            r'\n(async def|def) (\w+\([^)]*\):.*)',
            lambda m: f'\n    {m.group(1)} {m.group(2)}',
            fixed_content
        )
        
        if fixed_content != content:
            file_path.write_text(fixed_content)
            print(f"Fixed {file_path}")
            return True
        return False
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False


def main():
    backend_dir = Path("D:/mcp/task-manager/backend")
    
    # Files with known method indentation issues
    problem_files = [
        "services/user_service.py",
    ]
    
    fixed = 0
    for file_path in problem_files:
        full_path = backend_dir / file_path
        if full_path.exists():
            if fix_class_method_indentation(full_path):
                fixed += 1
    
    print(f"Fixed {fixed} files")


if __name__ == "__main__":
    main()
