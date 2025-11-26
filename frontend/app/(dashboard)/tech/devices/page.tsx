"use client";

import { useState, useMemo } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from "@mui/x-data-grid";
import {
  useListDevicesQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
  useHeartbeatDeviceMutation,
  Device,
} from "@/src/api/devices";
import { RootState } from "@/src/store";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function TechDevicesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: devices, isLoading, refetch } = useListDevicesQuery(
    { home_id: homeId || "" },
    { skip: !homeId }
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

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200, flex: 1 },
      {
        field: "type",
        headerName: "Type",
        width: 150,
        valueFormatter: (value: string) =>
          value
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
      },
    { field: "room_id", headerName: "Room", width: 150, valueGetter: (value) => value || "N/A" },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            color: params.value === "online" ? "success.main" : "text.secondary",
            fontWeight: params.value === "online" ? "bold" : "normal",
          }}
        >
          {params.value}
        </Box>
      ),
    },
      {
        field: "last_seen_at",
        headerName: "Last Seen",
        width: 180,
        valueFormatter: (value: string | null | undefined) => (value ? dayjs(value).format("MMM D, YYYY h:mm A") : "Never"),
      },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      getActions: (params: GridRowParams) => {
        const device = params.row as Device;
        return [
          <GridActionsCellItem
            icon={
              <Tooltip title="Heartbeat Test">
                <FavoriteIcon />
              </Tooltip>
            }
            label="Heartbeat"
            onClick={() => handleHeartbeat(device.id)}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleOpenDialog(device)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(device.id)}
          />,
        ];
      },
    },
  ];

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Manage Devices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No home associated with your account. Please contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Manage Devices</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Device
        </Button>
      </Box>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={devices || []}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
          />
        </CardContent>
      </Card>

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
                <MenuItem value="camera">Camera</MenuItem>
              </TextField>
            )}
            <TextField
              label="Room ID (optional)"
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              fullWidth
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
