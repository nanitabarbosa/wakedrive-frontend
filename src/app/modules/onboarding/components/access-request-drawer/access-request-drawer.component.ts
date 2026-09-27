import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, filter, switchMap, tap } from 'rxjs';

import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import {
  ACCESS_REQUEST_STATUS_ICONS,
  ACCESS_REQUEST_STATUS_LABELS,
  ACCESS_REQUEST_STATUS_MESSAGES,
  AccessRequest,
} from '../../interfaces/access-request.interface';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-access-request-drawer',
  standalone: true,
  imports: [DatePipe, MatIconModule, DrawerComponent],
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
  readonly saving = signal(false);

  constructor(
    private _onboardingService: OnboardingService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) {}

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
        error: () => {
          this.saving.set(false);
          this._snackBar.open('No se pudo actualizar la solicitud. Intenta de nuevo.', 'Cerrar', { duration: 4000 });
        },
      });
  }
}
