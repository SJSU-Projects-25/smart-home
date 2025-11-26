/** Top navigation bar component. */
"use client";

import { AppBar, IconButton, Toolbar, Typography, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { clearCredentials } from "../store/slices/authSlice";
import { useRouter } from "next/navigation";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push("/login");
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
          aria-label="toggle menu"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Home Cloud Platform
        </Typography>
        {user && (
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user.email} ({user.role})
          </Typography>
        )}
        {user && (
          <Button color="inherit" onClick={handleLogout} sx={{ textTransform: "none" }}>
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
