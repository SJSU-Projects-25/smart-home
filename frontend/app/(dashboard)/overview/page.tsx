"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Skeleton,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { KpiCard } from "@/src/components/KpiCard";
import { EventsOverTimeChart } from "@/src/components/charts/EventsOverTimeChart";
import { AlertsBySeverityChart } from "@/src/components/charts/AlertsBySeverityChart";
import { DeviceUptimeGauge } from "@/src/components/charts/DeviceUptimeGauge";
import { useGetOwnerOverviewQuery, useGetOwnerEventsTimeseriesQuery } from "@/src/api/analytics";
import { useListAlertsQuery } from "@/src/api/alerts";
import { useAlertsWS } from "@/src/ws";
import { RootState } from "@/src/store";
import { Alert as AlertType } from "@/src/types";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;

  // Redirect if no home assigned
  useEffect(() => {
    if (user && !homeId) {
      router.push("/no-home");
    }
  }, [user, homeId, router]);

  // WebSocket subscription for live alerts
  useAlertsWS(homeId);

  // Fetch analytics data
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
  } = useGetOwnerOverviewQuery(
    { home_id: homeId || "" },
    { skip: !homeId, refetchOnMountOrArgChange: true }
  );

  // Fetch events time-series data
  const { data: eventsTimeseries } = useGetOwnerEventsTimeseriesQuery(
    { home_id: homeId || "", hours: 24 },
    { skip: !homeId, refetchOnMountOrArgChange: true }
  );

  // Fetch recent alerts
  const { data: alertsData } = useListAlertsQuery(
    { home_id: homeId || "", status: "open" },
    { skip: !homeId, refetchOnMountOrArgChange: true }
  );

  // Don't render if no homeId (will redirect)
  if (!homeId) {
    return null;
  }

  const recentAlerts = (alertsData || []).slice(0, 5);

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

  if (overviewLoading) {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </>
    );
  }

  if (overviewError) {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          Overview
        </Typography>
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to load overview data. Please try again later.
        </Alert>
      </>
    );
  }

  if (!overviewData) {
    return null;
  }

  // Calculate alerts by severity
  const alertsBySeverity = {
    high: recentAlerts.filter((a: AlertType) => a.severity === "high").length,
    medium: recentAlerts.filter((a: AlertType) => a.severity === "medium").length,
    low: recentAlerts.filter((a: AlertType) => a.severity === "low").length,
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard title="Open Alerts" value={overviewData.openAlertsCount} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            title="Devices Online"
            value={overviewData.devicesOnlineCount}
            subtitle={`of ${overviewData.totalDevices} total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard title="Events (Last 24h)" value={overviewData.eventsLast24h} />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Events Over Time Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader title="Events Activity (Last 24 Hours)" />
            <CardContent>
              {eventsTimeseries?.data ? (
                <EventsOverTimeChart data={eventsTimeseries.data} height={350} />
              ) : (
                <Box sx={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading events data...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts by Severity Chart */}
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader title="Alerts by Severity" />
            <CardContent>
              <AlertsBySeverityChart data={alertsBySeverity} height={350} variant="pie" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row: Recent Alerts and Device Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardHeader
              title="Recent Alerts"
              action={
                <Button size="small" component={Link} href="/alerts">
                  View all
                </Button>
              }
            />
            <CardContent>
              {recentAlerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent alerts
                </Typography>
              ) : (
                <List>
                  {recentAlerts.map((alert: AlertType) => (
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
        </Grid>

        {/* Device Uptime Summary */}
        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardHeader title="Device Health Summary" />
            <CardContent>
              {overviewData.devicesOnlineCount > 0 ? (
                <Box>
                  <DeviceUptimeGauge
                    uptimePercent={(overviewData.devicesOnlineCount / overviewData.totalDevices) * 100}
                    deviceName="Overall System"
                  />
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    {overviewData.devicesOnlineCount} of {overviewData.totalDevices} devices online
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No device data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Third Row: Rooms & Devices */}
      <Card elevation={1}>
        <CardHeader title="Rooms & Devices" />
        <CardContent>
          {overviewData.perRoomStats && overviewData.perRoomStats.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Room</TableCell>
                    <TableCell align="right">Devices</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overviewData.perRoomStats.map((room) => (
                    <TableRow key={room.room_id}>
                      <TableCell>{room.room_name}</TableCell>
                      <TableCell align="right">{room.devices_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {overviewData.roomsCount
                ? `Total rooms: ${overviewData.roomsCount}`
                : "No room data available"}
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  );
}
