#!/usr/bin/env python3
import os
import re

def fix_imports(directory):
    """
    Recursively find and fix all 'from ' imports in Python files.
    """
    for root, _, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".py"):
                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    # Use a regular expression to find and replace the imports
                    new_content, count = re.subn(
                        r"from backend\.", 
                        "from ", 
                        content
                    )
                    
                    if count > 0:
                        print(f"🔧 Fixed {count} imports in {filepath}")
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(new_content)
                except Exception as e:
                    print(f"❌ Error processing {filepath}: {e}")

if __name__ == "__main__":
    backend_directory = "."  # We are already in the backend directory
    print(f"🚀 Starting import fixup in '{backend_directory}'...")
    fix_imports(backend_directory)
    print("✅ Import fixup complete!") 
