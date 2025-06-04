#!/usr/bin/env python3
"""
Comprehensive flake8 fixer for task-manager backend.
Fixes issues systematically to comply with strict flake8 rules.
"""

import os
import re
import ast
import subprocess
from pathlib import Path
from typing import List, Dict


class FlakeFixer:
def __init__(self, backend_dir: Path):
        self.backend_dir = backend_dir
        self.models_imports = set()
        self.schema_imports = set()

def get_python_files(self) -> List[Path]:
        """Get all Python files to process."""
        files = []
        for root, dirs, filenames in os.walk(self.backend_dir):
            # Skip certain directories
            dirs[:] = [d for d in dirs if d not in {
                '.venv', '__pycache__', '.pytest_cache',
                'versions.bak-20250524220645', 'versions.bak-20250524220718'
            }]

            for filename in filenames:
                if filename.endswith('.py'):
                    files.append(Path(root) / filename)
        return files

def fix_unused_imports(self, content: str) -> str:
        """Remove unused imports while preserving needed ones."""
        lines = content.split('\n')

        # Parse the AST to find used names
        try:
            tree = ast.parse(content)
        except SyntaxError:
            return content

        used_names = set()
        imported_names = {}

class NameVisitor(ast.NodeVisitor):
def visit_Name(self, node):
                used_names.add(node.id)
                self.generic_visit(node)

def visit_Attribute(self, node):
                if isinstance(node.value, ast.Name):
                    used_names.add(node.value.id)
                self.generic_visit(node)

class ImportVisitor(ast.NodeVisitor):
def visit_Import(self, node):
                for alias in node.names:
                    name = alias.asname or alias.name
                    imported_names[name] = node.lineno - 1

def visit_ImportFrom(self, node):
                for alias in node.names:
                    name = alias.asname or alias.name
                    imported_names[name] = node.lineno - 1

        ImportVisitor().visit(tree)
        NameVisitor().visit(tree)

        # Keep imports that are used or are common exceptions
        keep_imports = {
            'logger', 'logging', 'asyncio', 'typing', 'Optional', 'List',
            'Dict', 'Any', 'Union', 'AsyncSession', 'Session', 'HTTPException',
            'Depends', 'Query', 'Path', 'Body', 'status', 'select', 'delete',
            'update', 'and_', 'or_', 'func', 'desc', 'asc'
        }

        lines_to_remove = set()
        for name, line_idx in imported_names.items():
            if (name not in used_names and
                name not in keep_imports and
                not name.startswith('_') and
                'test' not in name.lower()):
                lines_to_remove.add(line_idx)

        # Remove unused import lines
        filtered_lines = []
        for i, line in enumerate(lines):
            if i not in lines_to_remove:
                filtered_lines.append(line)

        return '\n'.join(filtered_lines)

def fix_line_length(self, content: str) -> str:
        """Fix line length issues."""
        lines = content.split('\n')
        fixed_lines = []

        for line in lines:
            if len(line) <= 88:
                fixed_lines.append(line)
                continue

            # Try to fix import lines
            if 'import' in line and len(line) > 88:
                if ' import ' in line and '(' not in line:
                    parts = line.split(' import ')
                    if len(parts) == 2:
                        from_part = parts[0]
                        import_part = parts[1]

                        if ',' in import_part:
                            imports = [imp.strip() for imp in import_part.split(',')]
                            if len(imports) > 1:
                                fixed_lines.append(from_part + ' import (')
                                for imp in imports[:-1]:
                                    fixed_lines.append(f'    {imp},')
                                fixed_lines.append(f'    {imports[-1]}')
                                fixed_lines.append(')')
                                continue

            # Try to break long string lines
            if '=' in line and '"' in line and len(line) > 88:
                indent = len(line) - len(line.lstrip())
                if line.count('"') >= 2:
                    # Simple string break
                    parts = line.split('"')
                    if len(parts) >= 3:
                        prefix = parts[0] + '"'
                        middle = parts[1]
                        suffix = '"' + '"'.join(parts[2:])

                        if len(prefix + middle[:40] + '..."') <= 88:
                            break_point = 40
                            while break_point < len(middle) and middle[break_point] != ' ':
                                break_point += 1

                            if break_point < len(middle):
                                fixed_lines.append(prefix + middle[:break_point] + '"')
                                fixed_lines.append(' ' * (indent + 4) + '"' + middle[break_point:].lstrip() + suffix)
                                continue

            # If we can't fix it, just keep the original line
            fixed_lines.append(line)

        return '\n'.join(fixed_lines)

