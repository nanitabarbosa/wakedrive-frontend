import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { AlertDetailDrawerComponent } from '../../components/alert-detail-drawer/alert-detail-drawer.component';
import {
  ALERT_LEVEL_LABELS,
  ALERT_TYPE_ICONS,
  ALERT_TYPE_LABELS,
  Alert,
  AlertFilters,
  FilterOption,
} from '../../interfaces/alert.interface';
import { AlertService } from '../../services/alert.service';

const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_DAYS = 7;

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [DatePipe, MatIconModule, PageHeaderComponent, TableComponent, AlertDetailDrawerComponent],
  templateUrl: './alert-list.component.html',
})
export class AlertListComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'date', label: 'Fecha' },
    { key: 'time', label: 'Hora' },
    { key: 'userName', label: 'Usuario' },
    { key: 'vehiclePlate', label: 'Vehículo' },
    { key: 'location', label: 'Ubicación' },
    { key: 'type', label: 'Tipo de alerta' },
    { key: 'durationSeconds', label: 'Duración' },
    { key: 'level', label: 'Nivel' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly typeLabels = ALERT_TYPE_LABELS;
  readonly typeIcons = ALERT_TYPE_ICONS;
  readonly levelLabels = ALERT_LEVEL_LABELS;
  readonly typeOptions = Object.entries(ALERT_TYPE_LABELS);
  readonly levelOptions = Object.entries(ALERT_LEVEL_LABELS);
  readonly today = this.toIsoDate(new Date());

  readonly alerts = signal<Alert[]>([]);
  readonly total = signal(0);
  readonly loadError = signal(false);
  readonly userOptions = signal<FilterOption[]>([]);
  readonly vehicleOptions = signal<FilterOption[]>([]);

  readonly filters = signal<AlertFilters>({
    from: this.toIsoDate(new Date(Date.now() - (DEFAULT_DAYS - 1) * DAY)),
    to: this.today,
    userId: '',
    vehicleId: '',
    type: '',
    level: '',
    location: '',
    page: 1,
    size: 10,
  });
  readonly dateError = signal('');

  readonly drawerOpen = signal(false);
  readonly selectedAlert = signal<Alert | null>(null);

  private readonly _location$ = new Subject<string>();

  constructor(
    private _alertService: AlertService,
    private _destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listenLocationSearch();
    this.loadFilterOptions();
    this.loadAlerts();
  }

  listenLocationSearch(): void {
    this._location$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(location => this.updateFilters({ location }));
  }

  loadFilterOptions(): void {
    this._alertService.getUserOptions().subscribe({
      next: options => this.userOptions.set(options),
      error: () => this.userOptions.set([]),
    });
    this._alertService.getVehicleOptions().subscribe({
      next: options => this.vehicleOptions.set(options),
      error: () => this.vehicleOptions.set([]),
    });
  }

  loadAlerts(): void {
    this.loadError.set(false);
    this._alertService.getAlerts(this.filters()).subscribe({
      next: response => {
        this.alerts.set(response.content);
        this.total.set(response.page.totalElements);
      },
      error: () => {
        this.alerts.set([]);
        this.total.set(0);
        this.loadError.set(true);
      },
    });
  }

  onDateChange(field: 'from' | 'to', value: string): void {
    const next = { ...this.filters(), [field]: value };
    if (!next.from || !next.to || next.from > next.to) {
      this.dateError.set('La fecha de inicio debe ser anterior o igual a la fecha fin.');
      return;
    }
    this.dateError.set('');
    this.updateFilters({ [field]: value });
  }

  onSelectChange(field: 'userId' | 'vehicleId' | 'type' | 'level', value: string): void {
    const parsed = (field === 'userId' || field === 'vehicleId') && value ? Number(value) : value;
    this.updateFilters({ [field]: parsed } as Partial<AlertFilters>);
  }

  onLocationSearch(term: string): void {
    this._location$.next(term.trim());
  }

  onPageChange(page: number): void {
    this.filters.update(filters => ({ ...filters, page }));
    this.loadAlerts();
  }

  openDetail(alert: Alert): void {
    this.selectedAlert.set(alert);
    this.drawerOpen.set(true);
  }

  closeDetail(): void {
    this.drawerOpen.set(false);
  }

  private updateFilters(changes: Partial<AlertFilters>): void {
    this.filters.update(filters => ({ ...filters, ...changes, page: 1 }));
    this.loadAlerts();
  }

  private toIsoDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }
}
