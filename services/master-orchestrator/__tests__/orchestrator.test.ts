/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Master Orchestrator Tests
 */

import { MasterOrchestrator } from '../orchestrator';

describe('MasterOrchestrator', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('Initialization', () => {
    it('should create orchestrator instance', () => {
      expect(orchestrator).toBeDefined();
    });

    it('should initialize with correct state', () => {
      const status = orchestrator.getSystemStatus();
      expect(status.state).toBe('initializing');
    });
  });

  describe('Service Discovery', () => {
    it('should discover services', async () => {
      await orchestrator.initialize();
      const services = orchestrator.getAllServices();
      expect(services.size).toBeGreaterThan(0);
    });
  });

  describe('Dependency Graph', () => {
    it('should build dependency graph', async () => {
      await orchestrator.initialize();
      const graph = orchestrator.getDependencyGraph();
      expect(graph).toBeDefined();
      expect(graph?.nodes.length).toBeGreaterThan(0);
    });
  });

  describe('System Status', () => {
    it('should return system status', () => {
      const status = orchestrator.getSystemStatus();
      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('health');
      expect(status).toHaveProperty('startTime');
      expect(status).toHaveProperty('uptime');
    });
  });
});
