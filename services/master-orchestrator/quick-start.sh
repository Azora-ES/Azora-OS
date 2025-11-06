#!/bin/bash

# AZORA PROPRIETARY LICENSE
# Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

###############################################################################
# Master Orchestrator Quick Start Script
# 
# This script sets up and starts the Master Orchestrator
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        AZORA OS MASTER ORCHESTRATOR QUICK START                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${YELLOW}Checking Node.js version...${NC}"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js 18+ required. Current version: $(node --version)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version OK${NC}"

# Navigate to orchestrator directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Create logs directory
echo -e "${YELLOW}Creating logs directory...${NC}"
mkdir -p ../../logs/orchestrator
echo -e "${GREEN}✓ Logs directory created${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Dependencies already installed"
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
# Master Orchestrator Configuration
ORCHESTRATOR_PORT=9000
ORCHESTRATOR_HOST=0.0.0.0
LOG_LEVEL=info

# Paths
SERVICES_PATH=../../services
APPS_PATH=../../../apps
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     SETUP COMPLETE                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "To start the Master Orchestrator:"
echo ""
echo "  Production:  npm start"
echo "  Development: npm run dev"
echo ""
echo "Dashboard setup:"
echo "  cd ../../apps/orchestrator-dashboard"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "API will be available at: http://localhost:9000"
echo "Dashboard will be available at: http://localhost:3001"
echo ""
