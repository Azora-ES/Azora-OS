/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Event Emitter for Orchestrator Events
 */

import { EventEmitter } from 'events';
import { MonitoringEvent, HealingEvent } from '../types/orchestrator.types';
import { logger } from './orchestrator-logger';

export class OrchestratorEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Support many services
  }

  /**
   * Emit monitoring event
   */
  emitMonitoringEvent(event: MonitoringEvent): void {
    this.emit('monitoring', event);
    logger.debug('Monitoring event emitted', { type: event.type, service: event.service });
  }

  /**
   * Emit healing event
   */
  emitHealingEvent(event: HealingEvent): void {
    this.emit('healing', event);
    logger.info('Healing event emitted', { 
      service: event.service, 
      action: event.action,
      reason: event.reason 
    });
  }

  /**
   * Emit service start event
   */
  emitServiceStart(serviceName: string, metadata: any): void {
    const event: MonitoringEvent = {
      type: 'service_start',
      timestamp: new Date(),
      service: serviceName,
      data: metadata
    };
    this.emitMonitoringEvent(event);
  }

  /**
   * Emit service stop event
   */
  emitServiceStop(serviceName: string, reason?: string): void {
    const event: MonitoringEvent = {
      type: 'service_stop',
      timestamp: new Date(),
      service: serviceName,
      data: { reason }
    };
    this.emitMonitoringEvent(event);
  }

  /**
   * Emit service failure event
   */
  emitServiceFailure(serviceName: string, error: any): void {
    const event: MonitoringEvent = {
      type: 'service_failure',
      timestamp: new Date(),
      service: serviceName,
      data: { error: error.message || error }
    };
    this.emitMonitoringEvent(event);
  }

  /**
   * Emit health check event
   */
  emitHealthCheck(serviceName: string, result: any): void {
    const event: MonitoringEvent = {
      type: 'health_check',
      timestamp: new Date(),
      service: serviceName,
      data: result
    };
    this.emit('healthCheck', event);
  }
}

// Global event emitter instance
export const orchestratorEvents = new OrchestratorEventEmitter();
