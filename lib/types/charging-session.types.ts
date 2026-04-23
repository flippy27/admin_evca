/**
 * Charging Session types
 */

export interface ChargingSession {
  // Session identifiers
  id?: string;
  transaction_id?: string;
  empresas_id?: number;

  // Charger info
  charger_id?: string;
  charger_name?: string;
  ocpp_id?: string;
  charger_status?: string;
  charger_type?: string;
  charger_manufacturer?: string;
  charger_model?: string;

  // Connector info
  connector_id?: string;
  connector_number?: number;
  connector_name?: string;
  connector_alias?: string;
  connector_type?: string;
  connector_electric_type?: string;
  connector_max_voltage?: string;
  connector_max_current?: string;
  connector_max_power?: string;
  connector_status?: string;

  // Location info
  location_id?: string;
  location_name?: string;
  location_address?: string;
  location_city?: string;
  location_country?: string;
  charging_station_name?: string;

  // Session times
  session_start_datetime?: string;
  session_start_time?: string;
  session_stop_datetime?: string;
  session_stop_time?: string;
  session_duration?: string;

  // Meter data
  session_start_meter_energy?: string;
  session_stop_meter_energy?: string;
  delivered_energy?: string;

  // Vehicle & RFID
  license_plate?: string;
  evccid?: string;
  vin?: string;
  external_user_id?: string;
  id_tag_start?: string;
  id_tag_stop?: string;

  // State of charge
  first_soc?: string | number;
  last_soc?: string | number;
  first_energy?: string | number;
  last_energy?: string | number;

  // Power data
  first_power?: string | number;
  last_power?: string | number;
  min_power?: string | number;
  max_power?: string | number;

  // Timestamps
  first_datetime?: string;
  last_datetime?: string;
  start_transaction_inserted_datetime?: string;
  stop_transaction_inserted_datetime?: string;

  // Legacy/mapped fields
  status?: string;
  energy_kwh?: number;
  duration_minutes?: number;
  rfid?: string;
}

export interface ChargingSessionFilters {
  ocpp_id?: string[];
  charger_ids?: string[];
  connector_ids?: string[];
  connector_names?: string[];
  location_ids?: string[];
  license_plates?: string[];
  rfid?: string[];
  session_start_from?: string;
  session_start_to?: string;
  session_stop_from?: string;
  session_stop_to?: string;
  hour_start_from?: string;
  hour_start_to?: string;
  hour_stop_from?: string;
  hour_stop_to?: string;
  soc_start_min?: number;
  soc_start_max?: number;
  soc_end_min?: number;
  soc_end_max?: number;
  energy_min?: number;
  energy_max?: number;
  session_duration_min?: number;
  session_duration_max?: number;
  min_power_min?: number;
  min_power_max?: number;
  max_power_min?: number;
  max_power_max?: number;
  meter_start_min?: number;
  meter_start_max?: number;
  meter_stop_min?: number;
  meter_stop_max?: number;
}

export interface SessionsPayload {
  date_start?: string;
  date_end?: string;
  timezone?: string;
  charger_ids?: string[];
  ocpp_id?: string[];
  connector_ids?: string[];
  location_ids?: string[];
  license_plates?: string[];
}

export interface SessionsRequestMeta {
  operation?: string;
  company_id?: number;
  user_id?: number;
}

export interface SessionsRequest {
  meta?: SessionsRequestMeta;
  payload?: SessionsPayload;
  filters?: ChargingSessionFilters;
  pagination?: {
    page?: number;
    per_page?: number;
  };
  sort?: {
    by?: string;
    order?: 'ASC' | 'DESC';
  };
}

export interface SessionsListResponse {
  payload: ChargingSession[];
  pagination?: {
    current_page?: number;
    page?: number;
    per_page?: number;
    total_items?: number;
    total?: number;
    total_pages?: number;
    has_next?: boolean;
    has_previous?: boolean;
  };
  meta?: {
    success?: boolean;
    operation?: string;
    execution_time_ms?: number;
    correlation_id?: string;
    microservices_called?: string[];
    schemaVersion?: string;
    generatedAt?: string;
  };
}
