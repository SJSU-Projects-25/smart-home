/** Alerts table component using MUI DataGrid. */
"use client";

import { useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import { Chip, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EscalatorWarningIcon from "@mui/icons-material/EscalatorWarning";
import CloseIcon from "@mui/icons-material/Close";
import { Alert } from "../types";
import dayjs from "dayjs";

interface AlertsTableProps {
  alerts: Alert[];
  onRowClick: (alert: Alert) => void;
  onAck: (alertId: string) => void;
  onEscalate: (alertId: string) => void;
  onClose: (alertId: string) => void;
  loading?: boolean;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "low":
      return "default";
    case "medium":
      return "warning";
    case "high":
      return "error";
    default:
      return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "primary";
    case "acked":
      return "default";
    case "escalated":
      return "warning";
    case "closed":
      return "default";
    default:
      return "default";
  }
};

export function AlertsTable({
  alerts,
  onRowClick,
  onAck,
  onEscalate,
  onClose,
  loading = false,
}: AlertsTableProps) {
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "created_at",
        headerName: "Created",
        width: 180,
        valueFormatter: (value: string) => dayjs(value).format("MMM D, YYYY h:mm A"),
      },
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
        field: "room_id",
        headerName: "Room",
        width: 150,
        valueGetter: (value, row) => row.room_id || "N/A",
      },
      {
        field: "severity",
        headerName: "Severity",
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={getSeverityColor(params.value) as any}
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
            color={getStatusColor(params.value) as any}
            size="small"
          />
        ),
      },
      {
        field: "score",
        headerName: "Score",
        width: 100,
        valueFormatter: (value: number | null | undefined) => (value ? value.toFixed(2) : "N/A"),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 150,
        getActions: (params: GridRowParams) => {
          const alert = params.row as Alert;
          const actions = [];

          if (alert.status === "open") {
            actions.push(
              <GridActionsCellItem
                icon={
                  <Tooltip title="Acknowledge">
                    <CheckCircleIcon />
                  </Tooltip>
                }
                label="Ack"
                onClick={(e) => {
                  e.stopPropagation();
                  onAck(alert.id);
                }}
              />,
              <GridActionsCellItem
                icon={
                  <Tooltip title="Escalate">
                    <EscalatorWarningIcon />
                  </Tooltip>
                }
                label="Escalate"
                onClick={(e) => {
                  e.stopPropagation();
                  onEscalate(alert.id);
                }}
              />
            );
          }

          if (alert.status !== "closed") {
            actions.push(
              <GridActionsCellItem
                icon={
                  <Tooltip title="Close">
                    <CloseIcon />
                  </Tooltip>
                }
                label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(alert.id);
                }}
              />
            );
          }

          return actions;
        },
      },
    ],
    [onAck, onEscalate, onClose]
  );

  return (
    <DataGrid
      rows={alerts}
      columns={columns}
      loading={loading}
      onRowClick={(params) => onRowClick(params.row as Alert)}
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
        sorting: {
          sortModel: [{ field: "created_at", sort: "desc" }],
        },
      }}
    />
  );
}
