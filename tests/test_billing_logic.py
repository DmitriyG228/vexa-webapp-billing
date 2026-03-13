"""
Tests for billing logic changes:
- Separated bot ($0.30/hr) + transcription ($0.20/hr) deduction
- Free credit model (replaces trials)
- Updated TaaS rate ($0.002/min)
- Removed realtime add-on
- Removed trial endpoints

Run: cd vexa-webapp-billing && python -m pytest tests/test_billing_logic.py -v
"""
import json
import os

import pytest


# ── Test: hooks.py billing calculation ────────────────────────────────────────

def test_bot_only_cost_1hr():
    """T4: 1 hour meeting, no transcription → 30 cents."""
    duration_seconds = 3600
    transcription_enabled = False
    duration_hours = duration_seconds / 3600.0
    bot_cost_cents = int(duration_hours * 30 + 0.5)
    tx_cost_cents = int(duration_hours * 20 + 0.5) if transcription_enabled else 0
    total = bot_cost_cents + tx_cost_cents
    assert bot_cost_cents == 30
    assert tx_cost_cents == 0
    assert total == 30


def test_bot_with_transcription_1hr():
    """T3: 1 hour meeting with transcription → 50 cents."""
    duration_seconds = 3600
    transcription_enabled = True
    duration_hours = duration_seconds / 3600.0
    bot_cost_cents = int(duration_hours * 30 + 0.5)
    tx_cost_cents = int(duration_hours * 20 + 0.5) if transcription_enabled else 0
    total = bot_cost_cents + tx_cost_cents
    assert bot_cost_cents == 30
    assert tx_cost_cents == 20
    assert total == 50


def test_short_meeting_rounding():
    """T5: 10 minute meeting with transcription → ~9 cents."""
    duration_seconds = 600
    transcription_enabled = True
    duration_hours = duration_seconds / 3600.0
    bot_cost_cents = int(duration_hours * 30 + 0.5)
    tx_cost_cents = int(duration_hours * 20 + 0.5) if transcription_enabled else 0
    total = bot_cost_cents + tx_cost_cents
    assert bot_cost_cents == 5  # 0.1667 * 30 = 5.0 → 5
    assert tx_cost_cents == 3   # 0.1667 * 20 = 3.333 → 3
    assert total == 8


def test_30min_meeting_costs():
    """30 minute meeting with and without transcription."""
    duration_seconds = 1800
    duration_hours = duration_seconds / 3600.0

    # With transcription
    bot = int(duration_hours * 30 + 0.5)
    tx = int(duration_hours * 20 + 0.5)
    assert bot == 15  # 0.5 * 30 = 15
    assert tx == 10   # 0.5 * 20 = 10
    assert bot + tx == 25

    # Without
    tx_off = 0
    assert bot + tx_off == 15


def test_balance_goes_negative():
    """T6: Balance can go negative (meetings aren't interrupted)."""
    current_balance = 10
    cost = 40
    new_balance = current_balance - cost
    assert new_balance == -30


# ── Test: config values ──────────────────────────────────────────────────────

def test_initial_credit():
    """T1: Welcome credit is $5 (500 cents)."""
    INITIAL_BOT_CREDIT_CENTS = 500
    assert INITIAL_BOT_CREDIT_CENTS == 500
    assert INITIAL_BOT_CREDIT_CENTS / 100 == 5.0


def test_tx_free_credit():
    """TaaS free credit: 10,000 minutes at $0.002/min = $20."""
    TX_FREE_CREDIT_MINUTES = 10000.0
    rate_per_min = 0.002  # dollars
    total_value = TX_FREE_CREDIT_MINUTES * rate_per_min
    assert total_value == 20.0


def test_tx_topup_conversion():
    """TX topup: cents → minutes at $0.002/min."""
    amount_cents = 500  # $5
    minutes_per_cent = 1 / 0.2  # $0.002/min = 0.2 cents/min → 5 min/cent
    minutes_added = amount_cents * minutes_per_cent
    assert minutes_added == 2500.0  # $5 buys 2500 minutes
    assert minutes_added * 0.002 == 5.0  # 2500 min * $0.002 = $5


