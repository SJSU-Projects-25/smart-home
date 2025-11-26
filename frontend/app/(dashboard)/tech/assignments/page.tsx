"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Typography, Box, Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useListAssignmentsQuery } from "@/src/api/assignments";
import { useListDevicesQuery } from "@/src/api/devices";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function TechAssignmentsPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  // For now, we'll fetch assignments by getting user's home_id from auth
  // In a real implementation, there would be a GET /assignments endpoint
  const { data: assignments, isLoading } = useListAssignmentsQuery(undefined, {
    skip: true, // Skip until backend endpoint is available
  });

  // For now, show a message that assignments will be shown here
  // When backend implements GET /assignments?user_id=..., we can use it

  const handleRowClick = (params: GridRowParams) => {
    const homeId = params.row.home_id;
    router.push(`/tech/devices?homeId=${homeId}`);
  };

  const columns: GridColDef[] = [
    { field: "home_name", headerName: "Home", width: 200, flex: 1 },
    { field: "rooms_count", headerName: "Rooms", width: 120 },
    { field: "devices_count", headerName: "Devices", width: 120 },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        My Assigned Homes
      </Typography>

      <Card elevation={1} sx={{ mt: 3 }}>
        <CardContent>
          {user?.home_id ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                You are assigned to home: {user.home_id}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Click below to manage devices for this home.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <DataGrid
                  rows={[
                    {
                      id: user.home_id,
                      home_name: "Assigned Home",
                      rooms_count: "N/A",
                      devices_count: "N/A",
                      home_id: user.home_id,
                    },
                  ]}
                  columns={columns}
                  onRowClick={handleRowClick}
                  getRowId={(row) => row.id}
                  sx={{
                    "& .MuiDataGrid-row": {
                      cursor: "pointer",
                    },
                  }}
                  autoHeight
                  hideFooter
                />
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No home assignments found. Please contact your administrator.
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  );
}
