import { User } from './user.model';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface AuthData {
    user: User;
    roles: string[];
    permissions: string[];
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: string;
    remember_me: boolean;
}

export type AuthResponse = ApiResponse<AuthData>;

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
    code_phone_pays?: string;
    email?: string;
    password: string;
    password_confirmation: string;
}

export interface UpdateProfileRequest {
    nom?: string;
    prenom?: string;
    email?: string;
    phone?: string;
    code_phone_pays?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    password: string;
    password_confirmation: string;
}
