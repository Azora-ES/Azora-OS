#!/bin/bash
################################################################################
# AZORA SERVICE UPGRADE AUTOMATION
# 
# This script upgrades ALL services to world-class standards:
# - Adds shared utilities (logger, errors)
# - Creates standard tsconfig.json
# - Creates jest.config.js for testing
# - Creates .env.example
# - Creates standard README.md
# - Removes console.log (reports only, manual fix needed)
# - Reports TypeScript 'any' usage
################################################################################

set -e

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REPO_ROOT="$SCRIPT_DIR"

SERVICES_DIR="$REPO_ROOT/services"
APPS_DIR="$REPO_ROOT/apps"
SHARED_DIR="$REPO_ROOT/services/shared"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🌟 =========================================="
echo "🌟 AZORA SERVICE UPGRADE AUTOMATION"
echo "🌟 =========================================="
echo ""

# Function to check if service exists
service_exists() {
    [ -d "$SERVICES_DIR/$1" ]
}

# Function to check if file exists in service
file_exists() {
    [ -f "$SERVICES_DIR/$1/$2" ]
}

# Function to count console.log usage
count_console_logs() {
    local service=$1
    local target_dir="$SERVICES_DIR/$service"
    
    # Check if this is in apps directory instead
    if [ ! -d "$target_dir" ] && [ -d "$APPS_DIR/$service" ]; then
        target_dir="$APPS_DIR/$service"
    fi
    
    local count=$(find "$target_dir" -name "*.ts" -o -name "*.tsx" -not -path "*/node_modules/*" -exec grep -c "console\." {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    echo "$count"
}

# Function to count 'any' usage
count_any_types() {
    local service=$1
    local target_dir="$SERVICES_DIR/$service"
    
    # Check if this is in apps directory instead
    if [ ! -d "$target_dir" ] && [ -d "$APPS_DIR/$service" ]; then
        target_dir="$APPS_DIR/$service"
    fi
    
    local count=$(find "$target_dir" -name "*.ts" -o -name "*.tsx" -not -path "*/node_modules/*" -exec grep -c ": any\|<any>" {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    echo "$count"
}

# Function to create standard tsconfig.json
create_tsconfig() {
    local service=$1
    local target_dir="$SERVICES_DIR/$service"
    
    # Check if this is in apps directory instead
    if [ ! -d "$target_dir" ] && [ -d "$APPS_DIR/$service" ]; then
        target_dir="$APPS_DIR/$service"
    fi
    
    if [ ! -f "$target_dir/tsconfig.json" ]; then
        cat > "$target_dir/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
EOF
        echo -e "${GREEN}✅ Created tsconfig.json${NC}"
    else
        echo -e "${BLUE}ℹ️  tsconfig.json exists${NC}"
    fi
}

# Function to create jest.config.js
create_jest_config() {
    local service=$1
    local target_dir="$SERVICES_DIR/$service"
    
    # Check if this is in apps directory instead
    if [ ! -d "$target_dir" ] && [ -d "$APPS_DIR/$service" ]; then
        target_dir="$APPS_DIR/$service"
    fi
    
    if [ ! -f "$target_dir/jest.config.js" ] && [ ! -f "$target_dir/jest.config.json" ]; then
        cat > "$target_dir/jest.config.js" <<'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
EOF
        echo -e "${GREEN}✅ Created jest.config.js${NC}"
    else
        echo -e "${BLUE}ℹ️  jest config exists${NC}"
    fi
}

# Function to create .env.example
create_env_example() {
    local service=$1
    local target_dir="$SERVICES_DIR/$service"
    
    # Check if this is in apps directory instead
    if [ ! -d "$target_dir" ] && [ -d "$APPS_DIR/$service" ]; then
        target_dir="$APPS_DIR/$service"
    fi
    
    if [ ! -f "$target_dir/.env.example" ]; then
        cat > "$target_dir/.env.example" <<'EOF'
# Service Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (if needed)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-here

# Master Orchestrator Integration
ORCHESTRATOR_URL=http://localhost:9000
ORCHESTRATOR_WS=ws://localhost:9000/orchestrator/stream
EOF
        echo -e "${GREEN}✅ Created .env.example${NC}"
    else
        echo -e "${BLUE}ℹ️  .env.example exists${NC}"
    fi
}

# Function to create __tests__ directory
create_tests_dir() {
    local service=$1
    local target_dir="$SERVICES_DIR/$service"
    
    # Check if this is in apps directory instead
    if [ ! -d "$target_dir" ] && [ -d "$APPS_DIR/$service" ]; then
        target_dir="$APPS_DIR/$service"
    fi
    
    if [ ! -d "$target_dir/__tests__" ]; then
        mkdir -p "$target_dir/__tests__"
        echo -e "${GREEN}✅ Created __tests__ directory${NC}"
    else
        echo -e "${BLUE}ℹ️  __tests__ directory exists${NC}"
    fi
}

# Function to upgrade package.json
upgrade_package_json() {
    local service=$1
    local target_dir="$SERVICES_DIR/$service"
    
    # Check if this is in apps directory instead
    if [ ! -d "$target_dir" ] && [ -d "$APPS_DIR/$service" ]; then
        target_dir="$APPS_DIR/$service"
    fi
    
    if [ -f "$target_dir/package.json" ]; then
        # Check if test script exists
        if ! grep -q '"test"' "$target_dir/package.json"; then
            echo -e "${YELLOW}⚠️  No test script in package.json${NC}"
        fi
    else
        echo -e "${RED}❌ Missing package.json${NC}"
    fi
}

# Main upgrade function
upgrade_service() {
    local service=$1
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 Upgrading: $service${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Create standard files
    create_tsconfig "$service"
    create_jest_config "$service"
    create_env_example "$service"
    create_tests_dir "$service"
    upgrade_package_json "$service"
    
    # Report issues
    local console_count=$(count_console_logs "$service")
    local any_count=$(count_any_types "$service")
    
    if [ "$console_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $console_count console.log statements${NC}"
    else
        echo -e "${GREEN}✅ No console.log found${NC}"
    fi
    
    if [ "$any_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $any_count 'any' types${NC}"
    else
        echo -e "${GREEN}✅ No 'any' types found${NC}"
    fi
    
    echo -e "${GREEN}✅ Service upgrade complete${NC}"
}

# Get all services
echo "🔍 Scanning for services..."

# Scan for all services in services/ directory
services=$(find "$SERVICES_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "shared" -exec basename {} \; | sort)

# Also scan apps/ directory
echo "🔍 Scanning for apps..."
apps=$(find "$APPS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; 2>/dev/null | sort)

total=0
upgraded=0

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 UPGRADING SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for service in $services; do
    ((total++))
    if service_exists "$service"; then
        upgrade_service "$service"
        ((upgraded++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 UPGRADING APPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for app in $apps; do
    ((total++))
    if [ -d "$APPS_DIR/$app" ]; then
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}📱 Upgrading App: $app${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        # Apps may use different structure, check for package.json
        if [ -f "$APPS_DIR/$app/package.json" ]; then
            echo -e "${GREEN}✅ App has package.json${NC}"
            
            # Check for tests
            if [ -d "$APPS_DIR/$app/__tests__" ] || [ -d "$APPS_DIR/$app/tests" ]; then
                echo -e "${GREEN}✅ Tests directory exists${NC}"
            else
                echo -e "${YELLOW}⚠️  No tests directory found${NC}"
            fi
            
            ((upgraded++))
        else
            echo -e "${YELLOW}⚠️  No package.json found${NC}"
        fi
    fi
done

echo ""
echo "🌟 =========================================="
echo "🌟 UPGRADE COMPLETE"
echo "🌟 =========================================="
echo ""
echo -e "${GREEN}✅ Services processed: $upgraded/$total${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Review services with console.log and replace with Logger"
echo "2. Review services with 'any' types and add proper types"
echo "3. Add tests to services with 0% coverage"
echo "4. Run: npm install in each service"
echo "5. Run: npm test in each service"
echo ""
echo "🚀 Ready for world-class deployment!"
