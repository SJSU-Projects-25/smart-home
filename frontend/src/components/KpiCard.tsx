/** KPI card component - Google Material Design 3 style. */
"use client";

import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "info";
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "primary",
}: KpiCardProps) {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 2,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                color: colorMap[color],
                opacity: 0.8,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 400,
            mb: subtitle || trend ? 1 : 0,
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: trend ? 0.5 : 0 }}
          >
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            {trend.isPositive ? (
              <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend.isPositive ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 500,
              }}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
