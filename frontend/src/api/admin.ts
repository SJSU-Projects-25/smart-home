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
}

export interface AdminUserUpdate {
  email?: string;
  role?: "owner" | "technician" | "staff" | "admin";
  home_id?: string;
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
} = adminApi;

