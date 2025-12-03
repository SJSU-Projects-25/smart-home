"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Typography, Box, Card, CardContent, Chip, Alert } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useGetNetworkStatusQuery } from "@/src/api/network";
import { RootState } from "@/src/store";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function TechNetworkPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: networkStatus, isLoading, error } = useGetNetworkStatusQuery(
    { home_id: homeId || "" },
    { skip: !homeId || !user, refetchOnMountOrArgChange: true }
  );

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const columns: GridColDef[] = [
    { field: "device_name", headerName: "Device Name", width: 200, flex: 1 },
    {
      field: "rssi",
      headerName: "RSSI",
      width: 150,
      renderCell: (params) => {
        const rssi = params.value as number | null;
        if (rssi === null) {
          return <Chip label="N/A" size="small" color="default" />;
        }
        let color: "success" | "warning" | "error" = "success";
        if (rssi < -80) color = "error";
        else if (rssi < -70) color = "warning";
        return <Chip label={`${rssi} dBm`} size="small" color={color} />;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "online" ? "success" : "default"}
        />
      ),
    },
    {
      field: "last_heartbeat",
      headerName: "Last Heartbeat",
      width: 180,
      valueFormatter: (value: string | null | undefined) => (value ? dayjs(value).format("MMM D, YYYY h:mm A") : "Never"),
    },
  ];

  if (!homeId || !user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Device Network Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No home associated with your account. Please contact support.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Device Network Status
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load network status. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Device Network Status
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Updates every 30 seconds
      </Typography>

      <Card elevation={1}>
        <CardContent>
          <DataGrid
            key={refreshKey}
            rows={networkStatus || []}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.device_id}
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
