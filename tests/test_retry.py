"""Tests for exponential backoff retry logic."""
import asyncio
import sys
import os
import pytest
import httpx

# Support both local (apps/billing/app/) and Docker (/app/) import paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "billing"))

from app.retry import with_retry, _is_retryable


def test_retry_module_imports():
    """retry.py module loads without errors."""
    assert callable(with_retry)
    assert callable(_is_retryable)


def test_retryable_httpx_timeout():
    assert _is_retryable(httpx.TimeoutException("timed out")) is True


def test_retryable_httpx_connect_error():
    assert _is_retryable(httpx.ConnectError("refused")) is True


def test_retryable_http_500():
    request = httpx.Request("GET", "http://example.com")
    response = httpx.Response(500, request=request)
    exc = httpx.HTTPStatusError("server error", request=request, response=response)
    assert _is_retryable(exc) is True


def test_retryable_http_429():
    request = httpx.Request("GET", "http://example.com")
    response = httpx.Response(429, request=request)
    exc = httpx.HTTPStatusError("rate limited", request=request, response=response)
    assert _is_retryable(exc) is True


def test_not_retryable_http_400():
    request = httpx.Request("GET", "http://example.com")
    response = httpx.Response(400, request=request)
    exc = httpx.HTTPStatusError("bad request", request=request, response=response)
    assert _is_retryable(exc) is False


def test_not_retryable_value_error():
    assert _is_retryable(ValueError("bad value")) is False


@pytest.mark.asyncio
async def test_with_retry_succeeds_first_try():
    call_count = 0

    async def ok_fn():
        nonlocal call_count
        call_count += 1
        return "success"

    result = await with_retry(ok_fn, label="test")
    assert result == "success"
    assert call_count == 1


@pytest.mark.asyncio
async def test_with_retry_retries_on_timeout():
    call_count = 0

    async def failing_then_ok():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise httpx.TimeoutException("timeout")
        return "recovered"

    result = await with_retry(failing_then_ok, base_delay=0.01, label="test")
    assert result == "recovered"
    assert call_count == 3


@pytest.mark.asyncio
async def test_with_retry_gives_up_after_max():
    async def always_fails():
        raise httpx.TimeoutException("timeout")

    with pytest.raises(httpx.TimeoutException):
        await with_retry(always_fails, max_retries=2, base_delay=0.01, label="test")


@pytest.mark.asyncio
async def test_with_retry_no_retry_on_non_retryable():
    call_count = 0

    async def bad_request():
        nonlocal call_count
        call_count += 1
        raise ValueError("bad")

    with pytest.raises(ValueError):
        await with_retry(bad_request, max_retries=3, base_delay=0.01, label="test")
    assert call_count == 1  # no retries for non-retryable errors


@pytest.mark.asyncio
async def test_with_retry_works_with_sync_functions():
    """with_retry handles sync functions via coroutine wrapping."""
    def sync_fn():
        return 42

    result = await with_retry(sync_fn, label="sync-test")
    assert result == 42
