"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { useGetPolicyQuery, useUpdatePolicyMutation } from "@/src/api/settings";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function PoliciesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const { data: policy, isLoading } = useGetPolicyQuery(
    { home_id: homeId || "" },
    { skip: !homeId }
  );

  const [updatePolicy] = useUpdatePolicyMutation();

  const [formData, setFormData] = useState({
    quiet_start_time: "",
    quiet_end_time: "",
    auto_escalate_after_seconds: 0,
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        quiet_start_time: policy.quiet_start_time || "",
        quiet_end_time: policy.quiet_end_time || "",
        auto_escalate_after_seconds: policy.auto_escalate_after_seconds || 0,
      });
    }
  }, [policy]);

  const handleSave = async () => {
    if (!homeId) return;

    try {
      await updatePolicy({
        home_id: homeId,
        data: formData,
      }).unwrap();
      setSnackbar({ open: true, message: "Policy updated successfully" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update policy" });
    }
  };

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Alert Policies
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
        Alert Policies
      </Typography>

      <Card elevation={1} sx={{ mt: 3, maxWidth: 600 }}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Quiet Hours
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={formData.quiet_start_time}
                  onChange={(e) => setFormData({ ...formData, quiet_start_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Time"
                  type="time"
                  value={formData.quiet_end_time}
                  onChange={(e) => setFormData({ ...formData, quiet_end_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Box>

            <TextField
              label="Auto-escalate After (seconds)"
              type="number"
              value={formData.auto_escalate_after_seconds}
              onChange={(e) =>
                setFormData({ ...formData, auto_escalate_after_seconds: parseInt(e.target.value) || 0 })
              }
              fullWidth
            />

            <Button variant="contained" onClick={handleSave} disabled={isLoading}>
              Save Policy
            </Button>
          </Stack>
        </CardContent>
      </Card>

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
