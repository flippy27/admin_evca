/**
 * Site domain types
 */

export interface Site {
  id: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  chargerCount: number;
  totalPower?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteDetail extends Site {
  chargers?: any[];
  energyUsage?: EnergyUsage;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface EnergyUsage {
  today: number;
  week: number;
  month: number;
  year: number;
}

export interface SitesListResponse {
  payload: any[];
  pagination?: {
    current_page?: number;
    page?: number;
    per_page?: string | number;
    pageSize?: number;
    total_items?: number;
    totalItems?: number;
    total_pages?: number;
    totalPages?: number;
  };
}

export interface SiteDetailResponse {
  data: SiteDetail;
}
