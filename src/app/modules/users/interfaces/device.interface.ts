import { RecordStatus } from './user.interface';

export interface Device {
  id: number;
  serial: string;
  status: RecordStatus;
}

export type DevicePayload = Omit<Device, 'id'>;

export interface DeviceFilters {
  search: string;
  status: RecordStatus | '';
  page: number;
  size: number;
}