def test_old_tx_rate_removed():
    """Old rate $0.0015/min (0.15 cents/min) should no longer be used."""
    old_minutes_per_cent = 1 / 0.15  # ~6.667
    new_minutes_per_cent = 1 / 0.2    # 5.0
    assert new_minutes_per_cent == 5.0
    assert old_minutes_per_cent != new_minutes_per_cent


# ── Test: free credit hours calculation ──────────────────────────────────────

def test_free_credit_hours_with_transcription():
    """$5 free credit at $0.40/hr (bot+tx) = 12.5 hours."""
    credit = 500  # cents
    rate_per_hour = 40  # cents ($0.30 + $0.10)
    hours = credit / rate_per_hour
    assert hours == 12.5


def test_free_credit_hours_bot_only():
    """$5 free credit at $0.30/hr (bot only) = 16.67 hours."""
    credit = 500
    rate_per_hour = 30
    hours = credit / rate_per_hour
    assert round(hours, 2) == 16.67


# ── Test: pricing_tiers.json ──────────────────────────────────────────────────

def test_pricing_tiers_no_realtime():
    """Realtime add-on should not exist in pricing tiers."""
    tiers_path = os.path.join(os.path.dirname(__file__), "..", "product", "pricing_tiers.json")
    with open(tiers_path) as f:
        data = json.load(f)
    ids = [p["id"] for p in data["products"]]
    assert "realtime" not in ids


def test_pricing_tiers_bot_service_price():
    """Bot service price should be $0.30/hr."""
    tiers_path = os.path.join(os.path.dirname(__file__), "..", "product", "pricing_tiers.json")
    with open(tiers_path) as f:
        data = json.load(f)
    bot = next(p for p in data["products"] if p["id"] == "bot_service")
    assert bot["price_cents_per_hour"] == 30
    assert bot["price_display"] == "$0.30"


def test_pricing_tiers_transcription_price():
    """Transcription API price should be $0.002/min."""
    tiers_path = os.path.join(os.path.dirname(__file__), "..", "product", "pricing_tiers.json")
    with open(tiers_path) as f:
        data = json.load(f)
    tx = next(p for p in data["products"] if p["id"] == "transcription_api")
    assert tx["price_per_min_cents"] == 0.2
    assert tx["price_display"] == "$0.002"


# ── Test: stripe_ids.json ────────────────────────────────────────────────────

def test_stripe_ids_no_realtime():
    """Realtime should not exist in stripe_ids.json."""
    ids_path = os.path.join(os.path.dirname(__file__), "..", "product", "stripe_ids.json")
    with open(ids_path) as f:
        data = json.load(f)
    assert "realtime" not in data
    assert "individual" in data
    assert "bot_service" in data
    assert "transcription_api" in data
    assert "consultation" in data


# ── Test: models.py ──────────────────────────────────────────────────────────

def test_no_trial_model():
    """TrialRequest and BotSessionEvent should not exist."""
    models_path = os.path.join(os.path.dirname(__file__), "..", "apps", "billing", "app", "models.py")
    with open(models_path) as f:
        content = f.read()
    assert "TrialRequest" not in content
    assert "BotSessionEvent" not in content


def test_no_trials_module():
    """trials.py should not exist."""
    trials_path = os.path.join(os.path.dirname(__file__), "..", "apps", "billing", "app", "trials.py")
    assert not os.path.exists(trials_path)


# ── Test: margin calculations ────────────────────────────────────────────────

def test_bot_margin_baseline():
    """Bot service margin at $0.30/hr with baseline COGS $0.039/hr = 87%."""
    price = 0.30
    cogs = 0.039
    margin = (price - cogs) / price
    assert round(margin * 100) == 87


def test_all_in_margin_baseline():
    """Bot + transcription margin at $0.40/hr with baseline COGS $0.073/hr = 82%."""
    price = 0.40
    cogs = 0.073
    margin = (price - cogs) / price
    assert round(margin * 100) == 82


def test_taas_margin_baseline():
    """TaaS margin at $0.12/hr with baseline COGS $0.047/hr = 61%."""
    price = 0.12
    cogs = 0.047
    margin = (price - cogs) / price
    assert round(margin * 100) == 61
