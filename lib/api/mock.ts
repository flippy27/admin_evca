/**
 * Mock API responses for development and testing
 * Provides realistic data without requiring a backend
 * Enable via ENABLE_MOCK_API env variable
 */

import { Charger, ChargerLiveData, ChargerSession, OcppConfig } from '../types/charger.types';
import { Site } from '../types/site.types';

export const MOCK_CHARGERS: Charger[] = [
  {
    id: 'charger-001',
    name: 'Fast Charger A1',
    type: 'DC',
    status: 'charging',
    power: 150,
    current: 32.5,
    voltage: 400,
    energyDelivered: 45.2,
    sessionDuration: 1800,
    connector: { type: 'CCS', status: 'occupied' },
    location: {
      latitude: -33.8688,
      longitude: -151.2093,
      address: 'Bondi Beach, NSW',
    },
    siteId: 'site-001',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'charger-002',
    name: 'AC Charger B2',
    type: 'AC',
    status: 'available',
    power: 22,
    current: 32,
    voltage: 230,
    energyDelivered: 0,
    sessionDuration: 0,
    connector: { type: 'Type2', status: 'free' },
    location: {
      latitude: -33.8688,
      longitude: -151.2093,
      address: 'Bondi Beach, NSW',
    },
    siteId: 'site-001',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'charger-003',
    name: 'Ultra Fast C3',
    type: 'DC',
    status: 'faulted',
    power: 0,
    current: 0,
    voltage: 0,
    energyDelivered: 0,
    sessionDuration: 0,
    connector: { type: 'CCS', status: 'fault' },
    location: {
      latitude: -33.8700,
      longitude: -151.2100,
      address: 'Coogee Beach, NSW',
    },
    siteId: 'site-002',
    lastUpdate: new Date().toISOString(),
  },
];

export const MOCK_SITES: Site[] = [
  {
    id: 'site-001',
    name: 'Bondi Beach Station',
    status: 'active',
    location: {
      latitude: -33.8688,
      longitude: -151.2093,
      address: 'Bondi Beach, NSW 2026',
    },
    chargersCount: 2,
    totalPower: 172,
    activeChargers: 1,
    offlineChargers: 1,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'site-002',
    name: 'Coogee Station',
    status: 'active',
    location: {
      latitude: -33.8700,
      longitude: -151.2100,
      address: 'Coogee Beach, NSW 2034',
    },
    chargersCount: 1,
    totalPower: 0,
    activeChargers: 0,
    offlineChargers: 1,
    lastUpdate: new Date().toISOString(),
  },
];

export const MOCK_CHARGER_LIVE: ChargerLiveData = {
  id: 'charger-001',
  status: 'charging',
  power: 150,
  current: 32.5,
  voltage: 400,
  temperature: 35.2,
  efficiency: 0.95,
  sessionEnergy: 45.2,
  sessionDuration: 1800,
  connectorStatus: 'occupied',
  errorCode: null,
  lastUpdate: new Date().toISOString(),
};

export const MOCK_CHARGER_SESSIONS: ChargerSession[] = [
  {
    id: 'session-001',
    userId: 'user-001',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 82800000).toISOString(),
    energyDelivered: 52.5,
    cost: 15.75,
    status: 'completed',
  },
  {
    id: 'session-002',
    userId: 'user-002',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 169200000).toISOString(),
    energyDelivered: 38.2,
    cost: 11.46,
    status: 'completed',
  },
];

export const MOCK_CHARGER_CONFIG: OcppConfig = {
  id: 'charger-001',
  maxCurrent: 32,
  minChargingPower: 1.4,
  updateInterval: 300,
  variables: {
    maxCurrent: 32,
    minChargingPower: 1.4,
    updateInterval: 300,
  },
  lastUpdate: new Date().toISOString(),
};

/**
 * Add delay to simulate network latency
 */
export function simulateNetworkDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock API response wrapper
 */
export async function mockApiResponse<T>(
  data: T,
  delayMs: number = 500
): Promise<{ data: T; success: boolean }> {
  await simulateNetworkDelay(delayMs);
  return { data, success: true };
}
