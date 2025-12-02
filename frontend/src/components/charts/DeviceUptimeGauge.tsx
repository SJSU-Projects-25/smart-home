/** Device uptime gauge/percentage display component. */
"use client";

import { Box, Typography, LinearProgress, useTheme, Chip } from "@mui/material";
import { useMemo } from "react";

interface DeviceUptimeGaugeProps {
  uptimePercent: number;
  deviceName?: string;
  height?: number;
}

export function DeviceUptimeGauge({ uptimePercent, deviceName, height = 120 }: DeviceUptimeGaugeProps) {
  const theme = useTheme();

  const color = useMemo(() => {
    if (uptimePercent >= 95) return theme.palette.success.main;
    if (uptimePercent >= 80) return theme.palette.info.main;
    if (uptimePercent >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  }, [uptimePercent, theme]);

  return (
    <Box
      sx={{
        width: "100%",
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      {deviceName && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {deviceName}
        </Typography>
      )}
      <Typography variant="h3" sx={{ fontWeight: 600, color, mb: 1 }}>
        {uptimePercent.toFixed(1)}%
      </Typography>
      <Box sx={{ width: "80%", mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={uptimePercent}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              backgroundColor: color,
            },
          }}
        />
      </Box>
      <Chip
        label={uptimePercent >= 95 ? "Excellent" : uptimePercent >= 80 ? "Good" : uptimePercent >= 60 ? "Fair" : "Poor"}
        color={uptimePercent >= 95 ? "success" : uptimePercent >= 80 ? "info" : uptimePercent >= 60 ? "warning" : "error"}
        size="small"
      />
    </Box>
  );
}

