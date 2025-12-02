/** Events by home bar chart component. */
"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Box, Typography, useTheme } from "@mui/material";

interface EventsByHomeChartProps {
  data: Array<{
    home_id: string;
    count: number;
  }>;
  homeNames?: Record<string, string>;
  title?: string;
  height?: number;
}

export function EventsByHomeChart({
  data,
  homeNames = {},
  title = "Events by Home (Last 24h)",
  height = 300,
}: EventsByHomeChartProps) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: homeNames[item.home_id] || item.home_id.substring(0, 8) + "...",
      events: item.count,
      homeId: item.home_id,
    }));
  }, [data, homeNames]);

  return (
    <Box sx={{ width: "100%", height }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              borderRadius: "4px",
            }}
            formatter={(value: number) => [value, "Events"]}
          />
          <Bar dataKey="events" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

