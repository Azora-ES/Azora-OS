/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Master Orchestrator REST API & WebSocket Server
 * 
 * Provides HTTP and WebSocket interfaces for monitoring and controlling the orchestrator
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { MasterOrchestrator } from './orchestrator';
import { WebSocketMessage } from './types/orchestrator.types';
import { API_CONFIG } from './orchestrator-config';
import { logger, createServiceLogger } from './logging/orchestrator-logger';
import { orchestratorEvents } from './logging/event-emitter';

const apiLogger = createServiceLogger('OrchestratorAPI');

export class OrchestratorAPI {
  private app: express.Application;
  private httpServer: any;
  private wss: WebSocketServer;
  private orchestrator: MasterOrchestrator;
  private connectedClients: Set<WebSocket> = new Set();

  constructor(orchestrator: MasterOrchestrator) {
    this.orchestrator = orchestrator;
    this.app = express();
    this.httpServer = createServer(this.app);
    this.wss = new WebSocketServer({ 
      server: this.httpServer,
      path: API_CONFIG.websocketPath
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupEventBroadcasting();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors({ origin: API_CONFIG.corsOrigins }));
    this.app.use(express.json());
    
    // Request logging
    this.app.use((req, res, next) => {
      apiLogger.debug(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup REST API routes
   */
  private setupRoutes(): void {
    const router = express.Router();

    // Health check
    router.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date() });
    });

    // Get full system status
    router.get('/status', (req, res) => {
      try {
        const status = this.orchestrator.getSystemStatus();
        res.json(status);
      } catch (error: any) {
        apiLogger.error('Error getting status', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Get all services with their status
    router.get('/services', (req, res) => {
      try {
        const services = this.orchestrator.getAllServices();
        const serviceList = Array.from(services.entries()).map(([name, entry]) => ({
          name,
          status: entry.status,
          port: entry.metadata.port,
          priority: entry.metadata.priority,
          phase: entry.metadata.launchPhase,
          uptime: entry.uptime,
          restartAttempts: entry.restartAttempts,
          healthHistory: entry.healthHistory.slice(-10), // Last 10 checks
          metrics: entry.metrics
        }));

        res.json({
          total: serviceList.length,
          services: serviceList
        });
      } catch (error: any) {
        apiLogger.error('Error getting services', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Get specific service details
    router.get('/services/:name', (req, res) => {
      try {
        const { name } = req.params;
        const service = this.orchestrator.getService(name);

        if (!service) {
          return res.status(404).json({ error: 'Service not found' });
        }

        res.json({
          name,
          metadata: service.metadata,
          status: service.status,
          process: {
            pid: service.pid,
            startTime: service.startTime
          },
          health: service.healthHistory.slice(-20),
          metrics: service.metrics,
          restartAttempts: service.restartAttempts,
          lastRestartTime: service.lastRestartTime
        });
      } catch (error: any) {
        apiLogger.error('Error getting service', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Get system health
    router.get('/health-status', (req, res) => {
      try {
        const health = this.orchestrator.getHealthStatus();
        res.json(health);
      } catch (error: any) {
        apiLogger.error('Error getting health status', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Get dependency graph
    router.get('/dependencies', (req, res) => {
      try {
        const graph = this.orchestrator.getDependencyGraph();
        res.json(graph);
      } catch (error: any) {
        apiLogger.error('Error getting dependencies', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Get healing history
    router.get('/healing-history', (req, res) => {
      try {
        const history = this.orchestrator.getHealingHistory();
        const limit = parseInt(req.query.limit as string) || 100;
        
        res.json({
          total: history.length,
          events: history.slice(-limit)
        });
      } catch (error: any) {
        apiLogger.error('Error getting healing history', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Manual service restart
    router.post('/restart/:service', async (req, res) => {
      try {
        const { service } = req.params;
        
        apiLogger.info(`Manual restart requested: ${service}`);
        
        const success = await this.orchestrator.restartService(service);
        
        if (success) {
          res.json({ 
            success: true, 
            message: `Service ${service} restarted successfully` 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: `Failed to restart service ${service}` 
          });
        }
      } catch (error: any) {
        apiLogger.error('Error restarting service', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Get statistics
    router.get('/stats', (req, res) => {
      try {
        const health = this.orchestrator.getHealthStatus();
        const status = this.orchestrator.getSystemStatus();

        res.json({
          uptime: status.uptime,
          state: status.state,
          services: {
            total: health.totalServices,
            healthy: health.healthyServices,
            degraded: health.degradedServices,
            unhealthy: health.unhealthyServices,
            quarantined: health.quarantinedServices
          },
          websocketClients: this.connectedClients.size,
          timestamp: new Date()
        });
      } catch (error: any) {
        apiLogger.error('Error getting stats', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Mount router
    this.app.use('/orchestrator', router);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Azora OS Master Orchestrator',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          status: '/orchestrator/status',
          services: '/orchestrator/services',
          health: '/orchestrator/health-status',
          dependencies: '/orchestrator/dependencies',
          healingHistory: '/orchestrator/healing-history',
          websocket: API_CONFIG.websocketPath
        }
      });
    });
  }

  /**
   * Setup WebSocket server
   */
  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      apiLogger.info('WebSocket client connected');
      this.connectedClients.add(ws);

      // Send initial status
      this.sendToClient(ws, {
        type: 'status_update',
        timestamp: new Date(),
        payload: this.orchestrator.getSystemStatus()
      });

      ws.on('close', () => {
        apiLogger.info('WebSocket client disconnected');
        this.connectedClients.delete(ws);
      });

      ws.on('error', (error) => {
        apiLogger.error('WebSocket error', { error: error.message });
        this.connectedClients.delete(ws);
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error: any) {
          apiLogger.error('Invalid WebSocket message', { error: error.message });
        }
      });
    });

    apiLogger.info('WebSocket server initialized');
  }

  /**
   * Handle WebSocket messages from clients
   */
  private handleWebSocketMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'subscribe':
        // Client subscribes to updates
        this.sendToClient(ws, {
          type: 'status_update',
          timestamp: new Date(),
          payload: { subscribed: true }
        });
        break;

      case 'get_status':
        // Send current status
        this.sendToClient(ws, {
          type: 'status_update',
          timestamp: new Date(),
          payload: this.orchestrator.getSystemStatus()
        });
        break;

      default:
        apiLogger.warn('Unknown WebSocket message type', { type: message.type });
    }
  }

  /**
   * Setup event broadcasting to WebSocket clients
   */
  private setupEventBroadcasting(): void {
    // Broadcast health updates
    orchestratorEvents.on('healthCheck', (event) => {
      this.broadcast({
        type: 'health_update',
        timestamp: new Date(),
        payload: event
      });
    });

    // Broadcast healing events
    orchestratorEvents.on('healing', (event) => {
      this.broadcast({
        type: 'healing_event',
        timestamp: new Date(),
        payload: event
      });
    });

    // Broadcast service events
    orchestratorEvents.on('monitoring', (event) => {
      this.broadcast({
        type: 'service_event',
        timestamp: new Date(),
        payload: event
      });
    });

    // Periodic status updates
    setInterval(() => {
      this.broadcast({
        type: 'status_update',
        timestamp: new Date(),
        payload: this.orchestrator.getSystemStatus()
      });
    }, 10000); // Every 10 seconds
  }

  /**
   * Send message to a specific client
   */
  private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    for (const client of this.connectedClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    }
  }

  /**
   * Start the API server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(API_CONFIG.port, API_CONFIG.host, () => {
        apiLogger.info(`Orchestrator API listening`, {
          host: API_CONFIG.host,
          port: API_CONFIG.port,
          websocket: API_CONFIG.websocketPath
        });
        resolve();
      });
    });
  }

  /**
   * Stop the API server
   */
  async stop(): Promise<void> {
    // Close all WebSocket connections
    for (const client of this.connectedClients) {
      client.close();
    }

    // Close WebSocket server
    this.wss.close();

    // Close HTTP server
    return new Promise((resolve) => {
      this.httpServer.close(() => {
        apiLogger.info('Orchestrator API stopped');
        resolve();
      });
    });
  }
}
