import { User } from './user.model';

export interface LoginRequest {
  phone: string;
  code_phone_pays?: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  phone: string;
  email?: string | null;
  pays: string;
  code_pays: string;
  code_phone_pays: string;
  ville: string;
  quartier: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdateProfileRequest {
  nom?: string;
  prenom?: string;
  email?: string | null;
  ville?: string;
  quartier?: string;
}