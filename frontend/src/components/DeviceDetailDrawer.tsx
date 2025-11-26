/** Device detail drawer component. */
"use client";

import {
  Drawer,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Device } from "../api/devices";
import dayjs from "dayjs";

interface DeviceDetailDrawerProps {
  device: Device | null;
  open: boolean;
  onClose: () => void;
}

export function DeviceDetailDrawer({
  device,
  open,
  onClose,
}: DeviceDetailDrawerProps) {
  if (!device) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: 1200 }}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">Device Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">{device.name}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">
              {device.type
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={device.status}
              color={device.status === "online" ? "success" : "default"}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          {device.firmware_version && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Firmware Version
              </Typography>
              <Typography variant="body1">{device.firmware_version}</Typography>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Last Seen
            </Typography>
            <Typography variant="body1">
              {device.last_seen_at
                ? dayjs(device.last_seen_at).format("MMM D, YYYY h:mm A")
                : "Never"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {dayjs(device.created_at).format("MMM D, YYYY h:mm A")}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}

