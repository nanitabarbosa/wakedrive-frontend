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
import { RECORD_STATUS_LABELS, RecordStatus } from '../../interfaces/user.interface';
import { VEHICLE_TYPE_LABELS, Vehicle, VehicleType } from '../../interfaces/vehicle.interface';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleDrawerComponent } from '../vehicle-drawer/vehicle-drawer.component';

@Component({
  selector: 'app-vehicles-tab',
  standalone: true,
  imports: [MatIconModule, TableComponent, VehicleDrawerComponent],
  templateUrl: './vehicles-tab.component.html',
})
export class VehiclesTabComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'index', label: '#' },
    { key: 'plate', label: 'Placa' },
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'year', label: 'Año' },
    { key: 'type', label: 'Tipo' },
    { key: 'status', label: 'Estado' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly typeLabels = VEHICLE_TYPE_LABELS;
  readonly statusLabels = RECORD_STATUS_LABELS;
  readonly typeOptions = Object.entries(VEHICLE_TYPE_LABELS);
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly pageSize = 8;

  readonly vehicles = signal<Vehicle[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loadError = signal(false);

  readonly search = signal('');
  readonly type = signal<VehicleType | ''>('');
  readonly status = signal<RecordStatus | ''>('');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('create');
  readonly selectedVehicle = signal<Vehicle | null>(null);

  private readonly _search$ = new Subject<string>();

  constructor(
    private _vehicleService: VehicleService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listenSearch();
    this.loadVehicles();
  }

  listenSearch(): void {
    this._search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        this.search.set(term);
        this.resetAndLoad();
      });
  }

  loadVehicles(): void {
    this.loadError.set(false);
    this._vehicleService
      .getVehicles({ search: this.search(), type: this.type(), status: this.status(), page: this.page(), size: this.pageSize })
      .subscribe({
        next: response => {
          this.vehicles.set(response.content);
          this.total.set(response.page.totalElements);
        },
        error: () => {
          this.vehicles.set([]);
          this.total.set(0);
          this.loadError.set(true);
        },
      });
  }

  onSearch(term: string): void {
    this._search$.next(term.trim());
  }

  onTypeChange(type: string): void {
    this.type.set(type as VehicleType | '');
    this.resetAndLoad();
  }

  onStatusChange(status: string): void {
    this.status.set(status as RecordStatus | '');
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadVehicles();
  }

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  openDrawer(mode: DrawerMode, vehicle: Vehicle | null = null): void {
    this.drawerMode.set(mode);
    this.selectedVehicle.set(vehicle);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  onSaved(message: string): void {
    this.closeDrawer();
    this._snackBar.open(message, 'Cerrar', { duration: 3000 });
    this.loadVehicles();
  }

  confirmDelete(vehicle: Vehicle): void {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Eliminar vehículo', message: `¿Seguro que deseas eliminar el vehículo ${vehicle.plate}? Esta acción no se puede deshacer.` },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this._vehicleService.deleteVehicle(vehicle.id)),
      )
      .subscribe({
        next: () => {
          this._snackBar.open('Vehículo eliminado', 'Cerrar', { duration: 3000 });
          this.loadVehicles();
        },
        error: () => this._snackBar.open('No se pudo eliminar el vehículo', 'Cerrar', { duration: 4000 }),
      });
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.loadVehicles();
  }
}
