/** MUI theme configuration following .cursorrules. */
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
    background: {
      default: "#f5f5f7",
    },
    text: {
      primary: "#1f2933",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: "Roboto, system-ui, sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
        },
      },
    },
  },
});
