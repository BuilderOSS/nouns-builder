#!/bin/bash

# Simple script to build a subgraph with mustache for templated subgraph.yaml

# Input arguments
NETWORK=$1

# Validation
if [ -z "$NETWORK" ]; then
  echo "Usage: $0 <network>"
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
pnpm graph:codegen
if [ $? -ne 0 ]; then
  echo "Error running 'pnpm codegen'"
  exit 1
fi

pnpm graph:build
if [ $? -ne 0 ]; then
  echo "Error running 'pnpm build:subgraph'"
  exit 1
fi
