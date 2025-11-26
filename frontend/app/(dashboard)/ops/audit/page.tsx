"use client";

import { useState } from "react";
import { Typography, Box, Card, CardContent, Paper, Stack, TextField, MenuItem } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useListAuditLogsQuery } from "@/src/api/ops";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function OpsAuditPage() {
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: logs, isLoading } = useListAuditLogsQuery(
    {
      user: userFilter || undefined,
      action: actionFilter || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    },
    { skip: false } // Will need backend endpoint
  );

  const columns: GridColDef[] = [
    {
      field: "timestamp",
      headerName: "Timestamp",
      width: 180,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY h:mm A"),
    },
    { field: "user", headerName: "User", width: 200 },
    { field: "action", headerName: "Action", width: 150 },
    { field: "target_type", headerName: "Target Type", width: 150 },
    { field: "target_id", headerName: "Target ID", width: 200 },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="User"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Stack>
      </Paper>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={logs || []}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
              sorting: {
                sortModel: [{ field: "timestamp", sort: "desc" }],
              },
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
