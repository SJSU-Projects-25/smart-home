/** Main application shell with navigation. */
"use client";

import { useState, useEffect } from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "../theme";
import { TopNav } from "./TopNav";
import { SideNav } from "./SideNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <TopNav onMenuClick={handleDrawerToggle} />
        <SideNav open={mobileOpen} onClose={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3, // 24px padding (3 * 8px)
            mt: 8, // 64px for AppBar (8 * 8px)
            width: { md: `calc(100% - 240px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
