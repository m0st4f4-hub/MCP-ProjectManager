import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app_factory import create_app  # noqa: E402


def main() -> None:
    app = create_app()
    schema = app.openapi()
    out_path = ROOT / "backend" / "openapi.json"
    out_path.write_text(json.dumps(schema, indent=2))
    print(f"OpenAPI schema written to {out_path}")


if __name__ == "__main__":
    main()
