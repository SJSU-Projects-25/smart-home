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
import { useListAlertsQuery, AdminAlert } from "@/src/api/admin";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function AdminAlertsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");

  const { data: alerts, isLoading } = useListAlertsQuery({
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "error";
      case "acked":
        return "info";
      case "escalated":
        return "warning";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    { field: "type", headerName: "Type", width: 150 },
    {
      field: "severity",
      headerName: "Severity",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getSeverityColor(params.value)}
          size="small"
        />
      ),
    },
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
    { field: "score", headerName: "Score", width: 100, type: "number" },
    { field: "home_id", headerName: "Home ID", width: 120, valueGetter: (value) => value ? String(value).substring(0, 8) + "..." : "N/A" },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY HH:mm"),
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Alerts Management</Typography>
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
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="acked">Acknowledged</MenuItem>
              <MenuItem value="escalated">Escalated</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
              select
              label="Severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={alerts || []}
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

