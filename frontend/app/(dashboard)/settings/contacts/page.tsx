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
  Tooltip,
  FormHelperText,
  Chip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
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
    { field: "value", headerName: "Contact Info", width: 200, flex: 1 },
    {
      field: "priority",
      headerName: "Priority",
      width: 150,
      renderCell: (params) => {
        const priority = params.value as number;
        let label = "Low";
        let color: "default" | "warning" | "error" = "default";
        if (priority >= 2) {
          label = "High";
          color = "error";
        } else if (priority === 1) {
          label = "Medium";
          color = "warning";
        }
        return <Chip label={`${label} (${priority})`} size="small" color={color} />;
      },
    },
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
        <Box>
          <Typography variant="h4">Emergency Contacts</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure contacts to receive email notifications for critical (high-severity) alerts
          </Typography>
        </Box>
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
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TextField
                  label="Priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  fullWidth
                  inputProps={{ min: 0, max: 3 }}
                />
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                        Priority determines notification order:
                      </Typography>
                      <Typography variant="body2">• 0 = Low (notified last)</Typography>
                      <Typography variant="body2">• 1 = Medium (notified second)</Typography>
                      <Typography variant="body2">• 2+ = High (notified first)</Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                        Higher priority contacts receive notifications first when critical alerts occur.
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="right"
                >
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <FormHelperText>
                Priority {formData.priority === 0 ? "(Low)" : formData.priority === 1 ? "(Medium)" : "(High)"} - 
                {formData.priority >= 2
                  ? " This contact will be notified first for critical alerts"
                  : formData.priority === 1
                  ? " This contact will be notified after high-priority contacts"
                  : " This contact will be notified last"}
              </FormHelperText>
            </Box>
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
