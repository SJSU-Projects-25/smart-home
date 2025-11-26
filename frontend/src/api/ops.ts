/** RTK Query endpoints for operations (staff/admin). */
import { api } from "./base";

export interface OpsOverview {
  total_homes: number;
  total_devices_online: number;
  open_alerts_by_severity: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface OpsHouse {
  id: string;
  name: string;
  owner_email: string;
  devices_count: number;
  online_count: number;
  open_alerts_count: number;
  rooms_count?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target_type: string;
  target_id: string;
}

export const opsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOpsOverview: builder.query<OpsOverview, void>({
      query: () => ({
        url: "/ops/overview",
        method: "GET",
      }),
      providesTags: ["Alert", "Device"],
    }),
    listOpsHouses: builder.query<OpsHouse[], void>({
      query: () => ({
        url: "/ops/houses",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    listAuditLogs: builder.query<
      AuditLog[],
      { user?: string; action?: string; start_date?: string; end_date?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.user) queryParams.append("user", params.user);
        if (params.action) queryParams.append("action", params.action);
        if (params.start_date) queryParams.append("start_date", params.start_date);
        if (params.end_date) queryParams.append("end_date", params.end_date);
        return {
          url: `/ops/audit?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["User"],
    }),
  }),
});

export const { useGetOpsOverviewQuery, useListOpsHousesQuery, useListAuditLogsQuery } = opsApi;

