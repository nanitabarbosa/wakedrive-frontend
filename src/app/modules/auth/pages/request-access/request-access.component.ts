import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AccessRequestPayload, City } from '../../interfaces/access-request.interface';
import { AccessRequestService } from '../../services/access-request.service';

const PHONE_PATTERN = /^\+?[\d\s]{7,20}$/;

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  nit: { pattern: 'Solo números y guiones, entre 5 y 15 caracteres.' },
  companyPhone: { pattern: 'Ingresa un teléfono válido.' },
  adminEmail: { email: 'Ingresa un correo válido.' },
  adminPhone: { pattern: 'Ingresa un teléfono válido.' },
};

@Component({
  selector: 'app-request-access',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './request-access.component.html',
})
export class RequestAccessComponent implements OnInit {
  readonly cities = signal<City[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _accessRequestService: AccessRequestService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      companyName: ['', [Validators.required, Validators.maxLength(120)]],
      nit: ['', [Validators.required, Validators.pattern(/^[\d-]{5,15}$/)]],
      cityId: ['', Validators.required],
      address: ['', [Validators.required, Validators.maxLength(150)]],
      companyPhone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      adminName: ['', [Validators.required, Validators.maxLength(100)]],
      adminEmail: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      adminPhone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    });
  }

  loadCities(): void {
    this._accessRequestService.getCities().subscribe({
      next: cities => this.cities.set(cities),
      error: () => this.errorMessage.set('No se pudieron cargar las ciudades.'),
    });
  }

  hasError(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && field.touched;
  }

  errorFor(control: string): string {
    const errors = this.form.get(control)?.errors ?? {};
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
    const key = Object.keys(errors)[0];
    return ERROR_MESSAGES[control]?.[key] ?? 'Valor no válido.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: AccessRequestPayload = {
      ...value,
      companyName: value.companyName.trim(),
      cityId: Number(value.cityId),
      adminName: value.adminName.trim(),
      adminEmail: value.adminEmail.trim().toLowerCase(),
    };

    this.loading.set(true);
    this.errorMessage.set('');
    this._accessRequestService.createRequest(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.reset();
        this._snackBar.open('¡Éxito! La solicitud fue enviada correctamente.', 'Cerrar', { duration: 4000 });
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message ?? 'No se pudo enviar la solicitud. Intenta de nuevo.');
      },
    });
  }
}
