/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Launch Sequencer - Determines optimal launch sequence
 */

import { ServiceRegistry } from '../discovery/service-registry';
import { DependencyResolver } from '../discovery/dependency-resolver';
import { ORCHESTRATOR_CONFIG } from '../orchestrator-config';
import { createServiceLogger } from '../logging/orchestrator-logger';

const sequencerLogger = createServiceLogger('LaunchSequencer');

export class LaunchSequencer {
  private registry: ServiceRegistry;
  private dependencyResolver: DependencyResolver;

  constructor(registry: ServiceRegistry, dependencyResolver: DependencyResolver) {
    this.registry = registry;
    this.dependencyResolver = dependencyResolver;
  }

  /**
   * Calculate optimal launch sequence
   */
  calculateLaunchSequence(): string[][] {
    sequencerLogger.info('Calculating launch sequence...');

    const sequence = this.dependencyResolver.getLaunchOrder();

    sequencerLogger.info('Launch sequence calculated', {
      totalPhases: sequence.length,
      totalServices: sequence.reduce((sum, phase) => sum + phase.length, 0)
    });

    return sequence;
  }

  /**
   * Get services to launch in parallel within a phase
   */
  getParallelLaunchBatch(services: string[]): string[][] {
    const batches: string[][] = [];
    const limit = ORCHESTRATOR_CONFIG.parallelLaunchLimit;

    for (let i = 0; i < services.length; i += limit) {
      batches.push(services.slice(i, i + limit));
    }

    return batches;
  }

  /**
   * Sort services by priority within a phase
   */
  sortByPriority(services: string[]): string[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return services.sort((a, b) => {
      const entryA = this.registry.get(a);
      const entryB = this.registry.get(b);

      if (!entryA || !entryB) return 0;

      const priorityA = priorityOrder[entryA.metadata.priority];
      const priorityB = priorityOrder[entryB.metadata.priority];

      return priorityA - priorityB;
    });
  }
}
