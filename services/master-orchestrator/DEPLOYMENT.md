# Master Orchestrator Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Access to services directory
- Port 9000 available (or configure alternative)

## Installation

### 1. Install Dependencies

```bash
cd services/master-orchestrator
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
# Orchestrator Configuration
ORCHESTRATOR_PORT=9000
ORCHESTRATOR_HOST=0.0.0.0
LOG_LEVEL=info

# Paths (optional, defaults to relative paths)
SERVICES_PATH=../../services
APPS_PATH=../../../apps
```

### 3. Create Logs Directory

```bash
mkdir -p ../../logs/orchestrator
```

## Running

### Development Mode

```bash
npm run dev
```

This starts the orchestrator with auto-reload on file changes.

### Production Mode

```bash
npm start
```

### Build TypeScript

```bash
npm run build
node dist/index.js
```

## Dashboard Setup

### 1. Install Dashboard Dependencies

```bash
cd ../../apps/orchestrator-dashboard
npm install
```

### 2. Configure Dashboard

Create `.env.local`:

```bash
NEXT_PUBLIC_ORCHESTRATOR_API=http://localhost:9000
NEXT_PUBLIC_ORCHESTRATOR_WS=ws://localhost:9000/orchestrator/stream
```

### 3. Run Dashboard

```bash
npm run dev
```

Dashboard will be available at `http://localhost:3001`

## Systemd Service (Linux)

Create `/etc/systemd/system/azora-orchestrator.service`:

```ini
[Unit]
Description=Azora OS Master Orchestrator
After=network.target

[Service]
Type=simple
User=azora
WorkingDirectory=/path/to/Azora-OS/services/master-orchestrator
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/azora/orchestrator.log
StandardError=append:/var/log/azora/orchestrator-error.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable azora-orchestrator
sudo systemctl start azora-orchestrator
sudo systemctl status azora-orchestrator
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy orchestrator files
COPY services/master-orchestrator ./orchestrator
COPY services ./services

# Install dependencies
WORKDIR /app/orchestrator
RUN npm install --production

# Expose port
EXPOSE 9000

# Start orchestrator
CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t azora-orchestrator .
docker run -d -p 9000:9000 --name orchestrator azora-orchestrator
```

## Monitoring

### Check Logs

```bash
# Real-time logs
tail -f ../../logs/orchestrator/orchestrator.log

# Error logs only
tail -f ../../logs/orchestrator/orchestrator-errors.log
```

### API Health Check

```bash
curl http://localhost:9000/orchestrator/health
```

### View System Status

```bash
curl http://localhost:9000/orchestrator/status | jq
```

## Troubleshooting

### Port Already in Use

Change port in `.env`:

```bash
ORCHESTRATOR_PORT=9001
```

### Services Not Discovered

Check services path:

```bash
ls -la ../../services
```

Verify SERVICES_PATH in configuration.

### WebSocket Connection Failed

- Check firewall rules
- Verify WebSocket path in dashboard config
- Check CORS settings in orchestrator-config.ts

### High Memory Usage

Reduce health check frequency in `orchestrator-config.ts`:

```typescript
healthCheckInterval: 10000  // 10 seconds instead of 5
```

## Performance Tuning

### For Large Deployments (100+ services)

```typescript
// orchestrator-config.ts
{
  parallelLaunchLimit: 20,  // Launch more in parallel
  healthCheckInterval: 10000,  // Less frequent checks
  maxHealthHistorySize: 50  // Smaller history
}
```

### For Small Deployments (<20 services)

```typescript
{
  parallelLaunchLimit: 5,
  healthCheckInterval: 3000,  // More frequent checks
  maxHealthHistorySize: 200  // Larger history
}
```

## Security

### Production Checklist

- [ ] Change default port
- [ ] Enable authentication on API endpoints
- [ ] Configure CORS for production domains
- [ ] Use HTTPS/WSS in production
- [ ] Set appropriate file permissions
- [ ] Run as non-root user
- [ ] Configure firewall rules

### Enable API Authentication

Add middleware in `orchestrator-api.ts`:

```typescript
app.use('/orchestrator', authMiddleware);
```

## Backup and Recovery

### Backup Healing History

```bash
curl http://localhost:9000/orchestrator/healing-history > healing-history-backup.json
```

### Export Dependency Graph

```bash
curl http://localhost:9000/orchestrator/dependencies > dependency-graph.json
```

## Scaling

### Multiple Orchestrator Instances

Not recommended. The orchestrator should be a singleton. For HA:

1. Run orchestrator on multiple machines
2. Use keepalived or similar for failover
3. Only one instance should be active at a time

### Horizontal Scaling of Services

The orchestrator supports unlimited services. For better performance:

1. Group services by domain
2. Use multiple databases
3. Implement service sharding

## Updates

### Rolling Update

1. Stop orchestrator
2. Update code
3. Run tests
4. Restart orchestrator
5. Verify all services running

```bash
systemctl stop azora-orchestrator
git pull
cd services/master-orchestrator
npm install
npm test
systemctl start azora-orchestrator
```

### Zero-Downtime Update

Not possible as orchestrator is the control plane. Plan maintenance windows.

## Support

For issues:
1. Check logs in `logs/orchestrator/`
2. Verify service health endpoints
3. Review dependency graph for cycles
4. Check system resources (CPU, memory)

## License

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
