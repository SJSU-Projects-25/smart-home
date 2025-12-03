"use client";

import { useState, useRef, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Avatar,
    Snackbar,
    Alert,
    Grid,
    Divider,
    CircularProgress,
    Tabs,
    Tab,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Collapse,
    IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetProfilePictureUploadUrlMutation,
    useConfirmProfilePictureMutation,
    useDeleteProfilePictureMutation,
    useChangePasswordMutation,
    useGetHomeProfileQuery,
    useUpdateHomeProfileMutation,
    ProfileUpdateRequest,
    PasswordChangeRequest,
    HomeProfileUpdateRequest,
} from "@/src/api/profile";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ProfilePage() {
    const { data: profile, isLoading, refetch } = useGetProfileQuery();
    const { data: homeProfile, refetch: refetchHome } = useGetHomeProfileQuery(undefined, {
        skip: profile?.role !== "owner",
    });

    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [getUploadUrl] = useGetProfilePictureUploadUrlMutation();
    const [confirmPicture] = useConfirmProfilePictureMutation();
    const [deletePicture, { isLoading: isDeleting }] = useDeleteProfilePictureMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
    const [updateHome, { isLoading: isUpdatingHome }] = useUpdateHomeProfileMutation();

    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState<ProfileUpdateRequest>({});
    const [passwordData, setPasswordData] = useState<PasswordChangeRequest>({
        current_password: "",
        new_password: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [homeData, setHomeData] = useState<HomeProfileUpdateRequest>({});
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update form data when profile loads
    useEffect(() => {
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
    }, [profile]);

    // Update home data when home profile loads
    useEffect(() => {
        if (homeProfile) {
            setHomeData({
                name: homeProfile.name,
                address: homeProfile.address || "",
                contact_number: homeProfile.contact_number || "",
                home_size: homeProfile.home_size || "",
                number_of_rooms: homeProfile.number_of_rooms || 0,
                house_type: homeProfile.house_type || "",
            });
        }
    }, [homeProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.name === "number_of_rooms" ? parseInt(e.target.value) || 0 : e.target.value;
        setHomeData({ ...homeData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(formData).unwrap();
            setSnackbar({ open: true, message: "Profile updated successfully", severity: "success" });
            refetch();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.data?.detail || "Failed to update profile",
                severity: "error",
            });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== confirmPassword) {
            setSnackbar({ open: true, message: "Passwords do not match", severity: "error" });
            return;
        }

        if (passwordData.new_password.length < 6) {
            setSnackbar({
                open: true,
                message: "Password must be at least 6 characters",
                severity: "error",
            });
            return;
        }

        try {
            await changePassword(passwordData).unwrap();
            setSnackbar({ open: true, message: "Password changed successfully", severity: "success" });
            setPasswordData({ current_password: "", new_password: "" });
            setConfirmPassword("");
            setShowPasswordSection(false);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.data?.detail || "Failed to change password",
                severity: "error",
            });
        }
    };

    const handleHomeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateHome(homeData).unwrap();
            setSnackbar({ open: true, message: "Home profile updated successfully", severity: "success" });
            refetchHome();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.data?.detail || "Failed to update home profile",
                severity: "error",
            });
        }
    };

    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setSnackbar({ open: true, message: "Please select an image file", severity: "error" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: "Image must be less than 5MB", severity: "error" });
            return;
        }

        setUploading(true);
        try {
            const { upload_url, picture_key } = await getUploadUrl().unwrap();

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

            await confirmPicture(picture_key).unwrap();
            setSnackbar({ open: true, message: "Profile picture updated successfully", severity: "success" });
            refetch();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.data?.detail || "Failed to upload picture",
                severity: "error",
            });
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
            setSnackbar({
                open: true,
                message: error.data?.detail || "Failed to delete picture",
                severity: "error",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "new home registered":
                return "info";
            case "pending verification":
                return "warning";
            case "inactive":
                return "default";
            case "active":
                return "success";
            default:
                return "default";
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

    const isAdmin = profile.role === "admin";
    const isOwner = profile.role === "owner";
    const isTechnician = profile.role === "technician";

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Profile
            </Typography>

            <Card elevation={1}>
                <CardContent>
                    {/* Tabs - Only for Owner */}
                    {isOwner && (
                        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                            <Tab label="User Profile" />
                            <Tab label="Home Profile" />
                        </Tabs>
                    )}

                    {/* User Profile Tab (Always visible for non-owners, or Tab 0 for owners) */}
                    <TabPanel value={tabValue} index={0}>
                        {/* Profile Picture Section - Hide for Admin */}
                        {!isAdmin && (
                            <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 3 }}>
                                <Avatar src={profile.profile_picture_url || undefined} sx={{ width: 120, height: 120 }}>
                                    {profile.first_name?.[0]}
                                    {profile.last_name?.[0]}
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
                        )}
                        {!isAdmin && <Divider sx={{ mb: 3 }} />}

                        {/* Profile Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Personal Information
                            </Typography>
                            <Grid container spacing={2}>
                                {/* Admin View: Only Name (Default "Admin") and Email */}
                                {isAdmin ? (
                                    <>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Name"
                                                value="Admin"
                                                disabled
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                value={profile.email}
                                                disabled
                                            />
                                        </Grid>
                                    </>
                                ) : (
                                    /* Non-Admin View: Full Profile */
                                    <>
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
                                    </>
                                )}
                            </Grid>

                            {/* Technician-specific fields */}
                            {isTechnician && (
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

                            {/* Save/Cancel Buttons - Hide for Admin since fields are read-only */}
                            {!isAdmin && (
                                <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                                    <Button type="submit" variant="contained" disabled={isUpdating}>
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
                            )}
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Password Change Section - Available for ALL roles */}
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                <Typography variant="h6">Change Password</Typography>
                                <IconButton onClick={() => setShowPasswordSection(!showPasswordSection)}>
                                    {showPasswordSection ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                            <Collapse in={showPasswordSection}>
                                <Box component="form" onSubmit={handlePasswordChange}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="Current Password"
                                                value={passwordData.current_password}
                                                onChange={(e) =>
                                                    setPasswordData({ ...passwordData, current_password: e.target.value })
                                                }
                                                required
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="New Password"
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                required
                                                helperText="Minimum 6 characters"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="Confirm New Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 2 }}>
                                        <Button type="submit" variant="contained" disabled={isChangingPassword}>
                                            {isChangingPassword ? "Changing..." : "Change Password"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Collapse>
                        </Box>
                    </TabPanel>

                    {/* Home Profile Tab (Owner only) */}
                    {isOwner && (
                        <TabPanel value={tabValue} index={1}>
                            {homeProfile ? (
                                <>
                                    <Box component="form" onSubmit={handleHomeSubmit}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Home Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Home Name"
                                                    name="name"
                                                    value={homeData.name || ""}
                                                    onChange={handleHomeChange}
                                                    required
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Status"
                                                    value={homeProfile.status}
                                                    disabled
                                                    InputProps={{
                                                        endAdornment: (
                                                            <Chip
                                                                label={homeProfile.status}
                                                                color={getStatusColor(homeProfile.status)}
                                                                size="small"
                                                            />
                                                        ),
                                                    }}
                                                    helperText="Status is managed by administrators"
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Address"
                                                    name="address"
                                                    value={homeData.address || ""}
                                                    onChange={handleHomeChange}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Contact Number"
                                                    name="contact_number"
                                                    value={homeData.contact_number || ""}
                                                    onChange={handleHomeChange}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Home Size"
                                                    name="home_size"
                                                    value={homeData.home_size || ""}
                                                    onChange={handleHomeChange}
                                                    placeholder="e.g., 2000 sq ft"
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Number of Rooms"
                                                    name="number_of_rooms"
                                                    value={homeData.number_of_rooms || ""}
                                                    onChange={handleHomeChange}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="House Type"
                                                    name="house_type"
                                                    value={homeData.house_type || ""}
                                                    onChange={handleHomeChange}
                                                    placeholder="e.g., Single Family, Apartment"
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                                            <Button type="submit" variant="contained" disabled={isUpdatingHome}>
                                                {isUpdatingHome ? "Saving..." : "Save Changes"}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setHomeData({
                                                        name: homeProfile.name,
                                                        address: homeProfile.address || "",
                                                        contact_number: homeProfile.contact_number || "",
                                                        home_size: homeProfile.home_size || "",
                                                        number_of_rooms: homeProfile.number_of_rooms || 0,
                                                        house_type: homeProfile.house_type || "",
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 4 }} />

                                    {/* Assigned Technicians */}
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Assigned Technicians
                                    </Typography>
                                    {homeProfile.assigned_technicians.length > 0 ? (
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Email</TableCell>
                                                        <TableCell>Contact</TableCell>
                                                        <TableCell>Operational Area</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {homeProfile.assigned_technicians.map((tech) => (
                                                        <TableRow key={tech.id}>
                                                            <TableCell>
                                                                {tech.first_name} {tech.last_name}
                                                            </TableCell>
                                                            <TableCell>{tech.email}</TableCell>
                                                            <TableCell>{tech.contact_number || "N/A"}</TableCell>
                                                            <TableCell>{tech.operational_area || "N/A"}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Alert severity="info">No technicians assigned to your home yet.</Alert>
                                    )}
                                </>
                            ) : (
                                <Alert severity="warning">
                                    No home profile found. Please contact an administrator to set up your home.
                                </Alert>
                            )}
                        </TabPanel>
                    )}
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
