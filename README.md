# Vexa Webapp & Billing

This repository contains the billing service and webapp for Vexa, separated from the core Vexa services to maintain clean architecture.

## Structure

```
vexa-webapp-billing/
├── apps/
│   ├── billing/          # Billing service (FastAPI)
│   └── webapp/           # Web application (Next.js)
├── docker-compose.yml          # Standalone billing compose
├── .env.example          # Environment variables template
└── README.md
```

## Setup

### 1. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your actual values
```

Required environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `ADMIN_API_TOKEN`: Token to access Vexa's Admin API
- `BILLING_HOST_PORT`: Port for billing service (default: 19000)

### 2. Running Independently

This compose runs independently from Vexa:

```bash
# Start Vexa services (separate terminal)
cd /path/to/vexa
docker compose up -d

# Start billing services (independent)
cd /path/to/vexa-webapp-billing
docker compose up -d --build
```

### 3. Running Webapp Separately (Optional)

The webapp is included in this repo but not started by the compose file. To run it separately:

```bash
cd apps/webapp
npm install
npm run dev
```

## Services

### Billing Service
- **Port**: 19000 (host) → 9000 (container)
- **Purpose**: Handles Stripe integration, API key trials, portal sessions
- **API Docs**: http://localhost:19000/docs
- **Stripe Webhook**: Configured to receive webhooks on port 19000 via deg_gateway.dev.vexa.ai

### Webhook Configuration
- **Production**: Stripe sends webhooks directly to deg_gateway.dev.vexa.ai:19000
- **Events**: subscription.created, subscription.updated, subscription.deleted, invoice events
- **No local forwarding needed** - direct endpoint configuration

## Architecture

- **Independent Operation**: Billing runs separately from Vexa core services
- **Clean Separation**: No shared Docker networks or dependencies
- **Data Flow**: 
  1. Stripe webhooks → deg_gateway.dev.vexa.ai:19000 → Billing Service
  2. Billing Service updates user entitlements via Admin API (host.docker.internal:18057)
  3. Webapp uses billing service for subscriptions and portal

## Development

### Testing Stripe Integration

1. Run the billing stack as described above
2. Use Stripe CLI for webhook testing (included in compose)
3. Test scripts are available in `apps/webapp/` for various scenarios

### Debugging

- Billing service logs: `docker compose logs billing`
- Check Admin API connectivity: `curl http://localhost:18057/docs`
- Test webhook endpoint: `curl http://localhost:19000/docs`

## Production Deployment

1. Set up proper Stripe webhook endpoints pointing to your API Gateway
2. Configure production environment variables
3. Remove `stripe-cli` service from production compose
4. Ensure proper network security between services
