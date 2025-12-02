"use client";

import { Box, Typography, Paper, Alert } from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

export default function NoHomePage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        px: 3,
      }}
    >
      <Paper elevation={2} sx={{ p: 4, maxWidth: 600, width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <ContactSupportIcon sx={{ fontSize: 64, color: "text.secondary" }} />
          <Typography variant="h5" component="h1" align="center">
            No Home Assigned
          </Typography>
          <Alert severity="info" sx={{ width: "100%", mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Your account is not currently associated with a home.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please contact support to get your account set up with a home assignment.
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Box>
  );
}

