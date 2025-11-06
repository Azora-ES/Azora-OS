/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Self-Healing Engine - Automatic service recovery
 */

import { ServiceRegistry } from '../discovery/service-registry';
import { DependencyResolver } from '../discovery/dependency-resolver';
import { PhasedLauncher } from '../launching/phased-launcher';
import { CircuitBreaker } from './circuit-breaker';
import { HealingHistory } from './healing-history';
import { RestartProtocolHandler } from './restart-protocol';
import { HealingEvent, HealingAction, HealingState } from '../types/orchestrator.types';
import { logger, createServiceLogger } from '../logging/orchestrator-logger';
import { orchestratorEvents } from '../logging/event-emitter';

const healingLogger = createServiceLogger('SelfHealing');

export class SelfHealingEngine {
  private registry: ServiceRegistry;
  private dependencyResolver: DependencyResolver;
  private launcher: PhasedLauncher;
  private circuitBreaker: CircuitBreaker;
  private history: HealingHistory;
  private protocolHandler: RestartProtocolHandler;
  private healingInProgress: Set<string> = new Set();

  constructor(
    registry: ServiceRegistry,
    dependencyResolver: DependencyResolver,
    launcher: PhasedLauncher
  ) {
    this.registry = registry;
    this.dependencyResolver = dependencyResolver;
    this.launcher = launcher;
    this.circuitBreaker = new CircuitBreaker();
    this.history = new HealingHistory();
    this.protocolHandler = new RestartProtocolHandler();

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for failures
   */
  private setupEventListeners(): void {
    orchestratorEvents.on('monitoring', async (event) => {
      if (event.type === 'service_failure') {
        await this.handleServiceFailure(event.service!);
      }
    });
  }

  /**
   * Handle service failure
   */
  async handleServiceFailure(service: string): Promise<void> {
    if (this.healingInProgress.has(service)) {
      healingLogger.debug(`Healing already in progress for: ${service}`);
      return;
    }

    healingLogger.warn(`Service failure detected: ${service}`);
    this.healingInProgress.add(service);

    try {
      // Record failure in circuit breaker
      this.circuitBreaker.recordFailure(service);

      // Check if circuit breaker allows retry
      if (!this.circuitBreaker.isAllowed(service)) {
        healingLogger.warn(`Circuit breaker open for: ${service}`);
        this.recordEvent(service, HealingAction.CIRCUIT_OPEN, 'Circuit breaker threshold exceeded');
        return;
      }

      // Get restart attempt count
      const entry = this.registry.get(service);
      if (!entry) return;

      const attempt = this.registry.incrementRestartAttempts(service);

      // Create restart protocol
      const protocol = this.protocolHandler.createProtocol(
        service,
        attempt,
        'Service failure detected'
      );

      // Record healing event
      this.recordEvent(service, HealingAction.DETECT_FAILURE, protocol.reason, { attempt });

      // Execute restart based on strategy
      let success = false;

      switch (protocol.strategy) {
        case 'immediate':
          success = await this.attemptRestart(service, attempt);
          break;
        case 'graceful':
          success = await this.gracefulRestart(service);
          break;
        case 'dependency':
          success = await this.dependencyRestart(service);
          break;
        case 'quarantine':
          await this.quarantineService(service);
          return;
      }

      if (success) {
        this.circuitBreaker.recordSuccess(service);
        this.registry.resetRestartAttempts(service);
        this.recordEvent(service, HealingAction.RESTART_SUCCESS, 'Service restarted successfully');
      } else {
        this.recordEvent(service, HealingAction.RESTART_FAILURE, 'Restart attempt failed', { attempt });
        
        // Check if should quarantine
        if (this.protocolHandler.shouldQuarantine(attempt, entry.metadata.maxRestartAttempts)) {
          await this.quarantineService(service);
        }
      }
    } finally {
      this.healingInProgress.delete(service);
    }
  }

  /**
   * Attempt immediate restart
   */
  async attemptRestart(service: string, attempt: number): Promise<boolean> {
    healingLogger.info(`Attempting restart: ${service}`, { attempt });

    const entry = this.registry.get(service);
    if (!entry) return false;

    // Kill existing process
    if (entry.process) {
      try {
        entry.process.kill();
      } catch (error) {
        // Process may already be dead
      }
    }

    // Create restart protocol
    const protocol = this.protocolHandler.createProtocol(
      service,
      attempt,
      'Immediate restart'
    );

    this.recordEvent(service, HealingAction.ATTEMPT_RESTART, 'Executing immediate restart', { attempt });

    // Execute restart with backoff
    const success = await this.protocolHandler.executeWithBackoff(
      protocol,
      () => this.launcher.launchService(service)
    );

    return success;
  }

  /**
   * Graceful restart with dependency check
   */
  async gracefulRestart(service: string): Promise<boolean> {
    healingLogger.info(`Attempting graceful restart: ${service}`);

    const entry = this.registry.get(service);
    if (!entry) return false;

    // Check dependencies are healthy
    const dependencies = this.dependencyResolver.getServiceDependencies(service);
    for (const dep of dependencies) {
      const depEntry = this.registry.get(dep);
      if (!depEntry || depEntry.status !== 'healthy') {
        healingLogger.warn(`Dependency not healthy: ${dep}`, { service });
        return false;
      }
    }

    // Gracefully shutdown
    if (entry.process) {
      try {
        entry.process.kill('SIGTERM');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        // Force kill if needed
        entry.process.kill('SIGKILL');
      }
    }

    // Restart
    return await this.launcher.launchService(service);
  }

  /**
   * Restart with dependency chain
   */
  async dependencyRestart(service: string): Promise<boolean> {
    healingLogger.info(`Attempting dependency restart: ${service}`);

    this.recordEvent(service, HealingAction.DEPENDENCY_RESTART, 'Restarting with dependencies');

    // Get all dependencies
    const dependencies = this.dependencyResolver.getServiceDependencies(service);

    // Restart dependencies first
    for (const dep of dependencies) {
      const depEntry = this.registry.get(dep);
      if (depEntry && depEntry.status !== 'healthy') {
        healingLogger.info(`Restarting dependency: ${dep}`);
        await this.launcher.launchService(dep);
      }
    }

    // Wait for dependencies to stabilize
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Restart the service
    return await this.launcher.launchService(service);
  }

  /**
   * Quarantine a service
   */
  async quarantineService(service: string): Promise<void> {
    healingLogger.error(`Quarantining service: ${service}`);

    this.registry.updateStatus(service, 'quarantined');
    this.recordEvent(service, HealingAction.QUARANTINE, 'Max restart attempts exceeded');

    // Kill process
    const entry = this.registry.get(service);
    if (entry?.process) {
      try {
        entry.process.kill('SIGKILL');
      } catch (error) {
        // Ignore
      }
    }

    logger.error(`SERVICE QUARANTINED: ${service} requires manual intervention`);
  }

  /**
   * Record healing event
   */
  private recordEvent(
    service: string,
    action: HealingAction,
    reason: string,
    metadata: Record<string, any> = {}
  ): void {
    const event: HealingEvent = {
      timestamp: new Date(),
      service,
      action,
      reason,
      metadata
    };

    this.history.record(event);
    orchestratorEvents.emitHealingEvent(event);
  }

  /**
   * Get healing history
   */
  getHealingHistory(): HealingEvent[] {
    return this.history.getAll();
  }

  /**
   * Get healing statistics
   */
  getHealingStats() {
    return this.history.getStats();
  }

  /**
   * Get circuit breaker states
   */
  getCircuitBreakerStates() {
    return this.circuitBreaker.getAllStates();
  }

  /**
   * Reset service healing state
   */
  resetService(service: string): void {
    this.registry.resetRestartAttempts(service);
    this.circuitBreaker.reset(service);
    healingLogger.info(`Healing state reset for: ${service}`);
  }
}
