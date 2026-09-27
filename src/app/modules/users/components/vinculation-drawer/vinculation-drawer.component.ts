import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';
import { SelectOption, VinculationPayload } from '../../interfaces/vinculation.interface';
import { VinculationService } from '../../services/vinculation.service';

@Component({
  selector: 'app-vinculation-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, DrawerComponent, FormActionsComponent],
  templateUrl: './vinculation-drawer.component.html',
})
export class VinculationDrawerComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  readonly drivers = signal<SelectOption[]>([]);
  readonly vehicles = signal<SelectOption[]>([]);
  readonly devices = signal<SelectOption[]>([]);
  readonly loadingOptions = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  form!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _vinculationService: VinculationService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.form) {
      this.resetForm();
      this.loadOptions();
    }
  }

  buildForm(): void {
    this.form = this._fb.group({
      userId: [null as number | null, Validators.required],
      vehicleId: [null as number | null, Validators.required],
      deviceSerial: [null as string | null, Validators.required],
    });
  }

  resetForm(): void {
    this.errorMessage.set('');
    this.form.reset();
  }

  loadOptions(): void {
    this.loadingOptions.set(true);
    forkJoin({
      drivers: this._vinculationService.getAvailableDrivers(),
      vehicles: this._vinculationService.getAvailableVehicles(),
      devices: this._vinculationService.getAvailableDevices(),
    }).subscribe({
      next: ({ drivers, vehicles, devices }) => {
        this.drivers.set(drivers);
        this.vehicles.set(vehicles);
        this.devices.set(devices);
        this.loadingOptions.set(false);
      },
      error: () => {
        this.loadingOptions.set(false);
        this.errorMessage.set('No se pudieron cargar los conductores, vehículos y dispositivos disponibles.');
      },
    });
  }

  hasError(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && field.touched;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this._vinculationService.createVinculation(this.form.getRawValue() as VinculationPayload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit('Vinculación creada');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(error.error?.message ?? 'No se pudo crear la vinculación. Intenta de nuevo.');
      },
    });
  }
}
