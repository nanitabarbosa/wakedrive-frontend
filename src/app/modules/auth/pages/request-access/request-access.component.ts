import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

import { PHONE_ERRORS, PHONE_PATTERN } from '../../../../core/utils/phone';
import { ValidateErrorsComponent } from '../../../../shared/components/validate-errors/validate-errors.component';
import { OnlyNumbersDirective } from '../../../../shared/directives/only-numbers.directive';
import { AlertService } from '../../../../core/services/alert.service';
import { AccessRequestPayload, City } from '../../interfaces/access-request.interface';
import { AccessRequestService } from '../../services/access-request.service';

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  nit: { pattern: 'Solo números y guiones, entre 5 y 15 caracteres.' },
  adminEmail: { email: 'Ingresa un correo válido.' },
};

@Component({
  selector: 'app-request-access',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, ValidateErrorsComponent, OnlyNumbersDirective, RouterLink],
  templateUrl: './request-access.component.html',
})
export class RequestAccessComponent implements OnInit {
  readonly phoneErrors = PHONE_ERRORS;
  readonly cities = signal<City[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _accessRequestService: AccessRequestService,
    private _alert: AlertService,
    private _router: Router,
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
    this._accessRequestService.createRequest(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.reset();
        this._router.navigate(['/auth/login']);
        this._alert.success('La solicitud fue enviada correctamente. Nuestro equipo te contactará pronto.');
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this._alert.error(error.error?.message ?? 'No se pudo enviar la solicitud. Intenta de nuevo.');
      },
    });
  }
}
