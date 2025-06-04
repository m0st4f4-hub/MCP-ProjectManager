#!/usr/bin/env python3
"""
Quick fix for project service indentation to unblock tests.
"""

import re
from pathlib import Path

def fix_project_service_indentation():
    """Fix critical indentation issues in project_service.py."""
    file_path = Path("D:/mcp/task-manager/backend/services/project_service.py")
    
    try:
        content = file_path.read_text()
        
        # Fix method definitions that start at beginning of line
        content = re.sub(r'\nasync def (\w+)\(', r'\n    async def \1(', content)
        content = re.sub(r'\ndef (\w+)\(', r'\n    def \1(', content)
        
        # Fix docstrings and method bodies that aren't indented properly
        lines = content.split('\n')
        fixed_lines = []
        in_method = False
        method_indent = 0
        
        for i, line in enumerate(lines):
            if line.strip().startswith('async def ') or line.strip().startswith('def '):
                in_method = True
                method_indent = len(line) - len(line.lstrip())
                fixed_lines.append(line)
            elif in_method and line.strip() == '':
                fixed_lines.append(line)
            elif in_method and line.strip() and not line.startswith(' ' * (method_indent + 4)):
                # This line should be indented as part of the method
                if line.strip().startswith('"""') or line.strip().startswith('Args:') or line.strip().startswith('Returns:'):
                    fixed_lines.append(' ' * (method_indent + 4) + line.strip())
                elif line.strip().startswith('class ') or line.strip().startswith('def ') or line.strip().startswith('async def '):
                    in_method = False
                    fixed_lines.append(line)
                else:
                    fixed_lines.append(' ' * (method_indent + 4) + line.strip())
            else:
                if line.strip().startswith('class '):
                    in_method = False
                fixed_lines.append(line)
        
        fixed_content = '\n'.join(fixed_lines)
        
        if fixed_content != content:
            file_path.write_text(fixed_content)
            print("Fixed project_service.py indentation")
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing project_service.py: {e}")
        return False

if __name__ == "__main__":
    fix_project_service_indentation()
