import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AccessRequestPayload, City } from '../interfaces/access-request.interface';

@Injectable({ providedIn: 'root' })
export class AccessRequestService {
  constructor(private _http: HttpClient) {}

  getCities(): Observable<City[]> {
    return this._http.get<City[]>(`${environment.apiUrl}/cities`);
  }

  createRequest(payload: AccessRequestPayload): Observable<void> {
    return this._http.post<void>(`${environment.apiUrl}/access-requests`, payload);
  }
}
