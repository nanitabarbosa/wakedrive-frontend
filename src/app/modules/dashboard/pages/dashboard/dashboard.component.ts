import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import {
  AlertSummary,
  DailyAlerts,
  DashboardStats,
  DeviceSummary,
  UserAlertRanking,
} from '../../interfaces/dashboard.interface';
import { DashboardService } from '../../services/dashboard.service';

interface DateRangePreset {
  label: string;
  days: number;
}

const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 5;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIconModule, MatMenuModule, TimeAgoPipe, PageHeaderComponent, TableComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly deviceColumns: TableColumn[] = [
    { key: 'serial', label: 'Serial' },
    { key: 'vehiclePlate', label: 'Vehículo' },
    { key: 'assignedUser', label: 'Usuario asignado' },
    { key: 'status', label: 'Estado' },
    { key: 'lastConnection', label: 'Última conexión' },
  ];
  readonly alertColumns: TableColumn[] = [
    { key: 'date', label: 'Fecha' },
    { key: 'time', label: 'Hora' },
    { key: 'user', label: 'Usuario' },
    { key: 'vehiclePlate', label: 'Vehículo' },
    { key: 'location', label: 'Ubicación' },
    { key: 'type', label: 'Tipo de alerta' },
    { key: 'durationSeconds', label: 'Duración' },
    { key: 'level', label: 'Nivel' },
  ];

  readonly deviceStatusLabels: Record<string, string> = {
    ACTIVE: 'Activo',
    OFFLINE: 'Sin conexión',
  };
  readonly alertTypeLabels: Record<string, string> = {
    DROWSINESS: 'Somnolencia detectada',
    FACE_NOT_DETECTED: 'Rostro no detectado',
    DEVICE_OFF: 'Dispositivo apagado',
    CONNECTION_LOST: 'Pérdida de conexión',
  };
  readonly alertLevelLabels: Record<string, string> = {
    HIGH: 'Alta',
    MEDIUM: 'Media',
  };
  readonly rangePresets: DateRangePreset[] = [
    { label: 'Hoy', days: 1 },
    { label: 'Últimos 7 días', days: 7 },
    { label: 'Últimos 30 días', days: 30 },
  ];

  readonly stats = signal<DashboardStats | null>(null);
  readonly devices = signal<DeviceSummary[]>([]);
  readonly alerts = signal<AlertSummary[]>([]);
  readonly alertsByDay = signal<DailyAlerts[]>([]);
  readonly topUsers = signal<UserAlertRanking[]>([]);
  readonly errors = signal({ stats: false, devices: false, alerts: false, alertsByDay: false, topUsers: false });

  readonly dateRange = signal({ start: new Date(), end: new Date() });
  readonly rangeDays = signal(7);

  readonly chartMax = computed(() => Math.max(5, Math.ceil(Math.max(0, ...this.alertsByDay().map(d => d.total)) / 5) * 5));
  readonly chartTicks = computed(() => Array.from({ length: this.chartMax() / 5 + 1 }, (_, i) => i * 5));
  readonly rankingMax = computed(() => Math.max(1, ...this.topUsers().map(u => u.total)));

  constructor(private _dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.applyDateRange(this.rangePresets[1]);
    this.loadDashboard();
  }

  setDateRange(preset: DateRangePreset): void {
    this.applyDateRange(preset);
    this.loadDashboard();
  }

  applyDateRange(preset: DateRangePreset): void {
    const end = new Date();
    this.dateRange.set({ start: new Date(end.getTime() - (preset.days - 1) * DAY), end });
    this.rangeDays.set(preset.days);
  }

  loadDashboard(): void {
    this.loadStats();
    this.loadDevices();
    this.loadAlerts();
    this.loadAlertsByDay();
    this.loadTopUsers();
  }

  loadStats(): void {
    this._dashboardService.getStats(this.isoRange()).subscribe({
      next: stats => this.setResult('stats', () => this.stats.set(stats)),
      error: () => this.setError('stats', () => this.stats.set(null)),
    });
  }

  loadDevices(): void {
    this._dashboardService.getDevices({ ...this.isoRange(), limit: LIMIT }).subscribe({
      next: devices => this.setResult('devices', () => this.devices.set(devices)),
      error: () => this.setError('devices', () => this.devices.set([])),
    });
  }

  loadAlerts(): void {
    this._dashboardService.getLatestAlerts({ ...this.isoRange(), limit: LIMIT }).subscribe({
      next: alerts => this.setResult('alerts', () => this.alerts.set(alerts)),
      error: () => this.setError('alerts', () => this.alerts.set([])),
    });
  }

  loadAlertsByDay(): void {
    this._dashboardService.getAlertsByDay({ ...this.isoRange(), days: this.rangeDays() }).subscribe({
      next: data => this.setResult('alertsByDay', () => this.alertsByDay.set(data)),
      error: () => this.setError('alertsByDay', () => this.alertsByDay.set([])),
    });
  }

  loadTopUsers(): void {
    this._dashboardService.getTopUsers({ ...this.isoRange(), days: this.rangeDays(), limit: LIMIT }).subscribe({
      next: users => this.setResult('topUsers', () => this.topUsers.set(users)),
      error: () => this.setError('topUsers', () => this.topUsers.set([])),
    });
  }

  initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private setResult(block: keyof ReturnType<typeof this.errors>, apply: () => void): void {
    apply();
    this.errors.update(errors => ({ ...errors, [block]: false }));
  }

  private setError(block: keyof ReturnType<typeof this.errors>, apply: () => void): void {
    apply();
    this.errors.update(errors => ({ ...errors, [block]: true }));
  }

  private isoRange(): { from: string; to: string } {
    const { start, end } = this.dateRange();
    return { from: this.toIsoDate(start), to: this.toIsoDate(end) };
  }

  private toIsoDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }
}
