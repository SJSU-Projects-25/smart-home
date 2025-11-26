/** Type definitions for the application. */

export interface User {
  id: string;
  email: string;
  role: "owner" | "technician" | "staff" | "admin";
  home_id?: string;
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  operational_area?: string;
  experience_level?: string;
  certifications?: string;
  profile_picture_url?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: "owner" | "technician";
  first_name: string;
  last_name: string;
  contact_number: string;

  // Home Owner fields
  home_name?: string;
  home_address?: string;
  home_size?: string;
  number_of_rooms?: number;
  house_type?: string;

  // Technician fields
  operational_area?: string;
  experience_level?: string;
  certifications?: string;
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

