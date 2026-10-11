import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ChangePasswordFormComponent } from '../../components/change-password-form/change-password-form.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [MatIconModule, ChangePasswordFormComponent],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  onChanged(): void {
    this._authService.markPasswordChanged();
    this._router.navigateByUrl(this._authService.homeRoute());
  }

  logout(): void {
    this._authService.logout();
  }
}
