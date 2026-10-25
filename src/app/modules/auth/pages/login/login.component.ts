import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

import { AlertService } from '../../../../core/services/alert.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  readonly showPassword = signal(false);
  readonly loading = signal(false);

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _alert: AlertService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      password: ['', Validators.required],
    });
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  hasError(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && field.touched;
  }

  errorFor(control: string): string {
    const errors = this.form.get(control)?.errors ?? {};
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['email']) return 'Ingresa un correo válido.';
    return 'Valor no válido.';
  }

  loginErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Correo o contraseña incorrectos.';
    if (error.status === 403) return error.error?.message ?? 'La empresa está inactiva. Comunícate con el administrador de WakeDrive.';
    return 'No se pudo iniciar sesión. Intenta de nuevo.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this._authService.login({ email: email.trim().toLowerCase(), password }).subscribe({
      next: () => this._router.navigateByUrl(this._authService.homeRoute()),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this._alert.error(this.loginErrorMessage(error));
      },
    });
  }
}
