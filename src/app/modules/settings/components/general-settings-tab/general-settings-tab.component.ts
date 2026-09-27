import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ALARM_SOUND_RULES, CompanySettings, LOGO_RULES, SettingsPayload, StoredFile } from '../../interfaces/settings.interface';
import { SettingsService } from '../../services/settings.service';
import { FileDropComponent } from '../file-drop/file-drop.component';

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  alarmDurationSeconds: { min: 'Mínimo 1 segundo.', max: 'Máximo 60 segundos.' },
  nit: { pattern: 'Formato válido: 901234567-8.' },
  phone: { pattern: 'Solo números, entre 7 y 15 dígitos.' },
};

@Component({
  selector: 'app-general-settings-tab',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, FileDropComponent],
  templateUrl: './general-settings-tab.component.html',
})
export class GeneralSettingsTabComponent implements OnInit, OnDestroy {
  readonly alarmRules = ALARM_SOUND_RULES;
  readonly logoRules = LOGO_RULES;

  readonly loadError = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly alarmSound = signal<StoredFile | null>(null);
  readonly logo = signal<StoredFile | null>(null);

  form!: FormGroup;

  private _alarmFile: File | null = null;
  private _logoFile: File | null = null;
  private _removeAlarmSound = false;
  private _removeLogo = false;
  private _objectUrls: string[] = [];

  constructor(
    private _fb: FormBuilder,
    private _settingsService: SettingsService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.revokeObjectUrls();
  }

  buildForm(): void {
    this.form = this._fb.nonNullable.group({
      faceRecognitionAlways: [true],
      notifyDeviceShutdown: [true],
      alarmDurationSeconds: [10, [Validators.required, Validators.min(1), Validators.max(60)]],
      companyName: ['', [Validators.required, Validators.maxLength(100)]],
      nit: ['', [Validators.required, Validators.pattern(/^\d{6,12}(-\d)?$/)]],
      address: ['', Validators.maxLength(150)],
      phone: ['', Validators.pattern(/^\d{7,15}$/)],
    });
  }

  loadSettings(): void {
    this.loadError.set(false);
    this._settingsService.getSettings().subscribe({
      next: settings => this.applySettings(settings),
      error: () => this.loadError.set(true),
    });
  }

  onAlarmSelected(file: File): void {
    this._alarmFile = file;
    this._removeAlarmSound = false;
    this.alarmSound.set(this.toPreview(file));
  }

  onAlarmRemoved(): void {
    this._alarmFile = null;
    this._removeAlarmSound = true;
    this.alarmSound.set(null);
  }

  onLogoSelected(file: File): void {
    this._logoFile = file;
    this._removeLogo = false;
    this.logo.set(this.toPreview(file));
  }

  onLogoRemoved(): void {
    this._logoFile = null;
    this._removeLogo = true;
    this.logo.set(null);
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
    const payload: SettingsPayload = {
      ...value,
      companyName: value.companyName.trim(),
      address: value.address.trim(),
      removeAlarmSound: this._removeAlarmSound,
      removeLogo: this._removeLogo,
    };

    this.saving.set(true);
    this.errorMessage.set('');
    this._settingsService.updateSettings(payload, this._alarmFile, this._logoFile).subscribe({
      next: settings => {
        this.saving.set(false);
        this.applySettings(settings);
        this._snackBar.open('Configuración guardada', 'Cerrar', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(error.error?.message ?? 'No se pudo guardar la configuración. Intenta de nuevo.');
      },
    });
  }

  private applySettings(settings: CompanySettings): void {
    this.form.reset({
      faceRecognitionAlways: settings.faceRecognitionAlways,
      notifyDeviceShutdown: settings.notifyDeviceShutdown,
      alarmDurationSeconds: settings.alarmDurationSeconds,
      companyName: settings.companyName,
      nit: settings.nit,
      address: settings.address ?? '',
      phone: settings.phone ?? '',
    });
    this.revokeObjectUrls();
    this._alarmFile = null;
    this._logoFile = null;
    this._removeAlarmSound = false;
    this._removeLogo = false;
    this.alarmSound.set(settings.alarmSound);
    this.logo.set(settings.logo);
  }

  private toPreview(file: File): StoredFile {
    const url = URL.createObjectURL(file);
    this._objectUrls.push(url);
    return { name: file.name, size: file.size, url };
  }

  private revokeObjectUrls(): void {
    this._objectUrls.forEach(url => URL.revokeObjectURL(url));
    this._objectUrls = [];
  }
}
