import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { CompanyDevicesDrawerComponent } from '../../components/company-devices-drawer/company-devices-drawer.component';
import { CompanySummary } from '../../interfaces/company.interface';
import { CompanyAdminService } from '../../services/company-admin.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent, TableComponent, CompanyDevicesDrawerComponent],
  templateUrl: './company-list.component.html',
})
export class CompanyListComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Empresa' },
    { key: 'deviceCount', label: 'Dispositivos asignados' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly pageSize = 10;

  readonly companies = signal<CompanySummary[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly search = signal('');
  readonly loadError = signal(false);

  readonly drawerOpen = signal(false);
  readonly selectedCompany = signal<CompanySummary | null>(null);

  private readonly _search$ = new Subject<string>();

  constructor(
    private _companyAdminService: CompanyAdminService,
    private _destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listenSearch();
    this.loadCompanies();
  }

  listenSearch(): void {
    this._search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(term => {
        this.search.set(term);
        this.page.set(1);
        this.loadCompanies();
      });
  }

  loadCompanies(): void {
    this.loadError.set(false);
    this._companyAdminService.getCompanies({ search: this.search(), page: this.page(), size: this.pageSize }).subscribe({
      next: response => {
        this.companies.set(response.content);
        this.total.set(response.page.totalElements);
      },
      error: () => {
        this.companies.set([]);
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
    this.loadCompanies();
  }

  openDrawer(company: CompanySummary): void {
    this.selectedCompany.set(company);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
