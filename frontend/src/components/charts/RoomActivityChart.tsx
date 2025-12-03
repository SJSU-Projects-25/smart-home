/** Room activity heatmap/bar chart component. */
"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Box, Typography, useTheme } from "@mui/material";

interface RoomActivityChartProps {
  data: Array<{
    room_id: string;
    room_name: string;
    device_count: number;
    alert_count?: number;
    event_count?: number;
  }>;
  title?: string;
  height?: number;
  metric?: "devices" | "alerts" | "events";
}

export function RoomActivityChart({
  data,
  title = "Room Activity",
  height = 300,
  metric = "devices",
}: RoomActivityChartProps) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.room_name,
      value: metric === "devices" ? item.device_count : metric === "alerts" ? (item.alert_count || 0) : (item.event_count || 0),
      roomId: item.room_id,
    }));
  }, [data, metric]);

  const getColor = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio > 0.7) return theme.palette.error.main;
    if (ratio > 0.4) return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <Box sx={{ width: "100%", height }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
              boxShadow: theme.shadows[4],
            }}
            formatter={(value: number) => [value, metric === "devices" ? "Devices" : metric === "alerts" ? "Alerts" : "Events"]}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value, maxValue)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}


