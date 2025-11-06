/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Healing History - Track all healing events
 */

import { HealingEvent, HealingAction } from '../types/orchestrator.types';
import { MONITORING_CONFIG } from '../orchestrator-config';
import { createServiceLogger } from '../logging/orchestrator-logger';

const historyLogger = createServiceLogger('HealingHistory');

export class HealingHistory {
  private events: HealingEvent[] = [];
  private maxSize: number = 1000;

  /**
   * Record a healing event
   */
  record(event: HealingEvent): void {
    this.events.push(event);

    // Keep size manageable
    if (this.events.length > this.maxSize) {
      this.events.shift();
    }

    historyLogger.debug('Healing event recorded', {
      service: event.service,
      action: event.action
    });
  }

  /**
   * Get all events
   */
  getAll(): HealingEvent[] {
    return [...this.events];
  }

  /**
   * Get events for a specific service
   */
  getForService(service: string): HealingEvent[] {
    return this.events.filter(e => e.service === service);
  }

  /**
   * Get events by action type
   */
  getByAction(action: HealingAction): HealingEvent[] {
    return this.events.filter(e => e.action === action);
  }

  /**
   * Get recent events
   */
  getRecent(count: number = 10): HealingEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get events in time range
   */
  getInTimeRange(start: Date, end: Date): HealingEvent[] {
    return this.events.filter(
      e => e.timestamp >= start && e.timestamp <= end
    );
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEvents: number;
    byAction: { [key in HealingAction]?: number };
    byService: { [service: string]: number };
  } {
    const byAction: { [key in HealingAction]?: number } = {};
    const byService: { [service: string]: number } = {};

    for (const event of this.events) {
      byAction[event.action] = (byAction[event.action] || 0) + 1;
      byService[event.service] = (byService[event.service] || 0) + 1;
    }

    return {
      totalEvents: this.events.length,
      byAction,
      byService
    };
  }

  /**
   * Clear old events
   */
  clearOld(daysToKeep: number = MONITORING_CONFIG.logRetentionDays): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalCount = this.events.length;
    this.events = this.events.filter(e => e.timestamp >= cutoffDate);

    const removedCount = originalCount - this.events.length;
    if (removedCount > 0) {
      historyLogger.info(`Cleared ${removedCount} old events`);
    }
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    historyLogger.info('Healing history cleared');
  }

  /**
   * Export events as JSON
   */
  export(): string {
    return JSON.stringify(this.events, null, 2);
  }
}
