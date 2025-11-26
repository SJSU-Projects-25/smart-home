"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { StoreProvider } from "@/src/components/StoreProvider";
import { theme } from "@/src/theme";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StoreProvider>
  );
}
