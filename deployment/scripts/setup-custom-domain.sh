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

# Read CLOUDFLARE_TOKEN from .env file if not set as environment variable
if [ -z "$CLOUDFLARE_TOKEN" ]; then
    # Try to find .env file in current directory or parent directories
    ENV_FILE=""
    if [ -f ".env" ]; then
        ENV_FILE=".env"
    elif [ -f "../.env" ]; then
        ENV_FILE="../.env"
    elif [ -f "../../.env" ]; then
        ENV_FILE="../../.env"
    fi
    
    if [ -n "$ENV_FILE" ]; then
        CLOUDFLARE_TOKEN=$(grep -E '^CLOUDFLARE_TOKEN=' "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '\n' | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        if [ -n "$CLOUDFLARE_TOKEN" ]; then
            export CLOUDFLARE_TOKEN
        fi
    fi
fi

# Clean up domain - remove protocol prefix if present
# Remove http:// or https:// (using basic regex for compatibility)
CUSTOM_DOMAIN=$(echo "$CUSTOM_DOMAIN" | sed 's|^https\?://||')
# Remove trailing slash
CUSTOM_DOMAIN=$(echo "$CUSTOM_DOMAIN" | sed 's|/$||')
# Trim whitespace
CUSTOM_DOMAIN=$(echo "$CUSTOM_DOMAIN" | xargs)

# Verify gcloud is available
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found${NC}"
    echo "Install with: brew install --cask google-cloud-sdk"
    exit 1
fi

# Ensure beta component is installed (idempotent - safe to run multiple times)
echo -e "${YELLOW}Ensuring gcloud beta component is installed...${NC}"
gcloud components install beta --quiet 2>/dev/null || true
# Verify it's available
if ! gcloud components list --format="value(id)" 2>/dev/null | grep -q "^beta$"; then
    echo -e "${RED}Failed to install/verify beta component${NC}"
    echo "Please run manually: gcloud components install beta"
    exit 1
fi
echo -e "${GREEN}✓ Beta component ready${NC}"
echo ""

echo -e "${GREEN}=== Setting up Custom Domain for Cloud Run ===${NC}"
echo "Service: ${SERVICE_NAME}"
echo "Domain: ${CUSTOM_DOMAIN}"
echo "Region: ${REGION}"
echo ""

# Function to run command with timeout (macOS compatible)
run_with_timeout() {
    local timeout_seconds=$1
    shift
    local cmd="$@"
    
    # Try to use timeout command if available (Linux)
    if command -v timeout > /dev/null 2>&1; then
        timeout $timeout_seconds $cmd
        return $?
    fi
    
    # Try gtimeout (macOS with coreutils)
    if command -v gtimeout > /dev/null 2>&1; then
        gtimeout $timeout_seconds $cmd
        return $?
    fi
    
    # Fallback: run in background and kill after timeout
    $cmd &
    local cmd_pid=$!
    local start_time=$(date +%s)
    
    while kill -0 $cmd_pid 2>/dev/null; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -ge $timeout_seconds ]; then
            kill -TERM $cmd_pid 2>/dev/null
            sleep 1
            kill -KILL $cmd_pid 2>/dev/null
            return 124
        fi
        sleep 0.5
    done
    
    wait $cmd_pid
    return $?
}

# Step 1: Check if domain mapping exists, create if not
echo -e "${YELLOW}Step 1: Checking/Creating domain mapping in Cloud Run...${NC}"

# Check if domain mapping already exists
set +e
EXISTING_MAPPING=$(gcloud beta run domain-mappings describe \
    --domain=${CUSTOM_DOMAIN} \
    --region=${REGION} \
    --quiet \
    --format="value(metadata.name)" 2>/dev/null)
set -e

if [ -n "$EXISTING_MAPPING" ]; then
    echo -e "${GREEN}✓ Domain mapping already exists${NC}"
else
    echo "Creating domain mapping..."
    # Create the domain mapping (this can take 30-60 seconds)
    set +e
    CREATE_OUTPUT=$(run_with_timeout 60 gcloud beta run domain-mappings create \
        --service=${SERVICE_NAME} \
        --domain=${CUSTOM_DOMAIN} \
        --region=${REGION} \
        --project=${PROJECT_ID} \
        --quiet 2>&1)
    CREATE_EXIT=$?
    set -e
    
    if [ $CREATE_EXIT -eq 0 ]; then
        echo -e "${GREEN}✓ Domain mapping created successfully${NC}"
        # Extract DNS record info from output if available
        if echo "$CREATE_OUTPUT" | grep -q "CNAME"; then
            echo ""
            echo "DNS record needed:"
            echo "$CREATE_OUTPUT" | grep -A 2 "CNAME"
        fi
    elif [ $CREATE_EXIT -eq 124 ]; then
        echo -e "${YELLOW}⚠ Domain mapping creation timed out (may still be in progress)${NC}"
    else
        if echo "$CREATE_OUTPUT" | grep -qi "already exists"; then
            echo -e "${GREEN}✓ Domain mapping already exists${NC}"
        else
            echo -e "${RED}✗ Failed to create domain mapping:${NC}"
            echo "$CREATE_OUTPUT"
            exit 1
        fi
    fi
