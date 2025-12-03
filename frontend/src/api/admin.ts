/** RTK Query endpoints for admin operations. */
import { api } from "./base";

export interface AdminUser {
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
  created_at: string;
}

export interface AdminUserCreate {
  email: string;
  password: string;
  role: "owner" | "technician" | "staff" | "admin";
  home_id?: string;
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  operational_area?: string;
  experience_level?: string;
  certifications?: string;
}

export interface AdminUserUpdate {
  email?: string;
  role?: "owner" | "technician" | "staff" | "admin";
  home_id?: string;
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  operational_area?: string;
  experience_level?: string;
  certifications?: string;
  profile_picture_url?: string;
}

export interface AdminHome {
  id: string;
  name: string;
  owner_email?: string;
  owner_id?: string;
  timezone: string;
  address?: string;
  contact_number?: string;
  home_size?: string;
  number_of_rooms?: number;
  house_type?: string;
  status?: string;
  rooms_count?: number;
  devices_count?: number;
  open_alerts_count?: number;
  created_at: string;
}

export interface AdminHomeCreate {
  name: string;
  owner_id: string;
  timezone: string;
  address?: string;
  contact_number?: string;
  home_size?: string;
  number_of_rooms?: number;
  house_type?: string;
}

export interface AdminHomeUpdate {
  name?: string;
  timezone?: string;
  address?: string;
  contact_number?: string;
  home_size?: string;
  number_of_rooms?: number;
  house_type?: string;
  status?: string;
}

export interface AdminAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  status: "open" | "acked" | "escalated" | "closed";
  score: number;
  home_id: string;
  room_id?: string;
  device_id?: string;
  created_at: string;
  acked_at?: string;
  escalated_at?: string;
  closed_at?: string;
}

export interface AdminDevice {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline";
  home_id: string;
  home_name?: string;
  room_id?: string;
  room_name?: string;
  last_seen_at?: string;
  firmware_version?: string;
  created_at: string;
}

export interface AdminModel {
  id: string;
  model_key: string;
  enabled: boolean;
  threshold: number;
  params: Record<string, any>;
  home_id: string;
  home_name?: string;
}

export interface AdminAuditLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  details: string;
}

export interface AdminAssignment {
  id: string;
  user_id: string;
  user_email: string;
  role: "technician" | "staff";
  home_id: string;
  home_name: string;
  home_status?: string;
  devices_count?: number;
  open_alerts_count?: number;
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<AdminUser[], void>({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createUser: builder.mutation<AdminUser, AdminUserCreate>({
      query: (user) => ({
        url: "/admin/users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<AdminUser, { id: string; data: AdminUserUpdate }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }, "User"],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    listHomes: builder.query<AdminHome[], void>({
      query: () => ({
        url: "/admin/homes",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createHome: builder.mutation<AdminHome, AdminHomeCreate>({
      query: (home) => ({
        url: "/admin/homes",
        method: "POST",
        body: home,
      }),
      invalidatesTags: ["User"],
    }),
    updateHome: builder.mutation<AdminHome, { id: string; data: AdminHomeUpdate }>({
      query: ({ id, data }) => ({
        url: `/admin/homes/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteHome: builder.mutation<void, string>({
      query: (homeId) => ({
        url: `/admin/homes/${homeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    listAlerts: builder.query<AdminAlert[], { status?: string; severity?: string }>({
      query: (params) => ({
        url: "/admin/alerts",
        method: "GET",
        params,
      }),
      providesTags: ["Alert"],
    }),
    listDevices: builder.query<AdminDevice[], { status?: string; device_type?: string }>({
      query: (params) => ({
        url: "/admin/devices",
        method: "GET",
        params,
      }),
      providesTags: ["Device"],
    }),
    listModels: builder.query<AdminModel[], { enabled?: boolean }>({
      query: (params) => ({
        url: "/admin/models",
        method: "GET",
        params,
      }),
      providesTags: ["ModelConfig"],
    }),
    listAuditLogs: builder.query<AdminAuditLog[], { user?: string; action?: string; start_date?: string; end_date?: string }>({
      query: (params) => ({
        url: "/admin/audit",
        method: "GET",
        params,
      }),
      providesTags: [],
    }),
    listAssignments: builder.query<AdminAssignment[], { technician_id?: string; home_id?: string } | void>({
      query: (params) => ({
        url: "/admin/assignments",
        method: "GET",
        params: params ? params : undefined,
      }),
      providesTags: ["Assignment"],
    }),
    createAssignment: builder.mutation<
      AdminAssignment,
      { user_id: string; home_id: string; role?: "technician" | "staff" }
    >({
      query: (body) => ({
        url: "/admin/assignments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteAssignment: builder.mutation<void, string>({
      query: (assignmentId) => ({
        url: `/admin/assignments/${assignmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useListHomesQuery,
  useCreateHomeMutation,
  useUpdateHomeMutation,
  useDeleteHomeMutation,
  useListAlertsQuery,
  useListDevicesQuery,
  useListModelsQuery,
  useListAuditLogsQuery,
  useListAssignmentsQuery: useListAdminAssignmentsQuery,
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
} = adminApi;
