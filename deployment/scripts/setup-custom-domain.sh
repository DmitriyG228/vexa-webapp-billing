#!/bin/bash
set -e

# Add gcloud to PATH - checks multiple common installation locations
for base in /usr/local/Caskroom/gcloud-cli /opt/homebrew/Caskroom/google-cloud-sdk; do
    if [ -d "$base" ]; then
        for version_dir in "$base"/*; do
            if [ -f "$version_dir/google-cloud-sdk/bin/gcloud" ]; then
                export PATH="$version_dir/google-cloud-sdk/bin:$PATH"
                break 2
            fi
        done
    fi
done

# Also check standard locations
if [ -f "$HOME/google-cloud-sdk/bin/gcloud" ]; then
    export PATH="$HOME/google-cloud-sdk/bin:$PATH"
elif [ -f "/usr/local/share/google-cloud-sdk/bin/gcloud" ]; then
    export PATH="/usr/local/share/google-cloud-sdk/bin:$PATH"
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$#" -lt 3 ]; then
    echo -e "${RED}Usage: $0 <service-name> <custom-domain> <region>${NC}"
    echo "Example: $0 dev-webapp webapp-dev.vexa.ai us-central1"
    exit 1
fi

SERVICE_NAME=$1
CUSTOM_DOMAIN=$2
REGION=$3
PROJECT_ID=${PROJECT_ID:-spry-pipe-425611-c4}

# Verify gcloud is available
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found${NC}"
    echo "Install with: brew install --cask google-cloud-sdk"
    exit 1
fi

echo -e "${GREEN}=== Setting up Custom Domain for Cloud Run ===${NC}"
echo "Service: ${SERVICE_NAME}"
echo "Domain: ${CUSTOM_DOMAIN}"
echo "Region: ${REGION}"
echo ""

# Step 1: Create domain mapping in Cloud Run (async, don't wait)
echo -e "${YELLOW}Step 1: Creating domain mapping in Cloud Run...${NC}"

# Try to create, but don't wait for it
timeout 10 gcloud beta run domain-mappings create \
    --service=${SERVICE_NAME} \
    --domain=${CUSTOM_DOMAIN} \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --async 2>&1 | head -5 || echo -e "${YELLOW}(Domain mapping may already exist)${NC}"

# Give it a moment to register
sleep 3
echo -e "${GREEN}✓ Domain mapping creation initiated${NC}"
echo ""

# Step 2: Get DNS records that need to be configured
echo -e "${YELLOW}Step 2: Fetching required DNS records from Google...${NC}"

# Retry a few times in case it's not ready yet
for i in {1..5}; do
    DNS_RECORDS=$(gcloud beta run domain-mappings describe \
        --domain=${CUSTOM_DOMAIN} \
        --region=${REGION} \
        --format=json 2>&1)
    
    if [ $? -eq 0 ]; then
        break
    fi
    echo "  Retry $i/5..."
    sleep 2
done

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to get domain mapping info${NC}"
    echo "$DNS_RECORDS"
    exit 1
fi

# Extract the CNAME target
CNAME_TARGET=$(echo "$DNS_RECORDS" | jq -r '.status.resourceRecords[]? | select(.type=="CNAME") | .rrdata' | head -1)

if [ -z "$CNAME_TARGET" ]; then
    echo -e "${RED}Could not find CNAME record from Google${NC}"
    echo "DNS Records response:"
    echo "$DNS_RECORDS" | jq '.'
    exit 1
fi

echo -e "${GREEN}✓ Google requires CNAME: ${CUSTOM_DOMAIN} → ${CNAME_TARGET}${NC}"
echo ""

# Step 3: Update Cloudflare DNS
if [ -z "$CLOUDFLARE_TOKEN" ]; then
    echo -e "${YELLOW}CLOUDFLARE_TOKEN not set, skipping automatic DNS update${NC}"
    echo ""
    echo -e "${YELLOW}Manual DNS Configuration Required:${NC}"
    echo "  1. Go to Cloudflare DNS settings"
    echo "  2. Add/Update CNAME record:"
    echo "     Name: ${CUSTOM_DOMAIN}"
    echo "     Target: ${CNAME_TARGET}"
    echo "     Proxy: OFF (grey cloud)"
    echo ""
    exit 0
fi

echo -e "${YELLOW}Step 3: Updating Cloudflare DNS...${NC}"

# Get Cloudflare Zone ID
DOMAIN_ROOT=$(echo "$CUSTOM_DOMAIN" | rev | cut -d. -f1,2 | rev)
CLOUDFLARE_ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN_ROOT}" \
    -H "Authorization: Bearer ${CLOUDFLARE_TOKEN}" \
    -H "Content-Type: application/json" | jq -r '.result[0].id')

if [ -z "$CLOUDFLARE_ZONE_ID" ] || [ "$CLOUDFLARE_ZONE_ID" = "null" ]; then
    echo -e "${RED}Could not find Cloudflare Zone ID for ${DOMAIN_ROOT}${NC}"
    exit 1
fi

# Check if record exists
RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${CUSTOM_DOMAIN}" \
    -H "Authorization: Bearer ${CLOUDFLARE_TOKEN}" \
    -H "Content-Type: application/json" | jq -r '.result[0].id // empty')

# Prepare CNAME record (proxied=false is CRITICAL for Cloud Run)
JSON_PAYLOAD=$(jq -n \
    --arg name "$CUSTOM_DOMAIN" \
    --arg target "$CNAME_TARGET" \
    '{
        type: "CNAME",
        name: $name,
        content: $target,
        ttl: 1,
        proxied: false
    }')

if [ -z "$RECORD_ID" ]; then
    echo "Creating new CNAME record..."
    RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
        -H "Authorization: Bearer ${CLOUDFLARE_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD")
else
    echo "Updating existing CNAME record..."
    RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${RECORD_ID}" \
        -H "Authorization: Bearer ${CLOUDFLARE_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD")
fi

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}Failed to update Cloudflare DNS${NC}"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo -e "${GREEN}✓ Cloudflare DNS updated${NC}"
echo ""

# Step 4: Verify and wait for SSL
echo -e "${YELLOW}Step 4: Waiting for SSL certificate provisioning...${NC}"
echo "This can take up to 30 minutes. Checking status every 30 seconds..."
echo ""

for i in {1..60}; do
    STATUS=$(gcloud beta run domain-mappings describe \
        --domain=${CUSTOM_DOMAIN} \
        --region=${REGION} \
        --format=json 2>/dev/null | jq -r '.status.conditions[]? | select(.type=="Ready") | .status')
    
    if [ "$STATUS" = "True" ]; then
        echo -e "${GREEN}✓ Domain mapping is ready!${NC}"
        echo ""
        echo -e "${GREEN}=== Setup Complete ===${NC}"
        echo ""
        echo "Your service is now available at:"
        echo "  https://${CUSTOM_DOMAIN}"
        echo ""
        echo "SSL certificate has been automatically provisioned by Google."
        exit 0
    fi
    
    echo "Status check ${i}/60: Not ready yet..."
    sleep 30
done

echo -e "${YELLOW}Domain mapping created but not yet ready.${NC}"
echo "Check status with:"
echo "  gcloud beta run domain-mappings describe --domain=${CUSTOM_DOMAIN} --region=${REGION}"

