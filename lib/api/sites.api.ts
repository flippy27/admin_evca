/**
 * Sites API endpoints
 */

import { bffClient } from './client';
import { Site, SiteDetail, SitesListResponse, SiteDetailResponse } from '../types/site.types';

export const sitesApi = {
  /**
   * GET /api/sites - List sites
   */
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    bffClient.get<SitesListResponse>('/api/sites', { params }),

  /**
   * GET /api/sites/:id - Site detail
   */
  detail: (id: string) => bffClient.get<SiteDetailResponse>(`/api/sites/${id}`),

  /**
   * POST /api/sites - Create site
   */
  create: (payload: Partial<Site>) => bffClient.post<SiteDetailResponse>('/api/sites', payload),

  /**
   * PUT /api/sites/:id - Update site
   */
  update: (id: string, payload: Partial<Site>) =>
    bffClient.put<SiteDetailResponse>(`/api/sites/${id}`, payload),

  /**
   * DELETE /api/sites/:id - Delete site
   */
  delete: (id: string) => bffClient.delete(`/api/sites/${id}`),
};
