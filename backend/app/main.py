"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import Settings
from app.deps import get_settings
from app.routers import (
    admin,
    alerts,
    assignments,
    auth,
    devices,
    ingest,
    models_cfg,
    ops,
    settings as settings_router,
    users,
    ws,
)


def create_app(settings: Settings) -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Smart Home Cloud Platform API",
        description="Backend API for Smart Home Cloud Platform",
        version="0.1.0",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(assignments.router)
    app.include_router(devices.router)
    app.include_router(ingest.router)
    app.include_router(alerts.router)
    app.include_router(settings_router.router)
    app.include_router(models_cfg.router)
    app.include_router(ops.router)
    app.include_router(admin.router)
    app.include_router(ws.router)

    @app.get("/healthz")
    async def health_check():
        """Health check endpoint."""
        return {"status": "ok"}

    return app


# Create app instance
settings = get_settings()
app = create_app(settings)

