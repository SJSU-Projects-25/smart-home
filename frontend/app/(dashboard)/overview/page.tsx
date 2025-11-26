"use client";

import { Typography, Box } from "@mui/material";
import { KpiCard } from "@/src/components/KpiCard";

// Force dynamic rendering to prevent SSR
export const dynamic = "force-dynamic";

export default function OverviewPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3, // 24px gap (3 * 8px)
          mt: 3, // 24px top margin (3 * 8px)
        }}
      >
        <KpiCard title="Total Alerts" value={0} />
        <KpiCard title="Open Alerts" value={0} />
        <KpiCard title="Devices" value={0} />
        <KpiCard title="Online Devices" value={0} />
      </Box>
    </>
  );
}
