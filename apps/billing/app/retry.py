"""Exponential backoff retry for async operations."""
from __future__ import annotations

import asyncio
import random
from typing import TypeVar, Callable, Any

T = TypeVar("T")

MAX_RETRIES = 3
BASE_DELAY = 1.0  # seconds
MAX_DELAY = 10.0

# Exceptions worth retrying (transient network / rate-limit errors)
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def _is_retryable(exc: Exception) -> bool:
    """Check if an exception is transient and worth retrying."""
    import httpx
    import stripe

    if isinstance(exc, httpx.TimeoutException):
        return True
    if isinstance(exc, httpx.ConnectError):
        return True
    if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code in _RETRYABLE_STATUS_CODES:
        return True
    if isinstance(exc, stripe.error.RateLimitError):
        return True
    if isinstance(exc, stripe.error.APIConnectionError):
        return True
    if isinstance(exc, (stripe.error.APIError,)) and getattr(exc, "http_status", None) in _RETRYABLE_STATUS_CODES:
        return True
    return False


async def with_retry(
    fn: Callable[..., Any],
    *args: Any,
    max_retries: int = MAX_RETRIES,
    base_delay: float = BASE_DELAY,
    label: str = "",
    **kwargs: Any,
) -> Any:
    """Call an async or sync function with exponential backoff.

    Args:
        fn: The function to call (async or sync).
        max_retries: Maximum number of retry attempts.
        base_delay: Initial delay in seconds (doubles each retry + jitter).
        label: Label for log messages.
    """
    last_exc = None
    for attempt in range(max_retries + 1):
        try:
            result = fn(*args, **kwargs)
            if asyncio.iscoroutine(result):
                result = await result
            return result
        except Exception as e:
            last_exc = e
            if attempt < max_retries and _is_retryable(e):
                delay = min(base_delay * (2 ** attempt) + random.uniform(0, 0.5), MAX_DELAY)
                tag = f" [{label}]" if label else ""
                print(f"[RETRY]{tag} Attempt {attempt + 1}/{max_retries + 1} failed: {e}. Retrying in {delay:.1f}s...")
                await asyncio.sleep(delay)
            else:
                raise
    raise last_exc  # unreachable, but satisfies type checker
