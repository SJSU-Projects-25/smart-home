"use client";

// Force dynamic rendering for entire dashboard
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import dynamicImport from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";
import { StoreProvider } from "@/src/components/StoreProvider";

// Dynamically import components with SSR disabled
const AppShell = dynamicImport(
  () => import("@/src/components/AppShell").then((mod) => ({ default: mod.AppShell })),
  { ssr: false, loading: () => <CircularProgress /> }
);

const AuthGuard = dynamicImport(
  () => import("@/src/components/AuthGuard").then((mod) => ({ default: mod.AuthGuard })),
  { ssr: false, loading: () => <CircularProgress /> }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <StoreProvider>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </StoreProvider>
    );
  }

  return (
    <StoreProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </StoreProvider>
  );
}
