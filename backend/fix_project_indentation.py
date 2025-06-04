#!/usr/bin/env python3

import os
import re

def fix_indentation_in_file(filepath):
    """Fix indentation issues in a single Python file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        fixed_lines = []

        for line in lines:  # Fix lines that start with a single space followed by code
            if re.match(r'^ [a-zA-Z_  #]', line):  # Replace the single leading space with 4 spaces
                fixed_line = '    ' + line[1:]
                fixed_lines.append(fixed_line)
            else:
                fixed_lines.append(line)

        fixed_content = '\n'.join(fixed_lines)

        if fixed_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Fixed indentation in {filepath}")
            return True
        else:
            print(f"No indentation issues in {filepath}")
            return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False  # List of files that likely have indentation issues based on test failures
problematic_files = [
    "D:\\mcp\\task-manager\\backend\\crud\\users.py",
    "D:\\mcp\\task-manager\\backend\\crud\\projects.py",
    "D:\\mcp\\task-manager\\backend\\config\\app_config.py",
    "D:\\mcp\\task-manager\\backend\\crud\\tasks.py",
    "D:\\mcp\\task-manager\\backend\\crud\\agents.py",
    "D:\\mcp\\task-manager\\backend\\crud\\audit_logs.py",
    "D:\\mcp\\task-manager\\backend\\crud\\comments.py",
    "D:\\mcp\\task-manager\\backend\\services\\user_service.py",
    "D:\\mcp\\task-manager\\backend\\services\\project_service.py",
    "D:\\mcp\\task-manager\\backend\\services\\task_service.py"
]

if __name__ == "__main__":
    print("Fixing indentation in project files...")
    for filepath in problematic_files:
        if os.path.exists(filepath):
            fix_indentation_in_file(filepath)
        else:
            print(f"File not found: {filepath}")
