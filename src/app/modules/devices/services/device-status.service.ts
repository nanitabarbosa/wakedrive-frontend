import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { DeviceStatusFilters, DeviceStatusSummary } from '../interfaces/device-status.interface';

const ENDPOINT = `${environment.apiUrl}/devices/summary`;

@Injectable({ providedIn: 'root' })
export class DeviceStatusService {
  constructor(private _http: HttpClient) {}

  getDevices(filters: DeviceStatusFilters): Observable<Page<DeviceStatusSummary>> {
    return this._http.get<Page<DeviceStatusSummary>>(ENDPOINT, { params: buildPageParams({ ...filters }) });
  }
}
