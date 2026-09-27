export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';

export const ACCESS_REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  INACTIVE: 'Inactiva',
};

export const ACCESS_REQUEST_STATUS_MESSAGES: Record<string, string> = {
  PENDING: 'Esta solicitud está en revisión por el Super Admin.',
  APPROVED: 'La empresa fue aprobada y ya puede ingresar a WakeDrive.',
  REJECTED: 'La solicitud fue rechazada por el Super Admin.',
  INACTIVE: 'La empresa fue aprobada, pero actualmente está inactiva.',
};

export const ACCESS_REQUEST_STATUS_ICONS: Record<string, string> = {
  PENDING: 'schedule',
  APPROVED: 'check_circle',
  REJECTED: 'cancel',
  INACTIVE: 'block',
};

export interface AccessRequest {
  id: number;
  companyName: string;
  nit: string;
  country: string;
  city: string;
  address: string;
  companyPhone: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  status: AccessRequestStatus;
  createdAt: string;
}

export interface AccessRequestCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inactive: number;
}

export interface AccessRequestFilters {
  status: AccessRequestStatus | '';
  page: number;
  size: number;
}
