"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Chip,
  Stack,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import {
  useListTechInstallationRequestsQuery,
  useUpdateTechInstallationRequestMutation,
  InstallationRequest,
} from "@/src/api/installationRequests";
import {
  useUpdateTechInstallationItemMutation,
  useApproveAllTechInstallationItemsMutation,
} from "@/src/api/installationRequests";

export const dynamic = "force-dynamic";

export default function TechInstallationRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useListTechInstallationRequestsQuery(
    statusFilter ? { status: statusFilter } : undefined,
    { refetchOnMountOrArgChange: true }
  );

  const [updateRequest] = useUpdateTechInstallationRequestMutation();
  const [updateItem] = useUpdateTechInstallationItemMutation();
  const [approveAll] = useApproveAllTechInstallationItemsMutation();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [selectedRequest, setSelectedRequest] = useState<InstallationRequest | null>(
    null
  );

  const handleStatusChange = async (
    request: InstallationRequest,
    status: "in_review" | "plan_ready" | "installed"
  ) => {
    try {
      const updated = await updateRequest({
        id: request.id,
        data: { status },
      }).unwrap();

      // Keep drawer state in sync so buttons/labels update immediately
      setSelectedRequest((current) => {
        if (!current || current.id !== updated.id) return current;
        // Clone to ensure React sees a new reference and re-renders
        return {
          ...updated,
          items: updated.items.map((i) => ({ ...i })),
        };
      });

      setSnackbar({
        open: true,
        message: `Request marked as ${status.replace("_", " ")}.`,
        severity: "success",
      });
      refetch();
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to update installation request.",
        severity: "error",
      });
    }
  };

  const handleItemStatusChange = async (
    req: InstallationRequest,
    itemId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const updated = await updateItem({
        requestId: req.id,
        itemId,
        data: { status },
      }).unwrap();

      // Update selected request immediately so buttons grey out
      setSelectedRequest((current) => {
        if (!current || current.id !== updated.id) return current;
        return {
          ...updated,
          items: updated.items.map((i) => ({ ...i })),
        };
      });

      setSnackbar({
        open: true,
        message:
          status === "approved"
            ? "Room approved and devices created."
            : "Room rejected.",
        severity: "success",
      });
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to update room.",
        severity: "error",
      });
    }
  };

  const handleApproveWholePlan = async (req: InstallationRequest) => {
    try {
      const updated = await approveAll({ requestId: req.id }).unwrap();

      // Update drawer state so all room buttons grey out instantly
      setSelectedRequest((current) => {
        if (!current || current.id !== updated.id) return current;
        return {
          ...updated,
          items: updated.items.map((i) => ({ ...i })),
        };
      });

      setSnackbar({
        open: true,
        message: "Plan approved. Devices created for all pending rooms.",
        severity: "success",
      });
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to approve plan.",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value: string) =>
        dayjs(value).format("MMM D, YYYY h:mm A"),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value.replace(/_/g, " ")}
          size="small"
          color={
            params.value === "installed"
              ? "success"
              : params.value === "plan_ready"
              ? "info"
              : params.value === "changes_requested"
              ? "warning"
              : "default"
          }
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "rooms",
      headerName: "Rooms",
      width: 90,
      valueGetter: (_, row) => row.items.length,
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      minWidth: 200,
      valueGetter: (value) => value || "—",
    },
  ];

  const getNextActions = (req: InstallationRequest) => {
    const actions: Array<{
      label: string;
      status: "in_review" | "plan_ready" | "installed";
    }> = [];
    if (req.status === "submitted") {
      actions.push({ label: "Start review", status: "in_review" });
    } else if (req.status === "in_review") {
      actions.push({ label: "Plan ready", status: "plan_ready" });
    } else if (req.status === "owner_approved" || req.status === "plan_ready") {
      actions.push({ label: "Mark installed", status: "installed" });
    }
    return actions;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Installation Requests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review installation plans submitted by owners for your assigned homes,
          propose device layouts, and mark installations as complete.
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
        <CardHeader title="Filters" sx={{ pb: 1 }} />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ maxWidth: 400 }}
          >
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="in_review">In review</MenuItem>
              <MenuItem value="plan_ready">Plan ready</MenuItem>
              <MenuItem value="owner_approved">Owner approved</MenuItem>
              <MenuItem value="changes_requested">Changes requested</MenuItem>
              <MenuItem value="installed">Installed</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardHeader title="Requests" sx={{ pb: 1 }} />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading installation requests...
            </Typography>
          ) : error ? (
            <Alert severity="error">
              Failed to load installation requests. Please try again later.
            </Alert>
          ) : !requests || requests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No installation requests found for your assigned homes.
            </Typography>
          ) : (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={requests}
                columns={[
                  ...columns,
                  {
                    field: "actions",
                    headerName: "Next steps",
                    flex: 1,
                    minWidth: 240,
                    sortable: false,
                    renderCell: (params) => {
                      const row = params.row as InstallationRequest;
                      const next = getNextActions(row);
                      return (
                        <Stack direction="row" spacing={1}>
                          {next.map((action) => (
                            <Button
                              key={action.status}
                              size="small"
                              variant="outlined"
                              onClick={() => handleStatusChange(row, action.status)}
                            >
                              {action.label}
                            </Button>
                          ))}
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setSelectedRequest(row)}
                          >
                            View details
                          </Button>
                        </Stack>
                      );
                    },
                  },
                ]}
                getRowId={(row) => row.id}
                autoHeight
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Drawer-style detail view using a side panel */}
      {selectedRequest && (
        <Box
          sx={{
            position: "fixed",
            top: 64,
            right: 0,
            width: { xs: "100%", md: 420 },
            height: "calc(100% - 64px)",
            bgcolor: "background.paper",
            boxShadow: 3,
            borderLeft: 1,
            borderColor: "divider",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Request details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Per-room plan for this installation request. Approve or reject rooms and
              optionally approve the whole plan.
            </Typography>
          </Box>
          <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            {selectedRequest.items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No rooms included in this request.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {selectedRequest.items.map((item) => (
                  <Card
                    key={item.id}
                    variant="outlined"
                    sx={{ bgcolor: "background.default" }}
                  >
                    <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography variant="subtitle2">
                            Room ID: {item.room_id ?? "Unassigned"}
                          </Typography>
                          <Chip
                            label={item.status.replace(/_/g, " ")}
                            size="small"
                            color={
                              item.status === "approved"
                                ? "success"
                                : item.status === "rejected"
                                ? "error"
                                : item.status === "installed"
                                ? "info"
                                : "default"
                            }
                            sx={{ textTransform: "capitalize" }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Coverage: {item.coverage_type.replace(/_/g, " ")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Desired devices: {item.desired_device_count}
                        </Typography>
                        {item.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Notes: {item.notes}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={item.status === "approved"}
                            onClick={() =>
                              handleItemStatusChange(selectedRequest, item.id, "approved")
                            }
                          >
                            Approve room
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            disabled={item.status === "rejected"}
                            onClick={() =>
                              handleItemStatusChange(selectedRequest, item.id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="text"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => handleApproveWholePlan(selectedRequest)}
                disabled={
                  selectedRequest.items.length === 0 ||
                  selectedRequest.items.every(
                    (i) => i.status === "approved" || i.status === "rejected"
                  )
                }
              >
                Approve whole plan
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStatusChange(selectedRequest, "installed")}
                disabled={selectedRequest.status === "installed"}
              >
                Mark installed
              </Button>
            </Stack>
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


