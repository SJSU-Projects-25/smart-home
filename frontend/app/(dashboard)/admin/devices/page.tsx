"use client";

import { useState, useMemo } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useListDevicesQuery, AdminDevice } from "@/src/api/admin";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function AdminDevicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [homeFilter, setHomeFilter] = useState<string>("");

  const { data: devicesData, isLoading, error } = useListDevicesQuery({
    status: statusFilter || undefined,
  });

  // Filter out camera devices and apply filters
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
      
      // Apply home filter
      if (homeFilter && device.home_id !== homeFilter) {
        return false;
      }
      
      return true;
    });
  }, [devicesData, statusFilter, homeFilter]);

  // Get unique homes for filter dropdown
  const uniqueHomes = useMemo(() => {
    if (!devicesData) return [];
    const homesMap = new Map<string, { id: string; name: string }>();
    devicesData.forEach((device) => {
      if (device.home_id && device.home_name && !homesMap.has(device.home_id)) {
        homesMap.set(device.home_id, {
          id: device.home_id,
          name: device.home_name,
        });
      }
    });
    return Array.from(homesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [devicesData]);

  // Group devices by home and then by room
  const devicesByHomeAndRoom = useMemo(() => {
    const grouped: Record<string, Record<string, AdminDevice[]>> = {};
    const unassignedByHome: Record<string, AdminDevice[]> = {};

    devices.forEach((device) => {
      const homeId = device.home_id || "unknown";
      const homeName = device.home_name || "Unknown Home";
      const homeKey = `${homeId}|${homeName}`;

      if (!grouped[homeKey]) {
        grouped[homeKey] = {};
        unassignedByHome[homeKey] = [];
      }

      if (device.room_id && device.room_name) {
        const roomKey = `${device.room_id}|${device.room_name}`;
        if (!grouped[homeKey][roomKey]) {
          grouped[homeKey][roomKey] = [];
        }
        grouped[homeKey][roomKey].push(device);
      } else {
        unassignedByHome[homeKey].push(device);
      }
    });

    // Add unassigned devices
    Object.keys(unassignedByHome).forEach((homeKey) => {
      if (unassignedByHome[homeKey].length > 0) {
        grouped[homeKey]["unassigned"] = unassignedByHome[homeKey];
      }
    });

    return grouped;
  }, [devices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "success";
      case "offline":
        return "error";
      default:
        return "default";
    }
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Devices Management
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load devices. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Devices Management</Typography>
      </Box>

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
          <TextField
            select
            label="Home"
            value={homeFilter}
            onChange={(e) => setHomeFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All Homes</MenuItem>
            {uniqueHomes.map((home) => (
              <MenuItem key={home.id} value={home.id}>
                {home.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Devices grouped by home and room */}
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
              No devices found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Object.entries(devicesByHomeAndRoom).map(([homeKey, rooms]) => {
            const [homeId, homeName] = homeKey.split("|");
            const totalDevices = Object.values(rooms).flat().length;
            const totalOnline = Object.values(rooms)
              .flat()
              .filter((d) => d.status === "online").length;
            
            return (
              <Accordion key={homeId} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Typography variant="h6" sx={{ flexGrow: 1, color: "primary.main" }}>
                      {homeName}
                    </Typography>
                    <Chip 
                      label={`${totalOnline}/${totalDevices} online`} 
                      size="small" 
                      color={totalOnline === totalDevices ? "success" : "default"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {Object.entries(rooms).map(([roomKey, roomDevices]) => {
                      const [roomId, roomName] = roomKey.split("|");
                      const displayRoomName = roomId === "unassigned" 
                        ? "Unassigned Devices" 
                        : roomName || "Unknown Room";
                      const deviceCount = roomDevices.length;
                      const onlineCount = roomDevices.filter((d) => d.status === "online").length;

                      return (
                        <Accordion key={roomKey} defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                {displayRoomName}
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
                                    <TableCell><strong>Device Name</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Firmware</strong></TableCell>
                                    <TableCell><strong>Last Seen</strong></TableCell>
                                    <TableCell><strong>Created</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {roomDevices.map((device) => (
                                    <TableRow key={device.id} hover>
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
                                          color={getStatusColor(device.status || "")}
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell>{device.firmware_version || "N/A"}</TableCell>
                                      <TableCell>
                                        {device.last_seen_at 
                                          ? dayjs(device.last_seen_at).format("MMM D, YYYY h:mm A")
                                          : "Never"}
                                      </TableCell>
                                      <TableCell>
                                        {device.created_at 
                                          ? dayjs(device.created_at).format("MMM D, YYYY")
                                          : "N/A"}
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
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </>
  );
}

