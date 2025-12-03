import { api } from "./base";

export interface OwnerRoom {
  id: string;
  home_id: string;
  name: string;
  type?: string;
}

export interface OwnerRoomCreate {
  name: string;
  type?: string;
}

export interface OwnerRoomUpdate {
  name?: string;
  type?: string;
}

export const roomsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listOwnerRooms: builder.query<OwnerRoom[], void>({
      query: () => ({
        url: "/owner/rooms",
        method: "GET",
      }),
      providesTags: ["Home"],
    }),
    createOwnerRoom: builder.mutation<OwnerRoom, OwnerRoomCreate>({
      query: (body) => ({
        url: "/owner/rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Home"],
    }),
    updateOwnerRoom: builder.mutation<
      OwnerRoom,
      { id: string; data: OwnerRoomUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/owner/rooms/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Home"],
    }),
    deleteOwnerRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/owner/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Home"],
    }),
  }),
});

export const {
  useListOwnerRoomsQuery,
  useCreateOwnerRoomMutation,
  useUpdateOwnerRoomMutation,
  useDeleteOwnerRoomMutation,
} = roomsApi;


