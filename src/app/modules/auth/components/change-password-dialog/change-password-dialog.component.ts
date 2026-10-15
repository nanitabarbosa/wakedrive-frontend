import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ModalHeaderComponent } from '../../../../shared/components/modal-header/modal-header.component';
import { ChangePasswordFormComponent } from '../change-password-form/change-password-form.component';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [MatDialogModule, ModalHeaderComponent, ChangePasswordFormComponent],
  templateUrl: './change-password-dialog.component.html',
})
export class ChangePasswordDialogComponent {
  constructor(private _dialogRef: MatDialogRef<ChangePasswordDialogComponent>) {}

  close(): void {
    this._dialogRef.close();
  }
}
