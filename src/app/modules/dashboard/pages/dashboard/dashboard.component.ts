import { Component, DestroyRef, OnInit, computed, signal } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import {
  AlertSummary,
  AlertType,
  DailyAlerts,
  DashboardStats,
  DeviceStatus,
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
  readonly periodOptions = [7, 14, 30];
  readonly avatarColors = ['#2f6fed', '#16a34a', '#f59e0b', '#7c5cf5', '#ec4899'];

  readonly stats = signal<DashboardStats | null>(null);
  readonly devices = signal<DeviceSummary[]>([]);
  readonly alerts = signal<AlertSummary[]>([]);
  readonly alertsByDay = signal<DailyAlerts[]>([]);
  readonly topUsers = signal<UserAlertRanking[]>([]);
  readonly errors = signal({ stats: false, devices: false, alerts: false, alertsByDay: false, topUsers: false });

  readonly dateRange = signal({ start: new Date(), end: new Date() });
  readonly deviceSearch = signal('');
  readonly deviceStatus = signal<DeviceStatus | ''>('');
  readonly alertSearch = signal('');
  readonly alertType = signal<AlertType | ''>('');
  readonly chartDays = signal(7);
  readonly rankingDays = signal(7);

  readonly chartMax = computed(() => Math.max(5, Math.ceil(Math.max(0, ...this.alertsByDay().map(d => d.total)) / 5) * 5));
  readonly chartTicks = computed(() => Array.from({ length: this.chartMax() / 5 + 1 }, (_, i) => i * 5));
  readonly rankingMax = computed(() => Math.max(1, ...this.topUsers().map(u => u.total)));

  private readonly _deviceSearch$ = new Subject<string>();
  private readonly _alertSearch$ = new Subject<string>();

  constructor(
    private _dashboardService: DashboardService,
    private _destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listenSearches();
    this.applyDateRange(this.rangePresets[1]);
    this.loadDashboard();
  }

  listenSearches(): void {
    this._deviceSearch$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        this.deviceSearch.set(term);
        this.loadDevices();
      });
    this._alertSearch$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        this.alertSearch.set(term);
        this.loadAlerts();
      });
  }

  setDateRange(preset: DateRangePreset): void {
    this.applyDateRange(preset);
    this.loadStats();
  }

  applyDateRange(preset: DateRangePreset): void {
    const end = new Date();
    this.dateRange.set({ start: new Date(end.getTime() - (preset.days - 1) * DAY), end });
  }

  loadDashboard(): void {
    this.loadStats();
    this.loadDevices();
    this.loadAlerts();
    this.loadAlertsByDay();
    this.loadTopUsers();
  }

  loadStats(): void {
    const { start, end } = this.dateRange();
    this._dashboardService.getStats({ from: this.toIsoDate(start), to: this.toIsoDate(end) }).subscribe({
      next: stats => this.setResult('stats', () => this.stats.set(stats)),
      error: () => this.setError('stats', () => this.stats.set(null)),
    });
  }

  loadDevices(): void {
    this._dashboardService.getDevices({ search: this.deviceSearch(), status: this.deviceStatus(), limit: LIMIT }).subscribe({
      next: devices => this.setResult('devices', () => this.devices.set(devices)),
      error: () => this.setError('devices', () => this.devices.set([])),
    });
  }

  loadAlerts(): void {
    this._dashboardService.getLatestAlerts({ search: this.alertSearch(), type: this.alertType(), limit: LIMIT }).subscribe({
      next: alerts => this.setResult('alerts', () => this.alerts.set(alerts)),
      error: () => this.setError('alerts', () => this.alerts.set([])),
    });
  }

  loadAlertsByDay(): void {
    this._dashboardService.getAlertsByDay(this.chartDays()).subscribe({
      next: data => this.setResult('alertsByDay', () => this.alertsByDay.set(data)),
      error: () => this.setError('alertsByDay', () => this.alertsByDay.set([])),
    });
  }

  loadTopUsers(): void {
    this._dashboardService.getTopUsers(this.rankingDays(), LIMIT).subscribe({
      next: users => this.setResult('topUsers', () => this.topUsers.set(users)),
      error: () => this.setError('topUsers', () => this.topUsers.set([])),
    });
  }

  onDeviceSearch(term: string): void {
    this._deviceSearch$.next(term.trim());
  }

  onDeviceStatusChange(status: string): void {
    this.deviceStatus.set(status as DeviceStatus | '');
    this.loadDevices();
  }

  onAlertSearch(term: string): void {
    this._alertSearch$.next(term.trim());
  }

  onAlertTypeChange(type: string): void {
    this.alertType.set(type as AlertType | '');
    this.loadAlerts();
  }

  onChartDaysChange(days: string): void {
    this.chartDays.set(Number(days));
    this.loadAlertsByDay();
  }

  onRankingDaysChange(days: string): void {
    this.rankingDays.set(Number(days));
    this.loadTopUsers();
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

  private toIsoDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }
}
