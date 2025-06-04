#!/usr/bin/env python3
"""Fix indentation issues in MCP core router."""

import re

def fix_indentation(content):
    """Fix common indentation issues."""
    lines = content.split('\n')
    fixed_lines = []
    in_try_block = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # If we find a try: statement, mark that we're in a try block
        if stripped.endswith('try:'):
            in_try_block = True
            fixed_lines.append(line)
            continue
        
        # If we're in a try block and find a line that should be indented
        if in_try_block:
            # Find lines that should be indented but aren't
            if stripped and not line.startswith('    ') and not stripped.startswith('except') and not stripped.startswith('finally'):
                # Ensure proper indentation (4 spaces)
                fixed_lines.append('    ' + stripped)
            else:
                fixed_lines.append(line)
            
            # Exit try block on except, finally, or function definition
            if stripped.startswith('except') or stripped.startswith('finally') or stripped.startswith('def ') or stripped.startswith('@'):
                in_try_block = False
        else:
            fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

if __name__ == "__main__":
    # Read the file
    with open(r'D:\mcp\task-manager\backend\routers\mcp\core.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix indentation
    fixed_content = fix_indentation(content)
    
    # Write back
    with open(r'D:\mcp\task-manager\backend\routers\mcp\core.py', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("Fixed indentation in MCP core router")
