import { Component, DestroyRef, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { RecordStatus } from '../../../users/interfaces/user.interface';
import { CompanyDevice, CompanyDeviceCounts, CompanySummary } from '../../interfaces/company.interface';
import { CompanyAdminService } from '../../services/company-admin.service';

interface StatusTab {
  value: RecordStatus | '';
  label: string;
  key: keyof CompanyDeviceCounts;
}

@Component({
  selector: 'app-company-devices-drawer',
  standalone: true,
  imports: [MatIconModule, DrawerComponent, EmptyStateComponent, TableComponent],
  templateUrl: './company-devices-drawer.component.html',
})
export class CompanyDevicesDrawerComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() company: CompanySummary | null = null;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('list') list?: ElementRef<HTMLElement>;

  readonly columns: TableColumn[] = [
    { key: 'serial', label: 'Serial' },
    { key: 'status', label: 'Estado' },
    { key: 'actions', label: '', align: 'right' },
  ];
  readonly tabs: StatusTab[] = [
    { value: '', label: 'Todos', key: 'total' },
    { value: 'ACTIVE', label: 'Activos', key: 'active' },
    { value: 'INACTIVE', label: 'Inactivos', key: 'inactive' },
  ];
  readonly statusLabels: Record<RecordStatus, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' };
  readonly pageSize = 30;

  readonly devices = signal<CompanyDevice[]>([]);
  readonly counts = signal<CompanyDeviceCounts | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly term = signal('');
  readonly search = signal('');
  readonly status = signal<RecordStatus | ''>('');
  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly copiedId = signal<number | null>(null);

  private readonly _search$ = new Subject<string>();
  private _requestId = 0;

  constructor(
    private _companyAdminService: CompanyAdminService,
    private _destroyRef: DestroyRef,
  ) {}

  get assigned(): number {
    return this.counts()?.total ?? this.company?.deviceCount ?? 0;
  }

  get tabTotal(): number | null {
    const counts = this.counts();
    const tab = this.tabs.find(item => item.value === this.status());
    return counts && tab ? counts[tab.key] : null;
  }

  get emptyDescription(): string {
    if (this.status() === 'ACTIVE') return 'Esta empresa no tiene dispositivos activos.';
    if (this.status() === 'INACTIVE') return 'Esta empresa no tiene dispositivos inactivos.';
    return 'Esta empresa aún no tiene dispositivos asignados.';
  }

  statusLabel(status: RecordStatus): string {
    return this.statusLabels[status];
  }

  ngOnInit(): void {
    this.listenSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.company) this.reset();
  }

  listenSearch(): void {
    this._search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        if (term === this.search()) return;
        this.search.set(term);
        this.loadDevices(true);
      });
  }

  reset(): void {
    this.term.set('');
    this.search.set('');
    this.status.set('');
    this.devices.set([]);
    this.counts.set(null);
    this.total.set(0);
    this.loadCounts();
    this.loadDevices(true);
  }

  loadCounts(): void {
    const company = this.company;
    if (!company) return;
    this._companyAdminService.getDeviceCounts(company.id).subscribe({
      next: counts => {
        if (this.company?.id === company.id) this.counts.set(counts);
      },
      error: () => this.counts.set(null),
    });
  }

  loadDevices(reset: boolean): void {
    if (!this.company) return;
    if (reset) this.page.set(1);
    const requestId = ++this._requestId;
    this.loading.set(true);
    this.loadError.set(false);
    this._companyAdminService
      .getDevices(this.company.id, { search: this.search(), status: this.status(), page: this.page(), size: this.pageSize })
      .subscribe({
        next: response => {
          if (requestId !== this._requestId) return;
          this.devices.update(current => (reset ? response.content : [...current, ...response.content]));
          this.total.set(response.page.totalElements);
          this.loading.set(false);
        },
        error: () => {
          if (requestId !== this._requestId) return;
          if (reset) {
            this.devices.set([]);
            this.total.set(0);
          }
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  setStatus(status: RecordStatus | ''): void {
    if (status === this.status()) return;
    this.status.set(status);
    if (this.list) this.list.nativeElement.scrollTop = 0;
    this.loadDevices(true);
  }

  onSearch(value: string): void {
    this.term.set(value);
    this._search$.next(value.trim());
  }

  clearSearch(): void {
    this.term.set('');
    this._search$.next('');
    if (this.search() === '') return;
    this.search.set('');
    this.loadDevices(true);
  }

  onScroll(event: Event): void {
    const list = event.target as HTMLElement;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    if (!nearBottom || this.loading() || this.devices().length >= this.total()) return;
    this.page.update(page => page + 1);
    this.loadDevices(false);
  }

  copySerial(device: CompanyDevice): void {
    navigator.clipboard
      ?.writeText(device.serial)
      .then(() => {
        this.copiedId.set(device.id);
        setTimeout(() => {
          if (this.copiedId() === device.id) this.copiedId.set(null);
        }, 1500);
      })
      .catch(() => undefined);
  }
}
