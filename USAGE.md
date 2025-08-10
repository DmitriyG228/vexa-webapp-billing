# Usage Guide

## Quick Start

### 1. Setup Environment
```bash
cd /home/dima/dev/vexa-webapp-billing
# Use the billing-specific template and fill in values:
cp .env.example .env
# Edit .env with your Stripe keys and admin API token
```

### 2. Start Vexa Services (in separate terminal)
```bash
cd /home/dima/dev/vexa
docker compose up -d
```

### 3. Start Billing Services (independent)
```bash
cd /home/dima/dev/vexa-webapp-billing
docker compose up -d --build
```

### 4. Verify Services
- Billing API: http://localhost:19000/docs (exposed for Stripe webhooks)
- Admin API: http://localhost:18057/docs
- API Gateway: http://localhost:18056/docs

## Services Added

- **billing** (port 19000): Stripe integration, API key trials, portal sessions
  - Receives webhooks directly from Stripe via deg_gateway.dev.vexa.ai:19000

## Integration Points

- **Webhooks**: Stripe → deg_gateway.dev.vexa.ai:19000 → billing service
- **User Updates**: Billing service → Admin API (via host.docker.internal:18057)
- **Webapp**: Can run separately and use billing service for subscriptions
- **Independent Operation**: No shared Docker networks with vexa

## Directory Structure

```
vexa-webapp-billing/
├── apps/
│   ├── billing/          # Billing FastAPI service
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── webapp/           # Next.js webapp (not started by compose)
│       ├── app/
│       ├── components/
│       └── ... (all webapp files)
├── docker-compose.yml
├── .env.example
├── README.md
└── USAGE.md
```

## Notes

- The webapp is included in the repo but not started by the compose
- All billing/Stripe code is isolated from the main vexa services
- Stripe CLI handles webhook forwarding during development
- Production deployments should use real Stripe webhook endpoints
