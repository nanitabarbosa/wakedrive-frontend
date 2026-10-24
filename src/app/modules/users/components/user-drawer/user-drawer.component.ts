import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { AlertService } from '../../../../core/services/alert.service';
import { PHONE_ERRORS, PHONE_PATTERN } from '../../../../core/utils/phone';
import { ValidateErrorsComponent } from '../../../../shared/components/validate-errors/validate-errors.component';
import { OnlyNumbersDirective } from '../../../../shared/directives/only-numbers.directive';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { DrawerMode } from '../../../../shared/components/drawer/interfaces/drawer.interface';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { RECORD_STATUS_LABELS, User, UserPayload } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  document: { pattern: 'Solo números, entre 6 y 10 dígitos.' },
  email: { email: 'Ingresa un correo válido.' },
};

@Component({
  selector: 'app-user-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, ValidateErrorsComponent, OnlyNumbersDirective, DrawerComponent, FormActionsComponent, InitialsPipe],
  templateUrl: './user-drawer.component.html',
})
export class UserDrawerComponent implements OnInit, OnChanges {
  readonly phoneErrors = PHONE_ERRORS;

  @Input() open = false;
  @Input() mode: DrawerMode = 'create';
  @Input() user: User | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  readonly statusLabels = RECORD_STATUS_LABELS;
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly saving = signal(false);

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _alert: AlertService,
  ) {}

  get title(): string {
    return { create: 'Nuevo conductor', edit: 'Editar conductor', view: 'Detalle del conductor' }[this.mode];
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.form) this.resetForm();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      document: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      status: ['ACTIVE', Validators.required],
    });
  }

  resetForm(): void {
    this.form.reset();
    if (this.user) this.form.patchValue({ ...this.user, phone: this.user.phone });
    if (this.mode === 'view') this.form.disable();
    else this.form.enable();
  }

  setStatus(status: string): void {
    this.form.get('status')?.setValue(status);
    this.form.markAsDirty();
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

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: UserPayload = { ...value, email: value.email.trim().toLowerCase() };
    const isEdit = this.mode === 'edit' && !!this.user;
    const request$ = isEdit ? this._userService.updateUser(this.user!.id, payload) : this._userService.createUser(payload);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit(isEdit ? 'Conductor actualizado' : 'Conductor creado');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this._alert.error(error.error?.message ?? 'No se pudo guardar el conductor. Intenta de nuevo.');
      },
    });
  }
}
