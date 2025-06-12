#!/bin/bash

# Simple script to deploy a subgraph with mustache and goldsky

# Input arguments
NETWORK=$1
VERSION=$2

# Validation
if [ -z "$NETWORK" ] || [ -z "$VERSION" ]; then
  echo "Usage: $0 <network> <version>"
  exit 1
fi

CONFIG_FILE="config/${NETWORK}.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: Config file '$CONFIG_FILE' does not exist."
  exit 1
fi

# Generate subgraph.yaml from mustache template
mustache "$CONFIG_FILE" subgraph.yaml.mustache > subgraph.yaml
if [ $? -ne 0 ]; then
  echo "Error generating subgraph.yaml with mustache"
  exit 1
fi

# Run codegen and build
pnpm codegen
if [ $? -ne 0 ]; then
  echo "Error running 'pnpm codegen'"
  exit 1
fi

pnpm build:subgraph
if [ $? -ne 0 ]; then
  echo "Error running 'pnpm build:subgraph'"
  exit 1
fi

# Deploy subgraph
DEPLOY_NAME="nouns-builder-${NETWORK}/${VERSION}"
goldsky subgraph deploy "$DEPLOY_NAME" --path .
if [ $? -ne 0 ]; then
  echo "Error deploying subgraph to Goldsky"
  exit 1
fi

echo "✅ Subgraph deployed successfully as '$DEPLOY_NAME'"
