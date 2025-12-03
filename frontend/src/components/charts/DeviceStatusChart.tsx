/** Device status distribution chart. */
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Box, Typography, useTheme } from "@mui/material";

interface DeviceStatusChartProps {
  online: number;
  offline: number;
  title?: string;
  height?: number;
}

const COLORS = {
  online: "#2e7d32",
  offline: "#d32f2f",
};

export function DeviceStatusChart({
  online,
  offline,
  title = "Device Status",
  height = 250,
}: DeviceStatusChartProps) {
  const theme = useTheme();

  const data = [
    { name: "Online", value: online, color: COLORS.online },
    { name: "Offline", value: offline, color: COLORS.offline },
  ].filter((item) => item.value > 0);

  const total = online + offline;
  const onlinePercent = total > 0 ? ((online / total) * 100).toFixed(1) : "0";

  return (
    <Box sx={{ width: "100%", height }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, color: COLORS.online }}>
          {onlinePercent}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          online
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={height - (title ? 100 : 60)}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
              boxShadow: theme.shadows[4],
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}


