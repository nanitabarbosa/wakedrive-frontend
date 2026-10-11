import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './drawer.component.html',
})
export class DrawerComponent {
  @Input() open = false;
  @Input({ required: true }) title = '';
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
