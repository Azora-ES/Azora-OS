/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Circuit Breaker - Prevents cascading failures
 */

import { CircuitBreakerState } from '../types/orchestrator.types';
import { CIRCUIT_BREAKER_CONFIG } from '../orchestrator-config';
import { createServiceLogger } from '../logging/orchestrator-logger';

const breakerLogger = createServiceLogger('CircuitBreaker');

export class CircuitBreaker {
  private breakers: Map<string, CircuitBreakerState> = new Map();

  /**
   * Get circuit breaker state for a service
   */
  getState(service: string): CircuitBreakerState {
    if (!this.breakers.has(service)) {
      this.breakers.set(service, {
        service,
        state: 'closed',
        failureCount: 0,
        successCount: 0
      });
    }

    return this.breakers.get(service)!;
  }

  /**
   * Record a failure
   */
  recordFailure(service: string): void {
    const state = this.getState(service);
    state.failureCount++;
    state.lastFailureTime = new Date();
    state.successCount = 0; // Reset success count on failure

    if (state.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      this.openCircuit(service);
    }
  }

  /**
   * Record a success
   */
  recordSuccess(service: string): void {
    const state = this.getState(service);
    state.successCount++;

    if (state.state === 'half-open') {
      if (state.successCount >= CIRCUIT_BREAKER_CONFIG.halfOpenMaxAttempts) {
        this.closeCircuit(service);
      }
    } else if (state.state === 'closed') {
      // Reset failure count on consistent success
      if (state.successCount >= 3) {
        state.failureCount = 0;
      }
    }
  }

  /**
   * Open circuit (block requests)
   */
  private openCircuit(service: string): void {
    const state = this.getState(service);
    
    if (state.state !== 'open') {
      state.state = 'open';
      state.nextRetryTime = new Date(
        Date.now() + CIRCUIT_BREAKER_CONFIG.resetTimeout
      );

      breakerLogger.warn(`Circuit opened for service: ${service}`, {
        failureCount: state.failureCount
      });

      // Schedule transition to half-open
      setTimeout(() => {
        this.halfOpenCircuit(service);
      }, CIRCUIT_BREAKER_CONFIG.resetTimeout);
    }
  }

  /**
   * Half-open circuit (allow limited requests)
   */
  private halfOpenCircuit(service: string): void {
    const state = this.getState(service);
    state.state = 'half-open';
    state.successCount = 0;

    breakerLogger.info(`Circuit half-opened for service: ${service}`);
  }

  /**
   * Close circuit (allow all requests)
   */
  private closeCircuit(service: string): void {
    const state = this.getState(service);
    state.state = 'closed';
    state.failureCount = 0;
    state.successCount = 0;

    breakerLogger.info(`Circuit closed for service: ${service}`);
  }

  /**
   * Check if service is allowed to be called
   */
  isAllowed(service: string): boolean {
    const state = this.getState(service);

    if (state.state === 'open') {
      // Check if enough time has passed
      if (state.nextRetryTime && Date.now() >= state.nextRetryTime.getTime()) {
        this.halfOpenCircuit(service);
        return true;
      }
      return false;
    }

    return true; // closed or half-open
  }

  /**
   * Reset circuit breaker
   */
  reset(service: string): void {
    this.breakers.delete(service);
    breakerLogger.info(`Circuit breaker reset for service: ${service}`);
  }

  /**
   * Get all circuit breaker states
   */
  getAllStates(): Map<string, CircuitBreakerState> {
    return new Map(this.breakers);
  }
}
