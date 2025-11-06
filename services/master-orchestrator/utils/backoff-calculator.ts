/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Exponential Backoff Calculator for Restart Protocols
 */

import { RESTART_BACKOFF_MS } from '../orchestrator-config';

export class BackoffCalculator {
  /**
   * Calculate backoff time for restart attempt
   */
  static calculateBackoff(attempt: number): number {
    const backoffMap: { [key: number]: number } = {
      1: RESTART_BACKOFF_MS.attempt1,
      2: RESTART_BACKOFF_MS.attempt2,
      3: RESTART_BACKOFF_MS.attempt3,
      4: RESTART_BACKOFF_MS.attempt4,
      5: RESTART_BACKOFF_MS.attempt5
    };

    return backoffMap[attempt] || RESTART_BACKOFF_MS.attempt5;
  }

  /**
   * Calculate exponential backoff with jitter
   */
  static calculateExponentialBackoff(
    attempt: number,
    baseMs: number = 1000,
    maxMs: number = 60000
  ): number {
    const exponentialMs = baseMs * Math.pow(2, attempt - 1);
    const withJitter = exponentialMs + Math.random() * 1000;
    return Math.min(withJitter, maxMs);
  }

  /**
   * Get restart strategy based on attempt number
   */
  static getRestartStrategy(attempt: number): 'immediate' | 'graceful' | 'dependency' | 'quarantine' {
    if (attempt <= 3) return 'immediate';
    if (attempt <= 5) return 'graceful';
    if (attempt <= 7) return 'dependency';
    return 'quarantine';
  }

  /**
   * Check if should retry based on attempt count
   */
  static shouldRetry(attempt: number, maxAttempts: number): boolean {
    return attempt < maxAttempts;
  }

  /**
   * Calculate next retry time
   */
  static getNextRetryTime(attempt: number): Date {
    const backoffMs = this.calculateBackoff(attempt);
    return new Date(Date.now() + backoffMs);
  }
}
