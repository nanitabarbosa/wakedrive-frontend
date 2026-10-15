import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import {
  DEVICE_CONNECTION_LABELS,
  DeviceConnectionStatus,
  DeviceStatusSummary,
} from '../../interfaces/device-status.interface';
import { DeviceStatusService } from '../../services/device-status.service';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [FormsModule, NgSelectComponent, MatIconModule, PageHeaderComponent, TableComponent, TimeAgoPipe],
  templateUrl: './device-list.component.html',
})
export class DeviceListComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'index', label: '#' },
    { key: 'serial', label: 'Serial' },
    { key: 'vehiclePlate', label: 'Placa' },
    { key: 'assignedUser', label: 'Usuario asignado' },
    { key: 'status', label: 'Estado' },
    { key: 'lastConnection', label: 'Última conexión' },
  ];
  readonly statusLabels = DEVICE_CONNECTION_LABELS;
  readonly statusOptions = Object.entries(DEVICE_CONNECTION_LABELS);
  readonly pageSize = 10;

  readonly devices = signal<DeviceStatusSummary[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loadError = signal(false);

  readonly search = signal('');
  readonly status = signal<DeviceConnectionStatus | ''>('');

  private readonly _search$ = new Subject<string>();

  constructor(
    private _deviceStatusService: DeviceStatusService,
    private _destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listenSearch();
    this.loadDevices();
  }

  listenSearch(): void {
    this._search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        this.search.set(term);
        this.resetAndLoad();
      });
  }

  loadDevices(): void {
    this.loadError.set(false);
    this._deviceStatusService
      .getDevices({ search: this.search(), status: this.status(), page: this.page(), size: this.pageSize })
      .subscribe({
        next: response => {
          this.devices.set(response.content);
          this.total.set(response.page.totalElements);
        },
        error: () => {
          this.devices.set([]);
          this.total.set(0);
          this.loadError.set(true);
        },
      });
  }

  onSearch(term: string): void {
    this._search$.next(term.trim());
  }

  onStatusChange(status: string): void {
    this.status.set(status as DeviceConnectionStatus | '');
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadDevices();
  }

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.loadDevices();
  }
}
