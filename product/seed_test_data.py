#!/usr/bin/env python3
"""
Seed test account data for realistic account page testing.

Creates meetings, transcriptions, and billing state in the database
so the account page shows actual stats instead of empty states.

Requires:
  - DATABASE_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD env vars
  - ADMIN_API_URL + ADMIN_API_TOKEN env vars

Usage:
  # Against green (SSH tunnel or run on green directly)
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vexa \
  ADMIN_API_URL=http://localhost:8000 \
  ADMIN_API_TOKEN=your-token \
  python3 product/seed_test_data.py

  # Or on green VM directly:
  ssh root@172.238.169.88
  source /root/webapp/apps/webapp/.env
  cd /root/webapp && python3 product/seed_test_data.py
"""

from __future__ import annotations

import json
import os
import random
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

try:
    import psycopg2
except ImportError:
    sys.exit("psycopg2 required: pip install psycopg2-binary")


# ── Config ────────────────────────────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "vexa")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

ADMIN_API_URL = os.getenv("ADMIN_API_URL", "http://localhost:8000")
ADMIN_API_TOKEN = os.getenv("ADMIN_API_TOKEN", "")

# ── Test Account Definitions ──────────────────────────────────────────────────

# Each account gets a realistic usage profile
TEST_ACCOUNTS = {
    "test@vexa.ai": {
        "state": "S3: Individual Active",
        "meetings": 47,
        "days_active": 30,
        "platforms": {"google_meet": 0.7, "microsoft_teams": 0.3},
        "avg_duration_min": 45,
        "bot_balance_cents": 0,  # Individual plan, no PAYG balance
        "bot_usage_cents": 0,
    },
    "test2@vexa.ai": {
        "state": "S3: Individual Active",
        "meetings": 12,
        "days_active": 14,
        "platforms": {"google_meet": 1.0},
        "avg_duration_min": 30,
        "bot_balance_cents": 0,
        "bot_usage_cents": 0,
    },
    "test3@vexa.ai": {
        "state": "S4: PAYG Active (heavy user)",
        "meetings": 156,
        "days_active": 30,
        "platforms": {"google_meet": 0.5, "microsoft_teams": 0.4, "zoom": 0.1},
        "avg_duration_min": 50,
        "bot_balance_cents": 150,   # $1.50 remaining
        "bot_usage_cents": 4350,    # $43.50 used (heavy)
        "bot_topup_enabled": True,
        "bot_topup_threshold_cents": 100,
        "bot_topup_amount_cents": 2000,
    },
    "test4@vexa.ai": {
        "state": "S4: PAYG Active (light user)",
        "meetings": 8,
        "days_active": 7,
        "platforms": {"google_meet": 0.8, "microsoft_teams": 0.2},
        "avg_duration_min": 35,
        "bot_balance_cents": 410,   # $4.10 remaining (of $5 welcome credit)
        "bot_usage_cents": 90,      # $0.90 used
        "bot_topup_enabled": True,
        "bot_topup_threshold_cents": 100,
        "bot_topup_amount_cents": 500,
    },
    "test7@vexa.ai": {
        "state": "S5: Individual Cancelling",
        "meetings": 23,
        "days_active": 21,
        "platforms": {"microsoft_teams": 0.9, "google_meet": 0.1},
        "avg_duration_min": 40,
        "bot_balance_cents": 0,
        "bot_usage_cents": 0,
    },
    "test99@vexa.ai": {
        "state": "S3: Individual Active",
        "meetings": 3,
        "days_active": 5,
        "platforms": {"google_meet": 1.0},
        "avg_duration_min": 25,
        "bot_balance_cents": 0,
        "bot_usage_cents": 0,
    },
    "dmitry@vexa.ai": {
        "state": "S1: Free User (some trial usage)",
        "meetings": 2,
        "days_active": 2,
        "platforms": {"google_meet": 1.0},
        "avg_duration_min": 15,
        "bot_balance_cents": 0,
        "bot_usage_cents": 0,
    },
}

