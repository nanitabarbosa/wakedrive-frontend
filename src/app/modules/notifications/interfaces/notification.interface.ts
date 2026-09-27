export type NotificationType = 'DEVICE_OFF' | 'DEVICE_ONLINE' | 'DROWSINESS' | 'VINCULATION_CREATED' | 'USER_REGISTERED';

export type NotificationFilter = 'ALL' | 'UNREAD';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationCounts {
  total: number;
  unread: number;
}

export interface NotificationQuery {
  unread: boolean | '';
  page: number;
  size: number;
}

export interface NotificationStyle {
  icon: string;
  variant: 'danger' | 'warning' | 'success' | 'neutral';
}

export const NOTIFICATION_STYLES: Record<string, NotificationStyle> = {
  DEVICE_OFF: { icon: 'phonelink_off', variant: 'danger' },
  DROWSINESS: { icon: 'warning', variant: 'warning' },
  VINCULATION_CREATED: { icon: 'link', variant: 'success' },
  USER_REGISTERED: { icon: 'info', variant: 'neutral' },
  DEVICE_ONLINE: { icon: 'tablet_android', variant: 'neutral' },
};
