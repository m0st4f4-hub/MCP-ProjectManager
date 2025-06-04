#!/usr/bin/env python3
"""Fix indentation issues in memory_service.py"""

def fix_indentation(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    in_class = False
    in_method = False
    base_indent = 0
    
    for line in lines:
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            fixed_lines.append(line)
            continue
            
        # Detect class definitions
        if stripped.startswith('class '):
            in_class = True
            base_indent = 0
            fixed_lines.append(line)
            continue
            
        # Detect method definitions
        if stripped.startswith('def '):
            if in_class:
                in_method = True
                base_indent = 4
                if not line.startswith('    '):
                    line = '    ' + stripped + '\n'
            else:
                base_indent = 0
            fixed_lines.append(line)
            continue
            
        # Handle other lines based on context
        if in_method:
            # If line starts with keywords that need specific indentation
            if stripped.startswith(('if ', 'elif ', 'else:', 'try:', 'except', 'finally:', 'for ', 'while ', 'with ')):
                if not line.startswith('        '):  # Should be 8 spaces in method
                    line = '        ' + stripped + '\n'
            elif stripped.startswith(('return ', 'raise ', 'pass', 'break', 'continue')):
                if not line.startswith('        '):  # Should be 8 spaces in method
                    line = '        ' + stripped + '\n'
            else:
                # Regular statements in method should be indented to 8 spaces
                # If it's inside an if/try block, it should be 12 spaces
                current_indent = len(line) - len(line.lstrip())
                if current_indent < 8:
                    line = '        ' + stripped + '\n'
                elif stripped and line.startswith((' ' * 4, ' ' * 8)) and not line.startswith('        '):
                    # Fix common bad indentations
                    line = '        ' + stripped + '\n'
                    
        fixed_lines.append(line)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)

if __name__ == '__main__':
    fix_indentation('D:\\mcp\\task-manager\\backend\\services\\memory_service.py')
    print("Fixed indentation in memory_service.py")
