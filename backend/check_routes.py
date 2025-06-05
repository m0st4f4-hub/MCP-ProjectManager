#!/usr/bin/env python3
"""Enumerate FastAPI routes for debugging."""

from __future__ import annotations

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.abspath("."))


def main() -> None:
    parser = argparse.ArgumentParser(description="List registered FastAPI routes")
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output routes as a JSON array",
    )
    args = parser.parse_args()

    try:
        from backend.main import app
    except Exception as e:  # pragma: no cover - simple utility
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)

    routes = []
    for route in app.routes:
        if hasattr(route, "path"):
            methods = list(getattr(route, "methods", ["GET"]))
            routes.append({"path": route.path, "methods": methods})

    if args.json:
        print(json.dumps(routes, indent=2))
    else:
        print("App imported successfully")
        print("\nRegistered routes:")
        for r in routes:
            print(f"{r['methods']} {r['path']}")
        print("\nDone")


if __name__ == "__main__":  # pragma: no cover - entry point
    main()
