/** MUI theme configuration following .cursorrules. */
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Lighter blue for dark mode
    },
    secondary: {
      main: "#ce93d8", // Lighter purple for dark mode
    },
    background: {
      default: "#121212", // Standard dark mode background
      paper: "#1e1e1e", // Slightly lighter for cards/surfaces
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: "Roboto, system-ui, sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Remove default gradient in dark mode if desired
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.5), 0px 1px 2px rgba(0, 0, 0, 0.7)",
        },
      },
    },
  },
});
