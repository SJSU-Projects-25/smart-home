import { api } from "./base";

export interface InstallationItem {
  id: string;
  room_id?: string;
  coverage_type: string;
  desired_device_count: number;
  notes?: string;
  proposed_device_type?: string;
  status: string;
}

export interface InstallationRequest {
  id: string;
  home_id: string;
  owner_id: string;
  technician_id?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: InstallationItem[];
}

export interface InstallationItemCreate {
  room_id?: string;
  coverage_type: string;
  desired_device_count?: number;
  notes?: string;
}

export interface InstallationRequestCreate {
  home_id?: string;
  notes?: string;
  items: InstallationItemCreate[];
}

export interface OwnerInstallationStatusUpdate {
  action: "approve" | "request_changes";
  notes?: string;
}

export interface TechInstallationUpdate {
  status?: "in_review" | "plan_ready" | "installed";
  notes?: string;
}

export interface TechInstallationItemUpdate {
  status?: "pending" | "approved" | "rejected" | "installed";
  desired_device_count?: number;
  notes?: string;
}

export const installationRequestsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listOwnerInstallationRequests: builder.query<InstallationRequest[], void>({
      query: () => ({
        url: "/owner/installation-requests",
        method: "GET",
      }),
      providesTags: ["InstallationRequest"],
    }),
    createOwnerInstallationRequest: builder.mutation<
      InstallationRequest,
      InstallationRequestCreate
    >({
      query: (body) => ({
        url: "/owner/installation-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["InstallationRequest"],
    }),
    updateOwnerInstallationRequest: builder.mutation<
      InstallationRequest,
      { id: string; data: OwnerInstallationStatusUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/owner/installation-requests/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["InstallationRequest"],
    }),
    listTechInstallationRequests: builder.query<
      InstallationRequest[],
      { status?: string } | void
    >({
      query: (params) => ({
        url: "/tech/installation-requests",
        method: "GET",
        params: params ? params : undefined,
      }),
      providesTags: ["InstallationRequest"],
    }),
    updateTechInstallationRequest: builder.mutation<
      InstallationRequest,
      { id: string; data: TechInstallationUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/tech/installation-requests/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["InstallationRequest"],
    }),
    updateTechInstallationItem: builder.mutation<
      InstallationRequest,
      { requestId: string; itemId: string; data: TechInstallationItemUpdate }
    >({
      query: ({ requestId, itemId, data }) => ({
        url: `/tech/installation-requests/${requestId}/items/${itemId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["InstallationRequest"],
    }),
    approveAllTechInstallationItems: builder.mutation<
      InstallationRequest,
      { requestId: string }
    >({
      query: ({ requestId }) => ({
        url: `/tech/installation-requests/${requestId}/approve-all`,
        method: "POST",
      }),
      invalidatesTags: ["InstallationRequest"],
    }),
  }),
});

export const {
  useListOwnerInstallationRequestsQuery,
  useCreateOwnerInstallationRequestMutation,
  useUpdateOwnerInstallationRequestMutation,
  useListTechInstallationRequestsQuery,
  useUpdateTechInstallationRequestMutation,
  useUpdateTechInstallationItemMutation,
  useApproveAllTechInstallationItemsMutation,
} = installationRequestsApi;

