/** RTK Query endpoints for devices. */
import { api } from "./base";

export interface Device {
  id: string;
  home_id: string;
  room_id?: string;
  name: string;
  type: string;
  status: "online" | "offline";
  last_seen_at?: string;
  firmware_version?: string;
  created_at: string;
}

export interface DeviceCreate {
  home_id: string;
  room_id?: string;
  name: string;
  type: string;
}

export interface DeviceUpdate {
  name?: string;
  room_id?: string;
  firmware_version?: string;
}

export const devicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listDevices: builder.query<Device[], { home_id: string; room_id?: string; status?: string }>({
      query: ({ home_id, room_id, status }) => {
        const params = new URLSearchParams({ home_id });
        if (room_id) params.append("room_id", room_id);
        if (status) params.append("status", status);
        return {
          url: `/devices?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Device"],
    }),
    getDevice: builder.query<Device, string>({
      query: (deviceId) => ({
        url: `/devices/${deviceId}`,
        method: "GET",
      }),
      providesTags: (result, error, deviceId) => [{ type: "Device", id: deviceId }],
    }),
    createDevice: builder.mutation<Device, DeviceCreate>({
      query: (device) => ({
        url: "/devices",
        method: "POST",
        body: device,
      }),
      invalidatesTags: ["Device"],
    }),
    updateDevice: builder.mutation<Device, { id: string; data: DeviceUpdate }>({
      query: ({ id, data }) => ({
        url: `/devices/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Device", id }, "Device"],
    }),
    deleteDevice: builder.mutation<void, string>({
      query: (deviceId) => ({
        url: `/devices/${deviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Device"],
    }),
    heartbeatDevice: builder.mutation<Device, string>({
      query: (deviceId) => ({
        url: `/devices/${deviceId}/heartbeat`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (result, error, deviceId) => [{ type: "Device", id: deviceId }, "Device"],
    }),
  }),
});

export const {
  useListDevicesQuery,
  useGetDeviceQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
  useHeartbeatDeviceMutation,
} = devicesApi;

