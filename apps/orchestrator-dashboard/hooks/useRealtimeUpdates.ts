/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Hook for real-time orchestrator updates via WebSocket
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { orchestratorClient } from '../services/orchestrator-client';

export function useRealtimeUpdates() {
  const [status, setStatus] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = orchestratorClient.createWebSocket((message) => {
      switch (message.type) {
        case 'status_update':
          setStatus(message.payload);
          break;
        case 'health_update':
          // Handle health update
          break;
        case 'healing_event':
          // Handle healing event
          break;
        case 'service_event':
          // Handle service event
          break;
      }
    });

    socket.addEventListener('open', () => setConnected(true));
    socket.addEventListener('close', () => setConnected(false));

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  return { status, connected, ws };
}
