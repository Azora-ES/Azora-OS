/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Dependency Resolver - Resolves service dependencies and launch order
 */

import { ServiceRegistry } from './service-registry';
import { DependencyGraph, ValidationResult } from '../types/service.types';
import { DependencyGraphBuilder } from '../utils/dependency-graph';
import { logger, createServiceLogger } from '../logging/orchestrator-logger';

const resolverLogger = createServiceLogger('DependencyResolver');

export class DependencyResolver {
  private registry: ServiceRegistry;
  private graphBuilder: DependencyGraphBuilder;
  private dependencyGraph: DependencyGraph | null = null;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
    this.graphBuilder = new DependencyGraphBuilder();
  }

  /**
   * Build dependency graph from registered services
   */
  buildDependencyGraph(): DependencyGraph {
    resolverLogger.info('Building dependency graph...');

    const services = this.registry.getAll();
    const serviceMetadata = new Map(
      Array.from(services.entries()).map(([name, entry]) => [name, entry.metadata])
    );

    this.dependencyGraph = this.graphBuilder.buildGraph(serviceMetadata);

    resolverLogger.info('Dependency graph built', {
      nodes: this.dependencyGraph.nodes.length,
      edges: this.dependencyGraph.edges.length,
      phases: Object.keys(this.dependencyGraph.phases).length
    });

    return this.dependencyGraph;
  }

  /**
   * Validate dependency graph
   */
  validateDependencies(): ValidationResult {
    resolverLogger.info('Validating dependencies...');

    if (!this.dependencyGraph) {
      return {
        valid: false,
        errors: ['Dependency graph not built'],
        warnings: []
      };
    }

    const graphValidation = this.graphBuilder.validate();
    const warnings: string[] = [];

    // Check for missing services
    const services = this.registry.getAll();
    for (const [name, entry] of services) {
      for (const dep of entry.metadata.dependencies) {
        if (!services.has(dep)) {
          warnings.push(`Service ${name} depends on ${dep}, which is not registered`);
        }
      }
    }

    // Check for isolated services (no dependencies and no dependents)
    for (const node of this.dependencyGraph.nodes) {
      const deps = this.graphBuilder.getAllDependencies(node);
      const dependents = this.graphBuilder.getAllDependents(node);
      
      if (deps.size === 0 && dependents.size === 0) {
        warnings.push(`Service ${node} is isolated (no dependencies or dependents)`);
      }
    }

    const result: ValidationResult = {
      valid: graphValidation.valid,
      errors: graphValidation.errors,
      warnings
    };

    if (result.valid) {
      resolverLogger.info('Dependencies validated successfully', {
        warnings: result.warnings.length
      });
    } else {
      resolverLogger.error('Dependency validation failed', {
        errors: result.errors.length,
        warnings: result.warnings.length
      });
    }

    return result;
  }

  /**
   * Get launch order for all services
   */
  getLaunchOrder(): string[][] {
    if (!this.dependencyGraph) {
      throw new Error('Dependency graph not built');
    }

    const phases = this.dependencyGraph.phases;
    const launchOrder: string[][] = [];

    for (let i = 0; i < Object.keys(phases).length; i++) {
      if (phases[i]) {
        launchOrder.push(phases[i]);
      }
    }

    resolverLogger.info('Launch order calculated', {
      phases: launchOrder.length,
      totalServices: launchOrder.reduce((sum, phase) => sum + phase.length, 0)
    });

    return launchOrder;
  }

  /**
   * Get dependencies for a service (direct)
   */
  getServiceDependencies(serviceName: string): string[] {
    const entry = this.registry.get(serviceName);
    return entry?.metadata.dependencies || [];
  }

  /**
   * Get all dependencies for a service (transitive)
   */
  getAllServiceDependencies(serviceName: string): Set<string> {
    return this.graphBuilder.getAllDependencies(serviceName);
  }

  /**
   * Get all dependents for a service (transitive)
   */
  getAllServiceDependents(serviceName: string): Set<string> {
    return this.graphBuilder.getAllDependents(serviceName);
  }

  /**
   * Check if service A depends on service B
   */
  dependsOn(serviceA: string, serviceB: string): boolean {
    const deps = this.getAllServiceDependencies(serviceA);
    return deps.has(serviceB);
  }

  /**
   * Get dependency graph
   */
  getDependencyGraph(): DependencyGraph | null {
    return this.dependencyGraph;
  }

  /**
   * Export dependency graph as DOT format for visualization
   */
  exportGraphAsDOT(): string {
    if (!this.dependencyGraph) {
      return '';
    }

    let dot = 'digraph ServiceDependencies {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';

    // Add nodes with phases as colors
    const phaseColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];
    for (const [phase, services] of Object.entries(this.dependencyGraph.phases)) {
      const color = phaseColors[parseInt(phase) % phaseColors.length];
      for (const service of services) {
        dot += `  "${service}" [fillcolor="${color}", style=filled];\n`;
      }
    }

    dot += '\n';

    // Add edges
    for (const edge of this.dependencyGraph.edges) {
      const style = edge.required ? 'solid' : 'dashed';
      dot += `  "${edge.from}" -> "${edge.to}" [style=${style}];\n`;
    }

    dot += '}\n';

    return dot;
  }
}
