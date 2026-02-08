#!/bin/bash

# Script to deploy subgraph to all networks

# Input arguments
VERSION=$1

# Validation
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Define all networks
NETWORKS=(
  "ethereum-mainnet"
  "ethereum-sepolia"
  "base-mainnet"
  "base-sepolia"
  "optimism-mainnet"
  "optimism-sepolia"
  "zora-mainnet"
  "zora-sepolia"
)

echo "🚀 Starting deployment of version '$VERSION' to all networks..."
echo ""

# Track success/failure
FAILED_NETWORKS=()
SUCCESSFUL_NETWORKS=()

# Deploy to each network
for NETWORK in "${NETWORKS[@]}"; do
  echo "================================================"
  echo "📡 Deploying to $NETWORK..."
  echo "================================================"

  bash ./scripts/deploy.sh "$NETWORK" "$VERSION"

  if [ $? -eq 0 ]; then
    SUCCESSFUL_NETWORKS+=("$NETWORK")
    echo "✅ $NETWORK deployment successful"
  else
    FAILED_NETWORKS+=("$NETWORK")
    echo "❌ $NETWORK deployment failed"
  fi

  echo ""
done

# Summary
echo "================================================"
echo "📊 Deployment Summary"
echo "================================================"
echo "Successful: ${#SUCCESSFUL_NETWORKS[@]}/${#NETWORKS[@]}"
for NETWORK in "${SUCCESSFUL_NETWORKS[@]}"; do
  echo "  ✅ $NETWORK"
done

if [ ${#FAILED_NETWORKS[@]} -gt 0 ]; then
  echo ""
  echo "Failed: ${#FAILED_NETWORKS[@]}/${#NETWORKS[@]}"
  for NETWORK in "${FAILED_NETWORKS[@]}"; do
    echo "  ❌ $NETWORK"
  done
  exit 1
fi

echo ""
echo "🎉 All deployments completed successfully!"
