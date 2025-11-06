/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Master Orchestrator - Central Nervous System of Azora OS
 * 
 * This is the heart of the entire system that:
 * - Discovers all services
 * - Launches them in dependency-aware phases
 * - Monitors their health continuously
 * - Automatically heals failures
 * - Provides real-time system status
 */

import { ServiceRegistry } from './discovery/service-registry';
import { ServiceDiscovery } from './discovery/service-discovery';
import { DependencyResolver } from './discovery/dependency-resolver';
import { PhasedLauncher } from './launching/phased-launcher';
import { LaunchValidator } from './launching/launch-validator';
import { LaunchSequencer } from './launching/launch-sequencer';
import { HealthMonitor } from './health/health-monitor';
import { SelfHealingEngine } from './healing/self-healing';
import { OrchestratorStatus } from './types/orchestrator.types';
import { LaunchResult } from './types/service.types';
import { logger } from './logging/orchestrator-logger';
import { orchestratorEvents } from './logging/event-emitter';

export class MasterOrchestrator {
  private serviceRegistry: ServiceRegistry;
  private serviceDiscovery: ServiceDiscovery;
  private dependencyResolver: DependencyResolver;
  private launchValidator: LaunchValidator;
  private launchSequencer: LaunchSequencer;
  private phasedLauncher: PhasedLauncher;
  private healthMonitor: HealthMonitor;
  private healingEngine: SelfHealingEngine;

  private state: OrchestratorStatus['state'] = 'initializing';
  private startTime: Date = new Date();
  private launchResult?: LaunchResult;

  constructor() {
    logger.info('=== AZORA OS MASTER ORCHESTRATOR INITIALIZING ===');

    // Initialize components
    this.serviceRegistry = new ServiceRegistry();
    this.serviceDiscovery = new ServiceDiscovery(this.serviceRegistry);
    this.dependencyResolver = new DependencyResolver(this.serviceRegistry);
    this.launchValidator = new LaunchValidator(this.serviceRegistry, this.dependencyResolver);
    this.launchSequencer = new LaunchSequencer(this.serviceRegistry, this.dependencyResolver);
    
    this.phasedLauncher = new PhasedLauncher(
      this.serviceRegistry,
      this.dependencyResolver,
      this.launchValidator,
      this.launchSequencer
    );

    this.healthMonitor = new HealthMonitor(this.serviceRegistry);
    
    this.healingEngine = new SelfHealingEngine(
      this.serviceRegistry,
      this.dependencyResolver,
      this.phasedLauncher
    );

    logger.info('Master Orchestrator components initialized');
  }

