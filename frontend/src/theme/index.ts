/** MUI theme configuration - Google Material Design 3 style. */
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Google Blue
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9c27b0", // Google Purple
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
    background: {
      default: "#f5f5f7", // Google's light gray background
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2933", // Google's dark text
      secondary: "#6b7280", // Google's secondary text
    },
    error: {
      main: "#d32f2f",
      light: "#ef5350",
      dark: "#c62828",
    },
    warning: {
      main: "#ed6c02",
      light: "#ff9800",
      dark: "#e65100",
    },
    info: {
      main: "#0288d1",
      light: "#03a9f4",
      dark: "#01579b",
    },
    success: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 400,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontWeight: 400,
      fontSize: "2rem",
      lineHeight: 1.3,
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontWeight: 400,
      fontSize: "1.75rem",
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.5rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.25rem",
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.125rem",
      lineHeight: 1.6,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 500,
      textTransform: "none",
      letterSpacing: "0.02857em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
    "0px 2px 4px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
    "0px 3px 6px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.24)",
    "0px 4px 8px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.24)",
    "0px 5px 10px rgba(0, 0, 0, 0.12), 0px 3px 6px rgba(0, 0, 0, 0.24)",
    "0px 6px 12px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(0, 0, 0, 0.24)",
    "0px 7px 14px rgba(0, 0, 0, 0.12), 0px 5px 10px rgba(0, 0, 0, 0.24)",
    "0px 8px 16px rgba(0, 0, 0, 0.12), 0px 6px 12px rgba(0, 0, 0, 0.24)",
    "0px 9px 18px rgba(0, 0, 0, 0.12), 0px 7px 14px rgba(0, 0, 0, 0.24)",
    "0px 10px 20px rgba(0, 0, 0, 0.12), 0px 8px 16px rgba(0, 0, 0, 0.24)",
    "0px 11px 22px rgba(0, 0, 0, 0.12), 0px 9px 18px rgba(0, 0, 0, 0.24)",
    "0px 12px 24px rgba(0, 0, 0, 0.12), 0px 10px 20px rgba(0, 0, 0, 0.24)",
    "0px 13px 26px rgba(0, 0, 0, 0.12), 0px 11px 22px rgba(0, 0, 0, 0.24)",
    "0px 14px 28px rgba(0, 0, 0, 0.12), 0px 12px 24px rgba(0, 0, 0, 0.24)",
    "0px 15px 30px rgba(0, 0, 0, 0.12), 0px 13px 26px rgba(0, 0, 0, 0.24)",
    "0px 16px 32px rgba(0, 0, 0, 0.12), 0px 14px 28px rgba(0, 0, 0, 0.24)",
    "0px 17px 34px rgba(0, 0, 0, 0.12), 0px 15px 30px rgba(0, 0, 0, 0.24)",
    "0px 18px 36px rgba(0, 0, 0, 0.12), 0px 16px 32px rgba(0, 0, 0, 0.24)",
    "0px 19px 38px rgba(0, 0, 0, 0.12), 0px 17px 34px rgba(0, 0, 0, 0.24)",
    "0px 20px 40px rgba(0, 0, 0, 0.12), 0px 18px 36px rgba(0, 0, 0, 0.24)",
    "0px 21px 42px rgba(0, 0, 0, 0.12), 0px 19px 38px rgba(0, 0, 0, 0.24)",
    "0px 22px 44px rgba(0, 0, 0, 0.12), 0px 20px 40px rgba(0, 0, 0, 0.24)",
    "0px 23px 46px rgba(0, 0, 0, 0.12), 0px 21px 42px rgba(0, 0, 0, 0.24)",
    "0px 24px 48px rgba(0, 0, 0, 0.12), 0px 22px 44px rgba(0, 0, 0, 0.24)",
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          transition: "box-shadow 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.24)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.12)",
          },
        },
        contained: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
          "&:hover": {
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.16)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: "0.75rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f7",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: "0.875rem",
          color: "#1f2933",
        },
      },
    },
  },
});
