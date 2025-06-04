#!/usr/bin/env python3
"""Comprehensive indentation fix for memory_service.py"""

import re

def fix_all_indentation(file_path):
    """Fix all indentation issues in the file systematically."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into lines
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # Skip empty lines
        if not line.strip():
            fixed_lines.append(line)
            continue
            
        # Get current indentation level
        indent_level = len(line) - len(line.lstrip())
        stripped = line.strip()
        
        # Class definition
        if stripped.startswith('class '):
            fixed_lines.append(line)
            continue
            
        # Method definition within class
        if stripped.startswith('def ') and i > 0:
            # Check if we're in a class (look for previous class definition)
            in_class = False
            for j in range(i-1, -1, -1):
                prev_line = lines[j].strip()
                if prev_line.startswith('class '):
                    in_class = True
                    break
                elif prev_line.startswith('def ') and not lines[j].startswith('    '):
                    break
                    
            if in_class:
                fixed_lines.append('    ' + stripped)
            else:
                fixed_lines.append(stripped)
            continue
            
        # Regular statements - determine context
        if stripped:
            # Look at previous non-empty line to determine context
            prev_indent = 0
            for j in range(i-1, -1, -1):
                if lines[j].strip():
                    prev_stripped = lines[j].strip()
                    prev_indent = len(lines[j]) - len(lines[j].lstrip())
                    
                    # If previous line ends with :, this should be indented more
                    if prev_stripped.endswith(':'):
                        if prev_stripped.startswith(('if ', 'elif ', 'else:', 'try:', 'except', 'finally:', 'for ', 'while ', 'with ', 'def ', 'class ')):
                            fixed_lines.append(' ' * (prev_indent + 4) + stripped)
                        else:
                            fixed_lines.append(' ' * prev_indent + stripped)
                    # If this line is a control structure keyword, keep same level as previous
                    elif stripped.startswith(('except', 'finally:', 'elif ', 'else:')):
                        # Find the matching try/if
                        for k in range(j, -1, -1):
                            if lines[k].strip().startswith(('try:', 'if ', 'elif ')):
                                match_indent = len(lines[k]) - len(lines[k].lstrip())
                                fixed_lines.append(' ' * match_indent + stripped)
                                break
                        else:
                            fixed_lines.append(' ' * prev_indent + stripped)
                    else:
                        fixed_lines.append(' ' * prev_indent + stripped)
                    break
            else:
                fixed_lines.append(stripped)
        else:
            fixed_lines.append(line)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))

if __name__ == '__main__':
    fix_all_indentation('D:\\mcp\\task-manager\\backend\\services\\memory_service.py')
    print("Fixed all indentation in memory_service.py")
