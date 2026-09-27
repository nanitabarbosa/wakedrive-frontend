import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { ALERT_LEVEL_LABELS, ALERT_TYPE_ICONS, ALERT_TYPE_LABELS, Alert } from '../../interfaces/alert.interface';

@Component({
  selector: 'app-alert-detail-drawer',
  standalone: true,
  imports: [DatePipe, MatIconModule, DrawerComponent],
  templateUrl: './alert-detail-drawer.component.html',
})
export class AlertDetailDrawerComponent {
  @Input() open = false;
  @Input() alert: Alert | null = null;
  @Output() closed = new EventEmitter<void>();

  readonly typeLabels = ALERT_TYPE_LABELS;
  readonly typeIcons = ALERT_TYPE_ICONS;
  readonly levelLabels = ALERT_LEVEL_LABELS;
}
