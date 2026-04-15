/**
 * Charger domain types
 * Source: ui-emobility-web chargers models
 */

// ============ CHARGER BASICS ============

export interface Connector {
  id: string;
  connectorId?: number;
  status: 'available' | 'occupied' | 'reserved' | 'unavailable' | 'faulted';
  type?: string;
  power?: number;
  voltage?: number;
  current?: number;
  sessionId?: string;
}

export interface Charger {
  id: string;
  name: string;
  description?: string;
  status: 'available' | 'charging' | 'faulted' | 'offline';
  siteId: string;
  siteName?: string;
  power: number; // kW
  connectors: Connector[];
  serialNumber?: string;
  model?: string;
  firmwareVersion?: string;
  lastUpdate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============ CHARGER DETAIL / LIVE DATA ============

export interface ChargerLiveData {
  chargerId: string;
  timestamp: string;
  totalPower: number; // kW
  totalCurrent: number; // A
  totalVoltage: number; // V
  energy: number; // kWh
  temperature?: number;
  status: string;
  connectors: ConnectorLiveData[];
}

export interface ConnectorLiveData {
  connectorId: string;
  status: string;
  power?: number;
  current?: number;
  voltage?: number;
  energy?: number;
  sessionId?: string;
  clientId?: string;
  startTime?: string;
  estimatedFinishTime?: string;
}

// ============ CHARGER HISTORY / SESSIONS ============

export interface ChargerSession {
  id: string;
  chargerId: string;
  connectorId: string;
  clientId: string;
  startTime: string;
  endTime?: string;
  energyDelivered: number; // kWh
  cost?: number;
  duration: number; // seconds
  maxPower: number; // kW
  avgPower: number; // kW
  status: 'active' | 'completed' | 'failed';
}

export interface ChargerHistoryData {
  timestamp: string;
  power: number;
  energy: number;
  temperature?: number;
}

// ============ OCPP CONFIGURATION ============

export interface OcppConfig {
  chargerId: string;
  heartbeatInterval: number;
  meterInterval: number;
  clockAlignedDataInterval?: number;
  maxEnergy?: number;
  minEnergy?: number;
  txnStopPointValues?: string[];
  supportedFeatures?: string[];
}

export interface OcppVariable {
  key: string;
  value: string;
  readonly?: boolean;
}

// ============ API RESPONSES ============

export interface ChargersListResponse {
  data: Charger[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ChargerDetailResponse {
  data: Charger;
}

export interface ChargerLiveResponse {
  data: ChargerLiveData;
}

export interface ChargerSessionsResponse {
  data: ChargerSession[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface OcppConfigResponse {
  data: OcppConfig;
}

// ============ REQUEST PAYLOADS ============

export interface UpdateOcppConfigRequest {
  variables: OcppVariable[];
}
