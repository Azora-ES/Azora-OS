/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Self-Healing Tests
 */

import { SelfHealingEngine } from '../healing/self-healing';
import { ServiceRegistry } from '../discovery/service-registry';
import { DependencyResolver } from '../discovery/dependency-resolver';
import { PhasedLauncher } from '../launching/phased-launcher';
import { LaunchValidator } from '../launching/launch-validator';
import { LaunchSequencer } from '../launching/launch-sequencer';

describe('SelfHealingEngine', () => {
  let registry: ServiceRegistry;
  let dependencyResolver: DependencyResolver;
  let launcher: PhasedLauncher;
  let healingEngine: SelfHealingEngine;

  beforeEach(() => {
    registry = new ServiceRegistry();
    dependencyResolver = new DependencyResolver(registry);
    const validator = new LaunchValidator(registry, dependencyResolver);
    const sequencer = new LaunchSequencer(registry, dependencyResolver);
    launcher = new PhasedLauncher(registry, dependencyResolver, validator, sequencer);
    healingEngine = new SelfHealingEngine(registry, dependencyResolver, launcher);
  });

  it('should create healing engine', () => {
    expect(healingEngine).toBeDefined();
  });

  it('should track healing history', () => {
    const history = healingEngine.getHealingHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('should provide healing statistics', () => {
    const stats = healingEngine.getHealingStats();
    expect(stats).toHaveProperty('totalEvents');
    expect(stats).toHaveProperty('byAction');
    expect(stats).toHaveProperty('byService');
  });
});
