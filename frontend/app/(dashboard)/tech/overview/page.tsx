"use client";

import { Typography, Box, Card, CardContent, CardHeader, Chip, Skeleton, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from "@mui/material";
import {
  Home as HomeIcon,
  Devices as DevicesIcon,
  NotificationsActive as AlertsIcon,
  Event as EventsIcon,
} from "@mui/icons-material";
import { KpiCard } from "@/src/components/KpiCard";
import { EventsByHomeChart } from "@/src/components/charts/EventsByHomeChart";
import { AlertsBySeverityChart } from "@/src/components/charts/AlertsBySeverityChart";
import { DeviceStatusChart } from "@/src/components/charts/DeviceStatusChart";
import { useGetTechOverviewQuery } from "@/src/api/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function TechOverviewPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Check authorization
  if (user && user.role !== "technician" && user.role !== "admin") {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Technician Overview
        </Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          You are not authorized to view this page. This page is only available for Technicians and Administrators.
        </Alert>
      </>
    );
  }

  const { data: overview, isLoading, error } = useGetTechOverviewQuery();

  if (isLoading) {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Technician Overview
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

  if (error) {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Technician Overview
        </Typography>
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to load technician overview. Please try again later.
        </Alert>
      </>
    );
  }

  if (!overview) {
    return null;
  }

  const devicesOffline = overview.totalDevices - overview.devicesOnline;
  const alertsBySeverity = {
    high: overview.highPriorityAlerts,
    medium: Math.max(0, overview.openAlerts - overview.highPriorityAlerts - 0),
    low: 0,
  };

  // Create home names mapping
  const homeNames: Record<string, string> = {};
  overview.homes.forEach((home) => {
    homeNames[home.home_id] = home.home_name;
  });

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Technician Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor your assigned homes and device status
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Assigned Homes"
            value={overview.assignedHomes}
            icon={<HomeIcon />}
            color="primary"
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Total Devices"
            value={overview.totalDevices}
            subtitle={`${overview.devicesOnline} online`}
            icon={<DevicesIcon />}
            color={overview.devicesOnline === overview.totalDevices ? "success" : "warning"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Open Alerts"
            value={overview.openAlerts}
            subtitle={`${overview.highPriorityAlerts} high priority`}
            icon={<AlertsIcon />}
            color={overview.openAlerts > 0 ? "error" : "success"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Events (24h)"
            value={overview.eventsLast24h}
            subtitle="Last 24 hours"
            icon={<EventsIcon />}
            color="info"
          />
        </Box>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
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
                online={overview.devicesOnline}
                offline={devicesOffline}
                height={300}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Alerts by Severity */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Alerts by Severity"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <AlertsBySeverityChart data={alertsBySeverity} height={300} variant="bar" />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Events by Home */}
      {overview.homes.length > 0 && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 4 }}>
          <CardHeader
            title="Events by Home (Last 24h)"
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent sx={{ pt: 3 }}>
            <EventsByHomeChart
              data={overview.homes.map((h) => ({
                home_id: h.home_id,
                count: h.events_last_24h,
              }))}
              homeNames={homeNames}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Assigned Homes Table */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardHeader
          title="Assigned Homes"
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          {overview.homes.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Home</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Devices</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Online</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Alerts</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Events (24h)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.homes.map((home) => (
                    <TableRow key={home.home_id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {home.home_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{home.devices_count}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={home.devices_online}
                          color={home.devices_online === home.devices_count ? "success" : "warning"}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {home.open_alerts > 0 ? (
                          <Chip
                            label={home.open_alerts}
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
                      <TableCell align="right">{home.events_last_24h}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No homes assigned
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

