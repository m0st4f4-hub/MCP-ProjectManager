import logging
import logging.config
from fastapi import FastAPI, Request, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from contextlib import asynccontextmanager
from typing import Dict, Any

from .database import get_db, Base, engine
from .middleware import init_middleware

# Optional MCP integration
try:
    from fastapi_mcp import FastApiMCP
except ImportError:
    FastApiMCP = None

log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "uvicorn_standard": {
            "fmt": "%(asctime)s - %(levelname)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "uvicorn_standard",
            "stream": "ext://sys.stderr"
        }
    },
    "loggers": {
        "uvicorn": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["console"], "level": "INFO", "propagate": False}
    }
}
logging.config.dictConfig(log_config)
logger = logging.getLogger(__name__)


def include_app_routers(app: FastAPI):
    from .routers import (
        users, projects, tasks, comments, agents, memory,
        mcp, rules, project_templates, audit_logs
    )
    from .routers.admin import router as admin_router
    from .routers.users.auth.auth import router as auth_router

    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(admin_router, prefix="/api/v1", tags=["admin"])
    app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
    app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
    app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
    app.include_router(comments.router, prefix="/api/comments", tags=["comments"])
    app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
    app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
    app.include_router(mcp.router, prefix="/api/mcp", tags=["mcp"])
    app.include_router(rules.router, prefix="/api/rules", tags=["rules"])
    app.include_router(
        project_templates.router,
        prefix="/api/templates",
        tags=["templates"],
    )
    app.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["audit-logs"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting backend initialization...")

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

    yield

    logger.info("Shutting down...")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Task Manager API",
        version="2.0.0",
        description="Task Manager with MCP integration",
        openapi_url="/openapi.json",
        docs_url=None,
        redoc_url=None,
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    init_middleware(app)
    include_app_routers(app)

    _rebuild_models()

    if FastApiMCP is not None:
        mcp = FastApiMCP(
            app,
            name="Task Manager MCP",
            description="MCP server for task manager",
        )
        mcp.mount()
        app.state.mcp_instance = mcp
    else:
        class MockMCP:
            tools = {}
        app.state.mcp_instance = MockMCP()

    _define_custom_routes(app)
    return app


def _rebuild_models():
    try:
        from .schemas.task import Task
        from .schemas.project import Project
        from .schemas.agent import Agent, AgentRule
        from .schemas.task_dependency import TaskDependency
        from .schemas.comment import Comment
        from .schemas.file_association import TaskFileAssociation
        from .schemas.memory import MemoryEntity
        from .schemas.user import User
        from .schemas.task_status import TaskStatus

        for model in [Task, Project, Agent, AgentRule, TaskDependency, Comment,
                      TaskFileAssociation, MemoryEntity, User, TaskStatus]:
            model.model_rebuild()
        logger.info("Pydantic models rebuilt successfully.")
    except Exception as e:
        logger.warning(f"Pydantic model rebuild failed: {e}")


def _define_custom_routes(app: FastAPI):
    from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html

    @app.get("/", tags=["Health"])
    async def root():
        return {"message": "Welcome to the Task Manager API"}

    @app.get("/health", status_code=status.HTTP_200_OK)
    async def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
        try:
            db.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
        except Exception as e:
            logger.error(f"Health check DB error: {e}")
            return {"status": "healthy", "database": "error"}

    @app.get("/docs", include_in_schema=False)
    async def custom_docs():
        html = get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=app.title + " - Swagger UI",
            oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        )
        return Response(content=html.body, media_type="text/html")

    @app.get("/redoc", include_in_schema=False)
    async def custom_redoc():
        html = get_redoc_html(
            openapi_url=app.openapi_url,
            title=app.title + " - ReDoc",
        )
        return Response(content=html.body, media_type="text/html")

    @app.get("/test-mcp")
    async def test_mcp(request: Request) -> Dict[str, Any]:
        return {
            "message": "MCP Test Endpoint",
            "headers": dict(request.headers),
            "client_host": request.client.host if request.client else "unknown"
        }

    @app.get("/mcp-docs", tags=["MCP"])
    async def mcp_docs(request: Request):
        mcp_instance = getattr(app.state, "mcp_instance", None)
        tools = getattr(mcp_instance, "tools", {}) if mcp_instance else {}

        routes = []
        for route in app.routes:
            if route.path in ["/openapi.json", "/docs", "/redoc"]:
                continue
            methods = list(route.methods) if hasattr(route, "methods") else []
            routes.append({
                "path": route.path,
                "name": getattr(route, "name", ""),
                "description": getattr(route, "description", ""),
                "methods": methods
            })

        md = ["# MCP Project Manager Tools Documentation", "## Tools"]
        for tool_name, tool_info in (tools.items() if isinstance(tools, dict) else []):
            md.append(f"- **{tool_name}**: {tool_info.get('description', '')}")
        if not tools:
            md.append("No tools registered.")

        md.append("## Routes")
        for r in routes:
            md.append(
                f"- `{r['path']}` ({', '.join(r['methods'])}): "
                f"{r['name']} - {r['description']}"
            )

        return {
            "tools": tools,
            "routes": routes,
            "mcp_project_manager_tools_documentation": "\n".join(md)
        }


app = FastAPI()
