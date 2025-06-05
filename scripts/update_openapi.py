from pathlib import Path
import sys
import json

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.main import app  # noqa: E402

OUTPUT_PATH = Path(__file__).resolve().parents[1] / "backend" / "openapi.json"

schema = app.openapi()
OUTPUT_PATH.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
print(f"OpenAPI schema written to {OUTPUT_PATH}")
