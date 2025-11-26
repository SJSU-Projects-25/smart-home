/** MUI theme configuration following .cursorrules. */
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00E5FF", // Neon Cyan
    },
    secondary: {
      main: "#D500F9", // Neon Purple
    },
    background: {
      default: "#0A0E12", // Deep Charcoal
      paper: "rgba(30, 30, 35, 0.7)", // Translucent Charcoal
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: "linear-gradient(180deg, #0A0E12 0%, #1A1F26 100%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(30, 30, 35, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px -1px rgba(0, 0, 0, 0.2)",
          borderRadius: "16px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #00E5FF 30%, #00B0FF 90%)",
          color: "#000",
          boxShadow: "0 3px 5px 2px rgba(0, 229, 255, .3)",
        },
        containedSecondary: {
          background: "linear-gradient(45deg, #D500F9 30%, #AA00FF 90%)",
          boxShadow: "0 3px 5px 2px rgba(213, 0, 249, .3)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
