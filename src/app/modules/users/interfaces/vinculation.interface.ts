export interface Vinculation {
  id: number;
  userId: number;
  userName: string;
  vehicleId: number;
  vehiclePlate: string;
  deviceSerial: string;
  linkedAt: string;
}

export interface VinculationPayload {
  userId: number;
  vehicleId: number;
  deviceSerial: string;
}

export interface VinculationFilters {
  search: string;
  page: number;
  size: number;
}

export interface SelectOption {
  id: number;
  label: string;
}
