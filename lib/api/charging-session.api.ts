/**
 * Charging Sessions API endpoints
 */

import moment from 'moment'
import { logger } from '../services/logger'
import { useAuthStore } from '../stores/auth.store'
import {
  SessionsListResponse,
  SessionsRequest,
} from '../types/charging-session.types'
import { bffClient } from './client'

// Helper: format date to start of day (00:00:00)
const getStartOfDay = (date: Date): string => {
  return moment(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss')
}

// Helper: format date to end of day (23:59:59)
const getEndOfDay = (date: Date): string => {
  return moment(date).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
}

export const chargingSessionApi = {
  /**
   * POST /bff/charging-session/company - List sessions with filters
   */
  list: async (request: SessionsRequest) => {
    const { user } = useAuthStore.getState()
    
    const companyId = user?.companyExternalId || 0
    if (companyId === 0) {
      logger.error(
        'User has no companyExternalId, defaulting to 0 FIX THIS, WONT WORK!!!',
        { userId: user?.userId },
      )
    }

    // Build full request with meta, payload, pagination
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const fullRequest = {
      meta: {
        operation: 'read',
        company_id: parseInt(companyId.toString()),
        user_id: 1,
        ...request.meta,
      },
      payload: {
        date_start: request.payload?.date_start || getStartOfDay(sevenDaysAgo),
        date_end: request.payload?.date_end || getEndOfDay(today),
        timezone: request.payload?.timezone || 'America/Santiago',
        ...request.payload,
      },
      pagination: {
        page: request.pagination?.page || 1,
        per_page: request.pagination?.per_page || 20,
      },
      ...(request.filters && { filters: request.filters }),
      ...(request.sort && { sort: request.sort }),
    }

    logger.info('Fetching charging sessions', {
      company_id: companyId,
      page: fullRequest.pagination.page,
      per_page: fullRequest.pagination.per_page,
      location_ids: fullRequest.payload.location_ids,
      date_start: fullRequest.payload.date_start,
      date_end: fullRequest.payload.date_end,
    })

    try {
      const response = await bffClient.post<SessionsListResponse>(
        '/bff/charging-session/company',
        fullRequest,
      )
      logger.info('Charging sessions fetched', {
        count: response.data.payload?.length || 0,
        current_page: response.data.pagination?.current_page,
        total_items: response.data.pagination?.total_items,
        total_pages: response.data.pagination?.total_pages,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch charging sessions', {
        error: error instanceof Error ? error.message : String(error),
        company_id: companyId,
      })
      throw error
    }
  },
}
