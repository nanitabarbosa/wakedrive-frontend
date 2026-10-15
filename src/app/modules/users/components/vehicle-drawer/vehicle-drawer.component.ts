import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MatIconModule } from '@angular/material/icon';

import { AlertService } from '../../../../core/services/alert.service';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { DrawerMode } from '../../../../shared/components/drawer/interfaces/drawer.interface';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';
import { RECORD_STATUS_LABELS } from '../../interfaces/user.interface';
import { CatalogItem, Vehicle, VehiclePayload, vehicleTypeLabel } from '../../interfaces/vehicle.interface';
import { VehicleService } from '../../services/vehicle.service';

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

@Component({
  selector: 'app-vehicle-drawer',
  standalone: true,
  imports: [NgSelectComponent, ReactiveFormsModule, MatIconModule, DrawerComponent, FormActionsComponent],
  templateUrl: './vehicle-drawer.component.html',
})
export class VehicleDrawerComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() mode: DrawerMode = 'create';
  @Input() vehicle: Vehicle | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  readonly brands = signal<CatalogItem[]>([]);
  readonly vehicleTypes = signal<CatalogItem[]>([]);
  readonly statusOptions = Object.entries(RECORD_STATUS_LABELS);
  readonly minYear = MIN_YEAR;
  readonly maxYear = MAX_YEAR;
  readonly saving = signal(false);

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _vehicleService: VehicleService,
    private _alert: AlertService,
  ) {}

  get title(): string {
    return { create: 'Nuevo vehículo', edit: 'Editar vehículo', view: 'Detalle del vehículo' }[this.mode];
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadCatalogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.form) this.resetForm();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      plate: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}-?\d{2}[0-9A-Za-z]$/)]],
      brandId: [null as number | null, Validators.required],
      model: ['', [Validators.required, Validators.maxLength(50)]],
      year: [MAX_YEAR - 1, [Validators.required, Validators.min(MIN_YEAR), Validators.max(MAX_YEAR)]],
      vehicleTypeId: [null as number | null, Validators.required],
      status: ['ACTIVE', Validators.required],
    });
  }

  loadCatalogs(): void {
    this._vehicleService.getBrands().subscribe({
      next: brands => this.brands.set(brands),
      error: () => this._alert.error('No se pudieron cargar las marcas.'),
    });
    this._vehicleService.getVehicleTypes().subscribe({
      next: types => this.vehicleTypes.set(types.map(type => ({ ...type, name: vehicleTypeLabel(type.name) }))),
      error: () => this._alert.error('No se pudieron cargar los tipos de vehículo.'),
    });
  }

  resetForm(): void {
    this.form.reset();
    if (this.vehicle) this.form.patchValue({ ...this.vehicle, brandId: this.vehicle.brand.id, vehicleTypeId: this.vehicle.type.id });
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
      plate: value.plate.replace('-', '').toUpperCase(),
      brandId: value.brandId,
      model: value.model.trim(),
      year: Number(value.year),
      vehicleTypeId: value.vehicleTypeId,
      status: value.status,
    };
    const isEdit = this.mode === 'edit' && !!this.vehicle;
    const request$ = isEdit
      ? this._vehicleService.updateVehicle(this.vehicle!.id, payload)
      : this._vehicleService.createVehicle(payload);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit(isEdit ? 'Vehículo actualizado' : 'Vehículo creado');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this._alert.error(error.error?.message ?? 'No se pudo guardar el vehículo. Intenta de nuevo.');
      },
    });
  }
}
