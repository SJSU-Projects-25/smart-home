"use client";

import { Typography, Box, Card, CardContent, CardHeader, Grid, Chip, Skeleton, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme } from "@mui/material";
import { KpiCard } from "@/src/components/KpiCard";
import { AlertsBySeverityChart } from "@/src/components/charts/AlertsBySeverityChart";
import { EventsByHomeChart } from "@/src/components/charts/EventsByHomeChart";
import { DeviceUptimeGauge } from "@/src/components/charts/DeviceUptimeGauge";
import { useGetOpsOverviewQuery, useGetAlertsHeatmapQuery } from "@/src/api/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function OpsOverviewPage() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Check authorization
  if (user && user.role !== "staff" && user.role !== "admin") {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          Operations Overview
        </Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          You are not authorized to view this page. This page is only available for Operations staff and Administrators.
        </Alert>
      </>
    );
  }

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useGetOpsOverviewQuery();
  const { data: heatmap, isLoading: heatmapLoading } = useGetAlertsHeatmapQuery({ period: "24h" });

  if (overviewLoading) {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          Operations Overview
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
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
          Operations Overview
        </Typography>
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to load operations overview. Please try again later.
        </Alert>
      </>
    );
  }

  if (!overview) {
    return null;
  }

  const totalAlerts = overview.openAlertsBySeverity.high + overview.openAlertsBySeverity.medium + overview.openAlertsBySeverity.low;
  const onlinePercentage = overview.totalDevices > 0 
    ? (overview.totalDevicesOnline / overview.totalDevices) * 100 
    : 0;

  // Create home names mapping for charts
  const homeNames: Record<string, string> = {};
  if (heatmap?.data) {
    heatmap.data.forEach((item) => {
      homeNames[item.home_id] = item.home_name;
    });
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Operations Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Homes" value={overview.totalHomes} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Devices" value={overview.totalDevices} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Devices Online"
            value={overview.totalDevicesOnline}
            subtitle={`${onlinePercentage.toFixed(1)}% uptime`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Alerts"
            value={totalAlerts}
            subtitle={`High: ${overview.openAlertsBySeverity.high}`}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Alerts by Severity */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader title="Alerts Distribution by Severity" />
            <CardContent>
              <AlertsBySeverityChart 
                data={overview.openAlertsBySeverity} 
                height={350} 
                variant="bar"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Events by Home */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader title="Events by Home (Last 24h)" />
            <CardContent>
              {overview.eventsByHomeLast24h && overview.eventsByHomeLast24h.length > 0 ? (
                <EventsByHomeChart 
                  data={overview.eventsByHomeLast24h} 
                  homeNames={homeNames}
                  height={350}
                />
              ) : (
                <Box sx={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No events data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* System Health Gauge */}
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader title="System Health" />
            <CardContent>
              <DeviceUptimeGauge
                uptimePercent={onlinePercentage}
                deviceName="Overall System"
                height={250}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Heatmap Table */}
        <Grid item xs={12} md={8}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader title="Alerts Heatmap by Home (Last 24h)" />
            <CardContent>
              {heatmapLoading ? (
                <Skeleton variant="rectangular" height={250} />
              ) : heatmap && heatmap.data.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Home</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">High</TableCell>
                        <TableCell align="right">Medium</TableCell>
                        <TableCell align="right">Low</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {heatmap.data.map((item) => (
                        <TableRow key={item.home_id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {item.home_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={item.total_alerts}
                              color={item.total_alerts > 10 ? "error" : item.total_alerts > 5 ? "warning" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {item.alerts_by_severity.high > 0 ? (
                              <Chip label={item.alerts_by_severity.high} color="error" size="small" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">0</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {item.alerts_by_severity.medium > 0 ? (
                              <Chip label={item.alerts_by_severity.medium} color="warning" size="small" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">0</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {item.alerts_by_severity.low > 0 ? (
                              <Chip label={item.alerts_by_severity.low} color="default" size="small" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">0</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No alerts data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Device Uptime Summary */}
      <Card elevation={1}>
        <CardHeader title="Device Uptime Summary (Top 10)" />
        <CardContent>
          {overview.deviceUptimeSummary && overview.deviceUptimeSummary.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Device ID</TableCell>
                    <TableCell align="right">Events (7d)</TableCell>
                    <TableCell align="right">Last Event</TableCell>
                    <TableCell align="right">Uptime %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.deviceUptimeSummary
                    .sort((a, b) => b.uptime_percent - a.uptime_percent)
                    .slice(0, 10)
                    .map((device) => (
                      <TableRow key={device.device_id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {device.device_id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{device.event_count}</TableCell>
                        <TableCell align="right">
                          {device.last_event ? (
                            <Typography variant="body2" color="text.secondary">
                              {new Date(device.last_event).toLocaleDateString()}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${device.uptime_percent.toFixed(1)}%`}
                            color={
                              device.uptime_percent >= 90
                                ? "success"
                                : device.uptime_percent >= 70
                                ? "warning"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No device uptime data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  );
}
