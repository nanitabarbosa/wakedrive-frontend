import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ModalHeaderVariant } from './interfaces/modal-header.interface';

@Component({
  selector: 'app-modal-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './modal-header.component.html',
})
export class ModalHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() icon = '';
  @Input() variant: ModalHeaderVariant = 'primary';
  @Output() closed = new EventEmitter<void>();
}
