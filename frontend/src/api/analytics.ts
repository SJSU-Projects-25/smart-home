/** RTK Query endpoints for analytics. */
import { api } from "./base";
import { AlertsHeatmapResponse, OpsOverviewResponse, OwnerOverviewResponse } from "../types";

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
  useGetAlertsHeatmapQuery,
  useGetOwnerEventsTimeseriesQuery,
} = analyticsApi;

