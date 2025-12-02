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
import { useListModelsQuery, AdminModel } from "@/src/api/admin";

export const dynamic = "force-dynamic";

export default function AdminModelsPage() {
  const [enabledFilter, setEnabledFilter] = useState<string>("");

  const { data: models, isLoading } = useListModelsQuery({
    enabled: enabledFilter === "" ? undefined : enabledFilter === "true",
  });

  const columns: GridColDef[] = [
    { field: "model_key", headerName: "Model Key", width: 200 },
    { field: "home_name", headerName: "Home", width: 200 },
    {
      field: "enabled",
      headerName: "Enabled",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    { field: "threshold", headerName: "Threshold", width: 120, type: "number" },
    {
      field: "params",
      headerName: "Parameters",
      width: 300,
      valueGetter: (value) => JSON.stringify(value || {}),
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Model Configurations</Typography>
      </Box>

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Enabled"
              value={enabledFilter}
              onChange={(e) => setEnabledFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Enabled</MenuItem>
              <MenuItem value="false">Disabled</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            rows={models || []}
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

