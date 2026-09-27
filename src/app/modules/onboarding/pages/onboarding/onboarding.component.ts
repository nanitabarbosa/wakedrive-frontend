import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TableColumn } from '../../../../shared/components/table/interfaces/table.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { AccessRequestDrawerComponent } from '../../components/access-request-drawer/access-request-drawer.component';
import {
  ACCESS_REQUEST_STATUS_LABELS,
  AccessRequest,
  AccessRequestCounts,
  AccessRequestStatus,
} from '../../interfaces/access-request.interface';
import { OnboardingService } from '../../services/onboarding.service';

interface StatusTab {
  status: AccessRequestStatus | '';
  label: string;
  count: keyof AccessRequestCounts;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [DatePipe, MatIconModule, PageHeaderComponent, TableComponent, AccessRequestDrawerComponent],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
  readonly columns: TableColumn[] = [
    { key: 'companyName', label: 'Empresa' },
    { key: 'adminName', label: 'Solicitante' },
    { key: 'status', label: 'Estado' },
    { key: 'createdAt', label: 'Fecha de solicitud' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];
  readonly tabs: StatusTab[] = [
    { status: '', label: 'Todas', count: 'total' },
    { status: 'PENDING', label: 'Pendientes', count: 'pending' },
    { status: 'APPROVED', label: 'Aprobadas', count: 'approved' },
    { status: 'REJECTED', label: 'Rechazadas', count: 'rejected' },
    { status: 'INACTIVE', label: 'Inactivas', count: 'inactive' },
  ];
  readonly statusLabels = ACCESS_REQUEST_STATUS_LABELS;
  readonly pageSize = 10;

  readonly requests = signal<AccessRequest[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly status = signal<AccessRequestStatus | ''>('');
  readonly counts = signal<AccessRequestCounts>({ total: 0, pending: 0, approved: 0, rejected: 0, inactive: 0 });
  readonly loadError = signal(false);

  readonly drawerOpen = signal(false);
  readonly selectedRequest = signal<AccessRequest | null>(null);

  constructor(
    private _onboardingService: OnboardingService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadRequests();
  }

  loadCounts(): void {
    this._onboardingService.getCounts().subscribe({
      next: counts => this.counts.set(counts),
      error: () => undefined,
    });
  }

  loadRequests(): void {
    this.loadError.set(false);
    this._onboardingService.getRequests({ status: this.status(), page: this.page(), size: this.pageSize }).subscribe({
      next: response => {
        this.requests.set(response.content);
        this.total.set(response.page.totalElements);
      },
      error: () => {
        this.requests.set([]);
        this.total.set(0);
        this.loadError.set(true);
      },
    });
  }

  selectStatus(status: AccessRequestStatus | ''): void {
    this.status.set(status);
    this.page.set(1);
    this.loadRequests();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadRequests();
  }

  openDrawer(request: AccessRequest): void {
    this.selectedRequest.set(request);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  onReviewed(message: string): void {
    this.closeDrawer();
    this._snackBar.open(message, 'Cerrar', { duration: 3000 });
    this.loadCounts();
    this.loadRequests();
  }
}
