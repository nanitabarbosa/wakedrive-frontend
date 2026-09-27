import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ForgotPasswordRequest, ResetPasswordRequest } from '../interfaces/password.interface';

const ENDPOINT = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class PasswordService {
  constructor(private _http: HttpClient) {}

  forgotPassword(payload: ForgotPasswordRequest): Observable<void> {
    return this._http.post<void>(`${ENDPOINT}/forgot-password`, payload);
  }

  validateResetToken(token: string): Observable<void> {
    return this._http.get<void>(`${ENDPOINT}/reset-password/validate`, { params: new HttpParams().set('token', token) });
  }

  resetPassword(payload: ResetPasswordRequest): Observable<void> {
    return this._http.post<void>(`${ENDPOINT}/reset-password`, payload);
  }
}
