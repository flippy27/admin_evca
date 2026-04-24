/**
 * Group (areas-grid) domain types
 * Endpoint: GET /bff/operations/sites/:siteId/areas-grid
 */

export interface GroupConnector {
  connector_ID: string;
  connector_type: string;
  ocpp_status: string;
  is_charging: boolean;
  vehicle_alias: string | null;
  vehicle_alias_truncated: string | null;
  licence_plate: string | null;
  soc_pct: number | null;
  last_update_ts: string;
  connector_id: string;
  connector_number: number;
  connector_name: string;
  connector_alias: string | null;
  connector_type_raw: string;
  connector_electric_type: string;
  connector_status: string;
  connector_status_timestamp: string;
  connector_max_voltage: number | null;
  connector_max_current: number | null;
  connector_max_power: number | null;
  connector_min_power: number | null;
  connector_max_soc: number | null;
  connector_boosted: boolean;
  connector_created_at: string;
  evse_id: string;
  charging_station_id: string;
  last_charging_record: GroupLastChargingRecord | null;
}

export interface GroupLastChargingRecord {
  transaction_id: string;
  datetime: string;
  soc: number;
  power: number;
  current: number;
  voltage: number;
  energy: number;
}

/** Charger inside an area line (no ocpp_id) or top-level (with ocpp_id) */
export interface GroupCharger {
  charger_ID: string | number;
  charger_name: string;
  ocpp_id?: string;
  charger_order: number;
  connectors: GroupConnector[];
}

export interface GroupAreaSummary {
  connectors_charging: number;
  connectors_total: number;
}

export interface GroupLine {
  line_ID: string;
  line_name: string;
  line_order: number;
  chargers: GroupCharger[];
}

export interface GroupArea {
  area_ID: string;
  area_name: string;
  area_order: number;
  summary: GroupAreaSummary;
  lines: GroupLine[];
}

export interface GroupSite {
  site_ID: string;
  site_name: string;
}

export interface GroupData {
  site: GroupSite;
  /** Areas with nested lines and chargers. Empty when site has no area config. */
  areas: GroupArea[];
  /** Flat list of all chargers. Used as fallback when areas is empty. */
  chargers: GroupCharger[];
}

export interface GroupMeta {
  schemaVersion: string;
  live: {
    sse_url: string;
    suggested_poll_interval_sec: number;
  };
  etag: string;
  generatedAt: string;
}

export interface GroupGridResponse {
  data: GroupData;
  meta: GroupMeta;
}
