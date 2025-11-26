"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Typography, Box, Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useListDevicesQuery } from "@/src/api/devices";
import { RootState } from "@/src/store";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

interface NetworkDevice {
  id: string;
  name: string;
  rssi: number | null;
  last_heartbeat: string | null;
}

export default function TechNetworkPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: devices, isLoading } = useListDevicesQuery(
    { home_id: homeId || "" },
    { skip: !homeId, refetchOnMountOrArgChange: true }
  );

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Transform devices to network format
  // In a real implementation, this would come from a telemetry endpoint
  const networkDevices: NetworkDevice[] = (devices || []).map((device) => ({
    id: device.id,
    name: device.name,
    rssi: null, // Would come from telemetry endpoint
    last_heartbeat: device.last_seen_at || null,
  }));

  const columns: GridColDef[] = [
    { field: "name", headerName: "Device Name", width: 200, flex: 1 },
    {
      field: "rssi",
      headerName: "RSSI",
      width: 120,
      valueGetter: (value) => (value !== null ? `${value} dBm` : "N/A"),
    },
    {
      field: "last_heartbeat",
      headerName: "Last Heartbeat",
      width: 180,
      valueFormatter: (value: string | null | undefined) => (value ? dayjs(value).format("MMM D, YYYY h:mm A") : "Never"),
    },
  ];

  if (!homeId) {
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
            rows={networkDevices}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id}
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
