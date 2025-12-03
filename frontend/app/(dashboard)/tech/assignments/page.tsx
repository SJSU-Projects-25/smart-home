"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Typography, Box, Card, CardContent, Alert, Skeleton } from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useListAssignmentsQuery } from "@/src/api/assignments";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function TechAssignmentsPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    data: assignments,
    isLoading,
    error,
    refetch,
  } = useListAssignmentsQuery(undefined, {
    skip: !user,
  });

  // Ensure we always refetch assignments when a user logs in or switches
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const handleRowClick = (params: GridRowParams) => {
    const homeId = params.row.home_id;
    router.push(`/tech/devices?homeId=${homeId}`);
  };

  const columns: GridColDef[] = [
    { field: "home_name", headerName: "Home", width: 200, flex: 1 },
    { 
      field: "rooms_count", 
      headerName: "Rooms", 
      width: 120,
      type: "number",
    },
    { 
      field: "devices_count", 
      headerName: "Devices", 
      width: 120,
      type: "number",
    },
  ];

  if (isLoading) {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          My Assigned Homes
        </Typography>
        <Card elevation={1} sx={{ mt: 3 }}>
          <CardContent>
            <Skeleton variant="rectangular" height={200} />
          </CardContent>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          My Assigned Homes
        </Typography>
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to load assignments. Please try again later.
        </Alert>
      </>
    );
  }

  // Transform assignments data for DataGrid
  const rows = (assignments || []).map((assignment) => ({
    id: assignment.id,
    home_id: assignment.home_id,
    home_name: assignment.home?.name || "Unknown Home",
    rooms_count: assignment.home?.rooms_count || 0,
    devices_count: assignment.home?.devices_count || 0,
  }));

  return (
    <>
      <Typography variant="h4" gutterBottom>
        My Assigned Homes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Click on a home to manage its devices and view details.
      </Typography>

      <Card elevation={1}>
        <CardContent>
          {rows.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No home assignments found. Please contact your administrator.
            </Typography>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              onRowClick={handleRowClick}
              getRowId={(row) => row.id}
              loading={isLoading}
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
          )}
        </CardContent>
      </Card>
    </>
  );
}
