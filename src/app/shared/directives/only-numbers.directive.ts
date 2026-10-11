import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appOnlyNumbers]',
  standalone: true,
})
export class OnlyNumbersDirective {
  constructor(private _ngControl: NgControl) {}

  @HostListener('input', ['$event.target'])
  onInput(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '');
    if (digits === input.value) return;
    input.value = digits;
    this._ngControl.control?.setValue(digits);
  }
}
