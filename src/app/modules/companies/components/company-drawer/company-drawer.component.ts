import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AlertService } from '../../../../core/services/alert.service';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';
import { RECORD_STATUS_LABELS, RecordStatus } from '../../../users/interfaces/user.interface';
import { CompanySummary } from '../../interfaces/company.interface';
import { CompanyAdminService } from '../../services/company-admin.service';

@Component({
  selector: 'app-company-drawer',
  standalone: true,
  imports: [MatIconModule, DrawerComponent, FormActionsComponent],
  templateUrl: './company-drawer.component.html',
})
export class CompanyDrawerComponent implements OnChanges {
  @Input() open = false;
  @Input() company: CompanySummary | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  readonly statusLabels = RECORD_STATUS_LABELS;
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly status = signal<RecordStatus>('ACTIVE');
  readonly saving = signal(false);

  constructor(
    private _companyAdminService: CompanyAdminService,
    private _alert: AlertService,
  ) {}

  get changed(): boolean {
    return !!this.company && this.status() !== this.company.status;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.company) this.status.set(this.company.status);
  }

  setStatus(status: string): void {
    this.status.set(status as RecordStatus);
  }

  save(): void {
    if (!this.company || !this.changed) return;

    this.saving.set(true);
    this._companyAdminService.updateStatus(this.company.id, this.status()).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit(this.status() === 'ACTIVE' ? 'Empresa activada' : 'Empresa desactivada');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this._alert.error(error.error?.message ?? 'No se pudo actualizar la empresa. Intenta de nuevo.');
      },
    });
  }
}
