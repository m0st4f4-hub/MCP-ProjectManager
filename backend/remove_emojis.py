#!/usr/bin/env python3
"""
Remove emoji characters from backend files.
"""

import os
import re
from pathlib import Path

def remove_emojis_from_file(file_path: Path):
 """Remove emoji characters from a file."""
 try:
 with open(file_path, 'r', encoding='utf-8') as f:
 content = f.read()
 
 original_content = content
 
 # Remove common emojis from logging and code
 emoji_patterns = [
 r'', # magnifying glass
 r'', # siren
 r'', # check mark
 r'', # cross mark
 r'', # warning
 r'', # memo
 r'', # target
 r'', # wrench
 ]
 
 for emoji in emoji_patterns:
 content = content.replace(emoji, '')
 
 # Clean up extra spaces that might be left
 content = re.sub(r' +', ' ', content)
 
 if content != original_content:
 with open(file_path, 'w', encoding='utf-8') as f:
 f.write(content)
 print(f"Removed emojis from {file_path}")
 return True
 
 except Exception as e:
 print(f"Error processing {file_path}: {e}")
 return False
 
 return False

def main():
 """Main function to remove emojis from backend files."""
 backend_dir = Path("D:/mcp/task-manager/backend")
 
 files_processed = 0
 files_fixed = 0
 
 # Process Python files
 for py_file in backend_dir.rglob("*.py"):
 if py_file.name.startswith('__pycache__'):
 continue
 files_processed += 1
 if remove_emojis_from_file(py_file):
 files_fixed += 1
 
 print(f"Processed {files_processed} files, fixed {files_fixed} files")

if __name__ == "__main__":
 main()
