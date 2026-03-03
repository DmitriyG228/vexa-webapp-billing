from __future__ import annotations

import json
from typing import Any, Dict, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from .config import DATABASE_URL

# ── Engine ───────────────────────────────────────────────────────────────────
# DATABASE_URL is optional — if not set, DB features are disabled (Phase 1 compat)

_engine = None
_session_factory = None


def _get_engine():
    global _engine, _session_factory
    if _engine is None:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL not configured — DB features unavailable")
        # Convert postgres:// to postgresql+asyncpg://
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        _engine = create_async_engine(url, pool_size=5, max_overflow=5)
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
