/** KPI card component for dashboards. */
"use client";

import { Card, CardContent, Typography } from "@mui/material";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <Card elevation={1}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom variant="subtitle2">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mb: subtitle ? 1 : 0 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
