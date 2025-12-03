/** RTK Query endpoints for device configuration. */
import { api } from "./base";

export interface DeviceConfig {
  id: string;
  device_id: string;
  heartbeat_timeout_seconds: number;
  enabled: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceConfigUpdate {
  heartbeat_timeout_seconds?: number;
  enabled?: boolean;
  notes?: string;
}

export const deviceConfigApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceConfig: builder.query<DeviceConfig, string>({
      query: (deviceId) => ({
        url: `/device-config/${deviceId}`,
        method: "GET",
      }),
      providesTags: (result, error, deviceId) => [{ type: "DeviceConfiguration", id: deviceId }],
    }),
    updateDeviceConfig: builder.mutation<DeviceConfig, { deviceId: string; data: DeviceConfigUpdate }>({
      query: ({ deviceId, data }) => ({
        url: `/device-config/${deviceId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { deviceId }) => [
        { type: "DeviceConfiguration", id: deviceId },
        "Device",
      ],
    }),
  }),
});

export const { useGetDeviceConfigQuery, useUpdateDeviceConfigMutation } = deviceConfigApi;
