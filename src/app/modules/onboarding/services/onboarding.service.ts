import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { AccessRequest, AccessRequestCounts, AccessRequestFilters } from '../interfaces/access-request.interface';

const ENDPOINT = `${environment.apiUrl}/access-requests`;

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  constructor(private _http: HttpClient) {}

  getRequests(filters: AccessRequestFilters): Observable<Page<AccessRequest>> {
    return this._http.get<Page<AccessRequest>>(ENDPOINT, { params: buildPageParams({ ...filters }) });
  }

  getCounts(): Observable<AccessRequestCounts> {
    return this._http.get<AccessRequestCounts>(`${ENDPOINT}/counts`);
  }

  approve(id: number): Observable<void> {
    return this._http.patch<void>(`${ENDPOINT}/${id}/approve`, {});
  }

  reject(id: number): Observable<void> {
    return this._http.patch<void>(`${ENDPOINT}/${id}/reject`, {});
  }
}
