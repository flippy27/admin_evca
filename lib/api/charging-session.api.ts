/**
 * Charging Sessions API endpoints
 */

import { bffClient } from './client';
import { SessionsListResponse, SessionsRequest } from '../types/charging-session.types';
import { logger } from '../services/logger';

export const chargingSessionApi = {
  /**
   * POST /bff/charging-session/company - List sessions with filters
   */
  list: async (request: SessionsRequest) => {
    logger.info('Fetching charging sessions', {
      page: request.pagination?.page || 1,
      per_page: request.pagination?.per_page || 20,
      location_ids: request.payload?.location_ids,
    });

    try {
      const response = await bffClient.post<SessionsListResponse>(
        '/bff/charging-session/company',
        request
      );

      logger.info('Charging sessions fetched', {
        count: response.data.payload?.length || 0,
        page: response.data.pagination?.page,
        total_pages: response.data.pagination?.total_pages,
      });

      return response;
    } catch (error) {
      logger.error('Failed to fetch charging sessions', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};
