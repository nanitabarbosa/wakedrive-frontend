import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { AppNotification, NotificationCounts, NotificationQuery } from '../interfaces/notification.interface';

const ENDPOINT = `${environment.apiUrl}/notifications`;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _unreadCount = signal(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  constructor(private _http: HttpClient) {}

  getNotifications(query: NotificationQuery): Observable<Page<AppNotification>> {
    return this._http.get<Page<AppNotification>>(ENDPOINT, { params: buildPageParams({ ...query, unread: query.unread === '' ? '' : String(query.unread) }) });
  }

  getCounts(): Observable<NotificationCounts> {
    return this._http.get<NotificationCounts>(`${ENDPOINT}/counts`).pipe(tap(counts => this._unreadCount.set(counts.unread)));
  }

  markAsRead(id: number): Observable<void> {
    return this._http.patch<void>(`${ENDPOINT}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this._http.patch<void>(`${ENDPOINT}/read-all`, {});
  }

  setUnreadCount(count: number): void {
    this._unreadCount.set(Math.max(0, count));
  }
}
