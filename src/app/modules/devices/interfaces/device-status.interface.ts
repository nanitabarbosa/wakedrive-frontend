export type DeviceConnectionStatus = 'ACTIVE' | 'OFFLINE';

export const DEVICE_CONNECTION_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  OFFLINE: 'Sin conexión',
};

export interface DeviceStatusSummary {
  serial: string;
  vehiclePlate: string | null;
  assignedUser: string | null;
  status: DeviceConnectionStatus;
  lastConnection: string | null;
}

export interface DeviceStatusFilters {
  search: string;
  status: DeviceConnectionStatus | '';
  page: number;
  size: number;
}
