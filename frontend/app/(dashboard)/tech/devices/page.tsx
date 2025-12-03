"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import {
  useListDevicesQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
  useHeartbeatDeviceMutation,
  Device,
} from "@/src/api/devices";
import { useListAssignmentsQuery } from "@/src/api/assignments";
import { RootState } from "@/src/store";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function TechDevicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const homeIdFromUrl = searchParams.get("homeId");
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Get home name from assignments
  const { data: assignments } = useListAssignmentsQuery(undefined, { skip: !user });
  const selectedHome = useMemo(() => {
    if (!homeIdFromUrl || !assignments) return null;
    return assignments.find((a) => a.home_id === homeIdFromUrl);
  }, [homeIdFromUrl, assignments]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Use homeId from URL if available, otherwise fall back to user's home_id
  const homeId = homeIdFromUrl || user?.home_id;

  const { data: devices, isLoading, error, refetch } = useListDevicesQuery(
    { home_id: homeId || "" },
    { skip: !homeId || !user }
  );

  const [createDevice] = useCreateDeviceMutation();
  const [updateDevice] = useUpdateDeviceMutation();
  const [deleteDevice] = useDeleteDeviceMutation();
  const [heartbeatDevice] = useHeartbeatDeviceMutation();

  const [formData, setFormData] = useState({
    name: "",
    type: "microphone",
    room_id: "",
  });

  // Group devices by room
  const devicesByRoom = useMemo(() => {
    if (!devices) return {};
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

  const handleOpenDialog = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        name: device.name,
        type: device.type,
        room_id: device.room_id || "",
      });
    } else {
      setEditingDevice(null);
      setFormData({ name: "", type: "microphone", room_id: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDevice(null);
  };

  const handleSubmit = async () => {
    if (!homeId) return;

    try {
      if (editingDevice) {
        await updateDevice({
          id: editingDevice.id,
          data: {
            name: formData.name,
            room_id: formData.room_id || undefined,
          },
        }).unwrap();
        setSnackbar({ open: true, message: "Device updated successfully", severity: "success" });
      } else {
        await createDevice({
          home_id: homeId,
          name: formData.name,
          type: formData.type,
          room_id: formData.room_id || undefined,
        }).unwrap();
        setSnackbar({ open: true, message: "Device created successfully", severity: "success" });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Operation failed", severity: "error" });
    }
  };

  const handleDelete = async (deviceId: string) => {
    try {
      await deleteDevice(deviceId).unwrap();
      setSnackbar({ open: true, message: "Device deleted successfully", severity: "success" });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete device", severity: "error" });
    }
  };

  const handleHeartbeat = async (deviceId: string) => {
    try {
      await heartbeatDevice(deviceId).unwrap();
      setSnackbar({ open: true, message: "Heartbeat sent successfully", severity: "success" });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to send heartbeat", severity: "error" });
    }
  };

  if (!homeId || !user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Manage Devices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {homeIdFromUrl ? "No access to this home." : "No home associated with your account. Please contact support."}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Manage Devices
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load devices. Please try again later.
        </Alert>
      </Box>
    );
  }

  const homeName = selectedHome?.home?.name || "Unknown Home";

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          {homeIdFromUrl && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/tech/assignments")}
              sx={{ mb: 1 }}
            >
              Back to Assignments
            </Button>
          )}
          <Typography variant="h4">
            {homeIdFromUrl ? `Devices - ${homeName}` : "Manage Devices"}
          </Typography>
          {homeIdFromUrl && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Viewing devices for {homeName}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Device
        </Button>
      </Box>

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
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Seen</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roomDevices.map((device) => (
                          <TableRow key={device.id} hover>
                            <TableCell>{device.name}</TableCell>
                            <TableCell>
                              {device.type
                                .split("_")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={device.status}
                                color={device.status === "online" ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {device.last_seen_at
                                ? dayjs(device.last_seen_at).format("MMM D, YYYY h:mm A")
                                : "Never"}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Heartbeat Test">
                                <IconButton
                                  size="small"
                                  onClick={() => handleHeartbeat(device.id)}
                                  color="primary"
                                >
                                  <FavoriteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(device)}
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(device.id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDevice ? "Edit Device" : "Add Device"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            {!editingDevice && (
              <TextField
                select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                fullWidth
              >
                <MenuItem value="microphone">Microphone</MenuItem>
              </TextField>
            )}
            <TextField
              label="Room ID (optional)"
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              fullWidth
              helperText="Enter the room UUID to assign this device to a room"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
            {editingDevice ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
