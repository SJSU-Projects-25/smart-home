"use client";

import { useState, useRef } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    Snackbar,
    Alert,
    Grid,
    Divider,
    CircularProgress,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetProfilePictureUploadUrlMutation,
    useConfirmProfilePictureMutation,
    useDeleteProfilePictureMutation,
    ProfileUpdateRequest,
} from "@/src/api/profile";

export default function ProfilePage() {
    const { data: profile, isLoading, refetch } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [getUploadUrl] = useGetProfilePictureUploadUrlMutation();
    const [confirmPicture] = useConfirmProfilePictureMutation();
    const [deletePicture, { isLoading: isDeleting }] = useDeleteProfilePictureMutation();

    const [formData, setFormData] = useState<ProfileUpdateRequest>({});
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update form data when profile loads
    useState(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                contact_number: profile.contact_number || "",
                operational_area: profile.operational_area || "",
                experience_level: profile.experience_level || "",
                certifications: profile.certifications || "",
            });
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(formData).unwrap();
            setSnackbar({ open: true, message: "Profile updated successfully", severity: "success" });
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.data?.detail || "Failed to update profile", severity: "error" });
        }
    };

    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setSnackbar({ open: true, message: "Please select an image file", severity: "error" });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: "Image must be less than 5MB", severity: "error" });
            return;
        }

        setUploading(true);
        try {
            // Get presigned URL
            const { upload_url, picture_key } = await getUploadUrl().unwrap();

            // Upload to S3
            const uploadResponse = await fetch(upload_url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error("Upload failed");
            }

            // Confirm upload
            await confirmPicture(picture_key).unwrap();
            setSnackbar({ open: true, message: "Profile picture updated successfully", severity: "success" });
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.data?.detail || "Failed to upload picture", severity: "error" });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeletePicture = async () => {
        try {
            await deletePicture().unwrap();
            setSnackbar({ open: true, message: "Profile picture deleted successfully", severity: "success" });
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.data?.detail || "Failed to delete picture", severity: "error" });
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Failed to load profile</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Profile
            </Typography>

            <Card elevation={1}>
                <CardContent>
                    {/* Profile Picture Section */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 3 }}>
                        <Avatar
                            src={profile.profile_picture_url || undefined}
                            sx={{ width: 120, height: 120 }}
                        >
                            {profile.first_name?.[0]}{profile.last_name?.[0]}
                        </Avatar>
                        <Box>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handlePictureUpload}
                            />
                            <Button
                                variant="outlined"
                                startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                sx={{ mr: 1 }}
                            >
                                {uploading ? "Uploading..." : "Upload Picture"}
                            </Button>
                            {profile.profile_picture_url && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeletePicture}
                                    disabled={isDeleting}
                                >
                                    Delete Picture
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Profile Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Personal Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="first_name"
                                    value={formData.first_name || ""}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="last_name"
                                    value={formData.last_name || ""}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={profile.email}
                                    disabled
                                    helperText="Email cannot be changed"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    name="contact_number"
                                    value={formData.contact_number || ""}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        {/* Technician-specific fields */}
                        {profile.role === "technician" && (
                            <>
                                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                    Professional Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Operational Area"
                                            name="operational_area"
                                            value={formData.operational_area || ""}
                                            onChange={handleChange}
                                            helperText="Region or city you cover"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Experience Level"
                                            name="experience_level"
                                            value={formData.experience_level || ""}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Certifications"
                                            name="certifications"
                                            value={formData.certifications || ""}
                                            onChange={handleChange}
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setFormData({
                                        first_name: profile.first_name || "",
                                        last_name: profile.last_name || "",
                                        contact_number: profile.contact_number || "",
                                        operational_area: profile.operational_area || "",
                                        experience_level: profile.experience_level || "",
                                        certifications: profile.certifications || "",
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
