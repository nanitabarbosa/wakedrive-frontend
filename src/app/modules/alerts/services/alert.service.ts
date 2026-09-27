import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { Alert, AlertFilters, FilterOption } from '../interfaces/alert.interface';

const ENDPOINT = `${environment.apiUrl}/alerts`;

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private _http: HttpClient) {}

  getAlerts(filters: AlertFilters): Observable<Page<Alert>> {
    return this._http.get<Page<Alert>>(ENDPOINT, { params: buildPageParams({ ...filters }) });
  }

  getUserOptions(): Observable<FilterOption[]> {
    return this._http.get<FilterOption[]>(`${environment.apiUrl}/users/options`);
  }

  getVehicleOptions(): Observable<FilterOption[]> {
    return this._http.get<FilterOption[]>(`${environment.apiUrl}/vehicles/options`);
  }
}
