/** RTK Query endpoints for profile management. */
import { api } from "./base";
import { User } from "../types";

export interface ProfileUpdateRequest {
    first_name?: string;
    last_name?: string;
    contact_number?: string;
    operational_area?: string;
    experience_level?: string;
    certifications?: string;
}

export interface ProfilePictureUploadResponse {
    upload_url: string;
    picture_key: string;
}

export const profileApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<User, void>({
            query: () => ({
                url: "/profile",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        updateProfile: builder.mutation<User, ProfileUpdateRequest>({
            query: (data) => ({
                url: "/profile",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        getProfilePictureUploadUrl: builder.mutation<ProfilePictureUploadResponse, void>({
            query: () => ({
                url: "/profile/picture",
                method: "POST",
            }),
        }),
        confirmProfilePicture: builder.mutation<User, string>({
            query: (picture_key) => ({
                url: `/profile/picture/confirm?picture_key=${picture_key}`,
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),
        deleteProfilePicture: builder.mutation<User, void>({
            query: () => ({
                url: "/profile/picture",
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetProfilePictureUploadUrlMutation,
    useConfirmProfilePictureMutation,
    useDeleteProfilePictureMutation,
} = profileApi;
