import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { EMPTY_STATE_STYLES, EmptyStateKind, EmptyStateStyle } from './interfaces/empty-state.interface';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  @Input() kind: EmptyStateKind = 'empty';
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';
  @Input() bordered = true;

  get style(): EmptyStateStyle {
    return EMPTY_STATE_STYLES[this.kind];
  }
}
