/**
 * Charging Session types
 */

export interface ChargingSession {
  id?: string;
  session_id?: string;
  charger_id: string;
  ocpp_id?: string;
  connector_id?: string;
  location_id?: string;
  license_plate?: string;
  rfid?: string;
  session_start_datetime?: string;
  session_stop_datetime?: string;
  duration_minutes?: number;
  energy_kwh?: number;
  initial_soc?: number;
  final_soc?: number;
  min_power_kw?: number;
  max_power_kw?: number;
  meter_start?: number;
  meter_stop?: number;
  status?: string;
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

export interface SessionsRequest {
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
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
  };
  meta?: {
    success?: boolean;
    operation?: string;
    execution_time_ms?: number;
  };
}
