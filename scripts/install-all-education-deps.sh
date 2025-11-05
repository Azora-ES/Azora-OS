#!/bin/bash
#
# AZORA PROPRIETARY LICENSE
# Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
#
# Parallel dependency installation for all education services
# Prevents bottlenecks by running installations concurrently

set -e

echo "🚀 Installing all education service dependencies in parallel..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Array of services
services=(
  "services/azora-education"
  "services/azora-assessment"
  "services/azora-content"
  "services/azora-analytics"
  "services/azora-credentials"
  "services/azora-collaboration"
  "services/azora-education-payments"
  "services/azora-media"
  "services/azora-lms"
  "services/azora-sapiens"
  "services/azora-institutional-system"
  "services/azora-virtual-library"
  "services/azora-virtual-career"
  "services/azora-virtual-counseling"
)

# Function to install dependencies for a service
install_service() {
  local service=$1
  if [ -d "$service" ] && [ -f "$service/package.json" ]; then
    echo -e "${BLUE}📦 Installing dependencies for $service...${NC}"
    cd "$service"
    npm install --silent 2>&1 | sed "s/^/[$(basename $service)] /" &
    cd - > /dev/null
    echo -e "${GREEN}✅ Queued: $service${NC}"
  else
    echo -e "${NC}⚠️  Skipping $service (no package.json found)${NC}"
  fi
}

# Export function for parallel execution
export -f install_service

# Install all services in parallel
echo "Starting parallel installations..."
for service in "${services[@]}"; do
  install_service "$service" &
done

# Wait for all background jobs to complete
wait

echo ""
echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"

# Verify installations
echo ""
echo "🔍 Verifying installations..."
failed=0
for service in "${services[@]}"; do
  if [ -d "$service" ] && [ -f "$service/package.json" ]; then
    if [ -d "$service/node_modules" ]; then
      echo -e "${GREEN}✅ $service: OK${NC}"
    else
      echo -e "${NC}❌ $service: FAILED${NC}"
      failed=$((failed + 1))
    fi
  fi
done

if [ $failed -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 All services ready!${NC}"
  exit 0
else
  echo ""
  echo -e "${NC}⚠️  $failed service(s) failed installation${NC}"
  exit 1
fi
