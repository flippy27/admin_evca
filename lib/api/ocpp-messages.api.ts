/**
 * OCPP Messages API
 * GET /bff/reporting/ocpp-messages
 */

import {
  OcppMessagesParams,
  OcppMessagesResponse,
} from '../types/ocpp-messages.types'
import { bffClient } from './client'

export const ocppMessagesApi = {
  list: (params: OcppMessagesParams) =>
    bffClient.get<OcppMessagesResponse>('/bff/reporting/ocpp-messages', {
      params: {
        companyId: params.companyId,
        siteId: params.siteId,
        chargerId: params.chargerId,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 30,
        timezone: params.timezone ?? 'America/Santiago',
      },
    }),
}
