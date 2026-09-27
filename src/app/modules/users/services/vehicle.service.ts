import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { Vehicle, VehicleFilters, VehiclePayload } from '../interfaces/vehicle.interface';

const ENDPOINT = `${environment.apiUrl}/vehicles`;

@Injectable({ providedIn: 'root' })
export class VehicleService {
  constructor(private _http: HttpClient) {}

  getVehicles(filters: VehicleFilters): Observable<Page<Vehicle>> {
    return this._http.get<Page<Vehicle>>(ENDPOINT, { params: buildPageParams({ ...filters }) });
  }

  createVehicle(payload: VehiclePayload): Observable<Vehicle> {
    return this._http.post<Vehicle>(ENDPOINT, payload);
  }

  updateVehicle(id: number, payload: VehiclePayload): Observable<Vehicle> {
    return this._http.put<Vehicle>(`${ENDPOINT}/${id}`, payload);
  }

  deleteVehicle(id: number): Observable<void> {
    return this._http.delete<void>(`${ENDPOINT}/${id}`);
  }
}
