/** Alert detail drawer component. */
"use client";

import {
  Drawer,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Stack,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EscalatorWarningIcon from "@mui/icons-material/EscalatorWarning";
import { Alert } from "../types";
import dayjs from "dayjs";

interface AlertDetailDrawerProps {
  alert: Alert | null;
  open: boolean;
  onClose: () => void;
  onAck: (alertId: string) => void;
  onEscalate: (alertId: string) => void;
  onCloseAlert: (alertId: string) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "low":
      return "default";
    case "medium":
      return "warning";
    case "high":
      return "error";
    default:
      return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "primary";
    case "acked":
      return "default";
    case "escalated":
      return "warning";
    case "closed":
      return "default";
    default:
      return "default";
  }
};

export function AlertDetailDrawer({
  alert,
  open,
  onClose,
  onAck,
  onEscalate,
  onCloseAlert,
}: AlertDetailDrawerProps) {
  if (!alert) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: 1200 }}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">Alert Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">
              {alert.type
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Severity
            </Typography>
            <Chip
              label={alert.severity}
              color={getSeverityColor(alert.severity) as any}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={alert.status}
              color={getStatusColor(alert.status) as any}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          {alert.score !== null && alert.score !== undefined && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Score
              </Typography>
              <Typography variant="body1">{alert.score.toFixed(2)}</Typography>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {dayjs(alert.created_at).format("MMM D, YYYY h:mm A")}
            </Typography>
          </Box>

          {alert.acked_at && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Acknowledged At
              </Typography>
              <Typography variant="body1">
                {dayjs(alert.acked_at).format("MMM D, YYYY h:mm A")}
              </Typography>
            </Box>
          )}

          {alert.escalated_at && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Escalated At
              </Typography>
              <Typography variant="body1">
                {dayjs(alert.escalated_at).format("MMM D, YYYY h:mm A")}
              </Typography>
            </Box>
          )}

          {alert.closed_at && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Closed At
              </Typography>
              <Typography variant="body1">
                {dayjs(alert.closed_at).format("MMM D, YYYY h:mm A")}
              </Typography>
            </Box>
          )}

          {alert.notes && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body1">{alert.notes}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2}>
            {alert.status === "open" && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    onAck(alert.id);
                    onClose();
                  }}
                  size="small"
                >
                  Ack
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EscalatorWarningIcon />}
                  onClick={() => {
                    onEscalate(alert.id);
                    onClose();
                  }}
                  size="small"
                >
                  Escalate
                </Button>
              </>
            )}
            {alert.status !== "closed" && (
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => {
                  onCloseAlert(alert.id);
                  onClose();
                }}
                size="small"
              >
                Close
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
