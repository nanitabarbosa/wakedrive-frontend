import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AlertService } from '../../../../core/services/alert.service';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  readonly loading = signal(false);
  readonly sentTo = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _passwordService: PasswordService,
    private _alert: AlertService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    });
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.getRawValue().email.trim().toLowerCase();
    this.loading.set(true);
    this._passwordService.forgotPassword({ email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.sentTo.set(email);
      },
      error: () => {
        this.loading.set(false);
        this._alert.error('No se pudo enviar el enlace. Intenta de nuevo.');
      },
    });
  }

  resend(): void {
    this.loading.set(true);
    this._passwordService.forgotPassword({ email: this.sentTo() }).subscribe({
      next: () => {
        this.loading.set(false);
        this._alert.success('Te reenviamos el enlace. Revisa tu correo.');
      },
      error: () => {
        this.loading.set(false);
        this._alert.error('No se pudo reenviar el enlace. Intenta de nuevo.');
      },
    });
  }

  tryAgain(): void {
    this.sentTo.set('');
  }
}
