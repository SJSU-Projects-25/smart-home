"use client";

import { useMemo, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Stack,
  CardHeader,
  Divider,
  Alert as MuiAlert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useListAlertsQuery, AdminAlert, useListHomesQuery } from "@/src/api/admin";
import { KpiCard } from "@/src/components/KpiCard";
import { AlertsBySeverityChart } from "@/src/components/charts/AlertsBySeverityChart";
import { AlertTrendChart } from "@/src/components/charts/AlertTrendChart";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function AdminAlertsPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  // Only admins should see this analytics view
  if (user && user.role !== "admin") {
    return (
      <>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, mb: 4 }}>
          Alerts Analytics
        </Typography>
        <MuiAlert severity="warning" sx={{ mt: 3 }}>
          You are not authorized to view this page. This page is only available for Administrators.
        </MuiAlert>
      </>
    );
  }

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [trendPeriod, setTrendPeriod] = useState<"24h" | "7d" | "30d">("7d");

  const { data: alerts, isLoading, error } = useListAlertsQuery({
    status: undefined,
    severity: undefined,
  });

  // Load homes so we can show human-friendly names in "Top Homes by Alerts"
  const { data: homesData } = useListHomesQuery();

  const allAlerts: AdminAlert[] = alerts || [];

  const totalAlerts = allAlerts.length;
  const openAlerts = allAlerts.filter((a) => a.status === "open").length;
  const highSeverityAlerts = allAlerts.filter((a) => a.severity === "high").length;
  const homesWithAlerts = new Set(allAlerts.map((a) => a.home_id)).size;

  const severityCounts = useMemo(
    () =>
      allAlerts.reduce(
        (acc, alert) => {
          acc[alert.severity] += 1;
          return acc;
        },
        { high: 0, medium: 0, low: 0 } as { high: number; medium: number; low: number }
      ),
    [allAlerts]
  );

  const statusCounts = useMemo(
    () =>
      allAlerts.reduce(
        (acc, alert) => {
          acc[alert.status] = (acc[alert.status] || 0) + 1;
          return acc;
        },
        { open: 0, acked: 0, escalated: 0, closed: 0 } as Record<AdminAlert["status"], number>
      ),
    [allAlerts]
  );

  const homeNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (homesData) {
      homesData.forEach((home) => {
        map[home.id] = home.name;
      });
    }
    return map;
  }, [homesData]);

  const alertsByHome = useMemo(() => {
    const grouped: Record<string, number> = {};
    allAlerts.forEach((alert) => {
      grouped[alert.home_id] = (grouped[alert.home_id] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([homeId, count]) => ({
        homeId,
        homeName: homeNameMap[homeId] || `Home ${homeId.substring(0, 8)}...`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [allAlerts, homeNameMap]);

  // Trend by severity using created_at timestamps and selectable period
  const trendData = useMemo(() => {
    const buckets: Record<
      string,
      {
        date: string;
        high: number;
        medium: number;
        low: number;
      }
    > = {};

    allAlerts.forEach((alert) => {
      const ts = dayjs(alert.created_at);
      const key =
        trendPeriod === "24h"
          ? ts.startOf("hour").format("YYYY-MM-DD HH:00")
          : ts.startOf("day").format("YYYY-MM-DD");

      if (!buckets[key]) {
        buckets[key] = {
          date: key,
          high: 0,
          medium: 0,
          low: 0,
        };
      }
      buckets[key][alert.severity] += 1;
    });

    const cutoff =
      trendPeriod === "24h"
        ? dayjs().subtract(24, "hour")
        : trendPeriod === "7d"
        ? dayjs().subtract(7, "day")
        : dayjs().subtract(30, "day");

    return Object.values(buckets)
      .filter((item) => {
        const ts = trendPeriod === "24h" ? dayjs(item.date, "YYYY-MM-DD HH:00") : dayjs(item.date);
        return ts.isAfter(cutoff);
      })
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [allAlerts, trendPeriod]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "error";
      case "acked":
        return "info";
      case "escalated":
        return "warning";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    { field: "type", headerName: "Type", width: 150 },
    {
      field: "severity",
      headerName: "Severity",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getSeverityColor(params.value)} size="small" />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getStatusColor(params.value)} size="small" />
      ),
    },
    { field: "score", headerName: "Score", width: 100, type: "number" },
    {
      field: "home_id",
      headerName: "Home",
      width: 140,
      valueGetter: (value) => (value ? String(value).substring(0, 8) + "..." : "N/A"),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY HH:mm"),
    },
  ];

  const filteredAlertsForTable = useMemo(() => {
    return allAlerts.filter((alert) => {
      if (statusFilter && alert.status !== statusFilter) {
        return false;
      }
      if (severityFilter && alert.severity !== severityFilter) {
        return false;
      }
      return true;
    });
  }, [allAlerts, statusFilter, severityFilter]);

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Alerts Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fleet‑wide alert insights across all homes and users
        </Typography>
      </Box>

      {error && (
        <MuiAlert severity="error" sx={{ mb: 3 }}>
          Failed to load alerts. Please try again later.
        </MuiAlert>
      )}

      {/* KPI row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard title="Total Alerts" value={totalAlerts} color="primary" />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="Open Alerts"
            value={openAlerts}
            color={openAlerts > 0 ? "error" : "success"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard
            title="High Severity"
            value={highSeverityAlerts}
            color={highSeverityAlerts > 0 ? "error" : "success"}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
          <KpiCard title="Homes with Alerts" value={homesWithAlerts} color="info" />
        </Box>
      </Box>

      {/* Charts row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Alert Trends"
              subheader={`Last ${
                trendPeriod === "24h" ? "24 hours" : trendPeriod === "7d" ? "7 days" : "30 days"
              }`}
              sx={{ pb: 1 }}
              action={
                <ToggleButtonGroup
                  size="small"
                  value={trendPeriod}
                  exclusive
                  onChange={(_, value) => value && setTrendPeriod(value)}
                >
                  <ToggleButton value="24h">24h</ToggleButton>
                  <ToggleButton value="7d">7d</ToggleButton>
                  <ToggleButton value="30d">30d</ToggleButton>
                </ToggleButtonGroup>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <AlertTrendChart data={trendData} period={trendPeriod} height={280} />
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title="Alerts by Severity" sx={{ pb: 1 }} />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <AlertsBySeverityChart data={severityCounts} height={280} variant="bar" />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Status distribution + Top homes */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title="Alerts by Status" sx={{ pb: 1 }} />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Stack spacing={1.5}>
                {(["open", "acked", "escalated", "closed"] as AdminAlert["status"][]).map(
                  (statusKey) => (
                    <Box
                      key={statusKey}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Chip
                          label={statusKey}
                          size="small"
                          color={getStatusColor(statusKey) as any}
                          sx={{ textTransform: "capitalize" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {statusCounts[statusKey]} alerts
                        </Typography>
                      </Box>
                    </Box>
                  )
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title="Top Homes by Alerts" sx={{ pb: 1 }} />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              {alertsByHome.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No alerts yet across homes.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {alertsByHome.map((item) => (
                    <Box
                      key={item.homeId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.homeName}
                      </Typography>
                      <Chip
                        label={item.count}
                        size="small"
                        color={
                          item.count > 10 ? "error" : item.count > 5 ? "warning" : "default"
                        }
                        sx={{ height: 22 }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Raw alerts table for deep inspection */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardHeader
          title="Raw Alerts (Debug View)"
          subheader="Full alerts list for advanced troubleshooting and validation"
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2, alignItems: { xs: "stretch", sm: "center" } }}
          >
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 160 }}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="acked">Acknowledged</MenuItem>
              <MenuItem value="escalated">Escalated</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
              select
              label="Severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              sx={{ minWidth: 160 }}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
          </Stack>

          <DataGrid
            rows={filteredAlertsForTable}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
