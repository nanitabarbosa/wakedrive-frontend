import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { SelectOption, Vinculation, VinculationFilters, VinculationPayload } from '../interfaces/vinculation.interface';

const ENDPOINT = `${environment.apiUrl}/vinculations`;

@Injectable({ providedIn: 'root' })
export class VinculationService {
  constructor(private _http: HttpClient) {}

  getVinculations(filters: VinculationFilters): Observable<Page<Vinculation>> {
    return this._http.get<Page<Vinculation>>(ENDPOINT, { params: buildPageParams({ ...filters }) });
  }

  createVinculation(payload: VinculationPayload): Observable<Vinculation> {
    return this._http.post<Vinculation>(ENDPOINT, payload);
  }

  deleteVinculation(id: number): Observable<void> {
    return this._http.delete<void>(`${ENDPOINT}/${id}`);
  }

  getAvailableDrivers(): Observable<SelectOption[]> {
    return this._http.get<SelectOption[]>(`${ENDPOINT}/available-drivers`);
  }

  getAvailableVehicles(): Observable<SelectOption[]> {
    return this._http.get<SelectOption[]>(`${ENDPOINT}/available-vehicles`);
  }

  getAvailableDevices(): Observable<SelectOption[]> {
    return this._http.get<SelectOption[]>(`${ENDPOINT}/available-devices`);
  }
}
