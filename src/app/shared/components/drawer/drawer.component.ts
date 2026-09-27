import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
