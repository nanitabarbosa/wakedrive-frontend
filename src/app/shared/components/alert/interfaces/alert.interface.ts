export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertData {
  type: AlertType;
  message: string;
}
