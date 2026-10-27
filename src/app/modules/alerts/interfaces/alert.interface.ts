export type AlertType = 'DROWSINESS' | 'FACE_NOT_DETECTED' | 'DEVICE_OFF' | 'CONNECTION_LOST';
export type AlertLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export const ALERT_TYPE_LABELS: Record<string, string> = {
  DROWSINESS: 'Somnolencia detectada',
  FACE_NOT_DETECTED: 'Rostro no detectado',
  DEVICE_OFF: 'Dispositivo apagado',
  CONNECTION_LOST: 'Pérdida de conexión',
};

export const ALERT_LEVEL_LABELS: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

export interface EventType {
  id: number;
  name: AlertType;
}

export interface Alert {
  id: number;
  date: string;
  userId: number;
  userName: string;
  vehicleId: number;
  vehiclePlate: string;
  deviceSerial: string;
  location: string;
  eventType: EventType;
  durationSeconds: number;
  level: AlertLevel;
}

export interface AlertFilters {
  from: string;
  to: string;
  userId: number | '';
  vehicleId: number | '';
  eventTypeId: number | '';
  level: AlertLevel | '';
  page: number;
  size: number;
}

export interface FilterOption {
  id: number;
  label: string;
}
