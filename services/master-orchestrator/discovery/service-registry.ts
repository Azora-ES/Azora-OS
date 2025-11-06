/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Service Registry - Central repository for all service metadata and state
 */

import { ServiceRegistryEntry, ServiceMetadata, ServiceStatus } from '../types/service.types';
import { logger } from '../logging/orchestrator-logger';

export class ServiceRegistry {
  private services: Map<string, ServiceRegistryEntry> = new Map();
  private servicesByPhase: Map<number, Set<string>> = new Map();
  private servicesByPriority: Map<string, Set<string>> = new Map();

  /**
   * Register a new service
   */
  register(metadata: ServiceMetadata): void {
    const entry: ServiceRegistryEntry = {
      metadata,
      status: 'stopped',
      process: null,
      healthHistory: [],
      restartAttempts: 0,
      uptime: 0,
      metrics: {
        requestCount: 0,
        errorCount: 0,
        avgResponseTime: 0,
        uptimePercentage: 0
      }
    };

    this.services.set(metadata.name, entry);

    // Index by phase
    const phaseSet = this.servicesByPhase.get(metadata.launchPhase) || new Set();
    phaseSet.add(metadata.name);
    this.servicesByPhase.set(metadata.launchPhase, phaseSet);

    // Index by priority
    const prioritySet = this.servicesByPriority.get(metadata.priority) || new Set();
    prioritySet.add(metadata.name);
    this.servicesByPriority.set(metadata.priority, prioritySet);

    logger.info(`Service registered: ${metadata.name}`, {
      phase: metadata.launchPhase,
      priority: metadata.priority
    });
  }

  /**
   * Get service by name
   */
  get(name: string): ServiceRegistryEntry | undefined {
    return this.services.get(name);
  }

  /**
   * Get all services
   */
  getAll(): Map<string, ServiceRegistryEntry> {
    return new Map(this.services);
  }

  /**
   * Get services by phase
   */
  getByPhase(phase: number): ServiceRegistryEntry[] {
    const names = this.servicesByPhase.get(phase) || new Set();
    return Array.from(names)
      .map(name => this.services.get(name))
      .filter((entry): entry is ServiceRegistryEntry => entry !== undefined);
  }

  /**
   * Get services by priority
   */
  getByPriority(priority: string): ServiceRegistryEntry[] {
    const names = this.servicesByPriority.get(priority) || new Set();
    return Array.from(names)
      .map(name => this.services.get(name))
      .filter((entry): entry is ServiceRegistryEntry => entry !== undefined);
  }

  /**
   * Get services by status
   */
  getByStatus(status: ServiceStatus): ServiceRegistryEntry[] {
    return Array.from(this.services.values()).filter(
      entry => entry.status === status
    );
  }

  /**
   * Update service status
   */
  updateStatus(name: string, status: ServiceStatus): void {
    const entry = this.services.get(name);
    if (entry) {
      entry.status = status;
      logger.debug(`Service status updated: ${name} -> ${status}`);
    }
  }

  /**
   * Update service process
   */
  updateProcess(name: string, process: any, pid?: number): void {
    const entry = this.services.get(name);
    if (entry) {
      entry.process = process;
      entry.pid = pid;
      entry.startTime = new Date();
      logger.debug(`Service process updated: ${name} (PID: ${pid})`);
    }
  }

  /**
   * Increment restart attempts
   */
  incrementRestartAttempts(name: string): number {
    const entry = this.services.get(name);
    if (entry) {
      entry.restartAttempts++;
      entry.lastRestartTime = new Date();
      return entry.restartAttempts;
    }
    return 0;
  }

  /**
   * Reset restart attempts
   */
  resetRestartAttempts(name: string): void {
    const entry = this.services.get(name);
    if (entry) {
      entry.restartAttempts = 0;
      logger.debug(`Restart attempts reset: ${name}`);
    }
  }

  /**
   * Add health check result
   */
  addHealthCheck(name: string, result: any): void {
    const entry = this.services.get(name);
    if (entry) {
      entry.healthHistory.push(result);
      entry.lastHealthCheck = new Date();
      
      // Keep only last 100 health checks
      if (entry.healthHistory.length > 100) {
        entry.healthHistory.shift();
      }

      // Update uptime
      if (entry.startTime) {
        entry.uptime = Date.now() - entry.startTime.getTime();
      }

      // Calculate uptime percentage
      const healthyChecks = entry.healthHistory.filter(
        h => h.status === 'healthy'
      ).length;
      entry.metrics.uptimePercentage = 
        (healthyChecks / entry.healthHistory.length) * 100;
    }
  }

  /**
   * Update service metrics
   */
  updateMetrics(name: string, metrics: Partial<ServiceRegistryEntry['metrics']>): void {
    const entry = this.services.get(name);
    if (entry) {
      entry.metrics = { ...entry.metrics, ...metrics };
    }
  }

  /**
   * Get service count
   */
  count(): number {
    return this.services.size;
  }

  /**
   * Get phase count
   */
  getPhaseCount(): number {
    return this.servicesByPhase.size;
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.servicesByPhase.clear();
    this.servicesByPriority.clear();
    logger.info('Service registry cleared');
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const statusCounts: { [key in ServiceStatus]?: number } = {};
    
    for (const entry of this.services.values()) {
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    }

    return {
      totalServices: this.services.size,
      statusCounts,
      phases: this.servicesByPhase.size,
      priorities: this.servicesByPriority.size
    };
  }
}
