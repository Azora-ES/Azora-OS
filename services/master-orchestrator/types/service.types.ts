/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Core type definitions for Azora OS services
 */

export type ServicePriority = 'critical' | 'high' | 'medium' | 'low';
export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'timeout' | 'starting' | 'stopped' | 'quarantined';
export type DependencyStatus = 'connected' | 'disconnected' | 'unknown';

export interface ServiceMetadata {
  name: string;
  port: number;
  version: string;
  dependencies: string[];
  priority: ServicePriority;
  healthCheckInterval: number;
  maxRestartAttempts: number;
  startupTimeoutMs: number;
  capabilities: string[];
  launchPhase: number;
  path: string;
  entryPoint: string;
  type: 'node' | 'tsx' | 'ts-node';
  description?: string;
  tags?: string[];
}

export interface ServiceRegistryEntry {
  metadata: ServiceMetadata;
  status: ServiceStatus;
  process: any | null;
  pid?: number;
  startTime?: Date;
  lastHealthCheck?: Date;
  healthHistory: HealthCheckResult[];
  restartAttempts: number;
  lastRestartTime?: Date;
  uptime: number;
  metrics: ServiceMetrics;
}

export interface HealthCheckResult {
  service: string;
  timestamp: Date;
  status: ServiceStatus;
  responseTime: number;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: number;
  dependencies: { [service: string]: DependencyStatus };
  errorMessage?: string;
}

export interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  lastRequestTime?: Date;
  uptimePercentage: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  required: boolean;
}

export interface DependencyGraph {
  nodes: string[];
  edges: DependencyEdge[];
  phases: { [phase: number]: string[] };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LaunchResult {
  success: boolean;
  totalServices: number;
  launched: string[];
  failed: string[];
  skipped: string[];
  duration: number;
  phaseResults: PhaseResult[];
}

export interface PhaseResult {
  phase: number;
  services: string[];
  success: boolean;
  launched: string[];
  failed: string[];
  duration: number;
}
