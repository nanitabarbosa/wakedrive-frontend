import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CompanySettings, SettingsPayload } from '../interfaces/settings.interface';

const ENDPOINT = `${environment.apiUrl}/settings`;

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private _http: HttpClient) {}

  getSettings(): Observable<CompanySettings> {
    return this._http.get<CompanySettings>(ENDPOINT);
  }

  updateSettings(payload: SettingsPayload, alarmSound: File | null, logo: File | null): Observable<CompanySettings> {
    const body = new FormData();
    body.append('settings', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (alarmSound) body.append('alarmSound', alarmSound);
    if (logo) body.append('logo', logo);
    return this._http.put<CompanySettings>(ENDPOINT, body);
  }
}
