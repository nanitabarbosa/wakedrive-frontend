import { SessionUser } from './session-user.interface';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  roles: string[];
  user: SessionUser;
}
