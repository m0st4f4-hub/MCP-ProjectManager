import json
from pathlib import Path

ROOT = Path('backend/docs/fastapi_mcp')
TEMPLATE = {
    "$schema": "https://mintlify.com/docs.json",
    "name": "FastAPI MCP",
    "background": {
        "color": {"dark": "#222831", "light": "#EEEEEE"},
        "decoration": "windows"
    },
    "colors": {"primary": "#6d45dc", "light": "#9f8ded", "dark": "#6a42d7"},
    "description": "Convert your FastAPI app into a MCP server with zero configuration",
}

GROUPS = {
    "getting-started": [
        "welcome",
        "installation",
        "quickstart",
        "FAQ",
        "best-practices",
    ],
    "configurations": [
        "tool-naming",
        "customization",
    ],
    "advanced": [
        "auth",
        "deploy",
        "refresh",
        "transport",
    ],
}
TITLE_MAP = {
    "getting-started": "Getting Started",
    "configurations": "Configurations",
    "advanced": "Advanced Usage",
}

navigation_groups = []
for folder, files in GROUPS.items():
    pages = [
        f"{folder}/{name}"
        for name in files
        if (ROOT / folder / f"{name}.md").exists()
    ]
    navigation_groups.append({"group": TITLE_MAP[folder], "pages": pages})

docs_json = TEMPLATE | {
    "navigation": {
        "groups": navigation_groups,
        "global": {
            "anchors": [
                {
                    "anchor": "Documentation",
                    "href": "https://fastapi-mcp.tadata.com/",
                    "icon": "book-open-cover",
                },
                {
                    "anchor": "Community",
                    "href": (
                        "https://join.slack.com/t/themcparty/"
                        "shared_invite/zt-30yxr1zdi-2FG~XjBA0xIgYSYuKe7~Xg"
                    ),
                    "icon": "slack",
                },
                {
                    "anchor": "Blog",
                    "href": "https://medium.com/@miki_45906",
                    "icon": "newspaper",
                },
            ]
        }
    },
    "navbar": {
        "primary": {
            "href": "https://github.com/tadata-org/fastapi_mcp",
            "type": "github",
        }
    },
    "footer": {
        "socials": {
            "x": "https://x.com/makhlevich",
            "github": "https://github.com/tadata-org/fastapi_mcp",
            "website": "https://tadata.com/",
        }
    },
    "theme": "mint",
}

with open(ROOT / 'docs.json', 'w', encoding='utf-8') as f:
    json.dump(docs_json, f, indent=2)
    f.write('\n')

print('docs.json regenerated')
