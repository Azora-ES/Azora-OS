/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Health Checker - Performs health checks on services
 */

import axios from 'axios';
import { HealthCheckResult, ServiceStatus, DependencyStatus } from '../types/service.types';
import { HEALTH_CHECK_ENDPOINTS } from '../orchestrator-config';
import { createServiceLogger } from '../logging/orchestrator-logger';

const checkerLogger = createServiceLogger('HealthChecker');

export class HealthChecker {
  /**
   * Check health of a service
   */
  async checkServiceHealth(
    serviceName: string,
    port: number,
    dependencies: string[],
    dependencyPorts: Map<string, number>
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Try health endpoints in order
      for (const endpoint of HEALTH_CHECK_ENDPOINTS.alternatives) {
        try {
          const response = await axios.get(`http://localhost:${port}${endpoint}`, {
            timeout: 5000,
            validateStatus: (status) => status < 500
          });

          const responseTime = Date.now() - startTime;

          // Parse response
          const data = response.data || {};
          const status = this.parseHealthStatus(response.status, data);
          
          // Check dependencies
          const dependencyStatuses = await this.checkDependencies(
            dependencies,
            dependencyPorts
          );

          return {
            service: serviceName,
            timestamp: new Date(),
            status,
            responseTime,
            uptime: data.uptime || 0,
            memory: this.parseMemoryStats(data),
            cpu: data.cpu || 0,
            dependencies: dependencyStatuses,
            errorMessage: data.error
          };
        } catch (error: any) {
          // Try next endpoint
          continue;
        }
      }

      // All endpoints failed
      throw new Error('All health endpoints failed');
    } catch (error: any) {
      return {
        service: serviceName,
        timestamp: new Date(),
        status: 'timeout',
        responseTime: Date.now() - startTime,
        uptime: 0,
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: 0,
        dependencies: {},
        errorMessage: error.message
      };
    }
  }

  /**
   * Parse health status from response
   */
  private parseHealthStatus(statusCode: number, data: any): ServiceStatus {
    if (statusCode === 200 || statusCode === 204) {
      if (data.status === 'degraded') return 'degraded';
      return 'healthy';
    }

    if (statusCode === 503) return 'unhealthy';
    if (statusCode === 429) return 'degraded';

    return 'unhealthy';
  }

  /**
   * Parse memory statistics
   */
  private parseMemoryStats(data: any): { used: number; total: number; percentage: number } {
    if (data.memory) {
      return {
        used: data.memory.used || 0,
        total: data.memory.total || 0,
        percentage: data.memory.percentage || 0
      };
    }

    // Use process memory if available
    if (process.memoryUsage) {
      const mem = process.memoryUsage();
      const total = mem.heapTotal;
      const used = mem.heapUsed;
      return {
        used,
        total,
        percentage: (used / total) * 100
      };
    }

    return { used: 0, total: 0, percentage: 0 };
  }

  /**
   * Check dependencies health
   */
  private async checkDependencies(
    dependencies: string[],
    dependencyPorts: Map<string, number>
  ): Promise<{ [service: string]: DependencyStatus }> {
    const statuses: { [service: string]: DependencyStatus } = {};

    for (const dep of dependencies) {
      const port = dependencyPorts.get(dep);
      if (!port) {
        statuses[dep] = 'unknown';
        continue;
      }

      try {
        await axios.get(`http://localhost:${port}/health`, { timeout: 2000 });
        statuses[dep] = 'connected';
      } catch {
        statuses[dep] = 'disconnected';
      }
    }

    return statuses;
  }

  /**
   * Perform quick ping check
   */
  async pingService(port: number): Promise<boolean> {
    try {
      await axios.get(`http://localhost:${port}/health`, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
}
