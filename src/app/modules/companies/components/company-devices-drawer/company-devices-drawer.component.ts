import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { CompanyDevice, CompanySummary } from '../../interfaces/company.interface';
import { CompanyAdminService } from '../../services/company-admin.service';

@Component({
  selector: 'app-company-devices-drawer',
  standalone: true,
  imports: [MatIconModule, DrawerComponent, TableComponent],
  templateUrl: './company-devices-drawer.component.html',
})
export class CompanyDevicesDrawerComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() company: CompanySummary | null = null;
  @Output() closed = new EventEmitter<void>();

  readonly columns: TableColumn[] = [{ key: 'serial', label: 'Serial' }];
  readonly pageSize = 30;

  readonly devices = signal<CompanyDevice[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly search = signal('');
  readonly loading = signal(false);
  readonly loadError = signal(false);

  private readonly _search$ = new Subject<string>();
  private _requestId = 0;

  constructor(
    private _companyAdminService: CompanyAdminService,
    private _destroyRef: DestroyRef,
  ) {}

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
        this.search.set(term);
        this.loadDevices(true);
      });
  }

  reset(): void {
    this.search.set('');
    this.devices.set([]);
    this.total.set(0);
    this.loadDevices(true);
  }

  loadDevices(reset: boolean): void {
    if (!this.company) return;
    if (reset) this.page.set(1);
    const requestId = ++this._requestId;
    this.loading.set(true);
    this.loadError.set(false);
    this._companyAdminService
      .getDevices(this.company.id, { search: this.search(), page: this.page(), size: this.pageSize })
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

  onSearch(term: string): void {
    this._search$.next(term.trim());
  }

  onScroll(event: Event): void {
    const list = event.target as HTMLElement;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    if (!nearBottom || this.loading() || this.devices().length >= this.total()) return;
    this.page.update(page => page + 1);
    this.loadDevices(false);
  }
}
