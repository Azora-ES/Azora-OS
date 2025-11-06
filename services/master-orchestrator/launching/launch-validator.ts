/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Launch Validator - Validates service launch readiness
 */

import { ServiceRegistry } from '../discovery/service-registry';
import { DependencyResolver } from '../discovery/dependency-resolver';
import { ValidationResult } from '../types/service.types';
import { createServiceLogger } from '../logging/orchestrator-logger';

const validatorLogger = createServiceLogger('LaunchValidator');

export class LaunchValidator {
  private registry: ServiceRegistry;
  private dependencyResolver: DependencyResolver;

  constructor(registry: ServiceRegistry, dependencyResolver: DependencyResolver) {
    this.registry = registry;
    this.dependencyResolver = dependencyResolver;
  }

  /**
   * Validate if a service is ready to launch
   */
  validateServiceLaunch(serviceName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const entry = this.registry.get(serviceName);
    if (!entry) {
      errors.push(`Service ${serviceName} not found in registry`);
      return { valid: false, errors, warnings };
    }

    // Check if service is already running
    if (entry.status === 'healthy' || entry.status === 'starting') {
      warnings.push(`Service ${serviceName} is already ${entry.status}`);
    }

    // Check if service is quarantined
    if (entry.status === 'quarantined') {
      errors.push(`Service ${serviceName} is quarantined and cannot be launched`);
    }

    // Check dependencies
    const dependencies = this.dependencyResolver.getServiceDependencies(serviceName);
    for (const dep of dependencies) {
      const depEntry = this.registry.get(dep);
      if (!depEntry) {
        warnings.push(`Dependency ${dep} not found`);
      } else if (depEntry.status !== 'healthy') {
        errors.push(`Dependency ${dep} is not healthy (status: ${depEntry.status})`);
      }
    }

    // Check entry point exists
    if (!entry.metadata.entryPoint) {
      errors.push(`Service ${serviceName} has no entry point defined`);
    }

    const valid = errors.length === 0;
    return { valid, errors, warnings };
  }

  /**
   * Validate if all dependencies are ready
   */
  validateDependenciesReady(serviceName: string): boolean {
    const dependencies = this.dependencyResolver.getServiceDependencies(serviceName);
    
    for (const dep of dependencies) {
      const depEntry = this.registry.get(dep);
      if (!depEntry || depEntry.status !== 'healthy') {
        validatorLogger.debug(`Dependency not ready: ${dep}`, { 
          service: serviceName,
          status: depEntry?.status 
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Validate phase readiness
   */
  validatePhaseReady(phase: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const services = this.registry.getByPhase(phase);
    
    if (services.length === 0) {
      warnings.push(`Phase ${phase} has no services`);
    }

    // Check if previous phase is complete
    if (phase > 0) {
      const previousPhase = this.registry.getByPhase(phase - 1);
      const unhealthyServices = previousPhase.filter(s => s.status !== 'healthy');
      
      if (unhealthyServices.length > 0) {
        errors.push(
          `Previous phase (${phase - 1}) not complete. Unhealthy services: ${
            unhealthyServices.map(s => s.metadata.name).join(', ')
          }`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate launch success
   */
  async validateLaunchSuccess(serviceName: string, timeoutMs: number): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const entry = this.registry.get(serviceName);
      
      if (!entry) return false;
      
      if (entry.status === 'healthy') {
        validatorLogger.info(`Launch validated: ${serviceName}`);
        return true;
      }
      
      if (entry.status === 'unhealthy' || entry.status === 'stopped') {
        validatorLogger.error(`Launch failed: ${serviceName}`, { status: entry.status });
        return false;
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    validatorLogger.warn(`Launch validation timeout: ${serviceName}`);
    return false;
  }
}
