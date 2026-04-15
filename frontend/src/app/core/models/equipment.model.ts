export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  purchaseDate?: string;
  purchasePrice?: number;
  dailyRentalRate?: number;
  location?: string;
  notes?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentCategory = 'heavy_machinery' | 'power_tools' | 'safety_equipment' | 'vehicles' | 'scaffolding' | 'other';
export type EquipmentStatus = 'available' | 'rented' | 'maintenance' | 'out_of_service';

export interface EquipmentRental {
  id: string;
  equipmentId: string;
  projectId?: string;
  renterName: string;
  renterPhone?: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalCost: number;
  status: RentalStatus;
  returnedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus = 'active' | 'returned' | 'overdue' | 'cancelled';

export interface CreateEquipmentRequest {
  name: string;
  serialNumber: string;
  category: EquipmentCategory;
  purchaseDate?: string;
  purchasePrice?: number;
  dailyRentalRate?: number;
  location?: string;
  notes?: string;
  image?: string;
}

export interface CreateRentalRequest {
  equipmentId: string;
  projectId?: string;
  renterName: string;
  renterPhone?: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface EquipmentQueryParams {
  page?: number;
  limit?: number;
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  search?: string;
}

export interface RentalQueryParams {
  page?: number;
  limit?: number;
  equipmentId?: string;
  projectId?: string;
  status?: RentalStatus;
}

export interface PaginatedEquipment {
  data: Equipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedRentals {
  data: EquipmentRental[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}