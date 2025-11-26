"use client";

import { useState } from "react";
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
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from "@mui/x-data-grid";
import {
  useListHomesQuery,
  useCreateHomeMutation,
  useUpdateHomeMutation,
  useDeleteHomeMutation,
  AdminHome,
} from "@/src/api/admin";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function AdminHomesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedHome, setSelectedHome] = useState<AdminHome | null>(null);
  const [editingHome, setEditingHome] = useState<AdminHome | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: homes, isLoading, refetch } = useListHomesQuery(undefined, {
    skip: false, // Will need backend endpoint
  });

  const [createHome] = useCreateHomeMutation();
  const [updateHome] = useUpdateHomeMutation();
  const [deleteHome] = useDeleteHomeMutation();

  const [formData, setFormData] = useState({
    name: "",
    owner_id: "",
    timezone: "America/Los_Angeles",
    address: "",
    contact_number: "",
    home_size: "",
    number_of_rooms: "",
    house_type: "",
    status: "New Home Registered",
  });

  const handleOpenDialog = (home?: AdminHome) => {
    if (home) {
      setEditingHome(home);
      setFormData({
        name: home.name,
        owner_id: "",
        timezone: home.timezone,
        address: home.address || "",
        contact_number: home.contact_number || "",
        home_size: home.home_size || "",
        number_of_rooms: home.number_of_rooms?.toString() || "",
        house_type: home.house_type || "",
        status: home.status || "New Home Registered",
      });
    } else {
      setEditingHome(null);
      setFormData({
        name: "",
        owner_id: "",
        timezone: "America/Los_Angeles",
        address: "",
        contact_number: "",
        home_size: "",
        number_of_rooms: "",
        house_type: "",
        status: "New Home Registered",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingHome(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingHome) {
        await updateHome({
          id: editingHome.id,
          data: {
            name: formData.name,
            timezone: formData.timezone,
            address: formData.address,
            contact_number: formData.contact_number,
            home_size: formData.home_size,
            number_of_rooms: formData.number_of_rooms ? parseInt(formData.number_of_rooms) : undefined,
            house_type: formData.house_type,
            status: formData.status,
          },
        }).unwrap();
        setSnackbar({ open: true, message: "Home updated successfully", severity: "success" });
      } else {
        await createHome({
          name: formData.name,
          owner_id: formData.owner_id,
          timezone: formData.timezone,
          address: formData.address,
          contact_number: formData.contact_number,
          home_size: formData.home_size,
          number_of_rooms: formData.number_of_rooms ? parseInt(formData.number_of_rooms) : undefined,
          house_type: formData.house_type,
        }).unwrap();
        setSnackbar({ open: true, message: "Home created successfully", severity: "success" });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Operation failed", severity: "error" });
    }
  };

  const handleDelete = async (homeId: string) => {
    try {
      await deleteHome(homeId).unwrap();
      setSnackbar({ open: true, message: "Home deleted successfully", severity: "success" });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete home", severity: "error" });
    }
  };

  const handleRowClick = (params: GridRowParams) => {
    setSelectedHome(params.row as AdminHome);
    setDrawerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New Home Registered":
        return "info";
      case "Device Installation In Progress":
        return "warning";
      case "Devices Installed and Configured":
        return "secondary";
      case "Home Registered (Final)":
        return "success";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Home Name", width: 180 },
    { field: "address", headerName: "Address", width: 200, valueGetter: (value) => value || "N/A" },
    { field: "house_type", headerName: "Type", width: 130, valueGetter: (value) => value || "N/A" },
    { field: "number_of_rooms", headerName: "Rooms", width: 80, valueGetter: (value) => value || 0 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      renderCell: (params) => (
        <Chip
          label={params.value || "N/A"}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    { field: "devices_count", headerName: "Devices", width: 90, valueGetter: (value) => value || 0 },
    { field: "open_alerts_count", headerName: "Alerts", width: 80, valueGetter: (value) => value || 0 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDialog(params.row as AdminHome);
          }}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(params.id as string);
          }}
        />,
      ],
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Home Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Create Home
        </Button>
      </Box>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={homes || []}
            columns={columns}
            loading={isLoading}
            onRowClick={handleRowClick}
            getRowId={(row) => row.id}
            sx={{
              "& .MuiDataGrid-row": {
                cursor: "pointer",
              },
            }}
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingHome ? "Edit Home" : "Create Home"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Home Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            {!editingHome && (
              <TextField
                label="Owner ID"
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                required
                fullWidth
              />
            )}
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Contact Number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Home Size (sq ft)"
                value={formData.home_size}
                onChange={(e) => setFormData({ ...formData, home_size: e.target.value })}
                fullWidth
              />
              <TextField
                label="Number of Rooms"
                value={formData.number_of_rooms}
                onChange={(e) => setFormData({ ...formData, number_of_rooms: e.target.value })}
                type="number"
                fullWidth
              />
            </Box>
            <TextField
              select
              label="House Type"
              value={formData.house_type}
              onChange={(e) => setFormData({ ...formData, house_type: e.target.value })}
              fullWidth
            >
              <MenuItem value="Single-family home">Single-family home</MenuItem>
              <MenuItem value="Townhouse">Townhouse</MenuItem>
              <MenuItem value="Condo">Condo</MenuItem>
              <MenuItem value="Apartment">Apartment</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              required
              fullWidth
            />
            {editingHome && (
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="New Home Registered">New Home Registered</MenuItem>
                <MenuItem value="Device Installation In Progress">Device Installation In Progress</MenuItem>
                <MenuItem value="Devices Installed and Configured">Devices Installed and Configured</MenuItem>
                <MenuItem value="Home Registered (Final)">Home Registered (Final)</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || (!editingHome && !formData.owner_id)}>
            {editingHome ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedHome && (
        <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Home Details: {selectedHome.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="body1">
                <strong>Owner ID:</strong> {selectedHome.owner_id || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong> {selectedHome.address || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Contact:</strong> {selectedHome.contact_number || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Home Size:</strong> {selectedHome.home_size || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Number of Rooms:</strong> {selectedHome.number_of_rooms || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>House Type:</strong> {selectedHome.house_type || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> <Chip label={selectedHome.status || "N/A"} color={getStatusColor(selectedHome.status || "")} size="small" />
              </Typography>
              <Typography variant="body1">
                <strong>Timezone:</strong> {selectedHome.timezone}
              </Typography>
              <Typography variant="body1">
                <strong>Rooms Count:</strong> {selectedHome.rooms_count}
              </Typography>
              <Typography variant="body1">
                <strong>Devices:</strong> {selectedHome.devices_count}
              </Typography>
              <Typography variant="body1">
                <strong>Open Alerts:</strong> {selectedHome.open_alerts_count}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDrawerOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

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
