/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Master Orchestrator Configuration
 */

import { OrchestratorConfig } from './types/orchestrator.types';
import path from 'path';

export const ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  servicesPath: path.join(__dirname, '../../'),
  appsPath: path.join(__dirname, '../../../apps'),
  healthCheckInterval: 5000, // 5 seconds
  defaultServicePort: 3000,
  defaultMaxRestartAttempts: 5,
  defaultStartupTimeout: 60000, // 60 seconds
  circuitBreakerThreshold: 3,
  circuitBreakerResetTimeout: 60000, // 1 minute
  parallelLaunchLimit: 10,
  logLevel: process.env.LOG_LEVEL as any || 'info'
};

export const LAUNCH_PHASES = {
  0: {
    name: 'Critical Infrastructure',
    description: 'Essential system services that must start first',
    services: [
      'azora-covenant',
      'azora-aegis',
      'azora-database',
      'azora-core'
    ],
    parallel: false,
    timeout: 120000
  },
  1: {
    name: 'Core Services',
    description: 'Fundamental platform services',
    services: [
      'azora-mint',
      'azora-nexus',
      'auth-service',
      'user-management',
      'notification-service'
    ],
    parallel: true,
    timeout: 90000
  },
  2: {
    name: 'Intelligence Layer',
    description: 'AI and analytics services',
    services: [
      'azora-lms',
      'ambient-intelligence',
      'quantum-ai',
      'ai-orchestrator',
      'analytics-service'
    ],
    parallel: true,
    timeout: 90000
  },
  3: {
    name: 'B2B Industries',
    description: 'Industry-specific services',
    services: [
      'retail-ai',
      'cold-chain',
      'community-safety',
      'agriculture-ai',
      'logistics-optimizer'
    ],
    parallel: true,
    timeout: 60000
  },
  4: {
    name: 'User-Facing Services',
    description: 'Client-facing APIs and services',
    services: [
      'api-gateway',
      'azora-forge',
      'azora-marketplace',
      'payment-gateway',
      'messaging-service'
    ],
    parallel: true,
    timeout: 60000
  },
  5: {
    name: 'Advanced Services',
    description: 'Governance and specialized services',
    services: [
      'judiciary-service',
      'constitutional-court',
      'arbiter-service',
      'compliance-engine',
      'audit-logging-service'
    ],
    parallel: true,
    timeout: 60000
  },
  6: {
    name: 'Optional Services',
    description: 'Enterprise and experimental services',
    services: [
      'quantum-deep-mind',
      'enterprise-analytics',
      'blockchain-integration',
      'iot-gateway'
    ],
    parallel: true,
    timeout: 45000,
    optional: true
  }
};

export const SERVICE_PRIORITIES = {
  critical: ['azora-covenant', 'azora-aegis', 'azora-database', 'azora-core', 'auth-service'],
  high: ['azora-mint', 'azora-nexus', 'api-gateway', 'user-management'],
  medium: ['azora-lms', 'payment-gateway', 'notification-service'],
  low: ['analytics-service', 'audit-logging-service']
};

export const HEALTH_CHECK_ENDPOINTS = {
  default: '/health',
  alternatives: ['/api/health', '/status', '/ping']
};

export const RESTART_BACKOFF_MS = {
  attempt1: 1000,      // 1 second
  attempt2: 5000,      // 5 seconds
  attempt3: 15000,     // 15 seconds
  attempt4: 30000,     // 30 seconds
  attempt5: 60000      // 1 minute
};

export const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 3,
  resetTimeout: 60000,
  halfOpenMaxAttempts: 1
};

export const MONITORING_CONFIG = {
  healthCheckInterval: 5000,
  metricsCollectionInterval: 10000,
  logRetentionDays: 30,
  maxHealthHistorySize: 100
};

export const API_CONFIG = {
  port: process.env.ORCHESTRATOR_PORT || 9000,
  host: process.env.ORCHESTRATOR_HOST || '0.0.0.0',
  corsOrigins: ['http://localhost:3000', 'http://localhost:3001'],
  websocketPath: '/orchestrator/stream'
};
