/** Alert trends over time area chart component. */
"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";

interface AlertTrendChartProps {
  data: Array<{
    date: string;
    high: number;
    medium: number;
    low: number;
  }>;
  title?: string;
  height?: number;
  period?: "24h" | "7d" | "30d";
}

export function AlertTrendChart({
  data,
  title = "Alert Trends",
  height = 300,
  period = "7d",
}: AlertTrendChartProps) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate empty data
      const days = period === "24h" ? 24 : period === "7d" ? 7 : 30;
      return Array.from({ length: days }, (_, i) => {
        const date = dayjs().subtract(days - 1 - i, period === "24h" ? "hour" : "day");
        return {
          date: date.format(period === "24h" ? "HH:00" : "MMM D"),
          high: 0,
          medium: 0,
          low: 0,
        };
      });
    }
    return data.map((item) => ({
      ...item,
      date: dayjs(item.date).format(period === "24h" ? "HH:00" : "MMM D"),
    }));
  }, [data, period]);

  return (
    <Box sx={{ width: "100%", height }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
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
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="high"
            stackId="1"
            stroke={theme.palette.error.main}
            fill="url(#colorHigh)"
          />
          <Area
            type="monotone"
            dataKey="medium"
            stackId="1"
            stroke={theme.palette.warning.main}
            fill="url(#colorMedium)"
          />
          <Area
            type="monotone"
            dataKey="low"
            stackId="1"
            stroke={theme.palette.info.main}
            fill="url(#colorLow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

