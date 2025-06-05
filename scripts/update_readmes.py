import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

START_MARK = "<!-- File List Start -->"
END_MARK = "<!-- File List End -->"

IGNORED_DIRS = {".venv", "node_modules", ".next", "__pycache__", ".git", ".github"}

for dirpath, dirnames, filenames in os.walk(REPO_ROOT):
    if "README.md" not in filenames:
        continue

    readme_path = Path(dirpath) / "README.md"

    subdirs = [
        f"{d}/" for d in dirnames
        if d not in IGNORED_DIRS and not d.startswith(".")
    ]
    files = [f for f in filenames if f != "README.md"]
    entries = sorted(subdirs + files)

    lines = [START_MARK, "## File List", ""]
    lines += [f"- `{name}`" for name in entries]
    lines += ["", END_MARK, ""]

    new_block = "\n".join(lines)
    text = readme_path.read_text()

    if START_MARK in text and END_MARK in text:
        start_idx = text.index(START_MARK)
        end_idx = text.index(END_MARK) + len(END_MARK)
        text = text[:start_idx] + new_block + text[end_idx:]
    else:
        if not text.endswith("\n"):
            text += "\n"
        text += "\n" + new_block

    readme_path.write_text(text)

print("README files updated.")
