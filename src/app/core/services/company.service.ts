import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Company } from '../interfaces/company.interface';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly _selected = signal<Company | null>(null);
  readonly selected = this._selected.asReadonly();

  constructor(private _http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this._http.get<Company[]>(`${environment.apiUrl}/companies`).pipe(
      tap(companies => {
        if (!this._selected() && companies.length) this._selected.set(companies[0]);
      }),
    );
  }

  select(company: Company): void {
    this._selected.set(company);
  }
}
