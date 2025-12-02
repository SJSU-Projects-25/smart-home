"use client";

import { useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useListAuditLogsQuery, AdminAuditLog } from "@/src/api/admin";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function AdminAuditPage() {
  const [userFilter, setUserFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  const { data: auditLogs, isLoading } = useListAuditLogsQuery({
    user: userFilter || undefined,
    action: actionFilter || undefined,
  });

  const columns: GridColDef[] = [
    {
      field: "timestamp",
      headerName: "Timestamp",
      width: 180,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY HH:mm:ss"),
    },
    { field: "user_email", headerName: "User", width: 200 },
    { field: "action", headerName: "Action", width: 150 },
    { field: "resource_type", headerName: "Resource Type", width: 150 },
    {
      field: "resource_id",
      headerName: "Resource ID",
      width: 120,
      valueGetter: (value) => value ? String(value).substring(0, 8) + "..." : "N/A",
    },
    { field: "details", headerName: "Details", width: 400, flex: 1 },
  ];

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set((auditLogs || []).map((log) => log.action)));

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Audit Logs</Typography>
      </Box>

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              label="User Email"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              sx={{ minWidth: 200 }}
              size="small"
            />
            <TextField
              select
              label="Action"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              sx={{ minWidth: 200 }}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {uniqueActions.map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={auditLogs || []}
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

