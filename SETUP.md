# Setup Guide

## Environment Configuration

### 1. Create billing environment file
```bash
cd /home/dima/dev/vexa-webapp-billing
cp .env.example .env
```

### 2. Configure required values

Edit `.env` and fill in:

**From your Stripe Dashboard:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret (whsec_...)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (pk_test_...)

**From Vexa's .env file:**
- `ADMIN_API_TOKEN` - Copy the same token from `/home/dima/dev/vexa/.env`

**Optional (for webapp):**
- `NEXTAUTH_SECRET` - Generate a random secret if running the webapp separately

### 3. Start services independently

```bash
# Terminal 1: Start Vexa
cd /home/dima/dev/vexa
docker compose up -d

# Terminal 2: Start Billing
cd /home/dima/dev/vexa-webapp-billing  
docker compose up -d --build
```

## Environment Separation

- **Vexa**: Contains all core service variables (Whisper, Redis, Postgres, etc.)
- **Billing**: Contains only billing-specific variables (Stripe, Admin API integration)
- **Clean separation**: No unnecessary environment pollution between services
