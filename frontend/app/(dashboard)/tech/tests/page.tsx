"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Chip,
} from "@mui/material";
import { useListDevicesQuery, Device } from "@/src/api/devices";
import { usePresignUploadMutation, useConfirmUploadMutation } from "@/src/api/ingest";
import { useListAssignmentsQuery } from "@/src/api/assignments";
import { RootState } from "@/src/store";

export const dynamic = "force-dynamic";

export default function TechTestsPage() {
  const searchParams = useSearchParams();
  const homeIdFromUrl = searchParams.get("homeId");
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Get home name from assignments
  const { data: assignments } = useListAssignmentsQuery(undefined, { skip: !user });
  
  // Initialize with first assignment if available and no URL/homeId
  const initialHomeId = useMemo(() => {
    if (homeIdFromUrl) return homeIdFromUrl;
    if (user?.home_id) return user.home_id;
    if (assignments && assignments.length > 0) return assignments[0].home_id;
    return "";
  }, [homeIdFromUrl, user?.home_id, assignments]);
  
  const [selectedHomeId, setSelectedHomeId] = useState<string>(initialHomeId);
  
  // Find selected home based on selectedHomeId (works for both URL and dropdown selection)
  const selectedHome = useMemo(() => {
    if (!selectedHomeId || !assignments) return null;
    return assignments.find((a) => a.home_id === selectedHomeId);
  }, [selectedHomeId, assignments]);

  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Get devices for selected home
  const { data: devices } = useListDevicesQuery(
    { home_id: selectedHomeId || "" },
    { skip: !selectedHomeId }
  );

  // Filter out cameras - only show microphones
  // Use case-insensitive matching and handle variations
  const microphoneDevices = useMemo(() => {
    const allDevices = devices || [];
    
    // Filter to microphones (case-insensitive, handle variations)
    const microphones = allDevices.filter((device) => {
      const deviceType = (device.type || "").toLowerCase().trim();
      return deviceType === "microphone" || deviceType === "mic";
    });
    
    // Debug: log device counts and types for troubleshooting
    if (allDevices.length > 0) {
      console.log(`[Tests Page] Total devices: ${allDevices.length}, Microphones: ${microphones.length}`);
      if (microphones.length !== allDevices.length) {
        const nonMicrophones = allDevices.filter((device) => {
          const deviceType = (device.type || "").toLowerCase().trim();
          return deviceType !== "microphone" && deviceType !== "mic";
        });
        console.log(`[Tests Page] Filtered out ${nonMicrophones.length} non-microphone device(s):`, 
          nonMicrophones.map(d => `${d.name} (type: "${d.type}")`));
      }
      // Log all device types found
      const deviceTypes = [...new Set(allDevices.map(d => d.type))];
      console.log(`[Tests Page] Device types found:`, deviceTypes);
    }
    
    return microphones;
  }, [devices]);

  // Get selected device details
  const selectedDevice = useMemo(() => {
    return microphoneDevices.find((d) => d.id === selectedDeviceId);
  }, [microphoneDevices, selectedDeviceId]);

  const [presignUpload] = usePresignUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();

  // Update selected home when URL or assignments change
  useEffect(() => {
    if (homeIdFromUrl) {
      setSelectedHomeId(homeIdFromUrl);
    } else if (assignments && assignments.length > 0 && !selectedHomeId) {
      setSelectedHomeId(assignments[0].home_id);
    }
  }, [homeIdFromUrl, assignments, selectedHomeId]);

  const handleHomeChange = (newHomeId: string) => {
    setSelectedHomeId(newHomeId);
    setSelectedDeviceId(""); // Clear device selection when home changes
    setSelectedFile(null);
    setMessage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedDeviceId || !selectedFile || !selectedHomeId) {
      setMessage({ type: "error", text: "Please select a home, device, and file" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // Step 1: Get presigned URL
      const presignResponse = await presignUpload({
        device_id: selectedDeviceId,
        home_id: selectedHomeId,
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
        home_id: selectedHomeId,
        duration_ms: undefined, // Could calculate from file if needed
      }).unwrap();

      setJobId(confirmResponse.job_id);
      setMessage({ 
        type: "success", 
        text: `Test uploaded successfully! Job ID: ${confirmResponse.job_id}` 
      });
      setSelectedFile(null);
      setSelectedDeviceId("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.data?.detail || error.message || "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const homeName = selectedHome?.home?.name || 
    (selectedHomeId && assignments?.find(a => a.home_id === selectedHomeId)?.home?.name) || 
    "Unknown Home";
  const availableHomes = assignments || [];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Device Test Upload
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload audio test clips to verify device functionality and detection models
      </Typography>

      <Card elevation={1} sx={{ mt: 3, maxWidth: 700 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Home Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Select Home
              </Typography>
              <TextField
                select
                label="Home"
                value={selectedHomeId}
                onChange={(e) => handleHomeChange(e.target.value)}
                fullWidth
                required
              >
                {availableHomes.map((assignment) => (
                  <MenuItem key={assignment.home_id} value={assignment.home_id}>
                    {assignment.home?.name || "Unknown Home"}
                  </MenuItem>
                ))}
              </TextField>
              {selectedHomeId && (
                <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip 
                    label={`Home: ${homeName}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>

            {/* Device Selection */}
            {selectedHomeId && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Select Device
                </Typography>
                <TextField
                  select
                  label="Device"
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  fullWidth
                  required
                  disabled={!selectedHomeId || microphoneDevices.length === 0}
                  helperText={
                    !selectedHomeId
                      ? "Please select a home first"
                      : microphoneDevices.length === 0
                      ? "No microphone devices found for this home"
                      : `${microphoneDevices.length} microphone device${microphoneDevices.length !== 1 ? "s" : ""} available`
                  }
                >
                  {microphoneDevices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <Typography variant="body1">{device.name}</Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          {device.room_name && (
                            <Chip 
                              label={`Room: ${device.room_name}`} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: "20px" }}
                            />
                          )}
                          <Chip 
                            label={device.type} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", height: "20px" }}
                          />
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                {selectedDevice && (
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Selected Device:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedDevice.name}
                    </Typography>
                    {selectedDevice.room_name && (
                      <Typography variant="caption" color="text.secondary">
                        Room: {selectedDevice.room_name}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* File Selection */}
            {selectedDeviceId && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Select Audio File
                </Typography>
                <Button variant="outlined" component="label" fullWidth>
                  Choose Audio File
                  <input type="file" accept="audio/*" hidden onChange={handleFileSelect} />
                </Button>
                {selectedFile && (
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Size: {(selectedFile.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Upload Button */}
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedHomeId || !selectedDeviceId || !selectedFile || uploading}
              fullWidth
              size="large"
            >
              {uploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                "Upload Test Clip"
              )}
            </Button>

            {/* Messages */}
            {message && (
              <Alert severity={message.type}>{message.text}</Alert>
            )}

            {jobId && (
              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>Test uploaded successfully!</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Job ID: {jobId}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Check the Alerts page for processing results.
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
