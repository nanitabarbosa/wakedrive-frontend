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
  readonly pageSize = 10;

  readonly devices = signal<CompanyDevice[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly search = signal('');
  readonly loadError = signal(false);

  private readonly _search$ = new Subject<string>();

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
        this.page.set(1);
        this.loadDevices();
      });
  }

  reset(): void {
    this.search.set('');
    this.page.set(1);
    this.devices.set([]);
    this.total.set(0);
    this.loadDevices();
  }

  loadDevices(): void {
    if (!this.company) return;
    this.loadError.set(false);
    this._companyAdminService
      .getDevices(this.company.id, { search: this.search(), page: this.page(), size: this.pageSize })
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

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadDevices();
  }
}
