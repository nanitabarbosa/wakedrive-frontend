export interface StoredFile {
  name: string;
  size: number;
  url: string;
}

export interface CompanySettings {
  faceRecognitionAlways: boolean;
  notifyDeviceShutdown: boolean;
  alarmDurationSeconds: number;
  alarmSound: StoredFile | null;
  companyName: string;
  nit: string;
  address: string;
  phone: string;
  logo: StoredFile | null;
}

export interface SettingsPayload {
  faceRecognitionAlways: boolean;
  notifyDeviceShutdown: boolean;
  alarmDurationSeconds: number;
  companyName: string;
  nit: string;
  address: string;
  phone: string;
  removeAlarmSound: boolean;
  removeLogo: boolean;
}

export interface FileRules {
  kind: 'audio' | 'image';
  accept: string;
  extensions: string[];
  mimeTypes: string[];
  maxSizeMb: number;
  label: string;
}

export const ALARM_SOUND_RULES: FileRules = {
  kind: 'audio',
  accept: '.mp3,audio/mpeg',
  extensions: ['mp3'],
  mimeTypes: ['audio/mpeg', 'audio/mp3'],
  maxSizeMb: 5,
  label: 'MP3',
};

export const LOGO_RULES: FileRules = {
  kind: 'image',
  accept: '.png,.jpg,.jpeg,image/png,image/jpeg',
  extensions: ['png', 'jpg', 'jpeg'],
  mimeTypes: ['image/png', 'image/jpeg'],
  maxSizeMb: 2,
  label: 'PNG o JPG',
};
