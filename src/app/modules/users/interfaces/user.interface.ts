export type RecordStatus = 'ACTIVE' | 'INACTIVE';

export const RECORD_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export interface User {
  id: number;
  fullName: string;
  document: string;
  email: string;
  phone: string | null;
  status: RecordStatus;
}

export type UserPayload = Omit<User, 'id'>;

export interface UserFilters {
  search: string;
  status: RecordStatus | '';
  page: number;
  size: number;
}
