/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Orchestrator API Client
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_API || 'http://localhost:9000';
const WS_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_WS || 'ws://localhost:9000/orchestrator/stream';

export class OrchestratorClient {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/orchestrator`;
  }

  /**
   * Get system status
   */
  async getStatus() {
    const response = await axios.get(`${this.baseURL}/status`);
    return response.data;
  }

  /**
   * Get all services
   */
  async getServices() {
    const response = await axios.get(`${this.baseURL}/services`);
    return response.data;
  }

  /**
   * Get service details
   */
  async getService(name: string) {
    const response = await axios.get(`${this.baseURL}/services/${name}`);
    return response.data;
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    const response = await axios.get(`${this.baseURL}/health-status`);
    return response.data;
  }

  /**
   * Get dependency graph
   */
  async getDependencyGraph() {
    const response = await axios.get(`${this.baseURL}/dependencies`);
    return response.data;
  }

  /**
   * Get healing history
   */
  async getHealingHistory(limit: number = 100) {
    const response = await axios.get(`${this.baseURL}/healing-history?limit=${limit}`);
    return response.data;
  }

  /**
   * Restart service
   */
  async restartService(name: string) {
    const response = await axios.post(`${this.baseURL}/restart/${name}`);
    return response.data;
  }

  /**
   * Get statistics
   */
  async getStats() {
    const response = await axios.get(`${this.baseURL}/stats`);
    return response.data;
  }

  /**
   * Create WebSocket connection
   */
  createWebSocket(onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'subscribe' }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage(message);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return ws;
  }
}

export const orchestratorClient = new OrchestratorClient();
