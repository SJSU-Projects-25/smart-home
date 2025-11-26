/** RTK Query endpoints for model configurations. */
import { api } from "./base";

export interface ModelConfig {
  id: string;
  home_id: string;
  model_key: string;
  enabled: boolean;
  threshold?: number;
  params_json?: Record<string, any>;
}

export interface ModelConfigUpdate {
  enabled?: boolean;
  threshold?: number;
  params_json?: Record<string, any>;
}

export const modelsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listModelConfigs: builder.query<ModelConfig[], { home_id: string }>({
      query: ({ home_id }) => ({
        url: `/model-config?home_id=${home_id}`,
        method: "GET",
      }),
      providesTags: ["ModelConfig"],
    }),
    updateModelConfig: builder.mutation<
      ModelConfig,
      { model_key: string; home_id: string; data: ModelConfigUpdate }
    >({
      query: ({ model_key, home_id, data }) => ({
        url: `/model-config/${model_key}?home_id=${home_id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ModelConfig"],
    }),
  }),
});

export const { useListModelConfigsQuery, useUpdateModelConfigMutation } = modelsApi;

