#!/bin/sh
set -e

echo "=================================================="
echo "Starting Kanggo Application Initialization"
echo "=================================================="

echo ""
echo "Step 1: Database Initialization"
echo "--------------------------------------------------"
bun run scripts/init-db.ts

echo ""
echo "Step 2: Starting Application"
echo "--------------------------------------------------"
exec bun run src/index.ts
