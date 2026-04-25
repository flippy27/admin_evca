/**
 * OCPP Messages types
 * Endpoint: GET /bff/reporting/ocpp-messages
 */

export interface OcppMessage {
  id: string;
  charger_id: string;
  ocpp_id: string;
  timestamp: string;
  message: string;
  origin: string;        // "Cargador" | "Sistema"
  callType: string;      // "Call" | "CallResult" | "CallError"
  rawData: string;       // JSON string
  messageId: string;
}

export interface OcppMessagesParams {
  companyId: number | string;
  siteId: string;
  chargerId: string;
  dateFrom: string;  // YYYY-MM-DD
  dateTo: string;    // YYYY-MM-DD
  page?: number;
  pageSize?: number;
  timezone?: string;
}

export interface OcppMessagesResponse {
  meta: {
    success: boolean;
    execution_time_ms: number;
    correlation_id: string;
    operation: string;
    schemaVersion: string;
    generatedAt: string;
    errors: any[];
    sort?: string;
  };
  columns: Array<{
    key: string;
    label: string;
    type: string;
    sortable: boolean;
    filterable: boolean;
    visible: boolean;
  }>;
  payload: OcppMessage[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
