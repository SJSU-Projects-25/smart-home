"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Stack,
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import {
  useListUsersQuery,
  useListHomesQuery,
  useListAdminAssignmentsQuery,
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  AdminAssignment,
} from "@/src/api/admin";

export const dynamic = "force-dynamic";

export default function AdminAssignmentsPage() {
  const { data: users, isLoading: usersLoading } = useListUsersQuery();
  const { data: homes, isLoading: homesLoading } = useListHomesQuery();
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useListAdminAssignmentsQuery(undefined, {
    // Always refetch on mount so we don't rely on potentially stale cached data
    refetchOnMountOrArgChange: true,
  });

  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [createAssignment] = useCreateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();

  const technicians = useMemo(
    () => (users || []).filter((u) => u.role === "technician"),
    [users]
  );

  // Default selected technician
  const effectiveSelectedTechId =
    selectedTechId || (technicians.length > 0 ? technicians[0].id : null);

  const assignmentsByTech = useMemo(() => {
    const map: Record<string, AdminAssignment[]> = {};
    (assignments || []).forEach((a) => {
      if (!map[a.user_id]) {
        map[a.user_id] = [];
      }
      map[a.user_id].push(a);
    });
    return map;
  }, [assignments]);

  const currentAssignments: AdminAssignment[] = useMemo(() => {
    if (!effectiveSelectedTechId) return [];
    return assignmentsByTech[effectiveSelectedTechId] || [];
  }, [assignmentsByTech, effectiveSelectedTechId]);

  // Homes that are assigned to any technician (global), so each home has at most one technician
  const assignedHomeIds = useMemo(() => {
    const set = new Set<string>();
    (assignments || []).forEach((a) => {
      set.add(a.home_id);
    });
    return set;
  }, [assignments]);

  const availableHomes = useMemo(
    () => (homes || []).filter((h) => !assignedHomeIds.has(h.id)),
    [homes, assignedHomeIds]
  );

  const handleAssignHome = async (homeId: string) => {
    if (!effectiveSelectedTechId) return;
    try {
      await createAssignment({
        user_id: effectiveSelectedTechId,
        home_id: homeId,
        role: "technician",
      }).unwrap();
      setSnackbar({
        open: true,
        message: "Home assigned to technician",
        severity: "success",
      });
      refetchAssignments();
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to assign home",
        severity: "error",
      });
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId).unwrap();
      setSnackbar({
        open: true,
        message: "Assignment removed",
        severity: "success",
      });
      refetchAssignments();
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to remove assignment",
        severity: "error",
      });
    }
  };

  const assignedColumns: GridColDef[] = [
    { field: "home_name", headerName: "Home", flex: 1, minWidth: 180 },
    {
      field: "home_status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => (
        <Chip
          label={params.value || "N/A"}
          size="small"
          color={
            params.value === "Devices Installed and Configured"
              ? "success"
              : params.value === "Device Installation In Progress"
              ? "warning"
              : "default"
          }
        />
      ),
    },
    {
      field: "devices_count",
      headerName: "Devices",
      width: 110,
      type: "number",
      valueGetter: (value) => value || 0,
    },
    {
      field: "open_alerts_count",
      headerName: "Open Alerts",
      width: 130,
      type: "number",
      valueGetter: (value) => value || 0,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          key="remove"
          icon={
            <Tooltip title="Remove assignment">
              <DeleteIcon fontSize="small" />
            </Tooltip>
          }
          label="Remove"
          onClick={() => handleRemoveAssignment(params.id as string)}
        />,
      ],
    },
  ];

  const availableColumns: GridColDef[] = [
    { field: "name", headerName: "Home", flex: 1, minWidth: 180 },
    {
      field: "devices_count",
      headerName: "Devices",
      width: 110,
      valueGetter: (value) => value || 0,
    },
    {
      field: "open_alerts_count",
      headerName: "Open Alerts",
      width: 130,
      valueGetter: (value) => value || 0,
    },
    {
      field: "assign",
      type: "actions",
      headerName: "Assign",
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem
          key="assign"
          icon={
            <Tooltip title="Assign to technician">
              <AddIcon fontSize="small" />
            </Tooltip>
          }
          label="Assign"
          onClick={() => handleAssignHome(params.id as string)}
        />,
      ],
    },
  ];

  const loading = usersLoading || homesLoading || assignmentsLoading;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Technician Assignments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage which homes each technician is responsible for. Assign homes to balance workload
          and ensure proper coverage.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", gap: 3 }}>
          <Skeleton variant="rectangular" height={400} sx={{ flex: "0 0 260px", borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ flex: 1, borderRadius: 2 }} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {/* Technicians list */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              flex: { xs: "1 1 100%", md: "0 0 260px" },
              maxHeight: 480,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader title="Technicians" sx={{ pb: 1 }} />
            <Divider />
            <CardContent sx={{ p: 0, flex: 1, overflowY: "auto" }}>
              {technicians.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No technicians found. Create a technician user first.
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {technicians.map((tech) => {
                    const techAssignments = assignmentsByTech[tech.id] || [];
                    return (
                      <ListItemButton
                        key={tech.id}
                        selected={effectiveSelectedTechId === tech.id}
                        onClick={() => setSelectedTechId(tech.id)}
                      >
                        <ListItemText
                          primary={tech.email}
                          secondary={
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Chip
                                label={`${techAssignments.length} homes`}
                                size="small"
                                sx={{ height: 18 }}
                              />
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Assignments & available homes */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(100% - 292px)" }, display: "flex", flexDirection: "column", gap: 3 }}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardHeader
                title="Current Assignments"
                subheader={
                  effectiveSelectedTechId
                    ? "Homes currently assigned to this technician"
                    : "Select a technician to view assignments"
                }
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                {!effectiveSelectedTechId ? (
                  <Typography variant="body2" color="text.secondary">
                    Select a technician from the list to view and manage assignments.
                  </Typography>
                ) : currentAssignments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No homes assigned yet. Use the table below to assign homes to this technician.
                  </Typography>
                ) : (
                  <DataGrid
                    rows={currentAssignments}
                    columns={assignedColumns}
                    getRowId={(row) => row.id}
                    autoHeight
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardHeader
                title="Available Homes"
                subheader={
                  effectiveSelectedTechId
                    ? "Assign additional homes to the selected technician"
                    : "Select a technician to assign homes"
                }
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                {!effectiveSelectedTechId ? (
                  <Typography variant="body2" color="text.secondary">
                    Select a technician to start assigning homes.
                  </Typography>
                ) : availableHomes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    All homes are already assigned to technicians. Unassign a home first if you need
                    to move it to a different technician.
                  </Typography>
                ) : (
                  <DataGrid
                    rows={availableHomes}
                    columns={availableColumns}
                    getRowId={(row) => row.id}
                    autoHeight
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

