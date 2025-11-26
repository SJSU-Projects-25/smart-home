"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useListDevicesQuery } from "@/src/api/devices";
import { usePresignUploadMutation, useConfirmUploadMutation } from "@/src/api/ingest";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function TechTestsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const homeId = user?.home_id;
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const { data: devices } = useListDevicesQuery(
    { home_id: homeId || "" },
    { skip: !homeId }
  );

  const [presignUpload] = usePresignUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedDeviceId || !selectedFile || !homeId) {
      setMessage({ type: "error", text: "Please select a device and file" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // Step 1: Get presigned URL
      const presignResponse = await presignUpload({
        device_id: selectedDeviceId,
        home_id: homeId,
        mime: selectedFile.type || "audio/wav",
      }).unwrap();

      // Step 2: Upload to S3
      const uploadResponse = await fetch(presignResponse.upload_url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type || "audio/wav",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // Step 3: Confirm upload
      const confirmResponse = await confirmUpload({
        s3_key: presignResponse.s3_key,
        device_id: selectedDeviceId,
        home_id: homeId,
        duration_ms: undefined, // Could calculate from file if needed
      }).unwrap();

      setJobId(confirmResponse.job_id);
      setMessage({ type: "success", text: `Job queued successfully! Job ID: ${confirmResponse.job_id}` });
      setSelectedFile(null);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.data?.detail || error.message || "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!homeId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Device Test Upload
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
        Device Test Upload
      </Typography>

      <Card elevation={1} sx={{ mt: 3, maxWidth: 600 }}>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              select
              label="Select Device"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              fullWidth
            >
              {devices?.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name} ({device.type})
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <Button variant="outlined" component="label" fullWidth>
                Select Audio File
                <input type="file" accept="audio/*" hidden onChange={handleFileSelect} />
              </Button>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedDeviceId || !selectedFile || uploading}
              fullWidth
            >
              {uploading ? <CircularProgress size={24} /> : "Upload Test Clip"}
            </Button>

            {message && (
              <Alert severity={message.type}>{message.text}</Alert>
            )}

            {jobId && (
              <Alert severity="info">
                Job queued. Check the Alerts page for results. Job ID: {jobId}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
