import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { AlertDetailDrawerComponent } from '../../components/alert-detail-drawer/alert-detail-drawer.component';
import {
  ALERT_LEVEL_LABELS,
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
  imports: [FormsModule, NgSelectComponent, DatePipe, MatIconModule, PageHeaderComponent, TableComponent, AlertDetailDrawerComponent],
  templateUrl: './alert-list.component.html',
})
export class AlertListComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'date', label: 'Fecha' },
    { key: 'time', label: 'Hora' },
    { key: 'userName', label: 'Usuario' },
    { key: 'vehiclePlate', label: 'Vehículo' },
    { key: 'type', label: 'Tipo de alerta' },
    { key: 'level', label: 'Nivel' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly typeLabels = ALERT_TYPE_LABELS;
  readonly levelLabels = ALERT_LEVEL_LABELS;
  readonly levelOptions = Object.entries(ALERT_LEVEL_LABELS);
  readonly today = this.toIsoDate(new Date());

  readonly alerts = signal<Alert[]>([]);
  readonly total = signal(0);
  readonly loadError = signal(false);
  readonly userOptions = signal<FilterOption[]>([]);
  readonly vehicleOptions = signal<FilterOption[]>([]);
  readonly typeOptions = signal<FilterOption[]>([]);

  readonly filters = signal<AlertFilters>({
    from: this.toIsoDate(new Date(Date.now() - (DEFAULT_DAYS - 1) * DAY)),
    to: this.today,
    userId: '',
    vehicleId: '',
    eventTypeId: '',
    level: '',
    page: 1,
    size: 10,
  });
  readonly dateError = signal('');

  readonly drawerOpen = signal(false);
  readonly selectedAlert = signal<Alert | null>(null);

  constructor(private _alertService: AlertService) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAlerts();
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
    this._alertService.getEventTypes().subscribe({
      next: types => this.typeOptions.set(types.map(({ id, name }) => ({ id, label: ALERT_TYPE_LABELS[name] ?? name }))),
      error: () => this.typeOptions.set([]),
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

  onSelectChange(field: 'userId' | 'vehicleId' | 'eventTypeId' | 'level', value: string): void {
    const parsed = field !== 'level' && value ? Number(value) : value;
    this.updateFilters({ [field]: parsed } as Partial<AlertFilters>);
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
