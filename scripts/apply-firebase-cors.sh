#!/bin/bash
# Firebase Storage CORS Configuration Script
# This script applies CORS configuration to your Firebase Storage bucket

set -e

BUCKET_NAME=$1
PROJECT_ID=$2

if [ -z "$BUCKET_NAME" ]; then
    echo "ERROR: Bucket name is required"
    echo ""
    echo "Usage: ./apply-firebase-cors.sh <BUCKET_NAME> [PROJECT_ID]"
    echo "Example: ./apply-firebase-cors.sh my-project.appspot.com my-project"
    exit 1
fi

echo "========================================"
echo "Firebase Storage CORS Configuration"
echo "========================================"
echo ""

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null; then
    echo "ERROR: gsutil is not installed or not in PATH"
    echo ""
    echo "Please install Google Cloud SDK:"
    echo "  curl https://sdk.cloud.google.com | bash"
    echo "  exec -l \$SHELL"
    exit 1
fi

echo "✓ gsutil found"
echo ""

# Check if authenticated
echo "Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "ERROR: Not authenticated with Google Cloud"
    echo ""
    echo "Please run: gcloud auth login"
    exit 1
fi

echo "✓ Authenticated"
echo ""

# Set project if provided
if [ -n "$PROJECT_ID" ]; then
    echo "Setting project to: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
    echo "✓ Project set"
    echo ""
fi

# Get CORS file path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORS_FILE="$SCRIPT_DIR/../cors.json"

if [ ! -f "$CORS_FILE" ]; then
    echo "ERROR: cors.json not found at: $CORS_FILE"
    exit 1
fi

echo "CORS configuration file: $CORS_FILE"
echo "Bucket name: gs://$BUCKET_NAME"
echo ""

# Apply CORS
echo "Applying CORS configuration..."
if gsutil cors set "$CORS_FILE" "gs://$BUCKET_NAME"; then
    echo "✓ CORS configuration applied successfully!"
    echo ""
    
    # Verify CORS
    echo "Verifying CORS configuration..."
    gsutil cors get "gs://$BUCKET_NAME"
    echo ""
    echo "✓ CORS configuration verified"
else
    echo "ERROR: Failed to apply CORS configuration"
    exit 1
fi

echo ""
echo "========================================"
echo "CORS Configuration Complete!"
echo "========================================"

