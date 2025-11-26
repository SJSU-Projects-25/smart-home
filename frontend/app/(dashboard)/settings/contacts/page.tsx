"use client";

import { useState } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import {
  useListContactsQuery,
  useCreateContactMutation,
  useDeleteContactMutation,
} from "@/src/api/settings";
import { RootState } from "@/src/store";
import { Contact } from "@/src/api/settings";

export const dynamic = "force-dynamic";

export default function ContactsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: contacts, isLoading } = useListContactsQuery(
    { home_id: homeId || "" },
    { skip: !homeId }
  );

  const [createContact] = useCreateContactMutation();
  const [deleteContact] = useDeleteContactMutation();

  const [formData, setFormData] = useState({
    name: "",
    channel: "email" as "sms" | "email",
    value: "",
    priority: 0,
  });

  const handleOpenDialog = () => {
    setFormData({ name: "", channel: "email", value: "", priority: 0 });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!homeId) return;

    try {
      await createContact({
        ...formData,
        home_id: homeId,
      }).unwrap();
      setSnackbar({ open: true, message: "Contact added successfully", severity: "success" });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to add contact", severity: "error" });
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteContact(contactId).unwrap();
      setSnackbar({ open: true, message: "Contact deleted successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete contact", severity: "error" });
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200, flex: 1 },
    {
      field: "channel",
      headerName: "Channel",
      width: 120,
      valueFormatter: (value: string) => value.toUpperCase(),
    },
    { field: "value", headerName: "Value", width: 200, flex: 1 },
    { field: "priority", headerName: "Priority", width: 100 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
        />,
      ],
    },
  ];

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Alert Contacts
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
        <Typography variant="h4">Alert Contacts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          Add Contact
        </Button>
      </Box>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={contacts || []}
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
        <DialogTitle>Add Contact</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label="Channel"
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value as "sms" | "email" })}
              required
              fullWidth
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
            </TextField>
            <TextField
              label="Value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.value}>
            Add
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
