import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from '../interfaces/auth.interface';
import { SessionUser } from '../interfaces/session-user.interface';

const TOKEN_KEY = 'wd_token';
const ROLES_KEY = 'wd_roles';
const USER_KEY = 'wd_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _roles = signal<string[]>(JSON.parse(localStorage.getItem(ROLES_KEY) ?? '[]'));
  private readonly _user = signal<SessionUser | null>(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'));

  readonly token = this._token.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  constructor(
    private _http: HttpClient,
    private _router: Router,
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this._http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap(res => this.setSession(res)));
  }

  logout(): void {
    [TOKEN_KEY, ROLES_KEY, USER_KEY].forEach(key => localStorage.removeItem(key));
    this._token.set(null);
    this._roles.set([]);
    this._user.set(null);
    this._router.navigate(['/auth/login']);
  }

  isSuperAdmin(): boolean {
    return this._roles().includes('SUPER_ADMIN');
  }

  homeRoute(): string {
    return this.isSuperAdmin() ? '/onboarding' : '/dashboard';
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this._roles().includes(role));
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROLES_KEY, JSON.stringify(res.roles));
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._roles.set(res.roles);
    this._user.set(res.user);
  }
}
