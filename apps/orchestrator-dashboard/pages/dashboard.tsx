/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Main Dashboard Page
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useOrchestratorStatus } from '../hooks/useOrchestratorStatus';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { ServiceGrid } from '../components/service-grid';
import { orchestratorClient } from '../services/orchestrator-client';

export default function Dashboard() {
  const { status, loading, error } = useOrchestratorStatus();
  const { connected } = useRealtimeUpdates();
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, statsData] = await Promise.all([
          orchestratorClient.getServices(),
          orchestratorClient.getStats()
        ]);
        setServices(servicesData.services || []);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Orchestrator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const healthStatus = status?.health || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Azora OS Master Orchestrator
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Central Nervous System Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${connected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-2 animate-pulse`}></div>
                {connected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                State: <span className="font-semibold">{status?.state || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Services</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {healthStatus.totalServices || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Healthy</div>
            <div className="text-3xl font-bold text-green-600">
              {healthStatus.healthyServices || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Degraded</div>
            <div className="text-3xl font-bold text-yellow-600">
              {healthStatus.degradedServices || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unhealthy</div>
            <div className="text-3xl font-bold text-red-600">
              {healthStatus.unhealthyServices || 0}
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">System Health</h2>
          <div className="flex items-center">
            <div className={`text-4xl font-bold ${
              healthStatus.overall === 'healthy' ? 'text-green-600' :
              healthStatus.overall === 'degraded' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {healthStatus.overall?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div className="ml-8 text-sm text-gray-600 dark:text-gray-400">
              <div>System Uptime: {stats ? Math.floor(stats.uptime / 1000 / 60) : 0} minutes</div>
              <div>WebSocket Clients: {stats?.websocketClients || 0}</div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Services</h2>
          <ServiceGrid services={services} />
        </div>
      </div>
    </div>
  );
}
