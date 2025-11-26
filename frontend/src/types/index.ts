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

export interface Alert {
  id: string;
  home_id: string;
  room_id?: string;
  device_id?: string;
  type: string;
  severity: "low" | "medium" | "high";
  status: "open" | "acked" | "escalated" | "closed";
  score?: number;
  created_at: string;
  acked_at?: string;
  escalated_at?: string;
  closed_at?: string;
  notes?: string;
}

