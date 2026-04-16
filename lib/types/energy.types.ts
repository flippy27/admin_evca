/**
 * Energy Resources domain types
 */

export interface EnergyResource {
  id: string;
  name: string;
  type: 'solar' | 'wind' | 'grid' | 'battery' | 'other';
  description?: string;
  capacity?: number; // kW
  currentOutput?: number; // kW
  status: 'active' | 'inactive' | 'maintenance';
  location?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EnergyResourcesListResponse {
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

export interface EnergyResourceDetailResponse {
  data: EnergyResource;
}
