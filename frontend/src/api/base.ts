/** RTK Query base API configuration. */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Device",
    "DeviceConfiguration",
    "Alert",
    "Contact",
    "Policy",
    "ModelConfig",
    "Home",
    "Network",
    "Assignment",
    "OpsHouse",
    "AuditLog",
    "InstallationRequest",
  ],
  endpoints: () => ({}),
});
