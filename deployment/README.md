# Deployment Infrastructure

All deployment infrastructure for vexa-webapp-billing.

## Structure

```
deployment/
├── terraform/          Infrastructure as Code
│   ├── main.tf        Root configuration
│   ├── modules/       Reusable modules
│   └── environments/  Dev/Prod configs
└── scripts/           Automation scripts
    ├── terraform-init.sh
    ├── deploy.sh
    ├── update-secrets.sh
    └── setup-oauth.sh
```

## Quick Start

From project root:

```bash
# Deploy everything
make deploy ENV=dev

# Check status
make status ENV=dev

# See all commands
make help
```

## Direct Usage (if needed)

```bash
# Initialize
./deployment/scripts/terraform-init.sh

# Update secrets
./deployment/scripts/update-secrets.sh dev

# Deploy infrastructure
cd deployment/terraform
terraform apply -var-file="environments/dev/terraform.tfvars"
```

## Configuration

Edit `.env.dev` or `.env.prod` in project root, then:

```bash
make update-secrets ENV=dev
```

---

**Recommended**: Use Makefile commands from project root instead of running scripts directly.
