import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { Device, DeviceFilters, DevicePayload } from '../interfaces/device.interface';

// TODO(back): endpoint de dispositivos de la empresa
const ENDPOINT = `${environment.apiUrl}/devices`;

@Injectable({ providedIn: 'root' })
export class DeviceService {
  constructor(private _http: HttpClient) {}

  getDevices(filters: DeviceFilters): Observable<Page<Device>> {
    return this._http.get<Page<Device>>(ENDPOINT, { params: buildPageParams({ ...filters }) });
  }

  createDevice(payload: DevicePayload): Observable<Device> {
    return this._http.post<Device>(ENDPOINT, payload);
  }

  updateDevice(id: number, payload: DevicePayload): Observable<Device> {
    return this._http.put<Device>(`${ENDPOINT}/${id}`, payload);
  }

  deleteDevice(id: number): Observable<void> {
    return this._http.delete<void>(`${ENDPOINT}/${id}`);
  }
}
