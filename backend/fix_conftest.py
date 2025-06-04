#!/usr/bin/env python3


def fix_conftest_indentation():
    filepath = "D:\\mcp\\task-manager\\backend\\tests\\conftest.py"

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    fixed_lines = []

    for i, line in enumerate(lines):  # Skip empty lines
        if not line.strip():
            fixed_lines.append(line)
            continue  # Count leading spaces
        leading_spaces = len(line) - len(line.lstrip())  # If line starts with single space, convert to 4 spaces
        if line.startswith(' ') and not line.startswith('  '):
            fixed_line = '    ' + line[1:]
            fixed_lines.append(fixed_line)  # If line has inconsistent indentation patterns, fix them
        elif leading_spaces > 0 and leading_spaces % 4 != 0:  # Round to nearest multiple of 4
            new_indent = ((leading_spaces + 2) // 4) * 4
            fixed_line = ' ' * new_indent + line.lstrip()
            fixed_lines.append(fixed_line)
        else:
            fixed_lines.append(line)

    fixed_content = '\n'.join(fixed_lines)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    print("Fixed conftest.py indentation comprehensively")

if __name__ == "__main__":
    fix_conftest_indentation()
