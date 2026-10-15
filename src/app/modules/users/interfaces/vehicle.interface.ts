import { RecordStatus } from './user.interface';

export interface CatalogItem {
  id: number;
  name: string;
}

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  TRUCK: 'Camión',
  TRACTOR_TRAILER: 'Tractomula',
  BUS: 'Bus',
  VAN: 'Camioneta',
};

export function vehicleTypeLabel(name: string): string {
  return VEHICLE_TYPE_LABELS[name] ?? name;
}

export interface Vehicle {
  id: number;
  plate: string;
  brand: CatalogItem;
  model: string;
  year: number;
  type: CatalogItem;
  status: RecordStatus;
}

export interface VehiclePayload {
  plate: string;
  brandId: number;
  model: string;
  year: number;
  vehicleTypeId: number;
  status: RecordStatus;
}

export interface VehicleFilters {
  search: string;
  vehicleTypeId: number | '';
  status: RecordStatus | '';
  page: number;
  size: number;
}
