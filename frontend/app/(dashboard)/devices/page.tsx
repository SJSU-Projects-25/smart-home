"use client";

import { useState, useMemo } from "react";
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
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useListDevicesQuery } from "@/src/api/devices";
import { DeviceDetailDrawer } from "@/src/components/DeviceDetailDrawer";
import { RootState } from "@/src/store";
import { Device } from "@/src/api/devices";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function DevicesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const homeId = user?.home_id;

  const { data: devicesData, isLoading, error } = useListDevicesQuery(
    {
      home_id: homeId || "",
      status: statusFilter || undefined,
    },
    { skip: !homeId || !user }
  );

  // Filter out camera devices and apply status filter
  const devices = useMemo(() => {
    if (!devicesData) return [];
    
    return devicesData.filter((device) => {
      // Filter out camera devices (video is out of scope)
      const deviceType = device.type?.toLowerCase() || "";
      if (deviceType === "camera" || deviceType === "cam") {
        return false;
      }
      
      // Apply status filter
      if (statusFilter && device.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [devicesData, statusFilter]);

  // Group devices by room
  const devicesByRoom = useMemo(() => {
    const grouped: Record<string, Device[]> = {};
    const unassigned: Device[] = [];

    devices.forEach((device) => {
      if (device.room_id && device.room_name) {
        if (!grouped[device.room_id]) {
          grouped[device.room_id] = [];
        }
        grouped[device.room_id].push(device);
      } else {
        unassigned.push(device);
      }
    });

    if (unassigned.length > 0) {
      grouped["unassigned"] = unassigned;
    }

    return grouped;
  }, [devices]);

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    setDrawerOpen(true);
  };

  if (!homeId || !user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Devices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No home associated with your account. Please contact support.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Devices
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load devices. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Devices
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
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Devices grouped by room */}
      {isLoading ? (
        <Card elevation={1}>
          <CardContent>
            <Typography>Loading devices...</Typography>
          </CardContent>
        </Card>
      ) : devices && devices.length === 0 ? (
        <Card elevation={1}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No devices found for this home.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Object.entries(devicesByRoom).map(([roomId, roomDevices]) => {
            const roomName = roomId === "unassigned" 
              ? "Unassigned Devices" 
              : roomDevices[0]?.room_name || "Unknown Room";
            const deviceCount = roomDevices.length;
            const onlineCount = roomDevices.filter((d) => d.status === "online").length;

            return (
              <Accordion key={roomId} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {roomName}
                    </Typography>
                    <Chip 
                      label={`${onlineCount}/${deviceCount} online`} 
                      size="small" 
                      color={onlineCount === deviceCount ? "success" : "default"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Name</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Last Seen</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roomDevices.map((device) => (
                          <TableRow
                            key={device.id}
                            hover
                            onClick={() => handleDeviceClick(device)}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell>{device.name}</TableCell>
                            <TableCell>
                              {device.type
                                ?.split("_")
                                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ") || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={device.status || "unknown"}
                                color={device.status === "online" ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {device.last_seen_at 
                                ? dayjs(device.last_seen_at).format("MMM D, YYYY h:mm A")
                                : "Never"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Device detail drawer */}
      <DeviceDetailDrawer
        device={selectedDevice}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
