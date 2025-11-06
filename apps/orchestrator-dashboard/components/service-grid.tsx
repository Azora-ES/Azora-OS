/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Service Grid Component - Display all services with status
 */

'use client';

import React from 'react';

interface ServiceGridProps {
  services: any[];
}

export function ServiceGrid({ services }: ServiceGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      case 'starting': return 'bg-blue-500';
      case 'stopped': return 'bg-gray-500';
      case 'quarantined': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✓';
      case 'degraded': return '⚠';
      case 'unhealthy': return '✗';
      case 'starting': return '⟳';
      case 'stopped': return '■';
      case 'quarantined': return '⊘';
      default: return '?';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {services.map((service) => (
        <div
          key={service.name}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm truncate">{service.name}</h3>
            <div className={`w-8 h-8 rounded-full ${getStatusColor(service.status)} flex items-center justify-center text-white font-bold`}>
              {getStatusIcon(service.status)}
            </div>
          </div>
          
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Port: {service.port}</div>
            <div>Phase: {service.phase}</div>
            <div>Priority: {service.priority}</div>
            {service.restartAttempts > 0 && (
              <div className="text-orange-600">Restarts: {service.restartAttempts}</div>
            )}
            {service.metrics && (
              <div>Uptime: {service.metrics.uptimePercentage.toFixed(1)}%</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
