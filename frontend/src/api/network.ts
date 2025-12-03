/** RTK Query endpoints for network telemetry. */
import { api } from "./base";

export interface NetworkDeviceStatus {
  device_id: string;
  device_name: string;
  device_type: string;
  room_id?: string | null;
  room_name?: string | null;
  rssi: number | null;
  last_heartbeat: string | null;
  status: "online" | "offline";
}

export const networkApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNetworkStatus: builder.query<NetworkDeviceStatus[], { home_id: string }>({
      query: ({ home_id }) => ({
        url: `/network/status?home_id=${home_id}`,
        method: "GET",
      }),
      providesTags: ["Network"],
    }),
  }),
});

export const { useGetNetworkStatusQuery } = networkApi;

