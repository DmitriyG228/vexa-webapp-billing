#!/bin/bash
# Setup Google OAuth redirect URIs for deployed services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV="${1:-dev}"
CLIENT_ID="733104961366-n4c2v20o0ecieqnael49vh37uvaqhd6c"

# Get webapp URL from Terraform
cd terraform
WEBAPP_URL=$(terraform output -raw webapp_url)
cd ..

REDIRECT_URI="${WEBAPP_URL}/api/auth/callback/google"

echo -e "${GREEN}=== Google OAuth Setup ===${NC}"
echo ""
echo -e "${YELLOW}OAuth Client ID:${NC} ${CLIENT_ID}"
echo -e "${YELLOW}Environment:${NC} ${ENV}"
echo -e "${YELLOW}Webapp URL:${NC} ${WEBAPP_URL}"
echo ""
echo -e "${BLUE}Redirect URI to add:${NC}"
echo -e "  ${REDIRECT_URI}"
echo ""
echo "You need to add this redirect URI to your OAuth client configuration."
echo ""
echo "Option 1: Using Google Cloud Console (GUI)"
echo "=========================================="
echo "1. Open: https://console.cloud.google.com/apis/credentials?project=spry-pipe-425611-c4"
echo "2. Click on the OAuth 2.0 Client ID (name starts with '733104961366')"
echo "3. Under 'Authorized redirect URIs', click 'ADD URI'"
echo "4. Paste: ${REDIRECT_URI}"
echo "5. Click 'SAVE'"
echo ""
echo "Option 2: Using gcloud CLI (if client is in this project)"
echo "==========================================================="
echo "Note: This requires the OAuth client to be in the current project."
echo "If it's in a different project, use the GUI method above."
echo ""
echo -e "${YELLOW}Would you like to try opening the console now?${NC}"
read -p "Open browser? (y/n): " open_browser

if [ "$open_browser" = "y" ]; then
    open "https://console.cloud.google.com/apis/credentials?project=spry-pipe-425611-c4"
    echo ""
    echo -e "${GREEN}Browser opened!${NC}"
    echo "Add this URI: ${REDIRECT_URI}"
fi

echo ""
echo -e "${GREEN}Once added, your Google OAuth will work with the deployed webapp!${NC}"