fi

# Give it a moment to register
sleep 2
echo ""

# Step 2: Get DNS records that need to be configured
echo -e "${YELLOW}Step 2: Fetching required DNS records from Google...${NC}"
echo ""
echo "Domain: ${CUSTOM_DOMAIN}"
echo "Region: ${REGION}"
echo ""
echo "Fetching DNS records..."
echo ""
echo -e "${YELLOW}Expected Timeline:${NC}"
echo "  • Domain mapping creation: 1-2 minutes"
echo "  • DNS records available: 2-5 minutes (sometimes up to 10)"
echo "  • SSL certificate: 5-30 minutes"
echo ""
echo "If commands are timing out, the domain mapping may still be provisioning."
echo "The script will retry up to 30 times (about 2.5 minutes total)."
echo ""

# Wait for domain mapping to be created and ready
# Retry with timeout - domain mapping creation can take time
DNS_RECORDS=""
TIMEOUT_COUNT=0
for i in {1..30}; do
    echo -n "[$i/30] "
    
    # Use timeout to prevent hanging (15 second timeout per attempt)
    # Show what we're doing
    echo -n "Querying gcloud... "
    # Temporarily disable set -e to handle timeouts gracefully
    set +e
    DNS_RECORDS=$(run_with_timeout 15 gcloud beta run domain-mappings describe \
        --domain=${CUSTOM_DOMAIN} \
        --region=${REGION} \
        --quiet \
        --format=json 2>&1)
    EXIT_CODE=$?
    set -e
    
    # Always show what we got (for debugging)
    if [ $EXIT_CODE -eq 0 ]; then
        # Check if we got valid JSON
        if ! echo "$DNS_RECORDS" | jq . > /dev/null 2>&1; then
            echo "⚠ Got response but not valid JSON:"
            echo "$DNS_RECORDS" | head -5
            echo ""
        elif echo "$DNS_RECORDS" | jq -e '.status.resourceRecords' > /dev/null 2>&1; then
            echo "✓ Domain mapping ready with DNS records!"
            break
        else
            # Show the actual status
            STATUS=$(echo "$DNS_RECORDS" | jq -r '.status.conditions[]? | select(.type=="Ready") | .status // "Unknown"' 2>/dev/null)
            MESSAGE=$(echo "$DNS_RECORDS" | jq -r '.status.conditions[]? | select(.type=="Ready") | .message // ""' 2>/dev/null)
            echo "Domain mapping exists but DNS records not ready yet"
            echo "  Status: ${STATUS}"
            if [ -n "$MESSAGE" ]; then
                echo "  Message: ${MESSAGE}"
            fi
        fi
    elif [ $EXIT_CODE -eq 124 ]; then
        TIMEOUT_COUNT=$((TIMEOUT_COUNT + 1))
        echo "⚠ Command timed out after 15s"
        if [ $TIMEOUT_COUNT -ge 5 ]; then
            echo "   ⚠ Multiple consecutive timeouts detected"
            echo "   This suggests the gcloud command is hanging, not just slow"
            echo "   Possible causes:"
            echo "     - Domain mapping creation failed"
            echo "     - Network/authentication issue"
            echo "     - gcloud beta command bug"
            echo ""
            echo "   Try checking manually:"
            echo "     gcloud beta run domain-mappings list --region=${REGION}"
        else
            echo "   This usually means the domain mapping is still being created"
        fi
    else
        # Show the actual error
        echo "⚠ Error (exit code: $EXIT_CODE)"
        ERROR_MSG=$(echo "$DNS_RECORDS" | head -3)
        if [ -n "$ERROR_MSG" ]; then
            echo "   Error output: $ERROR_MSG"
        fi
        
        # Check for specific error types
        if echo "$DNS_RECORDS" | grep -qi "not found\|does not exist\|404"; then
            echo "   → Domain mapping not found yet (still being created by Google)"
        elif echo "$DNS_RECORDS" | grep -qi "permission\|denied\|403"; then
            echo "   → Permission denied - check your gcloud auth"
        elif echo "$DNS_RECORDS" | grep -qi "network\|timeout\|connection"; then
            echo "   → Network/connection issue"
        fi
    fi
    
    if [ $i -lt 30 ]; then
        echo "   Waiting 5 seconds before retry..."
        sleep 5
    fi
done

