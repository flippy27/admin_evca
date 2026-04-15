/**
 * Mock API responses for development and testing
 * Provides realistic data without requiring a backend
 * Enable via ENABLE_MOCK_API env variable
 */

import { Charger, ChargerLiveData, ChargerSession, OcppConfig, Connector, ConnectorLiveData } from '../types/charger.types';
import { Site } from '../types/site.types';

export const MOCK_CHARGERS: Charger[] = [
  {
    id: 'charger-001',
    name: 'Fast Charger A1',
    description: 'DC Fast Charging Station',
    status: 'charging',
    power: 150,
    siteId: 'site-001',
    siteName: 'Bondi Beach Station',
    connectors: [
      {
        id: 'connector-001',
        connectorId: 1,
        status: 'occupied',
        type: 'CCS',
        power: 150,
        voltage: 400,
        current: 32.5,
      },
    ],
    serialNumber: 'CB001-2024',
    model: 'EVSE DC 150kW',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'charger-002',
    name: 'AC Charger B2',
    description: 'AC Charging Point',
    status: 'available',
    power: 22,
    siteId: 'site-001',
    siteName: 'Bondi Beach Station',
    connectors: [
      {
        id: 'connector-002',
        connectorId: 1,
        status: 'available',
        type: 'Type2',
        power: 22,
        voltage: 230,
        current: 32,
      },
    ],
    serialNumber: 'CB002-2024',
    model: 'EVSE AC 22kW',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'charger-003',
    name: 'Ultra Fast C3',
    description: 'Ultra High Power Charger',
    status: 'faulted',
    power: 0,
    siteId: 'site-002',
    siteName: 'Coogee Station',
    connectors: [
      {
        id: 'connector-003',
        connectorId: 1,
        status: 'faulted',
        type: 'CCS',
      },
    ],
    serialNumber: 'CC003-2024',
    model: 'EVSE DC 350kW',
    lastUpdate: new Date().toISOString(),
  },
];

export const MOCK_SITES: Site[] = [
  {
    id: 'site-001',
    name: 'Bondi Beach Station',
    description: 'Main charging hub at Bondi Beach',
    address: 'Bondi Beach, NSW 2026',
    city: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: -151.2093,
    chargerCount: 2,
    totalPower: 172,
    status: 'active',
  },
  {
    id: 'site-002',
    name: 'Coogee Station',
    description: 'Secondary charging point',
    address: 'Coogee Beach, NSW 2034',
    city: 'Sydney',
    country: 'Australia',
    latitude: -33.8700,
    longitude: -151.2100,
    chargerCount: 1,
    totalPower: 0,
    status: 'active',
  },
];

export const MOCK_CHARGER_LIVE: ChargerLiveData = {
  chargerId: 'charger-001',
  timestamp: new Date().toISOString(),
  totalPower: 150,
  totalCurrent: 32.5,
  totalVoltage: 400,
  energy: 45.2,
  temperature: 35.2,
  status: 'charging',
  connectors: [
    {
      connectorId: 'connector-001',
      status: 'occupied',
      power: 150,
      current: 32.5,
      voltage: 400,
      energy: 45.2,
      sessionId: 'session-001',
      clientId: 'client-001',
      startTime: new Date(Date.now() - 1800000).toISOString(),
      estimatedFinishTime: new Date(Date.now() + 1800000).toISOString(),
    },
  ],
};

export const MOCK_CHARGER_SESSIONS: ChargerSession[] = [
  {
    id: 'session-001',
    chargerId: 'charger-001',
    connectorId: 'connector-001',
    clientId: 'client-001',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 82800000).toISOString(),
    energyDelivered: 52.5,
    cost: 15.75,
    duration: 3600,
    maxPower: 150,
    avgPower: 125,
    status: 'completed',
  },
  {
    id: 'session-002',
    chargerId: 'charger-002',
    connectorId: 'connector-002',
    clientId: 'client-002',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 169200000).toISOString(),
    energyDelivered: 38.2,
    cost: 11.46,
    duration: 7200,
    maxPower: 22,
    avgPower: 19,
    status: 'completed',
  },
];

export const MOCK_CHARGER_CONFIG: OcppConfig = {
  chargerId: 'charger-001',
  heartbeatInterval: 60,
  meterInterval: 10,
  clockAlignedDataInterval: 900,
  maxEnergy: 500,
  minEnergy: 1,
  txnStopPointValues: ['PowerLoss', 'GroundFault'],
  supportedFeatures: ['ChangeAvailability', 'GetConfiguration', 'SetConfiguration'],
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
