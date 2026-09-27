import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { PasswordService } from '../../services/password.service';

type ResetState = 'validating' | 'invalid' | 'ready';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  @Input() token = '';

  readonly state = signal<ResetState>('validating');
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _passwordService: PasswordService,
    private _snackBar: MatSnackBar,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.validateToken();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group(
      {
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), Validators.pattern(PASSWORD_PATTERN)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch },
    );
  }

  validateToken(): void {
    if (!this.token) {
      this.state.set('invalid');
      return;
    }
    this._passwordService.validateResetToken(this.token).subscribe({
      next: () => this.state.set('ready'),
      error: () => this.state.set('invalid'),
    });
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
    return field.invalid || (control === 'confirmPassword' && this.form.hasError('mismatch'));
  }

  errorFor(control: string): string {
    const errors = this.form.get(control)?.errors ?? {};
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['minlength']) return 'Debe tener al menos 8 caracteres.';
    if (errors['maxlength']) return 'Máximo 64 caracteres.';
    if (errors['pattern']) return 'Debe incluir letras y números.';
    if (control === 'confirmPassword' && this.form.hasError('mismatch')) return 'Las contraseñas no coinciden.';
    return 'Valor no válido.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this._passwordService.resetPassword({ token: this.token, password: this.form.getRawValue().password }).subscribe({
      next: () => {
        this._snackBar.open('Tu contraseña fue actualizada. Ya puedes iniciar sesión.', 'Cerrar', { duration: 4000 });
        this._router.navigate(['/auth/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 400 || error.status === 410) {
          this.state.set('invalid');
          return;
        }
        this.errorMessage.set('No se pudo actualizar la contraseña. Intenta de nuevo.');
      },
    });
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const { password, confirmPassword } = group.value;
    return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
  }
}
