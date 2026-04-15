/**
 * Sites API endpoints
 */

import { bffClient } from './client';
import { Site, SiteDetail, SitesListResponse, SiteDetailResponse } from '../types/site.types';

export const sitesApi = {
  /**
   * GET /bff/sites - List sites
   */
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    bffClient.get<SitesListResponse>('/bff/sites', { params }),

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
