import { Component } from '@angular/core';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { GeneralSettingsTabComponent } from '../../components/general-settings-tab/general-settings-tab.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [PageHeaderComponent, GeneralSettingsTabComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {}
