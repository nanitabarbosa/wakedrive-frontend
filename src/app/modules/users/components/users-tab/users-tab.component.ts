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
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { RECORD_STATUS_LABELS, RecordStatus, User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { UserDrawerComponent } from '../user-drawer/user-drawer.component';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [MatIconModule, TableComponent, InitialsPipe, UserDrawerComponent],
  templateUrl: './users-tab.component.html',
})
export class UsersTabComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'index', label: '#' },
    { key: 'fullName', label: 'Nombre' },
    { key: 'document', label: 'Documento' },
    { key: 'email', label: 'Correo' },
    { key: 'status', label: 'Estado' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly statusLabels = RECORD_STATUS_LABELS;
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly avatarColors = ['#2f6fed', '#16a34a', '#f59e0b', '#7c5cf5', '#ec4899', '#14b8a6'];
  readonly pageSize = 8;

  readonly users = signal<User[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loadError = signal(false);

  readonly search = signal('');
  readonly status = signal<RecordStatus | ''>('');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('create');
  readonly selectedUser = signal<User | null>(null);

  private readonly _search$ = new Subject<string>();

  constructor(
    private _userService: UserService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listenSearch();
    this.loadUsers();
  }

  listenSearch(): void {
    this._search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        this.search.set(term);
        this.resetAndLoad();
      });
  }

  loadUsers(): void {
    this.loadError.set(false);
    this._userService
      .getUsers({ search: this.search(), status: this.status(), page: this.page(), size: this.pageSize })
      .subscribe({
        next: response => {
          this.users.set(response.content);
          this.total.set(response.page.totalElements);
        },
        error: () => {
          this.users.set([]);
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
    this.loadUsers();
  }

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  openDrawer(mode: DrawerMode, user: User | null = null): void {
    this.drawerMode.set(mode);
    this.selectedUser.set(user);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  onSaved(message: string): void {
    this.closeDrawer();
    this._snackBar.open(message, 'Cerrar', { duration: 3000 });
    this.loadUsers();
  }

  confirmDelete(user: User): void {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Eliminar conductor', message: `¿Seguro que deseas eliminar a ${user.fullName}? Esta acción no se puede deshacer.` },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this._userService.deleteUser(user.id)),
      )
      .subscribe({
        next: () => {
          this._snackBar.open('Conductor eliminado', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        },
        error: () => this._snackBar.open('No se pudo eliminar el conductor', 'Cerrar', { duration: 4000 }),
      });
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.loadUsers();
  }
}
