#!/usr/bin/env python3
"""
Automated flake8 fixer for the task-manager backend
Fixes common formatting issues automatically
"""

import os
import re
import subprocess
import sys
from pathlib import Path


def fix_whitespace_issues(content):
    """Fix whitespace-related issues"""
    lines = content.split('\n')
    fixed_lines = []

    for i, line in enumerate(lines):  # Fix trailing whitespace (W291)
        line = line.rstrip()  # Fix blank lines with whitespace (W293)
        if line.strip() == '':
            line = ''

        fixed_lines.append(line)  # Ensure file ends with single newline (W292)
    content = '\n'.join(fixed_lines)
    if content and not content.endswith('\n'):
        content += '\n'

    return content


def fix_import_spacing(content):
    """Fix spacing around imports and function definitions"""
    lines = content.split('\n')
    fixed_lines = []

    i = 0
    while i < len(lines):
        line = lines[i]  # Add 2 blank lines before class/function definitions (E302)
        if (re.match(r'^(class|def|async def)\s+', line) and
            i > 0 and
            not lines[i-1].strip() == '' and
            not lines[i-1].startswith(('    ', '\t'))):  # Not indented (top-level)  # Count existing blank lines
            blank_count = 0
            j = i - 1
            while j >= 0 and lines[j].strip() == '':
                blank_count += 1
                j -= 1  # If we need more blank lines
            if blank_count < 2:
                for _ in range(2 - blank_count):
                    fixed_lines.append('')

        fixed_lines.append(line)
        i += 1

    return '\n'.join(fixed_lines)


def fix_inline_comments(content):
    """Fix spacing before inline comments (E261)"""  # Add at least two spaces before inline comments
    content = re.sub(r'(\S)\s*  #([^  #])', r'\1  #\2', content)
    return content


def fix_continuation_lines(content):
    """Fix some basic continuation line issues"""
    lines = content.split('\n')
    fixed_lines = []

    for line in lines:  # Basic indentation fix for continuation lines
        if line.strip() and not line.startswith('    ') and line.startswith('  ') and not line.startswith('  #'):  # This is a very basic heuristic - in practice, we'd need more complex logic
            pass
        fixed_lines.append(line)

    return '\n'.join(fixed_lines)


def fix_line_length(content):
    """Fix basic line length issues where possible"""
    lines = content.split('\n')
    fixed_lines = []

    for line in lines:  # Only try to fix very long import lines by splitting them
        if len(line) > 88 and line.strip().startswith('from ') and ' import ' in line:
            parts = line.split(' import ')
            if len(parts) == 2:
                from_part = parts[0]
                import_part = parts[1]  # If imports are comma-separated, try to split them
                if ',' in import_part and len(line) > 100:
                    imports = [imp.strip() for imp in import_part.split(',')]
                    if len(imports) > 2:
                        fixed_lines.append(from_part + ' import (')
                        for imp in imports[:-1]:
                            fixed_lines.append(f'    {imp},')
                        fixed_lines.append(f'    {imports[-1]}')
                        fixed_lines.append(')')
                        continue

        fixed_lines.append(line)

    return '\n'.join(fixed_lines)


def remove_unused_imports(file_path):
    """Remove unused imports using autoflake"""
    try:
        subprocess.run([
            sys.executable, '-m', 'autoflake',
            '--remove-all-unused-imports',
            '--in-place',
            str(file_path)
        ], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):  # autoflake not available or failed, skip
        pass


def fix_file(file_path):
    """Fix a single Python file"""
    print(f"Fixing {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()  # Apply fixes
        content = fix_whitespace_issues(content)
        content = fix_inline_comments(content)
        content = fix_import_spacing(content)  # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)  # Try to remove unused imports
        remove_unused_imports(file_path)

    except Exception as e:
        print(f"Error fixing {file_path}: {e}")


def main():
    """Main function"""
    backend_dir = Path(__file__).parent  # Get all Python files
    python_files = []
    for root, dirs, files in os.walk(backend_dir):  # Skip certain directories
        if any(skip in root for skip in ['.venv', '__pycache__', '.pytest_cache', 'versions.bak']):
            continue

        for file in files:
            if file.endswith('.py'):
                python_files.append(Path(root) / file)

    print(f"Found {len(python_files)} Python files to fix")  # Fix each file
    for file_path in python_files:
        fix_file(file_path)

    print("Done! Run flake8 again to see remaining issues.")


if __name__ == "__main__":
    main()
