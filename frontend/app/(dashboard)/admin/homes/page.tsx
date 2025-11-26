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
  });

  const handleOpenDialog = (home?: AdminHome) => {
    if (home) {
      setEditingHome(home);
      setFormData({
        name: home.name,
        owner_id: "",
        timezone: home.timezone,
      });
    } else {
      setEditingHome(null);
      setFormData({ name: "", owner_id: "", timezone: "America/Los_Angeles" });
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
          },
        }).unwrap();
        setSnackbar({ open: true, message: "Home updated successfully", severity: "success" });
      } else {
        await createHome({
          name: formData.name,
          owner_id: formData.owner_id,
          timezone: formData.timezone,
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

  const columns: GridColDef[] = [
    { field: "name", headerName: "Home Name", width: 200, flex: 1 },
    { field: "owner_email", headerName: "Owner", width: 200 },
    { field: "timezone", headerName: "Timezone", width: 180 },
    { field: "rooms_count", headerName: "Rooms", width: 100 },
    { field: "devices_count", headerName: "Devices", width: 100 },
    { field: "open_alerts_count", headerName: "Open Alerts", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              required
              fullWidth
            />
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
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Owner:</strong> {selectedHome.owner_email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Timezone:</strong> {selectedHome.timezone}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Rooms:</strong> {selectedHome.rooms_count}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Devices:</strong> {selectedHome.devices_count}
              </Typography>
              <Typography variant="body1" gutterBottom>
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
