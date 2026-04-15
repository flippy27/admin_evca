/**
 * Chargers API endpoints
 * (Stubs for now — will add real endpoints as we build)
 */

import { bffClient } from './client';

// Placeholder types
export interface Charger {
  id: string;
  name: string;
  status: 'available' | 'charging' | 'faulted' | 'offline';
  power: number;
  connectors: Connector[];
  siteId: string;
}

export interface Connector {
  id: string;
  status: 'available' | 'occupied' | 'faulted';
  power: number;
  sessionId?: string;
}

export interface ChargingSession {
  id: string;
  chargerId: string;
  connectorId: string;
  startTime: string;
  endTime?: string;
  energyDelivered: number;
  status: 'active' | 'completed' | 'failed';
}

export const chargersApi = {
  // List all chargers
  list: () => bffClient.get<{ data: Charger[] }>('/chargers'),

  // Get charger detail
  getDetail: (id: string) => bffClient.get<{ data: Charger }>(`/chargers/${id}`),

  // Get charger live data
  getLiveData: (id: string) => bffClient.get(`/chargers/${id}/live`),

  // Get charger sessions
  getSessions: (id: string) => bffClient.get<{ data: ChargingSession[] }>(`/chargers/${id}/sessions`),

  // Get charger configuration
  getConfiguration: (id: string) => bffClient.get(`/chargers/${id}/configuration`),

  // Update charger configuration
  updateConfiguration: (id: string, config: any) => bffClient.post(`/chargers/${id}/configuration`, config),

  // Send OCPP command
  sendCommand: (id: string, command: string, payload: any) =>
    bffClient.post(`/chargers/${id}/commands/${command}`, payload),
};
