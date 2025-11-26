"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useListAlertsQuery, useAckAlertMutation, useEscalateAlertMutation, useCloseAlertMutation } from "@/src/api/alerts";
import { AlertsTable } from "@/src/components/AlertsTable";
import { AlertDetailDrawer } from "@/src/components/AlertDetailDrawer";
import { useAlertsWS } from "@/src/ws";
import { RootState } from "@/src/store";
import { Alert as AlertType } from "@/src/types";

export const dynamic = "force-dynamic";

export default function AlertsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const homeId = user?.home_id;

  // WebSocket subscription
  useAlertsWS(homeId);

  // RTK Query hooks
  const { data, isLoading, refetch } = useListAlertsQuery(
    {
      home_id: homeId || "",
      status: statusFilter || undefined,
    },
    { skip: !homeId }
  );

  const [ackAlert] = useAckAlertMutation();
  const [escalateAlert] = useEscalateAlertMutation();
  const [closeAlert] = useCloseAlertMutation();

  // Client-side filtering for severity (backend doesn't support it yet)
  const alerts = (data || []).filter((alert) => {
    if (severityFilter && alert.severity !== severityFilter) {
      return false;
    }
    return true;
  });

  const handleRowClick = (alert: AlertType) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const handleAck = async (alertId: string) => {
    try {
      await ackAlert(alertId).unwrap();
      setSnackbar({ open: true, message: "Alert acknowledged", severity: "success" });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to acknowledge alert", severity: "error" });
    }
  };

  const handleEscalate = async (alertId: string) => {
    try {
      await escalateAlert(alertId).unwrap();
      setSnackbar({ open: true, message: "Alert escalated", severity: "success" });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to escalate alert", severity: "error" });
    }
  };

  const handleClose = async (alertId: string) => {
    try {
      await closeAlert(alertId).unwrap();
      setSnackbar({ open: true, message: "Alert closed", severity: "success" });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to close alert", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Alerts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No home associated with your account. Please contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Alerts
      </Typography>

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
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
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Alerts table */}
      <Card elevation={1}>
        <CardContent>
          <AlertsTable
            alerts={alerts}
            onRowClick={handleRowClick}
            onAck={handleAck}
            onEscalate={handleEscalate}
            onClose={handleClose}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Alert detail drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAck={handleAck}
        onEscalate={handleEscalate}
        onCloseAlert={handleClose}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
