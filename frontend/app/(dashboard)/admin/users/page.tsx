"use client";

import { Typography } from "@mui/material";

// Force dynamic rendering to prevent SSR
export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <Typography variant="body1">TODO: Admin Users page</Typography>
    </>
  );
}
