/**
 * Sites API endpoints
 */

import { bffClient } from './client';
import { Site, SiteDetail, SitesListResponse, SiteDetailResponse } from '../types/site.types';

export const sitesApi = {
  /**
   * GET /bff/sites - List sites
   * Maps pageSize -> size, siteId -> location_ids (as repeated params)
   */
  list: async (params?: {
    page?: number;
    pageSize?: number;
    siteId?: string | string[];
    companyId?: string;
    search?: string;
  }) => {
    // Build query string manually for repeated location_ids params
    const queryParts: string[] = [];

    queryParts.push(`page=${params?.page || 1}`);
    queryParts.push(`size=${params?.pageSize || 20}`);

    // Add company_id if provided
    if (params?.companyId) {
      queryParts.push(`company_id=${params.companyId}`);
    }

    // Add location_ids as repeated params
    if (params?.siteId) {
      const locationIds = Array.isArray(params.siteId) ? params.siteId : [params.siteId];
      locationIds.forEach((id) => {
        queryParts.push(`location_ids=${id}`);
      });
    }

    if (params?.search) {
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    }

    const queryString = queryParts.join('&');
    const url = `/bff/sites?${queryString}`;

    const response = await bffClient.get<SitesListResponse>(url);
    return response;
  },

  /**
   * GET /bff/sites/:id - Site detail
   */
  detail: (id: string) => bffClient.get<SiteDetailResponse>(`/bff/sites/${id}`),

  /**
   * POST /bff/sites - Create site
   */
  create: (payload: Partial<Site>) => bffClient.post<SiteDetailResponse>('/bff/sites', payload),

  /**
   * PUT /bff/sites/:id - Update site
   */
  update: (id: string, payload: Partial<Site>) =>
    bffClient.put<SiteDetailResponse>(`/bff/sites/${id}`, payload),

  /**
   * DELETE /bff/sites/:id - Delete site
   */
  delete: (id: string) => bffClient.delete(`/bff/sites/${id}`),
};
