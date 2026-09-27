import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/interfaces/page.interface';
import { buildPageParams } from '../../../core/utils/http-params';
import { User, UserFilters, UserPayload } from '../interfaces/user.interface';

const ENDPOINT = `${environment.apiUrl}/users`;

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private _http: HttpClient) {}

  getUsers(filters: UserFilters): Observable<Page<User>> {
    return this._http.get<Page<User>>(ENDPOINT, { params: buildPageParams({ ...filters }) });
  }

  createUser(payload: UserPayload): Observable<User> {
    return this._http.post<User>(ENDPOINT, payload);
  }

  updateUser(id: number, payload: UserPayload): Observable<User> {
    return this._http.put<User>(`${ENDPOINT}/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this._http.delete<void>(`${ENDPOINT}/${id}`);
  }
}
