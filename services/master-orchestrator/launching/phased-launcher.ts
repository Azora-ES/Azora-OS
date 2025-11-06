/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Phased Launcher - Launches services in dependency-aware phases
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { ServiceRegistry } from '../discovery/service-registry';
import { DependencyResolver } from '../discovery/dependency-resolver';
import { LaunchValidator } from './launch-validator';
import { LaunchSequencer } from './launch-sequencer';
import { LaunchResult, PhaseResult } from '../types/service.types';
import { LAUNCH_PHASES } from '../orchestrator-config';
import { logger, createServiceLogger } from '../logging/orchestrator-logger';
import { orchestratorEvents } from '../logging/event-emitter';

const launcherLogger = createServiceLogger('PhasedLauncher');

export class PhasedLauncher {
  private registry: ServiceRegistry;
  private dependencyResolver: DependencyResolver;
  private validator: LaunchValidator;
  private sequencer: LaunchSequencer;

  constructor(
    registry: ServiceRegistry,
    dependencyResolver: DependencyResolver,
    validator: LaunchValidator,
    sequencer: LaunchSequencer
  ) {
    this.registry = registry;
    this.dependencyResolver = dependencyResolver;
    this.validator = validator;
    this.sequencer = sequencer;
  }

  /**
   * Launch all services in phases
   */
  async launchAllPhases(): Promise<LaunchResult> {
    launcherLogger.info('Starting phased launch...');

    const startTime = Date.now();
    const launched: string[] = [];
    const failed: string[] = [];
    const skipped: string[] = [];
    const phaseResults: PhaseResult[] = [];

    const sequence = this.sequencer.calculateLaunchSequence();

    for (let phaseNum = 0; phaseNum < sequence.length; phaseNum++) {
      const phaseConfig = LAUNCH_PHASES[phaseNum];
      const phaseServices = sequence[phaseNum];

      launcherLogger.info(`Launching Phase ${phaseNum}: ${phaseConfig?.name || 'Custom'}`, {
        services: phaseServices.length
      });

      const phaseResult = await this.launchPhase(phaseNum, phaseServices);
      phaseResults.push(phaseResult);

      launched.push(...phaseResult.launched);
      failed.push(...phaseResult.failed);

      // Stop if critical phase failed
      if (!phaseResult.success && phaseNum <= 1) {
        launcherLogger.error(`Critical phase ${phaseNum} failed. Stopping launch.`);
        break;
      }
    }

    const duration = Date.now() - startTime;
    const success = failed.length === 0;

    launcherLogger.info('Phased launch complete', {
      success,
      launched: launched.length,
      failed: failed.length,
      duration: `${duration}ms`
    });

    return {
      success,
      totalServices: launched.length + failed.length + skipped.length,
      launched,
      failed,
      skipped,
      duration,
      phaseResults
    };
  }

  /**
   * Launch a single phase
   */
  async launchPhase(phaseNum: number, services: string[]): Promise<PhaseResult> {
    const startTime = Date.now();
    const launched: string[] = [];
    const failed: string[] = [];

    const phaseConfig = LAUNCH_PHASES[phaseNum];
    const parallel = phaseConfig?.parallel ?? true;

    if (parallel) {
      // Launch services in parallel batches
      const batches = this.sequencer.getParallelLaunchBatch(services);
      
      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(service => this.launchService(service))
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            launched.push(batch[index]);
          } else {
            failed.push(batch[index]);
          }
        });
      }
    } else {
      // Launch services serially
      for (const service of services) {
        try {
          const success = await this.launchService(service);
          if (success) {
            launched.push(service);
          } else {
            failed.push(service);
          }
        } catch (error) {
          failed.push(service);
        }
      }
    }

    const duration = Date.now() - startTime;
    const success = failed.length === 0;

    return {
      phase: phaseNum,
      services,
      success,
      launched,
      failed,
      duration
    };
  }

  /**
   * Launch a single service
   */
  async launchService(serviceName: string): Promise<boolean> {
    const entry = this.registry.get(serviceName);
    if (!entry) {
      launcherLogger.error(`Service not found: ${serviceName}`);
      return false;
    }

    // Validate launch readiness
    const validation = this.validator.validateServiceLaunch(serviceName);
    if (!validation.valid) {
      launcherLogger.error(`Launch validation failed: ${serviceName}`, {
        errors: validation.errors
      });
      return false;
    }

    try {
      launcherLogger.info(`Launching service: ${serviceName}`);
      
      // Update status
      this.registry.updateStatus(serviceName, 'starting');

      // Spawn process
      const process = await this.spawnServiceProcess(entry.metadata.name);
      
      // Store process info
      this.registry.updateProcess(serviceName, process, process.pid);

      // Emit start event
      orchestratorEvents.emitServiceStart(serviceName, entry.metadata);

      // Wait for health check to confirm success
      const timeout = entry.metadata.startupTimeoutMs;
      const success = await this.validator.validateLaunchSuccess(serviceName, timeout);

      if (success) {
        launcherLogger.info(`Service launched successfully: ${serviceName}`);
        this.registry.updateStatus(serviceName, 'healthy');
        return true;
      } else {
        launcherLogger.error(`Service launch timeout: ${serviceName}`);
        this.registry.updateStatus(serviceName, 'unhealthy');
        return false;
      }
    } catch (error: any) {
      launcherLogger.error(`Service launch error: ${serviceName}`, { error: error.message });
      this.registry.updateStatus(serviceName, 'unhealthy');
      orchestratorEvents.emitServiceFailure(serviceName, error);
      return false;
    }
  }

  /**
   * Spawn service process
   */
  private async spawnServiceProcess(serviceName: string): Promise<ChildProcess> {
    const entry = this.registry.get(serviceName);
    if (!entry) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const { metadata } = entry;
    const servicePath = metadata.path;
    const entryPoint = metadata.entryPoint;

    // Determine command based on type
    let command: string;
    let args: string[];

    if (metadata.type === 'tsx') {
      command = 'npx';
      args = ['tsx', path.join(servicePath, entryPoint)];
    } else if (metadata.type === 'ts-node') {
      command = 'npx';
      args = ['ts-node', path.join(servicePath, entryPoint)];
    } else {
      command = 'node';
      args = [path.join(servicePath, entryPoint)];
    }

    // Spawn process
    const process = spawn(command, args, {
      cwd: servicePath,
      env: {
        ...process.env,
        PORT: String(metadata.port),
        NODE_ENV: 'production',
        SERVICE_NAME: metadata.name
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Handle process output
    process.stdout?.on('data', (data) => {
      logger.debug(`[${serviceName}] ${data.toString().trim()}`);
    });

    process.stderr?.on('data', (data) => {
      logger.error(`[${serviceName}] ${data.toString().trim()}`);
    });

    process.on('error', (error) => {
      launcherLogger.error(`Process error: ${serviceName}`, { error: error.message });
      orchestratorEvents.emitServiceFailure(serviceName, error);
    });

    process.on('exit', (code, signal) => {
      launcherLogger.warn(`Process exited: ${serviceName}`, { code, signal });
      this.registry.updateStatus(serviceName, 'stopped');
      orchestratorEvents.emitServiceStop(serviceName, `Exit code: ${code}`);
    });

    return process;
  }
}
