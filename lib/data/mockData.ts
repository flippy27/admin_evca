// Mock data for development/fallback when APIs unavailable
export const mockChargers = [
  {
    id: "cb-01",
    name: "Cargador CB-01",
    site: { name: "Marquesina A" },
    location: "Marquesina A",
    online: true,
    connectors: [
      {
        id: "cb-01-c01",
        connectorId: 1,
        status: "Charging",
        soc: 67,
        vehicleId: "12345678",
        power: 120,
        energyDelivered: 45.3,
      },
      {
        id: "cb-01-c02",
        connectorId: 2,
        status: "Finishing",
        soc: 100,
        vehicleId: "87654321",
        power: 5,
        energyDelivered: 78.2,
      },
    ],
  },
  {
    id: "cb-02",
    name: "Cargador CB-02",
    site: { name: "Marquesina A" },
    location: "Marquesina A",
    online: true,
    connectors: [
      {
        id: "cb-02-c01",
        connectorId: 1,
        status: "Charging",
        soc: 85,
        vehicleId: "11223344",
        power: 110,
        energyDelivered: 62.4,
      },
      {
        id: "cb-02-c02",
        connectorId: 2,
        status: "Faulted",
      },
    ],
  },
  {
    id: "cb-03",
    name: "Cargador CB-03",
    site: { name: "Marquesina J" },
    location: "Marquesina J",
    online: true,
    connectors: [
      { id: "cb-03-c01", connectorId: 1, status: "Available" },
      { id: "cb-03-c02", connectorId: 2, status: "Available" },
    ],
  },
  {
    id: "cb-01-b",
    name: "Cargador CB-01",
    site: { name: "Marquesina B" },
    location: "Marquesina B",
    online: true,
    connectors: [
      {
        id: "cb-01-b-c01",
        connectorId: 1,
        status: "Charging",
        soc: 45,
        vehicleId: "55667788",
        power: 130,
        energyDelivered: 32.1,
      },
      {
        id: "cb-01-b-c02",
        connectorId: 2,
        status: "Suspended",
      },
    ],
  },
];

export const mockSessions = [
  {
    id: "session-1",
    charger: { name: "CB-01" },
    chargerId: "cb-01",
    connectorId: 1,
    vehicleId: "12345678",
    startTime: new Date(Date.now() - 3600000 * 1.43),
    duration: 3600 * 1.43,
    energy: 45.3,
    status: "Active",
  },
  {
    id: "session-2",
    charger: { name: "CB-01" },
    chargerId: "cb-01",
    connectorId: 2,
    vehicleId: "87654321",
    startTime: new Date(Date.now() - 3600000 * 1.49),
    duration: 3600 * 1.49,
    energy: 78.2,
    status: "Active",
  },
  {
    id: "session-3",
    charger: { name: "CB-01" },
    chargerId: "cb-01-b",
    connectorId: 1,
    vehicleId: "55667788",
    startTime: new Date(Date.now() - 3600000 * 1.41),
    duration: 3600 * 1.41,
    energy: 32.1,
    status: "Active",
  },
];

export interface Tecle {
  id: string;
  name: string;
  location: string;
  status: "idle" | "moving_up" | "moving_down";
  /** Real BFF IDs for the ramp endpoint */
  siteId: string;
  chargerId: string;
  connectorId: string;
}

export const mockTecles: Tecle[] = [
  { id: "tecle-01", name: "Tecle 1", location: "Marquesina A", status: "idle", siteId: "677", chargerId: "1420", connectorId: "1950" },
  { id: "tecle-02", name: "Tecle 2", location: "Marquesina A", status: "idle", siteId: "677", chargerId: "1420", connectorId: "1951" },
  { id: "tecle-03", name: "Tecle 3", location: "Marquesina B", status: "idle", siteId: "677", chargerId: "1421", connectorId: "1952" },
  { id: "tecle-04", name: "Tecle 4", location: "Marquesina B", status: "idle", siteId: "677", chargerId: "1421", connectorId: "1953" },
  { id: "tecle-05", name: "Tecle 5", location: "Marquesina J", status: "idle", siteId: "677", chargerId: "1422", connectorId: "1954" },
];
