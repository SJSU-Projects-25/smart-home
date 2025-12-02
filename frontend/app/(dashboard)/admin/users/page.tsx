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
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  AdminUser,
} from "@/src/api/admin";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: users, isLoading, refetch } = useListUsersQuery(undefined, {
    skip: false, // Will need backend endpoint
  });

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "owner" as "owner" | "technician" | "staff" | "admin",
    home_id: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    operational_area: "",
    experience_level: "",
    certifications: "",
  });

  const handleOpenDialog = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        role: user.role,
        home_id: user.home_id || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        contact_number: user.contact_number || "",
        operational_area: user.operational_area || "",
        experience_level: user.experience_level || "",
        certifications: user.certifications || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        role: "owner",
        home_id: "",
        first_name: "",
        last_name: "",
        contact_number: "",
        operational_area: "",
        experience_level: "",
        certifications: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        const updatePayload: any = {
          email: formData.email,
          role: formData.role,
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          contact_number: formData.contact_number || undefined,
          operational_area: formData.operational_area || undefined,
          experience_level: formData.experience_level || undefined,
          certifications: formData.certifications || undefined,
        };
        // Only include home_id if it's a valid non-empty string (UUID format)
        const homeIdTrimmed = formData.home_id?.trim();
        if (homeIdTrimmed && homeIdTrimmed !== "") {
          // Validate UUID format before sending
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(homeIdTrimmed)) {
            updatePayload.home_id = homeIdTrimmed;
          } else {
            setSnackbar({ open: true, message: "Invalid home_id format. Must be a valid UUID.", severity: "error" });
            return;
          }
        }
        await updateUser({
          id: editingUser.id,
          data: updatePayload,
        }).unwrap();
        setSnackbar({ open: true, message: "User updated successfully", severity: "success" });
      } else {
        const createPayload: any = {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          contact_number: formData.contact_number || undefined,
          operational_area: formData.operational_area || undefined,
          experience_level: formData.experience_level || undefined,
          certifications: formData.certifications || undefined,
        };
        // Only include home_id if it's a valid non-empty string (UUID format)
        const homeIdTrimmed = formData.home_id?.trim();
        if (homeIdTrimmed && homeIdTrimmed !== "") {
          // Validate UUID format before sending
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(homeIdTrimmed)) {
            createPayload.home_id = homeIdTrimmed;
          } else {
            setSnackbar({ open: true, message: "Invalid home_id format. Must be a valid UUID.", severity: "error" });
            return;
          }
        }
        await createUser(createPayload).unwrap();
        setSnackbar({ open: true, message: "User created successfully", severity: "success" });
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail || error?.message || "Operation failed";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap();
      setSnackbar({ open: true, message: "User deleted successfully", severity: "success" });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete user", severity: "error" });
    }
  };

  const columns: GridColDef[] = [
    { field: "email", headerName: "Email", width: 220 },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      valueFormatter: (value: string) =>
        value.charAt(0).toUpperCase() + value.slice(1),
    },
    {
      field: "first_name",
      headerName: "First Name",
      width: 120,
      valueGetter: (value) => value || "N/A"
    },
    {
      field: "last_name",
      headerName: "Last Name",
      width: 120,
      valueGetter: (value) => value || "N/A"
    },
    {
      field: "operational_area",
      headerName: "Area",
      width: 150,
      valueGetter: (value) => value || "N/A"
    },
    { field: "home_id", headerName: "Home ID", width: 120, valueGetter: (value) => value ? String(value).substring(0, 8) + "..." : "N/A" },
    {
      field: "created_at",
      headerName: "Created",
      width: 130,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row as AdminUser)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
        />,
      ],
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Create User
        </Button>
      </Box>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={users || []}
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
        <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
            />
            {!editingUser && (
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                fullWidth
              />
            )}
            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              required
              fullWidth
            >
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="technician">Technician</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              label="Home ID (optional)"
              value={formData.home_id}
              onChange={(e) => setFormData({ ...formData, home_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Contact Number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              fullWidth
            />
            {(formData.role === "technician" || editingUser?.role === "technician") && (
              <>
                <TextField
                  label="Operational Area"
                  value={formData.operational_area}
                  onChange={(e) => setFormData({ ...formData, operational_area: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Experience Level"
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.email || (!editingUser && !formData.password)}
          >
            {editingUser ? "Update" : "Create"}
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