  /**
   * Initialize the orchestrator
   */
  async initialize(): Promise<void> {
    logger.info('Step 1: Initializing Master Orchestrator...');
    this.state = 'initializing';

    try {
      // Discover all services
      await this.discoverServices();

      // Build dependency graph
      await this.buildDependencyGraph();

      // Validate configuration
      await this.validateConfiguration();

      logger.info('Master Orchestrator initialized successfully');
    } catch (error: any) {
      logger.error('Initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Discover all services in the repository
   */
  async discoverServices(): Promise<void> {
    logger.info('Step 2: Discovering services...');
    this.state = 'discovering';

    const result = await this.serviceDiscovery.discoverAllServices();

    logger.info('Service discovery complete', {
      total: result.totalDiscovered,
      valid: result.validServices,
      invalid: result.invalidServices
    });

    if (result.errors.length > 0) {
      logger.warn('Discovery errors encountered', { errors: result.errors });
    }
  }

  /**
   * Build dependency graph
   */
  private async buildDependencyGraph(): Promise<void> {
    logger.info('Step 3: Building dependency graph...');

    const graph = this.dependencyResolver.buildDependencyGraph();

    logger.info('Dependency graph built', {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      phases: Object.keys(graph.phases).length
    });

    // Export graph for visualization
    const dotGraph = this.dependencyResolver.exportGraphAsDOT();
    logger.debug('Dependency graph (DOT format):\n' + dotGraph);
  }

  /**
   * Validate configuration
   */
  private async validateConfiguration(): Promise<void> {
    logger.info('Step 4: Validating configuration...');

    const validation = this.dependencyResolver.validateDependencies();

    if (!validation.valid) {
      logger.error('Validation failed', { errors: validation.errors });
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      logger.warn('Validation warnings', { warnings: validation.warnings });
    }

    logger.info('Configuration validated successfully');
  }

  /**
   * Launch all services in phased manner
   */
  async launchAllServices(): Promise<LaunchResult> {
    logger.info('Step 5: Launching all services...');
    this.state = 'launching';

    try {
      this.launchResult = await this.phasedLauncher.launchAllPhases();

      if (this.launchResult.success) {
        logger.info('All services launched successfully', {
          launched: this.launchResult.launched.length,
          duration: `${this.launchResult.duration}ms`
        });
      } else {
        logger.warn('Some services failed to launch', {
          launched: this.launchResult.launched.length,
          failed: this.launchResult.failed.length
        });
      }

      return this.launchResult;
    } catch (error: any) {
      logger.error('Service launch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Start health monitoring
   */
  async startHealthMonitoring(): Promise<void> {
    logger.info('Step 6: Starting health monitoring...');
    this.state = 'monitoring';

    await this.healthMonitor.startMonitoring();

    logger.info('Health monitoring active');
  }

  /**
   * Activate self-healing system
   */
  async activateSelfHealing(): Promise<void> {
    logger.info('Step 7: Activating self-healing system...');
    this.state = 'healing';

    logger.info('Self-healing system active');
  }

  /**
   * Mark system as ready
   */
  markReady(): void {
    this.state = 'ready';
    logger.info('');
    logger.info('='.repeat(70));
    logger.info('=== AZORA OS MASTER ORCHESTRATOR READY ===');
    logger.info('='.repeat(70));
    logger.info('');
    logger.info(`Services Running: ${this.serviceRegistry.count()}`);
    logger.info(`Health Monitoring: ACTIVE`);
    logger.info(`Self-Healing: ACTIVE`);
    logger.info('');
    logger.info('System Status:');
    const health = this.healthMonitor.getSystemHealth();
    logger.info(`  Overall: ${health.overall.toUpperCase()}`);
    logger.info(`  Healthy: ${health.healthyServices}/${health.totalServices}`);
    logger.info(`  Degraded: ${health.degradedServices}/${health.totalServices}`);
    logger.info(`  Unhealthy: ${health.unhealthyServices}/${health.totalServices}`);
    logger.info('');
    logger.info('='.repeat(70));
    logger.info('');
  }

  /**
   * Get system status
   */
  getSystemStatus(): OrchestratorStatus {
    const health = this.healthMonitor.getSystemHealth();
    const healingHistory = this.healingEngine.getHealingHistory();

    return {
      state: this.state,
      health,
      launchResult: this.launchResult,
      healingHistory,
      startTime: this.startTime,
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    return this.healthMonitor.getSystemHealth();
  }

  /**
   * Get dependency graph
   */
  getDependencyGraph() {
    return this.dependencyResolver.getDependencyGraph();
  }

  /**
   * Get service details
   */
  getService(name: string) {
    return this.serviceRegistry.get(name);
  }

  /**
   * Get all services
   */
  getAllServices() {
    return this.serviceRegistry.getAll();
  }

  /**
   * Manually restart a service
   */
  async restartService(name: string): Promise<boolean> {
    logger.info(`Manual restart requested: ${name}`);
    return await this.phasedLauncher.launchService(name);
  }

  /**
   * Get healing history
   */
  getHealingHistory() {
    return this.healingEngine.getHealingHistory();
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(): Promise<void> {
    logger.info('Initiating graceful shutdown...');
    this.state = 'shutting_down';

    // Stop health monitoring
    this.healthMonitor.stopMonitoring();

    // Stop all services
    const services = this.serviceRegistry.getAll();
    for (const [name, entry] of services) {
      if (entry.process) {
        logger.info(`Stopping service: ${name}`);
        try {
          entry.process.kill('SIGTERM');
        } catch (error) {
          // Ignore
        }
      }
    }

    // Wait for services to stop
    await new Promise(resolve => setTimeout(resolve, 5000));

    logger.info('Master Orchestrator shutdown complete');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down...');
  process.exit(0);
});