# Final check
if [ -z "$DNS_RECORDS" ] || ! echo "$DNS_RECORDS" | jq -e '.status.resourceRecords' > /dev/null 2>&1; then
    echo ""
    echo -e "${RED}Failed to get DNS records after 30 attempts (2.5 minutes)${NC}"
    echo ""
    
    # Show what we actually got
    if [ -z "$DNS_RECORDS" ]; then
        echo "No response received from gcloud command."
    elif echo "$DNS_RECORDS" | jq . > /dev/null 2>&1; then
        echo "Domain mapping exists but DNS records are not ready yet."
        echo ""
        echo "Current status:"
        echo "$DNS_RECORDS" | jq -r '.status.conditions[]? | "  \(.type): \(.status) - \(.message // "no message")"' 2>/dev/null || echo "  (Could not parse status)"
    else
        echo "Last response from gcloud:"
        echo "$DNS_RECORDS" | head -10
    fi
    
    echo ""
    echo -e "${YELLOW}What to do next:${NC}"
    echo ""
    echo "1. Check if domain mapping exists:"
    echo "   gcloud beta run domain-mappings list --region=${REGION}"
    echo ""
    echo "2. Check detailed status (this may also timeout if still provisioning):"
    echo "   gcloud beta run domain-mappings describe --domain=${CUSTOM_DOMAIN} --region=${REGION}"
    echo ""
    echo "3. Timing expectations:"
    echo "   • Domain mapping creation: 1-2 minutes"
    echo "   • DNS records available: 2-5 minutes (sometimes up to 10)"
    echo "   • If all commands timeout: The domain mapping may have failed to create"
    echo ""
    echo "4. If commands keep timing out after 5+ minutes:"
    echo "   - Check Google Cloud Console for domain mapping status"
    echo "   - Verify the domain mapping was actually created"
    echo "   - Try creating it manually in the console"
    echo ""
    if [ $TIMEOUT_COUNT -ge 20 ]; then
        echo -e "${RED}Note: Most attempts timed out. The gcloud command appears to be hanging.${NC}"
        echo "This suggests the domain mapping may not exist or there's a deeper issue."
        echo ""
    fi
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
    echo -n "[$i/60] Checking SSL status... "
    
    # Use timeout to prevent hanging
    set +e
    STATUS_JSON=$(run_with_timeout 15 gcloud beta run domain-mappings describe \
        --domain=${CUSTOM_DOMAIN} \
        --region=${REGION} \
        --quiet \
        --format=json 2>/dev/null)
    EXIT_CODE=$?
    set -e
    
    if [ $EXIT_CODE -eq 0 ] && [ -n "$STATUS_JSON" ]; then
        STATUS=$(echo "$STATUS_JSON" | jq -r '.status.conditions[]? | select(.type=="Ready") | .status' 2>/dev/null)
        MESSAGE=$(echo "$STATUS_JSON" | jq -r '.status.conditions[]? | select(.type=="Ready") | .message // ""' 2>/dev/null)
        CERT_STATUS=$(echo "$STATUS_JSON" | jq -r '.status.conditions[]? | select(.type=="CertificateProvisioned") | .status' 2>/dev/null)
        
        if [ "$STATUS" = "True" ]; then
            echo -e "${GREEN}✓ Ready!${NC}"
            echo ""
            echo -e "${GREEN}=== Setup Complete ===${NC}"
            echo ""
            echo "Your service is now available at:"
            echo "  https://${CUSTOM_DOMAIN}"
            echo ""
            echo "SSL certificate has been automatically provisioned by Google."
            exit 0
        else
            if [ -n "$MESSAGE" ]; then
                echo "Status: ${STATUS:-Unknown} - ${MESSAGE}"
            elif [ "$CERT_STATUS" = "True" ]; then
                echo "Certificate provisioned, waiting for final setup..."
            else
                echo "Still provisioning (certificate: ${CERT_STATUS:-Unknown})..."
            fi
        fi
    elif [ $EXIT_CODE -eq 124 ]; then
        echo "⚠ Command timed out, will retry..."
    else
        echo "⚠ Could not check status, will retry..."
    fi
    
    if [ $i -lt 60 ]; then
        sleep 30
    fi
done

echo ""
echo -e "${YELLOW}Domain mapping created but SSL certificate not yet ready after 30 minutes.${NC}"
echo ""
echo "The domain mapping is set up, but the SSL certificate provisioning is taking longer than expected."
echo "This is normal - it can sometimes take up to an hour."
echo ""
echo "Check status manually with:"
echo "  gcloud beta run domain-mappings describe --domain=${CUSTOM_DOMAIN} --region=${REGION}"
echo ""
echo "Or check in Google Cloud Console:"
echo "  https://console.cloud.google.com/run/detail/us-central1/prod-webapp/domains"

