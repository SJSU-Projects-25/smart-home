"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetNetworkStatusQuery } from "@/src/api/network";
import { useListAssignmentsQuery } from "@/src/api/assignments";
import { RootState } from "@/src/store";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function TechNetworkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const homeIdFromUrl = searchParams.get("homeId");
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Get home name from assignments
  const { data: assignments } = useListAssignmentsQuery(undefined, { skip: !user });
  
  // Initialize with first assignment if available and no URL/homeId
  const initialHomeId = useMemo(() => {
    if (homeIdFromUrl) return homeIdFromUrl;
    if (user?.home_id) return user.home_id;
    if (assignments && assignments.length > 0) return assignments[0].home_id;
    return "";
  }, [homeIdFromUrl, user?.home_id, assignments]);
  
  const [selectedHomeId, setSelectedHomeId] = useState<string>(initialHomeId);
  const [refreshKey, setRefreshKey] = useState(0);

  // Find selected home based on selectedHomeId
  const selectedHome = useMemo(() => {
    if (!selectedHomeId || !assignments) return null;
    return assignments.find((a) => a.home_id === selectedHomeId);
  }, [selectedHomeId, assignments]);

  const { data: networkStatus, isLoading, error } = useGetNetworkStatusQuery(
    { home_id: selectedHomeId || "" },
    { skip: !selectedHomeId || !user, refetchOnMountOrArgChange: true }
  );

  // Update selected home when URL or assignments change
  useEffect(() => {
    if (homeIdFromUrl) {
      setSelectedHomeId(homeIdFromUrl);
    } else if (assignments && assignments.length > 0 && !selectedHomeId) {
      setSelectedHomeId(assignments[0].home_id);
    }
  }, [homeIdFromUrl, assignments, selectedHomeId]);

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter out cameras - only show microphones
  const microphoneDevices = useMemo(() => {
    const allDevices = networkStatus || [];
    return allDevices.filter((device) => {
      const deviceType = (device.device_type || "").toLowerCase().trim();
      return deviceType === "microphone" || deviceType === "mic";
    });
  }, [networkStatus]);

  // Group devices by room
  const devicesByRoom = useMemo(() => {
    const grouped: Record<string, typeof microphoneDevices> = {};
    const unassigned: typeof microphoneDevices = [];

    microphoneDevices.forEach((device) => {
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
  }, [microphoneDevices]);

  const handleHomeChange = (newHomeId: string) => {
    setSelectedHomeId(newHomeId);
  };

  const homeName = selectedHome?.home?.name || 
    (selectedHomeId && assignments?.find(a => a.home_id === selectedHomeId)?.home?.name) || 
    "Unknown Home";
  const availableHomes = assignments || [];

  if (!selectedHomeId || !user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Device Network Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {selectedHomeId ? "No access to this home." : "No home associated with your account. Please contact support."}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Device Network Status
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load network status. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        {homeIdFromUrl && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/tech/assignments")}
            sx={{ mb: 1 }}
          >
            Back to Assignments
          </Button>
        )}
        <Typography variant="h4" gutterBottom>
          {homeIdFromUrl ? `Network Status - ${homeName}` : "Device Network Status"}
        </Typography>
        {homeIdFromUrl && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Viewing network status for {homeName}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Updates every 30 seconds
        </Typography>
      </Box>

      {/* Home Selection */}
      {!homeIdFromUrl && availableHomes.length > 1 && (
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Select Home
              </Typography>
              <TextField
                select
                label="Home"
                value={selectedHomeId}
                onChange={(e) => handleHomeChange(e.target.value)}
                fullWidth
              >
                {availableHomes.map((assignment) => (
                  <MenuItem key={assignment.home_id} value={assignment.home_id}>
                    {assignment.home?.name || "Unknown Home"}
                  </MenuItem>
                ))}
              </TextField>
              {selectedHomeId && (
                <Chip 
                  label={`Home: ${homeName}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card elevation={1}>
          <CardContent>
            <Typography>Loading network status...</Typography>
          </CardContent>
        </Card>
      ) : microphoneDevices.length === 0 ? (
        <Card elevation={1}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No microphone devices found for this home.
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

            return (
              <Accordion key={roomId} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Typography variant="h6">{roomName}</Typography>
                    <Chip label={`${deviceCount} device${deviceCount !== 1 ? "s" : ""}`} size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Device Name</TableCell>
                          <TableCell>RSSI</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Heartbeat</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roomDevices.map((device) => {
                          const rssi = device.rssi;
                          let rssiColor: "success" | "warning" | "error" | "default" = "success";
                          if (rssi === null) {
                            rssiColor = "default";
                          } else if (rssi < -80) {
                            rssiColor = "error";
                          } else if (rssi < -70) {
                            rssiColor = "warning";
                          }

                          return (
                            <TableRow key={device.device_id} hover>
                              <TableCell>{device.device_name}</TableCell>
                              <TableCell>
                                {rssi === null ? (
                                  <Chip label="N/A" size="small" color={rssiColor} />
                                ) : (
                                  <Chip label={`${rssi} dBm`} size="small" color={rssiColor} />
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={device.status}
                                  size="small"
                                  color={device.status === "online" ? "success" : "default"}
                                />
                              </TableCell>
                              <TableCell>
                                {device.last_heartbeat
                                  ? dayjs(device.last_heartbeat).format("MMM D, YYYY h:mm A")
                                  : "Never"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </>
  );
}
