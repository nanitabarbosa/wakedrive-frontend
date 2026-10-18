import { RecordStatus } from '../../users/interfaces/user.interface';

export interface CompanySummary {
  id: number;
  name: string;
  deviceCount: number;
}

export interface CompanyDevice {
  id: number;
  serial: string;
  status: RecordStatus;
}

export interface CompanyDeviceCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface CompanyFilters {
  search: string;
  page: number;
  size: number;
}

export interface CompanyDeviceFilters extends CompanyFilters {
  status: RecordStatus | '';
}
