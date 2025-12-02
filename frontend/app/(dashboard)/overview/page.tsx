"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Typography, Box, Card, CardContent, List, ListItem, ListItemText, Chip, Paper } from "@mui/material";
import { KpiCard } from "@/src/components/KpiCard";
import { useListAlertsQuery } from "@/src/api/alerts";
import { useListDevicesQuery } from "@/src/api/devices";
import { useAlertsWS } from "@/src/ws";
import { RootState } from "@/src/store";
import { Alert } from "@/src/types";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);

  // Redirect if no home assigned
  useEffect(() => {
    if (user && !homeId) {
      router.push("/no-home");
    }
  }, [user, homeId, router]);

  // WebSocket subscription for live alerts
  useAlertsWS(homeId);

  // Fetch alerts
  const { data: alertsData } = useListAlertsQuery(
    { home_id: homeId || "", status: "open" },
    { skip: !homeId, refetchOnMountOrArgChange: true }
  );

  // Fetch devices
  const { data: devicesData } = useListDevicesQuery(
    { home_id: homeId || "" },
    { skip: !homeId }
  );

  const alerts = alertsData || [];
  const devices = devicesData || [];

  // Update recent alerts when new data arrives
  useEffect(() => {
    if (alertsData) {
      setRecentAlerts(alertsData.slice(0, 5)); // Show last 5 alerts
    }
  }, [alertsData]);

  const openAlertsCount = alerts.length;
  const onlineDevicesCount = devices.filter((d) => d.status === "online").length;
  const totalDevicesCount = devices.length;

  // Don't render if no homeId (will redirect)
  if (!homeId) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>

      {/* KPI Cards */}
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
          mb: 3,
        }}
      >
        <KpiCard title="Open Alerts" value={openAlertsCount} />
        <KpiCard title="Devices Online" value={onlineDevicesCount} subtitle={`of ${totalDevicesCount} total`} />
        <KpiCard title="Total Devices" value={totalDevicesCount} />
      </Box>

      {/* Live Alerts Feed */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Alerts
          </Typography>
          {recentAlerts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recent alerts
            </Typography>
          ) : (
            <List>
              {recentAlerts.map((alert) => (
                <ListItem key={alert.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1">
                          {alert.type
                            .split("_")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        {dayjs(alert.created_at).format("MMM D, YYYY h:mm A")}
                        {alert.room_id && ` • Room: ${alert.room_id}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Rooms Heatmap Placeholder */}
      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Rooms Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Room heatmap visualization coming soon
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
