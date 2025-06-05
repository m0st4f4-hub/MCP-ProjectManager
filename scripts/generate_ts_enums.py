import enum
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKEND_ENUMS = ROOT / "backend" / "enums.py"
OUTPUT = ROOT / "frontend" / "src" / "types" / "generatedEnums.ts"

def load_enums(path: Path):
    spec = importlib.util.spec_from_file_location("backend.enums", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore
    enums = {}
    for name, obj in module.__dict__.items():
        if isinstance(obj, enum.EnumMeta):
            enums[name] = obj
    return enums

def to_ts(enums: dict) -> str:
    lines = [
        "// This file is auto-generated from backend/enums.py.",
        "// Do not edit directly.\n",
    ]
    for name, enum_cls in enums.items():
        lines.append(f"export enum {name} {{")
        for member in enum_cls:
            value = member.value
            # escape quotes
            value_str = str(value).replace('"', '\\"')
            lines.append(f"  {member.name} = \"{value_str}\",")
        lines.append("}\n")
    return "\n".join(lines)

def main():
    enums = load_enums(BACKEND_ENUMS)
    ts_content = to_ts(enums)
    OUTPUT.write_text(ts_content)
    print(f"Generated {OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
