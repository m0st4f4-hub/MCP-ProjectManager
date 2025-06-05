"""Update README files with directory contents.

This script walks the repository and injects a "File List" section into every
`README.md` it finds. The operation overwrites README files in place, so run it
only when you intend to commit the resulting changes. Directories named
`__tests__` are skipped to avoid polluting docs with test fixtures.
"""

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

START_MARK = "<!-- File List Start -->"
END_MARK = "<!-- File List End -->"

for dirpath, dirnames, filenames in os.walk(REPO_ROOT):
    # Skip test directories entirely
    dirnames[:] = [d for d in dirnames if d != "__tests__"]

    if "README.md" in filenames:
        readme_path = Path(dirpath) / "README.md"
        file_list = sorted(
            f for f in filenames if f != "README.md"
        )
        lines = [START_MARK, "## File List", ""]
        lines += [f"- `{name}`" for name in file_list]
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
