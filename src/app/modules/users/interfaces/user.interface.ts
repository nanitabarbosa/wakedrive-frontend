export type UserRole = 'DRIVER' | 'SUPERVISOR' | 'ADMIN';
export type RecordStatus = 'ACTIVE' | 'INACTIVE';

export const USER_ROLE_LABELS: Record<string, string> = {
  DRIVER: 'Conductor',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrador',
};

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
  role: UserRole;
  status: RecordStatus;
}

export type UserPayload = Omit<User, 'id'>;

export interface UserFilters {
  search: string;
  role: UserRole | '';
  status: RecordStatus | '';
  page: number;
  size: number;
}
