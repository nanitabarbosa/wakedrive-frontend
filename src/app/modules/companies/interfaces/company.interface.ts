export interface CompanySummary {
  id: number;
  name: string;
  deviceCount: number;
}

export interface CompanyDevice {
  id: number;
  serial: string;
}

export interface CompanyFilters {
  search: string;
  page: number;
  size: number;
}
