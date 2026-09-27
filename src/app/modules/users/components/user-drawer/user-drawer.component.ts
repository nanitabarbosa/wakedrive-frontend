import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { DrawerMode } from '../../../../shared/components/drawer/interfaces/drawer.interface';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';
import { RECORD_STATUS_LABELS, USER_ROLE_LABELS, User, UserPayload } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  document: { pattern: 'Solo números, entre 6 y 12 dígitos.' },
  email: { email: 'Ingresa un correo válido.' },
  phone: { pattern: 'Solo números, entre 7 y 15 dígitos.' },
};

@Component({
  selector: 'app-user-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, DrawerComponent, FormActionsComponent],
  templateUrl: './user-drawer.component.html',
})
export class UserDrawerComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() mode: DrawerMode = 'create';
  @Input() user: User | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  readonly roleLabels = USER_ROLE_LABELS;
  readonly statusLabels = RECORD_STATUS_LABELS;
  readonly roleOptions = Object.entries(USER_ROLE_LABELS);
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
  ) {}

  get title(): string {
    return { create: 'Nuevo usuario', edit: 'Editar usuario', view: 'Detalle del usuario' }[this.mode];
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
      document: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      phone: ['', Validators.pattern(/^\d{7,15}$/)],
      role: ['DRIVER', Validators.required],
      status: ['ACTIVE', Validators.required],
    });
  }

  resetForm(): void {
    this.errorMessage.set('');
    this.form.reset();
    if (this.user) this.form.patchValue({ ...this.user, phone: this.user.phone ?? '' });
    if (this.mode === 'view') this.form.disable();
    else this.form.enable();
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
    const payload: UserPayload = { ...value, email: value.email.trim().toLowerCase(), phone: value.phone || null };
    const isEdit = this.mode === 'edit' && !!this.user;
    const request$ = isEdit ? this._userService.updateUser(this.user!.id, payload) : this._userService.createUser(payload);

    this.saving.set(true);
    this.errorMessage.set('');
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit(isEdit ? 'Usuario actualizado' : 'Usuario creado');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(error.error?.message ?? 'No se pudo guardar el usuario. Intenta de nuevo.');
      },
    });
  }
}
