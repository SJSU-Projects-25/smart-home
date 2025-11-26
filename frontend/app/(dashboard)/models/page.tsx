"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  Slider,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { useListModelConfigsQuery, useUpdateModelConfigMutation } from "@/src/api/models";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

const MODEL_KEYS = ["scream", "smoke_alarm", "glass_break"];

export default function ModelsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const { data: configs, isLoading } = useListModelConfigsQuery(
    { home_id: homeId || "" },
    { skip: !homeId }
  );

  const [updateConfig] = useUpdateModelConfigMutation();

  const configsMap = new Map((configs || []).map((c) => [c.model_key, c]));

  const handleSave = async (modelKey: string, enabled: boolean, threshold: number) => {
    if (!homeId) return;

    try {
      await updateConfig({
        model_key: modelKey,
        home_id: homeId,
        data: { enabled, threshold },
      }).unwrap();
      setSnackbar({ open: true, message: `${modelKey} configuration saved` });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to save configuration" });
    }
  };

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Detection Models
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No home associated with your account. Please contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Detection Models
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 3,
          mt: 3,
        }}
      >
        {MODEL_KEYS.map((modelKey) => {
          const config = configsMap.get(modelKey);
          const enabled = config?.enabled ?? true;
          const threshold = config?.threshold ?? 0.5;

          return (
            <ModelConfigCard
              key={modelKey}
              modelKey={modelKey}
              enabled={enabled}
              threshold={threshold}
              onSave={(enabled, threshold) => handleSave(modelKey, enabled, threshold)}
            />
          );
        })}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

interface ModelConfigCardProps {
  modelKey: string;
  enabled: boolean;
  threshold: number;
  onSave: (enabled: boolean, threshold: number) => void;
}

function ModelConfigCard({ modelKey, enabled: initialEnabled, threshold: initialThreshold, onSave }: ModelConfigCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [threshold, setThreshold] = useState(initialThreshold);

  const handleSave = () => {
    onSave(enabled, threshold);
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {modelKey
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2">Enabled</Typography>
            <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          </Box>

          <Box>
            <Typography variant="body2" gutterBottom>
              Threshold: {threshold.toFixed(2)}
            </Typography>
            <Slider
              value={threshold}
              onChange={(_, value) => setThreshold(value as number)}
              min={0}
              max={1}
              step={0.01}
              disabled={!enabled}
            />
          </Box>

          <Button variant="contained" onClick={handleSave} fullWidth>
            Save
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
