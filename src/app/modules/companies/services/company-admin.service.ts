import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { RecordStatus } from '../../users/interfaces/user.interface';
import { CompanyDevice, CompanyDeviceCounts, CompanyDeviceFilters, CompanyFilters, CompanySummary } from '../interfaces/company.interface';

const ENDPOINT = `${environment.apiUrl}/companies`;

@Injectable({ providedIn: 'root' })
export class CompanyAdminService {
  constructor(private _http: HttpClient) {}

  getCompanies(filters: CompanyFilters): Observable<Page<CompanySummary>> {
    return this._http.get<Page<CompanySummary>>(`${ENDPOINT}/summary`, { params: buildPageParams({ ...filters }) });
  }

  getDevices(companyId: number, filters: CompanyDeviceFilters): Observable<Page<CompanyDevice>> {
    return this._http.get<Page<CompanyDevice>>(`${ENDPOINT}/${companyId}/devices`, { params: buildPageParams({ ...filters }) });
  }

  updateStatus(companyId: number, status: RecordStatus): Observable<CompanySummary> {
    return this._http.put<CompanySummary>(`${ENDPOINT}/${companyId}/status`, { status });
  }

  getDeviceCounts(companyId: number): Observable<CompanyDeviceCounts> {
    return this._http.get<CompanyDeviceCounts>(`${ENDPOINT}/${companyId}/devices/counts`);
  }
}
