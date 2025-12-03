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

export interface PasswordChangeRequest {
    current_password: string;
    new_password: string;
}

export interface TechnicianInfo {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    contact_number?: string;
    operational_area?: string;
}

export interface HomeProfile {
    id: string;
    name: string;
    address?: string;
    contact_number?: string;
    home_size?: string;
    number_of_rooms?: number;
    house_type?: string;
    status: string;
    assigned_technicians: TechnicianInfo[];
}

export interface HomeProfileUpdateRequest {
    name?: string;
    address?: string;
    contact_number?: string;
    home_size?: string;
    number_of_rooms?: number;
    house_type?: string;
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
        changePassword: builder.mutation<{ message: string }, PasswordChangeRequest>({
            query: (data) => ({
                url: "/profile/password",
                method: "POST",
                body: data,
            }),
        }),
        getHomeProfile: builder.query<HomeProfile, void>({
            query: () => ({
                url: "/profile/home",
                method: "GET",
            }),
            providesTags: ["Home"],
        }),
        updateHomeProfile: builder.mutation<HomeProfile, HomeProfileUpdateRequest>({
            query: (data) => ({
                url: "/profile/home",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Home"],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetProfilePictureUploadUrlMutation,
    useConfirmProfilePictureMutation,
    useDeleteProfilePictureMutation,
    useChangePasswordMutation,
    useGetHomeProfileQuery,
    useUpdateHomeProfileMutation,
} = profileApi;
