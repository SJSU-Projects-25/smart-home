/** Events over time line chart component. */
"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";

interface EventsOverTimeChartProps {
  data: Array<{
    hour: number;
    day: number;
    month: number;
    year: number;
    count: number;
  }>;
  title?: string;
  height?: number;
}

export function EventsOverTimeChart({ data, title = "Events Over Time", height = 300 }: EventsOverTimeChartProps) {
  const theme = useTheme();

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate empty data for last 24 hours if no data
      const now = dayjs();
      return Array.from({ length: 24 }, (_, i) => {
        const hour = now.subtract(23 - i, "hour");
        return {
          time: hour.format("HH:00"),
          timestamp: hour.toISOString(),
          count: 0,
        };
      });
    }

    return data.map((item) => {
      const date = dayjs(`${item.year}-${item.month}-${item.day} ${item.hour}:00`);
      return {
        time: date.format("HH:00"),
        timestamp: date.toISOString(),
        count: item.count,
      };
    });
  }, [data]);

  return (
    <Box sx={{ width: "100%", height }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="time"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "4px",
            }}
            labelFormatter={(label) => `Time: ${label}`}
            formatter={(value: number) => [value, "Events"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ fill: theme.palette.primary.main, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}


