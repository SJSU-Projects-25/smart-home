"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { setCredentials } from "@/src/store/slices/authSlice";
import { RootState } from "@/src/store";
import { useLoginMutation } from "@/src/api/auth";
import { getOverviewPath } from "@/src/utils/roles";
import { api } from "@/src/api/base";


export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [login, { isLoading: loading }] = useLoginMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      const overviewPath = getOverviewPath(user.role);
      router.push(overviewPath);
    }
  }, [mounted, user, router]);

  // Redirect if already logged in (after mount)
  if (mounted && user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login({ email, password }).unwrap();
      // Reset all cached API data when changing users to avoid stale results
      dispatch(api.util.resetApiState());
      dispatch(setCredentials(response));
      const overviewPath = getOverviewPath(response.user.role);
      router.push(overviewPath);
    } catch (err: any) {
      setError(
        err.data?.detail || err.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Smart Home Logo"
            sx={{ height: 60, mb: 2 }}
          />
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Smart Home Cloud Platform
          </Typography>
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  Don't have an account? Sign Up
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

