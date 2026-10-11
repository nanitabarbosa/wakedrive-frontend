import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const DEFAULT_MESSAGES: Record<string, (error: any) => string> = {
  required: () => 'Este campo es obligatorio.',
  email: () => 'Ingresa un correo válido.',
  maxlength: error => `Máximo ${error.requiredLength} caracteres.`,
  minlength: error => `Mínimo ${error.requiredLength} caracteres.`,
  pattern: () => 'Formato no válido.',
};

@Component({
  selector: 'app-validate-errors',
  standalone: true,
  templateUrl: './validate-errors.component.html',
})
export class ValidateErrorsComponent {
  @Input() control: AbstractControl | null = null;
  @Input() messages: Record<string, string> = {};

  get message(): string {
    const errors = this.control?.errors;
    if (!errors || !this.control?.touched) return '';
    const key = Object.keys(errors)[0];
    return this.messages[key] ?? DEFAULT_MESSAGES[key]?.(errors[key]) ?? 'Valor no válido.';
  }
}
