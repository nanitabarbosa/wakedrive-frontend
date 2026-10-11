import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CompanySettings, SettingsPayload, StoredFile } from '../interfaces/settings.interface';

const ENDPOINT = `${environment.apiUrl}/settings`;

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _logo = signal<StoredFile | null>(null);
  readonly logo = this._logo.asReadonly();

  constructor(private _http: HttpClient) {}

  getSettings(): Observable<CompanySettings> {
    return this._http.get<CompanySettings>(ENDPOINT).pipe(tap(settings => this._logo.set(settings.logo)));
  }

  updateSettings(payload: SettingsPayload, alarmSound: File | null, logo: File | null): Observable<CompanySettings> {
    const body = new FormData();
    body.append('settings', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (alarmSound) body.append('alarmSound', alarmSound);
    if (logo) body.append('logo', logo);
    return this._http.put<CompanySettings>(ENDPOINT, body).pipe(tap(settings => this._logo.set(settings.logo)));
  }

  clearLogo(): void {
    this._logo.set(null);
  }
}
