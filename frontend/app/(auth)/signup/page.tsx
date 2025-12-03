"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
    Link as MuiLink,
    MenuItem,
} from "@mui/material";
import Link from "next/link";
import { useRegisterMutation } from "@/src/api/auth";
import { RegisterRequest } from "@/src/types";

export default function SignUpPage() {
    const router = useRouter();
    const [register, { isLoading }] = useRegisterMutation();
    const [role, setRole] = useState<"owner" | "technician" | "staff" | "admin">("owner");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        contact_number: "",
        // Owner
        home_name: "",
        home_address: "",
        home_size: "",
        number_of_rooms: "",
        house_type: "",
        // Technician
        operational_area: "",
        experience_level: "",
        certifications: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (
        event: React.MouseEvent<HTMLElement>,
        newRole: "owner" | "technician" | "staff" | "admin" | null
    ) => {
        if (newRole !== null) {
            setRole(newRole);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const payload: RegisterRequest = {
                email: formData.email,
                password: formData.password,
                role: role,
                first_name: formData.first_name,
                last_name: formData.last_name,
                contact_number: formData.contact_number,
            };

            if (role === "owner") {
                payload.home_name = formData.home_name;
                payload.home_address = formData.home_address;
                payload.home_size = formData.home_size;
                payload.number_of_rooms = formData.number_of_rooms
                    ? parseInt(formData.number_of_rooms)
                    : undefined;
                payload.house_type = formData.house_type;
            } else {
                payload.operational_area = formData.operational_area;
                payload.experience_level = formData.experience_level;
                payload.certifications = formData.certifications;
            }

            await register(payload).unwrap();
            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.data?.detail || "Registration failed.");
        }
    };

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    py: 4,
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="Smart Home Logo"
                        sx={{ height: 60, mb: 2, display: "block", mx: "auto" }}
                    />
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Create Account
                    </Typography>
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        Join the Smart Home Cloud Platform
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                        <ToggleButtonGroup
                            value={role}
                            exclusive
                            onChange={handleRoleChange}
                            aria-label="User Role"
                            color="primary"
                        >
                            <ToggleButton value="owner">Home Owner</ToggleButton>
                            <ToggleButton value="technician">Technician</ToggleButton>
                            <ToggleButton value="staff">Staff</ToggleButton>
                            <ToggleButton value="admin">Admin</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {/* Common Fields */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Home Owner Specific Fields */}
                            {role === "owner" && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" sx={{ mt: 2 }}>
                                            Home Details
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Home Name"
                                            name="home_name"
                                            value={formData.home_name}
                                            onChange={handleChange}
                                            required
                                            helperText="Give your home a unique name"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            name="home_address"
                                            value={formData.home_address}
                                            onChange={handleChange}
                                            required
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Home Size (sq ft)"
                                            name="home_size"
                                            value={formData.home_size}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Number of Rooms"
                                            name="number_of_rooms"
                                            type="number"
                                            value={formData.number_of_rooms}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="House Type"
                                            name="house_type"
                                            value={formData.house_type}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="Single-family home">
                                                Single-family home
                                            </MenuItem>
                                            <MenuItem value="Townhouse">Townhouse</MenuItem>
                                            <MenuItem value="Condo">Condo</MenuItem>
                                            <MenuItem value="Apartment">Apartment</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </TextField>
                                    </Grid>
                                </>
                            )}

                            {/* Technician Specific Fields */}
                            {role === "technician" && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" sx={{ mt: 2 }}>
                                            Professional Details
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Operational Area"
                                            name="operational_area"
                                            value={formData.operational_area}
                                            onChange={handleChange}
                                            required
                                            helperText="Region or city you cover"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Experience Level"
                                            name="experience_level"
                                            value={formData.experience_level}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Certifications"
                                            name="certifications"
                                            value={formData.certifications}
                                            onChange={handleChange}
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 4, mb: 2 }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </Button>
                        <Box sx={{ textAlign: "center" }}>
                            <MuiLink component={Link} href="/login" variant="body2">
                                Already have an account? Sign in
                            </MuiLink>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
