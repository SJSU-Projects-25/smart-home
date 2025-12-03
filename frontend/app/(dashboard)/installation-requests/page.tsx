"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetOwnerOverviewQuery } from "@/src/api/analytics";
import {
  useListOwnerInstallationRequestsQuery,
  useCreateOwnerInstallationRequestMutation,
  useUpdateOwnerInstallationRequestMutation,
  InstallationRequest,
} from "@/src/api/installationRequests";
import {
  useListOwnerRoomsQuery,
  useCreateOwnerRoomMutation,
  useUpdateOwnerRoomMutation,
  useDeleteOwnerRoomMutation,
} from "@/src/api/rooms";

export const dynamic = "force-dynamic";

type CoverageOption =
  | "none"
  | "full"
  | "intrusion"
  | "safety"
  | "environmental"
  | "custom";

export default function OwnerInstallationRequestsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data: overviewData } = useGetOwnerOverviewQuery(
    { home_id: homeId || "" },
    { skip: !homeId, refetchOnMountOrArgChange: true }
  );

  const {
    data: requests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useListOwnerInstallationRequestsQuery(undefined, {
    skip: !homeId,
  });

  const [createRequest, { isLoading: creating }] =
    useCreateOwnerInstallationRequestMutation();
  const [updateRequest] = useUpdateOwnerInstallationRequestMutation();

  const rooms = useMemo(
    () => overviewData?.perRoomStats || [],
    [overviewData]
  );

  const {
    data: ownerRooms,
    refetch: refetchRooms,
  } = useListOwnerRoomsQuery(undefined, {
    skip: !homeId,
  });

  const [createRoom] = useCreateOwnerRoomMutation();
  const [updateRoom] = useUpdateOwnerRoomMutation();
  const [deleteRoom] = useDeleteOwnerRoomMutation();

  const roomsForPlanning = useMemo(() => {
    if (!ownerRooms || ownerRooms.length === 0) {
      return [];
    }
    const deviceCountByRoom: Record<string, number> = {};
    (overviewData?.perRoomStats || []).forEach((room) => {
      deviceCountByRoom[room.room_id] = room.devices_count;
    });
    return ownerRooms.map((room) => ({
      room_id: room.id,
      room_name: room.name,
      devices_count: deviceCountByRoom[room.id] ?? 0,
    }));
  }, [ownerRooms, overviewData]);

  const [coverageDraft, setCoverageDraft] = useState<
    Record<
      string,
      { coverage: CoverageOption; desiredDevices: number; notes: string }
    >
  >({});

  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");
  const [editingRoomType, setEditingRoomType] = useState("");

  const handleCoverageChange = (roomId: string, value: CoverageOption) => {
    setCoverageDraft((prev) => ({
      ...prev,
      [roomId]: {
        coverage: value,
        desiredDevices: prev[roomId]?.desiredDevices ?? 1,
        notes: prev[roomId]?.notes || "",
      },
    }));
  };

  const handleNotesChange = (roomId: string, value: string) => {
    setCoverageDraft((prev) => ({
      ...prev,
      [roomId]: {
        coverage: prev[roomId]?.coverage || "none",
        desiredDevices: prev[roomId]?.desiredDevices ?? 1,
        notes: value,
      },
    }));
  };

  const handleDesiredDevicesChange = (roomId: string, value: string) => {
    const parsed = Number(value);
    const safeValue = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setCoverageDraft((prev) => ({
      ...prev,
      [roomId]: {
        coverage: prev[roomId]?.coverage || "none",
        desiredDevices: safeValue,
        notes: prev[roomId]?.notes || "",
      },
    }));
  };

  const handleCreateRequest = async () => {
    if (!homeId) return;
    try {
      const items = roomsForPlanning
        .map((room) => {
          const entry = coverageDraft[room.room_id];
          const coverage = entry?.coverage || "none";
          if (coverage === "none") {
            return null;
          }
          const coverage_type = coverage;
          const desired_device_count =
            entry?.desiredDevices ?? 1;
          return {
            room_id: room.room_id,
            coverage_type,
            desired_device_count,
            notes: entry?.notes || undefined,
          };
        })
        .filter(Boolean) as {
        room_id: string;
        coverage_type: string;
        desired_device_count: number;
        notes?: string;
      }[];

      if (items.length === 0) {
        setSnackbar({
          open: true,
          message: "Select at least one room with desired coverage before submitting.",
          severity: "error",
        });
        return;
      }

      await createRequest({
        home_id: homeId,
        items,
      }).unwrap();

      setSnackbar({
        open: true,
        message: "Installation request submitted for review.",
        severity: "success",
      });
      setCoverageDraft({});
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to submit installation request.",
        severity: "error",
      });
    }
  };

  const handleOwnerAction = async (
    request: InstallationRequest,
    action: "approve" | "request_changes"
  ) => {
    try {
      await updateRequest({
        id: request.id,
        data: { action },
      }).unwrap();
      setSnackbar({
        open: true,
        message:
          action === "approve"
            ? "Installation plan approved."
            : "Requested changes to installation plan.",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to update installation request.",
        severity: "error",
      });
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setSnackbar({
        open: true,
        message: "Room name is required.",
        severity: "error",
      });
      return;
    }
    try {
      await createRoom({
        name: newRoomName.trim(),
        type: newRoomType || undefined,
      }).unwrap();
      setNewRoomName("");
      setNewRoomType("");
      setSnackbar({
        open: true,
        message: "Room created successfully.",
        severity: "success",
      });
      refetchRooms();
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to create room.",
        severity: "error",
      });
    }
  };

  const startEditRoom = (roomId: string) => {
    const room = ownerRooms?.find((r) => r.id === roomId);
    if (!room) return;
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
    setEditingRoomType(room.type || "");
  };

  const handleSaveRoomEdit = async () => {
    if (!editingRoomId) return;
    if (!editingRoomName.trim()) {
      setSnackbar({
        open: true,
        message: "Room name is required.",
        severity: "error",
      });
      return;
    }
    try {
      await updateRoom({
        id: editingRoomId,
        data: {
          name: editingRoomName.trim(),
          type: editingRoomType || undefined,
        },
      }).unwrap();
      setSnackbar({
        open: true,
        message: "Room updated successfully.",
        severity: "success",
      });
      setEditingRoomId(null);
      setEditingRoomName("");
      setEditingRoomType("");
      refetchRooms();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to update room.",
        severity: "error",
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId).unwrap();
      setSnackbar({
        open: true,
        message: "Room deleted.",
        severity: "success",
      });
      refetchRooms();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete room. Make sure there are no active devices or open requests.",
        severity: "error",
      });
    }
  };

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Installation Plan
        </Typography>
        <Alert severity="warning">
          No home associated with your account. Please contact support.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Installation Plan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define how each room in your home should be monitored and submit the plan
          for your assigned technician to review.
        </Typography>
      </Box>

      {/* Draft plan builder */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 4 }}>
        <CardHeader
          title="Room Coverage"
          subheader="Choose desired coverage for each room. Only rooms with coverage will be included in the request."
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Manage rooms and desired coverage for your home. You can add, rename, or
              remove rooms below before submitting a plan.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Room name"
                size="small"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Room type (optional)"
                size="small"
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleCreateRoom}
                sx={{ whiteSpace: "nowrap" }}
              >
                Add Room
              </Button>
            </Stack>
          </Box>

          {roomsForPlanning.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No rooms found for this home yet. Add a room above to start your
              installation plan.
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Room</TableCell>
                      <TableCell>Current devices</TableCell>
                      <TableCell>Desired devices</TableCell>
                      <TableCell>Desired Coverage</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell align="right">Manage room</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roomsForPlanning.map((room) => {
                      const entry = coverageDraft[room.room_id] || {
                        coverage: "none" as CoverageOption,
                        desiredDevices: 1,
                        notes: "",
                      };
                      return (
                        <TableRow key={room.room_id}>
                          <TableCell>{room.room_name}</TableCell>
                          <TableCell>{room.devices_count}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              inputProps={{ min: 0 }}
                              value={entry.desiredDevices}
                              onChange={(e) =>
                                handleDesiredDevicesChange(room.room_id, e.target.value)
                              }
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={entry.coverage}
                              onChange={(e) =>
                                handleCoverageChange(
                                  room.room_id,
                                  e.target.value as CoverageOption
                                )
                              }
                              sx={{ minWidth: 160 }}
                            >
                              <MenuItem value="none">No monitoring</MenuItem>
                              <MenuItem value="full">Full coverage (intrusion + safety)</MenuItem>
                              <MenuItem value="intrusion">Intrusion only</MenuItem>
                              <MenuItem value="safety">Safety / fall detection only</MenuItem>
                              <MenuItem value="environmental">
                                Environmental (smoke/glass/water)
                              </MenuItem>
                              <MenuItem value="custom">Custom</MenuItem>
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Any special notes (pets, quiet hours, etc.)"
                              value={entry.notes}
                              onChange={(e) =>
                                handleNotesChange(room.room_id, e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {editingRoomId === room.room_id ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                              >
                                <TextField
                                  size="small"
                                  value={editingRoomName}
                                  onChange={(e) => setEditingRoomName(e.target.value)}
                                  sx={{ minWidth: 120 }}
                                />
                                <TextField
                                  size="small"
                                  value={editingRoomType}
                                  onChange={(e) => setEditingRoomType(e.target.value)}
                                  sx={{ minWidth: 120 }}
                                  placeholder="Type"
                                />
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleSaveRoomEdit}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => setEditingRoomId(null)}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            ) : (
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                              >
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => startEditRoom(room.room_id)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  color="error"
                                  onClick={() => handleDeleteRoom(room.room_id)}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleCreateRequest}
                  disabled={creating}
                >
                  {creating ? "Submitting..." : "Submit for Review"}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Existing requests (owner can only track status) */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardHeader
          title="Submitted Requests"
          subheader="Track the status of installation plans and collaborate with your technician."
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          {requestsLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading requests...
            </Typography>
          ) : requestsError ? (
            <Alert severity="error">
              Failed to load installation requests. Please try again later.
            </Alert>
          ) : !requests || requests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No installation requests submitted yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rooms</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => {
                    const created = dayjs(req.created_at).format(
                      "MMM D, YYYY h:mm A"
                    );
                    const roomsCount = req.items.length;
                    const statusLabel = req.status.replace(/_/g, " ");
                    return (
                      <TableRow key={req.id}>
                        <TableCell>{created}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabel}
                            size="small"
                            color={
                              req.status === "approved"
                                ? "success"
                                : req.status === "installed"
                                ? "info"
                                : req.status === "rejected"
                                ? "error"
                                : "default"
                            }
                            sx={{ textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell>{roomsCount}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {req.notes || "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

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


