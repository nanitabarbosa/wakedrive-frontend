import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { CompanyDevice, CompanyFilters, CompanySummary } from '../interfaces/company.interface';

const ENDPOINT = `${environment.apiUrl}/companies`;

@Injectable({ providedIn: 'root' })
export class CompanyAdminService {
  constructor(private _http: HttpClient) {}

  getCompanies(filters: CompanyFilters): Observable<Page<CompanySummary>> {
    return this._http.get<Page<CompanySummary>>(`${ENDPOINT}/summary`, { params: buildPageParams({ ...filters }) });
  }

  getDevices(companyId: number, filters: CompanyFilters): Observable<Page<CompanyDevice>> {
    return this._http.get<Page<CompanyDevice>>(`${ENDPOINT}/${companyId}/devices`, { params: buildPageParams({ ...filters }) });
  }
}
