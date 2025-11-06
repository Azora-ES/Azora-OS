/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Service Discovery Engine - Auto-discover services in the repository
 */

import fs from 'fs/promises';
import path from 'path';
import { ServiceMetadata, ServicePriority } from '../types/service.types';
import { ServiceDiscoveryResult } from '../types/orchestrator.types';
import { ServiceRegistry } from './service-registry';
import { ORCHESTRATOR_CONFIG, SERVICE_PRIORITIES, LAUNCH_PHASES } from '../orchestrator-config';
import { logger, createServiceLogger } from '../logging/orchestrator-logger';

const discoveryLogger = createServiceLogger('ServiceDiscovery');

export class ServiceDiscovery {
  private registry: ServiceRegistry;
  private servicesPath: string;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
    this.servicesPath = ORCHESTRATOR_CONFIG.servicesPath;
  }

  /**
   * Discover all services in the services directory
   */
  async discoverAllServices(): Promise<ServiceDiscoveryResult> {
    discoveryLogger.info('Starting service discovery...', { path: this.servicesPath });

    const errors: string[] = [];
    let totalDiscovered = 0;
    let validServices = 0;

    try {
      const serviceDirs = await this.scanServicesDirectory();
      totalDiscovered = serviceDirs.length;

      discoveryLogger.info(`Found ${totalDiscovered} potential services`);

      for (const serviceDir of serviceDirs) {
        try {
          const metadata = await this.discoverService(serviceDir);
          if (metadata) {
            this.registry.register(metadata);
            validServices++;
          }
        } catch (error: any) {
          errors.push(`Error discovering ${serviceDir}: ${error.message}`);
          discoveryLogger.warn(`Failed to discover service: ${serviceDir}`, { error: error.message });
        }
      }

      discoveryLogger.info(`Discovery complete: ${validServices}/${totalDiscovered} services registered`);

      return {
        services: this.registry.getAll(),
        totalDiscovered,
        validServices,
        invalidServices: totalDiscovered - validServices,
        errors
      };
    } catch (error: any) {
      discoveryLogger.error('Service discovery failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Scan services directory for service folders
   */
  private async scanServicesDirectory(): Promise<string[]> {
    const serviceDirs: string[] = [];

    try {
      const entries = await fs.readdir(this.servicesPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          serviceDirs.push(entry.name);
        }
      }
    } catch (error: any) {
      discoveryLogger.error('Failed to scan services directory', { error: error.message });
      throw error;
    }

    return serviceDirs;
  }

  /**
   * Discover a single service
   */
  private async discoverService(serviceName: string): Promise<ServiceMetadata | null> {
    const servicePath = path.join(this.servicesPath, serviceName);

    try {
      // Check for package.json
      const packageJsonPath = path.join(servicePath, 'package.json');
      let packageJson: any = null;

      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
        packageJson = JSON.parse(packageContent);
      } catch {
        // No package.json, skip this service
        return null;
      }

      // Find entry point
      const entryPoint = await this.findEntryPoint(servicePath);
      if (!entryPoint) {
        discoveryLogger.warn(`No entry point found for service: ${serviceName}`);
        return null;
      }

      // Determine service metadata
      const metadata: ServiceMetadata = {
        name: serviceName,
        port: this.extractPort(serviceName, packageJson),
        version: packageJson.version || '1.0.0',
        dependencies: this.extractDependencies(serviceName),
        priority: this.determinePriority(serviceName),
        healthCheckInterval: ORCHESTRATOR_CONFIG.healthCheckInterval,
        maxRestartAttempts: ORCHESTRATOR_CONFIG.defaultMaxRestartAttempts,
        startupTimeoutMs: ORCHESTRATOR_CONFIG.defaultStartupTimeout,
        capabilities: this.extractCapabilities(serviceName, packageJson),
        launchPhase: this.determineLaunchPhase(serviceName),
        path: servicePath,
        entryPoint,
        type: this.determineExecutionType(entryPoint),
        description: packageJson.description || '',
        tags: this.extractTags(serviceName)
      };

      return metadata;
    } catch (error: any) {
      discoveryLogger.error(`Error discovering service ${serviceName}`, { error: error.message });
      return null;
    }
  }

  /**
   * Find entry point file for a service
   */
  private async findEntryPoint(servicePath: string): Promise<string | null> {
    const possibleEntryPoints = [
      'index.ts',
      'server.ts',
      'main.ts',
      'app.ts',
      'service.ts',
      'index.js',
      'server.js',
      'main.js',
      'src/index.ts',
      'src/server.ts',
      'src/main.ts'
    ];

    for (const entry of possibleEntryPoints) {
      const entryPath = path.join(servicePath, entry);
      try {
        await fs.access(entryPath);
        return entry;
      } catch {
        // File doesn't exist, try next
      }
    }

    return null;
  }

  /**
   * Extract port from service name or config
   */
  private extractPort(serviceName: string, packageJson: any): number {
    // Check package.json for port
    if (packageJson.config?.port) {
      return packageJson.config.port;
    }

    // Use deterministic port based on service name hash
    const hash = Array.from(serviceName).reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return 3000 + (hash % 7000);
  }

  /**
   * Extract dependencies from service name and known patterns
   */
  private extractDependencies(serviceName: string): string[] {
    const dependencies: string[] = [];

    // Common dependencies
    if (serviceName !== 'azora-aegis') {
      dependencies.push('azora-aegis'); // Most services depend on auth
    }

    if (serviceName !== 'azora-database' && !serviceName.includes('gateway')) {
      dependencies.push('azora-database'); // Most services need database
    }

    // API Gateway depends on services
    if (serviceName === 'api-gateway') {
      dependencies.push('auth-service', 'user-management');
    }

    // Payment services depend on core
    if (serviceName.includes('payment') || serviceName.includes('mint')) {
      dependencies.push('azora-core');
    }

    return dependencies;
  }

  /**
   * Determine service priority
   */
  private determinePriority(serviceName: string): ServicePriority {
    for (const [priority, services] of Object.entries(SERVICE_PRIORITIES)) {
      if (services.includes(serviceName)) {
        return priority as ServicePriority;
      }
    }

    // Default priority based on naming
    if (serviceName.includes('core') || serviceName.includes('aegis')) return 'critical';
    if (serviceName.includes('api') || serviceName.includes('gateway')) return 'high';
    if (serviceName.includes('analytics') || serviceName.includes('logging')) return 'low';

    return 'medium';
  }

  /**
   * Determine launch phase
   */
  private determineLaunchPhase(serviceName: string): number {
    for (const [phase, config] of Object.entries(LAUNCH_PHASES)) {
      if (config.services.includes(serviceName)) {
        return parseInt(phase);
      }
    }

    // Default phase based on priority
    const priority = this.determinePriority(serviceName);
    switch (priority) {
      case 'critical': return 0;
      case 'high': return 1;
      case 'medium': return 3;
      case 'low': return 5;
      default: return 6;
    }
  }

  /**
   * Extract service capabilities
   */
  private extractCapabilities(serviceName: string, packageJson: any): string[] {
    const capabilities: string[] = [];

    if (serviceName.includes('ai')) capabilities.push('artificial-intelligence');
    if (serviceName.includes('gateway')) capabilities.push('routing', 'api-gateway');
    if (serviceName.includes('auth')) capabilities.push('authentication', 'authorization');
    if (serviceName.includes('payment')) capabilities.push('payments', 'transactions');
    if (serviceName.includes('analytics')) capabilities.push('analytics', 'reporting');
    if (serviceName.includes('database')) capabilities.push('data-storage', 'persistence');

    return capabilities;
  }

  /**
   * Determine execution type
   */
  private determineExecutionType(entryPoint: string): 'node' | 'tsx' | 'ts-node' {
    if (entryPoint.endsWith('.ts')) return 'tsx';
    if (entryPoint.endsWith('.js')) return 'node';
    return 'ts-node';
  }

  /**
   * Extract tags from service name
   */
  private extractTags(serviceName: string): string[] {
    const tags: string[] = [];

    if (serviceName.startsWith('azora-')) tags.push('core');
    if (serviceName.includes('ai')) tags.push('ai', 'ml');
    if (serviceName.includes('service')) tags.push('microservice');
    if (serviceName.includes('gateway')) tags.push('infrastructure');

    return tags;
  }
}
