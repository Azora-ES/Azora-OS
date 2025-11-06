/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Type definitions for Master Orchestrator
 */

import { ServiceRegistryEntry, HealthCheckResult, LaunchResult } from './service.types';

export enum HealingState {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  FAILING = 'failing',
  RESTARTING = 'restarting',
  QUARANTINED = 'quarantined'
}

export enum HealingAction {
  DETECT_FAILURE = 'detect_failure',
  ATTEMPT_RESTART = 'attempt_restart',
  RESTART_SUCCESS = 'restart_success',
  RESTART_FAILURE = 'restart_failure',
  QUARANTINE = 'quarantine',
  DEPENDENCY_RESTART = 'dependency_restart',
  CIRCUIT_OPEN = 'circuit_open',
  CIRCUIT_CLOSE = 'circuit_close'
}

export interface HealingEvent {
  timestamp: Date;
  service: string;
  action: HealingAction;
  reason: string;
  metadata: Record<string, any>;
  attempt?: number;
}

export interface CircuitBreakerState {
  service: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: Date;
  nextRetryTime?: Date;
  successCount: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  quarantinedServices: number;
  services: { [name: string]: ServiceRegistryEntry };
  timestamp: Date;
  systemUptime: number;
}

export interface OrchestratorConfig {
  servicesPath: string;
  appsPath: string;
  healthCheckInterval: number;
  defaultServicePort: number;
  defaultMaxRestartAttempts: number;
  defaultStartupTimeout: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetTimeout: number;
  parallelLaunchLimit: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface OrchestratorStatus {
  state: 'initializing' | 'discovering' | 'launching' | 'monitoring' | 'healing' | 'shutting_down' | 'ready';
  health: HealthStatus;
  launchResult?: LaunchResult;
  healingHistory: HealingEvent[];
  startTime: Date;
  uptime: number;
}

export interface RestartProtocol {
  service: string;
  attempt: number;
  strategy: 'immediate' | 'graceful' | 'dependency' | 'quarantine';
  backoffMs: number;
  reason: string;
}

export interface ServiceDiscoveryResult {
  services: Map<string, ServiceRegistryEntry>;
  totalDiscovered: number;
  validServices: number;
  invalidServices: number;
  errors: string[];
}

export interface MonitoringEvent {
  type: 'health_check' | 'service_start' | 'service_stop' | 'service_failure' | 'healing_action';
  timestamp: Date;
  service?: string;
  data: any;
}

export interface WebSocketMessage {
  type: 'status_update' | 'health_update' | 'healing_event' | 'service_event';
  timestamp: Date;
  payload: any;
}
