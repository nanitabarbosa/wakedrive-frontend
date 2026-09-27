import { RecordStatus } from './user.interface';

export type VehicleType = 'TRUCK' | 'TRACTOR_TRAILER' | 'BUS' | 'VAN';

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  TRUCK: 'Camión',
  TRACTOR_TRAILER: 'Tractomula',
  BUS: 'Bus',
  VAN: 'Camioneta',
};

export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  status: RecordStatus;
}

export type VehiclePayload = Omit<Vehicle, 'id'>;

export interface VehicleFilters {
  search: string;
  type: VehicleType | '';
  status: RecordStatus | '';
  page: number;
  size: number;
}
