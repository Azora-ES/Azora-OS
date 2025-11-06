/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Service Discovery Tests
 */

import { ServiceDiscovery } from '../discovery/service-discovery';
import { ServiceRegistry } from '../discovery/service-registry';

describe('ServiceDiscovery', () => {
  let registry: ServiceRegistry;
  let discovery: ServiceDiscovery;

  beforeEach(() => {
    registry = new ServiceRegistry();
    discovery = new ServiceDiscovery(registry);
  });

  it('should create discovery instance', () => {
    expect(discovery).toBeDefined();
  });

  it('should discover services', async () => {
    const result = await discovery.discoverAllServices();
    expect(result).toHaveProperty('totalDiscovered');
    expect(result).toHaveProperty('validServices');
    expect(result).toHaveProperty('invalidServices');
  });
});
