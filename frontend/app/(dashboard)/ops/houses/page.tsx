"use client";

import { useState } from "react";
import { Typography, Box, Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useListOpsHousesQuery } from "@/src/api/ops";
import { OpsHouse } from "@/src/api/ops";

export const dynamic = "force-dynamic";

export default function OpsHousesPage() {
  const [selectedHouse, setSelectedHouse] = useState<OpsHouse | null>(null);

  const { data: houses, isLoading } = useListOpsHousesQuery(undefined, {
    skip: false, // Will need backend endpoint
  });

  const handleRowClick = (params: GridRowParams) => {
    setSelectedHouse(params.row as OpsHouse);
    // Could open a drawer here showing rooms, devices, recent alerts
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Home", width: 200, flex: 1 },
    { field: "owner_email", headerName: "Owner", width: 200 },
    { field: "devices_count", headerName: "Devices", width: 120 },
    { field: "online_count", headerName: "Online", width: 120 },
    { field: "open_alerts_count", headerName: "Open Alerts", width: 120 },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        All Homes
      </Typography>

      <Card elevation={1} sx={{ mt: 3 }}>
        <CardContent>
          <DataGrid
            rows={houses || []}
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
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