def fix_whitespace(self, content: str) -> str:
        """Fix whitespace issues."""
        lines = content.split('\n')
        fixed_lines = []

        for line in lines:
            # Remove trailing whitespace
            line = line.rstrip()

            # Fix inline comment spacing
            if '  #' in line and not line.strip().startswith('#'):
                parts = line.split('  #', 1)
                if len(parts) == 2:
                    code_part = parts[0].rstrip()
                    comment_part = parts[1]
                    if code_part and not code_part.endswith('  '):
                        line = code_part + '  #' + comment_part

            fixed_lines.append(line)

        # Ensure file ends with single newline
        content = '\n'.join(fixed_lines)
        if content and not content.endswith('\n'):
            content += '\n'

        return content

def fix_indentation(self, content: str) -> str:
        """Fix basic indentation issues."""
        lines = content.split('\n')
        fixed_lines = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            if not stripped:
                fixed_lines.append('')
                continue

            # Calculate expected indent based on previous lines
            if stripped.startswith(('def ', 'class ', 'async def ')):
                # Function/class definition
                if indent_level > 0:
                    fixed_lines.append('    ' * indent_level + stripped)
                else:
                    fixed_lines.append(stripped)
            elif stripped.startswith(('if ', 'for ', 'while ', 'with ', 'try:', 'except', 'else:', 'elif ')):
                # Control structures
                current_indent = len(line) - len(line.lstrip())
                if current_indent % 4 != 0:
                    # Fix to nearest 4-space boundary
                    new_indent = (current_indent // 4) * 4
                    fixed_lines.append(' ' * new_indent + stripped)
                else:
                    fixed_lines.append(line)
            else:
                # Regular line - preserve indentation if it looks reasonable
                current_indent = len(line) - len(line.lstrip())
                if current_indent % 4 == 0 or current_indent == 0:
                    fixed_lines.append(line)
                else:
                    # Fix to nearest 4-space boundary
                    new_indent = (current_indent // 4) * 4
                    fixed_lines.append(' ' * new_indent + stripped)

        return '\n'.join(fixed_lines)

def fix_blank_lines(self, content: str) -> str:
        """Fix blank line issues."""
        lines = content.split('\n')
        fixed_lines = []

        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            # Add blank lines before class/function definitions
            if (stripped.startswith(('def ', 'class ', 'async def ')) and
                i > 0 and
                lines[i-1].strip() != '' and
                not lines[i-1].strip().startswith('@')):  # Not a decorator

                # Count existing blank lines
                blank_count = 0
                j = i - 1
                while j >= 0 and lines[j].strip() == '':
                    blank_count += 1
                    j -= 1

                # Add missing blank lines for top-level definitions
                if line.startswith(('def ', 'class ', 'async def ')) and blank_count < 2:
                    for _ in range(2 - blank_count):
                        fixed_lines.append('')
                elif not line.startswith(' ') and blank_count < 1:
                    fixed_lines.append('')

            fixed_lines.append(line)
            i += 1

        # Remove excessive blank lines (more than 2)
        final_lines = []
        blank_count = 0

        for line in fixed_lines:
            if line.strip() == '':
                blank_count += 1
                if blank_count <= 2:
                    final_lines.append(line)
            else:
                blank_count = 0
                final_lines.append(line)

        return '\n'.join(final_lines)

def fix_file(self, file_path: Path) -> bool:
        """Fix a single file."""
        print(f"Fixing {file_path}")

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Apply fixes in order
            content = self.fix_whitespace(content)
            content = self.fix_blank_lines(content)
            content = self.fix_line_length(content)
            content = self.fix_indentation(content)
            content = self.fix_unused_imports(content)

            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            return True

        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
            return False

def run(self):
        """Run the fixer on all files."""
        files = self.get_python_files()
        print(f"Fixing {len(files)} Python files...")

        success_count = 0
        for file_path in files:
            if self.fix_file(file_path):
                success_count += 1

        print(f"Successfully fixed {success_count}/{len(files)} files")


if __name__ == "__main__":
    backend_dir = Path(__file__).parent
    fixer = FlakeFixer(backend_dir)
    fixer.run()
