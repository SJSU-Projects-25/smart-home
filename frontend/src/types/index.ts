/** Type definitions for the application. */

export interface User {
  id: string;
  email: string;
  role: "owner" | "technician" | "staff" | "admin";
  home_id?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

