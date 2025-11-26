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
  });

  const handleOpenDialog = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        role: user.role,
        home_id: user.home_id || "",
      });
    } else {
      setEditingUser(null);
      setFormData({ email: "", password: "", role: "owner", home_id: "" });
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
        await updateUser({
          id: editingUser.id,
          data: {
            email: formData.email,
            role: formData.role,
            home_id: formData.home_id || undefined,
          },
        }).unwrap();
        setSnackbar({ open: true, message: "User updated successfully", severity: "success" });
      } else {
        await createUser({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          home_id: formData.home_id || undefined,
        }).unwrap();
        setSnackbar({ open: true, message: "User created successfully", severity: "success" });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: "Operation failed", severity: "error" });
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
    { field: "email", headerName: "Email", width: 250, flex: 1 },
    {
      field: "role",
      headerName: "Role",
      width: 150,
      valueFormatter: (value: string) =>
        value.charAt(0).toUpperCase() + value.slice(1),
    },
    { field: "home_id", headerName: "Home Assignment", width: 200, valueGetter: (value) => value || "N/A" },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
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
