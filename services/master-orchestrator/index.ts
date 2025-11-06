/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Master Orchestrator Entry Point
 * 
 * Startup sequence:
 * 1. Initialize configuration & logging
 * 2. Scan services/ directory
 * 3. Build dependency graph
 * 4. Validate all configurations
 * 5. Launch Phase 0 (critical services)
 * 6. Launch Phase 1-6 (remaining services)
 * 7. Start health monitoring loop
 * 8. Activate self-healing system
 * 9. Start API server
 * 10. Report "System Ready"
 */

import { MasterOrchestrator } from './orchestrator';
import { OrchestratorAPI } from './orchestrator-api';
import { logger } from './logging/orchestrator-logger';

async function main() {
  try {
    logger.info('');
    logger.info('╔════════════════════════════════════════════════════════════════╗');
    logger.info('║                                                                ║');
    logger.info('║           AZORA OS MASTER ORCHESTRATOR v1.0.0                  ║');
    logger.info('║           Central Nervous System of Azora OS                   ║');
    logger.info('║                                                                ║');
    logger.info('╚════════════════════════════════════════════════════════════════╝');
    logger.info('');

    // Create orchestrator instance
    const orchestrator = new MasterOrchestrator();

    // Initialize
    await orchestrator.initialize();

    // Launch all services
    const launchResult = await orchestrator.launchAllServices();

    if (!launchResult.success) {
      logger.warn('Some services failed to launch', {
        launched: launchResult.launched.length,
        failed: launchResult.failed.length
      });
      
      if (launchResult.failed.length > 0) {
        logger.warn('Failed services:', launchResult.failed);
      }
    }

    // Start health monitoring
    await orchestrator.startHealthMonitoring();

    // Activate self-healing
    await orchestrator.activateSelfHealing();

    // Start API server
    const api = new OrchestratorAPI(orchestrator);
    await api.start();

    // Mark system as ready
    orchestrator.markReady();

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('');
      logger.info('Initiating graceful shutdown...');
      
      try {
        await api.stop();
        await orchestrator.gracefulShutdown();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error: any) {
        logger.error('Shutdown error', { error: error.message });
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error: any) {
    logger.error('Fatal error', { 
      error: error.message,
      stack: error.stack 
    });
    process.exit(1);
  }
}

// Run the orchestrator
main();
