import { DatePipe, LowerCasePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable, filter, switchMap, tap } from 'rxjs';

import { AlertService } from '../../../../core/services/alert.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import {
  ACCESS_REQUEST_STATUS_ICONS,
  ACCESS_REQUEST_STATUS_LABELS,
  ACCESS_REQUEST_STATUS_MESSAGES,
  ACCESS_REQUEST_STATUS_TONES,
  AccessRequest,
} from '../../interfaces/access-request.interface';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-access-request-drawer',
  standalone: true,
  imports: [DatePipe, LowerCasePipe, NgClass, MatIconModule, DrawerComponent, InitialsPipe],
  templateUrl: './access-request-drawer.component.html',
})
export class AccessRequestDrawerComponent {
  @Input() open = false;
  @Input() request: AccessRequest | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() reviewed = new EventEmitter<string>();

  readonly statusLabels = ACCESS_REQUEST_STATUS_LABELS;
  readonly statusMessages = ACCESS_REQUEST_STATUS_MESSAGES;
  readonly statusIcons = ACCESS_REQUEST_STATUS_ICONS;
  readonly tones = ACCESS_REQUEST_STATUS_TONES;
  readonly saving = signal(false);
  readonly copied = signal<string | null>(null);

  constructor(
    private _onboardingService: OnboardingService,
    private _dialog: MatDialog,
    private _alert: AlertService,
  ) {}

  contacts(request: AccessRequest): { key: string; icon: string; label: string; value: string }[] {
    return [
      { key: 'email', icon: 'mail_outline', label: 'Correo corporativo', value: request.adminEmail },
      { key: 'phone', icon: 'phone', label: 'Teléfono', value: request.adminPhone },
    ];
  }

  copy(key: string, value: string): void {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        this.copied.set(key);
        setTimeout(() => {
          if (this.copied() === key) this.copied.set(null);
        }, 1500);
      })
      .catch(() => undefined);
  }

  approve(request: AccessRequest): void {
    this.review(
      {
        title: 'Aprobar solicitud',
        message: `¿Seguro que deseas aprobar la solicitud de ${request.companyName}? La empresa podrá ingresar a WakeDrive.`,
        confirmLabel: 'Aprobar',
      },
      this._onboardingService.approve(request.id),
      'Solicitud aprobada',
    );
  }

  reject(request: AccessRequest): void {
    this.review(
      {
        title: 'Rechazar solicitud',
        message: `¿Seguro que deseas rechazar la solicitud de ${request.companyName}?`,
        confirmLabel: 'Rechazar',
      },
      this._onboardingService.reject(request.id),
      'Solicitud rechazada',
    );
  }

  private review(data: ConfirmDialogData, request$: Observable<void>, message: string): void {
    this._dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .pipe(
        filter(Boolean),
        tap(() => this.saving.set(true)),
        switchMap(() => request$),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.reviewed.emit(message);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this._alert.error(this.errorMessage(error));
        },
      });
  }

  private errorMessage(error: HttpErrorResponse): string {
    const detail: string = error.error?.message ?? '';
    if (error.status === 409 && detail.includes('email')) return `Ya existe un usuario con el correo ${detail.split('email: ')[1]}.`;
    if (error.status === 409 && detail.includes('nit')) return `Ya existe una empresa con el NIT ${detail.split('nit: ')[1]}.`;
    if (error.status === 409) return 'Ya existe una empresa o un usuario con los datos de esta solicitud.';
    return 'No se pudo actualizar la solicitud. Intenta de nuevo.';
  }
}
