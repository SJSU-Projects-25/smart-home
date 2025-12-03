"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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

// Mapping from model keys to display names
// These correspond to the ML model's detection types
const MODEL_CONFIG = [
  { key: "fall_impact", label: "Fall / Impact", severity: "high" },
  { key: "distress_pain", label: "Distress / Pain", severity: "high" },
  { key: "choking_vomiting", label: "Choking / Vomiting", severity: "high" },
  { key: "breathing_emergency", label: "Breathing Emergency", severity: "high" },
  { key: "fire_smoke_alarm", label: "Fire / Smoke Alarm", severity: "high" },
  { key: "glass_break", label: "Glass Break", severity: "high" },
  { key: "coughing", label: "Coughing", severity: "medium" },
  { key: "water_running", label: "Water Running", severity: "medium" },
  { key: "door_knock", label: "Door / Knock", severity: "low" },
  { key: "footsteps", label: "Footsteps", severity: "low" },
] as const;

const MODEL_KEYS = MODEL_CONFIG.map((m) => m.key);

export default function ModelsPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Redirect if no home assigned
  useEffect(() => {
    if (user && !homeId) {
      router.push("/no-home");
    }
  }, [user, homeId, router]);

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

  // Don't render if no homeId (will redirect)
  if (!homeId) {
    return null;
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
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
          mt: 3,
        }}
      >
        {MODEL_CONFIG.map((model) => {
          const config = configsMap.get(model.key);
          const enabled = config?.enabled ?? true;
          const threshold = config?.threshold ?? 0.5;

          return (
            <ModelConfigCard
              key={model.key}
              modelKey={model.key}
              label={model.label}
              severity={model.severity}
              enabled={enabled}
              threshold={threshold}
              onSave={(enabled, threshold) => handleSave(model.key, enabled, threshold)}
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
  label: string;
  severity: "high" | "medium" | "low";
  enabled: boolean;
  threshold: number;
  onSave: (enabled: boolean, threshold: number) => void;
}

function ModelConfigCard({
  modelKey,
  label,
  severity,
  enabled: initialEnabled,
  threshold: initialThreshold,
  onSave,
}: ModelConfigCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [threshold, setThreshold] = useState(initialThreshold);

  const handleSave = () => {
    onSave(enabled, threshold);
  };

  const severityColor =
    severity === "high" ? "error" : severity === "medium" ? "warning" : "info";

  return (
    <Card elevation={1}>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {label}
            </Typography>
            <Typography
              variant="caption"
              color={`${severityColor}.main`}
              sx={{ fontWeight: 500 }}
            >
              {severity.toUpperCase()} SEVERITY
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
