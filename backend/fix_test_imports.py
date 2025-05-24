#!/usr/bin/env python3
"""
Script to fix imports in test files.
"""
import os
import re
import glob

def fix_imports_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace from backend import models, schemas
    content = re.sub(
        r'from backend import models, schemas',
        '# Import models\nfrom backend import models\n\n# Import specific schemas as needed',
        content
    )
    
    # Replace schemas.ProjectCreate with proper import
    if 'schemas.ProjectCreate' in content:
        content = re.sub(
            r'# Import specific schemas as needed',
            '# Import specific schemas as needed\nfrom backend.schemas.project import ProjectCreate, ProjectUpdate',
            content
        )
    
    # Replace schemas.TaskCreate with proper import
    if 'schemas.TaskCreate' in content:
        content = re.sub(
            r'# Import specific schemas as needed',
            '# Import specific schemas as needed\nfrom backend.schemas.task import TaskCreate, TaskUpdate',
            content
        )
    
    # Replace schemas.AgentCreate with proper import
    if 'schemas.AgentCreate' in content:
        content = re.sub(
            r'# Import specific schemas as needed',
            '# Import specific schemas as needed\nfrom backend.schemas.agent import AgentCreate, AgentUpdate',
            content
        )
    
    # Replace schemas.CommentCreate with proper import
    if 'schemas.CommentCreate' in content:
        content = re.sub(
            r'# Import specific schemas as needed',
            '# Import specific schemas as needed\nfrom backend.schemas.comment import CommentCreate, CommentUpdate',
            content
        )
    
    # Clean up duplicate imports
    content = re.sub(r'# Import specific schemas as needed\n# Import specific schemas as needed', 
                    '# Import specific schemas as needed', content)
    
    # Write back the updated content
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    
    return True

def fix_all_test_files():
    test_files = glob.glob('tests/test_*.py')
    test_files.extend(glob.glob('tests/*/test_*.py'))
    
    fixed_files = []
    for test_file in test_files:
        if fix_imports_in_file(test_file):
            fixed_files.append(test_file)
    
    return fixed_files

if __name__ == '__main__':
    os.chdir(os.path.abspath(os.path.dirname(__file__)))
    fixed_files = fix_all_test_files()
    print(f"Fixed imports in {len(fixed_files)} files:")
    for file in fixed_files:
        print(f"  - {file}")
