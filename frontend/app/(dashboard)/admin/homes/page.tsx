"use client";

import { Typography } from "@mui/material";

// Force dynamic rendering to prevent SSR
export const dynamic = "force-dynamic";

export default function AdminHomesPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Homes
      </Typography>
      <Typography variant="body1">TODO: Admin Homes page</Typography>
    </>
  );
}
