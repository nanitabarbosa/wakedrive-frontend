import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UsersTabComponent } from '../../components/users-tab/users-tab.component';
import { VehiclesTabComponent } from '../../components/vehicles-tab/vehicles-tab.component';
import { VinculationsTabComponent } from '../../components/vinculations-tab/vinculations-tab.component';

type UsersTab = 'drivers' | 'vehicles' | 'vinculations';

interface TabItem {
  id: UsersTab;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent, UsersTabComponent, VehiclesTabComponent, VinculationsTabComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  readonly tabs: TabItem[] = [
    { id: 'drivers', label: 'Conductores', icon: 'group' },
    { id: 'vehicles', label: 'Vehículos', icon: 'directions_car' },
    { id: 'vinculations', label: 'Vincular', icon: 'link' },
  ];
  readonly activeTab = signal<UsersTab>('drivers');

  selectTab(tab: UsersTab): void {
    this.activeTab.set(tab);
  }
}
