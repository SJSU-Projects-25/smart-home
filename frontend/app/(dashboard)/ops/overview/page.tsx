"use client";

import { Typography, Box, Card, CardContent } from "@mui/material";
import { KpiCard } from "@/src/components/KpiCard";
import { useGetOpsOverviewQuery } from "@/src/api/ops";

export const dynamic = "force-dynamic";

export default function OpsOverviewPage() {
  const { data: overview, isLoading } = useGetOpsOverviewQuery(undefined, {
    skip: false, // Will need backend endpoint
  });

  // For now, show placeholder data until backend implements GET /ops/overview
  const data = overview || {
    total_homes: 0,
    total_devices_online: 0,
    open_alerts_by_severity: { low: 0, medium: 0, high: 0 },
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Operations Overview
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
          mt: 3,
        }}
      >
        <KpiCard title="Total Homes" value={data.total_homes} />
        <KpiCard title="Total Devices Online" value={data.total_devices_online} />
        <KpiCard
          title="Open Alerts (High)"
          value={data.open_alerts_by_severity.high}
          subtitle={`Medium: ${data.open_alerts_by_severity.medium}, Low: ${data.open_alerts_by_severity.low}`}
        />
      </Box>

      <Card elevation={1} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alerts Heatmap by Home
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Heatmap visualization coming soon
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Uptime Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uptime statistics coming soon
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
