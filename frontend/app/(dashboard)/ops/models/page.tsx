"use client";

import { Typography, Box } from "@mui/material";

export const dynamic = "force-dynamic";

export default function OpsModelsPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Global Model Defaults
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Global model configuration page - similar to Owner Models page but for system-wide defaults.
        Implementation pending backend endpoints for global model configs.
      </Typography>
    </>
  );
}
