import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  AlertFilters,
  AlertSummary,
  DailyAlerts,
  DashboardStats,
  DateRange,
  DeviceFilters,
  DeviceSummary,
  UserAlertRanking,
} from '../interfaces/dashboard.interface';

const ENDPOINT = `${environment.apiUrl}/dashboard`;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private _http: HttpClient) {}

  getStats(range: DateRange): Observable<DashboardStats> {
    return this._http.get<DashboardStats>(`${ENDPOINT}/stats`, { params: this.toParams({ ...range }) });
  }

  getDevices(filters: DeviceFilters): Observable<DeviceSummary[]> {
    return this._http.get<DeviceSummary[]>(`${ENDPOINT}/devices`, { params: this.toParams({ ...filters }) });
  }

  getLatestAlerts(filters: AlertFilters): Observable<AlertSummary[]> {
    return this._http.get<AlertSummary[]>(`${ENDPOINT}/alerts`, { params: this.toParams({ ...filters }) });
  }

  getAlertsByDay(days: number): Observable<DailyAlerts[]> {
    return this._http.get<DailyAlerts[]>(`${ENDPOINT}/alerts/by-day`, { params: this.toParams({ days }) });
  }

  getTopUsers(days: number, limit: number): Observable<UserAlertRanking[]> {
    return this._http.get<UserAlertRanking[]>(`${ENDPOINT}/alerts/top-users`, { params: this.toParams({ days, limit }) });
  }

  private toParams(values: Record<string, string | number>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== '' && value !== null && value !== undefined) params = params.set(key, value);
    }
    return params;
  }
}
