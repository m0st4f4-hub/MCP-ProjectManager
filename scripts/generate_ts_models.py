from pathlib import Path
import sys

# Ensure project root on path before imports
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.main import _rebuild_models
import pydantic2ts

# Rebuild models to resolve forward references
try:
    _rebuild_models()
except Exception as exc:
    print(f"Warning: could not rebuild models: {exc}")

OUTPUT_PATH = ROOT / 'frontend' / 'src' / 'types' / 'generated.ts'

pydantic2ts.generate_typescript_defs('backend.schemas', str(OUTPUT_PATH))
print(f"TypeScript definitions generated at {OUTPUT_PATH}")