# ── Database Connection ───────────────────────────────────────────────────────

def get_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASSWORD,
    )


def get_user_id(conn, email: str) -> Optional[int]:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        return row[0] if row else None


def ensure_user(conn, email: str) -> int:
    user_id = get_user_id(conn, email)
    if user_id:
        return user_id
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO users (email, name, data) VALUES (%s, %s, %s) RETURNING id",
            (email, email.split("@")[0], json.dumps({})),
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        print(f"  Created user {email} (id={user_id})")
    return user_id


# ── Meeting Generator ─────────────────────────────────────────────────────────

def generate_meeting_id(platform: str) -> str:
    """Generate a realistic-looking meeting ID per platform."""
    if platform == "google_meet":
        parts = [
            "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=3))
            for _ in range(3)
        ]
        return "-".join(parts)
    elif platform == "microsoft_teams":
        return f"19:meeting_{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', k=40))}@thread.v2"
    elif platform == "zoom":
        return str(random.randint(10000000000, 99999999999))
    return f"meeting-{random.randint(1000, 9999)}"


def pick_platform(platform_weights: Dict[str, float]) -> str:
    platforms = list(platform_weights.keys())
    weights = list(platform_weights.values())
    return random.choices(platforms, weights=weights, k=1)[0]


def seed_meetings(conn, user_id: int, email: str, config: Dict[str, Any]):
    """Insert realistic meetings for a user."""
    now = datetime.utcnow()
    num_meetings = config["meetings"]
    days_active = config["days_active"]
    avg_dur = config["avg_duration_min"]

    # Check existing meetings
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM meetings WHERE user_id = %s", (user_id,))
        existing = cur.fetchone()[0]

    if existing >= num_meetings:
        print(f"  {email}: already has {existing} meetings (target {num_meetings}), skipping")
        return

    to_insert = num_meetings - existing
    meetings_data = []
    statuses = []

    for i in range(to_insert):
        # Spread meetings across the active period
        days_ago = random.uniform(0, days_active)
        # Cluster around business hours (9am-5pm)
        hour = random.gauss(13, 2.5)
        hour = max(8, min(18, hour))
        minute = random.randint(0, 59)

        created = now - timedelta(days=days_ago, hours=random.uniform(0, 2))
        start = created.replace(hour=int(hour), minute=minute, second=0)

        # Duration with some variance
        dur_minutes = max(5, random.gauss(avg_dur, avg_dur * 0.3))
        end = start + timedelta(minutes=dur_minutes)

        platform = pick_platform(config["platforms"])
        meeting_id = generate_meeting_id(platform)

        # Most meetings completed, some failed
        if random.random() < 0.05:
            status = "failed"
            end = None
        elif i == 0 and random.random() < 0.1:
            status = "active"  # one might be active
            end = None
        else:
            status = "completed"

        statuses.append(status)
        meetings_data.append((
            user_id, platform, meeting_id, status,
            start if status != "failed" else None,
            end,
            json.dumps({"seeded": True, "meeting_title": f"Meeting {existing + i + 1}"}),
            created,
        ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO meetings
               (user_id, platform, platform_specific_id, status, start_time, end_time, data, created_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            meetings_data,
        )
    conn.commit()

    completed = statuses.count("completed")
    failed = statuses.count("failed")
    print(f"  {email}: inserted {to_insert} meetings ({completed} completed, {failed} failed)")


# ── Billing State ─────────────────────────────────────────────────────────────

def seed_billing_state(conn, email: str, config: Dict[str, Any]):
    """Set billing-related JSONB fields on the user's data column."""
    patch = {}

    if config.get("bot_balance_cents", 0) > 0 or config.get("bot_usage_cents", 0) > 0:
        patch["bot_balance_cents"] = config.get("bot_balance_cents", 0)
        patch["bot_welcome_credit_given"] = True
        patch["bot_monthly_spent_cents"] = config.get("bot_usage_cents", 0)

    if config.get("bot_topup_enabled") is not None:
        patch["bot_topup_enabled"] = config.get("bot_topup_enabled", True)
        patch["bot_topup_threshold_cents"] = config.get("bot_topup_threshold_cents", 100)
        patch["bot_topup_amount_cents"] = config.get("bot_topup_amount_cents", 500)

    if not patch:
        return

    with conn.cursor() as cur:
        cur.execute(
            "UPDATE users SET data = COALESCE(data, '{}'::jsonb) || %s::jsonb WHERE email = %s",
            (json.dumps(patch), email),
        )
    conn.commit()
    print(f"  {email}: set billing state — balance=${patch.get('bot_balance_cents', 0)/100:.2f}, "
          f"usage=${patch.get('bot_monthly_spent_cents', 0)/100:.2f}")



# ── Transcription Samples ─────────────────────────────────────────────────────

def seed_transcriptions(conn, user_id: int, email: str, max_meetings: int = 5):
    """Add sample transcription segments to recent completed meetings."""
    with conn.cursor() as cur:
        cur.execute(
            """SELECT id, start_time FROM meetings
               WHERE user_id = %s AND status = 'completed' AND start_time IS NOT NULL
               ORDER BY created_at DESC LIMIT %s""",
            (user_id, max_meetings),
        )
        meetings = cur.fetchall()

    if not meetings:
        return

    sample_texts = [
        "Let me share my screen and walk through the Q1 results.",
        "The conversion rate improved by 15% after the landing page changes.",
        "Can everyone see my screen? I'll go through the roadmap next.",
        "We need to prioritize the API integration before the end of sprint.",
        "I think we should schedule a follow-up to discuss the timeline.",
        "The customer feedback has been really positive so far.",
        "Let me pull up the analytics dashboard to show the trends.",
        "We're on track for the release, but testing needs another day.",
        "Does anyone have questions about the architecture proposal?",
        "I'll send the meeting notes after this call.",
        "The performance benchmarks look great on the new infrastructure.",
        "We should loop in the design team for the next iteration.",
    ]
    speakers = ["Speaker 1", "Speaker 2", "Speaker 3"]

    total_inserted = 0
    for meeting_id, start_time in meetings:
        # Check if transcriptions already exist
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM transcriptions WHERE meeting_id = %s", (meeting_id,))
            if cur.fetchone()[0] > 0:
                continue

        # Generate 8-20 segments per meeting
        num_segments = random.randint(8, 20)
        offset = 0.0
        segments = []

        for _ in range(num_segments):
            duration = random.uniform(3.0, 25.0)
            text = random.choice(sample_texts)
            speaker = random.choice(speakers)

            segments.append((
                meeting_id, offset, offset + duration, text, speaker, "en",
            ))
            offset += duration + random.uniform(0.5, 3.0)

        with conn.cursor() as cur:
            cur.executemany(
                """INSERT INTO transcriptions
                   (meeting_id, start_time, end_time, text, speaker, language)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                segments,
            )
        total_inserted += num_segments

    if total_inserted:
        conn.commit()
        print(f"  {email}: inserted {total_inserted} transcription segments across {len(meetings)} meetings")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== Seeding Test Account Data ===\n")

    conn = get_connection()
    print(f"Connected to database\n")

    for email, config in TEST_ACCOUNTS.items():
        print(f"[{email}] — {config['state']}")

        user_id = ensure_user(conn, email)
        seed_meetings(conn, user_id, email, config)
        seed_transcriptions(conn, user_id, email)
        seed_billing_state(conn, email, config)
        print()

    conn.close()

    print("=== Done ===")
    print()
    print("Test accounts now have:")
    print("  - Realistic meeting histories (various platforms, durations, statuses)")
    print("  - Transcription segments on recent meetings")
    print("  - Bot balance and usage data for PAYG accounts")
    print()
    print("Verify at: https://green.vexa.ai/mock-login → log in → /account")


if __name__ == "__main__":
    main()
