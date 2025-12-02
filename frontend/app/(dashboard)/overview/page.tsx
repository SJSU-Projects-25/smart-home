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
  Divider,
} from "@mui/material";
import {
  NotificationsActive as AlertsIcon,
  Devices as DevicesIcon,
  Event as EventsIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { KpiCard } from "@/src/components/KpiCard";
import { EventsOverTimeChart } from "@/src/components/charts/EventsOverTimeChart";
import { AlertsBySeverityChart } from "@/src/components/charts/AlertsBySeverityChart";
import { DeviceStatusChart } from "@/src/components/charts/DeviceStatusChart";
import { RoomActivityChart } from "@/src/components/charts/RoomActivityChart";
import { AlertTrendChart } from "@/src/components/charts/AlertTrendChart";
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Overview
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
      </>
    );
  }

  if (overviewError) {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
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

  const devicesOffline = overviewData.totalDevices - overviewData.devicesOnlineCount;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor your smart home activity and device status
        </Typography>
      </Box>

      {/* KPI Cards Row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 , mb: 4 }}>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Open Alerts"
            value={overviewData.openAlertsCount}
            subtitle={`${overviewData.openAlertsHigh} high priority`}
            icon={<AlertsIcon />}
            color={overviewData.openAlertsCount > 0 ? "error" : "success"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Devices Online"
            value={overviewData.devicesOnlineCount}
            subtitle={`of ${overviewData.totalDevices} total`}
            icon={<DevicesIcon />}
            color={overviewData.devicesOnlineCount === overviewData.totalDevices ? "success" : "warning"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Events (24h)"
            value={overviewData.eventsLast24h}
            subtitle="Last 24 hours"
            icon={<EventsIcon />}
            color="info"
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Rooms"
            value={overviewData.roomsCount || 0}
            subtitle="Total rooms"
            icon={<HomeIcon />}
            color="primary"
          />
        </Box>
      </Box>

      {/* Charts Row 1: Events and Alerts */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 , mb: 4 }}>
        {/* Events Over Time */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 calc(66.666% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardHeader
              title="Events Activity"
              subheader="Last 24 hours"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              {eventsTimeseries?.data ? (
                <EventsOverTimeChart data={eventsTimeseries.data} height={320} />
              ) : (
                <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading events data...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Alerts by Severity */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 calc(33.333% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardHeader
              title="Alerts by Severity"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <AlertsBySeverityChart data={alertsBySeverity} height={320} variant="pie" />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts Row 2: Device Status and Alert Trends */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 , mb: 4 }}>
        {/* Device Status */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Device Status"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <DeviceStatusChart
                online={overviewData.devicesOnlineCount}
                offline={devicesOffline}
                height={280}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Alert Trends */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Alert Trends"
              subheader="Last 7 days"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              {overviewData.alertTrends ? (
                <AlertTrendChart data={overviewData.alertTrends} height={280} period="7d" />
              ) : (
                <Box sx={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No alert trend data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts Row 3: Room Activity and Device Health */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 , mb: 4 }}>
        {/* Room Activity */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(66.666% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Room Activity"
              subheader="Devices and alerts per room"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              {overviewData.perRoomStats && overviewData.perRoomStats.length > 0 ? (
                <RoomActivityChart
                  data={overviewData.perRoomStats.map((room) => ({
                    room_id: room.room_id,
                    room_name: room.room_name,
                    device_count: room.devices_count,
                    alert_count: room.alert_count || 0,
                  }))}
                  height={300}
                  metric="devices"
                />
              ) : (
                <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No room data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Device Health Summary */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="System Health"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              {overviewData.devicesOnlineCount > 0 ? (
                <DeviceUptimeGauge
                  uptimePercent={(overviewData.devicesOnlineCount / overviewData.totalDevices) * 100}
                  deviceName="Overall System"
                  height={250}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No device data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Alerts and Rooms Table */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {/* Recent Alerts */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Recent Alerts"
              action={
                <Button size="small" component={Link} href="/alerts" variant="text">
                  View all
                </Button>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              {recentAlerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  No recent alerts
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentAlerts.map((alert: AlertType, index: number) => (
                    <Box key={alert.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {alert.type
                                  .split("_")
                                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(" ")}
                              </Typography>
                              <Chip
                                label={alert.severity}
                                color={getSeverityColor(alert.severity) as any}
                                size="small"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(alert.created_at).format("MMM D, YYYY h:mm A")}
                              {alert.room_id && ` • Room: ${alert.room_id}`}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentAlerts.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Rooms & Devices Table */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Rooms & Devices"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              {overviewData.perRoomStats && overviewData.perRoomStats.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Devices</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Alerts</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {overviewData.perRoomStats.map((room) => (
                        <TableRow key={room.room_id} hover>
                          <TableCell>{room.room_name}</TableCell>
                          <TableCell align="right">{room.devices_count}</TableCell>
                          <TableCell align="right">
                            {room.alert_count && room.alert_count > 0 ? (
                              <Chip
                                label={room.alert_count}
                                color="error"
                                size="small"
                                sx={{ height: 20 }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                0
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  {overviewData.roomsCount
                    ? `Total rooms: ${overviewData.roomsCount}`
                    : "No room data available"}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
