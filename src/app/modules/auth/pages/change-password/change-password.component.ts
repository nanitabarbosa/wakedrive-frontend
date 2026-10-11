import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { AlertService } from '../../../../core/services/alert.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PasswordService } from '../../services/password.service';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {
  readonly showCurrent = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _passwordService: PasswordService,
    private _authService: AuthService,
    private _alert: AlertService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), Validators.pattern(PASSWORD_PATTERN)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: [this.passwordsMatch, this.passwordChanged] },
    );
  }

  toggleCurrent(): void {
    this.showCurrent.update(value => !value);
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirm(): void {
    this.showConfirm.update(value => !value);
  }

  hasError(control: string): boolean {
    const field = this.form.get(control);
    if (!field || !field.touched) return false;
    if (control === 'newPassword') return field.invalid || this.form.hasError('samePassword');
    if (control === 'confirmPassword') return field.invalid || this.form.hasError('mismatch');
    return field.invalid;
  }

  errorFor(control: string): string {
    const errors = this.form.get(control)?.errors ?? {};
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['minlength']) return 'Debe tener al menos 8 caracteres.';
    if (errors['maxlength']) return 'Máximo 64 caracteres.';
    if (errors['pattern']) return 'Debe incluir letras y números.';
    if (control === 'newPassword' && this.form.hasError('samePassword')) return 'La nueva contraseña debe ser diferente a la actual.';
    if (control === 'confirmPassword' && this.form.hasError('mismatch')) return 'Las contraseñas no coinciden.';
    return 'Valor no válido.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');
    this._passwordService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this._authService.markPasswordChanged();
        this._alert.success('Tu contraseña fue actualizada correctamente.');
        this._router.navigateByUrl(this._authService.homeRoute());
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(error.status === 401 ? 'La contraseña actual es incorrecta.' : 'No se pudo cambiar la contraseña. Intenta de nuevo.');
      },
    });
  }

  logout(): void {
    this._authService.logout();
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const { newPassword, confirmPassword } = group.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
  }

  private passwordChanged(group: AbstractControl): ValidationErrors | null {
    const { currentPassword, newPassword } = group.value;
    return currentPassword && newPassword && currentPassword === newPassword ? { samePassword: true } : null;
  }
}
