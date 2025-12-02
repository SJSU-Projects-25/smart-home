"use client";

import { useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useListDevicesQuery, AdminDevice } from "@/src/api/admin";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function AdminDevicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data: devices, isLoading } = useListDevicesQuery({
    status: statusFilter || undefined,
    device_type: typeFilter || undefined,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "success";
      case "offline":
        return "error";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Device Name", width: 200 },
    { field: "type", headerName: "Type", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    { field: "home_name", headerName: "Home", width: 180 },
    { field: "room_name", headerName: "Room", width: 150 },
    { field: "firmware_version", headerName: "Firmware", width: 120 },
    {
      field: "last_seen_at",
      headerName: "Last Seen",
      width: 180,
      valueFormatter: (value: string) => value ? dayjs(value).format("MMM D, YYYY HH:mm") : "Never",
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY"),
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Devices Management</Typography>
      </Box>

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
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
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={devices || []}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}

