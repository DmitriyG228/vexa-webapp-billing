from __future__ import annotations

import json
from typing import Any, Dict, Optional

import os
import ssl as _ssl

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from .config import DATABASE_URL

# ── Engine ───────────────────────────────────────────────────────────────────
# DATABASE_URL is optional — if not set, DB features are disabled (Phase 1 compat)
# Also supports individual DB_* env vars (like the admin API uses)

_engine = None
_session_factory = None


def _build_url_and_args():
    """Build asyncpg connection URL and connect_args.

    Handles:
    - DATABASE_URL or individual DB_* env vars
    - SSL via connect_args (asyncpg doesn't accept ssl= in URL)
    - pgbouncer: statement_cache_size=0
    """
    db_host = os.environ.get("DB_HOST")
    db_port = os.environ.get("DB_PORT")
    db_name = os.environ.get("DB_NAME")
    db_user = os.environ.get("DB_USER")
    db_password = os.environ.get("DB_PASSWORD")
    db_ssl_mode = os.environ.get("DB_SSL_MODE", "")

    if db_host and db_user:
        # Build URL from individual vars (no SSL in URL — handled via connect_args)
        url = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        needs_ssl = db_ssl_mode.lower() in ("require", "prefer", "verify-ca", "verify-full")
    elif DATABASE_URL:
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        needs_ssl = "ssl=require" in url or "ssl=true" in url
        # Strip ssl param from URL — asyncpg doesn't accept it
        url = url.replace("?ssl=require", "").replace("&ssl=require", "")
        url = url.replace("?ssl=true", "").replace("&ssl=true", "")
    else:
        raise RuntimeError("DATABASE_URL not configured — DB features unavailable")

    connect_args: dict = {"statement_cache_size": 0}
    if needs_ssl:
        ctx = _ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = _ssl.CERT_NONE
        connect_args["ssl"] = ctx

    return url, connect_args


def _get_engine():
    global _engine, _session_factory
    if _engine is None:
        url, connect_args = _build_url_and_args()
        _engine = create_async_engine(url, pool_size=5, max_overflow=5, connect_args=connect_args)
        _session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    return _engine, _session_factory


def get_session() -> AsyncSession:
    _, factory = _get_engine()
    return factory()


# ── Helpers ──────────────────────────────────────────────────────────────────

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Read user row from public.users by email."""
    async with get_session() as session:
        result = await session.execute(
            text("SELECT id, email, data, max_concurrent_bots FROM public.users WHERE email = :email"),
            {"email": email},
        )
        row = result.mappings().first()
        if row:
            return dict(row)
        return None


async def get_user_data(email: str) -> Dict[str, Any]:
    """Read just the JSONB data column for a user."""
    user = await get_user_by_email(email)
    if user:
        return user.get("data") or {}
    return {}


async def merge_user_data(email: str, patch: Dict[str, Any]) -> None:
    """Atomic JSONB merge: UPDATE ... SET data = data || $patch.
    No read-modify-write race — Postgres handles the merge atomically.
    """
    async with get_session() as session:
        await session.execute(
            text("UPDATE public.users SET data = COALESCE(data, CAST('{}' AS jsonb)) || CAST(:patch AS jsonb) WHERE email = :email"),
            {"email": email, "patch": json.dumps(patch)},
        )
        await session.commit()


async def merge_user_data_by_id(user_id: int, patch: Dict[str, Any]) -> None:
    """Atomic JSONB merge by user ID."""
    async with get_session() as session:
        await session.execute(
            text("UPDATE public.users SET data = COALESCE(data, CAST('{}' AS jsonb)) || CAST(:patch AS jsonb) WHERE id = :user_id"),
            {"user_id": user_id, "patch": json.dumps(patch)},
        )
        await session.commit()
