/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Restart Protocol - Handles service restart strategies
 */

import { RestartProtocol } from '../types/orchestrator.types';
import { BackoffCalculator } from '../utils/backoff-calculator';
import { createServiceLogger } from '../logging/orchestrator-logger';

const protocolLogger = createServiceLogger('RestartProtocol');

export class RestartProtocolHandler {
  /**
   * Create restart protocol for an attempt
   */
  createProtocol(service: string, attempt: number, reason: string): RestartProtocol {
    const strategy = BackoffCalculator.getRestartStrategy(attempt);
    const backoffMs = BackoffCalculator.calculateBackoff(attempt);

    protocolLogger.info(`Creating restart protocol: ${service}`, {
      attempt,
      strategy,
      backoffMs
    });

    return {
      service,
      attempt,
      strategy,
      backoffMs,
      reason
    };
  }

  /**
   * Execute restart with backoff
   */
  async executeWithBackoff(
    protocol: RestartProtocol,
    restartFn: () => Promise<boolean>
  ): Promise<boolean> {
    protocolLogger.info(`Executing restart: ${protocol.service}`, {
      strategy: protocol.strategy,
      attempt: protocol.attempt
    });

    // Wait for backoff period
    if (protocol.backoffMs > 0) {
      await this.sleep(protocol.backoffMs);
    }

    try {
      const success = await restartFn();
      
      if (success) {
        protocolLogger.info(`Restart successful: ${protocol.service}`);
      } else {
        protocolLogger.warn(`Restart failed: ${protocol.service}`);
      }

      return success;
    } catch (error: any) {
      protocolLogger.error(`Restart error: ${protocol.service}`, {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Determine if should quarantine
   */
  shouldQuarantine(attempt: number, maxAttempts: number): boolean {
    return attempt >= maxAttempts;
  }

  /**
   * Get restart description
   */
  getDescription(protocol: RestartProtocol): string {
    const strategies = {
      immediate: 'Immediate restart with minimal delay',
      graceful: 'Graceful restart with dependency check',
      dependency: 'Restart with dependency chain',
      quarantine: 'Service quarantine - manual intervention required'
    };

    return strategies[protocol.strategy] || 'Unknown restart strategy';
  }
}
