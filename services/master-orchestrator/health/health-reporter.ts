/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Health Reporter - Reports health status and metrics
 */

import { ServiceRegistry } from '../discovery/service-registry';
import { HealthStatus } from '../types/orchestrator.types';
import { createServiceLogger } from '../logging/orchestrator-logger';

const reporterLogger = createServiceLogger('HealthReporter');

export class HealthReporter {
  private registry: ServiceRegistry;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
  }

  /**
   * Get overall system health status
   */
  getSystemHealth(): HealthStatus {
    const services = this.registry.getAll();
    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    let quarantinedCount = 0;

    for (const [_, entry] of services) {
      switch (entry.status) {
        case 'healthy':
          healthyCount++;
          break;
        case 'degraded':
          degradedCount++;
          break;
        case 'unhealthy':
        case 'timeout':
          unhealthyCount++;
          break;
        case 'quarantined':
          quarantinedCount++;
          break;
      }
    }

    const totalServices = services.size;
    const overall = this.determineOverallStatus(
      healthyCount,
      degradedCount,
      unhealthyCount,
      totalServices
    );

    const systemUptime = this.calculateSystemUptime();

    return {
      overall,
      totalServices,
      healthyServices: healthyCount,
      degradedServices: degradedCount,
      unhealthyServices: unhealthyCount,
      quarantinedServices: quarantinedCount,
      services: Object.fromEntries(services),
      timestamp: new Date(),
      systemUptime
    };
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(
    healthy: number,
    degraded: number,
    unhealthy: number,
    total: number
  ): 'healthy' | 'degraded' | 'critical' {
    const healthyPercentage = (healthy / total) * 100;

    if (unhealthy > 0) return 'critical';
    if (degraded > 0 || healthyPercentage < 95) return 'degraded';
    return 'healthy';
  }

  /**
   * Calculate system uptime
   */
  private calculateSystemUptime(): number {
    // Return uptime in milliseconds
    return process.uptime() * 1000;
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    status: string;
    healthy: number;
    degraded: number;
    unhealthy: number;
    total: number;
  } {
    const health = this.getSystemHealth();
    
    return {
      status: health.overall,
      healthy: health.healthyServices,
      degraded: health.degradedServices,
      unhealthy: health.unhealthyServices,
      total: health.totalServices
    };
  }

  /**
   * Generate health report
   */
  generateHealthReport(): string {
    const health = this.getSystemHealth();
    
    let report = '=== AZORA OS HEALTH REPORT ===\n\n';
    report += `Overall Status: ${health.overall.toUpperCase()}\n`;
    report += `Timestamp: ${health.timestamp.toISOString()}\n`;
    report += `System Uptime: ${this.formatUptime(health.systemUptime)}\n\n`;
    
    report += 'Service Status:\n';
    report += `  Healthy: ${health.healthyServices}/${health.totalServices}\n`;
    report += `  Degraded: ${health.degradedServices}/${health.totalServices}\n`;
    report += `  Unhealthy: ${health.unhealthyServices}/${health.totalServices}\n`;
    report += `  Quarantined: ${health.quarantinedServices}/${health.totalServices}\n\n`;

    // List unhealthy services
    if (health.unhealthyServices > 0) {
      report += 'Unhealthy Services:\n';
      for (const [name, entry] of Object.entries(health.services)) {
        if (entry.status === 'unhealthy' || entry.status === 'timeout') {
          report += `  - ${name}: ${entry.status}\n`;
        }
      }
    }

    return report;
  }

  /**
   * Format uptime in human-readable format
   */
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}
