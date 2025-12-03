"use client";

import { useState, useMemo } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useListModelsQuery, AdminModel } from "@/src/api/admin";

export const dynamic = "force-dynamic";

export default function AdminModelsPage() {
  const [enabledFilter, setEnabledFilter] = useState<string>("");
  const [homeFilter, setHomeFilter] = useState<string>("");
  const [modelKeyFilter, setModelKeyFilter] = useState<string>("");

  const { data: modelsData, isLoading, error } = useListModelsQuery({
    enabled: enabledFilter === "" ? undefined : enabledFilter === "true",
  });

  // Apply filters
  const models = useMemo(() => {
    if (!modelsData) return [];
    
    return modelsData.filter((model) => {
      // Apply enabled filter
      if (enabledFilter !== "" && String(model.enabled) !== enabledFilter) {
        return false;
      }
      
      // Apply home filter
      if (homeFilter && model.home_id !== homeFilter) {
        return false;
      }
      
      // Apply model key filter
      if (modelKeyFilter && model.model_key !== modelKeyFilter) {
        return false;
      }
      
      return true;
    });
  }, [modelsData, enabledFilter, homeFilter, modelKeyFilter]);

  // Get unique values for filters
  const uniqueHomes = useMemo(() => {
    if (!modelsData) return [];
    const homesMap = new Map<string, { id: string; name: string }>();
    modelsData.forEach((model) => {
      if (model.home_id && model.home_name && !homesMap.has(model.home_id)) {
        homesMap.set(model.home_id, {
          id: model.home_id,
          name: model.home_name,
        });
      }
    });
    return Array.from(homesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [modelsData]);

  const uniqueModelKeys = useMemo(() => {
    if (!modelsData) return [];
    const keys = new Set<string>();
    modelsData.forEach((model) => {
      if (model.model_key) {
        keys.add(model.model_key);
      }
    });
    return Array.from(keys).sort();
  }, [modelsData]);

  // Group models by home and then by model key
  const modelsByHomeAndKey = useMemo(() => {
    const grouped: Record<string, Record<string, AdminModel[]>> = {};

    models.forEach((model) => {
      const homeId = model.home_id || "unknown";
      const homeName = model.home_name || "Unknown Home";
      const homeKey = `${homeId}|${homeName}`;
      const modelKey = model.model_key || "unknown";

      if (!grouped[homeKey]) {
        grouped[homeKey] = {};
      }

      if (!grouped[homeKey][modelKey]) {
        grouped[homeKey][modelKey] = [];
      }

      grouped[homeKey][modelKey].push(model);
    });

    return grouped;
  }, [models]);

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Model Configurations
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load model configurations. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Model Configurations</Typography>
      </Box>

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Enabled"
            value={enabledFilter}
            onChange={(e) => setEnabledFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Enabled</MenuItem>
            <MenuItem value="false">Disabled</MenuItem>
          </TextField>
          <TextField
            select
            label="Home"
            value={homeFilter}
            onChange={(e) => setHomeFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All Homes</MenuItem>
            {uniqueHomes.map((home) => (
              <MenuItem key={home.id} value={home.id}>
                {home.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Model Key"
            value={modelKeyFilter}
            onChange={(e) => setModelKeyFilter(e.target.value)}
            sx={{ minWidth: 180 }}
            size="small"
          >
            <MenuItem value="">All Models</MenuItem>
            {uniqueModelKeys.map((key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Models grouped by home and model key */}
      {isLoading ? (
        <Card elevation={1}>
          <CardContent>
            <Typography>Loading model configurations...</Typography>
          </CardContent>
        </Card>
      ) : models && models.length === 0 ? (
        <Card elevation={1}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No model configurations found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Object.entries(modelsByHomeAndKey).map(([homeKey, modelKeys]) => {
            const [homeId, homeName] = homeKey.split("|");
            const totalModels = Object.values(modelKeys).flat().length;
            const enabledCount = Object.values(modelKeys)
              .flat()
              .filter((m) => m.enabled).length;
            
            return (
              <Accordion key={homeId} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Typography variant="h6" sx={{ flexGrow: 1, color: "primary.main" }}>
                      {homeName}
                    </Typography>
                    <Chip 
                      label={`${enabledCount}/${totalModels} enabled`} 
                      size="small" 
                      color={enabledCount === totalModels ? "success" : "default"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {Object.entries(modelKeys).map(([modelKey, modelConfigs]) => {
                      const enabledInGroup = modelConfigs.filter((m) => m.enabled).length;
                      
                      return (
                        <Accordion key={modelKey}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                {modelKey}
                              </Typography>
                              <Chip 
                                label={`${enabledInGroup}/${modelConfigs.length} enabled`} 
                                size="small" 
                                color={enabledInGroup === modelConfigs.length ? "success" : "default"}
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Enabled</strong></TableCell>
                                    <TableCell><strong>Threshold</strong></TableCell>
                                    <TableCell><strong>Parameters</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {modelConfigs.map((model) => (
                                    <TableRow key={model.id} hover>
                                      <TableCell>
                                        <Chip
                                          label={model.enabled ? "Yes" : "No"}
                                          color={model.enabled ? "success" : "default"}
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell>{model.threshold}</TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                          {JSON.stringify(model.params || {}, null, 2)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </>
  );
}

