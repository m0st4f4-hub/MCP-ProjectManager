"""
Script to analyze and report async/await issues in the backend tests.
Run this to get a comprehensive list of functions that need to be made async.
"""

import os
import re
from pathlib import Path

def find_async_issues(directory):
    """Find potential async/await issues in Python files."""
    issues = []
    
    # Patterns to look for
    patterns = {
        'unawaited_crud': re.compile(r'(?<!await\s)(get_project|get_agent|get_task|create_task|update_task|delete_task|get_projects|project_exists|agent_exists)\s*\('),
        'sync_session_in_async': re.compile(r'Session\s*[,)]'),
        'missing_async_decorator': re.compile(r'^def\s+test_.*\(.*async_db_session.*\):'),
        'unawaited_session': re.compile(r'(?<!await\s)db\.(commit|refresh|execute|scalar|scalars)\s*\('),
    }
    
    for root, dirs, files in os.walk(directory):
        # Skip __pycache__ and .venv directories
        dirs[:] = [d for d in dirs if d not in ['__pycache__', '.venv', '.pytest_cache']]
        
        for file in files:
            if file.endswith('.py'):
                filepath = Path(root) / file
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.split('\n')
                        
                    for line_num, line in enumerate(lines, 1):
                        for issue_type, pattern in patterns.items():
                            if pattern.search(line):
                                # Check if this is in an async function
                                is_async_context = False
                                for i in range(max(0, line_num - 20), line_num):
                                    if i < len(lines) and ('async def' in lines[i] or '@pytest.mark.asyncio' in lines[i]):
                                        is_async_context = True
                                        break
                                
                                issues.append({
                                    'file': str(filepath),
                                    'line': line_num,
                                    'type': issue_type,
                                    'content': line.strip(),
                                    'is_async_context': is_async_context
                                })
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
    
    return issues

def main():
    # Analyze the backend directory
    backend_dir = Path(__file__).parent
    issues = find_async_issues(backend_dir)
    
    # Group issues by type
    by_type = {}
    for issue in issues:
        issue_type = issue['type']
        if issue_type not in by_type:
            by_type[issue_type] = []
        by_type[issue_type].append(issue)
    
    # Report findings
    print("=== Async/Await Issues Analysis ===\n")
    
    for issue_type, items in by_type.items():
        print(f"\n{issue_type.upper()} ({len(items)} issues):")
        print("-" * 50)
        
        # Show first 10 examples
        for item in items[:10]:
            ctx = "ASYNC" if item['is_async_context'] else "SYNC"
            print(f"{item['file']}:{item['line']} [{ctx}]")
            print(f"  {item['content']}")
        
        if len(items) > 10:
            print(f"  ... and {len(items) - 10} more")
    
    # Summary
    print("\n\n=== SUMMARY ===")
    total = sum(len(items) for items in by_type.values())
    print(f"Total issues found: {total}")
    
    # Recommendations
    print("\n=== RECOMMENDATIONS ===")
    print("1. Convert all CRUD functions to async")
    print("2. Add @pytest.mark.asyncio to all test functions using async_db_session")
    print("3. Add 'await' to all CRUD function calls")
    print("4. Replace Session with AsyncSession in function signatures")
    print("5. Await all database operations (commit, refresh, execute, etc.)")

if __name__ == "__main__":
    main()
