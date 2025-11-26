/** RTK Query endpoints for assignments. */
import { api } from "./base";

export interface Assignment {
  id: string;
  user_id: string;
  home_id: string;
  role: "technician" | "staff";
  home?: {
    id: string;
    name: string;
    timezone: string;
  };
}

export const assignmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAssignments: builder.query<Assignment[], void>({
      query: () => ({
        url: "/assignments",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { useListAssignmentsQuery } = assignmentsApi;

