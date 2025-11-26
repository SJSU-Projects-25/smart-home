"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  MenuItem,
  TextField,
  Chip,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useListDevicesQuery } from "@/src/api/devices";
import { DeviceDetailDrawer } from "@/src/components/DeviceDetailDrawer";
import { RootState } from "@/src/store";
import { Device } from "@/src/api/devices";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function DevicesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const homeId = user?.home_id;

  const { data: devicesData, isLoading } = useListDevicesQuery(
    {
      home_id: homeId || "",
      status: statusFilter || undefined,
    },
    { skip: !homeId }
  );

  // Client-side filtering for type (backend doesn't support it yet)
  const devices = (devicesData || []).filter((device) => {
    if (typeFilter && device.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleRowClick = (params: GridRowParams) => {
    setSelectedDevice(params.row as Device);
    setDrawerOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      flex: 1,
    },
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
    {
      field: "room_id",
      headerName: "Room",
      width: 150,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "online" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "last_seen_at",
      headerName: "Last Seen",
      width: 180,
      valueFormatter: (value: string | null | undefined) => (value ? dayjs(value).format("MMM D, YYYY h:mm A") : "Never"),
    },
  ];

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Devices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No home associated with your account. Please contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Devices
      </Typography>

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
          </TextField>

          <TextField
            select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="microphone">Microphone</MenuItem>
            <MenuItem value="camera">Camera</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Devices table */}
      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={devices}
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
              sorting: {
                sortModel: [{ field: "name", sort: "asc" }],
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Device detail drawer */}
      <DeviceDetailDrawer
        device={selectedDevice}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
