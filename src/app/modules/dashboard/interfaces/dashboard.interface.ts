export type DeviceStatus = 'ACTIVE' | 'OFFLINE';
export type AlertType = 'DROWSINESS' | 'FACE_NOT_DETECTED' | 'DEVICE_OFF' | 'CONNECTION_LOST';
export type AlertLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TrendStat {
  total: number;
  variation: number;
}

export interface DashboardStats {
  vehicles: TrendStat;
  activeUsers: TrendStat;
  devices: { total: number; active: number; offline: number };
  alertsToday: TrendStat;
}

export interface DeviceSummary {
  serial: string;
  vehiclePlate: string;
  assignedUser: string;
  status: DeviceStatus;
  lastConnection: string;
}

export interface AlertSummary {
  id: number;
  date: string;
  user: string;
  vehiclePlate: string;
  location: string;
  eventType: { id: number; name: AlertType };
  durationSeconds: number;
  level: AlertLevel;
}

export interface DailyAlerts {
  date: string;
  total: number;
}

export interface UserAlertRanking {
  userId: number;
  name: string;
  total: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface DeviceFilters extends DateRange {
  limit: number;
}

export interface AlertFilters extends DateRange {
  limit: number;
}

export interface DailyAlertsFilters extends DateRange {
  days: number;
}

export interface TopUsersFilters extends DailyAlertsFilters {
  limit: number;
}
