import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { Company } from '../../../core/interfaces/company.interface';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyService } from '../../../core/services/company.service';
import { NotificationsModalComponent } from '../../../modules/notifications/modal/notifications-modal.component';
import { NotificationService } from '../../../modules/notifications/services/notification.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatMenuModule, NotificationsModalComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  readonly collapsed = signal(false);

  readonly companyNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Usuarios', icon: 'group', route: '/users' },
    { label: 'Alertas', icon: 'notifications', route: '/alerts' },
    { label: 'Configuración', icon: 'settings', route: '/settings' },
  ];

  readonly superAdminNavItems: NavItem[] = [{ label: 'Onboarding', icon: 'assignment', route: '/onboarding' }];

  readonly companies = signal<Company[]>([]);
  readonly notificationsOpen = signal(false);

  constructor(
    private _authService: AuthService,
    private _companyService: CompanyService,
    private _notificationService: NotificationService,
  ) {}

  get isSuperAdmin(): boolean {
    return this._authService.isSuperAdmin();
  }

  get navItems(): NavItem[] {
    return this.isSuperAdmin ? this.superAdminNavItems : this.companyNavItems;
  }

  get user() {
    return this._authService.user();
  }

  get selectedCompany(): Company | null {
    return this._companyService.selected();
  }

  get unreadNotifications(): number {
    return this._notificationService.unreadCount();
  }

  ngOnInit(): void {
    this.loadCompanyContext();
  }

  loadCompanyContext(): void {
    if (this.isSuperAdmin) return;
    this.loadCompanies();
    this.loadNotificationCounts();
  }

  loadCompanies(): void {
    this._companyService.getCompanies().subscribe({
      next: companies => this.companies.set(companies),
      error: () => this.companies.set([]),
    });
  }

  loadNotificationCounts(): void {
    this._notificationService.getCounts().subscribe({ error: () => undefined });
  }

  openNotifications(): void {
    this.notificationsOpen.set(true);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  toggleMenu(): void {
    this.collapsed.update(value => !value);
  }

  selectCompany(company: Company): void {
    this._companyService.select(company);
  }

  initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this._authService.logout();
  }
}
