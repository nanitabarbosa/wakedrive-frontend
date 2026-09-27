import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { DrawerMode } from '../../../../shared/components/drawer/interfaces/drawer.interface';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';
import { Device, DevicePayload } from '../../interfaces/device.interface';
import { RECORD_STATUS_LABELS } from '../../interfaces/user.interface';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-device-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, DrawerComponent, FormActionsComponent],
  templateUrl: './device-drawer.component.html',
})
export class DeviceDrawerComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() mode: DrawerMode = 'create';
  @Input() device: Device | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _deviceService: DeviceService,
  ) {}

  get title(): string {
    return { create: 'Nuevo dispositivo', edit: 'Editar dispositivo', view: 'Detalle del dispositivo' }[this.mode];
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.form) this.resetForm();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      serial: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9-]+$/)]],
      status: ['ACTIVE', Validators.required],
    });
  }

  resetForm(): void {
    this.errorMessage.set('');
    this.form.reset();
    if (this.device) this.form.patchValue(this.device);
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
    if (errors['pattern']) return 'Solo letras, números y guiones.';
    return 'Valor no válido.';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: DevicePayload = { ...value, serial: value.serial.trim().toUpperCase() };
    const isEdit = this.mode === 'edit' && !!this.device;
    const request$ = isEdit
      ? this._deviceService.updateDevice(this.device!.id, payload)
      : this._deviceService.createDevice(payload);

    this.saving.set(true);
    this.errorMessage.set('');
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit(isEdit ? 'Dispositivo actualizado' : 'Dispositivo creado');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(error.error?.message ?? 'No se pudo guardar el dispositivo. Intenta de nuevo.');
      },
    });
  }
}
