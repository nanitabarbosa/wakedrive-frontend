import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';

import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { Vinculation } from '../../interfaces/vinculation.interface';
import { VinculationService } from '../../services/vinculation.service';
import { VinculationDrawerComponent } from '../vinculation-drawer/vinculation-drawer.component';

@Component({
  selector: 'app-vinculations-tab',
  standalone: true,
  imports: [DatePipe, MatIconModule, TableComponent, InitialsPipe, VinculationDrawerComponent],
  templateUrl: './vinculations-tab.component.html',
})
export class VinculationsTabComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'index', label: '#' },
    { key: 'userName', label: 'Conductor' },
    { key: 'vehiclePlate', label: 'Vehículo' },
    { key: 'deviceSerial', label: 'Dispositivo' },
    { key: 'linkedAt', label: 'Vinculado desde' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly avatarColors = ['#2f6fed', '#16a34a', '#f59e0b', '#7c5cf5', '#ec4899', '#14b8a6'];
  readonly pageSize = 8;

  readonly vinculations = signal<Vinculation[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loadError = signal(false);
  readonly search = signal('');
  readonly drawerOpen = signal(false);

  private readonly _search$ = new Subject<string>();

  constructor(
    private _vinculationService: VinculationService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listenSearch();
    this.loadVinculations();
  }

  listenSearch(): void {
    this._search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        this.search.set(term);
        this.page.set(1);
        this.loadVinculations();
      });
  }

  loadVinculations(): void {
    this.loadError.set(false);
    this._vinculationService.getVinculations({ search: this.search(), page: this.page(), size: this.pageSize }).subscribe({
      next: response => {
        this.vinculations.set(response.content);
        this.total.set(response.page.totalElements);
      },
      error: () => {
        this.vinculations.set([]);
        this.total.set(0);
        this.loadError.set(true);
      },
    });
  }

  onSearch(term: string): void {
    this._search$.next(term.trim());
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadVinculations();
  }

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  onSaved(message: string): void {
    this.closeDrawer();
    this._snackBar.open(message, 'Cerrar', { duration: 3000 });
    this.loadVinculations();
  }

  confirmUnlink(vinculation: Vinculation): void {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Desvincular',
          message: `¿Seguro que deseas desvincular a ${vinculation.userName} del vehículo ${vinculation.vehiclePlate} y el dispositivo ${vinculation.deviceSerial}?`,
          confirmLabel: 'Desvincular',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this._vinculationService.deleteVinculation(vinculation.id)),
      )
      .subscribe({
        next: () => {
          this._snackBar.open('Vinculación eliminada', 'Cerrar', { duration: 3000 });
          this.loadVinculations();
        },
        error: () => this._snackBar.open('No se pudo desvincular', 'Cerrar', { duration: 4000 }),
      });
  }
}
