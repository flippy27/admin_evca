/**
 * Charger Panel — real-time per-connector live data
 * Endpoint: GET /bff/operations/sites/:siteId/chargers/:chargerId/panel?company_id=:companyId
 */

export interface ChargerPanelConnectorSession {
  soc_initial_pct: number | null;
  soc_current_pct: number | null;
  elapsed_seconds: number;
  /** Power delivered — European decimal notation, e.g. "3,67" */
  power_kw: string | null;
  energy_kwh: number | null;
}

export interface ChargerPanelConnectorCapabilities {
  can_start: boolean;
  can_stop: boolean;
  can_ramp_up: boolean;
  can_ramp_down: boolean;
}

export interface ChargerPanelConnector {
  connector_id: string;
  connector_number: number;
  connector_name: string;
  connector_type: string;
  /** OCPP state e.g. "Charging", "Available", "Faulted" */
  state_code: string;
  /** Human-readable label e.g. "Cargando" */
  state_label: string;
  vehicle_alias: string | null;
  licence_plate: string | null;
  /** Present only when session is active */
  session: ChargerPanelConnectorSession | null;
  capabilities: ChargerPanelConnectorCapabilities;
}

export interface ChargerPanelPayloadMeta {
  site_id: string;
  charger_id: string;
  charger_alias: string;
  generated_at: string;
  correlation_id: string;
}

export interface ChargerPanelSummary {
  charger_alias: string;
  connectors_total: number;
  connectors_charging: number;
}

export interface ChargerPanel {
  meta: ChargerPanelPayloadMeta;
  summary: ChargerPanelSummary;
  connectors: ChargerPanelConnector[];
  has_active_smart_management: boolean;
}

export interface ChargerPanelApiMeta {
  success: boolean;
  operation: string;
  company_id: string;
  user_id: string;
}

export interface ChargerPanelResponse {
  meta: ChargerPanelApiMeta;
  columns: Array<{
    field: string;
    header: string;
    type: string;
    sortable: boolean;
    filterable: boolean;
  }>;
  payload: ChargerPanel;
  pagination: null;
}
