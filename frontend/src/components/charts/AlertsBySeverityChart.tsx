/** Alerts by severity pie/bar chart component. */
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Box, Typography, useTheme } from "@mui/material";

interface AlertsBySeverityChartProps {
  data: {
    high: number;
    medium: number;
    low: number;
  };
  title?: string;
  height?: number;
  variant?: "pie" | "bar";
}

const COLORS = {
  high: "#d32f2f",
  medium: "#ed6c02",
  low: "#1976d2",
};

export function AlertsBySeverityChart({
  data,
  title = "Alerts by Severity",
  height = 300,
  variant = "pie",
}: AlertsBySeverityChartProps) {
  const theme = useTheme();

  const chartData = [
    { name: "High", value: data.high, color: COLORS.high },
    { name: "Medium", value: data.medium, color: COLORS.medium },
    { name: "Low", value: data.low, color: COLORS.low },
  ].filter((item) => item.value > 0);

  if (variant === "bar") {
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
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "4px",
              }}
            />
            <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "4px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}

