/** RTK Query endpoints for analytics. */
import { api } from "./base";
import { AlertsHeatmapResponse, OpsOverviewResponse, OwnerOverviewResponse } from "../types";

export interface TechOverviewResponse {
  assignedHomes: number;
  totalDevices: number;
  devicesOnline: number;
  openAlerts: number;
  highPriorityAlerts: number;
  eventsLast24h: number;
  homes: Array<{
    home_id: string;
    home_name: string;
    devices_count: number;
    devices_online: number;
    open_alerts: number;
    events_last_24h: number;
  }>;
}

export interface AdminOverviewResponse {
  totalHomes: number;
  totalUsers: number;
  totalDevices: number;
  totalDevicesOnline: number;
  openAlertsBySeverity: {
    high: number;
    medium: number;
    low: number;
  };
  eventsByHomeLast24h: Array<{
    home_id: string;
    count: number;
  }>;
  totalEventsLast24h: number;
  deviceUptimeSummary: Array<{
    device_id: string;
    event_count: number;
    last_event?: string;
    uptime_percent: number;
  }>;
  usersByRole: {
    owner: number;
    technician: number;
    staff: number;
    admin: number;
  };
  topHomesByAlerts: Array<{
    home_id: string;
    home_name: string;
    alert_count: number;
  }>;
}

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOwnerOverview: builder.query<OwnerOverviewResponse, { home_id: string }>({
      query: ({ home_id }) => ({
        url: `/owner/overview?home_id=${home_id}`,
        method: "GET",
      }),
      providesTags: ["Alert", "Device"],
    }),
    getOpsOverview: builder.query<OpsOverviewResponse, void>({
      query: () => ({
        url: "/ops/overview",
        method: "GET",
      }),
      providesTags: ["Alert", "Device", "Home"],
    }),
    getTechOverview: builder.query<TechOverviewResponse, void>({
      query: () => ({
        url: "/tech/overview",
        method: "GET",
      }),
      providesTags: ["Alert", "Device", "Home"],
    }),
    getAdminOverview: builder.query<AdminOverviewResponse, void>({
      query: () => ({
        url: "/admin/overview",
        method: "GET",
      }),
      providesTags: ["Alert", "Device", "Home", "User"],
    }),
    getAlertsHeatmap: builder.query<AlertsHeatmapResponse, { period?: "24h" | "7d" }>({
      query: ({ period = "24h" }) => ({
        url: `/ops/alerts/heatmap?period=${period}`,
        method: "GET",
      }),
      providesTags: ["Alert"],
    }),
    getOwnerEventsTimeseries: builder.query<
      { data: Array<{ hour: number; day: number; month: number; year: number; count: number }> },
      { home_id: string; hours?: number }
    >({
      query: ({ home_id, hours = 24 }) => ({
        url: `/owner/events/timeseries?home_id=${home_id}&hours=${hours}`,
        method: "GET",
      }),
      providesTags: ["Alert"],
    }),
  }),
});

export const {
  useGetOwnerOverviewQuery,
  useGetOpsOverviewQuery,
  useGetTechOverviewQuery,
  useGetAdminOverviewQuery,
  useGetAlertsHeatmapQuery,
  useGetOwnerEventsTimeseriesQuery,
} = analyticsApi;
