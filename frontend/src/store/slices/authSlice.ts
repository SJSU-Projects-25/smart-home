/** Auth slice for Redux with localStorage persistence. */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../../types";

// Load initial state from localStorage
const loadAuthFromStorage = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  
  try {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      return {
        user: parsed.user,
        token: parsed.token,
      };
    }
  } catch (error) {
    console.error("Failed to load auth from localStorage:", error);
  }
  
  return { user: null, token: null };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      // Persist to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("auth", JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
          }));
        } catch (error) {
          console.error("Failed to save auth to localStorage:", error);
        }
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      
      // Clear from localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("auth");
        } catch (error) {
          console.error("Failed to clear auth from localStorage:", error);
        }
      }
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
