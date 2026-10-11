import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AlertComponent } from '../../shared/components/alert/alert.component';
import { AlertType } from '../../shared/components/alert/interfaces/alert.interface';

const DURATIONS: Record<AlertType, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private _snackBar: MatSnackBar) {}

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  private show(type: AlertType, message: string): void {
    this._snackBar.openFromComponent(AlertComponent, {
      data: { type, message },
      duration: DURATIONS[type],
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'wd-alert-panel',
    });
  }
}
