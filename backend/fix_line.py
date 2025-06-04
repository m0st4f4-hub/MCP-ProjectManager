with open('D:/mcp/task-manager/backend/services/memory_service.py', 'r') as f:
    lines = f.readlines()

# Fix line 77 (index 76) indentation
for i, line in enumerate(lines):
    if 'file_content = f"Binary file:' in line and not line.startswith('        '):
        lines[i] = '                ' + line.lstrip()
        break

with open('D:/mcp/task-manager/backend/services/memory_service.py', 'w') as f:
    f.writelines(lines)

print('Fixed binary file line indentation')
