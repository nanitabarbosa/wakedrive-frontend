export interface City {
  id: number;
  name: string;
}

export interface AccessRequestPayload {
  companyName: string;
  nit: string;
  cityId: number;
  address: string;
  companyPhone: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}
