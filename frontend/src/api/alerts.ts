/** RTK Query endpoints for alerts. */
import { api } from "./base";

export const alertsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAlerts: builder.query<
      any[],
      { home_id: string; status?: string }
    >({
      query: ({ home_id, status }) => {
        const params = new URLSearchParams({ home_id });
        if (status) params.append("status", status);
        return {
          url: `/alerts?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Alert"],
    }),
    getAlert: builder.query<any, string>({
      query: (alertId) => ({
        url: `/alerts/${alertId}`,
        method: "GET",
      }),
      providesTags: (result, error, alertId) => [{ type: "Alert", id: alertId }],
    }),
    ackAlert: builder.mutation<any, string>({
      query: (alertId) => ({
        url: `/alerts/${alertId}/ack`,
        method: "POST",
      }),
      invalidatesTags: (result, error, alertId) => [
        { type: "Alert", id: alertId },
        "Alert",
      ],
    }),
    escalateAlert: builder.mutation<any, string>({
      query: (alertId) => ({
        url: `/alerts/${alertId}/escalate`,
        method: "POST",
      }),
      invalidatesTags: (result, error, alertId) => [
        { type: "Alert", id: alertId },
        "Alert",
      ],
    }),
    closeAlert: builder.mutation<any, string>({
      query: (alertId) => ({
        url: `/alerts/${alertId}/close`,
        method: "POST",
      }),
      invalidatesTags: (result, error, alertId) => [
        { type: "Alert", id: alertId },
        "Alert",
      ],
    }),
  }),
});

export const {
  useListAlertsQuery,
  useGetAlertQuery,
  useAckAlertMutation,
  useEscalateAlertMutation,
  useCloseAlertMutation,
} = alertsApi;

