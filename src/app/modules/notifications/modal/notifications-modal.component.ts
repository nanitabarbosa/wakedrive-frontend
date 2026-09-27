import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { DrawerComponent } from '../../../shared/components/drawer/drawer.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { AppNotification, NOTIFICATION_STYLES, NotificationCounts, NotificationFilter, NotificationStyle } from '../interfaces/notification.interface';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notifications-modal',
  standalone: true,
  imports: [MatIconModule, TimeAgoPipe, DrawerComponent],
  templateUrl: './notifications-modal.component.html',
})
export class NotificationsModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  readonly pageSize = 5;

  readonly filter = signal<NotificationFilter>('ALL');
  readonly notifications = signal<AppNotification[]>([]);
  readonly counts = signal<NotificationCounts>({ total: 0, unread: 0 });
  readonly page = signal(1);
  readonly hasMore = signal(false);
  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly actionError = signal('');

  constructor(private _notificationService: NotificationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) this.refresh();
  }

  refresh(): void {
    this.actionError.set('');
    this.loadCounts();
    this.loadNotifications(true);
  }

  loadCounts(): void {
    this._notificationService.getCounts().subscribe({
      next: counts => this.counts.set(counts),
      error: () => this.counts.set({ total: 0, unread: 0 }),
    });
  }

  loadNotifications(reset: boolean): void {
    if (reset) this.page.set(1);
    this.loading.set(true);
    this.loadError.set(false);
    this._notificationService
      .getNotifications({ unread: this.filter() === 'UNREAD' ? true : '', page: this.page(), size: this.pageSize })
      .subscribe({
        next: response => {
          this.notifications.update(current => (reset ? response.content : [...current, ...response.content]));
          this.hasMore.set(response.page.number + 1 < response.page.totalPages);
          this.loading.set(false);
        },
        error: () => {
          if (reset) this.notifications.set([]);
          this.hasMore.set(false);
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  styleFor(type: string): NotificationStyle {
    return NOTIFICATION_STYLES[type] ?? { icon: 'notifications', variant: 'neutral' };
  }

  selectFilter(filter: NotificationFilter): void {
    if (this.filter() === filter) return;
    this.filter.set(filter);
    this.loadNotifications(true);
  }

  loadMore(): void {
    this.page.update(page => page + 1);
    this.loadNotifications(false);
  }

  markAsRead(notification: AppNotification): void {
    if (notification.read) return;
    const previous = this.snapshot();
    this.notifications.update(list =>
      this.filter() === 'UNREAD'
        ? list.filter(item => item.id !== notification.id)
        : list.map(item => (item.id === notification.id ? { ...item, read: true } : item)),
    );
    this.setUnread(this.counts().unread - 1);
    this._notificationService.markAsRead(notification.id).subscribe({
      error: () => this.restore(previous, 'No se pudo marcar la notificación como leída.'),
    });
  }

  markAllAsRead(): void {
    const previous = this.snapshot();
    this.notifications.update(list => (this.filter() === 'UNREAD' ? [] : list.map(item => ({ ...item, read: true }))));
    this.setUnread(0);
    this._notificationService.markAllAsRead().subscribe({
      error: () => this.restore(previous, 'No se pudieron marcar las notificaciones como leídas.'),
    });
  }

  private snapshot(): { notifications: AppNotification[]; counts: NotificationCounts } {
    this.actionError.set('');
    return { notifications: this.notifications(), counts: this.counts() };
  }

  private setUnread(unread: number): void {
    this.counts.update(counts => ({ ...counts, unread: Math.max(0, unread) }));
    this._notificationService.setUnreadCount(unread);
  }

  private restore(previous: { notifications: AppNotification[]; counts: NotificationCounts }, message: string): void {
    this.notifications.set(previous.notifications);
    this.counts.set(previous.counts);
    this._notificationService.setUnreadCount(previous.counts.unread);
    this.actionError.set(message);
  }
}
