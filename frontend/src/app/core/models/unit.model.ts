export interface Unit {
  id: string;
  title: string;
  description?: string;
  type: UnitType;
  status: UnitStatus;
  furnishingStatus: UnitFurnishingStatus;
  price: number;
  rentPrice?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  buildingName?: string;
  location?: string;
  city: string;
  country: string;
  amenities: string[];
  yearBuilt?: number;
  images: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UnitType = 'APARTMENT' | 'VILLA' | 'COMMERCIAL' | 'OFFICE' | 'WAREHOUSE' | 'LAND' | 'PENTHOUSE' | 'STUDIO';
export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'RENTED' | 'UNDER_MAINTENANCE';
export type UnitFurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';

export interface UnitFeature {
  id: string;
  unitId: string;
  name: string;
  value?: string;
}

export interface CreateUnitRequest {
  title: string;
  description?: string;
  type: UnitType;
  furnishingStatus?: UnitFurnishingStatus;
  price: number;
  rentPrice?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  buildingName?: string;
  location?: string;
  city: string;
  country?: string;
  amenities?: string[];
  yearBuilt?: number;
  images?: string[];
  notes?: string;
}

export interface UpdateUnitRequest extends Partial<CreateUnitRequest> {
  status?: UnitStatus;
}

export interface UnitFilter {
  type?: UnitType;
  status?: UnitStatus;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}