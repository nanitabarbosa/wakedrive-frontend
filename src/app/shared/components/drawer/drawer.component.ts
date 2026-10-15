import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AlertService } from '../../../core/services/alert.service';
import { ModalHeaderVariant } from '../modal-header/interfaces/modal-header.interface';
import { ModalHeaderComponent } from '../modal-header/modal-header.component';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [ModalHeaderComponent],
  templateUrl: './drawer.component.html',
})
export class DrawerComponent {
  @Input() open = false;
  @Input({ required: true }) title = '';
  @Input() icon = '';
  @Input() variant: ModalHeaderVariant = 'primary';
  @Output() closed = new EventEmitter<void>();

  constructor(private _alert: AlertService) {
    this._alert.shown$.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.open) this.close();
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
