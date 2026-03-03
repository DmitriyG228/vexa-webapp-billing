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
    plan_type: str  # "bot_service", "realtime", "transcription_api"
    quantity: float
    timestamp: Optional[int] = None
    idempotency_key: Optional[str] = None


# ── Trials ───────────────────────────────────────────────────────────────────

class TrialRequest(BaseModel):
    email: EmailStr
    userId: int


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


class TopupRequest(BaseModel):
    product: str  # "bot" | "tx"
    email: EmailStr


class PaymentMethodRequest(BaseModel):
    email: EmailStr
    pm_id: str


class BotBalanceRequest(BaseModel):
    email: EmailStr


# ── Bot session tracking ────────────────────────────────────────────────────

class BotSessionEvent(BaseModel):
    email: EmailStr
    session_id: str
    meeting_id: Optional[str] = None


# ── Stats ────────────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_accounts: int
    total_contracted_bots: int
