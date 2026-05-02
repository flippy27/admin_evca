/**
 * Energy Variables API — connector historical data (last 30 min)
 * POST /bff/energy-variables/search-by-connector
 */

import { useAuthStore } from '../stores/auth.store';
import { bffClient } from './client';

export interface EnergyVariablePoint {
  datetime: string;
  value: string;
  transaction: string;
}

export interface EnergyVariablesResponse {
  payload: {
    connector_id: string;
    variable_type: string;
    data: EnergyVariablePoint[];
    date_start: string;
    date_end: string;
    timezone: string;
    total_points: number;
  };
}

function fmtLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export const energyVariablesApi = {
  searchByConnector: (connectorId: string, variableType: string) => {
    const { user } = useAuthStore.getState();
    const now = new Date();
    const start = new Date(now.getTime() - 30 * 60 * 1000);

    return bffClient.post<EnergyVariablesResponse>('/bff/energy-variables/search-by-connector', {
      meta: {
        operation: 'read',
        company_id: Number(user?.companyExternalId ?? 0),
        user_id: 1,
      },
      payload: {
        connector_id: connectorId,
        date_start: fmtLocal(start),
        date_end: fmtLocal(now),
        variable_type: variableType,
        timezone: 'America/Santiago',
      },
    });
  },
};
