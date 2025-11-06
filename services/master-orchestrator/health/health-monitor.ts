/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Health Monitor - Continuous health monitoring system
 */

import { ServiceRegistry } from '../discovery/service-registry';
import { HealthChecker } from './health-checker';
import { HealthReporter } from './health-reporter';
import { ORCHESTRATOR_CONFIG } from '../orchestrator-config';
import { logger, createServiceLogger } from '../logging/orchestrator-logger';
import { orchestratorEvents } from '../logging/event-emitter';

const monitorLogger = createServiceLogger('HealthMonitor');

export class HealthMonitor {
  private registry: ServiceRegistry;
  private checker: HealthChecker;
  private reporter: HealthReporter;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
    this.checker = new HealthChecker();
    this.reporter = new HealthReporter(registry);
  }

  /**
   * Start continuous health monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      monitorLogger.warn('Health monitoring already running');
      return;
    }

    monitorLogger.info('Starting health monitoring...', {
      interval: `${ORCHESTRATOR_CONFIG.healthCheckInterval}ms`
    });

    this.isMonitoring = true;

    // Start monitoring loop
    this.monitoringInterval = setInterval(
      () => this.pollAllServices(),
      ORCHESTRATOR_CONFIG.healthCheckInterval
    );

    // Perform immediate check
    await this.pollAllServices();
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    monitorLogger.info('Health monitoring stopped');
  }

  /**
   * Poll all services
   */
  private async pollAllServices(): Promise<void> {
    const services = this.registry.getAll();
    const healthyServices = Array.from(services.values()).filter(
      entry => entry.status === 'healthy' || entry.status === 'starting'
    );

    monitorLogger.debug('Polling services', { count: healthyServices.length });

    // Check all services in parallel
    const checks = healthyServices.map(entry =>
      this.checkServiceHealth(entry.metadata.name)
    );

    await Promise.allSettled(checks);

    // Log health summary
    const summary = this.reporter.getHealthSummary();
    monitorLogger.debug('Health check complete', summary);
  }

  /**
   * Check health of a single service
   */
  async checkServiceHealth(serviceName: string): Promise<void> {
    const entry = this.registry.get(serviceName);
    if (!entry) return;

    try {
      // Build dependency port map
      const dependencyPorts = new Map<string, number>();
      for (const dep of entry.metadata.dependencies) {
        const depEntry = this.registry.get(dep);
        if (depEntry) {
          dependencyPorts.set(dep, depEntry.metadata.port);
        }
      }

      // Perform health check
      const result = await this.checker.checkServiceHealth(
        serviceName,
        entry.metadata.port,
        entry.metadata.dependencies,
        dependencyPorts
      );

      // Update registry
      this.registry.addHealthCheck(serviceName, result);
      
      // Update status if changed
      if (result.status !== entry.status) {
        this.registry.updateStatus(serviceName, result.status);
        monitorLogger.info(`Service status changed: ${serviceName}`, {
          from: entry.status,
          to: result.status
        });

        // Emit health check event
        orchestratorEvents.emitHealthCheck(serviceName, result);

        // Trigger healing if unhealthy
        if (result.status === 'unhealthy' || result.status === 'timeout') {
          orchestratorEvents.emitServiceFailure(serviceName, {
            message: result.errorMessage || 'Health check failed'
          });
        }
      }
    } catch (error: any) {
      monitorLogger.error(`Health check error: ${serviceName}`, {
        error: error.message
      });
    }
  }

  /**
   * Get system health
   */
  getSystemHealth() {
    return this.reporter.getSystemHealth();
  }

  /**
   * Generate health report
   */
  generateHealthReport(): string {
    return this.reporter.generateHealthReport();
  }

  /**
   * Check if monitoring is active
   */
  isActive(): boolean {
    return this.isMonitoring;
  }
}
