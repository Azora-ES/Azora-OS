# Master Orchestrator - Central Nervous System of Azora OS

The Master Orchestrator is the intelligent control system that manages the entire Azora OS ecosystem. It automatically discovers, launches, monitors, and heals all services in the platform.

## 🎯 Purpose

Transform Azora from a collection of independent services into a living, self-managing organism that:
- Automatically discovers and catalogs all services
- Launches services in the correct dependency order
- Continuously monitors service health
- Automatically heals failures without human intervention
- Provides real-time system visibility

## 🏗️ Architecture

### Core Components

#### 1. Service Discovery Engine
- Auto-scans the `services/` directory
- Builds intelligent dependency graphs
- Creates a comprehensive service registry
- Tracks service capabilities and versions

#### 2. Phased Launching Engine
- Launches services in 7 dependency-aware phases
- Supports parallel and serial launch strategies
- Implements timeout management
- Provides graceful degradation on failures

#### 3. Health Monitoring System
- Polls `/health` endpoints every 5 seconds
- Tracks service health status in real-time
- Collects performance metrics
- Detects degradation patterns

#### 4. Self-Healing Engine
- Automatically detects service failures
- Executes intelligent restart protocols
- Implements circuit breaker pattern
- Prevents cascading failures
- Quarantines persistently failing services

#### 5. REST API & WebSocket Server
- Real-time system status via WebSocket
- RESTful API for monitoring and control
- Manual service restart capabilities
- Dependency graph visualization

## 🚀 Quick Start

### Installation

```bash
cd services/master-orchestrator
npm install
```

### Running

```bash
# Start the orchestrator
npm start

# Development mode with auto-reload
npm run dev
```

### Testing

```bash
npm test
```

## 📡 API Endpoints

### REST API (Port 9000)

#### System Status
```http
GET /orchestrator/status
```
Returns complete system status including all services, health, and healing history.

#### Service List
```http
GET /orchestrator/services
```
Returns list of all services with current status.

#### Service Details
```http
GET /orchestrator/services/:name
```
Returns detailed information about a specific service.

#### Health Status
```http
GET /orchestrator/health-status
```
Returns overall system health metrics.

#### Dependency Graph
```http
GET /orchestrator/dependencies
```
Returns the service dependency graph.

#### Healing History
```http
GET /orchestrator/healing-history?limit=100
```
Returns recent healing events.

#### Manual Restart
```http
POST /orchestrator/restart/:service
```
Manually restart a specific service.

#### Statistics
```http
GET /orchestrator/stats
```
Returns system statistics and metrics.

### WebSocket (ws://localhost:9000/orchestrator/stream)

Connect to receive real-time updates:
```javascript
const ws = new WebSocket('ws://localhost:9000/orchestrator/stream');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'status_update':
      // System status update
      break;
    case 'health_update':
      // Service health update
      break;
    case 'healing_event':
      // Self-healing action
      break;
    case 'service_event':
      // Service start/stop/failure
      break;
  }
};
```

## 📋 Launch Phases

The orchestrator launches services in 7 carefully ordered phases:

### Phase 0: Critical Infrastructure (Serial)
- azora-covenant
- azora-aegis
- azora-database
- azora-core

### Phase 1: Core Services (Parallel)
- azora-mint
- azora-nexus
- auth-service
- user-management
- notification-service

### Phase 2: Intelligence Layer (Parallel)
- azora-lms
- ambient-intelligence
- quantum-ai
- ai-orchestrator
- analytics-service

### Phase 3: B2B Industries (Parallel)
- retail-ai
- cold-chain
- community-safety
- agriculture-ai
- logistics-optimizer

### Phase 4: User-Facing Services (Parallel)
- api-gateway
- azora-forge
- azora-marketplace
- payment-gateway
- messaging-service

### Phase 5: Advanced Services (Parallel)
- judiciary-service
- constitutional-court
- arbiter-service
- compliance-engine
- audit-logging-service

### Phase 6: Optional Services (Parallel)
- quantum-deep-mind
- enterprise-analytics
- blockchain-integration
- iot-gateway

## 🔧 Self-Healing Protocols

### Restart Strategies

1. **Immediate Restart** (Attempts 1-3)
   - Quick restart with minimal delay
   - Exponential backoff: 1s, 5s, 15s

2. **Graceful Restart** (Attempts 4-5)
   - Verify dependencies are healthy
   - Graceful shutdown (SIGTERM)
   - 30s, 60s backoff

3. **Dependency Restart** (Attempts 6-7)
   - Restart failed dependencies first
   - Wait for stabilization
   - Retry main service

4. **Quarantine** (After max attempts)
   - Mark service as quarantined
   - Prevent restart loops
   - Require manual intervention

### Circuit Breaker

- Opens after 3 consecutive failures
- Prevents cascading failures
- Automatically resets after 60 seconds
- Half-open state for testing recovery

## 📊 Service Registry

Each service in the registry contains:

```typescript
{
  metadata: {
    name: string
    port: number
    version: string
    dependencies: string[]
    priority: 'critical' | 'high' | 'medium' | 'low'
    launchPhase: number
    capabilities: string[]
  },
  status: 'healthy' | 'degraded' | 'unhealthy' | 'timeout' | 'quarantined',
  process: ChildProcess,
  healthHistory: HealthCheckResult[],
  restartAttempts: number,
  metrics: {
    requestCount: number
    errorCount: number
    avgResponseTime: number
    uptimePercentage: number
  }
}
```

## 🔍 Monitoring

### Health Checks

- Performed every 5 seconds
- Multiple endpoint fallbacks: `/health`, `/api/health`, `/status`, `/ping`
- Tracks: response time, uptime, memory, CPU, dependencies

### Metrics Collection

- Service uptime
- Response times
- Error rates
- Restart counts
- Health history (last 100 checks)

## 🛠️ Configuration

Edit `orchestrator-config.ts` to customize:

```typescript
{
  healthCheckInterval: 5000,        // 5 seconds
  defaultMaxRestartAttempts: 5,
  defaultStartupTimeout: 60000,     // 60 seconds
  circuitBreakerThreshold: 3,
  circuitBreakerResetTimeout: 60000, // 1 minute
  parallelLaunchLimit: 10,
  logLevel: 'info'
}
```

## 📝 Logging

Logs are written to:
- Console (with colors)
- `logs/orchestrator/orchestrator.log` (all logs)
- `logs/orchestrator/orchestrator-errors.log` (errors only)

Log levels: `debug`, `info`, `warn`, `error`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- orchestrator.test.ts

# Run with coverage
npm test -- --coverage
```

## 🔐 Security

- Service processes run with limited permissions
- Health endpoints use local networking only
- API endpoints can be secured with authentication
- WebSocket connections can be validated

## 🚨 Troubleshooting

### Service won't start
1. Check service logs in `logs/orchestrator/`
2. Verify dependencies are healthy
3. Check port availability
4. Review restart attempts in healing history

### All services failing
1. Check Phase 0 (critical infrastructure)
2. Verify database connectivity
3. Check system resources (memory, CPU)
4. Review orchestrator logs

### Circuit breaker keeps opening
1. Check service health endpoint
2. Review service logs for errors
3. Verify dependencies are available
4. Check for resource exhaustion

## 📈 Performance

- Handles 100+ services efficiently
- Sub-second health checks
- Minimal memory footprint
- Parallel launch for speed
- Optimized dependency resolution

## 🤝 Contributing

This is the central nervous system of Azora OS. Changes should be:
- Thoroughly tested
- Backward compatible
- Well documented
- Performance optimized

## 📄 License

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.

---

**Built with ❤️ for Africa's Digital Transformation**
