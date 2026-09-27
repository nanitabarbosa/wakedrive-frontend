import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { DrawerMode } from '../../../../shared/components/drawer/interfaces/drawer.interface';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';
import { RECORD_STATUS_LABELS } from '../../interfaces/user.interface';
import { VEHICLE_TYPE_LABELS, Vehicle, VehiclePayload } from '../../interfaces/vehicle.interface';
import { VehicleService } from '../../services/vehicle.service';

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

@Component({
  selector: 'app-vehicle-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, DrawerComponent, FormActionsComponent],
  templateUrl: './vehicle-drawer.component.html',
})
export class VehicleDrawerComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() mode: DrawerMode = 'create';
  @Input() vehicle: Vehicle | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  readonly typeOptions = Object.entries(VEHICLE_TYPE_LABELS);
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly minYear = MIN_YEAR;
  readonly maxYear = MAX_YEAR;
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _vehicleService: VehicleService,
  ) {}

  get title(): string {
    return { create: 'Nuevo vehículo', edit: 'Editar vehículo', view: 'Detalle del vehículo' }[this.mode];
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.form) this.resetForm();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      plate: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}-?\d{2}[0-9A-Za-z]$/)]],
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      model: ['', [Validators.required, Validators.maxLength(50)]],
      year: [MAX_YEAR - 1, [Validators.required, Validators.min(MIN_YEAR), Validators.max(MAX_YEAR)]],
      type: ['TRUCK', Validators.required],
      status: ['ACTIVE', Validators.required],
    });
  }

  resetForm(): void {
    this.errorMessage.set('');
    this.form.reset();
    if (this.vehicle) this.form.patchValue(this.vehicle);
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
    if (errors['pattern']) return 'Formato de placa no válido. Ej. ABC123';
    if (errors['min'] || errors['max']) return `El año debe estar entre ${MIN_YEAR} y ${MAX_YEAR}.`;
    return 'Valor no válido.';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: VehiclePayload = {
      ...value,
      plate: value.plate.replace('-', '').toUpperCase(),
      brand: value.brand.trim(),
      model: value.model.trim(),
      year: Number(value.year),
    };
    const isEdit = this.mode === 'edit' && !!this.vehicle;
    const request$ = isEdit
      ? this._vehicleService.updateVehicle(this.vehicle!.id, payload)
      : this._vehicleService.createVehicle(payload);

    this.saving.set(true);
    this.errorMessage.set('');
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit(isEdit ? 'Vehículo actualizado' : 'Vehículo creado');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(error.error?.message ?? 'No se pudo guardar el vehículo. Intenta de nuevo.');
      },
    });
  }
}
