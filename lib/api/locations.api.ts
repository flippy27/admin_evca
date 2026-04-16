/**
 * Locations API endpoints
 * Get user's accessible locations (sites)
 */

import { bffClient } from './client';
import { logger } from '../services/logger';

export interface LocationData {
  id: string;
  name: string;
  alias?: string;
  address?: {
    latitude?: string;
    longitude?: string;
    country?: string;
    city?: string;
    street?: string;
  };
  company?: string;
  timezone?: string;
}

export interface LocationsResponse {
  payload: any[];
  meta?: {
    success: boolean;
    execution_time_ms?: number;
    correlation_id?: string;
  };
}

/**
 * Map raw API location data to LocationData type
 */
function mapLocationFromApi(rawLocation: any): LocationData {
  return {
    id: String(rawLocation.location_id),
    name: rawLocation.location_name || rawLocation.location_alias || 'Unknown',
    alias: rawLocation.location_alias,
    address: rawLocation.location_address ? {
      latitude: rawLocation.location_address.location_address_latitude,
      longitude: rawLocation.location_address.location_address_longitude,
      country: rawLocation.location_address.location_address_country,
      city: rawLocation.location_address.location_address_city,
      street: rawLocation.location_address.location_address_street,
    } : undefined,
    company: rawLocation.location_company,
    timezone: rawLocation.location_timezone,
  };
}

export const locationsApi = {
  /**
   * GET /bff/users/{userId}/locations
   * Fetch locations accessible by user for a company
   */
  getUserLocations: async (userId: string, companyId: string) => {
    logger.info('Fetching locations', {
      userId,
      companyId,
      url: `/bff/users/${userId}/locations?companyId=${companyId}&enabled=true`,
    });

    try {
      const response = await bffClient.get<LocationsResponse>(
        `/bff/users/${userId}/locations`,
        {
          params: {
            companyId,
            enabled: true,
          },
        }
      );

      const mappedLocations = response.data.payload?.map(mapLocationFromApi) || [];

      logger.info('Locations fetched successfully', {
        count: mappedLocations.length,
        locations: mappedLocations,
        meta: response.data.meta,
      });

      return {
        ...response,
        data: {
          ...response.data,
          payload: mappedLocations,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch locations', {
        userId,
        companyId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};
