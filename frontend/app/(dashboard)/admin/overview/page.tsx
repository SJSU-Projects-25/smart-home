"use client";

import { Typography, Box, Card, CardContent, CardHeader, Chip, Skeleton, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from "@mui/material";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Devices as DevicesIcon,
  NotificationsActive as AlertsIcon,
  Event as EventsIcon,
} from "@mui/icons-material";
import { KpiCard } from "@/src/components/KpiCard";
import { EventsByHomeChart } from "@/src/components/charts/EventsByHomeChart";
import { AlertsBySeverityChart } from "@/src/components/charts/AlertsBySeverityChart";
import { DeviceStatusChart } from "@/src/components/charts/DeviceStatusChart";
import { useGetAdminOverviewQuery } from "@/src/api/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function AdminOverviewPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Check authorization
  if (user && user.role !== "admin") {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Admin Overview
        </Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          You are not authorized to view this page. This page is only available for Administrators.
        </Alert>
      </>
    );
  }

  const { data: overview, isLoading, error } = useGetAdminOverviewQuery();

  if (isLoading) {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Admin Overview
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box key={i} sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(33.333% - 16px)" } }}>
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
          Admin Overview
        </Typography>
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to load admin overview. Please try again later.
        </Alert>
      </>
    );
  }

  if (!overview) {
    return null;
  }

  const devicesOffline = overview.totalDevices - overview.totalDevicesOnline;
  const totalAlerts = overview.openAlertsBySeverity.high + overview.openAlertsBySeverity.medium + overview.openAlertsBySeverity.low;

  // Create home names mapping
  const homeNames: Record<string, string> = {};
  if (overview.topHomesByAlerts) {
    overview.topHomesByAlerts.forEach((home) => {
      homeNames[home.home_id] = home.home_name;
    });
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Admin Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform-wide statistics and analytics
        </Typography>
      </Box>

      {/* KPI Cards Row 1 */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Total Homes"
            value={overview.totalHomes}
            icon={<HomeIcon />}
            color="primary"
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Total Users"
            value={overview.totalUsers}
            icon={<PeopleIcon />}
            color="info"
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Total Devices"
            value={overview.totalDevices}
            subtitle={`${overview.totalDevicesOnline} online`}
            icon={<DevicesIcon />}
            color={overview.totalDevicesOnline === overview.totalDevices ? "success" : "warning"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Total Alerts"
            value={totalAlerts}
            subtitle={`${overview.openAlertsBySeverity.high} high`}
            icon={<AlertsIcon />}
            color={totalAlerts > 0 ? "error" : "success"}
          />
        </Box>
      </Box>

      {/* KPI Cards Row 2 */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Events (24h)"
            value={overview.totalEventsLast24h}
            subtitle="Platform-wide"
            icon={<EventsIcon />}
            color="info"
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Owners"
            value={overview.usersByRole.owner}
            subtitle="User count"
            color="primary"
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Technicians"
            value={overview.usersByRole.technician}
            subtitle="User count"
            color="info"
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Staff"
            value={overview.usersByRole.staff}
            subtitle="User count"
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
              title="Platform Device Status"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <DeviceStatusChart
                online={overview.totalDevicesOnline}
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
              title="Alerts Distribution"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <AlertsBySeverityChart data={overview.openAlertsBySeverity} height={300} variant="bar" />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Events by Home */}
      {overview.eventsByHomeLast24h && overview.eventsByHomeLast24h.length > 0 && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 4 }}>
          <CardHeader
            title="Events by Home (Last 24h)"
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent sx={{ pt: 3 }}>
            <EventsByHomeChart
              data={overview.eventsByHomeLast24h}
              homeNames={homeNames}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Top Homes by Alerts */}
      {overview.topHomesByAlerts && overview.topHomesByAlerts.length > 0 && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 4 }}>
          <CardHeader
            title="Top Homes by Alerts"
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent sx={{ pt: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Home</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Open Alerts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.topHomesByAlerts.map((home) => (
                    <TableRow key={home.home_id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {home.home_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={home.alert_count}
                          color={home.alert_count > 10 ? "error" : home.alert_count > 5 ? "warning" : "default"}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Users by Role */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardHeader
          title="Users by Role"
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {Object.entries(overview.usersByRole).map(([role, count]) => (
              <Box
                key={role}
                sx={{
                  flex: { xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(25% - 12px)" },
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 400, mb: 0.5 }}>
                  {count}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  {role}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

