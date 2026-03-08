from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr


# ── Checkout / Resolve ───────────────────────────────────────────────────────

class ResolveUrlRequest(BaseModel):
    email: EmailStr
    context: str  # "pricing" | "dashboard"
    plan_type: Optional[str] = None
    quantity: Optional[int] = None
    origin: Optional[str] = None
    successUrl: Optional[str] = None
    cancelUrl: Optional[str] = None
    returnUrl: Optional[str] = None


# ── Portal ───────────────────────────────────────────────────────────────────

class PortalRequest(BaseModel):
    email: EmailStr
    returnUrl: Optional[str] = None


# ── Usage ────────────────────────────────────────────────────────────────────

class UsageReport(BaseModel):
    email: EmailStr
    plan_type: str  # "bot_service", "transcription_api"
    quantity: float
    timestamp: Optional[int] = None
    idempotency_key: Optional[str] = None


# ── Balance ──────────────────────────────────────────────────────────────────

class BalanceCheckRequest(BaseModel):
    product: str  # "bot" | "tx"
    email: EmailStr
    required: Optional[float] = None  # amount needed


class BalanceDeductRequest(BaseModel):
    product: str  # "bot" | "tx"
    email: EmailStr
    amount: float


class BalanceCreditRequest(BaseModel):
    product: str  # "bot" | "tx"
    email: EmailStr
    amount: float


class TopupSettingsRequest(BaseModel):
    product: str  # "bot" | "tx"
    email: EmailStr
    enabled: bool
    threshold: Optional[float] = None
    amount_cents: Optional[int] = None
    monthly_cap_cents: Optional[int] = None  # max monthly spend (null = unlimited)


class TopupRequest(BaseModel):
    product: str  # "bot" | "tx"
    email: EmailStr
    amount_cents: Optional[int] = None  # override topup amount
    origin: Optional[str] = None  # for Checkout redirect URLs


class PaymentMethodRequest(BaseModel):
    email: EmailStr
    pm_id: str


class BotBalanceRequest(BaseModel):
    email: EmailStr


# ── Stats ────────────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_accounts: int
    total_contracted_bots: int
