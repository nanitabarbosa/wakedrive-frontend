import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { AlertData, AlertType } from './interfaces/alert.interface';

const ICONS: Record<AlertType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: AlertData,
    private _snackBarRef: MatSnackBarRef<AlertComponent>,
  ) {}

  get icon(): string {
    return ICONS[this.data.type];
  }

  close(): void {
    this._snackBarRef.dismiss();
  }
}
