/** RTK Query endpoints for settings (contacts and policies). */
import { api } from "./base";

export interface Contact {
  id: string;
  home_id: string;
  name: string;
  channel: "sms" | "email";
  value: string;
  priority: number;
}

export interface ContactCreate {
  home_id: string;
  name: string;
  channel: "sms" | "email";
  value: string;
  priority?: number;
}

export interface Policy {
  id: string;
  home_id: string;
  quiet_start_time?: string;
  quiet_end_time?: string;
  auto_escalate_after_seconds?: number;
}

export interface PolicyUpdate {
  quiet_start_time?: string;
  quiet_end_time?: string;
  auto_escalate_after_seconds?: number;
}

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listContacts: builder.query<Contact[], { home_id: string }>({
      query: ({ home_id }) => ({
        url: `/settings/contacts?home_id=${home_id}`,
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),
    createContact: builder.mutation<Contact, ContactCreate>({
      query: (contact) => ({
        url: "/settings/contacts",
        method: "POST",
        body: contact,
      }),
      invalidatesTags: ["Contact"],
    }),
    deleteContact: builder.mutation<void, string>({
      query: (contactId) => ({
        url: `/settings/contacts/${contactId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),
    getPolicy: builder.query<Policy, { home_id: string }>({
      query: ({ home_id }) => ({
        url: `/settings/policies?home_id=${home_id}`,
        method: "GET",
      }),
      providesTags: ["Policy"],
    }),
    updatePolicy: builder.mutation<Policy, { home_id: string; data: PolicyUpdate }>({
      query: ({ home_id, data }) => ({
        url: `/settings/policies/${home_id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Policy"],
    }),
  }),
});

export const {
  useListContactsQuery,
  useCreateContactMutation,
  useDeleteContactMutation,
  useGetPolicyQuery,
  useUpdatePolicyMutation,
} = settingsApi;

