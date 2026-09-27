import { Component } from '@angular/core';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './device-list.component.html',
})
export class DeviceListComponent {}
