/** RTK Query endpoints for ingestion. */
import { api } from "./base";

export interface PresignRequest {
  device_id: string;
  home_id: string;
  mime: string;
}

export interface PresignResponse {
  upload_url: string;
  s3_key: string;
  expires_in: number;
}

export interface ConfirmUploadRequest {
  s3_key: string;
  device_id: string;
  home_id: string;
  duration_ms?: number;
}

export interface ConfirmUploadResponse {
  job_id: string;
}

export const ingestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    presignUpload: builder.mutation<PresignResponse, PresignRequest>({
      query: (data) => ({
        url: "/ingest",
        method: "POST",
        body: data,
      }),
    }),
    confirmUpload: builder.mutation<ConfirmUploadResponse, ConfirmUploadRequest>({
      query: (data) => ({
        url: "/ingest/confirm",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { usePresignUploadMutation, useConfirmUploadMutation } = ingestApi;

