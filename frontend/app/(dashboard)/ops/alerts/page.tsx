"use client";

import { useState } from "react";
import { Typography, Box, Card, CardContent, Chip, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from "@mui/x-data-grid";
import { useListAlertsQuery, useCloseAlertMutation } from "@/src/api/alerts";
import { AlertDetailDrawer } from "@/src/components/AlertDetailDrawer";
import { Alert } from "@/src/types";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default function OpsAlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch escalated alerts - for now using status filter
  // In real implementation, there would be GET /ops/alerts?status=escalated
  const { data: alertsData, isLoading } = useListAlertsQuery(
    { home_id: "", status: "escalated" },
    { skip: true } // Skip until we have proper endpoint
  );

  const [closeAlert] = useCloseAlertMutation();

  const alerts = alertsData || [];

  const handleRowClick = (params: GridRowParams) => {
    setSelectedAlert(params.row as Alert);
    setDrawerOpen(true);
  };

  const handleClose = async (alertId: string) => {
    try {
      await closeAlert(alertId).unwrap();
    } catch (error) {
      console.error("Failed to close alert:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    { field: "home_id", headerName: "Home", width: 150 },
    { field: "device_id", headerName: "Device", width: 150 },
    {
      field: "type",
      headerName: "Type",
      width: 150,
      valueFormatter: (value: string) =>
        value
          .split("_")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
    },
    {
      field: "severity",
      headerName: "Severity",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getSeverityColor(params.value) as any} size="small" />
      ),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY h:mm A"),
    },
    { field: "assigned_to", headerName: "Assigned To", width: 150, valueGetter: () => "N/A" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      getActions: (params: GridRowParams) => {
        const alert = params.row as Alert;
        return [
          <GridActionsCellItem
            icon={
              <Tooltip title="Add Note">
                <NoteAddIcon />
              </Tooltip>
            }
            label="Add Note"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement add note
            }}
          />,
          <GridActionsCellItem
            icon={
              <Tooltip title="Close">
                <CloseIcon />
              </Tooltip>
            }
            label="Close"
            onClick={(e) => {
              e.stopPropagation();
              handleClose(alert.id);
            }}
          />,
        ];
      },
    },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Escalation Queue
      </Typography>

      <Card elevation={1} sx={{ mt: 3 }}>
        <CardContent>
          <DataGrid
            rows={alerts}
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

      <AlertDetailDrawer
        alert={selectedAlert}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAck={() => {}}
        onEscalate={() => {}}
        onCloseAlert={handleClose}
      />
    </>
  );
}
