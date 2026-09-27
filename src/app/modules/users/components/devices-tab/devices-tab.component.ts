import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';

import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerMode } from '../../../../shared/components/drawer/interfaces/drawer.interface';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { Device } from '../../interfaces/device.interface';
import { RECORD_STATUS_LABELS, RecordStatus } from '../../interfaces/user.interface';
import { DeviceService } from '../../services/device.service';
import { DeviceDrawerComponent } from '../device-drawer/device-drawer.component';

@Component({
  selector: 'app-devices-tab',
  standalone: true,
  imports: [MatIconModule, TableComponent, DeviceDrawerComponent],
  templateUrl: './devices-tab.component.html',
})
export class DevicesTabComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'index', label: '#' },
    { key: 'serial', label: 'Serial' },
    { key: 'status', label: 'Estado' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly statusLabels = RECORD_STATUS_LABELS;
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly pageSize = 8;

  readonly devices = signal<Device[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loadError = signal(false);

  readonly search = signal('');
  readonly status = signal<RecordStatus | ''>('');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('create');
  readonly selectedDevice = signal<Device | null>(null);

  private readonly _search$ = new Subject<string>();

  constructor(
    private _deviceService: DeviceService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
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
    this._deviceService
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
    this.status.set(status as RecordStatus | '');
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadDevices();
  }

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  openDrawer(mode: DrawerMode, device: Device | null = null): void {
    this.drawerMode.set(mode);
    this.selectedDevice.set(device);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  onSaved(message: string): void {
    this.closeDrawer();
    this._snackBar.open(message, 'Cerrar', { duration: 3000 });
    this.loadDevices();
  }

  confirmDelete(device: Device): void {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Eliminar dispositivo', message: `¿Seguro que deseas eliminar el dispositivo ${device.serial}? Esta acción no se puede deshacer.` },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this._deviceService.deleteDevice(device.id)),
      )
      .subscribe({
        next: () => {
          this._snackBar.open('Dispositivo eliminado', 'Cerrar', { duration: 3000 });
          this.loadDevices();
        },
        error: () => this._snackBar.open('No se pudo eliminar el dispositivo', 'Cerrar', { duration: 4000 }),
      });
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.loadDevices();
  }
}
