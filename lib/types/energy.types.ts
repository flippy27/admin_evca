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
  data: EnergyResource[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface EnergyResourceDetailResponse {
  data: EnergyResource;
}
