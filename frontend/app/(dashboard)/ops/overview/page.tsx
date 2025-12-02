"use client";

import { Typography, Box, Card, CardContent, CardHeader, Chip, Skeleton, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from "@mui/material";
import {
  Home as HomeIcon,
  Devices as DevicesIcon,
  NotificationsActive as AlertsIcon,
  Event as EventsIcon,
} from "@mui/icons-material";
import { KpiCard } from "@/src/components/KpiCard";
import { AlertsBySeverityChart } from "@/src/components/charts/AlertsBySeverityChart";
import { EventsByHomeChart } from "@/src/components/charts/EventsByHomeChart";
import { DeviceStatusChart } from "@/src/components/charts/DeviceStatusChart";
import { useGetOpsOverviewQuery, useGetAlertsHeatmapQuery } from "@/src/api/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function OpsOverviewPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Check authorization
  if (user && user.role !== "staff" && user.role !== "admin") {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Operations Overview
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
  const devicesOffline = overview.totalDevices - overview.totalDevicesOnline;

  // Create home names mapping for charts
  const homeNames: Record<string, string> = {};
  if (heatmap?.data) {
    heatmap.data.forEach((item) => {
      homeNames[item.home_id] = item.home_name;
    });
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Operations Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor platform-wide operations and system health
        </Typography>
      </Box>

      {/* KPI Cards */}
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
            subtitle={`${overview.openAlertsBySeverity.high} high priority`}
            icon={<AlertsIcon />}
            color={totalAlerts > 0 ? "error" : "success"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Events (24h)"
            value={overview.eventsByHomeLast24h.reduce((sum, item) => sum + item.count, 0)}
            subtitle="Platform-wide"
            icon={<EventsIcon />}
            color="info"
          />
        </Box>
      </Box>

      {/* Charts Row 1 */}
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
              title="Alerts Distribution by Severity"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <AlertsBySeverityChart 
                data={overview.openAlertsBySeverity} 
                height={300} 
                variant="bar"
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts Row 2 */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {/* Events by Home */}
        <Box sx={{ flex: { xs: "1 1 100%" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Events by Home (Last 24h)"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
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
        </Box>
      </Box>

      {/* Alerts Heatmap Table */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 4 }}>
        <CardHeader
          title="Alerts Heatmap by Home (Last 24h)"
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          {heatmapLoading ? (
            <Skeleton variant="rectangular" height={250} />
          ) : heatmap && heatmap.data.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Home</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>High</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Medium</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Low</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {heatmap.data.map((item) => (
                    <TableRow key={item.home_id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.home_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.total_alerts}
                          color={item.total_alerts > 10 ? "error" : item.total_alerts > 5 ? "warning" : "default"}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {item.alerts_by_severity.high > 0 ? (
                          <Chip label={item.alerts_by_severity.high} color="error" size="small" sx={{ height: 20 }} />
                        ) : (
                          <Typography variant="body2" color="text.secondary">0</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {item.alerts_by_severity.medium > 0 ? (
                          <Chip label={item.alerts_by_severity.medium} color="warning" size="small" sx={{ height: 20 }} />
                        ) : (
                          <Typography variant="body2" color="text.secondary">0</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {item.alerts_by_severity.low > 0 ? (
                          <Chip label={item.alerts_by_severity.low} color="default" size="small" sx={{ height: 20 }} />
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
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No alerts data available
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Device Uptime Summary */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardHeader
          title="Device Uptime Summary (Top 10)"
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          {overview.deviceUptimeSummary && overview.deviceUptimeSummary.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Device ID</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Events (7d)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Last Event</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Uptime %</TableCell>
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
                            sx={{ height: 20 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No device uptime data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
