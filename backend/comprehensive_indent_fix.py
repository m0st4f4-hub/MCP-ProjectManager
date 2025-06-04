#!/usr/bin/env python3
"""
Comprehensive indentation fixer for the entire backend codebase.
This script will fix common indentation issues in Python files.
"""

import glob

def fix_file_indentation(filepath):
    """Fix indentation issues in a single Python file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        fixed_lines = []

        for line in lines:  # Skip empty lines
            if not line.strip():
                fixed_lines.append(line)
                continue  # Count leading spaces
            leading_spaces = len(line) - len(line.lstrip())  # Fix single space indentation to 4 spaces
            if line.startswith(' ') and not line.startswith('  '):
                fixed_line = '    ' + line[1:]
                fixed_lines.append(fixed_line)  # Fix inconsistent indentation (round to nearest 4)
            elif leading_spaces > 0 and leading_spaces % 4 != 0:
                new_indent = ((leading_spaces + 2) // 4) * 4
                fixed_line = ' ' * new_indent + line.lstrip()
                fixed_lines.append(fixed_line)
            else:
                fixed_lines.append(line)

        fixed_content = '\n'.join(fixed_lines)

        if fixed_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def fix_all_python_files():
    """Fix indentation in all Python files in the backend directory."""
    backend_dir = "D:/mcp/task-manager/backend"
    patterns = [
        f"{backend_dir}/*.py",
        f"{backend_dir}/**/*.py"
    ]

    fixed_files = []

    for pattern in patterns:
        for filepath in glob.glob(pattern, recursive=True):  # Skip virtual environment files
            if ".venv" in filepath or "__pycache__" in filepath:
                continue

            if fix_file_indentation(filepath):
                fixed_files.append(filepath)
                print(f"Fixed: {filepath}")

    print(f"\nFixed {len(fixed_files)} files")
    return fixed_files

if __name__ == "__main__":
    fix_all_python_files()
